import { Command } from 'commander';

import { runGitPlugin } from '../../plugins/git/run.js';
import { handleCliError } from '../util.js';

export function registerPluginCommand(program: Command): void {
  const plugin = program.command('plugin').description('Passport enrichment plugins');

  plugin
    .command('run')
    .description('Run a plugin to enrich passport data')
    .argument('<plugin>', 'Plugin id (git)')
    .option('--home <path>', 'Custom passport home directory')
    .option('--path <dir>', 'Repository path (default: current directory)')
    .option('--force', 'Overwrite manual coding profile values')
    .option('--yes', 'Apply without confirmation prompt')
    .action(async (pluginId: string, options: { home?: string; path?: string; force?: boolean; yes?: boolean }) => {
      try {
        if (pluginId !== 'git') {
          throw new Error(`Unknown plugin "${pluginId}". Available: git`);
        }

        if (!options.yes) {
          const { confirm } = await import('../util.js');
          const approved = await confirm(`Run git plugin on "${options.path ?? process.cwd()}"?`);
          if (!approved) {
            console.log('Plugin run cancelled.');
            return;
          }
        }

        const result = await runGitPlugin({
          home: options.home,
          repoPath: options.path,
          force: options.force,
        });

        console.log('Git plugin completed.');
        console.log(`  Repo:       ${result.repoPath}`);
        console.log(`  Project:    ${result.projectName}`);
        console.log(`  Languages:  ${result.languages.join(', ') || 'none detected'}`);
        console.log(`  Frameworks: ${result.frameworks.join(', ') || 'none detected'}`);
        console.log('');
        console.log('Next: npm run passport -- show --section coding');
      } catch (error) {
        handleCliError(error);
      }
    });

  plugin
    .command('list')
    .description('List available plugins')
    .action(() => {
      console.log('Available plugins:');
      console.log('  git  — analyze repository and update coding profile + active project');
    });
}
