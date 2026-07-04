import fs from 'node:fs';

import { ensurePassportDirs, getPassportPaths } from '../paths.js';
import type { SyncConfig } from './types.js';

export function getSyncConfigPath(home?: string): string {
  return getPassportPaths(home).syncConfig;
}

export function readSyncConfig(home?: string): SyncConfig | null {
  const configPath = getSyncConfigPath(home);
  if (!fs.existsSync(configPath)) {
    return null;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as SyncConfig;
  if (config.provider !== 'file' || !config.target) {
    throw new Error('Invalid sync config. Expected { "provider": "file", "target": "..." }');
  }

  return config;
}

export function writeSyncConfig(config: SyncConfig, home?: string): void {
  ensurePassportDirs(home);
  fs.writeFileSync(getSyncConfigPath(home), JSON.stringify(config, null, 2), 'utf8');
}
