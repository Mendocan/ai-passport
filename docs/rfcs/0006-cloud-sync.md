# RFC 0006: Cloud Sync (E2E Encrypted)

- **Status:** Draft
- **Author:** Mendocan
- **Created:** 2026-07-04
- **Depends on:** [RFC 0001](0001-passport-format.md), [RFC 0004](0004-encryption.md)

---

## Summary

Optional cloud backup and multi-device sync where the **server never sees plaintext**. Passport remains encrypted end-to-end; user holds keys.

---

## Motivation

Users may want the same passport on laptop + desktop without manual export/import. Cloud sync must not violate "user owns the identity" or centralize trust.

---

## Proposed architecture (draft)

```
Device A                         Sync server                    Device B
   │                                  │                            │
   │  upload ciphertext envelope      │                            │
   │─────────────────────────────────►│                            │
   │  (passport.json encrypted)       │  store blob only           │
   │                                  │◄───────────────────────────│
   │                                  │  download ciphertext       │
   │                                  │                            │
   │  master key stays local          │  no master key on server   │
```

---

## Requirements (proposed)

1. Upload/download **encrypted envelope** only — same format as local `passport.json`
2. Master key **never** uploaded
3. Conflict resolution via snapshot timestamps + user merge UI (TBD)
4. Optional: sync `grants.json` separately (plaintext metadata)
5. Auth: device pairing token or Sign in flow (RFC 0005 extension)

---

## Open questions

- Provider: self-hosted vs managed `@ai-passport-core/sync`
- CRDT vs last-write-wins vs manual merge
- How to bootstrap second device without key transfer
- Revocation and device list management

---

## Non-goals (draft)

- Shared team/org passports (separate RFC)
- Server-side export or AI access

---

## Next steps

1. Discussion on GitHub
2. Threat model appendix
3. Prototype CLI: `ai-passport sync push` / `pull`

**Not implemented in v0.1.x.**
