#!/usr/bin/env bash

echo updating locale .po files...
POT_FILE=goodtiming.pot
for PO_FILE in */LC_MESSAGES/*.po
do
    msgmerge --update "$PO_FILE" "$POT_FILE"
done
