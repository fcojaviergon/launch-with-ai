# Scripts Documentation

Esta carpeta contiene scripts útiles para gestión y deployment de Rocket GenAI.

## 📋 Tabla de Contenidos

- [Generación de Archivos .env](#-generación-de-archivos-env)
- [Deployment Azure](#-scripts-de-deployment-azure)

---

## 🔐 Generación de Archivos .env

Dos scripts para generar archivos `.env` con valores seguros automáticamente:

### Script Python (Recomendado) - `generate-env.py`

**Características:**
- ✅ Validación interactiva de emails y dominios
- ✅ Generación segura de secrets (32 caracteres)
- ✅ Templates para local, staging y production
- ✅ Permisos automáticos (600)
- ✅ Crea archivos .example para documentación

**Uso básico:**

```bash
# Desarrollo local
python scripts/generate-env.py --env local

# Producción (interactivo)
python scripts/generate-env.py --env production --domain example.com

# Staging/QA
python scripts/generate-env.py --env staging --domain qa.example.com

# Sobrescribir archivo existente
python scripts/generate-env.py --env production --domain example.com --force
```

**Salida de ejemplo:**
```
🚀 Generating .env file for production environment...

Admin email: admin@example.com
OpenAI API key: sk-...

✅ Created .env.production (permissions: 600)

================================================================
🔐 GENERATED SECRETS FOR PRODUCTION ENVIRONMENT
================================================================

🔑 SECRET_KEY: AbCdEf123456...
👤 Admin User: admin@example.com
🔒 Admin Password: xYz789AbC...
🗄️  Postgres User: postgres
🔒 Postgres Password: pQr456XyZ...

================================================================
⚠️  IMPORTANT: Save these credentials securely!
================================================================
```

### Script Bash (Rápido) - `generate-env.sh`

**Características:**
- ✅ Interfaz simple de línea de comandos
- ✅ Generación segura usando OpenSSL
- ✅ Sin dependencias de Python

**Uso:**

```bash
# Desarrollo local
./scripts/generate-env.sh local

# Producción
./scripts/generate-env.sh production example.com

# Staging
./scripts/generate-env.sh staging qa.example.com
```

**Requiere:** `openssl` (pre-instalado en Linux/macOS)

### Valores Generados Automáticamente

| Variable | Método | Longitud | Ejemplo |
|----------|--------|----------|---------|
| `SECRET_KEY` | `secrets.token_urlsafe()` | 32 chars | `xK9pL2mN5qR8sT1vW4yZ...` |
| `FIRST_SUPERUSER_PASSWORD` | `secrets.choice()` | 24 chars | `AbC123XyZ789PqR456...` |
| `POSTGRES_PASSWORD` | `secrets.choice()` | 24 chars | `MnO789StU012VwX345...` |

### Seguridad

⚠️ **NUNCA commitear archivos .env a git**

El `.gitignore` está configurado para bloquear:
```gitignore
.env
.env.*
!.env.example
!.env.*.example
```

✅ **Permisos automáticos:**
```bash
-rw------- 1 user user 1234 Nov 5 12:00 .env.production  # 600
```

✅ **Rotar secrets regularmente:**
- Después de incidentes de seguridad
- Cuando miembros del equipo se van
- Cada 90 días en producción

### Deployment con .env Generado

1. **Generar archivo:**
   ```bash
   python scripts/generate-env.py --env production --domain example.com
   ```

2. **Guardar credenciales:**
   - Password manager (1Password, Bitwarden)
   - Compartir de forma segura (nunca por email/Slack)

3. **Copiar a servidor:**
   ```bash
   scp .env.production user@server:/path/to/app/.env
   ```

4. **Aplicar en servidor:**
   ```bash
   ssh user@server "cd /path/to/app && docker compose restart"
   ```

### Variables de Entorno - Referencia Rápida

| Variable | Requerido | Default | Descripción |
|----------|-----------|---------|-------------|
| `SECRET_KEY` | ✅ | auto | Firma JWT (32 chars) |
| `FIRST_SUPERUSER` | ✅ | - | Email del admin |
| `FIRST_SUPERUSER_PASSWORD` | ✅ | auto | Password admin |
| `POSTGRES_PASSWORD` | ✅ | auto | Password DB |
| `OPENAI_API_KEY` | ✅ | - | API key de OpenAI |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | Modelo a usar |
| `DOMAIN` | ✅* | `localhost` | Dominio (*prod/staging) |
| `SENTRY_DSN` | ❌ | - | Error tracking |

---

## 📁 Scripts de Deployment Azure

### QA/Staging Environment

- **`azure-setup.sh`** - Crea infraestructura Azure para QA
- **`configure-env.sh`** - Configura archivos `.env.azure` y `.env.traefik` para QA
- **`deploy-to-azure.sh`** - Despliega la aplicación en QA

### Production Environment

- **`azure-setup-prod.sh`** - Crea infraestructura Azure para PRODUCCIÓN
- **`configure-env-prod.sh`** - Configura archivos para PRODUCCIÓN *(crear cuando se necesite)*
- **`deploy-to-azure-prod.sh`** - Despliega la aplicación en PRODUCCIÓN *(crear cuando se necesite)*

## 🚀 Deployment QA (your-domain.example.com)

### Paso 1: Login Azure CLI

```bash
az login
```

### Paso 2: Crear VM de QA

```bash
./scripts/azure-setup.sh
```

**Crea:**
- Resource Group: `rg-your-project-qa`
- VM: `vm-your-project-qa` (Standard_B2s: 2 vCPUs, 4GB RAM)
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

- **Frontend**: https://dashboard.your-domain.example.com
- **Backend**: https://api.your-domain.example.com/docs
- **Traefik**: https://traefik.your-domain.example.com
- **Adminer**: https://adminer.your-domain.example.com

## 🏭 Deployment PRODUCCIÓN

### Diferencias QA vs Producción

| Aspecto | QA | Producción |
|---------|-----|-----------|
| Resource Group | `rg-your-project-qa` | `rg-your-project-prod` |
| VM Name | `vm-your-project-qa` | `vm-your-project-prod` |
| VM Size | Standard_B2s (4GB) | Standard_B2ms (8GB) |
| Environment | `development` | `production` |
| Stack Name | `your-project-qa` | `your-project-prod` |
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
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose ps"

# Producción
ssh azureuser@$(cat .azure-vm-ip-prod) "cd ~/launch-with-ai && docker compose ps"
```

### Ver logs

```bash
# QA - Ver logs en tiempo real
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose logs -f"

# Ver logs específicos
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose logs backend"
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose logs frontend"
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose logs traefik"
```

### Reiniciar servicios

```bash
# Reiniciar todo
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose restart"

# Reiniciar servicio específico
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose restart backend"
```

### Actualizar código

```bash
# Redeploy completo
./scripts/deploy-to-azure.sh

# Solo rebuild backend
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose up -d --no-deps --build backend"

# Solo rebuild frontend
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose up -d --no-deps --build frontend"
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
cp .azure-secrets.txt ~/Backups/project-secrets-$(date +%Y%m%d).txt

# O usar gestor de passwords (1Password, Bitwarden, etc.)
```

## 🧹 Limpieza de Recursos

### Eliminar recursos QA

```bash
az group delete --name rg-your-project-qa --yes --no-wait
```

### Eliminar recursos Producción

```bash
# ⚠️ PELIGROSO - Solo si estás SEGURO
az group delete --name rg-your-project-prod --yes --no-wait
```

## 📊 Monitoreo de Costos

### Ver costos estimados

```bash
# QA
az consumption usage list \
  --resource-group rg-your-project-qa \
  --start-date $(date -d "30 days ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)

# Producción
az consumption usage list \
  --resource-group rg-your-project-prod \
  --start-date $(date -d "30 days ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)
```

## 🆘 Troubleshooting

### No se puede conectar por SSH

```bash
# Verificar IP
az vm show -d \
  --resource-group rg-your-project-qa \
  --name vm-your-project-qa \
  --query publicIps -o tsv

# Verificar NSG (puertos)
az network nsg rule list \
  --resource-group rg-your-project-qa \
  --nsg-name vm-your-project-qaNSG \
  --output table
```

### Servicios no inician

```bash
# Conectar a VM
ssh azureuser@$(cat .azure-vm-ip)

# Ver logs
cd ~/launch-with-ai
docker compose logs

# Reiniciar todo
docker compose down
docker compose up -d --build
```

### SSL no funciona

```bash
# Verificar DNS apunta a IP correcta
nslookup your-domain.example.com

# Ver logs de Traefik
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose logs traefik"

# Reiniciar Traefik
ssh azureuser@$(cat .azure-vm-ip) "cd ~/launch-with-ai && docker compose restart traefik"
```

## 📚 Recursos Adicionales

- [Documentación Azure CLI](https://docs.microsoft.com/en-us/cli/azure/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Última actualización**: Octubre 2025
