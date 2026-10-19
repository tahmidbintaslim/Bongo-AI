import { Env, parseCorsOrigins, positiveInt, requireSecret } from './utils/env';

export interface ServiceConfig {
  port: number;
  jwtSecret: string;
  corsOrigins: string[];
  rateLimit: { windowMs: number; max: number };
}

// Throws ConfigError when a required value is missing or malformed, so the
// service refuses to start instead of running with a guessable secret.
export const loadConfig = (env: Env): ServiceConfig => ({
  port: positiveInt(env, 'PORT', 4002),
  jwtSecret: requireSecret(env, 'JWT_SECRET'),
  corsOrigins: parseCorsOrigins(env.CORS_ORIGINS),
  rateLimit: {
    windowMs: positiveInt(env, 'RATE_LIMIT_WINDOW_MS', 900000),
    max: positiveInt(env, 'RATE_LIMIT_MAX_REQUESTS', 100),
  },
});
