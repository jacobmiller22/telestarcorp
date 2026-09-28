# Telestar Corporation

Modern, edge-native web platform for **Telestar Corporation** (Hosted VoIP Solutions & Unified Communications), reconstructed from the Wayback Machine archive and built with **Astro 5 + Tailwind CSS v4** deployed on **Cloudflare Workers**.

---

## ⚡ Architecture & Capabilities

```
apps/
├── web/             # Astro 5 + Tailwind CSS v4 Modern Frontend
├── api/             # Cloudflare Edge Worker (Static Assets bridge & /api/health probe)
└── worker-bg/       # Auxiliary Background Worker

packages/
├── config/          # Typed Zod environment schema & Feature flags
└── types/           # Shared TypeScript domain models & contracts
```

### 🛠️ Key Built-in DevOps Features

- **Multi-Worker Monorepo**: Turborepo + pnpm workspaces with native TypeScript Workers.
- **Composable Feature Toggles**: Enable or disable D1, KV, R2, Queues, Service Bindings, Previews, and Access via `template.config.json` and `pnpm template:configure`.
- **Ephemeral PR Preview Environments**: Deploys isolated Workers per PR (`pr-<N>-api.<domain>`), runs edge health checks & Cloudflare Browser Rendering CDP smoke tests, and tears down automatically upon merge or close.
- **Two-Stage Git Promotion (`staging` ➔ `production`)**:
  - Direct PRs to `main` are automatically retargeted to `staging`.
  - Staging deployments run pre-test and post-test commit SHA assertions.
  - Production deployments are gated by a human reviewer approval gate.
- **Instant Rollback**: `<15s` rollback CLI (`pnpm run rollback`) and GitHub Actions workflow with Discord status notifications.
- **Additive D1 Schema Migrations**: Strictly enforces non-destructive schema evolution in CI.
- **Integration Matrix**: Switch between `local-offline`, `hybrid-staging`, and `prod-readonly-probe` with runtime SQL mutation safety assertions.
- **Worker Bundle Budgeting**: Enforces strict bundle size limits in CI.
- **Agentic Workflows**: Preconfigured `.agents/skills/` for dual-role pair programming (`story-feedback-loop`), Git worktrees (`wt`), and release engineering (`devops`).

---

## 🚀 Quickstart

### 1. Prerequisites
- **Node.js**: `>= 20.0.0` (v22 LTS recommended)
- **pnpm**: `>= 9.0.0`
- **Cloudflare Wrangler CLI**: Included in `devDependencies`

### 2. Setup
```bash
# Clone or create your project from this template
pnpm install

# Initialize local environment variables
cp .env.example .env

# Launch the unified multi-worker development stack
pnpm dev
```

### 3. Local Endpoints
- **Primary Edge API**: [http://localhost:8787](http://localhost:8787)
- **Health Check**: [http://localhost:8787/api/health](http://localhost:8787/api/health)
- **Background Worker**: [http://localhost:8788](http://localhost:8788)

---

## 🧩 Composable Feature Configuration

Customize your project name, target domains, and enable/disable features:

```bash
# Verify current feature toggles
pnpm run template:configure --verify

# Rename project and domain
pnpm run template:configure --name my-service --domain myservice.io

# Disable optional services
pnpm run template:configure --disable-r2 --disable-queues
```

---

## 📋 Pre-PR Verification

Before pushing code or opening a pull request, run the turnkey verification pipeline:

```bash
pnpm run verify:local
```

This verifies:
1. Monorepo TypeScript typecheck & linting
2. Additive D1 database migration integrity
3. Cloudflare Worker bundle size budgets
