# AI Passport — Planlama & Yapılacaklar

> **Amaç:** Projeyi fazlar (ROADMAP) ile günlük işler (bu dosya) arasında net ayırarak istikrarlı ilerlemek.  
> Stratejik vizyon: [ROADMAP.md](ROADMAP.md) · Prensipler: [MANIFESTO.md](MANIFESTO.md)

**Son güncelleme:** 2026-07-04 · **npm:** `@ai-passport-core/cli@0.1.5` · `@ai-passport-core/sdk@0.1.0` · **Görünürlük:** X + LinkedIn (aşağıya bakın)

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
| 5 | **Demo GIF** — Cursor + AI answer (~21s) | ✓ [assets/demo.gif](assets/demo.gif) |

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
| Demo GIF (~21s, MCP + cevap) | ✓ [assets/demo.gif](assets/demo.gif) |

---

## Görünürlük — X & LinkedIn

> **Kural:** Her commit veya küçük patch paylaşılmaz. Sadece **yeni ve gelişmiş versiyonlar** ile anlamlı kilometre taşları.

Bu politika **AI Passport** ve **diğer projeler** için geçerlidir. İnsanlar sadece sonucu değil, **yolculuğu** da takip etmeyi sever — ama gürültü yapmamak gerekir.

### Ne zaman paylaşılır?

| Tetikleyici | Örnek |
|-------------|--------|
| **Yeni sürüm** (minor/major) | `v0.2 released`, `v0.5 MVP`, `v1.0.0` |
| **Belirgin yeni özellik** | Sign in, cloud sync, yeni güvenlik katmanı |
| **Entegrasyon / ekosistem** | Cursor MCP, VS Code extension, ilk harici consumer |
| **Standart / RFC** | RFC-0001 published, spec site canlı |
| **Topluluk** | İlk contributor, ilk harici implementasyon |

**Paylaşılmaz:** patch fix'ler, CI retry, typo, iç refactor, boş commit, günlük geliştirme notları.

### Platformlar

| Platform | İçerik |
|----------|--------|
| **X** | Kısa duyuru — sürüm, tek cümle değer önerisi, link (npm / GitHub / spec site) |
| **LinkedIn** | Biraz daha uzun — problem, ne değişti, neden önemli, link + görsel (demo GIF, ekran görüntüsü) |

### Checklist (sürüm çıkışında)

- [ ] Release notu / CHANGELOG hazır
- [ ] GitHub Release + npm publish tamam
- [ ] X post — 1–2 cümle + link
- [ ] LinkedIn post — 3–5 cümle + görsel + link
- [ ] Spec site / demo güncelse linkte belirt

---

## Aktif yapılacaklar (öncelik sırası)

### Şimdi — istikrar & görünürlük

- [x] GitHub Release **v0.1.3** (Sign in)
- [x] İlk RFC: **0001-passport-format.md**
- [x] RFC **0002–0005** Accepted
- [x] Test: schema validation + backward compat fixture
- [x] Test: encryption integrity + permission field filters
- [x] Demo GIF (~21s) → `docs/assets/demo.gif`

### Sonra — Phase 5

- [x] Cloud sync tasarım RFC (0006) — Draft
- [x] Cloud sync prototype CLI (`sync push/pull/status`) — v0.1.5
- [x] `@ai-passport-core/sdk` workspace paketi → `packages/sdk/`
- [x] `@ai-passport-core/sdk` npm publish → [v0.1.0](https://www.npmjs.com/package/@ai-passport-core/sdk)
- [x] `@ai-passport-core/cli` npm publish → [v0.1.4](https://www.npmjs.com/package/@ai-passport-core/cli)
- [x] VS Code extension paketi → `extensions/vscode/`
- [ ] VS Code Marketplace publish → [VSCODE_MARKETPLACE.md](VSCODE_MARKETPLACE.md)
- [ ] **v0.2+** çıkışında X + LinkedIn duyurusu ([Görünürlük](#görünürlük--x--linkedin) checklist)

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
| 0.1.1 | SDK `Passport.load()` (CLI export) |
| 0.1.0-sdk | `@ai-passport-core/sdk` standalone npm paketi |
| 0.1.2 | `onboard`, open spec, GitHub Pages |
| 0.1.3 | Sign in — `authorize`, `token exchange` |
| 0.1.4 | `readiness` CLI, VS Code MCP format, extension scaffold |
| 0.1.5 | Cloud sync prototype — `sync push/pull` (RFC 0006) |

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
