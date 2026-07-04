import fs from 'node:fs';
import path from 'node:path';

import type { SyncBundle, SyncStore } from './types.js';

const BUNDLE_FILE = 'bundle.json';

export class FileSyncStore implements SyncStore {
  constructor(private readonly targetDir: string) {}

  async push(bundle: SyncBundle): Promise<{ updated_at: string }> {
    fs.mkdirSync(this.targetDir, { recursive: true });
    const bundlePath = path.join(this.targetDir, BUNDLE_FILE);

    if (fs.existsSync(bundlePath)) {
      const existing = JSON.parse(fs.readFileSync(bundlePath, 'utf8')) as SyncBundle;
      if (existing.updated_at > bundle.updated_at) {
        throw new Error(
          `Remote copy is newer (${existing.updated_at}). Push would overwrite — use --force if intended.`,
        );
      }
    }

    fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2), 'utf8');
    return { updated_at: bundle.updated_at };
  }

  async pushForce(bundle: SyncBundle): Promise<{ updated_at: string }> {
    fs.mkdirSync(this.targetDir, { recursive: true });
    fs.writeFileSync(path.join(this.targetDir, BUNDLE_FILE), JSON.stringify(bundle, null, 2), 'utf8');
    return { updated_at: bundle.updated_at };
  }

  async pull(): Promise<SyncBundle | null> {
    const bundlePath = path.join(this.targetDir, BUNDLE_FILE);
    if (!fs.existsSync(bundlePath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(bundlePath, 'utf8')) as SyncBundle;
  }

  async remoteUpdatedAt(): Promise<string | null> {
    const bundle = await this.pull();
    return bundle?.updated_at ?? null;
  }
}
