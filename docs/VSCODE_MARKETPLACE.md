# VS Code Marketplace — AI Passport Extension

Publisher: **mendocan** · Extension id: **mendocan.ai-passport**

## One-time setup

### 1. Create publisher

1. Open https://marketplace.visualstudio.com/manage
2. Sign in with Microsoft account
3. **Create publisher** → id: `mendocan` (must match `extensions/vscode/package.json`)

### 2. Personal Access Token (Azure DevOps)

1. https://dev.azure.com → User settings → **Personal access tokens**
2. **New token** → scope: **Marketplace** → **Manage**
3. Copy token (shown once)

### 3. Install extension tooling

```bash
cd extensions/vscode
npm install
```

## Package (local test)

```bash
cd extensions/vscode
npm run compile
npm run package
```

Creates `ai-passport-0.1.0.vsix`. Install locally: VS Code → Extensions → `...` → **Install from VSIX**.

## Publish

```powershell
cd extensions/vscode
npm run compile
npx vsce publish -p YOUR_AZURE_DEVOPS_PAT
```

Or login once:

```powershell
npx vsce login mendocan
npx vsce publish
```

## Version bump

Edit `extensions/vscode/package.json` version, update `CHANGELOG.md`, then publish again.

## Monorepo note

The extension is **not** an npm workspace root package (avoids vsce bundling the whole repo). Build from `extensions/vscode/` only.

## Links after publish

- Marketplace: https://marketplace.visualstudio.com/items?itemName=mendocan.ai-passport
- Manage: https://marketplace.visualstudio.com/manage/publishers/mendocan
