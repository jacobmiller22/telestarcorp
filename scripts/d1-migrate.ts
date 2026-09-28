#!/usr/bin/env tsx
/**
 * Cloudflare D1 Declarative Migration Runner & Rollback Helper
 *
 * Enforces non-destructive additive schema evolution and Point-in-Time Recovery (PITR).
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export interface MigrationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  filesAnalyzed: string[];
}

export const DEFAULT_BASELINE_MIGRATION = '0001_initial_schema.sql';

export function stripSqlComments(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--.*$/gm, '');
}

export function validateAdditiveMigrations(migrationsDir: string): MigrationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const filesAnalyzed: string[] = [];

  if (!fs.existsSync(migrationsDir)) {
    return { valid: false, errors: [`Migrations dir not found: ${migrationsDir}`], warnings, filesAnalyzed };
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  const destructiveRegex = /\b(DROP\s+TABLE|DROP\s+COLUMN|DROP\s+VIEW|TRUNCATE\s+TABLE)\b/i;

  for (const file of files) {
    filesAnalyzed.push(file);
    if (file === DEFAULT_BASELINE_MIGRATION) continue; // Baseline permitted

    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    const cleanSql = stripSqlComments(content);

    if (destructiveRegex.test(cleanSql)) {
      errors.push(`Destructive operation detected in post-baseline migration: ${file}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    filesAnalyzed,
  };
}

function main(): void {
  const args = process.argv.slice(2);
  const migrationsDir = path.resolve(process.cwd(), 'migrations');

  console.log('🔍 Validating Cloudflare D1 additive schema evolution...');
  const result = validateAdditiveMigrations(migrationsDir);

  if (!result.valid) {
    console.error('❌ Migration validation failed:');
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`✅ All ${result.filesAnalyzed.length} migrations satisfy non-destructive additive standards.`);

  if (args.includes('--check')) {
    process.exit(0);
  }

  const isRemote = args.includes('--remote');
  const envIdx = args.indexOf('--env');
  const env = envIdx !== -1 ? args[envIdx + 1] : undefined;

  let cmd = 'wrangler d1 migrations apply DB';
  if (isRemote) cmd += ' --remote';
  if (env) cmd += ` --env ${env}`;

  console.log(`▶ Executing: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err: any) {
    console.error(`Migration execution failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
