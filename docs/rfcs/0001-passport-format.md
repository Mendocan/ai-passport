# RFC 0001: Passport Document Format

- **Status:** Accepted
- **Author:** Mendocan
- **Created:** 2026-07-04
- **Passport envelope version:** `1.0.0`

---

## Summary

This RFC defines the canonical **plaintext shape** of an AI Passport document before encryption. It is the reference for readers, writers, validators, and external implementers.

Machine-readable schema: [`passport.schema.json`](https://github.com/Mendocan/ai-passport/blob/main/schemas/passport.schema.json)

---

## Motivation

AI Passport must be a **portable standard**, not a single-app format. RFC 0001 locks the v1.0.0 envelope so:

- CLI, SDK, and MCP can validate consistently
- Third parties can say *"We support AI Passport v1.0.0"*
- Future changes require explicit RFC + semver bump

---

## Specification

### Envelope

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | semver string | yes | Document format version (`1.0.0`) |
| `identity` | object | yes | User-facing identity |
| `preferences` | object | yes | Communication preferences |
| `coding` | object | yes | Languages, frameworks, style |
| `projects` | array | yes | Active and past projects |
| `permissions` | object | yes | Permission metadata (not grants) |
| `providers` | array | yes | Registered consumers |

**Rule:** `additionalProperties: false` at top level and section level — unknown fields are rejected.

### Sections (summary)

**identity** — `display_name`, `role`, `timezone`, `locale`, `bio`

**preferences** — `language`, `communication_style`, `verbosity`, `explain_before_code`, `prefer_examples`

**coding** — `primary_languages`, `frameworks`, `style`, `conventions`, `ai_preferences`, `detected_from`

**projects[]** — `id`, `name`, `description`, `status`, `stack`, `conventions`, `repo_root`, `repo_remote`, timestamps

**permissions** — `default_policy` (`deny_all`), `last_reviewed_at`

**providers[]** — `id`, `name`, `registered_at`, `last_access_at`

### At-rest format

On disk, sections are stored encrypted in `~/.ai-passport/passport.json`:

```json
{
  "version": "1.0.0",
  "sections": {
    "identity": { "ciphertext": "...", "nonce": "...", "alg": "AES-256-GCM", "updated_at": "..." }
  }
}
```

Non-sensitive metadata lives in `passport.meta.json` (passport id, section index, timestamps).

**Consumers never read the encrypted file directly** — they receive filtered **Passport Context** after grant.

### Version policy

| Change | Envelope bump |
|--------|---------------|
| New optional field in existing section | Minor (e.g. `1.1.0`) — RFC required |
| Rename/remove field | Major (e.g. `2.0.0`) — RFC + migration |
| New section | Minor or major — RFC required |

Readers **must reject** unknown major versions.

---

## Migration

No migration required — this RFC documents the implemented v1.0.0 format shipped since project inception.

Future migrations must include:

1. Upgrade tool or `ai-passport migrate` command
2. Changelog entry
3. Backward-compat test fixture in `schemas/fixtures/`

---

## Compatibility

- Example document: [`passport.example.json`](https://github.com/Mendocan/ai-passport/blob/main/schemas/examples/passport.example.json)
- Minimal fixture: [`passport.v1.0.0.minimal.json`](https://github.com/Mendocan/ai-passport/blob/main/schemas/fixtures/passport.v1.0.0.minimal.json)
- Validator: `validatePassport()` in core
- Checklist: [COMPATIBILITY.md](../COMPATIBILITY.md)

---

## Drawbacks

- Strict `additionalProperties: false` prevents experimental fields without schema update
- Section-level encryption means whole-section reads/writes (no field-level encryption in v1)

---

## Implementation status

| Component | Status |
|-----------|--------|
| JSON Schema | ✓ |
| CLI init / show | ✓ |
| Encrypted vault | ✓ |
| Schema tests | ✓ |
| Public spec | ✓ [SPECIFICATION.md](../SPECIFICATION.md) |
