# AI Passport — Compatibility Checklist

Use this checklist to claim **"Supports AI Passport"** in docs, marketing, or integration guides.

---

## Required (MVP)

- [ ] **Passport Context** — Consume filtered JSON from `export` or MCP `get_passport_context`, not raw `passport.json`
- [ ] **Grant flow** — User explicitly approves access; default deny when no grant exists
- [ ] **Schema v1.0.0** — Parse `passport_version` and reject unknown major versions
- [ ] **Read-only context** — Do not write back to passport without explicit user action
- [ ] **Revocation** — Stop using cached context when grant is revoked (re-fetch each session)
- [ ] **Sections** — Document which sections you request (`identity`, `coding`, `projects`, etc.)

---

## Recommended

- [ ] **MCP or SDK** — Integrate via `ai-passport mcp serve` or `@ai-passport-core/cli/sdk`
- [ ] **Status discovery** — Use `get_passport_status` (MCP) or `ai-passport onboard` for first-time setup
- [ ] **Grant templates** — Align with [config/grant-templates.json](../config/grant-templates.json) for your consumer id
- [ ] **Access logging** — Respect audited export (`export` / `get_passport_context`) vs peek (`peek` / `get_active_project`)
- [ ] **Memory (RFC 0007)** — If using `get_memory_context` or `memory` in export: honor namespace grants; ignore unknown `memory` block if not supported
- [ ] **Error messages** — Surface actionable errors ("Run `ai-passport grant <consumer>`")

---

## Consumer registration

Register your consumer id in grant templates (optional but helps CLI onboarding):

```json
{
  "your-product": {
    "name": "Your Product",
    "sections": ["identity", "coding", "projects"],
    "project_filter": "active_only"
  }
}
```

Submit consumer ids via PR or [RFC](RFC.md) if they should ship in the default package.

---

## Self-certification levels

| Level | Meaning |
|-------|---------|
| **Compatible** | Meets all Required items |
| **Recommended** | Meets Required + Recommended |
| **Certified** | Listed in official docs + tested in CI (future program) |

For now, self-certify at **Compatible** or **Recommended** and link to this checklist.

---

## Test scenarios

1. **No passport** — Product shows setup hint (`ai-passport init` / `onboard`)
2. **No grant** — Product requests grant; no data leaked
3. **Active grant** — Context includes only granted sections and fields
4. **After revoke** — Context unavailable; cached data cleared
5. **Schema drift** — Unknown major version rejected gracefully

---

## Reference implementations

| Consumer | Status |
|----------|--------|
| Cursor (MCP) | Reference implementation — [CURSOR_SETUP.md](CURSOR_SETUP.md) |
| CLI / SDK | Reference runtime — `@ai-passport-core/cli` |

---

## Reporting issues

Open an issue with label `compatibility` if an integration diverges from this checklist.
