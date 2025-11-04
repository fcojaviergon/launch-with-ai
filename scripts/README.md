# Scripts de Deployment Azure

Scripts automatizados para deployment en Azure de **flow.cunda.io**

## 📁 Estructura de Scripts

### QA/Staging Environment

- **`azure-setup.sh`** - Crea infraestructura Azure para QA
- **`configure-env.sh`** - Configura archivos `.env.azure` y `.env.traefik` para QA
- **`deploy-to-azure.sh`** - Despliega la aplicación en QA

### Production Environment

- **`azure-setup-prod.sh`** - Crea infraestructura Azure para PRODUCCIÓN
- **`configure-env-prod.sh`** - Configura archivos para PRODUCCIÓN *(crear cuando se necesite)*
- **`deploy-to-azure-prod.sh`** - Despliega la aplicación en PRODUCCIÓN *(crear cuando se necesite)*

## 🚀 Deployment QA (flow.cunda.io)

### Paso 1: Login Azure CLI

```bash
az login
```

### Paso 2: Crear VM de QA

```bash
./scripts/azure-setup.sh
```

**Crea:**
- Resource Group: `rg-flow-cunda-qa`
- VM: `vm-flow-cunda-qa` (Standard_B2s: 2 vCPUs, 4GB RAM)
- Puertos: 80, 443, 22
- Guarda IP en: `.azure-vm-ip`

### Paso 3: Configurar DNS

Con la IP que te dio el script, configura en tu DNS:

```
Tipo: A | Host: flow | Valor: [IP-DE-LA-VM] | TTL: 3600
Tipo: A | Host: *.flow | Valor: [IP-DE-LA-VM] | TTL: 3600
```

### Paso 4: Configurar Environment

```bash
./scripts/configure-env.sh
```

**Te pregunta:**
- Email para SSL
- Email superusuario
- Passwords
- OpenAI API Key

**Genera:**
- `.env.azure` - Configuración de Azure
- `.env.traefik` - Configuración de Traefik
- `.azure-secrets.txt` - ⚠️ **GUARDAR DE FORMA SEGURA**

### Paso 5: Deploy

```bash
./scripts/deploy-to-azure.sh
```

**Hace:**
- Instala Docker en VM
- Transfiere código
- Configura servicios
- Levanta toda la stack
- Genera certificados SSL automáticamente

**Tiempo:** ~5-10 minutos

### URLs QA

- **Frontend**: https://dashboard.flow.cunda.io
- **Backend**: https://api.flow.cunda.io/docs
- **Traefik**: https://traefik.flow.cunda.io
- **Adminer**: https://adminer.flow.cunda.io

## 🏭 Deployment PRODUCCIÓN

### Diferencias QA vs Producción

| Aspecto | QA | Producción |
|---------|-----|-----------|
| Resource Group | `rg-flow-cunda-qa` | `rg-flow-cunda-prod` |
| VM Name | `vm-flow-cunda-qa` | `vm-flow-cunda-prod` |
| VM Size | Standard_B2s (4GB) | Standard_B2ms (8GB) |
| Environment | `development` | `production` |
| Stack Name | `flow-cunda-qa` | `flow-cunda-prod` |
| Costos | ~$35/mes | ~$70/mes |

### Deployment Producción

```bash
# 1. Crear VM de producción
./scripts/azure-setup-prod.sh

# 2. Configurar environment (crear script cuando sea necesario)
./scripts/configure-env-prod.sh

# 3. Deploy a producción (crear script cuando sea necesario)
./scripts/deploy-to-azure-prod.sh
```

## 📋 Comandos Útiles Post-Deployment

### Verificar status

```bash
# QA
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose ps"

# Producción
ssh azureuser@$(cat .azure-vm-ip-prod) "cd ~/rocket-genai-v2 && docker compose ps"
```

### Ver logs

```bash
# QA - Ver logs en tiempo real
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs -f"

# Ver logs específicos
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs backend"
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs frontend"
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs traefik"
```

### Reiniciar servicios

```bash
# Reiniciar todo
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose restart"

# Reiniciar servicio específico
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose restart backend"
```

### Actualizar código

```bash
# Redeploy completo
./scripts/deploy-to-azure.sh

# Solo rebuild backend
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose up -d --no-deps --build backend"

# Solo rebuild frontend
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose up -d --no-deps --build frontend"
```

## 🔐 Seguridad

### Archivos sensibles (NO COMMITEAR)

Los siguientes archivos están en `.gitignore`:

- `.env.azure` - Variables de entorno Azure
- `.env.traefik` - Configuración Traefik
- `.azure-vm-ip` - IP de VM QA
- `.azure-vm-ip-prod` - IP de VM Producción
- `.azure-secrets.txt` - ⚠️ **CRÍTICO: Passwords y secrets**
- `.azure-deployment-info.txt` - Info de deployment

### Backup de secrets

```bash
# Hacer backup seguro
cp .azure-secrets.txt ~/Backups/flow-cunda-secrets-$(date +%Y%m%d).txt

# O usar gestor de passwords (1Password, Bitwarden, etc.)
```

## 🧹 Limpieza de Recursos

### Eliminar recursos QA

```bash
az group delete --name rg-flow-cunda-qa --yes --no-wait
```

### Eliminar recursos Producción

```bash
# ⚠️ PELIGROSO - Solo si estás SEGURO
az group delete --name rg-flow-cunda-prod --yes --no-wait
```

## 📊 Monitoreo de Costos

### Ver costos estimados

```bash
# QA
az consumption usage list \
  --resource-group rg-flow-cunda-qa \
  --start-date $(date -d "30 days ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)

# Producción
az consumption usage list \
  --resource-group rg-flow-cunda-prod \
  --start-date $(date -d "30 days ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)
```

## 🆘 Troubleshooting

### No se puede conectar por SSH

```bash
# Verificar IP
az vm show -d \
  --resource-group rg-flow-cunda-qa \
  --name vm-flow-cunda-qa \
  --query publicIps -o tsv

# Verificar NSG (puertos)
az network nsg rule list \
  --resource-group rg-flow-cunda-qa \
  --nsg-name vm-flow-cunda-qaNSG \
  --output table
```

### Servicios no inician

```bash
# Conectar a VM
ssh azureuser@$(cat .azure-vm-ip)

# Ver logs
cd ~/rocket-genai-v2
docker compose logs

# Reiniciar todo
docker compose down
docker compose up -d --build
```

### SSL no funciona

```bash
# Verificar DNS apunta a IP correcta
nslookup flow.cunda.io

# Ver logs de Traefik
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose logs traefik"

# Reiniciar Traefik
ssh azureuser@$(cat .azure-vm-ip) "cd ~/rocket-genai-v2 && docker compose restart traefik"
```

## 📚 Recursos Adicionales

- [Documentación Azure CLI](https://docs.microsoft.com/en-us/cli/azure/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Última actualización**: Octubre 2025
