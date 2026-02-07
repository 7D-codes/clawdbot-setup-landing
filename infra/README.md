# ClawDeploy Infrastructure

One-command deploy of the ClawDeploy VPS pool infrastructure.

## Quick Start

```bash
# 1. Set environment variables
export HCLOUD_TOKEN="your_hetzner_token"
export SSH_PUBLIC_KEY="ssh-rsa AAAAB3..."

# 2. Deploy everything
cd infra/scripts
./deploy.sh
```

## What Gets Deployed

### VPS Nodes (Hetzner CPX31)
- 4 vCPU, 8GB RAM, €12.60/mo
- Ubuntu 22.04 with Docker
- Caddy reverse proxy (auto-SSL)
- Assignment API (Node.js/Express)
- Pool Manager (background worker)

### Architecture

```
User Signup
    ↓
Assignment API (Port 3000)
    ↓
Pick idle container from pool
    ↓
Inject user config (API keys, subdomain)
    ↓
Update Caddy (user.clawdeploy.com → container)
    ↓
Return instance URL (< 15 seconds)
```

### Pool Manager
- Maintains 5 idle OpenClaw containers
- Health checks every 30 seconds
- Auto-creates new idle instances
- Removes failed/orphaned containers

## API Endpoints

### POST /assign
Assign instance to new user:

```bash
curl -X POST http://node-ip:3000/assign \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-here",
    "email": "user@example.com",
    "tier": "pro",
    "apiKeys": {
      "openai": "sk-...",
      "anthropic": "sk-..."
    }
  }'
```

Response:
```json
{
  "success": true,
  "instance": {
    "id": "uuid",
    "subdomain": "user-a1b2",
    "url": "https://user-a1b2.clawdeploy.com",
    "gateway_url": "ws://10.0.0.5:18789",
    "status": "running"
  }
}
```

### GET /health
Check pool status:

```bash
curl http://node-ip:3000/health
```

Response:
```json
{
  "status": "healthy",
  "idle_instances": 5,
  "min_pool_size": 5
}
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `HCLOUD_TOKEN` | Hetzner Cloud API token |
| `SSH_PUBLIC_KEY` | Your SSH public key for server access |
| `NODE_IP` | (Optional) IP of current node |
| `CF_API_TOKEN` | Cloudflare API token for SSL (set on nodes) |

### Files on Nodes

| Path | Description |
|------|-------------|
| `/opt/clawdeploy/instances.db` | SQLite database (instances, pool) |
| `/opt/clawdeploy/api/` | Assignment API code |
| `/opt/caddy/Caddyfile` | Caddy reverse proxy config |
| `/opt/clawdeploy/pool-manager.js` | Pool manager code |

## Customization

### Change Pool Size

Edit `scripts/pool-manager.js`:
```javascript
const CONFIG = {
  MIN_POOL_SIZE: 10,  // Change this
  MAX_POOL_SIZE: 30,
  // ...
};
```

### Change VPS Type

Edit `terraform/main.tf`:
```hcl
resource "hcloud_server" "clawdeploy_node" {
  server_type = "cpx41"  # 8 vCPU, 16GB RAM
  # ...
}
```

### Add More Nodes

Edit `terraform/main.tf`:
```hcl
resource "hcloud_server" "clawdeploy_node" {
  count = 5  # Was 2, now 5
  # ...
}
```

## Troubleshooting

### Check pool status
```bash
ssh root@node-ip "docker ps --filter 'label=type=openclaw'"
ssh root@node-ip "sqlite3 /opt/clawdeploy/instances.db 'SELECT * FROM pool;'"
```

### View logs
```bash
ssh root@node-ip "pm2 logs clawdeploy-api"
ssh root@node-ip "pm2 logs clawdeploy-pool"
```

### Restart services
```bash
ssh root@node-ip "pm2 restart all"
ssh root@node-ip "caddy reload --config /opt/caddy/Caddyfile"
```

## Next Steps

1. **Build OpenClaw Docker image** with skill API
2. **Push to registry** (Docker Hub or GHCR)
3. **Update image name** in `pool-manager.js`
4. **Configure DNS** for `*.clawdeploy.com`
5. **Test end-to-end** signup flow
