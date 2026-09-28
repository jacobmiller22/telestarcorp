#!/usr/bin/env tsx
/**
 * Cloudflare Browser Rendering Ephemeral Preview Smoke CLI
 *
 * Runs edge-native smoke verification against deployed ephemeral PR previews,
 * staging, or local environments.
 *
 * Usage:
 *   pnpm run test:preview-smoke --url https://pr-123-api.example.com
 *   pnpm run test:preview-smoke --env preview
 */

import { runPreviewSmokeSuite, type CloudflareBrowserConfig } from '../apps/api/src/lib/browser-rendering';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const urlIdx = args.indexOf('--url');
  let targetUrl = urlIdx !== -1 ? args[urlIdx + 1] : process.env.PREVIEW_URL || 'http://localhost:8787';

  console.log(`\n🌐 [Preview Smoke] Probing edge routes at: ${targetUrl}`);

  const config: CloudflareBrowserConfig = {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID,
    cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
  };

  const summary = await runPreviewSmokeSuite({ targetUrl, config });
  console.log(summary.summaryMarkdown);

  if (!summary.passed) {
    process.exit(1);
  }
}

main();
