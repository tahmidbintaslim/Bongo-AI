import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Server } from 'http';
import { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { loadConfig } from '../config';
import { ConfigError } from '../utils/env';

const SECRET = 'content-service-test-secret-0123456789abcdef';

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

const auth = (userId: string) => ({
  authorization: `Bearer ${jwt.sign({ userId }, SECRET, { expiresIn: '5m' })}`,
});

const lesson = {
  title: 'গণিত শিক্ষা',
  body: 'এটি একটি গণিত পাঠ',
  category: 'mathematics',
  language: 'bn',
};

describe('loadConfig', () => {
  it('refuses to start without JWT_SECRET', () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
  });
});

describe('/api/content authentication', () => {
  it('rejects reads and writes without a token', async () => {
    expect((await fetch(`${baseUrl}/api/content`)).status).toBe(401);
    const res = await fetch(`${baseUrl}/api/content`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(lesson),
    });
    expect(res.status).toBe(401);
  });

  it('creates content as the token user and lists it', async () => {
    const res = await fetch(`${baseUrl}/api/content`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...auth('teacher-1') },
      body: JSON.stringify(lesson),
    });
    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.data.createdBy).toBe('teacher-1');

    const list = await fetch(`${baseUrl}/api/content`, { headers: auth('student-1') });
    expect(list.status).toBe(200);
    expect((await list.json()).data).toHaveLength(1);
  });
});
