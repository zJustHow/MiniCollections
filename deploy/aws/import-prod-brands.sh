#!/usr/bin/env bash
# Incrementally refresh seed catalog data on production RDS for specific brands.
# Safe for existing deployments: does NOT run database-init.sql (users/collections kept).
#
# See also: prepare-prod-sql.sh (generate all brands), import-prod-sql.sh (full reset — destructive).
#
# Usage:
#   export RDS_HOST=your-db.xxxx.region.rds.amazonaws.com
#   export RDS_PASSWORD=...
#   ./deploy/aws/import-prod-brands.sh maisto minigt autoworld
#   ./deploy/aws/import-prod-brands.sh --changed
#   ./deploy/aws/import-prod-brands.sh --last-commit
#   ./deploy/aws/import-prod-brands.sh --since HEAD~1
#   ./deploy/aws/import-prod-brands.sh --all
#   ./deploy/aws/import-prod-brands.sh --dry-run maisto
#
# Options:
#   --all           Import every brand under backend/src/main/resources/seed/
#   --changed       Import brands with seed/*.sql changes (uncommitted, or since CHANGE_BASE_REF)
#   --last-commit   Import brands touched in the latest commit
#   --since REF     Import brands changed since git ref (e.g. HEAD~1, v1.2.0)
#   --dry-run       Print actions without connecting to RDS
#   --skip-prepare  Use existing SQL in SQL_DIR (default: /tmp/minicollections-prod-sql)
#   --no-series     Skip series.sql delete/import (only refresh brand_objects)
#   --prepare-only  Generate prod SQL + brands.txt only (no RDS); for import-prod-brands-via-ecs.sh
#
# Environment:
#   deploy/aws/rds.env   Optional local file (copy from rds.env.example) — auto-loaded
#   RDS_HOST             RDS endpoint hostname (same as GitHub DATABASE_URL)
#   RDS_PASSWORD         Postgres password (same as Secrets Manager DATABASE_PASSWORD)
#   SQL_DIR         Default: /tmp/minicollections-prod-sql
#   OLD_PREFIX      Default: http://localhost:9000/minicollections-media
#   NEW_PREFIX      Default: https://minicollections-media-717373613148.s3.us-west-2.amazonaws.com
#   CHANGE_BASE_REF Default: origin/main (--changed compares commits since this ref)
#
# After import, rebuild Elasticsearch (one-time):
#   Set GitHub variable ELASTICSEARCH_REINDEX_ON_STARTUP=true and redeploy ECS,
#   or restart the service with that env var, then set it back to false.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SEED_DIR="$ROOT/backend/src/main/resources/seed"

SQL_DIR="${SQL_DIR:-/tmp/minicollections-prod-sql}"
OLD_PREFIX="${OLD_PREFIX:-http://localhost:9000/minicollections-media}"
NEW_PREFIX="${NEW_PREFIX:-https://minicollections-media-717373613148.s3.us-west-2.amazonaws.com}"
RDS_USER="${RDS_USER:-postgres}"
RDS_DB="${RDS_DB:-minicollections}"
CHANGE_BASE_REF="${CHANGE_BASE_REF:-origin/main}"

SEED_GIT_PATH="backend/src/main/resources/seed"

DRY_RUN=false
SKIP_PREPARE=false
IMPORT_SERIES=true
PREPARE_ONLY=false
ORIGINAL_ARGS=()
MODE=""
SINCE_REF=""

usage() {
  sed -n '2,38p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

log() { printf '==> %s\n' "$*"; }
warn() { printf 'warning: %s\n' "$*" >&2; }

load_rds_env() {
  local env_file="$SCRIPT_DIR/rds.env"
  if [[ -f "$env_file" ]]; then
    log "Loading $env_file"
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi

  RDS_HOST="${RDS_HOST:-${DATABASE_URL:-}}"
  RDS_PASSWORD="${RDS_PASSWORD:-${DATABASE_PASSWORD:-}}"
  RDS_USER="${RDS_USER:-${DATABASE_USERNAME:-postgres}}"
  RDS_DB="${RDS_DB:-minicollections}"
}

resolves_to_private_ip() {
  local host="$1"
  local ip=""
  ip="$(getent hosts "$host" 2>/dev/null | awk '{print $1; exit}')"
  if [[ -z "$ip" ]]; then
    return 1
  fi
  [[ "$ip" == 10.* || "$ip" == 172.1[6-9].* || "$ip" == 172.2[0-9].* || "$ip" == 172.3[0-1].* || "$ip" == 192.168.* ]]
}

require_rds_credentials() {
  if [[ -n "${RDS_HOST:-}" && -n "${RDS_PASSWORD:-}" ]]; then
    return 0
  fi

  cat >&2 <<EOF
Missing RDS connection settings.

Option 1 — create deploy/aws/rds.env (recommended):
  cp deploy/aws/rds.env.example deploy/aws/rds.env
  # set RDS_HOST and RDS_PASSWORD

  RDS_HOST     = RDS endpoint (AWS Console → RDS → Endpoint)
               same hostname as GitHub repo variable DATABASE_URL
  RDS_PASSWORD = postgres password (AWS Secrets Manager → DATABASE_PASSWORD)

Option 2 — export in shell:
  export RDS_HOST=your-db.xxxx.region.rds.amazonaws.com
  export RDS_PASSWORD=...

Note: backend/.env is for local Docker Postgres (localhost:5433), not production RDS.
EOF
  exit 1
}

escape_sed() {
  printf '%s' "$1" | sed 's/[\/&]/\\&/g'
}

replace_urls_to_file() {
  local src="$1"
  local dest="$2"
  local old_escaped new_escaped
  old_escaped="$(escape_sed "$OLD_PREFIX")"
  new_escaped="$(escape_sed "$NEW_PREFIX")"
  mkdir -p "$(dirname "$dest")"
  sed "s|$old_escaped|$new_escaped|g" "$src" > "$dest"
}

prepare_brand_sql() {
  local slug="$1"
  local src_dir="$SEED_DIR/$slug"
  local out_dir="$SQL_DIR/seed/$slug"

  if [[ ! -d "$src_dir" ]]; then
    echo "Unknown brand slug: $slug (expected $src_dir)" >&2
    exit 1
  fi

  mkdir -p "$out_dir"
  shopt -s nullglob
  local files=("$src_dir"/*.sql)
  shopt -u nullglob
  if [[ ${#files[@]} -eq 0 ]]; then
    echo "No SQL files for brand: $slug" >&2
    exit 1
  fi

  for file in "${files[@]}"; do
    replace_urls_to_file "$file" "$out_dir/$(basename "$file")"
  done
}

prepare_all_sql() {
  log "Preparing production SQL in $SQL_DIR"
  log "  $OLD_PREFIX -> $NEW_PREFIX"
  local slug
  for slug in $(list_brand_slugs); do
    prepare_brand_sql "$slug"
  done
}

list_brand_slugs() {
  find "$SEED_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort
}

resolve_brand_slug() {
  local input
  input="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"
  local slug normalized
  for slug in $(list_brand_slugs); do
    normalized="$(printf '%s' "$slug" | tr '[:upper:]' '[:lower:]')"
    if [[ "$normalized" == "$input" ]]; then
      printf '%s' "$slug"
      return 0
    fi
  done
  echo "Unknown brand slug: $1 (run with --list)" >&2
  exit 1
}

brand_id_from_sql() {
  local objects_file="$1"
  if [[ ! -f "$objects_file" ]]; then
    echo "Missing $objects_file" >&2
    exit 1
  fi

  local from_comment
  from_comment="$(grep -Eo 'brand_id=[0-9]+' "$objects_file" | head -1 | cut -d= -f2 || true)"
  if [[ -n "$from_comment" ]]; then
    printf '%s' "$from_comment"
    return 0
  fi

  # Fallback: parse brand_id from first INSERT row (second-to-last numeric field before scale_id varies)
  local first_row
  first_row="$(grep -E "^\('" "$objects_file" | head -1)"
  if [[ -z "$first_row" ]]; then
    echo "Could not detect brand_id in $objects_file" >&2
    exit 1
  fi
  awk -F, '{print $(NF-2)}' <<<"$first_row" | tr -d ' )'
}

count_insert_rows() {
  local file="$1"
  grep -cE "^\('" "$file" || true
}

run_psql() {
  if $DRY_RUN; then
    printf '[dry-run] psql'
    printf ' %q' "$@"
    printf '\n'
    return 0
  fi
  PGPASSWORD="$RDS_PASSWORD" psql -h "$RDS_HOST" -U "$RDS_USER" -d "$RDS_DB" -v ON_ERROR_STOP=1 "$@"
}

run_psql_file() {
  local file="$1"
  if $DRY_RUN; then
    log "[dry-run] would run SQL file: $file"
    return 0
  fi
  log "$(basename "$file")"
  run_psql -f "$file"
}

import_brand() {
  local slug="$1"
  local brand_dir="$SQL_DIR/seed/$slug"
  local objects_file="$brand_dir/brand-objects.sql"
  local series_file="$brand_dir/series.sql"

  if [[ ! -f "$objects_file" ]]; then
    echo "Missing $objects_file — run without --skip-prepare first" >&2
    exit 1
  fi

  local brand_id expected_rows deleted_objects
  brand_id="$(brand_id_from_sql "$objects_file")"
  expected_rows="$(count_insert_rows "$objects_file")"

  log "Brand: $slug (brand_id=$brand_id, expected brand_objects=$expected_rows)"

  if $DRY_RUN; then
    log "[dry-run] DELETE FROM brand_objects WHERE brand_id = $brand_id;"
    if $IMPORT_SERIES && [[ -f "$series_file" ]]; then
      log "[dry-run] DELETE FROM series WHERE brand_id = $brand_id;"
      log "[dry-run] import $series_file"
    fi
    log "[dry-run] import $objects_file"
    log "[dry-run] reset brand_objects id sequence"
    return 0
  fi

  deleted_objects="$(run_psql -tAc "WITH deleted AS (DELETE FROM brand_objects WHERE brand_id = ${brand_id} RETURNING 1) SELECT COUNT(*) FROM deleted;")"
  log "Deleted $deleted_objects brand_objects for brand_id=$brand_id"

  if $IMPORT_SERIES && [[ -f "$series_file" ]]; then
    run_psql -c "DELETE FROM series WHERE brand_id = ${brand_id};"
    run_psql_file "$series_file"
  fi

  run_psql_file "$objects_file"

  run_psql -c "SELECT setval(
    pg_get_serial_sequence('brand_objects', 'id'),
    COALESCE((SELECT MAX(id) FROM brand_objects), 1)
  );"

  local actual_rows
  actual_rows="$(run_psql -tAc "SELECT COUNT(*) FROM brand_objects WHERE brand_id = ${brand_id};")"
  log "Imported $actual_rows brand_objects (expected $expected_rows)"
  if [[ "$actual_rows" != "$expected_rows" ]]; then
    warn "$slug: row count mismatch (got $actual_rows, expected $expected_rows)"
  fi
}

collect_changed_brands() {
  local mode="$1"
  local ref="${2:-}"
  local paths=()

  case "$mode" in
    last-commit)
      while IFS= read -r path; do
        paths+=("$path")
      done < <(git -C "$ROOT" diff-tree --no-commit-id --name-only -r HEAD -- "$SEED_GIT_PATH" 2>/dev/null || true)
      ;;
    since)
      while IFS= read -r path; do
        paths+=("$path")
      done < <(git -C "$ROOT" diff --name-only "$ref" HEAD -- "$SEED_GIT_PATH" 2>/dev/null || true)
      ;;
    changed)
      while IFS= read -r path; do
        paths+=("$path")
      done < <(git -C "$ROOT" diff --name-only HEAD -- "$SEED_GIT_PATH" 2>/dev/null || true)
      if git -C "$ROOT" rev-parse --verify "$CHANGE_BASE_REF" >/dev/null 2>&1; then
        while IFS= read -r path; do
          paths+=("$path")
        done < <(git -C "$ROOT" diff --name-only "$CHANGE_BASE_REF" HEAD -- "$SEED_GIT_PATH" 2>/dev/null || true)
      fi
      ;;
    *)
      echo "internal error: unknown collect mode $mode" >&2
      exit 1
      ;;
  esac

  local path slug
  for path in "${paths[@]}"; do
    [[ -z "$path" ]] && continue
    [[ "$path" != *.sql ]] && continue
    slug="$(basename "$(dirname "$path")")"
    printf '%s\n' "$slug"
  done | sort -u
}

print_no_changes_hint() {
  cat >&2 <<EOF
No seed SQL changes detected.

Working tree is clean and HEAD matches ${CHANGE_BASE_REF}. To import recent commits, try:

  $0 --last-commit              # brands in the latest commit only
  $0 --since HEAD~1             # brands changed since previous commit
  $0 maisto minigt autoworld    # explicit brand slugs
  $0 --list                     # all available slugs

Or set CHANGE_BASE_REF to an older deploy tag/commit:
  CHANGE_BASE_REF=v1.0.0 $0 --changed
EOF
}

main() {
  ORIGINAL_ARGS=("$@")
  local brands=()

  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h|--help) usage 0 ;;
      --list)
        list_brand_slugs
        exit 0
        ;;
      --all)
        MODE="all"
        shift
        ;;
      --changed)
        MODE="changed"
        shift
        ;;
      --last-commit)
        MODE="last-commit"
        shift
        ;;
      --since)
        MODE="since"
        shift
        SINCE_REF="${1:?--since requires a git ref (e.g. HEAD~1)}"
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --skip-prepare)
        SKIP_PREPARE=true
        shift
        ;;
      --no-series)
        IMPORT_SERIES=false
        shift
        ;;
      --prepare-only)
        PREPARE_ONLY=true
        shift
        ;;
      --)
        shift
        break
        ;;
      -*)
        echo "Unknown option: $1" >&2
        usage 1
        ;;
      *)
        brands+=("$(resolve_brand_slug "$1")")
        shift
        ;;
    esac
  done

  while [[ $# -gt 0 ]]; do
    brands+=("$(resolve_brand_slug "$1")")
    shift
  done

  if [[ -n "$MODE" && ${#brands[@]} -gt 0 ]]; then
    echo "Use either --all/--changed/--last-commit/--since or explicit brand slugs, not both." >&2
    exit 1
  fi

  if [[ "$MODE" == "all" ]]; then
    while IFS= read -r slug; do
      brands+=("$slug")
    done < <(list_brand_slugs)
  elif [[ "$MODE" == "changed" || "$MODE" == "last-commit" || "$MODE" == "since" ]]; then
    local ref_arg=""
    if [[ "$MODE" == "since" ]]; then
      ref_arg="$SINCE_REF"
    fi
    while IFS= read -r slug; do
      brands+=("$slug")
    done < <(collect_changed_brands "$MODE" "$ref_arg")
    if [[ ${#brands[@]} -eq 0 ]]; then
      print_no_changes_hint
      exit 0
    fi
    if [[ "$MODE" == "last-commit" ]]; then
      log "Brands in latest commit ($(git -C "$ROOT" rev-parse --short HEAD)): ${brands[*]}"
    elif [[ "$MODE" == "since" ]]; then
      log "Brands changed since $SINCE_REF: ${brands[*]}"
    else
      log "Brands with seed SQL changes: ${brands[*]}"
    fi
  fi

  if [[ ${#brands[@]} -eq 0 ]]; then
    echo "No brands selected. Examples:" >&2
    echo "  $0 maisto minigt" >&2
    echo "  $0 --changed" >&2
    usage 1
  fi

  if ! $DRY_RUN && ! $PREPARE_ONLY; then
    load_rds_env
    require_rds_credentials
    if ! command -v psql >/dev/null 2>&1; then
      echo "psql not found. Install PostgreSQL client tools." >&2
      exit 1
    fi
    if resolves_to_private_ip "$RDS_HOST"; then
      cat >&2 <<EOF
RDS resolves to a private VPC address — your laptop cannot connect directly.

Use the ECS runner (imports from inside the VPC):
  ./deploy/aws/import-prod-brands-via-ecs.sh ${ORIGINAL_ARGS:-}

Or set up a VPN/bastion and run this script again with RDS_HOST reachable.
EOF
      exit 1
    fi
    log "Target: $RDS_USER@$RDS_HOST/$RDS_DB"
  fi

  if ! $SKIP_PREPARE; then
    local slug
    for slug in "${brands[@]}"; do
      prepare_brand_sql "$slug"
    done
  else
    log "Using existing SQL in $SQL_DIR (--skip-prepare)"
  fi

  log "Importing ${#brands[@]} brand(s): ${brands[*]}"
  printf '%s\n' "${brands[@]}" > "$SQL_DIR/brands.txt"

  if $PREPARE_ONLY; then
    log "Prepared SQL under $SQL_DIR (brands.txt written)"
    exit 0
  fi

  local slug
  for slug in "${brands[@]}"; do
    import_brand "$slug"
  done

  log "Done."
  if ! $DRY_RUN; then
    log "Reminder: set ELASTICSEARCH_REINDEX_ON_STARTUP=true and redeploy ECS once to refresh search index."
  fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main "$@"
fi
