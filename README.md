# ClawDeploy

**"OpenClaw in one click"** — Managed OpenClaw hosting with skill marketplace and sub-agent orchestration.

---

## Ralph Loop Workflow

This project uses **Ralph Loop** — AI-driven development with sub-agents.

### How to Contribute

1. **Read the PRD** → `PRD.md` (understand what we're building)
2. **Check prd.json** → Pick a story with status `"todo"`
3. **Update prd.json** → Change status to `"in_progress"`
4. **Do the work** → Implement, test, validate
5. **Update prd.json** → Change status to `"completed"`
6. **Log progress** → Update `progress.txt` with what you did

### File Structure

```
clawdeploy/
├── PRD.md              # Product requirements (START HERE)
├── prd.json            # User stories with status (pick your task)
├── progress.txt        # Log of work completed (update this)
├── infra/              # Infrastructure code (Terraform, scripts)
├── docker/             # Docker image definition
├── backend/            # API server (Node.js)
├── frontend/           # Dashboard (React)
├── skills/             # ClawHub skills
└── landing/            # Marketing site
```

### Picking a Story

1. Open `prd.json`
2. Find stories with `"status": "todo"`
3. Choose by priority and milestone
4. Update status to `"in_progress"`
5. Do the work
6. Update status to `"completed"`
7. Add entry to `progress.txt`

### Milestones

| Milestone | Target | Stories |
|-----------|--------|---------|
| MVP (Free Tier) | Mar 7 | CD-002 to CD-006, CD-011, CD-012 |
| Paid Launch | Mar 21 | CD-008, CD-009 |
| Pro+ Features | Apr 4 | CD-007 |
| Team Tier | Apr 18 | CD-010 |

---

## Quick Start

```bash
# Deploy infrastructure
cd infra/scripts
./deploy.sh

# Run locally
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

---

## Current Status

- ✅ Infrastructure: DONE
- 🔄 Docker Image: NEXT
- ⏳ Auth System: TODO
- ⏳ Dashboard: TODO
- ⏳ Skills: TODO

See `progress.txt` for full details.

---

**Questions?** Check `PRD.md` for product context, `prd.json` for tasks.
