# Setup GitHub Actions for Auto-Deploy

This guide will help you configure GitHub Actions to automatically deploy to your Azure VM when you push to the `main` branch.

## Prerequisites

- ✅ Azure VM already deployed (via `deploy-qa.sh`)
- ✅ SSH access to the server working
- ✅ Git repository on the server at `~/rocket-genai-v2`

## Step 1: Get Your SSH Private Key

On your **local machine**, you need to get the private SSH key that you use to connect to Azure:

```bash
# Option A: If you created a specific key for Azure
cat ~/.ssh/id_rsa_azure
# Copy the entire output (including -----BEGIN and -----END lines)

# Option B: If you use the default key
cat ~/.ssh/id_rsa
# Copy the entire output

# Option C: If you're not sure which key
ls -la ~/.ssh/
# Look for files like id_rsa, id_ed25519, azure_key, etc.
```

**Important:** Copy the PRIVATE key (the one WITHOUT `.pub` extension)

## Step 2: Get Your VM IP Address

```bash
# Option A: If you have Azure CLI
az vm show -d \
  --resource-group rg-flow-cunda-qa2 \
  --name vm-flow-cunda-qa2 \
  --query publicIps -o tsv

# Option B: From your .env file
cat .env | grep DOMAIN
# Then ping or nslookup flow.cunda.io

# Option C: Manual - check Azure Portal
# Go to: Azure Portal → Virtual Machines → vm-flow-cunda-qa2 → Overview
# Look for "Public IP address"
```

Your IP should be: **172.190.78.125** (from scripts/deploy.sh)

## Step 3: Configure GitHub Secrets

1. **Go to your GitHub repository**
   - URL: `https://github.com/YOUR_USERNAME/rocket-genai-v2`

2. **Navigate to Settings**
   - Click **Settings** (top right, requires admin access)

3. **Go to Secrets and Variables**
   - Left sidebar → **Secrets and variables** → **Actions**

4. **Add Repository Secrets**
   Click **"New repository secret"** and add each of these:

### Secret 1: AZURE_VM_HOST
```
Name: AZURE_VM_HOST
Value: 172.190.78.125
```
(or your actual VM IP address)

### Secret 2: AZURE_VM_USER
```
Name: AZURE_VM_USER
Value: azureuser
```

### Secret 3: AZURE_VM_SSH_KEY
```
Name: AZURE_VM_SSH_KEY
Value: [Paste your ENTIRE private SSH key here]
```

**Example format:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYEAtM5xQKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
... (many lines) ...
-----END OPENSSH PRIVATE KEY-----
```

### Secret 4: AZURE_VM_PORT (Optional)
```
Name: AZURE_VM_PORT
Value: 22
```
(only if you use a different SSH port)

## Step 4: Verify Configuration

After adding all secrets, you should see:

```
AZURE_VM_HOST      Updated X minutes ago
AZURE_VM_USER      Updated X minutes ago
AZURE_VM_SSH_KEY   Updated X minutes ago
AZURE_VM_PORT      Updated X minutes ago (optional)
```

## Step 5: Test the Workflow

### Option A: Push to Main (Automatic)
```bash
# Make a small change
echo "# CI/CD Test" >> README.md
git add README.md
git commit -m "test: CI/CD workflow"
git push origin main

# GitHub Actions will automatically:
# 1. Run tests
# 2. Deploy to Azure if tests pass
```

### Option B: Manual Trigger
1. Go to **Actions** tab in GitHub
2. Click **Deploy to Azure VM**
3. Click **Run workflow** → **Run workflow**

## Step 6: Monitor Deployment

1. Go to **Actions** tab
2. Click on the latest workflow run
3. Watch the logs in real-time

You should see:
- ✅ Backend tests passing
- ✅ Frontend build succeeding
- ✅ SSH connection to server
- ✅ Git pull
- ✅ Docker build
- ✅ Services restarting

## Troubleshooting

### Error: "Permission denied (publickey)"
**Problem:** SSH key is incorrect or not authorized

**Solution:**
1. Verify the SSH key is correct (try SSH manually first)
2. Make sure you copied the ENTIRE key including BEGIN/END lines
3. Check that the key has no extra spaces or line breaks

### Error: "Host key verification failed"
**Problem:** GitHub Actions doesn't trust the server's host key

**Solution:** Add this to your workflow (already included):
```yaml
- name: Add SSH known hosts
  run: |
    mkdir -p ~/.ssh
    ssh-keyscan -H ${{ secrets.AZURE_VM_HOST }} >> ~/.ssh/known_hosts
```

### Error: "Tests failed"
**Problem:** Tests are failing, deployment is blocked

**Solution:** Fix the tests locally first:
```bash
# Backend tests
cd backend
./scripts/test.sh

# Frontend build
cd frontend
npm run build
npm run lint
```

### Manual Deployment Still Works
If GitHub Actions fails, you can always deploy manually:
```bash
./scripts/deploy.sh
```

## What Happens on Each Push

```mermaid
graph LR
    A[git push main] --> B[GitHub Actions]
    B --> C{Run Tests}
    C -->|Pass| D[SSH to Azure VM]
    C -->|Fail| E[❌ Stop - Fix Tests]
    D --> F[git pull]
    F --> G[docker compose build]
    G --> H[docker compose up -d]
    H --> I[✅ Deployed]
```

## Next Steps

Once GitHub Actions is working:

1. **Remove manual deployment** - Just push to main
2. **Add status badge** to README:
   ```markdown
   ![Deploy Status](https://github.com/YOUR_USERNAME/rocket-genai-v2/actions/workflows/deploy-azure.yml/badge.svg)
   ```
3. **Monitor deployments** in Actions tab

---

## Summary

✅ Secrets configured in GitHub
✅ Workflow runs on push to main
✅ Tests run before deploy
✅ Auto-deploy to Azure in 2-3 minutes
✅ Manual fallback available

**Your CI/CD is now complete!** 🎉
