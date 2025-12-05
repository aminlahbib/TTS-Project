# 🎙️ Rust AI TTS System

[![Backend](https://img.shields.io/badge/Backend-Rust%20%7C%20Axum-orange?style=flat-square&logo=rust)](https://github.com/aminlahbib/tts-project)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%7C%20Vercel-black?style=flat-square&logo=vercel)](https://tts-project-gnjnbmoh9-amine-lahbibs-projects.vercel.app)
[![Docker](https://img.shields.io/badge/Deploy-Docker%20%7C%20Railway-blue?style=flat-square&logo=docker)](https://hub.docker.com/r/aminlahbib/tts-project-backend)

A high-performance, real-time Text-to-Speech and AI Chat application built with a **Rust** backend and a **Vanilla JS** frontend. featuring Voice Activity Detection (VAD), WebSocket streaming, and a hybrid deployment architecture.

🔗 **Live Demo**: [https://tts-project-gnjnbmoh9-amine-lahbibs-projects.vercel.app](https://tts-project-gnjnbmoh9-amine-lahbibs-projects.vercel.app)

---

## 🏗️ Architecture

This project uses a **Hybrid Deployment Strategy** to optimize for cost and performance:

```mermaid
graph LR
    User[Clients] --> |HTTPS/WSS| Vercel[Frontend (Vercel)]
    Vercel --> |API Calls| Railway[Backend (Railway)]
    Railway --> |Docker| Container[Rust App + Models]
```

*   **Frontend**: Hosted on **Vercel** as a static SPA. Injects backend URL at runtime via `env.js`.
*   **Backend**: Hosted on **Railway** via a custom **Docker Image** (Cross-compiled for AMD64) to handle large AI models (~1.5GB).

## ✨ Key Features

*   **🚀 High-Performance Backend**: Built with Rust & Axum for sub-millisecond latency.
*   **🗣️ Real-time TTS**: Low-latency text-to-speech generation.
*   **🤖 AI Chat**: Integrated LLM support with streaming responses.
*   **🎙️ Smart Voice Mode**:
    *   **VAD (Voice Activity Detection)**: Automatically detects speech to trigger processing.
    *   **WebSocket Streaming**: Bi-directional audio streaming.
*   **📊 Observability**: Built-in metrics endpoint (`/metrics`) and health checks.
*   **🐳 Dockerized**: Fully containerized environment with baked-in models for consistent deployment.

## 🛠️ Tech Stack

### Backend
*   **Language**: Rust 🦀
*   **Framework**: Axum
*   **Runtime**: Tokio (Async)
*   **Container**: Docker (Multi-stage build, Debian Slim)

### Frontend
*   **Core**: HTML5, CSS3, ES6+ JavaScript
*   **Audio**: Web Audio API (Visualization, VAD)
*   **Ops**: Shell Scripting for Environment Injection

## 🚀 Deployment

### Backend (Railway)
Since the models are large, we use a **Docker Hub** workflow:
1.  **Build**: `docker build --platform linux/amd64 -t user/repo:tag .`
2.  **Push**: `docker push user/repo:tag`
3.  **Deploy**: Railway pulls and runs the image.

### Frontend (Vercel)
Auto-deploys from the `deployment` branch.
*   **Config**: `vercel.json` and `build_frontend.sh` handle dynamic environment variables (`TTS_API_URL`).

## 👨‍💻 Local Development

1.  **Start Backend**:
    ```bash
    cargo run --release
    ```
2.  **Start Frontend**:
    ```bash
    cd frontend && python3 -m http.server 5500
    ```

## 📄 License
MIT
