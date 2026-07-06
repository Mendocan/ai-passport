# AI Passport — API Contract

Consumers integrate with AI Passport via CLI, SDK, or MCP. They never read `passport.json` directly.

## Commands

| Command | Description |
|---------|-------------|
| `ai-passport init` | Create encrypted passport |
| `ai-passport onboard [consumer]` | First-time setup + MCP config hint |
| `ai-passport readiness [--consumer] [--json]` | Readiness for consumer (VS Code extension, scripts) |
| `ai-passport info` | Passport ID, version, providers, permissions |
| `ai-passport grant <consumer>` | Approve scoped read access |
| `ai-passport grant <consumer> --memory <ns>` | Grant + memory namespaces (RFC 0007) |
| `ai-passport memory init` | Initialize local memory vault |
| `ai-passport memory status` | Memory providers and grants |
| `ai-passport memory store <ns> <content>` | Store a memory record in local vault |
| `ai-passport authorize <client>` | Issue short-lived sign-in token |
| `ai-passport token inspect <token>` | Token metadata (no context) |
| `ai-passport token exchange <token>` | Exchange token for Passport Context |
| `ai-passport revoke <consumer>` | Revoke all grants and tokens |
| `ai-passport export <consumer>` | Get filtered Passport Context JSON |
| `ai-passport sync status` | Compare local vs remote sync bundle |
| `ai-passport sync push` | Upload encrypted bundle (no master key) |
| `ai-passport sync pull` | Download encrypted bundle |
| `ai-passport sync config --target <dir>` | Save default sync directory |

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

### SDK (recommended)

```typescript
import { Passport } from '@ai-passport-core/cli/sdk';

const passport = await Passport.load();
const info = await passport.info();
const context = await passport.export('cursor');
```

Full reference: [SDK.md](SDK.md)

### Low-level (`PassportManager`)

```typescript
import { PassportManager } from '@ai-passport-core/cli';

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
| `get_passport_status` | Readiness, grants summary, next steps, MCP config hint |
| `get_passport_context` | Audited export for granted consumer (includes `memory` block if granted) |
| `get_active_project` | Read-only peek at first active project |
| `get_memory_context` | Memory excerpt for granted consumer, scoped to allowed namespaces (RFC 0007) |
| `list_grants` | Active grants summary (no secrets) |
