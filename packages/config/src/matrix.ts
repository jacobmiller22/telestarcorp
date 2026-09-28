import type { EnvironmentTier } from '@telestarcorp/types';

export type D1Target = 'local-sqlite' | 'miniflare' | 'staging-remote' | 'production-remote';
export type KvTarget = 'in-memory' | 'miniflare-disk' | 'staging-remote' | 'production-remote';
export type R2Target = 'mock-filesystem' | 'miniflare' | 'staging-remote' | 'production-remote';
export type QueuesTarget = 'mock-in-memory' | 'staging-remote' | 'production-remote';

export interface D1SubsystemConfig {
  target: D1Target;
  readOnly?: boolean;
  databaseId?: string;
  accountId?: string;
  apiToken?: string;
}

export interface SubsystemsConfig {
  api: EnvironmentTier;
  databaseD1: D1SubsystemConfig;
  kvCache: KvTarget;
  r2Storage: R2Target;
  queues: QueuesTarget;
}

export interface IntegrationMatrixConfig {
  profile: string;
  subsystems: SubsystemsConfig;
  allowProdWrites?: boolean;
}

export const STANDARD_PROFILES: Record<string, IntegrationMatrixConfig> = {
  'local-offline': {
    profile: 'local-offline',
    subsystems: {
      api: 'development',
      databaseD1: {
        target: 'local-sqlite',
        readOnly: false,
      },
      kvCache: 'in-memory',
      r2Storage: 'mock-filesystem',
      queues: 'mock-in-memory',
    },
    allowProdWrites: false,
  },
  'hybrid-staging': {
    profile: 'hybrid-staging',
    subsystems: {
      api: 'development',
      databaseD1: {
        target: 'staging-remote',
        readOnly: false,
      },
      kvCache: 'staging-remote',
      r2Storage: 'staging-remote',
      queues: 'staging-remote',
    },
    allowProdWrites: false,
  },
  'prod-readonly-probe': {
    profile: 'prod-readonly-probe',
    subsystems: {
      api: 'development',
      databaseD1: {
        target: 'production-remote',
        readOnly: true, // STRICTLY ENFORCED
      },
      kvCache: 'production-remote',
      r2Storage: 'production-remote',
      queues: 'mock-in-memory',
    },
    allowProdWrites: false,
  },
};

export class ProductionWriteForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductionWriteForbiddenError';
  }
}

const MUTATING_SQL_REGEX = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE)\b/i;

export function isMutatingSql(sql: string): boolean {
  const cleanSql = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
  return MUTATING_SQL_REGEX.test(cleanSql);
}

export function assertSafeSql(sql: string, readOnly: boolean): void {
  if (readOnly && isMutatingSql(sql)) {
    const verb = sql.trim().split(/\s+/)[0]?.toUpperCase() || 'MUTATION';
    throw new ProductionWriteForbiddenError(
      `Mutating SQL operation (${verb}) is forbidden under read-only matrix profile. Query: "${sql.slice(0, 80).trim()}..."`
    );
  }
}

export function resolveMatrixProfile(
  profileName?: string,
  overrides?: Partial<IntegrationMatrixConfig>
): IntegrationMatrixConfig {
  const chosenProfile =
    profileName ||
    (typeof process !== 'undefined' ? process.env.MATRIX_PROFILE : undefined) ||
    'local-offline';

  const base = STANDARD_PROFILES[chosenProfile] || STANDARD_PROFILES['local-offline'];

  return {
    profile: chosenProfile,
    subsystems: {
      ...base.subsystems,
      ...(overrides?.subsystems || {}),
      databaseD1: {
        ...base.subsystems.databaseD1,
        ...(overrides?.subsystems?.databaseD1 || {}),
      },
    },
    allowProdWrites: overrides?.allowProdWrites ?? base.allowProdWrites,
  };
}
