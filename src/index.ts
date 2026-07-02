#!/usr/bin/env node

import { Command } from 'commander';

import { registerPluginCommand } from './cli/commands/plugin.js';
import { registerMcpCommand } from './cli/commands/mcp.js';
import { registerExportCommand } from './cli/commands/export.js';
import { registerGrantCommand } from './cli/commands/grant.js';
import { registerInfoCommand, registerStatusCommand } from './cli/commands/info.js';
import { registerInitCommand } from './cli/commands/init.js';
import { registerRevokeCommand } from './cli/commands/revoke.js';
import { registerShowCommand } from './cli/commands/show.js';
import { PASSPORT_VERSION } from './types/passport.js';

const program = new Command();

program
  .name('ai-passport')
  .description('One identity. Every AI. — portable user-owned identity for AI systems')
  .version(PASSPORT_VERSION);

registerInitCommand(program);
registerInfoCommand(program);
registerStatusCommand(program);
registerShowCommand(program);
registerGrantCommand(program);
registerRevokeCommand(program);
registerExportCommand(program);
registerMcpCommand(program);
registerPluginCommand(program);

program.parseAsync(process.argv);
