#!/usr/bin/env bash

# Doppler does not have automatic integration with Cloudflare Workers for secret deployment.
# This script helps bridge that gap.
#
# Does these things:
# 1. Pulls all secrets from Doppler
# 2. Deploys them as Cloudflare Worker secrets
#
# Usage:
#   npm run deploy:secrets           — deploy to the production Worker
#   npm run deploy:secrets -- staging — deploy to the staging Worker
#
# See:
# - https://docs.doppler.com/docs/cloudflare-workers

need_cmd() {
    command -v "$1" >/dev/null 2>&1 || {
        echo "ERROR: Missing required command: $1"
        exit 1
    }
}

need_cmd doppler
need_cmd npx

doppler secrets download --no-file --format json | npx wrangler secret bulk ${1:+--env "$1"}
