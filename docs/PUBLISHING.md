# Publishing @ai-passport-core/cli

## Pre-flight checklist

1. `npm whoami` — logged in to npm
2. `@ai-passport` org exists (or use `npm publish --access public` for scoped package)
3. `package.json` — set `author`, `repository`, `homepage` if available
4. `npm run pack:check` — inspect tarball contents
5. `npm test` — all tests pass
6. `npm publish --access public --dry-run` — final dry run

## Publish commands

```bash
npm login
npm run build
npm test
npm publish --access public
```

Scoped package `@ai-passport-core/cli` requires `--access public` on first publish unless the org is public by default.

## After install (users)

```bash
npm install -g @ai-passport-core/cli
ai-passport init
ai-passport grant cursor --yes
ai-passport plugin run git --path . --yes --force
```

Or without global install:

```bash
npx @ai-passport-core/cli init
```

## Cursor MCP (global install)

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

## Version bumps

```bash
npm version patch   # 0.1.0 → 0.1.1
npm publish --access public
```

## Package contents

Published files (`package.json` `files` field):

- `dist/` — compiled JS + types
- `schemas/` — JSON schema
- `config/` — grant templates
- `examples/` — MCP config samples
- `plugins/` — plugin manifests

Source (`src/`), tests, and docs stay in the repository only.
