#!/bin/bash
set -e

echo "Running database setup..."
python db/setup-db.py


echo "Starting application..."
exec "$@"
