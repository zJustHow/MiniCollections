#!/usr/bin/env bash
# Run CDK with optional cdk.local.json context overrides.
# Usage: ./cdk.sh deploy | ./cdk.sh diff | ./cdk.sh synth ...
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

CONTEXT_ARGS=()
LOCAL_FILE="cdk.local.json"

if [[ -f "$LOCAL_FILE" ]]; then
  if ! command -v jq &>/dev/null; then
    echo "jq is required to read $LOCAL_FILE" >&2
    exit 1
  fi
  while IFS= read -r key; do
    value="$(jq -r --arg k "$key" '.context[$k] | if type == "boolean" then tostring else . end' "$LOCAL_FILE")"
    CONTEXT_ARGS+=("-c" "${key}=${value}")
  done < <(jq -r '.context | keys[]' "$LOCAL_FILE")
fi

exec npx aws-cdk "$@" "${CONTEXT_ARGS[@]}"
