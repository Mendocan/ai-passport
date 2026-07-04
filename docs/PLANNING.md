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
| 4 | **RFC mantığı** — `/docs/rfcs/0001-...` | RFC 0001–0005 Accepted | ✓ |
| 5 | **Demo GIF** — Cursor + AI answer | v1 ~14s (questions only); v2 hedef 25s | Kısmen ✓ |

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
| Şifreleme | `cipher.test`, `security.test` | Keychain fallback integration |
| Passport bütünlüğü | `core.test`, `schema.test` | Corrupt meta envelope |
| Yetki | `permission.test`, `auth-token.test`, `security.test` | — |
| Şema doğrulama | validator kullanılıyor | ✓ `schema.test.ts` |
| Geriye dönük uyumluluk | — | ✓ fixtures + semver test |
| MCP / readiness | `readiness.test` | MCP tool contract smoke test |

---

## RFC backlog (GPT #4)

İlk RFC'ler (henüz yazılmadı — `docs/rfcs/`):

| RFC | Başlık | Öncelik |
|-----|--------|---------|
| 0001 | Passport format & envelope v1.0.0 | ✓ Accepted |
| 0002 | Provider / consumer API | ✓ Accepted |
| 0003 | Permission & grant model | ✓ Accepted |
| 0004 | Encryption & key storage | ✓ Accepted |
| 0005 | Sign in token format | ✓ Accepted |
| 0006 | Cloud sync (E2E encrypted) | Draft — Phase 5 |

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
| Demo script | ✓ `scripts/demo.ps1` → [DEMO.md](DEMO.md) |
| Demo GIF v2 (AI cevaplı, 20–30s) | ☐ `docs/assets/demo.gif` yeniden kayıt |

---

## Aktif yapılacaklar (öncelik sırası)

### Şimdi — istikrar & görünürlük

- [x] GitHub Release **v0.1.3** (Sign in)
- [x] İlk RFC: **0001-passport-format.md**
- [x] RFC **0002–0005** Accepted
- [x] Test: schema validation + backward compat fixture
- [x] Test: encryption integrity + permission field filters
- [ ] Demo GIF v2 (20–30s, AI cevabı dahil) → [DEMO.md](DEMO.md)
- [x] Demo GIF v1 → `docs/assets/demo.gif` (14s, yenilenecek)

### Sonra — Phase 5

- [x] Cloud sync tasarım RFC (0006) — Draft
- [ ] VS Code extension paketi (ayrı repo veya monorepo)
- [ ] `@ai-passport-core/sdk` ayrı npm paketi (hafif bağımlılık)

### v0.5 MVP kriterleri (çıkış kapısı)

- [ ] SDK + CLI API donmuş (CHANGELOG'da breaking yok)
- [ ] RFC 0001–0005 ✓ · 0006 (cloud sync) Draft
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
