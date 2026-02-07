const { exec } = require('child_process');
const { promisify } = require('util');
const sqlite3 = require('sqlite3').verbose();

const execAsync = promisify(exec);

// Config
const CONFIG = {
  MIN_POOL_SIZE: 5,
  MAX_POOL_SIZE: 20,
  CONTAINER_IMAGE: 'clawdeploy/openclaw:latest',
  IDLE_NETWORK: 'clawdeploy-net',
  GATEWAY_PORT_START: 20000,
  APP_PORT_START: 30000,
  CHECK_INTERVAL_MS: 30000, // Check every 30 seconds
  NODE_IP: process.env.NODE_IP || 'localhost'
};

// Database
const db = new sqlite3.Database('/opt/clawdeploy/instances.db');

// Get current idle count
async function getIdleCount() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM pool WHERE status = "idle"', (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
}

// Get next available ports
async function getNextPorts() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM pool', (err, row) => {
      if (err) reject(err);
      else {
        const idx = row.count;
        resolve({
          gateway: CONFIG.GATEWAY_PORT_START + idx,
          app: CONFIG.APP_PORT_START + idx
        });
      }
    });
  });
}

// Create new idle instance
async function createIdleInstance() {
  try {
    const ports = await getNextPorts();
    const containerName = `clawdeploy-idle-${Date.now()}`;
    
    console.log(`[POOL] Creating idle instance: ${containerName}`);
    
    // Run container
    const { stdout: containerId } = await execAsync(
      `docker run -d \\
        --name ${containerName} \\
        --network ${CONFIG.IDLE_NETWORK} \\
        --label "status=idle" \\
        --label "type=openclaw" \\
        -p ${ports.gateway}:18789 \\
        -p ${ports.app}:8080 \\
        --restart unless-stopped \\
        --memory="512m" \\
        --cpus="0.5" \\
        ${CONFIG.CONTAINER_IMAGE}`
    );
    
    const cid = containerId.trim();
    
    // Get container IP
    const { stdout: ipJson } = await execAsync(
      `docker inspect -f '{{json .NetworkSettings.Networks.${CONFIG.IDLE_NETWORK}}}' ${cid}`
    );
    const networkInfo = JSON.parse(ipJson.trim());
    const containerIp = networkInfo.IPAddress;
    
    // Wait for health check
    let healthy = false;
    let attempts = 0;
    while (!healthy && attempts < 30) {
      try {
        await execAsync(`docker exec ${cid} curl -fs http://localhost:8080/health`);
        healthy = true;
      } catch {
        attempts++;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    if (!healthy) {
      console.error(`[POOL] Instance ${cid} failed health check, removing`);
      await execAsync(`docker rm -f ${cid}`);
      return false;
    }
    
    // Add to pool database
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO pool (container_id, container_ip, node_ip, status) VALUES (?, ?, ?, ?)',
        [cid, containerIp, CONFIG.NODE_IP, 'idle'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log(`[POOL] Instance ${cid} added to pool (IP: ${containerIp})`);
    return true;
    
  } catch (error) {
    console.error('[POOL] Failed to create instance:', error);
    return false;
  }
}

// Remove excess idle instances
async function trimPool(currentCount) {
  if (currentCount <= CONFIG.MIN_POOL_SIZE) return;
  
  const excess = currentCount - CONFIG.MIN_POOL_SIZE;
  console.log(`[POOL] Trimming ${excess} excess instances`);
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT container_id FROM pool WHERE status = "idle" ORDER BY created_at DESC LIMIT ?',
      [excess],
      async (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        for (const row of rows) {
          try {
            await execAsync(`docker rm -f ${row.container_id}`);
            db.run('DELETE FROM pool WHERE container_id = ?', [row.container_id]);
            console.log(`[POOL] Removed ${row.container_id}`);
          } catch (e) {
            console.error(`[POOL] Failed to remove ${row.container_id}:`, e);
          }
        }
        resolve();
      }
    );
  });
}

// Main pool management loop
async function managePool() {
  try {
    const idleCount = await getIdleCount();
    console.log(`[POOL] Current idle instances: ${idleCount}/${CONFIG.MIN_POOL_SIZE}`);
    
    if (idleCount < CONFIG.MIN_POOL_SIZE) {
      const needed = CONFIG.MIN_POOL_SIZE - idleCount;
      console.log(`[POOL] Need ${needed} more instances`);
      
      for (let i = 0; i < needed; i++) {
        await createIdleInstance();
        await new Promise(r => setTimeout(r, 2000)); // Stagger creation
      }
    } else if (idleCount > CONFIG.MAX_POOL_SIZE) {
      await trimPool(idleCount);
    }
    
    // Cleanup any orphaned containers not in DB
    const { stdout: containerList } = await execAsync(
      `docker ps -q --filter "label=type=openclaw" --filter "label=status=idle"`
    );
    const runningContainers = containerList.trim().split('\n').filter(Boolean);
    
    const dbContainers = await new Promise((resolve, reject) => {
      db.all('SELECT container_id FROM pool', (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.container_id));
      });
    });
    
    for (const cid of runningContainers) {
      if (!dbContainers.includes(cid)) {
        console.log(`[POOL] Cleaning up orphaned container: ${cid}`);
        await execAsync(`docker rm -f ${cid}`);
      }
    }
    
  } catch (error) {
    console.error('[POOL] Management error:', error);
  }
}

// Health check all idle instances
async function healthCheck() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM pool WHERE status = "idle"', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      for (const row of rows) {
        try {
          await execAsync(`docker exec ${row.container_id} curl -fs http://localhost:8080/health`);
          console.log(`[HEALTH] ${row.container_id}: OK`);
        } catch {
          console.error(`[HEALTH] ${row.container_id}: FAILED, removing from pool`);
          try {
            await execAsync(`docker rm -f ${row.container_id}`);
          } catch {}
          db.run('DELETE FROM pool WHERE container_id = ?', [row.container_id]);
        }
      }
      resolve();
    });
  });
}

// Start
console.log('[POOL] Pool Manager starting...');
console.log(`[POOL] Config: MIN=${CONFIG.MIN_POOL_SIZE}, MAX=${CONFIG.MAX_POOL_SIZE}`);

// Run immediately, then on interval
managePool();
healthCheck();

setInterval(() => {
  managePool();
  healthCheck();
}, CONFIG.CHECK_INTERVAL_MS);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[POOL] Shutting down...');
  db.close();
  process.exit(0);
});
