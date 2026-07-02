# AI Passport — API Contract

Consumers integrate with AI Passport via CLI or programmatic API (`PassportManager`). They never read `passport.json` directly.

## Commands

| Command | Description |
|---------|-------------|
| `ai-passport init` | Create encrypted passport |
| `ai-passport info` | Passport ID, version, providers, permissions |
| `ai-passport grant <consumer>` | Approve scoped read access |
| `ai-passport revoke <consumer>` | Revoke all grants |
| `ai-passport export <consumer>` | Get filtered Passport Context JSON |

## Passport Context (export output)

Returned by `export` when an active grant exists:

```json
{
  "passport_version": "1.0.0",
  "exported_at": "2025-07-02T12:00:00Z",
  "provider": "cursor",
  "grant_id": "grant_cursor_abc123",
  "identity": { "display_name": "...", "role": "..." },
  "coding": { "primary_languages": ["TypeScript"], "..." },
  "projects": [{ "name": "...", "stack": ["..."], "repo_root": "..." }]
}
```

**Rules for consumers:**

- Treat context as **read-only**
- Never write back to passport without explicit user action
- Re-fetch on session start; do not cache across revocations

## Grant request shape

```json
{
  "provider": "cursor",
  "sections": ["identity", "coding", "projects"],
  "project_filter": "active_only",
  "fields": {
    "identity": ["display_name", "role"],
    "projects": ["name", "stack", "conventions", "repo_root"]
  }
}
```

## Programmatic API

```typescript
import { PassportManager } from '@ai-passport/core';

const manager = new PassportManager();
await manager.init();
const info = await manager.info();
const context = await manager.export('cursor');
```

## MCP (Cursor)

Thin stdio adapter in `src/integrations/cursor/` — calls `PassportManager`, no IDE logic in core.

```bash
ai-passport mcp serve --consumer cursor
```

Cursor `mcp.json` example: [`examples/mcp.cursor.json`](../examples/mcp.cursor.json)

| Tool | Description |
|------|-------------|
| `get_passport_context` | Audited export for granted consumer |
| `get_active_project` | Read-only peek at first active project |
| `list_grants` | Active grants summary (no secrets) |
