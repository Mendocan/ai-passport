# Cursor Integration — Setup & Test

Phase 2 goal: the "wow" moment — Cursor opens, finds your passport, and the AI behaves according to your identity.

```
Cursor opened
      ↓
AI Passport found
      ↓
"This user works with TypeScript + React"
      ↓
AI adapts immediately
```

---

## Prerequisites

- Node.js 20+
- [Cursor](https://cursor.com) installed
- AI Passport CLI installed globally:

```bash
npm install -g @ai-passport-core/cli
```

---

## Step 1 — Create your passport

```bash
ai-passport init
ai-passport info
```

Passport is stored at `~/.ai-passport/` (encrypted).

---

## Step 2 — Enrich from your repo (optional)

```bash
cd your-project
ai-passport plugin run git --path . --yes
```

This detects languages, frameworks, and project metadata.

---

## Step 3 — Grant Cursor permission

```bash
ai-passport grant cursor --yes
```

Verify:

```bash
ai-passport export cursor
```

You should see filtered `identity`, `coding`, and `projects` sections.

---

## Step 4 — Add MCP to Cursor

**After global install** (`npm install -g @ai-passport-core/cli`):

Cursor → **Settings → MCP** → add:

```json
{
  "mcpServers": {
    "ai-passport": {
      "command": "ai-passport",
      "args": ["mcp", "serve", "--consumer", "cursor"]
    }
  }
}
```

**Local development** (from cloned repo):

```json
{
  "mcpServers": {
    "ai-passport": {
      "command": "node",
      "args": ["C:\\Ai_Passport\\dist\\index.js", "mcp", "serve", "--consumer", "cursor"]
    }
  }
}
```

Restart Cursor or reload MCP servers.

---

## Step 5 — Verify MCP tools

In Cursor, confirm these tools are available:

| Tool | Purpose |
|------|---------|
| `get_passport_context` | Full filtered export (audited) |
| `get_active_project` | Current active project |
| `list_grants` | Active permission summary |

---

## Step 6 — The "wow" test

Open a new Cursor chat and ask:

- *"What languages and frameworks do I prefer?"*
- *"What project am I working on?"*
- *"How should you help me based on my coding style?"*

**Pass if:** Cursor answers using your passport data without you re-explaining your stack.

**Fail if:** Cursor asks you to describe yourself from scratch → check grant, MCP config, and restart.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Master key not found` | `ai-passport init --force` |
| `No active grant for cursor` | `ai-passport grant cursor --yes` |
| `Unsupported state or unable to authenticate` | `ai-passport init --force` then re-grant |
| MCP tools not visible | Restart Cursor; verify `ai-passport` is on PATH |
| Wrong coding profile | `ai-passport plugin run git --path . --yes --force` |

---

## Revoke access

```bash
ai-passport revoke cursor
```

Export and MCP tools will stop returning data immediately.
