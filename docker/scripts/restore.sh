#!/usr/bin/env bash
# ==============================================================================
# PAWLSE Disaster Recovery - Database & Storage Restore Script
# Restores a compressed SQL database dump and storage tarball into Docker.
# ==============================================================================

set -eo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.production.yaml}"
DB_CONTAINER="${DB_CONTAINER:-mysql}"
DB_NAME="${DB_DATABASE:-pawlse}"
DB_ROOT_USER="root"
DB_ROOT_PASS="${DB_ROOT_PASSWORD:-root_secret}"
STORAGE_VOLUME="${STORAGE_VOLUME:-pawlse-production_app_storage}"

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-db-backup.sql.gz> [path-to-storage-backup.tar.gz]"
    echo "Example: $0 ./backups/pawlse_db_20260903_120000.sql.gz ./backups/pawlse_storage_20260903_120000.tar.gz"
    exit 1
fi

DB_BACKUP_PATH="$1"
STORAGE_BACKUP_PATH="$2"

if [ ! -f "${DB_BACKUP_PATH}" ]; then
    echo "[ERROR] Database backup file not found: ${DB_BACKUP_PATH}"
    exit 1
fi

echo "=========================================="
echo " Starting PAWLSE Disaster Recovery Restore"
echo " Database Dump: ${DB_BACKUP_PATH}"
if [ -n "${STORAGE_BACKUP_PATH}" ]; then
    echo " Storage Tarball: ${STORAGE_BACKUP_PATH}"
fi
echo "=========================================="

# 1. Restore Database Dump
echo "[1/3] Restoring MySQL database: ${DB_NAME}..."
gunzip < "${DB_BACKUP_PATH}" | docker compose -f "${COMPOSE_FILE}" exec -T "${DB_CONTAINER}" \
    mysql -u"${DB_ROOT_USER}" -p"${DB_ROOT_PASS}" "${DB_NAME}"
echo "  -> Database restored successfully."

# 2. Restore Storage Volume if Provided
if [ -n "${STORAGE_BACKUP_PATH}" ] && [ -f "${STORAGE_BACKUP_PATH}" ]; then
    echo "[2/3] Restoring storage volume: ${STORAGE_VOLUME}..."
    docker run --rm \
        -v "${STORAGE_VOLUME}:/target" \
        -v "$(dirname "$(realpath "${STORAGE_BACKUP_PATH}")"):/source:ro" \
        alpine tar -xzf "/source/$(basename "${STORAGE_BACKUP_PATH}")" -C /target
    echo "  -> Storage volume restored successfully."
else
    echo "[2/3] Skipping storage volume restoration (no valid file provided)."
fi

# 3. Post-Restore Application Re-optimization
echo "[3/3] Re-optimizing Laravel application..."
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan storage:link --quiet || true
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan migrate --force
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan optimize
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan queue:restart

echo "=========================================="
echo " Disaster Recovery Restore Completed Successfully!"
echo "=========================================="
