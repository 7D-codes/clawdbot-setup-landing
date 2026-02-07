const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const execAsync = promisify(exec);
const app = express();
app.use(express.json());

// Config
const CONFIG = {
  IDLE_DIR: '/opt/clawdeploy/idle',
  ASSIGNED_DIR: '/opt/clawdeploy/assigned',
  CADDY_CONFIG: '/opt/caddy/Caddyfile',
  BASE_DOMAIN: 'clawdeploy.com',
  MIN_POOL_SIZE: 3,
  MAX_INSTANCES_PER_NODE: 15,
  CONTAINER_IMAGE: 'clawdeploy/openclaw:latest',
  GATEWAY_PORT: 18789,
  APP_PORT: 8080
};

// Database (SQLite for MVP)
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/opt/clawdeploy/instances.db');

// Initialize DB
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS instances (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE,
      subdomain TEXT UNIQUE,
      node_ip TEXT,
      container_id TEXT,
      container_ip TEXT,
      status TEXT,
      tier TEXT DEFAULT 'free',
      api_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active DATETIME
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS pool (
      container_id TEXT PRIMARY KEY,
      container_ip TEXT,
      node_ip TEXT,
      status TEXT DEFAULT 'idle',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Helper: Get available idle instance
async function getIdleInstance() {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM pool WHERE status = "idle" LIMIT 1',
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

// Helper: Generate unique subdomain
function generateSubdomain(email) {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const random = crypto.randomBytes(2).toString('hex');
  return `${base}-${random}`;
}

// Helper: Update Caddy config
async function updateCaddy(subdomain, containerIp) {
  const domain = `${subdomain}.${CONFIG.BASE_DOMAIN}`;
  const caddySnippet = `
@${subdomain} host ${domain}
handle @${subdomain} {
    reverse_proxy ${containerIp}:${CONFIG.APP_PORT}
}
`;
  
  await fs.appendFile(CONFIG.CADDY_CONFIG, caddySnippet);
  
  // Reload Caddy
  await execAsync('caddy reload --config /opt/caddy/Caddyfile');
}

// POST /assign - Assign instance to new user
app.post('/assign', async (req, res) => {
  const { userId, email, tier = 'free', apiKeys = {} } = req.body;
  
  if (!userId || !email) {
    return res.status(400).json({ error: 'userId and email required' });
  }
  
  try {
    // 1. Get idle instance
    const idle = await getIdleInstance();
    
    if (!idle) {
      return res.status(503).json({ 
        error: 'No idle instances available',
        message: 'Provisioning new instance, please retry in 60 seconds'
      });
    }
    
    // 2. Generate subdomain
    const subdomain = generateSubdomain(email);
    const instanceId = crypto.randomUUID();
    
    // 3. Create user config
    const userConfig = {
      user_id: userId,
      subdomain: subdomain,
      tier: tier,
      api_keys: apiKeys,
      instance_id: instanceId
    };
    
    // 4. Inject config into container
    const configPath = `/tmp/${instanceId}-config.json`;
    await fs.writeFile(configPath, JSON.stringify(userConfig, null, 2));
    
    await execAsync(`docker cp ${configPath} ${idle.container_id}:/app/config/user.json`);
    
    // 5. Set environment variables
    const envVars = [
      `USER_ID=${userId}`,
      `SUBDOMAIN=${subdomain}`,
      `TIER=${tier}`,
      `INSTANCE_ID=${instanceId}`
    ];
    
    if (apiKeys.openai) envVars.push(`OPENAI_API_KEY=${apiKeys.openai}`);
    if (apiKeys.anthropic) envVars.push(`ANTHROPIC_API_KEY=${apiKeys.anthropic}`);
    
    await execAsync(`docker exec ${idle.container_id} bash -c 'export ${envVars.join(' ')} && echo "${envVars.join('\n')}" >> /etc/environment'`);
    
    // 6. Restart container to pick up config
    await execAsync(`docker restart ${idle.container_id}`);
    await new Promise(r => setTimeout(r, 5000)); // Wait for startup
    
    // 7. Update Caddy routing
    await updateCaddy(subdomain, idle.container_ip);
    
    // 8. Move from pool to assigned
    db.run('DELETE FROM pool WHERE container_id = ?', [idle.container_id]);
    db.run(
      `INSERT INTO instances (id, user_id, subdomain, node_ip, container_id, container_ip, status, tier)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [instanceId, userId, subdomain, idle.node_ip, idle.container_id, idle.container_ip, 'running', tier]
    );
    
    // 9. Return instance info
    res.json({
      success: true,
      instance: {
        id: instanceId,
        subdomain: subdomain,
        url: `https://${subdomain}.${CONFIG.BASE_DOMAIN}`,
        gateway_url: `ws://${idle.container_ip}:${CONFIG.GATEWAY_PORT}`,
        status: 'running'
      }
    });
    
  } catch (error) {
    console.error('Assignment failed:', error);
    res.status(500).json({ error: 'Assignment failed', details: error.message });
  }
});

// GET /health - Health check
app.get('/health', (req, res) => {
  db.get('SELECT COUNT(*) as idle_count FROM pool WHERE status = "idle"', (err, row) => {
    if (err) {
      return res.status(500).json({ status: 'error', error: err.message });
    }
    res.json({
      status: 'healthy',
      idle_instances: row.idle_count,
      min_pool_size: CONFIG.MIN_POOL_SIZE
    });
  });
});

// GET /instance/:userId - Get user's instance
app.get('/instance/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.get('SELECT * FROM instances WHERE user_id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Instance not found' });
    
    res.json({
      id: row.id,
      subdomain: row.subdomain,
      url: `https://${row.subdomain}.${CONFIG.BASE_DOMAIN}`,
      status: row.status,
      tier: row.tier,
      created_at: row.created_at
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ClawDeploy Assignment API running on port ${PORT}`);
});
