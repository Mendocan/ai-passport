import { Command } from 'commander';

import { MemoryManager } from '../../core/memory/manager.js';
import { PassportManager } from '../../core/passport-manager.js';
import { parseMemoryNamespaces } from '../../core/memory/service.js';
import { handleCliError } from '../util.js';

export function registerMemoryCommand(program: Command): void {
  const memory = program
    .command('memory')
    .description('User-owned memory providers (RFC 0007 prototype)');

  memory
    .command('init')
    .description('Initialize local memory vault (local-vault provider)')
    .option('--home <path>', 'Custom passport home directory')
    .action(async (options: { home?: string }) => {
      try {
        const manager = new MemoryManager(options.home);
        const result = await manager.init();

        console.log(`✓ Memory provider initialized: ${result.provider}`);
        console.log(`  Storage: ${result.storage_path}`);
        console.log('');
        console.log('Grant memory access: ai-passport grant <consumer> --memory preferences,projects');
      } catch (error) {
        handleCliError(error);
      }
    });

  memory
    .command('status')
    .description('Memory providers and grants with memory access')
    .option('--home <path>', 'Custom passport home directory')
    .option('--json', 'Output JSON')
    .action(async (options: { home?: string; json?: boolean }) => {
      try {
        const manager = new MemoryManager(options.home);
        const status = await manager.status();

        if (options.json) {
          console.log(JSON.stringify(status, null, 2));
          return;
        }

        console.log(`Enabled:   ${status.enabled ? 'yes' : 'no'}`);
        console.log(`Default:   ${status.default_provider ?? 'n/a'}`);

        for (const provider of status.providers) {
          console.log('');
          console.log(`Provider:  ${provider.id} v${provider.version}`);
          console.log(`  Ready:   ${provider.ready ? 'yes' : 'no'}`);
          console.log(`  Records: ${provider.record_count}`);
          console.log(`  Path:    ${provider.storage_path}`);
        }

        if (status.grants_with_memory.length > 0) {
          console.log('');
          console.log('Grants with memory:');
          for (const grant of status.grants_with_memory) {
            console.log(
              `  • ${grant.provider} → ${grant.memory_provider_id} [${grant.namespaces.join(', ')}] (${grant.mode})`,
            );
          }
        } else {
          console.log('');
          console.log('No active grants with memory access.');
        }
      } catch (error) {
        handleCliError(error);
      }
    });

  memory
    .command('store')
    .description('Store a memory record in the local vault (RFC 0007 prototype)')
    .argument('<namespace>', 'Memory namespace (preferences,projects,interactions,knowledge,workflows)')
    .argument('<content>', 'Record content — plain text or JSON')
    .option('--home <path>', 'Custom passport home directory')
    .option('--confidence <value>', 'Confidence 0.0–1.0', (value) => Number.parseFloat(value))
    .option('--sources <count>', 'Number of supporting sources', (value) => Number.parseInt(value, 10))
    .action(
      async (
        namespace: string,
        content: string,
        options: { home?: string; confidence?: number; sources?: number },
      ) => {
        try {
          const [parsedNamespace] = parseMemoryNamespaces(namespace);
          const manager = new MemoryManager(options.home);

          let parsedContent: unknown;
          try {
            parsedContent = JSON.parse(content);
          } catch {
            parsedContent = content;
          }

          const ref = await manager.store({
            namespace: parsedNamespace,
            content: parsedContent,
            confidence: options.confidence,
            sources: options.sources,
          });

          console.log(`✓ Stored ${ref.id}`);
          console.log(`  Namespace: ${ref.namespace}`);
        } catch (error) {
          handleCliError(error);
        }
      },
    );

  memory
    .command('query')
    .description('Query memory for a consumer (grant-scoped; same as MCP get_memory_context)')
    .argument('[consumer]', 'Consumer id', 'cursor')
    .option('--namespaces <list>', 'Comma-separated namespaces (defaults to all granted)')
    .option('--min-confidence <value>', 'Minimum effective confidence (0–1)', (value) =>
      Number.parseFloat(value),
    )
    .option('--home <path>', 'Custom passport home directory')
    .option('--json', 'Output JSON')
    .action(
      async (
        consumer: string,
        options: { namespaces?: string; minConfidence?: number; home?: string; json?: boolean },
      ) => {
        try {
          const passportManager = new PassportManager(options.home);
          if (!passportManager.exists()) {
            throw new Error('Passport not found. Run `ai-passport init` first.');
          }

          const namespaces = options.namespaces
            ? parseMemoryNamespaces(options.namespaces)
            : undefined;
          const excerpt = await passportManager.queryMemory(consumer, namespaces, {
            min_confidence: options.minConfidence,
          });

          if (options.json) {
            console.log(JSON.stringify(excerpt, null, 2));
            return;
          }

          if (excerpt.records.length === 0) {
            console.log(`No memory records for "${consumer}" in granted namespaces.`);
            return;
          }

          console.log(`Consumer:  ${consumer}`);
          console.log(`Records:   ${excerpt.records.length}${excerpt.truncated ? ' (truncated)' : ''}`);
          console.log('');

          for (const record of excerpt.records) {
            const content =
              typeof record.content === 'string'
                ? record.content
                : JSON.stringify(record.content);
            console.log(`• ${record.namespace} [${record.id}]`);
            console.log(`  ${content}`);
            if (record.confidence !== undefined) {
              console.log(`  confidence: ${record.confidence}`);
            }
            if (record.effective_confidence !== undefined) {
              console.log(`  effective:  ${record.effective_confidence}`);
            }
            console.log('');
          }
        } catch (error) {
          handleCliError(error);
        }
      },
    );

  memory
    .command('verify')
    .description('Re-verify a memory record (resets decay clock)')
    .argument('<record-id>', 'Memory record id')
    .option('--confidence <value>', 'Update confidence 0.0–1.0', (value) => Number.parseFloat(value))
    .option('--home <path>', 'Custom passport home directory')
    .option('--json', 'Output JSON')
    .action(
      async (recordId: string, options: { confidence?: number; home?: string; json?: boolean }) => {
        try {
          const manager = new MemoryManager(options.home);
          const record = manager.verify(recordId, options.confidence);

          if (options.json) {
            console.log(JSON.stringify(record, null, 2));
            return;
          }

          console.log(`✓ Verified ${record.id}`);
          console.log(`  confidence: ${record.confidence}`);
          console.log(`  verified_at: ${record.verified_at}`);
        } catch (error) {
          handleCliError(error);
        }
      },
    );

  memory
    .command('link')
    .description('Link two memory records in the knowledge graph')
    .argument('<from-id>', 'Source record id')
    .argument('<to-id>', 'Target record id')
    .argument('<relation>', 'Relation label (e.g. prefers, uses, part_of)')
    .option('--home <path>', 'Custom passport home directory')
    .option('--json', 'Output JSON')
    .action(
      async (
        fromId: string,
        toId: string,
        relation: string,
        options: { home?: string; json?: boolean },
      ) => {
        try {
          const manager = new MemoryManager(options.home);
          const edge = manager.link(fromId, toId, relation);

          if (options.json) {
            console.log(JSON.stringify(edge, null, 2));
            return;
          }

          console.log(`✓ Linked ${edge.from_id} --[${edge.relation}]--> ${edge.to_id}`);
          console.log(`  edge: ${edge.id}`);
        } catch (error) {
          handleCliError(error);
        }
      },
    );

  memory
    .command('graph')
    .description('Query knowledge graph for a consumer (requires knowledge namespace grant)')
    .argument('[consumer]', 'Consumer id', 'cursor')
    .option('--root <record-id>', 'Traverse from record id')
    .option('--relation <name>', 'Filter by relation')
    .option('--home <path>', 'Custom passport home directory')
    .option('--json', 'Output JSON')
    .action(
      async (
        consumer: string,
        options: { root?: string; relation?: string; home?: string; json?: boolean },
      ) => {
        try {
          const passportManager = new PassportManager(options.home);
          if (!passportManager.exists()) {
            throw new Error('Passport not found. Run `ai-passport init` first.');
          }

          const excerpt = await passportManager.queryMemoryGraph(
            consumer,
            options.root,
            options.relation,
          );

          if (options.json) {
            console.log(JSON.stringify(excerpt, null, 2));
            return;
          }

          console.log(`Consumer: ${consumer}`);
          console.log(`Nodes:    ${excerpt.nodes.length}`);
          console.log(`Edges:    ${excerpt.edges.length}`);
          console.log('');

          for (const edge of excerpt.edges) {
            console.log(`  ${edge.from_id} --[${edge.relation}]--> ${edge.to_id}`);
          }
        } catch (error) {
          handleCliError(error);
        }
      },
    );
}
