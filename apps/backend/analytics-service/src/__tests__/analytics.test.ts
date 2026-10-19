import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Server } from 'http';
import { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { loadConfig } from '../config';
import { ConfigError } from '../utils/env';

const SECRET = 'analytics-service-test-secret-0123456789abcdef';
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

const auth = (userId: string) => ({
  authorization: `Bearer ${jwt.sign({ userId }, SECRET, { expiresIn: '5m' })}`,
});

describe('loadConfig', () => {
  it('refuses to start without JWT_SECRET', () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
  });
});

describe('/api/analytics authentication', () => {
  it('rejects every route without a token', async () => {
    for (const path of [
      '/api/analytics/events',
      '/api/analytics/stats/aggregate',
      '/api/analytics/stats/user/u1',
    ]) {
      expect((await fetch(`${baseUrl}${path}`)).status).toBe(401);
    }
    const res = await fetch(`${baseUrl}/api/analytics/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', eventType: 'lesson_viewed' }),
    });
    expect(res.status).toBe(401);
  });

  it('tracks and reports events for an authenticated caller', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...auth('u1') },
      body: JSON.stringify({ userId: 'u1', eventType: 'lesson_viewed' }),
    });
    expect(res.status).toBe(201);

    const stats = await fetch(`${baseUrl}/api/analytics/stats/user/u1`, { headers: auth('u1') });
    expect(stats.status).toBe(200);
    expect((await stats.json()).data.totalEvents).toBe(1);
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
