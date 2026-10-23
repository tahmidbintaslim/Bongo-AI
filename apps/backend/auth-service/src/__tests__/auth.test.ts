import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Server } from 'http';
import { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { loadConfig } from '../config';
import { ConfigError } from '../utils/env';

const SECRET = 'auth-service-test-secret-0123456789abcdef';
const ALLOWED_ORIGIN = 'http://localhost:3000';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = createApp(loadConfig({ JWT_SECRET: SECRET, CORS_ORIGINS: ALLOWED_ORIGIN }));
  server = await new Promise<Server>(resolve => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

const post = (path: string, body: unknown) =>
  fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

const getMe = (authorization?: string) =>
  fetch(`${baseUrl}/api/auth/me`, {
    headers: authorization ? { authorization } : {},
  });

const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

describe('loadConfig', () => {
  it('refuses to start without JWT_SECRET', () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
    expect(() => loadConfig({ JWT_SECRET: '   ' })).toThrow(/JWT_SECRET is not set/);
  });

  it('refuses the old dev fallback and other short secrets', () => {
    expect(() => loadConfig({ JWT_SECRET: 'dev_secret' })).toThrow(/at least 32 characters/);
  });
});

describe('account endpoints without a user store', () => {
  it('no longer logs in any email with password123', async () => {
    const res = await post('/api/auth/login', {
      email: 'anyone@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(501);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.data).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/accessToken|refreshToken/);
  });

  it('does not pretend to register users', async () => {
    const res = await post('/api/auth/register', {
      email: 'new@example.com',
      password: 'a-long-password',
      name: 'New User',
    });
    expect(res.status).toBe(501);
  });

  it('still validates the request contract', async () => {
    const res = await post('/api/auth/register', { email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('does not refresh or revoke tokens it cannot track', async () => {
    expect((await post('/api/auth/refresh', { refreshToken: 'x' })).status).toBe(501);
    expect((await post('/api/auth/logout', {})).status).toBe(501);
  });
});

describe('GET /api/auth/me', () => {
  it('requires a bearer token', async () => {
    const res = await getMe();
    expect(res.status).toBe(401);
    expect(res.headers.get('www-authenticate')).toBe('Bearer');
  });

  it('rejects tokens signed with another secret, including the old dev_secret', async () => {
    const forged = jwt.sign({ userId: 'u1' }, 'dev_secret', { expiresIn: '5m' });
    expect((await getMe(`Bearer ${forged}`)).status).toBe(401);
  });

  it('rejects unsigned and non-expiring tokens', async () => {
    const unsigned = `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url({ userId: 'u1' })}.`;
    expect((await getMe(`Bearer ${unsigned}`)).status).toBe(401);

    const forever = jwt.sign({ userId: 'u1' }, SECRET);
    expect((await getMe(`Bearer ${forever}`)).status).toBe(401);
  });

  it('rejects expired tokens', async () => {
    const expired = jwt.sign({ userId: 'u1', exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
    expect((await getMe(`Bearer ${expired}`)).status).toBe(401);
  });

  it('returns the claims of a valid token', async () => {
    const token = jwt.sign({ userId: 'u1', email: 'u1@example.com', role: 'student' }, SECRET, {
      expiresIn: '5m',
    });
    const res = await getMe(`Bearer ${token}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual({ userId: 'u1', email: 'u1@example.com', role: 'student' });
  });
});

describe('CORS', () => {
  it('only echoes origins listed in CORS_ORIGINS', async () => {
    const allowed = await fetch(`${baseUrl}/health`, { headers: { origin: ALLOWED_ORIGIN } });
    expect(allowed.headers.get('access-control-allow-origin')).toBe(ALLOWED_ORIGIN);
    const other = await fetch(`${baseUrl}/health`, { headers: { origin: 'https://evil.example' } });
    expect(other.headers.get('access-control-allow-origin')).toBeNull();
  });
});
