use anyhow::Result;
use std::collections::HashMap;
use std::path::Path;
use nextshell_workflows_types::plugin::{Shell, ShellConfig};

pub struct ShellManager {
    configs: HashMap<Shell, ShellConfig>,
    current_shell: Shell,
}

impl ShellManager {
    pub fn new(default_shell: Shell) -> Self {
        let mut configs = HashMap::new();
        configs.insert(default_shell.clone(), ShellConfig {
            shell: default_shell.clone(),
            syntax_theme: None,
            aliases: HashMap::new(),
            functions: HashMap::new(),
            completion_scripts: Vec::new(),
            init_scripts: Vec::new(),
        });

        ShellManager {
            configs,
            current_shell: default_shell,
        }
    }

    pub fn set_shell(&mut self, shell: Shell) -> Result<()> {
        if !self.configs.contains_key(&shell) {
            self.configs.insert(shell.clone(), ShellConfig {
                shell: shell.clone(),
                syntax_theme: None,
                aliases: HashMap::new(),
                functions: HashMap::new(),
                completion_scripts: Vec::new(),
                init_scripts: Vec::new(),
            });
        }
        self.current_shell = shell;
        Ok(())
    }

    pub fn get_syntax_theme(&self) -> Option<&String> {
        self.configs.get(&self.current_shell)
            .and_then(|config| config.syntax_theme.as_ref())
    }

    pub fn set_syntax_theme(&mut self, theme: String) -> Result<()> {
        if let Some(config) = self.configs.get_mut(&self.current_shell) {
            config.syntax_theme = Some(theme);
        }
        Ok(())
    }

    pub fn add_alias(&mut self, name: String, value: String) -> Result<()> {
        if let Some(config) = self.configs.get_mut(&self.current_shell) {
            config.aliases.insert(name, value);
        }
        Ok(())
    }

    pub fn remove_alias(&mut self, name: &str) -> Result<()> {
        if let Some(config) = self.configs.get_mut(&self.current_shell) {
            config.aliases.remove(name);
        }
        Ok(())
    }

    pub fn add_function(&mut self, name: String, body: String) -> Result<()> {
        if let Some(config) = self.configs.get_mut(&self.current_shell) {
            config.functions.insert(name, body);
        }
        Ok(())
    }

    pub fn remove_function(&mut self, name: &str) -> Result<()> {
        if let Some(config) = self.configs.get_mut(&self.current_shell) {
            config.functions.remove(name);
        }
        Ok(())
    }

    pub fn add_completion_script(&mut self, script: String) -> Result<()> {
        if let Some(config) = self.configs.get_mut(&self.current_shell) {
            config.completion_scripts.push(script);
        }
        Ok(())
    }

    pub fn add_init_script(&mut self, script: String) -> Result<()> {
        if let Some(config) = self.configs.get_mut(&self.current_shell) {
            config.init_scripts.push(script);
        }
        Ok(())
    }

    pub fn get_shell_config(&self) -> Option<&ShellConfig> {
        self.configs.get(&self.current_shell)
    }

    pub fn get_current_shell(&self) -> &Shell {
        &self.current_shell
    }

    pub fn generate_init_script(&self) -> Result<String> {
        let config = self.configs.get(&self.current_shell)
            .ok_or_else(|| anyhow::anyhow!("No configuration found for current shell"))?;

        let mut script = String::new();

        // Add aliases
        for (name, value) in &config.aliases {
            match self.current_shell {
                Shell::Bash | Shell::Zsh | Shell::Korn => {
                    script.push_str(&format!("alias {}='{}'\n", name, value));
                }
                Shell::Fish => {
                    script.push_str(&format!("alias {}='{}'\n", name, value));
                }
                Shell::PowerShell | Shell::PowerShellCore => {
                    script.push_str(&format!("Set-Alias -Name {} -Value '{}'\n", name, value));
                }
                Shell::Csh | Shell::Tcsh => {
                    script.push_str(&format!("alias {} '{}'\n", name, value));
                }
            }
        }

        // Add functions
        for (name, body) in &config.functions {
            match self.current_shell {
                Shell::Bash | Shell::Zsh | Shell::Korn => {
                    script.push_str(&format!("function {} {{\n{}\n}}\n", name, body));
                }
                Shell::Fish => {
                    script.push_str(&format!("function {}\n{}\nend\n", name, body));
                }
                Shell::PowerShell | Shell::PowerShellCore => {
                    script.push_str(&format!("function {} {{\n{}\n}}\n", name, body));
                }
                Shell::Csh | Shell::Tcsh => {
                    script.push_str(&format!("alias {} '{}'\n", name, body));
                }
            }
        }

        // Add completion scripts
        for completion_script in &config.completion_scripts {
            script.push_str(completion_script);
            script.push('\n');
        }

        // Add init scripts
        for init_script in &config.init_scripts {
            script.push_str(init_script);
            script.push('\n');
        }

        Ok(script)
    }
} 