#!/usr/bin/env bash
set -e

if [ $URL ]
then
  mkdir -p /backup

  TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
  BACKUP_DESTINATION="backup-${TIMESTAMP}.sql"
  
  pg_dump -v $URL > /backup/$BACKUP_DESTINATION
fi