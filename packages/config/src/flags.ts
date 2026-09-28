import { z } from 'zod';
import type { EnvironmentTier } from '@template/types';

export const flagSchema = z.object({
  FLAG_MAINTENANCE_MODE: z.boolean().default(false),
  FLAG_EMERGENCY_KILL_SWITCH: z.boolean().default(false),
  FLAG_VERBOSE_DEBUG_HEADERS: z.boolean().default(false),
  FLAG_ENABLE_BETA_FEATURES: z.boolean().default(false),
});

export type FeatureFlags = z.infer<typeof flagSchema>;
export type FlagKey = keyof FeatureFlags;
export const FLAG_KEYS = Object.keys(flagSchema.shape) as FlagKey[];

export const ENVIRONMENT_FLAG_DEFAULTS: Record<EnvironmentTier, FeatureFlags> = {
  preview: {
    FLAG_MAINTENANCE_MODE: false,
    FLAG_EMERGENCY_KILL_SWITCH: false,
    FLAG_VERBOSE_DEBUG_HEADERS: true,
    FLAG_ENABLE_BETA_FEATURES: true,
  },
  staging: {
    FLAG_MAINTENANCE_MODE: false,
    FLAG_EMERGENCY_KILL_SWITCH: false,
    FLAG_VERBOSE_DEBUG_HEADERS: true,
    FLAG_ENABLE_BETA_FEATURES: true,
  },
  production: {
    FLAG_MAINTENANCE_MODE: false,
    FLAG_EMERGENCY_KILL_SWITCH: false,
    FLAG_VERBOSE_DEBUG_HEADERS: false,
    FLAG_ENABLE_BETA_FEATURES: false,
  },
  development: {
    FLAG_MAINTENANCE_MODE: false,
    FLAG_EMERGENCY_KILL_SWITCH: false,
    FLAG_VERBOSE_DEBUG_HEADERS: true,
    FLAG_ENABLE_BETA_FEATURES: true,
  },
  test: {
    FLAG_MAINTENANCE_MODE: false,
    FLAG_EMERGENCY_KILL_SWITCH: false,
    FLAG_VERBOSE_DEBUG_HEADERS: false,
    FLAG_ENABLE_BETA_FEATURES: false,
  },
};

export function evaluateFlags(
  envTier: EnvironmentTier = 'development',
  envVars: Record<string, string | undefined> = process.env
): FeatureFlags {
  const defaults = ENVIRONMENT_FLAG_DEFAULTS[envTier] || ENVIRONMENT_FLAG_DEFAULTS.development;
  const resolved: Record<string, boolean> = { ...defaults };

  for (const key of FLAG_KEYS) {
    const rawVal = envVars[key];
    if (rawVal !== undefined) {
      resolved[key] = rawVal.toLowerCase() === 'true' || rawVal === '1';
    }
  }

  return resolved as FeatureFlags;
}
