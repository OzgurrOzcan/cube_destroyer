// Ana oyun dosyasi. Oyun dongusu, tiklama kontrolu, asama sistemi burada yapılır,
// grid yönetimi ve ekran çizimi burada yapiliyor.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//yıldızları oluşturan mekanızma
let yildizlar = [];
for (let i = 0; i < 80; i++) {
  yildizlar.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.4,
    alpha: Math.random() * 0.6 + 0.3,
    titreHizi: Math.random() * 0.002 + 0.001,
  });
}

// ses mantığı
var tiklamaSesi = null;
var canSesi = null;
var arkaplanMuzik = null;

function sesleriYukle() {
  try {
    tiklamaSesi = new Audio("assets/sounds/pop.mp3");
  } catch (e) {}
  try {
    canSesi = new Audio("assets/sounds/health_sound.mp3");
  } catch (e) {}
  try {
    arkaplanMuzik = new Audio("assets/sounds/background_music.mp3");
    arkaplanMuzik.loop = true; // surekli dongu
    arkaplanMuzik.volume = 0.4; // cok yuksel olmasin
  } catch (e) {}
}

function arkaplanMuzikBaslat() {
  if (!arkaplanMuzik) return;
  arkaplanMuzik.currentTime = 0;
  arkaplanMuzik.play().catch(function () {});
}

function arkaplanMuzikDurdur() {
  if (!arkaplanMuzik) return;
  arkaplanMuzik.pause();
  arkaplanMuzik.currentTime = 0;
}

function sesCal(isim) {
  if (isim === "click" || isim === "explode") {
    if (!tiklamaSesi) return;
    tiklamaSesi.currentTime = 0;
    tiklamaSesi.play().catch(function () {});
  } else if (isim === "can") {
    // can gittiginde health_sound calinir
    if (!canSesi) return;
    canSesi.currentTime = 0;
    canSesi.play().catch(function () {});
  } else if (isim === "gameover") {
    // game_over dosyasi assets/ altinda (sounds klasoru disinda)
    try {
      var s = new Audio("assets/sounds/game_over.mp3");
      s.play().catch(function () {});
    } catch (e) {}
  }
}

// oyunun genel değişkenleri
var oyunDurumu = "menu"; // "menu" | "oynuyor" | "gameover"
var skor = 0;
var can = 3;
var mevcutAsama = 1;
var basariliTiklama = 0; // toplam basarili kup yok etme sayisi

// grid dönüşü
var gridAci = 0;
var gridHizi = 0.004; // baslangic grid dönüş hızı
var kupHizi = 0.01; // baslangic küp dönüş hızı

var gridMerkezX = canvas.width / 2;
var gridMerkezY = canvas.height / 2 + 20;

var kupler = [];
var parcaciklar = [];

var yanlisTiklamaTimer = 0; // kirmizi ekran flash suresi
var asamaMesajiZamani = 0; // asama gecis yazisi icin zaman

// Seviye Ayarları
// Her seviye icin küplerin dönüş hızı, grid dönüş hızı , kup sayısı ve boyutu ayarlamak için
function asamaBilgisiAl(asama) {
  var ayarlar = [
    { kupHizi: 0.01, gridHizi: 0.004, sayi: 12, boyut: 52 }, // asama 1
    { kupHizi: 0.022, gridHizi: 0.009, sayi: 12, boyut: 52 }, // asama 2
    { kupHizi: 0.038, gridHizi: 0.016, sayi: 12, boyut: 52 }, // asama 3
    { kupHizi: 0.038, gridHizi: 0.016, sayi: 18, boyut: 42 }, // asama 4
    { kupHizi: 0.038, gridHizi: 0.016, sayi: 24, boyut: 34 }, // asama 5
    { kupHizi: 0.038, gridHizi: 0.016, sayi: 30, boyut: 28 }, // asama 6+
  ];
  var i = Math.min(asama - 1, ayarlar.length - 1);
  return ayarlar[i];
}

// ---- GRID OLUSTURMA ----
// Kuplerinkupleri, grid merkezine gore yerel koordinatlara (localX, localY) yerlestirir
function kupleriOlustur() {
  kupler = [];
  var bilgi = asamaBilgisiAl(mevcutAsama);
  var boyut = bilgi.boyut;
  var sayi = bilgi.sayi;

  var sutun = Math.ceil(Math.sqrt(sayi));
  var satir = Math.ceil(sayi / sutun);
  var bosluk = 10;

  var toplamG = sutun * (boyut + bosluk) - bosluk;
  var toplamY = satir * (boyut + bosluk) - bosluk;

  // ilk küpün yerel koordinatı (grid merkezi = 0,0)
  var basX = -toplamG / 2 + boyut / 2;
  var basY = -toplamY / 2 + boyut / 2;

  var sayac = 0;
  for (var s = 0; s < satir && sayac < sayi; s++) {
    for (var k = 0; k < sutun && sayac < sayi; k++) {
      var lx = basX + k * (boyut + bosluk);
      var ly = basY + s * (boyut + bosluk);
      var hp = Math.floor(Math.random() * 3) + 1;
      kupler.push(new Cube(lx, ly, boyut, hp, kupHizi));
      sayac++;
    }
  }
}

// ---- KOORDINAT DONUSUM ----
// Yerel grid koordinatini canvas dunya koordinatina cevirip döndürüür.
// Bu sayede küpler yok edilince patlama parçaçıkları animasyonu  doğru yerde oluşurr
function localdenDunyaya(lx, ly) {
  return {
    x: gridMerkezX + lx * Math.cos(gridAci) - ly * Math.sin(gridAci),
    y: gridMerkezY + lx * Math.sin(gridAci) + ly * Math.cos(gridAci),
  };
}

function parcacikOlustur(x, y, renk) {
  for (var i = 0; i < 8; i++) {
    parcaciklar.push(new Particle(x, y, renk));
  }
}

// Yok edilen kupun yakin komsuları biraz buyur
function komsulariBuyut(oleniIndex) {
  var olen = kupler[oleniIndex];
  for (var i = 0; i < kupler.length; i++) {
    if (i === oleniIndex || !kupler[i].active) continue;
    var uzaklik = Math.hypot(
      kupler[i].localX - olen.localX,
      kupler[i].localY - olen.localY,
    );
    if (uzaklik < 130) {
      kupler[i].buyut();
    }
  }
}

function canKaybet() {
  can--;
  yanlisTiklamaTimer = 18;
  if (can <= 0) {
    can = 0;
    oyunDurumu = "gameover";
    arkaplanMuzikDurdur();
    sesCal("gameover"); // oyun bitti muzigi
  } else {
    sesCal("can"); // sadece bir can gitti
  }
}

// Basarili tiklama sayisina gore seviye atla
function asamayiKontrolEt() {
  var eski = mevcutAsama;

  if (basariliTiklama >= 36) mevcutAsama = 6;
  else if (basariliTiklama >= 26) mevcutAsama = 5;
  else if (basariliTiklama >= 18) mevcutAsama = 4;
  else if (basariliTiklama >= 12) mevcutAsama = 3;
  else if (basariliTiklama >= 6) mevcutAsama = 2;
  else mevcutAsama = 1;

  if (mevcutAsama !== eski) {
    var bilgi = asamaBilgisiAl(mevcutAsama);
    gridHizi = bilgi.gridHizi;
    kupHizi = bilgi.kupHizi;

    // mevcut kuplerinde hizini guncelle
    kupler.forEach(function (k) {
      k.donusHizi = kupHizi;
    });

    asamaMesajiZamani = Date.now();
    kupleriOlustur();
  }
}

canvas.addEventListener("click", function (e) {
  if (oyunDurumu !== "oynuyor") return;

  var rect = canvas.getBoundingClientRect();
  var tikX = e.clientX - rect.left;
  var tikY = e.clientY - rect.top;

  // 1. Adim: tiklama koordinatini grid yerel koordinatina cevir
  // Grid gridAci kadar donmus, bunu tersine ceviriyor
  var dx = tikX - gridMerkezX;
  var dy = tikY - gridMerkezY;
  var gx = dx * Math.cos(-gridAci) - dy * Math.sin(-gridAci);
  var gy = dx * Math.sin(-gridAci) + dy * Math.cos(-gridAci);

  var birKupeCarptim = false;

  for (var i = 0; i < kupler.length; i++) {
    var k = kupler[i];
    if (!k.active) continue;

    // 2. Adim: kupun kendi donusunu da hesaba katarak kup koordinatina cevir
    var cx = gx - k.localX;
    var cy = gy - k.localY;
    var rx = cx * Math.cos(-k.aci) - cy * Math.sin(-k.aci);
    var ry = cx * Math.sin(-k.aci) + cy * Math.cos(-k.aci);

    // 3. Adim: donmus koordinatta  (kup donse de bu her zaman calisir)
    if (Math.abs(rx) < k.size / 2 && Math.abs(ry) < k.size / 2) {
      birKupeCarptim = true;

      var kupRengi = k.color; // patlama parcacigi icin rengi once kaydet
      var oldu = k.hasarAl();

      if (oldu) {
        // kup yok edildi
        var dunya = localdenDunyaya(k.localX, k.localY);
        parcacikOlustur(dunya.x, dunya.y, kupRengi);
        komsulariBuyut(i);
        skor += 10 * mevcutAsama;
        basariliTiklama++;
        sesCal("explode");
        asamayiKontrolEt();
      } else {
        // hasar verildi ama kup hala yasıyor
        sesCal("click");
      }
      break;
    }
  }

  // hicbir aktif kupe carpmadi = yanlis tiklama, canı 1 azalt
  if (!birKupeCarptim) {
    canKaybet(); // ses canKaybet() icinde caliyor
  }
});

document.addEventListener("keydown", function (e) {
  if (e.code === "Enter") {
    if (oyunDurumu === "menu" || oyunDurumu === "gameover") {
      oyunuSifirla();
    }
  }
});

function oyunuSifirla() {
  skor = 0;
  can = 3;
  mevcutAsama = 1;
  basariliTiklama = 0;
  gridAci = 0;
  gridHizi = 0.004;
  kupHizi = 0.01;
  parcaciklar = [];
  yanlisTiklamaTimer = 0;
  kupleriOlustur();
  arkaplanMuzikBaslat();
  oyunDurumu = "oynuyor";
}

function guncelle() {
  if (oyunDurumu !== "oynuyor") return;

  // gridi dondur
  gridAci += gridHizi;

  // her bir küpü günceller
  kupler.forEach(function (k) {
    k.guncelle();
  });

  // parcaciklari günceler, bitenleri temizler
  parcaciklar.forEach(function (p) {
    p.guncelle();
  });
  parcaciklar = parcaciklar.filter(function (p) {
    return p.active;
  });

  // yanlis tiklama efekti sayaci
  if (yanlisTiklamaTimer > 0) yanlisTiklamaTimer--;

  // tum kupler yok edildiyse yeni tur olustur
  var aktifVar = false;
  for (var i = 0; i < kupler.length; i++) {
    if (kupler[i].active) {
      aktifVar = true;
      break;
    }
  }
  if (!aktifVar && kupler.length > 0) {
    kupleriOlustur();
  }
}

//CIZIM FONKSIYONLARI

function arkaPlaniCiz() {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // yildizlar, hafif titriyor
  yildizlar.forEach(function (y) {
    var titreme = 0.5 + 0.5 * Math.sin(Date.now() * y.titreHizi + y.x);
    ctx.save();
    ctx.globalAlpha = y.alpha * titreme;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(y.x, y.y, y.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// Grid ve icindeki kupleri ciz
// ctx.translate + ctx.rotate ile tum grid birlikte doner
function gridCiz() {
  ctx.save();
  ctx.translate(gridMerkezX, gridMerkezY);
  ctx.rotate(gridAci);
  kupler.forEach(function (k) {
    k.ciz(ctx);
  });
  ctx.restore();
}

function hudCiz() {
  ctx.save();
  ctx.textBaseline = "top";

  // sol üst: skor
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "left";
  ctx.fillText("SKOR: " + skor, 15, 12);

  // orta: asama
  ctx.textAlign = "center";
  ctx.fillText("ASAMA: " + mevcutAsama, canvas.width / 2, 12);

  // sag ust: can kalpleri (dolu = kirmizi, bos = gri)
  for (var i = 0; i < 3; i++) {
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillStyle = i < can ? "#e74c3c" : "#444444";
    ctx.fillText("♥", canvas.width - 12 - i * 30, 9);
  }

  ctx.restore();
}

// Yanlis tiklama yapilinca ekran kirmizi yanar
function yanlisTiklamaEfektiCiz() {
  if (yanlisTiklamaTimer <= 0) return;
  var alpha = (yanlisTiklamaTimer / 18) * 0.38;
  ctx.save();
  ctx.fillStyle = "rgba(231, 76, 60, " + alpha + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

// Asama degisince 1 saniye boyunca asama numarasini gösterir
function asamaMesajiCiz() {
  if (Date.now() - asamaMesajiZamani >= 1000) return;
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(canvas.width / 2 - 160, canvas.height / 2 - 50, 320, 85);
  ctx.fillStyle = "#f1c40f";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "ASAMA " + mevcutAsama + "!",
    canvas.width / 2,
    canvas.height / 2,
  );
  ctx.restore();
}

function menuCiz() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // baslik
  ctx.fillStyle = "#f1c40f";
  ctx.font = "bold 54px Arial";
  ctx.fillText("CUBE DESTROYER", canvas.width / 2, 150);

  // alt baslik
  ctx.fillStyle = "#aaaaaa";
  ctx.font = "19px Arial";
  ctx.fillText("Donen kupleri yok et!", canvas.width / 2, 215);

  // renk-HP aciklamasi
  ctx.font = "17px Arial";
  ctx.fillStyle = "#e74c3c";
  ctx.fillText("■  Kirmizi = 3 tiklama", canvas.width / 2, 268);
  ctx.fillStyle = "#e67e22";
  ctx.fillText("■  Turuncu = 2 tiklama", canvas.width / 2, 298);
  ctx.fillStyle = "#2ecc71";
  ctx.fillText("■  Yesil = 1 tiklama", canvas.width / 2, 328);

  // uyari
  ctx.fillStyle = "#cccccc";
  ctx.font = "16px Arial";
  ctx.fillText(
    "Bos alana tiklamak can kaybettirir!  (3 can)",
    canvas.width / 2,
    385,
  );
  ctx.fillText(
    "Grid ve kupler birlikte donerken basarili oldukca hizlanir.",
    canvas.width / 2,
    410,
  );

  // yanip sönen efektli baslat yazisi
  var yanip = Math.floor(Date.now() / 500) % 2 === 0;
  if (yanip) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.fillText("Baslamak icin ENTER'a bas", canvas.width / 2, 470);
  }

  ctx.restore();
}

function gameOverCiz() {
  ctx.save();

  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#e74c3c";
  ctx.font = "bold 62px Arial";
  ctx.fillText("OYUN BITTI", canvas.width / 2, canvas.height / 2 - 80);

  ctx.fillStyle = "#ffffff";
  ctx.font = "32px Arial";
  ctx.fillText("Skor: " + skor, canvas.width / 2, canvas.height / 2 - 5);

  ctx.fillStyle = "#aaaaaa";
  ctx.font = "20px Arial";
  ctx.fillText(
    "Ulastigi asama: " + mevcutAsama,
    canvas.width / 2,
    canvas.height / 2 + 42,
  );

  var yanip = Math.floor(Date.now() / 500) % 2 === 0;
  if (yanip) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Arial";
    ctx.fillText(
      "Tekrar oynamak icin ENTER'a bas",
      canvas.width / 2,
      canvas.height / 2 + 100,
    );
  }

  ctx.restore();
}

function ciz() {
  arkaPlaniCiz();

  if (oyunDurumu === "menu") {
    menuCiz();
  } else if (oyunDurumu === "oynuyor") {
    gridCiz();
    parcaciklar.forEach(function (p) {
      p.ciz(ctx);
    });
    yanlisTiklamaEfektiCiz();
    hudCiz();
    asamaMesajiCiz();
  } else if (oyunDurumu === "gameover") {
    gridCiz(); // arka planda grid gorunsun
    gameOverCiz();
  }
}

//genel oyun döngüsü
function oyunDongusu() {
  guncelle();
  ciz();
  requestAnimationFrame(oyunDongusu);
}

sesleriYukle();
oyunDongusu();
