import type { BgEnv } from './types';
import type { BackgroundJobPayload } from '@telestarcorp/types';

export default {
  // 1. Service Binding Entrypoint (called directly from apps/api)
  async fetch(request: Request, env: BgEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', worker: 'worker-bg' }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: 'worker-bg',
        message: 'RPC request handled via Cloudflare Service Binding',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  },

  // 2. Cloudflare Queues Batch Consumer
  async queue(batch: MessageBatch<BackgroundJobPayload>, env: BgEnv, ctx: ExecutionContext): Promise<void> {
    console.log(`[worker-bg] Processing batch of ${batch.messages.length} queue messages...`);

    for (const message of batch.messages) {
      try {
        console.log(`[worker-bg] Processing job ${message.body.jobId} (type: ${message.body.type})`);
        // Acknowledge successful processing
        message.ack();
      } catch (err) {
        console.error(`[worker-bg] Failed to process message ${message.id}:`, err);
        // Retry message if within retry budget
        message.retry();
      }
    }
  },

  // 3. Cloudflare Scheduled Cron Handler
  async scheduled(event: ScheduledEvent, env: BgEnv, ctx: ExecutionContext): Promise<void> {
    console.log(`[worker-bg] Cron event triggered at ${new Date(event.scheduledTime).toISOString()} (cron: ${event.cron})`);
  },
};
