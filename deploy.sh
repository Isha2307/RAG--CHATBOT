#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — One-shot VPS deploy script for RAG Chatbot
# Usage: bash deploy.sh
#
# Prerequisites on VPS:
#   - Docker + Docker Compose installed
#   - Nginx installed and running
#   - Git installed
#   - Your domain DNS A record pointing to this VPS IP
# ─────────────────────────────────────────────────────────────────────────────

set -e

REPO_URL="https://github.com/Isha2307/RAG--CHATBOT.git"
APP_DIR="/opt/rag-chatbot"
DOMAIN="YOUR_DOMAIN"   # <-- Replace with your actual subdomain e.g. rag.yourdomain.com

echo "=========================================="
echo " RAG Chatbot — VPS Deploy Script"
echo "=========================================="

# ── 1. Clone or pull latest code ──────────────────────────────────────────────
if [ -d "$APP_DIR/.git" ]; then
  echo "[1/6] Pulling latest changes..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "[1/6] Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 2. Create .env from example if missing ────────────────────────────────────
echo "[2/6] Checking .env file..."
if [ ! -f ".env" ]; then
  cp .env.example .env 2>/dev/null || touch .env
  echo "  → .env created. Edit it with your real values before continuing."
  echo "  → Run: nano $APP_DIR/.env"
  echo "  → Then re-run this script."
  exit 0
fi

# ── 3. Set NEXT_PUBLIC_API_URL in .env ───────────────────────────────────────
echo "[3/6] Setting API URL..."
if ! grep -q "NEXT_PUBLIC_API_URL" .env; then
  echo "NEXT_PUBLIC_API_URL=https://$DOMAIN/api" >> .env
fi

# ── 4. Build and start Docker containers ─────────────────────────────────────
echo "[4/6] Building and starting Docker containers..."
docker compose down --remove-orphans 2>/dev/null || true
docker compose build --no-cache
docker compose up -d

# ── 5. Copy Nginx config ──────────────────────────────────────────────────────
echo "[5/6] Setting up Nginx config..."
NGINX_CONF="/etc/nginx/sites-available/rag-chatbot"
sudo cp nginx/rag-chatbot.conf "$NGINX_CONF"
sudo sed -i "s/YOUR_DOMAIN/$DOMAIN/g" "$NGINX_CONF"

# Enable site
if [ ! -f "/etc/nginx/sites-enabled/rag-chatbot" ]; then
  sudo ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/rag-chatbot
fi

sudo nginx -t && sudo systemctl reload nginx
echo "  → Nginx configured for $DOMAIN"

# ── 6. SSL with Let's Encrypt ─────────────────────────────────────────────────
echo "[6/6] Setting up SSL with Certbot..."
if ! command -v certbot &> /dev/null; then
  sudo apt-get install -y certbot python3-certbot-nginx
fi

sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN" --redirect || {
  echo "  ⚠ Certbot failed. Run manually: sudo certbot --nginx -d $DOMAIN"
}

echo ""
echo "=========================================="
echo " ✅ Deployment complete!"
echo " 🌐 App: https://$DOMAIN"
echo " 📊 API docs: https://$DOMAIN/api/docs"
echo " 📦 Containers: docker compose ps"
echo " 📋 Logs: docker compose logs -f"
echo "=========================================="
