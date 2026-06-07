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

log "Uploading seed brand logos to MinIO..."
if ! "$ROOT/scripts/upload-brand-logos.sh"; then
  warn "Brand logo upload failed (see message above). Logos may 404 until you run scripts/upload-brand-logos.sh"
fi
# FrontiArt product images (like other brands): upload once when MinIO is empty:
#   python3 scripts/import-frontiart-products.py --upload-only

# 2. Start backend
log "Starting Spring Boot backend..."
cd "$BACKEND"
if [ -f ".env" ]; then
  set -a; source .env; set +a
fi
# Keep media URLs consistent with seed SQL and MinIO on localhost:9000 (override in backend/.env if needed).
export S3_ENDPOINT="${S3_ENDPOINT:-http://localhost:9000}"
export S3_BUCKET="${S3_BUCKET:-minicollections-media}"
export S3_PUBLIC_BASE_URL="${S3_PUBLIC_BASE_URL:-http://localhost:9000/minicollections-media}"
export S3_ACCESS_KEY="${S3_ACCESS_KEY:-minioadmin}"
export S3_SECRET_KEY="${S3_SECRET_KEY:-minioadmin}"
export S3_ENABLED="${S3_ENABLED:-true}"
log "S3_PUBLIC_BASE_URL=$S3_PUBLIC_BASE_URL"
# LetsVPN (and similar tools) often leave 127.0.0.1:17891 in macOS proxy settings while the
# local proxy is stopped, which makes Gradle fail to reach Maven Central.
if nc -z 127.0.0.1 17891 2>/dev/null; then
  : # local proxy is listening; keep system proxy settings
else
  export GRADLE_OPTS="${GRADLE_OPTS} -Djava.net.useSystemProxies=false"
fi
./gradlew --stop > /dev/null 2>&1 || true
# Refresh resources so new seed/*.sql dirs are on the classpath (Gradle can skip unchanged outputs).
./gradlew cleanProcessResources processResources bootRun --console=plain > "$ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
log "Backend PID: $BACKEND_PID  (logs → backend.log)"

log "Waiting for backend to be ready..."
BACKEND_RETRIES=0
until curl -sf "http://localhost:8080/brands" > /dev/null 2>&1; do
  BACKEND_RETRIES=$((BACKEND_RETRIES + 1))
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${RED}[dev]${NC} Backend process exited. Check backend.log." >&2
    exit 1
  fi
  if [ "$BACKEND_RETRIES" -ge 90 ]; then
    echo -e "${RED}[dev]${NC} Backend did not become ready after 180s. Check backend.log." >&2
    exit 1
  fi
  sleep 2
done
log "Backend is ready."

# 3. Start frontend
log "Starting Vite frontend..."
cd "$FRONTEND"
npm start > "$ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!
log "Frontend PID: $FRONTEND_PID  (logs → frontend.log)"

log "All services started. Press Ctrl+C to stop everything."
wait
