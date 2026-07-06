# AI Passport — Kuruluş Notu

> Bu dosya projenin **ruhunu** kaydeder: neden doğdu, neye hizmet eder, nelerden taviz verilmez.  
> Resmi prensipler: [MANIFESTO.md](MANIFESTO.md) · Anayasa: [VISION.md](VISION.md)

**Tarih:** 2026-07 · **Kurucu:** Mendocan

---

## Fikir nasıl doğdu?

Gündelik AI kullanımında aynı hikâye tekrar ediyordu: Cursor’da tercihlerini anlat, ChatGPT’de yeniden anlat, yeni bir araca geçince sıfırdan başla. Her platform kendi “hafızasını” tutuyor; ama bu hafıza **kullanıcıya ait değil**, uygulamaya kilitli.

“Passport” metaforu buradan geldi. Gerçek pasaport gibi: **senin**, taşınabilir, yetkili makamların (AI uygulamalarının) okuyabildiği — ama sahipliği sende kalan bir kimlik belgesi.

AI Passport fikri, “bir AI profili daha oluştur” yerine **“Sign in with AI Passport”** sorusundan doğdu: Kullanıcı bir kez kimliğini tanımlasın; her AI, açık izinle okusun; platform değişince bağlam kaybolmasın.

Teknik tetikleyici netti: Cursor MCP ve açık protokoller sayesinde, IDE’nin kullanıcının kodlama tercihlerini **doğrudan ve izinli** okuyabileceği bir katman mümkündü. Önce Cursor, sonra her consumer.

---

## Hangi problemi çözmeye çalışıyor?

**İzole AI hafızası.** Bugün her AI sistemi kendi silosunda çalışıyor; taşınabilir, kullanıcıya ait bir kimlik katmanı yok.

**Sonuç:**

- Her yeni araçta tekrar onboarding
- Aynı tercihlerin tekrar tekrar anlatılması
- Tutarsız AI davranışı (bir yerde TypeScript, başka yerde bilmiyor)
- Kayıp verimlilik ve güven problemi (veri kime ait?)

AI Passport, **açık, şifreli, yerel-öncelikli** bir kimlik katmanı sunar. Sohbet geçmişi değil; kim olduğun, nasıl çalıştığın, ne üzerinde çalıştığın ve hangi AI’ın ne okuyabileceği.

| Saklar | Saklamaz |
|--------|----------|
| Kimlik, tercihler, aktif projeler | Tam sohbet geçmişi |
| İzinler ve grant’ler | Platforma özel hafıza blob’ları |
| Kullanıcının eklediği bağlam | Sağlayıcıya ait profil verisi |

---

## Hangi ilkelerden taviz verilmeyecek?

Bunlar pazarlama cümlesi değil; mimari ve ürün kararlarında **veto hakkı** olan ilkelerdir. Tam liste: [MANIFESTO.md](MANIFESTO.md).

1. **Kimlik kullanıcıya aittir.** OpenAI’ya, Anthropic’e, Cursor’a değil — kullanıcıya.
2. **AI sağlayıcıları misafirdir.** Okuma izni vardır; sahiplik yoktur.
3. **Gizlilik varsayılandır.** Grant yoksa veri yok. İptal anında geçerlidir.
4. **İzinler açıktır.** Paylaşılan her bölüm bilinçli onaylanır.
5. **Açık spesifikasyon.** Format dokümante; vendor lock-in yok.
6. **Yerel-öncelik.** Pasaport önce cihazda; bulut isteğe bağlı ve uçtan uca şifreli.
7. **Birlikte çalışabilirlik.** Tek kimlik, birden fazla AI.
8. **Güvenlik kolaylıktan önce.** Şifreleme ve kapsamlı erişim pazarlık konusu değil.

**Asla yapılmayacaklar (kırmızı çizgi):**

- Master key’in veya şifresiz pasaport içeriğinin buluta gönderilmesi
- Grant olmadan consumer’a veri açılması
- Tek bir IDE veya AI şirketine core bağımlılığı
- “Kolaylık için” şifrelemeyi veya izin modelini gevşetmek

---

## İlk sürümde hedef neydi?

**v0.1.x — “Çalışan çekirdek + ilk wow anı”**

İlk sürümde amaç production-ready ekosistem değil; **fikrin kanıtı** ve **standart tohumu** idi:

| Hedef | v0.1 karşılığı |
|-------|----------------|
| Şifreli yerel pasaport | `~/.ai-passport/`, bölüm bazlı şifreleme |
| CLI ile oluştur / yönet | `init`, `grant`, `revoke`, `export`, `show` |
| Cursor entegrasyonu | MCP `mcp serve`, grant akışı |
| Bağlam zenginleştirme | Git plugin (dil, framework, proje) |
| Açık format | `passport.schema.json`, spec site |
| İlk onboarding | `ai-passport onboard cursor` |
| Taşınabilir API tohumu | SDK `Passport.load()` / `export()` |

**Başarı kriteri (v0.1):** Bir geliştirici pasaportunu oluşturur, Cursor’a grant verir, *“What languages do I prefer?”* sorusuna AI pasaporttan cevap verir — ~30 saniyede, tekrar anlatmadan.

**Bilinçli olarak sonraya bırakılanlar:** Cloud sync (HTTP), VS Code Marketplace, harici consumer sertifikasyonu, v1.0 API donması. Bunlar v0.2–v0.5 yolunda.

---

## Son söz

AI Passport bir “daha iyi prompt aracı” değil; **kullanıcı sahipliğinde kimlik standardı** olmayı hedefler. Yıllar sonra bu dosyaya bakıldığında umarız şunu görebiliriz: ilk gün konduğu ilkeler hâlâ ayakta, ekosistem büyümüş ama ruh aynı kalmış.

*One identity. Every AI.*

> **Memory layer:** [Memory Provider API](rfcs/0007-memory-provider.html) — tagline updated 2026-07-06; primary mission unchanged ([VISION.md](VISION.md)).
