import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import {
  AuthTokenStore,
  TOKEN_PREFIX,
  deliverTokenToCallback,
  isLocalCallbackUrl,
} from '../src/core/auth-token.js';
import { PassportManager } from '../src/core/passport-manager.js';
import type { PassportContext } from '../src/core/permission.js';

function sampleContext(clientId: string): PassportContext {
  return {
    passport_version: '1.0.0',
    exported_at: new Date().toISOString(),
    provider: clientId,
    grant_id: 'grant_test',
    identity: { display_name: 'Developer' },
  };
}

describe('auth token', () => {
  it('issues and exchanges a one-time token', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-auth-'));
    const store = new AuthTokenStore(home);

    const record = store.issueToken('my-app', 'grant_my-app_abc', 'aip_test', sampleContext('my-app'), {
      ttlSeconds: 3600,
      oneTime: true,
    });

    assert.ok(record.id.startsWith(TOKEN_PREFIX));

    const summary = store.inspectToken(record.id);
    assert.equal(summary.usable, true);
    assert.equal(summary.client_id, 'my-app');

    const context = store.exchangeToken(record.id);
    assert.equal(context.identity?.display_name, 'Developer');

    assert.throws(() => store.exchangeToken(record.id), /already used/);
    assert.equal(store.inspectToken(record.id).usable, false);

    fs.rmSync(home, { recursive: true, force: true });
  });

  it('allows reusable tokens until expiry', () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-auth-'));
    const store = new AuthTokenStore(home);

    const record = store.issueToken('my-app', 'grant_x', 'aip_test', sampleContext('my-app'), {
      ttlSeconds: 3600,
      oneTime: false,
    });

    store.exchangeToken(record.id);
    const context = store.exchangeToken(record.id);
    assert.equal(context.provider, 'my-app');

    fs.rmSync(home, { recursive: true, force: true });
  });

  it('authorize flow creates token via PassportManager', async () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-auth-mgr-'));
    const permissionsDir = path.join(home, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const manager = new PassportManager(home);
    await manager.init({ force: true });
    await manager.grant({ provider: 'my-app', sections: ['identity'] }, 'My App');

    const result = await manager.authorize('my-app', { ttlSeconds: 120 });
    assert.ok(result.token.startsWith(TOKEN_PREFIX));

    const context = manager.exchangeToken(result.token);
    assert.equal(context.identity?.display_name, 'Developer');

    fs.rmSync(home, { recursive: true, force: true });
  });

  it('revoke removes outstanding tokens for client', async () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-auth-revoke-'));
    const permissionsDir = path.join(home, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const manager = new PassportManager(home);
    await manager.init({ force: true });
    await manager.grant({ provider: 'my-app', sections: ['identity'] }, 'My App');
    const result = await manager.authorize('my-app');

    manager.revoke('my-app');
    assert.throws(() => manager.exchangeToken(result.token), /not found/);

    fs.rmSync(home, { recursive: true, force: true });
  });

  it('validates localhost callback URLs', () => {
    assert.equal(isLocalCallbackUrl('http://127.0.0.1:3847/callback'), true);
    assert.equal(isLocalCallbackUrl('http://localhost:3000/callback'), true);
    assert.equal(isLocalCallbackUrl('https://evil.example/callback'), false);
  });
});

describe('auth token callback', () => {
  it('delivers token to localhost callback', async () => {
    const { createServer } = await import('node:http');

    const received = await new Promise<string>((resolve, reject) => {
      const server = createServer((req, res) => {
        const url = new URL(req.url ?? '/', 'http://127.0.0.1');
        res.writeHead(200);
        res.end('ok');
        server.close();
        resolve(url.searchParams.get('token') ?? '');
      });

      server.listen(0, '127.0.0.1', async () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          reject(new Error('No server address'));
          return;
        }

        try {
          await deliverTokenToCallback(
            `http://127.0.0.1:${address.port}/callback`,
            `${TOKEN_PREFIX}test123`,
          );
        } catch (error) {
          server.close();
          reject(error);
        }
      });
    });

    assert.equal(received, `${TOKEN_PREFIX}test123`);
  });
});
