import React from 'react';
import { CatId } from '../types/game';
import { CATS } from '../config/cats';
import { CatHeroVisual } from './CatHeroVisual';

interface Props {
  catId: CatId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

export const CatAvatarBadge: React.FC<Props> = ({ catId, size = 'md', showBadge = true, className = '' }) => {
  const cat = CATS[catId] || CATS.shadow;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-22 h-22',
    xl: 'w-30 h-30',
  };

  const badgeSizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 -bottom-2 font-game',
    md: 'text-[10px] px-2 py-0.5 -bottom-2.5 font-game',
    lg: 'text-[11px] px-2.5 py-0.5 -bottom-3 font-game',
    xl: 'text-xs px-3 py-1 -bottom-3.5 font-game',
  };

  return (
    <div
      className={`relative flex items-center justify-center clip-chamfer glass-panel transition-all duration-200 select-none ${sizeClasses[size]} ${className}`}
      style={{
        borderColor: `${cat.visual.glowColor}55`,
        boxShadow: `0 0 12px ${cat.visual.glowColor}25`,
      }}
    >
      <CatHeroVisual catId={catId} mode="portrait" size={size} glow={false} />

      {showBadge && (
        <div
          className={`absolute font-title font-bold tracking-wider uppercase text-white clip-skew-l bg-[#0d091e] border border-white/20 whitespace-nowrap shadow-md ${badgeSizeClasses[size]}`}
          style={{ borderLeftColor: cat.visual.glowColor }}
        >
          {cat.name}
        </div>
      )}
    </div>
  );
};
