#!/bin/bash
# Script to optimize LLM performance based on metrics

echo "=== LLM Performance Optimization ==="
echo ""

# Get current metrics
echo "Current Metrics:"
curl -s http://localhost:8085/metrics | jq '{
  cpu: .cpu_usage_percent,
  memory_percent: .memory_usage_percent,
  memory_mb: .memory_used_mb,
  requests: .request_count
}'

echo ""
echo "Docker Container Stats:"
docker stats --no-stream ollama tts_project-tts-server-1 --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "Ollama Model Status:"
docker exec ollama ollama ps

echo ""
echo "=== Recommendations ==="
echo "1. Consider using a smaller model (llama3:8b-instruct-q4_K_M or llama3.2:3b)"
echo "2. Reduce context window further (2048 or 1024)"
echo "3. Reduce num_predict to 256 for faster responses"
echo "4. Enable model unloading when idle"
echo "5. Use more aggressive quantization"

