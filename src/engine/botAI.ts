import { ControlKeys, PlayerState } from '../types/game';

export type BotDifficulty = 'dummy' | 'easy' | 'normal' | 'hard';

export class BotAI {
  private static decisionTimer: number = 0;
  private static comboStep: number = 0;
  private static comboTimer: number = 0;
  private static strafeDirection: number = 1;
  private static currentKeys: ControlKeys = {
    left: false,
    right: false,
    jump: false,
    down: false,
    basicAttack: false,
    heavyAttack: false,
    ability1: false,
    ability2: false,
    movementSkill: false,
    defenseSkill: false,
    ultimate: false,
  };

  public static getInputs(
    bot: PlayerState,
    player: PlayerState,
    difficulty: BotDifficulty,
    dt: number
  ): ControlKeys {
    // Dummy: completely stationary practice target
    if (difficulty === 'dummy') {
      return {
        left: false,
        right: false,
        jump: false,
        down: false,
        basicAttack: false,
        heavyAttack: false,
        ability1: false,
        ability2: false,
        movementSkill: false,
        defenseSkill: false,
        ultimate: false,
      };
    }

    this.decisionTimer -= dt;
    this.comboTimer -= dt;

    // Reset single-frame attack keys every tick unless executing a continuous action
    this.currentKeys.basicAttack = false;
    this.currentKeys.heavyAttack = false;
    this.currentKeys.ability1 = false;
    this.currentKeys.ability2 = false;
    this.currentKeys.movementSkill = false;
    this.currentKeys.defenseSkill = false;
    this.currentKeys.ultimate = false;
    this.currentKeys.jump = false;

    const dx = player.x - bot.x;
    const dist = Math.abs(dx);
    const playerToRight = dx > 0;

    // Player action state awareness
    const playerIsAttacking =
      player.action === 'attack_basic' ||
      player.action === 'attack_heavy' ||
      player.action === 'skill_1' ||
      player.action === 'skill_2' ||
      player.action === 'ultimate';

    // ==========================================
    // 1. EASY DIFFICULTY: Casual, friendly sparring bot
    // ==========================================
    if (difficulty === 'easy') {
      if (this.decisionTimer <= 0) {
        this.decisionTimer = 0.25 + Math.random() * 0.2;

        // Walk towards player if distant
        if (dist > 95) {
          this.currentKeys.right = playerToRight;
          this.currentKeys.left = !playerToRight;
        } else {
          this.currentKeys.right = false;
          this.currentKeys.left = false;
          // Attack when close
          if (Math.random() < 0.65) {
            this.currentKeys.basicAttack = true;
          } else if (Math.random() < 0.3) {
            this.currentKeys.heavyAttack = true;
          }
        }

        // Occasional jump or ability
        if (Math.random() < 0.15 && bot.isGrounded) {
          this.currentKeys.jump = true;
        } else if (dist < 320 && Math.random() < 0.25) {
          this.currentKeys.ability1 = true;
        }
      }
      return { ...this.currentKeys };
    }

    // ==========================================
    // 2. NORMAL DIFFICULTY: Active, intelligent fighter
    // ==========================================
    if (difficulty === 'normal') {
      if (this.decisionTimer <= 0) {
        this.decisionTimer = 0.12 + Math.random() * 0.12;

        // Trigger Ultimate when full
        if (bot.energy >= 100 && dist < 380) {
          this.currentKeys.ultimate = true;
          this.currentKeys.left = false;
          this.currentKeys.right = false;
          return { ...this.currentKeys };
        }

        // Reactive Block against incoming heavy or ultimate
        if (playerIsAttacking && dist < 110 && Math.random() < 0.55) {
          this.currentKeys.defenseSkill = true;
          return { ...this.currentKeys };
        }

        // Combo Sequence: Basic -> Basic -> Heavy / Ability 2
        if (dist <= 100) {
          this.currentKeys.right = false;
          this.currentKeys.left = false;

          const roll = Math.random();
          if (roll < 0.45) {
            this.currentKeys.basicAttack = true;
          } else if (roll < 0.75) {
            this.currentKeys.heavyAttack = true;
          } else if (roll < 0.9) {
            this.currentKeys.ability2 = true;
          } else {
            // Jump or Dash retreat
            if (Math.random() < 0.5) this.currentKeys.jump = true;
            else this.currentKeys.movementSkill = true;
          }
        } else if (dist <= 260) {
          // Mid-range: Approach with quick dash or poke with ability
          if (Math.random() < 0.4 && (bot.cooldowns[bot.loadout.ability1] || 0) <= 0) {
            this.currentKeys.ability1 = true;
          } else if (Math.random() < 0.35 && (bot.cooldowns[bot.loadout.movement] || 0) <= 0) {
            this.currentKeys.movementSkill = true;
          } else {
            this.currentKeys.right = playerToRight;
            this.currentKeys.left = !playerToRight;
          }

          if (player.y < bot.y - 40 && Math.random() < 0.4) {
            this.currentKeys.jump = true;
          }
        } else {
          // Long range: Close distance & throw projectile
          this.currentKeys.right = playerToRight;
          this.currentKeys.left = !playerToRight;

          if (Math.random() < 0.45 && (bot.cooldowns[bot.loadout.ability1] || 0) <= 0) {
            this.currentKeys.ability1 = true;
          }
          if (Math.random() < 0.25 && (bot.cooldowns[bot.loadout.movement] || 0) <= 0) {
            this.currentKeys.movementSkill = true;
          }
        }
      }

      return { ...this.currentKeys };
    }

    // ==========================================
    // 3. HARD DIFFICULTY: Master Feline Tournament AI
    // ==========================================
    if (this.decisionTimer <= 0) {
      this.decisionTimer = 0.06 + Math.random() * 0.06;

      // 1. Instant Ultimate Punish
      if (bot.energy >= 100 && (dist < 400 || player.health < 40)) {
        this.currentKeys.ultimate = true;
        return { ...this.currentKeys };
      }

      // 2. High-speed Reaction Defense / Counter
      if (playerIsAttacking && dist < 125) {
        if (Math.random() < 0.8) {
          this.currentKeys.defenseSkill = true;
          return { ...this.currentKeys };
        } else if (Math.random() < 0.7 && (bot.cooldowns[bot.loadout.movement] || 0) <= 0) {
          // Dodge through attack
          this.currentKeys.movementSkill = true;
          return { ...this.currentKeys };
        }
      }

      // 3. Spacing & Lethal Combos
      if (dist < 105) {
        // Close range execution
        const comboRoll = Math.random();
        if (comboRoll < 0.4) {
          this.currentKeys.basicAttack = true;
        } else if (comboRoll < 0.7) {
          this.currentKeys.heavyAttack = true;
        } else if (comboRoll < 0.88 && (bot.cooldowns[bot.loadout.ability2] || 0) <= 0) {
          this.currentKeys.ability2 = true;
        } else {
          // Micro-spacing repositioning
          this.currentKeys.jump = true;
          this.currentKeys.movementSkill = true;
        }
      } else if (dist < 320) {
        // Zone with Projectile or Blink in
        if ((bot.cooldowns[bot.loadout.ability1] || 0) <= 0 && Math.random() < 0.6) {
          this.currentKeys.ability1 = true;
        } else if ((bot.cooldowns[bot.loadout.movement] || 0) <= 0 && Math.random() < 0.5) {
          this.currentKeys.movementSkill = true;
        } else {
          this.currentKeys.right = playerToRight;
          this.currentKeys.left = !playerToRight;
        }

        // Jump over low sweeps or aerial pounce
        if ((player.vy < 0 || Math.random() < 0.3) && bot.isGrounded) {
          this.currentKeys.jump = true;
        }
      } else {
        // Rapid distance closing
        this.currentKeys.right = playerToRight;
        this.currentKeys.left = !playerToRight;

        if (Math.random() < 0.5 && (bot.cooldowns[bot.loadout.movement] || 0) <= 0) {
          this.currentKeys.movementSkill = true;
        }
        if (Math.random() < 0.5 && (bot.cooldowns[bot.loadout.ability1] || 0) <= 0) {
          this.currentKeys.ability1 = true;
        }
      }
    }

    return { ...this.currentKeys };
  }
}
