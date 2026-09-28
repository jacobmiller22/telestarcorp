import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ENVIRONMENT: z.enum(['development', 'preview', 'staging', 'production', 'test']).default('development'),
  MATRIX_PROFILE: z.string().default('local-offline'),

  // Cloudflare
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_ZONE_ID: z.string().optional(),

  // URLs
  API_URL: z.string().url().default('http://localhost:8787'),

  // Cloudflare Access (Optional)
  CF_ACCESS_CLIENT_ID: z.string().optional(),
  CF_ACCESS_CLIENT_SECRET: z.string().optional(),
  CF_ACCESS_AUD: z.string().optional(),

  // Turnstile (Optional)
  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Webhooks
  DISCORD_WEBHOOK_URL: z.string().optional(),
  DISCORD_WEBHOOK_DEV_ALERTS: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function parseEnv(rawEnv: Record<string, unknown> = process.env): EnvConfig {
  const result = envSchema.safeParse(rawEnv);
  if (!result.success) {
    console.error('Environment validation failed:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}
