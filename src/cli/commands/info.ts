import { Command } from 'commander';

import { PassportManager } from '../../core/passport-manager.js';
import { handleCliError } from '../util.js';

async function printInfo(home?: string): Promise<void> {
  const manager = new PassportManager(home);

  if (!manager.exists()) {
    throw new Error('Passport not found. Run `ai-passport init` first.');
  }

  const info = await manager.info();

  console.log(`Passport ID:  ${info.passportId}`);
  console.log(`Schema:       ${info.version}`);
  console.log(`Providers:    ${info.providers.length > 0 ? info.providers.join(', ') : 'none'}`);
  console.log(`Permissions:  ${info.permissions} active grant(s)`);
  console.log(`Created:      ${info.created}`);
  console.log(`Updated:      ${info.updated}`);
  console.log(`Key store:    ${info.keyStorage}`);
}

export function registerInfoCommand(program: Command): void {
  program
    .command('info')
    .description('Show passport metadata (ID, schema version, providers, permissions)')
    .option('--home <path>', 'Custom passport home directory')
    .action(async (options: { home?: string }) => {
      try {
        await printInfo(options.home);
      } catch (error) {
        handleCliError(error);
      }
    });
}

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Alias for info')
    .option('--home <path>', 'Custom passport home directory')
    .action(async (options: { home?: string }) => {
      try {
        await printInfo(options.home);
      } catch (error) {
        handleCliError(error);
      }
    });
}
