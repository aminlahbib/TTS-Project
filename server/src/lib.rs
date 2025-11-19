//! Server library for testing

pub mod error;
pub mod validation;
pub mod metrics;

// Note: Handlers are in main.rs since this is a binary crate
// For testing, we'll need to make the handlers accessible differently
// or move them to a shared module

