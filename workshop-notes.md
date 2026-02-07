# ClawDeploy SaaS - Workshop Notes

## Vision
**"Engineer-grade OpenClaw in one click"**

Not just hosting — a 3-layer managed platform that makes OpenClaw actually intelligent and usable at scale.

### The 3 Layers
1. **Infrastructure Layer** — Managed OpenClaw instance (hosting, updates, SSL)
2. **Intelligence Layer** — Better prompting, context management, smarter agent behavior
3. **Agent Management Layer** — Tools to orchestrate multiple agents, workflows, handoffs

---

## Core Value Props

1. **Layer 1: Managed Infrastructure** — One-click deploy, auto-updates, backups, SSL
2. **Layer 2: Intelligence System** — Better prompting, context memory, smarter agent orchestration
3. **Layer 3: Agent Management** — Multi-agent workflows, agent spawning, handoff management
4. **Plug-&-Play Integrations** — Toggle APIs on/off (Notion, Slack, Gmail, etc.)

---

## What User Gets

| Component | Description |
|-----------|-------------|
| **Subdomain** | `username.clawdeploy.com` |
| **Dashboard** | Web UI to manage their agent (not just CLI) |
| **Pre-Installed Skills** | Popular integrations ready to toggle on |
| **Managed Gateway** | Auto-updating, monitored, SSL certs handled |
| **PM Bot** | Context-aware assistant that knows their projects |

---

## Differentiation

| Competitor | What They Do | How We're Different |
|------------|--------------|---------------------|
| **SimpleClaw** | One-click OpenClaw deploy | Better core (SOUL, tools), ClawHub ecosystem, agent management |
| **Self-hosted OpenClaw** | DIY Docker install | Zero config, enhanced defaults, skill marketplace |
| **Claude Code** | AI coding in terminal | Full assistant platform, not just coding |
| **ChatGPT/Claude** | Generic AI chat | Open-source core, customizable, self-hosted option |

---

## The 3 Layers — Defined

### Layer 1: Infrastructure
- Managed OpenClaw instance (our fork)
- Auto-updates, SSL, backups
- Custom subdomain
- Horizontal scaling as needed

### Layer 2: Enhanced Core (Replaces + Improves)
**Better SOUL.md System:**
- Curated persona presets (CEO, Engineer, Creative, etc.)
- Dynamic personality adaptation
- Better system prompting out of the box

**Better Tools:**
- Improved tool calling (better error handling, retries)
- More built-in tools (web search, file analysis, code execution)
- Tool chaining / multi-step workflows

**Enhanced Memory:**
- Better memory search (vector + BM25 hybrid)
- Automatic fact extraction
- Knowledge graph integration

### Layer 3: Ecosystem & Management
**ClawHub Integration:**
- One-click skill install from marketplace
- Verified skills, ratings, reviews
- Auto-updating skills

**Agent Management:**
- Multi-agent orchestration
- Agent spawning with specific skills/personas
- Visual agent monitoring (what's running, status)
- Agent-to-agent handoff workflows

**Team Features:**
- Shared workspaces
- Agent sharing between team members
- Usage analytics

## Open Questions

### 1. One-Click Integrations
Which APIs do we pre-wire? Top 5:
1. Notion (notes/tasks)
2. Slack (team chat)
3. Gmail/Google Calendar
4. GitHub (dev projects)
5. ?

### 2. Pricing
- SimpleClaw: $29/mo (includes $10 AI credits)
- Our angle: $29-49/mo? Higher with 3-layer value?
- Free tier? (Limited messages, 1 integration)

### 3. Technical Architecture
- **VPS Pool** (pre-warmed, assign on signup) or **on-demand provision**?
- **Shared gateway** or **dedicated per user**?
- **Docker** or **Kubernetes** or **Fly.io/Railway**?

---

## Next Steps

1. Rewrite PRD for SaaS model
2. Define MVP scope (what ships v1)
3. Technical architecture decision
4. Create prd.json with stories

**What's your call on the PM Bot question?** That changes the scope a lot.
