# Test Troubleshooting Guide

## Common Issues and Solutions

### Issue 0: Comments in commands cause errors

**Error:**
```
error: could not find `#` in registry `crates-io`
error: could not find `Optional:` in registry `crates-io`
```

**Solution:**
When copying commands from the README, make sure to copy only the command line, not the comment. Comments should be on separate lines.

**Wrong:**
```bash
cargo install cargo-nextest  # Optional: faster test runner
```

**Correct:**
```bash
# Optional: faster test runner
cargo install cargo-nextest
```

### Issue 1: `tower-governor` package not found

**Error:**
```
error: no matching package found
searched package name: `tower-governor`
perhaps you meant:      tower_governor
```

**Solution:**
The package name in `Cargo.toml` should use underscores, not hyphens. This has been fixed in the codebase.

If you still see this error, check `server/Cargo.toml`:
```toml
tower_governor = { version = "0.8", features = ["axum"] }  # ✅ Correct
# NOT: tower-governor = ...  # ❌ Wrong
```

### Issue 2: `cargo-tarpaulin` command not found

**Error:**
```
error: no such command: `tarpaulin`
```

**Solution:**
Install `cargo-tarpaulin` first:
```bash
cargo install cargo-tarpaulin
```

Then you can run:
```bash
cargo tarpaulin --workspace --out Html
```

### Issue 3: Tests fail due to missing model files

**Error:**
```
TTS error: Failed to load model
```

**Solution:**
Some tests require model files to be present. Tests that don't require models will still run.

To run only tests that don't require models:
```bash
cargo test --workspace --lib  # Unit tests only
```

### Issue 4: LLM tests fail due to missing API key

**Error:**
```
LLM error: OPENAI_API_KEY must be set
```

**Solution:**
Set the API key for LLM tests:
```bash
export OPENAI_API_KEY="your-key-here"
cargo test --workspace
```

Or skip LLM tests:
```bash
cargo test --workspace -- --skip test_chat
```

### Issue 5: Integration tests fail

**Error:**
```
error: cannot find test `integration`
```

**Solution:**
Make sure you're running from the workspace root:
```bash
cd /path/to/tts_project
cargo test --test integration
```

### Issue 6: Compilation errors after dependency update

**Solution:**
Clean and rebuild:
```bash
cargo clean
cargo build --workspace
cargo test --workspace
```

## Quick Fix Checklist

- [ ] Package names use underscores (e.g., `tower_governor`, not `tower-governor`)
- [ ] All dependencies are up to date
- [ ] `cargo-tarpaulin` is installed (if using coverage)
- [ ] Model files are present (for TTS tests)
- [ ] API keys are set (for LLM tests)
- [ ] Running from workspace root

## Getting Help

If you encounter other issues:

1. Check the error message carefully
2. Verify all dependencies are installed
3. Try `cargo clean` and rebuild
4. Check the test logs with `--nocapture` flag
5. Review the test documentation in `tests/README.md`

