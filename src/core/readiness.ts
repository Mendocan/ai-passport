import { getKeyStorageKind, hasMasterKey } from '../crypto/keychain.js';
import { PassportManager } from './passport-manager.js';
import { passportExists } from './paths.js';

export interface ReadinessGrant {
  provider: string;
  sections: string[];
}

export interface PassportReadiness {
  ready: boolean;
  exists: boolean;
  key_storage: 'os-keychain' | 'file-fallback' | 'missing';
  passport_id?: string;
  version?: string;
  active_grants: ReadinessGrant[];
  consumer_grant: boolean;
  consumer: string;
  next_steps: string[];
  /** Cursor / Claude Desktop style */
  mcp_config: {
    mcpServers: Record<
      string,
      {
        command: string;
        args: string[];
      }
    >;
  };
  /** VS Code Copilot — `.vscode/mcp.json` */
  vscode_mcp_config: {
    servers: Record<
      string,
      {
        type: 'stdio';
        command: string;
        args: string[];
      }
    >;
  };
}

function buildMcpConfig(consumer: string) {
  return {
    mcpServers: {
      'ai-passport': {
        command: 'ai-passport',
        args: ['mcp', 'serve', '--consumer', consumer],
      },
    },
  };
}

function buildVscodeMcpConfig(consumer: string) {
  return {
    servers: {
      'ai-passport': {
        type: 'stdio' as const,
        command: 'ai-passport',
        args: ['mcp', 'serve', '--consumer', consumer],
      },
    },
  };
}

function buildNextSteps(
  exists: boolean,
  consumerGrant: boolean,
  consumer: string,
  keyStorage: PassportReadiness['key_storage'],
): string[] {
  const steps: string[] = [];

  if (!exists) {
    steps.push('Run `ai-passport init` to create your passport');
  }

  if (exists && keyStorage === 'missing') {
    steps.push('Run `ai-passport init --force` if the master key is missing');
  }

  if (exists && !consumerGrant) {
    steps.push(`Run \`ai-passport grant ${consumer} --yes\` to allow access`);
  }

  if (exists && consumerGrant) {
    if (consumer === 'vscode') {
      steps.push('Run `AI Passport: Configure MCP` or add `.vscode/mcp.json` (see VSCODE_SETUP.md)');
      steps.push('Restart MCP servers in VS Code and ask: "What stack am I working with?"');
    } else {
      steps.push('Add the MCP config below to Cursor Settings → MCP');
      steps.push('Restart Cursor and ask: "What languages do I prefer?"');
    }
  }

  if (steps.length === 0) {
    steps.push(
      consumer === 'vscode'
        ? 'Passport is ready — MCP tools should work in VS Code'
        : 'Passport is ready — MCP tools should work in Cursor',
    );
  }

  return steps;
}

export async function getPassportReadiness(
  consumer = 'cursor',
  home?: string,
): Promise<PassportReadiness> {
  const exists = passportExists(home);

  if (!exists) {
    return {
      ready: false,
      exists: false,
      key_storage: 'missing',
      active_grants: [],
      consumer_grant: false,
      consumer,
      next_steps: buildNextSteps(false, false, consumer, 'missing'),
      mcp_config: buildMcpConfig(consumer),
      vscode_mcp_config: buildVscodeMcpConfig(consumer),
    };
  }

  const manager = new PassportManager(home);
  const keyStorage = await getKeyStorageKind(home);
  const masterKeyPresent = await hasMasterKey(home);
  const grants = manager.listActiveGrants();
  const consumerGrant = grants.some((grant) => grant.provider === consumer);

  let passportId: string | undefined;
  let version: string | undefined;

  if (masterKeyPresent) {
    try {
      const info = await manager.info();
      passportId = info.passportId;
      version = info.version;
    } catch {
      // Passport files exist but cannot be decrypted — treat as not ready.
    }
  }

  const effectiveKeyStorage = masterKeyPresent ? keyStorage : 'missing';
  const ready = exists && masterKeyPresent && consumerGrant && passportId !== undefined;

  return {
    ready,
    exists,
    key_storage: effectiveKeyStorage,
    passport_id: passportId,
    version,
    active_grants: grants.map((grant) => ({
      provider: grant.provider,
      sections: grant.sections,
    })),
    consumer_grant: consumerGrant,
    consumer,
    next_steps: buildNextSteps(exists, consumerGrant, consumer, effectiveKeyStorage),
    mcp_config: buildMcpConfig(consumer),
    vscode_mcp_config: buildVscodeMcpConfig(consumer),
  };
}

export function formatReadinessHint(readiness: PassportReadiness): string {
  if (readiness.ready) {
    return `[ai-passport] Ready — passport ${readiness.passport_id} (${readiness.consumer} grant active)`;
  }

  const primary = readiness.next_steps[0] ?? 'Run `ai-passport onboard`';
  return `[ai-passport] Not ready — ${primary}`;
}
