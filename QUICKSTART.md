# Quick Start Guide

Get the TTS project up and running in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Rust** (1.70+): Install from [rustup.rs](https://rustup.rs)
- **Git**: For cloning the repository
- **Python 3.8+** (optional): For model download scripts

Verify your installation:

```bash
rustc --version  # Should be 1.70 or higher
cargo --version  # Should be included with Rust
git --version
```

## Step 1: Clean Start

If you're starting fresh or want to ensure a clean build:

```bash
# Navigate to project directory
cd /path/to/tts_project

# Clean any previous builds
cargo clean

# Remove any old artifacts
rm -rf target/
```

## Step 2: Verify Project Structure

Ensure your project has the following structure:

```
tts_project/
├── Cargo.toml              # Workspace configuration
├── models/
│   ├── map.json            # Language-to-model mapping
│   └── <lang_code>/       # Model directories (e.g., de_DE/, fr_FR/)
│       ├── *.onnx         # Model file
│       └── *.onnx.json    # Model configuration
├── tts_core/               # TTS core crate
├── llm_core/               # LLM core crate
└── server/                 # Server crate
```

## Step 3: Download TTS Models

TTS models are not included in the repository due to their size (~70MB each).

### Option A: Manual Download

1. Visit the [Piper TTS repository](https://github.com/rhasspy/piper/releases)
2. Download the models you need (e.g., `de_DE-mls-medium.onnx` and `de_DE-mls-medium.onnx.json`)
3. Create the directory structure:
   ```bash
   mkdir -p models/de_DE
   mkdir -p models/fr_FR
   ```
4. Place the downloaded files in their respective directories:
   ```
   models/de_DE/
   ├── de_DE-mls-medium.onnx
   └── de_DE-mls-medium.onnx.json
   ```

### Option B: Using Download Script

```bash
# Run the download script (if available)
python3 scripts/download_voices.py

# Or use the check script to verify models
python3 scripts/check_models.py
```

### Verify Models

Check that `models/map.json` contains valid entries:

```bash
cat models/map.json
```

Example content:
```json
{
  "de_DE": ["models/de_DE/de_DE-mls-medium.onnx.json", null],
  "fr_FR": ["models/fr_FR/fr_FR-siwis-medium.onnx.json", null]
}
```

## Step 4: Configure Environment Variables

### Option A: Using .env File (Recommended)

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Required for OpenAI chat
OPENAI_API_KEY=your_openai_api_key_here
LLM_PROVIDER=openai
LLM_MODEL=gpt-3.5-turbo

# Optional: Server settings
PORT=8080
RATE_LIMIT_PER_MINUTE=60
RUST_LOG=info
```

**Note:** The `.env` file is gitignored and won't be committed to the repository.

### Option B: Environment Variables

Set environment variables in your shell:

```bash
export OPENAI_API_KEY="your_key_here"
export LLM_PROVIDER="openai"
export LLM_MODEL="gpt-3.5-turbo"
export PORT=8080
```

### Configuration Options

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes (for OpenAI) | - | Your OpenAI API key |
| `LLM_PROVIDER` | No | `openai` | `openai` or `ollama` |
| `LLM_MODEL` | No | `gpt-3.5-turbo` | Model name |
| `PORT` | No | `8080` | Server port |
| `RATE_LIMIT_PER_MINUTE` | No | `60` | Rate limit per minute |
| `QDRANT_URL` | No | - | Qdrant server URL (optional) |
| `QDRANT_API_KEY` | No | - | Qdrant API key (optional) |
| `RUST_LOG` | No | `info` | Log level: `error`, `warn`, `info`, `debug`, `trace` |

## Step 5: Build the Project

Build all workspace crates:

```bash
# Build in release mode (recommended for production)
cargo build --release

# Or build in debug mode (faster compilation, for development)
cargo build
```

**⏱️ First build may take 5-10 minutes** as it compiles all dependencies.

### Troubleshooting Build Issues

If you encounter timeout errors during compilation:

```bash
# Clean and rebuild with limited parallelism
cargo clean
CARGO_BUILD_JOBS=2 cargo build --release
```

If you encounter memory issues:

```bash
# Build one package at a time
cargo build --package tts_core --release
cargo build --package llm_core --release
cargo build --package server --release
```

## Step 6: Verify Installation

Run a quick check to ensure everything compiles:

```bash
# Check all crates compile
cargo check --workspace
```

Expected output:
```
Finished `dev` profile [unoptimized + debuginfo] target(s)
```

### Run Tests (Optional)

Verify everything works with unit tests:

```bash
# Run unit tests
cargo test --package server --lib
```

Expected output:
```
running 9 tests
test result: ok. 9 passed; 0 failed; 0 ignored
```

## Step 7: Start the Server

### Development Mode

```bash
# Start the server (debug mode)
cargo run -p server

# Or with explicit logging
RUST_LOG=info cargo run -p server
```

### Production Mode

```bash
# Start the server (release mode - faster, optimized)
cargo run --release -p server
```

The server will start on `http://localhost:8080` by default (or the port specified in `PORT` environment variable).

### Verify Server is Running

Open a new terminal and test the health endpoint:

```bash
# Health check
curl http://localhost:8080/health
```

Expected response: `ok`

If the server is running, you should see:
```
✅ Server is running and healthy
```

## Step 8: Test the API

### 1. Health Check

```bash
curl http://localhost:8080/health
```

### 2. List Available Voices

```bash
curl http://localhost:8080/voices
```

Expected response:
```json
["de_DE", "fr_FR"]
```

### 3. Synthesize Speech

```bash
curl -X POST http://localhost:8080/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "language": "de_DE"
  }' \
  --output output.wav
```

This will create a `output.wav` file with the synthesized speech.

### 4. Chat Endpoint (if LLM is configured)

```bash
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "conversation_id": null
  }'
```

Expected response:
```json
{
  "response": "Hello! I'm doing well, thank you for asking...",
  "conversation_id": "uuid-here"
}
```

### 5. WebSocket Streaming (Advanced)

For streaming audio and spectrograms, use the WebSocket endpoint:

```bash
# Connect to WebSocket
wscat -c ws://localhost:8080/stream/de_DE/Hello%20world
```

## Troubleshooting

### Build Errors

If you encounter compilation errors:

```bash
# Clean and rebuild
cargo clean
cargo build --release
```

### Missing Models

If you get "model not found" errors:

1. Verify models exist: `ls -la models/de_DE/`
2. Check `models/map.json` has correct paths
3. Ensure paths are relative to project root

### Port Already in Use

If port 8080 is already in use:

```bash
# Set a different port
export PORT=8081
cargo run -p server
```

### LLM Errors

If chat endpoint fails:

1. Verify API key is set: `echo $OPENAI_API_KEY`
2. Check provider setting: `echo $LLM_PROVIDER`
3. For Ollama, ensure it's running: `curl http://localhost:11434/api/tags`

### Qdrant Connection Errors

If using Qdrant for conversation history:

1. Ensure Qdrant is running: `curl http://localhost:6333/health`
2. Check `QDRANT_URL` environment variable
3. Qdrant is optional - the server works without it

## Next Steps

- **Frontend**: See `frontend/FRONTEND_GUIDE.md` for frontend setup
- **Testing**: See `tests/README.md` for running tests
- **API Documentation**: Check `README.md` for full API details
- **Troubleshooting**: See `tests/TROUBLESHOOTING.md` for common issues

## Quick Reference

```bash
# Clean start
cargo clean && cargo build --release

# Run server
cargo run -p server

# Run tests
cargo test --workspace

# Check models
python3 scripts/check_models.py

# Health check
curl http://localhost:8080/health
```

---

**Need Help?** Check the troubleshooting section or review the detailed documentation in `README.md` and `tests/TROUBLESHOOTING.md`.

