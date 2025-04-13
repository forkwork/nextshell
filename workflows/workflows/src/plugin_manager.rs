use anyhow::Result;
use std::collections::HashMap;
use std::path::Path;
use nextshell_workflows_types::plugin::{Plugin, PluginConfig, PluginMetadata};

pub struct PluginManager {
    plugins: HashMap<String, Box<dyn Plugin>>,
    configs: HashMap<String, PluginConfig>,
}

impl PluginManager {
    pub fn new() -> Self {
        PluginManager {
            plugins: HashMap::new(),
            configs: HashMap::new(),
        }
    }

    pub fn load_plugin<P: AsRef<Path>>(&mut self, path: P) -> Result<()> {
        // TODO: Implement dynamic plugin loading
        // This will involve:
        // 1. Loading the plugin library
        // 2. Creating plugin instance
        // 3. Initializing with config
        // 4. Storing in plugins map
        Ok(())
    }

    pub fn unload_plugin(&mut self, name: &str) -> Result<()> {
        if let Some(mut plugin) = self.plugins.remove(name) {
            plugin.shutdown()?;
        }
        self.configs.remove(name);
        Ok(())
    }

    pub fn get_plugin(&self, name: &str) -> Option<&dyn Plugin> {
        self.plugins.get(name).map(|p| p.as_ref())
    }

    pub fn get_plugin_mut(&mut self, name: &str) -> Option<&mut dyn Plugin> {
        self.plugins.get_mut(name).map(|p| p.as_mut())
    }

    pub fn list_plugins(&self) -> Vec<PluginMetadata> {
        self.plugins
            .values()
            .map(|p| p.metadata())
            .collect()
    }

    pub fn update_config(&mut self, name: &str, config: PluginConfig) -> Result<()> {
        if let Some(plugin) = self.plugins.get_mut(name) {
            plugin.initialize(config.clone())?;
            self.configs.insert(name.to_string(), config);
        }
        Ok(())
    }
} 