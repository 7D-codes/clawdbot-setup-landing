# ClawDeploy — Managed OpenClaw Platform (SaaS)

**Status:** Workshop Phase | **Last Updated:** 2026-02-06

---

## 1. Vision

**"OpenClaw that just works"**

We host an enhanced OpenClaw fork with better defaults, a skill marketplace (ClawHub), and multi-agent orchestration — all deployable in one click.

**The 3-Layer Stack:**
1. **Infrastructure** — Managed hosting, auto-updates, scaling
2. **Enhanced Core** — Better SOUL system, improved tools, smarter memory
3. **Ecosystem** — ClawHub skills marketplace, agent management, team features

---

## 2. Problem Statement

OpenClaw is powerful but:
- **Hard to set up** — Docker, config files, environment variables
- **Empty by default** — No skills, no personality, no integrations
- **No ecosystem** — Skills scattered, no marketplace, no discovery
- **Single-agent** — No easy way to spawn specialized sub-agents
- **Maintenance burden** — Self-hosted means you manage updates, SSL, backups

**For teams:** Sharing agents, monitoring usage, managing permissions — all manual.

---

## 3. Solution

**One-click deploy → Working enhanced OpenClaw in <2 minutes**

With:
- Curated SOUL presets (choose your assistant's personality)
- Pre-installed essential skills (email, calendar, web search, code)
- ClawHub integration (1-click install 100+ community skills)
- Multi-agent orchestration (spawn specialized agents)
- Team workspaces (share agents, view analytics)
- Zero maintenance (we handle updates, backups, SSL)

---

## 4. Target Users

1. **Solo Developers** — Want OpenClaw without the ops headache
2. **Small Teams** — Need shared AI assistant with skill marketplace
3. **Agencies** — Deploy agents for clients, manage centrally
4. **AI-Native Startups** — Build on top of our enhanced platform

---

## 5. Feature Specification

### 5.1 Layer 1: Infrastructure

| Feature | Description | Priority |
|---------|-------------|----------|
| One-click deploy | Sign up → subdomain live in <2 min | P0 |
| Custom subdomain | `username.clawdeploy.com` | P0 |
| Custom domain | Bring your own domain | P1 |
| Auto SSL | Let's Encrypt, auto-renew | P0 |
| Auto updates | Seamless OpenClaw updates | P0 |
| Daily backups | Automated, 30-day retention | P0 |
| Usage metrics | Messages, tokens, active skills | P1 |
| Horizontal scaling | Auto-scale with usage | P2 |

### 5.2 Layer 2: Enhanced Core

**SOUL System (Personality Engine):**
| Feature | Description | Priority |
|---------|-------------|----------|
| Preset personas | CEO, Engineer, Creative, Researcher, General | P0 |
| Custom SOUL | Upload/edit your own SOUL.md | P0 |
| Dynamic adaptation | Persona adjusts based on task | P1 |
| Voice memory | Remembers how you like to interact | P1 |

**Enhanced Tools:**
| Feature | Description | Priority |
|---------|-------------|----------|
| Improved tool calling | Better error handling, retries, fallbacks | P0 |
| Web search | Built-in Brave/Google search | P0 |
| Code execution | Sandboxed code runner | P1 |
| File analysis | PDF, image, CSV processing | P1 |
| Tool chaining | Multi-step tool workflows | P2 |

**Smart Memory:**
| Feature | Description | Priority |
|---------|-------------|----------|
| Hybrid search | BM25 + vector for fast, accurate recall | P0 |
| Auto fact extraction | Identifies & stores key facts automatically | P1 |
| Knowledge graph | Entity relationships, semantic connections | P2 |

### 5.3 Layer 3: Ecosystem & Management

**ClawHub (Skill Marketplace):**
| Feature | Description | Priority |
|---------|-------------|----------|
| Skill browser | Search, filter, browse 100+ skills | P0 |
| One-click install | Install skill → instantly available | P0 |
| Verified skills | Official/verified badge system | P1 |
| Skill ratings | Community reviews, stars | P1 |
| Auto-updates | Skills auto-update to latest | P1 |
| Submit skills | Community can submit skills | P2 |

**Agent Management:**
| Feature | Description | Priority |
|---------|-------------|----------|
| Spawn agents | Create specialized sub-agents | P0 |
| Agent presets | Coder, Researcher, Writer personas | P0 |
| Visual monitor | See running agents, status, output | P1 |
| Agent handoff | Pass context between agents | P1 |
| Agent history | View past agent runs | P1 |

**Team Features:**
| Feature | Description | Priority |
|---------|-------------|----------|
| Workspaces | Shared team environment | P1 |
| Agent sharing | Share agents with team | P1 |
| Permissions | Role-based access (admin, editor, viewer) | P2 |
| Usage analytics | Team usage dashboards | P2 |

---

## 6. User Journeys

### 6.1 Solo Developer Flow

1. **Landing** → Clicks "Deploy Free"
2. **Signup** → Email, password, subdomain
3. **Onboarding** → Pick persona (Engineer), connect 1 integration (GitHub)
4. **Dashboard** → Chat interface, skills panel, settings
5. **Usage** → Asks agent to review PR → agent spawns coder sub-agent → gets analysis
6. **Growth** → Installs more skills from ClawHub, invites team

### 6.2 Team Onboarding Flow

1. **Signup** → Creates team workspace
2. **Invite** → Adds 3 team members
3. **Setup** → Admin configures shared integrations (Slack, Notion)
4. **Deploy** → Team uses shared agents
5. **Monitor** → Admin views usage analytics

---

## 7. Pricing

| Tier | Price | Target | Limits | Features |
|------|-------|--------|--------|----------|
| **Free** | $0 | Trial/Individual | 100 msgs/mo, 3 skills, 1 agent | Basic SOUL, no sub-agents |
| **Pro** | $29/mo | Individual power users | Unlimited msgs, 20 skills, 5 sub-agents | All personas, ClawHub, custom SOUL |
| **Team** | $79/mo | Small teams (up to 5) | Unlimited, 50 skills, 20 sub-agents | Team workspace, sharing, analytics |
| **Enterprise** | Custom | Large orgs | Unlimited everything | SSO, audit logs, SLA, dedicated support |

**Comparison to SimpleClaw:**
- SimpleClaw: $29/mo = hosting + $10 AI credits
- Us: $29/mo Pro = enhanced OpenClaw + ClawHub + agent mgmt + AI credits separate

**AI Credits:**
- Separate billing (bring your own API key OR buy credits from us)
- We charge 20% markup on AI usage if using our credits

---

## 8. Technical Architecture

### 8.1 Infrastructure

```
User → Cloudflare → K8s Ingress → Pod (OpenClaw instance)
                                      ↓
                              Shared Services (ClawHub API, Auth)
                                      ↓
                              PostgreSQL (metadata)
                              S3 (backups, files)
                              Redis (caching, sessions)
```

**Per-user:**
- Dedicated OpenClaw pod (isolation)
- Shared ClawHub API (centralized skill registry)
- Shared auth service (SSO, team management)

### 8.2 Deployment Options

| Approach | Pros | Cons |
|----------|------|------|
| **VPS Pool** (Hetzner) | Cheap, simple | Slower cold start |
| **Kubernetes** (EKS/GKE) | Scalable, production-grade | Complex, expensive |
| **Fly.io** | Edge-deployed, fast | Less control |

**Decision:** Start with VPS pool for cost, migrate to K8s at scale.

### 8.3 The "Enhanced Core" Fork

We maintain a fork of OpenClaw with:
- Pluggable SOUL system (load presets from ClawHub)
- Enhanced tool registry (better error handling)
- Hybrid memory backend (BM25 + vector)
- Agent spawning API (sub-agent orchestration)

**Sync strategy:** Track upstream OpenClaw, rebase our enhancements weekly.

---

## 9. ClawHub Specification

### 9.1 Skill Structure

```yaml
skill:
  name: "github-manager"
  version: "1.2.0"
  author: "7d-claw"
  description: "Manage GitHub repos, issues, PRs"
  tags: ["git", "dev", "automation"]
  verified: true
  downloads: 1250
  rating: 4.7
  
  tools:
    - github_search_repos
    - github_create_issue
    - github_merge_pr
    
  config:
    - name: GITHUB_TOKEN
      type: secret
      required: true
      
  permissions:
    - internet
    - file_read
```

### 9.2 Skill API

- **Install:** `POST /skills/install` → downloads, validates, activates
- **Update:** Auto-check daily, prompt user for major versions
- **Submit:** GitHub PR to `clawhub/skills` repo → review → merge

---

## 10. MVP Scope (V1)

**Must have for launch:**
- [ ] One-click deploy (VPS pool)
- [ ] 5 SOUL presets
- [ ] 20 curated skills (ClawHub)
- [ ] Basic agent spawning (3 sub-agents max)
- [ ] Web search + email + calendar skills
- [ ] Free + Pro tiers
- [ ] Stripe billing

**Post-launch:**
- [ ] Team tier
- [ ] Custom domains
- [ ] Skill submission system
- [ ] Advanced agent orchestration
- [ ] Knowledge graph

---

## 11. Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Signups | 1000 |
| Free→Pro conversion | 10% |
| Active users (weekly) | 300 |
| Skills installed | 5000 |
| MRR | $8,700 (300 Pro users) |

---

## 12. Open Questions

1. **Fork vs Patch?** Do we fork OpenClaw or maintain a patchset?
2. **ClawHub hosting?** Self-host skill registry or use npm-like system?
3. **Free tier abuse?** Rate limits, CAPTCHA, credit card verification?
4. **Team invite flow?** Email invites vs link-based?

---

## 13. Next Steps

1. ✅ **This PRD** — Workshop complete
2. 🔄 **prd.json** — Break into user stories
3. ⏳ **Architecture decision** — VPS vs K8s vs Fly.io
4. ⏳ **MVP scoping** — Cut to 4-week launch scope
5. ⏳ **Spike** — Deploy test OpenClaw instance on VPS pool

---

*Workshop: 2026-02-06*
*Participants: Hero (AI), 7D (Product)*
