#!/bin/bash
# Performance testing script for LLM optimization

set -e

API_BASE="http://localhost:8085"
RESULTS_DIR="performance_results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$RESULTS_DIR/metrics_$TIMESTAMP.json"

mkdir -p "$RESULTS_DIR"

echo "=== LLM Performance Test ==="
echo "Timestamp: $(date)"
echo ""

# Function to get Docker stats
get_docker_stats() {
    local container=$1
    docker stats --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}}" "$container" 2>/dev/null || echo "N/A,N/A,N/A"
}

# Function to test LLM endpoint
test_llm_endpoint() {
    local message="$1"
    local test_name="$2"
    
    echo "Testing: $test_name"
    echo "Message: $message"
    
    start_time=$(date +%s.%N)
    response=$(curl -s -X POST "$API_BASE/chat" \
        -H "Content-Type: application/json" \
        -d "{\"message\":\"$message\"}" \
        -w "\n%{http_code}\n%{time_total}")
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc)
    
    http_code=$(echo "$response" | tail -2 | head -1)
    time_total=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -2)
    
    reply_length=$(echo "$body" | jq -r '.reply' 2>/dev/null | wc -c || echo "0")
    
    echo "  HTTP Code: $http_code"
    echo "  Duration: ${duration}s"
    echo "  Reply Length: $reply_length chars"
    echo ""
    
    echo "{\"test\":\"$test_name\",\"http_code\":$http_code,\"duration\":$duration,\"time_total\":$time_total,\"reply_length\":$reply_length}" >> "$RESULTS_FILE.tmp"
}

# Get initial metrics
echo "=== Initial System State ==="
echo "Ollama Stats: $(get_docker_stats ollama)"
echo "TTS Server Stats: $(get_docker_stats tts_project-tts-server-1)"
echo ""

# Get baseline metrics from API
echo "=== Baseline Metrics ==="
baseline_metrics=$(curl -s "$API_BASE/metrics")
echo "$baseline_metrics" | jq '.' || echo "$baseline_metrics"
echo ""

# Start results file
echo "[" > "$RESULTS_FILE.tmp"

# Run test suite
echo "=== Running Test Suite ==="

# Test 1: Simple query
test_llm_endpoint "Hello, say hi in one word" "simple_query"

# Test 2: Medium query
test_llm_endpoint "Explain what is machine learning in 2 sentences" "medium_query"

# Test 3: Complex query
test_llm_endpoint "Write a short story about a robot learning to paint, in 3 paragraphs" "complex_query"

# Test 4: Repeated query (should hit cache)
test_llm_endpoint "Hello, say hi in one word" "cached_query"

# Test 5: Conversation context
conv_id=$(curl -s -X POST "$API_BASE/chat" \
    -H "Content-Type: application/json" \
    -d '{"message":"My name is Alice"}' | jq -r '.conversation_id')
test_llm_endpoint "What is my name?" "context_query"

# Close results array
echo "]" >> "$RESULTS_FILE.tmp"
# Fix JSON formatting
cat "$RESULTS_FILE.tmp" | jq -s 'flatten' > "$RESULTS_FILE"
rm "$RESULTS_FILE.tmp"

# Get final metrics
echo "=== Final System State ==="
echo "Ollama Stats: $(get_docker_stats ollama)"
echo "TTS Server Stats: $(get_docker_stats tts_project-tts-server-1)"
echo ""

# Get detailed metrics
echo "=== Detailed Metrics ==="
detailed_metrics=$(curl -s "$API_BASE/metrics/detailed")
echo "$detailed_metrics" | jq '.' || echo "$detailed_metrics"
echo "$detailed_metrics" > "$RESULTS_DIR/detailed_metrics_$TIMESTAMP.json"

# Get Ollama model info
echo "=== Ollama Model Info ==="
docker exec ollama ollama show llama3 2>&1 | head -20

echo ""
echo "=== Test Complete ==="
echo "Results saved to: $RESULTS_FILE"
echo "Detailed metrics: $RESULTS_DIR/detailed_metrics_$TIMESTAMP.json"

