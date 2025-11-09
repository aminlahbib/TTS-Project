//! Unit tests for validation functions

use server::validation::*;
use server::error::ApiError;

#[test]
fn test_validate_tts_request_valid() {
    assert!(validate_tts_request("Hello", Some("de_DE")).is_ok());
    assert!(validate_tts_request("Test", None).is_ok());
}

#[test]
fn test_validate_tts_request_empty_text() {
    let result = validate_tts_request("", Some("de_DE"));
    assert!(result.is_err());
    if let Err(ApiError::InvalidInput(msg)) = result {
        assert!(msg.contains("empty"));
    }
}

#[test]
fn test_validate_tts_request_too_long() {
    let long_text = "a".repeat(6000);
    let result = validate_tts_request(&long_text, Some("de_DE"));
    assert!(result.is_err());
    if let Err(ApiError::InvalidInput(msg)) = result {
        assert!(msg.contains("too long"));
    }
}

#[test]
fn test_validate_tts_request_invalid_language_code() {
    let result = validate_tts_request("Hello", Some("invalid"));
    assert!(result.is_err());
    
    let result = validate_tts_request("Hello", Some("INVALID"));
    assert!(result.is_err());
    
    let result = validate_tts_request("Hello", Some("en"));
    assert!(result.is_ok());
    
    let result = validate_tts_request("Hello", Some("en_US"));
    assert!(result.is_ok());
}

#[test]
fn test_validate_chat_request_valid() {
    assert!(validate_chat_request("Hello").is_ok());
}

#[test]
fn test_validate_chat_request_empty() {
    let result = validate_chat_request("");
    assert!(result.is_err());
}

#[test]
fn test_validate_chat_request_too_long() {
    let long_message = "a".repeat(11000);
    let result = validate_chat_request(&long_message);
    assert!(result.is_err());
}

#[test]
fn test_validate_conversation_id_valid() {
    let valid_uuid = uuid::Uuid::new_v4().to_string();
    assert!(validate_conversation_id(&valid_uuid).is_ok());
}

#[test]
fn test_validate_conversation_id_invalid() {
    assert!(validate_conversation_id("invalid-uuid").is_err());
    assert!(validate_conversation_id("").is_err());
}

