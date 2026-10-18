export type CatId = 'shadow' | 'thunder' | 'frost' | 'fire' | 'ninja' | 'tank';

export type SkillCategory = 'offensive' | 'movement' | 'defensive' | 'control' | 'ultimate';

export type SkillSlot = 'basic' | 'ability1' | 'ability2' | 'movement' | 'defensive' | 'ultimate';

export interface StatusEffect {
  type: 'frozen' | 'burn' | 'slow' | 'stun';
  duration: number; // in seconds
  value?: number;   // e.g. slow percentage or burn damage per tick
  tickTimer?: number;
}

export interface SkillDef {
  id: string;
  name: string;
  category: SkillCategory;
  slotAllowed: SkillSlot;
  icon: string;
  description: string;
  damage: number;
  cooldown: number; // in seconds
  energyCost: number;
  range: number;
  startup: number; // seconds of windup
  duration: number; // seconds of active hitbox
  recovery: number; // seconds after action
  knockback: number;
  projectile?: {
    speed: number;
    radius: number;
    element: 'fire' | 'ice' | 'lightning' | 'shadow' | 'ninja' | 'neutral';
    gravity?: number;
    piercing?: boolean;
    duration: number;
  };
  statusEffect?: {
    type: 'frozen' | 'burn' | 'slow' | 'stun';
    duration: number;
    value?: number;
  };
  color: string;
  unlockedByDefault: boolean;
}

export interface CatDef {
  id: CatId;
  name: string;
  title: string;
  combatStyle: string;
  description: string;
  baseHealth: number;
  baseSpeed: number;
  attackPower: number;
  defense: number; // 0 to 1 reduction
  difficulty: 'Easy' | 'Medium' | 'Hard';
  strengths: string[];
  icon: string;
  badge: string;
  badgeBg: string;
  visual: {
    primaryColor: string;
    secondaryColor: string;
    eyeColor: string;
    glowColor: string;
    bellyColor: string;
    earInnerColor: string;
    particleColor: string;
  };
  passive: {
    name: string;
    description: string;
  };
  defaultLoadout: PlayerLoadout;
}

export interface PlayerLoadout {
  basic: string;
  ability1: string;
  ability2: string;
  movement: string;
  defensive: string;
  ultimate: string;
}

export type ActionState =
  | 'idle'
  | 'walk'
  | 'jump'
  | 'fall'
  | 'dash'
  | 'attack_basic'
  | 'attack_heavy'
  | 'skill_1'
  | 'skill_2'
  | 'skill_movement'
  | 'skill_defensive'
  | 'ultimate'
  | 'hurt'
  | 'blocking'
  | 'knockback'
  | 'victory'
  | 'defeat';

export interface PlayerState {
  id: string;
  name: string;
  catId: CatId;
  skinId?: string;
  loadout: PlayerLoadout;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 1 | -1; // 1 = right, -1 = left
  action: ActionState;
  actionTimer: number;
  actionDuration: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  cooldowns: Record<string, number>; // skillId -> remaining seconds
  isBlocking: boolean;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  comboCount: number;
  comboTimer: number;
  highestCombo: number;
  damageDealt: number;
  hitsLanded: number;
  dodgesSucceeded: number;
  statusEffects: StatusEffect[];
  rageActive: boolean;
  animFrame: number;
}

export interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  element: 'fire' | 'ice' | 'lightning' | 'shadow' | 'ninja' | 'neutral';
  duration: number;
  knockback: number;
  piercing?: boolean;
  statusEffect?: StatusEffect;
  color: string;
}

export type ArenaId = 'rooftop' | 'forest' | 'temple' | 'volcano';

export interface ArenaDef {
  id: ArenaId;
  name: string;
  theme: string;
  description: string;
  groundY: number;
  leftBound: number;
  rightBound: number;
  bgColors: [string, string, string];
  platformY?: number;
  accentColor: string;
  particleType: 'rain' | 'spores' | 'snow' | 'embers';
}

export type MatchPhase = 'lobby' | 'countdown' | 'fighting' | 'finished';

export interface MatchStats {
  winnerId: string | null;
  winnerName: string;
  loserName: string;
  winnerCat: CatId;
  loserCat: CatId;
  matchDuration: number;
  p1RoundsWon?: number;
  p2RoundsWon?: number;
  totalRounds?: number;
  roundHistory?: Array<{ round: number; winnerId: string | null; winnerName: string }>;
  p1Stats: {
    damageDealt: number;
    hitsLanded: number;
    highestCombo: number;
    dodgesSucceeded: number;
  };
  p2Stats: {
    damageDealt: number;
    hitsLanded: number;
    highestCombo: number;
    dodgesSucceeded: number;
  };
}

export interface MatchState {
  roomCode: string;
  arenaId: ArenaId;
  phase: MatchPhase;
  countdown: number;
  matchTimer: number;
  p1: PlayerState;
  p2: PlayerState;
  projectiles: Projectile[];
  clashEffect?: { x: number; y: number; timer: number };
  stats?: MatchStats;
  currentRound?: number;
  totalRounds?: number;
  p1RoundsWon?: number;
  p2RoundsWon?: number;
  roundPhase?: 'round_intro' | 'fighting' | 'round_ko' | 'match_over';
  roundBanner?: {
    title: string;
    subtitle?: string;
    isFinal?: boolean;
    flash?: boolean;
  };
}

export interface RoomPlayer {
  id: string;
  socketId: string;
  name: string;
  catId: CatId;
  loadout: PlayerLoadout;
  ready: boolean;
  isHost: boolean;
  rematchRequested?: boolean;
  disconnected?: boolean;
}

export interface RoomData {
  roomCode: string;
  hostId: string;
  players: Record<string, RoomPlayer>;
  arenaId: ArenaId;
  state: 'waiting' | 'selecting' | 'in_match' | 'match_end';
  matchState?: MatchState;
}

export interface UserProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  unlockedSkins: string[];
  history: Array<{
    date: string;
    result: 'VICTORY' | 'DEFEAT';
    opponent: string;
    catUsed: CatId;
    duration: string;
  }>;
}

export interface ControlKeys {
  left: boolean;
  right: boolean;
  jump: boolean;
  down: boolean;
  basicAttack: boolean;
  heavyAttack: boolean;
  ability1: boolean;
  ability2: boolean;
  movementSkill: boolean;
  defenseSkill: boolean;
  ultimate: boolean;
}
