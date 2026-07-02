# AI Passport — Open Specification

> **Goal:** Any product can say *"We support AI Passport."*

This page is the public entry point for implementers. The canonical machine-readable schema lives in the repository; this document links the pieces together.

---

## Specification documents

| Document | Purpose |
|----------|---------|
| [Technical Specification (SPEC.md)](SPEC.md) | Document model, file layout, security, grants |
| [JSON Schema](../schemas/passport.schema.json) | Canonical passport structure (validate with Ajv) |
| [Example passport](../schemas/examples/passport.example.json) | Reference instance |
| [API Contract](API.md) | CLI, SDK, MCP integration surface |
| [SDK Reference](SDK.md) | `Passport.load()` programmatic API |
| [Security Model](SECURITY.md) | Encryption, key storage, threat model |
| [Architecture](ARCHITECTURE.md) | Core vs integrations vs plugins |
| [Compatibility Checklist](COMPATIBILITY.md) | "Supports AI Passport" criteria |
| [RFC Process](RFC.md) | How to propose schema or API changes |

---

## Versioning

| Layer | Current | Location |
|-------|---------|----------|
| Passport envelope | `1.0.0` | `passport.meta.json`, schema |
| npm package | See [releases](https://github.com/Mendocan/ai-passport/releases) | `@ai-passport-core/cli` |
| MCP server | `1.0.0` | MCP `version` field |

Breaking changes to the passport schema require a **major** envelope version bump and an [RFC](RFC.md).

---

## Integration surfaces

Implementers may integrate via:

1. **Passport Context JSON** — filtered export after grant (recommended for AI consumers)
2. **MCP tools** — stdio server (`ai-passport mcp serve`)
3. **SDK** — `import { Passport } from '@ai-passport-core/cli/sdk'`
4. **CLI** — shell scripts and onboarding (`ai-passport onboard`)

Consumers must **never** read `~/.ai-passport/passport.json` directly.

---

## Quick compatibility statement

> *"[Product] supports AI Passport v1.0.0. Users can grant scoped read access to identity, coding, and project sections via the standard grant flow."*

See [COMPATIBILITY.md](COMPATIBILITY.md) for the full checklist.

---

## Public spec site (future)

Phase 4 MVP ships specification as markdown in this repository. A hosted docs site (GitHub Pages or dedicated domain) will mirror these files — same content, better discoverability.

Track progress in [ROADMAP.md](ROADMAP.md).
