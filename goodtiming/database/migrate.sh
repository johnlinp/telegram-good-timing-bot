#!/usr/bin/env bash

SQL_FILE=migrate-1.sql

cat "$SQL_FILE" | psql "$DATABASE_URL"
