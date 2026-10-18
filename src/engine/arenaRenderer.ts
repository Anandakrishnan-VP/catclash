import { ArenaDef, ArenaId } from '../types/game';
import { ARENAS } from '../config/arenas';

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export class ArenaRenderer {
  private ambientParticles: AmbientParticle[] = [];
  private time: number = 0;

  constructor() {
    this.initParticles();
  }

  private initParticles() {
    this.ambientParticles = [];
    for (let i = 0; i < 60; i++) {
      this.ambientParticles.push({
        x: Math.random() * 1000,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 40,
        vy: 20 + Math.random() * 40,
        size: 1 + Math.random() * 3,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }
  }

  public update(dt: number, arenaId: ArenaId) {
    this.time += dt;
    const def = ARENAS[arenaId] || ARENAS.rooftop;

    for (const p of this.ambientParticles) {
      if (def.particleType === 'rain') {
        p.vy = 450;
        p.vx = -80;
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        if (p.y > 600) {
          p.y = 0;
          p.x = Math.random() * 1100;
        }
      } else if (def.particleType === 'snow') {
        p.vy = 40 + Math.sin(this.time + p.x) * 15;
        p.vx = Math.sin(this.time * 2 + p.y) * 20;
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        if (p.y > 600) {
          p.y = 0;
          p.x = Math.random() * 1000;
        }
      } else if (def.particleType === 'embers') {
        // Floating upward
        p.vy = -60 - Math.random() * 40;
        p.vx = Math.sin(this.time * 3 + p.y) * 30;
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        if (p.y < 0) {
          p.y = 600;
          p.x = Math.random() * 1000;
        }
      } else {
        // Spores: gentle floating oscillation
        p.vx = Math.sin(this.time + p.y * 0.05) * 25;
        p.vy = -20 + Math.cos(this.time + p.x * 0.05) * 20;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y < 0) p.y = 600;
        if (p.x < 0) p.x = 1000;
        if (p.x > 1000) p.x = 0;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number, arenaId: ArenaId) {
    const arena = ARENAS[arenaId] || ARENAS.rooftop;

    ctx.save();

    // 1. Sky / Backdrop Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, arena.bgColors[0]);
    skyGrad.addColorStop(0.6, arena.bgColors[1]);
    skyGrad.addColorStop(1, arena.bgColors[2]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Arena-specific thematic background layers
    if (arenaId === 'rooftop') {
      this.renderNeonRooftop(ctx, width, height);
    } else if (arenaId === 'forest') {
      this.renderMagicalForest(ctx, width, height);
    } else if (arenaId === 'temple') {
      this.renderFrozenTemple(ctx, width, height);
    } else if (arenaId === 'volcano') {
      this.renderVolcanicArena(ctx, width, height);
    }

    // 3. Ground platform
    this.renderGround(ctx, width, height, arena);

    // 4. Ambient Weather Particles
    this.renderAmbientWeather(ctx, arena);

    ctx.restore();
  }

  private renderNeonRooftop(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Distant futuristic skyscrapers with illuminated windows
    const buildingWidths = [70, 90, 60, 110, 80, 95, 75, 120, 85, 100, 70];
    let curX = 20;

    for (let i = 0; i < buildingWidths.length; i++) {
      const bWidth = buildingWidths[i];
      const bHeight = 180 + ((i * 37) % 160);
      const bY = 460 - bHeight;

      // Building silhouette
      ctx.fillStyle = i % 2 === 0 ? '#111827' : '#0f172a';
      ctx.fillRect(curX, bY, bWidth, bHeight);

      // Neon roof antenna
      if (i % 3 === 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(curX + bWidth / 2, bY);
        ctx.lineTo(curX + bWidth / 2, bY - 30);
        ctx.stroke();

        // Blinking red beacon
        ctx.fillStyle = Math.sin(this.time * 5 + i) > 0 ? '#ef4444' : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(curX + bWidth / 2, bY - 30, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Grid of windows
      ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(234, 179, 8, 0.4)';
      for (let wy = bY + 15; wy < 440; wy += 22) {
        for (let wx = curX + 10; wx < curX + bWidth - 10; wx += 16) {
          if ((wx + wy + i) % 3 !== 0) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }

      // Neon billboard on selected skyscraper
      if (i === 3) {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
        ctx.fillRect(curX + 10, bY + 30, bWidth - 20, 45);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.strokeRect(curX + 10, bY + 30, bWidth - 20, 45);
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 12px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CAT CLASH', curX + bWidth / 2, bY + 58);
      } else if (i === 7) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(curX + 10, bY + 40, bWidth - 20, 40);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(curX + 10, bY + 40, bWidth - 20, 40);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CYBER PAW', curX + bWidth / 2, bY + 65);
      }

      curX += bWidth + 12;
    }
  }

  private renderMagicalForest(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Ethereal Moon
    const moonGrad = ctx.createRadialGradient(220, 130, 10, 220, 130, 90);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.3, 'rgba(52, 211, 153, 0.6)');
    moonGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(220, 130, 90, 0, Math.PI * 2);
    ctx.fill();

    // Ancient trees silhouetted in background
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.moveTo(0, 460);
    ctx.quadraticCurveTo(120, 200, 160, 460);
    ctx.lineTo(0, 460);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(820, 460);
    ctx.quadraticCurveTo(890, 180, 1000, 460);
    ctx.lineTo(820, 460);
    ctx.fill();

    // Giant Glowing Bioluminescent Mushrooms
    const mushrooms = [
      { x: 130, y: 460, r: 42, color: '#10b981' },
      { x: 180, y: 460, r: 26, color: '#34d399' },
      { x: 840, y: 460, r: 48, color: '#6ee7b7' },
      { x: 790, y: 460, r: 30, color: '#10b981' },
    ];

    for (const m of mushrooms) {
      // Mushroom Stem
      ctx.fillStyle = 'rgba(240, 253, 244, 0.7)';
      ctx.fillRect(m.x - 6, m.y - m.r * 1.2, 12, m.r * 1.2);

      // Glowing Cap
      const pulse = 1 + Math.sin(this.time * 2 + m.x) * 0.08;
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y - m.r * 1.2, m.r * pulse, (m.r / 1.6) * pulse, 0, Math.PI, 0);
      ctx.fill();

      // Cap Spots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(m.x - m.r * 0.4, m.y - m.r * 1.4, 4, 0, Math.PI * 2);
      ctx.arc(m.x + m.r * 0.3, m.y - m.r * 1.3, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderFrozenTemple(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Sharp icy cavern stalactites from ceiling
    ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
    for (let x = 40; x < width; x += 65) {
      const len = 40 + ((x * 19) % 80);
      ctx.beginPath();
      ctx.moveTo(x - 20, 0);
      ctx.lineTo(x + 20, 0);
      ctx.lineTo(x, len);
      ctx.closePath();
      ctx.fill();
    }

    // Carved Frozen Pillars
    const pillars = [120, 320, 680, 880];
    for (const px of pillars) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 28, 140, 56, 320);

      // Rune insets with icy glow
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(px - 20, 160, 40, 280);

      // Inner glowing glyph
      const glow = Math.sin(this.time * 3 + px) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(56, 189, 248, ${glow})`;
      ctx.font = 'bold 16px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ᚱ', px, 220);
      ctx.fillText('ᛏ', px, 280);
      ctx.fillText('ᚢ', px, 340);
    }
  }

  private renderVolcanicArena(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Jagged fiery mountain spires
    ctx.fillStyle = '#290707';
    ctx.beginPath();
    ctx.moveTo(0, 460);
    ctx.lineTo(180, 160);
    ctx.lineTo(360, 460);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(640, 460);
    ctx.lineTo(820, 140);
    ctx.lineTo(1000, 460);
    ctx.closePath();
    ctx.fill();

    // Glowing Lava Crevasses in Background
    const lavaGrad = ctx.createLinearGradient(0, 380, 0, 460);
    lavaGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
    lavaGrad.addColorStop(1, 'rgba(249, 115, 22, 0.45)');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, 380, width, 80);
  }

  private renderGround(ctx: CanvasRenderingContext2D, width: number, height: number, arena: ArenaDef) {
    const groundY = arena.groundY;

    // Platform Top Surface
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, groundY, width, height - groundY);

    // Glowing Platform Edge Border
    ctx.strokeStyle = arena.accentColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Arena-specific floor details
    if (arena.id === 'rooftop') {
      // Perspective grid on rooftop
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + (x - width / 2) * 0.3, height);
        ctx.stroke();
      }
    } else if (arena.id === 'volcano') {
      // Molten cracks across floor
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, groundY + 15);
      ctx.lineTo(240, groundY + 35);
      ctx.lineTo(400, groundY + 20);
      ctx.moveTo(600, groundY + 25);
      ctx.lineTo(760, groundY + 10);
      ctx.lineTo(920, groundY + 40);
      ctx.stroke();
    } else if (arena.id === 'forest') {
      // Mossy edge along ground
      ctx.fillStyle = '#059669';
      for (let x = 10; x < width; x += 30) {
        ctx.beginPath();
        ctx.arc(x, groundY, 4, 0, Math.PI);
        ctx.fill();
      }
    } else if (arena.id === 'temple') {
      // Crystal reflections
      ctx.fillStyle = 'rgba(186, 230, 253, 0.15)';
      ctx.fillRect(0, groundY, width, 30);
    }

    ctx.restore();
  }

  private renderAmbientWeather(ctx: CanvasRenderingContext2D, arena: ArenaDef) {
    ctx.save();
    for (const p of this.ambientParticles) {
      ctx.globalAlpha = p.alpha;
      if (arena.particleType === 'rain') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 4, p.y + 12);
        ctx.stroke();
      } else if (arena.particleType === 'snow') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (arena.particleType === 'embers') {
        ctx.fillStyle = Math.random() > 0.4 ? '#f97316' : '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spores
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
