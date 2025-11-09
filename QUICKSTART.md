# Quick Start Guide

## Prerequisites

- Rust 1.70+ ([rustup.rs](https://rustup.rs))
- Piper TTS models (~70MB each, download from [Piper releases](https://github.com/rhasspy/piper/releases))

## Setup

### 1. Download Models

```bash
# Create directories
mkdir -p models/de_DE models/fr_FR

# Download models and place in respective directories:
# models/de_DE/de_DE-mls-medium.onnx
# models/de_DE/de_DE-mls-medium.onnx.json
# models/fr_FR/fr_FR-siwis-medium.onnx
# models/fr_FR/fr_FR-siwis-medium.onnx.json
```

Verify `models/map.json`:
```json
{
  "de_DE": {
    "config": "models/de_DE/de_DE-mls-medium.onnx.json",
    "speaker": null
  },
  "fr_FR": {
    "config": "models/fr_FR/fr_FR-siwis-medium.onnx.json",
    "speaker": null
  }
}
```

### 2. Configure Environment

```bash
# Required for chat
export OPENAI_API_KEY="your_key"
export LLM_PROVIDER="openai"

# Optional
export PORT=8085
export RUST_LOG=info
```

### 3. Build and Run

```bash
# Build
cargo build --release

# Run
cargo run --release -p server

# Verify
curl http://localhost:8085/health
```

## API Examples

**Health Check:**
```bash
curl http://localhost:8085/health
```

**List Voices:**
```bash
curl http://localhost:8085/voices
```

**Synthesize Speech:**
```bash
curl -X POST http://localhost:8085/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "language": "de_DE"}'
```

**Chat:**
```bash
curl -X POST http://localhost:8085/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "conversation_id": null}'
```

## Troubleshooting

**Build errors:**
```bash
cargo clean && cargo build --release
```

**Missing models:**
```bash
python3 scripts/check_models.py
ls -la models/de_DE/
```

**Port in use:**
```bash
export PORT=8086
# or
lsof -i:8085 && kill -9 <PID>
```

**LLM errors:**
```bash
echo $OPENAI_API_KEY  # Verify key is set
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"
```

See [README.md](README.md) for full API documentation.

