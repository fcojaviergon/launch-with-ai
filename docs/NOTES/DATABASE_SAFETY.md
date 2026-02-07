# Database Safety Guide

This document outlines critical safety procedures for database operations in production and development environments.

## ⚠️ DANGEROUS COMMANDS - NEVER USE IN PRODUCTION

### Docker Compose Commands to AVOID

```bash
# ❌ NEVER DO THIS - Deletes all volumes including database data
docker compose down -v

# ❌ NEVER DO THIS - Removes volumes
docker compose down --volumes

# ❌ NEVER DO THIS - Removes everything
docker volume rm <volume-name>
```

**Why these are dangerous:**
- These commands **permanently delete** your database data
- There is **no undo** - data is gone forever
- Even with backups, you lose data since the last backup

### Safe Alternatives

```bash
# ✅ SAFE - Stops containers but keeps data
docker compose down

# ✅ SAFE - Restart services
docker compose restart

# ✅ SAFE - Restart specific service
docker compose restart backend

# ✅ SAFE - Rebuild and restart (keeps data)
docker compose up -d --build
```

## 🔒 Production Database Safety Rules

### Before ANY Database Operation

1. **Always create a backup first**
   ```bash
   cd ~/launch-with-ai
   ./scripts/backup-azure-db.sh
   ```

2. **Verify backup was created**
   ```bash
   ls -lh ~/db-backups/
   ```

3. **Test that backup is not empty**
   ```bash
   zcat ~/db-backups/app_backup_YYYYMMDD_HHMMSS.sql.gz | head -20
   ```

### Migration Safety Checklist

Before running migrations in production:

- [ ] Create fresh backup
- [ ] Review migration file in `backend/app/alembic/versions/`
- [ ] Test migration in local/staging environment first
- [ ] Verify no destructive operations (DROP TABLE, DROP COLUMN)
- [ ] Check for data migrations that might timeout
- [ ] Have rollback plan ready

## 📦 Backup Procedures

### Automatic Backups

Backups are configured to run automatically at 2 AM daily:

```bash
# Setup automatic backups (one-time)
./scripts/setup-backup-cron.sh

# Verify cron job
crontab -l | grep backup
```

### Manual Backups

```bash
# Create manual backup
cd ~/launch-with-ai
./scripts/backup-azure-db.sh

# Backups are stored in:
~/db-backups/app_backup_YYYYMMDD_HHMMSS.sql.gz

# List all backups
ls -lh ~/db-backups/

# Retention: 7 days (automatic cleanup)
```

### Backup Verification

```bash
# Check backup size (should be > 1MB for non-empty database)
du -h ~/db-backups/app_backup_*.sql.gz

# View backup contents (first 50 lines)
zcat ~/db-backups/app_backup_20250105_020000.sql.gz | head -50

# Count tables in backup
zcat ~/db-backups/app_backup_20250105_020000.sql.gz | grep "CREATE TABLE" | wc -l
```

## 🔄 Recovery Procedures

### Full Database Restore

**⚠️ WARNING: This will overwrite ALL current data**

```bash
# 1. Stop the application
docker compose stop backend celery-worker celery-beat

# 2. Choose your backup file
ls -lh ~/db-backups/

# 3. Restore from backup
zcat ~/db-backups/app_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T db psql -U postgres -d app

# 4. Restart services
docker compose start backend celery-worker celery-beat
```

### Restore Specific Tables

```bash
# 1. Extract specific table from backup
zcat ~/db-backups/app_backup_YYYYMMDD_HHMMSS.sql.gz | \
  grep -A 1000 "CREATE TABLE tablename" > table_backup.sql

# 2. Review the extracted SQL
less table_backup.sql

# 3. Apply to database
cat table_backup.sql | docker compose exec -T db psql -U postgres -d app
```

## 🔍 Database Inspection

### Safe Read-Only Operations

```bash
# Connect to database (read-only recommended)
docker compose exec db psql -U postgres -d app

# List all tables
\dt

# Show table structure
\d tablename

# Count records
SELECT COUNT(*) FROM tablename;

# Exit
\q
```

### Check Database Size

```bash
# Database size
docker compose exec db psql -U postgres -d app -c \
  "SELECT pg_size_pretty(pg_database_size('app'));"

# Table sizes
docker compose exec db psql -U postgres -d app -c \
  "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
   LIMIT 10;"
```

## 🚨 Emergency Procedures

### Database is Corrupted

```bash
# 1. Stop application
docker compose stop backend celery-worker celery-beat

# 2. Check database logs
docker compose logs db | tail -100

# 3. Try to repair
docker compose exec db psql -U postgres -d app -c "REINDEX DATABASE app;"

# 4. If repair fails, restore from backup (see Recovery Procedures above)
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Clean up old Docker images (safe - doesn't touch volumes)
docker image prune -a

# Clean up old backups manually (beyond 7 days)
find ~/db-backups/ -name "app_backup_*.sql.gz" -mtime +7 -ls
find ~/db-backups/ -name "app_backup_*.sql.gz" -mtime +7 -delete
```

### Database Won't Start

```bash
# 1. Check logs
docker compose logs db

# 2. Common issues:
# - Permission errors: Check volume permissions
# - Port conflict: Check if port 5432 is in use
# - Corrupt data: May need to restore from backup

# 3. Check volume permissions (if using TimescaleDB HA)
docker compose down
docker compose up db-init
docker compose up db

# 4. If all else fails, restore from backup
```

## 📊 Monitoring

### Check Backup Health

```bash
# Verify backups are running
ls -lt ~/db-backups/ | head -5

# Check backup log
tail -50 ~/db-backups/backup.log

# Verify latest backup is recent (< 24 hours)
find ~/db-backups/ -name "app_backup_*.sql.gz" -mtime -1 -ls
```

### Database Health Check

```bash
# Connection check
docker compose exec db pg_isready -U postgres -d app

# Check for active connections
docker compose exec db psql -U postgres -d app -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname='app';"

# Check for long-running queries
docker compose exec db psql -U postgres -d app -c \
  "SELECT pid, age(clock_timestamp(), query_start), usename, query
   FROM pg_stat_activity
   WHERE query != '<IDLE>' AND query NOT ILIKE '%pg_stat_activity%'
   ORDER BY query_start desc;"
```

## 📝 Best Practices

1. **Always backup before major changes**
   - Migrations
   - Schema changes
   - Bulk data operations

2. **Test in staging first**
   - Never test destructive operations in production
   - Validate migrations in local/staging environment

3. **Monitor backup success**
   - Check `~/db-backups/backup.log` regularly
   - Verify backups are not empty
   - Test restore procedure periodically

4. **Document custom migrations**
   - Add comments to complex migrations
   - Document any manual steps required

5. **Use transactions for manual operations**
   ```sql
   BEGIN;
   -- Your changes here
   -- Check results with SELECT
   ROLLBACK; -- or COMMIT; if everything looks good
   ```

## 🔗 Related Documentation

- [CLAUDE.md](../../CLAUDE.md) - Main development guide
- [DEPLOYMENT-AZURE.md](../../DEPLOYMENT-AZURE.md) - Deployment procedures
- [Backend Scripts](../../backend/scripts/) - Database initialization scripts

## 📞 Emergency Contacts

If you encounter a critical database issue:

1. **Stop the application** to prevent data corruption
2. **Check recent backups** are available
3. **Review logs** for error messages
4. **Contact senior developer** before proceeding with recovery

---

**Remember: When in doubt, backup first!**
