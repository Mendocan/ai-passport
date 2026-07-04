import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { encryptSection, decryptSection } from '../src/crypto/cipher.js';
import { Passport } from '../src/core/passport.js';
import { Permission } from '../src/core/permission.js';
import { createDefaultPassport } from '../src/core/identity.js';
import type { EncryptedSectionBlob } from '../src/types/passport.js';

describe('cipher integrity', () => {
  it('rejects tampered ciphertext', () => {
    const masterKey = Buffer.alloc(32, 9);
    const blob = encryptSection({ display_name: 'Dev' }, 'identity', masterKey);
    const combined = Buffer.from(blob.ciphertext, 'base64');
    combined[0] = combined[0]! ^ 0xff;
    const tampered: EncryptedSectionBlob = {
      ...blob,
      ciphertext: combined.toString('base64'),
    };

    assert.throws(
      () => decryptSection(tampered, 'identity', masterKey),
      /Unsupported state|unable to authenticate/,
    );
  });

  it('rejects wrong section key', () => {
    const masterKey = Buffer.alloc(32, 4);
    const blob = encryptSection({ display_name: 'Dev' }, 'identity', masterKey);
    assert.throws(() => decryptSection(blob, 'coding', masterKey));
  });
});

describe('permission field filters', () => {
  it('filters identity fields per grant', () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-fields-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const document = createDefaultPassport();
    document.identity.role = 'Engineer';
    document.identity.bio = 'Secret bio';

    const permission = new Permission(tempHome);
    const grant = permission.grant({
      provider: 'filtered-app',
      sections: ['identity'],
      fields: { identity: ['display_name'] },
    });

    const context = permission.exportContext(Passport.fromDocument(document), grant);
    assert.equal(context.identity?.display_name, 'Developer');
    assert.equal(context.identity?.role, undefined);
    assert.equal(context.identity?.bio, undefined);

    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  it('filters active projects only', () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-projects-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const document = createDefaultPassport();
    document.projects = [
      { name: 'Active', status: 'active', stack: ['TS'] },
      { name: 'Archived', status: 'archived', stack: ['Python'] },
    ];

    const permission = new Permission(tempHome);
    const grant = permission.grant({
      provider: 'proj-app',
      sections: ['projects'],
      project_filter: 'active_only',
      fields: { projects: ['name', 'stack'] },
    });

    const context = permission.exportContext(Passport.fromDocument(document), grant);
    assert.equal(context.projects?.length, 1);
    assert.equal(context.projects?.[0]?.name, 'Active');

    fs.rmSync(tempHome, { recursive: true, force: true });
  });
});
