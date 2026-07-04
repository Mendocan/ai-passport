import { Command } from 'commander';

import { getPassportReadiness } from '../../core/readiness.js';
import { handleCliError } from '../util.js';

export function registerReadinessCommand(program: Command): void {
  program
    .command('readiness')
    .description('Passport readiness for a consumer (human or JSON for tooling)')
    .option('--consumer <id>', 'Consumer id', 'cursor')
    .option('--home <path>', 'Custom passport home directory')
    .option('--json', 'Output machine-readable JSON')
    .action(async (options: { consumer: string; home?: string; json?: boolean }) => {
      try {
        const readiness = await getPassportReadiness(options.consumer, options.home);

        if (options.json) {
          console.log(JSON.stringify(readiness, null, 2));
          return;
        }

        console.log(`Ready:     ${readiness.ready ? 'yes' : 'no'}`);
        console.log(`Exists:    ${readiness.exists ? 'yes' : 'no'}`);
        console.log(`Key store: ${readiness.key_storage}`);
        if (readiness.passport_id) {
          console.log(`Passport:  ${readiness.passport_id}`);
        }
        console.log(`Consumer:  ${readiness.consumer} (${readiness.consumer_grant ? 'granted' : 'not granted'})`);
        console.log('');
        console.log('Next steps:');
        for (const step of readiness.next_steps) {
          console.log(`  • ${step}`);
        }
      } catch (error) {
        handleCliError(error);
      }
    });
}
