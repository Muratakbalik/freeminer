/* ============================================================
   ALTIN MADENCİ - Basit tıklama oyunu
   Tüm oyun mantığı bu dosyada. Grafik yok, sadece emoji + CSS.
   ============================================================ */

// --- Oyun durumu (kaydedilen veriler) ---
const defaultState = {
  gold: 0,
  totalEarned: 0,   // toplam kazanılan altın (ortam/seviye + sıralama için)
  perTap: 1,        // her tıklamada kazanılan altın
  perSecond: 0,     // otomatik kazanç (saniyede)
  multiplier: 1,    // satın alınan kalıcı çarpan (paketlerden gelir)
  upgrades: {},     // her yükseltmenin kaç kez alındığı
  playerName: "",   // sıralamada görünecek takma ad
  bots: null,       // rakip oyuncular (yerel/demo)
  botsTime: 0,      // rakip skorlarının son güncellenme zamanı
  lastSeen: 0,      // oyunun son açık olduğu zaman (çevrimdışı kazanç için)
};

// Çevrimdışı (oyun kapalıyken) kazanç oranı: açıkken kazancın sadece %15'i.
// Böylece oyuncu telefonu/oyunu AÇIK tutmaya teşvik edilir.
const OFFLINE_RATE = 0.15;
const OFFLINE_MAX_HOURS = 8; // en fazla 8 saatlik çevrimdışı kazanç birikir

let state = load();

// --- Ortam / seviye kademeleri ---
// Toplam kazanılan altına göre maden ortamı (ve arka plan) değişir.
const TIERS = [
  { need: 0,               name: "Taş Mağara",       scene: "🗿", bg: "radial-gradient(120% 80% at 50% 0%, #4a4a52 0%, #2b2b33 55%, #17171c 100%)" },
  { need: 250,             name: "Nemli Tünel",      scene: "💧", bg: "radial-gradient(120% 80% at 50% 0%, #3a4a55 0%, #232f38 55%, #12181d 100%)" },
  { need: 1000,            name: "Derin Tünel",      scene: "🌑", bg: "radial-gradient(120% 80% at 50% 0%, #2f3d5e 0%, #1b2338 55%, #0e1220 100%)" },
  { need: 4000,            name: "Kömür Damarı",     scene: "⚫", bg: "radial-gradient(120% 80% at 50% 0%, #33343a 0%, #1d1e22 55%, #0c0c0e 100%)" },
  { need: 12000,           name: "Demir Yatağı",     scene: "🔩", bg: "radial-gradient(120% 80% at 50% 0%, #5a4038 0%, #3a2824 55%, #1c1210 100%)" },
  { need: 35000,           name: "Kristal Mağara",   scene: "💠", bg: "radial-gradient(120% 80% at 50% 0%, #1f6e77 0%, #123f4a 55%, #08222a 100%)" },
  { need: 90000,           name: "Gümüş Damarı",     scene: "🌙", bg: "radial-gradient(120% 80% at 50% 0%, #6b7480 0%, #3f454e 55%, #1e2126 100%)" },
  { need: 250000,          name: "Altın Damarı",     scene: "💰", bg: "radial-gradient(120% 80% at 50% 0%, #8a6a1e 0%, #5a4310 55%, #2c2007 100%)" },
  { need: 700000,          name: "Lav Mağarası",     scene: "🌋", bg: "radial-gradient(120% 80% at 50% 0%, #7a2a1a 0%, #4a160f 55%, #240806 100%)" },
  { need: 2000000,         name: "Yer Altı Gölü",    scene: "🌊", bg: "radial-gradient(120% 80% at 50% 0%, #1a5a7a 0%, #103f5a 55%, #06202c 100%)" },
  { need: 6000000,         name: "Kristal Saray",    scene: "🔮", bg: "radial-gradient(120% 80% at 50% 0%, #5a3a8a 0%, #38255a 55%, #1a112c 100%)" },
  { need: 18000000,        name: "Elmas Diyarı",     scene: "💎", bg: "radial-gradient(120% 80% at 50% 0%, #2a8a8a 0%, #1a5a5a 55%, #0a2c2c 100%)" },
  { need: 60000000,        name: "Altın Saray",      scene: "🏰", bg: "radial-gradient(120% 80% at 50% 0%, #b98a1e 0%, #7a5a10 55%, #3c2c07 100%)" },
  { need: 200000000,       name: "Ateş Çekirdeği",   scene: "🔥", bg: "radial-gradient(120% 80% at 50% 0%, #b93a0a 0%, #7a2306 55%, #3c1002 100%)" },
  { need: 700000000,       name: "Buz Mağarası",     scene: "❄️", bg: "radial-gradient(120% 80% at 50% 0%, #3a8ab9 0%, #235a7a 55%, #102c3c 100%)" },
  { need: 2500000000,      name: "Yıldız Tozu",      scene: "✨", bg: "radial-gradient(120% 80% at 50% 0%, #6a4aaa 0%, #3f2a6a 55%, #1e1234 100%)" },
  { need: 9000000000,      name: "Ay Madeni",        scene: "🌕", bg: "radial-gradient(120% 80% at 50% 0%, #8a8a9a 0%, #4a4a5a 55%, #1e1e2c 100%)" },
  { need: 30000000000,     name: "Kayıp Galaksi",    scene: "🌌", bg: "radial-gradient(120% 80% at 50% 0%, #2a2a6a 0%, #1a1a4a 55%, #08081e 100%)" },
  { need: 120000000000,    name: "Evren Çekirdeği",  scene: "🌠", bg: "radial-gradient(120% 80% at 50% 0%, #6a1a6a 0%, #3f0f3f 55%, #1e061e 100%)" },
  { need: 500000000000,    name: "Uzay Madeni",      scene: "🚀", bg: "radial-gradient(120% 80% at 50% 0%, #14204a 0%, #0a1030 55%, #02030c 100%)" },
  { need: 2500000000000,   name: "Yıldız Krallığı",  scene: "👑", bg: "radial-gradient(120% 80% at 50% 0%, #b9971a 0%, #7a6310 55%, #3c3007 100%)" },
  { need: 15000000000000,  name: "Sonsuzluk Kapısı", scene: "🌟", bg: "radial-gradient(120% 80% at 50% 0%, #aa4aaa 0%, #6a2a6a 55%, #341234 100%)" },
  { need: 100000000000000, name: "Efsane Madenci",   scene: "🏆", bg: "radial-gradient(120% 80% at 50% 0%, #d9b021 0%, #a07d10 55%, #4c3c07 100%)" },
];

let currentTier = -1; // en son uygulanan kademe (gereksiz güncellemeyi önler)

// --- Yükseltme tanımları ---
// cost: ilk fiyat, growth: her alışta fiyatın çarpanı
const UPGRADES = [
  { id: "pickaxe",  emoji: "⛏️", title: "Keskin Kazma",   desc: "Tık başına +1 altın",       cost: 25,    growth: 1.25, type: "tap",    value: 1 },
  { id: "drill",    emoji: "🔩", title: "Matkap",         desc: "Tık başına +5 altın",       cost: 300,   growth: 1.30, type: "tap",    value: 5 },
  { id: "helper",   emoji: "👷", title: "Yardımcı",      desc: "Saniyede +1 altın",         cost: 100,   growth: 1.20, type: "auto",   value: 1 },
  { id: "cart",     emoji: "🛒", title: "Maden Arabası",  desc: "Saniyede +5 altın",         cost: 1200,  growth: 1.25, type: "auto",   value: 5 },
  { id: "machine",  emoji: "🏭", title: "Maden Makinesi", desc: "Saniyede +25 altın",        cost: 8000,  growth: 1.30, type: "auto",   value: 25 },
];

// --- Mağaza (gerçek para ile satın alma) paketleri ---
// Oyunda reklam YOK. Sadece isteğe bağlı paketler var.
// coins: verilen altın, mult: kalıcı kazanç çarpanı, price: gösterilecek fiyat.
// (Şimdilik demo; Android'de gerçek Google Play satın almasına bağlanacak.)
const SHOP = [
  { id: "pack1", emoji: "💰", title: "Başlangıç Kesesi", coins: 500000,    price: "₺249,99" },
  { id: "pack2", emoji: "💼", title: "Madenci Paketi",   coins: 2000000,   price: "₺499,99" },
  { id: "pack3", emoji: "🎁", title: "Değerli Sandık",   coins: 6000000,   mult: 2, price: "₺1.000", badge: "POPÜLER" },
  { id: "pack4", emoji: "💎", title: "Elmas Paketi",     coins: 25000000,  mult: 3, price: "₺1.500" },
  { id: "pack5", emoji: "👑", title: "Efsane Paket",     coins: 150000000, mult: 5, price: "₺5.000", badge: "EN İYİ DEĞER" },
];

// --- Sıralama: rakip oyuncular (yerel/demo modu) ---
// NOT: Bunlar gerçek oyuncu değil. Gerçek online sıralama için README'ye bak
// (Firebase ile buradaki liste sunucudan çekilecek).
const BOT_NAMES = [
  "AhmetPro", "AyşeGamer", "MertX", "Zeynep_07", "CanKaan",
  "EliteMadenci", "GökhanTR", "Selin", "Burak48", "EfeKral",
  "DerinCevher", "MineAvcısı", "KaanUsta", "Yıldız34", "TunçDemir",
  "PamukPrenses", "GölgeNinja", "AltınEller", "Kaşif", "Reis61",
];

// İlk kez çalışınca rakipleri oluştur (kalıcı olarak kaydedilir)
function makeBots() {
  const bots = [];
  // Geniş bir aralıkta skorlar: bazıları çok ileride, bazıları geride
  const bases = [
    82000000, 21000000, 6500000, 1900000, 720000,
    280000, 130000, 61000, 24000, 9500,
    4200, 1800, 780, 320, 140,
    90, 60, 40, 20, 8,
  ];
  const names = BOT_NAMES.slice().sort(() => Math.random() - 0.5);
  for (let i = 0; i < names.length; i++) {
    const base = Math.floor(bases[i] * (0.8 + Math.random() * 0.5));
    bots.push(newBotStats(names[i], base));
  }
  return bots;
}

// Bir rakibin gelişim istatistiklerini üretir
function newBotStats(name, base) {
  return {
    name: name,
    score: base,
    // saniyelik kazanç: skoruna göre + rastgele (kimi hızlı kimi yavaş oynuyor)
    rate: Math.max(1, base * (0.00001 + Math.random() * 0.00006)),
    // "yükseltme alma" hızı: saatte kazancı ne kadar artar (0.10 = %10)
    growth: 0.10 + Math.random() * 0.45,
  };
}

// ============================================================
//  DOM referansları
// ============================================================
const $ = (sel) => document.querySelector(sel);
const appEl = $("#app");
const goldEl = $("#goldCount");
const perTapEl = $("#perTap");
const perSecEl = $("#perSecond");
const tapButton = $("#tapButton");
const floatersEl = $("#floaters");
const upgradeListEl = $("#upgradeList");
const shopListEl = $("#shopList");
const leaderListEl = $("#leaderList");
const nameInputEl = $("#nameInput");
const saveNameBtn = $("#saveName");
const toastEl = $("#toast");
const tierSceneEl = $("#tierScene");
const tierNameEl = $("#tierName");
const tierFillEl = $("#tierFill");
const tierHintEl = $("#tierHint");

// Butonlarda kullanılacak küçük altın ikonu (SVG - her cihazda görünür)
function coinIcon() {
  return '<svg class="ic"><use href="#coin" xlink:href="#coin"></use></svg>';
}

// ============================================================
//  Yardımcı fonksiyonlar
// ============================================================
function formatNumber(n) {
  n = Math.floor(n);
  if (n < 1000) return n.toString();
  // K=bin, M=milyon, B=milyar, T=trilyon, sonrası kısaltmalar
  const units = ["", "K", "M", "B", "T", "Kt", "Kn", "Sk", "Sp", "Ok", "Nn", "Dz", "Ud", "Dd"];
  let i = 0;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0) + units[i];
}

function save() {
  try {
    state.lastSeen = Date.now();
    localStorage.setItem("altinMadenci", JSON.stringify(state));
  } catch (e) { /* kayıt yapılamazsa sessizce geç */ }
}

function load() {
  try {
    const raw = localStorage.getItem("altinMadenci");
    if (raw) return Object.assign({}, defaultState, JSON.parse(raw));
  } catch (e) { /* bozuk kayıt varsa sıfırdan başla */ }
  return JSON.parse(JSON.stringify(defaultState));
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

// Altın kazan (hem cüzdana hem toplam sayaca ekler)
function addGold(amount) {
  state.gold += amount;
  state.totalEarned += amount;
  updateHud();
  updateTier();
}

// Bir yükseltmenin şu anki fiyatını hesapla
function upgradeCost(u) {
  const owned = state.upgrades[u.id] || 0;
  return Math.floor(u.cost * Math.pow(u.growth, owned));
}

// ============================================================
//  Arayüz güncelleme
// ============================================================
function updateHud() {
  goldEl.textContent = formatNumber(state.gold);
  perTapEl.textContent = formatNumber(state.perTap * state.multiplier);
  perSecEl.textContent = formatNumber(state.perSecond * state.multiplier);
}

// Toplam kazanca göre ortamı/seviyeyi ve arka planı günceller
function updateTier() {
  // Ulaşılan en yüksek kademeyi bul
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (state.totalEarned >= TIERS[i].need) idx = i;
  }
  const tier = TIERS[idx];
  const next = TIERS[idx + 1];

  // İlerleme çubuğu (bir sonraki ortama ne kadar kaldı)
  if (next) {
    const span = next.need - tier.need;
    const prog = Math.min(1, (state.totalEarned - tier.need) / span);
    tierFillEl.style.width = (prog * 100).toFixed(1) + "%";
    tierHintEl.innerHTML = "Sonraki: " + escapeHtml(next.name) + " (" + formatNumber(next.need) + " " + coinIcon() + ")";
  } else {
    tierFillEl.style.width = "100%";
    tierHintEl.innerHTML = "En yüksek seviye! 🏆";
  }

  // Kademe değiştiyse arka planı ve ismi güncelle
  if (idx !== currentTier) {
    const isUpgrade = idx > currentTier && currentTier !== -1;
    currentTier = idx;
    appEl.style.background = tier.bg;
    tierNameEl.textContent = tier.name;
    tierSceneEl.textContent = tier.scene;
    if (isUpgrade) toast("Yeni ortam açıldı: " + tier.name + " " + tier.scene);
  }
}

function renderUpgrades() {
  upgradeListEl.innerHTML = "";
  UPGRADES.forEach((u) => {
    const owned = state.upgrades[u.id] || 0;
    const cost = upgradeCost(u);
    const canBuy = state.gold >= cost;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-emoji">${u.emoji}</div>
      <div class="card-body">
        <div class="card-title">${u.title} ${owned > 0 ? `(x${owned})` : ""}</div>
        <div class="card-desc">${u.desc}</div>
      </div>
      <button class="buy-btn" ${canBuy ? "" : "disabled"}>${coinIcon()} ${formatNumber(cost)}</button>
    `;
    card.querySelector(".buy-btn").addEventListener("click", () => buyUpgrade(u));
    upgradeListEl.appendChild(card);
  });
}

function renderShop() {
  shopListEl.innerHTML = "";
  SHOP.forEach((item) => {
    // Paket açıklaması: altın miktarı (+ varsa kalıcı çarpan)
    let desc = formatNumber(item.coins) + " altın";
    if (item.mult) desc += " + Kalıcı x" + item.mult + " güç";

    const card = document.createElement("div");
    card.className = "card" + (item.badge ? " highlight" : "");
    card.innerHTML = `
      ${item.badge ? `<div class="badge">${item.badge}</div>` : ""}
      <div class="card-emoji">${item.emoji}</div>
      <div class="card-body">
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${desc}</div>
      </div>
      <button class="buy-btn money">${item.price}</button>
    `;
    card.querySelector(".buy-btn").addEventListener("click", () => buyShopItem(item));
    shopListEl.appendChild(card);
  });
}

// Rakip skorlarını geçen süreye göre ilerlet.
// Rakipler hem kazanır hem de zamanla "yükseltme alıp" daha hızlı kazanır (gelişir).
function advanceBots() {
  const now = Date.now();
  let dt = (now - (state.botsTime || now)) / 1000; // saniye
  if (dt < 0) dt = 0;
  if (dt > 3 * 86400) dt = 3 * 86400; // en fazla 3 gün ilerlet (abartmasın)

  state.bots.forEach((b) => {
    // Eski kayıtlarda gelişim hızı yoksa ata (geriye dönük uyumluluk)
    if (typeof b.growth !== "number") b.growth = 0.10 + Math.random() * 0.45;
    if (typeof b.rate !== "number") b.rate = Math.max(1, b.score * 0.00002);

    // Geçen sürede kazandığı altını ekle
    b.score += b.rate * dt;
    // Kazanç hızı zamanla artar (yükseltme alıyormuş gibi) — üstel gelişim
    b.rate *= Math.pow(1 + b.growth, dt / 3600);
  });

  state.botsTime = now;
}

// Oyuncu, ancak bu ortama (2. seviyeyi geçince) ulaşınca sıralamaya girer.
// currentTier 0'dan başlar: 0=Taş Mağara(1.sv), 1=Nemli Tünel(2.sv), 2=Derin Tünel(3.sv)...
const RANK_MIN_TIER = 2;

function renderLeaderboard() {
  advanceBots();

  const ranked = currentTier >= RANK_MIN_TIER; // oyuncu sıralamaya dahil mi?

  // Rakipleri sırala (en yüksekten düşüğe)
  const rows = state.bots.map((b) => ({ name: b.name, score: b.score, me: false }));
  if (ranked) {
    rows.push({ name: state.playerName || "Sen", score: state.totalEarned, me: true });
  }
  rows.sort((a, b) => b.score - a.score);

  leaderListEl.innerHTML = "";

  // Oyuncu henüz sıralamaya yerleşmediyse üstte bilgi kartı göster
  if (!ranked) {
    const notice = document.createElement("div");
    notice.className = "card me notice";
    notice.innerHTML = `
      <div class="card-emoji">⏳</div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(state.playerName || "Sen")} (sen)</div>
        <div class="card-desc">Henüz sıralamaya yerleşmediniz — biraz daha ilerleyin!</div>
      </div>
      <div class="score">${coinIcon()} ${formatNumber(state.totalEarned)}</div>
    `;
    leaderListEl.appendChild(notice);
  }

  // Bir sıra kartı oluşturan yardımcı
  function rowCard(r, rank) {
    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
    const card = document.createElement("div");
    card.className = "card" + (r.me ? " me" : "");
    card.innerHTML = `
      <div class="rank ${medal ? "medal" : ""}">${medal || rank}</div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(r.name)}${r.me ? " (sen)" : ""}</div>
        <div class="card-desc">${rank}. sıra</div>
      </div>
      <div class="score">${coinIcon()} ${formatNumber(r.score)}</div>
    `;
    return card;
  }

  // İlk 20 sırayı göster
  rows.slice(0, 20).forEach((r, i) => leaderListEl.appendChild(rowCard(r, i + 1)));

  // Oyuncu sıralamada ama ilk 20 dışındaysa, gerçek sırasını en altta göster
  if (ranked) {
    const myIndex = rows.findIndex((r) => r.me);
    if (myIndex >= 20) {
      const sep = document.createElement("div");
      sep.className = "rank-sep";
      sep.textContent = "• • •";
      leaderListEl.appendChild(sep);
      leaderListEl.appendChild(rowCard(rows[myIndex], myIndex + 1));
    }
  }
}

// Takma adı kaydet
function savePlayerName() {
  const v = nameInputEl.value.trim();
  if (!v) { toast("Bir takma ad yaz!"); return; }
  state.playerName = v;
  save();
  renderLeaderboard();
  toast("Takma adın kaydedildi: " + v);
}

// Basit HTML kaçış (isimlerde güvenlik için)
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// ============================================================
//  Oyun aksiyonları
// ============================================================
function doTap(x, y) {
  const gain = state.perTap * state.multiplier;
  state.gold += gain;
  state.totalEarned += gain;
  updateHud();
  updateTier();
  spawnFloater("+" + formatNumber(gain), x, y);
}

function spawnFloater(text, x, y) {
  const f = document.createElement("div");
  f.className = "floater";
  f.textContent = text;
  const rect = floatersEl.getBoundingClientRect();
  f.style.left = (x - rect.left - 15) + "px";
  f.style.top = (y - rect.top - 15) + "px";
  floatersEl.appendChild(f);
  setTimeout(() => f.remove(), 900);
}

function buyUpgrade(u) {
  const cost = upgradeCost(u);
  if (state.gold < cost) {
    toast("Yeterli altının yok!");
    return;
  }
  state.gold -= cost;
  state.upgrades[u.id] = (state.upgrades[u.id] || 0) + 1;
  if (u.type === "tap") state.perTap += u.value;
  if (u.type === "auto") state.perSecond += u.value;

  updateHud();
  renderUpgrades();
  save();
  toast(u.title + " alındı! 🎉");
}

function buyShopItem(item) {
  // ==========================================================
  // DEMO MODU: Şu an gerçek para alınmıyor, direkt veriyoruz.
  // Android'e çevirince burası gerçek Google Play satın almasına
  // bağlanacak (README'deki adımlara bak).
  // ==========================================================
  if (item.coins) addGold(item.coins);
  if (item.mult) state.multiplier *= item.mult;
  updateHud();
  updateTier();
  renderShop();
  save();
  toast(item.title + " alındı! ✅ (demo)");
}

// ============================================================
//  Sekme (ekran) değiştirme
// ============================================================
function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  $("#screen-" + name).classList.add("active");
  document.querySelector(`.tab[data-screen="${name}"]`).classList.add("active");
  if (name === "upgrades") renderUpgrades();
  if (name === "shop") renderShop();
  if (name === "leaderboard") renderLeaderboard();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => showScreen(tab.dataset.screen));
});

// Takma ad kaydetme
saveNameBtn.addEventListener("click", savePlayerName);
nameInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") savePlayerName();
});

// ============================================================
//  Girdi olayları (dokunma + fare)
// ============================================================
tapButton.addEventListener("click", (e) => {
  doTap(e.clientX, e.clientY);
});

// ============================================================
//  Otomatik kazanç döngüsü (saniyede bir)
// ============================================================
setInterval(() => {
  if (state.perSecond > 0) {
    const gain = state.perSecond * state.multiplier;
    state.gold += gain;
    state.totalEarned += gain;
    updateHud();
    updateTier();
  }
}, 1000);

// Her 10 saniyede bir otomatik kaydet
setInterval(save, 10000);
window.addEventListener("beforeunload", save);

// Sıralama ekranı açıkken listeyi canlı tut (2 saniyede bir)
setInterval(() => {
  if ($("#screen-leaderboard").classList.contains("active")) {
    renderLeaderboard();
  }
}, 2000);

// ============================================================
//  Başlangıç
// ============================================================
// Rakipleri ilk kez oluştur (kaydı yoksa)
if (!state.bots || !state.bots.length) {
  state.bots = makeBots();
  state.botsTime = Date.now();
  save();
}
nameInputEl.value = state.playerName || "";

// Çevrimdışı kazanç: oyun kapalıyken geçen süre için DÜŞÜK oranda altın ver
function grantOfflineEarnings() {
  if (!state.lastSeen || state.perSecond <= 0) return;
  let awaySec = (Date.now() - state.lastSeen) / 1000;
  if (awaySec < 60) return; // 1 dakikadan azsa boşver (hızlı yenileme vb.)
  awaySec = Math.min(awaySec, OFFLINE_MAX_HOURS * 3600);

  const earned = Math.floor(state.perSecond * state.multiplier * awaySec * OFFLINE_RATE);
  if (earned <= 0) return;

  state.gold += earned;
  state.totalEarned += earned;

  const mins = Math.floor(awaySec / 60);
  const timeText = mins >= 60 ? Math.floor(mins / 60) + " saat" : mins + " dk";
  setTimeout(() => {
    toast("Yokken " + timeText + "'de " + formatNumber(earned) + " altın kazandın! (açıkken çok daha fazlası...)");
  }, 600);
}

grantOfflineEarnings();

updateHud();
updateTier();
renderUpgrades();
renderShop();

// Açılış ekranını kapat (2.2 sn sonra veya dokununca)
(function handleSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    splash.classList.add("hide");
    setTimeout(() => splash.remove(), 700);
  };
  setTimeout(close, 2200);
  splash.addEventListener("click", close);
})();
