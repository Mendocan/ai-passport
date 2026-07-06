import type { GrantEntry } from '../../types/passport.js';
import type { PassportContext } from '../permission.js';
import { LocalVaultProvider, LOCAL_VAULT_ID } from './local-vault.js';
import type { GraphExcerpt, MemoryExcerpt, MemoryProvider, MemoryNamespace, MemoryQuery } from './types.js';
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
      sort: 'confidence',
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
    options?: Pick<MemoryQuery, 'min_confidence' | 'sort' | 'limit'>,
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
    return provider.query({
      consumer: grant.provider,
      namespaces,
      limit: options?.limit ?? 50,
      min_confidence: options?.min_confidence,
      sort: options?.sort ?? 'confidence',
    });
  }

  /**
   * Graph traversal for a consumer. Requires `knowledge` in the memory grant.
   */
  async graphForConsumer(
    grant: GrantEntry,
    rootId?: string,
    relation?: string,
  ): Promise<GraphExcerpt> {
    if (!grant.memory) {
      throw new Error(
        `No memory grant for "${grant.provider}". Run \`ai-passport grant ${grant.provider} --memory <namespaces>\`.`,
      );
    }

    if (!grant.memory.namespaces.includes('knowledge')) {
      throw new Error(
        `Graph queries require "knowledge" namespace in grant. Allowed: ${grant.memory.namespaces.join(', ')}.`,
      );
    }

    const provider = this.resolveProvider(grant.memory.provider_id);
    if (!provider.graph) {
      throw new Error(`Memory provider "${grant.memory.provider_id}" does not support graph queries.`);
    }

    return provider.graph({
      consumer: grant.provider,
      root_id: rootId,
      relation,
      limit: 50,
    });
  }
}

/**
 * Parse namespace lists from CLI/MCP input.
 * Accepts comma- or space-separated strings (PowerShell turns commas into spaces).
 */
export function parseMemoryNamespaces(value: string | string[]): MemoryNamespace[] {
  const text = Array.isArray(value) ? value.join(' ') : value;
  const namespaces = text
    .split(/[,\s]+/)
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
