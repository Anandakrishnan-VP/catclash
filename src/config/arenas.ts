import { ArenaDef, ArenaId } from '../types/game';

export const ARENAS: Record<ArenaId, ArenaDef> = {
  rooftop: {
    id: 'rooftop',
    name: 'Neon Rooftop',
    theme: 'Cyberpunk Metropolis',
    description: 'A rain-slick skyscraper roof in a futuristic neon city bathed in synthwave holographic glow.',
    groundY: 460,
    leftBound: 60,
    rightBound: 940,
    bgColors: ['#09090b', '#18182b', '#2e1065'],
    accentColor: '#38bdf8',
    particleType: 'rain',
  },

  forest: {
    id: 'forest',
    name: 'Magical Forest',
    theme: 'Mystic Spores & Willow Glow',
    description: 'An ancient enchanted woodland overgrown with bioluminescent mushrooms and floating ethereal wisp spores.',
    groundY: 460,
    leftBound: 60,
    rightBound: 940,
    bgColors: ['#022c22', '#064e3b', '#042f2e'],
    accentColor: '#34d399',
    particleType: 'spores',
  },

  temple: {
    id: 'temple',
    name: 'Frozen Temple',
    theme: 'Glacial Monolith Ruins',
    description: 'An arctic shrine atop a frozen mountain peak with crystalline icicles, icy pillars, and drifting blizzards.',
    groundY: 460,
    leftBound: 60,
    rightBound: 940,
    bgColors: ['#082f49', '#0c4a6e', '#1e3a8a'],
    accentColor: '#7dd3fc',
    particleType: 'snow',
  },

  volcano: {
    id: 'volcano',
    name: 'Volcanic Arena',
    theme: 'Infernal Magma Fissures',
    description: 'A jagged obsidian plateau floating above raging rivers of molten lava with rising glowing fire embers.',
    groundY: 460,
    leftBound: 60,
    rightBound: 940,
    bgColors: ['#450a0a', '#7f1d1d', '#290707'],
    accentColor: '#f97316',
    particleType: 'embers',
  },
};

export const ARENAS_LIST = Object.values(ARENAS);
