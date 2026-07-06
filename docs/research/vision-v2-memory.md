# AI Passport v2 — Vision Expansion (research)

> **Status:** Research / Draft — not yet accepted as mission change.  
> Technical direction: [RFC 0007](../rfcs/0007-memory-provider.md)

**Created:** 2026-07-06 · Source: external architecture discussion (refined for AI Passport)

---

## Proposed mission (v2 — under review)

| | Current (v1) | Proposed (v2) |
|---|--------------|---------------|
| **Primary** | One identity. Every AI. | One identity. One memory. Every AI. |
| **Supporting** | Your AI identity. Everywhere. | Your AI identity, memory and trust. Everywhere. |

**Decision:** Keep v1 mission on website and npm until positioning review. RFC 0007 **Accepted** with v0.2.0.

---

## Core principle (unchanged)

> The user owns their AI identity **and** long-term memory.  
> AI agents receive **temporary, permission-based** access.

This aligns with [MANIFESTO.md](../MANIFESTO.md). The expansion is **scope**, not philosophy.

---

## What v2 adds

AI Passport today: **identity + permissions + portable context**.

v2 proposes adding a standardized **memory layer** — not by bloating core, but via **Memory Providers** (see RFC 0007).

| Layer | Owner | Examples |
|-------|-------|----------|
| Identity | Passport core | name, locale, role |
| Preferences & coding | Passport sections + plugins | languages, frameworks |
| Long-term memory | Memory providers | projects, notes, workflows |
| Interaction history | Memory providers (opt-in) | summarized sessions, not raw dumps |
| Knowledge graph | Memory providers (phase 3) | entity relationships |

---

## Why local memory?

- User owns the data
- No provider lock-in
- Privacy by default
- Offline-capable consumers
- Easy AI switching

Cloud sync remains **optional and encrypted** (RFC 0006).

---

## Architecture (accepted direction)

```
AI Passport
    ├── Identity
    ├── Permissions
    └── Memory Provider API
             │
     ┌───────┴────────┐
     │                │
Local Vault      Enterprise / Custom Vault
```

Passport **does not manage** vault internals. It standardizes **access**.

---

## Hard questions (answers as of 2026-07-06)

| Question | Answer |
|----------|--------|
| Natural part of Passport or separate product? | **Interface in Passport; storage in providers** |
| Does identity focus get lost? | **Risk if monolithic — mitigated by loose coupling** |
| Core or plugin? | **Plugin / provider** |
| Passport without memory? | **Yes — current product** |
| Memory without passport? | **Yes — but grants/audit integrate via passport** |

---

## Revenue philosophy (notes only)

Open protocol stays free. Possible services: enterprise edition, encrypted backup, marketplace, verification, support, certification.

Revenue around the protocol — not by restricting the protocol. Aligns with open-spec strategy.

---

## What we are NOT doing immediately

- Changing `VISION.md` mission line
- Embedding graph DB in core
- Auto-ingesting all chat history
- Delaying v0.5 identity/MCP stability for memory

---

## Next steps (days, not weeks)

1. **RFC 0007** — Draft ✓ (this cycle)
2. **`feature/memory-provider` branch** — interface types + grant schema extension
3. **v0.2.0 prototype** — `local-vault` stub, `ai-passport memory status`
4. Review → RFC 0007 Accepted or amend
5. Update COMPATIBILITY checklist for memory-aware consumers

---

*One idea. Iterate carefully. Every version gets smarter.*
