# TTS Project

A high-performance multilingual Text-to-Speech and Chat server built with Rust, featuring Piper TTS engine integration and OpenAI/Ollama LLM support.

## 🚀 Quick Start

**New to the project?** Start here: **[QUICKSTART.md](QUICKSTART.md)**

The quick start guide will walk you through:
- Prerequisites and installation
- Model setup
- Environment configuration
- Building and running the server
- Testing the API

## 📦 Project Structure

This repository contains a Rust workspace with three crates:

- **tts_core** – Wraps Piper TTS models and provides functions for synthesizing speech and computing mel spectrograms.
- **llm_core** – LLM client supporting OpenAI and Ollama, with optional Qdrant integration for conversation history.
- **server** – HTTP API server exposing endpoints for TTS synthesis and conversational chat.


# Multilingual Text‑to‑Speech & Chat Server (Rust)

This repo contains a Rust backend that synthesizes speech in multiple languages using the [Piper](https://github.com/rhasspy/piper) TTS engine and provides a simple chat endpoint powered by OpenAI.

## ✨ Features

- **TTS**: Synthesizes text into speech using Piper models.
- **Language selection**: You map language codes to model paths in `models/map.json`.
- **API**: REST endpoints (`/tts`, `/voices`) and a WebSocket endpoint for streaming audio and spectrogram frames.
- **Chat**: If `OPENAI_API_KEY` is set, `/chat` forwards messages to the OpenAI API and returns the model’s reply.

## 📦 Requirements

- Rust (install via [rustup.rs](https://rustup.rs))
- Git
- Piper voice model files (`*.onnx` + `*.onnx.json`) **downloaded separately**. These are large (~70 MB) so they are not stored in this repo. Download the voices you need from the Piper repository and place them under `models/<lang_code>/`.
