import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { MemoryManager } from '../src/core/memory/manager.js';
import { MemoryService } from '../src/core/memory/service.js';
import { Permission } from '../src/core/permission.js';
import { Passport } from '../src/core/passport.js';
import { PassportManager } from '../src/core/passport-manager.js';
import { createDefaultPassport } from '../src/core/identity.js';

describe('memory provider (RFC 0007 prototype)', () => {
  it('initializes local vault and reports status', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-memory-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const manager = new MemoryManager(tempHome);
    const init = await manager.init();

    assert.equal(init.provider, 'local-vault');
    assert.ok(fs.existsSync(path.join(tempHome, 'memory', 'local-vault', 'vault.meta.json')));

    const status = await manager.status();
    assert.equal(status.enabled, true);
    assert.equal(status.default_provider, 'local-vault');
    assert.equal(status.providers[0]?.ready, true);
    assert.equal(status.providers[0]?.record_count, 0);

    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  it('persists memory grant and enriches export context', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-memory-grant-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const memoryManager = new MemoryManager(tempHome);
    await memoryManager.init();

    const passportManager = new PassportManager(tempHome);
    await passportManager.init({ force: true });
    await passportManager.grant({
      provider: 'cursor',
      sections: ['identity'],
      memory: {
        provider_id: 'local-vault',
        namespaces: ['preferences', 'projects'],
        mode: 'read',
      },
    });

    const context = await passportManager.peekExport('cursor');
    assert.equal(context.memory?.provider, 'local-vault');
    assert.deepEqual(context.memory?.excerpt.records, []);

    const permission = new Permission(tempHome);
    const grant = permission.getActiveGrantForProvider('cursor');
    assert.ok(grant?.memory);
    assert.equal(grant.memory.namespaces.join(','), 'preferences,projects');

    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  it('leaves export unchanged when grant has no memory', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-memory-none-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const passport = Passport.fromDocument(createDefaultPassport());
    const permission = new Permission(tempHome);
    const grant = permission.grant({
      provider: 'test',
      sections: ['identity'],
    });

    const service = new MemoryService(tempHome);
    const context = await service.enrichContext(permission.exportContext(passport, grant), grant);

    assert.equal(context.memory, undefined);

    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  it('stores a record and returns it in a scoped query', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-memory-store-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const memoryManager = new MemoryManager(tempHome);
    await memoryManager.init();

    const ref = await memoryManager.store({
      namespace: 'preferences',
      content: { fact: 'User prefers vertical video' },
      confidence: 0.99,
      sources: 17,
    });

    assert.match(ref.id, /^mem_preferences_/);

    const statusAfterStore = await memoryManager.status();
    assert.equal(statusAfterStore.providers[0]?.record_count, 1);

    const passportManager = new PassportManager(tempHome);
    await passportManager.init({ force: true });
    await passportManager.grant({
      provider: 'cursor',
      sections: ['identity'],
      memory: {
        provider_id: 'local-vault',
        namespaces: ['preferences', 'projects'],
        mode: 'read',
      },
    });

    const excerpt = await passportManager.queryMemory('cursor', ['preferences']);
    assert.equal(excerpt.records.length, 1);
    assert.equal(excerpt.records[0]?.id, ref.id);
    assert.equal(excerpt.records[0]?.confidence, 0.99);

    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  it('rejects memory query for namespaces outside the grant', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-memory-scope-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const memoryManager = new MemoryManager(tempHome);
    await memoryManager.init();

    const passportManager = new PassportManager(tempHome);
    await passportManager.init({ force: true });
    await passportManager.grant({
      provider: 'cursor',
      sections: ['identity'],
      memory: {
        provider_id: 'local-vault',
        namespaces: ['preferences'],
        mode: 'read',
      },
    });

    await assert.rejects(() => passportManager.queryMemory('cursor', ['knowledge']));

    fs.rmSync(tempHome, { recursive: true, force: true });
  });
});
