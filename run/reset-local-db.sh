#!/bin/bash
set -euo pipefail

read -r -p "WARNING: This will delete all local database files and cannot be undone. Continue? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

find "$ROOT_DIR/.wrangler/state/v3/d1" -name "*.sqlite" -type f -delete
find "$ROOT_DIR/.wrangler/state/v3/d1" -name "*.sqlite-shm" -type f -delete
find "$ROOT_DIR/.wrangler/state/v3/d1" -name "*.sqlite-wal" -type f -delete

echo "Database reset complete."
