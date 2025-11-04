# Azure Deployment Guide

Complete guide for deploying this application to Azure VM with Docker Compose and Traefik.

## Prerequisites

### 1. Azure VM Requirements

- **VM Size**: Standard B2s or larger (2 vCPUs, 4GB RAM minimum)
- **OS**: Ubuntu 22.04 LTS or later
- **Disk**: 30GB SSD minimum
- **Network**:
  - Port 80 (HTTP) - Open
  - Port 443 (HTTPS) - Open
  - Port 22 (SSH) - Open (for deployment only)

### 2. Domain Configuration

- Point your domain A record to your Azure VM public IP
- Wait for DNS propagation (can take up to 48 hours)
- Example: `flow.cunda.cl` → `20.x.x.x`

### 3. Local Requirements

- Docker installed locally (for testing)
- SSH access to Azure VM
- Git installed
- `htpasswd` tool (for generating Traefik password)

## Step 1: Prepare Azure VM

SSH into your Azure VM:

```bash
ssh azureuser@your-vm-ip
```

### Install Docker and Docker Compose

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
exit
```

SSH back in and verify Docker installation:

```bash
docker --version
docker compose version
```

## Step 2: Configure Environment Files

### Create `.env.azure` file

On your **local machine**, create `.env.azure` from the example:

```bash
cp .env.azure.example .env.azure
```

Edit `.env.azure` with your production values:

```bash
# Domain Configuration
DOMAIN=your-domain.com  # e.g., flow.cunda.cl
FRONTEND_HOST=https://your-domain.com

# Project Configuration (KEEP THESE FIXED)
PROJECT_NAME='Your Project Name'
STACK_NAME=your-project-stack
DOCKER_IMAGE_BACKEND=your-project-backend
DOCKER_IMAGE_FRONTEND=your-project-frontend
TAG=main

# Backend Security
BACKEND_CORS_ORIGINS="https://your-domain.com"
SECRET_KEY=$(openssl rand -hex 32)  # Generate secure key
FIRST_SUPERUSER=admin@yourproject.com
FIRST_SUPERUSER_PASSWORD=SecurePassword123!

# Database (KEEP THESE FIXED after first deployment)
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -hex 32)  # Generate secure password

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Email (Optional - configure later if needed)
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=

# Monitoring (Optional)
SENTRY_DSN=
```

### Create `.env.traefik` file

```bash
# Your domain
DOMAIN=your-domain.com

# Email for Let's Encrypt SSL certificates
EMAIL=admin@yourproject.com

# Traefik dashboard authentication
USERNAME=admin
# Generate hashed password with:
# echo $(htpasswd -nb admin your-password) | cut -d: -f2
HASHED_PASSWORD=your-hashed-password-here
```

**Generate the hashed password:**

```bash
# Install htpasswd if needed
sudo apt-get install apache2-utils

# Generate hash (replace 'your-password' with actual password)
echo $(htpasswd -nb admin your-password) | cut -d: -f2
```

Copy the output and paste it as `HASHED_PASSWORD` in `.env.traefik`.

## Step 3: Deploy to Azure VM

### Option A: Using Git (Recommended)

1. **On Azure VM**, clone the repository:

```bash
cd ~
git clone https://github.com/yourusername/your-project.git
cd your-project
```

2. **Copy environment files** from your local machine to Azure VM:

```bash
# On your LOCAL machine
scp .env.azure azureuser@your-vm-ip:~/your-project/
scp .env.traefik azureuser@your-vm-ip:~/your-project/
```

3. **On Azure VM**, verify files are present:

```bash
ls -la .env.azure .env.traefik
```

### Option B: Using SCP (Direct Transfer)

```bash
# On your LOCAL machine
rsync -avz --exclude='.git' --exclude='node_modules' --exclude='.venv' \
  ./ azureuser@your-vm-ip:~/your-project/

scp .env.azure azureuser@your-vm-ip:~/your-project/
scp .env.traefik azureuser@your-vm-ip:~/your-project/
```

## Step 4: Initialize Traefik Network

**On Azure VM**, create the Traefik network:

```bash
docker network create traefik-public
```

## Step 5: Start the Application

**On Azure VM**, start all services:

```bash
# Navigate to project directory
cd ~/your-project

# Build and start services
docker compose \
  -f docker-compose.yml \
  -f docker-compose.traefik.yml \
  -f docker-compose.azure.yml \
  --env-file .env.azure \
  up -d --build

# Check logs
docker compose logs -f
```

### Monitor the deployment:

```bash
# Check all containers are running
docker compose ps

# Follow logs in real-time
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f traefik
docker compose logs -f prestart

# Check specific service
docker compose logs prestart  # Should show migrations and superuser creation
```

## Step 6: Verify Deployment

### Check Services

1. **Backend API**: https://api.your-domain.com/docs
2. **Frontend**: https://dashboard.your-domain.com
3. **Traefik Dashboard**: https://traefik.your-domain.com (use admin credentials)
4. **Adminer**: https://adminer.your-domain.com

### Test Login

Go to https://dashboard.your-domain.com and login with:
- Email: The `FIRST_SUPERUSER` from `.env.azure`
- Password: The `FIRST_SUPERUSER_PASSWORD` from `.env.azure`

## Step 7: SSL Certificate Verification

Let's Encrypt certificates are automatically generated by Traefik. Check certificate status:

```bash
# View Traefik logs for certificate acquisition
docker compose logs traefik | grep -i certificate

# Certificates are stored in Docker volume
docker volume inspect rocket-genai-v2_traefik-public-certificates
```

If certificates fail to generate:
1. Verify domain DNS is pointing to VM IP
2. Ensure ports 80 and 443 are open
3. Check Traefik logs for errors
4. Wait a few minutes and restart Traefik

## Troubleshooting

### Database Connection Issues

```bash
# Check database is healthy
docker compose ps db

# View database logs
docker compose logs db

# Connect to database directly
docker compose exec db psql -U postgres -d app
```

### Backend Not Starting

```bash
# Check prestart logs (migrations)
docker compose logs prestart

# Check backend logs
docker compose logs backend

# Restart backend
docker compose restart backend
```

### Frontend Not Loading

```bash
# Check frontend logs
docker compose logs frontend

# Verify environment variable
docker compose exec frontend env | grep VITE_API_URL

# Rebuild frontend
docker compose up -d --build frontend
```

### Traefik Issues

```bash
# Check Traefik logs
docker compose logs traefik

# Verify network
docker network inspect traefik-public

# Restart Traefik
docker compose restart traefik
```

### SSL Certificate Issues

```bash
# Remove old certificates
docker volume rm rocket-genai-v2_traefik-public-certificates

# Recreate Traefik
docker compose down traefik
docker compose up -d traefik

# Watch certificate acquisition
docker compose logs -f traefik
```

## Updating the Application

### Pull Latest Changes

```bash
cd ~/your-project
git pull origin main
```

### Rebuild and Restart

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.traefik.yml \
  -f docker-compose.azure.yml \
  --env-file .env.azure \
  up -d --build
```

### Zero-Downtime Updates (Rolling Update)

```bash
# Update backend only
docker compose up -d --no-deps --build backend

# Update frontend only
docker compose up -d --no-deps --build frontend
```

## Backup and Restore

### Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
docker compose exec db pg_dump -U postgres app > ~/backups/db-backup-$(date +%Y%m%d-%H%M%S).sql

# Or use docker volume backup
docker run --rm \
  -v rocket-genai-v2_app-db-data:/data \
  -v ~/backups:/backup \
  ubuntu tar czf /backup/db-data-$(date +%Y%m%d-%H%M%S).tar.gz /data
```

### Restore Database

```bash
# Restore from SQL dump
cat ~/backups/db-backup-YYYYMMDD-HHMMSS.sql | \
  docker compose exec -T db psql -U postgres app
```

## Environment Variables Reference

### Critical Variables (DO NOT CHANGE after first deployment)

- `POSTGRES_PASSWORD` - Changing this will break database access
- `POSTGRES_USER` - Must remain `postgres`
- `POSTGRES_DB` - Must remain `app`
- `STACK_NAME` - Changing this creates new containers/volumes
- `DOCKER_IMAGE_BACKEND/FRONTEND` - Used for image naming

### Safe to Change

- `DOMAIN` - Only if migrating domains
- `FRONTEND_HOST` - Must match DOMAIN
- `BACKEND_CORS_ORIGINS` - Update when domain changes
- `FIRST_SUPERUSER` - Creates new superuser if doesn't exist
- `OPENAI_API_KEY` - Update API keys as needed
- `SMTP_*` - Email configuration
- `SENTRY_DSN` - Monitoring configuration

## Security Best Practices

1. **Change Default Passwords**: Never use example passwords in production
2. **Firewall Rules**: Only open ports 80, 443, and 22 (SSH)
3. **SSH Keys**: Use SSH keys instead of password authentication
4. **Regular Updates**: Keep OS and Docker updated
5. **Backup Regularly**: Automate daily database backups
6. **Monitor Logs**: Set up log monitoring and alerts
7. **Rotate Secrets**: Periodically rotate API keys and passwords

## Performance Optimization

### Resource Limits (Already Configured in docker-compose.azure.yml)

- Backend: 1GB RAM, 0.5 CPU
- Frontend: 512MB RAM, 0.25 CPU
- Redis: 256MB RAM, 0.25 CPU

### Scale Services

```bash
# Scale backend workers (if using Celery)
docker compose up -d --scale celery-worker=3
```

## Monitoring

### View Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Application Logs

```bash
# View all logs
docker compose logs

# Follow specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

## Support

For issues:
1. Check logs: `docker compose logs`
2. Verify environment variables
3. Check Azure VM resources (CPU, memory, disk)
4. Review Traefik dashboard for routing issues
5. Ensure DNS is properly configured

---

**Last Updated**: October 2025
**Tested On**: Azure Ubuntu 22.04 LTS
