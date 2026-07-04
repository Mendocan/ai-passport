# AI Passport — Planlama & Yapılacaklar

> **Amaç:** Projeyi fazlar (ROADMAP) ile günlük işler (bu dosya) arasında net ayırarak istikrarlı ilerlemek.  
> Stratejik vizyon: [ROADMAP.md](ROADMAP.md) · Prensipler: [MANIFESTO.md](MANIFESTO.md)

**Son güncelleme:** 2026-07-04 · **npm:** `@ai-passport-core/cli@0.1.3`

---

## Kuzey yıldızı (GPT ile uyumlu)

Herhangi bir AI uygulaması, ~10 satır kodla AI Passport desteği ekleyebilmeli:

```typescript
import { Passport } from '@ai-passport-core/cli/sdk';

const passport = await Passport.load();
const context = await passport.export('my-app');
```

Gerçek değer **standartta** — sadece CLI'da değil.

---

## SemVer politikası

| Sürüm | Anlam | Hedef |
|-------|--------|--------|
| **v0.1.x** | Deneysel — API değişebilir | **Şu an** (0.1.3) |
| **v0.5.x** | MVP — temel API donmuş, breaking nadir | Cursor + SDK + Sign-in stabil |
| **v1.0.0** | İlk stabil standart — "We support AI Passport v1" | Spec + uyumluluk checklist kilitli |

**Kural:** `0.1.x` → patch/minor serbest. `0.5` öncesi breaking değişiklikler mümkün ama **RFC zorunlu**. `1.0.0` sonrası breaking = major + migration.

---

## GPT önerileri — değerlendirme

| # | Öneri | Değerlendirme | Durum |
|---|--------|---------------|--------|
| 1 | **API stabilitesi** — create/read/verify/permission imzaları sabit kalsın | Kritik, doğru. SDK facade bunun için var. | Kısmen ✓ |
| 2 | **SemVer'e sıkı bağlılık** | ROADMAP'te yoktu; bu dosyaya eklendi. | Bu dosyada ✓ |
| 3 | **Testler** — şifreleme, bütünlük, yetki, şema, geriye uyumluluk | Kimlik katmanı için şart. Eksikler var. | Kısmen ✓ |
| 4 | **RFC mantığı** — `/docs/rfcs/0001-...` | RFC.md var; ilk RFC dosyaları henüz yok. | Süreç ✓, içerik ☐ |
| 5 | **30 sn demo** — init → Cursor → "Welcome back" | Phase 2 wow test var; kayıtlı demo/video yok. | Kısmen ✓ |

**Sonuç:** Öneriler **değerlendirilmeli ve uygulanmalı** — çoğu zaten yarı yolda; eksikler bu dosyada takip edilecek.

---

## API stabilite sözleşmesi (donması hedeflenen yüzey)

Aşağıdaki imzalar `v0.5` öncesinde mümkün olduğunca değişmemeli:

| API | Modül | Not |
|-----|--------|-----|
| `Passport.load()` | SDK | Ana giriş noktası |
| `passport.export(consumer)` | SDK | Passport Context |
| `passport.grant()` / `revoke()` | SDK | Yetki |
| `passport.authorize()` / `exchangeToken()` | SDK | Sign in |
| `PassportManager.init/read/save` | Core | Düşük seviye |
| `passport.schema.json` v1.0.0 | Schema | Breaking → RFC + major |

Internal/refactor serbest; public export ve CLI komut isimleri dikkatli değiştirilir.

---

## Test planı (GPT #3)

| Alan | Mevcut | Eksik / yapılacak |
|------|--------|-------------------|
| Şifreleme | `cipher.test` | Keychain fallback, corrupt blob |
| Passport bütünlüğü | `core.test` | Schema reject, corrupt meta |
| Yetki | `permission.test`, `auth-token.test` | Field filter edge cases |
| Şema doğrulama | validator kullanılıyor | ✓ `schema.test.ts` |
| Geriye dönük uyumluluk | — | ✓ fixtures + semver test |
| MCP / readiness | `readiness.test` | MCP tool contract smoke test |

---

## RFC backlog (GPT #4)

İlk RFC'ler (henüz yazılmadı — `docs/rfcs/`):

| RFC | Başlık | Öncelik |
|-----|--------|---------|
| 0001 | Passport format & envelope v1.0.0 | ✓ Accepted |
| 0002 | Provider / consumer API | Orta |
| 0003 | Permission & grant model | Orta — mevcut implementasyonu belgele |
| 0004 | Encryption & key storage | Yüksek — SECURITY.md ile hizala |
| 0005 | Sign in token format (JWT vs opaque) | Orta — SIGN_IN.md sonrası |
| 0006 | Cloud sync (E2E encrypted) | Düşük — Phase 5 |

Süreç: [RFC.md](RFC.md)

---

## Demo hedefi (GPT #5)

**30 saniyelik "vay be" anı** — kayıt altına alınacak:

```bash
npm install -g @ai-passport-core/cli
ai-passport onboard cursor --path . --yes
# Cursor aç → "What languages do I prefer?"
```

| Görev | Durum |
|-------|--------|
| Adım adım rehber | ✓ [CURSOR_SETUP.md](CURSOR_SETUP.md) |
| Tek komutlu demo script | ✓ `scripts/demo.ps1`, `scripts/demo.sh` → [DEMO.md](DEMO.md) |
| Ekran kaydı / GIF (README veya site) | ☐ — sizin kaydınız |

---

## Aktif yapılacaklar (öncelik sırası)

### Şimdi — istikrar & görünürlük

- [ ] GitHub Release **v0.1.3** (Sign in) — [releases/v0.1.3.md](releases/v0.1.3.md)
- [x] İlk RFC: **0001-passport-format.md**
- [x] Test: schema validation + backward compat fixture
- [ ] 30 sn demo videosu veya GIF → [DEMO.md](DEMO.md) rehberi hazır

### Sonra — Phase 5

- [ ] Cloud sync tasarım RFC (0006)
- [ ] VS Code extension paketi (ayrı repo veya monorepo)
- [ ] `@ai-passport-core/sdk` ayrı npm paketi (hafif bağımlılık)

### v0.5 MVP kriterleri (çıkış kapısı)

- [ ] SDK + CLI API donmuş (CHANGELOG'da breaking yok)
- [ ] RFC 0001 ✓ · 0002–0004 Accepted
- [ ] Uyumluluk checklist'i en az 1 harici consumer doğruladı
- [ ] Demo yayında
- [ ] Test coverage: yukarıdaki tablonun tamamı yeşil

### v1.0.0 kriterleri

- [ ] Spec site + schema frozen
- [ ] "Sign in with AI Passport" production-ready (localhost dışı RFC)
- [ ] En az 2 consumer (Cursor + 1 diğer) referans implementasyon

---

## Tamamlananlar (kısa referans)

| Sürüm | Öne çıkan |
|-------|-----------|
| 0.1.0 | Core, CLI, MCP, git plugin |
| 0.1.1 | SDK `Passport.load()` |
| 0.1.2 | `onboard`, open spec, GitHub Pages |
| 0.1.3 | Sign in — `authorize`, `token exchange` |

Detay: [ROADMAP.md](ROADMAP.md) · Release notları: [releases/](releases/)

---

## Dosya ilişkileri

```
MANIFESTO.md     → Neden / prensipler (değişmez)
VISION.md        → Anayasa
ROADMAP.md       → Fazlar (stratejik)
PLANNING.md      → Bu dosya — günlük takip, SemVer, RFC backlog
RFC.md           → RFC süreci
docs/rfcs/       → Numaralı RFC taslakları
```

**Bu dosyayı** her anlamlı release veya sprint sonunda güncelleyin.
