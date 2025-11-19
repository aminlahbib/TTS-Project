# Quickstart Guide

This guide gets you from cloning the repository to hearing synthesized speech in minutes. Pick the path that fits your environment.

## 1. Prerequisites
- Docker 24+ and Docker Compose v2 **or** Rust 1.70+, Python 3.10+
- Piper voice models (can be downloaded later with provided scripts)
- Optional: OpenAI API key if you plan to use the OpenAI provider

## 2. Clone and configure
```bash
git clone https://github.com/amine/tts_project.git
cd tts_project
cp .env.example .env             # optional; configure API keys and ports
```

## 3. Run with Docker (recommended)
```bash
docker compose up --build
# Frontend: http://localhost:8082
# API:      http://localhost:8085
```
The Compose file builds server + frontend, mounts `models/`, and exposes both HTTP and WebSocket endpoints. Stop with `CTRL+C` or `docker compose down`.

## 4. Run locally (advanced)
```bash
ripgrep --version                 # ensure tooling available
cargo build --release
cargo run --release -p server
```
Environment variables to set before running:
```bash
export OPENAI_API_KEY="sk-..."    # required only for OpenAI provider
export LLM_PROVIDER="openai"      # or "ollama"
export PIPER_ESPEAKNG_DATA_DIRECTORY=/usr/share/espeak-ng
```

## 5. Frontend dev server
```bash
cd frontend
./start_frontend.sh               # uses Python simple server internally
# or
python3 serve_frontend.py
```

## 6. Basic smoke tests
```bash
# Health check
curl http://localhost:8085/health

# List voices
curl http://localhost:8085/voices | jq

# Generate speech
curl -X POST http://localhost:8085/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","language":"en_US","voice_id":"amy"}'
```

## 7. Optional tooling
- `python3 scripts/check_models.py` — validate `models/map.json` paths
- `tests/run_tests.sh` — execute E2E suites (chat, TTS, streaming)
- `scripts/performance_test.sh` — quick latency benchmark

## 8. Cleaning up
```bash
cargo clean                       # removes /target build artifacts
chmod -R u+w target               # fix macOS perms if clean fails
```

You now have a fully functioning environment. Head over to `DEPLOYMENT.md` when you are ready to harden the stack for production use.

