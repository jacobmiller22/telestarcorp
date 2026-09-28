import type { Env } from '../types';
import type { ApiItem } from '@telestarcorp/types';

export async function handleItemsRoute(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;

  if (method === 'GET') {
    // 1. Try cache if KV is enabled
    const cacheKey = 'items:list';
    if (env.CACHE_KV) {
      const cached = await env.CACHE_KV.get(cacheKey, 'json');
      if (cached) {
        return new Response(JSON.stringify({ data: cached, source: 'kv-cache' }), {
          headers: { 'content-type': 'application/json' },
        });
      }
    }

    // 2. Fetch from D1 if available, fallback to mock
    let items: ApiItem[] = [];
    if (env.DB) {
      try {
        const query = await env.DB.prepare('SELECT * FROM items ORDER BY created_at DESC LIMIT 50').all();
        items = (query.results as any[]) || [];
      } catch (err) {
        // Table might not exist yet if unmigrated
        items = [{
          id: 'demo-1',
          title: 'Hello from Cloudflare Workers!',
          description: 'D1 table is pending migration. Run `pnpm run d1:migrate` to create schema.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }];
      }
    } else {
      items = [{
        id: 'mock-1',
        title: 'Mock Item (D1 Omitted)',
        description: 'D1 feature is not configured in this profile.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }];
    }

    // 3. Cache result for 60 seconds if KV enabled
    if (env.CACHE_KV) {
      await env.CACHE_KV.put(cacheKey, JSON.stringify(items), { expirationTtl: 60 });
    }

    return new Response(JSON.stringify({ data: items, source: 'origin' }), {
      headers: { 'content-type': 'application/json' },
    });
  }

  if (method === 'POST') {
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database D1 is not enabled' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    let payload: any = {};
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400 });
    }

    const id = payload.id || crypto.randomUUID();
    const title = payload.title || 'Untitled Item';
    const description = payload.description || '';
    const now = new Date().toISOString();

    try {
      await env.DB.prepare(
        'INSERT INTO items (id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(id, title, description, now, now)
        .run();

      // Invalidate KV cache
      if (env.CACHE_KV) {
        await env.CACHE_KV.delete('items:list');
      }

      // Enqueue background processing job if Queue is enabled
      if (env.JOBS_QUEUE) {
        await env.JOBS_QUEUE.send({
          jobId: crypto.randomUUID(),
          type: 'item.created',
          payload: { id, title },
          timestamp: now,
        });
      }

      return new Response(JSON.stringify({ success: true, item: { id, title, description, createdAt: now } }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
