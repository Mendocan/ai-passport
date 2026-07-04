export interface VscodeMcpServer {
  type: 'stdio';
  command: string;
  args: string[];
}

export interface VscodeMcpFile {
  servers?: Record<string, VscodeMcpServer>;
  inputs?: unknown[];
}

export function buildAiPassportServer(cliPath: string, consumer: string): VscodeMcpServer {
  if (cliPath.endsWith('.js')) {
    return {
      type: 'stdio',
      command: 'node',
      args: [cliPath, 'mcp', 'serve', '--consumer', consumer],
    };
  }

  return {
    type: 'stdio',
    command: cliPath,
    args: ['mcp', 'serve', '--consumer', consumer],
  };
}

export function mergeMcpConfig(existing: VscodeMcpFile, server: VscodeMcpServer): VscodeMcpFile {
  return {
    ...existing,
    servers: {
      ...existing.servers,
      'ai-passport': server,
    },
  };
}
