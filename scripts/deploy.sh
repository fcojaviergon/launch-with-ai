#!/bin/bash
# Deploy helper script that runs on your LOCAL machine
# This script pushes code to git and triggers deployment on the server
set -e

# Configuration
AZURE_VM_USER="azureuser"

# Get VM IP dynamically from Azure
RG_NAME="rg-flow-cunda-qa2"
VM_NAME="vm-flow-cunda-qa2"
echo "🔍 Getting VM IP from Azure..."
AZURE_VM_HOST=$(az vm show -d --resource-group "$RG_NAME" --name "$VM_NAME" --query publicIps -o tsv)

if [ -z "$AZURE_VM_HOST" ]; then
    echo "❌ Could not get VM IP from Azure. Make sure Azure CLI is configured."
    exit 1
fi

echo "🚀 Deploying to Azure QA"
echo "Target: $AZURE_VM_USER@$AZURE_VM_HOST"
echo ""

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit them now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
    else
        echo "❌ Please commit your changes before deploying"
        exit 1
    fi
fi

# Push to git
echo "1️⃣  Pushing code to git..."
git push origin main
echo "✅ Code pushed"
echo ""

# SSH to server and run deployment script
echo "2️⃣  Connecting to server and deploying..."
ssh $AZURE_VM_USER@$AZURE_VM_HOST 'bash -s' < scripts/deploy-azure.sh

echo ""
echo "================================"
echo "✅ Deployment triggered successfully!"
echo ""
echo "🌐 Your application should be updated at:"
echo "   https://dashboard.flow.cunda.io"
echo "================================"
