#!/usr/bin/env node

import { Command } from 'commander';

import { registerAuthorizeCommand } from './cli/commands/authorize.js';
import { registerOnboardCommand } from './cli/commands/onboard.js';
import { registerPluginCommand } from './cli/commands/plugin.js';
import { registerMemoryCommand } from './cli/commands/memory.js';
import { registerMcpCommand } from './cli/commands/mcp.js';
import { registerExportCommand } from './cli/commands/export.js';
import { registerGrantCommand } from './cli/commands/grant.js';
import { registerInfoCommand, registerStatusCommand } from './cli/commands/info.js';
import { registerInitCommand } from './cli/commands/init.js';
import { registerReadinessCommand } from './cli/commands/readiness.js';
import { registerRevokeCommand } from './cli/commands/revoke.js';
import { registerSyncCommand } from './cli/commands/sync.js';
import { registerShowCommand } from './cli/commands/show.js';
import { registerTokenCommand } from './cli/commands/token.js';
import { CLI_VERSION } from './cli/cli-version.js';

const program = new Command();

program
  .name('ai-passport')
  .description('One identity. Every AI. — portable user-owned identity for AI systems')
  .version(CLI_VERSION);

registerInitCommand(program);
registerOnboardCommand(program);
registerInfoCommand(program);
registerStatusCommand(program);
registerReadinessCommand(program);
registerShowCommand(program);
registerGrantCommand(program);
registerAuthorizeCommand(program);
registerRevokeCommand(program);
registerTokenCommand(program);
registerExportCommand(program);
registerMcpCommand(program);
registerMemoryCommand(program);
registerPluginCommand(program);
registerSyncCommand(program);

program.parseAsync(process.argv);
