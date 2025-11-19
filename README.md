# TTS Project

High-performance multilingual Text-to-Speech and Chat platform built in Rust with Piper for speech synthesis, OpenAI/Ollama for LLM responses, and a lightweight web console for demos.

## Highlights
- Multilingual speech synthesis with cached Piper voices and mel-spectrogram previews
- Bidirectional chat pipeline that can return both LLM text and synthesized speech
- REST + WebSocket APIs with rate limiting, validation, metrics, and tracing
- Production-ready Docker images (server + frontend) and reproducible scripts
- Extensive docs (architecture, deployment, QA) plus ready-to-run Postman collections

## Stack & Layout

| Path | Contents |
| --- | --- |
| `server/` | HTTP + WebSocket gateway, metrics, validation, rate limiting |
| `tts_core/` | Piper bindings, voice/model management, mel/wav helpers |
| `llm_core/` | OpenAI / Ollama clients, conversation state, Qdrant helpers |
| `frontend/` | Static demo console (tabs for chat, TTS, streaming, metrics) |
| `models/` & `voiceModels/` | Example voice definitions and ONNX configs |
| `docs/` | Architecture notes, optimization logs, deployment & testing guides |
| `scripts/` | Model checks, downloads, optimization/test harnesses |
| `tests/` | Rust e2e suites + Postman collection + helper utilities |

## Quick Start

### Docker (recommended)
```bash
docker compose up --build
# Frontend: http://localhost:8082
# API:      http://localhost:8085
```

### Local workspace
```bash
cargo run --release -p server \
  -- --config server/config.toml   # optional config file

export OPENAI_API_KEY="sk-..."
export LLM_PROVIDER="openai"       # or ollama
curl http://localhost:8085/health
```

### Frontend-only preview
```bash
cd frontend
./start_frontend.sh         # or python3 serve_frontend.py
```

## Configuration Essentials

| Variable | Purpose | Default |
| --- | --- | --- |
| `OPENAI_API_KEY` | Required for OpenAI provider | – |
| `LLM_PROVIDER` | `openai` or `ollama` | `openai` |
| `LLM_MODEL` | Provider-specific model id | `gpt-3.5-turbo` |
| `PORT` | Server port | `8085` |
| `RATE_LIMIT_PER_MINUTE` | Global rate limit | `60` |
| `PIPER_ESPEAKNG_DATA_DIRECTORY` | eSpeak-ng assets (auto in Docker) | `/usr/share` |

Voice mapping lives in `models/map.json`. Run `python3 scripts/check_models.py` after updating voices to verify metadata and file paths.

## Build, Test & QA
- `cargo fmt && cargo clippy && cargo test` — standard Rust checks
- `tests/run_tests.sh` — orchestrated e2e suites (chat, TTS, WebSocket streaming)
- `scripts/performance_test.sh` & `performance_results/` — load and latency baselines
- `scripts/test_optimizations.sh` — regression guardrails for recent optimizations

### Cleaning the workspace
Use `cargo clean` (or remove `target/` and `tests/target/`) before committing to GitHub to avoid shipping compiled Piper assets. If macOS file permissions block deletion, run `chmod -R u+w target tests/target` first.

## Documentation map
- `docs/README.md` — index for the refreshed document set
- `docs/ARCHITECTURE.md` — component breakdown and data flow descriptions
- `docs/QUICKSTART.md` — Docker + local setup instructions
- `docs/DEPLOYMENT.md` — production hardening checklist
- `docs/PROJECT_ANALYSIS.md` — executive summary and roadmap notes
- `tests/README.md` & `tests/postman/` — manual + automated testing aides

## Contributors
- Amine (project lead & maintainer)
- Open-source collaborators for bug fixes, frontend polish, and QA scripts

Want to contribute? Open an issue, describe the feature/bug, and link to relevant docs or benchmarks.

## Acknowledgments
- Piper TTS, eSpeak-ng, and the broader Rhasspy ecosystem for high-quality multilingual voices
- OpenAI and Ollama teams for reliable LLM APIs and local model tooling
- The community around Rust audio/ML crates that power low-latency inference here

## License

Distributed under the [MIT License](LICENSE). By contributing you agree your code will be licensed under MIT as well.
