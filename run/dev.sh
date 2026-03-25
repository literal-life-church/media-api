#!/usr/bin/env bash

# Does these things:
# 1. Pulls all secrets from Doppler into .env
# 2. Serves the CF Worker project
# 3. Cleans up the .env file on exit, interrupt, or termination

set -Eeuo pipefail

ENV_FILE=".env"

cleanup() {
    rm -f "$ENV_FILE" 2>/dev/null || true
}

trap cleanup EXIT INT TERM HUP

need_cmd() {
    command -v "$1" >/dev/null 2>&1 || {
        echo "ERROR: Missing required command: $1"
        exit 1
    }
}

need_cmd doppler
need_cmd npx

doppler secrets download --no-file --format env > "$ENV_FILE"
npx wrangler dev
