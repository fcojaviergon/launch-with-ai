#!/bin/bash
# Create Azure VM for QA deployment
set -e

RG_NAME="${AZURE_RG_NAME:?Set AZURE_RG_NAME environment variable}"
VM_NAME="${AZURE_VM_NAME:?Set AZURE_VM_NAME environment variable}"
LOCATION="eastus"

echo "🌩️  Creating Azure VM for QA"
echo "Resource Group: $RG_NAME"
echo "VM Name: $VM_NAME"
echo ""

# Check if VM already exists
if az vm show --resource-group "$RG_NAME" --name "$VM_NAME" &>/dev/null; then
    echo "✅ VM already exists"
    VM_IP=$(az vm show -d --resource-group "$RG_NAME" --name "$VM_NAME" --query publicIps -o tsv)
    echo "   IP: $VM_IP"
    exit 0
fi

# Create resource group
echo "1️⃣  Creating resource group..."
az group create --name "$RG_NAME" --location "$LOCATION"

# Create VM
echo ""
echo "2️⃣  Creating VM (this may take a few minutes)..."
az vm create \
  --resource-group "$RG_NAME" \
  --name "$VM_NAME" \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-address-allocation static \
  --output table

# Open ports
echo ""
echo "3️⃣  Opening ports..."
az vm open-port --resource-group "$RG_NAME" --name "$VM_NAME" --port 80 --priority 1001
az vm open-port --resource-group "$RG_NAME" --name "$VM_NAME" --port 443 --priority 1002

# Get VM IP
VM_IP=$(az vm show -d --resource-group "$RG_NAME" --name "$VM_NAME" --query publicIps -o tsv)

echo ""
echo "4️⃣  Installing Docker..."
ssh-keyscan -H $VM_IP >> ~/.ssh/known_hosts 2>/dev/null

ssh azureuser@$VM_IP 'bash -s' << 'ENDSSH'
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

echo "✅ Docker installed"
ENDSSH

echo ""
echo "================================"
echo "✅ VM Created Successfully!"
echo ""
echo "VM IP: $VM_IP"
echo ""
echo "⚠️  Configure DNS records:"
echo "   dashboard.\$DOMAIN -> $VM_IP"
echo "   api.\$DOMAIN -> $VM_IP"
echo "   traefik.\$DOMAIN -> $VM_IP"
echo "   adminer.\$DOMAIN -> $VM_IP"
echo ""
echo "Next step: Run ./scripts/deploy-qa.sh"
echo ""
