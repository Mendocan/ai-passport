import { applySyncBundle, createSyncBundle, localUpdatedAt } from './bundle.js';
import { readSyncConfig } from './config.js';
import { FileSyncStore } from './file-store.js';
import type { SyncPullResult, SyncPushResult, SyncStatusResult, SyncStore } from './types.js';

function resolveStore(target: string): SyncStore {
  return new FileSyncStore(target);
}

function resolveTarget(explicitTarget: string | undefined, home?: string): string {
  if (explicitTarget) {
    return explicitTarget;
  }

  const config = readSyncConfig(home);
  if (!config) {
    throw new Error('Sync target not configured. Use --target <dir> or `ai-passport sync config --target <dir>`.');
  }

  return config.target;
}

export class SyncManager {
  constructor(private readonly home?: string) {}

  async status(target?: string): Promise<SyncStatusResult> {
    const resolvedTarget = resolveTarget(target, this.home);
    const store = resolveStore(resolvedTarget);
    const local = localUpdatedAt(this.home);
    const remote = await store.remoteUpdatedAt();

    return {
      passport_id: local ? createSyncBundle(this.home).passport_id : undefined,
      local_updated_at: local,
      remote_updated_at: remote ?? undefined,
      in_sync: Boolean(local && remote && local === remote),
      target: resolvedTarget,
    };
  }

  async push(options: { target?: string; force?: boolean } = {}): Promise<SyncPushResult> {
    const bundle = createSyncBundle(this.home);
    const resolvedTarget = resolveTarget(options.target, this.home);
    const store = new FileSyncStore(resolvedTarget);

    if (options.force) {
      await store.pushForce(bundle);
    } else {
      await store.push(bundle);
    }

    return {
      passport_id: bundle.passport_id,
      updated_at: bundle.updated_at,
      target: resolvedTarget,
    };
  }

  async pull(options: { target?: string; force?: boolean } = {}): Promise<SyncPullResult> {
    const resolvedTarget = resolveTarget(options.target, this.home);
    const store = resolveStore(resolvedTarget);
    const bundle = await store.pull();

    if (!bundle) {
      throw new Error(`No sync bundle found at ${resolvedTarget}`);
    }

    applySyncBundle(bundle, this.home, options.force);

    return {
      passport_id: bundle.passport_id,
      updated_at: bundle.updated_at,
      target: resolvedTarget,
      applied: true,
    };
  }
}
