import { Command } from 'commander';

import { deliverTokenToCallback } from '../../core/auth-token.js';
import { parseSectionList } from '../../core/permission.js';
import { PassportManager } from '../../core/passport-manager.js';
import { buildGrantRequest } from '../grant-templates.js';
import { confirm, handleCliError } from '../util.js';

export function registerAuthorizeCommand(program: Command): void {
  program
    .command('authorize')
    .description('Sign in with AI Passport — issue a short-lived context token for an app')
    .argument('<client>', 'Client / app id (e.g. my-web-app)')
    .option('--home <path>', 'Custom passport home directory')
    .option('--sections <list>', 'Comma-separated sections when creating a new grant')
    .option('--ttl <seconds>', 'Token lifetime in seconds (default: 3600)', '3600')
    .option('--reusable', 'Allow token to be exchanged more than once')
    .option('--yes', 'Create grant automatically if missing (uses grant template when available)')
    .option('--callback <url>', 'Deliver token to a localhost callback URL (?token=...)')
    .option('--json', 'Output result as JSON')
    .action(
      async (
        client: string,
        options: {
          home?: string;
          sections?: string;
          ttl?: string;
          reusable?: boolean;
          yes?: boolean;
          callback?: string;
          json?: boolean;
        },
      ) => {
        try {
          const manager = new PassportManager(options.home);

          if (!manager.exists()) {
            throw new Error('Passport not found. Run `ai-passport init` first.');
          }

          const ttlSeconds = Number.parseInt(options.ttl ?? '3600', 10);
          if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
            throw new Error('--ttl must be a positive number of seconds.');
          }

          let grantRequest;
          let consumerName: string | undefined;

          if (!manager.listActiveGrants().some((grant) => grant.provider === client)) {
            if (!options.yes) {
              throw new Error(
                `No active grant for "${client}". Run \`ai-passport grant ${client}\` or pass --yes.`,
              );
            }

            const sections = options.sections ? parseSectionList(options.sections) : undefined;
            const built = buildGrantRequest(client, sections);
            grantRequest = built.request;
            consumerName = built.consumerName;

            console.log(`Creating grant for ${client}:`);
            console.log(`  Sections: ${grantRequest.sections.join(', ')}`);

            if (!options.json && !options.yes) {
              const approved = await confirm('Approve grant and issue token?');
              if (!approved) {
                console.log('Authorization cancelled.');
                return;
              }
            }
          }

          const result = await manager.authorize(client, {
            ttlSeconds,
            oneTime: !options.reusable,
            grantRequest,
            consumerName,
          });

          if (options.callback) {
            await deliverTokenToCallback(options.callback, result.token);
          }

          if (options.json) {
            console.log(JSON.stringify(result, null, 2));
            return;
          }

          console.log('');
          console.log('Authorization token issued.');
          console.log(`  Client:     ${result.client_id}`);
          console.log(`  Passport:   ${result.passport_id}`);
          console.log(`  Expires:    ${result.expires_at}`);
          console.log(`  One-time:   ${result.one_time ? 'yes' : 'no'}`);
          console.log('');
          console.log('Token (give to your app):');
          console.log(result.token);
          console.log('');
          console.log('App exchange: ai-passport token exchange <token>');
          if (options.callback) {
            console.log(`Delivered to callback: ${options.callback}`);
          }
        } catch (error) {
          handleCliError(error);
        }
      },
    );
}
