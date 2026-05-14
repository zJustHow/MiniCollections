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

log "Waiting for Elasticsearch to be ready..."
ES_RETRIES=0
until curl -sf "http://localhost:9200/_cluster/health?wait_for_status=yellow&timeout=1s" > /dev/null 2>&1; do
  ES_RETRIES=$((ES_RETRIES + 1))
  if [ "$ES_RETRIES" -ge 30 ]; then
    echo -e "${RED}[dev]${NC} Elasticsearch did not become ready after 60s. Check docker logs." >&2
    exit 1
  fi
  sleep 2
done
log "Elasticsearch is ready."

# 2. Start backend
log "Starting Spring Boot backend..."
cd "$BACKEND"
if [ -f ".env" ]; then
  set -a; source .env; set +a
fi
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
