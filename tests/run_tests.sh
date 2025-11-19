#!/usr/bin/env bash
# Unified test runner for the TTS Project.
# Usage examples:
#   ./tests/run_tests.sh            # run unit + integration + e2e
#   ./tests/run_tests.sh unit e2e   # run a subset
#   ./tests/run_tests.sh --help

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}\n🧪 TTS Project Test Runner${NC}"
    echo "============================"
}

print_usage() {
    cat <<'EOF'
Usage: ./tests/run_tests.sh [unit] [integration] [e2e]

Without arguments the script runs every suite (unit + integration + e2e).
Pass one or more suite names to run a subset.

Suites:
  unit         cargo test --package tts_core --package llm_core --package server --lib
  integration  cargo test --package server --test integration
  e2e          cargo test --package server --test e2e
EOF
}

ensure_tooling() {
    if ! command -v cargo >/dev/null 2>&1; then
        echo -e "${RED}❌ Cargo not found. Install Rust before running tests.${NC}"
        exit 1
    fi
}

run_unit() {
    echo -e "${YELLOW}📦 Running unit tests...${NC}"
    cargo test --package tts_core --package llm_core --package server --lib
    echo -e "${GREEN}✅ Unit tests passed${NC}"
}

run_integration() {
    echo -e "${YELLOW}🔗 Running integration tests...${NC}"
    cargo test --package server --test integration
    echo -e "${GREEN}✅ Integration tests passed${NC}"
}

run_e2e() {
    echo -e "${YELLOW}🎯 Running end-to-end tests...${NC}"
    cargo test --package server --test e2e
    echo -e "${GREEN}✅ End-to-end tests passed${NC}"
}

main() {
    if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
        print_usage
        exit 0
    fi

    print_header
    ensure_tooling

    local suites=("$@")
    if [[ ${#suites[@]} -eq 0 ]]; then
        suites=("unit" "integration" "e2e")
    fi

    for suite in "${suites[@]}"; do
        case "$suite" in
            unit) run_unit ;;
            integration) run_integration ;;
            e2e) run_e2e ;;
            *)
                echo -e "${RED}Unknown suite: ${suite}${NC}"
                print_usage
                exit 1
                ;;
        esac
    done

    echo -e "${GREEN}\n🎉 Selected test suites completed successfully!${NC}"
}

main "$@"

