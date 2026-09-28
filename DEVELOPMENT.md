# Development Guide (`DEVELOPMENT.md`)

Welcome to the development guide for the Cloudflare Workers DevOps monorepo template.

---

## 1. Monorepo Scripts Taxonomy

| Command | Purpose |
| :--- | :--- |
| `pnpm dev` | Concurrently starts all workers with preflight type generation |
| `pnpm run check` | Runs TypeScript typecheck across all workspaces |
| `pnpm run check:bundle` | Asserts worker bundle sizes stay within limits |
| `pnpm run verify:local` | Turnkey pre-PR validation pipeline |
| `pnpm run d1:migrate` | Runs D1 database migrations locally or remotely |
| `pnpm run d1:migrate:check` | Asserts migrations contain no destructive DROP operations |
| `pnpm run d1:backup` | Exports D1 database snapshot to SQL |
| `pnpm run deploy:prod` | Automated staged promotion from staging to production |
| `pnpm run rollback` | Instant Cloudflare Worker rollback |
| `pnpm run release:notes` | Composes rolling release notes from git commit delta |
| `pnpm run template:configure` | Configures project name, domain, and feature toggles |

---

## 2. Integration Matrix Profiles

This repository supports dynamic infrastructure profiles via `MATRIX_PROFILE`:

- **`local-offline`** (Default): 100% hermetic and offline. Uses local SQLite and in-memory mocks.
- **`hybrid-staging`**: Connects local worker to remote staging Cloudflare D1/KV.
- **`prod-readonly-probe`**: Connects to production D1 in strictly enforced read-only mode (`ProductionWriteForbiddenError` guards all queries).

```bash
# Run with a specific profile
pnpm dev --profile hybrid-staging
```

---

## 3. Ephemeral PR Preview Environments

When a pull request is opened:
1. GitHub Actions spins up an isolated worker (`pr-<N>-api.<domain>`).
2. Runs D1 migrations and seeds data.
3. Probes live edge health and executes Cloudflare Browser Rendering CDP smoke tests.
4. Comments on the PR with a live URL and health status.
5. Decommissions automatically when the PR is merged or closed.
