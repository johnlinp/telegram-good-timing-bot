#!/usr/bin/env bash

echo generating locale .mo files...
for PO_FILE in */LC_MESSAGES/*.po
do
    MO_FILE="${PO_FILE/.po/.mo}"
    msgfmt -o $MO_FILE $PO_FILE
done
