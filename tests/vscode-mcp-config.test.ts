import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildAiPassportServer, mergeMcpConfig } from '../extensions/vscode/src/mcp-config.js';

describe('vscode mcp config', () => {
  it('builds stdio server for global cli', () => {
    const server = buildAiPassportServer('ai-passport', 'vscode');
    assert.equal(server.type, 'stdio');
    assert.equal(server.command, 'ai-passport');
    assert.deepEqual(server.args, ['mcp', 'serve', '--consumer', 'vscode']);
  });

  it('builds node server for local dev cli path', () => {
    const server = buildAiPassportServer('C:\\repo\\dist\\index.js', 'vscode');
    assert.equal(server.command, 'node');
    assert.equal(server.args[0], 'C:\\repo\\dist\\index.js');
  });

  it('merges into existing mcp.json without dropping other servers', () => {
    const merged = mergeMcpConfig(
      { servers: { other: { type: 'stdio', command: 'echo', args: [] } } },
      buildAiPassportServer('ai-passport', 'vscode'),
    );
    assert.ok(merged.servers?.other);
    assert.ok(merged.servers?.['ai-passport']);
  });
});
