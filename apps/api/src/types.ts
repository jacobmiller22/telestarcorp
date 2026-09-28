import type { D1Database, KVNamespace, R2Bucket, Queue, Fetcher } from '@cloudflare/workers-types';
import type { EnvironmentTier } from '@template/types';

export interface Env {
  // Bindings (Optional depending on enabled features)
  DB?: D1Database;
  CACHE_KV?: KVNamespace;
  STORAGE_BUCKET?: R2Bucket;
  JOBS_QUEUE?: Queue;
  WORKER_BG?: Fetcher;

  // Environment variables
  NODE_ENV?: string;
  ENVIRONMENT?: EnvironmentTier | string;
  API_URL?: string;
  BUILD_COMMIT_SHA?: string;
  BUILD_TIMESTAMP?: string;

  // Feature Flags
  FLAG_MAINTENANCE_MODE?: string;
  FLAG_EMERGENCY_KILL_SWITCH?: string;
  FLAG_VERBOSE_DEBUG_HEADERS?: string;
  FLAG_ENABLE_BETA_FEATURES?: string;
}
