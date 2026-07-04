# RFC 0005: Sign-In Token Format

- **Status:** Accepted
- **Author:** Mendocan
- **Created:** 2026-07-04
- **Depends on:** [RFC 0002](0002-provider-api.md), [RFC 0003](0003-permission-model.md)

---

## Summary

Defines **opaque local tokens** for "Sign in with AI Passport" — short-lived, exchangeable credentials that wrap pre-exported Passport Context.

User guide: [SIGN_IN.md](../SIGN_IN.md)

---

## Motivation

Web and desktop apps need a flow similar to OAuth without a central identity server. Tokens must not expose the master key and must expire.

---

## Decision: opaque local tokens (not JWT)

| Approach | v1 choice | Rationale |
|----------|-----------|-----------|
| Opaque `aip_tok_*` | **Yes** | Simple, local-only, no signing key distribution |
| JWT | Deferred | Cross-device verification — future RFC |

---

## Token format

**Id:** `aip_tok_` + 24 bytes base64url random

**Storage:** `~/.ai-passport/auth/tokens.json`

```json
{
  "tokens": [
    {
      "id": "aip_tok_...",
      "client_id": "my-web-app",
      "grant_id": "grant_my-web-app_abc",
      "passport_id": "aip_...",
      "context": "<Passport Context object>",
      "issued_at": "ISO-8601",
      "expires_at": "ISO-8601",
      "one_time": true,
      "used_at": null
    }
  ]
}
```

Context is captured at `authorize` time (audited export).

---

## Defaults

| Setting | Default |
|---------|---------|
| TTL | 3600 seconds (1 hour) |
| One-time | `true` — invalidated after `token exchange` |
| Reusable | `--reusable` flag sets `one_time: false` |

Expired tokens are purged on read.

---

## CLI flow

```bash
ai-passport authorize my-app --yes
ai-passport token inspect aip_tok_...
ai-passport token exchange aip_tok_...
```

### Localhost callback

```bash
ai-passport authorize my-app --callback http://127.0.0.1:3847/callback --yes
```

Callback URL must be `localhost` or `127.0.0.1` only. Token delivered as `?token=aip_tok_...`.

---

## Revocation

`ai-passport revoke <client_id>` removes all tokens for that client from `tokens.json`.

---

## Security properties

- Master key never in token
- Token file lives alongside passport (same trust boundary)
- One-time tokens prevent replay after exchange
- Inspect endpoint returns metadata only — not full context

---

## Future work

- Signed JWT for cross-machine verification
- Deep link `ai-passport://authorize`
- Hosted relay (requires threat model RFC)

---

## Implementation

- `src/core/auth-token.ts`
- `src/cli/commands/authorize.ts`
- `src/cli/commands/token.ts`
