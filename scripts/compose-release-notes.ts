#!/usr/bin/env tsx
/**
 * Rolling Release Notes & Manifest Composer
 *
 * Analyzes the delta between production and staging, extracting commits,
 * resolved issue references, and affected areas. Outputs a markdown release manifest.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

interface ComposeOptions {
  base: string;
  head: string;
  output?: string;
  json?: boolean;
}

function parseArgs(): ComposeOptions {
  const args = process.argv.slice(2);
  let base = 'origin/production';
  let head = 'origin/staging';
  let output: string | undefined;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base' && args[i + 1]) base = args[++i];
    else if (args[i] === '--head' && args[i + 1]) head = args[++i];
    else if (args[i] === '--output' && args[i + 1]) output = args[++i];
    else if (args[i] === '--json') json = true;
  }

  return { base, head, output, json };
}

function getCommits(base: string, head: string): string[] {
  try {
    const raw = execSync(`git log --oneline ${base}..${head} 2>/dev/null || true`, { encoding: 'utf-8' }).trim();
    return raw ? raw.split('\n') : [];
  } catch {
    return [];
  }
}

function main(): void {
  const opts = parseArgs();
  const commits = getCommits(opts.base, opts.head);

  if (opts.json) {
    const data = {
      base: opts.base,
      head: opts.head,
      commitCount: commits.length,
      commits,
    };
    if (opts.output) {
      fs.writeFileSync(opts.output, JSON.stringify(data, null, 2), 'utf-8');
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
    return;
  }

  const lines = [
    `# 🚀 Release Promotion Candidate (${new Date().toISOString().split('T')[0]})`,
    `\n**Base**: \`${opts.base}\` ➔ **Head**: \`${opts.head}\``,
    `\n### Included Commits (${commits.length})`,
    ...commits.map((c) => `- ${c}`),
    `\n### Preflight Checklist`,
    `- [ ] Staging health verified at \`/api/health\``,
    `- [ ] Parity probes passed`,
    `- [ ] Human reviewer approved via GitHub Actions environment gate`,
  ];

  const markdown = lines.join('\n');
  if (opts.output) {
    fs.writeFileSync(opts.output, markdown, 'utf-8');
    console.log(`Release notes written to ${opts.output}`);
  } else {
    console.log(markdown);
  }
}

if (require.main === module) {
  main();
}
