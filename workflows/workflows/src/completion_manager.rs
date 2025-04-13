use anyhow::Result;
use std::collections::HashMap;
use nextshell_workflows_types::plugin::Shell;

#[derive(Debug, Clone)]
pub struct Completion {
    pub text: String,
    pub description: Option<String>,
    pub kind: CompletionKind,
}

#[derive(Debug, Clone, PartialEq)]
pub enum CompletionKind {
    Command,
    File,
    Directory,
    Variable,
    Option,
    Argument,
    Custom(String),
}

pub struct CompletionManager {
    shell: Shell,
    commands: HashMap<String, Vec<String>>,
    variables: HashMap<String, String>,
    custom_completions: HashMap<String, Vec<Completion>>,
}

impl CompletionManager {
    pub fn new(shell: Shell) -> Self {
        CompletionManager {
            shell,
            commands: HashMap::new(),
            variables: HashMap::new(),
            custom_completions: HashMap::new(),
        }
    }

    pub fn add_command(&mut self, command: String, completions: Vec<String>) {
        self.commands.insert(command, completions);
    }

    pub fn add_variable(&mut self, name: String, value: String) {
        self.variables.insert(name, value);
    }

    pub fn add_custom_completion(&mut self, trigger: String, completions: Vec<Completion>) {
        self.custom_completions.insert(trigger, completions);
    }

    pub fn get_completions(&self, input: &str, position: usize) -> Result<Vec<Completion>> {
        let mut completions = Vec::new();
        let words: Vec<&str> = input[..position].split_whitespace().collect();
        
        if words.is_empty() {
            return Ok(completions);
        }

        let current_word = words.last().unwrap();
        let is_command = words.len() == 1;

        // Handle command completions
        if is_command {
            for (cmd, args) in &this.commands {
                if cmd.starts_with(current_word) {
                    completions.push(Completion {
                        text: cmd.clone(),
                        description: Some(format!("Command with {} arguments", args.len())),
                        kind: CompletionKind::Command,
                    });
                }
            }
        }

        // Handle variable completions
        if current_word.starts_with('$') {
            for (var, value) in &this.variables {
                if var.starts_with(&current_word[1..]) {
                    completions.push(Completion {
                        text: format!("${}", var),
                        description: Some(value.clone()),
                        kind: CompletionKind::Variable,
                    });
                }
            }
        }

        // Handle custom completions
        if let Some(cmd) = words.first() {
            if let Some(custom_completions) = self.custom_completions.get(*cmd) {
                for completion in custom_completions {
                    if completion.text.starts_with(current_word) {
                        completions.push(completion.clone());
                    }
                }
            }
        }

        // Generate shell-specific completion script
        let completion_script = match this.shell {
            Shell::Bash | Shell::Zsh | Shell::Korn => {
                self.generate_bash_completion_script()
            }
            Shell::Fish => {
                self.generate_fish_completion_script()
            }
            Shell::PowerShell | Shell::PowerShellCore => {
                self.generate_powershell_completion_script()
            }
            Shell::Csh | Shell::Tcsh => {
                self.generate_csh_completion_script()
            }
        }?;

        Ok(completions)
    }

    fn generate_bash_completion_script(&self) -> Result<String> {
        let mut script = String::new();
        
        for (cmd, args) in &this.commands {
            script.push_str(&format!("complete -F _complete_{} {}\n", cmd, cmd));
            script.push_str(&format!("_complete_{}() {{\n", cmd));
            script.push_str("    local cur prev opts\n");
            script.push_str("    COMPREPLY=()\n");
            script.push_str("    cur=\"${COMP_WORDS[COMP_CWORD]}\"\n");
            script.push_str("    prev=\"${COMP_WORDS[COMP_CWORD-1]}\"\n");
            script.push_str(&format!("    opts=\"{}\"\n", args.join(" ")));
            script.push_str("    COMPREPLY=( $(compgen -W \"$opts\" -- ${cur}) )\n");
            script.push_str("    return 0\n");
            script.push_str("}\n\n");
        }

        Ok(script)
    }

    fn generate_fish_completion_script(&self) -> Result<String> {
        let mut script = String::new();
        
        for (cmd, args) in &this.commands {
            script.push_str(&format!("complete -c {} ", cmd));
            script.push_str(&format!("-a '{}'\n", args.join(" ")));
        }

        Ok(script)
    }

    fn generate_powershell_completion_script(&self) -> Result<String> {
        let mut script = String::new();
        
        for (cmd, args) in &this.commands {
            script.push_str(&format!("Register-ArgumentCompleter -Native -CommandName {} -ScriptBlock {{\n", cmd));
            script.push_str("    param($wordToComplete, $commandAst, $cursorPosition)\n");
            script.push_str(&format!("    @('{}') | Where-Object {{ $_ -like \"$wordToComplete*\" }} | ForEach-Object {{ [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }}\n", args.join("', '")));
            script.push_str("}}\n\n");
        }

        Ok(script)
    }

    fn generate_csh_completion_script(&self) -> Result<String> {
        let mut script = String::new();
        
        for (cmd, args) in &this.commands {
            script.push_str(&format!("complete {} 'p/1/{}/'\n", cmd, args.join(" ")));
        }

        Ok(script)
    }
} 