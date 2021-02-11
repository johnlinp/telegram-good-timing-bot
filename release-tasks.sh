#!/usr/bin/env bash

# generate locale .mo files
pushd ./goodtiming/locales
./generate-mo.sh
popd

# run database migration
pushd ./goodtiming/database
./migrate.sh
popd
