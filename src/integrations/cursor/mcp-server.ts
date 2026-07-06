import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { PassportManager } from '../../core/passport-manager.js';
import { parseMemoryNamespaces } from '../../core/memory/service.js';
import { formatReadinessHint, getPassportReadiness } from '../../core/readiness.js';
import { PASSPORT_VERSION } from '../../types/passport.js';

export interface CursorMcpOptions {
  home?: string;
  consumer?: string;
}

function toolError(message: string) {
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  };
}

function toolJson(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

export async function startCursorMcpServer(options: CursorMcpOptions = {}): Promise<void> {
  const defaultConsumer = options.consumer ?? process.env.AI_PASSPORT_CONSUMER ?? 'cursor';
  const manager = new PassportManager(options.home);
  const readiness = await getPassportReadiness(defaultConsumer, options.home);

  console.error(formatReadinessHint(readiness));

  const server = new McpServer({
    name: 'ai-passport',
    version: PASSPORT_VERSION,
  });

  server.registerTool(
    'get_passport_status',
    {
      description:
        'Returns passport readiness for auto-discovery (exists, grants, next steps, MCP config hint)',
      inputSchema: {
        consumer: z.string().optional().describe('Consumer id; defaults to configured consumer'),
      },
    },
    async ({ consumer }) => {
      try {
        const status = await getPassportReadiness(consumer ?? defaultConsumer, options.home);
        return toolJson(status);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return toolError(message);
      }
    },
  );

  server.registerTool(
    'get_passport_context',
    {
      description: 'Returns filtered Passport Context for a granted consumer (audited export)',
      inputSchema: {
        consumer: z.string().optional().describe('Consumer id; defaults to configured consumer'),
      },
    },
    async ({ consumer }) => {
      try {
        if (!manager.exists()) {
          return toolError('Passport not found. Run `ai-passport init` first.');
        }

        const context = await manager.export(consumer ?? defaultConsumer);
        return toolJson(context);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return toolError(message);
      }
    },
  );

  server.registerTool(
    'get_active_project',
    {
      description: 'Returns the first active project from the granted passport context (read-only peek)',
      inputSchema: {
        consumer: z.string().optional().describe('Consumer id; defaults to configured consumer'),
      },
    },
    async ({ consumer }) => {
      try {
        if (!manager.exists()) {
          return toolError('Passport not found. Run `ai-passport init` first.');
        }

        const context = await manager.peekExport(consumer ?? defaultConsumer);
        const project = context.projects?.[0] ?? null;
        return toolJson({ project, grant_id: context.grant_id, provider: context.provider });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return toolError(message);
      }
    },
  );

  server.registerTool(
    'get_memory_context',
    {
      description:
        'Returns a memory excerpt for a granted consumer, filtered to allowed namespaces (RFC 0007 prototype)',
      inputSchema: {
        consumer: z.string().optional().describe('Consumer id; defaults to configured consumer'),
        namespaces: z
          .string()
          .optional()
          .describe('Comma-separated namespaces (preferences,projects,interactions,knowledge,workflows); defaults to all granted'),
      },
    },
    async ({ consumer, namespaces }) => {
      try {
        if (!manager.exists()) {
          return toolError('Passport not found. Run `ai-passport init` first.');
        }

        const parsedNamespaces = namespaces ? parseMemoryNamespaces(namespaces) : undefined;
        const excerpt = await manager.queryMemory(consumer ?? defaultConsumer, parsedNamespaces);
        return toolJson(excerpt);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return toolError(message);
      }
    },
  );

  server.registerTool(
    'list_grants',
    {
      description: 'Lists active grants (no secrets)',
      inputSchema: {},
    },
    async () => {
      try {
        if (!manager.exists()) {
          return toolError('Passport not found. Run `ai-passport init` first.');
        }

        const info = await manager.info();
        const grants = manager.listActiveGrants();

        return toolJson({
          passport_id: info.passportId,
          version: info.version,
          active_grants: grants,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return toolError(message);
      }
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
