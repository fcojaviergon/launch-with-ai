# Scripts Documentation

This folder contains useful scripts for management and deployment of Launch With AI.

## Table of Contents

- [Environment File Generation](#-environment-file-generation)
- [Azure Deployment](#-azure-deployment-scripts)

---

## Environment File Generation

Two scripts to generate `.env` files with secure values automatically:

### Python Script (Recommended) - `generate-env.py`

**Features:**
- Interactive email and domain validation
- Secure secret generation (32 characters)
- Templates for local, staging and production
- Automatic permissions (600)
- Creates .example files for documentation

**Basic usage:**

```bash
# Local development
python scripts/generate-env.py --env local

# Production (interactive)
python scripts/generate-env.py --env production --domain example.com

# Staging/QA
python scripts/generate-env.py --env staging --domain qa.example.com

# Overwrite existing file
python scripts/generate-env.py --env production --domain example.com --force
```

**Example output:**
```
Generating .env file for production environment...

Admin email: admin@example.com
OpenAI API key: sk-...

Created .env.production (permissions: 600)

================================================================
GENERATED SECRETS FOR PRODUCTION ENVIRONMENT
================================================================

SECRET_KEY: AbCdEf123456...
Admin User: admin@example.com
Admin Password: xYz789AbC...
Postgres User: postgres
Postgres Password: pQr456XyZ...

================================================================
IMPORTANT: Save these credentials securely!
================================================================
```

### Bash Script (Quick) - `generate-env.sh`

**Features:**
- Simple command-line interface
- Secure generation using OpenSSL
- No Python dependencies

**Usage:**

```bash
# Local development
./scripts/generate-env.sh local

# Production
./scripts/generate-env.sh production example.com

# Staging
./scripts/generate-env.sh staging qa.example.com
```

**Requires:** `openssl` (pre-installed on Linux/macOS)

### Automatically Generated Values

| Variable | Method | Length | Example |
|----------|--------|--------|---------|
| `SECRET_KEY` | `secrets.token_urlsafe()` | 32 chars | `xK9pL2mN5qR8sT1vW4yZ...` |
| `FIRST_SUPERUSER_PASSWORD` | `secrets.choice()` | 24 chars | `AbC123XyZ789PqR456...` |
| `POSTGRES_PASSWORD` | `secrets.choice()` | 24 chars | `MnO789StU012VwX345...` |

### Security

**NEVER commit .env files to git**

The `.gitignore` is configured to block:
```gitignore
.env
.env.*
!.env.example
!.env.*.example
```

**Automatic permissions:**
```bash
-rw------- 1 user user 1234 Nov 5 12:00 .env.production  # 600
```

**Rotate secrets regularly:**
- After security incidents
- When team members leave
- Every 90 days in production

### Deployment with Generated .env

1. **Generate file:**
   ```bash
   python scripts/generate-env.py --env production --domain example.com
   ```

2. **Save credentials:**
   - Password manager (1Password, Bitwarden)
   - Share securely (never via email/Slack)

3. **Copy to server:**
   ```bash
   scp .env.production user@server:/path/to/app/.env
   ```

4. **Apply on server:**
   ```bash
   ssh user@server "cd /path/to/app && docker compose restart"
   ```

### Environment Variables - Quick Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | auto | JWT signing key (32 chars) |
| `FIRST_SUPERUSER` | Yes | - | Admin email |
| `FIRST_SUPERUSER_PASSWORD` | Yes | auto | Admin password |
| `POSTGRES_PASSWORD` | Yes | auto | DB password |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Model to use |
| `DOMAIN` | Yes* | `localhost` | Domain (*prod/staging) |
| `SENTRY_DSN` | No | - | Error tracking |

---

## Azure Deployment Scripts

### QA/Staging Environment

- **`azure-setup.sh`** - Creates Azure infrastructure for QA
- **`configure-env.sh`** - Configures `.env.azure` and `.env.traefik` files for QA
- **`deploy-to-azure.sh`** - Deploys the application to QA

### Production Environment

- **`azure-setup-prod.sh`** - Creates Azure infrastructure for PRODUCTION
- **`configure-env-prod.sh`** - Configures files for PRODUCTION *(create when needed)*
- **`deploy-to-azure-prod.sh`** - Deploys the application to PRODUCTION *(create when needed)*

## QA Deployment (flow.cunda.io)

### Step 1: Azure CLI Login

```bash
az login
```

### Step 2: Create QA VM

```bash
./scripts/azure-setup.sh
```

**Creates:**
- Resource Group: `rg-flow-cunda-qa`
- VM: `vm-flow-cunda-qa` (Standard_B2s: 2 vCPUs, 4GB RAM)
- Ports: 80, 443, 22
- Saves IP to: `.azure-vm-ip`

### Step 3: Configure DNS

With the IP provided by the script, configure in your DNS:

```
Type: A | Host: flow | Value: [VM-IP] | TTL: 3600
Type: A | Host: *.flow | Value: [VM-IP] | TTL: 3600
```

### Step 4: Configure Environment

```bash
./scripts/configure-env.sh
```

**Prompts for:**
- SSL email
- Superuser email
- Passwords
- OpenAI API Key

**Generates:**
- `.env.azure` - Azure configuration
- `.env.traefik` - Traefik configuration
- `.azure-secrets.txt` - **SAVE SECURELY**

### Step 5: Deploy

```bash
./scripts/deploy-to-azure.sh
```

**Actions:**
- Installs Docker on VM
- Transfers code
- Configures services
- Brings up the entire stack
- Generates SSL certificates automatically

### QA URLs

- **Frontend**: https://dashboard.flow.cunda.io
- **Backend**: https://api.flow.cunda.io/docs
- **Traefik**: https://traefik.flow.cunda.io
- **Adminer**: https://adminer.flow.cunda.io

## Production Deployment

### QA vs Production Differences

| Aspect | QA | Production |
|--------|-----|-----------|
| Resource Group | `rg-flow-cunda-qa` | `rg-flow-cunda-prod` |
| VM Name | `vm-flow-cunda-qa` | `vm-flow-cunda-prod` |
| VM Size | Standard_B2s (4GB) | Standard_B2ms (8GB) |
| Environment | `development` | `production` |
| Stack Name | `flow-cunda-qa` | `flow-cunda-prod` |
| Cost | ~$35/month | ~$70/month |

### Production Deployment

```bash
# 1. Create production VM
./scripts/azure-setup-prod.sh

# 2. Configure environment (create script when needed)
./scripts/configure-env-prod.sh

# 3. Deploy to production (create script when needed)
./scripts/deploy-to-azure-prod.sh
```

## Useful Post-Deployment Commands

### Check Status

```bash
# QA
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose ps"

# Production
ssh azureuser@$(cat .azure-vm-ip-prod) "cd ~/rocket-genai-v2 && docker compose ps"
```

### View Logs

```bash
# QA - View real-time logs
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs -f"

# View specific logs
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs backend"
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs frontend"
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs traefik"
```

### Restart Services

```bash
# Restart all
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose restart"

# Restart specific service
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose restart backend"
```

### Update Code

```bash
# Full redeploy
./scripts/deploy-to-azure.sh

# Rebuild backend only
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose up -d --no-deps --build backend"

# Rebuild frontend only
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose up -d --no-deps --build frontend"
```

## Security

### Sensitive Files (DO NOT COMMIT)

The following files are in `.gitignore`:

- `.env.azure` - Azure environment variables
- `.env.traefik` - Traefik configuration
- `.azure-vm-ip` - QA VM IP
- `.azure-vm-ip-prod` - Production VM IP
- `.azure-secrets.txt` - **CRITICAL: Passwords and secrets**
- `.azure-deployment-info.txt` - Deployment info

### Secrets Backup

```bash
# Secure backup
cp .azure-secrets.txt ~/Backups/flow-cunda-secrets-$(date +%Y%m%d).txt

# Or use a password manager (1Password, Bitwarden, etc.)
```

## Resource Cleanup

### Delete QA Resources

```bash
az group delete --name rg-flow-cunda-qa --yes --no-wait
```

### Delete Production Resources

```bash
# DANGEROUS - Only if you are SURE
az group delete --name rg-flow-cunda-prod --yes --no-wait
```

## Cost Monitoring

### View Estimated Costs

```bash
# QA
az consumption usage list \
  --resource-group rg-flow-cunda-qa \
  --start-date $(date -d "30 days ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)

# Production
az consumption usage list \
  --resource-group rg-flow-cunda-prod \
  --start-date $(date -d "30 days ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)
```

## Troubleshooting

### Cannot Connect via SSH

```bash
# Check IP
az vm show -d \
  --resource-group rg-flow-cunda-qa \
  --name vm-flow-cunda-qa \
  --query publicIps -o tsv

# Check NSG (ports)
az network nsg rule list \
  --resource-group rg-flow-cunda-qa \
  --nsg-name vm-flow-cunda-qaNSG \
  --output table
```

### Services Won't Start

```bash
# Connect to VM
ssh azureuser@$(cat .azure-vm-ip)

# View logs
cd ~/rocket-genai-v2
docker compose logs

# Restart everything
docker compose down
docker compose up -d --build
```

### SSL Not Working

```bash
# Verify DNS points to correct IP
nslookup flow.cunda.io

# View Traefik logs
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs traefik"

# Restart Traefik
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose restart traefik"
```

## Additional Resources

- [Azure CLI Documentation](https://docs.microsoft.com/en-us/cli/azure/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Last updated**: October 2025
