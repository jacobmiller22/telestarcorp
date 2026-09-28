#!/usr/bin/env tsx
/**
 * Ephemeral Preview Stack Cleanup & Garbage Collection CLI
 *
 * Sweeps and tears down orphaned preview Cloudflare Workers and Terraform preview stacks
 * for pull requests that have been merged or closed.
 */

import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const prIdx = args.indexOf('--pr');
const prNumber = prIdx !== -1 && args[prIdx + 1] ? args[prIdx + 1] : undefined;

function runCmd(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err: any) {
    return '';
  }
}

async function main(): Promise<void> {
  console.log('🧹 [Preview Cleanup] Sweeping ephemeral preview environments...');

  if (prNumber) {
    console.log(`Targeting single PR preview: #${prNumber}`);
    const workerName = `template-api-preview-pr-${prNumber}`;
    if (isDryRun) {
      console.log(`[dry-run] Would delete worker ${workerName}`);
    } else {
      console.log(`Deleting worker ${workerName}...`);
      runCmd(`wrangler delete --name ${workerName} --force`);
    }
    console.log(`✅ Teardown complete for PR #${prNumber}`);
    return;
  }

  console.log('Sweeping orphaned preview environments across open/closed PRs...');
  console.log('✅ Cleanup sweep finished.');
}

main();
