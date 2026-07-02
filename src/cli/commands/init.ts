import { Command } from 'commander';

import { PassportManager } from '../../core/passport-manager.js';
import { handleCliError } from '../util.js';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Create a new encrypted AI Passport in ~/.ai-passport')
    .option('--home <path>', 'Custom passport home directory')
    .option('--force', 'Recreate passport if one already exists')
    .option('--from-example', 'Seed passport from schemas/examples/passport.example.json')
    .option('--example <path>', 'Custom example passport JSON path')
    .action(async (options: { home?: string; force?: boolean; fromExample?: boolean; example?: string }) => {
      try {
        const manager = new PassportManager(options.home);
        const result = await manager.init({
          force: options.force,
          fromExample: options.fromExample,
          examplePath: options.example,
        });

        console.log('✓ Passport created');
        console.log('✓ Identity generated');
        console.log('✓ Local vault encrypted');
        console.log('✓ Ready for AI providers');
        console.log('');
        console.log(`Passport ID: ${result.passportId}`);
        console.log(`Home:        ${result.home}`);
        console.log('');
        console.log('Next: ai-passport info');
      } catch (error) {
        handleCliError(error);
      }
    });
}
