import fs from 'node:fs';

import type { EncryptedPassportEnvelope, GrantsFile, PassportMeta } from '../../types/passport.js';
import { getPassportPaths, passportExists } from '../paths.js';
import { SYNC_BUNDLE_FORMAT, type SyncBundle } from './types.js';

export function createSyncBundle(home?: string): SyncBundle {
  if (!passportExists(home)) {
    throw new Error('Passport not found. Run `ai-passport init` first.');
  }

  const paths = getPassportPaths(home);
  const passport = JSON.parse(fs.readFileSync(paths.passport, 'utf8')) as EncryptedPassportEnvelope;
  const meta = JSON.parse(fs.readFileSync(paths.meta, 'utf8')) as PassportMeta;

  let grants: GrantsFile | undefined;
  if (fs.existsSync(paths.grants)) {
    grants = JSON.parse(fs.readFileSync(paths.grants, 'utf8')) as GrantsFile;
  }

  return {
    format: SYNC_BUNDLE_FORMAT,
    passport_id: meta.passport_id,
    updated_at: meta.updated_at,
    passport,
    meta,
    grants,
  };
}

export function applySyncBundle(bundle: SyncBundle, home?: string, force = false): void {
  if (bundle.format !== SYNC_BUNDLE_FORMAT) {
    throw new Error(`Unsupported sync bundle format: ${bundle.format}`);
  }

  const paths = getPassportPaths(home);
  const localExists = passportExists(home);

  if (localExists && !force) {
    const localMeta = JSON.parse(fs.readFileSync(paths.meta, 'utf8')) as PassportMeta;
    if (localMeta.passport_id !== bundle.passport_id) {
      throw new Error(
        `Passport id mismatch (local ${localMeta.passport_id}, remote ${bundle.passport_id}). Use --force to replace.`,
      );
    }
    if (localMeta.updated_at > bundle.updated_at) {
      throw new Error(
        `Local passport is newer (${localMeta.updated_at}). Pull would overwrite — use --force if intended.`,
      );
    }
  }

  fs.mkdirSync(paths.root, { recursive: true });
  fs.mkdirSync(paths.permissionsDir, { recursive: true });

  fs.writeFileSync(paths.passport, JSON.stringify(bundle.passport, null, 2), 'utf8');
  fs.writeFileSync(paths.meta, JSON.stringify(bundle.meta, null, 2), 'utf8');

  if (bundle.grants) {
    fs.writeFileSync(paths.grants, JSON.stringify(bundle.grants, null, 2), 'utf8');
  }
}

export function localUpdatedAt(home?: string): string | undefined {
  if (!passportExists(home)) {
    return undefined;
  }

  const meta = JSON.parse(fs.readFileSync(getPassportPaths(home).meta, 'utf8')) as PassportMeta;
  return meta.updated_at;
}
