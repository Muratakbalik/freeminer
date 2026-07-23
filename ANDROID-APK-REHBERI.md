# 📱 Bulutta APK Üretme Rehberi (PC'ye kurulum YOK)

Bu rehber, oyunu **GitHub'ın ücretsiz bulut bilgisayarlarında** APK'ya çevirir.
Kendi bilgisayarına Android Studio vb. **hiçbir şey kurmana gerek yok.**
Sonuçta telefonuna kurabileceğin bir **APK** dosyası indireceksin.

> Not: Bu APK bir "test (debug)" sürümüdür. Telefonda kurulur ve çalışır.
> Sadece **gerçek para ile satın alma** çalışmaz (o kısım Google Play hesabı ister).

---

## 1. Ücretsiz GitHub hesabı aç
- https://github.com → **Sign up** ile hesap oluştur (ücretsiz).

## 2. Yeni bir depo (repository) oluştur
- Sağ üstteki **+** → **New repository**
- **Repository name:** `altin-madenci` (istediğin adı verebilirsin)
- **Public** seç (ücretsiz derleme için en kolayı)
- **Create repository** butonuna bas.

## 3. Proje dosyalarını yükle
En kolay yol **web'den sürükle-bırak**:
- Açılan sayfada **"uploading an existing file"** bağlantısına tıkla.
- `C:\Users\Murat\Desktop\Mobil` klasöründeki **tüm dosyaları** seç ve pencereye sürükle:
  - `index.html`, `style.css`, `game.js`
  - `package.json`, `capacitor.config.json`
  - `scripts` klasörü
  - `.github` klasörü  ← **EN ÖNEMLİSİ, bunu atlama!**
  - `.gitignore`, `README.md`, `ANDROID-APK-REHBERI.md`
- Aşağıdaki yeşil **Commit changes** butonuna bas.

> ⚠️ `.github` klasörü gizli görünebilir. Görmüyorsan: klasörde **Görünüm > Gizli öğeler**
> (Windows Dosya Gezgini) seçeneğini aç. Bu klasör olmadan otomatik derleme çalışmaz.
>
> Alternatif (daha kolay): **GitHub Desktop** programını kurup klasörü tek tıkla
> yükleyebilirsin — ama bu da küçük bir kurulum ister.

## 4. Derlemeyi izle
- Depoda üstteki **Actions** sekmesine tıkla.
- **"APK Uret"** adında bir iş çalışmaya başlamış olacak (sarı nokta = çalışıyor).
- Bitince yeşil ✅ olur. Genelde **3-6 dakika** sürer.
- Hata olursa (kırmızı ❌), üstüne tıkla, ekran görüntüsünü bana gönder, birlikte düzeltiriz.

## 5. APK'yı indir
- Yeşil ✅ olan işe tıkla.
- Sayfanın en altında **Artifacts** bölümünde **`altin-madenci-apk`** göreceksin.
- Üstüne tıkla → bir **.zip** iner. İçinden `app-debug.apk` dosyasını çıkar.

## 6. Telefona kur (eski Android dahil)
- `app-debug.apk` dosyasını telefonuna aktar (kablo, WhatsApp, mail, Drive vb.).
- Telefonda dosyaya dokun → kurulum başlar.
- "Bilinmeyen kaynaklardan kuruluma izin ver" uyarısı çıkarsa **izin ver**
  (Ayarlar > Güvenlik > Bilinmeyen kaynaklar).
- Kurulunca oyun açılır! 🎉

---

## Sık sorulanlar

**Hangi Android sürümlerini destekler?**
Android 5.1 ve üzeri (bu proje Capacitor 6 kullanır, minimum Android 5.1).
Telefonun Android 5-7 aralığındaysa çalışır.

**Uygulama adını / paket adını nasıl değiştiririm?**
`capacitor.config.json` içindeki `appName` (görünen ad) ve `appId` (paket adı,
örn. `com.altinmadenci.app`) değerlerini değiştir, tekrar yükle.

**Oyunu güncelledim, APK'yı nasıl yenilerim?**
Değişen dosyaları GitHub deposuna tekrar yükle → Actions otomatik yeni APK üretir.

**İkon / açılış ekranı eklemek?**
Sonraki adımda `@capacitor/assets` ile logo ekleyebiliriz — hazır olduğunda söyle.
