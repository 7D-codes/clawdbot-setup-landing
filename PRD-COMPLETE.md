# ClawDeploy — Complete Product Requirements Document

**Version:** 1.0 | **Date:** 2026-02-07 | **Status:** Ready for Implementation

---

## 1. Executive Summary

### 1.1 Vision
**"OpenClaw in one click"** — Managed OpenClaw hosting with instant deployment, skill marketplace, and multi-agent orchestration. Users get a production-ready AI assistant infrastructure without DevOps knowledge.

### 1.2 Target Market
- **Primary:** Developers and technical founders who want OpenClaw without managing servers
- **Secondary:** Small teams (2-10 people) needing shared AI infrastructure
- **Tertiary:** Agencies deploying AI solutions for clients

### 1.3 Business Model
- **Free Tier:** 100 messages/month, 3 skills, 1 agent
- **Pro ($29/mo):** Unlimited messages, 20 skills, 5 sub-agents
- **Team ($79/mo):** 5 seats, unlimited everything
- **Enterprise:** Custom pricing, SSO, SLA

**AI Credits:** Separate billing (bring your own API key OR buy credits from us at 20% markup)

### 1.4 Success Metrics
- Time to first message: < 60 seconds from signup
- Uptime: 99.9%
- Free-to-paid conversion: > 10%
- Churn: < 5%/month

---

## 2. User Personas & Flows

### 2.1 Persona: Solo Developer (Alex)
- Wants OpenClaw but hates server management
- Has OpenAI API key ready
- Wants to start immediately

**Flow:**
1. Lands on marketing page
2. Clicks "Deploy Free"
3. Enters email, password, OpenAI key
4. Picks subdomain (alex.clawdeploy.com)
5. Gets redirected to dashboard
6. Starts chatting in < 60 seconds

### 2.2 Persona: Team Lead (Sarah)
- Managing 4-person startup
- Needs shared workspace
- Wants usage visibility

**Flow:**
1. Signs up for Team plan
2. Invites 3 team members via email
3. Configures shared integrations (Slack, Notion)
4. Team members join workspace
5. Shared agents available to all
6. Sarah views usage analytics

### 2.3 Persona: Agency Owner (Mike)
- Deploys AI solutions for clients
- Needs multiple isolated instances
- White-label capability

**Flow:**
1. Enterprise contract
2. Gets admin dashboard
3. Creates instance per client
4. Assigns custom domains
5. Manages all from single interface

---

## 3. Feature Specifications

### 3.1 Core Infrastructure

#### 3.1.1 Instance Provisioning
| Requirement | Specification |
|-------------|---------------|
| Deployment Time | < 60 seconds from signup to first message |
| Isolation | Each user gets dedicated Docker container |
| Resources (Free) | 0.5 CPU, 512MB RAM |
| Resources (Pro) | 1 CPU, 1GB RAM |
| Resources (Team) | 2 CPU, 2GB RAM |
| Storage | 10GB per instance |
| Backup | Daily automated backups, 30-day retention |

#### 3.1.2 Domain & SSL
| Requirement | Specification |
|-------------|---------------|
| Default Domain | `*.clawdeploy.com` wildcard |
| Custom Domain | Available on Pro+ tiers |
| SSL | Auto-generated Let's Encrypt certificates |
| SSL Renewal | Automatic, 30 days before expiry |
| DNS | Cloudflare for DDoS + caching |

#### 3.1.3 High Availability
| Requirement | Specification |
|-------------|---------------|
| Uptime SLA | 99.9% for paid tiers |
| Monitoring | Health checks every 30 seconds |
| Auto-Restart | Failed containers restart automatically |
| Multi-Region | Phase 2 (EU, US, Asia) |

### 3.2 User Management

#### 3.2.1 Authentication
| Feature | Implementation |
|---------|----------------|
| Signup | Email + password, email verification required |
| Login | JWT tokens, 7-day expiration |
| Password Reset | Email link, 1-hour expiry |
| MFA | Optional TOTP (Google Authenticator) |
| SSO | Enterprise only (SAML/OIDC) |

#### 3.2.2 Account Management
| Feature | Specification |
|---------|---------------|
| Profile | Name, email, timezone, avatar |
| API Keys | Encrypted storage, masked display |
| Security Log | Login history, IP addresses |
| Account Deletion | GDPR-compliant, 30-day grace period |

### 3.3 Instance Management

#### 3.3.1 Dashboard
**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Logo    Dashboard    Skills    Billing    ⚙️  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Status     │  │  Usage This Month       │  │
│  │  🟢 Running │  │  Messages: 1,234 / ∞    │  │
│  │  Uptime: 99%│  │  Tokens: 45K / 100K     │  │
│  └─────────────┘  └─────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Chat Interface (WebSocket)               │ │
│  │  [Similar to OpenClaw terminal UI]        │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Active Skills│  │  Recent Agents         │  │
│  │ • Web Search │  │  • Code Reviewer       │  │
│  │ • Gmail      │  │  • Research Assistant  │  │
│  │ • Calendar   │  │                        │  │
│  └──────────────┘  └────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### 3.3.2 Settings
| Section | Options |
|---------|---------|
| General | Subdomain, timezone, language |
| AI Providers | OpenAI, Anthropic, Google, custom endpoints |
| Integrations | OAuth connections to Slack, Notion, GitHub, etc. |
| SOUL | Preset selector, custom SOUL.md editor |
| Advanced | Export data, restart instance, delete account |

### 3.4 Skill System (ClawHub)

#### 3.4.1 Skill Structure
```yaml
skill:
  id: "github-manager"
  name: "GitHub Manager"
  version: "1.2.0"
  author: "clawhub"
  description: "Manage repos, issues, PRs"
  category: "Development"
  tags: ["git", "dev", "automation"]
  
  permissions:
    - internet
    - file_read
    - file_write
    
  config:
    - name: GITHUB_TOKEN
      type: secret
      required: true
      description: "GitHub Personal Access Token"
      
  tools:
    - name: github_search_repos
      description: "Search GitHub repositories"
      parameters:
        - name: query
          type: string
          required: true
```

#### 3.4.2 Skill Installation Flow
1. User browses ClawHub in dashboard
2. Clicks "Install" on desired skill
3. If config required → show form (e.g., paste GitHub token)
4. Backend fetches skill package from registry
5. Installs into user's container
6. Available immediately (no restart)

#### 3.4.3 Core Skills (Launch)
| Skill | Category | Priority |
|-------|----------|----------|
| web-search | Utility | P0 |
| gmail | Communication | P0 |
| google-calendar | Productivity | P0 |
| notion | Productivity | P0 |
| slack | Communication | P0 |
| github | Development | P0 |
| file-system | Utility | P0 |
| weather | Utility | P1 |
| timer | Utility | P1 |
| calculator | Utility | P1 |

### 3.5 Agent Management

#### 3.5.1 Sub-Agent Spawning
| Feature | Specification |
|---------|---------------|
| Limit (Free) | 1 (main agent only) |
| Limit (Pro) | 5 concurrent |
| Limit (Team) | 20 concurrent |
| Spawn Methods | Dashboard button, chat command, API |
| Context Sharing | Optional parent context inheritance |
| Isolation | Each sub-agent runs in isolated process |
| Monitoring | Real-time status in dashboard |

#### 3.5.2 Agent Presets
| Preset | Purpose | Default Skills |
|--------|---------|----------------|
| Coder | Code review, debugging, architecture | github, file-system, web-search |
| Researcher | Deep research, summarization | web-search, file-system |
| Writer | Content creation, editing | file-system |
| Analyst | Data analysis, reporting | file-system, calculator |
| General | All-purpose | All installed skills |

### 3.6 Billing & Monetization

#### 3.6.1 Subscription Tiers
| Feature | Free | Pro ($29) | Team ($79) |
|---------|------|-----------|------------|
| Messages/month | 100 | Unlimited | Unlimited |
| Sub-agents | 0 | 5 | 20 |
| Skills | 3 | 20 | Unlimited |
| Storage | 5GB | 10GB | 50GB |
| Custom Domain | ❌ | ✅ | ✅ |
| Team Members | 1 | 1 | 5 |
| Priority Support | ❌ | Email | Slack |
| SLA | ❌ | ❌ | 99.9% |

#### 3.6.2 AI Credit System
| Source | Markup | Notes |
|--------|--------|-------|
| Bring Your Own Key | 0% | User pays OpenAI directly |
| ClawDeploy Credits | 20% | We resell, simplified billing |

**Credit Pricing (Example):**
- $10 = 1M tokens (OpenAI GPT-4o)
- $20 = 2.5M tokens (bulk discount)

#### 3.6.3 Billing Flow
1. User enters card in Stripe Checkout
2. Webhook creates subscription in our DB
3. Instance tier upgraded immediately
4. Monthly charge on same date
5. Failed payment → 3 retries → grace period → downgrade

---

## 4. Technical Architecture

### 4.1 System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                │
│         (Web Dashboard, Chat, API Clients)                  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/WSS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare                                │
│              (DNS, DDoS, Caching)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Caddy (L4)    │    │   Main API       │
│ Reverse Proxy   │    │   (Node.js)      │
│                 │    │                  │
│ *.clawdeploy.com│    │ /auth, /billing, │
│ → Container IP  │    │ /webhook, /admin │
└────────┬────────┘    └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    VPS Nodes (Hetzner)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Container 1 │  │ Container 2 │  │ Container N │         │
│  │ (User A)    │  │ (User B)    │  │ (Idle)      │         │
│  │             │  │             │  │             │         │
│  │ OpenClaw +  │  │ OpenClaw +  │  │ OpenClaw    │         │
│  │ User Data   │  │ User Data   │  │ (Ready)     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  Shared: PostgreSQL (metadata), Redis (caching),            │
│          Pool Manager, Assignment API                        │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Component Specifications

#### 4.2.1 VPS Node (Per Server)
| Spec | Value |
|------|-------|
| Provider | Hetzner Cloud |
| Type | CPX31 (4 vCPU, 8GB RAM) |
| Cost | €12.60/month |
| OS | Ubuntu 22.04 LTS |
| Docker | Latest stable |
| Capacity | 15-20 active containers |

#### 4.2.2 Container Specs
| Aspect | Configuration |
|--------|---------------|
| Base Image | Ubuntu 22.04 + Node.js 20 |
| OpenClaw | Fork with custom APIs |
| Ports | 8080 (HTTP), 18789 (Gateway WS) |
| Resources | 0.5-2 CPU, 512MB-2GB RAM |
| Storage | 10GB volume mount |
| Network | Internal Docker network + exposed ports |

#### 4.2.3 Database Schema

**Table: users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  tier VARCHAR(20) DEFAULT 'free',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Table: instances**
```sql
CREATE TABLE instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subdomain VARCHAR(63) UNIQUE NOT NULL,
  node_ip INET NOT NULL,
  container_id VARCHAR(64) NOT NULL,
  container_ip INET NOT NULL,
  status VARCHAR(20) DEFAULT 'provisioning',
  tier VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP,
  deleted_at TIMESTAMP
);
```

**Table: api_keys (encrypted)**
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,  -- 'openai', 'anthropic', etc.
  key_encrypted TEXT NOT NULL,    -- AES-256 encrypted
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: skills_installed**
```sql
CREATE TABLE skills_installed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
  skill_id VARCHAR(100) NOT NULL,
  version VARCHAR(20) NOT NULL,
  config JSONB,  -- User's skill configuration
  installed_at TIMESTAMP DEFAULT NOW()
);
```

**Table: subscriptions (Stripe)**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 API Specifications

#### 4.3.1 Authentication API
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

#### 4.3.2 Instance Management API
```http
POST /api/instances
Authorization: Bearer <token>
Content-Type: application/json

{
  "subdomain": "john",  // Optional, auto-generated if omitted
  "apiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-..."
  }
}

Response: 201 Created
{
  "instance": {
    "id": "uuid",
    "subdomain": "john-a1b2",
    "url": "https://john-a1b2.clawdeploy.com",
    "gatewayUrl": "wss://john-a1b2.clawdeploy.com/ws",
    "status": "provisioning"
  }
}
```

```http
GET /api/instances/me
Authorization: Bearer <token>

Response: 200 OK
{
  "instance": {
    "id": "uuid",
    "subdomain": "john-a1b2",
    "url": "https://john-a1b2.clawdeploy.com",
    "status": "running",
    "tier": "pro",
    "usage": {
      "messagesThisMonth": 1234,
      "tokensThisMonth": 45000
    }
  }
}
```

```http
PATCH /api/instances/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "apiKeys": {
    "openai": "sk-new..."
  }
}

Response: 200 OK
{
  "message": "Instance updated, restart required",
  "restartRequired": true
}
```

#### 4.3.3 Skill Management API
```http
GET /api/skills
Authorization: Bearer <token>

Response: 200 OK
{
  "skills": [
    {
      "id": "github-manager",
      "name": "GitHub Manager",
      "description": "Manage repos, issues, PRs",
      "installed": false
    }
  ]
}
```

```http
POST /api/skills/install
Authorization: Bearer <token>
Content-Type: application/json

{
  "skillId": "github-manager",
  "config": {
    "GITHUB_TOKEN": "ghp_..."
  }
}

Response: 200 OK
{
  "message": "Skill installed successfully",
  "skill": { ... }
}
```

#### 4.3.4 Billing API
```http
POST /api/billing/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "tier": "pro",
  "successUrl": "https://clawdeploy.com/dashboard?success=true",
  "cancelUrl": "https://clawdeploy.com/pricing"
}

Response: 200 OK
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

```http
POST /api/billing/webhook
Content-Type: application/json
Stripe-Signature: <signature>

{ ... Stripe event ... }

Response: 200 OK
```

#### 4.3.5 Admin API (Internal)
```http
GET /admin/nodes
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "nodes": [
    {
      "ip": "1.2.3.4",
      "status": "healthy",
      "containers": {
        "total": 15,
        "idle": 3,
        "assigned": 12
      }
    }
  ]
}
```

```http
POST /admin/instances/migrate
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "instanceId": "uuid",
  "targetNode": "2.3.4.5"
}
```

### 4.4 Pool Management System

#### 4.4.1 Idle Pool Workflow
1. **Pool Manager** runs every 30 seconds
2. Checks current idle count
3. If < MIN_POOL_SIZE (5), creates new idle containers
4. If > MAX_POOL_SIZE (20), removes excess
5. Health checks all idle containers
6. Removes failed containers from pool

#### 4.4.2 Assignment Workflow
1. User signs up → API receives request
2. Get idle container from pool
3. Generate unique subdomain
4. Inject user config (API keys, tier, etc.)
5. Restart container to pick up config (5-10s)
6. Update Caddy config with new subdomain
7. Move container from "pool" to "assigned" in DB
8. Return instance details to user

#### 4.4.3 Deletion/Downgrade Workflow
1. User cancels/downgrades → Webhook received
2. Grace period: 7 days (data preserved)
3. After grace period:
   - Export data to S3
   - Stop container
   - Remove DNS entry
   - Archive DB record
4. Container returns to idle pool (if still valid)

---

## 5. Security Specifications

### 5.1 Data Protection
| Aspect | Implementation |
|--------|----------------|
| API Keys | AES-256 encrypted at rest, never logged |
| Passwords | bcrypt with salt, cost factor 12 |
| JWT Tokens | HS256, 7-day expiration, refresh tokens |
| Database | TLS connections, automated backups |
| File Storage | Encrypted volumes (LUKS) |

### 5.2 Network Security
| Aspect | Implementation |
|--------|----------------|
| DDoS Protection | Cloudflare (always-on) |
| WAF | Cloudflare rules + custom rules |
| Rate Limiting | 100 req/min per IP, 1000 req/min per user |
| Container Isolation | Docker network segmentation |
| SSH Access | Key-only, bastion host for prod |

### 5.3 Container Security
| Aspect | Implementation |
|--------|----------------|
| Non-root | Containers run as non-root user |
| Resource Limits | CPU/memory caps enforced |
| Read-only FS | Root filesystem read-only |
| No Privileges | No --privileged flag |
| Seccomp | Default Docker seccomp profile |

### 5.4 Compliance
- **GDPR:** Right to deletion, data export, privacy policy
- **PDPL:** Saudi data protection compliance
- **SOC 2:** Target for Year 2

---

## 6. Testing Plan

### 6.1 Unit Tests
| Module | Coverage Target | Tools |
|--------|-----------------|-------|
| API Routes | 80% | Jest |
| Pool Manager | 80% | Jest |
| Billing Logic | 90% | Jest |
| Encryption | 100% | Jest |

### 6.2 Integration Tests
| Flow | Test Cases |
|------|------------|
| Signup → Deploy | Happy path, invalid email, duplicate subdomain |
| Skill Install | Install, uninstall, update config |
| Billing | Subscribe, upgrade, downgrade, cancel |
| API Key Update | Update, invalid key, rotation |

### 6.3 Load Tests
| Scenario | Target |
|----------|--------|
| Signup Spike | 100 concurrent signups, <60s each |
| Chat Load | 1000 concurrent WebSocket connections |
| Skill Install | 50 concurrent installs |
| Pool Refill | Maintain 5 idle during 50 signups |

### 6.4 E2E Tests
| Flow | Tools |
|------|-------|
| Full User Journey | Playwright |
| Payment Flow | Stripe test mode |
| Container Lifecycle | Docker API tests |

---

## 7. Deployment Plan

### 7.1 Phase 1: MVP (Weeks 1-4)
**Goal:** Free tier only, basic functionality, validate demand

**Features:**
- Signup/login
- Free tier deployment (1 instance, 100 messages)
- 5 core skills
- Basic dashboard
- Manual billing (contact us for Pro)

**Infrastructure:**
- 2 Hetzner nodes
- Manual pool management
- SQLite database
- Single region (EU)

### 7.2 Phase 2: Paid Launch (Weeks 5-8)
**Goal:** Automated billing, Pro tier, scale to 100 users

**Features:**
- Stripe integration
- Pro tier with upgrades
- 10 core skills
- Custom domains
- Usage analytics

**Infrastructure:**
- Auto-scaling pool manager
- PostgreSQL database
- Redis caching
- Monitoring (Grafana)

### 7.3 Phase 3: Team/Enterprise (Weeks 9-12)
**Goal:** Team features, enterprise readiness

**Features:**
- Team workspaces
- 20 skills + ClawHub marketplace
- Admin dashboard
- SSO (SAML)
- SLA guarantees

**Infrastructure:**
- Multi-region (US, EU)
- Kubernetes migration
- Disaster recovery
- Compliance audit

---

## 8. Open Questions & Decisions

| Question | Options | Recommendation |
|----------|---------|----------------|
| **Database** | SQLite vs PostgreSQL | Start SQLite, migrate to PG at 100 users |
| **Container Orchestration** | Docker vs K8s | Docker for MVP, K8s at scale |
| **Skill Registry** | npm vs custom | npm for MVP, custom registry later |
| **AI Credits** | Resell vs BYOK | BYOK only for MVP, add credits later |
| **Regions** | EU only vs multi-region | EU only for MVP |
| **Custom Domains** | V1 or later | V1 (differentiator from SimpleClaw) |

---

## 9. Appendix

### 9.1 Glossary
- **Container:** Isolated Docker instance running one user's OpenClaw
- **Pool:** Collection of idle containers ready for assignment
- **ClawHub:** Skill marketplace/registry
- **SOUL:** OpenClaw's system prompt/personality configuration
- **Tier:** Subscription level (Free/Pro/Team/Enterprise)

### 9.2 External Dependencies
| Service | Purpose | Cost |
|---------|---------|------|
| Hetzner Cloud | VPS hosting | ~€12/node/month |
| Cloudflare | DNS, SSL, DDoS | Free tier → $20/mo |
| Stripe | Payments | 2.9% + 30¢ per transaction |
| Sentry | Error tracking | $26/mo |
| Grafana Cloud | Monitoring | Free tier |

### 9.3 Team Structure (Recommended)
| Role | Responsibility |
|------|----------------|
| Backend Engineer | API, pool manager, billing |
| DevOps Engineer | Infrastructure, Terraform, CI/CD |
| Frontend Engineer | Dashboard, marketing site |
| Full-stack (You) | Architecture, integration, product |

---

**End of Document**

*Ready for technical team review. Questions: file issues in GitHub or discuss in Slack.*
