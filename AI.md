# AI Kullanım Kayıtları

Bu dosya, projeyi geliştirirken yapay zekaya yönelttiğim soruları ve aldığım cevapları içerir.

---

## Soru 1

> **htmlde oyun yaparken kullanlıan canvas özelliği nedir ne işe yarar detaylıca anlat ve en son örnkelr vererek açıkla?**

### Cevap

HTML `<canvas>`, web tarayıcılarında JavaScript kullanarak anlık olarak (on-the-fly) grafikler, animasyonlar ve oyunlar çizmeni sağlayan bir HTML5 elementidir.

Standart HTML elementlerinden (örneğin bir `<div>` veya `<img>`) farklı olarak, canvas tek bir DOM düğümüdür (node) ancak içindeki grafikler **Immediate Mode (Anında Mod)** adı verilen bir mantıkla çizilir. Yani tarayıcı, canvas içine çizdiğin bir kareyi veya karakteri bir HTML elementi olarak hafızasında tutmaz; sadece o anki piksellerin rengini değiştirir. Bu da onu oyun geliştirme gibi yüksek performans ve saniyede 60 kare (60 FPS) yenileme gerektiren durumlar için mükemmel bir araç yapar.

### Canvas Nasıl Çalışır?

Canvas elementinin kendisi sadece boş bir "tuval"dir. Çizim yapabilmek için JavaScript üzerinden bu tuvalin **Render Context (Çizim Bağlamı)** adı verilen arayüzüne erişmen gerekir.

En yaygın kullanılan iki bağlam şunlardır:

- **2d (CanvasRenderingContext2D):** İki boyutlu şekiller, metinler, resimler ve pikseller çizmek için kullanılan standart API. Web tabanlı 2D oyunların çoğu bunu kullanır.
- **webgl veya webgl2:** Donanım hızlandırmalı 3D (ve gelişmiş 2D) grafikler çizmek için OpenGL ES tabanlı bir API. Yüksek performanslı, karmaşık oyunlar (veya oyun motorları) arka planda bunu kullanır.

### Oyun Geliştirmede Neden Canvas Kullanılır?

- **Performans:** DOM manipülasyonu çok maliyetlidir. Ekranda 1000 tane hareket eden obje varsa, bunları 1000 farklı `<div>` ile hareket ettirmek tarayıcıyı dondurur. Canvas ise sadece pikselleri güncellediği için donanım hızlandırmasıyla (GPU) çok daha performanslı çalışır.
- **Piksel Kontrolü:** Her bir pikselin rengine müdahale edebilir, çarpışma algılama (collision detection) veya özel görsel efektler (parçacık sistemleri vb.) yazabilirsin.
- **Esneklik:** Sprite animasyonları (karakter hareketleri), dinamik arka planlar ve fizik hesaplamaları canvas üzerine kolayca yansıtılabilir.

### Canvas Oyunlarının Temel Anatomisi: Oyun Döngüsü (Game Loop)

Bir canvas oyunu statik değildir. Sürekli olarak ekranı temizler ve yeni pozisyonlara göre objeleri tekrar çizer. Bu sürece **Game Loop** denir ve tarayıcılarda genellikle `requestAnimationFrame` metodu ile sağlanır.

1. **Durumu Güncelle (Update):** Karakterin yeri nerede? Tuşlara basıldı mı? Düşman hareket etti mi? Çarpışma var mı?
2. **Ekranı Temizle (Clear):** Bir önceki kareden kalan çizimleri sil.
3. **Çiz (Draw/Render):** Güncel duruma göre her şeyi tuvale tekrar çiz.

### Örnek 1: Temel Çizim İşlemleri

Bu örnekte Canvas'a nasıl eriştiğimizi ve temel şekilleri nasıl çizdiğimizi görebilirsin.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Canvas Temelleri</title>
    <style>
        /* Canvas'ın sınırlarını görmek için bir çerçeve ekleyelim */
        canvas {
            border: 2px solid black;
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>

    <!-- Tuvali HTML'e ekliyoruz -->
    <canvas id="oyunEkrani" width="600" height="400"></canvas>

    <script>
        // 1. Canvas elementini seç
        const canvas = document.getElementById("oyunEkrani");

        // 2. 2D çizim bağlamını al
        const ctx = canvas.getContext("2d");

        // --- ÇİZİM İŞLEMLERİ ---

        // Kırmızı bir dikdörtgen çizimi (Örn: Oyuncu karakteri)
        ctx.fillStyle = "red"; // Fırça rengi
        ctx.fillRect(50, 50, 100, 100); // (x, y, genişlik, yükseklik)

        // Mavi bir çember çizimi (Örn: Top)
        ctx.beginPath();
        ctx.arc(300, 200, 40, 0, Math.PI * 2); // (x, y, yarıçap, başlangıç açısı, bitiş açısı)
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.closePath();

        // Metin yazımı (Örn: Skor tablosu)
        ctx.font = "24px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Skor: 100", 450, 40);
    </script>

</body>
</html>
```

### Örnek 2: Hareket ve Oyun Döngüsü (Hareket Eden Kutu)

Bu örnek, bir objeyi "Game Loop" kullanarak ekranda nasıl hareket ettirdiğimizi gösterir. Animasyonun temel taşı budur.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Canvas Animasyon Döngüsü</title>
    <style>
        canvas { border: 2px solid #333; }
    </style>
</head>
<body>

    <canvas id="gameCanvas" width="600" height="400"></canvas>

    <script>
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");

        // Oyuncu objemizin özellikleri
        const player = {
            x: 50,
            y: 150,
            width: 50,
            height: 50,
            speed: 5
        };

        // Oyun Döngüsü Fonksiyonu
        function gameLoop() {
            // 1. GÜNCELLE (Update)
            // Karakteri sağa doğru hareket ettir
            player.x += player.speed;

            // Ekrandan çıkarsa başa sar (Basit bir mantık)
            if (player.x > canvas.width) {
                player.x = -player.width;
            }

            // 2. TEMİZLE (Clear)
            // Tüm ekranı temizlemezsek arkasında iz bırakır
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 3. ÇİZ (Draw)
            ctx.fillStyle = "green";
            ctx.fillRect(player.x, player.y, player.width, player.height);

            // Döngüyü saniyede ~60 kez çağırarak animasyonu devam ettir
            requestAnimationFrame(gameLoop);
        }

        // Döngüyü başlat
        gameLoop();
    </script>

</body>
</html>
```

Bu mantık, üzerine fizik kuralları (yerçekimi, sürtünme), kullanıcı girdileri (klavye dinleyicileri) ve çarpışma algılama algoritmaları eklenerek büyütülür ve modern oyun mekanikleri oluşturulur.

Aşağıdaki araç ile Canvas mantığının biraz daha gelişmiş bir fizik döngüsünde nasıl davrandığını canlı olarak inceleyebilirsin.

---

## Soru 2

> **Aşağıdaki fonksiyonda üretilen konumları canvas'a nasıl entegre olacak şekilde dönüşüm yapabilirim?**

```js
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
```

### Cevap

Yazdığın algoritma aslında oyun geliştirmede çok profesyonel bir yaklaşımdır. Küplerin konumlarını (0,0) merkez noktasına göre hesaplıyorsun. Buna bilgisayar grafiklerinde **Yerel Koordinat Sistemi (Local Space)** denir.

Ancak HTML Canvas'ın doğası gereği orijin noktası (0,0) her zaman ekranın sol üst köşesidir. Bu duruma da **Dünya Koordinat Sistemi (World Space)** diyebiliriz.

Şu anki kodunla küpleri çizmeye kalkarsan, gridin merkezi sol üst köşeye yerleşeceği için küplerin yarısı ekranın dışında (negatif x ve y değerlerinde) kalacaktır.

Bu yerel koordinatları Canvas'a entegre etmek için temelde iki farklı ve etkili yöntemin var:

### Yöntem 1: Üretim Aşamasında Offset (Kaydırma) Eklemek

En basit yöntem, küpleri oluştururken o "yerel" koordinatlara, ekranın neresinde durmalarını istiyorsan o noktanın x ve y değerlerini eklemektir. Örneğin gridin tam ekranın ortasında olmasını istiyorsan, Canvas'ın genişliğinin ve yüksekliğinin yarısını bir offset (kaydırma) olarak kullanabilirsin.

Kodunu şu şekilde güncelleyebilirsin:

```js
// Fonksiyona gridin merkezinin Canvas üzerinde nerede olacağını parametre olarak veriyoruz
function kupleriOlustur(canvasMerkezX, canvasMerkezY) {
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
      // Yerel koordinatları hesapla
      var yerelX = basX + k * (boyut + bosluk);
      var yerelY = basY + s * (boyut + bosluk);

      // Yerel koordinatları Canvas (Dünya) koordinatlarına dönüştür
      var canvasX = canvasMerkezX + yerelX;
      var canvasY = canvasMerkezY + yerelY;

      var hp = Math.floor(Math.random() * 3) + 1;

      // Küp objesine dönüştürülmüş gerçek Canvas koordinatlarını gönder
      kupler.push(new Cube(canvasX, canvasY, boyut, hp, kupHizi));
      sayac++;
    }
  }
}

// Kullanımı: Grid ekranın tam ortasında oluşsun
// kupleriOlustur(canvas.width / 2, canvas.height / 2);
```

### Yöntem 2: Çizim Aşamasında `ctx.translate()` Kullanmak (Gelişmiş)

Eğer nesnelerinin veritabanında veya bellekte sadece birbirlerine olan uzaklıklarıyla (yerel koordinatlarıyla) kalmasını, sadece çizilirken Canvas'ın ortasına gelmesini istiyorsan Canvas API'nin kendi matris dönüşümlerini kullanabilirsin.

Bu yöntemde `kupleriOlustur` fonksiyonun hiç değişmez. Olduğu gibi bırakırsın. Değişikliği `render` veya `draw` fonksiyonunda yaparsın:

```js
function draw() {
    // Ekranı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Canvas'ın mevcut durumunu kaydet
    ctx.save();

    // 2. Canvas'ın orijin (0,0) noktasını ekranın ortasına taşı
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // 3. Küpleri çiz (Küplerin içindeki x,y değerleri negatif olsa da
    // translate yaptığımız için artık ekranın ortasını 0,0 kabul edecekler)
    for (var i = 0; i < kupler.length; i++) {
        kupler[i].draw(ctx);
    }

    // 4. Canvas'ı eski haline (orijin sol üste) geri getir
    ctx.restore();

    // UI veya skor gibi diğer elementleri çizmeye devam edebilirsin...
}
```

### Hangisini Seçmeli?

Eğer küplerin üzerine tıklama (mouse click) algılayacaksan veya diğer ekran koordinatlarındaki objelerle (örneğin ekranın altından ateş eden bir gemiyle) çarpışma hesaplayacaksan **Yöntem 1** daha kolaydır çünkü tüm objelerin fiziksel koordinatları aynı düzlemde (Canvas Dünya Koordinatlarında) hesaplanmış olur.

Aşağıdaki araç üzerinden, yazdığın yerel koordinat mantığının Canvas orijin noktasıyla (Offset X ve Offset Y) nasıl ilişkilendiğini ve dönüştürüldüğünü canlı olarak inceleyebilirsin.

---

## Soru 3

> **Html5 ve canvas ile oyun yaparken genel oyun çizimlerini nasıl yapabilirim detaylıca örnek kodlar üzerinden adım adım tek tek açıklayarak konuyu anlat.**

### Cevap

HTML5 Canvas ile oyun geliştirirken temel mantık şudur:

- Canvas oluşturulur
- JavaScript ile çizim yapılır
- Sürekli çalışan bir "game loop" kurulur
- Objeler çizilir ve güncellenir
- Kullanıcı girdileri alınır
- Çarpışma, fizik, animasyon eklenir

Aşağıda sana gerçek oyun mantığıyla ilerleyen şekilde adım adım anlatacağım.

### 1. Canvas Nedir?

Canvas, HTML içinde JavaScript ile çizim yapabildiğin bir alandır. Örneğin:

```html
<canvas id="gameCanvas" width="800" height="500"></canvas>
```

Bu alan boş bir tuvaldir. JavaScript ile içine: Kare, Daire, Resim, Karakter, Harita, Animasyon çizersin.

### 2. İlk Canvas Oyunu Kurulumu

Basit bir başlangıç yapalım.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Canvas Oyun</title>
    <style>
        body{
            margin:0;
            overflow:hidden;
        }
        canvas{
            background:black;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script src="game.js"></script>
</body>
</html>
```

### 3. Canvas'ı JavaScript'te Yakalamak

**game.js**

```js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
```

**Burada Ne Oldu?**

- `canvas` → HTML'deki canvas elementini aldık.
- `ctx` → `const ctx = canvas.getContext("2d");` Bu EN önemli satırlardan biridir. Çünkü `ctx` çizim motorudur. Tüm çizimler bununla yapılır.

### 4. İlk Çizim — Kare çizelim

```js
ctx.fillStyle = "red";
ctx.fillRect(100, 100, 200, 150);
```

**fillRect Nasıl Çalışır?** `fillRect(x, y, width, height)`

Anlamı:
- `x` → soldan uzaklık
- `y` → yukarıdan uzaklık
- `width` → genişlik
- `height` → yükseklik

Ekranda Ne Görürüz? 100,100 koordinatında kırmızı bir dikdörtgen.

### 5. Oyunlardaki Gerçek Mantık

Gerçek oyunlarda direkt çizim yapılmaz. Şöyle yapılır:

- oyuncu oluştur
- oyuncuyu güncelle
- oyuncuyu çiz
- ekranı sürekli yenile

Bunun için **GAME LOOP** gerekir.

### 6. Game Loop (En Önemli Konu)

```js
function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "red";
    ctx.fillRect(100,100,100,100);

    requestAnimationFrame(gameLoop);
}

gameLoop();
```

**Burada Ne Oldu?**

- `clearRect` → `ctx.clearRect(0,0,canvas.width,canvas.height);` Ekranı temizler. Temizlemezsek önceki frame'ler kalır.
- `requestAnimationFrame` → Bu fonksiyon `gameLoop()` fonksiyonunu saniyede yaklaşık 60 kez çağırır. Böylece animasyon oluşur.

### 7. Hareket Ettirme

Şimdi kareyi hareket ettirelim.

```js
let x = 100;

function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    x += 2;

    ctx.fillStyle = "red";
    ctx.fillRect(x,100,100,100);

    requestAnimationFrame(gameLoop);
}

gameLoop();
```

**Mantık:** Her frame'de `x += 2;` olduğu için kare sağa gider.

### 8. Oyuncu Objesi Oluşturma

Gerçek oyun mantığına geçelim.

```js
const player = {
    x:100,
    y:100,
    width:50,
    height:50,
    color:"blue"
};
```

**Çizme Fonksiyonu**

```js
function drawPlayer(){
    ctx.fillStyle = player.color;
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
}
```

**Game Loop**

```js
function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

gameLoop();
```

### 9. Klavye Kontrolü

**Tuşları Dinleme**

```js
const keys = {};

window.addEventListener("keydown", (e)=>{
    keys[e.key] = true;
});

window.addEventListener("keyup", (e)=>{
    keys[e.key] = false;
});
```

**Hareket Sistemi**

```js
function updatePlayer(){
    if(keys["ArrowRight"]){
        player.x += 5;
    }
    if(keys["ArrowLeft"]){
        player.x -= 5;
    }
    if(keys["ArrowUp"]){
        player.y -= 5;
    }
    if(keys["ArrowDown"]){
        player.y += 5;
    }
}
```

**Game Loop'e Ekleyelim**

```js
function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    updatePlayer();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}
```

### 10. Daire Çizmek

```js
ctx.beginPath();
ctx.arc(300,300,50,0,Math.PI*2);
ctx.fillStyle = "yellow";
ctx.fill();
```

**arc Parametreleri:** `arc(x,y,radius,startAngle,endAngle)`

### 11. Resim Çizmek

Gerçek oyunlarda genelde sprite kullanılır.

**Resim Yükleme**

```js
const playerImage = new Image();
playerImage.src = "player.png";
```

**Çizme**

```js
ctx.drawImage(playerImage,100,100,64,64);
```

### 12. Sprite Animation

Karakter animasyonu için sprite sheet kullanılır. Mantık:

```
[frame1][frame2][frame3]
```

**Örnek**

```js
ctx.drawImage(
    spriteSheet,
    frameX * spriteWidth,
    frameY * spriteHeight,
    spriteWidth,
    spriteHeight,
    player.x,
    player.y,
    spriteWidth,
    spriteHeight
);
```

**Bu Sistem Nasıl Çalışıyor?** Sprite sheet'in içinden küçük parçalar kesilir. Her frame'de farklı kare gösterilir. Böylece yürüyüş animasyonu oluşur.

### 13. Çarpışma Sistemi

En temel collision sistemi:

```js
function collision(a,b){
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
```

**Kullanım**

```js
if(collision(player,enemy)){
    console.log("Çarpışma!");
}
```

### 14. Düşman Sistemi

```js
const enemy = {
    x:500,
    y:200,
    width:50,
    height:50,
    color:"red"
};
```

**Çizim**

```js
function drawEnemy(){
    ctx.fillStyle = enemy.color;
    ctx.fillRect(
        enemy.x,
        enemy.y,
        enemy.width,
        enemy.height
    );
}
```

### 15. Physics (Yerçekimi)

Platform oyunlarında:

```js
player.velocityY += gravity;
player.y += player.velocityY;
```

**Zıplama**

```js
player.velocityY = -15;
```

Negatif yukarı gider.

### 16. Delta Time (Profesyonel Sistem)

Bazı bilgisayarlarda FPS farklı olur. Profesyonel çözüm:

```js
let lastTime = 0;

function gameLoop(timestamp){
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    requestAnimationFrame(gameLoop);
}
```

### 17. Oyun Mimarisi

Profesyonel oyunlarda yapı genelde şöyledir:

```
game/
│
├── index.html
├── js/
│   ├── player.js
│   ├── enemy.js
│   ├── physics.js
│   ├── input.js
│   ├── collision.js
│   └── main.js
│
├── assets/
│   ├── images
│   ├── sounds
│   └── maps
```

### 18. Gerçek Oyun Döngüsü

Profesyonel akış:

```js
function gameLoop(){
    update();
    render();
    requestAnimationFrame(gameLoop);
}
```

- `update()` → Mantık kısmı: hareket, fizik, yapay zeka, collision
- `render()` → Sadece çizim.

### 19. Küçük Bir Tam Oyun Örneği

```js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

const player = {
    x:100,
    y:100,
    width:50,
    height:50,
    speed:5
};

const keys = {};

window.addEventListener("keydown",(e)=>{
    keys[e.key] = true;
});

window.addEventListener("keyup",(e)=>{
    keys[e.key] = false;
});

function update(){
    if(keys["ArrowRight"]){
        player.x += player.speed;
    }
    if(keys["ArrowLeft"]){
        player.x -= player.speed;
    }
    if(keys["ArrowUp"]){
        player.y -= player.speed;
    }
    if(keys["ArrowDown"]){
        player.y += player.speed;
    }
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "cyan";
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
}

function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
```

### 20. Öğrenmen Gereken Sıradaki Konular

Sırayla şunları öğren:

- Canvas çizim sistemi
- Game loop
- Input sistemi
- Collision
- Sprite animation
- Physics
- Tile map sistemi
- Kamera sistemi
- Particle effects
- Sound system
- State management
- Entity Component System (ECS)

### Sana Önerdiğim Mini Projeler

Sırayla yap:

- Hareket eden kare
- Pong oyunu
- Space Shooter
- Mario clone
- Vampire Survivors clone
- Multiplayer canvas game

### Öğrenmen Gereken Çok Önemli Canvas Fonksiyonları

**Çizim:** `fillRect()`, `strokeRect()`, `clearRect()`, `drawImage()`, `fillText()`

**Path Sistemi:** `beginPath()`, `moveTo()`, `lineTo()`, `arc()`, `fill()`, `stroke()`

### Canvas ile Profesyonel Oyun Yapanlar Ne Kullanıyor?

Saf canvas başlangıç için iyidir. Sonra genelde: **Phaser**, **PixiJS**, **Three.js** öğrenilir.

### Sana Önerdiğim Öğrenme Stratejisi

Senin seviyene göre en mantıklı sıra:

```
HTML/CSS
↓
JavaScript
↓
Canvas
↓
2D Game Logic
↓
Collision + Physics
↓
Sprite Animation
↓
Mini Oyunlar
↓
Phaser.js
↓
Multiplayer + Backend
```

### Özellikle Anlaman Gereken En Kritik Nokta

Canvas oyun geliştirme:

- çizim yapmak
- her frame güncellemek
- objeleri yönetmek

mantığıdır. Yani oyun geliştirme aslında: **UPDATE + DRAW + LOOP**

---

## Soru 4

> **canvasta arka plana ekldeğim yıldız efektlerini nasıl titreme efekti verebilirlim?**

### Cevap

Canvas'ta yıldızlara "titreme" (twinkle) efekti vermenin mantığı aslında yıldızın:

- parlaklığını değiştirmek
- boyutunu hafif değiştirmek
- opacity (şeffaflık) animasyonu yapmak

üzerine kurulur.

Gerçek oyunlarda genelde şu teknik kullanılır:

Her yıldızın:

- kendi parlaklığı
- kendi hızı
- kendi animasyon zamanı

olur. Böylece tüm yıldızlar aynı anda yanıp sönmez.

### 1. Basit Titreme Mantığı

En temel sistem:

```js
brightness += speed;
```

ve sonra:

```js
ctx.globalAlpha = brightness;
```

kullanılır.

### 2. Basit Çalışan Örnek

**HTML**

```html
<canvas id="canvas"></canvas>
```

**JavaScript**

```js
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];

for(let i = 0; i < 200; i++){
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        alpha: Math.random(),
        speed: Math.random() * 0.02
    });
}

function drawStars(){
    for(let star of stars){
        // alpha değiştir
        star.alpha += star.speed;

        // sınırlar
        if(star.alpha >= 1 || star.alpha <= 0){
            star.speed *= -1;
        }

        // opacity
        ctx.globalAlpha = star.alpha;

        // yıldız çiz
        ctx.beginPath();
        ctx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = "white";
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawStars();
    requestAnimationFrame(animate);
}

animate();
```

**Bu Kod Nasıl Çalışıyor?**

Her yıldızın `alpha` değeri var. Bu:

- 0 → görünmez
- 1 → tam parlak

demektir.

**Titreme Nerede Oluşuyor?** Şurada:

```js
star.alpha += star.speed;
```

**Sonra Neden Ters Çeviriyoruz?**

```js
if(star.alpha >= 1 || star.alpha <= 0){
    star.speed *= -1;
}
```

Bu satır:

```
parlaklaş
↓
maksimuma ulaş
↓
kararmaya başla
↓
minimuma ulaş
↓
yeniden parlaklaş
```

animasyonu oluşturur.

### 3. Profesyonel Görünmesi İçin Ne Yapılır?

Gerçek oyunlarda:

- her yıldız farklı hızda titrer
- farklı boyutta olur
- farklı opacity ile başlar
- hafif renk tonu olur

**Daha Gerçekçi Versiyon**

```js
stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2 + 0.5,
    alpha: Math.random(),
    speed: (Math.random() * 0.02) + 0.005
});
```

### 4. Sinüs ile Ultra Yumuşak Titreme

Profesyonel yöntemlerden biri: `Math.sin()` kullanmaktır. Bu çok daha doğal görünür.

**Örnek**

```js
const stars = [];

for(let i = 0; i < 150; i++){
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.05
    });
}
```

**Çizim**

```js
function drawStars(){
    for(let star of stars){
        star.angle += star.speed;

        const alpha = Math.sin(star.angle) * 0.5 + 0.5;

        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "white";
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}
```

**Bu Neden Daha Güzel?**

Çünkü `Math.sin()` değerleri yumuşak geçiş üretir. Ani değişim olmaz. Gerçek yıldız efekti gibi görünür.

### 5. Glow (Parlama) Eklemek

En iyi görüntü için glow eklenir.

```js
ctx.shadowBlur = 10;
ctx.shadowColor = "white";
```

**Örnek**

```js
ctx.shadowBlur = 10;
ctx.shadowColor = "white";
ctx.fill();
```

### 6. Profesyonel Starfield Sistemi

Gerçek oyunlarda yıldız sistemi genelde:

- background layer
- parallax
- twinkle
- glow
- random color
- depth

özelliklerine sahip olur.

### 7. Parallax Yıldız Sistemi

Uzak yıldızlar:

- daha küçük
- daha yavaş

Yakın yıldızlar:

- daha büyük
- daha hızlı

hareket eder.

**Örnek Derinlik Sistemi**

```js
stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random() * 3
});
```

**Hareket**

```js
star.x -= star.z;
```

### 8. En Güzel Görünen Teknik

Şunların birleşimi:

- sin wave alpha
- glow
- random size
- parallax

çok profesyonel görünür.

### 9. Tam Profesyonel Mini Starfield

```js
const stars = [];

for(let i = 0; i < 300; i++){
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.03
    });
}

function drawStars(){
    for(let star of stars){
        star.angle += star.speed;

        const alpha = Math.sin(star.angle) * 0.5 + 0.5;

        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );

        ctx.shadowBlur = 15;
        ctx.shadowColor = "white";

        ctx.fillStyle = "white";

        ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}
```

### Oyunlarda En Büyük Hata

Yeni başlayanlar şunu yapar:

```js
ctx.fillStyle = "white";
```

Ama opacity kullanmaz. Bu yüzden yıldızlar:

- statik
- ölü
- yapay

görünür.

### Gerçekçi Uzay Arka Planı İçin Öğrenmen Gerekenler

Sırayla:

- Alpha animation
- Sin wave
- Glow
- Particle systems
- Parallax
- Noise/randomness
- Delta time

### Sana Güzel Bir Mini Proje

Şunu yap: **Space Background Simulator**

İçinde olsun:

- yıldızlar
- twinkle
- parallax
- shooting stars
- nebula efekti
- mouse hareketi

Bunu yaparsan canvas mantığın inanılmaz gelişir.

---

## Soru 5

> **Yukarıda linkini attığım oyunun benzerini yapıyorum yaptığım oyunda küüpler yok edildikçe komşu küplerin büyümesi gerekiyor ve benim yazdığım kod aşağıdaki gibi**
>
> ```js
> function komsulariBuyut(oleniIndex) {
>   var olen = kupler[oleniIndex];
>   for (var i = 0; i < kupler.length; i++) {
>     if (i === oleniIndex || !kupler[i].active) continue;
> ```
>
> **Burdan sonrasında nasıl bir mantıkla komşu küpleri büyütebilirim?**

### Cevap

Burada yapman gereken şey, diğer küplerin "komşu" olup olmadığını kontrol etmek. Yani ölen küp ile diğer küpler arasındaki mesafeye bakacaksın.

**Mantık:**

- Eğer başka bir küp ölen küpe yakınsa → komşudur.
- Komşuysa → scale değerini artır.

**Örneğin:**

```js
function komsulariBuyut(oleniIndex) {
  var olen = kupler[oleniIndex];

  for (var i = 0; i < kupler.length; i++) {
    if (i === oleniIndex || !kupler[i].active)
      continue;

    var diger = kupler[i];

    // X ve Y mesafesi
    var dx = Math.abs(diger.x - olen.x);
    var dy = Math.abs(diger.y - olen.y);

    // Komşu kontrolü
    if (
      (dx === 1 && dy === 0) || // sağ-sol
      (dx === 0 && dy === 1)    // üst-alt
    ) {
      // Küpü büyüt
      diger.size += 10;
    }
  }
}
```

Buradaki önemli fikir:

```js
dx === 1 && dy === 0
```

demek:

- X ekseninde 1 kare uzak,
- Y ekseninde aynı hizadalar.

Yani sağ veya sol komşu.

Eğer çapraz komşular da büyüsün istiyorsan:

```js
if (dx <= 1 && dy <= 1)
```

kullanabilirsin. Bu durumda:

```
[X][X][X]
[X][O][X]
[X][X][X]
```

Ortadaki O yok olunca etrafındaki tüm küpler büyür.

Bir de profesyonel görünmesi için direkt:

```js
diger.size += 10;
```

yerine animasyon mantığı kullanabilirsin:

```js
diger.targetSize += 10;
```

ve render/update kısmında yavaşça büyütürsün:

```js
diger.size += (diger.targetSize - diger.size) * 0.1;
```

Bu sayede büyüme smooth görünür.
