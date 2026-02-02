# Rate Limiting Design Document

## Overview
System for tracking and limiting AI API usage per customer to control costs and enable tiered pricing.

## Current Approach (Phase 1: Soft Limits)

### Architecture
```
Customer Request → Clawdbot → AI Provider (Kimi/Claude)
       ↓
Monitoring Script (logs usage, sends alerts)
       ↓
Dashboard/Notifications
```

### How It Works
1. **No blocking** — all requests go through normally
2. **Logging** — track tokens/requests per customer in database
3. **Alerting** — send warnings at thresholds:
   - 80%: "You've used 80% of your monthly limit"
   - 100%: "Upgrade to Pro for unlimited usage"
   - 120%: Flag for manual review
4. **Manual intervention** — we contact customer to upgrade

### Implementation
```python
# Pseudocode for monitoring middleware
async def log_ai_request(customer_id, tokens_used):
    current_usage = await db.increment_usage(customer_id, tokens_used)
    tier_limit = get_tier_limit(customer_id)  # 500, 3000, or unlimited
    
    percentage = (current_usage / tier_limit) * 100
    
    if percentage >= 80 and not alerted_80:
        await send_whatsapp_alert(customer_id, "80% used")
    elif percentage >= 100 and not alerted_100:
        await send_whatsapp_alert(customer_id, "100% used, upgrade needed")
```

### Pros
- ✅ Fast to implement (no infrastructure changes)
- ✅ Customer experience uninterrupted
- ✅ We learn real usage patterns
- ✅ Builds trust (warnings before blocks)

### Cons
- ❌ Risk of overspending if customer ignores warnings
- ❌ Manual intervention required
- ❌ No hard stops (honor system)

---

## Future Approach (Phase 2: Hard Limits via Gateway)

### Architecture
```
Customer Request → Clawdbot → API Gateway → AI Provider
                               ↑
                         Rate Limit Check
                         (Redis counter)
```

### Components

#### 1. Gateway (Nginx + Lua or Kong)
- Intercepts all AI API requests
- Checks customer usage against tier limit
- Forwards or blocks based on limit

#### 2. Redis Database
```
key: usage:omar-001:2025-02
value: 2450 (requests used)
ttl: end of month
```

#### 3. Customer Configuration
```bash
# Instead of direct Kimi API key:
KIMI_API_KEY=sk-omar-001-shared-key
OPENAI_BASE_URL=http://gateway.clawdbot.local/v1
CUSTOMER_ID=omar-001
```

#### 4. Gateway Logic (Lua)
```lua
local customer_id = ngx.req.get_headers()["X-Customer-ID"]
local current_usage = redis:get("usage:" .. customer_id)
local tier_limit = get_tier_limit(customer_id) -- from database

if current_usage >= tier_limit then
    ngx.status = 429
    ngx.say('{"error": "لقد تجاوزت الحد الشهري"}')
    return
end

-- Forward to AI provider
redis:incr("usage:" .. customer_id)
ngx.exec("@ai_backend")
```

### Error Response (Arabic)
```json
{
  "error": {
    "message": "لقد استهلكت حدك الشهري. ترقى للباقة Pro للاستخدام غير المحدود.",
    "code": "rate_limit_exceeded",
    "current_usage": 3000,
    "tier_limit": 3000,
    "upgrade_url": "https://wa.me/966507407827"
  }
}
```

### Pros
- ✅ Automatic enforcement
- ✅ No manual intervention
- ✅ Scales to 100+ customers
- ✅ Precise cost control

### Cons
- ❌ Complex to implement
- ❌ Single point of failure (gateway down = all down)
- ❌ More infrastructure to maintain

---

## Migration Path

### Phase 1 (Now - 10 customers): Soft Limits
- Deploy with monitoring only
- Manual alerts via WhatsApp
- Learn usage patterns

### Phase 2 (10+ customers): Hard Limits
- Build API Gateway
- Migrate customers gradually
- Keep soft limits as grace period (110% before hard block)

### Phase 3 (Scale): Intelligent Routing
- Multiple AI provider keys (overflow handling)
- Dynamic load balancing
- Usage prediction and pre-warnings

---

## Customer Communication

### 80% Warning
"مرحبا [الاسم]! 👋

لقد استهلكت 80% من حدك الشهري للذكاء الاصطناعي (2400 من 3000 طلب).

متوقع تكفيك لنهاية الشهر، بس لو تحتاج أكثر، ترقى للباقة Pro.

للترقية: [رابط واتساب]"

### 100% Warning
"[الاسم]، وصلت للحد الشهري (3000 طلب). 🚦

مساعدك الذكي راح يستمر يشتغل بس بردود أبطأ (بدون AI).

للاستخدام غير المحدود، ترقى للباقة Pro بـ 199 ريال/شهر.

تواصل معنا: [رابط واتساب]"

---

## Implementation Checklist

### Phase 1 (Deploy Now)
- [ ] Add usage logging to Omar's instance
- [ ] Create simple monitoring script
- [ ] Set up WhatsApp alerts
- [ ] Document current usage baseline

### Phase 2 (Gateway)
- [ ] Deploy Nginx + Lua gateway
- [ ] Set up Redis instance
- [ ] Migrate API keys to gateway
- [ ] Test with 1-2 customers
- [ ] Full rollout

---

## Decision Log

**Date:** 2026-02-02
**Decision:** Start with Option A (Soft Limits)
**Rationale:**
- Fast deployment for first customer
- Low risk (friend, trust-based)
- Learn real usage before building complex system
- Maintain momentum

**Next Review:** After Omar's first month of usage

---

*Document for Omar deployment and future reference.*
