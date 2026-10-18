import React, { useState } from 'react';
import { PlayerLoadout, SkillCategory, SkillDef, SkillSlot } from '../types/game';
import { SKILLS, SKILLS_LIST } from '../config/skills';
import { CATS } from '../config/cats';
import { CatId } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { CatAvatarBadge } from './CatAvatarBadge';
import { X, Check, Sliders, Zap, Shield, Flame } from 'lucide-react';

interface Props {
  catId: CatId;
  currentLoadout: PlayerLoadout;
  onSave: (loadout: PlayerLoadout) => void;
  onClose: () => void;
}

export const SkillSelectionModal: React.FC<Props> = ({ catId, currentLoadout, onSave, onClose }) => {
  const [loadout, setLoadout] = useState<PlayerLoadout>({ ...currentLoadout });
  const [activeSlot, setActiveSlot] = useState<SkillSlot>('ability1');
  const cat = CATS[catId] || CATS.shadow;

  const slots: { slot: SkillSlot; label: string; code: string; index: string; category: SkillCategory }[] = [
    { slot: 'basic', label: 'Primary Strike', code: 'J / LMB', index: '01', category: 'offensive' },
    { slot: 'ability1', label: 'Combat Skill Alpha', code: 'L', index: '02', category: 'offensive' },
    { slot: 'ability2', label: 'Combat Skill Beta', code: 'U', index: '03', category: 'control' },
    { slot: 'movement', label: 'Kinetic Dash', code: 'SHIFT', index: '04', category: 'movement' },
    { slot: 'defensive', label: 'Parry & Guard', code: 'I', index: '05', category: 'defensive' },
    { slot: 'ultimate', label: 'Overdrive Protocol', code: 'O', index: '06', category: 'ultimate' },
  ];

  const availableSkills = SKILLS_LIST.filter((s) => s.slotAllowed === activeSlot);

  const handleSelectSkill = (skill: SkillDef) => {
    soundEngine.playClick();
    setLoadout((prev) => ({
      ...prev,
      [activeSlot]: skill.id,
    }));
  };

  const handleConfirm = () => {
    soundEngine.playClick();
    onSave(loadout);
    onClose();
  };

  const currentSlotMeta = slots.find((s) => s.slot === activeSlot);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-fade-in font-game select-none">
      <div className="glass-panel-cyan clip-chamfer-lg border-2 border-cyan-400 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-[#f4f4f0] shadow-[0_10px_50px_rgba(0,0,0,0.9)]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/15 bg-[#0a0718]">
          <div className="flex items-center gap-4">
            <CatAvatarBadge catId={catId} size="sm" showBadge={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-title font-bold text-[10px] tracking-widest text-cyan-400 uppercase">
                  TECHNIQUE CUSTOMIZATION PROTOCOL
                </span>
              </div>
              <h2 className="text-2xl font-display font-black italic text-white tracking-wide">
                {cat.name} — Combat Loadout
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 clip-chamfer glass-panel hover:glass-panel-cyan flex items-center justify-center text-neutral-400 hover:text-white transition arcade-btn"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden p-6 gap-6">
          
          {/* Left Column: 6 Loadout Slots */}
          <div className="md:col-span-5 flex flex-col gap-2 overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-white/10 font-title font-bold text-xs uppercase">
              <span className="text-cyan-400 tracking-wider">ASSIGNED SLOTS</span>
              <span className="text-neutral-400">6 / 6 ARMED</span>
            </div>

            {slots.map(({ slot, label, code, index }) => {
              const equippedSkill = SKILLS[loadout[slot]];
              const isSelected = activeSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveSlot(slot);
                  }}
                  className={`flex items-center justify-between p-3 clip-chamfer border transition-all text-left arcade-btn ${
                    isSelected
                      ? 'glass-panel-cyan border-cyan-400 text-white translate-x-1 shadow-md'
                      : 'glass-panel border-white/10 hover:border-white/30 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-cyan-400">{index}</span>
                    <div>
                      <div className="font-title font-bold text-[10px] uppercase tracking-wider text-neutral-400">
                        {label} <span className="text-cyan-300">[{code}]</span>
                      </div>
                      <div className="font-display font-bold text-sm text-white mt-0.5">
                        {equippedSkill?.name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                  <div className="font-num text-xs">
                    {equippedSkill?.damage ? (
                      <span className="text-amber-400 font-bold">{equippedSkill.damage} DMG</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">UTILITY</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Skill Catalog for active slot */}
          <div className="md:col-span-7 flex flex-col bg-[#080514] border border-white/10 clip-chamfer p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div>
                <span className="font-title font-bold text-[10px] uppercase tracking-widest text-cyan-400 block">
                  AVAILABLE TECHNIQUES
                </span>
                <span className="font-display font-bold text-base text-white">{currentSlotMeta?.label}</span>
              </div>
              <span className="font-title text-xs text-neutral-400">{availableSkills.length} Variations</span>
            </div>

            <div className="space-y-3">
              {availableSkills.map((skill) => {
                const isEquipped = loadout[activeSlot] === skill.id;
                return (
                  <div
                    key={skill.id}
                    onClick={() => handleSelectSkill(skill)}
                    className={`p-4 clip-chamfer border transition-all cursor-pointer ${
                      isEquipped
                        ? 'glass-panel-cyan border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                        : 'glass-panel border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-white text-base">{skill.name}</span>
                          <span className="font-title text-[10px] uppercase px-2 py-0.5 clip-chamfer bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                            {skill.category}
                          </span>
                        </div>
                        <p className="font-game text-xs text-neutral-300 mt-1.5 leading-relaxed">{skill.description}</p>
                      </div>

                      {isEquipped ? (
                        <span className="shrink-0 flex items-center gap-1 font-title font-black text-xs uppercase tracking-wider px-2.5 py-1 bg-cyan-400 text-slate-950 clip-chamfer shadow-md">
                          <Check size={14} /> ARMED
                        </span>
                      ) : (
                        <button className="shrink-0 font-title font-bold text-xs uppercase tracking-wider px-3 py-1 clip-chamfer glass-panel border border-white/20 text-neutral-300 hover:text-white hover:border-cyan-400 transition">
                          Equip
                        </button>
                      )}
                    </div>

                    {/* Stats table */}
                    <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 font-title text-xs">
                      <div>
                        <div className="text-neutral-500 uppercase text-[9px]">Damage</div>
                        <div className="font-num font-bold text-amber-400 mt-0.5">{skill.damage > 0 ? skill.damage : '—'}</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 uppercase text-[9px]">Cooldown</div>
                        <div className="font-num font-bold text-cyan-300 mt-0.5">{skill.cooldown}s</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 uppercase text-[9px]">Energy</div>
                        <div className="font-num font-bold text-yellow-400 mt-0.5">{skill.energyCost > 0 ? skill.energyCost : '0'}</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 uppercase text-[9px]">Reach</div>
                        <div className="font-num font-bold text-purple-300 mt-0.5">{skill.range}px</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/15 bg-[#0a0718]">
          <span className="font-title text-xs text-neutral-400">
            Technique configurations apply to both online lobbies and training simulations.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 clip-chamfer glass-panel text-xs font-title font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition"
            >
              Dismiss
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 clip-chamfer bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-display font-black uppercase tracking-wider transition arcade-btn shadow-md"
            >
              Arm Loadout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
