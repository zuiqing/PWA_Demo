#!/bin/bash

# ==============================================================================
# RTSP/MediaMTX Server Port Check Tool
# This script checks if the necessary ports for RTSP preview are open and listening.
# ==============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ports to check (MediaMTX Defaults)
declare -A PORTS
PORTS=(
    ["8554"]="RTSP (TCP)"
    ["8888"]="HLS (TCP)"
    ["8889"]="WebRTC Signaling (TCP)"
    ["8088"]="HTTP-FLV (TCP)"
    ["8089"]="WebRTC Data (UDP)"
    ["1935"]="RTMP (TCP)"
)

echo -e "${YELLOW}>>> Checking Server Port Status...${NC}\n"

# 1. Check if ports are listening locally
echo -e "${YELLOW}[1/3] Checking if services are listening locally...${NC}"
if ! command -v netstat &> /dev/null && ! command -v ss &> /dev/null; then
    echo -e "${RED}Error: netstat or ss not found. Please install net-tools or iproute2.${NC}"
else
    for port in "${!PORTS[@]}"; do
        if command -v ss &> /dev/null; then
            LISTEN=$(ss -tuln | grep ":$port ")
        else
            LISTEN=$(netstat -tuln | grep ":$port ")
        fi

        if [ -n "$LISTEN" ]; then
            echo -e "${GREEN}[PASS]${NC} Port $port (${PORTS[$port]}) is LISTENING."
        else
            echo -e "${RED}[FAIL]${NC} Port $port (${PORTS[$port]}) is NOT listening."
        fi
    done
fi
echo ""

# 2. Check Firewall (ufw/firewalld)
echo -e "${YELLOW}[2/3] Checking local firewall (ufw/firewalld)...${NC}"
if command -v ufw &> /dev/null && sudo ufw status | grep -q "active"; then
    echo -e "${YELLOW}UFW is active. Checking allowed ports:${NC}"
    sudo ufw status | grep -E "8554|8888|8889|8088|8089|1935" || echo "No RTSP related ports found in UFW rules."
elif command -v firewall-cmd &> /dev/null && sudo firewall-cmd --state &> /dev/null; then
    echo -e "${YELLOW}Firewalld is active. Checking allowed ports:${NC}"
    sudo firewall-cmd --list-ports | grep -E "8554|8888|8889|8088|8089|1935" || echo "No RTSP related ports found in Firewalld rules."
else
    echo -e "${GREEN}[OK]${NC} No active local firewall detected (ufw/firewalld)."
fi
echo ""

# 3. External Connectivity Hint
echo -e "${YELLOW}[3/3] External Connectivity Check${NC}"
echo -e "Remember to also open these ports in your ${YELLOW}Cloud Provider's Security Group${NC} (AWS, Alibaba Cloud, etc.):"
for port in "${!PORTS[@]}"; do
    echo -e "  - Port $port (${PORTS[$port]})"
done

echo -e "\n${GREEN}Check complete!${NC}"
