use anyhow::Result;
use reqwest::Client;
use std::collections::HashMap;
use nextshell_workflows_types::plugin::WebhookConfig;
use serde_json::Value;

pub struct WebhookManager {
    client: Client,
    webhooks: HashMap<String, Vec<WebhookConfig>>,
}

impl WebhookManager {
    pub fn new() -> Self {
        WebhookManager {
            client: Client::new(),
            webhooks: HashMap::new(),
        }
    }

    pub fn register_webhook(&mut self, event: String, config: WebhookConfig) {
        self.webhooks
            .entry(event)
            .or_insert_with(Vec::new)
            .push(config);
    }

    pub fn unregister_webhook(&mut self, event: &str, url: &str) {
        if let Some(configs) = self.webhooks.get_mut(event) {
            configs.retain(|config| config.url != url);
        }
    }

    pub async fn trigger_event(&self, event: &str, data: Value) -> Result<()> {
        if let Some(configs) = self.webhooks.get(event) {
            for config in configs {
                if config.events.contains(&event.to_string()) {
                    self.send_webhook(config, data.clone()).await?;
                }
            }
        }
        Ok(())
    }

    async fn send_webhook(&self, config: &WebhookConfig, data: Value) -> Result<()> {
        let mut request = self.client.request(
            reqwest::Method::from_bytes(config.method.as_bytes())?,
            &config.url,
        );

        // Add headers
        for (key, value) in &config.headers {
            request = request.header(key, value);
        }

        // Send the request with the data
        request.json(&data).send().await?;
        Ok(())
    }
} 