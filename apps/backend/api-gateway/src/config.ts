import { Env, parseCorsOrigins, positiveInt } from './utils/env';

export interface GatewayConfig {
  port: number;
  corsOrigins: string[];
  services: { auth: string; content: string; ai: string; analytics: string };
}

// Throws ConfigError when a value is malformed, so the gateway refuses to
// start instead of guessing.
export const loadConfig = (env: Env): GatewayConfig => ({
  port: positiveInt(env, 'PORT', 4000),
  corsOrigins: parseCorsOrigins(env.CORS_ORIGINS),
  services: {
    auth: env.AUTH_SERVICE_URL || 'http://localhost:4001',
    content: env.CONTENT_SERVICE_URL || 'http://localhost:4002',
    ai: env.AI_SERVICE_URL || 'http://localhost:4003',
    analytics: env.ANALYTICS_SERVICE_URL || 'http://localhost:4004',
  },
});
