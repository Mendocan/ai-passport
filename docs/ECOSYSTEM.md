# AI Passport — Ecosystem (Phase 5)

> Expand beyond a single IDE. Same passport, many consumers.

---

## Vision

```
        ┌─────────────┐
        │  AI Passport │  ~/.ai-passport (encrypted, local-first)
        └──────┬──────┘
               │ grants + export
     ┌─────────┼─────────┬─────────────┐
     ▼         ▼         ▼             ▼
  Cursor    VS Code   Claude      Your app
  (MCP)     (MCP)     (MCP)       (SDK)
```

Users grant each consumer scoped read access. Revoke anytime.

---

## Current consumers

| Consumer | Status | Guide |
|----------|--------|-------|
| **Cursor** | Reference implementation | [CURSOR_SETUP.md](CURSOR_SETUP.md) |
| **VS Code** | MCP-compatible (generic) | [VSCODE_SETUP.md](VSCODE_SETUP.md) |
| **Claude Desktop** | Grant template ready | `ai-passport grant claude --yes` + MCP config |
| **Custom apps** | SDK | [SDK.md](SDK.md) |

---

## Planned

### Cloud sync (optional, E2E encrypted)

- Passport stays encrypted before upload
- User-held keys; server stores ciphertext only
- Conflict resolution via snapshot merge (RFC required)
- **Not implemented** — spec draft in future RFC

### Separate consumer packages

- `@ai-passport-core/cursor` — thin MCP wrapper (optional split from CLI)
- `@ai-passport-core/vscode` — VS Code extension (future)
- Core remains IDE-agnostic

### Sign in with AI Passport

OAuth-style flow for web apps — **implemented**. See [SIGN_IN.md](SIGN_IN.md).

```bash
ai-passport authorize my-app --yes
ai-passport token exchange aip_tok_...
```

Future RFC items: JWT, deep links, hosted relay.

---

## Add your product

1. Pick a consumer id (e.g. `my-ai-app`)
2. Add grant template via PR or local config
3. Integrate via [SDK](SDK.md) or MCP
4. Self-certify with [COMPATIBILITY.md](COMPATIBILITY.md)

---

## Contributing

See [MANIFESTO.md](MANIFESTO.md) and [RFC.md](RFC.md).
