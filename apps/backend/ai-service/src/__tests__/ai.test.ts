import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Server } from 'http';
import { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { loadConfig } from '../config';
import { ConfigError } from '../utils/env';

const SECRET = 'ai-service-test-secret-0123456789abcdef';
const ALLOWED_ORIGIN = 'http://localhost:3000';
const LIMIT = 3;

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = createApp(
    loadConfig({
      JWT_SECRET: SECRET,
      CORS_ORIGINS: ALLOWED_ORIGIN,
      AI_RATE_LIMIT_MAX_REQUESTS: String(LIMIT),
      AI_MAX_BODY_BYTES: '1024',
    })
  );
  server = await new Promise<Server>(resolve => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

const tokenFor = (userId: string) => jwt.sign({ userId }, SECRET, { expiresIn: '5m' });

const post = (path: string, body: unknown, token?: string) =>
  fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

describe('loadConfig', () => {
  it('refuses to start without JWT_SECRET', () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
    expect(() => loadConfig({ JWT_SECRET: 'dev_secret' })).toThrow(ConfigError);
  });
});

describe('/api/ai authentication', () => {
  it.each(['/api/ai/query', '/api/ai/embed', '/api/ai/search'])(
    'rejects %s without a token',
    async path => {
      const res = await post(path, { query: 'গণিত কী?', text: 'x' });
      expect(res.status).toBe(401);
    }
  );

  it('rejects a token signed with another secret', async () => {
    const forged = jwt.sign({ userId: 'u1' }, 'some-other-secret-0123456789abcdef', {
      expiresIn: '5m',
    });
    expect((await post('/api/ai/search', { query: 'x' }, forged)).status).toBe(401);
  });

  it('serves an authenticated request', async () => {
    const res = await post('/api/ai/search', { query: 'গণিত কী?' }, tokenFor('u1'));
    expect(res.status).toBe(200);
  });

  it('keeps /health public', async () => {
    expect((await fetch(`${baseUrl}/health`)).status).toBe(200);
  });
});

describe('/api/ai rate limit', () => {
  it('limits each user separately', async () => {
    const alice = tokenFor('alice');
    for (let i = 0; i < LIMIT; i += 1) {
      expect((await post('/api/ai/search', { query: 'x' }, alice)).status).toBe(200);
    }
    const limited = await post('/api/ai/search', { query: 'x' }, alice);
    expect(limited.status).toBe(429);
    expect((await limited.json()).error).toMatch(/Too many AI requests/);

    // Another user on the same IP still has their own budget.
    expect((await post('/api/ai/search', { query: 'x' }, tokenFor('bob'))).status).toBe(200);
  });

  it('counts every /api/ai route against the same budget', async () => {
    const carol = tokenFor('carol');
    for (let i = 0; i < LIMIT; i += 1) {
      // No AI provider is configured in tests, so query and embed fail after
      // the limiter has counted them; the budget is what matters here.
      await post(i % 2 === 0 ? '/api/ai/query' : '/api/ai/embed', { query: 'x', text: 'x' }, carol);
    }
    expect((await post('/api/ai/search', { query: 'x' }, carol)).status).toBe(429);
  });
});

describe('/api/ai input limits', () => {
  it('rejects bodies over AI_MAX_BODY_BYTES with 413', async () => {
    const res = await post('/api/ai/query', { query: 'অ'.repeat(2000) }, tokenFor('dave'));
    expect(res.status).toBe(413);
    expect((await res.json()).success).toBe(false);
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await fetch(`${baseUrl}/api/ai/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${tokenFor('erin')}` },
      body: '{"query":',
    });
    expect(res.status).toBe(400);
  });

  it('rejects non-string queries and batch embeddings', async () => {
    const frank = tokenFor('frank');
    expect((await post('/api/ai/search', { query: { $gt: '' } }, frank)).status).toBe(400);
    expect((await post('/api/ai/embed', { text: ['a', 'b', 'c'] }, frank)).status).toBe(400);
  });
});

describe('ai-service CORS', () => {
  it('only echoes origins listed in CORS_ORIGINS', async () => {
    const allowed = await fetch(`${baseUrl}/health`, { headers: { origin: ALLOWED_ORIGIN } });
    expect(allowed.headers.get('access-control-allow-origin')).toBe(ALLOWED_ORIGIN);
    const other = await fetch(`${baseUrl}/health`, { headers: { origin: 'https://evil.example' } });
    expect(other.headers.get('access-control-allow-origin')).toBeNull();
  });
});

describe('loadConfig limits', () => {
  it('uses safe defaults and rejects malformed values', () => {
    const config = loadConfig({ JWT_SECRET: SECRET });
    expect(config.aiRateLimit).toEqual({ windowMs: 900000, max: 20 });
    expect(config.maxBodyBytes).toBe(16384);
    expect(config.corsOrigins).toEqual([]);
    expect(() => loadConfig({ JWT_SECRET: SECRET, AI_RATE_LIMIT_MAX_REQUESTS: '0' })).toThrow(
      ConfigError
    );
    expect(() => loadConfig({ JWT_SECRET: SECRET, CORS_ORIGINS: '*' })).toThrow(ConfigError);
  });
});
