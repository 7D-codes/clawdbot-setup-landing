# ClawDeploy — Business Team Briefing

**What We're Building:** AI Agent Hosting Platform  
**Tagline:** "OpenClaw in one click"  
**Target:** Developers and teams who want AI agents without managing servers

---

## The Product (In Simple Terms)

### What Is OpenClaw?
OpenClaw is an open-source AI assistant platform (like a self-hosted ChatGPT that can use tools). Users install it on their computer/server and it can:
- Answer questions using AI
- Search the web
- Send emails
- Write code
- Connect to 100+ services

**The Problem:** Installing and managing OpenClaw requires technical/DevOps knowledge.

### What Is ClawDeploy?
We host OpenClaw for users. They click "Deploy" and get a working AI assistant in under 1 minute.

**The User Experience:**
1. User visits clawdeploy.com
2. Clicks "Deploy Free"
3. Enters email, password, and AI preferences
4. Gets their own link: `username.clawdeploy.com`
5. Starts chatting immediately

**No setup. No servers. No configuration.**

---

## Key Features

### 1. One-Click Deploy
- Works in under 60 seconds
- Custom subdomain for each user
- SSL certificate auto-generated
- Isolated from other users

### 2. Smart Model Routing (Via ClawRouter)
- Automatically picks cheapest AI model that can handle the task
- Simple questions → Cheap models (DeepSeek: $0.27/M tokens)
- Complex questions → Good models (GPT-4o, Claude)
- **Saves users 78% on AI costs**
- Users can override and pick specific models

### 3. Skill Marketplace (ClawHub)
- One-click install integrations (Gmail, Slack, GitHub, Notion)
- Users browse marketplace → click install → instantly available
- No coding required

### 4. Sub-Agents
- Users can spawn specialized AI agents:
  - "Code Reviewer" agent for PRs
  - "Researcher" agent for deep dives
  - "Writer" agent for content
- Each runs independently but shares context

### 5. Team Workspaces
- Share agents between team members
- Shared integrations
- Usage analytics for admins

---

## How It Works (Technically Simple)

```
User Signs Up
    ↓
We pick an idle "container" (pre-made computer)
    ↓
We inject user's settings into it
    ↓
Give user a custom link
    ↓
User chats with their AI
```

**Behind the scenes:**
- Each user = 1 Docker container
- 15-20 containers per server (€12/mo server)
- Pool of idle containers ready for instant assignment
- Caddy reverse proxy for SSL/subdomains
- SQLite/PostgreSQL for user data

---

## Pricing Decisions Made

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Show which model is used?** | YES | Transparency builds trust |
| **Allow BYOK (Bring Your Own Key)?** | YES | Flexibility: use our routing OR bring your own API key |
| **Free trial?** | YES | 7-day Pro trial to beat competitors |
| **Annual discount?** | NO | Not for now, focus on monthly |
| **Referral program?** | MAYBE | "Refer a friend, get $10 credits" — needs technical review |
| **Education/non-profit pricing?** | NO | Standard pricing for all |
| **Data export on cancel?** | NO | Not for MVP |

**Pricing Tiers:**

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 50 messages/day, cheap models only |
| **Pro** | $29/mo | "Unlimited" smart-routed + 50 premium overrides/mo |
| **Pro+** | $49/mo | Unlimited + 200 premium overrides/mo |
| **Team** | $79/mo | 5 seats, shared workspace |

**Premium override = force use expensive model (Opus, GPT-4o)**

---

## Unit Economics

### Costs Per User (Monthly)

| Component | Cost |
|-----------|------|
| Server/VPS | ~$0.60 (€12/mo ÷ 20 users) |
| AI (smart routing) | ~$1.50-5.00 |
| Bandwidth/Storage | ~$0.50 |
| **Total Cost** | **~$3-7/user** |

### Revenue

| Tier | Price | Margin |
|------|-------|--------|
| Pro | $29 | ~85% |
| Pro+ | $49 | ~90% |
| Team | $79 | ~88% |

**At 1000 Pro users:** $26,000/month profit

---

## What About Bot Abuse?

**Why this is NOT a major concern for us:**

1. **Rate limits built-in:** Max 100 requests/min per user
2. **Economic disincentive:** Abusers pay us $29/mo, we throttle them if excessive
3. **ClawRouter protects us:** Auto-switches to cheapest models = limits our losses
4. **Not a free API:** Unlike OpenAI's API, users pay us, so abuse is self-limiting
5. **Monitoring:** We can detect unusual patterns and review accounts

**Bottom line:** Bot abuse is a cost center issue, not a security/operational risk. We'll monitor but it's not a blocking concern.

---

## Competitive Advantage

| Competitor | Their Weakness | Our Strength |
|------------|----------------|--------------|
| **SimpleClaw** | Just hosting, no smart routing | 78% cost savings via ClawRouter |
| **Self-hosted OpenClaw** | Technical setup required | One-click deploy |
| **ChatGPT/Claude** | No custom tools/skills | Open ecosystem, 100+ integrations |
| **Custom AI dev** | Expensive ($10K+) | $29/mo gets you started |

---

## Go-to-Market (Simple)

### Phase 1: MVP (Month 1-2)
- Free tier only
- 5 core skills
- Gather feedback

### Phase 2: Paid Launch (Month 3-4)
- Stripe integration
- Pro tier live
- 10 skills

### Phase 3: Scale (Month 5-6)
- Team tier
- 20+ skills
- 1000 users target

### Marketing Channels
1. **OpenClaw community** — they're our early adopters
2. **Indie Hackers / Hacker News** — dev-focused
3. **Twitter/X** — AI Twitter loves new tools
4. **YouTube demos** — show "deploy in 60 seconds"

---

## What We Need From Business Team

1. **Review pricing** — Is $29/$49/$79 right?
2. **Review free trial terms** — 7 days enough? Too much?
3. **Referral program** — $10 credit per referral? Structure?
4. **Terms of Service** — Standard SaaS TOS needed
5. **Privacy Policy** — GDPR compliance
6. **Competitive analysis** — Any competitors we missed?

---

## Timeline

| Week | Milestone |
|------|-----------|
| 1 | Infrastructure code complete |
| 2 | Dashboard frontend |
| 3 | Stripe integration, skill system |
| 4 | Free tier launch |
| 6 | Paid tiers live |
| 8 | Team tier, 1000 users |

---

**Summary:** We're building "OpenClaw hosting with smart AI routing." One click to deploy, 78% cost savings, skill marketplace. $29/mo Pro tier with ~85% margins.

**Questions?** File issues in GitHub or discuss in Discord.
