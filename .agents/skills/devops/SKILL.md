---
name: devops
description: Autonomous DevOps & Release Engineering skill for Cloudflare Workers monorepo. Manages production promotions, staged git promotion workflows (staging ➔ production), Cloudflare Workers CI/CD monitoring, edge health probes, database migrations, and emergency instant rollbacks.
---

# Autonomous DevOps & Release Engineering Skill

This skill informs AI agents how to act as a **DevOps & Release Engineer** for this Cloudflare Workers monorepo. It governs code promotion through our two-stage git pipeline, orchestrates Cloudflare Workers deployments, monitors CI/CD execution graphs, manages approval gates, verifies live edge health, and executes instant rollbacks when needed.

---

## When to Use This Skill

- **Execute a Production Deployment** (`/devops deploy-production` or "promote staging to production").
- **Inspect System & Edge Health** (`/devops status` or probing staging/production health endpoints).
- **Manage Staged Git Promotion** (`staging` ➔ `production` release PRs and CI promotion rules).
- **Execute Disaster Recovery & Rollback** (`/devops rollback` via Cloudflare Wrangler rollback).

---

## 1. Pipeline Architecture & Promotion Rules

This project enforces a strict two-stage git promotion pipeline:

```
[Feature Branches] (feature/* or fix/*)
        │
        ▼ (PR targeting 'staging' with automated preview deploy & checks)
    [staging] ──► Auto-deploy to Staging Edge
        │
        ▼ (Release Promotion: ONLY 'staging' is permitted to target 'production')
  [production]
        │
        ├─► 1. Run Lint, Typecheck & Bundle Budget (build-and-validate)
        ├─► 2. Deploy to Cloudflare Workers Staging Edge (deploy-staging)
        ├─► 3. Staging Edge Verification & Parity Probe (test-staging)
        ├─► 4. ✋ Await Human Reviewer Approval (GitHub Actions Environment Gate)
        ├─► 5. Deploy to Production Edge & Verify Health (deploy-production)
        └─► 6. Dispatch Discord Status Alert (notify-deployment)
```

### Key Guarantees
1. **Default PR Target**: The repository default branch is `staging`.
2. **Promotion Hierarchy**: Direct PRs to `production` from any branch other than `staging` are rejected.
3. **Commit Hash Verification**: Checks that deployed edge SHA strictly matches candidate release commit.
4. **Instant Rollback**: `<15s` rollback via `wrangler rollback --env production`.

---

## 2. Emergency Rollback Procedures

```bash
# Revert to previous deployment instantly
pnpm run rollback --env production

# Rollback to specific deployment ID
pnpm run rollback --env production --deployment-id <DEPLOYMENT_ID>
```
