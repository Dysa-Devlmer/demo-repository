#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "== ChatBotDysa: DEV UP =="
echo "Root: $ROOT_DIR"

cd "$ROOT_DIR"

# Levanta stack dev (infra compose que incluye backend + apps)
docker compose -f infrastructure/docker-compose.yml up -d --build

echo
docker compose -f infrastructure/docker-compose.yml ps
