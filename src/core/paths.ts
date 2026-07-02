import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const KEYCHAIN_SERVICE = 'ai-passport';

export function getPassportHome(customHome?: string): string {
  return customHome ?? path.join(os.homedir(), '.ai-passport');
}

export function getPassportPaths(home?: string) {
  const root = getPassportHome(home);

  return {
    root,
    passport: path.join(root, 'passport.json'),
    meta: path.join(root, 'passport.meta.json'),
    keysDir: path.join(root, 'keys'),
    keyRef: path.join(root, 'keys', 'master.keyref'),
    permissionsDir: path.join(root, 'permissions'),
    grants: path.join(root, 'permissions', 'grants.json'),
    auditDir: path.join(root, 'audit'),
    accessLog: path.join(root, 'audit', 'access.log'),
    pluginsDir: path.join(root, 'plugins'),
  };
}

export function ensurePassportDirs(home?: string): ReturnType<typeof getPassportPaths> {
  const paths = getPassportPaths(home);

  for (const dir of [
    paths.root,
    paths.keysDir,
    paths.permissionsDir,
    paths.auditDir,
    paths.pluginsDir,
  ]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return paths;
}

export function passportExists(home?: string): boolean {
  const paths = getPassportPaths(home);
  return fs.existsSync(paths.passport) && fs.existsSync(paths.meta);
}

export function getPackageRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
}

export function getSchemaPath(): string {
  return path.join(getPackageRoot(), 'schemas', 'passport.schema.json');
}

export function getExamplePassportPath(): string {
  return path.join(getPackageRoot(), 'schemas', 'examples', 'passport.example.json');
}
