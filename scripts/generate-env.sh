#!/bin/bash
#
# Quick environment file generator (simplified version)
# For advanced options, use: python scripts/generate-env.py
#
# Usage:
#   ./scripts/generate-env.sh local
#   ./scripts/generate-env.sh production example.com
#   ./scripts/generate-env.sh staging qa.example.com

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to generate random string
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

generate_password() {
    openssl rand -base64 24 | tr -d "=+/" | cut -c1-24
}

# Function to validate email
validate_email() {
    if [[ $1 =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate domain
validate_domain() {
    if [[ $1 =~ ^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Check arguments
ENV_TYPE=${1:-local}
DOMAIN=${2:-localhost}

if [ "$ENV_TYPE" != "local" ] && [ "$ENV_TYPE" != "staging" ] && [ "$ENV_TYPE" != "production" ]; then
    echo -e "${RED}❌ Invalid environment type: $ENV_TYPE${NC}"
    echo "Valid options: local, staging, production"
    exit 1
fi

if [ "$ENV_TYPE" != "local" ] && [ "$DOMAIN" == "localhost" ]; then
    echo -e "${RED}❌ Domain is required for $ENV_TYPE environment${NC}"
    echo "Usage: $0 $ENV_TYPE example.com"
    exit 1
fi

if [ "$ENV_TYPE" != "local" ] && ! validate_domain "$DOMAIN"; then
    echo -e "${RED}❌ Invalid domain format: $DOMAIN${NC}"
    exit 1
fi

# Output file
OUTPUT_FILE=".env.$ENV_TYPE"

# Check if file exists
if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}⚠️  $OUTPUT_FILE already exists.${NC}"
    read -p "Overwrite? [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Cancelled.${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}🚀 Generating .env file for $ENV_TYPE environment...${NC}\n"

# Generate secrets
SECRET_KEY=$(generate_secret)
ADMIN_PASSWORD=$(generate_password)
POSTGRES_PASSWORD=$(generate_password)

# Common variables
ENV_TYPE_UPPER=$(echo "$ENV_TYPE" | tr '[:lower:]' '[:upper:]')
ENV_TYPE_CAP=$(echo "${ENV_TYPE:0:1}" | tr '[:lower:]' '[:upper:]')${ENV_TYPE:1}

cat > "$OUTPUT_FILE" << EOF
# $ENV_TYPE_UPPER ENVIRONMENT
# Generated: $(date)
# WARNING: Keep this file secure and never commit to git!

ENVIRONMENT=$ENV_TYPE
PROJECT_NAME="Launch With AI"
STACK_NAME=$(echo "$DOMAIN" | tr '.' '-')-$ENV_TYPE
TAG=latest

# Security
SECRET_KEY=$SECRET_KEY

# Database
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# OpenAI
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Anthropic (optional - for Claude models)
ANTHROPIC_API_KEY=

# Email (optional)
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
SMTP_PORT=587
SMTP_TLS=true
EMAILS_FROM_EMAIL=

# Monitoring (optional)
SENTRY_DSN=

EOF

# Environment-specific variables
if [ "$ENV_TYPE" == "local" ]; then
    cat >> "$OUTPUT_FILE" << EOF
# Local Development
DOMAIN=localhost
FRONTEND_HOST=http://localhost:5173
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DOCKER_IMAGE_BACKEND=launch-with-ai-backend
DOCKER_IMAGE_FRONTEND=launch-with-ai-frontend

# Admin User
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=$ADMIN_PASSWORD

# OpenAI (add your key)
OPENAI_API_KEY=sk-your-key-here

# Adminer Basic Auth (generate with: htpasswd -nb admin yourpassword | sed -e s/\\$/\\$\\$/g)
# Default local: admin / localadmin123
ADMINER_AUTH=admin:\$\$apr1\$\$hSUUr7uQ\$\$Jy0v.gb2I2JN9WruUqqdl1
EOF
else
    # Production/Staging
    STACK_NAME=$(echo "$DOMAIN" | tr '.' '-')

    # Prompt for admin email
    while true; do
        read -p "Admin email: " ADMIN_EMAIL
        if validate_email "$ADMIN_EMAIL"; then
            break
        else
            echo -e "${RED}❌ Invalid email format${NC}"
        fi
    done

    # Prompt for API keys
    read -p "OpenAI API key: " OPENAI_KEY
    read -p "Anthropic API key (optional, press Enter to skip): " ANTHROPIC_KEY

    cat >> "$OUTPUT_FILE" << EOF
# $ENV_TYPE_CAP Deployment
DOMAIN=$DOMAIN
FRONTEND_HOST=https://dashboard.$DOMAIN
BACKEND_CORS_ORIGINS=https://$DOMAIN,https://dashboard.$DOMAIN,https://api.$DOMAIN
DOCKER_IMAGE_BACKEND=$STACK_NAME-backend
DOCKER_IMAGE_FRONTEND=$STACK_NAME-frontend

# Admin User
FIRST_SUPERUSER=$ADMIN_EMAIL
FIRST_SUPERUSER_PASSWORD=$ADMIN_PASSWORD

# OpenAI
OPENAI_API_KEY=$OPENAI_KEY

# Anthropic (optional)
ANTHROPIC_API_KEY=$ANTHROPIC_KEY
EOF
fi

# Set restrictive permissions
chmod 600 "$OUTPUT_FILE"

echo -e "${GREEN}✅ Created $OUTPUT_FILE (permissions: 600)${NC}"

# Generate frontend/.env if it doesn't exist or user wants to overwrite
FRONTEND_ENV="frontend/.env"
if [ -d "frontend" ]; then
    GENERATE_FRONTEND=true
    if [ -f "$FRONTEND_ENV" ]; then
        echo -e "${YELLOW}⚠️  $FRONTEND_ENV already exists.${NC}"
        read -p "Overwrite frontend/.env? [y/N]: " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            GENERATE_FRONTEND=false
        fi
    fi

    if [ "$GENERATE_FRONTEND" = true ]; then
        if [ "$ENV_TYPE" == "local" ]; then
            cat > "$FRONTEND_ENV" << EOF
VITE_API_URL=http://localhost:8000
MAILCATCHER_HOST=http://localhost:1080
EOF
        else
            cat > "$FRONTEND_ENV" << EOF
VITE_API_URL=https://api.$DOMAIN
EOF
        fi
        chmod 600 "$FRONTEND_ENV"
        echo -e "${GREEN}✅ Created $FRONTEND_ENV${NC}"
    fi
fi

echo ""

# Print summary
echo "================================================================"
echo -e "${GREEN}🔐 GENERATED SECRETS FOR $ENV_TYPE_UPPER ENVIRONMENT${NC}"
echo "================================================================"
echo ""
echo -e "🔑 SECRET_KEY: ${SECRET_KEY:0:20}..."
if [ "$ENV_TYPE" != "local" ]; then
    echo -e "👤 Admin User: $ADMIN_EMAIL"
else
    echo -e "👤 Admin User: admin@example.com"
fi
echo -e "🔒 Admin Password: $ADMIN_PASSWORD"
echo -e "🗄️  Postgres User: postgres"
echo -e "🔒 Postgres Password: $POSTGRES_PASSWORD"
echo ""
echo "================================================================"
echo -e "${YELLOW}⚠️  IMPORTANT: Save these credentials securely!${NC}"
echo "================================================================"
echo ""

# Print next steps
echo "📋 NEXT STEPS:"
echo "----------------------------------------------------------------"
if [ "$ENV_TYPE" == "local" ]; then
    echo "1. Review and update .env.local with your OPENAI_API_KEY"
    echo "2. Copy to root: cp .env.local .env"
    echo "3. Start services: docker compose up -d"
    echo "4. Access at: http://localhost:5173"
else
    echo "1. Copy $OUTPUT_FILE to your server"
    echo "2. Rename to .env on the server"
    echo "3. Update docker-compose.yml to use the file"
    echo "4. Run: docker compose up -d"
    echo "5. Access at: https://dashboard.$DOMAIN"
fi
echo "----------------------------------------------------------------"
