use crate::error::ApiError;

/// Maximum text length for TTS requests
const MAX_TEXT_LENGTH: usize = 5000;
/// Minimum text length for TTS requests
const MIN_TEXT_LENGTH: usize = 1;
/// Maximum message length for chat requests
const MAX_MESSAGE_LENGTH: usize = 10000;

/// Validate TTS request
pub fn validate_tts_request(text: &str, language: Option<&str>) -> Result<(), ApiError> {
    // Validate text length
    if text.is_empty() {
        return Err(ApiError::InvalidInput("Text cannot be empty".to_string()));
    }
    if text.len() > MAX_TEXT_LENGTH {
        return Err(ApiError::InvalidInput(format!(
            "Text too long (max {} characters)",
            MAX_TEXT_LENGTH
        )));
    }
    if text.len() < MIN_TEXT_LENGTH {
        return Err(ApiError::InvalidInput(format!(
            "Text too short (min {} characters)",
            MIN_TEXT_LENGTH
        )));
    }

    // Validate language code format if provided
    if let Some(lang) = language {
        if !is_valid_language_code(lang) {
            return Err(ApiError::InvalidInput(format!(
                "Invalid language code format: {}. Expected format: ll_CC (e.g., en_US, de_DE)",
                lang
            )));
        }
    }

    Ok(())
}

/// Validate chat request
pub fn validate_chat_request(message: &str) -> Result<(), ApiError> {
    if message.is_empty() {
        return Err(ApiError::InvalidInput("Message cannot be empty".to_string()));
    }
    if message.len() > MAX_MESSAGE_LENGTH {
        return Err(ApiError::InvalidInput(format!(
            "Message too long (max {} characters)",
            MAX_MESSAGE_LENGTH
        )));
    }
    Ok(())
}

/// Validate language code format (e.g., en_US, de_DE)
fn is_valid_language_code(code: &str) -> bool {
    // Language code should be in format: ll_CC (2 lowercase letters, underscore, 2 uppercase letters)
    // Or just ll (2 lowercase letters)
    let parts: Vec<&str> = code.split('_').collect();
    match parts.len() {
        1 => parts[0].len() == 2 && parts[0].chars().all(|c| c.is_ascii_lowercase()),
        2 => {
            parts[0].len() == 2
                && parts[0].chars().all(|c| c.is_ascii_lowercase())
                && parts[1].len() == 2
                && parts[1].chars().all(|c| c.is_ascii_uppercase())
        }
        _ => false,
    }
}

/// Validate conversation ID format (UUID)
pub fn validate_conversation_id(id: &str) -> Result<(), ApiError> {
    if id.is_empty() {
        return Err(ApiError::InvalidInput(
            "Conversation ID cannot be empty".to_string(),
        ));
    }
    // Basic UUID format validation
    if !uuid::Uuid::parse_str(id).is_ok() {
        return Err(ApiError::InvalidInput(
            "Invalid conversation ID format. Expected UUID".to_string(),
        ));
    }
    Ok(())
}

