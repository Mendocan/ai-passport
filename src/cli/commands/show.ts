import { Command } from 'commander';

import { PassportManager } from '../../core/passport-manager.js';
import type { PassportDocument, SectionId } from '../../types/passport.js';
import { handleCliError } from '../util.js';

function getSection(document: PassportDocument, section: SectionId): unknown {
  switch (section) {
    case 'identity':
      return document.identity;
    case 'preferences':
      return document.preferences;
    case 'coding':
      return document.coding;
    case 'projects':
      return document.projects;
    case 'permissions':
      return document.permissions;
    case 'providers':
      return document.providers;
    default:
      throw new Error(`Unknown section: ${section satisfies never}`);
  }
}

export function registerShowCommand(program: Command): void {
  program
    .command('show')
    .description('Decrypt and print passport content (user only)')
    .option('--home <path>', 'Custom passport home directory')
    .option('--section <name>', 'Show a single section only')
    .action(async (options: { home?: string; section?: string }) => {
      try {
        const manager = new PassportManager(options.home);

        if (!manager.exists()) {
          throw new Error('Passport not found. Run `ai-passport init` first.');
        }

        const passport = await manager.read();

        if (options.section) {
          const section = options.section as SectionId;
          console.log(JSON.stringify(getSection(passport.document, section), null, 2));
          return;
        }

        console.log(JSON.stringify(passport.document, null, 2));
      } catch (error) {
        handleCliError(error);
      }
    });
}
