# Technical Deployment Review - Omar (Customer #1)
**Server:** 194.163.148.131 (Contabo VPS, 8GB RAM, Ubuntu 24.04)  
**Customer:** Omar (Telegram bot)  
**Bot Token:** `8552194792:AAEaHXvn3gMwjsIYOVLZi_4_uVCcJmJLsp0`  
**Date:** February 2025  
**Status:** REVISED - Simplified for first customer

---

## Executive Summary

This document outlines the **corrected, simplified deployment** for Omar's Clawdbot instance. The original plan was over-engineered for a single-customer setup.

**Key Changes:**
- ❌ Removed: Docker/containers, gateway service, complex infrastructure
- ✅ Kept: Direct OpenClaw installation, simple monitoring, WhatsApp alerts

---

## Original Plan Problems

| Issue | Why It Was Wrong | Fix |
|-------|------------------|-----|
| **Containers** | Unnecessary overhead for 1 customer on dedicated VPS | Direct installation on host |
| **Clone repo** | OpenClaw installs via official script, not git clone | Use `curl openclaw.ai/install.sh \| bash` |
| **Gateway now** | Gateway is Phase 2 architecture, not needed today | Defer to future scaling |
| **Complex rate limiting** | Hard limits require gateway infrastructure | Soft limits via logging + alerts |

---

## Corrected Deployment Plan

### Phase 1: Server Prep (5 minutes)

```bash
# SSH into the server
ssh root@194.163.148.131

# Update and install basics
apt update && apt upgrade -y
apt install -y curl git htop nginx

# Create clawdbot user (security best practice)
useradd -m -s /bin/bash clawdbot
usermod -aG sudo clawdbot
```

### Phase 2: OpenClaw Installation (3 minutes)

```bash
# Switch to clawdbot user
su - clawdbot

# Install OpenClaw (OFFICIAL METHOD)
curl -fsSL https://openclaw.ai/install.sh | bash

# Verify installation
clawdbot --version
```

### Phase 3: Configure Bot (5 minutes)

```bash
# Initialize clawdbot config
mkdir -p ~/.config/clawdbot
cat > ~/.config/clawdbot/config.yaml << 'EOF'
bot:
  name: "Omar's Assistant"
  telegram_token: "8552194792:AAEaHXvn3gMwjsIYOVLZi_4_uVCcJmJLsp0"
  
# Customer settings
customer:
  id: "omar-001"
  name: "Omar"
  plan: "starter"
  
# Features enabled
features:
  task_reminders: true
  scheduling: true
  whatsapp_alerts: true
  
# WhatsApp for admin alerts (your number)
alerts:
  whatsapp_number: "+YOUR_NUMBER"  # Replace with your WhatsApp
  
# Usage tracking (soft limits)
usage:
  daily_request_limit: 100        # Soft limit, logs only
  alert_threshold: 80             # Alert at 80% of limit
  alert_email: "admin@clawdbot.ai"
EOF
```

### Phase 4: Set Up Systemd Service (3 minutes)

```bash
# Create service file
sudo tee /etc/systemd/system/clawdbot-omar.service << 'EOF'
[Unit]
Description=Clawdbot for Omar
After=network.target

[Service]
Type=simple
User=clawdbot
WorkingDirectory=/home/clawdbot
Environment=NODE_ENV=production
Environment=TELEGRAM_TOKEN=8552194792:AAEaHXvn3gMwjsIYOVLZi_4_uVCcJmJLsp0
ExecStart=/usr/local/bin/clawdbot start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable clawdbot-omar
sudo systemctl start clawdbot-omar

# Check status
sudo systemctl status clawdbot-omar
```

### Phase 5: Usage Monitoring Script (4 minutes)

Create a simple monitoring script that tracks requests and sends WhatsApp alerts:

```bash
# Create monitoring script
sudo tee /opt/clawdbot-monitor.sh << 'EOF'
#!/bin/bash
# Usage monitoring for Omar's bot

LOG_FILE="/var/log/clawdbot-omar.log"
DAILY_COUNT=$(grep "$(date +%Y-%m-%d)" "$LOG_FILE" | grep -c "AI_REQUEST")
LIMIT=100
THRESHOLD=80

# Log current count
echo "[$(date)] Daily requests: $DAILY_COUNT / $LIMIT" >> /var/log/clawdbot-usage.log

# Alert at 80% threshold
if [ "$DAILY_COUNT" -ge "$THRESHOLD" ] && [ "$DAILY_COUNT" -lt "$((THRESHOLD + 5))" ]; then
    # Send WhatsApp alert (using your preferred method)
    curl -X POST https://api.callmebot.com/whatsapp.php \
        -d "phone=YOUR_NUMBER" \
        -d "text=⚠️ Omar's bot at 80% daily limit ($DAILY_COUNT/$LIMIT)" \
        -d "apikey=YOUR_API_KEY"
fi

# Alert at 100% limit
if [ "$DAILY_COUNT" -ge "$LIMIT" ] && [ "$DAILY_COUNT" -lt "$((LIMIT + 5))" ]; then
    curl -X POST https://api.callmebot.com/whatsapp.php \
        -d "phone=YOUR_NUMBER" \
        -d "text=🚨 Omar's bot reached daily limit ($DAILY_COUNT/$LIMIT)" \
        -d "apikey=YOUR_API_KEY"
fi
EOF

sudo chmod +x /opt/clawdbot-monitor.sh

# Add to cron (runs every 15 minutes)
echo "*/15 * * * * root /opt/clawdbot-monitor.sh" | sudo tee -a /etc/crontab
```

---

## Rate Limiting Strategy (SOFT LIMITS)

### Why Soft Limits?

| Hard Limits (Gateway) | Soft Limits (Logging) |
|----------------------|----------------------|
| Requires gateway infrastructure | Built into bot logging |
| Blocks requests when exceeded | Alerts but doesn't block |
| Complex to maintain | Simple bash script |
| Needed at scale (100+ customers) | Perfect for 1-10 customers |

### Implementation

1. **Log every AI request** with timestamp
2. **Count requests per day** via grep
3. **Alert at 80%** via WhatsApp
4. **Alert at 100%** via WhatsApp
5. **Manual review** if limits consistently hit

### Log Format

```
2025-02-02T10:30:00Z AI_REQUEST customer=omar-001 model=gpt-4 tokens=150
2025-02-02T10:35:00Z AI_REQUEST customer=omar-001 model=gpt-4 tokens=200
```

---

## File Structure

```
/home/clawdbot/
├── .config/clawdbot/
│   └── config.yaml          # Bot configuration
├── logs/
│   └── clawdbot.log         # Application logs
└── data/
    └── omar-tasks.json      # Customer data

/opt/
├── clawdbot-monitor.sh      # Usage monitoring
└── clawdbot-alert.sh        # Alert dispatcher

/etc/systemd/system/
└── clawdbot-omar.service    # Systemd service

/var/log/
├── clawdbot-omar.log        # AI request logs
└── clawdbot-usage.log       # Daily usage summary
```

---

## Complete Installation Script

Save this as `deploy-omar.sh` and run on the server:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Clawdbot for Omar..."

# 1. Server prep
echo "📦 Updating system..."
apt update && apt upgrade -y
apt install -y curl git htop nginx

# 2. Create user
echo "👤 Creating clawdbot user..."
useradd -m -s /bin/bash clawdbot 2>/dev/null || true

# 3. Install OpenClaw
echo "🔧 Installing OpenClaw..."
curl -fsSL https://openclaw.ai/install.sh | bash

# 4. Configure
echo "⚙️ Configuring bot..."
mkdir -p /home/clawdbot/.config/clawdbot
chown -R clawdbot:clawdbot /home/clawdbot

# 5. Install service
echo "🔄 Setting up systemd service..."
cat > /etc/systemd/system/clawdbot-omar.service << 'EOF'
[Unit]
Description=Clawdbot for Omar
After=network.target

[Service]
Type=simple
User=clawdbot
WorkingDirectory=/home/clawdbot
Environment=NODE_ENV=production
Environment=TELEGRAM_TOKEN=8552194792:AAEaHXvn3gMwjsIYOVLZi_4_uVCcJmJLsp0
ExecStart=/usr/local/bin/clawdbot start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable clawdbot-omar

# 6. Create monitoring
echo "📊 Setting up monitoring..."
cat > /opt/clawdbot-monitor.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/clawdbot-omar.log"
DAILY_COUNT=$(grep "$(date +%Y-%m-%d)" "$LOG_FILE" 2>/dev/null | grep -c "AI_REQUEST" || echo "0")
echo "[$(date)] Daily requests: $DAILY_COUNT / 100" >> /var/log/clawdbot-usage.log
EOF
chmod +x /opt/clawdbot-monitor.sh
echo "*/15 * * * * root /opt/clawdbot-monitor.sh" >> /etc/crontab

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Add your WhatsApp number to /opt/clawdbot-monitor.sh"
echo "2. Run: systemctl start clawdbot-omar"
echo "3. Check status: systemctl status clawdbot-omar"
echo "4. Test bot on Telegram"
```

---

## Commands Reference

```bash
# Check bot status
sudo systemctl status clawdbot-omar

# View logs
sudo journalctl -u clawdbot-omar -f

# Restart bot
sudo systemctl restart clawdbot-omar

# View usage
sudo tail -f /var/log/clawdbot-usage.log

# Daily request count
grep "$(date +%Y-%m-%d)" /var/log/clawdbot-omar.log | grep -c "AI_REQUEST"
```

---

## WhatsApp Alert Setup

To receive alerts on your phone:

1. **Option A: CallMeBot** (Free, easiest)
   - Message `+34 644 53 59 50` with `I allow callmebot to send me messages`
   - Get your API key from reply
   - Update `/opt/clawdbot-monitor.sh` with your number and API key

2. **Option B: Twilio** (More reliable, paid)
   - Sign up at twilio.com
   - Get WhatsApp Business API credentials
   - Update script with Twilio API details

---

## When to Add Gateway (Phase 2)

**Current:** Soft limits via logging ✅  
**Future (10+ customers):** Add gateway for centralized rate limiting

Gateway becomes necessary when:
- Multiple customers share infrastructure
- Need hard rate limits (block, don't just alert)
- Centralized billing/usage tracking required
- Load balancing across multiple servers

**Estimate:** Phase 2 in 3-6 months based on customer growth.

---

## Summary

| Component | Original Plan | Corrected Plan |
|-----------|--------------|----------------|
| Installation | Clone repo + Docker | `curl openclaw.ai/install.sh \| bash` |
| Rate Limiting | Gateway (hard limits) | Logging + WhatsApp alerts (soft limits) |
| Infrastructure | Containers + Gateway | Direct VPS install |
| Monitoring | Complex metrics | Simple bash script |
| Deployment Time | ~2 hours | ~15 minutes |

**This plan gets Omar's bot running TODAY, not next week.**
