#!/bin/bash

# Setup automatic database backups using cron
# This script configures daily backups at 2 AM

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up automatic database backups...${NC}"

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_SCRIPT="${PROJECT_DIR}/scripts/backup-azure-db.sh"

# Verify backup script exists and is executable
if [ ! -f "${BACKUP_SCRIPT}" ]; then
    echo -e "${RED}Error: Backup script not found at ${BACKUP_SCRIPT}${NC}"
    exit 1
fi

if [ ! -x "${BACKUP_SCRIPT}" ]; then
    echo -e "${YELLOW}Making backup script executable...${NC}"
    chmod +x "${BACKUP_SCRIPT}"
fi

# Create cron job entry
CRON_JOB="0 2 * * * cd ${PROJECT_DIR} && ${BACKUP_SCRIPT} >> ${HOME}/db-backups/backup.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "${BACKUP_SCRIPT}"; then
    echo -e "${YELLOW}Cron job already exists. Removing old entry...${NC}"
    crontab -l 2>/dev/null | grep -v "${BACKUP_SCRIPT}" | crontab -
fi

# Add new cron job
echo -e "${YELLOW}Adding cron job for daily backups at 2 AM...${NC}"
(crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -

# Verify cron job was added
if crontab -l | grep -q "${BACKUP_SCRIPT}"; then
    echo -e "${GREEN}Cron job added successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Current crontab:${NC}"
    crontab -l | grep "${BACKUP_SCRIPT}"
    echo ""
    echo -e "${GREEN}Backups will run daily at 2:00 AM${NC}"
    echo -e "${GREEN}Backup directory: ${HOME}/db-backups${NC}"
    echo -e "${GREEN}Retention: 7 days${NC}"
    echo ""
    echo -e "${YELLOW}To test the backup manually, run:${NC}"
    echo -e "  cd ${PROJECT_DIR} && ${BACKUP_SCRIPT}"
    echo ""
    echo -e "${YELLOW}To remove the cron job, run:${NC}"
    echo -e "  crontab -l | grep -v '${BACKUP_SCRIPT}' | crontab -"
else
    echo -e "${RED}Error: Failed to add cron job${NC}"
    exit 1
fi
