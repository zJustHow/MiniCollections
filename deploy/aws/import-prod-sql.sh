#!/usr/bin/env bash
# Import production SQL (S3 URLs) into RDS in the same order as local dev.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQL_DIR="${SQL_DIR:-/tmp/minicollections-prod-sql}"

if [[ ! -f "$SQL_DIR/database-init.sql" ]]; then
  echo "Missing $SQL_DIR/database-init.sql — run ./deploy/aws/prepare-prod-sql.sh first"
  exit 1
fi

: "${RDS_HOST:?Set RDS_HOST to your RDS endpoint, e.g. minicollections-db.xxxx.us-west-2.rds.amazonaws.com}"
: "${RDS_PASSWORD:?Set RDS_PASSWORD to the postgres user password}"

export PGPASSWORD="$RDS_PASSWORD"
PSQL=(psql -h "$RDS_HOST" -U "${RDS_USER:-postgres}" -d "${RDS_DB:-minicollections}" -v ON_ERROR_STOP=1)

run_sql() {
  local file="$1"
  echo "==> $(basename "$file")"
  "${PSQL[@]}" -f "$file"
}

echo "Importing schema + base data..."
run_sql "$SQL_DIR/database-init.sql"

SEED_FILES=(
  seed/minigt/series.sql
  seed/minigt/brand-objects.sql
  seed/lcd/brand-objects.sql
  seed/autoart/brand-objects.sql
  seed/tomica-limited-vintage/brand-objects.sql
  seed/kyosho/brand-objects.sql
  seed/minichamps/series.sql
  seed/minichamps/brand-objects.sql
  seed/inno-models/brand-objects.sql
  seed/xcartoys/brand-objects.sql
  seed/ignition-model/brand-objects.sql
  seed/kengfai/brand-objects.sql
  seed/kj-miniatures/brand-objects.sql
  seed/motorhelix/series.sql
  seed/motorhelix/brand-objects.sql
  seed/tarmac-works/brand-objects.sql
  seed/modelcollect/brand-objects.sql
  seed/private-goods-model/brand-objects.sql
  seed/werk83/brand-objects.sql
  seed/kiloworks/brand-objects.sql
  seed/topart-collection/brand-objects.sql
  seed/autoworld/series.sql
  seed/autoworld/brand-objects.sql
  seed/polar-master/brand-objects.sql
  seed/figart-model/brand-objects.sql
  seed/frontiart/brand-objects.sql
  seed/looksmart/brand-objects.sql
  seed/spark/brand-objects.sql
  seed/norev/brand-objects.sql
  seed/ixo-models/brand-objects.sql
  seed/tsm-model/series.sql
  seed/tsm-model/brand-objects.sql
  seed/bbr-models/brand-objects.sql
  seed/bburago/brand-objects.sql
  seed/hot-wheels/brand-objects.sql
  seed/welly/brand-objects.sql
  seed/mr-collection/brand-objects.sql
  seed/topspeed-model/series.sql
  seed/topspeed-model/brand-objects.sql
  seed/make-up/brand-objects.sql
  seed/greenlight/series.sql
  seed/greenlight/brand-objects.sql
  seed/exoto/brand-objects.sql
  seed/cmc/brand-objects.sql
  seed/amalgam/brand-objects.sql
  seed/almost-real/series.sql
  seed/almost-real/brand-objects.sql
  seed/gcd/series.sql
  seed/gcd/brand-objects.sql
  seed/tomica/series.sql
  seed/tomica/brand-objects.sql
  seed/micro-turbo/brand-objects.sql
  seed/tiny/series.sql
  seed/tiny/brand-objects.sql
  seed/matchbox/series.sql
  seed/matchbox/brand-objects.sql
  seed/hobby-japan/series.sql
  seed/hobby-japan/brand-objects.sql
  seed/time-micro/series.sql
  seed/time-micro/brand-objects.sql
  seed/pop-race/series.sql
  seed/pop-race/brand-objects.sql
  seed/maisto/series.sql
  seed/maisto/brand-objects.sql
  seed/rhino-models/brand-objects.sql
  seed/bmc/series.sql
  seed/bmc/brand-objects.sql
)

echo
echo "Importing seed data..."
for rel in "${SEED_FILES[@]}"; do
  file="$SQL_DIR/$rel"
  if [[ ! -f "$file" ]]; then
    echo "Skip missing $rel"
    continue
  fi
  run_sql "$file"
done

echo
echo "Done. Sample check:"
"${PSQL[@]}" -c "SELECT id, name_en, left(image_url, 80) FROM brands LIMIT 3;"
