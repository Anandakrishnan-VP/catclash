import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Serve frontend build if dist exists
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// In-memory Room Storage
const rooms = new Map();

// Helper to generate 5-character readable code (e.g. "CAT74")
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CAT-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Base cat stats for authoritative calculation
const CAT_STATS = {
  shadow: { baseHealth: 95, baseSpeed: 380, attackPower: 1.15, defense: 0.05 },
  thunder: { baseHealth: 90, baseSpeed: 410, attackPower: 1.1, defense: 0.0 },
  frost: { baseHealth: 100, baseSpeed: 330, attackPower: 1.0, defense: 0.15 },
  fire: { baseHealth: 105, baseSpeed: 340, attackPower: 1.25, defense: 0.1 },
  ninja: { baseHealth: 90, baseSpeed: 390, attackPower: 1.1, defense: 0.05 },
  tank: { baseHealth: 140, baseSpeed: 280, attackPower: 1.2, defense: 0.25 },
};

const SKILL_DATA = {
  claw_slash: { damage: 12, cooldown: 0.25, energyCost: 0, range: 90, knockback: 160 },
  heavy_paw: { damage: 22, cooldown: 0.6, energyCost: 0, range: 105, knockback: 340 },
  dual_fang: { damage: 16, cooldown: 0.35, energyCost: 0, range: 85, knockback: 180 },
  fireball: { damage: 24, cooldown: 3.5, energyCost: 15, range: 480, speed: 680, radius: 18, element: 'fire', knockback: 220, burn: 2.5 },
  lightning_bolt: { damage: 20, cooldown: 4.0, energyCost: 20, range: 520, speed: 950, radius: 14, element: 'lightning', knockback: 180, stun: 0.5 },
  ice_shard: { damage: 18, cooldown: 3.0, energyCost: 15, range: 460, speed: 720, radius: 16, element: 'ice', knockback: 160, slow: 3.0 },
  shadow_projectile: { damage: 22, cooldown: 4.2, energyCost: 18, range: 440, speed: 600, radius: 20, element: 'shadow', knockback: 190 },
  kunai_flurry: { damage: 26, cooldown: 4.5, energyCost: 20, range: 420, speed: 800, radius: 12, element: 'ninja', knockback: 200 },
  ground_slam: { damage: 28, cooldown: 5.0, energyCost: 22, range: 160, knockback: 380, stun: 0.4 },
  spin_attack: { damage: 25, cooldown: 5.0, energyCost: 20, range: 130, knockback: 260 },
  energy_wave: { damage: 24, cooldown: 4.8, energyCost: 22, range: 500, speed: 700, radius: 28, element: 'neutral', knockback: 230 },
  ice_trap: { damage: 15, cooldown: 6.5, energyCost: 25, range: 150, knockback: 80, frozen: 1.3 },
  electric_stun: { damage: 18, cooldown: 5.5, energyCost: 24, range: 140, knockback: 170, stun: 0.7 },
  smoke_bomb: { damage: 10, cooldown: 6.0, energyCost: 20, range: 120, knockback: 120 },
  gravity_paw: { damage: 14, cooldown: 5.5, energyCost: 22, range: 350, knockback: -280 },
  cat_dash: { damage: 5, cooldown: 2.2, energyCost: 0, duration: 0.2 },
  shadow_teleport: { damage: 0, cooldown: 4.5, energyCost: 20, duration: 0.15 },
  air_dash: { damage: 8, cooldown: 2.5, energyCost: 10, duration: 0.22 },
  wall_bounce: { damage: 0, cooldown: 3.0, energyCost: 10, duration: 0.25 },
  paw_shield: { cooldown: 3.0, energyCost: 15, duration: 0.7 },
  energy_barrier: { cooldown: 8.0, energyCost: 35, duration: 1.2 },
  counterattack: { damage: 32, cooldown: 6.0, energyCost: 25, duration: 0.5, knockback: 350 },
  smoke_escape: { cooldown: 7.0, energyCost: 30, duration: 0.35 },
  shadow_realm: { damage: 55, energyCost: 100, range: 380, knockback: 450 },
  thunderstorm_fury: { damage: 58, energyCost: 100, range: 550, knockback: 420, stun: 1.2 },
  absolute_zero: { damage: 52, energyCost: 100, range: 480, knockback: 380, frozen: 2.2 },
  inferno_cataclysm: { damage: 62, energyCost: 100, range: 520, knockback: 480, burn: 4.0 },
  thousand_paw_strike: { damage: 60, energyCost: 100, range: 420, knockback: 460 },
  catastrophic_slam: { damage: 65, energyCost: 100, range: 450, knockback: 550, stun: 1.5 },
};

function createInitialPlayerState(player, startX, facing) {
  const catStats = CAT_STATS[player.catId] || CAT_STATS.shadow;
  return {
    id: player.id,
    socketId: player.socketId,
    name: player.name,
    catId: player.catId,
    loadout: player.loadout,
    x: startX,
    y: 460,
    vx: 0,
    vy: 0,
    width: 56,
    height: 60,
    isGrounded: true,
    facing,
    action: 'idle',
    actionTimer: 0,
    actionDuration: 0,
    health: catStats.baseHealth,
    maxHealth: catStats.baseHealth,
    energy: 25,
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

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Ping for latency measurement
  socket.on('latency_ping', (timestamp, callback) => {
    if (typeof callback === 'function') {
      callback(timestamp);
    }
  });

  // Create Room
  socket.on('create_room', (data, callback) => {
    const roomCode = generateRoomCode();
    const player = {
      id: socket.id,
      socketId: socket.id,
      name: data.playerName || 'Player 1',
      catId: data.catId || 'shadow',
      loadout: data.loadout || {
        basic: 'claw_slash',
        ability1: 'shadow_projectile',
        ability2: 'gravity_paw',
        movement: 'shadow_teleport',
        defensive: 'counterattack',
        ultimate: 'shadow_realm',
      },
      ready: false,
      isHost: true,
      rematchRequested: false,
    };

    const room = {
      roomCode,
      hostId: socket.id,
      players: { [socket.id]: player },
      arenaId: data.arenaId || 'rooftop',
      state: 'waiting',
      matchState: null,
      tickInterval: null,
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.roomCode = roomCode;

    console.log(`Room created: ${roomCode} by ${socket.id}`);
    if (typeof callback === 'function') {
      callback({ success: true, roomCode, room: serializeRoom(room) });
    }
  });

  // Join Room
  socket.on('join_room', (data, callback) => {
    const roomCode = (data.roomCode || '').trim().toUpperCase();
    const room = rooms.get(roomCode);

    if (!room) {
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Room does not exist.' });
      }
      return;
    }

    const playerKeys = Object.keys(room.players);
    if (playerKeys.length >= 2) {
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Room is already full (maximum 2 players).' });
      }
      return;
    }

    if (room.state !== 'waiting') {
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Match is already in progress in this room.' });
      }
      return;
    }

    const player = {
      id: socket.id,
      socketId: socket.id,
      name: data.playerName || 'Player 2',
      catId: data.catId || 'fire',
      loadout: data.loadout || {
        basic: 'heavy_paw',
        ability1: 'fireball',
        ability2: 'spin_attack',
        movement: 'cat_dash',
        defensive: 'counterattack',
        ultimate: 'inferno_cataclysm',
      },
      ready: false,
      isHost: false,
      rematchRequested: false,
    };

    room.players[socket.id] = player;
    socket.join(roomCode);
    socket.roomCode = roomCode;

    console.log(`Player ${socket.id} joined room ${roomCode}`);
    io.to(roomCode).emit('room_updated', serializeRoom(room));

    if (typeof callback === 'function') {
      callback({ success: true, roomCode, room: serializeRoom(room) });
    }
  });

  // Update Cat / Loadout / Arena in Lobby
  socket.on('update_lobby_player', (data) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    if (data.catId) player.catId = data.catId;
    if (data.loadout) player.loadout = data.loadout;
    if (typeof data.ready === 'boolean') player.ready = data.ready;
    if (data.arenaId && player.isHost) room.arenaId = data.arenaId;

    io.to(room.roomCode).emit('room_updated', serializeRoom(room));
  });

  // Start Match Request (Host only, both players must be ready)
  socket.on('start_match', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const playerList = Object.values(room.players);
    if (playerList.length < 2) return;

    const p1 = playerList[0];
    const p2 = playerList[1];

    if (!p1.ready || !p2.ready) return;

    room.state = 'in_match';

    // Initialize Authoritative Match State
    room.matchState = {
      roomCode: room.roomCode,
      arenaId: room.arenaId,
      phase: 'countdown',
      countdown: 3,
      matchTimer: 90, // 90 seconds round
      currentRound: 1,
      totalRounds: 3,
      p1RoundsWon: 0,
      p2RoundsWon: 0,
      p1: createInitialPlayerState(p1, 260, 1),
      p2: createInitialPlayerState(p2, 740, -1),
      projectiles: [],
      stats: null,
    };

    io.to(room.roomCode).emit('match_started', room.matchState);

    // Launch Countdown sequence
    let count = 3;
    const countInterval = setInterval(() => {
      count -= 1;
      if (!rooms.has(room.roomCode)) {
        clearInterval(countInterval);
        return;
      }

      if (count > 0) {
        room.matchState.countdown = count;
        io.to(room.roomCode).emit('countdown_tick', count);
      } else if (count === 0) {
        room.matchState.countdown = 0;
        room.matchState.phase = 'fighting';
        io.to(room.roomCode).emit('countdown_tick', 'FIGHT!');
        clearInterval(countInterval);

        // Start Authoritative 30Hz Simulation Tick
        startAuthoritativeTick(room);
      }
    }, 1000);
  });

  // Player Input in Match
  socket.on('player_input', (inputData) => {
    const room = rooms.get(socket.roomCode);
    if (!room || !room.matchState || room.matchState.phase !== 'fighting') return;

    const ms = room.matchState;
    const isP1 = ms.p1.socketId === socket.id;
    const p = isP1 ? ms.p1 : ms.p2;
    const opp = isP1 ? ms.p2 : ms.p1;

    // Buffer latest keys
    p.currentKeys = inputData.keys;
  });

  // Rematch Agreement
  socket.on('request_rematch', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    player.rematchRequested = true;
    const playerList = Object.values(room.players);

    if (playerList.length === 2 && playerList[0].rematchRequested && playerList[1].rematchRequested) {
      // Both agreed! Reset rematch and start new match
      playerList[0].rematchRequested = false;
      playerList[1].rematchRequested = false;

      if (room.tickInterval) clearInterval(room.tickInterval);

      room.matchState = {
        roomCode: room.roomCode,
        arenaId: room.arenaId,
        phase: 'countdown',
        countdown: 3,
        matchTimer: 90,
        p1: createInitialPlayerState(playerList[0], 260, 1),
        p2: createInitialPlayerState(playerList[1], 740, -1),
        projectiles: [],
        stats: null,
      };

      io.to(room.roomCode).emit('match_started', room.matchState);

      let count = 3;
      const countInterval = setInterval(() => {
        count -= 1;
        if (!rooms.has(room.roomCode)) {
          clearInterval(countInterval);
          return;
        }

        if (count > 0) {
          room.matchState.countdown = count;
          io.to(room.roomCode).emit('countdown_tick', count);
        } else if (count === 0) {
          room.matchState.countdown = 0;
          room.matchState.phase = 'fighting';
          io.to(room.roomCode).emit('countdown_tick', 'FIGHT!');
          clearInterval(countInterval);
          startAuthoritativeTick(room);
        }
      }, 1000);
    } else {
      io.to(room.roomCode).emit('rematch_status', {
        requesterId: socket.id,
        waitingForOther: true,
      });
    }
  });

  // Leave room or return to lobby
  socket.on('leave_room', () => {
    cleanupPlayerRoom(socket);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    cleanupPlayerRoom(socket);
  });
});

function cleanupPlayerRoom(socket) {
  const roomCode = socket.roomCode;
  if (!roomCode) return;

  const room = rooms.get(roomCode);
  if (!room) return;

  if (room.tickInterval) {
    clearInterval(room.tickInterval);
  }

  delete room.players[socket.id];
  const remainingPlayers = Object.values(room.players);

  if (remainingPlayers.length === 0) {
    // Delete empty room
    rooms.delete(roomCode);
    console.log(`Room ${roomCode} deleted`);
  } else {
    // Notify other player that opponent disconnected
    remainingPlayers[0].isHost = true;
    remainingPlayers[0].ready = false;
    room.state = 'waiting';
    room.matchState = null;

    io.to(roomCode).emit('opponent_disconnected', {
      message: 'Opponent disconnected from the match.',
      room: serializeRoom(room),
    });
  }
}

// 30 Hz Authoritative Combat Server Loop
function startAuthoritativeTick(room) {
  const dt = 1 / 30;

  if (room.tickInterval) clearInterval(room.tickInterval);

  room.tickInterval = setInterval(() => {
    const ms = room.matchState;
    if (!ms || ms.phase !== 'fighting') {
      clearInterval(room.tickInterval);
      return;
    }

    // Match Timer
    ms.matchTimer = Math.max(0, ms.matchTimer - dt);

    // Update Player 1 and Player 2 Physics & Actions
    updateServerPlayer(ms.p1, ms.p2, dt, ms);
    updateServerPlayer(ms.p2, ms.p1, dt, ms);

    // Update Projectiles
    updateServerProjectiles(ms, dt);

    // Check Win/Loss conditions
    if (ms.p1.health <= 0 || ms.p2.health <= 0 || ms.matchTimer <= 0) {
      const p1Won = ms.p1.health > ms.p2.health;
      const p2Won = ms.p2.health > ms.p1.health;
      if (p1Won) ms.p1RoundsWon = (ms.p1RoundsWon || 0) + 1;
      else if (p2Won) ms.p2RoundsWon = (ms.p2RoundsWon || 0) + 1;

      if ((ms.currentRound || 1) < (ms.totalRounds || 3)) {
        ms.currentRound = (ms.currentRound || 1) + 1;
        const cat1 = CAT_STATS[ms.p1.catId] || CAT_STATS.shadow;
        const cat2 = CAT_STATS[ms.p2.catId] || CAT_STATS.shadow;

        ms.p1.health = cat1.baseHealth;
        ms.p1.x = 260;
        ms.p1.y = 460;
        ms.p1.vx = 0;
        ms.p1.vy = 0;
        ms.p1.facing = 1;
        ms.p1.action = 'idle';
        ms.p1.cooldowns = {};
        ms.p1.statusEffects = [];

        ms.p2.health = cat2.baseHealth;
        ms.p2.x = 740;
        ms.p2.y = 460;
        ms.p2.vx = 0;
        ms.p2.vy = 0;
        ms.p2.facing = -1;
        ms.p2.action = 'idle';
        ms.p2.cooldowns = {};
        ms.p2.statusEffects = [];

        ms.projectiles = [];
        ms.matchTimer = 90;

        io.to(room.roomCode).emit('match_state_update', ms);
        return;
      }

      endMatch(room);
      return;
    }

    // Broadcast authoritative state snapshot
    io.to(room.roomCode).emit('match_state_update', ms);
  }, 1000 / 30);
}

function updateServerPlayer(p, opp, dt, ms) {
  const cat = CAT_STATS[p.catId] || CAT_STATS.shadow;

  // Process status effects
  for (let i = p.statusEffects.length - 1; i >= 0; i--) {
    const s = p.statusEffects[i];
    s.duration -= dt;
    if (s.type === 'burn') {
      s.tickTimer = (s.tickTimer || 0) + dt;
      if (s.tickTimer >= 0.5) {
        p.health = Math.max(0, p.health - (s.value || 2));
        s.tickTimer = 0;
      }
    }
    if (s.duration <= 0) {
      p.statusEffects.splice(i, 1);
    }
  }

  // Cooldowns
  for (const k in p.cooldowns) {
    if (p.cooldowns[k] > 0) p.cooldowns[k] = Math.max(0, p.cooldowns[k] - dt);
  }

  // Invulnerability
  if (p.invulnerableTimer > 0) {
    p.invulnerableTimer = Math.max(0, p.invulnerableTimer - dt);
    p.isInvulnerable = p.invulnerableTimer > 0;
  }

  // Action duration
  if (p.actionTimer > 0) {
    p.actionTimer = Math.max(0, p.actionTimer - dt);
    if (p.actionTimer <= 0) {
      p.action = p.isGrounded ? 'idle' : 'fall';
      p.isBlocking = false;
    }
  }

  // Combo timer
  if (p.comboTimer > 0) {
    p.comboTimer -= dt;
    if (p.comboTimer <= 0) p.comboCount = 0;
  }

  // Gravity
  if (!p.isGrounded) {
    p.vy += 1500 * dt;
    p.y += p.vy * dt;
    if (p.y >= 460) {
      p.y = 460;
      p.vy = 0;
      p.isGrounded = true;
    }
  }

  // Horizontal motion
  p.x += p.vx * dt;
  p.vx *= p.isGrounded ? 0.85 : 0.96;

  // Arena bounds
  if (p.x < 70) p.x = 70;
  if (p.x > 930) p.x = 930;

  // Auto-facing
  const isLocked =
    p.action === 'attack_basic' ||
    p.action === 'attack_heavy' ||
    p.action === 'skill_1' ||
    p.action === 'skill_2' ||
    p.action === 'ultimate';

  if (!isLocked && p.isGrounded) {
    p.facing = opp.x > p.x ? 1 : -1;
  }

  // Passive rage regen
  if (p.health <= p.maxHealth * 0.3) {
    p.rageActive = true;
    p.energy = Math.min(p.maxEnergy, p.energy + 4 * dt);
  }

  // Execute buffered keys
  const keys = p.currentKeys;
  if (!keys || p.action === 'hurt') return;

  // Ultimate
  if (keys.ultimate && p.energy >= 100 && !isLocked) {
    const ultSkill = SKILL_DATA[p.loadout.ultimate];
    if (ultSkill) {
      p.action = 'ultimate';
      p.actionTimer = 1.2;
      p.energy = 0;
      p.invulnerableTimer = 0.8;
      p.isInvulnerable = true;
      applyServerDamage(opp, p, ultSkill.damage, ultSkill.knockback || 450);
      return;
    }
  }

  // Defensive
  if (keys.defenseSkill && !isLocked) {
    const defSkill = SKILL_DATA[p.loadout.defensive];
    if (defSkill && (p.cooldowns[p.loadout.defensive] || 0) <= 0 && p.energy >= (defSkill.energyCost || 0)) {
      p.action = 'skill_defensive';
      p.actionTimer = defSkill.duration || 0.7;
      p.cooldowns[p.loadout.defensive] = defSkill.cooldown || 3.0;
      p.energy = Math.max(0, p.energy - (defSkill.energyCost || 0));
      p.isBlocking = true;
      if (p.loadout.defensive === 'energy_barrier') {
        p.isInvulnerable = true;
        p.invulnerableTimer = 1.2;
      }
      return;
    }
  }

  // Movement skill
  if (keys.movementSkill && !isLocked) {
    const movSkill = SKILL_DATA[p.loadout.movement];
    if (movSkill && (p.cooldowns[p.loadout.movement] || 0) <= 0 && p.energy >= (movSkill.energyCost || 0)) {
      p.action = 'skill_movement';
      p.actionTimer = movSkill.duration || 0.22;
      p.cooldowns[p.loadout.movement] = movSkill.cooldown || 2.5;
      p.energy = Math.max(0, p.energy - (movSkill.energyCost || 0));
      p.invulnerableTimer = 0.28;
      p.isInvulnerable = true;

      if (p.loadout.movement === 'shadow_teleport') {
        p.x = opp.x - p.facing * 90;
        p.facing = opp.x > p.x ? 1 : -1;
      } else {
        p.vx = p.facing * 680;
      }
      return;
    }
  }

  // Ability 1
  if (keys.ability1 && !isLocked) {
    const ab1 = SKILL_DATA[p.loadout.ability1];
    if (ab1 && (p.cooldowns[p.loadout.ability1] || 0) <= 0 && p.energy >= (ab1.energyCost || 0)) {
      p.action = 'skill_1';
      p.actionTimer = 0.45;
      p.cooldowns[p.loadout.ability1] = ab1.cooldown || 3.5;
      p.energy = Math.max(0, p.energy - (ab1.energyCost || 0));

      if (ab1.speed) {
        ms.projectiles.push({
          id: Math.random().toString(),
          ownerId: p.id,
          x: p.x + p.facing * 35,
          y: p.y - 25,
          vx: p.facing * ab1.speed,
          vy: 0,
          radius: ab1.radius || 16,
          damage: ab1.damage,
          element: ab1.element || 'neutral',
          duration: 1.2,
          knockback: ab1.knockback || 180,
          color: '#38bdf8',
        });
      } else {
        const dist = Math.abs(opp.x - p.x);
        if (dist < (ab1.range || 160)) {
          applyServerDamage(opp, p, ab1.damage, ab1.knockback || 200);
        }
      }
      return;
    }
  }

  // Ability 2
  if (keys.ability2 && !isLocked) {
    const ab2 = SKILL_DATA[p.loadout.ability2];
    if (ab2 && (p.cooldowns[p.loadout.ability2] || 0) <= 0 && p.energy >= (ab2.energyCost || 0)) {
      p.action = 'skill_2';
      p.actionTimer = 0.45;
      p.cooldowns[p.loadout.ability2] = ab2.cooldown || 4.5;
      p.energy = Math.max(0, p.energy - (ab2.energyCost || 0));

      if (ab2.speed) {
        ms.projectiles.push({
          id: Math.random().toString(),
          ownerId: p.id,
          x: p.x + p.facing * 35,
          y: p.y - 25,
          vx: p.facing * ab2.speed,
          vy: 0,
          radius: ab2.radius || 18,
          damage: ab2.damage,
          element: ab2.element || 'neutral',
          duration: 1.2,
          knockback: ab2.knockback || 180,
          color: '#ec4899',
        });
      } else {
        const dist = Math.abs(opp.x - p.x);
        if (dist < (ab2.range || 150)) {
          applyServerDamage(opp, p, ab2.damage, ab2.knockback || 200);
        }
      }
      return;
    }
  }

  // Heavy attack
  if (keys.heavyAttack && !isLocked) {
    p.action = 'attack_heavy';
    p.actionTimer = 0.55;
    const dist = Math.abs(opp.x - p.x);
    if (dist < 115 && (opp.x - p.x) * p.facing > 0) {
      applyServerDamage(opp, p, 24 * cat.attackPower, 360);
    }
    return;
  }

  // Basic attack
  if (keys.basicAttack && !isLocked) {
    p.action = 'attack_basic';
    p.actionTimer = 0.32;
    const dist = Math.abs(opp.x - p.x);
    if (dist < 95 && (opp.x - p.x) * p.facing > 0) {
      applyServerDamage(opp, p, 14 * cat.attackPower, 180);
    }
    return;
  }

  // Walk & Jump
  if (!isLocked) {
    if (keys.left) {
      p.vx = -cat.baseSpeed;
      p.facing = -1;
      if (p.isGrounded) p.action = 'walk';
    } else if (keys.right) {
      p.vx = cat.baseSpeed;
      p.facing = 1;
      if (p.isGrounded) p.action = 'walk';
    } else {
      if (p.isGrounded && p.action === 'walk') p.action = 'idle';
    }

    if (keys.jump && p.isGrounded) {
      p.vy = -650;
      p.isGrounded = false;
      p.action = 'jump';
    }
  }
}

function updateServerProjectiles(ms, dt) {
  for (let i = ms.projectiles.length - 1; i >= 0; i--) {
    const proj = ms.projectiles[i];
    proj.x += proj.vx * dt;
    proj.duration -= dt;

    const target = proj.ownerId === ms.p1.id ? ms.p2 : ms.p1;
    const attacker = proj.ownerId === ms.p1.id ? ms.p1 : ms.p2;

    const dist = Math.abs(proj.x - target.x);
    if (dist < proj.radius + 26) {
      applyServerDamage(target, attacker, proj.damage, proj.knockback || 180);
      ms.projectiles.splice(i, 1);
      continue;
    }

    if (proj.duration <= 0 || proj.x < 20 || proj.x > 980) {
      ms.projectiles.splice(i, 1);
    }
  }
}

function applyServerDamage(target, attacker, rawDamage, knockback) {
  if (target.isInvulnerable) {
    attacker.dodgesSucceeded += 1;
    target.energy = Math.min(target.maxEnergy, target.energy + 15);
    return;
  }

  const targetCat = CAT_STATS[target.catId] || CAT_STATS.shadow;
  let effectiveDamage = rawDamage * (1 - targetCat.defense);

  if (target.isBlocking || target.action === 'skill_defensive') {
    effectiveDamage *= 0.25;
    target.energy = Math.min(target.maxEnergy, target.energy + 12);
    target.health = Math.max(0, target.health - effectiveDamage);
    return;
  }

  // Perfect Counter stance
  if (target.action === 'skill_defensive' && target.loadout.defensive === 'counterattack') {
    applyServerDamage(attacker, target, 34, 400);
    return;
  }

  target.health = Math.max(0, target.health - effectiveDamage);
  target.action = 'hurt';
  target.actionTimer = 0.28;
  target.vx = attacker.facing * knockback;
  target.vy = -160;
  target.isGrounded = false;

  attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + 10);
  attacker.hitsLanded += 1;
  attacker.damageDealt += effectiveDamage;
  attacker.comboCount += 1;
  attacker.comboTimer = 1.6;
  if (attacker.comboCount > attacker.highestCombo) {
    attacker.highestCombo = attacker.comboCount;
  }
}

function endMatch(room) {
  const ms = room.matchState;
  if (!ms || ms.phase === 'finished') return;

  if (room.tickInterval) clearInterval(room.tickInterval);
  ms.phase = 'finished';

  let winnerId = null;
  let winnerName = 'Draw';
  let loserName = 'Draw';
  let winnerCat = ms.p1.catId;
  let loserCat = ms.p2.catId;

  const p1Wins = ms.p1RoundsWon || 0;
  const p2Wins = ms.p2RoundsWon || 0;

  if (p1Wins > p2Wins || (p1Wins === p2Wins && ms.p1.health > ms.p2.health)) {
    winnerId = ms.p1.id;
    winnerName = ms.p1.name;
    loserName = ms.p2.name;
    winnerCat = ms.p1.catId;
    loserCat = ms.p2.catId;
    ms.p1.action = 'victory';
    ms.p2.action = 'defeat';
  } else if (p2Wins > p1Wins || (p1Wins === p2Wins && ms.p2.health > ms.p1.health)) {
    winnerId = ms.p2.id;
    winnerName = ms.p2.name;
    loserName = ms.p1.name;
    winnerCat = ms.p2.catId;
    loserCat = ms.p1.catId;
    ms.p2.action = 'victory';
    ms.p1.action = 'defeat';
  }

  ms.stats = {
    winnerId,
    winnerName,
    loserName,
    winnerCat,
    loserCat,
    p1RoundsWon: p1Wins,
    p2RoundsWon: p2Wins,
    totalRounds: ms.currentRound || 3,
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

  io.to(room.roomCode).emit('match_finished', ms);
}

function serializeRoom(room) {
  return {
    roomCode: room.roomCode,
    hostId: room.hostId,
    players: room.players,
    arenaId: room.arenaId,
    state: room.state,
  };
}

const PORT = process.env.PORT || (process.argv.includes('--dev') ? 3001 : 3000);
server.listen(PORT, () => {
  console.log(`Cat Clash Server running on port ${PORT} [Mode: ${process.argv.includes('--dev') ? 'Dev' : 'Production'}]`);
});
