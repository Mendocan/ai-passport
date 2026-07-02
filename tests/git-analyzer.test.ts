import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { analyzeRepository } from '../src/plugins/git/analyzer.js';

describe('git analyzer', () => {
  it('detects TypeScript and frameworks in ai-passport repo', () => {
    const repoPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const result = analyzeRepository({ repoPath, maxFiles: 300 });

    assert.ok(result.coding.primary_languages?.includes('TypeScript'));
    assert.ok(result.coding.frameworks?.includes('TypeScript'));
    assert.equal(result.coding.detected_from?.source, 'git');
    assert.equal(result.project.repo_root, repoPath);
  });
});
