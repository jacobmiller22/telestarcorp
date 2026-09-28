#!/usr/bin/env tsx
/**
 * Cloudflare Worker Bundle Size Budgeting & PR CI Verification Gate
 *
 * Inspects worker build artifacts, measuring uncompressed, gzip, and brotli sizes.
 * Hard limit: 33 MB (Cloudflare Workers platform maximum).
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const MAX_UNCOMPRESSED_BYTES = 33 * 1024 * 1024; // 33 MB hard Cloudflare limit
const WARN_GZIP_BYTES = 1.5 * 1024 * 1024; // 1.5 MB warning threshold
const MAX_GZIP_BYTES = 5 * 1024 * 1024; // 5 MB hard limit

export function checkBundleBudget(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.yellow}Notice: Bundle file ${filePath} not found. Skipping budget check.${colors.reset}`);
    return true;
  }

  const content = fs.readFileSync(filePath);
  const uncompressed = content.length;
  const gzip = zlib.gzipSync(content).length;
  const brotli = zlib.brotliCompressSync(content).length;

  const toMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

  console.log(`\n${colors.bold}${colors.cyan}=== Cloudflare Worker Bundle Budget Inspection ===${colors.reset}`);
  console.log(`Target: ${colors.bold}${filePath}${colors.reset}`);
  console.log(`  • Uncompressed: ${toMb(uncompressed)} MB / 33.00 MB`);
  console.log(`  • Gzip:         ${toMb(gzip)} MB / ${toMb(MAX_GZIP_BYTES)} MB`);
  console.log(`  • Brotli:       ${toMb(brotli)} MB\n`);

  if (uncompressed > MAX_UNCOMPRESSED_BYTES) {
    console.error(`${colors.red}❌ FAILED: Bundle exceeds Cloudflare platform 33MB limit!${colors.reset}`);
    return false;
  }

  if (gzip > MAX_GZIP_BYTES) {
    console.error(`${colors.red}❌ FAILED: Bundle exceeds 5MB gzip budget gate!${colors.reset}`);
    return false;
  }

  if (gzip > WARN_GZIP_BYTES) {
    console.warn(`${colors.yellow}⚠️ WARNING: Bundle exceeds 1.5MB recommended gzip budget.${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ PASSED: Worker bundle size is well within budget limits.${colors.reset}`);
  }

  return true;
}

function main(): void {
  const rootDir = process.cwd();
  const candidateFiles = [
    path.resolve(rootDir, 'apps/api/dist/index.js'),
    path.resolve(rootDir, 'apps/api/src/index.ts'),
  ];

  let passed = true;
  for (const file of candidateFiles) {
    if (fs.existsSync(file)) {
      if (!checkBundleBudget(file)) {
        passed = false;
      }
      break;
    }
  }

  if (!passed) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
