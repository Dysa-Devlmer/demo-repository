#!/usr/bin/env bash
set -euo pipefail

MAX_RETRIES="${MAX_RETRIES:-20}"
SLEEP_SECONDS="${SLEEP_SECONDS:-3}"

check() {
  local name="$1"
  local url="$2"

  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"

  if [[ "$code" == "200" ]]; then
    echo "✅ $name OK ($code) — $url"
    return 0
  else
    echo "❌ $name FAIL ($code) — $url"
    return 1
  fi
}

run_checks_once() {
  local failed=0
  echo "== ChatBotDysa health checks =="

  check "backend" "http://127.0.0.1:8005/health" || failed=1
  check "backend-docs" "http://127.0.0.1:8005/docs" || failed=1
  check "admin" "http://127.0.0.1:7001/api/health" || failed=1
  check "website" "http://127.0.0.1:3004" || failed=1

  return "$failed"
}

echo "== Waiting for services to become healthy =="

for i in $(seq 1 "$MAX_RETRIES"); do
  if run_checks_once; then
    exit 0
  fi

  if [[ "$i" -lt "$MAX_RETRIES" ]]; then
    echo "Retrying health checks in ${SLEEP_SECONDS}s... (${i}/${MAX_RETRIES})"
    sleep "$SLEEP_SECONDS"
    echo
  fi
done

echo "Health checks failed after ${MAX_RETRIES} attempts."
exit 1
