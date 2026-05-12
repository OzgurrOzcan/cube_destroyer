## **htmlde oyun yaparken kullanlıan canvas özelliği nedir ne işe yarar detaylıca anlat ve en son örnkelr vererek açıkla?**

-HTML <canvas>, web tarayıcılarında JavaScript kullanarak anlık olarak (on-the-fly) grafikler, animasyonlar ve oyunlar çizmeni sağlayan bir HTML5 elementidir.

Standart HTML elementlerinden (örneğin bir <div> veya <img>) farklı olarak, canvas tek bir DOM düğümüdür (node) ancak içindeki grafikler Immediate Mode (Anında Mod) adı verilen bir mantıkla çizilir. Yani tarayıcı, canvas içine çizdiğin bir kareyi veya karakteri bir HTML elementi olarak hafızasında tutmaz; sadece o anki piksellerin rengini değiştirir. Bu da onu oyun geliştirme gibi yüksek performans ve saniyede 60 kare (60 FPS) yenileme gerektiren durumlar için mükemmel bir araç yapar.

Canvas Nasıl Çalışır?
Canvas elementinin kendisi sadece boş bir "tuval"dir. Çizim yapabilmek için JavaScript üzerinden bu tuvalin Render Context (Çizim Bağlamı) adı verilen arayüzüne erişmen gerekir.

En yaygın kullanılan iki bağlam şunlardır:

2d (CanvasRenderingContext2D): İki boyutlu şekiller, metinler, resimler ve pikseller çizmek için kullanılan standart API. Web tabanlı 2D oyunların çoğu bunu kullanır.

webgl veya webgl2: Donanım hızlandırmalı 3D (ve gelişmiş 2D) grafikler çizmek için OpenGL ES tabanlı bir API. Yüksek performanslı, karmaşık oyunlar (veya oyun motorları) arka planda bunu kullanır.

Oyun Geliştirmede Neden Canvas Kullanılır?
Performans: DOM manipülasyonu çok maliyetlidir. Ekranda 1000 tane hareket eden obje varsa, bunları 1000 farklı <div> ile hareket ettirmek tarayıcıyı dondurur. Canvas ise sadece pikselleri güncellediği için donanım hızlandırmasıyla (GPU) çok daha performanslı çalışır.

Piksel Kontrolü: Her bir pikselin rengine müdahale edebilir, çarpışma algılama (collision detection) veya özel görsel efektler (parçacık sistemleri vb.) yazabilirsin.

Esneklik: Sprite animasyonları (karakter hareketleri), dinamik arka planlar ve fizik hesaplamaları canvas üzerine kolayca yansıtılabilir.

Canvas Oyunlarının Temel Anatomisi: Oyun Döngüsü (Game Loop)
Bir canvas oyunu statik değildir. Sürekli olarak ekranı temizler ve yeni pozisyonlara göre objeleri tekrar çizer. Bu sürece Game Loop denir ve tarayıcılarda genellikle requestAnimationFrame metodu ile sağlanır.

Durumu Güncelle (Update): Karakterin yeri nerede? Tuşlara basıldı mı? Düşman hareket etti mi? Çarpışma var mı?

Ekranı Temizle (Clear): Bir önceki kareden kalan çizimleri sil.

Çiz (Draw/Render): Güncel duruma göre her şeyi tuvale tekrar çiz.

Örnekler ile İnceleyelim
Aşağıdaki örnekleri bir HTML dosyasında kaydedip tarayıcıda açarak test edebilirsin.

Örnek 1: Temel Çizim İşlemleri
Bu örnekte Canvas'a nasıl eriştiğimizi ve temel şekilleri nasıl çizdiğimizi görebilirsin.

HTML

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
Örnek 2: Hareket ve Oyun Döngüsü (Hareket Eden Kutu)
Bu örnek, bir objeyi "Game Loop" kullanarak ekranda nasıl hareket ettirdiğimizi gösterir. Animasyonun temel taşı budur.

HTML

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
Bu mantık, üzerine fizik kuralları (yerçekimi, sürtünme), kullanıcı girdileri (klavye dinleyicileri) ve çarpışma algılama algoritmaları eklenerek büyütülür ve modern oyun mekanikleri oluşturulur.

Aşağıdaki araç ile Canvas mantığının biraz daha gelişmiş bir fizik döngüsünde nasıl davrandığını canlı olarak inceleyebilirsin:

\*\*

\*\*function kupleriOlustur() {
kupler = [];
var bilgi = asamaBilgisiAl(mevcutAsama);
var boyut = bilgi.boyut;
var sayi = bilgi.sayi;

var sutun = Math.ceil(Math.sqrt(sayi));
var satir = Math.ceil(sayi / sutun);
var bosluk = 10;

var toplamG = sutun _ (boyut + bosluk) - bosluk;
var toplamY = satir _ (boyut + bosluk) - bosluk;

// ilk küpün yerel koordinatı (grid merkezi = 0,0)
var basX = -toplamG / 2 + boyut / 2;
var basY = -toplamY / 2 + boyut / 2;

var sayac = 0;
for (var s = 0; s < satir && sayac < sayi; s++) {
for (var k = 0; k < sutun && sayac < sayi; k++) {
var lx = basX + k _ (boyut + bosluk);
var ly = basY + s _ (boyut + bosluk);
var hp = Math.floor(Math.random() \* 3) + 1;
kupler.push(new Cube(lx, ly, boyut, hp, kupHizi));
sayac++;
}
}
}

bu fonksiyonda üretilen konumları canvas a nasıl entegre olacka şekilde dönüşüm yapablirm?

AI cevabı:

Yazdığın algoritma aslında oyun geliştirmede çok profesyonel bir yaklaşımdır. Küplerin konumlarını (0,0) merkez noktasına göre hesaplıyorsun. Buna bilgisayar grafiklerinde Yerel Koordinat Sistemi (Local Space) denir.

Ancak HTML Canvas'ın doğası gereği orijin noktası (0,0) her zaman ekranın sol üst köşesidir. Bu duruma da Dünya Koordinat Sistemi (World Space) diyebiliriz.

Şu anki kodunla küpleri çizmeye kalkarsan, gridin merkezi sol üst köşeye yerleşeceği için küplerin yarısı ekranın dışında (negatif x ve y değerlerinde) kalacaktır.

Bu yerel koordinatları Canvas'a entegre etmek için temelde iki farklı ve etkili yöntemin var:

Yöntem 1: Üretim Aşamasında Offset (Kaydırma) Eklemek
En basit yöntem, küpleri oluştururken o "yerel" koordinatlara, ekranın neresinde durmalarını istiyorsan o noktanın x ve y değerlerini eklemektir. Örneğin gridin tam ekranın ortasında olmasını istiyorsan, Canvas'ın genişliğinin ve yüksekliğinin yarısını bir offset (kaydırma) olarak kullanabilirsin.

Kodunu şu şekilde güncelleyebilirsin:

JavaScript
// Fonksiyona gridin merkezinin Canvas üzerinde nerede olacağını parametre olarak veriyoruz
function kupleriOlustur(canvasMerkezX, canvasMerkezY) {
kupler = [];
var bilgi = asamaBilgisiAl(mevcutAsama);
var boyut = bilgi.boyut;
var sayi = bilgi.sayi;

var sutun = Math.ceil(Math.sqrt(sayi));
var satir = Math.ceil(sayi / sutun);
var bosluk = 10;

var toplamG = sutun _ (boyut + bosluk) - bosluk;
var toplamY = satir _ (boyut + bosluk) - bosluk;

// ilk küpün yerel koordinatı (grid merkezi = 0,0)
var basX = -toplamG / 2 + boyut / 2;
var basY = -toplamY / 2 + boyut / 2;

var sayac = 0;
for (var s = 0; s < satir && sayac < sayi; s++) {
for (var k = 0; k < sutun && sayac < sayi; k++) {
// Yerel koordinatları hesapla
var yerelX = basX + k _ (boyut + bosluk);
var yerelY = basY + s _ (boyut + bosluk);

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
Yöntem 2: Çizim Aşamasında ctx.translate() Kullanmak (Gelişmiş)
Eğer nesnelerinin veritabanında veya bellekte sadece birbirlerine olan uzaklıklarıyla (yerel koordinatlarıyla) kalmasını, sadece çizilirken Canvas'ın ortasına gelmesini istiyorsan Canvas API'nin kendi matris dönüşümlerini kullanabilirsin.

Bu yöntemde kupleriOlustur fonksiyonun hiç değişmez. Olduğu gibi bırakırsın. Değişikliği render veya draw fonksiyonunda yaparsın:

JavaScript
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
Hangisini Seçmeli?
Eğer küplerin üzerine tıklama (mouse click) algılayacaksan veya diğer ekran koordinatlarındaki objelerle (örneğin ekranın altından ateş eden bir gemiyle) çarpışma hesaplayacaksan Yöntem 1 daha kolaydır çünkü tüm objelerin fiziksel koordinatları aynı düzlemde (Canvas Dünya Koordinatlarında) hesaplanmış olur.

Aşağıdaki araç üzerinden, yazdığın yerel koordinat mantığının Canvas orijin noktasıyla (Offset X ve Offset Y) nasıl ilişkilendiğini ve dönüştürüldüğünü canlı olarak inceleyebilirsin:
