# Local Development Guide (`LOCAL_DEVELOPMENT.md`)

Instructions for developing, testing, and debugging Cloudflare Workers locally.

---

## 1. Zero-Container Architecture

This project requires **no Docker containers**. All emulation is handled natively in-process by Miniflare (`workerd`):

- **Cloudflare D1**: Stored locally in `.wrangler/state/v3/d1` as SQLite databases.
- **Workers KV**: Emulated in `.wrangler/state/v3/kv`.
- **Cloudflare R2**: Emulated in `.wrangler/state/v3/r2`.

---

## 2. Setting Up Local Database & Seed Data

```bash
# 1. Apply baseline migrations locally
pnpm run d1:migrate

# 2. Seed local database
pnpm exec wrangler d1 execute DB --local --file=scripts/seed.sql

# 3. Query local database
pnpm exec wrangler d1 execute DB --local --command="SELECT * FROM items;"
```

---

## 3. Testing Local Endpoints

Once `pnpm dev` is running:

```bash
# Probe health endpoint
curl -s http://localhost:8787/api/health | jq .

# Fetch items catalog
curl -s http://localhost:8787/api/items | jq .

# Create a new item
curl -s -X POST http://localhost:8787/api/items \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Item", "description": "Local test"}' | jq .
```
