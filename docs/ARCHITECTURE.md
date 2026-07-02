# AI Passport — Architecture

## Core principle

**AI Passport Core does not depend on any AI provider, IDE, or company.**

The core is infrastructure. Consumers (Cursor, VS Code, JetBrains, Claude) integrate with the core — not the other way around.

```
Cursor      ──┐
VS Code     ──┼──►  AI Passport Core
JetBrains   ──┘
```

**Never this:**

```
AI Passport
 ├── Cursor adapter   ❌
 ├── VS Code adapter  ❌
 └── JetBrains adapter ❌
```

The second model creates dependency. If Cursor is replaced tomorrow, the core must still work.

---

## Layers

| Layer | Responsibility | Location |
|-------|----------------|----------|
| **Passport** | Domain model — identity, preferences, coding, projects | `src/core/passport.ts` |
| **Vault** | Encrypted storage — encrypt, decrypt, read, write | `src/core/vault.ts` |
| **Identity** | Default identity generation, passport ID | `src/core/identity.ts` |
| **Permission** | Grants, revoke, export filter, audit log | `src/core/permission.ts` |
| **PassportManager** | Orchestrates all core operations | `src/core/passport-manager.ts` |
| **Crypto** | AES-GCM, HKDF, OS keychain | `src/crypto/` |
| **CLI** | User-facing commands | `src/cli/` |
| **Config** | Optional grant templates (not imported by core) | `config/` |

---

## Consumer vs plugin

| Type | Role | Examples | Lives in core repo? |
|------|------|----------|---------------------|
| **Consumer** | Reads passport with permission | Cursor, VS Code, Claude | No — they call core API/CLI |
| **Plugin** | Enriches passport data | Git, GitHub, Notion | Separate packages later |

Grant templates in `config/grant-templates.json` are **CLI convenience only**. Core never imports them.

---

## Core-first build order

1. Create passport
2. Encrypt
3. Validate
4. Read
5. Permission check
6. Export filtered context

Only after this works: consumer integrations (MCP, extensions).

---

## Document governance

| Document | Role | Change frequency |
|----------|------|------------------|
| `VISION.md` | Constitution — mission, principles | Rarely |
| `SPEC.md` | Technical implementation | Often |
| `SECURITY.md` | Threat model, encryption | When security changes |
| `API.md` | Export contract for consumers | When API changes |
| `ROADMAP.md` | Phases and milestones | Quarterly |
