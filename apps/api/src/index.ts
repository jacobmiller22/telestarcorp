import type { Env } from './types';
import { handleHealthCheck } from './routes/health';
import { handleItemsRoute } from './routes/items';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-commit-sha',
        },
      });
    }

    // 1. Health Probe Route
    if (pathname === '/api/health' || pathname === '/health') {
      return handleHealthCheck(request, env);
    }

    // 2. Items CRUD Route
    if (pathname.startsWith('/api/items')) {
      return handleItemsRoute(request, env);
    }

    // 3. Service Binding Call Route (demonstrates multi-worker RPC)
    if (pathname === '/api/bg-job') {
      if (env.WORKER_BG) {
        return env.WORKER_BG.fetch(request);
      }
      return new Response(JSON.stringify({ message: 'WORKER_BG service binding not configured' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    // 4. Try serving static assets (Astro frontend)
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }

    // 5. Root Welcome Route (fallback if ASSETS not present)
    if (pathname === '/') {
      return new Response(
        JSON.stringify(
          {
            name: 'Telestar Corporation Edge Platform',
            environment: env.ENVIRONMENT || env.NODE_ENV || 'development',
            status: 'operational',
            routes: {
              health: '/api/health',
              items: '/api/items',
            },
            bindings: {
              assets: !!env.ASSETS,
              d1: !!env.DB,
              kv: !!env.CACHE_KV,
              r2: !!env.STORAGE_BUCKET,
              queues: !!env.JOBS_QUEUE,
              workerBg: !!env.WORKER_BG,
            },
          },
          null,
          2
        ),
        {
          headers: {
            'content-type': 'application/json',
            'x-commit-sha': env.BUILD_COMMIT_SHA || 'dev-local',
          },
        }
      );
    }

    return new Response('Not Found', { status: 404 });
  },
};
