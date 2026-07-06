import type { GrantEntry } from '../../types/passport.js';
import type { PassportContext } from '../permission.js';
import { LocalVaultProvider, LOCAL_VAULT_ID } from './local-vault.js';
import type { MemoryExcerpt, MemoryProvider, MemoryNamespace } from './types.js';
import { MEMORY_NAMESPACES } from './types.js';

export class MemoryService {
  constructor(private readonly home?: string) {}

  resolveProvider(providerId: string): MemoryProvider {
    if (providerId === LOCAL_VAULT_ID) {
      return new LocalVaultProvider(this.home);
    }

    throw new Error(`Unknown memory provider "${providerId}".`);
  }

  async enrichContext(context: PassportContext, grant: GrantEntry): Promise<PassportContext> {
    if (!grant.memory) {
      return context;
    }

    if (grant.memory.mode !== 'read') {
      return context;
    }

    const provider = this.resolveProvider(grant.memory.provider_id);
    const excerpt = await provider.query({
      consumer: grant.provider,
      namespaces: grant.memory.namespaces,
      limit: 50,
    });

    return {
      ...context,
      memory: {
        provider: grant.memory.provider_id,
        excerpt,
      },
    };
  }

  /**
   * Direct memory query for a consumer, filtered to the namespaces its grant allows.
   * Used by the dedicated `get_memory_context` MCP tool (RFC 0007).
   */
  async queryForConsumer(
    grant: GrantEntry,
    requestedNamespaces?: MemoryNamespace[],
  ): Promise<MemoryExcerpt> {
    if (!grant.memory) {
      throw new Error(
        `No memory grant for "${grant.provider}". Run \`ai-passport grant ${grant.provider} --memory <namespaces>\`.`,
      );
    }

    const allowed = grant.memory.namespaces;
    const namespaces =
      requestedNamespaces && requestedNamespaces.length > 0
        ? requestedNamespaces.filter((namespace) => allowed.includes(namespace))
        : allowed;

    if (namespaces.length === 0) {
      throw new Error(
        `Requested namespaces are not granted. Allowed: ${allowed.join(', ') || 'none'}.`,
      );
    }

    const provider = this.resolveProvider(grant.memory.provider_id);
    return provider.query({ consumer: grant.provider, namespaces, limit: 50 });
  }
}

export function parseMemoryNamespaces(value: string): MemoryNamespace[] {
  const namespaces = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  for (const namespace of namespaces) {
    if (!MEMORY_NAMESPACES.includes(namespace as MemoryNamespace)) {
      throw new Error(
        `Invalid memory namespace "${namespace}". Valid: ${MEMORY_NAMESPACES.join(', ')}`,
      );
    }
  }

  return namespaces as MemoryNamespace[];
}
