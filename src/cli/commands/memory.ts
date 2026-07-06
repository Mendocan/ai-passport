import { Command } from 'commander';

import { MemoryManager } from '../../core/memory/manager.js';
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
}
