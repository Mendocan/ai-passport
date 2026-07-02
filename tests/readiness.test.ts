import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { getPassportReadiness } from '../src/core/readiness.js';
import { PassportManager } from '../src/core/passport-manager.js';

describe('readiness', () => {
  it('reports not ready when passport missing', async () => {
    const home = path.join(os.tmpdir(), `readiness-missing-${Date.now()}`);
    const status = await getPassportReadiness('cursor', home);

    assert.equal(status.ready, false);
    assert.equal(status.exists, false);
    assert.equal(status.consumer_grant, false);
    assert.ok(status.next_steps.some((step) => step.includes('init')));

    fs.rmSync(home, { recursive: true, force: true });
  });

  it('reports ready after init and grant', async () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), 'readiness-ready-'));
    const permissionsDir = path.join(home, 'permissions');
    fs.mkdirSync(permissionsDir, { recursive: true });
    fs.writeFileSync(path.join(permissionsDir, 'grants.json'), JSON.stringify({ grants: [] }));

    const manager = new PassportManager(home);
    await manager.init({ force: true });
    await manager.grant({ provider: 'cursor', sections: ['identity', 'coding', 'projects'] }, 'Cursor');

    const status = await getPassportReadiness('cursor', home);

    assert.equal(status.ready, true);
    assert.equal(status.consumer_grant, true);
    assert.ok(status.passport_id?.startsWith('aip_'));
    assert.deepEqual(status.mcp_config.mcpServers['ai-passport'].args, [
      'mcp',
      'serve',
      '--consumer',
      'cursor',
    ]);

    fs.rmSync(home, { recursive: true, force: true });
  });
});
