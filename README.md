# TTS Project

High-performance multilingual Text-to-Speech and Chat platform built in Rust with Piper for speech synthesis, an Ollama-backed LLM pipeline, and a lightweight web console for demos.

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
| `llm_core/` | Ollama client, conversation state manager, Qdrant helpers |
| `frontend/` | Static demo console (tabs for chat, TTS, streaming, metrics) |
| `models/` | Example voice definitions and ONNX configs |
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

export LLM_MODEL="llama3"          # override default Ollama model
export OLLAMA_BASE_URL="http://localhost:11434"
curl http://localhost:8085/health
```

### Frontend-only preview
```bash
cd frontend
./start_frontend.sh         # or python3 serve_frontend.py
```

## Git LFS Setup

This repository uses [Git LFS](https://git-lfs.github.com/) to manage large ONNX model files (`models/**/*.onnx` and `models/**/*.onnx.json`). These files are stored in GitHub's LFS storage rather than directly in the Git repository.

### First-time setup

If you're cloning this repository for the first time, ensure Git LFS is installed:

```bash
# Install Git LFS (if not already installed)
# macOS:
brew install git-lfs

# Linux (Ubuntu/Debian):
sudo apt-get install git-lfs

# Windows:
# Download from https://git-lfs.github.com/

# Initialize Git LFS in your repository
git lfs install
```

### Cloning the repository

When you clone the repository, Git LFS will automatically download the actual model files:

```bash
git clone https://github.com/aminlahbib/TTS-Project.git
cd TTS-Project
# Model files are automatically downloaded via Git LFS
```

If you cloned before installing Git LFS, you can download the model files manually:

```bash
git lfs install
git lfs pull
```

### Verifying Git LFS is working

Check that model files are tracked by LFS:

```bash
git lfs ls-files
```

This should list all `.onnx` and `.onnx.json` files in the `models/` directory.

### Troubleshooting

- **If model files appear as small text files (~130 bytes)**: Git LFS isn't installed or initialized. Run `git lfs install` and then `git lfs pull`.
- **If you see "Git LFS not found" errors**: Install Git LFS using the commands above for your operating system.
- **To check LFS storage usage**: Visit your repository on GitHub → Settings → Code and automation → Git LFS

## Configuration Essentials

| Variable | Why it matters | Default |
| --- | --- | --- |
| `LLM_MODEL` | Which Ollama model to spin up for chat/voice-chat requests | `llama3` |
| `OLLAMA_BASE_URL` | URL of the Ollama daemon (local or remote GPU host) | `http://localhost:11434` |
| `PORT` | HTTP + WebSocket listener for the Rust server | `8085` |
| `RATE_LIMIT_PER_MINUTE` | Global throttle to protect synthesis + LLM workloads | `60` |
| `PIPER_ESPEAKNG_DATA_DIRECTORY` | Ensures Piper can find eSpeak-ng phoneme data | `/usr/share` |
| `QDRANT_URL` / `QDRANT_API_KEY` (optional) | Enables vector storage for long-lived conversations | unset |

Voice mapping lives in `models/map.json`; edit it when you add or rename voices. Run `python3 scripts/check_models.py` afterward to ensure every entry points to an existing ONNX bundle.

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
- Iheb (project lead & maintainer)
- Open-source collaborators for bug fixes, frontend polish, and QA scripts

Want to contribute? Open an issue, describe the feature/bug, and link to relevant docs or benchmarks.

## Acknowledgments
- Piper TTS, eSpeak-ng, and the broader Rhasspy ecosystem for high-quality multilingual voices
- Ollama team for reliable local LLM tooling
- The community around Rust audio/ML crates that power low-latency inference here

## License

Distributed under the [MIT License](LICENSE). By contributing you agree your code will be licensed under MIT as well.
