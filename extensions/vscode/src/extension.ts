import * as fs from 'node:fs';
import * as path from 'node:path';

import * as vscode from 'vscode';

import { cliAvailable, getReadiness, runOnboard } from './cli.js';
import { buildAiPassportServer, mergeMcpConfig, type VscodeMcpFile } from './mcp-config.js';

const OUTPUT_CHANNEL = 'AI Passport';

function getConfig(): { cliPath: string; consumer: string } {
  const config = vscode.workspace.getConfiguration('aiPassport');
  return {
    cliPath: config.get<string>('cliPath', 'ai-passport'),
    consumer: config.get<string>('consumer', 'vscode'),
  };
}

function getOutputChannel(): vscode.OutputChannel {
  return vscode.window.createOutputChannel(OUTPUT_CHANNEL);
}

async function getWorkspaceFolder(): Promise<vscode.WorkspaceFolder> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    throw new Error('Open a workspace folder first.');
  }
  return folder;
}

function getMcpConfigPath(folder: vscode.WorkspaceFolder): string {
  return path.join(folder.uri.fsPath, '.vscode', 'mcp.json');
}

async function writeWorkspaceMcpConfig(
  folder: vscode.WorkspaceFolder,
  cliPath: string,
  consumer: string,
): Promise<string> {
  const mcpPath = getMcpConfigPath(folder);
  const vscodeDir = path.dirname(mcpPath);

  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir, { recursive: true });
  }

  let existing: VscodeMcpFile = {};
  if (fs.existsSync(mcpPath)) {
    existing = JSON.parse(fs.readFileSync(mcpPath, 'utf8')) as VscodeMcpFile;
  }

  const merged = mergeMcpConfig(existing, buildAiPassportServer(cliPath, consumer));
  fs.writeFileSync(mcpPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  return mcpPath;
}

async function configureMcp(): Promise<void> {
  const folder = await getWorkspaceFolder();
  const { cliPath, consumer } = getConfig();
  const mcpPath = await writeWorkspaceMcpConfig(folder, cliPath, consumer);

  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(mcpPath));
  await vscode.window.showTextDocument(doc, { preview: false });

  void vscode.window.showInformationMessage(
    'AI Passport MCP config written. Restart MCP servers in VS Code (MCP: List Servers).',
  );
}

async function setupWorkspace(): Promise<void> {
  const folder = await getWorkspaceFolder();
  const { cliPath, consumer } = getConfig();
  const output = getOutputChannel();
  output.clear();
  output.show(true);

  if (!(await cliAvailable(cliPath))) {
    const install = 'Open npm';
    const choice = await vscode.window.showErrorMessage(
      `ai-passport CLI not found at "${cliPath}". Install: npm install -g @ai-passport-core/cli`,
      install,
    );
    if (choice === install) {
      void vscode.env.openExternal(vscode.Uri.parse('https://www.npmjs.com/package/@ai-passport-core/cli'));
    }
    return;
  }

  output.appendLine('Running onboard...');
  try {
    const log = await runOnboard(cliPath, consumer, folder.uri.fsPath);
    output.appendLine(log);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.appendLine(`Onboard failed: ${message}`);
    void vscode.window.showErrorMessage(`AI Passport onboard failed. See output for details.`);
    return;
  }

  const mcpPath = await writeWorkspaceMcpConfig(folder, cliPath, consumer);
  output.appendLine('');
  output.appendLine(`MCP config: ${mcpPath}`);

  try {
    const readiness = await getReadiness(cliPath, consumer);
    if (readiness.ready) {
      void vscode.window.showInformationMessage(
        `AI Passport ready (${readiness.passport_id}). MCP configured in .vscode/mcp.json`,
      );
    } else {
      void vscode.window.showWarningMessage(
        'Setup partially complete. Run "AI Passport: Show Status" for next steps.',
      );
    }
  } catch {
    void vscode.window.showInformationMessage('Onboard complete. MCP config written to .vscode/mcp.json');
  }
}

async function showStatus(): Promise<void> {
  const { cliPath, consumer } = getConfig();
  const output = getOutputChannel();
  output.clear();
  output.show(true);

  if (!(await cliAvailable(cliPath))) {
    void vscode.window.showErrorMessage(
      `ai-passport CLI not found. Set aiPassport.cliPath or run: npm install -g @ai-passport-core/cli`,
    );
    return;
  }

  try {
    const readiness = await getReadiness(cliPath, consumer);
    output.appendLine(`Ready: ${readiness.ready ? 'yes' : 'no'}`);
    output.appendLine(`Passport: ${readiness.passport_id ?? 'n/a'}`);
    output.appendLine(`Consumer: ${readiness.consumer} (${readiness.consumer_grant ? 'granted' : 'not granted'})`);
    output.appendLine('');
    output.appendLine('Next steps:');
    for (const step of readiness.next_steps) {
      output.appendLine(`  • ${step}`);
    }

    if (readiness.ready) {
      void vscode.window.showInformationMessage(`AI Passport ready — ${readiness.passport_id}`);
    } else {
      void vscode.window.showWarningMessage('AI Passport not ready. See output channel for steps.');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.appendLine(message);
    void vscode.window.showErrorMessage('Could not read passport status.');
  }
}

async function openMcpConfig(): Promise<void> {
  const folder = await getWorkspaceFolder();
  const mcpPath = getMcpConfigPath(folder);

  if (!fs.existsSync(mcpPath)) {
    await configureMcp();
    return;
  }

  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(mcpPath));
  await vscode.window.showTextDocument(doc, { preview: false });
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('ai-passport.setup', () => void setupWorkspace()),
    vscode.commands.registerCommand('ai-passport.configureMcp', () => void configureMcp()),
    vscode.commands.registerCommand('ai-passport.showStatus', () => void showStatus()),
    vscode.commands.registerCommand('ai-passport.openMcpConfig', () => void openMcpConfig()),
  );
}

export function deactivate(): void {}
