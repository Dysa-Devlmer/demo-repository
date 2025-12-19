#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "== ChatBotDysa: DEV DOWN =="
docker compose -f infrastructure/docker-compose.yml down
