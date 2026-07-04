import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

describe('sdk package (@ai-passport-core/sdk)', () => {
  it('built package exports Passport.load()', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-sdk-pkg-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const { Passport } = await import('../packages/sdk/dist/sdk/index.js');

    await Passport.create({ home: tempHome, force: true });
    const passport = await Passport.load({ home: tempHome });
    const info = await passport.info();
    assert.ok(info.passportId.startsWith('aip_'));

    fs.rmSync(tempHome, { recursive: true, force: true });
  });
});
