✅ Archivos Creados/Modificados
1. scripts/deploy-azure.sh (nuevo)
Script que corre en el servidor Azure vía SSH:
Hace git pull origin main
Ejecuta docker compose build con el .env existente
Reinicia servicios (migraciones automáticas)
Muestra logs y status

2. scripts/deploy.sh (nuevo)
Helper que corres en tu máquina local:
Verifica cambios sin commitear
Push a git
SSH al servidor y ejecuta deploy-azure.sh
Muestra resultado

3. .env.example (nuevo)
Template para desarrollo local sin secrets reales

4. .github/workflows/deploy-azure.yml (actualizado)
CI/CD automático:
Trigger en push a main
Corre tests backend + frontend
Si pasan: SSH al servidor → git pull → docker compose up -d --build

5. CLAUDE.md (actualizado)
Documentación completa del workflow:
Desarrollo local
Creación de migraciones
Deployment automático/manual
Comandos útiles en servidor
🚀 Cómo Usar
Desarrollo Local


# 1. Trabajar en local
docker compose watch

# 2. Crear migración si cambias modelos
cd backend
alembic revision --autogenerate -m "add new field"

# 3. Commit
git add .
git commit -m "feat: nueva funcionalidad"
Deploy a QA
Opción A - Automático (Recomendado):
git push origin main
# GitHub Actions auto-deploya en 2-3 min
Opción B - Manual:
./scripts/deploy.sh
# Te pregunta si quieres commitear, pushea y deploya
⚙️ Setup GitHub Actions (Opcional)
Para habilitar CI/CD automático, configura estos secrets en GitHub:
Ve a: Repository Settings → Secrets and variables → Actions
Agrega estos secrets:
AZURE_VM_HOST = 172.190.78.125
AZURE_VM_USER = azureuser
AZURE_VM_SSH_KEY = Tu private SSH key
AZURE_VM_PORT = 22 (opcional)
🎯 Próximos Pasos
Commitea estos cambios:
git add .
git commit -m "feat: add CI/CD workflow with deploy scripts"
git push origin main
Prueba el deploy manual:
./scripts/deploy.sh
(Opcional) Configura GitHub Actions para auto-deploy
¿Quieres que te ayude a configurar los GitHub Secrets o a probar el primer deploy?