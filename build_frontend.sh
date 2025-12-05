#!/bin/bash
echo "Building Frontend..."
# Default to the Railway URL if not set in Vercel Env Vars
API_URL="${TTS_API_URL:-https://tts-project-backend-production.up.railway.app}"

echo "Injecting API URL: $API_URL"
echo "window.TTS_API_URL = '$API_URL';" > frontend/js/env.js
echo "env.js created."
