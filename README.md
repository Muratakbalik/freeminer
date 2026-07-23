# ⛏️ Altın Madenci

Basit, hafif bir tıklama (clicker) oyunu. HTML5 + JavaScript ile yapıldı.
Az grafik, düşük donanım dostu ve eski Android'lerde çalışacak şekilde tasarlandı.

---

## 📁 Dosyalar

| Dosya | Görevi |
|-------|--------|
| `index.html` | Oyunun ekran yapısı |
| `style.css`  | Görünüm / tasarım |
| `game.js`    | Oyun mantığı (altın, yükseltme, mağaza, kaydetme) |

---

## ▶️ 1. Oyunu Bilgisayarda Test Etme (En Kolay)

Hiçbir program kurmana gerek yok:

1. `index.html` dosyasına **çift tıkla** → tarayıcıda açılır.
2. Oyunu oyna! (Altın kazan, yükseltme al, mağazaya bak.)

> İpucu: Telefon görünümünü test etmek için tarayıcıda **F12** → sol üstteki
> telefon/tablet simgesine bas.

---

## 📱 2. Android Uygulamasına (APK) Çevirme

Oyunu telefona kurulabilir bir uygulamaya çevirmek için **Capacitor** kullanacağız.
Capacitor eski Android'leri destekler ve gerçek oyun içi satın almaya bağlanmayı sağlar.

### Gereksinimler (bir kez kurulacak)
1. **Node.js** → https://nodejs.org (LTS sürümü)
2. **Java JDK 17** → https://adoptium.net
3. **Android Studio** → https://developer.android.com/studio
   *(APK üretmek için gerekli. PC zayıfsa emülatör yerine gerçek telefonu USB ile bağlayıp test et.)*

### Adımlar (terminal / PowerShell'de bu klasörde çalıştır)

```bash
# 1. Proje başlat
npm init -y

# 2. Capacitor'ı kur
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Capacitor'ı ayarla (uygulama adı ve paket adı sorar)
npx cap init "Altin Madenci" com.seninadin.altinmadenci --web-dir=.

# 4. Android platformunu ekle
npx cap add android

# 5. Dosyaları Android projesine kopyala
npx cap sync

# 6. Android Studio'da aç
npx cap open android
```

Android Studio açıldıktan sonra:
- **Build > Build APK(s)** ile test APK'sı üretebilirsin.
- Ya da telefonu USB ile bağlayıp yeşil ▶️ (Run) tuşuna bas.

### Eski Android desteği
`android/app/build.gradle` dosyasında `minSdkVersion` değerini düşürerek
eski cihazları destekleyebilirsin (örneğin `21` = Android 5.0, `22` = Android 5.1).

---

## 💰 3. Gerçek Oyun İçi Satın Alma (IAP)

Şu an mağaza **demo modunda** — para almadan ürünü veriyor (`game.js` içindeki
`buyShopItem` fonksiyonuna bak).

Gerçek satın almayı bağlamak için:

1. **Google Play Console** hesabı aç (tek seferlik 25$ ücret).
2. Uygulamanı yükle ve mağazadaki paketleri aynı `id` isimleriyle tanımla:
   `pack1` (₺249,99), `pack2` (₺499,99), `pack3` (₺1.000), `pack4` (₺1.500), `pack5` (₺5.000).
   Not: Oyunda reklam yok; sadece bu paketler var.
3. Şu eklentiyi kur:
   ```bash
   npm install @capacitor-community/in-app-purchases
   npx cap sync
   ```
4. `game.js` içindeki `buyShopItem` fonksiyonunu, demo yerine bu eklentinin
   gerçek satın alma çağrısını yapacak şekilde güncelle.

> Not: Gerçek IAP'ı test etmek için uygulamayı Play Console'a (kapalı test kanalına)
> yüklemen gerekir; sadece bilgisayarda test edilemez.

---

## 🏆 4. Sıralama (Liderlik Tablosu)

Sıralama **bilerek sunucusuz** çalışır — internet gerekmez, hiçbir sunucu maliyeti yoktur.
Senin skorun (toplam kazanılan altın) + sahte rakip oyuncular gösterilir.

**Rakipler zamanla gelişir:** her rakibin farklı bir kazanç hızı (`rate`) ve gelişim
hızı (`growth`) vardır. Zaman geçtikçe hem altın kazanırlar hem de "yükseltme alıyormuş"
gibi kazançları hızlanır. Böylece sıralama canlı kalır: bazıları seni geçer, bazılarını
sen geçersin.

Ayar yerleri (`game.js`):
- `BOT_NAMES` → rakip isimleri
- `makeBots` / `newBotStats` → başlangıç skorları, kazanç ve gelişim hızları
- `advanceBots` → rakiplerin zamanla nasıl geliştiği

---

## 🔧 Sık İhtiyaç Duyulacak Ayarlar

- **Oyun dengesini değiştirmek** (fiyatlar, kazançlar) → `game.js` içindeki
  `UPGRADES` ve `SHOP` listeleri.
- **Seviyeler / ortamlar** (isim, ikon, eşik, arka plan) → `game.js` içindeki `TIERS`.
- **Çevrimdışı kazanç oranı** → `game.js` içindeki `OFFLINE_RATE` (0.15 = açıkken kazancın %15'i)
  ve `OFFLINE_MAX_HOURS` (en fazla kaç saat birikir).
- **Renk / tasarım** → `style.css`.
- **Kaydı sıfırlamak** → tarayıcıda F12 > Console'a `localStorage.clear()` yazıp Enter.

---

Kolay gelsin! Bir sonraki adımda ne eklemek istersen söyle:
reklam entegrasyonu, ses efektleri, günlük ödül, başarımlar, vb.
