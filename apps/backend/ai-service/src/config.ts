import { Env, positiveInt, requireSecret } from './utils/env';

export interface AiServiceConfig {
  port: number;
  jwtSecret: string;
}

// Throws ConfigError when a required value is missing or malformed, so the
// service refuses to start instead of serving the LLM key to anyone.
export const loadConfig = (env: Env): AiServiceConfig => ({
  port: positiveInt(env, 'PORT', 4003),
  jwtSecret: requireSecret(env, 'JWT_SECRET'),
});
