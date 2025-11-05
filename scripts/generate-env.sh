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
PROJECT_NAME="Rocket GenAI $ENV_TYPE_CAP"
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

# OpenAI
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Email (optional)
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
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
DOCKER_IMAGE_BACKEND=rocket-genai-backend-local
DOCKER_IMAGE_FRONTEND=rocket-genai-frontend-local

# Admin User
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=$ADMIN_PASSWORD

# OpenAI (add your key)
OPENAI_API_KEY=sk-your-key-here
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

    # Prompt for OpenAI key
    read -p "OpenAI API key: " OPENAI_KEY

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
EOF
fi

# Set restrictive permissions
chmod 600 "$OUTPUT_FILE"

echo -e "${GREEN}✅ Created $OUTPUT_FILE (permissions: 600)${NC}\n"

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
    echo "1. Review and update .env.local with your OpenAI API key"
    echo "2. Start services: docker compose up -d"
    echo "3. Access at: http://localhost:5173"
else
    echo "1. Copy $OUTPUT_FILE to your server"
    echo "2. Rename to .env on the server"
    echo "3. Update docker-compose.yml to use the file"
    echo "4. Run: docker compose up -d"
    echo "5. Access at: https://dashboard.$DOMAIN"
fi
echo "----------------------------------------------------------------"
