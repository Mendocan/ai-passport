# @ai-passport-core/sdk

Lightweight Node.js SDK for [AI Passport](https://github.com/Mendocan/ai-passport) — no CLI or MCP dependencies.

## Install

```bash
npm install @ai-passport-core/sdk
```

## Quick start

```typescript
import { Passport } from '@ai-passport-core/sdk';

const passport = await Passport.load();
const context = await passport.export('my-app');
```

Requires an existing passport (`ai-passport init` via the CLI, or `Passport.create()`).

## vs `@ai-passport-core/cli/sdk`

| Package | Use when |
|---------|----------|
| `@ai-passport-core/sdk` | Embedding in apps — lighter deps |
| `@ai-passport-core/cli/sdk` | Same API; you already depend on the CLI |

Full API: [SDK.md](https://mendocan.github.io/ai-passport/SDK.html)

MIT · Open source
