export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  gravity?: number;
  shape?: 'circle' | 'square' | 'line' | 'star' | 'slash';
  rotation?: number;
  vRot?: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
  speed: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  fontSize: number;
  alpha: number;
  duration: number;
  scale: number;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public shockwaves: Shockwave[] = [];
  public floatingTexts: FloatingText[] = [];
  public screenShake: number = 0;

  public shake(intensity: number) {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  public update(dt: number) {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - 24 * dt);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot * dt;
      }
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * dt;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
      if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy * dt;
      t.duration -= dt;
      t.scale = Math.min(1.2, t.scale + dt * 0.4);
      t.alpha = Math.max(0, t.duration / 0.85);
      if (t.duration <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Render shockwaves first
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, sw.alpha));
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.lineWidth;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Render particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.shape === 'line') {
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
        ctx.stroke();
      } else if (p.shape === 'star') {
        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            Math.cos(((18 + i * 72) * Math.PI) / 180) * p.size,
            -Math.sin(((18 + i * 72) * Math.PI) / 180) * p.size
          );
          ctx.lineTo(
            Math.cos(((54 + i * 72) * Math.PI) / 180) * (p.size / 2),
            -Math.sin(((54 + i * 72) * Math.PI) / 180) * (p.size / 2)
          );
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Render floating texts with drop shadow & border
    for (const t of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, t.alpha));
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      ctx.font = `900 ${t.fontSize}px 'Orbitron', 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Thick dark outline
      ctx.strokeStyle = '#050510';
      ctx.lineWidth = 5;
      ctx.strokeText(t.text, 0, 0);

      // Bright fill
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    }
  }

  public spawnHitSparks(x: number, y: number, color: string = '#facc15', count: number = 18) {
    this.shake(3.5);
    // Radial explosive sparks
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 140 + Math.random() * 320;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? color : '#ffffff',
        size: 2.5 + Math.random() * 3.5,
        alpha: 1,
        decay: 2.8 + Math.random() * 2,
        gravity: 450,
        shape: Math.random() > 0.35 ? 'line' : 'circle',
      });
    }

    // Expanding miniature shockwave
    this.shockwaves.push({
      x,
      y,
      radius: 8,
      maxRadius: 42,
      color,
      alpha: 0.9,
      lineWidth: 3,
      speed: 220,
    });
  }

  public spawnHeavyImpact(x: number, y: number, color: string = '#f97316') {
    this.shake(8);
    // Large heavy shockwave
    this.shockwaves.push({
      x,
      y,
      radius: 12,
      maxRadius: 85,
      color,
      alpha: 1,
      lineWidth: 5,
      speed: 360,
    });

    // Ring of debris
    for (let i = 0; i < 26; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 180 + Math.random() * 350;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        color: Math.random() > 0.5 ? color : '#ffffff',
        size: 3 + Math.random() * 4,
        alpha: 1,
        decay: 2.0,
        gravity: 600,
        shape: 'star',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10,
      });
    }
  }

  public spawnClawSlash(x: number, y: number, facing: number, color: string = '#38bdf8') {
    for (let i = 0; i < 12; i++) {
      const angle = (facing > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.9;
      const speed = 200 + Math.random() * 250;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3.5 + Math.random() * 2.5,
        alpha: 1,
        decay: 3.5,
        shape: 'line',
      });
    }
  }

  public spawnFootDust(x: number, y: number, color: string = '#94a3b8', count: number = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 60,
        vy: -20 - Math.random() * 40,
        color,
        size: 2.5 + Math.random() * 2.5,
        alpha: 0.6,
        decay: 2.2,
        shape: 'circle',
      });
    }
  }

  public spawnClash(x: number, y: number) {
    this.shake(7);
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 70,
      color: '#ffffff',
      alpha: 1,
      lineWidth: 4,
      speed: 300,
    });

    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2;
      const speed = 260 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? '#ffffff' : '#fbbf24',
        size: 4 + Math.random() * 3,
        alpha: 1,
        decay: 2.0,
        shape: 'star',
        rotation: Math.random() * Math.PI,
        vRot: 6,
      });
    }
  }

  public spawnDamageText(x: number, y: number, amount: number, isCrit: boolean = false) {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x: x + (Math.random() - 0.5) * 35,
      y: y - 25,
      vy: -75 - Math.random() * 45,
      text: `${Math.round(amount)}`,
      color: isCrit ? '#f43f5e' : '#fbbf24',
      fontSize: isCrit ? 28 : 22,
      alpha: 1,
      duration: 0.85,
      scale: isCrit ? 1.4 : 1.0,
    });
  }

  public spawnFloatingMessage(x: number, y: number, text: string, color: string = '#38bdf8') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y: y - 40,
      vy: -55,
      text,
      color,
      fontSize: 24,
      alpha: 1,
      duration: 1.1,
      scale: 1.2,
    });
  }

  public clear() {
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.screenShake = 0;
  }
}
