import fs from 'node:fs';
import path from 'node:path';

import { withEffectiveConfidence } from './confidence.js';
import { getPassportPaths } from '../paths.js';
import type {
  GraphEdge,
  GraphExcerpt,
  GraphQuery,
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
export const LOCAL_VAULT_VERSION = '0.2.0';

interface GraphStore {
  edges: GraphEdge[];
}

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
    const minConfidence = input.min_confidence ?? 0;
    const sort = input.sort ?? 'confidence';
    const allRecords = this.loadRecords(input.namespaces);

    let records = allRecords
      .map((record) => withEffectiveConfidence(record))
      .filter((record) => (record.effective_confidence ?? 0) >= minConfidence);

    if (sort === 'confidence') {
      records.sort(
        (a, b) => (b.effective_confidence ?? 0) - (a.effective_confidence ?? 0),
      );
    } else {
      records.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    }

    const truncated = records.length > limit;
    return {
      records: records.slice(0, limit),
      truncated,
    };
  }

  async graph(input: GraphQuery): Promise<GraphExcerpt> {
    const status = await this.status();
    if (!status.ready) {
      throw new Error('Local memory vault not initialized. Run `ai-passport memory init`.');
    }

    const limit = input.limit ?? 50;
    const store = this.readGraphStore();
    let edges = [...store.edges];

    if (input.root_id) {
      edges = edges.filter(
        (edge) => edge.from_id === input.root_id || edge.to_id === input.root_id,
      );
    }

    if (input.relation) {
      edges = edges.filter((edge) => edge.relation === input.relation);
    }

    edges = edges.slice(0, limit);

    const nodeIds = new Set<string>();
    for (const edge of edges) {
      nodeIds.add(edge.from_id);
      nodeIds.add(edge.to_id);
    }

    const nodes = [...nodeIds]
      .map((id) => this.loadRecordById(id))
      .filter((record): record is MemoryRecord => record !== null)
      .map((record) => withEffectiveConfidence(record));

    return { nodes, edges };
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
      verified_at: now,
      created_at: now,
      updated_at: now,
    };

    this.writeRecord(record);

    const meta = this.readMeta();
    meta.record_count += 1;
    meta.updated_at = now;
    fs.writeFileSync(paths.localVaultMeta, JSON.stringify(meta, null, 2), 'utf8');

    return { id, namespace: input.namespace };
  }

  verify(recordId: string, confidence?: number): MemoryRecord {
    const record = this.loadRecordById(recordId);
    if (!record) {
      throw new Error(`Memory record not found: ${recordId}`);
    }

    const now = new Date().toISOString();
    const updated: MemoryRecord = {
      ...record,
      verified_at: now,
      updated_at: now,
      confidence: confidence ?? record.confidence ?? 0.5,
    };

    this.writeRecord(updated);
    return updated;
  }

  link(fromId: string, toId: string, relation: string): GraphEdge {
    if (!this.loadRecordById(fromId)) {
      throw new Error(`Source record not found: ${fromId}`);
    }
    if (!this.loadRecordById(toId)) {
      throw new Error(`Target record not found: ${toId}`);
    }

    const store = this.readGraphStore();
    const now = new Date().toISOString();
    const edge: GraphEdge = {
      id: `edge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      from_id: fromId,
      to_id: toId,
      relation,
      created_at: now,
    };

    store.edges.push(edge);
    this.writeGraphStore(store);
    return edge;
  }

  initialize(): MemoryVaultMeta {
    const paths = getPassportPaths(this.home);
    fs.mkdirSync(paths.localVaultRecords, { recursive: true });
    fs.mkdirSync(paths.localVaultGraph, { recursive: true });

    if (!fs.existsSync(paths.localVaultGraphEdges)) {
      this.writeGraphStore({ edges: [] });
    }

    const now = new Date().toISOString();
    const existing = fs.existsSync(paths.localVaultMeta) ? this.readMeta() : null;

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

  private loadRecords(namespaces: MemoryQuery['namespaces']): MemoryRecord[] {
    const recordsDir = getPassportPaths(this.home).localVaultRecords;
    if (!fs.existsSync(recordsDir)) {
      return [];
    }

    return fs
      .readdirSync(recordsDir)
      .filter((name) => name.endsWith('.json'))
      .map((file) => JSON.parse(fs.readFileSync(path.join(recordsDir, file), 'utf8')) as MemoryRecord)
      .filter((record) => namespaces.includes(record.namespace));
  }

  private loadRecordById(id: string): MemoryRecord | null {
    const filePath = path.join(getPassportPaths(this.home).localVaultRecords, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as MemoryRecord;
  }

  private writeRecord(record: MemoryRecord): void {
    const filePath = path.join(getPassportPaths(this.home).localVaultRecords, `${record.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf8');
  }

  private readGraphStore(): GraphStore {
    const paths = getPassportPaths(this.home);
    if (!fs.existsSync(paths.localVaultGraphEdges)) {
      return { edges: [] };
    }
    return JSON.parse(fs.readFileSync(paths.localVaultGraphEdges, 'utf8')) as GraphStore;
  }

  private writeGraphStore(store: GraphStore): void {
    const paths = getPassportPaths(this.home);
    fs.mkdirSync(paths.localVaultGraph, { recursive: true });
    fs.writeFileSync(paths.localVaultGraphEdges, JSON.stringify(store, null, 2), 'utf8');
  }

  private readMeta(): MemoryVaultMeta {
    const paths = getPassportPaths(this.home);
    return JSON.parse(fs.readFileSync(paths.localVaultMeta, 'utf8')) as MemoryVaultMeta;
  }
}
