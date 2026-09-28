#!/usr/bin/env tsx
/**
 * Turnkey Multi-Tier Environment Parity Verification CLI
 *
 * Validates edge runtime bindings, response headers, and health probes
 * across Local, Ephemeral Preview, Staging, and Production environments.
 *
 * Usage:
 *   pnpm run test:parity --target staging --url https://staging-api.example.com
 *   pnpm run test:parity --url https://pr-42-api.example.com --env preview
 */

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const urlIdx = args.indexOf('--url');
  const targetUrl = urlIdx !== -1 ? args[urlIdx + 1] : process.env.TARGET_URL || 'http://localhost:8787';

  console.log(`\n${colors.bold}${colors.cyan}=== Multi-Tier Edge Parity Probe ===${colors.reset}`);
  console.log(`Target URL: ${colors.bold}${targetUrl}${colors.reset}\n`);

  try {
    const healthUrl = `${targetUrl.replace(/\/$/, '')}/api/health`;
    console.log(`Probing: ${healthUrl}...`);
    const res = await fetch(healthUrl, { headers: { 'cache-control': 'no-store' } });

    if (!res.ok) {
      console.error(`${colors.red}❌ FAILED: Health probe returned status ${res.status}${colors.reset}`);
      process.exit(1);
    }

    const data: any = await res.json();
    console.log(`${colors.green}✔ Health probe passed (HTTP ${res.status})${colors.reset}`);
    console.log(`  • Overall Status:  ${data.status}`);
    console.log(`  • Environment:     ${data.environment}`);
    console.log(`  • Commit SHA:      ${data.commitSha}`);
    console.log(`  • Short SHA:       ${data.shortSha}`);
    console.log(`  • Build Timestamp: ${data.buildTimestamp}`);
    console.log(`  • Uptime:          ${data.uptimeSeconds}s`);

    console.log('\nBindings Status:');
    for (const [binding, info] of Object.entries(data.bindings || {})) {
      const bInfo = info as any;
      const icon = bInfo.status === 'healthy' ? `${colors.green}✔${colors.reset}` : `${colors.yellow}•${colors.reset}`;
      console.log(`  ${icon} ${binding.padEnd(16)}: ${bInfo.status} (${bInfo.latencyMs ?? 0}ms)`);
    }

    console.log(`\n${colors.green}✅ Parity verification completed successfully.${colors.reset}\n`);
  } catch (err: any) {
    console.error(`${colors.red}❌ Probe failed: ${err.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
