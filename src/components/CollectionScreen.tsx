import React, { useState } from 'react';
import { CatId, UserProfile } from '../types/game';
import { CATS, CATS_LIST } from '../config/cats';
import { soundEngine } from '../audio/soundEngine';
import { CatHeroVisual } from './CatHeroVisual';
import { ArrowLeft, Shield, Zap, Sparkles, Award, Flame, Wind } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onClose: () => void;
}

export const CollectionScreen: React.FC<Props> = ({ profile, onClose }) => {
  const [selectedCatId, setSelectedCatId] = useState<CatId>('shadow');
  const cat = CATS[selectedCatId] || CATS.shadow;

  const handleSelect = (id: CatId) => {
    soundEngine.playClick();
    setSelectedCatId(id);
  };

  const getDifficultyPips = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return '★☆☆☆☆ [EASY]';
      case 'medium':
        return '★★★☆☆ [MEDIUM]';
      case 'hard':
        return '★★★★★ [HARD]';
      default:
        return '★★★☆☆';
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#07060f] text-[#f4f4f0] flex flex-col p-4 md:p-8 animate-fade-in select-none font-game overflow-hidden">
      
      {/* Background Cyber Rain & Character Theme Glow */}
      <div className="ambient-rain z-0" />
      <div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[140px] opacity-25 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: cat.visual.glowColor }}
      />

      {/* Header Bar */}
      <header className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full pb-4 border-b border-white/15">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2.5 clip-chamfer glass-panel hover:glass-panel-cyan text-neutral-300 hover:text-cyan-300 transition-all arcade-btn"
            title="Return to Menu"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-title font-bold tracking-widest uppercase text-cyan-400">
              <Sparkles size={12} />
              <span>MARTIAL COMBATANT ARCHIVE</span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl italic tracking-tight text-white uppercase drop-shadow-md">
              Fighter Roster & Masteries
            </h1>
          </div>
        </div>

        {/* Player Profile Dossier */}
        <div className="hidden sm:flex items-center gap-3 p-2 clip-chamfer glass-panel border border-cyan-500/30 font-title text-xs">
          <span className="text-white font-bold">{profile.name}</span>
          <span className="text-neutral-500">|</span>
          <span className="text-amber-400 font-bold">RANK {profile.level}</span>
          <span className="text-neutral-500">|</span>
          <span className="text-neutral-300 font-num">{profile.wins}W - {profile.losses}L</span>
        </div>
      </header>

      {/* Main Showcase Layout */}
      <main className="relative z-10 max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center py-6">
        
        {/* LEFT COLUMN: HERO CHARACTER FULL POSE */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-full flex flex-col items-center">
            <CatHeroVisual
              key={selectedCatId}
              catId={selectedCatId}
              mode="hero"
              size="xl"
              showReflection={true}
              glow={true}
            />

            {/* Fighter Identity Banner */}
            <div
              className="-mt-6 relative z-20 text-center clip-chamfer glass-panel px-8 py-3 border-2"
              style={{
                borderColor: cat.visual.glowColor,
                boxShadow: `0 0 20px ${cat.visual.glowColor}40`,
              }}
            >
              <span className="font-title font-bold text-[10px] uppercase tracking-widest text-cyan-400 block">
                {cat.combatStyle}
              </span>
              <h2 className="font-display font-black text-3xl uppercase tracking-wider text-white">
                {cat.name}
              </h2>
              <p className="font-title italic text-xs text-neutral-400 mt-0.5">
                "{cat.title}"
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED SPECIMEN DOSSIER & ATTRIBUTES */}
        <div className="lg:col-span-7 flex flex-col gap-5 clip-chamfer-lg glass-panel p-6 md:p-8 border-2 border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="font-title font-bold text-xs uppercase tracking-widest text-cyan-400">
                COMBAT PROFILE
              </span>
              <div className="font-game text-xs text-neutral-300 mt-1 leading-relaxed max-w-xl">
                {cat.description}
              </div>
            </div>
            <div className="font-title font-bold text-xs text-amber-400 clip-chamfer bg-amber-950/60 border border-amber-400/40 px-3 py-1 shrink-0">
              {getDifficultyPips(cat.difficulty)}
            </div>
          </div>

          {/* Kinetic Attributes & Tuning */}
          <div className="space-y-3.5 bg-[#0a0718] p-4 clip-chamfer border border-white/10">
            <span className="text-[10px] font-title font-bold uppercase tracking-widest text-neutral-400 block">
              KINETIC SPECIFICATIONS
            </span>

            {/* Health */}
            <div className="space-y-1">
              <div className="flex justify-between font-title font-bold text-xs">
                <span className="text-neutral-300">Vitality (Base HP)</span>
                <span className="font-num text-emerald-400">{cat.baseHealth} HP</span>
              </div>
              <div className="w-full h-2.5 bg-[#140e2b] clip-skew-l overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-300"
                  style={{ width: `${(cat.baseHealth / 140) * 100}%` }}
                />
              </div>
            </div>

            {/* Speed */}
            <div className="space-y-1">
              <div className="flex justify-between font-title font-bold text-xs">
                <span className="text-neutral-300">Ground & Dash Velocity</span>
                <span className="font-num text-cyan-400">{cat.baseSpeed} px/s</span>
              </div>
              <div className="w-full h-2.5 bg-[#140e2b] clip-skew-l overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300"
                  style={{ width: `${(cat.baseSpeed / 420) * 100}%` }}
                />
              </div>
            </div>

            {/* Attack Multiplier */}
            <div className="space-y-1">
              <div className="flex justify-between font-title font-bold text-xs">
                <span className="text-neutral-300">Strike Multiplier</span>
                <span className="font-num text-amber-400">{cat.attackPower}x</span>
              </div>
              <div className="w-full h-2.5 bg-[#140e2b] clip-skew-l overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${(cat.attackPower / 1.3) * 100}%` }}
                />
              </div>
            </div>

            {/* Armor Mitigation */}
            <div className="space-y-1">
              <div className="flex justify-between font-title font-bold text-xs">
                <span className="text-neutral-300">Armor Mitigation</span>
                <span className="font-num text-purple-400">{Math.round(cat.defense * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#140e2b] clip-skew-l overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
                  style={{ width: `${(cat.defense / 0.3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Passive Ability Module */}
          <div className="p-4 clip-chamfer glass-panel border border-cyan-500/30 flex items-start gap-3">
            <div className="w-10 h-10 clip-chamfer bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <div className="font-title font-bold text-xs tracking-wider uppercase text-cyan-400">
                PASSIVE ABILITY // {cat.passive.name}
              </div>
              <p className="font-game text-xs text-neutral-300 mt-1 leading-relaxed">
                {cat.passive.description}
              </p>
            </div>
          </div>

          {/* Tactical Profile Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-title font-bold text-xs uppercase tracking-wider text-neutral-400 mr-2">
              Strengths:
            </span>
            {cat.strengths.map((str, idx) => (
              <span
                key={idx}
                className="px-3 py-1 clip-chamfer bg-[#100a24] border border-white/20 font-title font-bold text-xs uppercase text-neutral-200 tracking-wider shadow-sm"
              >
                ✦ {str}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* =========================================================================
          BOTTOM ROSTER SELECTION DOCK (6 FIGHTER TILES)
         ========================================================================= */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full pt-4 border-t border-white/15">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATS_LIST.map((c) => {
            const isSelected = selectedCatId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                className={`group relative p-2.5 clip-chamfer border transition-all text-left flex items-center gap-3 arcade-btn ${
                  isSelected
                    ? 'glass-panel-cyan border-2 scale-105 z-10'
                    : 'glass-panel border-white/10 hover:border-white/30 opacity-70 hover:opacity-100 hover:scale-102'
                }`}
                style={{
                  borderColor: isSelected ? c.visual.glowColor : undefined,
                  boxShadow: isSelected ? `0 0 16px ${c.visual.glowColor}66` : undefined,
                }}
              >
                {/* Bouncing P1 Marker on selected fighter */}
                {isSelected && (
                  <div className="absolute -top-2.5 left-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-display font-black text-[9px] px-1.5 py-0.2 clip-skew-l shadow-md animate-bounce">
                    P1
                  </div>
                )}

                {/* Portrait Thumbnail */}
                <div className="w-12 h-12 shrink-0 clip-chamfer flex items-center justify-center bg-[#070512] border border-white/10">
                  <CatHeroVisual catId={c.id} mode="portrait" size="sm" glow={false} />
                </div>

                {/* Nameplate & Role */}
                <div className="overflow-hidden">
                  <div className="font-display font-bold text-xs uppercase text-white truncate group-hover:text-cyan-300 transition-colors">
                    {c.name}
                  </div>
                  <div className="font-title text-[10px] uppercase text-neutral-400 truncate">
                    {c.combatStyle.split('&')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </footer>

    </div>
  );
};
