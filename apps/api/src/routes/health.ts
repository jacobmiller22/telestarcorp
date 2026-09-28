import type { Env } from '../types';
import type { HealthProbeResult, BindingStatus } from '@template/types';

const START_TIME = Date.now();

export async function handleHealthCheck(request: Request, env: Env): Promise<Response> {
  const bindings: HealthProbeResult['bindings'] = {};
  let overallHealthy = true;

  // 1. Probe D1 Database if bound
  if (env.DB) {
    const t0 = Date.now();
    try {
      await env.DB.prepare('SELECT 1').first();
      bindings.d1 = {
        status: 'healthy',
        latencyMs: Date.now() - t0,
      };
    } catch (err) {
      overallHealthy = false;
      bindings.d1 = {
        status: 'unhealthy',
        latencyMs: Date.now() - t0,
        details: (err as Error).message,
      };
    }
  } else {
    bindings.d1 = { status: 'omitted' };
  }

  // 2. Probe KV Namespace if bound
  if (env.CACHE_KV) {
    const t0 = Date.now();
    try {
      await env.CACHE_KV.get('__health_probe__');
      bindings.kv = {
        status: 'healthy',
        latencyMs: Date.now() - t0,
      };
    } catch (err) {
      overallHealthy = false;
      bindings.kv = {
        status: 'unhealthy',
        latencyMs: Date.now() - t0,
        details: (err as Error).message,
      };
    }
  } else {
    bindings.kv = { status: 'omitted' };
  }

  // 3. Probe R2 Bucket if bound
  if (env.STORAGE_BUCKET) {
    const t0 = Date.now();
    try {
      await env.STORAGE_BUCKET.head('__health_probe__');
      bindings.r2 = {
        status: 'healthy',
        latencyMs: Date.now() - t0,
      };
    } catch (err) {
      // Missing object is expected and healthy for head()
      bindings.r2 = {
        status: 'healthy',
        latencyMs: Date.now() - t0,
      };
    }
  } else {
    bindings.r2 = { status: 'omitted' };
  }

  // 4. Probe Service Binding if bound
  if (env.WORKER_BG) {
    const t0 = Date.now();
    try {
      const res = await env.WORKER_BG.fetch(new Request('http://worker-bg/health'));
      bindings.serviceBindings = {
        status: res.ok ? 'healthy' : 'degraded',
        latencyMs: Date.now() - t0,
      };
    } catch (err) {
      bindings.serviceBindings = {
        status: 'degraded',
        latencyMs: Date.now() - t0,
        details: (err as Error).message,
      };
    }
  } else {
    bindings.serviceBindings = { status: 'omitted' };
  }

  const nodeEnv = (globalThis as any).process?.env || {};
  const commitSha = env.BUILD_COMMIT_SHA || nodeEnv.BUILD_COMMIT_SHA || 'dev-local';
  const shortSha = commitSha.slice(0, 7);
  const buildTimestamp = env.BUILD_TIMESTAMP || nodeEnv.BUILD_TIMESTAMP || new Date().toISOString();
  const environment = env.ENVIRONMENT || env.NODE_ENV || 'development';

  const body: HealthProbeResult = {
    status: overallHealthy ? 'healthy' : 'degraded',
    environment,
    commitSha,
    shortSha,
    buildTimestamp,
    uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    bindings,
  };

  const status = overallHealthy ? 200 : 503;
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store, no-cache, must-revalidate',
      'x-commit-sha': commitSha,
      'x-short-sha': shortSha,
      'x-environment': environment,
    },
  });
}
