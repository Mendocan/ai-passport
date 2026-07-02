# AI Passport — Roadmap

> Standard first, then ecosystem. See [MANIFESTO.md](MANIFESTO.md).

## Phase 0 — Foundation ✓

- Mission, vision, manifesto, specification
- JSON schema
- Core: Passport, Vault, Identity, Permission, PassportManager

## Phase 1 — Core ✓

- [x] Passport creation, encryption, validation
- [x] CLI (`init`, `info`, `grant`, `revoke`, `export`, `show`)
- [x] Git plugin (`plugin run git`)
- [x] MCP server (`mcp serve`)
- [x] npm publish [`@ai-passport-core/cli`](https://www.npmjs.com/package/@ai-passport-core/cli)
- [x] GitHub repository

## Phase 2 — Cursor integration (current)

First real user experience — the "wow" moment.

- [x] MCP adapter + grant flow
- [ ] End-to-end Cursor test documented → [CURSOR_SETUP.md](CURSOR_SETUP.md)
- [ ] Auto-discovery UX polish
- [ ] First-time onboarding flow

**Scenario:**

```
Cursor opened → Passport found → AI knows your stack → AI adapts
```

## Phase 3 — SDK

Nobody should rewrite AI Passport. Just:

```typescript
import { PassportManager } from '@ai-passport-core/cli';

const manager = new PassportManager();
const passport = await manager.read();
```

Future: separate `@ai-passport-core/sdk` package with `Passport.load()`.

## Phase 4 — Open specification

Documentation over code. Companies should say: *"We support AI Passport."*

- Public spec site
- Compatibility checklist
- RFC process for schema changes

## Phase 5 — Ecosystem

- Cloud sync (optional, E2E encrypted)
- VS Code / JetBrains consumers (separate packages)
- **Sign in with AI Passport**
