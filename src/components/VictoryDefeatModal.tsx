import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchState } from '../types/game';
import { CATS } from '../config/cats';
import { soundEngine } from '../audio/soundEngine';
import { CatHeroVisual } from './CatHeroVisual';
import { RotateCcw, Sliders, LogOut, Trophy, Skull, Zap, Swords } from 'lucide-react';

interface Props {
  matchState: MatchState;
  localPlayerId: string;
  onRematch: () => void;
  onChangeLoadout: () => void;
  onLeave: () => void;
  waitingForRematch?: boolean;
}

export const VictoryDefeatModal: React.FC<Props> = ({
  matchState,
  localPlayerId,
  onRematch,
  onChangeLoadout,
  onLeave,
  waitingForRematch = false,
}) => {
  const isP1 = matchState.p1.id === localPlayerId;
  const localPlayer = isP1 ? matchState.p1 : matchState.p2;
  const oppPlayer = isP1 ? matchState.p2 : matchState.p1;
  const stats = matchState.stats;

  const isWinner = stats?.winnerId === localPlayerId;
  const isDraw = !stats?.winnerId;

  const myStats = isP1 ? stats?.p1Stats : stats?.p2Stats;
  const oppStats = isP1 ? stats?.p2Stats : stats?.p1Stats;

  const localCat = CATS[localPlayer.catId] || CATS.shadow;

  useEffect(() => {
    if (isWinner) {
      soundEngine.playVictory();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#22d3ee', '#ff2d95', '#ffc53d', '#ffffff'],
      });
    } else {
      soundEngine.playDefeat();
    }
  }, [isWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-game select-none overflow-y-auto">
      <div
        className={`w-full max-w-xl clip-chamfer-lg glass-panel p-6 md:p-8 border-2 flex flex-col space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] my-auto ${
          isWinner ? 'border-cyan-400 neon-border-cyan' : 'border-rose-500/60'
        }`}
      >
        {/* Top Victory / Defeat Grand Slam Title */}
        <div className="text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 clip-chamfer bg-[#0e0a22] border border-white/15 text-[10px] font-title font-bold tracking-widest uppercase text-cyan-400 mb-2">
            {isWinner ? <Trophy size={14} className="text-yellow-400" /> : <Skull size={14} className="text-rose-400" />}
            <span>BOUT CONCLUSION PROTOCOL</span>
          </div>

          <h1
            className={`font-display font-black text-5xl md:text-6xl italic tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] ${
              isWinner
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-cyan-300 to-white'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-400 to-neutral-200'
            }`}
          >
            {isWinner ? 'VICTORY!' : isDraw ? 'DRAW MATCH' : 'K.O. — DEFEAT'}
          </h1>

          <p className="font-game text-xs text-neutral-300 mt-2 max-w-md mx-auto">
            {isWinner
              ? `${localPlayer.name} decisively conquered the encounter across martial exchanges!`
              : `${oppPlayer.name} connected the concluding strike. Recalibrate frame advantages.`}
          </p>

          {/* Rounds Outcome Badge */}
          <div className="mt-4 inline-flex items-center gap-4 px-4 py-2 clip-chamfer bg-[#0c0822] border border-cyan-400/40">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-title font-bold tracking-wider">
              <Swords size={15} />
              <span>BOUT SCORE ({stats?.totalRounds ?? 3} ROUNDS):</span>
            </div>
            <div className="px-2.5 py-0.5 clip-chamfer bg-cyan-950/80 border border-cyan-400 text-yellow-300 font-num font-black text-sm tracking-wider shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              {isP1 ? (stats?.p1RoundsWon ?? 2) : (stats?.p2RoundsWon ?? 1)}
              {' — '}
              {isP1 ? (stats?.p2RoundsWon ?? 1) : (stats?.p1RoundsWon ?? 2)}
            </div>
          </div>
        </div>

        {/* Center Fighter Portrait & Match Highlights */}
        <div className="flex items-center justify-center gap-6 p-4 clip-chamfer bg-[#0a0718] border border-white/10">
          <div className="w-16 h-16 clip-chamfer glass-panel flex items-center justify-center border border-cyan-400/50">
            <CatHeroVisual catId={localPlayer.catId} mode="portrait" size="md" glow={false} />
          </div>
          <div>
            <span className="font-title text-[10px] uppercase tracking-wider text-neutral-400 block">
              FIGHTER // {localCat.combatStyle}
            </span>
            <div className="font-display font-bold text-lg uppercase text-white">
              {localPlayer.name} ({localCat.name})
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-title font-bold text-xs px-2 py-0.5 clip-chamfer bg-amber-500/20 text-amber-300 border border-amber-400/40">
                +{isWinner ? '150' : '60'} XP EARNED
              </span>
            </div>
          </div>
        </div>

        {/* Tabular Telemetry Breakdown */}
        <div className="space-y-2 bg-[#090714] p-4 clip-chamfer border border-white/10 font-title text-xs">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-400 border-b border-white/10 pb-2">
            <span>COMBAT METRIC</span>
            <div className="flex gap-8">
              <span className="text-cyan-300">YOU</span>
              <span className="text-neutral-500">OPPONENT</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-neutral-300">Damage Delivered</span>
            <div className="flex gap-10 font-num font-bold">
              <span className="text-white">{myStats?.damageDealt ?? 0}</span>
              <span className="text-neutral-500">{oppStats?.damageDealt ?? 0}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-neutral-300">Strikes Landed</span>
            <div className="flex gap-10 font-num font-bold">
              <span className="text-white">{myStats?.hitsLanded ?? 0}</span>
              <span className="text-neutral-500">{oppStats?.hitsLanded ?? 0}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-neutral-300">Maximum Combo</span>
            <div className="flex gap-10 font-num font-bold">
              <span className="text-cyan-300">{myStats?.highestCombo ?? 0}x</span>
              <span className="text-neutral-500">{oppStats?.highestCombo ?? 0}x</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-neutral-300">Evasive Dodges</span>
            <div className="flex gap-10 font-num font-bold">
              <span className="text-white">{myStats?.dodgesSucceeded ?? 0}</span>
              <span className="text-neutral-500">{oppStats?.dodgesSucceeded ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Rematch Waiting Toast */}
        {waitingForRematch && (
          <div className="p-3 clip-chamfer glass-panel-cyan border text-center text-xs text-cyan-300 font-title font-bold tracking-wider animate-pulse">
            TRANSMITTING REMATCH REQUEST // AWAITING PEER CONFIRMATION...
          </div>
        )}

        {/* Action Buttons: Rematch, Loadout, Main Menu */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 font-title font-bold uppercase text-xs">
          <button
            onClick={() => {
              soundEngine.playClick();
              onLeave();
            }}
            className="w-full sm:w-auto px-5 py-3 clip-chamfer glass-panel hover:glass-panel-cyan text-neutral-300 hover:text-white transition flex items-center justify-center gap-2 arcade-btn"
          >
            <LogOut size={16} />
            <span>Main Menu</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                soundEngine.playClick();
                onChangeLoadout();
              }}
              className="flex-1 sm:flex-initial px-5 py-3 clip-chamfer glass-panel hover:glass-panel-cyan text-neutral-200 hover:text-white transition flex items-center justify-center gap-2 arcade-btn"
            >
              <Sliders size={16} className="text-cyan-400" />
              <span>Loadout</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onRematch();
              }}
              disabled={waitingForRematch}
              className={`flex-1 sm:flex-initial px-7 py-3 clip-chamfer font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                waitingForRematch
                  ? 'glass-panel opacity-40 text-neutral-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-950 shadow-[0_0_20px_rgba(250,204,21,0.7)] arcade-btn cursor-pointer animate-pulse'
              }`}
            >
              <RotateCcw size={16} />
              <span>{waitingForRematch ? 'Awaiting...' : 'Rematch!'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
