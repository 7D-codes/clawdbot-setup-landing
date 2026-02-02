# AI API Key Management & Fair Usage Policy

**Technical Implementation Guide**  
**For:** Development Team  
**Version:** 1.0

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Clawdbot System                         │
├─────────────────────────────────────────────────────────────┤
│  Customer A (Basic)      Customer B (Basic)                │
│  Quota: 1,500/mo         Quota: 1,500/mo                   │
│        │                        │                          │
│        └──────────┬─────────────┘                          │
│                   │                                         │
│           ┌───────▼────────┐                              │
│           │  Pool Manager  │                              │
│           │  - Routing     │                              │
│           │  - Quota Track │                              │
│           │  - Load Balancing│                            │
│           └───────┬────────┘                              │
│                   │                                         │
│        ┌──────────┴──────────┐                            │
│        │                     │                            │
│   ┌────▼────┐          ┌────▼────┐                       │
│   │ Kimi    │          │ Kimi    │   ← Shared Pools      │
│   │ Key #1  │          │ Key #2  │                       │
│   │ $40/mo  │          │ $40/mo  │                       │
│   └─────────┘          └─────────┘                       │
│                                                           │
│  Customer C (Pro)                                        │
│  Quota: Unlimited                                        │
│        │                                                  │
│        ▼                                                  │
│   ┌─────────┐                                            │
│   │ Claude  │   ← Dedicated Key                          │
│   │ Key #C  │                                            │
│   │ $20/mo  │                                            │
│   └─────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Pool Configuration

### Kimi Basic Pool
```yaml
pool_name: "kimi_basic"
plan_cost_usd: 40
max_customers_per_key: 6
cost_per_customer_usd: 6.67
cost_per_customer_sar: 25
quota_per_customer: 1500
hard_limit: 2500
overage_rate_sar: 0.05
buffer_percent: 55
```

### Kimi Business Pool
```yaml
pool_name: "kimi_business"
plan_cost_usd: 40
max_customers_per_key: 3
cost_per_customer_usd: 13.33
cost_per_customer_sar: 50
quota_per_customer: 4000
hard_limit: 6000
overage_rate_sar: 0.05
buffer_percent: 40
```

### Claude Pro (Dedicated)
```yaml
pool_name: "claude_pro"
plan_cost_usd: 20
customers_per_key: 1
cost_per_customer_usd: 20
cost_per_customer_sar: 75
quota_per_customer: null  # unlimited
fair_use_limit: 25000
overage_rate_sar: null
```

---

## Database Schema

### API Keys Table
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    provider VARCHAR(20) NOT NULL,  -- 'kimi', 'claude', 'gemini'
    key_encrypted TEXT NOT NULL,    -- encrypted API key
    pool_type VARCHAR(20) NOT NULL, -- 'basic', 'business', 'pro'
    max_customers INTEGER NOT NULL,
    current_customers INTEGER DEFAULT 0,
    monthly_cost_usd DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    rate_limit_remaining INTEGER,   -- track API rate limits
    rate_limit_reset TIMESTAMP
);
```

### Customer Quota Tracking
```sql
CREATE TABLE customer_quotas (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    tier VARCHAR(20) NOT NULL,
    api_key_id UUID REFERENCES api_keys(id),
    monthly_quota INTEGER NOT NULL,
    requests_used INTEGER DEFAULT 0,
    requests_remaining INTEGER,
    billing_cycle_start DATE,
    billing_cycle_end DATE,
    overage_count INTEGER DEFAULT 0,
    is_throttled BOOLEAN DEFAULT false,
    last_request_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Request Logs (for monitoring)
```sql
CREATE TABLE ai_request_logs (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES customers(id),
    api_key_id UUID REFERENCES api_keys(id),
    request_type VARCHAR(50),       -- 'chat', 'knowledge_base', 'calendar'
    tokens_input INTEGER,
    tokens_output INTEGER,
    response_time_ms INTEGER,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Pool Manager Logic

### Customer Assignment Algorithm

```python
class PoolManager:
    def assign_customer_to_pool(self, customer_id: str, tier: str) -> APIKey:
        """
        Assign customer to least-loaded pool key
        """
        # Find available keys for this tier
        available_keys = APIKey.query.filter(
            APIKey.pool_type == tier,
            APIKey.is_active == True,
            APIKey.current_customers < APIKey.max_customers
        ).order_by(APIKey.current_customers.asc()).all()
        
        if available_keys:
            # Assign to least loaded key
            selected_key = available_keys[0]
        else:
            # Create new key (if under budget)
            selected_key = self.create_new_key(tier)
        
        # Create quota record
        quota = CustomerQuota(
            customer_id=customer_id,
            tier=tier,
            api_key_id=selected_key.id,
            monthly_quota=self.get_quota_for_tier(tier),
            billing_cycle_start=datetime.now(),
            billing_cycle_end=datetime.now() + timedelta(days=30)
        )
        
        # Increment key customer count
        selected_key.current_customers += 1
        
        db.session.add(quota)
        db.session.commit()
        
        return selected_key
    
    def get_quota_for_tier(self, tier: str) -> int:
        quotas = {
            'basic': 1500,
            'business': 4000,
            'pro': None  # unlimited
        }
        return quotas.get(tier)
```

### Request Routing with Quota Check

```python
class AIRequestRouter:
    def route_request(self, customer_id: str, message: str) -> str:
        """
        Route AI request with quota enforcement
        """
        # Get customer's quota
        quota = CustomerQuota.query.filter(
            CustomerQuota.customer_id == customer_id,
            CustomerQuota.billing_cycle_end > datetime.now()
        ).first()
        
        if not quota:
            raise NoActiveQuotaError("No active quota found")
        
        # Check if quota exceeded
        if quota.tier != 'pro':
            if quota.requests_used >= quota.monthly_quota:
                # Check overage allowance
                if quota.requests_used < quota.monthly_quota * 1.2:  # 20% overage
                    # Log overage for billing
                    quota.overage_count += 1
                else:
                    # Hard limit reached
                    raise QuotaExceededError(
                        f"Monthly quota exceeded. Upgrade to Business or Pro."
                    )
        
        # Get API key
        api_key = APIKey.query.get(quota.api_key_id)
        
        # Check rate limit on key
        if api_key.rate_limit_remaining < 5:
            # Try to rotate to another key in pool (if shared)
            if quota.tier in ['basic', 'business']:
                api_key = self.rotate_to_available_key(quota)
        
        # Make API call
        start_time = time.time()
        try:
            response = self.call_ai_api(api_key, message)
            success = True
            error = None
        except Exception as e:
            response = None
            success = False
            error = str(e)
        
        # Log request
        self.log_request(
            customer_id=customer_id,
            api_key_id=api_key.id,
            success=success,
            error=error,
            response_time_ms=(time.time() - start_time) * 1000
        )
        
        if success:
            # Increment usage
            quota.requests_used += 1
            quota.requests_remaining = quota.monthly_quota - quota.requests_used
            quota.last_request_at = datetime.now()
            
            # Update key rate limit tracking
            api_key.rate_limit_remaining -= 1
            
            db.session.commit()
            
            # Check for upgrade trigger (80% usage)
            if quota.tier != 'pro' and quota.requests_remaining == quota.monthly_quota * 0.2:
                self.send_upgrade_notification(customer_id, quota)
        
        return response
```

---

## Quota Monitoring & Alerts

### Daily Monitoring Job

```python
@scheduler.task('cron', hour=9, minute=0)
def daily_quota_check():
    """
    Run daily at 9 AM to check quotas and send alerts
    """
    # Get customers at 80% quota
    at_80_percent = CustomerQuota.query.filter(
        CustomerQuota.requests_used >= CustomerQuota.monthly_quota * 0.8,
        CustomerQuota.requests_used < CustomerQuota.monthly_quota * 0.95
    ).all()
    
    for quota in at_80_percent:
        send_email(
            to=quota.customer.email,
            subject="⚠️ You've used 80% of your AI quota",
            template="quota_warning_80",
            context={
                'used': quota.requests_used,
                'quota': quota.monthly_quota,
                'remaining': quota.requests_remaining,
                'upgrade_url': f"/upgrade?customer={quota.customer_id}"
            }
        )
    
    # Get customers at 95% quota
    at_95_percent = CustomerQuota.query.filter(
        CustomerQuota.requests_used >= CustomerQuota.monthly_quota * 0.95,
        CustomerQuota.requests_used < CustomerQuota.monthly_quota
    ).all()
    
    for quota in at_95_percent:
        send_email(
            to=quota.customer.email,
            subject="🚨 You've used 95% of your AI quota",
            template="quota_warning_95",
            context={
                'used': quota.requests_used,
                'quota': quota.monthly_quota,
                'upgrade_url': f"/upgrade?customer={quota.customer_id}"
            }
        )
    
    # Check for abuse patterns (>150% of tier average)
    tier_averages = db.session.query(
        CustomerQuota.tier,
        func.avg(CustomerQuota.requests_used).label('avg_usage')
    ).group_by(CustomerQuota.tier).all()
    
    for tier, avg_usage in tier_averages:
        heavy_users = CustomerQuota.query.filter(
            CustomerQuota.tier == tier,
            CustomerQuota.requests_used > avg_usage * 1.5
        ).all()
        
        for quota in heavy_users:
            notify_support(
                f"Customer {quota.customer_id} using 150%+ of {tier} average",
                priority="medium"
            )
```

### Monthly Billing Job

```python
@scheduler.task('cron', day=1, hour=0, minute=5)
def monthly_billing_cycle():
    """
    Reset quotas and bill overages at start of month
    """
    # Get all active quotas
    active_quotas = CustomerQuota.query.filter(
        CustomerQuota.billing_cycle_end <= datetime.now()
    ).all()
    
    for quota in active_quotas:
        # Bill overages if any
        if quota.overage_count > 0:
            overage_charge = quota.overage_count * 0.05  # 0.05 SAR per request
            create_invoice(
                customer_id=quota.customer_id,
                amount=overage_charge,
                description=f"AI overage: {quota.overage_count} requests",
                due_date=datetime.now() + timedelta(days=7)
            )
        
        # Reset quota for new cycle
        quota.requests_used = 0
        quota.requests_remaining = quota.monthly_quota
        quota.overage_count = 0
        quota.is_throttled = False
        quota.billing_cycle_start = datetime.now()
        quota.billing_cycle_end = datetime.now() + timedelta(days=30)
    
    db.session.commit()
```

---

## Fair Usage Enforcement

### Throttling Logic

```python
def enforce_fair_usage(customer_id: str) -> bool:
    """
    Returns True if request should proceed, False if throttled
    """
    quota = get_current_quota(customer_id)
    
    # Pro tier - check fair use only
    if quota.tier == 'pro':
        if quota.requests_used > 25000:  # fair use limit
            # Still allow but log for review
            log_fair_use_violation(customer_id, quota.requests_used)
            return True
        return True
    
    # Basic/Business tiers
    usage_percent = quota.requests_used / quota.monthly_quota
    
    if usage_percent >= 1.0:
        # Quota exceeded
        if usage_percent < 1.2:
            # Overage zone - allow with warning
            return True
        else:
            # Hard limit - throttle
            quota.is_throttled = True
            db.session.commit()
            return False
    
    return True
```

### Auto-Upgrade Prompts

```python
def check_auto_upgrade_eligibility(customer_id: str) -> dict:
    """
    Check if customer should be prompted to upgrade
    """
    quota = get_current_quota(customer_id)
    
    # Check historical usage
    last_3_months = CustomerQuotaHistory.query.filter(
        CustomerQuotaHistory.customer_id == customer_id
    ).order_by(CustomerQuotaHistory.month.desc()).limit(3).all()
    
    eligibility = {
        'eligible': False,
        'reason': None,
        'recommended_tier': None
    }
    
    # Rule 1: Hit 80% quota 2 months in a row
    if len(last_3_months) >= 2:
        high_usage_months = sum(
            1 for h in last_3_months[:2] 
            if h.usage_percent >= 0.8
        )
        if high_usage_months >= 2:
            eligibility['eligible'] = True
            eligibility['reason'] = 'consistently_high_usage'
            eligibility['recommended_tier'] = get_next_tier(quota.tier)
    
    # Rule 2: Current month >150% of quota
    if quota.requests_used > quota.monthly_quota * 1.5:
        eligibility['eligible'] = True
        eligibility['reason'] = 'quota_exceeded_significantly'
        eligibility['recommended_tier'] = get_next_tier(quota.tier)
    
    # Rule 3: Customer complained about speed
    recent_tickets = SupportTicket.query.filter(
        SupportTicket.customer_id == customer_id,
        SupportTicket.category == 'performance',
        SupportTicket.created_at > datetime.now() - timedelta(days=30)
    ).count()
    
    if recent_tickets > 0 and quota.tier != 'pro':
        eligibility['eligible'] = True
        eligibility['reason'] = 'performance_complaints'
        eligibility['recommended_tier'] = 'pro'
    
    return eligibility
```

---

## Dashboard Metrics

### Admin Dashboard Views

```python
DASHBOARD_METRICS = {
    'pool_health': {
        'basic_keys_active': 'count',
        'basic_avg_customers_per_key': 'avg',
        'business_keys_active': 'count',
        'business_avg_customers_per_key': 'avg',
        'pro_keys_active': 'count',
    },
    'usage_today': {
        'total_requests': 'sum',
        'avg_response_time': 'avg',
        'error_rate': 'percent',
        'quota_exceeded_count': 'count'
    },
    'financial': {
        'api_costs_this_month': 'sum',
        'cost_per_customer_avg': 'avg',
        'overage_revenue': 'sum',
        'margin_percent': 'calc'
    },
    'alerts': {
        'customers_at_80_percent': 'list',
        'customers_at_95_percent': 'list',
        'throttled_customers': 'list',
        'abuse_suspects': 'list'
    }
}
```

### Customer Dashboard View

```python
CUSTOMER_DASHBOARD = {
    'current_tier': 'string',
    'quota': {
        'total': 'integer',
        'used': 'integer',
        'remaining': 'integer',
        'percent_used': 'percent',
        'resets_on': 'date'
    },
    'usage_history': [
        {'month': 'string', 'requests': 'integer', 'percent': 'percent'}
    ],
    'upgrade_recommendation': {
        'eligible': 'boolean',
        'reason': 'string',
        'recommended_tier': 'string',
        'projected_savings': 'sar'
    }
}
```

---

## Emergency Procedures

### API Key Exhaustion

```python
def handle_key_exhaustion(pool_type: str):
    """
    When a shared pool key hits rate limits
    """
    # 1. Alert admin
    notify_admin(f"API key exhausted for {pool_type} pool", priority="high")
    
    # 2. Emergency key rotation
    exhausted_key = get_exhausted_key(pool_type)
    
    # 3. Temporarily route to backup key
    backup_key = get_backup_key(pool_type)
    if backup_key:
        route_all_to_key(exhausted_key.id, backup_key.id)
    
    # 4. Provision new key if budget allows
    if can_provision_new_key():
        new_key = create_new_key(pool_type)
        redistribute_customers(exhausted_key.id, [backup_key.id, new_key.id])
    
    # 5. Notify affected customers of temporary slowdown
    affected_customers = get_customers_on_key(exhausted_key.id)
    for customer in affected_customers:
        send_notification(
            customer.id,
            "Temporary AI slowdown - we're fixing this now",
            type="system"
        )
```

### Cost Overrun Protection

```python
MONTHLY_API_BUDGET_SAR = 5000  # Maximum spend

def check_budget_overrun():
    """
    Daily check to prevent cost overruns
    """
    current_spend = get_monthly_api_spend()
    projected_spend = project_monthly_spend(current_spend)
    
    if projected_spend > MONTHLY_API_BUDGET_SAR * 0.9:
        # Alert at 90%
        notify_admin(
            f"API spend at 90% of budget: {current_spend}/{MONTHLY_API_BUDGET_SAR}",
            priority="high"
        )
    
    if projected_spend > MONTHLY_API_BUDGET_SAR:
        # Emergency: pause new Basic tier signups
        pause_tier_signups('basic')
        notify_admin(
            "API budget exceeded. Paused Basic tier signups.",
            priority="critical"
        )
```

---

## Testing Checklist

- [ ] Pool assignment works correctly
- [ ] Quota tracking is accurate
- [ ] 80% alerts fire correctly
- [ ] 95% alerts fire correctly
- [ ] Hard limits enforce properly
- [ ] Overage billing calculates correctly
- [ ] Auto-upgrade prompts trigger correctly
- [ ] Key rotation works under load
- [ ] Dashboard metrics are accurate
- [ ] Monthly reset works correctly
- [ ] Emergency procedures tested

---

**Document Owner:** Technical Lead  
**Review Schedule:** Monthly  
**Last Updated:** January 2, 2025
