#!/bin/bash

# ==============================================================================
# QV-Monitor Production Deployment Script
# ==============================================================================

# --- Configuration ---
SERVER_IP="[YOUR_SERVER_IP]"
SSH_USER="ubuntu"  # Default for AWS
SSH_KEY="aws-APP-20250916.pem"
REMOTE_PATH="/home/ubuntu/qv-monitor"

echo ">>> Building React Project..."
npm run build

echo ">>> Preparing Deployment Package..."
# Copy dist, mediamtx.yml, and docker-compose.yml
# (In a real scenario, you'd scp these to the server)

echo ">>> Deployment Instructions:"
echo "1. Upload files to your server:"
echo "   scp -i $SSH_KEY -r dist mediamtx.yml docker-compose.yml $SSH_USER@$SERVER_IP:$REMOTE_PATH"
echo ""
echo "2. SSH into your server and start the services:"
echo "   ssh -i $SSH_KEY $SSH_USER@$SERVER_IP"
echo "   cd $REMOTE_PATH"
echo "   docker-compose up -d"
echo ""
echo "3. Remember to open the following ports in your Security Group:"
echo "   - 80: Web UI"
echo "   - 8889: WebRTC (WHEP)"
echo "   - 9997: MediaMTX API (Needed for dynamic registration)"
echo "   - 8000-9000 (UDP): WebRTC Media"
