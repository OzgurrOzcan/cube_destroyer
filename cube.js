// cube.js
// Tek bir kupu temsil eder.
// localX ve localY, grid merkezine gore goreceli konumdur.
// Gercek canvas konumu game.js içindeki grid donmesi için oluşturulan fonksiyonda hesaplanir.

class Cube {
  constructor(localX, localY, size, hp, donusHizi) {
    this.localX = localX;
    this.localY = localY;
    this.size = size;
    this.hp = hp;
    this.donusHizi = donusHizi;

    // rastgele baslangic acisi - hepsi ayni yonde baslamasin
    this.aci = Math.random() * Math.PI * 2;

    this.active = true;
    this.color = this.renkBelirle();

    this.flashTimer = 0;
    }

  // HP degerine göre küplerin renklerini belirler
  //çünkü oyunda kendi eklediğim mekanikte  her bir renkteki küp farklı tıklama değeri ile ölür
  renkBelirle() {
    if (this.hp === 3) return "#e74c3c";
    if (this.hp === 2) return "#e67e22";
    return "#2ecc71";
  }

  hasarAl() {
    this.hp--;
    this.flashTimer = 8;

    if (this.hp <= 0) {
      this.active = false;
      return true; // küpün yok olduğunu gösterir
    }

    this.color = this.renkBelirle();
    return false;
   }

  //oyun mekanızması gereği küp yok olunca diğer komşu küpler büyür
  buyut() {
    if (this.size < 62) {
      this.size += 3;
     }
  }

  guncelle() {
    this.aci += this.donusHizi;
    if (this.flashTimer > 0) this.flashTimer--;
  }

  // ctx bu noktada grid merkezinde ve grid acisiyla donmüs durumda
  ciz(ctx) {
    if (!this.active) return;

    ctx.save();

    // küpleirn kendi etrafında dönmesini sağlar bu da oyuna ekstra zorluk sağlar
    // (orjinal oyundan farklı olarak eklediğim zorluk mekanizması)

    ctx.translate(this.localX, this.localY);
    ctx.rotate(this.aci);

    ctx.fillStyle = this.flashTimer > 0 ? "#ffffff" : this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.font = "bold " + Math.floor(this.size * 0.38) + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.hp, 0, 0);

    ctx.restore();
  }
}
