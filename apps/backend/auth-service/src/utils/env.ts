// Startup configuration helpers. Each backend service carries an identical
// copy of this file until the services merge into one API; change them together.

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export type Env = Record<string, string | undefined>;

// HS256 is only as strong as its key. The length floor rejects the
// placeholder values from old example files and short guessable strings.
export const MIN_SECRET_LENGTH = 32;

export const requireSecret = (env: Env, name: string): string => {
  const value = env[name]?.trim();
  if (!value) {
    throw new ConfigError(
      `${name} is not set. Generate one with "openssl rand -hex 32" and set it in the environment.`
    );
  }
  if (value.length < MIN_SECRET_LENGTH) {
    throw new ConfigError(`${name} must be at least ${MIN_SECRET_LENGTH} characters long.`);
  }
  return value;
};

// CORS_ORIGINS is a comma-separated list of exact origins, for example
// "http://localhost:3000,https://app.example.com". Unset or empty means no
// cross-origin browser access. Wildcards, paths and trailing slashes are
// rejected so a typo cannot silently open or close access.
export const parseCorsOrigins = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0)
    .map(entry => {
      let origin: string | undefined;
      try {
        origin = new URL(entry).origin;
      } catch {
        origin = undefined;
      }
      if (!origin || origin !== entry) {
        throw new ConfigError(
          `CORS_ORIGINS entry "${entry}" is not an exact origin. Use the form https://app.example.com (no path, no trailing slash, no wildcard).`
        );
      }
      return origin;
    });
};

export const positiveInt = (env: Env, name: string, fallback: number): number => {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ConfigError(`${name} must be a positive integer, got "${raw}".`);
  }
  return parsed;
};
