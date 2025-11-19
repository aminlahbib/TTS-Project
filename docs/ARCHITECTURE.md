# System Architecture

## Overview
The TTS Project is a Rust workspace composed of three primary crates (`server`, `tts_core`, `llm_core`) plus a static frontend. Everything is optimized for low-latency multilingual speech generation and LLM-backed chat flows, with Docker images making orchestration straightforward.

```
Client -> HTTP/WebSocket Gateway (server) -> TTS Core (Piper) / LLM Core (OpenAI|Ollama) -> Storage (optional Qdrant)
```

## Components
- **server**  
  - Actix-based HTTP + WebSocket gateway  
  - REST endpoints for TTS, chat, voice-chat, health, metrics  
  - WebSocket streaming for progressive audio + LLM tokens  
  - Rate limiting, validation, structured tracing, Prometheus metrics

- **tts_core**  
  - Piper ONNX runtime bindings (via `piper-rs` and `ort`)  
  - Voice + language registry loaded from `models/map.json`  
  - Mel spectrogram utilities and WAV encoding helpers  
  - Thread-safe synthesizer cache to avoid model reloads

- **llm_core**  
  - Abstraction over OpenAI (remote) and Ollama (local) providers  
  - Conversation/session structs with optional Qdrant history persistence  
  - Token streaming helpers and text-normalization for speech readiness

- **frontend**  
  - Static HTML/CSS/JS tabs (chat, TTS, streaming, metrics)  
  - Uses the same public API as external clients; perfect for manual QA

## Data Flows
### Text-to-Speech
1. Client submits text, language, and voice ID to `/tts` or `/stream/{lang}/{text}`.
2. `server` validates inputs, resolves the voice via `tts_core`.
3. `tts_core` loads/caches Piper model then synthesizes audio frames.
4. Response returned as base64 WAV (REST) or incremental audio chunks + mel data (WebSocket).

### Chat + Voice Chat
1. Client hits `/chat` or `/voice-chat` with message and (optional) conversation id.
2. `server` forwards request to `llm_core`, which selects provider/model and sends prompts.
3. Text response streams back; for voice-chat the text is piped through `tts_core` for synthesis.
4. Responses include timing metadata for observability.

### Metrics & Observability
- `/metrics` exposes Prometheus counters/gauges (requests, latency, CPU/memory snapshots).
- Structured logs with spans for each request; integrates with `RUST_LOG`.
- Optional Qdrant persistence adds vector IDs and latency metrics for storage.

## Deployment Topology
- **Single Node (default)**: Docker Compose runs server + frontend containers; models mounted as volumes.
- **Scaled API**: Server container replicated behind a load balancer; Piper models stored on shared volume or baked into container.
- **Edge Streaming**: WebSocket endpoints terminate at the server; consider sticky sessions when multiple replicas run streaming workloads.

## Key Design Decisions
- **Rust workspace** ensures shared dependencies (notably `ort`) stay pinned, preventing runtime ABI issues.
- **Explicit model map** keeps voice metadata version-controlled and auditable.
- **Streaming-first** design avoids blocking clients while long synth/LLM operations complete.
- **Docs + scripts** (see `scripts/` and `tests/`) promote reproducibility across environments.

