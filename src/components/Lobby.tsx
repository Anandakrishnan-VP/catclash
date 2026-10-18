import React, { useState } from 'react';
import { ArenaId, CatId, PlayerLoadout, RoomData } from '../types/game';
import { CATS, CATS_LIST } from '../config/cats';
import { ARENAS, ARENAS_LIST } from '../config/arenas';
import { socketClient } from '../network/socketClient';
import { soundEngine } from '../audio/soundEngine';
import { SkillSelectionModal } from './SkillSelectionModal';
import { CatHeroVisual } from './CatHeroVisual';
import {
  Copy,
  Check,
  Sliders,
  ArrowLeft,
  Play,
  Lock,
  Radio,
  Zap,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface Props {
  roomData: RoomData;
  localPlayerId: string;
  onStartMatch: () => void;
  onLeaveRoom: () => void;
}

export const Lobby: React.FC<Props> = ({ roomData, localPlayerId, onStartMatch, onLeaveRoom }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showLoadoutModal, setShowLoadoutModal] = useState<boolean>(false);
  const [showArenaPicker, setShowArenaPicker] = useState<boolean>(false);

  const players = Object.values(roomData.players);
  const p1 = players[0];
  const p2 = players.length > 1 ? players[1] : null;

  const isLocalHost = p1?.socketId === localPlayerId;
  const localPlayer = players.find((p) => p.socketId === localPlayerId) || p1;

  const bothReady = Boolean(p1?.ready && p2?.ready);
  const catP1 = CATS[p1?.catId] || CATS.shadow;
  const catP2 = p2 ? CATS[p2.catId] || CATS.fire : null;
  const currentArena = ARENAS[roomData.arenaId] || ARENAS.rooftop;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomData.roomCode);
    soundEngine.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectCat = (catId: CatId) => {
    soundEngine.playClick();
    socketClient.updateLobby({ catId });
  };

  const handleToggleReady = () => {
    soundEngine.playClick();
    socketClient.updateLobby({ ready: !localPlayer?.ready });
  };

  const handleSelectArena = (arenaId: ArenaId) => {
    soundEngine.playClick();
    socketClient.updateLobby({ arenaId });
    setShowArenaPicker(false);
  };

  const handleSaveLoadout = (loadout: PlayerLoadout) => {
    socketClient.updateLobby({ loadout });
  };

  return (
    <div className="relative w-full min-h-screen bg-[#07060f] text-[#f4f4f0] flex flex-col p-4 md:p-8 select-none font-game overflow-hidden">
      
      {/* Background Cyber Rain & Ambient Gradients */}
      <div className="ambient-rain z-0" />

      {/* =========================================================================
          TOP HEADER: EXIT, CHUNKY COPYABLE CODE PILL & ARENA SELECTOR
         ========================================================================= */}
      <header className="relative z-20 flex items-center justify-between max-w-6xl mx-auto w-full pb-4 border-b border-white/15">
        <button
          onClick={() => {
            soundEngine.playClick();
            socketClient.leaveRoom();
            onLeaveRoom();
          }}
          className="flex items-center gap-2 px-3 py-2 clip-chamfer glass-panel hover:glass-panel-cyan text-neutral-300 hover:text-white transition font-title font-bold text-xs uppercase arcade-btn"
        >
          <ArrowLeft size={16} />
          <span>Exit Session</span>
        </button>

        {/* Room Code Chunky Pill */}
        <div className="flex items-center gap-3 px-5 py-2 clip-chamfer glass-panel border border-cyan-500/40 neon-border-cyan">
          <Radio size={16} className="text-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] font-title font-bold uppercase tracking-widest text-cyan-400">
              BOUT FREQUENCY
            </span>
            <span className="font-num text-xl md:text-2xl font-black text-white tracking-widest">
              {roomData.roomCode}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="ml-2 p-1.5 clip-chamfer bg-cyan-950/80 border border-cyan-400 text-cyan-300 hover:text-white hover:bg-cyan-900 transition"
            title="Copy Room Frequency"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
          {copied && (
            <span className="font-title text-[10px] text-emerald-400 font-bold tracking-wider animate-fade-in uppercase">
              COPIED!
            </span>
          )}
        </div>

        {/* Arena Selector Button / Badge */}
        <div className="relative">
          <button
            onClick={() => isLocalHost && setShowArenaPicker(!showArenaPicker)}
            className={`flex items-center gap-2 px-3.5 py-2 clip-chamfer glass-panel border transition-all ${
              isLocalHost
                ? 'hover:border-cyan-400 text-white cursor-pointer arcade-btn'
                : 'border-white/10 text-neutral-300 cursor-default'
            }`}
          >
            <MapPin size={16} className="text-cyan-400" />
            <div className="text-left font-title">
              <span className="text-[9px] text-neutral-400 uppercase block tracking-wider">
                ARENA {isLocalHost && '(CLICK TO CHANGE)'}
              </span>
              <span className="text-xs font-bold text-white uppercase">{currentArena.name}</span>
            </div>
          </button>

          {/* Arena Visual Card Picker Dropdown */}
          {showArenaPicker && isLocalHost && (
            <div className="absolute right-0 top-14 z-50 p-3 clip-chamfer-lg glass-panel-cyan border-2 border-cyan-400 w-72 space-y-2 animate-fade-in shadow-2xl">
              <span className="font-title font-bold text-[10px] text-cyan-400 uppercase tracking-widest block mb-2">
                SELECT BOUT BATTLEGROUND:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {ARENAS_LIST.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelectArena(a.id)}
                    className={`p-2.5 clip-chamfer border text-left transition-all flex items-center justify-between ${
                      roomData.arenaId === a.id
                        ? 'border-cyan-400 bg-cyan-950/70 text-white shadow-md'
                        : 'border-white/10 bg-[#0c091d] text-neutral-400 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="font-display font-bold text-xs uppercase text-white">{a.name}</div>
                      <div className="font-game text-[10px] text-neutral-400">{a.theme}</div>
                    </div>
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/40"
                      style={{ backgroundColor: a.accentColor }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          MAIN DUEL PEDESTALS: P1 VS P2 WITH LIGHTNING CRACK EMBLEM
         ========================================================================= */}
      <main className="relative z-10 max-w-6xl mx-auto w-full flex-1 grid grid-cols-1 md:grid-cols-11 gap-4 items-center my-auto py-6">
        
        {/* HOST / PLAYER 1 FIGHTER PEDESTAL (LEFT) */}
        <div
          className={`md:col-span-5 p-6 clip-chamfer-lg glass-panel border-2 flex flex-col items-center justify-between transition-all duration-300 relative ${
            p1?.ready ? 'border-cyan-400 neon-border-cyan' : 'border-white/15'
          }`}
        >
          {/* Header Tag */}
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-title font-bold text-xs uppercase tracking-widest text-cyan-400">
              {p1?.isHost ? 'HOST FIGHTER' : 'CHALLENGER 01'}
            </span>
            <span
              className={`font-title font-bold text-xs px-2.5 py-0.5 clip-chamfer border uppercase tracking-wider ${
                p1?.ready
                  ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300'
                  : 'border-neutral-700 bg-black/40 text-neutral-500'
              }`}
            >
              {p1?.ready ? 'READY FOR BOUT' : 'PREPARING'}
            </span>
          </div>

          {/* Hero Character Stance */}
          <div className="my-4 flex flex-col items-center">
            <CatHeroVisual
              key={p1?.catId}
              catId={p1?.catId || 'shadow'}
              mode="hero"
              size="lg"
              showReflection={true}
              glow={true}
            />

            <h3 className="font-display font-black text-2xl uppercase tracking-wider text-white mt-1">
              {p1?.name}
            </h3>
            <span className="font-title text-xs text-cyan-300">
              {catP1.name} — "{catP1.title}"
            </span>
          </div>

          {/* Footer Metadata */}
          <div className="w-full border-t border-white/10 pt-3 flex items-center justify-between font-title text-xs">
            <span className="text-neutral-400 uppercase">MARTIAL STYLE:</span>
            <span className="text-white font-bold">{catP1.combatStyle}</span>
          </div>
        </div>

        {/* CENTER "VS" ARCADE EMBLEM WITH LIGHTNING */}
        <div className="md:col-span-1 flex flex-col items-center justify-center my-4 md:my-0">
          <div
            className={`w-16 h-16 clip-hex flex items-center justify-center font-display font-black text-2xl italic tracking-tight border-2 transition-all ${
              bothReady
                ? 'border-yellow-400 bg-yellow-950/70 text-yellow-300 neon-border-gold animate-lightning scale-110'
                : 'border-white/20 glass-panel text-white'
            }`}
          >
            VS
          </div>
          {bothReady && (
            <span className="font-title font-bold text-[10px] text-yellow-400 uppercase tracking-widest mt-2 animate-pulse">
              SYNCED!
            </span>
          )}
        </div>

        {/* OPPONENT / PLAYER 2 FIGHTER PEDESTAL (RIGHT) */}
        <div
          className={`md:col-span-5 p-6 clip-chamfer-lg glass-panel border-2 flex flex-col items-center justify-between transition-all duration-300 relative ${
            p2?.ready ? 'border-magenta-400 neon-border-magenta' : 'border-white/15'
          }`}
        >
          {/* Header Tag */}
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-title font-bold text-xs uppercase tracking-widest text-magenta-400">
              CHALLENGER 02
            </span>
            <span
              className={`font-title font-bold text-xs px-2.5 py-0.5 clip-chamfer border uppercase tracking-wider ${
                p2?.ready
                  ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300'
                  : 'border-neutral-700 bg-black/40 text-neutral-500'
              }`}
            >
              {p2 ? (p2.ready ? 'READY FOR BOUT' : 'PREPARING') : 'AWAITING PEER'}
            </span>
          </div>

          {p2 && catP2 ? (
            <div className="my-4 flex flex-col items-center animate-fade-in">
              <CatHeroVisual
                key={p2.catId}
                catId={p2.catId}
                mode="hero"
                size="lg"
                showReflection={true}
                glow={true}
              />

              <h3 className="font-display font-black text-2xl uppercase tracking-wider text-white mt-1">
                {p2.name}
              </h3>
              <span className="font-title text-xs text-magenta-300">
                {catP2.name} — "{catP2.title}"
              </span>
            </div>
          ) : (
            <div className="my-auto py-12 flex flex-col items-center text-center space-y-4">
              {/* Radar Scanner Animation */}
              <div className="relative w-24 h-24 rounded-full border border-magenta-500/30 flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 rounded-full border border-magenta-400/50 flex items-center justify-center">
                  <Radio size={24} className="text-magenta-400 animate-spin" />
                </div>
              </div>
              <div>
                <div className="font-display font-bold text-sm uppercase text-white tracking-wider">
                  WAITING FOR CHALLENGER...
                </div>
                <p className="font-game text-xs text-neutral-400 mt-1 max-w-xs">
                  Share frequency <span className="font-num text-cyan-300 font-bold">{roomData.roomCode}</span> with your opponent.
                </p>
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="w-full border-t border-white/10 pt-3 flex items-center justify-between font-title text-xs">
            <span className="text-neutral-400 uppercase">MARTIAL STYLE:</span>
            <span className="text-white font-bold">{catP2 ? catP2.combatStyle : 'PENDING JOIN'}</span>
          </div>
        </div>
      </main>

      {/* =========================================================================
          CHARACTER SELECTION DOCK FOR LOCAL PLAYER
         ========================================================================= */}
      <div className="relative z-20 max-w-6xl mx-auto w-full mb-4">
        <span className="font-title font-bold text-[10px] uppercase text-neutral-400 tracking-widest block mb-1.5">
          CHOOSE YOUR FIGHTER:
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {CATS_LIST.map((c) => {
            const isSelected = localPlayer?.catId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCat(c.id)}
                className={`p-2 clip-chamfer border transition-all flex items-center gap-2.5 arcade-btn ${
                  isSelected
                    ? 'glass-panel-cyan border-2 scale-102 text-white'
                    : 'glass-panel border-white/10 opacity-70 hover:opacity-100 hover:border-white/30 text-neutral-300'
                }`}
                style={{
                  borderColor: isSelected ? c.visual.glowColor : undefined,
                  boxShadow: isSelected ? `0 0 12px ${c.visual.glowColor}55` : undefined,
                }}
              >
                <div className="w-8 h-8 shrink-0 clip-chamfer bg-black/60 flex items-center justify-center">
                  <CatHeroVisual catId={c.id} mode="badge" size="sm" glow={false} />
                </div>
                <div className="overflow-hidden text-left">
                  <div className="font-title font-bold text-xs uppercase truncate text-white">{c.name.split(' ')[0]}</div>
                  <div className="font-game text-[9px] uppercase text-neutral-400 truncate">{c.combatStyle.split('&')[0]}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          BOTTOM ACTION BAR: TECHNIQUES LOADOUT, CONFIRM READINESS, COMMENCE BOUT
         ========================================================================= */}
      <footer className="relative z-20 max-w-6xl mx-auto w-full pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 font-title">
        
        {/* Techniques Loadout Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            setShowLoadoutModal(true);
          }}
          className="w-full sm:w-auto px-5 py-3 clip-chamfer glass-panel hover:glass-panel-cyan text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all arcade-btn"
        >
          <Sliders size={16} className="text-cyan-400" />
          <span>Techniques Loadout</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Confirm Readiness Toggle Button */}
          <button
            onClick={handleToggleReady}
            className={`flex-1 sm:flex-initial px-6 py-3 clip-chamfer text-xs font-black uppercase tracking-wider transition-all arcade-btn ${
              localPlayer?.ready
                ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.6)]'
                : 'glass-panel-cyan border-2 border-cyan-400 text-cyan-300 hover:text-white'
            }`}
          >
            {localPlayer?.ready ? '✓ READINESS CONFIRMED' : 'CONFIRM READINESS'}
          </button>

          {/* Host Commence Bout Button */}
          {isLocalHost && (
            <button
              onClick={() => {
                if (!bothReady) return;
                soundEngine.playClick();
                socketClient.startMatch();
                onStartMatch();
              }}
              disabled={!bothReady}
              title={!bothReady ? 'Both fighters must confirm readiness before commencing bout.' : 'Commence bout!'}
              className={`flex-1 sm:flex-initial px-8 py-3 clip-chamfer font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                bothReady
                  ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.8)] arcade-btn cursor-pointer'
                  : 'glass-panel opacity-35 text-neutral-400 border-neutral-700 cursor-not-allowed'
              }`}
            >
              {bothReady ? <Play size={14} fill="currentColor" /> : <Lock size={14} />}
              <span>Commence Bout</span>
            </button>
          )}
        </div>
      </footer>

      {/* Techniques Loadout Modal */}
      {showLoadoutModal && localPlayer && (
        <SkillSelectionModal
          catId={localPlayer.catId}
          currentLoadout={localPlayer.loadout}
          onSave={handleSaveLoadout}
          onClose={() => setShowLoadoutModal(false)}
        />
      )}
    </div>
  );
};
