import type { GrantEntry } from '../../types/passport.js';
import { Permission } from '../permission.js';
import { LocalVaultProvider } from './local-vault.js';
import { defaultProvidersFile, readProvidersFile, writeProvidersFile } from './registry.js';
import type { MemoryProviderStatus, MemoryRecordRef, MemoryStoreInput } from './types.js';

export interface MemoryStatus {
  enabled: boolean;
  default_provider: string | null;
  providers: MemoryProviderStatus[];
  grants_with_memory: Array<{
    provider: string;
    memory_provider_id: string;
    namespaces: string[];
    mode: string;
  }>;
}

export class MemoryManager {
  private readonly permission: Permission;
  private readonly localVault: LocalVaultProvider;

  constructor(private readonly home?: string) {
    this.permission = new Permission(home);
    this.localVault = new LocalVaultProvider(home);
  }

  async init(): Promise<{ provider: string; storage_path: string }> {
    const meta = this.localVault.initialize();
    const providers = readProvidersFile(this.home) ?? defaultProvidersFile();
    writeProvidersFile(providers, this.home);

    return {
      provider: meta.provider_id,
      storage_path: (await this.localVault.status()).storage_path,
    };
  }

  async status(): Promise<MemoryStatus> {
    const providersFile = readProvidersFile(this.home);
    const localStatus = await this.localVault.status();

    const grantsWithMemory = this.permission
      .getActiveGrants()
      .filter((grant): grant is GrantEntry & { memory: NonNullable<GrantEntry['memory']> } =>
        Boolean(grant.memory),
      )
      .map((grant) => ({
        provider: grant.provider,
        memory_provider_id: grant.memory.provider_id,
        namespaces: grant.memory.namespaces,
        mode: grant.memory.mode,
      }));

    return {
      enabled: providersFile !== null || localStatus.ready,
      default_provider: providersFile?.default_provider ?? (localStatus.ready ? localStatus.id : null),
      providers: [localStatus],
      grants_with_memory: grantsWithMemory,
    };
  }

  async store(input: MemoryStoreInput): Promise<MemoryRecordRef> {
    return this.localVault.store(input);
  }
}
