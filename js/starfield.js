/**
 * Interactive Starfield & Cosmic Particle Background
 * Features: Multi-depth stars, parallax mouse movement, glowing meteors
 */

class CosmicStarfield {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.meteors = [];
    this.numStars = 220;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

    // Create stars
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(this.createStar());
    }

    // Occasional meteor
    setInterval(() => {
      if (Math.random() < 0.65 && this.meteors.length < 3) {
        this.meteors.push(this.createMeteor());
      }
    }, 2800);

    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  handleMouseMove(e) {
    this.mouse.targetX = (e.clientX - this.width / 2) * 0.04;
    this.mouse.targetY = (e.clientY - this.height / 2) * 0.04;
  }

  createStar() {
    const depth = Math.random() * 3 + 1; // 1 to 4
    const colors = ['#ffffff', '#00d9ff', '#ff3366', '#d6b3ff', '#fff4e6'];
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: (Math.random() * 1.8 + 0.5) * (depth / 2),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.3,
      alphaSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      depth: depth,
      speedX: (Math.random() - 0.5) * 0.15 * depth,
      speedY: (Math.random() * 0.2 + 0.05) * depth
    };
  }

  createMeteor() {
    const isRed = Math.random() > 0.5;
    return {
      x: Math.random() * this.width * 1.2,
      y: Math.random() * -100,
      length: Math.random() * 120 + 80,
      speed: Math.random() * 10 + 12,
      angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
      color: isRed ? '#ff2056' : '#00d9ff',
      alpha: 1
    };
  }

  animate() {
    // Smooth mouse parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render Stars
    for (let star of this.stars) {
      star.y += star.speedY;
      star.x += star.speedX;
      star.alpha += star.alphaSpeed;

      if (star.alpha <= 0.15 || star.alpha >= 1) {
        star.alphaSpeed = -star.alphaSpeed;
      }

      // Wrap around bounds
      if (star.y > this.height) star.y = 0;
      if (star.y < 0) star.y = this.height;
      if (star.x > this.width) star.x = 0;
      if (star.x < 0) star.x = this.width;

      const px = star.x + this.mouse.x * star.depth;
      const py = star.y + this.mouse.y * star.depth;

      this.ctx.save();
      this.ctx.globalAlpha = star.alpha;
      this.ctx.fillStyle = star.color;
      this.ctx.shadowBlur = star.size * 3;
      this.ctx.shadowColor = star.color;

      this.ctx.beginPath();
      this.ctx.arc(px, py, star.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Render Meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= 0.012;

      if (m.alpha <= 0 || m.y > this.height || m.x < -100) {
        this.meteors.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = m.alpha;
      const gradient = this.ctx.createLinearGradient(
        m.x, m.y,
        m.x - Math.cos(m.angle) * m.length,
        m.y - Math.sin(m.angle) * m.length
      );
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, m.color);
      gradient.addColorStop(1, 'transparent');

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 2.5;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = m.color;

      this.ctx.beginPath();
      this.ctx.moveTo(m.x, m.y);
      this.ctx.lineTo(
        m.x - Math.cos(m.angle) * m.length,
        m.y - Math.sin(m.angle) * m.length
      );
      this.ctx.stroke();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CosmicStarfield('starfield-canvas');
});
