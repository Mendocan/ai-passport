import { Command } from 'commander';

import { SyncManager } from '../../core/sync/manager.js';
import { writeSyncConfig } from '../../core/sync/config.js';
import { handleCliError } from '../util.js';

export function registerSyncCommand(program: Command): void {
  const sync = program.command('sync').description('Encrypted cloud/local sync (RFC 0006 prototype)');

  sync
    .command('status')
    .description('Compare local passport with remote sync bundle')
    .option('--home <path>', 'Custom passport home directory')
    .option('--target <dir>', 'Sync target directory (overrides sync.json)')
    .action(async (options: { home?: string; target?: string }) => {
      try {
        const manager = new SyncManager(options.home);
        const status = await manager.status(options.target);

        console.log(`Target:  ${status.target}`);
        console.log(`In sync: ${status.in_sync ? 'yes' : 'no'}`);
        if (status.passport_id) {
          console.log(`Passport: ${status.passport_id}`);
        }
        console.log(`Local:   ${status.local_updated_at ?? 'n/a'}`);
        console.log(`Remote:  ${status.remote_updated_at ?? 'n/a'}`);
      } catch (error) {
        handleCliError(error);
      }
    });

  sync
    .command('push')
    .description('Upload encrypted passport bundle (no master key)')
    .option('--home <path>', 'Custom passport home directory')
    .option('--target <dir>', 'Sync target directory')
    .option('--force', 'Overwrite even if remote is newer')
    .action(async (options: { home?: string; target?: string; force?: boolean }) => {
      try {
        const manager = new SyncManager(options.home);
        const result = await manager.push({ target: options.target, force: options.force });

        console.log(`✓ Pushed ${result.passport_id} (${result.updated_at})`);
        console.log(`  Target: ${result.target}`);
      } catch (error) {
        handleCliError(error);
      }
    });

  sync
    .command('pull')
    .description('Download encrypted passport bundle into local home')
    .option('--home <path>', 'Custom passport home directory')
    .option('--target <dir>', 'Sync target directory')
    .option('--force', 'Overwrite even if local is newer or passport id differs')
    .action(async (options: { home?: string; target?: string; force?: boolean }) => {
      try {
        const manager = new SyncManager(options.home);
        const result = await manager.pull({ target: options.target, force: options.force });

        console.log(`✓ Pulled ${result.passport_id} (${result.updated_at})`);
        console.log(`  Target: ${result.target}`);
      } catch (error) {
        handleCliError(error);
      }
    });

  sync
    .command('config')
    .description('Save default file sync target')
    .requiredOption('--target <dir>', 'Directory for encrypted sync bundles')
    .option('--home <path>', 'Custom passport home directory')
    .action((options: { home?: string; target: string }) => {
      try {
        writeSyncConfig({ provider: 'file', target: options.target }, options.home);
        console.log(`✓ Sync target saved: ${options.target}`);
        console.log('  Provider: file (local directory or cloud-synced folder)');
      } catch (error) {
        handleCliError(error);
      }
    });
}
