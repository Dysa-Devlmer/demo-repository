#!/usr/bin/env bash
set -euo pipefail

check() {
  local name="$1"
  local url="$2"

  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"

  if [[ "$code" == "200" ]]; then
    echo "✅ $name OK ($code) — $url"
  else
    echo "❌ $name FAIL ($code) — $url"
    return 1
  fi
}

echo "== ChatBotDysa health checks =="

check "backend" "http://127.0.0.1:8005/health"
check "backend-docs" "http://127.0.0.1:8005/docs"
check "admin" "http://127.0.0.1:7001/api/health"
check "website" "http://127.0.0.1:3004"
