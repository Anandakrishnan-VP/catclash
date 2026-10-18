import {
  ActionState,
  ArenaDef,
  CatId,
  ControlKeys,
  MatchState,
  PlayerLoadout,
  PlayerState,
  Projectile,
  StatusEffect,
} from '../types/game';
import { CATS } from '../config/cats';
import { SKILLS } from '../config/skills';
import { ARENAS } from '../config/arenas';
import { ParticleSystem } from './particleSystem';
import { soundEngine } from '../audio/soundEngine';

export const GRAVITY = 1500;
export const JUMP_VELOCITY = -650;
export const ARENA_FLOOR_Y = 460;
export const LEFT_BOUND = 70;
export const RIGHT_BOUND = 930;

export class CombatEngine {
  public static createPlayerState(
    id: string,
    name: string,
    catId: CatId,
    loadout: PlayerLoadout,
    startX: number,
    facing: 1 | -1
  ): PlayerState {
    const cat = CATS[catId] || CATS.shadow;
    return {
      id,
      name,
      catId,
      loadout,
      x: startX,
      y: ARENA_FLOOR_Y,
      vx: 0,
      vy: 0,
      width: 56,
      height: 60,
      isGrounded: true,
      facing,
      action: 'idle',
      actionTimer: 0,
      actionDuration: 0,
      health: cat.baseHealth,
      maxHealth: cat.baseHealth,
      energy: 25, // Starting energy
      maxEnergy: 100,
      cooldowns: {},
      isBlocking: false,
      isInvulnerable: false,
      invulnerableTimer: 0,
      comboCount: 0,
      comboTimer: 0,
      highestCombo: 0,
      damageDealt: 0,
      hitsLanded: 0,
      dodgesSucceeded: 0,
      statusEffects: [],
      rageActive: false,
      animFrame: 0,
    };
  }

  public static updatePlayerPhysics(p: PlayerState, dt: number, opponent: PlayerState) {
    // 1. Update status effects (frozen, stun, slow, burn)
    let isStunned = false;
    let isFrozen = false;
    let speedMult = 1.0;

    for (let i = p.statusEffects.length - 1; i >= 0; i--) {
      const effect = p.statusEffects[i];
      effect.duration -= dt;

      if (effect.type === 'burn') {
        effect.tickTimer = (effect.tickTimer || 0) + dt;
        if (effect.tickTimer >= 0.5) {
          p.health = Math.max(0, p.health - (effect.value || 2));
          effect.tickTimer = 0;
        }
      } else if (effect.type === 'slow') {
        speedMult *= 0.6;
      } else if (effect.type === 'stun') {
        isStunned = true;
      } else if (effect.type === 'frozen') {
        isFrozen = true;
      }

      if (effect.duration <= 0) {
        p.statusEffects.splice(i, 1);
      }
    }

    if (isStunned || isFrozen) {
      p.action = 'hurt';
      p.vx *= 0.8;
      p.vy += GRAVITY * dt;
      p.y += p.vy * dt;
      if (p.y >= ARENA_FLOOR_Y) {
        p.y = ARENA_FLOOR_Y;
        p.vy = 0;
        p.isGrounded = true;
      }
      return;
    }

    // 2. Cooldown tickers
    for (const skillId in p.cooldowns) {
      if (p.cooldowns[skillId] > 0) {
        p.cooldowns[skillId] = Math.max(0, p.cooldowns[skillId] - dt);
      }
    }

    // 3. Invulnerability timer
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer = Math.max(0, p.invulnerableTimer - dt);
      p.isInvulnerable = p.invulnerableTimer > 0;
    }

    // 4. Action Timer progression
    if (p.actionTimer > 0) {
      p.actionTimer = Math.max(0, p.actionTimer - dt);
      if (p.actionTimer <= 0) {
        // Return to idle / walk
        p.action = p.isGrounded ? 'idle' : 'fall';
        p.isBlocking = false;
      }
    }

    // 5. Combo reset timer
    if (p.comboTimer > 0) {
      p.comboTimer -= dt;
      if (p.comboTimer <= 0) {
        p.comboCount = 0;
      }
    }

    // 6. Gravity & Vertical Movement
    if (!p.isGrounded) {
      p.vy += GRAVITY * dt;
      p.y += p.vy * dt;

      if (p.y >= ARENA_FLOOR_Y) {
        p.y = ARENA_FLOOR_Y;
        p.vy = 0;
        p.isGrounded = true;
        if (p.action === 'fall' || p.action === 'jump') {
          p.action = 'idle';
        }
      }
    }

    // 7. Horizontal Movement & Friction
    p.x += p.vx * dt;
    if (p.isGrounded) {
      p.vx *= 0.85; // Ground friction
    } else {
      p.vx *= 0.96; // Air resistance
    }

    // 8. Arena Bounds Clamping
    if (p.x < LEFT_BOUND) {
      p.x = LEFT_BOUND;
      p.vx = 0;
    }
    if (p.x > RIGHT_BOUND) {
      p.x = RIGHT_BOUND;
      p.vx = 0;
    }

    // 9. Auto-facing opponent when not locked in attack
    const isActionLocked =
      p.action === 'attack_basic' ||
      p.action === 'attack_heavy' ||
      p.action === 'skill_1' ||
      p.action === 'skill_2' ||
      p.action === 'ultimate';

    if (!isActionLocked && p.isGrounded) {
      p.facing = opponent.x > p.x ? 1 : -1;
    }

    // 10. Check Rage Threshold (low health activates rage mode bonus energy)
    if (p.health <= p.maxHealth * 0.3) {
      p.rageActive = true;
      p.energy = Math.min(p.maxEnergy, p.energy + 4 * dt); // Passive rage regen
    }
  }

  public static handleInput(
    p: PlayerState,
    keys: ControlKeys,
    opponent: PlayerState,
    particles?: ParticleSystem,
    playSound: boolean = true
  ): Projectile[] {
    const spawnedProjectiles: Projectile[] = [];
    const cat = CATS[p.catId] || CATS.shadow;

    // Disallow inputs if locked in active action or hurt
    if (p.action === 'hurt' || p.action === 'knockback' || p.action === 'defeat') {
      return spawnedProjectiles;
    }

    const isActionLocked =
      p.action === 'attack_basic' ||
      p.action === 'attack_heavy' ||
      p.action === 'skill_1' ||
      p.action === 'skill_2' ||
      p.action === 'ultimate';

    // 1. Ultimate Attack ('O' key or mobile ultimate button)
    if (keys.ultimate && p.energy >= 100 && !isActionLocked) {
      const ultimateSkillId = p.loadout.ultimate;
      const skillDef = SKILLS[ultimateSkillId];
      if (skillDef) {
        p.action = 'ultimate';
        p.actionDuration = skillDef.duration + skillDef.startup + skillDef.recovery;
        p.actionTimer = p.actionDuration;
        p.energy = 0;
        p.invulnerableTimer = 0.8;
        p.isInvulnerable = true;

        if (playSound) {
          soundEngine.playUltimateRelease();
        }
        if (particles) {
          particles.spawnFloatingMessage(p.x, p.y - 40, `${skillDef.name.toUpperCase()}!`, skillDef.color);
          particles.spawnClash(p.x, p.y - 20);
        }

        // Deal immediate damage/projectile for ultimate
        this.resolveSkillEffect(p, opponent, skillDef, spawnedProjectiles, particles, playSound);
        return spawnedProjectiles;
      }
    }

    // 2. Defensive Skill ('I' key or defense button)
    if (keys.defenseSkill && !isActionLocked) {
      const defSkillId = p.loadout.defensive;
      const skillDef = SKILLS[defSkillId];
      if (skillDef && (p.cooldowns[defSkillId] || 0) <= 0 && p.energy >= skillDef.energyCost) {
        p.action = 'skill_defensive';
        p.actionDuration = skillDef.duration;
        p.actionTimer = skillDef.duration;
        p.cooldowns[defSkillId] = skillDef.cooldown;
        p.energy = Math.max(0, p.energy - skillDef.energyCost);
        p.isBlocking = true;

        if (defSkillId === 'energy_barrier') {
          p.isInvulnerable = true;
          p.invulnerableTimer = 1.2;
        }

        if (playSound) soundEngine.playBlock();
        return spawnedProjectiles;
      }
    }

    // 3. Movement Skill (Shift key or dash button)
    if (keys.movementSkill && !isActionLocked) {
      const movSkillId = p.loadout.movement;
      const skillDef = SKILLS[movSkillId];
      if (skillDef && (p.cooldowns[movSkillId] || 0) <= 0 && p.energy >= skillDef.energyCost) {
        p.action = 'skill_movement';
        p.actionDuration = skillDef.duration;
        p.actionTimer = skillDef.duration;
        p.cooldowns[movSkillId] = skillDef.cooldown;
        p.energy = Math.max(0, p.energy - skillDef.energyCost);
        p.invulnerableTimer = 0.28;
        p.isInvulnerable = true;

        if (movSkillId === 'shadow_teleport') {
          // Reappear behind opponent!
          p.x = opponent.x - p.facing * 90;
          p.facing = opponent.x > p.x ? 1 : -1;
          if (playSound) soundEngine.playShadow();
        } else if (movSkillId === 'air_dash') {
          p.vx = p.facing * 750;
          p.vy = -180;
          p.isGrounded = false;
          if (playSound) soundEngine.playDash();
        } else {
          // Standard Cat Dash
          p.vx = p.facing * 680;
          if (playSound) soundEngine.playDash();
        }

        if (particles) {
          particles.spawnClawSlash(p.x, p.y - 20, p.facing, skillDef.color);
        }
        return spawnedProjectiles;
      }
    }

    // 4. Normal Ability 1 ('L' key)
    if (keys.ability1 && !isActionLocked) {
      const ab1Id = p.loadout.ability1;
      const skillDef = SKILLS[ab1Id];
      if (skillDef && (p.cooldowns[ab1Id] || 0) <= 0 && p.energy >= skillDef.energyCost) {
        p.action = 'skill_1';
        p.actionDuration = skillDef.duration + skillDef.startup + skillDef.recovery;
        p.actionTimer = p.actionDuration;
        p.cooldowns[ab1Id] = skillDef.cooldown;
        p.energy = Math.max(0, p.energy - skillDef.energyCost);

        this.resolveSkillEffect(p, opponent, skillDef, spawnedProjectiles, particles, playSound);
        return spawnedProjectiles;
      }
    }

    // 5. Normal Ability 2 ('U' key)
    if (keys.ability2 && !isActionLocked) {
      const ab2Id = p.loadout.ability2;
      const skillDef = SKILLS[ab2Id];
      if (skillDef && (p.cooldowns[ab2Id] || 0) <= 0 && p.energy >= skillDef.energyCost) {
        p.action = 'skill_2';
        p.actionDuration = skillDef.duration + skillDef.startup + skillDef.recovery;
        p.actionTimer = p.actionDuration;
        p.cooldowns[ab2Id] = skillDef.cooldown;
        p.energy = Math.max(0, p.energy - skillDef.energyCost);

        this.resolveSkillEffect(p, opponent, skillDef, spawnedProjectiles, particles, playSound);
        return spawnedProjectiles;
      }
    }

    // 6. Heavy Paw Attack ('K' key)
    if (keys.heavyAttack && !isActionLocked) {
      p.action = 'attack_heavy';
      p.actionDuration = 0.45;
      p.actionTimer = 0.45;

      // Aerial diving slam
      if (!p.isGrounded) {
        p.vy = 400;
      }

      if (playSound) soundEngine.playWhoosh();
      if (particles) {
        particles.spawnClawSlash(p.x + p.facing * 35, p.y - 20, p.facing, '#f97316');
      }

      // Check hit against opponent within range
      const dist = Math.abs(opponent.x - p.x);
      const inFront = (opponent.x - p.x) * p.facing > 0;
      if (dist < 135 && inFront) {
        this.applyDamage(opponent, p, 24 * cat.attackPower, 360, particles, playSound);
      }
      return spawnedProjectiles;
    }

    // 7. Basic Claw Attack ('J' key)
    if (keys.basicAttack && !isActionLocked) {
      p.action = 'attack_basic';
      p.actionDuration = 0.26;
      p.actionTimer = 0.26;

      if (playSound) soundEngine.playHitLight();
      if (particles) {
        particles.spawnClawSlash(p.x + p.facing * 30, p.y - 20, p.facing, cat.visual.glowColor);
      }

      const dist = Math.abs(opponent.x - p.x);
      const inFront = (opponent.x - p.x) * p.facing > 0;
      if (dist < 112 && inFront) {
        this.applyDamage(opponent, p, 14 * cat.attackPower, 180, particles, playSound);
      }
      return spawnedProjectiles;
    }

    // 8. Movement & Jumping
    if (!isActionLocked) {
      const moveSpeed = cat.baseSpeed;

      if (keys.left) {
        p.vx = -moveSpeed;
        p.facing = -1;
        if (p.isGrounded) {
          p.action = 'walk';
          if (particles && Math.random() < 0.2) particles.spawnFootDust(p.x, p.y, '#64748b', 2);
        }
      } else if (keys.right) {
        p.vx = moveSpeed;
        p.facing = 1;
        if (p.isGrounded) {
          p.action = 'walk';
          if (particles && Math.random() < 0.2) particles.spawnFootDust(p.x, p.y, '#64748b', 2);
        }
      } else {
        if (p.isGrounded && p.action === 'walk') {
          p.action = 'idle';
        }
      }

      if (keys.jump && p.isGrounded) {
        p.vy = JUMP_VELOCITY;
        p.isGrounded = false;
        p.action = 'jump';
        if (playSound) soundEngine.playJump();
        if (particles) particles.spawnFootDust(p.x, p.y, cat.visual.glowColor, 6);
      }
    }

    return spawnedProjectiles;
  }

  private static resolveSkillEffect(
    p: PlayerState,
    opp: PlayerState,
    skill: typeof SKILLS.fireball,
    projectiles: Projectile[],
    particles?: ParticleSystem,
    playSound: boolean = true
  ) {
    if (skill.projectile) {
      // Spawn Projectile
      const proj: Projectile = {
        id: Math.random().toString(),
        ownerId: p.id,
        x: p.x + p.facing * 35,
        y: p.y - 25,
        vx: p.facing * skill.projectile.speed,
        vy: 0,
        radius: skill.projectile.radius,
        damage: skill.damage,
        element: skill.projectile.element,
        duration: skill.projectile.duration,
        knockback: skill.knockback,
        statusEffect: skill.statusEffect
          ? {
              type: skill.statusEffect.type,
              duration: skill.statusEffect.duration,
              value: skill.statusEffect.value,
            }
          : undefined,
        color: skill.color,
      };
      projectiles.push(proj);

      if (playSound) {
        if (skill.projectile.element === 'fire') soundEngine.playFireball();
        else if (skill.projectile.element === 'lightning') soundEngine.playLightning();
        else if (skill.projectile.element === 'ice') soundEngine.playIce();
        else soundEngine.playShadow();
      }
    } else {
      // Direct Melee or Area Skill
      const dist = Math.abs(opp.x - p.x);
      const inFront = (opp.x - p.x) * p.facing > 0;
      if (dist < skill.range && (inFront || skill.category === 'ultimate' || skill.category === 'control')) {
        this.applyDamage(opp, p, skill.damage, skill.knockback, particles, playSound, skill.statusEffect);
      }
    }
  }

  public static applyDamage(
    target: PlayerState,
    attacker: PlayerState,
    rawDamage: number,
    knockback: number,
    particles?: ParticleSystem,
    playSound: boolean = true,
    statusEffect?: StatusEffect
  ) {
    // If invulnerable (e.g. during dash or bubble), damage is completely avoided (Perfect Dodge)
    if (target.isInvulnerable) {
      attacker.dodgesSucceeded += 1;
      target.energy = Math.min(target.maxEnergy, target.energy + 15);
      if (particles) {
        particles.spawnFloatingMessage(target.x, target.y - 30, 'PERFECT DODGE! +15⚡', '#38bdf8');
      }
      return;
    }

    const targetCat = CATS[target.catId] || CATS.shadow;
    let effectiveDamage = rawDamage * (1 - targetCat.defense);

    // Counterattack Check
    if (target.action === 'skill_defensive' && target.loadout.defensive === 'counterattack') {
      // Retaliate against attacker!
      if (playSound) soundEngine.playParry();
      if (particles) {
        particles.spawnClash(target.x, target.y - 25);
        particles.spawnFloatingMessage(target.x, target.y - 35, 'PERFECT COUNTER!!', '#f43f5e');
      }
      this.applyDamage(attacker, target, 34, 400, particles, playSound);
      return;
    }

    // If blocking, reduce damage by 75%
    if (target.isBlocking || target.action === 'skill_defensive') {
      effectiveDamage *= 0.25;
      target.energy = Math.min(target.maxEnergy, target.energy + 12);
      if (playSound) soundEngine.playBlock();
      if (particles) {
        particles.spawnHitSparks(target.x, target.y - 20, '#60a5fa', 8);
        particles.spawnFloatingMessage(target.x, target.y - 30, 'BLOCKED!', '#60a5fa');
      }
      // Chip damage only
      target.health = Math.max(0, target.health - effectiveDamage);
      return;
    }

    // Normal Hit
    target.health = Math.max(0, target.health - effectiveDamage);
    target.action = 'hurt';
    target.actionTimer = 0.28;
    target.vx = attacker.facing * knockback;
    target.vy = -160;
    target.isGrounded = false;

    // Attacker gains energy & combo
    attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + 10);
    attacker.hitsLanded += 1;
    attacker.damageDealt += effectiveDamage;

    attacker.comboCount += 1;
    attacker.comboTimer = 1.6;
    if (attacker.comboCount > attacker.highestCombo) {
      attacker.highestCombo = attacker.comboCount;
    }

    // Audio & Visual feedback
    if (playSound) {
      if (effectiveDamage > 22) soundEngine.playHitHeavy();
      else soundEngine.playHitLight();
    }

    if (particles) {
      if (effectiveDamage > 22) {
        particles.spawnHeavyImpact(target.x, target.y - 25, '#f97316');
      } else {
        particles.spawnHitSparks(target.x, target.y - 25, '#facc15', 18);
      }
      particles.spawnDamageText(target.x, target.y - 20, effectiveDamage, attacker.comboCount > 2);

      // Announce Combo ranks
      if (attacker.comboCount === 2) {
        particles.spawnFloatingMessage(attacker.x, attacker.y - 50, 'NICE! 2x', '#38bdf8');
      } else if (attacker.comboCount === 4) {
        particles.spawnFloatingMessage(attacker.x, attacker.y - 50, 'PAWESOME! 4x', '#a855f7');
      } else if (attacker.comboCount === 6) {
        particles.spawnFloatingMessage(attacker.x, attacker.y - 50, 'CLAW MACHINE! 6x', '#f59e0b');
      } else if (attacker.comboCount >= 8) {
        particles.spawnFloatingMessage(attacker.x, attacker.y - 50, 'LEGENDARY COMBO! 🔥', '#ef4444');
      }
    }

    // Apply Status Effect
    if (statusEffect) {
      target.statusEffects.push({ ...statusEffect });
    }
  }

  public static updateProjectiles(
    projectiles: Projectile[],
    dt: number,
    p1: PlayerState,
    p2: PlayerState,
    particles?: ParticleSystem,
    playSound: boolean = true
  ) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const proj = projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.duration -= dt;

      const target = proj.ownerId === p1.id ? p2 : p1;
      const attacker = proj.ownerId === p1.id ? p1 : p2;

      // Check collision with target
      const dx = proj.x - target.x;
      const dy = proj.y - (target.y - 25);
      const dist = Math.hypot(dx, dy);

      if (dist < proj.radius + 26) {
        this.applyDamage(target, attacker, proj.damage, proj.knockback, particles, playSound, proj.statusEffect);
        projectiles.splice(i, 1);
        continue;
      }

      // Check arena boundaries or expired duration
      if (proj.duration <= 0 || proj.x < LEFT_BOUND - 50 || proj.x > RIGHT_BOUND + 50) {
        projectiles.splice(i, 1);
      }
    }
  }
}
