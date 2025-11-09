# Test Suite Documentation

This directory contains comprehensive tests for the TTS project.

## 📁 Test Structure

```
tests/
├── README.md              # This file
├── unit/                   # Unit tests
│   ├── tts_core/          # TTS core unit tests
│   ├── llm_core/          # LLM core unit tests
│   └── server/            # Server unit tests
├── integration/           # Integration tests
│   ├── api/               # API endpoint tests
│   ├── websocket/         # WebSocket tests
│   └── end_to_end/        # End-to-end tests
└── fixtures/              # Test fixtures and data
    ├── models/            # Mock model files
    └── configs/          # Test configurations
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install test dependencies
cargo install cargo-nextest  # Optional: faster test runner
```

### Running Tests

```bash
# Run all tests
cargo test --workspace

# Run tests with output
cargo test --workspace -- --nocapture

# Run specific test suite
cargo test --package tts_core
cargo test --package llm_core
cargo test --package server

# Run integration tests only
cargo test --test integration

# Run with coverage (requires cargo-tarpaulin)
cargo tarpaulin --workspace --out Html
```

## 📋 Test Categories

### Unit Tests

Test individual components in isolation:

- **TTS Core**: Model loading, synthesis, encoding
- **LLM Core**: Provider abstraction, conversation management
- **Server**: Validation, error handling, middleware

### Integration Tests

Test component interactions:

- **API Endpoints**: HTTP request/response handling
- **WebSocket**: Real-time streaming
- **Database**: Qdrant storage operations

### End-to-End Tests

Test complete workflows:

- **TTS Pipeline**: Text → Audio → Response
- **Chat Pipeline**: Message → LLM → Response
- **Streaming**: WebSocket audio streaming

## 🔧 Test Configuration

### Environment Variables

Tests use environment variables for configuration:

```bash
# TTS Tests
export TTS_MODEL_PATH="tests/fixtures/models"
export TTS_TEST_LANGUAGE="de_DE"

# LLM Tests
export LLM_PROVIDER="openai"  # or "ollama"
export LLM_MODEL="gpt-3.5-turbo"
export OPENAI_API_KEY="test-key"  # For OpenAI tests

# Qdrant Tests
export QDRANT_URL="http://localhost:6333"
export QDRANT_API_KEY=""  # Optional

# Server Tests
export SERVER_PORT="8081"
export RATE_LIMIT_PER_MINUTE="60"
```

### Test Fixtures

Test fixtures are located in `tests/fixtures/`:

- Mock model files for TTS testing
- Test configurations
- Sample audio files
- Expected responses

## 📊 Test Coverage

Current coverage targets:

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All endpoints covered
- **E2E Tests**: Critical paths covered

## 🐛 Debugging Tests

### Verbose Output

```bash
# Show test output
cargo test -- --nocapture

# Show test names
cargo test -- --list

# Run single test
cargo test test_name
```

### Test Logging

```bash
# Enable tracing logs
RUST_LOG=debug cargo test

# Enable specific module logs
RUST_LOG=tts_core=debug cargo test
```

## 🔍 Writing New Tests

### Unit Test Example

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function() {
        // Arrange
        let input = "test";
        
        // Act
        let result = function(input);
        
        // Assert
        assert_eq!(result, expected);
    }
}
```

### Integration Test Example

```rust
#[tokio::test]
async fn test_endpoint() {
    // Setup
    let app = create_test_app().await;
    let client = TestClient::new(app);
    
    // Test
    let response = client.post("/endpoint")
        .json(&request_body)
        .send()
        .await;
    
    // Assert
    assert_eq!(response.status(), 200);
}
```

## 📝 Best Practices

1. **Isolation**: Each test should be independent
2. **Naming**: Use descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Fixtures**: Use fixtures for test data
5. **Mocking**: Mock external dependencies
6. **Cleanup**: Clean up after tests

## 🚨 Known Issues

- Some tests require external services (Qdrant, Ollama)
- Model files are large and not included in repo
- Some tests may be slow due to model loading

## 📚 Additional Resources

- [Rust Testing Book](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [Axum Testing Guide](https://docs.rs/axum/latest/axum/testing/index.html)
- [Tokio Testing](https://tokio.rs/tokio/topics/testing)

