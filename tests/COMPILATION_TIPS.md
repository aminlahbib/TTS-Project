# Compilation Tips

## Handling Timeout Errors

If you encounter timeout errors during compilation:

```
error: failed to write .../invoked.timestamp
Caused by: Operation timed out (os error 60)
```

This usually happens when:
- Too many parallel compilation jobs
- Disk I/O bottlenecks
- File system issues
- System resource constraints

## Solutions

### 1. Reduce Parallel Jobs

Limit the number of parallel compilation jobs:

```bash
# Use 2 jobs instead of default (usually number of CPU cores)
cargo test --workspace --lib -j 2

# Or set via environment variable
export CARGO_BUILD_JOBS=2
cargo test --workspace --lib
```

### 2. Clean and Rebuild

Clean the build directory first:

```bash
cargo clean
cargo test --workspace --lib -j 2
```

### 3. Test One Package at a Time

Instead of testing the whole workspace, test packages individually:

```bash
# Test each package separately
cargo test --package tts_core --lib
cargo test --package llm_core --lib
cargo test --package server --lib
```

### 4. Check Disk Space

Ensure you have enough disk space:

```bash
# On macOS/Linux
df -h

# Clean up if needed
cargo clean
```

### 5. Use Release Mode (Faster Compilation)

Release mode can sometimes be faster for testing:

```bash
cargo test --workspace --lib --release -j 2
```

### 6. Skip Integration Tests

If you only need unit tests:

```bash
cargo test --workspace --lib --tests
```

### 7. Check System Resources

Monitor system resources during compilation:

```bash
# On macOS
top

# Check disk I/O
iostat -w 1
```

## Recommended Approach

For the first build, use fewer parallel jobs:

```bash
# Clean first
cargo clean

# Build with limited parallelism
CARGO_BUILD_JOBS=2 cargo test --workspace --lib

# Once successful, you can use more jobs
CARGO_BUILD_JOBS=4 cargo test --workspace --lib
```

## Alternative: Test Individual Packages

If workspace tests keep timing out, test packages individually:

```bash
# Test TTS core
cd tts_core
cargo test --lib

# Test LLM core
cd ../llm_core
cargo test --lib

# Test server
cd ../server
cargo test --lib
```

## Environment Variables

You can set these in your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
# Limit parallel jobs globally
export CARGO_BUILD_JOBS=2

# Or set per-session
CARGO_BUILD_JOBS=2 cargo test --workspace --lib
```

