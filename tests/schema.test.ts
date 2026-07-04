import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import { createDefaultPassport } from '../src/core/identity.js';
import { getExamplePassportPath, getPackageRoot } from '../src/core/paths.js';
import { assertValidPassport, validatePassport } from '../src/schema/validator.js';
import type { PassportDocument } from '../src/types/passport.js';

function loadFixture(name: string): PassportDocument {
  const fixturePath = path.join(getPackageRoot(), 'schemas', 'fixtures', name);
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as PassportDocument;
}

describe('schema validation', () => {
  it('accepts the example passport', () => {
    const example = JSON.parse(fs.readFileSync(getExamplePassportPath(), 'utf8')) as PassportDocument;
    const result = validatePassport(example);
    assert.equal(result.valid, true, result.errors.join('; '));
  });

  it('accepts the v1.0.0 minimal fixture', () => {
    const minimal = loadFixture('passport.v1.0.0.minimal.json');
    assert.doesNotThrow(() => assertValidPassport(minimal));
  });

  it('accepts createDefaultPassport()', () => {
    const document = createDefaultPassport();
    const result = validatePassport(document);
    assert.equal(result.valid, true, result.errors.join('; '));
    assert.equal(document.version, '1.0.0');
  });

  it('rejects missing version', () => {
    const document = createDefaultPassport();
    const { version: _removed, ...rest } = document;
    const result = validatePassport(rest as PassportDocument);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes('version') || error.includes('required')));
  });

  it('rejects unknown top-level properties', () => {
    const document = {
      ...createDefaultPassport(),
      unexpected_field: true,
    } as PassportDocument & { unexpected_field: boolean };

    const result = validatePassport(document);
    assert.equal(result.valid, false);
  });

  it('rejects invalid communication_style enum', () => {
    const document = createDefaultPassport();
    document.preferences.communication_style = 'verbose' as 'concise';

    const result = validatePassport(document);
    assert.equal(result.valid, false);
  });
});

describe('backward compatibility', () => {
  it('keeps v1.0.0 semver pattern stable', () => {
    const documents = [
      JSON.parse(fs.readFileSync(getExamplePassportPath(), 'utf8')) as PassportDocument,
      loadFixture('passport.v1.0.0.minimal.json'),
      createDefaultPassport(),
    ];

    for (const document of documents) {
      assert.match(document.version, /^\d+\.\d+\.\d+$/);
      assert.equal(document.version.split('.')[0], '1');
    }
  });

  it('validates all fixtures in schemas/fixtures/', () => {
    const fixturesDir = path.join(getPackageRoot(), 'schemas', 'fixtures');
    const files = fs.readdirSync(fixturesDir).filter((file) => file.endsWith('.json'));

    assert.ok(files.length > 0);

    for (const file of files) {
      const document = JSON.parse(fs.readFileSync(path.join(fixturesDir, file), 'utf8')) as PassportDocument;
      const result = validatePassport(document);
      assert.equal(result.valid, true, `${file}: ${result.errors.join('; ')}`);
    }
  });
});
