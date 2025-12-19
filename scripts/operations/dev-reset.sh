#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

PRUNE="false"
if [[ "${1:-}" == "--prune" ]]; then
  PRUNE="true"
fi

echo "== ChatBotDysa: DEV RESET =="
echo "Root: $ROOT_DIR"
echo "Prune: $PRUNE"
echo

# 1) Stop website stack (dev) if present
if [[ -f "infrastructure/docker-compose.web.yml" ]]; then
  echo "== Website down (dev) =="
  docker compose -f infrastructure/docker-compose.web.yml down || true
  echo
fi

# 2) Stop stack (dev)
./scripts/operations/dev-down.sh || true

# 3) Optional prune (careful)
if [[ "$PRUNE" == "true" ]]; then
  echo "== Pruning docker system (images/networks/build cache) =="
  docker system prune -f
  echo
fi

# 4) Up stack (dev)
./scripts/operations/dev-up.sh

# 5) Website up (optional, only if compose file exists)
if [[ -f "infrastructure/docker-compose.web.yml" ]]; then
  echo
  echo "== Bringing up website (dev) =="
  docker compose -f infrastructure/docker-compose.web.yml up -d --build
fi

# 6) Health checks
echo
./scripts/operations/health.sh
