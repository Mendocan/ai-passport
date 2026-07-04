import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface ReadinessJson {
  ready: boolean;
  exists: boolean;
  passport_id?: string;
  consumer: string;
  consumer_grant: boolean;
  next_steps: string[];
  vscode_mcp_config: {
    servers: Record<string, { type: string; command: string; args: string[] }>;
  };
}

export async function runCli(
  cliPath: string,
  args: string[],
  cwd?: string,
): Promise<{ stdout: string; stderr: string }> {
  const { stdout, stderr } = await execFileAsync(cliPath, args, {
    cwd,
    maxBuffer: 4 * 1024 * 1024,
    windowsHide: true,
    shell: process.platform === 'win32',
  });
  return { stdout: stdout.toString(), stderr: stderr.toString() };
}

export async function getReadiness(cliPath: string, consumer: string): Promise<ReadinessJson> {
  const { stdout } = await runCli(cliPath, ['readiness', '--consumer', consumer, '--json']);
  return JSON.parse(stdout) as ReadinessJson;
}

export async function runOnboard(
  cliPath: string,
  consumer: string,
  workspacePath: string,
): Promise<string> {
  const { stdout, stderr } = await runCli(
    cliPath,
    ['onboard', consumer, '--yes', '--path', workspacePath],
    workspacePath,
  );
  return `${stdout}${stderr}`.trim();
}

export async function cliAvailable(cliPath: string): Promise<boolean> {
  try {
    await runCli(cliPath, ['--version']);
    return true;
  } catch {
    return false;
  }
}
