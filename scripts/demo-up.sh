#!/usr/bin/env bash
#
# demo-up.sh — One-shot demo launcher for Snack Overflow.
#
# Run once at presentation time. It:
#   1. Brings up the Docker infra stack (Postgres + Redis).
#   2. Starts the NestJS backend (port 3000, dev/watch mode).
#   3. Seeds the database with demo data (AFTER the backend is healthy — the seed
#      creates contrataciones through the REAL API so the state machine stays consistent).
#   4. Starts a cloudflared ephemeral quick tunnel at the frontend (port 3001) and
#      captures the random *.trycloudflare.com URL it prints.
#   5. Injects that tunnel host into the frontend via ALLOWED_DEV_ORIGIN so Next 16's
#      dev server accepts cross-origin requests from it.
#   6. Starts the Next.js frontend dev server (port 3001).
#   7. Prints the public tunnel URL clearly so the presenter can open/share it.
#   8. On Ctrl-C / exit: cleanly tears down everything it started (backend, frontend,
#      tunnel). Docker infra is LEFT RUNNING on purpose (cheap to keep, slow to rebuild,
#      and your seeded data lives there) — tear it down manually with `docker compose down`.
#
# NEVER runs a production build. Dev servers only.
#
set -euo pipefail

# ── Paths ─────────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"
SEED_SCRIPT="$SERVER_DIR/scripts/seed-demo.sh"

# ── Ports ─────────────────────────────────────────────────────────────────────────
BACKEND_PORT=3000
FRONTEND_PORT=3001
BACKEND_URL="http://localhost:${BACKEND_PORT}"
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"

# ── Runtime state ───────────────────────────────────────────────────────────────────
LOG_DIR="$(mktemp -d -t snack-demo.XXXXXX)"
TUNNEL_LOG="$LOG_DIR/cloudflared.log"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
BACKEND_PID=""
FRONTEND_PID=""
TUNNEL_PID=""
TUNNEL_URL=""

# ── Colors ────────────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  C_RESET=$'\033[0m'; C_BOLD=$'\033[1m'
  C_BLUE=$'\033[34m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_RED=$'\033[31m'; C_CYAN=$'\033[36m'
else
  C_RESET=""; C_BOLD=""; C_BLUE=""; C_GREEN=""; C_YELLOW=""; C_RED=""; C_CYAN=""
fi

step()  { echo "${C_BLUE}${C_BOLD}==>${C_RESET} ${C_BOLD}$*${C_RESET}"; }
info()  { echo "    $*"; }
ok()    { echo "    ${C_GREEN}OK${C_RESET} $*"; }
warn()  { echo "    ${C_YELLOW}!!${C_RESET} $*" >&2; }
fail()  { echo "${C_RED}${C_BOLD}xx ERROR:${C_RESET} $*" >&2; exit 1; }

# ── Cleanup trap ────────────────────────────────────────────────────────────────────
cleanup() {
  # Disable the trap so a second Ctrl-C during teardown can't re-enter this.
  trap - EXIT INT TERM
  echo
  step "Shutting down demo (tearing down what this script started)"

  for entry in "frontend:$FRONTEND_PID" "backend:$BACKEND_PID" "tunnel:$TUNNEL_PID"; do
    local name="${entry%%:*}"
    local pid="${entry#*:}"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      info "stopping $name (pid $pid)"
      # Kill the whole process group (npm/next/nest spawn children).
      kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
    fi
  done

  # Give them a moment to exit, then force-kill any survivors.
  sleep 1
  for pid in "$FRONTEND_PID" "$BACKEND_PID" "$TUNNEL_PID"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill -KILL -- "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
    fi
  done

  info "logs kept at: $LOG_DIR"
  info "docker infra left running — stop it with: ${C_CYAN}docker compose down${C_RESET}"
  ok "teardown complete"
}
trap cleanup EXIT INT TERM

# ── Prerequisite checks ─────────────────────────────────────────────────────────────
check_prereqs() {
  step "Checking prerequisites"

  if ! command -v docker >/dev/null 2>&1; then
    fail "docker not found. Install Docker: https://docs.docker.com/get-docker/"
  fi
  if ! docker compose version >/dev/null 2>&1; then
    fail "'docker compose' (v2) not found. Install the Docker Compose plugin."
  fi
  ok "docker compose"

  if ! command -v cloudflared >/dev/null 2>&1; then
    echo "${C_RED}${C_BOLD}xx ERROR:${C_RESET} cloudflared not found." >&2
    echo "    Install it, then re-run:" >&2
    echo "      macOS : brew install cloudflared" >&2
    echo "      Linux : curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared" >&2
    exit 1
  fi
  ok "cloudflared"

  command -v curl >/dev/null 2>&1 || fail "curl not found (required for health polling)."
  command -v npm  >/dev/null 2>&1 || fail "npm not found."
  [[ -x "$SEED_SCRIPT" || -f "$SEED_SCRIPT" ]] || fail "seed script not found at $SEED_SCRIPT"
  ok "curl, npm, seed script"
}

# ── Wait helpers ────────────────────────────────────────────────────────────────────
# Poll an HTTP endpoint until it answers (any response = listening), with a timeout.
wait_for_http() {
  local url="$1" label="$2" timeout="${3:-90}" elapsed=0
  step "Waiting for $label at $url (timeout ${timeout}s)"
  while (( elapsed < timeout )); do
    if curl -s -o /dev/null --max-time 2 "$url"; then
      ok "$label is responding"
      return 0
    fi
    sleep 2; elapsed=$((elapsed + 2))
    printf '    ...%ss\r' "$elapsed"
  done
  echo
  fail "$label did not become reachable within ${timeout}s. See logs in $LOG_DIR"
}

# ── 1. Docker infra ─────────────────────────────────────────────────────────────────
start_infra() {
  step "Bringing up Docker infra (Postgres + Redis)"
  # Default compose (no --profile app) brings up ONLY postgres + redis.
  (cd "$ROOT_DIR" && docker compose up -d postgres redis) \
    || fail "docker compose up failed"
  # Wait for Postgres to be healthy (compose defines a pg_isready healthcheck).
  local elapsed=0
  while (( elapsed < 60 )); do
    local status
    status=$(docker inspect -f '{{.State.Health.Status}}' snack_overflow_db 2>/dev/null || echo "unknown")
    if [[ "$status" == "healthy" ]]; then ok "Postgres healthy"; return 0; fi
    sleep 2; elapsed=$((elapsed + 2))
    printf '    ...postgres %s (%ss)\r' "$status" "$elapsed"
  done
  echo
  fail "Postgres did not report healthy within 60s"
}

# ── 2. Backend ──────────────────────────────────────────────────────────────────────
start_backend() {
  step "Starting NestJS backend (dev/watch) on :$BACKEND_PORT"
  # The local backend needs a .env. Defaults in .env.example already match the compose
  # infra (localhost:5432 / :6379), so create it from the example if missing.
  if [[ ! -f "$SERVER_DIR/.env" ]]; then
    if [[ -f "$SERVER_DIR/.env.example" ]]; then
      cp "$SERVER_DIR/.env.example" "$SERVER_DIR/.env"
      info "created server/.env from .env.example (defaults match compose infra)"
    else
      warn "no server/.env and no .env.example — relying on ConfigModule defaults"
    fi
  fi

  # setsid -> own process group so cleanup() can kill the whole tree.
  ( cd "$SERVER_DIR" && setsid npm run start:dev ) >"$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!
  info "backend pid $BACKEND_PID, logs -> $BACKEND_LOG"
  # Root GET / returns a 200 string ("Hello"); use it as the health probe.
  wait_for_http "$BACKEND_URL/" "backend" 120
}

# ── 3. Seed ─────────────────────────────────────────────────────────────────────────
seed_demo() {
  step "Seeding demo data (API-driven, requires backend up)"
  # Seed reads BACKEND_URL / DB_CONTAINER / DB_USER / DB_NAME from env (defaults match
  # ours), and runs psql inside the snack_overflow_db container.
  if BACKEND_URL="$BACKEND_URL" bash "$SEED_SCRIPT"; then
    ok "demo seed complete"
  else
    fail "demo seed failed — see output above"
  fi
}

# ── 4. Tunnel (started BEFORE next so we can capture the host and inject it) ──────────
start_tunnel() {
  step "Starting cloudflared ephemeral tunnel -> $FRONTEND_URL"
  # cloudflared tolerates the upstream (Next) not being up yet; it retries.
  setsid cloudflared tunnel --no-autoupdate --url "$FRONTEND_URL" >"$TUNNEL_LOG" 2>&1 &
  TUNNEL_PID=$!
  info "cloudflared pid $TUNNEL_PID, logs -> $TUNNEL_LOG"

  # Poll the log for the random trycloudflare.com URL (printed async).
  local elapsed=0 timeout=30
  while (( elapsed < timeout )); do
    TUNNEL_URL=$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -n1 || true)
    if [[ -n "$TUNNEL_URL" ]]; then
      ok "tunnel URL: $TUNNEL_URL"
      return 0
    fi
    if ! kill -0 "$TUNNEL_PID" 2>/dev/null; then
      echo; cat "$TUNNEL_LOG" >&2
      fail "cloudflared exited before printing a tunnel URL"
    fi
    sleep 1; elapsed=$((elapsed + 1))
    printf '    ...waiting for tunnel URL (%ss)\r' "$elapsed"
  done
  echo
  cat "$TUNNEL_LOG" >&2
  fail "could not capture a *.trycloudflare.com URL within ${timeout}s"
}

# ── 5+6. Frontend (with the tunnel host injected) ────────────────────────────────────
start_frontend() {
  step "Starting Next.js frontend dev server on :$FRONTEND_PORT"
  # Strip scheme -> bare host for allowedDevOrigins (Next wants the host, not the URL).
  local tunnel_host="${TUNNEL_URL#https://}"
  info "injecting ALLOWED_DEV_ORIGIN=$tunnel_host"

  ( cd "$CLIENT_DIR" \
      && ALLOWED_DEV_ORIGIN="$tunnel_host" \
         BACKEND_URL="$BACKEND_URL" \
         setsid npm run dev -- -p "$FRONTEND_PORT" ) >"$FRONTEND_LOG" 2>&1 &
  FRONTEND_PID=$!
  info "frontend pid $FRONTEND_PID, logs -> $FRONTEND_LOG"
  wait_for_http "$FRONTEND_URL" "frontend" 120
}

# ── 7. Final banner ───────────────────────────────────────────────────────────────────
print_banner() {
  echo
  echo "${C_GREEN}${C_BOLD}================================================================================${C_RESET}"
  echo "${C_GREEN}${C_BOLD}  SNACK OVERFLOW — DEMO IS LIVE${C_RESET}"
  echo "${C_GREEN}${C_BOLD}================================================================================${C_RESET}"
  echo
  echo "  ${C_BOLD}Public URL (share / open this):${C_RESET}"
  echo "      ${C_CYAN}${C_BOLD}${TUNNEL_URL}${C_RESET}"
  echo
  echo "  Local frontend : $FRONTEND_URL"
  echo "  Local backend  : $BACKEND_URL  (internal — reached server-side by Next BFF)"
  echo
  echo "  Demo credentials: run  ${C_CYAN}bash server/scripts/seed-demo.sh --print${C_RESET}"
  echo "  Logs            : $LOG_DIR"
  echo
  echo "  ${C_YELLOW}Press Ctrl-C to tear everything down.${C_RESET}"
  echo "${C_GREEN}${C_BOLD}================================================================================${C_RESET}"
  echo
}

# ── Main ──────────────────────────────────────────────────────────────────────────────
main() {
  check_prereqs
  start_infra
  start_backend
  seed_demo
  start_tunnel      # before Next: capture host, then inject it
  start_frontend
  print_banner

  # Keep the script alive so the trap stays armed; surface a crash of any child.
  while true; do
    if [[ -n "$BACKEND_PID" ]]  && ! kill -0 "$BACKEND_PID" 2>/dev/null;  then fail "backend process died — see $BACKEND_LOG"; fi
    if [[ -n "$FRONTEND_PID" ]] && ! kill -0 "$FRONTEND_PID" 2>/dev/null; then fail "frontend process died — see $FRONTEND_LOG"; fi
    if [[ -n "$TUNNEL_PID" ]]   && ! kill -0 "$TUNNEL_PID" 2>/dev/null;   then fail "cloudflared tunnel died — see $TUNNEL_LOG"; fi
    sleep 3
  done
}

main "$@"
