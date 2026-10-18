import React, { useState, useEffect } from 'react';
import { BotDifficulty } from '../engine/botAI';
import { CatId } from '../types/game';
import { CATS, CATS_LIST } from '../config/cats';
import { soundEngine } from '../audio/soundEngine';
import { CatHeroVisual } from './CatHeroVisual';
import {
  RotateCcw,
  Zap,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Target,
  Activity,
} from 'lucide-react';

interface Props {
  botDifficulty: BotDifficulty;
  setBotDifficulty: (diff: BotDifficulty) => void;
  botCatId: CatId;
  onChangeBotCat: (catId: CatId) => void;
  infiniteEnergy: boolean;
  setInfiniteEnergy: (val: boolean) => void;
  onResetCooldowns: () => void;
  onResetPositions: () => void;
  onExit: () => void;
  totalDamage: number;
  dps: number;
}

export const TrainingHUD: React.FC<Props> = ({
  botDifficulty,
  setBotDifficulty,
  botCatId,
  onChangeBotCat,
  infiniteEnergy,
  setInfiniteEnergy,
  onResetCooldowns,
  onResetPositions,
  onExit,
  totalDamage,
  dps,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Toggle drawer with 'KeyT'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyT') {
        soundEngine.playClick();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResetPositionsClick = () => {
    soundEngine.playClick();
    setIsRotating(true);
    onResetPositions();
    setTimeout(() => setIsRotating(false), 500);
  };

  return (
    <div
      className="fixed top-24 left-0 z-40 flex items-start transition-transform duration-300 pointer-events-auto font-game"
      style={{
        transform: isOpen ? 'translateX(0)' : 'translateX(-280px)',
      }}
    >
      {/* Main Drawer Panel */}
      <div
        className="clip-chamfer glass-panel-cyan border-2 border-cyan-500/40 p-4 space-y-4 shadow-2xl"
        style={{ width: '280px' }}
      >
        
        {/* Header Strip with Return to Menu */}
        <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-cyan-400" />
            <div>
              <div className="font-display font-black text-xs uppercase tracking-wider text-white">
                DOJO TELEMETRY
              </div>
              <div className="text-[9px] font-title text-neutral-400">Offline Sparring Protocol</div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onExit();
            }}
            className="p-1.5 clip-chamfer glass-panel hover:border-red-500 hover:text-red-400 text-neutral-400 transition"
            title="Return to Menu"
          >
            <ArrowLeft size={14} />
          </button>
        </div>

        {/* Bot AI Difficulty Segmented Control */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center font-title font-bold text-[10px] uppercase text-neutral-300">
            <span>Bot AI Protocol:</span>
            <span className="text-cyan-400">[{botDifficulty.toUpperCase()}]</span>
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 clip-chamfer bg-[#0a0718] border border-white/10">
            {(['dummy', 'easy', 'normal', 'hard'] as BotDifficulty[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  soundEngine.playClick();
                  setBotDifficulty(mode);
                }}
                className={`py-1 clip-chamfer text-[10px] uppercase font-title font-bold transition-all ${
                  botDifficulty === mode
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Sparring Opponent Selector Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-title font-bold uppercase tracking-wider text-neutral-300 block">
            Sparring Opponent:
          </span>
          <div className="grid grid-cols-6 gap-1">
            {CATS_LIST.map((c) => {
              const isSelected = botCatId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    soundEngine.playClick();
                    onChangeBotCat(c.id);
                  }}
                  className={`p-1 clip-chamfer transition-all relative flex items-center justify-center ${
                    isSelected
                      ? 'border-2 scale-105 z-10'
                      : 'border border-white/10 opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: isSelected ? c.visual.glowColor : 'rgba(255,255,255,0.1)',
                    backgroundColor: isSelected ? `${c.visual.glowColor}33` : '#0d091e',
                  }}
                  title={c.name}
                >
                  <CatHeroVisual catId={c.id} mode="badge" size="sm" glow={false} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Tactical Toggles: Infinite Energy & Reset CDs */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-title font-bold text-xs uppercase">
          <button
            onClick={() => {
              soundEngine.playClick();
              setInfiniteEnergy(!infiniteEnergy);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 clip-chamfer border transition-all ${
              infiniteEnergy
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-cyan-300 font-black'
                : 'glass-panel border-white/15 text-neutral-400 hover:text-white'
            }`}
          >
            <Zap size={14} />
            <span>Inf Energy</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onResetCooldowns();
            }}
            className="flex items-center justify-center gap-1.5 py-2 clip-chamfer glass-panel border border-white/15 hover:border-cyan-400 text-neutral-300 hover:text-white transition"
          >
            <RefreshCw size={14} />
            <span>Reset CDs</span>
          </button>
        </div>

        {/* Live Combat Telemetry Display */}
        <div className="p-2.5 clip-chamfer bg-[#090714] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-neutral-500 block uppercase font-title text-[9px] tracking-widest">TOTAL DMG</span>
            <span className="font-num text-lg font-bold text-white">{Math.round(totalDamage)}</span>
          </div>

          <div>
            <span className="text-neutral-500 block uppercase font-title text-[9px] tracking-widest">DPS</span>
            <span className="font-num text-lg font-bold text-cyan-300">{Math.round(dps)}/s</span>
          </div>

          <button
            onClick={handleResetPositionsClick}
            className={`p-2 clip-chamfer glass-panel hover:border-cyan-400 text-cyan-300 transition-all ${
              isRotating ? 'animate-spin' : ''
            }`}
            title="Reset Positions & Health"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Dock Tab Handle */}
      <button
        onClick={() => {
          soundEngine.playClick();
          setIsOpen(!isOpen);
        }}
        className="px-2 py-4 clip-skew-r glass-panel-cyan border-y-2 border-r-2 border-cyan-400 text-cyan-300 hover:text-white flex flex-col items-center gap-2 shadow-xl transition-all arcade-btn"
        title="Toggle Dojo Telemetry Drawer [T]"
      >
        <Sliders size={16} />
        <span className="[writing-mode:vertical-rl] font-display font-black text-[10px] tracking-widest uppercase">
          DOJO [T]
        </span>
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

    </div>
  );
};
