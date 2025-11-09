# Testing Status

## Current Status

**Completed:**
- Core features: Ollama support, Qdrant integration, conversation history
- Server: Error handling, input validation, rate limiting, logging, CORS
- TTS: Model caching, speaker selection, dynamic sample rate
- Tests: 9 unit tests passing, integration tests implemented

**In Progress:**
- Additional unit tests (TTS core, LLM core, Qdrant)
- WebSocket, rate limiting, and CORS tests

## Test Coverage

**Unit Tests:** Validation (9 passing), error handling ✅ | TTS/LLM/Qdrant ⏳

**Integration Tests:** TTS/Chat endpoints ✅ | WebSocket ✅ | Rate limiting/CORS ⏳

## Running Tests

```bash
# All tests
cargo test --workspace

# Unit tests
cargo test --package server --lib

# Integration tests
cargo test --test integration
```

See `tests/README.md` for details.

