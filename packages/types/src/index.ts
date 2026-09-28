export type EnvironmentTier = 'preview' | 'staging' | 'production' | 'development' | 'test';

export interface BindingStatus {
  status: 'healthy' | 'degraded' | 'unavailable' | 'unhealthy' | 'omitted';
  latencyMs?: number;
  details?: string;
}

export interface HealthProbeResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  environment: EnvironmentTier | string;
  commitSha: string;
  shortSha: string;
  buildTimestamp: string;
  uptimeSeconds: number;
  bindings: {
    d1?: BindingStatus;
    kv?: BindingStatus;
    r2?: BindingStatus;
    queues?: BindingStatus;
    serviceBindings?: BindingStatus;
  };
}

export interface ApiItem {
  id: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundJobPayload {
  jobId: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  timestamp: string;
}

export interface DiscordPayload {
  content: string;
  embeds: DiscordEmbed[];
}
