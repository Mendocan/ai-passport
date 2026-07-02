import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { encryptSection, decryptSection, deriveSectionKey } from '../src/crypto/cipher.js';
import { Passport } from '../src/core/passport.js';
import { Permission } from '../src/core/permission.js';
import { PassportManager } from '../src/core/passport-manager.js';
import { createDefaultPassport } from '../src/core/identity.js';
import type { SectionId } from '../src/types/passport.js';

describe('cipher', () => {
  it('encrypts and decrypts a section', () => {
    const masterKey = Buffer.alloc(32, 7);
    const payload = { display_name: 'Developer' };
    const blob = encryptSection(payload, 'identity', masterKey);
    const decrypted = decryptSection<typeof payload>(blob, 'identity', masterKey);
    assert.equal(decrypted.display_name, 'Developer');
  });

  it('uses different keys per section', () => {
    const masterKey = Buffer.alloc(32, 3);
    const sections: SectionId[] = ['identity', 'coding'];
    const keys = sections.map((section) => deriveSectionKey(masterKey, section).toString('hex'));
    assert.notEqual(keys[0], keys[1]);
  });
});

describe('permission', () => {
  it('exports only granted sections', () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-test-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const passport = Passport.fromDocument(createDefaultPassport());
    const permission = new Permission(tempHome);
    const grant = permission.grant({
      provider: 'test-consumer',
      sections: ['identity'],
      fields: { identity: ['display_name'] },
    });

    const context = permission.exportContext(passport, grant);
    assert.equal(context.provider, 'test-consumer');
    assert.equal(context.identity?.display_name, 'Developer');
    assert.equal(context.coding, undefined);

    fs.rmSync(tempHome, { recursive: true, force: true });
  });
});

describe('passport manager', () => {
  it('lists active grants and peeks export', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-mgr-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const manager = new PassportManager(tempHome);

    await manager.init({ force: true });
    await manager.grant({
      provider: 'cursor',
      sections: ['identity'],
      fields: { identity: ['display_name'] },
    });

    const grants = manager.listActiveGrants();
    assert.equal(grants.length, 1);
    assert.equal(grants[0]?.provider, 'cursor');

    const context = await manager.peekExport('cursor');
    assert.equal(context.identity?.display_name, 'Developer');

    fs.rmSync(tempHome, { recursive: true, force: true });
  });
});
