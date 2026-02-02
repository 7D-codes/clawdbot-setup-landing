# Clawdbot Setup Service - Product Requirements Document (PRD)

## Overview
AI assistant setup service for non-technical Saudi businesses. Customers get their own Clawdbot instance without knowing what a "server" or "AI" is.

## Problem Statement
Non-technical Saudi business owners want AI automation (auto-replies, scheduling, reminders) but cannot:
- Install technical software
- Configure servers
- Understand APIs or "MCP"

## Solution
We handle 100% of the technical setup. Customer just:
1. Pays monthly fee
2. Gives us their WhatsApp/Telegram
3. We deliver working AI assistant in 24 hours

## Architecture

### Infrastructure: Container-Based Multi-Tenant
- **Host:** Hetzner (Germany/Finland)
- **Technology:** Docker containers on shared VPS
- **Isolation:** Each customer in separate container with encrypted volumes
- **Cost:** ~4 SAR/customer/month
- **Capacity:** 15-20 customers per €12 host

### Security
- Container isolation (no shared databases)
- AES-256 encryption at rest
- TLS 1.3 in transit
- One-click data deletion for GDPR/PDPL compliance

## Pricing Model

### 3-Tier Structure
| Tier | Price | Target | Features | Margin |
|------|-------|--------|----------|--------|
| **Basic** | 49 SAR | Individuals | Task reminders, auto-reply | 92% |
| **Business** | 99 SAR | Small biz | Full features + support | 96% |
| **Pro** | 199 SAR | Companies | Priority + custom dev | 98% |

### Anchor Tier
**Business (99 SAR)** — what 70% of customers choose

### First Customer Special
Omar: 79 SAR (20% discount, grandfathered)

## Payment Strategy

### Phase 1: Manual (Now - 10 customers)
- **Method:** STC Pay, Bank transfer
- **Process:** Invoice → Customer pays → We activate
- **Pros:** Zero setup, start immediately
- **Cons:** Manual work, not scalable

### Phase 2: Local Gateway (10+ customers)
- **Options:** Paymob, Tap Payments
- **Features:** Mada cards (most popular in Saudi), STC Pay, Apple Pay
- **Requirements:** Commercial Registration
- **Cost:** 2.5-3% per transaction

### Phase 3: International (Scale)
- **Option:** Polar + Stripe
- **Features:** Global cards, subscriptions, Apple Pay/Google Pay
- **Requirements:** US/UK entity
- **Cost:** 2.9% + 30¢ per transaction

## User Journey (Non-Technical)

### Step 1: Discovery
- Sees Haraj ad or word-of-mouth
- Clicks WhatsApp link

### Step 2: Sales Conversation
- Chat with sales agent (me)
- Explain needs (no technical jargon)
- Get pricing

### Step 3: Payment
- Receive STC Pay number or bank account
- Pay monthly fee
- Send receipt

### Step 4: Onboarding
- Give email + preferred platform (WhatsApp/Telegram)
- We create everything
- Receive "ready" message in 24h

### Step 5: Handover
- Simple video guide (Arabic)
- WhatsApp support for questions
- Monthly check-in

## Legal Requirements

### Before First 10 Customers
- [ ] Basic Terms of Service ( drafted ✅)
- [ ] Privacy Policy ( drafted ✅)

### Before Scaling (10+ customers)
- [ ] Commercial Registration (Saudi)
- [ ] SDAIA registration (AI authority)
- [ ] PDPL compliance (privacy law)

## Financial Projections

### Break-Even Analysis
- Fixed costs: ~300 SAR/month (hosting, tools)
- Revenue per customer: 99 SAR
- Cost per customer: 4 SAR
- **Break-even: 3 customers**

### Year 1 Target
- 50 customers average
- Revenue: 59,400 SAR/year
- Costs: 4,800 SAR/year (hosting)
- **Profit: ~54,600 SAR**

## Key Metrics
- **CAC (Customer Acquisition Cost):** 100 SAR (Haraj ads)
- **LTV (Lifetime Value):** 1,188 SAR (12 months avg)
- **LTV:CAC Ratio:** 11.88:1 (excellent)
- **Churn Rate Target:** <5%/month

## Success Criteria
1. ✅ First customer deployed (Omar)
2. ✅ 10 customers in Month 1
3. ✅ Break-even achieved (Month 1)
4. ✅ 50 customers by Month 6
5. ✅ Legal compliance (Month 2)

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Technical failure | Daily backups, monitoring |
| Data breach | Container isolation, encryption |
| Customer churn | Monthly check-ins, feature updates |
| Legal issues | Register business before scaling |
| Payment delays | Clear terms, manual follow-up |

## Next Actions
1. Build container infrastructure
2. Deploy Omar's instance
3. Update landing page with new pricing
4. Start Commercial Registration
5. Launch Haraj ad campaign

---
*Document created: 2026-02-02*
*Status: Draft - Awaiting implementation*
