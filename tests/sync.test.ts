import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { PassportManager } from '../src/core/passport-manager.js';
import { SyncManager } from '../src/core/sync/manager.js';
import { writeSyncConfig } from '../src/core/sync/config.js';
import type { SyncBundle } from '../src/core/sync/types.js';

describe('sync', () => {
  it('push and pull encrypted bundle without master key in remote', async () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-sync-home-'));
    const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-sync-remote-'));

    fs.mkdirSync(path.join(home, 'permissions'), { recursive: true });
    fs.writeFileSync(path.join(home, 'permissions', 'grants.json'), JSON.stringify({ grants: [] }));

    const manager = new PassportManager(home);
    await manager.init({ force: true });
    await manager.grant({ provider: 'cursor', sections: ['identity', 'coding'] }, 'Cursor');

    writeSyncConfig({ provider: 'file', target: remote }, home);
    const sync = new SyncManager(home);
    const pushResult = await sync.push();
    assert.ok(pushResult.passport_id.startsWith('aip_'));

    const remoteBundlePath = path.join(remote, 'bundle.json');
    assert.ok(fs.existsSync(remoteBundlePath));
    const bundleText = fs.readFileSync(remoteBundlePath, 'utf8');
    assert.ok(!bundleText.includes('master.key'));
    assert.ok(!bundleText.includes('"keys"'));

    fs.unlinkSync(path.join(home, 'passport.json'));
    fs.unlinkSync(path.join(home, 'passport.meta.json'));

    await sync.pull();

    const info = await manager.info();
    assert.equal(info.passportId, pushResult.passport_id);
    assert.equal(info.permissions, 1);

    const status = await sync.status();
    assert.equal(status.in_sync, true);

    fs.rmSync(home, { recursive: true, force: true });
    fs.rmSync(remote, { recursive: true, force: true });
  });

  it('rejects push when remote is newer', async () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-sync-newer-'));
    const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-sync-remote-newer-'));
    fs.mkdirSync(path.join(home, 'permissions'), { recursive: true });
    fs.writeFileSync(path.join(home, 'permissions', 'grants.json'), JSON.stringify({ grants: [] }));

    const manager = new PassportManager(home);
    await manager.init({ force: true });

    const sync = new SyncManager(home);
    await sync.push({ target: remote });

    const bundlePath = path.join(remote, 'bundle.json');
    const remoteBundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8')) as SyncBundle;
    remoteBundle.updated_at = '2099-01-01T00:00:00.000Z';
    remoteBundle.meta.updated_at = '2099-01-01T00:00:00.000Z';
    fs.writeFileSync(bundlePath, JSON.stringify(remoteBundle, null, 2));

    await assert.rejects(() => sync.push({ target: remote }), /Remote copy is newer/);

    fs.rmSync(home, { recursive: true, force: true });
    fs.rmSync(remote, { recursive: true, force: true });
  });
});
