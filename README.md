# AI Passport

**One identity. Every AI.**

AI Passport is an open identity layer for AI systems. It allows users—not AI providers—to own, manage and securely share their AI identity across applications.

[![npm](https://img.shields.io/npm/v/@ai-passport-core/cli)](https://www.npmjs.com/package/@ai-passport-core/cli)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Links:** [Spec site](https://mendocan.github.io/ai-passport/) · [npm](https://www.npmjs.com/package/@ai-passport-core/cli) · [GitHub](https://github.com/Mendocan/ai-passport) · [Manifesto](docs/MANIFESTO.md) · [Cursor Setup](docs/CURSOR_SETUP.md)

---

## Quick start

```bash
npm install -g @ai-passport-core/cli
ai-passport init
ai-passport grant cursor --yes
ai-passport plugin run git --path . --yes
ai-passport export cursor
```

Without global install: `npx @ai-passport-core/cli init`

---

## Mission

> **One identity. Every AI.**

Supporting line: *Your AI identity. Everywhere.*

**North star:** A user should be recognized by any AI, with explicit permission, without having to start over.

---

## What it does

| Feature | Description |
|---------|-------------|
| **Local passport** | Encrypted identity at `~/.ai-passport/` |
| **Permissions** | Grant / revoke per AI consumer (Cursor, etc.) |
| **Git plugin** | Detect languages, frameworks, project from repo |
| **MCP server** | Cursor reads passport via `ai-passport mcp serve` |
| **Portable schema** | Open `passport.schema.json` format |

---

## Cursor integration

See **[docs/CURSOR_SETUP.md](docs/CURSOR_SETUP.md)** for the full setup and "wow moment" test.

MCP config (after global install):

```json
{
  "mcpServers": {
    "ai-passport": {
      "command": "ai-passport",
      "args": ["mcp", "serve", "--consumer", "cursor"]
    }
  }
}
```

---

## CLI commands

| Command | Description |
|---------|-------------|
| `ai-passport init` | Create encrypted passport |
| `ai-passport onboard [consumer]` | First-time setup + MCP config |
| `ai-passport info` | Passport ID, grants, version |
| `ai-passport grant <consumer>` | Approve scoped access |
| `ai-passport authorize <client>` | Sign in — issue short-lived token |
| `ai-passport token exchange <token>` | Exchange token for context JSON |
| `ai-passport revoke <consumer>` | Revoke all grants |
| `ai-passport export <consumer>` | Filtered JSON context |
| `ai-passport plugin run git` | Analyze repo → coding profile |
| `ai-passport mcp serve` | Start MCP server (stdio) |

---

## Programmatic API

**SDK (recommended):**

```typescript
import { Passport } from '@ai-passport-core/cli/sdk';

const passport = await Passport.load();
const info = await passport.info();
const context = await passport.export('cursor');
```

See [SDK.md](SDK.md) for the full API.

**Low-level:**

```typescript
import { PassportManager } from '@ai-passport-core/cli';

const manager = new PassportManager();
const info = await manager.info();
const context = await manager.export('cursor');
```

---

## Documentation

- [Manifesto](docs/MANIFESTO.md) — contribution compass (8 principles)
- [Vision (constitution)](docs/VISION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Cursor Setup](docs/CURSOR_SETUP.md)
- [SDK](docs/SDK.md)
- [Technical Specification](docs/SPEC.md)
- [Roadmap](docs/ROADMAP.md)
- [Planning & TODO](docs/PLANNING.md)
- [Security](docs/SECURITY.md)
- [API Contract](docs/API.md)
- [Open Specification](docs/SPECIFICATION.md)
- [Compatibility Checklist](docs/COMPATIBILITY.md)
- [RFC Process](docs/RFC.md)
- [Sign in with AI Passport (draft)](docs/SIGN_IN.md)
- [Ecosystem](docs/ECOSYSTEM.md)
- [VS Code Setup](docs/VSCODE_SETUP.md)

---

## Demo (30 seconds)

```powershell
.\scripts\demo.ps1
```

See [docs/DEMO.md](docs/DEMO.md) · Record a GIF for README when ready.

---

## Development

```bash
git clone https://github.com/Mendocan/ai-passport.git
cd ai-passport
npm install
npm run build
npm run passport -- init --from-example
npm test
```

---

## Status

**Phase 4 complete** — Open spec index, compatibility checklist, RFC process.  
**Phase 5 in progress** — Sign in with AI Passport implemented (`authorize`, `token exchange`).

---

## License

MIT — see [LICENSE](LICENSE).
