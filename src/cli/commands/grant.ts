import { Command } from 'commander';

import { parseSectionList } from '../../core/permission.js';
import { PassportManager } from '../../core/passport-manager.js';
import { buildGrantRequest } from '../grant-templates.js';
import { confirm, handleCliError } from '../util.js';

export function registerGrantCommand(program: Command): void {
  program
    .command('grant')
    .description('Grant a consumer permission to read selected passport sections')
    .argument('<consumer>', 'Consumer id (e.g. cursor) — uses config/grant-templates.json if available')
    .option('--home <path>', 'Custom passport home directory')
    .option('--sections <list>', 'Comma-separated sections: identity,preferences,coding,projects')
    .option('--yes', 'Approve grant without confirmation prompt')
    .action(async (consumer: string, options: { home?: string; sections?: string; yes?: boolean }) => {
      try {
        const manager = new PassportManager(options.home);

        if (!manager.exists()) {
          throw new Error('Passport not found. Run `ai-passport init` first.');
        }

        const sections = options.sections ? parseSectionList(options.sections) : undefined;
        const { request, consumerName } = buildGrantRequest(consumer, sections);

        console.log('Grant request:');
        console.log(`  Consumer:  ${request.provider}`);
        console.log(`  Sections:  ${request.sections.join(', ')}`);
        console.log(`  Projects:  ${request.project_filter ?? 'active_only'}`);

        if (!options.yes) {
          const approved = await confirm('Approve this grant?');
          if (!approved) {
            console.log('Grant cancelled.');
            return;
          }
        }

        const grant = await manager.grant(request, consumerName);

        console.log('');
        console.log('Grant created.');
        console.log(`  Grant ID:  ${grant.id}`);
        console.log(`  Consumer:  ${grant.provider}`);
        console.log(`  Sections:  ${grant.sections.join(', ')}`);
        console.log('');
        console.log(`Next: ai-passport export ${grant.provider}`);
      } catch (error) {
        handleCliError(error);
      }
    });
}
