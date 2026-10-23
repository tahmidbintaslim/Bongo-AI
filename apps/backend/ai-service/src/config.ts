import { Env, parseCorsOrigins, positiveInt, requireSecret } from './utils/env';

export interface AiServiceConfig {
  port: number;
  jwtSecret: string;
  corsOrigins: string[];
  // Per-user budget for every /api/ai/* call (each one can spend the LLM key).
  aiRateLimit: { windowMs: number; max: number };
  // Largest accepted JSON body for /api/ai/*, in bytes.
  maxBodyBytes: number;
}

// Throws ConfigError when a required value is missing or malformed, so the
// service refuses to start instead of serving the LLM key to anyone.
export const loadConfig = (env: Env): AiServiceConfig => ({
  port: positiveInt(env, 'PORT', 4003),
  jwtSecret: requireSecret(env, 'JWT_SECRET'),
  corsOrigins: parseCorsOrigins(env.CORS_ORIGINS),
  aiRateLimit: {
    windowMs: positiveInt(env, 'AI_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: positiveInt(env, 'AI_RATE_LIMIT_MAX_REQUESTS', 20),
  },
  maxBodyBytes: positiveInt(env, 'AI_MAX_BODY_BYTES', 16 * 1024),
});
