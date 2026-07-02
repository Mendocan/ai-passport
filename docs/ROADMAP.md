# AI Passport — Roadmap

## Phase 0 — Foundation ✓

- Mission, vision, specification
- JSON schema
- Core classes: Passport, Vault, Identity, Permission, PassportManager

## Phase 1 — Developer identity (current)

- [x] `init` — create encrypted passport
- [x] `info` — passport metadata
- [x] `grant` / `revoke` / `export` — permission model
- [x] MCP server (`ai-passport mcp serve`) — thin Cursor adapter
- [x] Git plugin (`plugin run git`) — repo → coding profile

**MVP exit criteria:**

```bash
ai-passport init
ai-passport info
ai-passport grant cursor --yes
ai-passport export cursor
```

## Phase 2 — Multiple consumers

- VS Code extension (separate repo or package)
- JetBrains plugin (separate)
- Published npm package `@ai-passport/core`

## Phase 3 — Cloud sync

- Optional E2E encrypted sync
- Multi-device passport

## Phase 4 — Open specification

- Public spec at `ai-passport.dev`
- Reference implementation
- RFC process for changes

## Phase 5 — Ecosystem

**Sign in with AI Passport** — cross-platform AI identity standard.
