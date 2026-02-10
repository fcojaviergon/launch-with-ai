# Launch With AI — Deployment Guide

Production deployment with Docker Compose, Traefik reverse proxy, and GitHub Actions CI/CD.

## Quick Deploy

```bash
# After initial setup, just push to deploy
git push origin main  # Auto-deploys via GitHub Actions
```

## Prerequisites

1. Remote server with Docker installed (Docker Engine, not Desktop)
2. DNS configured: domain + wildcard subdomain (`*.your-domain.com`)
3. GitHub Actions self-hosted runner (for CI/CD)

## Production URLs

Replace `your-domain.com` with your actual domain.

| Service | URL |
|---------|-----|
| Frontend | `https://dashboard.your-domain.com` |
| Backend API | `https://api.your-domain.com` |
| API Docs | `https://api.your-domain.com/docs` |
| Traefik Dashboard | `https://traefik.your-domain.com` |
| Adminer | `https://adminer.your-domain.com` |

### Staging URLs

| Service | URL |
|---------|-----|
| Frontend | `https://dashboard.staging.your-domain.com` |
| Backend API | `https://api.staging.your-domain.com` |

## Initial Server Setup

### 1. Setup Traefik Proxy

Traefik handles HTTPS certificates and routes traffic to services.

```bash
# On your server
mkdir -p /root/code/traefik-public/
```

Copy the Traefik config from your local machine:

```bash
rsync -a docker-compose.traefik.yml root@your-server:/root/code/traefik-public/
```

Create Docker network:

```bash
docker network create traefik-public
```

### 2. Configure Traefik Environment

```bash
# Set variables
export USERNAME=admin
export PASSWORD=your-secure-password
export HASHED_PASSWORD=$(openssl passwd -apr1 $PASSWORD)
export DOMAIN=your-domain.com
export EMAIL=admin@your-domain.com
```

### 3. Start Traefik

```bash
cd /root/code/traefik-public/
docker compose -f docker-compose.traefik.yml up -d
```

## Environment Variables

### Required for Production

| Variable | Description |
|----------|-------------|
| `ENVIRONMENT` | `staging` or `production` |
| `DOMAIN` | Your domain (e.g., `your-domain.com`) |
| `SECRET_KEY` | JWT signing key |
| `POSTGRES_PASSWORD` | Database password |
| `FIRST_SUPERUSER` | Admin email |
| `FIRST_SUPERUSER_PASSWORD` | Admin password |
| `OPENAI_API_KEY` | For AI features |

### Optional

| Variable | Description |
|----------|-------------|
| `PROJECT_NAME` | Display name in docs/emails |
| `STACK_NAME` | Docker Compose stack name |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins |
| `SMTP_HOST` | Email server |
| `SMTP_USER` | Email username |
| `SMTP_PASSWORD` | Email password |
| `SENTRY_DSN` | Error tracking |

### Generate Secrets

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Manual Deployment

With environment variables set:

```bash
docker compose -f docker-compose.yml up -d
```

Note: Don't include `docker-compose.override.yml` in production.

## CI/CD with GitHub Actions

### 1. Install Self-Hosted Runner

On your server:

```bash
# Create dedicated user
sudo adduser github
sudo usermod -aG docker github

# Switch to github user
sudo su - github
cd
```

Follow [GitHub's guide](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners) to install the runner.

Add a label matching your environment (`staging` or `production`).

### 2. Install as Service

```bash
# As root
cd /home/github/actions-runner
./svc.sh install github
./svc.sh start
./svc.sh status
```

### 3. Configure GitHub Secrets

Add these secrets in GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `DOMAIN_PRODUCTION` | Production domain |
| `DOMAIN_STAGING` | Staging domain |
| `STACK_NAME_PRODUCTION` | Production stack name |
| `STACK_NAME_STAGING` | Staging stack name |
| `SECRET_KEY` | JWT signing key |
| `POSTGRES_PASSWORD` | Database password |
| `FIRST_SUPERUSER` | Admin email |
| `FIRST_SUPERUSER_PASSWORD` | Admin password |
| `EMAILS_FROM_EMAIL` | Sender email |
| `LATEST_CHANGES` | For release notes |
| `SMOKESHOW_AUTH_KEY` | For coverage reports |

### Deployment Triggers

| Environment | Trigger |
|-------------|---------|
| Staging | Push to `master` branch |
| Production | Publish a release |

## SSH Access

```bash
ssh azureuser@<VM_IP>
cd ~/launch-with-ai

# View logs
docker compose logs -f backend

# Restart service
docker compose restart backend

# Full restart
docker compose down && docker compose -f docker-compose.yml up -d
```

## Troubleshooting

### Check Service Status

```bash
docker compose ps
docker compose logs backend --tail 100
```

### Traefik Issues

```bash
docker compose -f docker-compose.traefik.yml logs
```

### Database Connection

```bash
docker compose exec backend bash
python -c "from app.core.db import engine; print(engine.url)"
```

## Related Documentation

- [Main README](../README.md) — Project overview
- [CLAUDE.md](../CLAUDE.md) — Development guide
- [Development Guide](./development.md) — Local development
