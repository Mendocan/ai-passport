# AI Passport

**One identity. Every AI.**

AI Passport is an open, portable identity layer for artificial intelligence systems. Users own their AI identity — not OpenAI, not Anthropic, not Cursor. Any AI can recognize you with explicit permission, without starting over.

## Mission

> **One identity. Every AI.**

Supporting line:

> *Your AI identity. Everywhere.*

## Vision

Today every AI platform starts from zero. Users repeatedly explain who they are, how they work, what they prefer, and what projects they are on. AI Passport solves this by letting users own a portable identity that AI systems read only with permission.

**North star:** A user should be recognized by any AI, with explicit permission, without having to start over.

Long term, AI Passport becomes for artificial intelligence what OAuth became for authentication — users choose **Sign in with AI Passport** instead of rebuilding context on every platform.

## Core Principles

| Principle | Summary |
|-----------|---------|
| User ownership | The passport belongs to the user |
| Portable | Works across ChatGPT, Claude, Cursor, VS Code, and future AI systems |
| Permission-based | Each AI receives only explicitly allowed sections |
| Local-first | Primary storage on the user's device; cloud sync optional |
| Encrypted | Each section encrypted independently |
| Extensible | Plugins enrich the passport (Git, GitHub, Notion, Jira, etc.) |

## MVP Focus

Developer-focused first release with Cursor integration:

1. User installs AI Passport
2. Cursor detects an existing passport
3. User grants permission
4. Cursor loads coding preferences and active project context
5. AI understands the developer immediately — no manual onboarding

## Repository Layout

```
ai-passport/
├── docs/
│   ├── VISION.md          # Constitution — mission & principles
│   ├── ARCHITECTURE.md    # Core independence, layer model
│   ├── SPEC.md            # Technical specification (evolves)
│   ├── ROADMAP.md         # Phases
│   ├── SECURITY.md        # Encryption & threat model
│   └── API.md             # Consumer contract
├── config/
│   └── grant-templates.json   # CLI convenience (not imported by core)
├── src/
│   ├── core/              # Passport, Vault, Identity, Permission, PassportManager
│   ├── crypto/            # cipher, keychain
│   ├── cli/               # Commands
│   └── schema/            # JSON Schema validation
├── plugins/
│   └── git/
│       ├── plugin.json
│       └── (analyzer in src/plugins/git/)
├── src/plugins/git/       # Git repository analyzer
├── examples/
│   └── mcp.cursor.json    # Cursor MCP config sample
```

## Documentation

- [Vision (constitution)](docs/VISION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Technical Specification](docs/SPEC.md)
- [Roadmap](docs/ROADMAP.md)
- [Security](docs/SECURITY.md)
- [Publishing](docs/PUBLISHING.md)

## Status

**Phase 1 — MCP ready.** Core + CLI + Cursor MCP adapter (`ai-passport mcp serve`).

## Install (npm)

```bash
npm install -g @ai-passport-core/cli
ai-passport init
ai-passport grant cursor --yes
ai-passport plugin run git --path . --yes --force
ai-passport export cursor
```

Without global install:

```bash
npx @ai-passport-core/cli init
```

## Development (local)

`ai-passport` is not global by default. Use one of these:

```bash
npm run build
npm run passport -- init --from-example
npm run passport -- grant cursor --yes
npm run passport -- plugin run git --path . --yes --force
npm run passport -- export cursor
```

Alternatives:

```bash
node dist/index.js init --from-example
npx ai-passport init --from-example    # works inside this project after npm install
npm run dev -- init --from-example      # runs TypeScript directly
```

Global install (optional): `npm link` from project root, then `ai-passport` works everywhere.

Add to Cursor MCP settings — Windows example: `examples/mcp.cursor.windows.json`  
(Use full path to `dist/index.js` with `node` as command.)

Passport files are stored in `~/.ai-passport/` (encrypted sections + OS keychain master key).


## License

MIT — see [LICENSE](LICENSE).

Publishing guide: [docs/PUBLISHING.md](docs/PUBLISHING.md)
