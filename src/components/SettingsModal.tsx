import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Volume2, VolumeX, Keyboard, Smartphone, X, Sliders, Shield } from 'lucide-react';

interface Props {
  onClose: () => void;
  showMobileControls: boolean;
  setShowMobileControls: (val: boolean) => void;
}

export const SettingsModal: React.FC<Props> = ({ onClose, showMobileControls, setShowMobileControls }) => {
  const [master, setMaster] = useState(soundEngine.masterVolume);
  const [music, setMusic] = useState(soundEngine.musicVolume);
  const [sfx, setSfx] = useState(soundEngine.sfxVolume);
  const [muted, setMuted] = useState(soundEngine.isMuted);

  const handleMasterChange = (val: number) => {
    setMaster(val);
    soundEngine.setMasterVolume(val);
  };

  const handleMusicChange = (val: number) => {
    setMusic(val);
    soundEngine.setMusicVolume(val);
  };

  const handleSfxChange = (val: number) => {
    setSfx(val);
    soundEngine.setSfxVolume(val);
    soundEngine.playClick();
  };

  const handleMuteToggle = () => {
    const isMuted = soundEngine.toggleMute();
    setMuted(isMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-game select-none">
      <div className="glass-panel-cyan clip-chamfer-lg border-2 border-cyan-400 w-full max-w-lg shadow-[0_10px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/15 bg-[#0a0718]">
          <div>
            <span className="font-title font-bold text-[10px] text-cyan-400 uppercase tracking-widest block">
              SYSTEM CONFIGURATION
            </span>
            <h2 className="font-display font-black italic text-2xl text-white mt-0.5">Preferences</h2>
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Audio Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-title font-bold text-xs uppercase tracking-wider text-cyan-400">
                Audio Synthesis Parameters
              </span>
              <button
                onClick={handleMuteToggle}
                className="flex items-center gap-1.5 text-xs font-title font-bold text-neutral-300 hover:text-cyan-300 transition"
              >
                {muted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-cyan-400" />}
                <span>{muted ? 'MUTED' : 'ACTIVE'}</span>
              </button>
            </div>

            {/* Master Volume */}
            <div className="space-y-1.5 font-title">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-neutral-300">Master Level</span>
                <span className="font-num text-cyan-300">{Math.round(master * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={master}
                onChange={(e) => handleMasterChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#090714] clip-chamfer appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* SFX Volume */}
            <div className="space-y-1.5 font-title">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-neutral-300">Combat SFX</span>
                <span className="font-num text-amber-400">{Math.round(sfx * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sfx}
                onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#090714] clip-chamfer appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Music Volume */}
            <div className="space-y-1.5 font-title">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-neutral-300">Arena Synth BGM</span>
                <span className="font-num text-magenta-300">{Math.round(music * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={music}
                onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#090714] clip-chamfer appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>

          {/* Touch / Mobile Toggle */}
          <div className="border-t border-white/10 pt-4">
            <span className="font-title font-bold text-xs uppercase tracking-wider text-cyan-400 block mb-3">
              Input Device Configuration
            </span>
            <div className="flex items-center justify-between p-3.5 clip-chamfer glass-panel border border-white/10">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-cyan-400" />
                <div>
                  <div className="font-display font-bold text-xs uppercase text-white">Touchscreen Skill Pad</div>
                  <div className="text-[11px] font-title text-neutral-400">Display mobile directional cluster & attack buttons</div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowMobileControls(!showMobileControls);
                }}
                className={`px-3 py-1.5 clip-chamfer font-title font-bold text-xs uppercase transition ${
                  showMobileControls
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md'
                    : 'glass-panel border border-white/20 text-neutral-400'
                }`}
              >
                {showMobileControls ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Keybindings Reference */}
          <div className="border-t border-white/10 pt-4">
            <span className="font-title font-bold text-xs uppercase tracking-wider text-cyan-400 block mb-3">
              Standard Battle Inputs
            </span>
            <div className="grid grid-cols-2 gap-2 font-title text-xs">
              <div className="p-2 clip-chamfer bg-[#0a0718] border border-white/10 flex items-center justify-between">
                <span className="text-neutral-400">Movement / Jump</span>
                <span className="font-mono text-cyan-300 font-bold">W / A / S / D</span>
              </div>
              <div className="p-2 clip-chamfer bg-[#0a0718] border border-white/10 flex items-center justify-between">
                <span className="text-neutral-400">Primary Strike</span>
                <span className="font-mono text-cyan-300 font-bold">J</span>
              </div>
              <div className="p-2 clip-chamfer bg-[#0a0718] border border-white/10 flex items-center justify-between">
                <span className="text-neutral-400">Heavy Strike</span>
                <span className="font-mono text-amber-300 font-bold">K</span>
              </div>
              <div className="p-2 clip-chamfer bg-[#0a0718] border border-white/10 flex items-center justify-between">
                <span className="text-neutral-400">Technique 1 & 2</span>
                <span className="font-mono text-cyan-300 font-bold">L / U</span>
              </div>
              <div className="p-2 clip-chamfer bg-[#0a0718] border border-white/10 flex items-center justify-between">
                <span className="text-neutral-400">Kinetic Dash</span>
                <span className="font-mono text-purple-300 font-bold">SHIFT</span>
              </div>
              <div className="p-2 clip-chamfer bg-[#0a0718] border border-white/10 flex items-center justify-between">
                <span className="text-neutral-400">Parry & Guard</span>
                <span className="font-mono text-emerald-300 font-bold">I</span>
              </div>
              <div className="col-span-2 p-2 clip-chamfer bg-[#0a0718] border border-white/10 flex items-center justify-between">
                <span className="text-neutral-400">Elemental Overdrive (100⚡)</span>
                <span className="font-mono text-yellow-300 font-bold">O</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/15 bg-[#0a0718] flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-6 py-2.5 clip-chamfer bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition arcade-btn shadow-md"
          >
            Save & Exit
          </button>
        </div>
      </div>
    </div>
  );
};
