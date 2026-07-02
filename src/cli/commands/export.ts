import { Command } from 'commander';

import { PassportManager } from '../../core/passport-manager.js';
import { handleCliError } from '../util.js';

export function registerExportCommand(program: Command): void {
  program
    .command('export')
    .description('Export filtered Passport Context for a granted consumer')
    .argument('<consumer>', 'Consumer id (e.g. cursor)')
    .option('--home <path>', 'Custom passport home directory')
    .action(async (consumer: string, options: { home?: string }) => {
      try {
        const manager = new PassportManager(options.home);

        if (!manager.exists()) {
          throw new Error('Passport not found. Run `ai-passport init` first.');
        }

        const context = await manager.export(consumer);
        console.log(JSON.stringify(context, null, 2));
      } catch (error) {
        handleCliError(error);
      }
    });
}
