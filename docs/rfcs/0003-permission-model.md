# RFC 0003: Permission & Grant Model

- **Status:** Accepted
- **Author:** Mendocan
- **Created:** 2026-07-04
- **Depends on:** [RFC 0001](0001-passport-format.md), [RFC 0002](0002-provider-api.md)

---

## Summary

Defines **default deny**, grant structure, scoped export, audit logging, and revocation semantics.

---

## Motivation

AI Passport's core promise: users explicitly control what each consumer can read. This RFC locks the permission model for v1.

---

## Principles

1. **Default deny** — no grant → no export
2. **Scoped sections** — only grantable sections: `identity`, `preferences`, `coding`, `projects`
3. **Field filtering** — optional per-section field allowlists
4. **Immediate revoke** — `revoke` invalidates access instantly
5. **Audit trail** — audited exports append to `audit/access.log`

Internal sections (`permissions`, `providers`) are **never grantable**.

---

## Grant storage

File: `~/.ai-passport/permissions/grants.json`

```json
{
  "grants": [
    {
      "id": "grant_cursor_abc123",
      "provider": "cursor",
      "sections": ["identity", "coding", "projects"],
      "project_filter": "active_only",
      "fields": {
        "identity": ["display_name", "role"],
        "projects": ["name", "stack", "repo_root"]
      },
      "issued_at": "2026-07-04T12:00:00Z",
      "expires_at": null,
      "revoked": false
    }
  ]
}
```

Grants metadata is **plaintext** (no secrets). Passport content remains encrypted.

---

## Grant request

```typescript
interface GrantRequest {
  provider: string;
  sections: SectionId[];
  project_filter?: 'active_only' | 'all';
  fields?: Partial<Record<SectionId, string[]>>;
}
```

Creating a new grant for the same provider **revokes** previous active grants for that provider.

---

## Export rules

| Operation | Audit log | Updates `last_access_at` |
|-----------|-----------|--------------------------|
| `export` / `get_passport_context` | Yes | Yes |
| `peekExport` / `get_active_project` | No | No |
| `authorize` → uses `export` internally | Yes | Yes |
| `token exchange` | No (context pre-exported) | N/A |

### Project filter

- `active_only` — projects with `status: active` or unset status
- `all` — all projects in passport

### Field filter

When `fields.identity` is set, only listed keys appear in Passport Context.

---

## Revocation

```bash
ai-passport revoke cursor
```

- Sets `revoked: true` on all active grants for provider
- Removes outstanding sign-in tokens for that client ([RFC 0005](0005-sign-in-token.md))
- Does not delete passport data

---

## Access log format

Append-only JSON lines in `audit/access.log`:

```json
{"ts":"2026-07-04T12:00:00Z","provider":"cursor","grant_id":"grant_cursor_abc","sections":["identity","coding"]}
```

---

## Migration

No migration — documents implemented behavior since v0.1.0.

---

## Drawbacks

- Grants file is not encrypted (by design — contains no passport secrets)
- No per-grant expiry enforcement in MVP (`expires_at` supported in schema but CLI defaults to `null`)

---

## Implementation

Core: `src/core/permission.ts` · Templates: `config/grant-templates.json`
