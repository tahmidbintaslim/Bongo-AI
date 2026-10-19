import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { createApp } from '../app';
import { loadConfig } from '../config';
import { ConfigError, parseCorsOrigins } from '../utils/env';

const ALLOWED = 'http://localhost:3000';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = createApp(loadConfig({ CORS_ORIGINS: ALLOWED }));
  server = await new Promise<Server>(resolve => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

const healthFrom = (origin: string) => fetch(`${baseUrl}/health`, { headers: { origin } });

describe('parseCorsOrigins', () => {
  it('reads a comma-separated list of exact origins', () => {
    expect(parseCorsOrigins(' http://localhost:3000 , https://app.example.com ,')).toEqual([
      'http://localhost:3000',
      'https://app.example.com',
    ]);
  });

  it('treats unset or empty as no cross-origin access', () => {
    expect(parseCorsOrigins(undefined)).toEqual([]);
    expect(parseCorsOrigins('')).toEqual([]);
  });

  it.each(['*', 'https://app.example.com/', 'https://app.example.com/path', 'localhost:3000'])(
    'rejects %s',
    entry => {
      expect(() => parseCorsOrigins(entry)).toThrow(ConfigError);
    }
  );
});

describe('gateway CORS', () => {
  it('echoes an allowed origin', async () => {
    const res = await healthFrom(ALLOWED);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });

  it('sends no CORS header to other origins', async () => {
    const res = await healthFrom('https://evil.example');
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('sends no CORS header to anyone when CORS_ORIGINS is empty', async () => {
    const closed = createApp(loadConfig({}));
    const closedServer = await new Promise<Server>(resolve => {
      const listening = closed.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const port = (closedServer.address() as AddressInfo).port;
    const res = await fetch(`http://127.0.0.1:${port}/health`, { headers: { origin: ALLOWED } });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
    await new Promise(resolve => closedServer.close(resolve));
  });
});
