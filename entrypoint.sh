#!/bin/sh
set -e

if [ ! -L main.sqlite ] && [ ! -f main.sqlite ]; then
    ln -s /data/main.sqlite main.sqlite
fi

node dist/db/runMigration.js
exec node dist/index.js
