# Deployment Guide

This document covers the operational steps needed to run the TTS Project in staging or production environments.

## 1. Build Artifacts
- **Docker (preferred)**: `docker build -t tts-server .` and `docker build -t tts-frontend ./frontend`.
- **Versioning**: Tag Docker images with git SHA and push to your registry.
- **Model assets**: Store Piper models in object storage or bake them into the image; ensure the container’s user has read permissions.

## 2. Configuration
| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP + WebSocket port | `8085` |
| `PUBLIC_BASE_URL` | Used for generating absolute URLs in logs/clients | – |
| `LLM_PROVIDER` | `openai` or `ollama` | `openai` |
| `LLM_MODEL` | Model to request from provider | `gpt-3.5-turbo` |
| `OPENAI_API_KEY` | Required for OpenAI | – |
| `OLLAMA_BASE_URL` | Ollama host (if local inference) | `http://localhost:11434` |
| `RATE_LIMIT_PER_MINUTE` | Global request budget | `60` |
| `REQUEST_TIMEOUT_SECS` | Actix request timeout | `60` |
| `PIPER_ESPEAKNG_DATA_DIRECTORY` | Location of eSpeak-ng data | `/usr/share` |
| `QDRANT_URL` / `QDRANT_API_KEY` | Conversation storage (optional) | – |

Store secrets in your orchestrator’s secret manager (Kubernetes Secrets, AWS SSM, etc.). Do not commit `.env` files.

## 3. Infrastructure Layouts
### Single VM / Docker Host
- Run server + frontend containers on the same host.
- Mount `models/` read-only to the server container.
- Use `nginx` or `caddy` for TLS termination and static asset caching.

### Kubernetes
- Create deployments for `tts-server` and (optionally) `tts-frontend`.
- Mount Piper models via `PersistentVolume` or image layer.
- Configure readiness probes on `/healthz` and liveness on `/health`.
- Use HorizontalPodAutoscaler based on CPU or custom Prometheus metrics (`requests_in_flight`).

### Hybrid (LLM local, TTS remote)
- Deploy `tts-server` close to Piper models.
- Point `LLM_PROVIDER=ollama` with `OLLAMA_BASE_URL` referencing a GPU-enabled node.
- Keep voice streaming on the same node to avoid cross-region audio latency.

## 4. Observability
- **Logs**: Consume structured logs via Loki / ELK; set `RUST_LOG=info` (or `debug`) as needed.
- **Metrics**: Scrape `/metrics` with Prometheus; export dashboards for request rate, latency, cache hits, and synthesis duration.
- **Tracing**: Enable OpenTelemetry exporters if your stack supports them (add env vars and feature flags accordingly).

## 5. Security & Hardening
- Enforce HTTPS and configure CORS to allow only trusted origins.
- Rotate API keys regularly; add IAM roles for model buckets.
- Run containers as non-root; drop capabilities not needed by ONNX runtime.
- Consider WAF or API Gateway rate limiting to complement in-app throttles.

## 6. Scaling Tips
- Piper synthesis is CPU-bound; allocate dedicated CPU cores or pin threads.
- For streaming workloads, favor fewer, larger instances to minimize context switches.
- Cache warm voices at startup by calling `/voices/detail` or a custom warm-up script.
- Use CDN for frontend assets to keep the API nodes focused on compute.

## 7. Release Process Checklist
1. `cargo fmt && cargo clippy && cargo test`
2. `tests/run_tests.sh` or equivalent CI pipeline
3. Update `models/map.json` hashes if models changed
4. Build and push Docker images
5. Deploy to staging, run smoke tests (`/health`, `/tts`, `/chat`)
6. Promote to production via blue/green or rolling update

## 8. Incident Response
- Keep dashboards for synthesis latency, error ratios, CPU load.
- If locks are poisoned or Piper fails to load, restart the pod/instance (the app logs detailed errors).
- Store recent audio/text samples for debugging but purge PII per policy.

With these practices, the TTS Project can move from local demos to reliable production workloads.

