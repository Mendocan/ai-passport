# AI Passport — 30 Second Demo

The "wow moment": passport exists → Cursor reads it → AI knows your stack.

---

## Before recording

- Node.js 20+
- [Cursor](https://cursor.com) installed
- Terminal + Cursor visible in recording

---

## Demo script (Windows)

From repo root:

```powershell
.\scripts\demo.ps1
```

Or manually:

```powershell
npm install -g @ai-passport-core/cli@latest
ai-passport onboard cursor --path . --yes
```

Then open Cursor → new chat → ask:

1. *"What languages and frameworks do I prefer?"*
2. *"What project am I working on?"*

**Pass:** Cursor answers from passport without you re-explaining.

---

## Recording checklist

| Step | On screen |
|------|-----------|
| 0:00 | Terminal: `ai-passport onboard cursor --path . --yes` |
| 0:10 | Output: passport ID + MCP config |
| 0:15 | Switch to Cursor — MCP tools visible |
| 0:20 | Chat: "What languages do I prefer?" |
| 0:28 | AI cites TypeScript / your coding profile |

Target length: **30 seconds**.

---

## Where to publish

- README demo section (GIF or link to video)
- GitHub Pages: [index.md](index.md)
- GitHub Release assets (optional)

---

## Troubleshooting during demo

See [CURSOR_SETUP.md](CURSOR_SETUP.md).
