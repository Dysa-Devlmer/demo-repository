#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8005}"

echo "== Backend smoke =="
echo "BASE_URL=$BASE_URL"

code_health="$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" || true)"
echo "/health -> $code_health"
test "$code_health" = "200"

code_docs="$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/docs" || true)"
echo "/docs -> $code_docs"
test "$code_docs" = "200"

echo "✅ Backend smoke passed"
