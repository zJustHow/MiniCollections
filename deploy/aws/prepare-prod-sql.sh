#!/usr/bin/env bash
# Generate production SQL with S3 URLs (does not modify dev seed files).
set -euo pipefail

OLD_PREFIX="${OLD_PREFIX:-http://localhost:9000/minicollections-media}"
NEW_PREFIX="${NEW_PREFIX:-https://minicollections-media-717373613148.s3.us-west-2.amazonaws.com}"
OUT_DIR="${OUT_DIR:-/tmp/minicollections-prod-sql}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
RES="$ROOT/backend/src/main/resources"

mkdir -p "$OUT_DIR/seed"

escape_sed() {
  printf '%s' "$1" | sed 's/[\/&]/\\&/g'
}

OLD_ESCAPED="$(escape_sed "$OLD_PREFIX")"
NEW_ESCAPED="$(escape_sed "$NEW_PREFIX")"

replace_urls() {
  sed "s|$OLD_ESCAPED|$NEW_ESCAPED|g" "$1"
}

echo "Writing production SQL to $OUT_DIR"
echo "  $OLD_PREFIX"
echo "  -> $NEW_PREFIX"
echo

replace_urls "$RES/database-init.sql" > "$OUT_DIR/database-init.sql"

while IFS= read -r -d '' file; do
  rel="${file#"$RES/seed/"}"
  out="$OUT_DIR/seed/$rel"
  mkdir -p "$(dirname "$out")"
  replace_urls "$file" > "$out"
done < <(find "$RES/seed" -name '*.sql' -print0)

echo "Done."
echo "Import example:"
echo "  psql -h YOUR_RDS_ENDPOINT -U postgres -d minicollections -f $OUT_DIR/database-init.sql"
