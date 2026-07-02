# AI Passport — Security Model

## Encryption

- **Algorithm:** AES-256-GCM per section
- **Master key:** OS secure store (Windows Credential Manager, macOS Keychain, Linux keyring)
- **Section keys:** HKDF-SHA256 derived from master + section id
- **On disk:** Only ciphertext in `passport.json`

Compromising one section key must not decrypt other sections.

## Permissions

- **Default deny** — no grant, no data
- Grants stored in `permissions/grants.json` (plaintext metadata only)
- Revocation is immediate
- Every export appends to `audit/access.log`

## Threat model (MVP)

| Threat | Mitigation |
|--------|------------|
| Malicious consumer reads entire passport | Scoped grants; filtered export |
| Stolen passport file | Section encryption; master key in OS store |
| One section leaked | Independent section keys |
| User disconnects a consumer | `ai-passport revoke <consumer>` |

## Out of scope (MVP)

- HSM
- Multi-user passports
- Cloud key escrow
- Network API

## Core independence

Security does not rely on any specific IDE or AI provider. The encryption and permission model are consumer-agnostic.
