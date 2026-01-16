#!/usr/bin/env bash
set -euo pipefail

export TRACE_LOG_DIR="${TRACE_LOG_DIR:-/var/log/simcam-trace}"
export TRACE_MAX_SNIP="${TRACE_MAX_SNIP:-900}"

# Ensure every node process (npm scripts, next build, runtime) preloads tracer
export NODE_OPTIONS="--require /var/www/simcam/photo/trace-preload.js ${NODE_OPTIONS:-}"

echo "[run-traced] TRACE_LOG_DIR=$TRACE_LOG_DIR"
echo "[run-traced] NODE_OPTIONS=$NODE_OPTIONS"

exec "$@"
