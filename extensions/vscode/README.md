# AI Passport

**Open-source, user-owned AI identity for VS Code.**

Connect GitHub Copilot (MCP) to your encrypted AI Passport — your coding profile, projects, and preferences stay on your device. You grant access. You revoke it.

## Features

- **Setup Workspace** — runs `ai-passport onboard vscode`, writes `.vscode/mcp.json`
- **Configure MCP** — merges AI Passport into VS Code MCP config
- **Show Status** — passport readiness and next steps
- **Open MCP Config** — edit workspace MCP settings

## Prerequisites

1. [AI Passport CLI](https://www.npmjs.com/package/@ai-passport-core/cli) (global):

   ```bash
   npm install -g @ai-passport-core/cli
   ```

2. VS Code **1.96+** with MCP support (GitHub Copilot Chat)

## Quick start

1. Install this extension
2. Open a project folder
3. Command Palette → **AI Passport: Setup Workspace**
4. Restart MCP servers (`MCP: List Servers`)
5. Ask Copilot: *"What stack am I working with?"*

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `aiPassport.cliPath` | `ai-passport` | Path to CLI executable |
| `aiPassport.consumer` | `vscode` | Consumer id for grants |

## Links

- [Documentation](https://mendocan.github.io/ai-passport/VSCODE_SETUP.html)
- [GitHub](https://github.com/Mendocan/ai-passport)
- [Open spec](https://mendocan.github.io/ai-passport/)
- [npm CLI](https://www.npmjs.com/package/@ai-passport-core/cli)

## License

MIT — open source
