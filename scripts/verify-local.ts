#!/usr/bin/env tsx
/**
 * Turnkey Pre-PR Local Verification Pipeline
 *
 * Runs comprehensive quality, typecheck, lint, and bundle size checks
 * to ensure code is clean BEFORE pushing or opening a Pull Request.
 */

import { execSync } from 'node:child_process';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

interface Step {
  name: string;
  command: string;
}

const steps: Step[] = [
  { name: 'Monorepo Typecheck & Lint', command: 'pnpm run check' },
  { name: 'D1 Additive Migration Validation', command: 'pnpm run d1:migrate:check' },
  { name: 'Cloudflare Worker Bundle Budget', command: 'pnpm run check:bundle' },
];

async function main(): Promise<void> {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   🚀 Turnkey Pre-PR Local Verification Pipeline                ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  let allPassed = true;
  for (const step of steps) {
    const t0 = Date.now();
    process.stdout.write(`▶ ${step.name}... `);
    try {
      execSync(step.command, { stdio: 'pipe' });
      const durationMs = Date.now() - t0;
      console.log(`${colors.green}✔ PASSED${colors.reset} (${durationMs}ms)`);
    } catch (err: any) {
      allPassed = false;
      console.log(`${colors.red}✖ FAILED${colors.reset}`);
      if (err.stdout) console.log(err.stdout.toString());
      if (err.stderr) console.error(err.stderr.toString());
      break;
    }
  }

  if (!allPassed) {
    console.error(`\n${colors.red}${colors.bold}Pre-PR verification failed. Please resolve errors before pushing.${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`\n${colors.green}${colors.bold}All local verification gates passed cleanly! Ready to open PR.${colors.reset}\n`);
}

main();
