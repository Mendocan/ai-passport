import { Command } from 'commander';

import { startCursorMcpServer } from '../../integrations/cursor/mcp-server.js';
import { handleCliError } from '../util.js';

export function registerMcpCommand(program: Command): void {
  const mcp = program.command('mcp').description('Model Context Protocol adapters');

  mcp
    .command('serve')
    .description('Start AI Passport MCP server (stdio) for Cursor and other consumers')
    .option('--home <path>', 'Custom passport home directory')
    .option('--consumer <id>', 'Default consumer id (default: cursor or AI_PASSPORT_CONSUMER)')
    .action(async (options: { home?: string; consumer?: string }) => {
      try {
        await startCursorMcpServer({
          home: options.home,
          consumer: options.consumer,
        });
      } catch (error) {
        handleCliError(error);
      }
    });
}
