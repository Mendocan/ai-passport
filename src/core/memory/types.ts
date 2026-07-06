/** RFC 0007 — Memory Provider types (v0.2 prototype) */

export const MEMORY_NAMESPACES = [
  'preferences',
  'projects',
  'interactions',
  'knowledge',
  'workflows',
] as const;

export type MemoryNamespace = (typeof MEMORY_NAMESPACES)[number];

export type MemoryAccessMode = 'read' | 'write';

export interface MemoryGrant {
  provider_id: string;
  namespaces: MemoryNamespace[];
  mode: MemoryAccessMode;
}

export interface MemoryProviderStatus {
  id: string;
  version: string;
  ready: boolean;
  record_count: number;
  storage_path: string;
}

export interface MemoryQuery {
  consumer: string;
  namespaces: MemoryNamespace[];
  intent?: string;
  limit?: number;
}

export interface MemoryRecord {
  id: string;
  namespace: MemoryNamespace;
  content: unknown;
  confidence?: number;
  verified_at?: string;
  sources?: number;
  created_at: string;
  updated_at: string;
}

export interface MemoryExcerpt {
  records: MemoryRecord[];
  truncated: boolean;
}

export interface MemoryProvider {
  readonly id: string;
  readonly version: string;

  status(): Promise<MemoryProviderStatus>;
  query(input: MemoryQuery): Promise<MemoryExcerpt>;
}

export interface MemoryProviderRegistration {
  id: string;
  type: 'local-vault';
  enabled: boolean;
  registered_at: string;
}

export interface MemoryProvidersFile {
  default_provider: string;
  providers: MemoryProviderRegistration[];
}

export interface MemoryVaultMeta {
  provider_id: string;
  version: string;
  created_at: string;
  updated_at: string;
  record_count: number;
}
