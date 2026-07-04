# AI Passport SDK

Load and use AI Passport from any Node.js application.

## Install

```bash
npm install @ai-passport-core/cli
```

## Quick start

```typescript
import { Passport } from '@ai-passport-core/cli/sdk';

const passport = await Passport.load();
const info = await passport.info();
const context = await passport.export('cursor');
```

That's it. Nobody should rewrite AI Passport — just load and use.

---

## API

### `Passport.load(options?)`

Load an existing passport from `~/.ai-passport/`.

```typescript
const passport = await Passport.load();
const passport = await Passport.load({ home: '/custom/path' });
```

Throws if passport does not exist.

### `Passport.create(options?)`

Create a new passport.

```typescript
const result = await Passport.create();
const result = await Passport.create({ force: true, fromExample: true });
```

### `Passport.exists(home?)`

Check if a passport exists without loading.

---

## Instance methods

| Method | Description |
|--------|-------------|
| `info()` | Passport ID, version, grants |
| `read()` | Full decrypted document |
| `getSection(id)` | Single section (`identity`, `coding`, …) |
| `save(document)` | Write updated document |
| `grant(request)` | Create permission grant |
| `revoke(consumer)` | Revoke grants |
| `export(consumer)` | Filtered context for consumer (audited) |
| `peek(consumer)` | Read-only export (no audit) |
| `listGrants()` | Active grants summary |
| `authorize(client, options?)` | Issue sign-in token |
| `exchangeToken(token)` | Exchange token for context |
| `inspectToken(token)` | Token metadata |

See [SIGN_IN.md](SIGN_IN.md) for the full sign-in flow.

## Example — Cursor consumer

```typescript
import { Passport } from '@ai-passport-core/cli/sdk';

const passport = await Passport.load();

if (!passport.listGrants().some((g) => g.provider === 'cursor')) {
  await passport.grant({
    provider: 'cursor',
    sections: ['identity', 'coding', 'projects'],
  });
}

const context = await passport.export('cursor');
console.log(context.coding?.primary_languages);
```

---

## Alternative import

```typescript
import { AiPassport } from '@ai-passport-core/cli';

const passport = await AiPassport.load();
```

`Passport` from `/sdk` is an alias for `AiPassport`.

Domain model class (decrypted sections wrapper) is exported as `Passport` from the main entry — use `/sdk` for the SDK facade.
