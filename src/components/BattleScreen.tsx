import React, { useRef, useEffect, useState } from 'react';
import {
  ArenaId,
  CatId,
  ControlKeys,
  MatchPhase,
  MatchState,
  PlayerLoadout,
} from '../types/game';
import { CATS } from '../config/cats';
import { SKILLS } from '../config/skills';
import { BotDifficulty, BotAI } from '../engine/botAI';
import { CombatEngine } from '../engine/combatEngine';
import { ArenaRenderer } from '../engine/arenaRenderer';
import { CatRenderer } from '../engine/catRenderer';
import { ParticleSystem } from '../engine/particleSystem';
import { socketClient } from '../network/socketClient';
import { soundEngine } from '../audio/soundEngine';
import { TrainingHUD } from './TrainingHUD';
import { CatHeroVisual } from './CatHeroVisual';
import { Pause, Flame, Shield, Zap, Sparkles, Wind, Crosshair, RefreshCw, LogOut, Play, Smartphone } from 'lucide-react';

interface Props {
  isOnline: boolean;
  arenaId: ArenaId;
  localPlayerId: string;
  initialMatchState?: MatchState;
  trainingCatId?: CatId;
  trainingLoadout?: PlayerLoadout;
  trainingBotDifficulty?: BotDifficulty;
  onChangeBotDifficulty?: (diff: BotDifficulty) => void;
  trainingBotCatId?: CatId;
  onChangeBotCat?: (catId: CatId) => void;
  showMobileControls?: boolean;
  onToggleMobileControls?: () => void;
  onMatchEnd: (finalState: MatchState) => void;
  onExit: () => void;
}

export const BattleScreen: React.FC<Props> = ({
  isOnline,
  arenaId,
  localPlayerId,
  initialMatchState,
  trainingCatId = 'shadow',
  trainingLoadout,
  trainingBotDifficulty = 'normal',
  onChangeBotDifficulty,
  trainingBotCatId = 'fire',
  onChangeBotCat,
  showMobileControls,
  onToggleMobileControls,
  onMatchEnd,
  onExit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Engines
  const arenaRendererRef = useRef(new ArenaRenderer());
  const catRendererRef = useRef(new CatRenderer());
  const particleSystemRef = useRef(new ParticleSystem());

  const selectedCat: CatId = trainingCatId || 'shadow';

  // Game state references (to avoid stale closures in requestAnimationFrame)
  const matchStateRef = useRef<MatchState>(
    initialMatchState || {
      roomCode: 'LOCAL',
      arenaId,
      phase: isOnline ? 'countdown' : 'fighting',
      countdown: isOnline ? 3 : 0,
      matchTimer: 90,
      currentRound: 1,
      totalRounds: 3,
      p1RoundsWon: 0,
      p2RoundsWon: 0,
      p1: CombatEngine.createPlayerState(
        'p1',
        'Player 1',
        selectedCat,
        trainingLoadout || CATS[selectedCat]?.defaultLoadout || CATS.shadow.defaultLoadout,
        260,
        1
      ),
      p2: CombatEngine.createPlayerState(
        'p2',
        `${CATS[trainingBotCatId]?.name || 'Bot'} (AI)`,
        trainingBotCatId,
        CATS[trainingBotCatId]?.defaultLoadout || CATS.fire.defaultLoadout,
        740,
        -1
      ),
      projectiles: [],
    }
  );

  // Active Keys Buffer
  const keysRef = useRef<ControlKeys>({
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
  });

  // Training Mode Options
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>(trainingBotDifficulty);
  const [botCatId, setBotCatId] = useState<CatId>(trainingBotCatId);
  const [infiniteEnergy, setInfiniteEnergy] = useState<boolean>(false);
  const [totalDamage, setTotalDamage] = useState<number>(0);
  const [dps, setDps] = useState<number>(0);
  const damageTrackerRef = useRef<{ total: number; timestamps: number[] }>({ total: 0, timestamps: [] });

  // Damage chip trail refs (arcade delay bars)
  const p1TrailHealthRef = useRef<number>(100);
  const p2TrailHealthRef = useRef<number>(100);

  // Auto-detect mobile device or small screen for on-screen controls
  const [internalMobileControls, setInternalMobileControls] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      const isNarrow = window.innerWidth <= 1024;
      return Boolean(isTouch || isNarrow);
    }
    return false;
  });

  const isMobileControlsActive = showMobileControls !== undefined ? showMobileControls : internalMobileControls;
  const isRoundTransitioningRef = useRef<boolean>(false);

  // HUD and Pause UI States
  const [hudState, setHudState] = useState<{
    p1Health: number;
    p1TrailHealth: number;
    p1MaxHealth: number;
    p1Energy: number;
    p1Combo: number;
    p2Health: number;
    p2TrailHealth: number;
    p2MaxHealth: number;
    p2Energy: number;
    p2Combo: number;
    matchTimer: number;
    countdownText: string | number;
    phase: MatchPhase;
    p1Cooldowns: Record<string, number>;
    currentRound: number;
    totalRounds: number;
    p1RoundsWon: number;
    p2RoundsWon: number;
    roundBanner: {
      title: string;
      subtitle?: string;
      isFinal?: boolean;
      flash?: boolean;
    } | null;
  }>({
    p1Health: 100,
    p1TrailHealth: 100,
    p1MaxHealth: 100,
    p1Energy: 25,
    p1Combo: 0,
    p2Health: 100,
    p2TrailHealth: 100,
    p2MaxHealth: 100,
    p2Energy: 25,
    p2Combo: 0,
    matchTimer: 90,
    countdownText: '',
    phase: isOnline ? 'countdown' : 'fighting',
    p1Cooldowns: {},
    currentRound: 1,
    totalRounds: 3,
    p1RoundsWon: 0,
    p2RoundsWon: 0,
    roundBanner: null,
  });

  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Switch Bot Cat in Training Mode
  const handleChangeBotCat = (newCatId: CatId) => {
    setBotCatId(newCatId);
    onChangeBotCat?.(newCatId);
    const ms = matchStateRef.current;
    ms.p2 = CombatEngine.createPlayerState(
      'p2',
      `${CATS[newCatId]?.name || 'Bot'} (AI)`,
      newCatId,
      CATS[newCatId]?.defaultLoadout || CATS.fire.defaultLoadout,
      740,
      -1
    );
  };

  const handleDifficultyChange = (diff: BotDifficulty) => {
    setBotDifficulty(diff);
    onChangeBotDifficulty?.(diff);
  };

  // Start Theme BGM
  useEffect(() => {
    soundEngine.playBGM(arenaId);
    return () => {
      soundEngine.stopBGM();
    };
  }, [arenaId]);

  // Online Socket Listeners
  useEffect(() => {
    if (!isOnline) return;

    socketClient.onCountdownTick((num) => {
      soundEngine.playCountdown(num);
      setHudState((prev) => ({
        ...prev,
        countdownText: num,
      }));
    });

    socketClient.onMatchStateUpdate((serverState: MatchState) => {
      const ms = matchStateRef.current;
      ms.phase = serverState.phase;
      ms.matchTimer = serverState.matchTimer;
      ms.countdown = serverState.countdown;
      ms.projectiles = serverState.projectiles;

      // Sync P1 & P2
      Object.assign(ms.p1, serverState.p1);
      Object.assign(ms.p2, serverState.p2);

      // Play impact audio cues
      if (serverState.p1.action === 'hurt' || serverState.p2.action === 'hurt') {
        soundEngine.playHitLight();
      }
    });

    socketClient.onMatchFinished((finalState: MatchState) => {
      matchStateRef.current.phase = 'finished';
      matchStateRef.current.stats = finalState.stats;
      const isWinner = finalState.stats?.winnerId === localPlayerId;
      if (isWinner) {
        soundEngine.playVictory();
      } else {
        soundEngine.playDefeat();
      }
      onMatchEnd(finalState);
    });
  }, [isOnline, localPlayerId, onMatchEnd]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }

      const k = keysRef.current;
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          k.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          k.right = true;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          k.jump = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          k.down = true;
          break;
        case 'KeyJ':
          k.basicAttack = true;
          break;
        case 'KeyK':
          k.heavyAttack = true;
          break;
        case 'KeyL':
          k.ability1 = true;
          break;
        case 'KeyU':
          k.ability2 = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          k.movementSkill = true;
          break;
        case 'KeyI':
          k.defenseSkill = true;
          break;
        case 'KeyO':
          k.ultimate = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = keysRef.current;
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          k.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          k.right = false;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          k.jump = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          k.down = false;
          break;
        case 'KeyJ':
          k.basicAttack = false;
          break;
        case 'KeyK':
          k.heavyAttack = false;
          break;
        case 'KeyL':
          k.ability1 = false;
          break;
        case 'KeyU':
          k.ability2 = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          k.movementSkill = false;
          break;
        case 'KeyI':
          k.defenseSkill = false;
          break;
        case 'KeyO':
          k.ultimate = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Round Sequence: ROUND X -> READY... -> FIGHT!
  const startRoundSequence = (roundNumber: number, ms: MatchState) => {
    isRoundTransitioningRef.current = true;
    const isFinal = roundNumber >= 3;
    const roundTitle = isFinal ? 'FINAL ROUND' : `ROUND ${roundNumber}`;

    setHudState((prev) => ({
      ...prev,
      currentRound: roundNumber,
      roundBanner: {
        title: roundTitle,
        subtitle: isFinal ? 'DECISIVE BOUT — READY...' : 'READY...',
        isFinal,
        flash: true,
      },
    }));

    soundEngine.playRoundAnnouncement(roundNumber, isFinal);

    // After 1.1s, trigger FIGHT!
    setTimeout(() => {
      setHudState((prev) => ({
        ...prev,
        roundBanner: {
          title: 'FIGHT!',
          subtitle: 'COMMENCE BOUT',
          isFinal,
          flash: true,
        },
      }));
      soundEngine.playRoundFight();

      // After 0.7s more, clear banner and start fighting
      setTimeout(() => {
        setHudState((prev) => ({
          ...prev,
          roundBanner: null,
        }));
        isRoundTransitioningRef.current = false;
        if (!isOnline) {
          ms.phase = 'fighting';
        }
      }, 700);
    }, 1100);
  };

  // Start round 1 sequence on mount if offline
  useEffect(() => {
    if (!isOnline) {
      startRoundSequence(1, matchStateRef.current);
    }
  }, [isOnline]);

  // Handle Round Finish & Check Match Conclusion (3 Rounds)
  const handleRoundConclusion = (ms: MatchState) => {
    if (isRoundTransitioningRef.current) return;
    isRoundTransitioningRef.current = true;

    soundEngine.playRoundKO();

    const p1Won = ms.p1.health > ms.p2.health;
    const p2Won = ms.p2.health > ms.p1.health;
    const winnerName = p1Won ? ms.p1.name : p2Won ? ms.p2.name : 'Draw';

    ms.p1.action = p1Won ? 'victory' : 'defeat';
    ms.p2.action = p2Won ? 'victory' : 'defeat';

    const currentR = ms.currentRound || 1;
    const newP1Wins = (ms.p1RoundsWon || 0) + (p1Won ? 1 : 0);
    const newP2Wins = (ms.p2RoundsWon || 0) + (p2Won ? 1 : 0);
    ms.p1RoundsWon = newP1Wins;
    ms.p2RoundsWon = newP2Wins;

    setHudState((prev) => ({
      ...prev,
      p1RoundsWon: newP1Wins,
      p2RoundsWon: newP2Wins,
      roundBanner: {
        title: 'K.O.!',
        subtitle: `ROUND ${currentR} // WINNER: ${winnerName.toUpperCase()}`,
        isFinal: currentR >= 3,
        flash: true,
      },
    }));

    setTimeout(() => {
      soundEngine.playRoundWin();
    }, 400);

    // If less than 3 rounds, advance to next round
    if (currentR < 3) {
      setTimeout(() => {
        // Reset players to starting coordinates
        ms.p1.health = ms.p1.maxHealth;
        ms.p1.x = 260;
        ms.p1.y = 460;
        ms.p1.vx = 0;
        ms.p1.vy = 0;
        ms.p1.facing = 1;
        ms.p1.action = 'idle';
        ms.p1.cooldowns = {};
        ms.p1.energy = Math.max(ms.p1.energy, 35);
        ms.p1.statusEffects = [];

        ms.p2.health = ms.p2.maxHealth;
        ms.p2.x = 740;
        ms.p2.y = 460;
        ms.p2.vx = 0;
        ms.p2.vy = 0;
        ms.p2.facing = -1;
        ms.p2.action = 'idle';
        ms.p2.cooldowns = {};
        ms.p2.energy = Math.max(ms.p2.energy, 35);
        ms.p2.statusEffects = [];

        ms.projectiles = [];
        ms.matchTimer = 90;
        p1TrailHealthRef.current = ms.p1.maxHealth;
        p2TrailHealthRef.current = ms.p2.maxHealth;

        const nextR = currentR + 1;
        ms.currentRound = nextR;
        startRoundSequence(nextR, ms);
      }, 2400);
    } else {
      // 3 rounds completed -> Crown Match Champion
      setTimeout(() => {
        ms.phase = 'finished';
        const overallP1Won = newP1Wins > newP2Wins || (newP1Wins === newP2Wins && ms.p1.health > ms.p2.health);
        const overallP2Won = newP2Wins > newP1Wins || (newP1Wins === newP2Wins && ms.p2.health > ms.p1.health);
        const champName = overallP1Won ? ms.p1.name : overallP2Won ? ms.p2.name : 'Draw';

        if (overallP1Won) {
          soundEngine.playVictory();
        } else {
          soundEngine.playDefeat();
        }

        setHudState((prev) => ({
          ...prev,
          roundBanner: {
            title: 'MATCH OVER!',
            subtitle: `CHAMPION: ${champName.toUpperCase()} (${newP1Wins} - ${newP2Wins})`,
            isFinal: true,
            flash: true,
          },
        }));

        ms.stats = {
          winnerId: overallP1Won ? ms.p1.id : overallP2Won ? ms.p2.id : null,
          winnerName: overallP1Won ? ms.p1.name : overallP2Won ? ms.p2.name : 'Draw',
          loserName: overallP1Won ? ms.p2.name : overallP2Won ? ms.p1.name : 'Draw',
          winnerCat: overallP1Won ? ms.p1.catId : ms.p2.catId,
          loserCat: overallP1Won ? ms.p2.catId : ms.p1.catId,
          p1RoundsWon: newP1Wins,
          p2RoundsWon: newP2Wins,
          totalRounds: currentR,
          matchDuration: Math.round(90 - ms.matchTimer),
          p1Stats: {
            damageDealt: Math.round(ms.p1.damageDealt),
            hitsLanded: ms.p1.hitsLanded,
            highestCombo: ms.p1.highestCombo,
            dodgesSucceeded: ms.p1.dodgesSucceeded,
          },
          p2Stats: {
            damageDealt: Math.round(ms.p2.damageDealt),
            hitsLanded: ms.p2.hitsLanded,
            highestCombo: ms.p2.highestCombo,
            dodgesSucceeded: ms.p2.dodgesSucceeded,
          },
        };

        setTimeout(() => {
          onMatchEnd(ms);
        }, 1600);
      }, 2000);
    }
  };

  // Main 60FPS Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let hudUpdateTimer = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const ms = matchStateRef.current;

      if (!isPaused) {
        // --- 1. Simulation Updates ---
        if (isOnline) {
          socketClient.sendInput(keysRef.current);
          const localP = ms.p1.id === localPlayerId ? ms.p1 : ms.p2;
          const oppP = ms.p1.id === localPlayerId ? ms.p2 : ms.p1;
          CombatEngine.updatePlayerPhysics(localP, dt, oppP);
        } else {
          // Offline Training / Local AI Simulation
          if (ms.phase === 'fighting' && !isRoundTransitioningRef.current) {
            ms.matchTimer = Math.max(0, ms.matchTimer - dt);

            if (infiniteEnergy) {
              ms.p1.energy = 100;
            }

            // Player 1 input
            const newP1Proj = CombatEngine.handleInput(
              ms.p1,
              keysRef.current,
              ms.p2,
              particleSystemRef.current,
              true
            );
            ms.projectiles.push(...newP1Proj);

            // Bot Opponent input (AUTONOMOUS AI)
            const botKeys = BotAI.getInputs(ms.p2, ms.p1, botDifficulty, dt);
            const newP2Proj = CombatEngine.handleInput(
              ms.p2,
              botKeys,
              ms.p1,
              particleSystemRef.current,
              false
            );
            ms.projectiles.push(...newP2Proj);

            // Physics
            CombatEngine.updatePlayerPhysics(ms.p1, dt, ms.p2);
            CombatEngine.updatePlayerPhysics(ms.p2, dt, ms.p1);

            // Projectiles
            CombatEngine.updateProjectiles(
              ms.projectiles,
              dt,
              ms.p1,
              ms.p2,
              particleSystemRef.current,
              true
            );

            // Check Round Victory / KO condition (at least 3 rounds)
            if (ms.p2.health <= 0 || ms.p1.health <= 0 || ms.matchTimer <= 0) {
              handleRoundConclusion(ms);
            }
          }
        }

        // Damage Chip Trail Smooth Catch-Up
        if (ms.p1.health < p1TrailHealthRef.current) {
          p1TrailHealthRef.current = Math.max(ms.p1.health, p1TrailHealthRef.current - dt * 28);
        } else {
          p1TrailHealthRef.current = ms.p1.health;
        }

        if (ms.p2.health < p2TrailHealthRef.current) {
          p2TrailHealthRef.current = Math.max(ms.p2.health, p2TrailHealthRef.current - dt * 28);
        } else {
          p2TrailHealthRef.current = ms.p2.health;
        }

        // --- 2. Update Renderers & Particles ---
        arenaRendererRef.current.update(dt, ms.arenaId);
        particleSystemRef.current.update(dt);

        // --- 3. Render Canvas (1000 x 520) with Dynamic Screen Shake ---
        ctx.clearRect(0, 0, 1000, 520);

        const shake = particleSystemRef.current.screenShake;
        let shakeX = 0;
        let shakeY = 0;
        if (shake > 0) {
          shakeX = (Math.random() - 0.5) * shake * 2;
          shakeY = (Math.random() - 0.5) * shake * 2;
        }

        ctx.save();
        ctx.translate(shakeX, shakeY);

        // Render Arena Background
        arenaRendererRef.current.render(ctx, 1000, 520, ms.arenaId);

        // Render Projectiles
        for (const proj of ms.projectiles) {
          ctx.save();
          const grad = ctx.createRadialGradient(proj.x, proj.y, 2, proj.x, proj.y, proj.radius);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, proj.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Render Players
        catRendererRef.current.renderPlayer(ctx, ms.p1, now / 1000);
        catRendererRef.current.renderPlayer(ctx, ms.p2, now / 1000);

        // Render Combat Particles & Floating Texts
        particleSystemRef.current.render(ctx);

        ctx.restore();

        // --- 4. Sync HUD state smoothly (every 50ms) ---
        hudUpdateTimer += dt;
        if (hudUpdateTimer >= 0.05) {
          hudUpdateTimer = 0;
          setHudState((prev) => ({
            ...prev,
            p1Health: ms.p1.health,
            p1TrailHealth: p1TrailHealthRef.current,
            p1MaxHealth: ms.p1.maxHealth,
            p1Energy: ms.p1.energy,
            p1Combo: ms.p1.comboCount,
            p2Health: ms.p2.health,
            p2TrailHealth: p2TrailHealthRef.current,
            p2MaxHealth: ms.p2.maxHealth,
            p2Energy: ms.p2.energy,
            p2Combo: ms.p2.comboCount,
            matchTimer: Math.ceil(ms.matchTimer),
            countdownText: ms.countdown > 0 ? ms.countdown : ms.phase === 'fighting' ? '' : 'FIGHT!',
            phase: ms.phase,
            p1Cooldowns: { ...ms.p1.cooldowns },
            currentRound: ms.currentRound || prev.currentRound || 1,
            p1RoundsWon: ms.p1RoundsWon !== undefined ? ms.p1RoundsWon : prev.p1RoundsWon,
            p2RoundsWon: ms.p2RoundsWon !== undefined ? ms.p2RoundsWon : prev.p2RoundsWon,
          }));

          // Training DPS Tracker
          if (!isOnline) {
            const curTime = now / 1000;
            const tracker = damageTrackerRef.current;
            tracker.total = ms.p1.damageDealt;
            tracker.timestamps.push(curTime);
            while (tracker.timestamps.length > 0 && tracker.timestamps[0] < curTime - 3) {
              tracker.timestamps.shift();
            }
            const recentDps = tracker.timestamps.length > 1 ? tracker.total / 3 : 0;
            setTotalDamage(tracker.total);
            setDps(recentDps);
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOnline, isPaused, localPlayerId, infiniteEnergy, botDifficulty, onMatchEnd]);

  // Mobile Button Press Handlers
  const triggerMobileKey = (key: keyof ControlKeys, pressed: boolean) => {
    keysRef.current[key] = pressed;
  };

  const ms = matchStateRef.current;
  const p1Skills = ms.p1.loadout;
  const catP1 = CATS[ms.p1.catId] || CATS.shadow;
  const catP2 = CATS[ms.p2.catId] || CATS.fire;

  // Percentage calculations
  const p1HpPercent = Math.max(0, (hudState.p1Health / hudState.p1MaxHealth) * 100);
  const p1TrailPercent = Math.max(0, (hudState.p1TrailHealth / hudState.p1MaxHealth) * 100);
  const p2HpPercent = Math.max(0, (hudState.p2Health / hudState.p2MaxHealth) * 100);
  const p2TrailPercent = Math.max(0, (hudState.p2TrailHealth / hudState.p2MaxHealth) * 100);

  const isP1LowHp = p1HpPercent <= 25;
  const isTimerCritical = hudState.matchTimer <= 10 && hudState.phase === 'fighting';

  // Helper for ability icons
  const getSkillGlyph = (slot: string, key: string) => {
    switch (slot) {
      case 'claw_slash':
      case 'heavy_paw':
      case 'dual_fang':
        return <Flame size={18} className="text-amber-400" />;
      case 'lightning_bolt':
      case 'electric_stun':
      case 'thunderstorm_fury':
        return <Zap size={18} className="text-yellow-300" />;
      case 'frost_nova':
      case 'ice_shard':
      case 'glacial_tomb':
        return <Sparkles size={18} className="text-cyan-300" />;
      case 'fireball':
      case 'flame_pillar':
      case 'inferno_cataclysm':
        return <Flame size={18} className="text-orange-500" />;
      case 'shadow_teleport':
      case 'cat_dash':
        return <Wind size={18} className="text-purple-400" />;
      case 'paw_shield':
      case 'counterattack':
      case 'barrier':
        return <Shield size={18} className="text-emerald-400" />;
      default:
        return key === 'O' ? <Flame size={20} className="text-yellow-400" /> : <Crosshair size={18} className="text-cyan-400" />;
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#07060f] flex flex-col items-center justify-center overflow-hidden select-none font-game">
      {/* Ambient Cyber Rain & Vignette */}
      <div className="ambient-rain z-10" />
      {isP1LowHp && (
        <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_100px_rgba(239,68,68,0.45)] border-[4px] border-red-500/50 animate-pulse" />
      )}

      {/* =========================================================================
          HUD TOP BAR - FIGHTING GAME ARCHITECTURE
         ========================================================================= */}
      <div className="absolute top-3 inset-x-3 md:inset-x-8 z-30 flex items-start justify-between pointer-events-none">
        
        {/* PLAYER 1 HEALTH & COMBAT FRAME (LEFT) */}
        <div className="flex items-center gap-3 w-[42%] max-w-md pointer-events-auto">
          {/* Fighter Portrait in Angled Neon Frame */}
          <div
            className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 clip-chamfer glass-panel flex items-center justify-center border-2"
            style={{
              borderColor: catP1.visual.glowColor,
              boxShadow: `0 0 16px ${catP1.visual.glowColor}55`,
            }}
          >
            <CatHeroVisual catId={ms.p1.catId} mode="portrait" size="md" glow={false} />
            <div className="absolute top-0 left-0 bg-[#07060f]/80 px-1.5 py-0.5 text-[9px] font-title font-bold text-cyan-400 tracking-wider">
              P1
            </div>
          </div>

          {/* Health Gauge & Energy Bars */}
          <div className="flex-1 space-y-1">
            {/* Header: Name & Exact HP */}
            <div className="flex justify-between items-baseline font-title font-bold uppercase tracking-wider text-sm">
              <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate max-w-[140px]">
                {ms.p1.name}
              </span>
              <span className="font-num text-xs md:text-sm text-neutral-200">
                <span className="text-emerald-400 font-bold">{Math.max(0, Math.round(hudState.p1Health))}</span>
                <span className="text-neutral-500 text-[10px]"> / {hudState.p1MaxHealth}</span>
              </span>
            </div>

            {/* Heavy Angled Health Bar with Chip Damage Trail */}
            <div className="relative w-full h-5 md:h-6 bg-[#0e0920] border border-white/20 clip-skew-l overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
              {/* Damage Trail (White chip that drains slowly) */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-white/70 transition-all duration-300"
                style={{ width: `${p1TrailPercent}%` }}
              />
              {/* Primary Health Gradient Fill */}
              <div
                className={`absolute top-0 bottom-0 left-0 transition-all duration-75 ${
                  isP1LowHp
                    ? 'bg-gradient-to-r from-red-600 via-red-500 to-rose-400 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-400'
                }`}
                style={{ width: `${p1HpPercent}%` }}
              />
              {/* Gloss Highlight Overlay */}
              <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            </div>

            {/* Cyan Energy Meter with Subdivisions */}
            <div className="relative w-full h-2.5 bg-[#0a0718] border border-cyan-500/30 clip-skew-l overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 transition-all duration-75"
                style={{ width: `${hudState.p1Energy}%` }}
              />
              {/* Energy 100% Ready Shimmer */}
              {hudState.p1Energy >= 100 && (
                <div className="absolute inset-0 bg-cyan-300/40 animate-pulse" />
              )}
            </div>

            {/* P1 Round Pips */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[9px] font-title font-bold text-neutral-400 tracking-wider mr-1">ROUNDS</span>
              {[1, 2, 3].map((pip) => {
                const isWon = hudState.p1RoundsWon >= pip;
                return (
                  <div
                    key={`p1-pip-${pip}`}
                    className={`w-3.5 h-3.5 clip-chamfer transition-all duration-300 flex items-center justify-center ${
                      isWon
                        ? 'bg-gradient-to-r from-cyan-400 to-sky-300 shadow-[0_0_12px_rgba(34,211,238,0.95)] border border-cyan-200 scale-110'
                        : 'bg-[#120a24]/90 border border-white/20'
                    }`}
                  >
                    {isWon && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER MATCH TIMER & ROUND ANNOUNCEMENTS */}
        <div className="flex flex-col items-center shrink-0 mx-2 pointer-events-auto">
          {/* Hexagonal Timer Pill */}
          <div
            className={`px-5 py-1.5 clip-chamfer glass-panel border flex flex-col items-center justify-center transition-all ${
              isTimerCritical
                ? 'border-red-500 neon-border-red bg-red-950/60 animate-bounce'
                : 'border-cyan-500/40 neon-border-cyan'
            }`}
          >
            <span className="text-[9px] font-display font-black tracking-widest uppercase text-cyan-400">
              {hudState.currentRound === 3 ? 'FINAL ROUND' : `ROUND ${hudState.currentRound} / 3`}
            </span>
            <span
              className={`font-num text-2xl md:text-3xl font-extrabold tracking-tight ${
                isTimerCritical ? 'text-red-400' : 'text-white'
              }`}
            >
              {hudState.matchTimer}
            </span>
          </div>

          {/* Quick Touch Controls Toggle Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMobileControls?.();
              setInternalMobileControls((prev) => !prev);
            }}
            className={`mt-1.5 px-2.5 py-0.5 clip-chamfer border text-[10px] font-title font-bold tracking-wider uppercase transition flex items-center gap-1.5 active:scale-95 ${
              isMobileControlsActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                : 'glass-panel text-neutral-400 border-white/10 hover:text-white'
            }`}
            title="Toggle On-Screen Touch Controls"
          >
            <Smartphone size={11} />
            <span>TOUCH: {isMobileControlsActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Dynamic Big Match Announcement */}
          {hudState.countdownText !== '' && (
            <div className="absolute top-28 font-display font-black text-6xl md:text-8xl italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 drop-shadow-[0_8px_20px_rgba(245,158,11,0.6)] animate-pulse tracking-wider pointer-events-none">
              {hudState.countdownText}
            </div>
          )}

          {/* Ultimate Ready Tactical Banner */}
          {hudState.p1Energy >= 100 && hudState.phase === 'fighting' && (
            <div className="mt-1 px-3 py-0.5 clip-chamfer bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-display font-black text-[10px] tracking-wider uppercase animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.7)]">
              [O] OVERDRIVE READY!
            </div>
          )}
        </div>

        {/* PLAYER 2 / OPPONENT HEALTH & COMBAT FRAME (RIGHT) */}
        <div className="flex items-center gap-3 w-[42%] max-w-md flex-row-reverse pointer-events-auto">
          {/* Fighter Portrait in Angled Neon Frame */}
          <div
            className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 clip-chamfer glass-panel flex items-center justify-center border-2"
            style={{
              borderColor: catP2.visual.glowColor,
              boxShadow: `0 0 16px ${catP2.visual.glowColor}55`,
            }}
          >
            <CatHeroVisual catId={ms.p2.catId} mode="portrait" size="md" glow={false} />
            <div className="absolute top-0 right-0 bg-[#07060f]/80 px-1.5 py-0.5 text-[9px] font-title font-bold text-magenta-400 tracking-wider">
              P2
            </div>
          </div>

          {/* Health Gauge & Energy Bars */}
          <div className="flex-1 space-y-1 text-right">
            {/* Header: Name & Exact HP */}
            <div className="flex justify-between items-baseline font-title font-bold uppercase tracking-wider text-sm flex-row-reverse">
              <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate max-w-[140px]">
                {ms.p2.name}
              </span>
              <span className="font-num text-xs md:text-sm text-neutral-200">
                <span className="text-emerald-400 font-bold">{Math.max(0, Math.round(hudState.p2Health))}</span>
                <span className="text-neutral-500 text-[10px]"> / {hudState.p2MaxHealth}</span>
              </span>
            </div>

            {/* Heavy Angled Health Bar with Chip Damage Trail (Mirrored) */}
            <div className="relative w-full h-5 md:h-6 bg-[#0e0920] border border-white/20 clip-skew-r overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
              {/* Damage Trail */}
              <div
                className="absolute top-0 bottom-0 right-0 bg-white/70 transition-all duration-300"
                style={{ width: `${p2TrailPercent}%` }}
              />
              {/* Primary Health Gradient Fill */}
              <div
                className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-emerald-500 via-lime-400 to-amber-400 transition-all duration-75"
                style={{ width: `${p2HpPercent}%` }}
              />
              {/* Gloss Highlight Overlay */}
              <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
            </div>

            {/* Energy Meter */}
            <div className="relative w-full h-2.5 bg-[#0a0718] border border-magenta-500/30 clip-skew-r overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-magenta-500 to-purple-600 transition-all duration-75 ml-auto"
                style={{ width: `${hudState.p2Energy}%` }}
              />
            </div>

            {/* P2 Round Pips */}
            <div className="flex items-center gap-1.5 pt-0.5 justify-end">
              {[1, 2, 3].map((pip) => {
                const isWon = hudState.p2RoundsWon >= pip;
                return (
                  <div
                    key={`p2-pip-${pip}`}
                    className={`w-3.5 h-3.5 clip-chamfer transition-all duration-300 flex items-center justify-center ${
                      isWon
                        ? 'bg-gradient-to-r from-amber-400 to-rose-400 shadow-[0_0_12px_rgba(251,191,36,0.95)] border border-amber-200 scale-110'
                        : 'bg-[#120a24]/90 border border-white/20'
                    }`}
                  >
                    {isWon && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                  </div>
                );
              })}
              <span className="text-[9px] font-title font-bold text-neutral-400 tracking-wider ml-1">ROUNDS</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC COMBO COUNTER BURSTS
         ========================================================================= */}
      {hudState.p1Combo >= 2 && (
        <div className="absolute left-8 top-32 z-30 pointer-events-none animate-bounce font-display italic">
          <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-yellow-300 to-amber-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
            {hudState.p1Combo} HITS!
          </div>
          <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-cyan-300 bg-black/60 px-2 py-0.5 rounded border border-cyan-400/40 inline-block mt-1">
            {hudState.p1Combo >= 5 ? '🔥 BRUTAL COMBO!' : hudState.p1Combo >= 3 ? '⚡ SUPERB!' : 'STRIKE!'}
          </div>
        </div>
      )}

      {/* TRAINING HUD DRAWER (Left Dock) */}
      {!isOnline && (
        <TrainingHUD
          botDifficulty={botDifficulty}
          setBotDifficulty={handleDifficultyChange}
          botCatId={botCatId}
          onChangeBotCat={handleChangeBotCat}
          infiniteEnergy={infiniteEnergy}
          setInfiniteEnergy={setInfiniteEnergy}
          onResetCooldowns={() => {
            ms.p1.cooldowns = {};
          }}
          onResetPositions={() => {
            ms.p1.x = 260;
            ms.p1.y = 460;
            ms.p1.vx = 0;
            ms.p1.vy = 0;
            ms.p2.x = 740;
            ms.p2.y = 460;
            ms.p2.vx = 0;
            ms.p2.vy = 0;
            if (ms.phase === 'finished' || ms.p1.health <= 0 || ms.p2.health <= 0) {
              ms.p1.health = ms.p1.maxHealth;
              ms.p2.health = ms.p2.maxHealth;
              ms.p1.action = 'idle';
              ms.p2.action = 'idle';
              ms.phase = 'fighting';
              ms.matchTimer = 90;
              ms.projectiles = [];
            }
          }}
          onExit={onExit}
          totalDamage={totalDamage}
          dps={dps}
        />
      )}

      {/* PAUSE BUTTON (Top Right Corner) */}
      <div className="absolute top-4 right-4 md:right-6 z-40">
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsPaused(!isPaused);
          }}
          className="p-2.5 clip-chamfer glass-panel hover:glass-panel-cyan border text-neutral-300 hover:text-cyan-300 transition-all arcade-btn"
          title="Pause Combat [ESC]"
        >
          <Pause size={18} />
        </button>
      </div>

      {/* =========================================================================
          THE 1000 x 520 GAME CANVAS CONTAINER
         ========================================================================= */}
      <div className="w-full max-w-6xl aspect-[1000/520] relative flex items-center justify-center overflow-hidden clip-chamfer border-2 border-white/10 bg-[#07060f] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <canvas
          ref={canvasRef}
          width={1000}
          height={520}
          className="w-full h-full object-contain"
        />
        {/* Subtle Scanlines over the canvas */}
        <div className="scanlines absolute inset-0 pointer-events-none opacity-40" />
      </div>

      {/* =========================================================================
          HUD - BOTTOM ARCADE ABILITY DOCK (DESKTOP / KEYBOARD MODE)
         ========================================================================= */}
      {!isMobileControlsActive && (
        <div className="absolute bottom-3 z-30 flex items-center gap-2 p-2 clip-chamfer glass-panel border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {[
            { key: 'J', slot: 'basic', label: 'Light' },
            { key: 'K', slot: 'heavy', label: 'Heavy' },
            { key: 'L', slot: p1Skills.ability1, label: 'Skill 1' },
            { key: 'U', slot: p1Skills.ability2, label: 'Skill 2' },
            { key: 'Shift', slot: p1Skills.movement, label: 'Dash' },
            { key: 'I', slot: p1Skills.defensive, label: 'Guard' },
            { key: 'O', slot: p1Skills.ultimate, label: 'Overdrive' },
          ].map(({ key, slot, label }) => {
            const skill = SKILLS[slot] || {
              name: label,
              energyCost: 0,
              cooldown: 0,
            };
            const cd = hudState.p1Cooldowns[slot] || 0;
            const isUlt = key === 'O';
            const canUlt = isUlt && hudState.p1Energy >= 100;
            const hasEnoughEnergy = hudState.p1Energy >= (skill.energyCost || 0);

            return (
              <div
                key={key}
                className={`relative flex flex-col items-center justify-between w-14 h-18 md:w-16 md:h-20 p-1.5 clip-chamfer border transition-all ${
                  isUlt
                    ? canUlt
                      ? 'border-yellow-400 bg-yellow-950/60 neon-border-gold animate-pulse text-white'
                      : 'border-neutral-800 bg-[#0e091e] opacity-50 text-neutral-500'
                    : cd > 0
                    ? 'border-neutral-800 bg-[#090714] text-neutral-500'
                    : !hasEnoughEnergy
                    ? 'border-red-900/60 bg-[#160b13] text-red-300'
                    : 'border-cyan-500/40 bg-[#130f28] text-white hover:border-cyan-400'
                }`}
              >
                {/* Cooldown Sweep Overlay */}
                {cd > 0 && (
                  <div className="absolute inset-0 bg-[#07060f]/85 flex flex-col items-center justify-center font-num text-xs font-bold text-cyan-300 z-10 backdrop-blur-[2px]">
                    <span>{cd.toFixed(1)}s</span>
                  </div>
                )}

                {/* Top Keycap Hint */}
                <div className="w-full flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold px-1 py-0.5 rounded bg-black/60 border border-white/20 text-neutral-300">
                    {key}
                  </span>
                  {skill.energyCost > 0 && (
                    <span className={`text-[8px] font-mono font-bold ${hasEnoughEnergy ? 'text-cyan-400' : 'text-red-400'}`}>
                      {skill.energyCost}⚡
                    </span>
                  )}
                </div>

                {/* Glyph Icon */}
                <div className="my-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {getSkillGlyph(slot, key)}
                </div>

                {/* Skill Name in Small Caps */}
                <span className="text-[9px] font-title font-bold tracking-wider uppercase truncate w-full text-center text-neutral-300">
                  {skill.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          FULL-FEATURED VISIBLE MOBILE TOUCH CONTROLS (HIGH CONTRAST ARCADE PAD)
         ========================================================================= */}
      {isMobileControlsActive && (
        <div className="absolute inset-x-0 bottom-4 z-40 px-3 md:px-8 flex justify-between items-end pointer-events-none select-none">
          {/* LEFT: DIRECTIONAL & MOBILITY D-PAD CLUSTER */}
          <div className="flex flex-col items-center gap-2 pointer-events-auto">
            {/* Jump Button */}
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('jump', true); }}
              onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('jump', false); }}
              onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('jump', false); }}
              onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('jump', false); }}
              style={{ width: '80px', height: '58px' }}
              className="clip-chamfer mobile-ctrl-btn mobile-btn-dpad font-display font-black text-2xl flex items-center justify-center cursor-pointer"
              title="Jump / Up"
            >
              <span style={{ color: '#67e8f9', textShadow: '0 0 10px #22d3ee' }}>▲</span>
            </button>

            {/* Directional Row: Left, Crouch/Down, Right */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('left', true); }}
                onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('left', false); }}
                onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('left', false); }}
                onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('left', false); }}
                style={{ width: '74px', height: '64px' }}
                className="clip-chamfer mobile-ctrl-btn mobile-btn-dpad font-display font-black text-2xl flex items-center justify-center cursor-pointer"
                title="Move Left"
              >
                <span style={{ color: '#ffffff', textShadow: '0 0 10px #38bdf8' }}>◀</span>
              </button>
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('down', true); }}
                onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('down', false); }}
                onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('down', false); }}
                onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('down', false); }}
                style={{ width: '60px', height: '64px' }}
                className="clip-chamfer mobile-ctrl-btn mobile-btn-dpad font-display font-black text-lg flex items-center justify-center cursor-pointer"
                title="Crouch / Down"
              >
                <span style={{ color: '#67e8f9', textShadow: '0 0 10px #22d3ee' }}>▼</span>
              </button>
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('right', true); }}
                onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('right', false); }}
                onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('right', false); }}
                onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('right', false); }}
                style={{ width: '74px', height: '64px' }}
                className="clip-chamfer mobile-ctrl-btn mobile-btn-dpad font-display font-black text-2xl flex items-center justify-center cursor-pointer"
                title="Move Right"
              >
                <span style={{ color: '#ffffff', textShadow: '0 0 10px #38bdf8' }}>▶</span>
              </button>
            </div>

            {/* Quick Dash Mobility Bar */}
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('movementSkill', true); }}
              onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('movementSkill', false); }}
              onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('movementSkill', false); }}
              onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('movementSkill', false); }}
              style={{ width: '222px', height: '42px' }}
              className="clip-chamfer mobile-ctrl-btn mobile-btn-dash font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wind size={16} style={{ color: '#d8b4fe' }} />
              <span style={{ color: '#ffffff', textShadow: '0 2px 4px #000, 0 0 8px rgba(192, 132, 252, 0.8)' }}>
                DASH [SHIFT]
              </span>
            </button>
          </div>

          {/* RIGHT: ATTACK & COMBAT ACTIONS CLUSTER */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            {/* Top: Ultimate / Overdrive Bar with Visible Energy Gauge */}
            <div
              className={`relative clip-chamfer overflow-hidden mobile-overdrive-container ${
                hudState.p1Energy >= 100 ? 'mobile-overdrive-ready-pulse' : ''
              }`}
              style={{ width: '276px', height: '44px' }}
            >
              {/* Internal Energy Progress Fill */}
              <div
                className="absolute inset-y-0 left-0 transition-all duration-150"
                style={{
                  width: `${Math.min(100, Math.max(0, hudState.p1Energy))}%`,
                  background:
                    hudState.p1Energy >= 100
                      ? 'linear-gradient(90deg, #f59e0b 0%, #facc15 60%, #ffffff 100%)'
                      : 'linear-gradient(90deg, #b45309 0%, #d97706 40%, #f59e0b 80%, #fef08a 100%)',
                  boxShadow: hudState.p1Energy > 5 ? '0 0 14px rgba(253, 224, 71, 0.8)' : 'none',
                }}
              />

              {/* Overdrive Button Overlay (Explicit transparent bg to prevent browser buttonface) */}
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('ultimate', true); }}
                onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('ultimate', false); }}
                onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('ultimate', false); }}
                onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('ultimate', false); }}
                style={{ background: 'transparent', border: 'none', outline: 'none' }}
                className="relative w-full h-full flex items-center justify-between px-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5" style={{ textShadow: '0 2px 4px #000, 0 0 8px #000' }}>
                  <Flame
                    size={18}
                    className={hudState.p1Energy >= 100 ? 'text-yellow-200 animate-bounce' : 'text-amber-400'}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.9))' }}
                  />
                  <span
                    className="font-display font-black text-xs uppercase tracking-wider"
                    style={{
                      color: hudState.p1Energy >= 100 ? '#fef08a' : '#ffffff',
                      textShadow: '0 2px 4px #000, 0 0 8px rgba(0,0,0,0.9)',
                    }}
                  >
                    {hudState.p1Energy >= 100 ? '🔥 SUPER READY! [O]' : 'OVERDRIVE [O]'}
                  </span>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-num font-black tracking-tight"
                  style={{
                    backgroundColor: '#000000',
                    color: hudState.p1Energy >= 100 ? '#fde047' : '#fef08a',
                    border: '1.5px solid #f59e0b',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.8)',
                  }}
                >
                  {Math.round(hudState.p1Energy)} / 100⚡
                </span>
              </button>
            </div>

            {/* Combat Actions Grid: Row 1 (Strike, Heavy, Guard) */}
            <div className="flex items-center gap-2">
              {/* Basic Strike */}
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('basicAttack', true); }}
                onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('basicAttack', false); }}
                onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('basicAttack', false); }}
                onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('basicAttack', false); }}
                style={{ width: '86px', height: '74px' }}
                className="clip-chamfer mobile-ctrl-btn mobile-btn-strike"
              >
                <span
                  className="font-display font-black text-sm tracking-wider uppercase"
                  style={{ color: '#ffffff', textShadow: '0 2px 4px #000, 0 0 8px rgba(34, 211, 238, 0.7)' }}
                >
                  STRIKE
                </span>
                <span
                  className="text-[10px] font-num font-black px-2 py-0.5 rounded mt-1"
                  style={{
                    color: '#67e8f9',
                    backgroundColor: 'rgba(8, 51, 68, 0.95)',
                    border: '1px solid #22d3ee',
                  }}
                >
                  [ J ]
                </span>
              </button>

              {/* Heavy Attack */}
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('heavyAttack', true); }}
                onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('heavyAttack', false); }}
                onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('heavyAttack', false); }}
                onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('heavyAttack', false); }}
                style={{ width: '86px', height: '74px' }}
                className="clip-chamfer mobile-ctrl-btn mobile-btn-heavy"
              >
                <span
                  className="font-display font-black text-sm tracking-wider uppercase"
                  style={{ color: '#fef08a', textShadow: '0 2px 4px #000, 0 0 8px rgba(245, 158, 11, 0.7)' }}
                >
                  HEAVY
                </span>
                <span
                  className="text-[10px] font-num font-black px-2 py-0.5 rounded mt-1"
                  style={{
                    color: '#fde68a',
                    backgroundColor: 'rgba(69, 26, 3, 0.95)',
                    border: '1px solid #f59e0b',
                  }}
                >
                  [ K ]
                </span>
              </button>

              {/* Guard / Shield */}
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('defenseSkill', true); }}
                onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('defenseSkill', false); }}
                onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('defenseSkill', false); }}
                onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('defenseSkill', false); }}
                style={{ width: '86px', height: '74px' }}
                className="clip-chamfer mobile-ctrl-btn mobile-btn-guard"
              >
                <Shield size={18} style={{ color: '#34d399', filter: 'drop-shadow(0 0 4px rgba(52, 211, 153, 0.8))' }} />
                <span
                  className="font-display font-black text-xs tracking-wider uppercase mt-0.5"
                  style={{ color: '#a7f3d0', textShadow: '0 2px 4px #000' }}
                >
                  GUARD
                </span>
                <span
                  className="text-[10px] font-num font-black px-2 py-0.5 rounded mt-0.5"
                  style={{
                    color: '#34d399',
                    backgroundColor: 'rgba(2, 44, 34, 0.95)',
                    border: '1px solid #10b981',
                  }}
                >
                  [ I ]
                </span>
              </button>
            </div>

            {/* Combat Actions Grid: Row 2 (Skill 1 & Skill 2 - Wide & High Contrast) */}
            <div className="flex items-center gap-2">
              {/* Skill 1 */}
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('ability1', true); }}
                onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('ability1', false); }}
                onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('ability1', false); }}
                onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('ability1', false); }}
                style={{ width: '134px', height: '74px' }}
                className="clip-chamfer mobile-ctrl-btn mobile-btn-skill1 relative overflow-hidden px-2"
              >
                {hudState.p1Cooldowns[p1Skills.ability1] > 0 && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center font-num font-black z-10"
                    style={{ backgroundColor: 'rgba(12, 2, 8, 0.92)', color: '#fde047' }}
                  >
                    <span className="text-base font-black tracking-wider">
                      {hudState.p1Cooldowns[p1Skills.ability1].toFixed(1)}s
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-300">COOLING DOWN</span>
                  </div>
                )}
                <div className="w-full flex items-center justify-between">
                  <Zap size={16} style={{ color: '#fda4af', filter: 'drop-shadow(0 0 6px rgba(251, 113, 133, 0.9))' }} />
                  <span
                    className="text-[10px] font-num font-black px-2 py-0.5 rounded"
                    style={{
                      color: '#fecdd3',
                      backgroundColor: 'rgba(60, 5, 20, 0.95)',
                      border: '1px solid #fb7185',
                    }}
                  >
                    [ L ]
                  </span>
                </div>
                <span
                  className="font-display font-black text-[11px] leading-tight text-center uppercase tracking-wide mt-1"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 2px 4px #000, 0 0 6px rgba(251, 113, 133, 0.7)',
                    wordBreak: 'break-word',
                  }}
                >
                  {SKILLS[p1Skills.ability1]?.name || 'SKILL 1'}
                </span>
              </button>

              {/* Skill 2 */}
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); triggerMobileKey('ability2', true); }}
                onPointerUp={(e) => { e.preventDefault(); triggerMobileKey('ability2', false); }}
                onPointerCancel={(e) => { e.preventDefault(); triggerMobileKey('ability2', false); }}
                onPointerLeave={(e) => { e.preventDefault(); triggerMobileKey('ability2', false); }}
                style={{ width: '134px', height: '74px' }}
                className="clip-chamfer mobile-ctrl-btn mobile-btn-skill2 relative overflow-hidden px-2"
              >
                {hudState.p1Cooldowns[p1Skills.ability2] > 0 && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center font-num font-black z-10"
                    style={{ backgroundColor: 'rgba(4, 10, 24, 0.92)', color: '#38bdf8' }}
                  >
                    <span className="text-base font-black tracking-wider">
                      {hudState.p1Cooldowns[p1Skills.ability2].toFixed(1)}s
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-neutral-300">COOLING DOWN</span>
                  </div>
                )}
                <div className="w-full flex items-center justify-between">
                  <Sparkles size={16} style={{ color: '#7dd3fc', filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }} />
                  <span
                    className="text-[10px] font-num font-black px-2 py-0.5 rounded"
                    style={{
                      color: '#bae6fd',
                      backgroundColor: 'rgba(5, 20, 50, 0.95)',
                      border: '1px solid #38bdf8',
                    }}
                  >
                    [ U ]
                  </span>
                </div>
                <span
                  className="font-display font-black text-[11px] leading-tight text-center uppercase tracking-wide mt-1"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 2px 4px #000, 0 0 6px rgba(56, 189, 248, 0.7)',
                    wordBreak: 'break-word',
                  }}
                >
                  {SKILLS[p1Skills.ability2]?.name || 'SKILL 2'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ROUND ANNOUNCEMENT & K.O. GRAND SLAM BANNER
         ========================================================================= */}
      {hudState.roundBanner && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none select-none bg-black/40 backdrop-blur-[3px] animate-fade-in">
          <div className="flex flex-col items-center text-center transform -translate-y-4">
            {/* Top Subtitle */}
            {hudState.roundBanner.subtitle && (
              <div className="px-4 py-1 clip-chamfer bg-[#0c0822] border border-cyan-400/50 text-cyan-300 text-xs md:text-sm font-title font-black uppercase tracking-[0.25em] shadow-[0_0_20px_rgba(34,211,238,0.4)] mb-3 animate-pulse">
                {hudState.roundBanner.subtitle}
              </div>
            )}

            {/* Giant Arcade Title */}
            <h1
              className={`font-display font-black text-6xl md:text-8xl italic tracking-tight drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] ${
                hudState.roundBanner.title === 'K.O.!'
                  ? 'animate-ko-slam text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-300 to-rose-400 filter drop-shadow-[0_0_40px_rgba(244,63,94,0.8)]'
                  : hudState.roundBanner.title === 'FIGHT!'
                  ? 'animate-round-zoom text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-red-500 filter drop-shadow-[0_0_45px_rgba(251,191,36,0.9)]'
                  : 'animate-round-zoom text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-400 filter drop-shadow-[0_0_35px_rgba(34,211,238,0.7)]'
              }`}
            >
              {hudState.roundBanner.title}
            </h1>

            {/* Claw Slash Glow underline */}
            <div className="w-64 md:w-96 h-1.5 mt-3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
          </div>
        </div>
      )}

      {/* =========================================================================
          ARCADE PAUSE OVERLAY
         ========================================================================= */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-game">
          <div className="glass-panel-cyan clip-chamfer-lg p-8 max-w-md w-full text-center space-y-6 border-2">
            <div>
              <span className="font-title font-bold text-xs uppercase tracking-widest text-cyan-400 block">
                COMBAT PROTOCOL
              </span>
              <h2 className="text-3xl font-display font-black italic text-white tracking-wider drop-shadow-md">
                MATCH PAUSED
              </h2>
            </div>

            <div className="flex flex-col gap-3 font-title font-bold text-sm tracking-wider uppercase">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-3.5 clip-chamfer bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black flex items-center justify-center gap-2 arcade-btn"
              >
                <Play size={16} />
                <span>Resume Bout</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (isOnline) socketClient.leaveRoom();
                  onExit();
                }}
                className="w-full py-3.5 clip-chamfer glass-panel hover:border-red-500 hover:text-red-400 text-neutral-300 flex items-center justify-center gap-2 transition-all arcade-btn"
              >
                <LogOut size={16} />
                <span>Exit Match</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
