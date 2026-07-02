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

## Phase 2 — Cursor integration ✓

First real user experience — the "wow" moment.

- [x] MCP adapter + grant flow
- [x] End-to-end Cursor test → [CURSOR_SETUP.md](CURSOR_SETUP.md)
- [x] Auto-discovery UX polish (`get_passport_status`, MCP startup hints)
- [x] First-time onboarding flow (`ai-passport onboard`)

**Scenario:**

```
Cursor opened → Passport found → AI knows your stack → AI adapts
```

## Phase 3 — SDK ✓

Nobody should rewrite AI Passport. Just:

```typescript
import { Passport } from '@ai-passport-core/cli/sdk';

const passport = await Passport.load();
const context = await passport.export('cursor');
```

See [SDK.md](SDK.md). Low-level API remains `PassportManager` for advanced use.

Future: optional separate `@ai-passport-core/sdk` npm package (same API, lighter deps).

## Phase 4 — Open specification ✓

Documentation over code. Companies should say: *"We support AI Passport."*

- [x] Public spec index → [SPECIFICATION.md](SPECIFICATION.md)
- [x] Compatibility checklist → [COMPATIBILITY.md](COMPATIBILITY.md)
- [x] RFC process → [RFC.md](RFC.md)
- [ ] Hosted spec site (GitHub Pages)

## Phase 5 — Ecosystem

- Cloud sync (optional, E2E encrypted)
- VS Code / JetBrains consumers (separate packages)
- **Sign in with AI Passport**
