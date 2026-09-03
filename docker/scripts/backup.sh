#!/usr/bin/env bash
# ==============================================================================
# PAWLSE Disaster Recovery - Automated Backup Script
# Creates complete SQL database dump and persistent media storage tarball.
# ==============================================================================

set -eo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-./backups}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.production.yaml}"
DB_CONTAINER="${DB_CONTAINER:-mysql}"
DB_NAME="${DB_DATABASE:-pawlse}"
DB_USER="${DB_USERNAME:-pawlse_user}"
DB_PASS="${DB_PASSWORD:-pawlse_secret}"
STORAGE_VOLUME="${STORAGE_VOLUME:-pawlse-production_app_storage}"

mkdir -p "${BACKUP_DIR}"

echo "=========================================="
echo " Starting PAWLSE Disaster Recovery Backup"
echo " Timestamp: ${TIMESTAMP}"
echo " Backup Directory: ${BACKUP_DIR}"
echo "=========================================="

# 1. Export MySQL Database Dump
DB_BACKUP_FILE="${BACKUP_DIR}/pawlse_db_${TIMESTAMP}.sql.gz"
echo "[1/3] Dumping MySQL database: ${DB_NAME}..."

if docker compose -f "${COMPOSE_FILE}" ps "${DB_CONTAINER}" --status running -q > /dev/null 2>&1; then
    docker compose -f "${COMPOSE_FILE}" exec -T "${DB_CONTAINER}" \
        mysqldump -u"${DB_USER}" -p"${DB_PASS}" \
        --single-transaction \
        --quick \
        --routines \
        --triggers \
        "${DB_NAME}" | gzip > "${DB_BACKUP_FILE}"
    echo "  -> Database backup saved: ${DB_BACKUP_FILE} ($(du -h "${DB_BACKUP_FILE}" | cut -f1))"
else
    echo "  [ERROR] Database container '${DB_CONTAINER}' is not running!"
    exit 1
fi

# 2. Archive Persistent Storage (User Uploads, Pet Photos, Documents)
STORAGE_BACKUP_FILE="${BACKUP_DIR}/pawlse_storage_${TIMESTAMP}.tar.gz"
echo "[2/3] Archiving persistent storage volume: ${STORAGE_VOLUME}..."

docker run --rm \
    -v "${STORAGE_VOLUME}:/source:ro" \
    -v "$(pwd)/${BACKUP_DIR}:/dest" \
    alpine tar -czf "/dest/pawlse_storage_${TIMESTAMP}.tar.gz" -C /source .

echo "  -> Storage archive saved: ${STORAGE_BACKUP_FILE} ($(du -h "${STORAGE_BACKUP_FILE}" | cut -f1))"

# 3. Prune Local Backups Older Than Retention Days (Default: 30 days)
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
echo "[3/3] Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f \( -name "pawlse_db_*.sql.gz" -o -name "pawlse_storage_*.tar.gz" \) -mtime "+${RETENTION_DAYS}" -exec rm -f {} +

echo "=========================================="
echo " Disaster Recovery Backup Completed Successfully!"
echo " Files Created:"
echo "   - ${DB_BACKUP_FILE}"
echo "   - ${STORAGE_BACKUP_FILE}"
echo "=========================================="
