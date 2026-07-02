# AI Passport — Technical Specification (MVP)

**Version:** 0.1.0-draft  
**Status:** Foundation — implementation not started

---

## 1. Overview

AI Passport is a local-first, encrypted document (`passport.json`) plus a runtime that:

1. Creates and updates passport sections
2. Enforces per-provider permissions
3. Exposes a **filtered view** to integrations (never the raw file by default)

Integrations (Cursor first) consume a **Passport Context** — a JSON subset produced after permission checks.

---

## 2. File Layout (user machine)

```
~/.ai-passport/
├── passport.json              # Encrypted envelope (see §4)
├── passport.meta.json         # Version, updated_at, section index (non-sensitive)
├── keys/
│   └── master.key             # OS keychain reference only; key material not on disk
├── permissions/
│   └── grants.json            # Active grants per provider
├── audit/
│   └── access.log             # Append-only access log (local)
└── plugins/
    └── <plugin-id>/
        └── config.json
```

Project-level override (optional):

```
<workspace>/.ai-passport/
└── project.json               # Active project slice; merged at read time
```

---

## 3. Document Model

Canonical schema: [`schemas/passport.schema.json`](../schemas/passport.schema.json)

### Top-level sections

| Section | Purpose | Typical grant to Cursor |
|---------|---------|-------------------------|
| `identity` | Display name, role, timezone, locale | Optional |
| `preferences` | Communication style, language, verbosity | Partial |
| `coding` | Languages, frameworks, style rules | Yes |
| `projects` | Active and recent projects | Active only |
| `permissions` | Grant definitions (metadata) | No (runtime only) |
| `providers` | Registered integrations | No |

### Versioning

- `version` follows semver on the envelope: `1.0.0`
- Breaking schema changes bump major; readers reject unknown major versions
- Plugins declare `plugin_api_version` compatibility

---

## 4. Security Model

### 4.1 Encryption

- **Algorithm:** AES-256-GCM per section
- **Master key:** Derived key stored in OS secure store
  - Windows: Credential Manager
  - macOS: Keychain
  - Linux: libsecret / keyring
- **Section keys:** Derived from master + section id (HKDF-SHA256)
- **On disk:** `passport.json` stores ciphertext blobs per section, not plaintext

```json
{
  "version": "1.0.0",
  "sections": {
    "coding": {
      "ciphertext": "<base64>",
      "nonce": "<base64>",
      "alg": "AES-256-GCM",
      "updated_at": "2025-07-02T12:00:00Z"
    }
  }
}
```

Compromising the `coding` section key must not decrypt `identity` or `projects`.

### 4.2 Permissions

Grants are stored in `permissions/grants.json`:

```json
{
  "grants": [
    {
      "id": "grant_cursor_001",
      "provider": "cursor",
      "sections": ["coding", "projects"],
      "project_filter": "active_only",
      "fields": {
        "projects": ["name", "stack", "conventions", "repo_root"]
      },
      "issued_at": "2025-07-02T12:00:00Z",
      "expires_at": null,
      "revoked": false
    }
  ]
}
```

**Rules:**

- Default deny — no grant, no data
- Integrations request a scope; user approves via CLI or UI
- Revocation sets `revoked: true`; runtime must check on every read
- Optional TTL via `expires_at`

### 4.3 Access audit

Every integration read appends to `audit/access.log`:

```json
{"ts":"2025-07-02T12:00:00Z","provider":"cursor","grant_id":"grant_cursor_001","sections":["coding","projects"]}
```

### 4.4 Threat model (MVP)

| Threat | Mitigation |
|--------|------------|
| Malicious integration reads entire passport | Scoped grants; filtered export API |
| Stolen passport file | Section encryption; master key in OS store |
| One section leaked | Independent section keys |
| User wants to disconnect Cursor | `passport revoke cursor` |

Out of scope for MVP: HSM, multi-user passports, cloud key escrow.

---

## 5. Runtime API

MVP exposes a local API (CLI + MCP). No network listener in v1.

### 5.1 CLI commands

```
passport init                    Create passport and master key
passport status                  Show version, grants, last updated
passport show [--section coding] Decrypt and print section (user only)
passport grant <provider>        Interactive scope approval
passport revoke <provider>       Revoke all grants for provider
passport export <provider>       Emit filtered Passport Context JSON
passport plugin list|install     Plugin management
```

### 5.2 Passport Context (integration output)

What Cursor receives after `passport export cursor`:

```json
{
  "passport_version": "1.0.0",
  "exported_at": "2025-07-02T12:00:00Z",
  "provider": "cursor",
  "grant_id": "grant_cursor_001",
  "identity": { "display_name": "...", "role": "..." },
  "coding": {
    "primary_languages": ["TypeScript", "Python"],
    "frameworks": ["React", "FastAPI"],
    "style": { "indent": 2, "quotes": "single", "semicolons": false },
    "ai_preferences": {
      "explain_before_code": true,
      "prefer_minimal_diffs": true
    }
  },
  "projects": [
    {
      "name": "AI Passport",
      "stack": ["TypeScript", "Node"],
      "conventions": ["local-first", "permission-based"],
      "repo_root": "c:\\Ai_Passport"
    }
  ]
}
```

Integrations must treat this as **read-only context**, not a write channel back into the passport (writes go through explicit user commands or plugins).

### 5.3 MCP server (Cursor integration)

**Server name:** `ai-passport`

| Tool | Description |
|------|-------------|
| `get_passport_context` | Returns current filtered context for Cursor grant |
| `get_active_project` | Returns active project slice only |
| `list_grants` | User-facing grant summary (no secrets) |

MCP config example (user `mcp.json`):

```json
{
  "mcpServers": {
    "ai-passport": {
      "command": "ai-passport",
      "args": ["mcp", "serve"]
    }
  }
}
```

### 5.4 Cursor rules injection (optional path)

On grant, CLI can write `.cursor/rules/ai-passport.mdc` summarizing coding preferences — only if user opts in. MCP is the primary integration; rules are a fallback for offline context.

---

## 6. Plugin System

### 6.1 Plugin manifest

`plugins/<id>/plugin.json`:

```json
{
  "id": "git",
  "name": "Git Repository Analyzer",
  "version": "1.0.0",
  "plugin_api_version": "1",
  "writes_to": ["coding", "projects"],
  "permissions_required": ["filesystem.read.repo"]
}
```

### 6.2 Plugin interface (conceptual)

```
analyze(context) → PartialSectionUpdate[]
```

- Plugins run locally via `passport plugin run <id>`
- Updates merge into target sections after user confirmation (MVP: `--yes` flag for CI)
- Plugins cannot read sections they are not authorized to write

### 6.3 MVP plugins

| Plugin | Input | Output |
|--------|-------|--------|
| `git` | Repository path | Languages, frameworks, `.editorconfig`, commit style hints |
| `github` | (Phase 1.1) Remote metadata | Repo list, primary languages |

---

## 7. Git Plugin — Coding Profile Heuristics

Signals used to build `coding` section:

- `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod` → frameworks
- File extension counts → primary languages
- `.editorconfig`, Prettier, ESLint configs → style
- `README`, `CONTRIBUTING` → conventions (optional NLP in later phase)

User can override any detected value; detection never overwrites manual edits without `--force`.

---

## 8. Implementation Stack (proposed)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript (Node 20+) | MCP SDK, cross-platform, Cursor ecosystem |
| CLI | `commander` | Standard, small surface |
| Crypto | Node `crypto` (AES-GCM, HKDF) | No extra native deps for MVP |
| Keychain | `keytar` or platform-specific | OS secure storage |
| Schema validation | Ajv | JSON Schema for `passport.schema.json` |
| MCP | `@modelcontextprotocol/sdk` | Cursor-native integration |

Package name (proposal): `@ai-passport/core`, binary `ai-passport`.

---

## 9. Build Order

| Step | Deliverable | Depends on |
|------|-------------|------------|
| **1** | `passport.schema.json` + Ajv validators | — |
| **2** | Core: init, encrypt/decrypt section, master key | Step 1 |
| **3** | Permissions: grant, revoke, export filter | Step 2 |
| **4** | CLI: init, grant, export, status | Step 3 |
| **5** | MCP server: `get_passport_context` | Step 4 |
| **6** | Git plugin: repo → coding profile | Step 4 |
| **7** | Cursor docs + sample grant flow | Step 5 |

---

## 10. Open Questions

1. **Project scope:** Global `projects[]` vs per-workspace `.ai-passport/project.json` — MVP uses both (merge).
2. **Updates from AI:** Should Cursor suggest passport updates? Deferred — user-initiated only in v1.
3. **Sync format:** CRDT vs snapshot sync — deferred to Phase 3.
4. **Spec governance:** Foundation repo + RFC process in Phase 4.

---

## 11. Success Criteria (MVP)

- [ ] User runs `passport init` and gets an encrypted local passport
- [ ] User runs `passport grant cursor` and approves coding + active project
- [ ] Cursor MCP returns Passport Context without exposing revoked or ungranted sections
- [ ] Git plugin populates coding profile from a real repository
- [ ] `passport revoke cursor` immediately blocks further exports
