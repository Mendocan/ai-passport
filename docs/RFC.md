# AI Passport — RFC Process

Request for Comments (RFC) is how we change the **open specification** — schema, grant model, export format, or consumer contracts.

Code changes that only affect internal implementation do **not** need an RFC.

---

## When you need an RFC

| Change | RFC required? |
|--------|---------------|
| New optional passport section | Yes |
| Breaking field rename or removal | Yes |
| New MCP tool or export field | Yes (minor) |
| New consumer id in default templates | Yes (minor) |
| Bug fix, encryption detail clarification | No |
| New plugin (git, etc.) | No (unless schema changes) |

---

## Process

### 1. Open a discussion

GitHub Discussions → **Ideas** (or an issue with `rfc` label) with:

- **Problem** — What problem does this solve?
- **Proposal** — Concrete schema/API change
- **Compatibility** — Breaking or additive?
- **Alternatives** — What else was considered?

### 2. Draft RFC document

For significant changes, add `docs/rfcs/NNNN-short-title.md`:

```markdown
# RFC NNNN: Title

- Status: Draft | Accepted | Rejected | Superseded
- Author: @github-user
- Created: YYYY-MM-DD

## Summary
One paragraph.

## Motivation
Why now?

## Specification
Exact JSON/schema changes.

## Migration
How existing passports upgrade.

## Drawbacks
Trade-offs.
```

### 3. Review window

- **Minor (additive):** 7 days
- **Major (breaking):** 14 days minimum

Maintainers mark status **Accepted** or **Rejected** in the RFC header.

### 4. Implement

After acceptance:

1. Update [schemas/passport.schema.json](../schemas/passport.schema.json)
2. Bump envelope `version` if breaking
3. Update [SPEC.md](SPEC.md), [API.md](API.md), [COMPATIBILITY.md](COMPATIBILITY.md)
4. Add tests and migration notes in CHANGELOG

---

## Version policy

- **Passport envelope** — Semver (`1.0.0` today)
- **Major bump** — Breaking schema; readers may reject
- **Minor bump** — Additive sections/fields; old readers ignore unknown optional fields
- **Patch** — Documentation, clarifications, non-breaking constraints

---

## Current RFCs

| RFC | Title | Status |
|-----|-------|--------|
| [0001](rfcs/0001-passport-format.md) | Passport document format v1.0.0 | Accepted |
| [0002](rfcs/0002-provider-api.md) | Provider / consumer API | Accepted |
| [0003](rfcs/0003-permission-model.md) | Permission & grant model | Accepted |
| [0004](rfcs/0004-encryption.md) | Encryption & key storage | Accepted |
| [0005](rfcs/0005-sign-in-token.md) | Sign-in token format | Accepted |
| [0006](rfcs/0006-cloud-sync.md) | Cloud sync (E2E encrypted) | Draft |

Submit the first RFC when proposing schema v1.1.0 or new standard sections.
