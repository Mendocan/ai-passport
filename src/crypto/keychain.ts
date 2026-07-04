import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

import keytar from 'keytar';

import { KEYCHAIN_SERVICE, getPassportPaths, getPassportHome } from '../core/paths.js';

const LEGACY_KEYCHAIN_ACCOUNT = 'master';

function preferFileKeyStorage(): boolean {
  return process.env.AI_PASSPORT_KEY_FILE === '1';
}

function storeMasterKeyFile(encoded: string, home?: string, account?: string): void {
  const paths = getPassportPaths(home);
  fs.mkdirSync(paths.keysDir, { recursive: true });
  fs.writeFileSync(getMasterKeyFile(home), encoded, { encoding: 'utf8', mode: 0o600 });
  writeKeyRef(home, 'file-fallback', account ?? getKeychainAccount(home));
}

function getKeychainAccount(home?: string): string {
  const passportHome = getPassportHome(home);
  const hash = createHash('sha256').update(passportHome).digest('hex').slice(0, 16);
  return `master-${hash}`;
}

function getMasterKeyFile(home?: string): string {
  return path.join(getPassportPaths(home).keysDir, 'master.key');
}

export async function hasMasterKey(home?: string): Promise<boolean> {
  if (preferFileKeyStorage()) {
    return fs.existsSync(getMasterKeyFile(home));
  }

  const account = getKeychainAccount(home);
  const stored = await keytar.getPassword(KEYCHAIN_SERVICE, account);
  if (stored) {
    return true;
  }

  const legacy = await keytar.getPassword(KEYCHAIN_SERVICE, LEGACY_KEYCHAIN_ACCOUNT);
  if (legacy && !home) {
    return true;
  }

  return fs.existsSync(getMasterKeyFile(home));
}

export async function loadMasterKey(home?: string): Promise<Buffer> {
  const keyFile = getMasterKeyFile(home);
  if (preferFileKeyStorage() || fs.existsSync(keyFile)) {
    if (fs.existsSync(keyFile)) {
      const encoded = fs.readFileSync(keyFile, 'utf8').trim();
      return Buffer.from(encoded, 'base64');
    }
    if (preferFileKeyStorage()) {
      throw new Error('Master key not found. Run `ai-passport init` first.');
    }
  }

  const account = getKeychainAccount(home);
  const fromKeychain = await keytar.getPassword(KEYCHAIN_SERVICE, account);
  if (fromKeychain) {
    return Buffer.from(fromKeychain, 'base64');
  }

  if (!home) {
    const legacy = await keytar.getPassword(KEYCHAIN_SERVICE, LEGACY_KEYCHAIN_ACCOUNT);
    if (legacy) {
      return Buffer.from(legacy, 'base64');
    }
  }

  if (fs.existsSync(keyFile)) {
    const encoded = fs.readFileSync(keyFile, 'utf8').trim();
    return Buffer.from(encoded, 'base64');
  }

  throw new Error('Master key not found. Run `ai-passport init` first.');
}

export async function storeMasterKey(masterKey: Buffer, home?: string): Promise<void> {
  const encoded = masterKey.toString('base64');
  const account = getKeychainAccount(home);

  if (preferFileKeyStorage()) {
    storeMasterKeyFile(encoded, home, account);
    return;
  }

  try {
    await keytar.setPassword(KEYCHAIN_SERVICE, account, encoded);
    if (!home) {
      await keytar.deletePassword(KEYCHAIN_SERVICE, LEGACY_KEYCHAIN_ACCOUNT).catch(() => undefined);
    }
    writeKeyRef(home, 'os-keychain', account);
    return;
  } catch {
    storeMasterKeyFile(encoded, home, account);
  }
}

function writeKeyRef(
  home: string | undefined,
  storage: 'os-keychain' | 'file-fallback',
  account: string,
): void {
  const paths = getPassportPaths(home);
  fs.mkdirSync(paths.keysDir, { recursive: true });
  fs.writeFileSync(
    paths.keyRef,
    JSON.stringify(
      {
        storage,
        service: KEYCHAIN_SERVICE,
        account,
        updated_at: new Date().toISOString(),
      },
      null,
      2,
    ),
    { encoding: 'utf8', mode: 0o600 },
  );
}

export async function getKeyStorageKind(home?: string): Promise<'os-keychain' | 'file-fallback' | 'missing'> {
  if (preferFileKeyStorage()) {
    return fs.existsSync(getMasterKeyFile(home)) ? 'file-fallback' : 'missing';
  }

  const keyRef = getPassportPaths(home).keyRef;
  if (!fs.existsSync(keyRef)) {
    const account = getKeychainAccount(home);
    return (await keytar.getPassword(KEYCHAIN_SERVICE, account)) ? 'os-keychain' : 'missing';
  }

  try {
    const ref = JSON.parse(fs.readFileSync(keyRef, 'utf8')) as { storage?: string };
    return ref.storage === 'file-fallback' ? 'file-fallback' : 'os-keychain';
  } catch {
    return fs.existsSync(getMasterKeyFile(home)) ? 'file-fallback' : 'missing';
  }
}
