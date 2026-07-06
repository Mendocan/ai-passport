# AI Passport — Planlama & Yapılacaklar

> **Amaç:** Projeyi fazlar (ROADMAP) ile günlük işler (bu dosya) arasında net ayırarak istikrarlı ilerlemek.  
> Stratejik vizyon: [ROADMAP.md](ROADMAP.md) · Prensipler: [MANIFESTO.md](MANIFESTO.md)

**Son güncelleme:** 2026-07-06 · **npm:** `@ai-passport-core/cli@0.3.1` · `@ai-passport-core/sdk@0.3.1` · **RFC 0007** Accepted

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
| **v0.1.x** | Deneysel — API değişebilir | Tamamlandı |
| **v0.2.x** | Memory prototype — API evrilebilir | Tamamlandı (0.2.1) |
| **v0.3.x** | Memory deepening — decay, graph | **Şu an** (0.3.1) |
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
| 0007 | Memory Provider API (v2) | ✓ Accepted |

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

- [x] Release notu / CHANGELOG hazır — [v0.2.0](releases/v0.2.0.md), [v0.2.1](releases/v0.2.1.md)
- [x] GitHub Release + npm publish tamam — [v0.2.0](https://github.com/Mendocan/ai-passport/releases/tag/v0.2.0), [v0.2.1](https://github.com/Mendocan/ai-passport/releases/tag/v0.2.1)
- [x] X post — v0.2 duyurusu (EN/TR hazır)
- [x] LinkedIn post + profil projesi — v0.2 duyurusu, GitHub medya
- [x] Spec site / demo güncelse linkte belirt

---

## Aktif yapılacaklar (öncelik sırası)

### Tamamlandı — v0.3.1 sprint (2026-07-06)

- [x] v0.3.0 memory deepening — confidence decay, verify, link, graph, MCP `get_memory_graph`
- [x] npm publish `@0.3.0` / `@0.3.1` + grant `knowledge` + graph canlı test (CLI + Cursor)
- [x] Cursor MCP memory/graph doğrulandı
- [x] `@ai-passport-core/sdk` npm — CLI ile hizala → `@0.3.1` ✓
- [x] Mission/tagline — positioning review (tagline + VISION.md)

### Sonraki sprint

- [ ] v0.3+ — graph merge, contradiction resolution, encrypted records (RFC 0004)

### Tamamlandı — v0.2 ship (2026-07-06)

- [x] `@ai-passport-core/cli` npm → [v0.2.0](https://www.npmjs.com/package/@ai-passport-core/cli), [v0.2.1](https://www.npmjs.com/package/@ai-passport-core/cli), [v0.3.0](https://www.npmjs.com/package/@ai-passport-core/cli), [v0.3.1](https://www.npmjs.com/package/@ai-passport-core/cli)
- [x] GitHub Release → [v0.2.0](https://github.com/Mendocan/ai-passport/releases/tag/v0.2.0), [v0.2.1](https://github.com/Mendocan/ai-passport/releases/tag/v0.2.1), [v0.3.0](https://github.com/Mendocan/ai-passport/releases/tag/v0.3.0), [v0.3.1](https://github.com/Mendocan/ai-passport/releases/tag/v0.3.1)
- [x] README status güncellendi
- [x] X + LinkedIn duyurusu + LinkedIn profil projesi
- [x] Mission/tagline güncellemesi — positioning review (tagline + VISION.md)

### v2 — Memory Provider (RFC 0007) ✓ prototype

> Gevşek bağlı mimari: Passport = kimlik + izin + context assembly; Memory = provider.  
> Vizyon: [research/vision-v2-memory.md](research/vision-v2-memory.md)

- [x] RFC 0007 Draft → Accepted
- [x] `local-vault` stub, `memory init/status/store`, grant `--memory`
- [x] MCP — `get_passport_context` enrichment + `get_memory_context`
- [ ] v0.3+ — graph merge, contradiction resolution, encrypted records (RFC 0004)

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
| 0.3.1-sdk | `@ai-passport-core/sdk@0.3.1` — CLI-aligned standalone package |
| 0.1.2 | `onboard`, open spec, GitHub Pages |
| 0.1.3 | Sign in — `authorize`, `token exchange` |
| 0.1.4 | `readiness` CLI, VS Code MCP format, extension scaffold |
| 0.1.5 | Cloud sync prototype — `sync push/pull` (RFC 0006) |
| 0.2.0 | Memory Provider API — `memory init/store`, grant `--memory`, MCP `get_memory_context` (RFC 0007) |
| 0.2.1 | CLI `--version` → npm sürümü; `info` → Schema etiketi |
| 0.3.0 | Confidence decay, `memory verify/link/graph`, MCP `get_memory_graph` |
| 0.3.1 | PowerShell `--memory` namespace parse fix; SDK `@0.3.1` npm align |
| ext 0.1.0 | VS Code extension — [Marketplace](https://marketplace.visualstudio.com/items?itemName=mendocan.ai-passport) |

Detay: [ROADMAP.md](ROADMAP.md) · Release notları: [releases/](releases/)

---

## Dosya ilişkileri

```
FOUNDING.md      → Kuruluş notu — fikir, problem, taviz edilmeyen ilkeler
MANIFESTO.md     → Neden / prensipler (değişmez)
VISION.md        → Anayasa
ROADMAP.md       → Fazlar (stratejik)
PLANNING.md      → Bu dosya — günlük takip, SemVer, RFC backlog
RFC.md           → RFC süreci
docs/rfcs/       → Numaralı RFC taslakları
```

**Bu dosyayı** her anlamlı release veya sprint sonunda güncelleyin.
