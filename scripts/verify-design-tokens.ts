#!/usr/bin/env tsx
/**
 * Design Token, Accessibility Contrast & Header Layout Verification
 *
 * Validates:
 * 1. Authentic Telestar brand tokens defined in global.css (@theme)
 * 2. WCAG 2.1 Level AA color contrast compliance (≥ 4.5:1 for body copy, ≥ 3:1 for UI elements)
 * 3. Elimination of generic Tailwind blue-600 classes across apps/web/src
 * 4. Header layout alignment in Layout.astro
 */

import fs from 'node:fs';
import path from 'node:path';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, fileList);
    } else if (file.endsWith('.astro') || file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function verifyDesignTokens(): Promise<void> {
  console.log(`\n${colors.bold}${colors.cyan}=== Brand Design Tokens & Accessibility Gate ===${colors.reset}\n`);

  let failures = 0;

  // 1. Inspect global.css for required @theme tokens
  const globalCssPath = path.resolve(process.cwd(), 'apps/web/src/styles/global.css');
  if (!fs.existsSync(globalCssPath)) {
    console.error(`${colors.red}❌ Missing global.css at ${globalCssPath}${colors.reset}`);
    process.exit(1);
  }

  const cssContent = fs.readFileSync(globalCssPath, 'utf-8');
  const requiredTokens: Record<string, string> = {
    '--color-brand-cyan': '#008cb8',
    '--color-brand-cyan-dark': '#006d91',
    '--color-brand-cyan-light': '#e6f4f8',
    '--color-brand-charcoal': '#505050',
    '--color-brand-navy': '#0f1c2e',
    '--color-brand-accent': '#00a4d6',
  };

  console.log(`${colors.bold}1. Brand Design Tokens in global.css:${colors.reset}`);
  for (const [token, expectedHex] of Object.entries(requiredTokens)) {
    if (cssContent.includes(token) && cssContent.toLowerCase().includes(expectedHex.toLowerCase())) {
      console.log(`  ${colors.green}✔${colors.reset} ${token.padEnd(26)}: ${expectedHex}`);
    } else {
      console.error(`  ${colors.red}✖${colors.reset} Missing or incorrect token: ${token} (expected ${expectedHex})`);
      failures++;
    }
  }

  // 2. Accessibility Contrast Verification
  console.log(`\n${colors.bold}2. WCAG 2.1 Level AA Contrast Calculations:${colors.reset}`);
  const contrastChecks = [
    {
      name: 'Accessible Cyan Dark on White (#ffffff)',
      fg: '#006d91',
      bg: '#ffffff',
      min: 4.5,
      type: 'Text',
    },
    {
      name: 'Brand Charcoal (#505050) on White (#ffffff)',
      fg: '#505050',
      bg: '#ffffff',
      min: 4.5,
      type: 'Text',
    },
    {
      name: 'Brand Navy (#0f1c2e) on White (#ffffff)',
      fg: '#0f1c2e',
      bg: '#ffffff',
      min: 4.5,
      type: 'Text',
    },
    {
      name: 'White (#ffffff) on Accessible Cyan Dark (#006d91)',
      fg: '#ffffff',
      bg: '#006d91',
      min: 4.5,
      type: 'Text / Button',
    },
    {
      name: 'Cerulean Cyan (#008cb8) on White (#ffffff) [Graphical/UI]',
      fg: '#008cb8',
      bg: '#ffffff',
      min: 3.0,
      type: 'UI Component',
    },
  ];

  for (const check of contrastChecks) {
    const ratio = getContrastRatio(check.fg, check.bg);
    const pass = ratio >= check.min;
    const formattedRatio = `${ratio.toFixed(2)}:1`;
    if (pass) {
      console.log(`  ${colors.green}✔ PASS${colors.reset} ${check.name.padEnd(52)} ${formattedRatio} (req ≥ ${check.min}:1)`);
    } else {
      console.error(`  ${colors.red}✖ FAIL${colors.reset} ${check.name.padEnd(52)} ${formattedRatio} (req ≥ ${check.min}:1)`);
      failures++;
    }
  }

  // 3. Scan apps/web/src for remaining blue- classes
  console.log(`\n${colors.bold}3. Codebase Scan for Generic blue-* Classes:${colors.reset}`);
  const srcDir = path.resolve(process.cwd(), 'apps/web/src');
  const allFiles = walkDir(srcDir);
  let blueOccurrences = 0;

  for (const file of allFiles) {
    if (file.endsWith('.css')) continue; // Skip raw CSS
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/\bblue-\d{2,3}\b/g);
    if (matches && matches.length > 0) {
      const relPath = path.relative(process.cwd(), file);
      console.error(`  ${colors.red}✖${colors.reset} ${relPath}: found ${matches.length} generic blue utility class(es): ${matches.join(', ')}`);
      blueOccurrences += matches.length;
      failures++;
    }
  }

  if (blueOccurrences === 0) {
    console.log(`  ${colors.green}✔ Clean! Zero generic blue-* utility classes found across apps/web/src.${colors.reset}`);
  }

  // 4. Header 2-column layout verification
  console.log(`\n${colors.bold}4. Header Layout Alignment in Layout.astro:${colors.reset}`);
  const layoutPath = path.resolve(srcDir, 'layouts/Layout.astro');
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  const hasUnifiedCluster = layoutContent.includes('hidden md:flex items-center gap-6 lg:gap-8');
  if (hasUnifiedCluster) {
    console.log(`  ${colors.green}✔ Clean 2-column header layout verified (unified right navigation cluster).${colors.reset}`);
  } else {
    console.error(`  ${colors.red}✖ Header does not appear to use the 2-column unified right navigation cluster.${colors.reset}`);
    failures++;
  }

  if (failures > 0) {
    console.error(`\n${colors.red}❌ Verification failed with ${failures} issue(s).${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`\n${colors.green}✅ All design token, accessibility contrast, and layout gates passed.${colors.reset}\n`);
}

verifyDesignTokens().catch((err) => {
  console.error(err);
  process.exit(1);
});
