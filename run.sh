#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
UI_DIR="$ROOT_DIR/frontend"

cleanup() {
  trap - SIGINT SIGTERM EXIT
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "${DB_PID:-}" ]] && kill "$DB_PID" 2>/dev/null || true
  [[ -n "${UI_PID:-}" ]] && kill "$UI_PID" 2>/dev/null || true
}
trap cleanup SIGINT SIGTERM EXIT

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but was not found."
  exit 1
fi

if [[ ! -d "$BACKEND_DIR" || ! -d "$UI_DIR" ]]; then
  echo "Error: expected backend/ and frontend/ directories under $ROOT_DIR."
  exit 1
fi

echo "Starting local PostgreSQL on localhost:5432..."
(
  cd "$BACKEND_DIR"
  npm run db
) &
DB_PID=$!
sleep 8
(
  cd "$BACKEND_DIR"
  npx prisma migrate deploy >/dev/null
)

echo "Starting LifeQuest backend on http://localhost:4000..."
(
  cd "$BACKEND_DIR"
  npm run dev
) &
BACKEND_PID=$!

echo "Starting LifeQuest frontend on http://localhost:3000..."
(
  cd "$UI_DIR"
  npm run dev
) &
UI_PID=$!

echo ""
echo "LifeQuest is starting. Open http://localhost:3000"
echo "Press Ctrl+C to stop both servers."
echo ""

wait -n "$BACKEND_PID" "$UI_PID"
EXIT_CODE=$?
cleanup
exit "$EXIT_CODE"
