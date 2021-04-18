#!/usr/bin/env bash

# run database migration
pushd ./goodtiming/database
./migrate.py
popd
