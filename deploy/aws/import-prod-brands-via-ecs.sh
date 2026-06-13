#!/usr/bin/env bash
# Import seed catalog data into private RDS by running psql inside the VPC (one-off ECS task).
# Use when RDS is not reachable from your laptop (private IP / connection timeout).
#
# Same brand selection as import-prod-brands.sh (--last-commit, maisto, etc.)
#
# Usage:
#   ./deploy/aws/import-prod-brands-via-ecs.sh --last-commit
#   ./deploy/aws/import-prod-brands-via-ecs.sh maisto minigt
#
# Requires deploy/aws/rds.env — see rds.env.example (RDS_HOST, RDS_PASSWORD, AWS_REGION,
# ECS_CLUSTER, ECS_SERVICE, S3_BUCKET; optional APP_SECRETS_ARN).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
IMPORT_SCRIPT="$SCRIPT_DIR/import-prod-brands.sh"
TASK_FAMILY="${ECS_IMPORT_TASK_FAMILY:-minicollections-seed-import}"

log() { printf '==> %s\n' "$*"; }
warn() { printf 'warning: %s\n' "$*" >&2; }

usage() {
  sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

load_env() {
  # shellcheck disable=SC1091
  source "$IMPORT_SCRIPT"

  load_rds_env

  AWS_REGION="${AWS_REGION:-us-west-2}"
  ECS_CLUSTER="${ECS_CLUSTER:-minicollections}"
  ECS_SERVICE="${ECS_SERVICE:-minicollections}"
  S3_BUCKET="${S3_BUCKET:-minicollections-media-717373613148}"
  IMPORT_S3_PREFIX="${IMPORT_S3_PREFIX:-ops/seed-import}"

  : "${RDS_HOST:?Set RDS_HOST in deploy/aws/rds.env}"
  if [[ -z "${RDS_PASSWORD:-}" && -z "${APP_SECRETS_ARN:-}" ]]; then
    echo "Set RDS_PASSWORD or APP_SECRETS_ARN in deploy/aws/rds.env" >&2
    exit 1
  fi
}

discover_network() {
  local json
  json="$(aws ecs describe-services \
    --region "$AWS_REGION" \
    --cluster "$ECS_CLUSTER" \
    --services "$ECS_SERVICE" \
    --query 'services[0].networkConfiguration.awsvpcConfiguration' \
    --output json)"

  if [[ "$json" == "null" || -z "$json" ]]; then
    echo "Could not read network config for ECS service $ECS_CLUSTER/$ECS_SERVICE" >&2
    exit 1
  fi

  ECS_SUBNETS="$(python3 -c 'import json,sys; c=json.load(sys.stdin); print(",".join(c["subnets"]))' <<<"$json")"
  ECS_SECURITY_GROUPS="$(python3 -c 'import json,sys; c=json.load(sys.stdin); print(",".join(c["securityGroups"]))' <<<"$json")"
  ECS_ASSIGN_PUBLIC_IP="$(python3 -c 'import json,sys; c=json.load(sys.stdin); print(c.get("assignPublicIp","DISABLED"))' <<<"$json")"
}

discover_execution_role() {
  if [[ -n "${ECS_EXECUTION_ROLE_ARN:-}" ]]; then
    return 0
  fi
  local family
  family="$(aws ecs describe-services \
    --region "$AWS_REGION" \
    --cluster "$ECS_CLUSTER" \
    --services "$ECS_SERVICE" \
    --query 'services[0].taskDefinition' \
    --output text)"
  ECS_EXECUTION_ROLE_ARN="$(aws ecs describe-task-definition \
    --region "$AWS_REGION" \
    --task-definition "$family" \
    --query 'taskDefinition.executionRoleArn' \
    --output text)"
  ECS_TASK_ROLE_ARN="$(aws ecs describe-task-definition \
    --region "$AWS_REGION" \
    --task-definition "$family" \
    --query 'taskDefinition.taskRoleArn' \
    --output text)"
}

register_task_definition() {
  export TASK_FAMILY AWS_REGION RDS_HOST RDS_USER RDS_DB S3_BUCKET IMPORT_S3_KEY
  export APP_SECRETS_ARN="${APP_SECRETS_ARN:-}"
  export RDS_PASSWORD="${RDS_PASSWORD:-}"
  export ECS_EXECUTION_ROLE_ARN ECS_TASK_ROLE_ARN="${ECS_TASK_ROLE_ARN:-$ECS_EXECUTION_ROLE_ARN}"

  python3 <<'PY' > /tmp/seed-import-task-def.json
import json, os

secret_arn = os.environ.get("APP_SECRETS_ARN", "")
secrets = []
if secret_arn:
    secrets.append({
        "name": "DATABASE_PASSWORD",
        "valueFrom": f"{secret_arn}:DATABASE_PASSWORD::",
    })

env = [
    {"name": "AWS_REGION", "value": os.environ["AWS_REGION"]},
    {"name": "RDS_HOST", "value": os.environ["RDS_HOST"]},
    {"name": "RDS_USER", "value": os.environ.get("RDS_USER", "postgres")},
    {"name": "RDS_DB", "value": os.environ.get("RDS_DB", "minicollections")},
    {"name": "IMPORT_BUCKET", "value": os.environ["S3_BUCKET"]},
    {"name": "IMPORT_KEY", "value": os.environ["IMPORT_S3_KEY"]},
]
if os.environ.get("RDS_PASSWORD") and not secret_arn:
    env.append({"name": "DATABASE_PASSWORD", "value": os.environ["RDS_PASSWORD"]})

import_cmd = r"""
set -euo pipefail
apk add --no-cache aws-cli zip >/dev/null
aws s3 cp s3://${IMPORT_BUCKET}/${IMPORT_KEY} /tmp/bundle.zip --region ${AWS_REGION}
mkdir -p /tmp/import && cd /tmp/import && unzip -q /tmp/bundle.zip
export PGPASSWORD=${DATABASE_PASSWORD}
PSQL="psql -h ${RDS_HOST} -U ${RDS_USER} -d ${RDS_DB} -v ON_ERROR_STOP=1"
while IFS= read -r brand; do
  [ -z "$brand" ] && continue
  objects="seed/${brand}/brand-objects.sql"
  series="seed/${brand}/series.sql"
  brand_id=$(grep -Eo 'brand_id=[0-9]+' "$objects" | head -1 | cut -d= -f2)
  [ -z "$brand_id" ] && brand_id=$(awk -F, '{print $(NF-2)}' "$objects" | head -1 | tr -d ' )')
  echo "==> Brand: $brand (brand_id=$brand_id)"
  $PSQL -c "DELETE FROM brand_objects WHERE brand_id = ${brand_id};"
  if [ -f "$series" ]; then
    $PSQL -c "DELETE FROM series WHERE brand_id = ${brand_id};"
    $PSQL -f "$series"
  fi
  $PSQL -f "$objects"
  actual=$($PSQL -tAc "SELECT COUNT(*) FROM brand_objects WHERE brand_id = ${brand_id};")
  echo "Imported ${actual} brand_objects for brand_id=${brand_id}"
  if [ "${actual}" = "0" ]; then
    echo "error: no brand_objects imported for ${brand}" >&2
    exit 1
  fi
  $PSQL -c "SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), COALESCE((SELECT MAX(id) FROM brand_objects), 1));"
done < brands.txt
echo Done.
""".strip()

task = {
    "family": os.environ["TASK_FAMILY"],
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": os.environ["ECS_EXECUTION_ROLE_ARN"],
    "taskRoleArn": os.environ.get("ECS_TASK_ROLE_ARN") or os.environ["ECS_EXECUTION_ROLE_ARN"],
    "containerDefinitions": [{
        "name": "seed-import",
        "image": "postgres:17-alpine",
        "essential": True,
        "environment": env,
        "secrets": secrets,
        "command": ["sh", "-c", import_cmd],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/minicollections",
                "awslogs-region": os.environ["AWS_REGION"],
                "awslogs-stream-prefix": "seed-import",
            },
        },
    }],
}
print(json.dumps(task))
PY

  aws ecs register-task-definition \
    --region "$AWS_REGION" \
    --cli-input-json "file:///tmp/seed-import-task-def.json" \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text
}

run_ecs_task() {
  local task_def_arn="$1"
  local task_arn
  task_arn="$(aws ecs run-task \
    --region "$AWS_REGION" \
    --cluster "$ECS_CLUSTER" \
    --launch-type FARGATE \
    --task-definition "$task_def_arn" \
    --network-configuration "awsvpcConfiguration={subnets=[${ECS_SUBNETS}],securityGroups=[${ECS_SECURITY_GROUPS}],assignPublicIp=${ECS_ASSIGN_PUBLIC_IP}}" \
    --query 'tasks[0].taskArn' \
    --output text)"

  if [[ -z "$task_arn" || "$task_arn" == "None" ]]; then
    echo "ECS run-task failed" >&2
    exit 1
  fi
  log "ECS task: $task_arn"
  log "Waiting for task (CloudWatch: /ecs/minicollections, stream prefix seed-import) ..."

  aws ecs wait tasks-stopped --region "$AWS_REGION" --cluster "$ECS_CLUSTER" --tasks "$task_arn"

  local exit_code stopped_reason stop_code
  exit_code="$(aws ecs describe-tasks \
    --region "$AWS_REGION" \
    --cluster "$ECS_CLUSTER" \
    --tasks "$task_arn" \
    --query 'tasks[0].containers[?name==`seed-import`].exitCode | [0]' \
    --output text)"
  stopped_reason="$(aws ecs describe-tasks \
    --region "$AWS_REGION" \
    --cluster "$ECS_CLUSTER" \
    --tasks "$task_arn" \
    --query 'tasks[0].stoppedReason' \
    --output text)"
  stop_code="$(aws ecs describe-tasks \
    --region "$AWS_REGION" \
    --cluster "$ECS_CLUSTER" \
    --tasks "$task_arn" \
    --query 'tasks[0].stopCode' \
    --output text)"

  if [[ "$exit_code" == "None" || "$exit_code" == "null" || -z "$exit_code" ]]; then
    warn "Task did not start or stopped without exit code ($stop_code)"
    warn "$stopped_reason"
    exit 1
  fi

  if [[ "$exit_code" != "0" ]]; then
    warn "Task exit code: $exit_code — see CloudWatch /ecs/minicollections (stream prefix seed-import)"
    exit 1
  fi
  log "ECS import task completed successfully."
}

main() {
  if [[ $# -eq 0 || "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    usage 0
  fi

  if ! command -v aws >/dev/null 2>&1; then
    echo "aws CLI is required." >&2
    exit 1
  fi

  load_env
  discover_network
  discover_execution_role

  log "Preparing SQL bundle locally ..."
  "$IMPORT_SCRIPT" --prepare-only "$@"

  SQL_DIR="${SQL_DIR:-/tmp/minicollections-prod-sql}"
  if [[ ! -f "$SQL_DIR/brands.txt" ]]; then
    echo "Missing $SQL_DIR/brands.txt after prepare" >&2
    exit 1
  fi

  local stamp bundle_dir bundle_zip
  stamp="$(date +%Y%m%d-%H%M%S)-$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo manual)"
  bundle_dir="$(mktemp -d)"
  bundle_zip="$bundle_dir/seed-import-${stamp}.zip"

  cp "$SQL_DIR/brands.txt" "$bundle_dir/brands.txt"
  cp -R "$SQL_DIR/seed" "$bundle_dir/seed"
  (cd "$bundle_dir" && zip -qr "$bundle_zip" brands.txt seed)

  IMPORT_S3_KEY="${IMPORT_S3_PREFIX}/${stamp}.zip"
  log "Uploading s3://${S3_BUCKET}/${IMPORT_S3_KEY}"
  aws s3 cp "$bundle_zip" "s3://${S3_BUCKET}/${IMPORT_S3_KEY}" --region "$AWS_REGION"

  log "Registering task definition $TASK_FAMILY ..."
  local task_def_arn
  task_def_arn="$(register_task_definition)"

  run_ecs_task "$task_def_arn"

  log "Done. Set ELASTICSEARCH_REINDEX_ON_STARTUP=true and redeploy ECS once to refresh search."
  rm -rf "$bundle_dir"
}

main "$@"
