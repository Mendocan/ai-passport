# Sign in with AI Passport

**Status:** Implemented (v0.1.3+)  
**Phase:** 5 — Ecosystem

---

## Goal

Web and cloud apps request scoped identity from the user's local passport — similar to "Sign in with Google", but user-owned and encrypted at source.

---

## Flow

```
App                         User machine
 │                               │
 │  1. User runs authorize       │
 │──────────────────────────────►│ ai-passport authorize my-app --yes
 │                               │ → grant (if needed) + export + token
 │  2. App receives token        │
 │◄──────────────────────────────│ aip_tok_...
 │  3. App exchanges token       │
 │──────────────────────────────►│ ai-passport token exchange <token>
 │◄──────────────────────────────│ Passport Context JSON
```

1. App registers a `client_id` (any string, e.g. `my-web-app`)
2. User runs `ai-passport authorize <client_id>` (or `--yes` to auto-grant from template)
3. App receives an opaque token `aip_tok_...`
4. App exchanges the token for **Passport Context** (one-time by default)
5. Token expires (default 1 hour); revoke via `ai-passport revoke <client_id>`

---

## CLI

### Issue token

```bash
ai-passport authorize my-web-app --yes
ai-passport authorize my-web-app --sections identity,coding --ttl 1800 --yes
ai-passport authorize my-web-app --reusable --yes
ai-passport authorize my-web-app --callback http://127.0.0.1:3847/callback --yes
```

### Inspect / exchange

```bash
ai-passport token inspect aip_tok_...
ai-passport token exchange aip_tok_...
```

---

## SDK

```typescript
import { Passport } from '@ai-passport-core/cli/sdk';

const passport = await Passport.load();

const { token, expires_at } = await passport.authorize('my-web-app', {
  grantRequest: { provider: 'my-web-app', sections: ['identity', 'coding'] },
  ttlSeconds: 3600,
  oneTime: true,
});

const context = passport.exchangeToken(token);
```

---

## Security

- Master key never leaves the machine
- Tokens stored locally in `~/.ai-passport/auth/tokens.json`
- Default: **one-time** exchange; token invalidated after use
- Default TTL: **3600 seconds** (1 hour)
- `revoke <client>` removes grants **and** outstanding tokens
- Callback URLs restricted to `localhost` / `127.0.0.1` only
- Each `authorize` triggers audited export (access log)

---

## App integration pattern

**Local Node backend (same machine):**

```typescript
import { Passport } from '@ai-passport-core/cli/sdk';

export async function signInWithPassport(token: string) {
  const passport = await Passport.load();
  return passport.exchangeToken(token);
}
```

**Web dev loop:**

1. App listens on `http://127.0.0.1:3847/callback`
2. User runs: `ai-passport authorize my-app --callback http://127.0.0.1:3847/callback --yes`
3. App receives `?token=aip_tok_...` and exchanges it

---

## Future (RFC)

- Signed JWT for cross-device verification
- Deep link protocol (`ai-passport://authorize?...`)
- Hosted relay for remote apps
- Cloud sync interaction

See [RFC.md](RFC.md).
