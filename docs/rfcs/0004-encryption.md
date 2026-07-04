# RFC 0004: Encryption & Key Storage

- **Status:** Accepted
- **Author:** Mendocan
- **Created:** 2026-07-04
- **Depends on:** [RFC 0001](0001-passport-format.md)

---

## Summary

Specifies encryption at rest for passport sections and master key storage on the user's machine.

Aligned with [SECURITY.md](../SECURITY.md).

---

## Motivation

Passport files may sit on disk backups, sync folders, or compromised filesystems. Section-level encryption limits blast radius.

---

## Encryption

### Algorithm

- **AES-256-GCM** per section
- **Nonce:** 12 random bytes per encryption
- **Auth tag:** 16 bytes appended to ciphertext

### Section keys

```
sectionKey = HKDF-SHA256(
  ikm = masterKey,
  salt = sectionId UTF-8,
  info = "ai-passport-section",
  length = 32
)
```

Each section (`identity`, `coding`, …) has an independent derived key.

### Encrypted envelope

`~/.ai-passport/passport.json`:

```json
{
  "version": "1.0.0",
  "sections": {
    "identity": {
      "ciphertext": "base64(ciphertext || authTag)",
      "nonce": "base64",
      "alg": "AES-256-GCM",
      "updated_at": "ISO-8601"
    }
  }
}
```

Plaintext passport document is never written to disk.

---

## Master key storage

Priority order:

1. **OS keychain** (preferred)
   - Service: `ai-passport`
   - Account: `master-<sha256(home)[0:16]>` (per passport home directory)
2. **File fallback** — `~/.ai-passport/keys/master.key` (mode `0600`) when keychain unavailable

Legacy account `master` supported for migration on default home only.

Reference file: `keys/master.keyref` records storage kind.

---

## Threat model (v1)

| Threat | Mitigation |
|--------|------------|
| Stolen `passport.json` | Useless without master key |
| Leaked section ciphertext | Other sections remain protected |
| Malicious consumer | Grants + filtered export only |
| Revoked consumer | Grants + tokens cleared |

### Out of scope

- HSM, multi-user passports, cloud key escrow, network API

---

## Operational notes

- `ai-passport init --force` recreates passport and key — **destructive**
- Wrong key → `Unsupported state or unable to authenticate data` — re-init required
- Windows/Linux/macOS keychain behavior differs; file fallback ensures portability

---

## Implementation

- `src/crypto/cipher.ts` — encrypt/decrypt
- `src/crypto/keychain.ts` — store/load master key
- `src/core/vault.ts` — envelope read/write

---

## Drawbacks

- File fallback is weaker than OS keychain
- No hardware-backed keys in v1
