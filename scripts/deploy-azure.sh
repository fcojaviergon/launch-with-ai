#!/bin/bash
# Deploy script that runs ON the Azure VM server
# This script pulls latest code and restarts services
set -e

echo "🚀 Starting deployment on Azure VM..."
echo ""

# Navigate to project directory
cd ~/launch-with-ai

# Pull latest changes from git
echo "1️⃣  Pulling latest code from git..."
git pull origin main
echo "✅ Code updated"
echo ""

# Build images with existing .env (don't touch it!)
echo "2️⃣  Building Docker images..."
docker compose -f docker-compose.yml build
echo "✅ Images built"
echo ""

# Restart services (migrations run automatically via prestart.sh)
echo "3️⃣  Restarting services..."
docker compose -f docker-compose.yml up -d
echo "✅ Services restarted"
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10
echo ""

# Show service status
echo "4️⃣  Service Status:"
docker compose ps
echo ""

# Show recent logs
echo "5️⃣  Recent logs (last 30 lines):"
docker compose logs --tail=30
echo ""

echo "================================"
echo "✅ Deployment Complete!"
echo ""
echo "🌐 URLs:"
echo "   Frontend:   https://dashboard.\$DOMAIN"
echo "   Backend:    https://api.\$DOMAIN/docs"
echo "   Traefik:    https://traefik.\$DOMAIN"
echo "   Adminer:    https://adminer.\$DOMAIN"
echo ""
echo "📊 Check full logs: docker compose logs -f"
echo "================================"
