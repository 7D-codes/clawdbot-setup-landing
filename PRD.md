# ClawDeploy — Product Requirements Document (Execution)

**Version:** 2.0 | **Status:** Ready for Build | **Date:** 2026-02-07

---

## 1. The Product (One Sentence)

**"OpenClaw hosting with a skill marketplace and sub-agent orchestration — deploy in 60 seconds, supercharge with one-click skills."**

---

## 2. The Problem

| Pain Point | Current State |
|------------|---------------|
| Setup friction | OpenClaw requires Docker, config files, 2+ hours |
| Skill discovery | Skills scattered across GitHub, manual install |
| Single-agent limit | No easy way to spawn specialized sub-agents |
| API cost blindness | No optimization, users pay full price |
| Team sharing | No workspace concept, everyone configures separately |

**Competitors:**
- emergent.sh: Ephemeral (shuts down), vanilla OpenClaw
- SimpleClaw: Just hosting, no enhancements
- Self-hosted: Requires DevOps knowledge

**Our Gap:** No one combines **persistent hosting + skill marketplace + sub-agents**.

---

## 3. The Solution

### 3.1 Core Value

| Feature | What It Does | User Benefit |
|---------|--------------|--------------|
| **One-click deploy** | Pre-warmed container pool, instant assignment | Working in 60 seconds |
| **ClawHub** | 50+ skills, one-click install | No hunting, no config |
| **Sub-agents** | Spawn specialized agents (coder, researcher, writer) | Parallel workflows |
| **Smart routing** | Auto-pick cheapest capable model (ClawRouter) | 78% cost savings |
| **Team workspaces** | Shared agents, shared skills | Collaboration |

### 3.2 Technical Architecture

```
User → Cloudflare → Caddy → Docker Container (OpenClaw + Skills)
                                           ↓
                                    ClawRouter (smart routing)
                                           ↓
                                    AI Providers (OpenAI, Anthropic, etc.)
```

**Per user:**
- 1 Docker container (isolated)
- Custom subdomain (`user.clawdeploy.com`)
- Pre-installed skills (in container image)
- ClawHub API (install more on demand)

### 3.3 Key Differentiators

1. **Persistent** — Unlike emergent.sh, we don't shut down
2. **Skill marketplace** — No competitor has this
3. **Sub-agent orchestration** — Spawn, monitor, handoff
4. **Smart routing** — Built-in cost optimization

---

## 4. User Stories

### Story 1: Solo Developer (Primary)
**Alex, indie hacker, wants AI assistant for his startup.**

**Flow:**
1. Lands on clawdeploy.com
2. Clicks "Deploy Free"
3. Enters email, password
4. Gets `alex-a1b2.clawdeploy.com`
5. Opens chat, asks "Research competitors for X"
6. Spawns "researcher" sub-agent
7. Gets report in 5 minutes

**Value:** Set up AI infrastructure in 60 seconds vs 4 hours DIY.

### Story 2: Team Lead
**Sarah, 4-person startup, needs shared AI workspace.**

**Flow:**
1. Signs up for Team tier
2. Invites 3 members
3. Installs "GitHub" and "Slack" skills for team
4. Spawns "code-reviewer" agent
5. Team shares agent outputs

**Value:** Shared infrastructure, no individual setup.

---

## 5. Pricing

| Tier | Price | Limits | Target |
|------|-------|--------|--------|
| **Free** | $0 | 100 msg/day, 3 skills, 0 sub-agents | Trial/Individual |
| **Pro** | $29/mo | 1M tokens/week OR 5000 msg/week, 20 skills, 5 sub-agents | Power users |
| **Pro+** | $49/mo | 5M tokens/week, unlimited skills, 20 sub-agents | Heavy users |
| **Team** | $79/mo | Shared pool, 5 seats, analytics | Small teams |

**Hybrid limits (Option C):**
- Soft token limit (throttle to cheap models)
- Hard message limit (stop)
- Whichever hits first

---

## 6. Success Metrics

| Metric | Target |
|--------|--------|
| Time to first message | < 60 seconds |
| Free → Pro conversion | > 10% |
| Skill install rate | > 50% of users |
| Sub-agent usage | > 30% of Pro users |
| Churn | < 5%/month |

---

## 7. Open Questions (Answered)

| Question | Answer |
|----------|--------|
| Privacy? | We host, user owns data, we meter only |
| Model visibility? | Yes, show which model is used |
| BYOK? | Yes, option to use own API keys |
| Free trial? | Yes, 7-day Pro trial |
| Referrals? | $10 credit per signup (discuss with tech) |

---

**End of PRD**

*See prd.json for executable stories.*
