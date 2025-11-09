# TTS Project

High-performance multilingual Text-to-Speech and Chat server built with Rust, featuring Piper TTS engine integration and OpenAI/Ollama LLM support.

## Quick Start

**Docker (Recommended):**
```bash
# Build and run with Docker
docker build -t tts-server .
docker run -p 8085:8085 -e OPENAI_API_KEY="your_key" tts-server

# Or use docker-compose
docker-compose up --build
```

**Local Build:**
```bash
# Build and run
cargo build --release
cargo run --release -p server

# Required for chat
export OPENAI_API_KEY="your_key"
export LLM_PROVIDER="openai"

# Health check
curl http://localhost:8085/health
```

## Project Structure

Rust workspace with three crates:
- **tts_core** – Piper TTS wrapper for speech synthesis and mel spectrograms
- **llm_core** – LLM client (OpenAI/Ollama) with optional Qdrant conversation history
- **server** – HTTP API server for TTS and chat

## Features

**TTS:** Multilingual support, model caching, speaker selection, WAV/base64 output, mel spectrograms

**LLM:** OpenAI and Ollama support, stateful conversations with Qdrant storage

**API:** REST endpoints, WebSocket streaming, input validation, CORS, structured logging

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/voices` | List available languages |
| `POST` | `/tts` | Synthesize speech |
| `POST` | `/chat` | Chat with LLM |
| `GET` | `/stream/:lang/:text` | WebSocket audio streaming |

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `8085` | Server port |
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key (*for OpenAI provider) |
| `LLM_PROVIDER` | No | `openai` | `openai` or `ollama` |
| `LLM_MODEL` | No | `gpt-3.5-turbo` | Model name |
| `QDRANT_URL` | No | - | Qdrant server URL (optional, must not be empty) |
| `RATE_LIMIT_PER_MINUTE` | No | `60` | Rate limit per minute |
| `RUST_LOG` | No | `info` | Log level |
| `PIPER_ESPEAKNG_DATA_DIRECTORY` | No | `/usr/share` | eSpeak-ng data directory (auto-set in Docker) |

## Requirements

- **Docker** (recommended) or **Rust** 1.70+ ([rustup.rs](https://rustup.rs))
- **Piper Models** (~70MB each, download separately)
- **OpenAI API Key** (required for chat, optional for TTS only)

## Docker

The project includes a multi-stage Dockerfile for easy deployment:

```bash
# Build image
docker build -t tts-server .

# Run container
docker run -p 8085:8085 \
  -e OPENAI_API_KEY="your_key" \
  -e LLM_PROVIDER="openai" \
  tts-server

# Or use docker-compose
docker-compose up --build
```

The Docker image includes all models and dependencies. See `docker-compose.yml` for environment variable configuration.

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Setup guide
- **[tests/README.md](tests/README.md)** - Testing docs
- **[frontend/FRONTEND_GUIDE.md](frontend/FRONTEND_GUIDE.md)** - Frontend setup
