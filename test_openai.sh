#!/bin/bash
# Test script to verify OpenAI configuration

echo "=== Testing OpenAI Configuration ==="
echo ""

# Check if .env file exists and has OPENAI_API_KEY
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

if ! grep -q "OPENAI_API_KEY" .env; then
    echo "❌ OPENAI_API_KEY not found in .env file"
    exit 1
fi

echo "✅ .env file found with OPENAI_API_KEY"
echo ""

# Check current LLM_PROVIDER setting
CURRENT_PROVIDER=$(grep "LLM_PROVIDER" .env 2>/dev/null | cut -d '=' -f2 || echo "ollama")
echo "Current LLM_PROVIDER in .env: ${CURRENT_PROVIDER:-ollama (default)}"
echo ""

# Instructions
echo "=== To Switch to OpenAI ==="
echo ""
echo "1. Set LLM_PROVIDER in .env file:"
echo "   echo 'LLM_PROVIDER=openai' >> .env"
echo ""
echo "2. Or set it when starting:"
echo "   LLM_PROVIDER=openai docker-compose up -d tts-server"
echo ""
echo "3. Restart the server:"
echo "   docker-compose restart tts-server"
echo ""
echo "4. Test OpenAI:"
echo "   curl -X POST http://localhost:8085/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"Hello\"}'"
echo ""

