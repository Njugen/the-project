#!/usr/bin/env bash
set -e

if [ $URL ]
then
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  pg_dump -v $URL > /backup/backup-$TIMESTAMP.sql
fi