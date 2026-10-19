import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Server } from 'http';
import { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { loadConfig } from '../config';
import { ConfigError } from '../utils/env';

const SECRET = 'ai-service-test-secret-0123456789abcdef';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = createApp(loadConfig({ JWT_SECRET: SECRET }));
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
