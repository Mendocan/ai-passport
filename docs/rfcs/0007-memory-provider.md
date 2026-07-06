# RFC 0007: Memory Provider API (v2 direction)

- **Status:** Draft
- **Author:** Mendocan
- **Created:** 2026-07-06
- **Depends on:** [RFC 0002](0002-provider-api.md), [RFC 0003](0003-permission-model.md), [RFC 0004](0004-encryption.md)
- **Vision:** [vision-v2-memory.md](../research/vision-v2-memory.md)

---

## Summary

Extend AI Passport with a **loosely coupled Memory Provider** model. The passport core remains **identity + permissions + context assembly**. Long-term memory, knowledge graphs, and interaction history live in **pluggable memory providers** — including a reference local vault — accessed only through permission checks.

**Not in scope for this RFC:** embedding a full memory OS inside passport core.

---

## Motivation

Users accumulate AI context across ChatGPT, Claude, Cursor, and local agents. Platform memory is siloed and provider-owned.

AI Passport already solves **who you are** and **what each consumer may read**. The natural next step is standardizing **how optional long-term memory is attached** — without turning the passport into a monolithic database or contradicting local-first encryption.

**Why now:** MCP, Sign in (RFC 0005), and file sync (RFC 0006) provide the trust and transport layers. Memory is the next portable layer.

---

## Design decision: loose coupling

| Question | Answer |
|----------|--------|
| Memory Vault part of AI Passport core? | **No** — provider behind an interface |
| AI Passport works without Memory Provider? | **Yes** — identity-only mode (today) |
| Memory Provider works without AI Passport? | **Yes** — but grants/audit integrate via passport |
| Third parties can ship their own vault? | **Yes** — open provider contract |

```
┌─────────────────────────────────────────────────────────┐
│  AI Passport Core (unchanged responsibility)            │
│  Identity · Permissions · Grants · Audit · Export       │
└───────────────────────────┬─────────────────────────────┘
                            │ Memory Provider API
              ┌─────────────┴─────────────┐
              ▼                           ▼
   ┌────────────────────┐      ┌────────────────────┐
   │ Local Memory      │      │ External Memory     │
   │ (reference impl)  │      │ (enterprise, custom)│
   └────────────────────┘      └────────────────────┘
```

Agents **never** read provider storage directly. Flow:

```
AI Agent → Passport Memory Service → grant check → provider.query() → filtered excerpt
```

This matches today's `export(consumer)` pattern; memory is an additional **context source**, not a replacement for passport sections.

---

## Terminology

| Term | Meaning |
|------|---------|
| **Memory Provider** | Pluggable backend that stores user-owned long-term memory |
| **Memory namespace** | Logical partition, e.g. `preferences`, `projects`, `interactions`, `knowledge` |
| **Memory grant** | Permission for a consumer to read/write specific namespaces |
| **Memory excerpt** | Filtered, size-bounded payload returned to a consumer |
| **Confidence** | Optional metadata on a memory fact (0–1, source count, last verified) |

---

## Provider interface (draft)

Implementations register in `~/.ai-passport/memory/providers.json` (proposed).

```typescript
interface MemoryProvider {
  readonly id: string;           // e.g. "local-vault"
  readonly version: string;

  /** Health and capabilities */
  status(): Promise<MemoryProviderStatus>;

  /** Read — called only after passport grant check */
  query(input: MemoryQuery): Promise<MemoryExcerpt>;

  /** Write — user-initiated or plugin-initiated; never silent agent write */
  store?(input: MemoryStore): Promise<MemoryRecordRef>;

  /** Optional: structured graph traversal */
  graph?(input: GraphQuery): Promise<GraphExcerpt>;
}

interface MemoryQuery {
  consumer: string;
  namespaces: string[];
  intent?: string;              // e.g. "coding_context", "project_timeline"
  limit?: number;               // max records / tokens (TBD)
}

interface MemoryExcerpt {
  records: MemoryRecord[];
  truncated: boolean;
}

interface MemoryRecord {
  id: string;
  namespace: string;
  content: unknown;             // JSON — schema per namespace (TBD)
  confidence?: number;          // 0.0 – 1.0
  verified_at?: string;         // ISO 8601
  sources?: number;             // e.g. conversation count
  created_at: string;
  updated_at: string;
}
```

Passport core **orchestrates**; it does not implement graph storage.

---

## Permission model extension

Today: grants reference passport **sections** (`identity`, `coding`, `projects`).

Proposed additive grant field:

```json
{
  "provider": "cursor",
  "sections": ["identity", "coding", "projects"],
  "memory": {
    "provider_id": "local-vault",
    "namespaces": ["preferences", "projects"],
    "mode": "read"
  }
}
```

| `mode` | Meaning |
|--------|---------|
| `read` | Consumer may query memory excerpts |
| `write` | Consumer may propose stores (still user-audited — TBD) |
| omitted | No memory access (default) |

Revocation of `provider: cursor` revokes memory access for that consumer.

---

## Passport Context assembly

`export(consumer)` and MCP `get_passport_context` gain optional `memory` block:

```json
{
  "identity": { },
  "coding": { },
  "memory": {
    "provider": "local-vault",
    "excerpt": {
      "records": [ ]
    }
  }
}
```

Consumers that do not understand `memory` ignore it (additive, non-breaking).

---

## Reference implementation: Local Memory Vault

First provider: **`local-vault`** — encrypted store under:

```
~/.ai-passport/memory/local-vault/
├── vault.meta.json
├── records/                 # encrypted blobs per record
└── graph/                   # optional index (phase 2)
```

- Same encryption principles as RFC 0004 (per-record keys derived from master)
- Sync via RFC 0006 file provider (encrypted bundle extension — TBD)
- **Does not** store raw provider chat exports by default; ingestion is explicit

---

## Confidence-based memory (phase 2)

Optional record metadata:

```json
{
  "content": { "fact": "User prefers vertical video" },
  "confidence": 0.99,
  "verified_at": "2026-07-06T00:00:00Z",
  "sources": 17
}
```

Decay, merge, and contradiction resolution — **out of scope for v0.2 prototype**; schema reserved.

---

## Knowledge graph (phase 3)

Graph queries (`graph()`) return nodes/edges for project ↔ entity relationships.

Example use case: creative IP (character → series → merchandise). Requires separate indexing RFC or 0007 amendment.

---

## Agent handshake (future)

Bidirectional verification (user passport ↔ agent passport ↔ encrypted session) builds on RFC 0005 Sign in. **Separate RFC 0008 candidate** — not part of 0007 MVP.

---

## Non-goals (0007 draft)

- Cloud plaintext memory on vendor servers
- Silent background ingestion of all chat history
- Replacing passport `identity` / `coding` sections with memory (they coexist)
- Team/org shared memory (separate RFC)
- Confidence engine and graph merge in v0.2 prototype

---

## Migration

Existing passports: **no change required**. Memory providers are opt-in.

```bash
ai-passport memory init              # enable local-vault (proposed)
ai-passport grant cursor --memory preferences,projects
```

---

## Implementation phases

| Phase | Target | Deliverable |
|-------|--------|-------------|
| **A** | Now | RFC 0007 Draft + vision doc |
| **B** | v0.2.0 | Provider interface types, `local-vault` stub, grant `memory` field |
| **C** | v0.2.x | MCP memory excerpt, basic `memory store` CLI |
| **D** | v0.3+ | Confidence metadata, graph index |
| **E** | v1.0 | Provider certification, third-party vaults |

**Timeline intent:** Phase B starts within days on `feature/memory-provider`, not weeks of docs-only.

---

## Drawbacks

- Two storage systems (passport sections + memory vault) until/unless convergence is proven
- Grant UX becomes more complex
- Large memory excerpts risk context bloat — strict limits required
- "One Memory" positioning may blur identity focus if messaging is premature

---

## Open questions

1. Max excerpt size per export (bytes / tokens)?
2. Should `memory.write` require per-store user confirmation in v0.2?
3. Namespace registry — fixed enum vs extensible?
4. Sync bundle format for memory vault (extend RFC 0006 or separate)?
5. Relationship to FOUNDING non-goal "no full chat history" — policy per namespace?

---

## References

- [VISION.md](../VISION.md) — identity vs context boundaries
- [FOUNDING.md](../FOUNDING.md) — project spirit (may evolve via accepted RFC)
- [vision-v2-memory.md](../research/vision-v2-memory.md) — vision expansion notes
