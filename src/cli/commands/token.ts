import { Command } from 'commander';

import { PassportManager } from '../../core/passport-manager.js';
import { handleCliError } from '../util.js';

export function registerTokenCommand(program: Command): void {
  const token = program.command('token').description('Inspect or exchange Sign in with AI Passport tokens');

  token
    .command('inspect')
    .description('Show token metadata without exposing passport context')
    .argument('<token>', 'Token id (aip_tok_...)')
    .option('--home <path>', 'Custom passport home directory')
    .option('--json', 'Output as JSON')
    .action(async (tokenId: string, options: { home?: string; json?: boolean }) => {
      try {
        const manager = new PassportManager(options.home);
        const summary = manager.inspectToken(tokenId);

        if (options.json) {
          console.log(JSON.stringify(summary, null, 2));
          return;
        }

        console.log(`Token:      ${summary.id}`);
        console.log(`Client:     ${summary.client_id}`);
        console.log(`Passport:   ${summary.passport_id}`);
        console.log(`Grant:      ${summary.grant_id}`);
        console.log(`Sections:   ${summary.sections.join(', ') || 'none'}`);
        console.log(`Expires:    ${summary.expires_at}`);
        console.log(`One-time:   ${summary.one_time ? 'yes' : 'no'}`);
        console.log(`Used:       ${summary.used_at ?? 'no'}`);
        console.log(`Usable:     ${summary.usable ? 'yes' : 'no'}`);
      } catch (error) {
        handleCliError(error);
      }
    });

  token
    .command('exchange')
    .description('Exchange a token for Passport Context JSON (one-time tokens are consumed)')
    .argument('<token>', 'Token id (aip_tok_...)')
    .option('--home <path>', 'Custom passport home directory')
    .action(async (tokenId: string, options: { home?: string }) => {
      try {
        const manager = new PassportManager(options.home);
        const context = manager.exchangeToken(tokenId);
        console.log(JSON.stringify(context, null, 2));
      } catch (error) {
        handleCliError(error);
      }
    });
}
