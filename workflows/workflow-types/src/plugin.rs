use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMetadata {
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub dependencies: Vec<String>,
    pub api_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginConfig {
    pub enabled: bool,
    pub settings: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookConfig {
    pub url: String,
    pub method: String,
    pub headers: HashMap<String, String>,
    pub events: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq, Hash, PartialOrd)]
pub enum Shell {
    #[serde(alias = "fish")]
    Fish,
    #[serde(alias = "bash")]
    Bash,
    #[serde(alias = "zsh")]
    Zsh,
    #[serde(alias = "powershell")]
    PowerShell,
    #[serde(alias = "pwsh")]
    PowerShellCore,
    #[serde(alias = "csh")]
    Csh,
    #[serde(alias = "tcsh")]
    Tcsh,
    #[serde(alias = "ksh")]
    Korn,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShellConfig {
    pub shell: Shell,
    pub syntax_theme: Option<String>,
    pub aliases: HashMap<String, String>,
    pub functions: HashMap<String, String>,
    pub completion_scripts: Vec<String>,
    pub init_scripts: Vec<String>,
}

pub trait Plugin {
    fn metadata(&self) -> PluginMetadata;
    fn initialize(&mut self, config: PluginConfig) -> anyhow::Result<()>;
    fn shutdown(&mut self) -> anyhow::Result<()>;
    fn handle_event(&mut self, event: &str, data: serde_json::Value) -> anyhow::Result<()>;
}

pub trait Extension {
    fn name(&self) -> &str;
    fn register_commands(&self) -> Vec<String>;
    fn execute_command(&self, command: &str, args: &[String]) -> anyhow::Result<String>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiEndpoint {
    pub path: String,
    pub method: String,
    pub description: Option<String>,
    pub parameters: HashMap<String, String>,
    pub response_type: String,
}

pub trait ApiProvider {
    fn endpoints(&self) -> Vec<ApiEndpoint>;
    fn handle_request(&self, endpoint: &str, method: &str, params: HashMap<String, String>) -> anyhow::Result<serde_json::Value>;
} 