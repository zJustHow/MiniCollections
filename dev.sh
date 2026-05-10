#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[dev]${NC} $*"; }
warn() { echo -e "${YELLOW}[dev]${NC} $*"; }

cleanup() {
  warn "Shutting down..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  docker compose -f "$ROOT/docker-compose.yml" stop
  exit 0
}
trap cleanup INT TERM

# 1. Start infrastructure
log "Starting Docker services (postgres / elasticsearch / minio)..."
docker compose -f "$ROOT/docker-compose.yml" up -d

# 2. Start backend
log "Starting Spring Boot backend..."
cd "$BACKEND"
./gradlew bootRun --console=plain > "$ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
log "Backend PID: $BACKEND_PID  (logs → backend.log)"

# 3. Start frontend
log "Starting React frontend..."
cd "$FRONTEND"
npm start > "$ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
log "Frontend PID: $FRONTEND_PID  (logs → frontend.log)"

log "All services started. Press Ctrl+C to stop everything."
wait
