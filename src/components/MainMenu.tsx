import React, { useState, useEffect } from 'react';
import { CatId, UserProfile } from '../types/game';
import { CATS, CATS_LIST } from '../config/cats';
import { soundEngine } from '../audio/soundEngine';
import { CatHeroVisual } from './CatHeroVisual';
import {
  Swords,
  Radio,
  Target,
  BookOpen,
  Volume2,
  VolumeX,
  Settings,
  ChevronRight,
  X,
  Sparkles,
  Zap,
  Edit3,
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  selectedCatId: CatId;
  onSelectCat: (id: CatId) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onStartTraining: () => void;
  onOpenCollection: () => void;
  onOpenSettings: () => void;
  onEditProfile: () => void;
}

export const MainMenu: React.FC<Props> = ({
  profile,
  selectedCatId,
  onSelectCat,
  onCreateRoom,
  onJoinRoom,
  onStartTraining,
  onOpenCollection,
  onOpenSettings,
  onEditProfile,
}) => {
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [joinError, setJoinError] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.isMuted);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const cat = CATS[selectedCatId] || CATS.shadow;

  const menuItems = [
    {
      title: 'Host Private Bout',
      subtitle: 'Create an authoritative 1v1 peer session',
      icon: <Swords size={22} className="text-cyan-400 group-hover:text-white transition-colors" />,
      hotkey: '[1]',
      action: () => {
        soundEngine.playClick();
        onCreateRoom();
      },
    },
    {
      title: 'Enter Room Code',
      subtitle: 'Join an active challenger frequency',
      icon: <Radio size={22} className="text-magenta-400 group-hover:text-white transition-colors" />,
      hotkey: '[2]',
      action: () => {
        soundEngine.playClick();
        setShowJoinModal(true);
      },
    },
    {
      title: 'Offline Training Dojo',
      subtitle: 'Autonomous AI sparring & combo damage lab',
      icon: <Target size={22} className="text-amber-400 group-hover:text-white transition-colors" />,
      hotkey: '[3]',
      action: () => {
        soundEngine.playClick();
        onStartTraining();
      },
    },
    {
      title: 'Combatant Archive',
      subtitle: 'Techniques, custom loadouts & win records',
      icon: <BookOpen size={22} className="text-purple-400 group-hover:text-white transition-colors" />,
      hotkey: '[4]',
      action: () => {
        soundEngine.playClick();
        onOpenCollection();
      },
    },
  ];

  // Keyboard navigation for menu options
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showJoinModal) return;

      if (e.key === 'ArrowDown') {
        soundEngine.playClick();
        setFocusedIndex((prev) => (prev + 1) % menuItems.length);
      } else if (e.key === 'ArrowUp') {
        soundEngine.playClick();
        setFocusedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (e.key === 'Enter') {
        menuItems[focusedIndex]?.action();
      } else if (e.key === '1') {
        menuItems[0].action();
      } else if (e.key === '2') {
        menuItems[1].action();
      } else if (e.key === '3') {
        menuItems[2].action();
      } else if (e.key === '4') {
        menuItems[3].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, showJoinModal]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      setJoinError('Please enter a valid room code.');
      return;
    }
    soundEngine.playClick();
    onJoinRoom(joinCodeInput.trim().toUpperCase());
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#07060f] text-[#f4f4f0] flex flex-col justify-between p-4 md:p-8 select-none font-game overflow-hidden">
      
      {/* =========================================================================
          BACKGROUND PARALLAX CITYSCAPE & AMBIENT RAIN
         ========================================================================= */}
      <div className="ambient-rain z-0" />

      {/* Cyber City Skyline Silhouette with Neon Windows */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-25">
        <svg viewBox="0 0 1200 600" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="skylineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1035" />
              <stop offset="100%" stopColor="#07060f" />
            </linearGradient>
          </defs>
          <path d="M0,600 L0,380 L80,380 L80,310 L150,310 L150,420 L240,420 L240,260 L320,260 L320,450 L400,450 L400,200 L490,200 L490,480 L580,480 L580,290 L680,290 L680,440 L770,440 L770,220 L860,220 L860,490 L950,490 L950,330 L1040,330 L1040,410 L1120,410 L1120,270 L1200,270 L1200,600 Z" fill="url(#skylineGrad)" />
        </svg>
      </div>

      {/* =========================================================================
          HEADER BAR: USER PROFILE PLATE & GLOBAL UTILITIES
         ========================================================================= */}
      <header className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full">
        {/* User Profile Card (Clickable to Edit Callsign) */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onEditProfile();
          }}
          className="group flex items-center gap-3 p-2 clip-chamfer glass-panel border border-cyan-500/30 hover:border-cyan-400 hover:glass-panel-cyan transition-all text-left arcade-btn"
          title="Click to edit fighter callsign / profile"
        >
          <div className="relative w-10 h-10 clip-chamfer bg-cyan-950/80 border border-cyan-400 flex items-center justify-center font-display font-black text-cyan-300 group-hover:scale-105 transition-transform">
            {profile.name.charAt(0).toUpperCase()}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[9px] shadow-sm">
              <Edit3 size={10} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-title font-bold text-sm tracking-wider uppercase text-white truncate max-w-[130px] group-hover:text-cyan-300 transition-colors">
                {profile.name}
              </span>
              <span className="font-title font-bold text-[10px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                LVL {profile.level}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-num text-neutral-400 mt-0.5">
              <span>{profile.wins}W — {profile.losses}L</span>
              <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400"
                  style={{ width: `${((profile.xp % 300) / 300) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </button>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleMute}
            className="w-10 h-10 rounded-full glass-panel hover:glass-panel-cyan flex items-center justify-center text-neutral-300 hover:text-cyan-300 transition-all arcade-btn"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-full glass-panel hover:glass-panel-cyan flex items-center justify-center text-neutral-300 hover:text-cyan-300 transition-all arcade-btn"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN FIGHTING GAME LAYOUT (LOGO + BUTTONS ON LEFT, HERO ON RIGHT)
         ========================================================================= */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full my-auto py-4">
        
        {/* LEFT COLUMN: LOGO LOCKUP & 4 ACTION BUTTONS */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          
          {/* Logo Lockup */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 clip-chamfer bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 font-title font-bold text-[10px] tracking-widest uppercase">
              <Zap size={12} className="text-yellow-400" />
              <span>REAL-TIME 1V1 FELINE MARTIAL ARTS</span>
            </div>

            {/* Giant Title with Claw Slash Accent */}
            <div className="relative">
              <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_4px_16px_rgba(34,211,238,0.4)]">
                CAT CLASH
              </h1>
              {/* Slashing Claw Streak Accent */}
              <div className="absolute -bottom-1 left-0 w-48 h-1 bg-gradient-to-r from-magenta-500 via-pink-400 to-transparent shadow-[0_0_12px_rgba(255,45,149,0.8)]" />
            </div>

            <p className="font-game text-xs md:text-sm text-neutral-300 tracking-wide pt-1">
              Authoritatively synchronized physics duel with fluid cancels, directional dashes, and elemental arts.
            </p>
          </div>

          {/* 4 Large Angled Arcade Buttons */}
          <div className="space-y-3 pt-2">
            {menuItems.map((item, idx) => {
              const isSelected = focusedIndex === idx;
              return (
                <button
                  key={item.title}
                  onClick={item.action}
                  onMouseEnter={() => {
                    soundEngine.playClick();
                    setFocusedIndex(idx);
                  }}
                  className={`group w-full flex items-center justify-between p-4 clip-chamfer border transition-all text-left arcade-btn ${
                    isSelected
                      ? 'glass-panel-cyan border-cyan-400 translate-x-2 text-white'
                      : 'glass-panel border-white/10 hover:border-white/30 text-neutral-200 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon container */}
                    <div
                      className={`w-12 h-12 clip-chamfer flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.7)]'
                          : 'bg-[#0f0b20] border border-white/15'
                      }`}
                    >
                      {item.icon}
                    </div>
                    {/* Text block */}
                    <div>
                      <div className="font-display font-black text-lg md:text-xl tracking-wide uppercase group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </div>
                      <div className="font-game text-xs text-neutral-400 group-hover:text-neutral-200">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Hotkey hint & animated chevron */}
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-neutral-500 group-hover:text-cyan-400">
                      {item.hotkey}
                    </span>
                    <ChevronRight
                      size={20}
                      className={`transition-transform duration-200 ${
                        isSelected
                          ? 'text-cyan-300 translate-x-1'
                          : 'text-neutral-600 group-hover:text-neutral-300'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: HERO CHARACTER SHOWCASE */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
          
          {/* Hero Figure with Breathing Animation & Floor Reflection */}
          <div className="relative w-full flex flex-col items-center">
            <CatHeroVisual
              catId={selectedCatId}
              mode="hero"
              size="xl"
              showReflection={true}
              glow={true}
            />

            {/* Fighter Nameplate Dossier */}
            <div className="-mt-5 relative z-20 text-center glass-panel-cyan clip-chamfer px-6 py-2.5 border">
              <span className="font-title font-bold text-[10px] uppercase tracking-widest text-cyan-400 block">
                {cat.combatStyle}
              </span>
              <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white">
                {cat.name}
              </h2>
              <span className="font-title italic text-xs text-neutral-400">
                "{cat.title}"
              </span>
            </div>
          </div>

          {/* Quick Roster Selector Strip */}
          <div className="flex items-center gap-2 p-1.5 clip-chamfer glass-panel border border-white/15">
            {CATS_LIST.map((c) => {
              const isCatSelected = selectedCatId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectCat(c.id);
                  }}
                  className={`w-11 h-11 clip-chamfer transition-all relative flex items-center justify-center ${
                    isCatSelected
                      ? 'border-2 scale-110 shadow-lg'
                      : 'border border-white/10 opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{
                    borderColor: isCatSelected ? c.visual.glowColor : 'rgba(255,255,255,0.1)',
                    backgroundColor: isCatSelected ? `${c.visual.glowColor}25` : '#0d091e',
                  }}
                  title={`${c.name} (${c.combatStyle})`}
                >
                  <CatHeroVisual catId={c.id} mode="badge" size="sm" glow={false} />
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* =========================================================================
          FOOTER BAR: METRICS & NETCODE TELEMETRY
         ========================================================================= */}
      <footer className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full pt-4 border-t border-white/10 text-xs font-title tracking-wider text-neutral-400">
        <div>
          <span>CAT CLASH // VERSION 1.4.0</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-mono uppercase text-[11px]">30Hz Synchronized Netcode Active</span>
        </div>
      </footer>

      {/* =========================================================================
          ROOM CODE MODAL
         ========================================================================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-game">
          <div className="glass-panel-cyan clip-chamfer-lg p-6 max-w-md w-full border-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-title font-bold text-xs uppercase tracking-widest text-cyan-400 block">
                  NETWORK CONNECTION
                </span>
                <h3 className="text-2xl font-display font-black text-white">ENTER ROOM CODE</h3>
              </div>
              <button
                onClick={() => setShowJoinModal(false)}
                className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => {
                  setJoinCodeInput(e.target.value.toUpperCase());
                  setJoinError('');
                }}
                placeholder="E.G. CAT-4ZJF"
                maxLength={10}
                autoFocus
                className="w-full px-4 py-3 clip-chamfer bg-[#070512] border-2 border-cyan-400/50 text-white font-num font-bold text-center text-2xl tracking-widest focus:border-cyan-400 focus:outline-none"
              />

              {joinError && (
                <div className="text-red-400 text-xs font-bold text-center">
                  {joinError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 clip-chamfer glass-panel text-neutral-300 font-title font-bold text-sm tracking-wider uppercase hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 clip-chamfer bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-sm tracking-wider uppercase arcade-btn"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
