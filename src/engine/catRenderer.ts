import { PlayerState } from '../types/game';
import { CATS } from '../config/cats';

export class CatRenderer {
  public renderPlayer(ctx: CanvasRenderingContext2D, player: PlayerState, time: number) {
    const cat = CATS[player.catId] || CATS.shadow;
    const { visual } = cat;

    ctx.save();
    ctx.translate(player.x, player.y);

    // Flip horizontally based on facing direction
    ctx.scale(player.facing, 1);

    // Apply invulnerability blink / rage aura / frozen tint
    if (player.invulnerableTimer > 0 && Math.floor(time * 30) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    const isFrozen = player.statusEffects.some((s) => s.type === 'frozen');
    const isBurning = player.statusEffects.some((s) => s.type === 'burn');

    // Rage aura (when low health or rageActive)
    if (player.rageActive || player.health < player.maxHealth * 0.3) {
      this.renderRageAura(ctx, time);
    }

    // Ultimate ready glowing aura
    if (player.energy >= 100) {
      this.renderUltimateAura(ctx, visual.glowColor, time);
    }

    // Shield barrier if blocking
    if (player.isBlocking || player.action === 'skill_defensive') {
      this.renderShieldDome(ctx, visual.glowColor, time);
    }

    // Render Cat Body based on current action
    switch (player.action) {
      case 'jump':
      case 'fall':
        this.renderJumpPose(ctx, visual, player, time, isFrozen, isBurning);
        break;
      case 'dash':
      case 'skill_movement':
        this.renderDashPose(ctx, visual, player, time, isFrozen, isBurning);
        break;
      case 'attack_basic':
        this.renderAttackBasicPose(ctx, visual, player, time, isFrozen, isBurning);
        break;
      case 'attack_heavy':
        this.renderAttackHeavyPose(ctx, visual, player, time, isFrozen, isBurning);
        break;
      case 'skill_1':
      case 'skill_2':
        this.renderSkillCastPose(ctx, visual, player, time, isFrozen, isBurning);
        break;
      case 'ultimate':
        this.renderUltimatePose(ctx, visual, player, time);
        break;
      case 'hurt':
      case 'knockback':
        this.renderHurtPose(ctx, visual, player, time);
        break;
      case 'victory':
        this.renderVictoryPose(ctx, visual, time);
        break;
      case 'defeat':
        this.renderDefeatPose(ctx, visual, time);
        break;
      case 'walk':
        this.renderWalkPose(ctx, visual, player, time, isFrozen, isBurning);
        break;
      case 'idle':
      default:
        this.renderIdlePose(ctx, visual, player, time, isFrozen, isBurning);
        break;
    }

    ctx.restore();
  }

  // === IDLE POSE ===
  private renderIdlePose(
    ctx: CanvasRenderingContext2D,
    v: typeof CATS.shadow.visual,
    p: PlayerState,
    t: number,
    frozen: boolean,
    burning: boolean
  ) {
    const breath = Math.sin(t * 3) * 2;
    const tailWag = Math.sin(t * 4) * 0.25;

    // 1. Tail (curled upward swaying)
    this.drawTail(ctx, -26, -14, tailWag, v.primaryColor, v.secondaryColor);

    // 2. Hind Leg & Paw
    this.drawPaw(ctx, -18, 0, v.secondaryColor);

    // 3. Cat Torso / Body
    this.drawBody(ctx, 0, -22 + breath, 52, 34, v.primaryColor, v.bellyColor);

    // 4. Cat Special Accessories (Headband, collar, etc.)
    this.drawCatAccessories(ctx, p.catId, 0, -22 + breath);

    // 5. Front Paws
    this.drawPaw(ctx, 12, 0, v.secondaryColor);
    this.drawPaw(ctx, -2, 0, v.secondaryColor);

    // 6. Cat Head & Ears & Face
    this.drawHead(ctx, 16, -38 + breath * 0.7, v, 'normal', t);

    // Status overlays
    if (frozen) this.drawIceOverlay(ctx, 0, -20);
    if (burning) this.drawFireOverlay(ctx, 0, -20, t);
  }

  // === WALK POSE ===
  private renderWalkPose(
    ctx: CanvasRenderingContext2D,
    v: typeof CATS.shadow.visual,
    p: PlayerState,
    t: number,
    frozen: boolean,
    burning: boolean
  ) {
    const legPhase = Math.sin(t * 12);
    const bob = Math.abs(Math.sin(t * 12)) * 3;

    // Tail sways vigorously during movement
    this.drawTail(ctx, -26, -14, Math.sin(t * 8) * 0.45, v.primaryColor, v.secondaryColor);

    // Hind legs alternate
    this.drawPaw(ctx, -20 + legPhase * 8, -Math.max(0, -legPhase) * 6, v.secondaryColor);
    this.drawPaw(ctx, -10 - legPhase * 8, -Math.max(0, legPhase) * 6, v.secondaryColor);

    // Body slightly angled forward
    ctx.save();
    ctx.rotate(0.08);
    this.drawBody(ctx, 0, -22 + bob, 54, 32, v.primaryColor, v.bellyColor);
    this.drawCatAccessories(ctx, p.catId, 0, -22 + bob);
    ctx.restore();

    // Front paws alternate
    this.drawPaw(ctx, 16 - legPhase * 10, -Math.max(0, legPhase) * 8, v.secondaryColor);
    this.drawPaw(ctx, 4 + legPhase * 10, -Math.max(0, -legPhase) * 8, v.secondaryColor);

    // Head
    this.drawHead(ctx, 18, -36 + bob, v, 'focused', t);

    if (frozen) this.drawIceOverlay(ctx, 0, -20);
    if (burning) this.drawFireOverlay(ctx, 0, -20, t);
  }

  // === JUMP / FALL POSE ===
  private renderJumpPose(
    ctx: CanvasRenderingContext2D,
    v: typeof CATS.shadow.visual,
    p: PlayerState,
    t: number,
    frozen: boolean,
    burning: boolean
  ) {
    const isFalling = p.vy > 0;
    const bodyAngle = isFalling ? 0.2 : -0.25;

    ctx.save();
    ctx.rotate(bodyAngle);

    // Stretched tail
    this.drawTail(ctx, -26, -10, isFalling ? 0.3 : -0.4, v.primaryColor, v.secondaryColor);

    // Hind legs stretched back
    this.drawPaw(ctx, -28, 6, v.secondaryColor);
    this.drawPaw(ctx, -18, 12, v.secondaryColor);

    // Sleek stretched body
    this.drawBody(ctx, 0, -20, 56, 28, v.primaryColor, v.bellyColor);
    this.drawCatAccessories(ctx, p.catId, 0, -20);

    // Front paws reaching forward
    this.drawPaw(ctx, 22, -10, v.secondaryColor);
    this.drawPaw(ctx, 14, -4, v.secondaryColor);

    // Head tilted
    this.drawHead(ctx, 20, -32, v, 'focused', t);

    ctx.restore();

    if (frozen) this.drawIceOverlay(ctx, 0, -20);
    if (burning) this.drawFireOverlay(ctx, 0, -20, t);
  }

  // === DASH POSE ===
  private renderDashPose(
    ctx: CanvasRenderingContext2D,
    v: typeof CATS.shadow.visual,
    p: PlayerState,
    t: number,
    frozen: boolean,
    burning: boolean
  ) {
    // Ghost trail / speed lines behind
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = v.glowColor;
    ctx.fillRect(-65, -30, 40, 16);
    ctx.fillRect(-85, -20, 50, 10);
    ctx.restore();

    ctx.save();
    ctx.rotate(0.18); // Low aerodynamic forward leap

    this.drawTail(ctx, -32, -6, 0.1, v.primaryColor, v.secondaryColor);
    this.drawPaw(ctx, -24, 4, v.secondaryColor);
    this.drawBody(ctx, 0, -18, 60, 26, v.primaryColor, v.bellyColor);
    this.drawCatAccessories(ctx, p.catId, 0, -18);
    this.drawPaw(ctx, 28, -6, v.secondaryColor);
    this.drawHead(ctx, 24, -30, v, 'fierce', t);

    ctx.restore();
  }

  // === ATTACK BASIC (CLAW SLASH) ===
  private renderAttackBasicPose(
    ctx: CanvasRenderingContext2D,
    v: typeof CATS.shadow.visual,
    p: PlayerState,
    t: number,
    frozen: boolean,
    burning: boolean
  ) {
    this.drawTail(ctx, -26, -14, 0.3, v.primaryColor, v.secondaryColor);
    this.drawPaw(ctx, -16, 0, v.secondaryColor);
    this.drawBody(ctx, -2, -22, 52, 34, v.primaryColor, v.bellyColor);
    this.drawCatAccessories(ctx, p.catId, -2, -22);

    // Extended front claw slash forward
    ctx.save();
    ctx.strokeStyle = v.glowColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Glowing crescent claw trail
    ctx.arc(28, -25, 34, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // 3 sharp claw tips
    ctx.fillStyle = '#ffffff';
    for (let c = -0.3; c <= 0.3; c += 0.3) {
      const cx = 28 + Math.cos(c) * 35;
      const cy = -25 + Math.sin(c) * 35;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Front attacking paw
    this.drawPaw(ctx, 26, -22, v.secondaryColor);
    this.drawPaw(ctx, 6, 0, v.secondaryColor);
    this.drawHead(ctx, 16, -38, v, 'fierce', t);
  }

  // === ATTACK HEAVY (PAW SLAM) ===
  private renderAttackHeavyPose(
    ctx: CanvasRenderingContext2D,
    v: typeof CATS.shadow.visual,
    p: PlayerState,
    t: number,
    frozen: boolean,
    burning: boolean
  ) {
    // Rearing up on hind legs to slam
    ctx.save();
    ctx.rotate(-0.25);

    this.drawTail(ctx, -20, 0, -0.4, v.primaryColor, v.secondaryColor);
    this.drawPaw(ctx, -14, 8, v.secondaryColor);
    this.drawPaw(ctx, -4, 8, v.secondaryColor);

    this.drawBody(ctx, 0, -28, 48, 40, v.primaryColor, v.bellyColor);
    this.drawCatAccessories(ctx, p.catId, 0, -28);

    // Both front heavy paws raised high
    this.drawPaw(ctx, 14, -50, v.secondaryColor, 1.4);
    this.drawPaw(ctx, 26, -46, v.secondaryColor, 1.4);

    this.drawHead(ctx, 12, -54, v, 'fierce', t);
    ctx.restore();
  }

  // === SKILL CAST POSE ===
  private renderSkillCastPose(
    ctx: CanvasRenderingContext2D,
    v: typeof CATS.shadow.visual,
    p: PlayerState,
    t: number,
    frozen: boolean,
    burning: boolean
  ) {
    this.drawTail(ctx, -26, -14, Math.sin(t * 10) * 0.5, v.primaryColor, v.secondaryColor);
    this.drawPaw(ctx, -16, 0, v.secondaryColor);
    this.drawBody(ctx, 0, -24, 52, 34, v.primaryColor, v.bellyColor);
    this.drawCatAccessories(ctx, p.catId, 0, -24);

    // Front paw channeling energy
    this.drawPaw(ctx, 22, -26, v.secondaryColor);
    this.drawPaw(ctx, 4, 0, v.secondaryColor);

    // Rotating elemental orb at paw tip
    ctx.save();
    const orbGrad = ctx.createRadialGradient(38, -26, 4, 38, -26, 22);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.5, v.glowColor);
    orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(38, -26, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    this.drawHead(ctx, 14, -38, v, 'focused', t);
  }

  // === ULTIMATE POSE ===
  private renderUltimatePose(ctx: CanvasRenderingContext2D, v: typeof CATS.shadow.visual, p: PlayerState, t: number) {
    // Levitating in mid-air
    const floatY = Math.sin(t * 8) * 8 - 14;

    ctx.save();
    ctx.translate(0, floatY);

    this.drawTail(ctx, -26, -10, Math.sin(t * 12) * 0.6, v.primaryColor, v.secondaryColor);
    this.drawPaw(ctx, -18, 8, v.secondaryColor);
    this.drawPaw(ctx, -8, 12, v.secondaryColor);

    this.drawBody(ctx, 0, -24, 54, 36, v.primaryColor, v.bellyColor);
    this.drawCatAccessories(ctx, p.catId, 0, -24);

    this.drawPaw(ctx, 18, -20, v.secondaryColor);
    this.drawPaw(ctx, 10, -10, v.secondaryColor);

    this.drawHead(ctx, 16, -42, v, 'transcendent', t);

    // Energy rings radiating outward
    for (let r = 0; r < 3; r++) {
      const ringSize = ((t * 80 + r * 30) % 90) + 20;
      ctx.strokeStyle = v.glowColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = Math.max(0, 1 - ringSize / 110);
      ctx.beginPath();
      ctx.ellipse(0, -24, ringSize, ringSize * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // === HURT POSE ===
  private renderHurtPose(ctx: CanvasRenderingContext2D, v: typeof CATS.shadow.visual, p: PlayerState, t: number) {
    ctx.save();
    ctx.rotate(-0.35); // Knocked back

    this.drawTail(ctx, -20, 6, 0.4, v.primaryColor, v.secondaryColor);
    this.drawPaw(ctx, -16, 12, v.secondaryColor);
    this.drawBody(ctx, 0, -18, 48, 32, v.primaryColor, v.bellyColor);
    this.drawCatAccessories(ctx, p.catId, 0, -18);
    this.drawPaw(ctx, 14, 0, v.secondaryColor);

    // Eyes hurt
    this.drawHead(ctx, 10, -32, v, 'hurt', t);
    ctx.restore();
  }

  // === VICTORY POSE ===
  private renderVictoryPose(ctx: CanvasRenderingContext2D, v: typeof CATS.shadow.visual, t: number) {
    // Sits tall regally, licking front paw
    this.drawTail(ctx, -20, 0, Math.sin(t * 3) * 0.2, v.primaryColor, v.secondaryColor);
    this.drawPaw(ctx, -14, 0, v.secondaryColor);
    this.drawBody(ctx, 0, -26, 44, 48, v.primaryColor, v.bellyColor); // Upright sitting body
    this.drawPaw(ctx, 10, -28, v.secondaryColor); // Front paw raised to chin
    this.drawPaw(ctx, 2, 0, v.secondaryColor);

    this.drawHead(ctx, 6, -52, v, 'happy', t);

    // Sparkles and tiny victory crown
    ctx.save();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-6, -68);
    ctx.lineTo(-2, -60);
    ctx.lineTo(6, -68);
    ctx.lineTo(14, -60);
    ctx.lineTo(18, -68);
    ctx.lineTo(16, -56);
    ctx.lineTo(-4, -56);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // === DEFEAT POSE ===
  private renderDefeatPose(ctx: CanvasRenderingContext2D, v: typeof CATS.shadow.visual, t: number) {
    // Cat flat on floor
    this.drawTail(ctx, -34, -4, 0.1, v.primaryColor, v.secondaryColor);
    this.drawPaw(ctx, -22, 0, v.secondaryColor);
    this.drawBody(ctx, 0, -12, 60, 20, v.primaryColor, v.bellyColor);
    this.drawPaw(ctx, 24, 0, v.secondaryColor);
    this.drawHead(ctx, 16, -18, v, 'dizzy', t);

    // Spinning dizzy stars
    for (let s = 0; s < 3; s++) {
      const angle = t * 4 + (s * Math.PI * 2) / 3;
      const sx = 16 + Math.cos(angle) * 20;
      const sy = -38 + Math.sin(angle) * 8;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- SUB-PARTS DRAWING ---

  private drawBody(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    primaryColor: string,
    bellyColor: string
  ) {
    ctx.save();
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly fur
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 4, w / 2.8, h / 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawHead(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    v: typeof CATS.shadow.visual,
    mood: 'normal' | 'focused' | 'fierce' | 'hurt' | 'happy' | 'dizzy' | 'transcendent',
    t: number
  ) {
    ctx.save();

    // 1. Triangular Feline Ears
    const earTwitch = Math.sin(t * 6) > 0.85 ? 3 : 0;

    // Left Ear
    ctx.fillStyle = v.primaryColor;
    ctx.beginPath();
    ctx.moveTo(x - 14, y - 6);
    ctx.lineTo(x - 22, y - 26 - earTwitch);
    ctx.lineTo(x - 6, y - 14);
    ctx.closePath();
    ctx.fill();

    // Left Inner Ear (Pink / contrasting)
    ctx.fillStyle = v.earInnerColor;
    ctx.beginPath();
    ctx.moveTo(x - 13, y - 8);
    ctx.lineTo(x - 19, y - 22 - earTwitch);
    ctx.lineTo(x - 7, y - 13);
    ctx.closePath();
    ctx.fill();

    // Right Ear
    ctx.fillStyle = v.primaryColor;
    ctx.beginPath();
    ctx.moveTo(x + 2, y - 14);
    ctx.lineTo(x + 14, y - 28);
    ctx.lineTo(x + 18, y - 6);
    ctx.closePath();
    ctx.fill();

    // Right Inner Ear
    ctx.fillStyle = v.earInnerColor;
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 13);
    ctx.lineTo(x + 12, y - 24);
    ctx.lineTo(x + 15, y - 8);
    ctx.closePath();
    ctx.fill();

    // 2. Head Shape
    ctx.fillStyle = v.primaryColor;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.beginPath();
    ctx.arc(x - 10, y + 6, 8, 0, Math.PI * 2);
    ctx.arc(x + 10, y + 6, 8, 0, Math.PI * 2);
    ctx.fill();

    // 3. Feline Eyes
    if (mood === 'hurt') {
      // Crossed/squinting '> <'
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 4);
      ctx.lineTo(x - 2, y);
      ctx.lineTo(x - 8, y + 4);
      ctx.moveTo(x + 8, y - 4);
      ctx.lineTo(x + 2, y);
      ctx.lineTo(x + 8, y + 4);
      ctx.stroke();
    } else if (mood === 'happy') {
      // Curved happy arches '^ ^'
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x - 5, y, 5, Math.PI, 0);
      ctx.arc(x + 7, y, 5, Math.PI, 0);
      ctx.stroke();
    } else if (mood === 'dizzy') {
      // Spiral eyes '@ @'
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x - 5, y, 4, 0, Math.PI * 2);
      ctx.arc(x + 6, y, 4, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Glowing Feline Slit Eyes
      ctx.fillStyle = v.eyeColor;
      ctx.beginPath();
      ctx.ellipse(x - 5, y - 2, 5, 6, -0.15, 0, Math.PI * 2);
      ctx.ellipse(x + 7, y - 2, 5, 6, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Slit pupils
      ctx.fillStyle = '#000000';
      const pupilWidth = mood === 'fierce' ? 1.5 : mood === 'transcendent' ? 0.8 : 2.5;
      ctx.beginPath();
      ctx.ellipse(x - 4, y - 2, pupilWidth, 5, -0.15, 0, Math.PI * 2);
      ctx.ellipse(x + 8, y - 2, pupilWidth, 5, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Eye glint highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - 6, y - 4, 1.5, 0, Math.PI * 2);
      ctx.arc(x + 6, y - 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Little pink nose & mouth
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.moveTo(x, y + 5);
    ctx.lineTo(x + 4, y + 5);
    ctx.lineTo(x + 2, y + 8);
    ctx.closePath();
    ctx.fill();

    // 5. Whiskers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Left whiskers
    ctx.moveTo(x - 6, y + 6);
    ctx.lineTo(x - 22, y + 3);
    ctx.moveTo(x - 6, y + 8);
    ctx.lineTo(x - 20, y + 9);
    // Right whiskers
    ctx.moveTo(x + 8, y + 6);
    ctx.lineTo(x + 24, y + 3);
    ctx.moveTo(x + 8, y + 8);
    ctx.lineTo(x + 22, y + 9);
    ctx.stroke();

    ctx.restore();
  }

  private drawTail(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    angleOffset: number,
    color1: string,
    color2: string
  ) {
    ctx.save();
    ctx.strokeStyle = color1;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const cp1x = startX - 16;
    const cp1y = startY - 20 + angleOffset * 25;
    const cp2x = startX - 28;
    const cp2y = startY - 10 - angleOffset * 20;
    const endX = startX - 32;
    const endY = startY - 26 + angleOffset * 30;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();

    // Tip accent
    ctx.strokeStyle = color2;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cp2x, cp2y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  }

  private drawPaw(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, scale: number = 1.0) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 7 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Toe indents
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(x - 3 * scale, y, 1.2 * scale, 0, Math.PI * 2);
    ctx.arc(x, y - 1 * scale, 1.2 * scale, 0, Math.PI * 2);
    ctx.arc(x + 3 * scale, y, 1.2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawCatAccessories(ctx: CanvasRenderingContext2D, catId: string, x: number, y: number) {
    if (catId === 'ninja') {
      // Shinobi red scarf drifting behind
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 8, y - 4);
      ctx.quadraticCurveTo(x - 14, y + 2, x - 28, y - 10);
      ctx.stroke();
      ctx.restore();
    } else if (catId === 'tank') {
      // Spiked heavy collar
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.fillRect(x + 4, y - 10, 10, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 7, y - 12, 4, 3);
      ctx.restore();
    }
  }

  private renderRageAura(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save();
    const pulse = Math.sin(t * 10) * 6;
    const rageGrad = ctx.createRadialGradient(0, -20, 20, 0, -20, 48 + pulse);
    rageGrad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
    rageGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = rageGrad;
    ctx.beginPath();
    ctx.arc(0, -20, 48 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderUltimateAura(ctx: CanvasRenderingContext2D, color: string, t: number) {
    ctx.save();
    const pulse = Math.sin(t * 8) * 8;
    const auraGrad = ctx.createRadialGradient(0, -20, 24, 0, -20, 52 + pulse);
    auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    auraGrad.addColorStop(0.5, color);
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -20, 52 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderShieldDome(ctx: CanvasRenderingContext2D, color: string, t: number) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.arc(0, -20, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hexagonal circuit lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + t * 0.5;
      const hx = Math.cos(a) * 46;
      const hy = -20 + Math.sin(a) * 46;
      ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  private drawIceOverlay(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x - 28, y - 28, 56, 56);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawFireOverlay(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
    ctx.save();
    ctx.fillStyle = '#ef4444';
    for (let i = 0; i < 4; i++) {
      const fx = x + Math.sin(t * 12 + i) * 18;
      const fy = y - 10 - i * 6;
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
