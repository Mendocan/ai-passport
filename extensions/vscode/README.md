# AI Passport — VS Code Extension

Open-source VS Code integration for [AI Passport](https://github.com/Mendocan/ai-passport).

## Prerequisites

- [AI Passport CLI](https://www.npmjs.com/package/@ai-passport-core/cli): `npm install -g @ai-passport-core/cli`
- VS Code 1.96+ with MCP support (GitHub Copilot Chat)

## Commands

| Command | Action |
|---------|--------|
| **AI Passport: Setup Workspace** | `onboard vscode`, write `.vscode/mcp.json` |
| **AI Passport: Configure MCP** | Write or merge MCP server entry |
| **AI Passport: Show Status** | Passport readiness + next steps |
| **AI Passport: Open MCP Config** | Open workspace `mcp.json` |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `aiPassport.cliPath` | `ai-passport` | CLI executable path |
| `aiPassport.consumer` | `vscode` | Consumer id for grants |

## Development

```bash
cd extensions/vscode
npm install
npm run compile
```

Press F5 in VS Code to launch Extension Development Host.

## License

MIT
