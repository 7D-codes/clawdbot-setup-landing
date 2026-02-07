# ClawDeploy — Business Model Deep Dive

**Date:** 2026-02-07  
**Status:** Revenue model analysis - addressing edge cases

---

## 🚨 The Core Problem

**API costs are NOT predictable.**

| Model | Cost/M tokens | If user uses 1M tokens |
|-------|---------------|------------------------|
| DeepSeek | $0.27 | We pay $0.27 |
| GPT-4o-mini | $0.60 | We pay $0.60 |
| GPT-4o | $10.00 | We pay $10.00 |
| Claude Opus | $75.00 | **We pay $75.00** |

**Scenario:** Pro user ($29/mo) uses Opus heavily → We lose $46/month on that user.

**Multi-agent multiplier:** 5 sub-agents all using Opus = 5x cost = $375/month loss.

---

## 💡 The Solutions

### Option 1: Model Tiers (RECOMMENDED)

**Don't let users pick expensive models freely. Guide them.**

| Tier | Monthly Price | Model Access | Approx. Cost/User |
|------|---------------|--------------|-------------------|
| **Free** | $0 | DeepSeek + GPT-4o-mini only | ~$0.50 |
| **Pro** | $29 | Above + GPT-4o + Claude Sonnet | ~$5-8 |
| **Pro+** | $49 | Above + 50 Opus requests/mo | ~$12-15 |
| **Team** | $79 | All models, shared pool | ~$15-20 |

**Why this works:**
- Users get "good enough" models by default
- Expensive models (Opus) are limited/rationed
- We control costs by controlling access
- Still feels "unlimited" to users

**UI:**
```
Model: [Auto (Recommended)] [GPT-4o] [Claude Sonnet] [Opus - 12 left]
```

---

### Option 2: Credit System (Inside Hosting)

**One price, but credits refresh at different rates.**

| Tier | Price | Credits | Refresh |
|------|-------|---------|---------|
| Free | $0 | 100 credits | Daily (3/day) |
| Pro | $29 | 1000 credits | Weekly (250/week) |
| Pro+ | $49 | 5000 credits | Weekly |

**Credit costs:**
- DeepSeek question: 1 credit
- GPT-4o question: 5 credits
- Opus question: 50 credits

**Why this works:**
- Users understand "credits" like mobile data
- No hard cutoff - can buy more credits
- Expensive models naturally limited
- Predictable costs for us

**The "No Cutoff" Experience:**
```
You have 12 credits left (refreshes in 2 days)

[Continue with cheap models] or [Buy 100 credits for $5]
```

---

### Option 3: "Soft Limits" (Best UX)

**Never disable the user. Degrade gracefully.**

**How it works:**
1. User hits monthly "fair use" limit
2. Instead of cutoff, we auto-switch to cheaper models
3. User sees: "Using efficient model to save credits"
4. Can upgrade or wait for refresh

**Example:**
```
Pro user: 1000 "premium requests" included

Request #1001: "Switching to GPT-4o-mini to stay within plan"
User can: [Upgrade to Pro+] [Continue with mini] [Buy credits]
```

**Why this works:**
- User never gets locked out
- Still functional (just lower quality)
- Incentivizes upgrade
- We never eat unlimited costs

---

### Option 4: Usage-Based (Most Fair, Least Appealing)

| Component | Price |
|-----------|-------|
| Hosting | $9/mo (our infrastructure cost + margin) |
| AI Credits | Pay-as-you-go |

**Example:**
- User pays $9 for hosting
- Then buys $20 in credits
- Uses credits however they want

**Why this is fair but bad:**
- Transparent costs
- Users hate "surprise bills"
- Complicates pricing
- Competitors (SimpleClaw) do bundled pricing

---

## 🎯 My Recommendation: Hybrid Model

### Pro Tier ($29/mo) - "Smart Unlimited"

**Includes:**
- Unlimited messages with auto-selected models
- Smart routing (cheap models when sufficient)
- 50 "premium override" requests/mo (force Opus/GPT-4o)
- 5 sub-agents (count as normal messages)

**What happens at limit:**
- Premium overrides run out → Auto-routing continues
- User can: Upgrade, buy override pack, or accept auto-routing

**Our cost estimate:**
- 90% of messages: DeepSeek/GPT-4o-mini (~$0.30/M)
- 10% of messages: GPT-4o (~$10/M)
- Average: ~$1.50 per heavy user per month
- Margin: $27.50/user/month (95% margin!)

### Pro+ Tier ($49/mo) - "Power User"

**Includes:**
- Everything in Pro
- 200 premium overrides/mo
- 20 sub-agents
- Priority routing (faster)

**Our cost:** ~$5-8/user/month  
**Margin:** $41-44/user/month

---

## 📊 Edge Cases & Solutions

### Edge Case 1: User Spawns 100 Sub-Agents

**Problem:** 100 agents × 1000 messages = 100,000 messages = $100+ cost

**Solution:**
- Sub-agents share the same "message pool" as main agent
- Or: Limit sub-agents by tier (Free: 0, Pro: 5, Pro+: 20)
- Or: Sub-agents only use cheap models

### Edge Case 2: User Uses Opus for Everything

**Problem:** One Opus request costs us $0.05-0.20

**Solution:**
- Pro tier: 50 Opus requests included, then blocked or switched
- Or: Opus only available on Pro+
- Or: Opus costs 10x "credits" so users naturally conserve

### Edge Case 3: User Hits Limit Day 2

**Problem:** User pays $29, uses all credits in 2 days, feels ripped off

**Solution:**
- "Rolling window" credits (refresh weekly not monthly)
- Soft limits (throttle, don't block)
- Clear usage dashboard: "You've used 80% of premium requests"

### Edge Case 4: API Price Changes

**Problem:** OpenAI doubles prices, our margins evaporate

**Solution:**
- TOS: "Prices subject to change with 30 days notice"
- ClawRouter shields us (switches to cheaper models)
- Maintain 3-month buffer in pricing

### Edge Case 5: Abusive Users (Bots, Spam)

**Problem:** User scripts 1000 requests/hour

**Solution:**
- Rate limits: 100 req/min per user
- Anomaly detection: Flag unusual patterns
- TOS violation → account review

---

## 💰 Unit Economics

### Conservative Scenario
| Metric | Value |
|--------|-------|
| Pro users | 100 |
| Avg messages/user/mo | 500 |
| % cheap models | 95% |
| % premium | 5% |
| Cost per user | ~$2.50 |
| Revenue per user | $29 |
| Gross margin | **91%** |
| Monthly profit | $2,650 |

### Worst Case Scenario (Heavy Opus Usage)
| Metric | Value |
|--------|-------|
| Pro users | 100 |
| Avg messages/user/mo | 500 |
| % cheap models | 50% |
| % Opus | 50% |
| Cost per user | ~$20 |
| Revenue per user | $29 |
| Gross margin | **31%** |
| Monthly profit | $900 |

**Mitigation:** Limit Opus usage on Pro tier

---

## 🎯 Final Recommendation

**Pricing Tiers:**

| Tier | Price | What You Get |
|------|-------|--------------|
| **Starter** | Free | 50 msg/day, cheap models only, 0 sub-agents |
| **Pro** | $29/mo | "Unlimited" auto-routed, 50 premium/mo, 5 sub-agents |
| **Pro+** | $49/mo | "Unlimited" + 200 premium/mo, 20 sub-agents |
| **Team** | $79/mo | 5 seats, shared pool, analytics |

**Key Principles:**
1. **Never hard-cutoff** — throttle to cheap models instead
2. **Guide model choice** — smart default, premium costs more
3. **Transparent limits** — clear dashboard showing usage
4. **Weekly refresh** — feels better than monthly
5. **Buy more anytime** — credit top-ups available

**The Pitch:**
> "Unlimited AI conversations. We automatically use the best (and cheapest) model for each task. Want the absolute best? Use your premium requests."

---

## ❓ Open Business Questions

1. **Should we show users the model being used?** (Transparency vs simplicity)
2. **Should we allow BYOK (Bring Your Own Key) as an option?** (Lower our costs but more complexity)
3. **Free trial?** (7 days Pro, then downgrade?)
4. **Annual discount?** (2 months free?)
5. **Referral program?** ($10 credit for referrer + referred?)
6. **Non-profit/education pricing?**
7. **What happens when a user cancels?** (Data export, grace period)

---

**Ready for business team review.**
