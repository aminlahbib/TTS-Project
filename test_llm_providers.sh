#!/bin/bash
# Test script for both LLM providers

echo "=== Testing LLM Providers ==="
echo ""

# Test 1: Check Ollama (current setup)
echo "1. Testing Ollama (current setup)..."
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

# Test 2: Check if OpenAI would work (requires API key)
echo "2. Testing OpenAI configuration..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set - cannot test OpenAI"
    echo "   To test OpenAI, set OPENAI_API_KEY and restart server with LLM_PROVIDER=openai"
else
    echo "✅ OPENAI_API_KEY is set"
    echo "   Note: Server must be restarted with LLM_PROVIDER=openai to use OpenAI"
fi
echo ""

# Test 3: Check server configuration
echo "3. Checking server configuration..."
docker-compose exec -T tts-server env | grep -E "LLM_PROVIDER|LLM_MODEL|OLLAMA_BASE_URL|OPENAI" || echo "Could not check server env"
echo ""

echo "=== Summary ==="
echo "Current setup: LLM_PROVIDER=ollama (from docker-compose.yml)"
echo "To switch to OpenAI:"
echo "  1. Set OPENAI_API_KEY in docker-compose.yml or .env"
echo "  2. Change LLM_PROVIDER=openai in docker-compose.yml"
echo "  3. Restart: docker-compose up -d tts-server"

