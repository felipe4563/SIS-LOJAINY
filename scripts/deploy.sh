#!/usr/bin/env bash
#
# Deploy de SIS-LOJAINY en el VPS.
# Actualiza el repo, reinstala dependencias si cambiaron, reconstruye el
# frontend (Nginx sirve frontend/dist directo, sin copiar a otra carpeta) y
# reinicia el proceso de PM2 del backend.
#
# Uso: ./scripts/deploy.sh
# (pensado para correr en el VPS, dentro de /home/ubuntu/SISTEMAS/SIS-LOJAINY)

set -euo pipefail

PM2_APP="lojainy-api"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_FILE="/tmp/sis-lojainy-deploy.lock"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# Evita que dos deploys corran al mismo tiempo
if [ -e "$LOCK_FILE" ]; then
  echo "Ya hay un deploy en curso (existe $LOCK_FILE). Si es un residuo de una corrida fallida, bórralo y reintenta." >&2
  exit 1
fi
trap 'rm -f "$LOCK_FILE"' EXIT
touch "$LOCK_FILE"

cd "$REPO_DIR"

log "Repo: $REPO_DIR"
RAMA="$(git rev-parse --abbrev-ref HEAD)"
log "Rama actual: $RAMA"

if [ -n "$(git status --porcelain)" ]; then
  echo "Hay cambios sin commitear en el VPS. Revísalos antes de hacer deploy (git status)." >&2
  exit 1
fi

log "Descargando cambios (git pull --ff-only)..."
git fetch origin "$RAMA"
git pull --ff-only origin "$RAMA"

# --- Backend ---
log "Backend: instalando dependencias..."
cd "$REPO_DIR/backend"
if [ -f package-lock.json ]; then
  npm ci --omit=dev
else
  npm install --omit=dev
fi

# --- Frontend ---
log "Frontend: instalando dependencias y compilando..."
cd "$REPO_DIR/frontend"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
npm run build

# --- Reinicio del backend ---
log "Reiniciando $PM2_APP con PM2..."
pm2 restart "$PM2_APP" --update-env

pm2 save

log "Deploy completo. Commit desplegado: $(git -C "$REPO_DIR" rev-parse HEAD)"
