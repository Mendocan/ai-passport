# VS Code Integration — Setup

Any MCP-compatible VS Code extension can consume AI Passport the same way as Cursor.

---

## Prerequisites

- Node.js 20+
- VS Code with an MCP-capable AI extension (e.g. Copilot Chat + MCP support, or compatible fork)
- AI Passport CLI:

```bash
npm install -g @ai-passport-core/cli
```

---

## Step 1 — Onboard

```bash
ai-passport onboard vscode --yes
```

Optional git enrichment:

```bash
ai-passport onboard vscode --path . --yes
```

This grants the `vscode` consumer (sections: `coding`, `projects` per [grant-templates.json](../config/grant-templates.json)).

---

## Step 2 — MCP configuration

Add to your VS Code MCP settings (path varies by extension):

```json
{
  "mcpServers": {
    "ai-passport": {
      "command": "ai-passport",
      "args": ["mcp", "serve", "--consumer", "vscode"]
    }
  }
}
```

**Local development:**

```json
{
  "mcpServers": {
    "ai-passport": {
      "command": "node",
      "args": ["C:\\path\\to\\ai-passport\\dist\\index.js", "mcp", "serve", "--consumer", "vscode"]
    }
  }
}
```

See [examples/mcp.vscode.json](../examples/mcp.vscode.json).

---

## Step 3 — Verify tools

| Tool | Purpose |
|------|---------|
| `get_passport_status` | Readiness + next steps |
| `get_passport_context` | Filtered export (audited) |
| `get_active_project` | Active project peek |
| `list_grants` | Grant summary |

Ask your AI assistant: *"What stack am I working with?"*

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No grant for vscode | `ai-passport grant vscode --yes` |
| Passport missing | `ai-passport init` or `ai-passport onboard vscode --yes` |
| Wrong sections | Revoke and re-grant: `ai-passport revoke vscode` then grant again |

---

## Cursor vs VS Code

| | Cursor | VS Code |
|---|--------|---------|
| Consumer id | `cursor` | `vscode` |
| Default sections | identity, coding, projects | coding, projects |
| MCP command | Same `ai-passport mcp serve` | Same |

Core and MCP server are shared — only the consumer id and grant scope differ.
