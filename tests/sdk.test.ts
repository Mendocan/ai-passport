import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { AiPassport, Passport } from '../src/sdk/index.js';

describe('sdk', () => {
  it('Passport.load() returns passport data', async () => {
    const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-passport-sdk-'));
    const permissionsDir = path.join(tempHome, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    await AiPassport.create({ home: tempHome, force: true });
    await AiPassport.load({ home: tempHome }).then(async (sdk) => {
      const info = await sdk.info();
      assert.ok(info.passportId.startsWith('aip_'));

      const identity = await sdk.getSection('identity');
      assert.equal((identity as { display_name?: string }).display_name, 'Developer');
    });

    const viaAlias = await Passport.load({ home: tempHome });
    assert.equal((await viaAlias.read()).version, '1.0.0');

    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  it('load throws when passport missing', async () => {
    const missing = path.join(os.tmpdir(), `missing-sdk-${Date.now()}`);
    await assert.rejects(() => Passport.load({ home: missing }), /not found/);
  });
});
