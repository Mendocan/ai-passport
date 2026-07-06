import fs from 'node:fs';
import path from 'node:path';

import { getPassportPaths } from '../paths.js';
import type {
  MemoryExcerpt,
  MemoryProvider,
  MemoryProviderStatus,
  MemoryQuery,
  MemoryRecord,
  MemoryRecordRef,
  MemoryStoreInput,
  MemoryVaultMeta,
} from './types.js';

export const LOCAL_VAULT_ID = 'local-vault';
export const LOCAL_VAULT_VERSION = '0.1.0';

export class LocalVaultProvider implements MemoryProvider {
  readonly id = LOCAL_VAULT_ID;
  readonly version = LOCAL_VAULT_VERSION;

  constructor(private readonly home?: string) {}

  async status(): Promise<MemoryProviderStatus> {
    const paths = getPassportPaths(this.home);
    const ready = fs.existsSync(paths.localVaultMeta);
    const meta = ready ? this.readMeta() : null;

    return {
      id: this.id,
      version: this.version,
      ready,
      record_count: meta?.record_count ?? 0,
      storage_path: paths.localVault,
    };
  }

  async query(input: MemoryQuery): Promise<MemoryExcerpt> {
    const status = await this.status();
    if (!status.ready) {
      throw new Error('Local memory vault not initialized. Run `ai-passport memory init`.');
    }

    const limit = input.limit ?? 50;
    const recordsDir = getPassportPaths(this.home).localVaultRecords;
    const files = fs.existsSync(recordsDir)
      ? fs.readdirSync(recordsDir).filter((name) => name.endsWith('.json'))
      : [];

    const records = files
      .map((file) => {
        const raw = JSON.parse(fs.readFileSync(path.join(recordsDir, file), 'utf8')) as {
          namespace: string;
        };
        return raw;
      })
      .filter((record) => input.namespaces.includes(record.namespace as MemoryQuery['namespaces'][number]))
      .slice(0, limit);

    return {
      records: records as MemoryExcerpt['records'],
      truncated: files.length > limit,
    };
  }

  async store(input: MemoryStoreInput): Promise<MemoryRecordRef> {
    const status = await this.status();
    if (!status.ready) {
      throw new Error('Local memory vault not initialized. Run `ai-passport memory init`.');
    }

    const paths = getPassportPaths(this.home);
    const now = new Date().toISOString();
    const id = `mem_${input.namespace}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    const record: MemoryRecord = {
      id,
      namespace: input.namespace,
      content: input.content,
      confidence: input.confidence,
      sources: input.sources,
      created_at: now,
      updated_at: now,
    };

    fs.writeFileSync(
      path.join(paths.localVaultRecords, `${id}.json`),
      JSON.stringify(record, null, 2),
      'utf8',
    );

    const meta = this.readMeta();
    meta.record_count += 1;
    meta.updated_at = now;
    fs.writeFileSync(paths.localVaultMeta, JSON.stringify(meta, null, 2), 'utf8');

    return { id, namespace: input.namespace };
  }

  initialize(): MemoryVaultMeta {
    const paths = getPassportPaths(this.home);
    fs.mkdirSync(paths.localVaultRecords, { recursive: true });

    const now = new Date().toISOString();
    const existing = fs.existsSync(paths.localVaultMeta)
      ? this.readMeta()
      : null;

    const meta: MemoryVaultMeta = {
      provider_id: this.id,
      version: this.version,
      created_at: existing?.created_at ?? now,
      updated_at: now,
      record_count: existing?.record_count ?? 0,
    };

    fs.writeFileSync(paths.localVaultMeta, JSON.stringify(meta, null, 2), 'utf8');
    return meta;
  }

  private readMeta(): MemoryVaultMeta {
    const paths = getPassportPaths(this.home);
    return JSON.parse(fs.readFileSync(paths.localVaultMeta, 'utf8')) as MemoryVaultMeta;
  }
}
