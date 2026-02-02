# Clawdbot Setup Service - Product Architecture

## Executive Summary

This document outlines the complete architecture for a managed Clawdbot installation service targeting non-technical Saudi customers. The recommended approach is **Option C: Hybrid Multi-Tenant Architecture** — combining the security of isolated environments with the cost efficiency of shared infrastructure.

---

## 1. Infrastructure Architecture

### 1.1 Recommended Approach: Containerized Multi-Tenant with Resource Isolation

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS (Host Node)                           │
│                   €12-15/month (Hetzner CX42)                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Customer   │  │  Customer   │  │  Customer   │  ...     │
│  │  Container  │  │  Container  │  │  Container  │          │
│  │  (Omar)     │  │  (Future)   │  │  (Future)   │          │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤          │
│  │• Clawdbot   │  │• Clawdbot   │  │• Clawdbot   │          │
│  │  Core      │  │  Core      │  │  Core      │          │
│  │• Telegram  │  │• Telegram/  │  │• WhatsApp   │          │
│  │  Bot       │  │  WhatsApp   │  │  Bridge    │          │
│  │• SQLite DB │  │• SQLite DB  │  │• SQLite DB  │          │
│  │• Memory    │  │• Memory     │  │• Memory     │          │
│  │  Volume    │  │  Volume     │  │  Volume     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │        Reverse Proxy (Nginx/Caddy)              │        │
│  │    • TLS termination    • Rate limiting         │        │
│  │    • Webhook routing    • DDoS protection       │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Why Not Option A or B?

| Aspect | Option A: Shared VPS | Option B: Separate VPS | Option C: Hybrid (Recommended) |
|--------|---------------------|----------------------|-------------------------------|
| **Security** | ❌ Data leakage risk | ✅ Complete isolation | ✅ Container isolation + encryption |
| **Cost/customer** | €0.50 | €5.35 | €1.20-2.00 |
| **Scalability** | ⚠️ Hard to scale per-user | ❌ Expensive to scale | ✅ Easy container scaling |
| **Margins** | High (but risky) | Thin (3 SAR) | Healthy (15-20 SAR) |
| **Compliance** | ❌ Hard to guarantee | ✅ Easy | ✅ Auditable isolation |

### 1.3 Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Host** | Ubuntu 22.04 LTS | Base OS |
| **Container Runtime** | Docker + Docker Compose | Isolation |
| **Orchestration** | Simple Docker Compose per customer | Lightweight management |
| **Reverse Proxy** | Caddy | Automatic HTTPS, simple config |
| **Database** | SQLite per container | Zero-config, file-based |
| **Secrets** | Docker Secrets / Host-mounted volumes | API keys isolation |
| **Monitoring** | Uptime Kuma + simple health checks | Alert on failures |

### 1.4 Resource Allocation per Customer

```yaml
# docker-compose.yml template per customer
services:
  clawdbot:
    image: clawdbot:latest
    container_name: clawdbot-${CUSTOMER_ID}
    resources:
      limits:
        cpus: '0.5'        # Half a CPU core
        memory: 512M       # 512MB RAM
      reservations:
        cpus: '0.1'
        memory: 128M
    volumes:
      - ./data:/app/data           # Persistent data
      - ./memory:/app/memory       # Memory files
      - ./secrets:/app/secrets:ro  # API keys (read-only)
    networks:
      - clawdbot-net
    restart: unless-stopped
    # Security: No host network, no privileged mode
```

---

## 2. User Onboarding Journey

### 2.1 Complete Journey Map

```
AWARENESS → INTEREST → SIGNUP → SETUP → ACTIVATION → HABIT
    │          │         │       │          │         │
    ▼          ▼         ▼       ▼          ▼         ▼
  Friend     Landing   Simple   Guided   First     Daily
  referral   page      form     wizard   message   use
```

### 2.2 Stage 1: Awareness → Interest (Marketing)

**Channel Strategy:**
- WhatsApp/Telegram status shares from early users
- Saudi tech Twitter (X) influencers
- Local business owner communities

**Key Message (Arabic):**
> "تبي مساعد ذكي يرد على رسايلك ويفكرك بمواعيدك؟ بدون ما تفهم تقنية؟"
> 
> *"Want a smart assistant to reply to your messages and remind you of appointments? Without understanding technology?"*

### 2.3 Stage 2: Signup (Landing Page)

**Landing Page Structure:**
```
┌─────────────────────────────────────────┐
│   🤖 مساعدك الذكي الشخصي               │
│   Your Personal AI Assistant            │
├─────────────────────────────────────────┤
│                                         │
│  • يرد على رسايلك وأنت مشغول          │
│    → Replies when you're busy           │
│                                         │
│  • يفكرك بمواعيدك ومهامك               │
│    → Reminds you of appointments        │
│                                         │
│  • يحجز لك المواعيد                     │
│    → Books appointments for you         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    ابدأ الآن - Start Now        │   │
│  │    29 ريال/شهر (~$8/month)      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [How it works video - 60 seconds]      │
│                                         │
└─────────────────────────────────────────┘
```

### 2.4 Stage 3: Setup Wizard (The Critical Path)

**Goal:** Zero technical knowledge required. 5 minutes or less.

#### Step 1: Basic Info (30 seconds)
```
┌─────────────────────────────────────────┐
│  مرحباً! خلنا نجهز مساعدك 👋           │
│  Welcome! Let's set up your assistant   │
├─────────────────────────────────────────┤
│                                         │
│  اسمك؟ / Your name?                     │
│  [________________]                     │
│                                         │
│  وشنو المساعد يسوي؟                     │
│  What should the assistant do?          │
│                                         │
│  ☑️ يرد على التلغرام                   │
│  ☑️ يفكرني بمواعيدي                    │
│  ☐ يحجز مواعيد نيابة عني               │
│                                         │
│  [ التالي - Next ]                      │
└─────────────────────────────────────────┘
```

#### Step 2: Telegram Connection (2 minutes)

**For Non-Technical Users:**

Instead of "Get Bot Token from @BotFather", we do:

```
┌─────────────────────────────────────────┐
│  ربط التلغرام 📱                        │
│  Connect Telegram                       │
├─────────────────────────────────────────┤
│                                         │
│  الخطوة 1: افتح التلغرام               │
│  Step 1: Open Telegram                  │
│                                         │
│  الخطوة 2: اضغط على الرابط:            │
│  Step 2: Click this link:               │
│  ┌─────────────────────────────────┐   │
│  │  t.me/ClawdbotHelperBot         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  الخطوة 3: اضغط "Start" في التلغرام    │
│  Step 3: Press "Start" in Telegram      │
│                                         │
│  الخطوة 4: انسخ الكود اللي يعطيك       │
│  Step 4: Copy the code we give you      │
│                                         │
│  [الكود: _______] [تحقق - Verify]       │
│                                         │
└─────────────────────────────────────────┘
```

**Technical Reality:**
- Our @ClawdbotHelperBot acts as intermediary
- User talks to helper bot → Helper creates bot via BotFather API → Returns token
- User never sees the complex token

#### Step 3: First Task Setup (1 minute)
```
┌─────────────────────────────────────────┐
│  أول مهمة للمساعد ✨                    │
│  Your assistant's first task            │
├─────────────────────────────────────────┤
│                                         │
│  متى تبي المساعد يفكرك بشي؟            │
│  When should we remind you?             │
│                                         │
│  ☐ كل يوم الساعة ٨ صباح (اجتماعات)     │
│    Daily at 8 AM (meetings)             │
│                                         │
│  ☐ كل أحد (تقرير الأسبوع)              │
│    Every Sunday (weekly report)         │
│                                         │
│  ☐ موعد محدد: [________]               │
│    Specific date                        │
│                                         │
│  [ تفعيل - Activate ]                   │
└─────────────────────────────────────────┘
```

#### Step 4: Confirmation
```
┌─────────────────────────────────────────┐
│  جاهز! 🎉                               │
│  All set!                               │
├─────────────────────────────────────────┤
│                                         │
│  مساعدك جاهز يشتغل!                    │
│  Your assistant is ready!               │
│                                         │
│  جرب الآن:                              │
│  Try now:                               │
│  ┌─────────────────────────────────┐   │
│  │  ارسل له رسالة في التلغرام    │   │
│  │  Send him a message on        │   │
│  │  Telegram                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  💡 نصيحة: قول "فكرني باجتماع          │
│     الساعة ٣"                          │
│     Tip: Say "Remind me of the         │
│     meeting at 3 PM"                    │
│                                         │
└─────────────────────────────────────────┘
```

### 2.5 Post-Setup: First 7 Days

| Day | Action | Channel |
|-----|--------|---------|
| 1 | Welcome message with tips | Telegram |
| 2 | "Try asking me to remind you of something" | Telegram |
| 3 | Feature highlight: Auto-replies | Telegram + Email |
| 5 | Check-in: "How's it going?" | Telegram |
| 7 | Usage stats + upgrade prompt | Telegram |

---

## 3. Privacy & Security Model

### 3.1 Core Principles

1. **Data Isolation:** Each customer's data never touches another's
2. **Encryption at Rest:** All stored data encrypted
3. **Minimal Collection:** Only what's necessary
4. **Transparency:** Clear privacy policy in Arabic
5. **Deletion:** Full data deletion on request

### 3.2 Technical Implementation

```
┌─────────────────────────────────────────────────────────┐
│                    HOST VPS                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │           LUKS Encryption Layer                  │   │
│  │     (Full disk encryption for data at rest)      │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────┼──────────────────────────┐   │
│  │                      ▼                          │   │
│  │  ┌─────────────┐  ┌─────────────┐              │   │
│  │  │ Customer A  │  │ Customer B  │              │   │
│  │  │ Container   │  │ Container   │              │   │
│  │  ├─────────────┤  ├─────────────┤              │   │
│  │  │ /data       │  │ /data       │              │   │
│  │  │ (encrypted) │  │ (encrypted) │              │   │
│  │  ├─────────────┤  ├─────────────┤              │   │
│  │  │ /memory     │  │ /memory     │              │   │
│  │  │ (encrypted) │  │ (encrypted) │              │   │
│  │  ├─────────────┤  ├─────────────┤              │   │
│  │  │ secrets/    │  │ secrets/    │              │   │
│  │  │ (read-only) │  │ (read-only) │              │   │
│  │  └─────────────┘  └─────────────┘              │   │
│  │                                                 │   │
│  │  NO SHARED:                                     │   │
│  │  • Databases                                    │   │
│  │  • Memory files                                 │   │
│  │  • Config files                                 │   │
│  │  • API keys                                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Data Flow Security

```
User Telegram Message
         │
         ▼
┌─────────────────┐
│  Telegram API   │
│  (HTTPS/TLS)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Webhook        │
│  (HTTPS + HMAC  │
│   signature)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Reverse Proxy  │
│  (Rate limit,   │
│   TLS)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Customer       │────▶│  SQLite (local) │
│  Container      │     │  (encrypted FS) │
│  (isolated)     │     └─────────────────┘
└─────────────────┘
```

### 3.4 Privacy Policy (Arabic Summary)

**What we store:**
- رسائلك مع المساعد (Your messages with the assistant)
- المواعيد والمهام اللي تطلبها (Appointments and tasks you request)
- إعداداتك الشخصية (Your personal settings)

**What we DON'T do:**
- ❌ مانبيع بياناتك لأحد (We don't sell your data)
- ❌ مانقرأ رسايلك الخاصة (We don't read your private messages)
- ❌ مانشّر معلوماتك (We don't share your information)

**Your rights:**
- ✅ تقدر تحذف بياناتك في أي وقت (You can delete your data anytime)
- ✅ تقدر تصدّر بياناتك (You can export your data)
- ✅ تقدر توقف الخدمة متى تبي (You can stop the service anytime)

### 3.5 Compliance

| Requirement | Implementation |
|-------------|---------------|
| SDAIA Guidelines | Data stays in Saudi region (future: Saudi-hosted VPS) |
| Data Localization | EU VPS for now, migrate to Saudi cloud when available |
| Right to Deletion | One-click deletion in dashboard + manual request via Telegram |
| Encryption | AES-256 at rest, TLS 1.3 in transit |

---

## 4. Pricing Model & Margin Analysis

### 4.1 Recommended Pricing Tiers

| Plan | Price | Features | Target Margin |
|------|-------|----------|---------------|
| **Basic** | 29 SAR/month | Auto-replies, 10 reminders/month, Telegram only | 40% |
| **Pro** | 49 SAR/month | Unlimited reminders, Telegram + WhatsApp, scheduling | 55% |
| **Business** | 99 SAR/month | Multiple users, custom responses, priority support | 65% |

### 4.2 Cost Analysis

#### Infrastructure Costs (Per Customer)

| Item | Cost (EUR) | Cost (SAR) | Notes |
|------|-----------|-----------|-------|
| Host VPS (shared) | €0.80 | 3.20 SAR | €12/15 customers |
| Backup storage | €0.10 | 0.40 SAR | Daily backups |
| Monitoring | €0.05 | 0.20 SAR | Uptime checks |
| Bandwidth | €0.10 | 0.40 SAR | Webhook traffic |
| **Total Infra** | **€1.05** | **4.20 SAR** | |

#### Operational Costs (Per Customer)

| Item | Cost (SAR) | Notes |
|------|-----------|-------|
| Payment processing | 1.50 SAR | ~5% of 29 SAR |
| Support (async) | 2.00 SAR | Estimated per user |
| Telegram API | 0.00 SAR | Free tier |
| **Total OpEx** | **3.50 SAR** | |

#### Total Cost Per Customer

| Plan | Infra + OpEx | Revenue | Margin | Margin % |
|------|-------------|---------|--------|----------|
| Basic | 7.70 SAR | 29 SAR | 21.30 SAR | 73% |
| Pro | 7.70 SAR | 49 SAR | 41.30 SAR | 84% |
| Business | 10.00 SAR | 99 SAR | 89.00 SAR | 90% |

### 4.3 Break-Even Analysis

```
Host VPS Cost: €12/month = 48 SAR/month

At Basic plan (29 SAR):
- Fixed cost: 48 SAR
- Variable cost per customer: 3.50 SAR
- Revenue per customer: 29 SAR

Break-even = 48 / (29 - 3.50) = 48 / 25.50 = 1.88 customers

✅ Profitable with just 2 customers!
✅ At 15 customers: Revenue = 435 SAR, Costs = 100.50 SAR
   Profit = 334.50 SAR/month (77% margin)
```

### 4.4 Margin Optimization Strategies

#### Strategy 1: Annual Prepayment
- Offer 25% discount for annual payment
- Improves cash flow + reduces churn
- Example: 290 SAR/year instead of 348 SAR

#### Strategy 2: Upsell Path
```
Basic (29 SAR) ──▶ Pro (49 SAR) ──▶ Business (99 SAR)
    70%           Upgrade at         Upgrade at
    of users      month 3            month 6
```

#### Strategy 3: Shared Infrastructure Efficiency

| Customers per Host | Cost/Customer | Margin at 29 SAR |
|-------------------|---------------|------------------|
| 5 | 13.10 SAR | 55% |
| 10 | 8.30 SAR | 71% |
| 15 | 6.70 SAR | 77% |
| 20 | 5.90 SAR | 80% |

**Sweet spot:** 15-20 customers per host VPS

### 4.5 Revenue Projections

| Month | Customers | Monthly Revenue | Monthly Costs | Profit |
|-------|-----------|-----------------|---------------|--------|
| 1 | 5 | 145 SAR | 65.50 SAR | 79.50 SAR |
| 3 | 12 | 348 SAR | 90.00 SAR | 258.00 SAR |
| 6 | 25 | 725 SAR | 135.50 SAR | 589.50 SAR |
| 12 | 50 | 1,450 SAR | 223.00 SAR | 1,227.00 SAR |

---

## 5. Implementation Roadmap

### Phase 1: MVP (Week 1-2)
- [ ] Set up host VPS with Docker
- [ ] Create customer container template
- [ ] Build simple landing page
- [ ] Manual onboarding for Omar

### Phase 2: Automation (Week 3-4)
- [ ] Automated container provisioning
- [ ] Self-service setup wizard
- [ ] Payment integration (Mada/SADAD)
- [ ] Basic monitoring

### Phase 3: Scale (Month 2-3)
- [ ] WhatsApp integration
- [ ] Second host VPS
- [ ] Automated backups
- [ ] Analytics dashboard

---

## 6. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **Container escape** | Run as non-root, seccomp profiles, AppArmor |
| **Resource exhaustion** | Hard limits on CPU/memory per container |
| **Data loss** | Daily encrypted backups to S3-compatible storage |
| **Host failure** | 4-hour SLA to restore on new host from backup |
| **Telegram API changes** | Abstraction layer, fallback to polling |
| **WhatsApp ban risk** | Clear ToS, rate limiting, human-in-loop for new features |

---

## 7. Recommendation Summary

**GO WITH OPTION C: Hybrid Multi-Tenant**

**Why:**
1. ✅ 77% margins at scale (vs 12% for Option B)
2. ✅ True data isolation (unlike Option A)
3. ✅ Can still migrate power users to dedicated VPS later
4. ✅ Easy to scale: add customers to existing host, or spin up new host
5. ✅ Simple to operate: one host to monitor, one backup strategy

**Next Steps:**
1. Set up first host VPS (Hetzner CX42)
2. Create container template
3. Onboard Omar manually (learn from real experience)
4. Build self-service wizard based on learnings
5. Launch with 10 beta customers at 19 SAR (discounted)
6. Iterate and scale

---

*Document Version: 1.0*
*Date: 2025-01-19*
*Author: Product Development Lead*
