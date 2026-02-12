#!/bin/bash
# deploy-vps.sh — Pull latest code, build, and reload PM2 on Hostinger VPS
# Usage: ssh user@187.77.12.113 "cd /var/www/petcanvas && bash scripts/deploy-vps.sh"

set -e

APP_DIR="/var/www/petcanvas"
cd "$APP_DIR"

echo "=== Pet Canvas VPS Deploy ==="
echo "[1/5] Pulling latest code..."
git pull origin main

echo "[2/5] Installing dependencies..."
npm ci --production=false

echo "[3/5] Building Next.js..."
npm run build

echo "[4/5] Preparing standalone..."
node deploy-prepare.js

echo "[5/5] Reloading PM2..."
pm2 reload ecosystem.config.js --update-env

echo "=== Deploy complete! ==="
pm2 status
