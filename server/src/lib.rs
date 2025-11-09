//! Server library for testing

pub mod error;
pub mod validation;

// Re-export types for testing - these are defined in main.rs
pub use crate::AppState;
pub use crate::health_check;
pub use crate::list_voices;
pub use crate::list_voices_detail;
pub use crate::tts_endpoint;
pub use crate::chat_endpoint;
pub use crate::stream_ws;

