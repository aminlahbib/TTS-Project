//! Common utilities for integration tests

use axum::Router;
use std::collections::HashMap;
use std::sync::Arc;
use tts_core::TtsManager;
use llm_core::{LlmClient, LlmProvider};
use tower::ServiceExt;

use server::AppState;

/// Create a test app instance
pub async fn create_test_app() -> Router {
    use axum::{
        routing::{get, post},
        Router,
    };
    use tower::ServiceBuilder;
    use tower_http::cors::CorsLayer;
    
    // Create minimal TTS manager for testing
    let mut map = HashMap::new();
    map.insert(
        "de_DE".to_string(),
        (
            "models/de_DE/de_DE-mls-medium.onnx.json".to_string(),
            None,
        ),
    );
    let tts = Arc::new(TtsManager::new(map));

    // Create LLM client (may fail if API key not set, but that's ok for tests)
    let llm = Arc::new(std::sync::Mutex::new(
        LlmClient::new(LlmProvider::OpenAI, "gpt-3.5-turbo")
            .unwrap_or_else(|_| {
                // Fallback: create without API key for testing
                // Tests that require LLM will need OPENAI_API_KEY set
                LlmClient::new(LlmProvider::OpenAI, "gpt-3.5-turbo")
                    .expect("Failed to create LLM client")
            }),
    ));

    let state = AppState { tts, llm };
    
    Router::new()
        .route("/health", get(server::health_check))
        .route("/voices", get(server::list_voices))
        .route("/voices/detail", get(server::list_voices_detail))
        .route("/tts", post(server::tts_endpoint))
        .route("/chat", post(server::chat_endpoint))
        .route("/stream/:lang/:text", get(server::stream_ws))
        .layer(ServiceBuilder::new().layer(CorsLayer::permissive()).into_inner())
        .with_state(state)
}

