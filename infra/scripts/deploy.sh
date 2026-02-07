#!/bin/bash
set -e

echo "========================================"
echo "ClawDeploy Infrastructure Deploy Script"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Config
TERRAFORM_DIR="$(dirname "$0")/../terraform"
API_DIR="$(dirname "$0")/../api"
SCRIPTS_DIR="$(dirname "$0")"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Terraform not found. Install it first.${NC}"
    exit 1
fi

if [ -z "$HCLOUD_TOKEN" ]; then
    echo -e "${RED}HCLOUD_TOKEN not set. Export it first:${NC}"
    echo "export HCLOUD_TOKEN=your_token_here"
    exit 1
fi

if [ -z "$SSH_PUBLIC_KEY" ]; then
    echo -e "${RED}SSH_PUBLIC_KEY not set. Set it:${NC}"
    echo 'export SSH_PUBLIC_KEY="ssh-rsa AAAAB3..."'
    exit 1
fi

# Step 1: Terraform apply
echo -e "${YELLOW}Step 1: Provisioning VPS nodes with Terraform...${NC}"
cd "$TERRAFORM_DIR"
terraform init
terraform apply -auto-approve

# Get node IPs
NODE_IPS=$(terraform output -raw server_ips)
echo -e "${GREEN}Nodes created: $NODE_IPS${NC}"

# Step 2: Wait for cloud-init to complete
echo -e "${YELLOW}Step 2: Waiting for nodes to be ready...${NC}"
for ip in $NODE_IPS; do
    echo "Waiting for $ip..."
    while ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@$ip "test -f /opt/clawdeploy/setup.log" 2>/dev/null; do
        sleep 5
        echo -n "."
    done
    echo -e "${GREEN} $ip ready!${NC}"
done

# Step 3: Deploy API and pool manager to nodes
echo -e "${YELLOW}Step 3: Deploying services to nodes...${NC}"

for ip in $NODE_IPS; do
    echo "Deploying to $ip..."
    
    # Create API directory
    ssh root@$ip "mkdir -p /opt/clawdeploy/api"
    
    # Copy API files
    scp -r "$API_DIR/"* root@$ip:/opt/clawdeploy/api/
    scp -r "$SCRIPTS_DIR/"* root@$ip:/opt/clawdeploy/
    
    # Copy Caddy config
    scp "$(dirname "$0")/../caddy/Caddyfile" root@$ip:/opt/caddy/Caddyfile
    
    # Install Node.js dependencies
    ssh root@$ip "cd /opt/clawdeploy/api && npm init -y && npm install express sqlite3"
    ssh root@$ip "cd /opt/clawdeploy && npm init -y && npm install sqlite3"
    
    # Start services with PM2
    ssh root@$ip "pm2 start /opt/clawdeploy/api/assignment-api.js --name 'clawdeploy-api'"
    ssh root@$ip "pm2 start /opt/clawdeploy/pool-manager.js --name 'clawdeploy-pool'"
    ssh root@$ip "pm2 save && pm2 startup systemd -u root --hp /root"
    
    # Start Caddy
    ssh root@$ip "caddy start --config /opt/caddy/Caddyfile"
    
    echo -e "${GREEN} $ip deployed!${NC}"
done

# Step 4: Verify
echo -e "${YELLOW}Step 4: Verifying deployment...${NC}"

for ip in $NODE_IPS; do
    echo "Checking $ip..."
    HEALTH=$(ssh root@$ip "curl -s http://localhost:3000/health || echo 'FAILED'")
    if echo "$HEALTH" | grep -q "healthy"; then
        echo -e "${GREEN}  ✓ API healthy on $ip${NC}"
    else
        echo -e "${RED}  ✗ API not responding on $ip${NC}"
    fi
done

echo ""
echo -e "${GREEN}========================================"
echo "Deployment Complete!"
echo "========================================${NC}"
echo ""
echo "Node IPs: $NODE_IPS"
echo "API Endpoint: http://$ip:3000"
echo ""
echo "Next steps:"
echo "1. Configure DNS: Point *.clawdeploy.com to your node IPs"
echo "2. Set CF_API_TOKEN in /opt/caddy/Caddyfile for SSL"
echo "3. Build and push the OpenClaw Docker image"
echo ""
