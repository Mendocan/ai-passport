import fs from 'node:fs';

import { ensurePassportDirs, getPassportPaths } from '../paths.js';
import { LOCAL_VAULT_ID } from './local-vault.js';
import type { MemoryProvidersFile } from './types.js';

export function readProvidersFile(home?: string): MemoryProvidersFile | null {
  const paths = getPassportPaths(home);
  if (!fs.existsSync(paths.memoryProviders)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(paths.memoryProviders, 'utf8')) as MemoryProvidersFile;
}

export function writeProvidersFile(file: MemoryProvidersFile, home?: string): void {
  const paths = ensurePassportDirs(home);
  fs.mkdirSync(paths.memoryDir, { recursive: true });
  fs.writeFileSync(paths.memoryProviders, JSON.stringify(file, null, 2), 'utf8');
}

export function defaultProvidersFile(): MemoryProvidersFile {
  const now = new Date().toISOString();

  return {
    default_provider: LOCAL_VAULT_ID,
    providers: [
      {
        id: LOCAL_VAULT_ID,
        type: 'local-vault',
        enabled: true,
        registered_at: now,
      },
    ],
  };
}
