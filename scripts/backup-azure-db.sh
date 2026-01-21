#!/bin/bash

# Database backup script for Azure VM deployment
# This script creates compressed PostgreSQL backups with automatic retention

set -e

# Configuration
BACKUP_DIR="$HOME/db-backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="app_backup_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Verify required variables
if [ -z "${POSTGRES_DB}" ] || [ -z "${POSTGRES_USER}" ]; then
    echo -e "${RED}Error: Required environment variables not set${NC}"
    exit 1
fi

# Create backup using docker compose exec with -T flag for non-TTY mode
echo -e "${YELLOW}Creating backup: ${BACKUP_FILE}${NC}"
docker compose exec -T db pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip > "${BACKUP_PATH}"

# Check if backup was successful
if [ $? -eq 0 ] && [ -s "${BACKUP_PATH}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
    echo -e "${GREEN}Backup created successfully: ${BACKUP_PATH} (${BACKUP_SIZE})${NC}"
else
    echo -e "${RED}Error: Backup failed or is empty${NC}"
    rm -f "${BACKUP_PATH}"
    exit 1
fi

# Clean up old backups (keep last 7 days)
echo -e "${YELLOW}Cleaning up old backups (keeping last ${RETENTION_DAYS} days)...${NC}"
find "${BACKUP_DIR}" -name "app_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# List remaining backups
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "app_backup_*.sql.gz" -type f | wc -l)
echo -e "${GREEN}Backup complete. Total backups: ${BACKUP_COUNT}${NC}"

# Show backup files
echo -e "${YELLOW}Recent backups:${NC}"
ls -lh "${BACKUP_DIR}"/app_backup_*.sql.gz | tail -5
