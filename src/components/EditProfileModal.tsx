import React, { useState, useEffect } from 'react';
import { UserProfile, CatId } from '../types/game';
import { CATS } from '../config/cats';
import { soundEngine } from '../audio/soundEngine';
import { X, Dices, Award, Trophy, Swords, Sparkles, Check, UserCheck } from 'lucide-react';

interface Props {
  profile: UserProfile;
  selectedCatId: CatId;
  onSave: (updatedProfile: UserProfile) => void;
  onClose: () => void;
}

const RANDOM_NAMES = [
  'ShadowClaw',
  'ThunderPaw',
  'FrostBite',
  'InfernoKitten',
  'NinjaWhisker',
  'IronPaws',
  'Meowruder',
  'PhantomTail',
  'BlazeTiger',
  'CyberPounce',
  'StormClaw',
  'NightStalker',
  'VoltFeline',
  'EmberFang',
  'KageNeko',
  'VenomPaws',
  'TitanWhiskers',
  'ZenithClaw',
];

export const EditProfileModal: React.FC<Props> = ({ profile, selectedCatId, onSave, onClose }) => {
  const [name, setName] = useState<string>(profile.name);
  const [error, setError] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const cat = CATS[selectedCatId] || CATS.shadow;
  const winRate = profile.matchesPlayed > 0 
    ? Math.round((profile.wins / profile.matchesPlayed) * 100) 
    : 0;

  const handleRandomize = () => {
    soundEngine.playClick();
    const available = RANDOM_NAMES.filter((n) => n !== name);
    const chosen = available[Math.floor(Math.random() * available.length)];
    setName(chosen);
    setError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setError('Fighter name must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 16) {
      setError('Fighter name cannot exceed 16 characters.');
      return;
    }
    // Allow alphanumeric, spaces, hyphens, underscores
    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
      setError('Only letters, numbers, hyphens, and spaces allowed.');
      return;
    }

    soundEngine.playClick();
    const updated = {
      ...profile,
      name: trimmed,
    };
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-game select-none">
      <div className="glass-panel-cyan clip-chamfer-lg border-2 border-cyan-400 w-full max-w-md shadow-[0_10px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/15 bg-[#0a0718]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 clip-chamfer bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="font-title font-bold text-[10px] text-cyan-400 uppercase tracking-widest block">
                FIGHTER IDENTITY DOSSIER
              </span>
              <h2 className="font-display font-black italic text-xl text-white mt-0.5">
                Player Profile
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-9 h-9 clip-chamfer glass-panel hover:glass-panel-cyan flex items-center justify-center text-neutral-400 hover:text-white transition arcade-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Avatar & Level Summary Plate */}
          <div className="flex items-center gap-4 p-3.5 clip-chamfer bg-[#070514] border border-white/10">
            <div
              className="w-14 h-14 clip-chamfer flex items-center justify-center text-2xl font-display font-black border-2 shadow-lg"
              style={{
                backgroundColor: `${cat.visual.primaryColor}25`,
                borderColor: cat.visual.primaryColor,
                color: cat.visual.primaryColor,
              }}
            >
              {name.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-sm text-white uppercase tracking-wider">
                  {name || 'Unknown Feline'}
                </span>
                <span className="font-title font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  LVL {profile.level}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-num text-neutral-400 mt-1">
                <span>{profile.wins}W / {profile.losses}L</span>
                <span className="text-cyan-400 font-bold">{winRate}% WIN RATE</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${((profile.xp % 300) / 300) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Name Input Field */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-title font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <span>Fighter Callsign (In-Game Name)</span>
              </label>
              <span className="font-num text-[11px] text-neutral-400">
                {name.length}/16
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={16}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter fighter name..."
                  autoFocus
                  className="w-full px-4 py-2.5 bg-[#090716] border border-cyan-500/50 clip-chamfer text-white font-title font-bold text-sm tracking-wider uppercase placeholder:text-neutral-600 focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300"
                />
              </div>

              {/* Randomize Button */}
              <button
                type="button"
                onClick={handleRandomize}
                className="px-3.5 py-2.5 clip-chamfer glass-panel hover:glass-panel-cyan border border-white/20 text-cyan-300 hover:text-white transition flex items-center gap-1.5 font-title font-bold text-xs uppercase arcade-btn"
                title="Generate Random Warrior Name"
              >
                <Dices size={16} />
                <span>Roll</span>
              </button>
            </div>

            {error && (
              <p className="font-title text-xs text-rose-400 tracking-wide animate-fade-in pt-1">
                ⚠️ {error}
              </p>
            )}
            <p className="text-[11px] text-neutral-400 font-game pt-1">
              Your name is persistent and will be displayed to online challengers and on your match victory cards.
            </p>
          </form>

          {/* Career Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 clip-chamfer bg-white/5 border border-white/10 text-center">
              <span className="text-[9px] font-title font-bold uppercase tracking-wider text-neutral-400 block">
                Total Bouts
              </span>
              <span className="font-num font-black text-base text-white">
                {profile.matchesPlayed}
              </span>
            </div>
            <div className="p-2.5 clip-chamfer bg-emerald-950/30 border border-emerald-500/30 text-center">
              <span className="text-[9px] font-title font-bold uppercase tracking-wider text-emerald-400 block">
                Victories
              </span>
              <span className="font-num font-black text-base text-emerald-300">
                {profile.wins}
              </span>
            </div>
            <div className="p-2.5 clip-chamfer bg-amber-950/30 border border-amber-500/30 text-center">
              <span className="text-[9px] font-title font-bold uppercase tracking-wider text-amber-400 block">
                Combat XP
              </span>
              <span className="font-num font-black text-base text-amber-300">
                {profile.xp}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="flex-1 py-2.5 clip-chamfer glass-panel hover:bg-white/10 text-neutral-300 font-title font-bold text-xs uppercase tracking-wider transition arcade-btn"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="flex-1 py-2.5 clip-chamfer bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-title font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.4)] arcade-btn"
            >
              {savedSuccess ? (
                <>
                  <Check size={16} className="text-black" />
                  <span>Callsign Saved!</span>
                </>
              ) : (
                <span>Confirm Callsign</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
