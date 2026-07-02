# Sign in with AI Passport (Draft)

**Status:** Draft — not implemented  
**Phase:** 5 — Ecosystem

---

## Goal

Web and cloud apps request scoped identity from the user's local passport — similar to "Sign in with Google", but user-owned and encrypted at source.

---

## Flow (proposed)

```
App                    User browser              Local passport
 │                          │                         │
 │── redirect / deep link ──►│                         │
 │                          │── approve in CLI ──────►│
 │                          │                         │ grant + export
 │◄── one-time context ─────│◄────────────────────────│
 │    (short-lived token)   │                         │
```

1. App registers `client_id` and requested sections
2. User runs `ai-passport authorize <client_id>` (future command) or approves in UI
3. App receives **Passport Context** or signed JWT referencing grant id
4. Token expires; app must re-request — no permanent API keys in app

---

## Security requirements

- Never transmit master key
- Context tokens expire (e.g. 1 hour)
- User can revoke per client via `ai-passport revoke <client_id>`
- Audit log entries for each export

---

## Open questions (RFC needed)

- JWT vs opaque token vs direct context POST
- Deep link protocol (`ai-passport://authorize?...`)
- Hosted relay vs purely local callback
- Multi-device sync interaction

Submit proposals via [RFC.md](RFC.md).
