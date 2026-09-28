---
name: local-development
description: Operational workflows and troubleshooting for running, debugging, seeding, and testing the Cloudflare Workers local monorepo with D1 SQLite, Workers KV, R2, and Service Bindings.
---

# Local Development Skill

This skill provides step-by-step operational workflows and troubleshooting runbooks for AI agents and human developers interacting with this Cloudflare Workers monorepo.

The platform operates on a **zero-container, Cloudflare-native architecture**. Local development runs purely in-process without Docker. All local persistence and edge runtimes are handled via Miniflare (`workerd`), SQLite/D1, Workers KV, and R2 emulation.

---

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment files
cp .env.example .env

# 3. Launch the unified multi-worker development stack
pnpm dev
```

### Services Started by `pnpm dev`:
- **Primary Edge API**: `http://localhost:8787` (`apps/api`)
- **Background Worker**: `http://localhost:8788` (`apps/worker-bg`)
- **Local D1 Storage**: `.wrangler/state/v3/d1`

---

## Integration Matrix Profiles

```bash
# Default hermetic local environment (100% offline & mock services)
pnpm dev

# Connect local worker to remote staging D1/KV/R2
pnpm dev --profile hybrid-staging

# Read-only probe against live production D1 (write-protected)
pnpm dev --profile prod-readonly-probe
```

---

## Pre-PR Verification

Before pushing code or opening a PR, always execute:
```bash
pnpm run verify:local
```
