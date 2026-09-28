#!/usr/bin/env tsx
/**
 * Composable Template Configurator CLI
 *
 * Allows developers to customize project name, domains, and toggle Cloudflare features:
 * - Cloudflare D1 Database
 * - Cloudflare Workers KV
 * - Cloudflare R2 Storage
 * - Cloudflare Queues
 * - Service Bindings
 * - Ephemeral PR Previews
 * - Browser Rendering CDP
 *
 * Usage:
 *   pnpm run template:configure --verify
 *   pnpm run template:configure --name my-app --domain myapp.dev
 *   pnpm run template:configure --disable-r2 --disable-queues
 */

import fs from 'node:fs';
import path from 'node:path';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

interface TemplateConfig {
  name: string;
  domain: string;
  zoneName: string;
  subdomainPrefix: string;
  features: {
    d1: boolean;
    kv: boolean;
    r2: boolean;
    queues: boolean;
    serviceBindings: boolean;
    ephemeralPreviews: boolean;
    browserRendering: boolean;
    stagedPromotion: boolean;
    cloudflareAccess: boolean;
    turnstile: boolean;
    discordAlerts: boolean;
    matrixProfiles: boolean;
    agentSkills: boolean;
  };
}

const rootDir = process.cwd();
const configPath = path.resolve(rootDir, 'template.config.json');
const wranglerPath = path.resolve(rootDir, 'wrangler.toml');

export function loadConfig(): TemplateConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`template.config.json not found at ${configPath}`);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export function saveConfig(config: TemplateConfig): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

export function syncWrangler(config: TemplateConfig): void {
  if (!fs.existsSync(wranglerPath)) return;
  let content = fs.readFileSync(wranglerPath, 'utf-8');

  // Update base name
  content = content.replace(/name = ".*?"/, `name = "${config.name}"`);

  // Update domains
  if (config.domain) {
    content = content.replace(/example\.com/g, config.domain);
  }

  fs.writeFileSync(wranglerPath, content, 'utf-8');
}

export function main(): void {
  const args = process.argv.slice(2);
  const config = loadConfig();

  if (args.includes('--verify')) {
    console.log(`\n${colors.bold}${colors.cyan}=== Composable Template Feature Matrix ===${colors.reset}`);
    console.log(`Project Name: ${colors.bold}${config.name}${colors.reset}`);
    console.log(`Target Domain: ${colors.bold}${config.domain}${colors.reset}`);
    console.log('\nFeature Toggles:');
    for (const [feat, enabled] of Object.entries(config.features)) {
      const icon = enabled ? `${colors.green}✔ ENABLED${colors.reset}` : `${colors.yellow}✖ DISABLED${colors.reset}`;
      console.log(`  • ${feat.padEnd(22)}: ${icon}`);
    }
    console.log(`\n${colors.green}Template configuration verified cleanly.${colors.reset}\n`);
    return;
  }

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      config.name = args[++i];
    } else if (args[i] === '--domain' && args[i + 1]) {
      config.domain = args[++i];
      config.zoneName = config.domain;
    } else if (args[i] === '--disable-r2') {
      config.features.r2 = false;
    } else if (args[i] === '--disable-queues') {
      config.features.queues = false;
    } else if (args[i] === '--disable-d1') {
      config.features.d1 = false;
    } else if (args[i] === '--disable-kv') {
      config.features.kv = false;
    }
  }

  saveConfig(config);
  syncWrangler(config);
  console.log(`${colors.green}Updated template configuration & synced wrangler.toml.${colors.reset}`);
}

if (require.main === module) {
  main();
}
