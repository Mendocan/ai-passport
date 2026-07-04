# RFC 0002: Provider / Consumer API

- **Status:** Accepted
- **Author:** Mendocan
- **Created:** 2026-07-04
- **Depends on:** [RFC 0001](0001-passport-format.md)

---

## Summary

Defines how **consumers** (AI apps, IDEs, web clients) register, request access, and receive **Passport Context** from a user's local passport.

---

## Motivation

"Provider" and "consumer" are used interchangeably in code (`provider` field) — this RFC standardizes terminology and integration surfaces.

---

## Terminology

| Term | Meaning |
|------|---------|
| **Consumer** | Any integration that reads passport data (Cursor, VS Code, `my-web-app`) |
| **Consumer id** | Stable string key, e.g. `cursor`, `vscode`, `my-web-app` |
| **Provider entry** | Record in passport `providers[]` after first grant |
| **Passport Context** | Filtered JSON export after permission check |

---

## Integration surfaces

### 1. CLI

```bash
ai-passport grant <consumer>
ai-passport export <consumer>
ai-passport revoke <consumer>
ai-passport authorize <client>    # Sign in flow
```

### 2. SDK

```typescript
import { Passport } from '@ai-passport-core/cli/sdk';

const passport = await Passport.load();
await passport.grant({ provider: 'my-app', sections: ['identity', 'coding'] });
const context = await passport.export('my-app');
```

### 3. MCP (stdio)

```bash
ai-passport mcp serve --consumer cursor
```

| Tool | Audited | Purpose |
|------|---------|---------|
| `get_passport_status` | No | Readiness / auto-discovery |
| `get_passport_context` | Yes | Full export |
| `get_active_project` | No | Peek first project |
| `list_grants` | No | Grant summary |

### 4. Sign in token exchange

See [RFC 0005](0005-sign-in-token.md).

---

## Consumer registration

On first `grant`, consumer is added to `providers[]`:

```json
{
  "id": "cursor",
  "name": "Cursor",
  "registered_at": "2026-07-04T12:00:00Z",
  "last_access_at": "2026-07-04T12:05:00Z"
}
```

Grant templates in [`config/grant-templates.json`](../../config/grant-templates.json) provide default scopes for known consumers.

---

## Passport Context contract

Required fields:

```json
{
  "passport_version": "1.0.0",
  "exported_at": "ISO-8601",
  "provider": "consumer-id",
  "grant_id": "grant_consumer_abc"
}
```

Plus only **granted sections**. Consumers must:

- Treat context as read-only
- Re-fetch each session
- Stop using data after `revoke`

Full contract: [API.md](../API.md)

---

## Consumer checklist

External apps self-certify via [COMPATIBILITY.md](../COMPATIBILITY.md).

---

## Drawbacks

- MCP is stdio-only in v1 — no remote HTTP API
- Consumer ids are user-defined strings — no global registry yet

---

## Implementation status

| Surface | Status |
|---------|--------|
| CLI grant/export/revoke | ✓ |
| SDK | ✓ |
| MCP Cursor adapter | ✓ |
| Grant templates | ✓ cursor, vscode, claude |
