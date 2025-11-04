#!/bin/bash
# Deploy to Azure QA following docs/deployment.md approach
set -e

DOMAIN="flow.cunda.io"
EMAIL="javo@cunda.io"
RG_NAME="rg-flow-cunda-qa2"
VM_NAME="vm-flow-cunda-qa2"
ADMIN_USER="azureuser"

# Get VM IP from Azure
echo "🔍 Getting VM IP..."
VM_IP=$(az vm show -d --resource-group "$RG_NAME" --name "$VM_NAME" --query publicIps -o tsv)

if [ -z "$VM_IP" ]; then
    echo "❌ Could not get VM IP. Make sure VM exists."
    echo "   Run: ./scripts/create-azure-vm.sh"
    exit 1
fi

echo "🚀 Deploying to Azure QA"
echo "Domain: $DOMAIN"
echo "VM: $VM_IP"
echo ""

# Step 1: Create traefik-public network on server
echo "1️⃣  Creating traefik-public network..."
ssh $ADMIN_USER@$VM_IP 'bash -s' << 'ENDSSH'
if ! docker network ls | grep -q traefik-public; then
    docker network create traefik-public
    echo "✅ Created traefik-public network"
else
    echo "✅ traefik-public network already exists"
fi
ENDSSH

# Step 2: Create Traefik directory on server
echo ""
echo "2️⃣  Setting up Traefik..."
ssh $ADMIN_USER@$VM_IP "mkdir -p ~/traefik-public"

# Step 3: Transfer Traefik compose file
scp docker-compose.traefik.yml $ADMIN_USER@$VM_IP:~/traefik-public/

# Step 4: Generate Traefik password and start Traefik
echo ""
echo "3️⃣  Starting Traefik..."

TRAEFIK_PASSWORD=$(openssl rand -base64 12 | tr -d '/+=' | head -c 16)

ssh $ADMIN_USER@$VM_IP "bash -s" << ENDSSH
cd ~/traefik-public

# Generate hashed password (escape $ for docker compose)
HASHED_PASSWORD=\$(docker run --rm httpd:2.4-alpine htpasswd -nb admin "$TRAEFIK_PASSWORD" | cut -d ":" -f 2 | sed 's/\\\$/\\\$\\\$/g')

# Create .env file for Traefik
cat > .env << EOF
DOMAIN=$DOMAIN
EMAIL=$EMAIL
USERNAME=admin
HASHED_PASSWORD=\$HASHED_PASSWORD
EOF

# Start Traefik with .env file
docker compose -f docker-compose.traefik.yml up -d

echo "✅ Traefik started"
ENDSSH

# Step 5: Setup GitHub SSH Deploy Key
echo ""
echo "4️⃣  Setting up GitHub SSH Deploy Key..."

ssh $ADMIN_USER@$VM_IP 'bash -s' << 'ENDSSH'
# Generate SSH key for GitHub if it doesn't exist
if [ ! -f ~/.ssh/github_deploy_key ]; then
    ssh-keygen -t ed25519 -C "github-deploy-key" -f ~/.ssh/github_deploy_key -N ""
    echo "✅ Generated SSH deploy key"
else
    echo "✅ SSH deploy key already exists"
fi

# Configure SSH to use the deploy key for GitHub
mkdir -p ~/.ssh
cat > ~/.ssh/config << 'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_deploy_key
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config
echo "✅ Configured SSH for GitHub"
ENDSSH

# Get the public key to add to GitHub
echo ""
echo "📋 Copy this public key and add it as a Deploy Key in GitHub:"
echo "   Go to: https://github.com/vaibes-dev/flow-seguros-la-camara/settings/keys/new"
echo "   Title: Azure QA Deploy Key"
echo "   Key:"
echo ""
ssh $ADMIN_USER@$VM_IP "cat ~/.ssh/github_deploy_key.pub"
echo ""
read -p "Press Enter after you've added the Deploy Key to GitHub..."

# Step 6: Generate application secrets
echo ""
echo "5️⃣  Generating application secrets..."

SECRET_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
SUPERUSER_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)

# Step 7: Clone repository and create .env file
echo ""
echo "6️⃣  Cloning repository..."

ssh $ADMIN_USER@$VM_IP "bash -s" << ENDSSH
# Clone repository if it doesn't exist
if [ ! -d ~/rocket-genai-v2 ]; then
    git clone git@github.com:vaibes-dev/flow-seguros-la-camara.git ~/rocket-genai-v2
    echo "✅ Repository cloned"
else
    echo "✅ Repository already exists"
    cd ~/rocket-genai-v2
    git pull origin main
fi
ENDSSH

# Create .env file on server
echo "  Creating environment file..."
ssh $ADMIN_USER@$VM_IP "bash -s" << EOF
cat > ~/rocket-genai-v2/.env << 'ENVEOF'
# Domain Configuration
DOMAIN=$DOMAIN
FRONTEND_HOST=https://dashboard.$DOMAIN

# Environment
ENVIRONMENT=staging

# Project Configuration
PROJECT_NAME='Flow Cunda QA'
STACK_NAME=flow-cunda-qa
DOCKER_IMAGE_BACKEND=flow-cunda-backend-qa
DOCKER_IMAGE_FRONTEND=flow-cunda-frontend-qa
TAG=main

# Backend Security
BACKEND_CORS_ORIGINS="https://$DOMAIN,https://dashboard.$DOMAIN,https://api.$DOMAIN"
SECRET_KEY=$SECRET_KEY

# Admin User
FIRST_SUPERUSER=fran@cunda.io
FIRST_SUPERUSER_PASSWORD=$SUPERUSER_PASSWORD

# Database
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Optional
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=
SENTRY_DSN=
ENVEOF
EOF

echo "✅ Repository and environment configured"

# Step 8: Start application
echo ""
echo "7️⃣  Starting application..."

ssh $ADMIN_USER@$VM_IP 'bash -s' << 'ENDSSH'
cd ~/rocket-genai-v2

# Build and start (only docker-compose.yml, NO override, NO traefik compose)
docker compose -f docker-compose.yml build
docker compose -f docker-compose.yml up -d

echo "✅ Application started"
echo ""
echo "⏳ Waiting for services..."
sleep 30

docker compose ps
ENDSSH

# Cleanup
rm -f .env.deploy

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo ""
echo "🔐 CREDENTIALS:"
echo "   Admin Email: fran@cunda.io"
echo "   Admin Password: $SUPERUSER_PASSWORD"
echo "   Traefik User: admin"
echo "   Traefik Password: $TRAEFIK_PASSWORD"
echo ""
echo "🌐 URLs:"
echo "   Frontend:   https://dashboard.$DOMAIN"
echo "   Backend:    https://api.$DOMAIN/docs"
echo "   Traefik:    https://traefik.$DOMAIN"
echo "   Adminer:    https://adminer.$DOMAIN"
echo ""
echo "⚠️  SSL certificates will be generated automatically by Let's Encrypt"
echo "    This may take a few minutes on first access"
echo ""
