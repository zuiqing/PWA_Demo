#!/bin/bash

# ==============================================================================
# QV-Monitor Production Deployment Script
# ==============================================================================

# --- Configuration ---
SERVER_HOST="3.121.98.176"
SSH_USER="ec2-user"
SSH_KEY="aws-APP-20250916.pem"
REMOTE_PATH="/home/ec2-user/qv-monitor"
PUBLIC_BASE_URL="https://app.clouduse01.com/monitor/"

SSH_TARGET="$SSH_USER@$SERVER_HOST"
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=accept-new"

if [ ! -f "$SSH_KEY" ]; then
  echo "ERROR: SSH key not found: $SSH_KEY"
  exit 1
fi

echo ">>> Building React Project..."
npm run build

echo ">>> Preparing remote directory..."
ssh $SSH_OPTS "$SSH_TARGET" "mkdir -p '$REMOTE_PATH'"

echo ">>> Backing up current remote dist..."
ssh $SSH_OPTS "$SSH_TARGET" "cd '$REMOTE_PATH' && if [ -d dist ]; then cp -a dist dist.bak_\$(date +%Y%m%d_%H%M%S); fi"

echo ">>> Uploading deployment files..."
scp $SSH_OPTS -r dist docker-compose.yml nginx.conf mediamtx.yml "$SSH_TARGET:$REMOTE_PATH/"

if [ -d "server" ]; then
  echo ">>> Uploading event-api server..."
  ssh $SSH_OPTS "$SSH_TARGET" "rm -rf '$REMOTE_PATH/server' && mkdir -p '$REMOTE_PATH/server'"
  scp $SSH_OPTS server/Dockerfile server/index.js server/package.json server/package-lock.json "$SSH_TARGET:$REMOTE_PATH/server/"
fi

echo ">>> Restarting Docker Compose services..."
ssh $SSH_OPTS "$SSH_TARGET" "cd '$REMOTE_PATH' && docker-compose up -d --build"

echo ">>> Deployment complete."
echo ">>> Public URL: $PUBLIC_BASE_URL"
echo ""
echo "Production notes:"
echo "  - External nginx config is loaded from /etc/nginx/conf.d/app.conf."
echo "  - Keep /home/ec2-user/app.conf as the editable copy, then copy it to /etc/nginx/conf.d/app.conf and reload nginx."
echo "  - Keep $SSH_KEY local only. It is ignored by git and must not be uploaded."
