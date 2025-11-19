#!/bin/bash
# Test script for Ollama LLM provider

echo "=== Testing Ollama LLM Provider ==="
echo ""

# Test 1: Check Ollama
echo "1. Testing Ollama..."
RESPONSE=$(curl -s -X POST http://localhost:8085/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Say hello in one word"}')

if echo "$RESPONSE" | jq -e '.reply' > /dev/null 2>&1; then
    REPLY=$(echo "$RESPONSE" | jq -r '.reply')
    echo "✅ Ollama is working"
    echo "   Response: $REPLY"
else
    echo "❌ Ollama test failed"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 2: Check server configuration
echo "2. Checking server configuration..."
docker-compose exec -T tts-server env | grep -E "LLM_MODEL|OLLAMA_BASE_URL|QDRANT_URL" || echo "Could not check server env"
echo ""

echo "=== Summary ==="
echo "Current setup: Using Ollama (local LLM)"
echo "Model: Set via LLM_MODEL environment variable (default: llama3)"

