#!/bin/bash
# Quick test script for performance optimizations

set -e

echo "=== Testing Performance Optimizations ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "1. Checking if server is running..."
if curl -s http://localhost:8085/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Server is running"
else
    echo -e "${YELLOW}⚠${NC} Server is not running. Start it with: cargo run --release -p server"
    exit 1
fi

echo ""
echo "2. Testing basic endpoints..."

# Test health endpoint
echo -n "  - Health endpoint: "
if curl -s http://localhost:8085/health | grep -q "OK"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test voices endpoint (should be cached on second request)
echo -n "  - Voices endpoint: "
if curl -s http://localhost:8085/voices | jq -e '. | length' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test metrics endpoint
echo -n "  - Metrics endpoint: "
if curl -s http://localhost:8085/metrics | jq -e '.request_count' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test detailed metrics endpoint
echo -n "  - Detailed metrics endpoint: "
if curl -s http://localhost:8085/metrics/detailed | jq -e '.endpoints' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo "3. Testing concurrent requests (5 parallel requests)..."
START_TIME=$(date +%s%N)
for i in {1..5}; do
    curl -s http://localhost:8085/health > /dev/null &
done
wait
END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME) / 1000000))
echo -e "  Completed 5 requests in ${GREEN}${DURATION}ms${NC}"

echo ""
echo "4. Checking metrics data..."
METRICS=$(curl -s http://localhost:8085/metrics/detailed)
echo "  - Request count: $(echo $METRICS | jq -r '.system.request_count')"
echo "  - TTS requests: $(echo $METRICS | jq -r '.endpoints.tts.request_count')"
echo "  - Cache hit rate: $(echo $METRICS | jq -r '.tts.cache_hit_rate')%"

echo ""
echo -e "${GREEN}=== All tests completed ===${NC}"

