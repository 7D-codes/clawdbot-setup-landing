# Omar Setup Checklist
**Customer:** Omar (First customer - free setup)
**Email:** oamkadi@gmail.com
**Platform:** Telegram
**Focus:** Task reminders

## Setup Steps

### 1. Server Provisioning
- [ ] Create Hetzner CX11 account or use existing
- [ ] Provision Ubuntu 22.04 server
- [ ] Configure SSH keys
- [ ] Set up firewall (UFW)

### 2. Clawdbot Installation
- [ ] SSH into server
- [ ] Install Node.js 20+
- [ ] Install Git
- [ ] Clone Clawdbot repository
- [ ] Install dependencies
- [ ] Configure environment variables

### 3. Telegram Integration
- [ ] Create Telegram bot via @BotFather
- [ ] Get bot token
- [ ] Configure webhook/polling
- [ ] Test bot connection

### 4. Skills Configuration
- [ ] Enable task reminder skill
- [ ] Set up cron jobs for reminders
- [ ] Configure notification preferences
- [ ] Test reminder functionality

### 5. Handover
- [ ] Send credentials to oamkadi@gmail.com
- [ ] Provide usage guide
- [ ] Schedule brief training call

## Timeline
- Start: 2026-02-02 11:00
- Target completion: 2026-02-03 11:00 (24h)
- Status: PENDING - Waiting for server provisioning

## Cost (Updated)
- Server: $4.99/month (~19 SAR) - Hostinger KVM 1
- Customer pays: 25 SAR/month
- Our margin: ~6 SAR/month

## Server Decision
**Provider:** Hostinger
**Plan:** KVM 1
**Why:** 4GB RAM, daily backups included, easier dashboard
**Link:** https://www.hostinger.com/vps-hosting
