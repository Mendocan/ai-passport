import { Command } from 'commander';

import { getPassportReadiness } from '../../core/readiness.js';
import { PassportManager } from '../../core/passport-manager.js';
import { runGitPlugin } from '../../plugins/git/run.js';
import { buildGrantRequest } from '../grant-templates.js';
import { confirm, handleCliError } from '../util.js';

export function registerOnboardCommand(program: Command): void {
  program
    .command('onboard')
    .description('First-time setup: init passport, grant consumer, print MCP config')
    .argument('[consumer]', 'Consumer id (default: cursor)', 'cursor')
    .option('--home <path>', 'Custom passport home directory')
    .option('--path <dir>', 'Run git plugin on this repo to enrich coding profile')
    .option('--skip-git', 'Skip git plugin even if --path is set')
    .option('--yes', 'Approve init/grant without prompts')
    .option('--force-init', 'Recreate passport if one already exists')
    .action(
      async (
        consumer: string,
        options: {
          home?: string;
          path?: string;
          skipGit?: boolean;
          yes?: boolean;
          forceInit?: boolean;
        },
      ) => {
        try {
          const manager = new PassportManager(options.home);
          let created = false;
          let granted = false;

          console.log('AI Passport — first-time onboarding');
          console.log('');

          if (!manager.exists()) {
            console.log('Step 1/3 — Create passport');
            if (!options.yes) {
              const approved = await confirm('Create a new encrypted passport?');
              if (!approved) {
                console.log('Onboarding cancelled.');
                return;
              }
            }

            const result = await manager.init({ force: options.forceInit });
            console.log(`✓ Passport created (${result.passportId})`);
            created = true;
          } else {
            console.log('Step 1/3 — Passport already exists ✓');
          }

          const readinessBeforeGrant = await getPassportReadiness(consumer, options.home);

          if (!readinessBeforeGrant.consumer_grant) {
            console.log('');
            console.log(`Step 2/3 — Grant ${consumer}`);
            const { request, consumerName } = buildGrantRequest(consumer);

            console.log(`  Sections: ${request.sections.join(', ')}`);

            if (!options.yes) {
              const approved = await confirm('Approve this grant?');
              if (!approved) {
                console.log('Grant skipped. Run `ai-passport grant cursor --yes` later.');
              } else {
                await manager.grant(request, consumerName);
                console.log(`✓ Grant created for ${consumer}`);
                granted = true;
              }
            } else {
              await manager.grant(request, consumerName);
              console.log(`✓ Grant created for ${consumer}`);
              granted = true;
            }
          } else {
            console.log('');
            console.log(`Step 2/3 — ${consumer} grant already active ✓`);
          }

          if (options.path && !options.skipGit) {
            console.log('');
            console.log('Step 3/3 — Enrich from git repo');
            const pluginResult = await runGitPlugin({
              repoPath: options.path,
              home: options.home,
              force: true,
            });
            console.log(`✓ Git plugin updated ${pluginResult.languages.join(', ') || 'profile'}`);
          } else {
            console.log('');
            console.log('Step 3/3 — Git enrichment skipped');
            console.log('  Tip: ai-passport plugin run git --path . --yes');
          }

          const readiness = await getPassportReadiness(consumer, options.home);

          console.log('');
          console.log('--- Status ---');
          console.log(`Ready:     ${readiness.ready ? 'yes' : 'no'}`);
          if (readiness.passport_id) {
            console.log(`Passport:  ${readiness.passport_id}`);
          }
          console.log(`Consumer:  ${consumer} (${readiness.consumer_grant ? 'granted' : 'not granted'})`);
          console.log('');

          console.log('--- Next steps ---');
          for (const step of readiness.next_steps) {
            console.log(`• ${step}`);
          }

          console.log('');
          console.log('--- Cursor MCP config ---');
          console.log(JSON.stringify(readiness.mcp_config, null, 2));
          console.log('');

          if (created || granted) {
            console.log('Onboarding complete.');
          } else if (readiness.ready) {
            console.log('Already set up — paste MCP config into Cursor if needed.');
          }
        } catch (error) {
          handleCliError(error);
        }
      },
    );
}
