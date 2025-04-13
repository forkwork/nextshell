use anyhow::Result;
use axum::{
    routing::{get, post},
    Router,
    Json,
    extract::{Path, Query},
};
use std::collections::HashMap;
use std::net::SocketAddr;
use nextshell_workflows_types::plugin::{ApiEndpoint, ApiProvider};

pub struct ApiServer {
    providers: HashMap<String, Box<dyn ApiProvider>>,
    router: Router,
}

impl ApiServer {
    pub fn new() -> Self {
        ApiServer {
            providers: HashMap::new(),
            router: Router::new(),
        }
    }

    pub fn register_provider(&mut self, name: String, provider: Box<dyn ApiProvider>) {
        self.providers.insert(name, provider);
        self.register_routes(name);
    }

    fn register_routes(&mut self, name: String) {
        if let Some(provider) = self.providers.get(&name) {
            for endpoint in provider.endpoints() {
                let path = format!("/api/{}/{}", name, endpoint.path);
                match endpoint.method.to_uppercase().as_str() {
                    "GET" => {
                        self.router = self.router.route(
                            &path,
                            get(move |Query(params): Query<HashMap<String, String>>| async move {
                                handle_request(provider, &endpoint.path, "GET", params)
                            }),
                        );
                    }
                    "POST" => {
                        self.router = self.router.route(
                            &path,
                            post(move |Json(params): Json<HashMap<String, String>>| async move {
                                handle_request(provider, &endpoint.path, "POST", params)
                            }),
                        );
                    }
                    _ => {}
                }
            }
        }
    }

    pub async fn start(&self, addr: SocketAddr) -> Result<()> {
        axum::Server::bind(&addr)
            .serve(self.router.clone().into_make_service())
            .await?;
        Ok(())
    }
}

async fn handle_request(
    provider: &dyn ApiProvider,
    endpoint: &str,
    method: &str,
    params: HashMap<String, String>,
) -> Result<Json<serde_json::Value>, axum::http::StatusCode> {
    match provider.handle_request(endpoint, method, params) {
        Ok(response) => Ok(Json(response)),
        Err(_) => Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR),
    }
} 