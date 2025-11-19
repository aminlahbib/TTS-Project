# Testing Guide

This folder collects everything related to automated and manual verification of the TTS Project. Use it as the single reference for how to run, extend, and triage tests.

---

## Directory layout
```
tests/
├── README.md                 # You're here
├── run_tests.sh              # Unified launcher (unit/integration/e2e)
├── e2e.rs                    # Cargo test target (uses the files below)
├── e2e_chat_pipeline.rs      # Chat + voice-chat end-to-end specs
├── e2e_tts_pipeline.rs       # TTS pipeline specs
├── e2e_websocket_streaming.rs# Streaming focused specs
├── e2e_test_helpers.rs       # Shared testing utilities
├── test_streaming.js         # Manual WebSocket sanity check (Node)
└── postman/
    ├── README.md
    └── TTS_API.postman_collection.json
```

Additional integration helpers live in `server/tests/` and unit tests live alongside the Rust modules (`server/src`, `tts_core/src`, `llm_core/src`).

---

## Test types at a glance

| Suite | Location | Command | Purpose / Notes |
| --- | --- | --- | --- |
| Unit | crate modules (`server/src`, `tts_core/src`, `llm_core/src`) | `cargo test --package <crate> --lib` | Fast logic checks (validation, helpers, error handling). |
| Integration | `server/tests/integration.rs` | `cargo test --package server --test integration` | Spins up the HTTP stack in-process; covers REST happy-path + errors. |
| End-to-End | `tests/e2e_*.rs` | `cargo test --package server --test e2e` | Exercises full chat + TTS pipelines, including optional audio assertions. |
| Manual / Tools | `tests/postman`, `tests/test_streaming.js` | Postman runner / `node tests/test_streaming.js "Hello" en_US` | Useful when debugging WebSocket streaming or demoing endpoints interactively. |

---

## Running tests

### Using the launcher (recommended)
```bash
# Run everything
./tests/run_tests.sh

# Run a subset
./tests/run_tests.sh unit e2e

# Help text
./tests/run_tests.sh --help
```

### Direct cargo commands
```bash
# Fast unit pass across all crates
cargo test --package tts_core --package llm_core --package server --lib

# Integration only
cargo test --package server --test integration -- --nocapture

# Single e2e scenario
cargo test --package server --test e2e test_complete_tts_pipeline
```

### Manual WebSocket poke
```bash
node tests/test_streaming.js "Streaming test" en_US
node tests/test_streaming.js "Hola" es_ES conversation-123
```

### Postman collection
1. Import `tests/postman/TTS_API.postman_collection.json`.
2. Set `base_url` (defaults to `http://localhost:8085`).
3. Run folders for health, TTS, chat, or validation flows.

---

## Environment & dependencies

| Variable | Why it matters | Example |
| --- | --- | --- |
| `OPENAI_API_KEY` | Needed when `LLM_PROVIDER=openai` during chat/e2e tests. | `sk-...` |
| `LLM_PROVIDER` | Switches between `openai` and `ollama`. | `ollama` |
| `LLM_MODEL` | Overrides default model per provider. | `gpt-4o-mini` |
| `PIPER_ESPEAKNG_DATA_DIRECTORY` | Ensures Piper can find voices during synthesis tests. | `/usr/share` |
| `QDRANT_URL` / `QDRANT_API_KEY` | Optional; required for persistence-related tests. | `http://localhost:6333` |

Helpful tips:
- Keep Piper voices under `models/` and run `python3 scripts/check_models.py` before executing TTS-heavy suites.
- For slow machines, throttle compilation with `CARGO_BUILD_JOBS=2 ./tests/run_tests.sh`.
- Use `RUST_LOG=debug` when you need verbose server output during integration/e2e runs.

---

## Current coverage snapshot

| Area | Status | Next actions |
| --- | --- | --- |
| Validation unit tests | ✅ solid baseline | Add edge-case regressions for new request fields. |
| TTS core unit tests | ⚠️ missing | Add mel generation & wavewriter tests using small fixtures. |
| LLM core unit tests | ⚠️ missing | Mock provider calls to verify retry/timeout paths. |
| Integration (REST) | ✅ health, voices, TTS, chat | Add explicit rate-limit & CORS scenarios. |
| WebSocket automation | ⚠️ manual only | Port `test_streaming.js` assertions into Rust-based integration test. |

---

## Contributing new tests
1. Decide on the level (unit/integration/e2e). Err on the smallest scope that catches the bug.
2. For e2e additions, place helpers in `e2e_test_helpers.rs` so other suites can reuse them.
3. Keep tests deterministic—mock or gate any call that depends on real OpenAI/Ollama responses when feasible.
4. Document new env requirements in this README and, if applicable, in the top-level `README.md`.

Unit test template:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validates_language_codes() {
        assert!(is_valid_language("en_US"));
        assert!(!is_valid_language("klingon"));
    }
}
```

Tokio integration template:
```rust
#[tokio::test]
async fn rejects_empty_text() {
    let app = create_test_app().await;
    let response = send_json(&app, "/tts", json!({ "text": "" })).await;
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}
```

---

## Roadmap for the test suite
- [ ] Automate WebSocket streaming assertions inside `cargo test`.
- [ ] Add fixture-backed Piper snapshots so unit tests can run without heavy models.
- [ ] Wire `./tests/run_tests.sh` into CI (GitHub Actions) with nightly coverage output.
- [ ] Publish Postman environment + Newman command for headless API smoke tests.

Keep this file updated whenever test coverage or tooling changes. Feel free to add sections for new suites (load testing, fuzzing, etc.) as the project grows.
