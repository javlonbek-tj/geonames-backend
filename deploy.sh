#!/bin/bash
set -e

echo "==> Pulling latest changes..."
git pull origin main

echo "==> Building and restarting backend..."
docker compose build backend
docker compose up -d

echo "==> Running database migrations..."
docker compose exec backend npx drizzle-kit migrate

echo "==> Cleaning up old images..."
docker image prune -f

echo "==> Done! Backend is running."
docker compose ps
