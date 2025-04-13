use anyhow::Result;
use std::collections::HashMap;
use nextshell_workflows_types::plugin::Shell;

#[derive(Debug, Clone)]
pub struct SyntaxToken {
    pub start: usize,
    pub end: usize,
    pub token_type: TokenType,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TokenType {
    Command,
    Argument,
    Option,
    String,
    Number,
    Variable,
    Comment,
    Operator,
    Keyword,
    Path,
    Unknown,
}

pub struct SyntaxHighlighter {
    shell: Shell,
    keywords: HashMap<Shell, Vec<&'static str>>,
    operators: Vec<&'static str>,
}

impl SyntaxHighlighter {
    pub fn new(shell: Shell) -> Self {
        let mut keywords = HashMap::new();
        
        // Common shell keywords
        let common_keywords = vec![
            "if", "then", "else", "fi", "for", "while", "do", "done",
            "case", "esac", "function", "return", "break", "continue",
            "export", "local", "readonly", "declare", "typeset",
        ];

        // Shell-specific keywords
        let mut bash_keywords = common_keywords.clone();
        bash_keywords.extend_from_slice(&["source", ".", "select", "until"]);
        keywords.insert(Shell::Bash, bash_keywords);

        let mut zsh_keywords = common_keywords.clone();
        zsh_keywords.extend_from_slice(&["autoload", "compdef", "zmodload"]);
        keywords.insert(Shell::Zsh, zsh_keywords);

        let mut fish_keywords = vec![
            "if", "else", "end", "for", "while", "begin", "function",
            "return", "break", "continue", "switch", "case", "end",
        ];
        keywords.insert(Shell::Fish, fish_keywords);

        let mut powershell_keywords = vec![
            "if", "else", "elseif", "for", "foreach", "while", "do",
            "function", "return", "break", "continue", "switch", "case",
            "param", "begin", "process", "end", "try", "catch", "finally",
        ];
        keywords.insert(Shell::PowerShell, powershell_keywords);
        keywords.insert(Shell::PowerShellCore, powershell_keywords);

        let mut csh_keywords = vec![
            "if", "else", "endif", "foreach", "while", "end",
            "switch", "case", "default", "break", "continue",
        ];
        keywords.insert(Shell::Csh, csh_keywords);
        keywords.insert(Shell::Tcsh, csh_keywords);

        let mut ksh_keywords = common_keywords.clone();
        ksh_keywords.extend_from_slice(&["select", "until", "typeset"]);
        keywords.insert(Shell::Korn, ksh_keywords);

        SyntaxHighlighter {
            shell,
            keywords,
            operators: vec![
                "|", ">", ">>", "<", "<<", "&", "&&", "||", ";", ";;",
                "(", ")", "{", "}", "[", "]", "=", "+=", "-=", "*=",
                "/=", "%=", "&=", "|=", "^=", "<<=", ">>=",
            ],
        }
    }

    pub fn highlight(&self, input: &str) -> Result<Vec<SyntaxToken>> {
        let mut tokens = Vec::new();
        let mut current_pos = 0;
        let mut in_string = false;
        let mut string_char = '\0';
        let mut in_comment = false;

        let chars: Vec<char> = input.chars().collect();
        let keywords = self.keywords.get(&self.shell).unwrap_or(&Vec::new());

        while current_pos < chars.len() {
            let c = chars[current_pos];

            // Handle comments
            if c == '#' && !in_string {
                let start = current_pos;
                while current_pos < chars.len() && chars[current_pos] != '\n' {
                    current_pos += 1;
                }
                tokens.push(SyntaxToken {
                    start,
                    end: current_pos,
                    token_type: TokenType::Comment,
                });
                continue;
            }

            // Handle strings
            if (c == '"' || c == '\'') && !in_comment {
                if !in_string {
                    in_string = true;
                    string_char = c;
                } else if c == string_char {
                    in_string = false;
                }
                current_pos += 1;
                continue;
            }

            // Handle whitespace
            if c.is_whitespace() && !in_string {
                current_pos += 1;
                continue;
            }

            // Handle operators
            if !in_string && !in_comment {
                for op in &this.operators {
                    if current_pos + op.len() <= chars.len() {
                        let slice = &chars[current_pos..current_pos + op.len()];
                        if slice.iter().collect::<String>() == *op {
                            tokens.push(SyntaxToken {
                                start: current_pos,
                                end: current_pos + op.len(),
                                token_type: TokenType::Operator,
                            });
                            current_pos += op.len();
                            continue;
                        }
                    }
                }
            }

            // Handle keywords and commands
            if !in_string && !in_comment {
                let mut word_end = current_pos;
                while word_end < chars.len() && !chars[word_end].is_whitespace() {
                    word_end += 1;
                }
                let word = &chars[current_pos..word_end];
                let word_str: String = word.iter().collect();

                let token_type = if keywords.contains(&word_str.as_str()) {
                    TokenType::Keyword
                } else if word_str.starts_with('$') {
                    TokenType::Variable
                } else if word_str.contains('/') || word_str.contains('\\') {
                    TokenType::Path
                } else {
                    TokenType::Command
                };

                tokens.push(SyntaxToken {
                    start: current_pos,
                    end: word_end,
                    token_type,
                });
                current_pos = word_end;
                continue;
            }

            current_pos += 1;
        }

        Ok(tokens)
    }
} 