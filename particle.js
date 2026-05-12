// Kup patladiginda olusturulan kucuk renkli parcacikları oluşturmak için ayrı ve modüler yapıda kullanmak için yazdım.
// Bu patlama efekti grid dönmesinden etkilenmez.

class Particle {
  constructor(x, y, renk) {
    this.x = x;
    this.y = y;
    this.renk = renk;
    this.size = Math.random() * 7 + 2;

    // rastgele bir yönde fırlamasını sağlar
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;

    this.alpha = 1.0;
    this.active = true;
  }

  guncelle() {
    this.x += this.vx;
    this.y += this.vy;

    // her frame biraz yavasla
    this.vx *= 0.96;
    this.vy *= 0.96;

    // zamanla solar
    this.alpha -= 0.032;
    if (this.alpha <= 0) {
      this.active = false;
    }
  }

  ciz(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.renk;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}
