#!/usr/bin/env tsx
/**
 * Unified Cloudflare Multi-Worker Development Orchestrator
 *
 * Concurrently manages:
 * 1. Cloudflare Workers environment preflight (wrangler types, local D1 SQLite state)
 * 2. Primary Edge Worker (apps/api) on http://localhost:8787
 * 3. Background/Auxiliary Worker (apps/worker-bg) on http://localhost:8788
 * 4. Graceful shutdown and signal propagation across all worker child processes
 */

import { spawn, execSync, ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const rootDir = process.cwd();
const children: ChildProcess[] = [];
let isShuttingDown = false;

function log(prefix: string, message: string, color = colors.cyan) {
  const lines = message.split('\n');
  for (const line of lines) {
    if (line.trim()) {
      console.log(`${color}${prefix}${colors.reset} ${line}`);
    }
  }
}

function runPreflight(): void {
  console.log(
    `\n${colors.bold}${colors.blue}▶ [PREFLIGHT] Initializing Cloudflare & Local Emulation Environment...${colors.reset}`
  );

  // 1. Generate types for apps/api
  try {
    log('[types:api]', 'Generating Cloudflare Worker types for apps/api...', colors.yellow);
    execSync('pnpm --filter @telestarcorp/api exec wrangler types', { cwd: rootDir, stdio: 'pipe' });
  } catch (err: any) {
    log('[types:api]', `Warning: types generation failed: ${err.message}`, colors.yellow);
  }

  // 2. Ensure local D1 directory exists
  const d1Dir = path.resolve(rootDir, '.wrangler/state/v3/d1');
  if (!fs.existsSync(d1Dir)) {
    fs.mkdirSync(d1Dir, { recursive: true });
  }

  console.log(
    `${colors.bold}${colors.green}✔ [PREFLIGHT] Environment ready! Launching dev workers...${colors.reset}\n`
  );
}

function startProcess(
  name: string,
  command: string,
  args: string[],
  prefixColor: string
): ChildProcess {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: { ...process.env, FORCE_COLOR: '1' },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout?.on('data', (data) => {
    log(`[${name}]`, data.toString('utf-8'), prefixColor);
  });

  child.stderr?.on('data', (data) => {
    log(`[${name}]`, data.toString('utf-8'), prefixColor);
  });

  child.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      log(
        `[${name}]`,
        `Process exited with code ${code ?? signal}`,
        colors.yellow
      );
      cleanup();
      process.exit(code ?? 1);
    }
  });

  children.push(child);
  return child;
}

function cleanup(): void {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${colors.bold}${colors.yellow}Shutting down local dev processes...${colors.reset}`);

  for (const child of children) {
    if (child && !child.killed) {
      try {
        child.kill('SIGINT');
      } catch {
        // Ignored
      }
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (child && !child.killed) {
        try {
          child.kill('SIGKILL');
        } catch {
          // Ignored
        }
      }
    }
    process.exit(0);
  }, 1000).unref();
}

function main(): void {
  const args = process.argv.slice(2);
  const profileIdx = args.indexOf('--profile');
  const profileName =
    profileIdx !== -1 && profileIdx + 1 < args.length
      ? args[profileIdx + 1]
      : process.env.MATRIX_PROFILE || 'local-offline';

  process.env.MATRIX_PROFILE = profileName;

  runPreflight();

  console.log(`${colors.bold}Services Starting:${colors.reset}`);
  console.log(`- ${colors.blue}Integration Matrix Profile${colors.reset}: ${colors.bold}${profileName}${colors.reset}`);
  console.log(`- ${colors.green}Web Frontend (apps/web)${colors.reset}: http://localhost:4321`);
  console.log(`- ${colors.cyan}Primary Edge API (apps/api)${colors.reset}: http://localhost:8787`);
  console.log(`- ${colors.magenta}Background Worker (apps/worker-bg)${colors.reset}: http://localhost:8788\n`);

  // Start Web Frontend
  startProcess('web', 'pnpm', ['--filter', '@telestarcorp/web', 'dev'], colors.green);

  // Start Primary Edge API Worker
  startProcess('api', 'pnpm', ['--filter', '@telestarcorp/api', 'dev'], colors.cyan);

  // Start Background Worker
  startProcess('worker-bg', 'pnpm', ['--filter', '@telestarcorp/worker-bg', 'dev'], colors.magenta);

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main();
