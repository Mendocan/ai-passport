import { Command } from 'commander';

import { PassportManager } from '../../core/passport-manager.js';
import { handleCliError } from '../util.js';

export function registerRevokeCommand(program: Command): void {
  program
    .command('revoke')
    .description('Revoke all active grants for a consumer')
    .argument('<consumer>', 'Consumer id (e.g. cursor)')
    .option('--home <path>', 'Custom passport home directory')
    .action(async (consumer: string, options: { home?: string }) => {
      try {
        const manager = new PassportManager(options.home);

        if (!manager.exists()) {
          throw new Error('Passport not found. Run `ai-passport init` first.');
        }

        const revokedCount = manager.revoke(consumer);
        console.log(`Revoked ${revokedCount} grant(s) for "${consumer}".`);
      } catch (error) {
        handleCliError(error);
      }
    });
}
