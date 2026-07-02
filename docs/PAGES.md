# GitHub Pages — Spec Site

Public documentation at **https://mendocan.github.io/ai-passport/**

## Enable (one-time)

1. GitHub repo → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **main** → Folder: **/docs**
4. Save — site live in ~1–2 minutes

## Local preview (optional)

Requires Ruby + Bundler:

```bash
cd docs
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000/ai-passport/

## Structure

| File | Role |
|------|------|
| `docs/index.md` | Landing page |
| `docs/_config.yml` | Jekyll theme (Cayman) |
| `docs/*.md` | Rendered spec docs |

Markdown files in `docs/` become HTML on Pages automatically.
