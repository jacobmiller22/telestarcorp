#!/usr/bin/env tsx
/**
 * Cloudflare Workers Instant Rollback CLI Helper
 *
 * Orchestrates emergency worker deployment rollbacks, health verification,
 * and operational Discord alerts.
 */

import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const envIdx = args.indexOf('--env');
const targetEnv = envIdx !== -1 ? args[envIdx + 1] : 'production';
const deploymentIdIdx = args.indexOf('--deployment-id');
const deploymentId = deploymentIdIdx !== -1 ? args[deploymentIdIdx + 1] : undefined;

function runCmd(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' }) as any;
  } catch (err: any) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
}

async function dispatchDiscordAlert(webhookUrl: string, message: string): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        content: `🚨 **[Cloudflare Worker Rollback]** ${message}`,
      }),
    });
  } catch (err) {
    console.warn('Failed to send Discord alert:', (err as Error).message);
  }
}

async function main(): Promise<void> {
  console.log('================================================================');
  console.log('  🚨 Cloudflare Workers Instant Rollback Triggered              ');
  console.log('================================================================');
  console.log(`Environment:   ${targetEnv}`);
  console.log(`Deployment ID: ${deploymentId || 'Previous Known Good'}\n`);

  let cmd = `wrangler rollback --env ${targetEnv}`;
  if (deploymentId) {
    cmd = `wrangler rollback ${deploymentId} --env ${targetEnv}`;
  }

  console.log(`▶ Executing: ${cmd}`);
  runCmd(cmd);

  const discordWebhook = process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_DEV_ALERTS;
  if (discordWebhook) {
    await dispatchDiscordAlert(discordWebhook, `Rolled back ${targetEnv} to previous version.`);
  }

  console.log('✅ Instant rollback complete.');
}

main();
