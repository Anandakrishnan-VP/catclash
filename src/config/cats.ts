import { CatDef, CatId } from '../types/game';

export const CATS: Record<CatId, CatDef> = {
  shadow: {
    id: 'shadow',
    name: 'Kareepucha',
    title: 'The Umbral Assassin',
    combatStyle: 'Assassin & Evasion',
    description: 'Slips between the folds of darkness. Fast, lethal, and elusive with deadly teleportation and quick-claw strikes.',
    baseHealth: 95,
    baseSpeed: 380,
    attackPower: 1.15,
    defense: 0.05,
    difficulty: 'Medium',
    strengths: ['High Mobility', 'Shadow Teleportation', 'Flurry Combos'],
    icon: '🐈‍⬛',
    badge: '🔮 SHADOW',
    badgeBg: '#7e22ce',
    visual: {
      primaryColor: '#1e1b4b', // deep obsidian purple-black
      secondaryColor: '#312e81',
      eyeColor: '#c084fc', // glowing neon violet
      glowColor: '#a855f7',
      bellyColor: '#2e1065',
      earInnerColor: '#c084fc',
      particleColor: '#c084fc',
    },
    passive: {
      name: 'Shadow Step',
      description: 'Dodging through attacks generates +10 bonus energy and grants 15% bonus movement speed for 2 seconds.',
    },
    defaultLoadout: {
      basic: 'claw_slash',
      ability1: 'shadow_projectile',
      ability2: 'gravity_paw',
      movement: 'shadow_teleport',
      defensive: 'counterattack',
      ultimate: 'shadow_realm',
    },
  },

  thunder: {
    id: 'thunder',
    name: 'Thunder Cat',
    title: 'The Electric Striker',
    combatStyle: 'Speed & Electricity',
    description: 'Crackles with raw high-voltage electricity. Dominates with blinding speed, lightning dashes, and stuns.',
    baseHealth: 90,
    baseSpeed: 410,
    attackPower: 1.1,
    defense: 0.0,
    difficulty: 'Hard',
    strengths: ['Fastest Attack Speed', 'Shock Stuns', 'Chain Combos'],
    icon: '⚡',
    badge: '⚡ THUNDER',
    badgeBg: '#ca8a04',
    visual: {
      primaryColor: '#eab308', // electric gold yellow
      secondaryColor: '#ca8a04',
      eyeColor: '#67e8f9', // electric cyan eyes
      glowColor: '#facc15',
      bellyColor: '#fef08a',
      earInnerColor: '#fef9c3',
      particleColor: '#fef08a',
    },
    passive: {
      name: 'Static Charge',
      description: 'Every 3rd hit inflicts an electrostatic jolt that shocks the opponent for extra damage and brief interrupt.',
    },
    defaultLoadout: {
      basic: 'dual_fang',
      ability1: 'lightning_bolt',
      ability2: 'electric_stun',
      movement: 'cat_dash',
      defensive: 'paw_shield',
      ultimate: 'thunderstorm_fury',
    },
  },

  frost: {
    id: 'frost',
    name: 'Frost Cat',
    title: 'The Glacial Sovereign',
    combatStyle: 'Control & Freezing',
    description: 'Commands ancient sub-zero frost magic. Freezes opponents in place and controls the battlefield with ice crystals.',
    baseHealth: 100,
    baseSpeed: 330,
    attackPower: 1.0,
    defense: 0.15,
    difficulty: 'Medium',
    strengths: ['Crowd Control', 'Freezing Traps', 'Ranged Piercing'],
    icon: '❄️',
    badge: '❄️ FROST',
    badgeBg: '#0284c7',
    visual: {
      primaryColor: '#e0f2fe', // crystalline arctic white-blue
      secondaryColor: '#7dd3fc',
      eyeColor: '#0284c7', // deep glacial blue
      glowColor: '#38bdf8',
      bellyColor: '#f0f9ff',
      earInnerColor: '#bae6fd',
      particleColor: '#7dd3fc',
    },
    passive: {
      name: 'Chilled Touch',
      description: 'Hitting enemies slows their attack animations and movement by 20% for 2.5 seconds.',
    },
    defaultLoadout: {
      basic: 'claw_slash',
      ability1: 'ice_shard',
      ability2: 'ice_trap',
      movement: 'cat_dash',
      defensive: 'energy_barrier',
      ultimate: 'absolute_zero',
    },
  },

  fire: {
    id: 'fire',
    name: 'Fire Cat',
    title: 'The Blazing Scourge',
    combatStyle: 'High Damage & Burn',
    description: 'A fiery predator whose paws ignite with untamed dragon flames. Excels at high burst damage and sustained burn.',
    baseHealth: 105,
    baseSpeed: 340,
    attackPower: 1.25,
    defense: 0.1,
    difficulty: 'Easy',
    strengths: ['Tremendous Burst Damage', 'Burn Over Time', 'Screen Pressure'],
    icon: '🔥',
    badge: '🔥 INFERNO',
    badgeBg: '#dc2626',
    visual: {
      primaryColor: '#ea580c', // blazing flame orange-red
      secondaryColor: '#c2410c',
      eyeColor: '#fef08a', // fiery amber glow
      glowColor: '#f97316',
      bellyColor: '#ffedd5',
      earInnerColor: '#fed7aa',
      particleColor: '#ef4444',
    },
    passive: {
      name: 'Scorching Claws',
      description: 'All claw strikes and abilities ignite targets, inflicting fire damage ticks over 3 seconds.',
    },
    defaultLoadout: {
      basic: 'heavy_paw',
      ability1: 'fireball',
      ability2: 'spin_attack',
      movement: 'cat_dash',
      defensive: 'counterattack',
      ultimate: 'inferno_cataclysm',
    },
  },

  ninja: {
    id: 'ninja',
    name: 'Ninja Cat',
    title: 'The Shinobi Phantom',
    combatStyle: 'Combos & Deception',
    description: 'Trained in secretive feline martial arts. Uses smoke decoys, kunai volleys, and blinding combo strikes.',
    baseHealth: 90,
    baseSpeed: 390,
    attackPower: 1.1,
    defense: 0.05,
    difficulty: 'Hard',
    strengths: ['Smoke Clones', 'Multi-Kunai Volleys', 'Infinite Combo Flow'],
    icon: '🥷',
    badge: '🗡️ SHINOBI',
    badgeBg: '#059669',
    visual: {
      primaryColor: '#0f172a', // midnight stealth black
      secondaryColor: '#334155',
      eyeColor: '#22c55e', // ninja emerald green
      glowColor: '#4ade80',
      bellyColor: '#1e293b',
      earInnerColor: '#ef4444', // red shinobi ear trim
      particleColor: '#22c55e',
    },
    passive: {
      name: 'Shinobi Decoy',
      description: 'When taking fatal damage or performing a perfect dodge, leaves a smoke puff decoy and recovers 25 energy.',
    },
    defaultLoadout: {
      basic: 'dual_fang',
      ability1: 'kunai_flurry',
      ability2: 'smoke_bomb',
      movement: 'air_dash',
      defensive: 'smoke_escape',
      ultimate: 'thousand_paw_strike',
    },
  },

  tank: {
    id: 'tank',
    name: 'Tank Cat',
    title: 'The Iron Paw Behemoth',
    combatStyle: 'Defense & Knockback',
    description: 'A colossal Maine Coon juggernaut. Unmatched physical bulk, heavy ground shockwaves, and impenetrable defenses.',
    baseHealth: 140,
    baseSpeed: 280,
    attackPower: 1.2,
    defense: 0.25,
    difficulty: 'Easy',
    strengths: ['Massive Health Pool', '25% Damage Reduction', 'Heavy Knockback'],
    icon: '🦁',
    badge: '🛡️ BEHEMOTH',
    badgeBg: '#b45309',
    visual: {
      primaryColor: '#78350f', // heavy russet brindle
      secondaryColor: '#451a03',
      eyeColor: '#f59e0b', // fierce amber
      glowColor: '#d97706',
      bellyColor: '#fef3c7',
      earInnerColor: '#d97706',
      particleColor: '#f59e0b',
    },
    passive: {
      name: 'Unshakable Bulk',
      description: 'Possesses 25% innate damage reduction and cannot be knocked back while executing attacks or defending.',
    },
    defaultLoadout: {
      basic: 'heavy_paw',
      ability1: 'ground_slam',
      ability2: 'spin_attack',
      movement: 'cat_dash',
      defensive: 'paw_shield',
      ultimate: 'catastrophic_slam',
    },
  },
};

export const CATS_LIST = Object.values(CATS);
