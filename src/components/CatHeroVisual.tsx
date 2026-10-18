import React from 'react';
import { CatId } from '../types/game';
import { CATS } from '../config/cats';

interface Props {
  catId: CatId;
  mode?: 'hero' | 'portrait' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showReflection?: boolean;
  className?: string;
  glow?: boolean;
}

export const CatHeroVisual: React.FC<Props> = ({
  catId,
  mode = 'hero',
  size = 'lg',
  showReflection = false,
  className = '',
  glow = true,
}) => {
  const cat = CATS[catId] || CATS.shadow;
  const { visual } = cat;

  // Specific thematic details per character
  const renderHeroFeatures = () => {
    switch (catId) {
      case 'shadow':
        // Kareepucha: Umbral assassin with glowing violet runes, sleek shadow ears, scarf tail, and glowing violet kunai/wisps
        return (
          <>
            {/* Shadow wisps aura */}
            <path
              d="M30,170 Q10,130 35,90 T40,40"
              stroke="#8b5cf6"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
              filter="url(#glow-filter)"
            />
            <path
              d="M170,170 Q190,130 165,90 T160,40"
              stroke="#8b5cf6"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
              filter="url(#glow-filter)"
            />
            {/* Umbral Forehead Rune */}
            <polygon points="100,62 104,70 100,78 96,70" fill="#c084fc" filter="url(#glow-filter)" />
            {/* Shadow Scarf */}
            <path
              d="M75,108 Q100,118 125,108 Q140,140 155,160 Q145,165 130,135 Q100,128 75,108 Z"
              fill="#7e22ce"
              opacity="0.85"
            />
            {/* Dual Daggers at Hips */}
            <path d="M55,130 L40,155 L44,157 L58,134 Z" fill="#c084fc" />
            <path d="M145,130 L160,155 L156,157 L142,134 Z" fill="#c084fc" />
          </>
        );

      case 'thunder':
        // Thunder: Electric lightning bolts, goggles, spiky fur tufts
        return (
          <>
            {/* Lightning Bolts */}
            <polyline
              points="25,60 38,80 30,85 45,110"
              stroke="#facc15"
              strokeWidth="3.5"
              fill="none"
              filter="url(#glow-filter)"
            />
            <polyline
              points="175,60 162,80 170,85 155,110"
              stroke="#facc15"
              strokeWidth="3.5"
              fill="none"
              filter="url(#glow-filter)"
            />
            {/* Forehead Lightning Mark */}
            <polygon points="100,58 97,68 103,68 98,80 105,72 100,72" fill="#67e8f9" filter="url(#glow-filter)" />
            {/* Tech Collar */}
            <rect x="78" y="104" width="44" height="8" rx="4" fill="#0f172a" stroke="#facc15" strokeWidth="2" />
            <circle cx="100" cy="108" r="3" fill="#38bdf8" filter="url(#glow-filter)" />
          </>
        );

      case 'frost':
        // Frost: Crystalline crown, frost spikes, ice mist
        return (
          <>
            {/* Floating Ice Shards */}
            <polygon points="30,50 38,40 36,60" fill="#7dd3fc" opacity="0.8" filter="url(#glow-filter)" />
            <polygon points="170,50 162,40 164,60" fill="#7dd3fc" opacity="0.8" filter="url(#glow-filter)" />
            {/* Crystal Diadem */}
            <polygon points="100,50 108,65 100,60 92,65" fill="#38bdf8" filter="url(#glow-filter)" />
            {/* Glacial Collar */}
            <path d="M80,106 Q100,116 120,106 L124,115 L100,122 L76,115 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
          </>
        );

      case 'fire':
        // Fire: Flaming mane, charred gauntlets, ember marks
        return (
          <>
            {/* Flame Ears and Mane */}
            <path
              d="M60,40 Q50,15 70,30 Q85,10 95,35"
              fill="#f97316"
              opacity="0.85"
              filter="url(#glow-filter)"
            />
            <path
              d="M140,40 Q150,15 130,30 Q115,10 105,35"
              fill="#f97316"
              opacity="0.85"
              filter="url(#glow-filter)"
            />
            {/* Blazing Forehead Crest */}
            <circle cx="100" cy="68" r="5" fill="#facc15" filter="url(#glow-filter)" />
            {/* Spiked War Bracers */}
            <rect x="52" y="142" width="16" height="10" rx="3" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" />
            <rect x="132" y="142" width="16" height="10" rx="3" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" />
          </>
        );

      case 'ninja':
        // Ninja: Mask / cowl, steel headband, shuriken ribbons
        return (
          <>
            {/* Metal Shinobi Headplate */}
            <rect x="74" y="60" width="52" height="10" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="100" cy="65" r="2.5" fill="#6366f1" />
            {/* Trailing Headband Ribbons */}
            <path
              d="M126,65 Q150,60 175,70 Q160,85 130,72"
              fill="#4338ca"
              filter="url(#glow-filter)"
            />
            {/* Shinobi Half-Face Mask */}
            <path d="M78,85 Q100,98 122,85 L120,105 Q100,114 80,105 Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
          </>
        );

      case 'tank':
      default:
        // Tank: Spiked heavy lion pauldrons, battle scar, brawny bulk
        return (
          <>
            {/* Heavy Iron Shoulder Pauldrons */}
            <path d="M40,110 L65,105 L60,135 L35,130 Z" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
            <path d="M160,110 L135,105 L140,135 L165,130 Z" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
            {/* Spikes */}
            <polygon points="40,110 32,100 48,105" fill="#d97706" />
            <polygon points="160,110 168,100 152,105" fill="#d97706" />
            {/* Eye Battle Scar */}
            <line x1="82" y1="65" x2="88" y2="85" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </>
        );
    }
  };

  if (mode === 'portrait' || mode === 'badge') {
    const isBadge = mode === 'badge';
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 overflow-hidden ${className}`}
        style={{
          width: isBadge ? (size === 'sm' ? 36 : 48) : size === 'sm' ? 56 : size === 'md' ? 72 : 88,
          height: isBadge ? (size === 'sm' ? 36 : 48) : size === 'sm' ? 56 : size === 'md' ? 72 : 88,
        }}
      >
        <svg viewBox="40 25 120 110" className="w-full h-full object-contain filter drop-shadow-md">
          <defs>
            <filter id={`glow-p-${catId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id={`grad-p-${catId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={visual.secondaryColor} />
              <stop offset="100%" stopColor={visual.primaryColor} />
            </linearGradient>
          </defs>

          {/* Background Aura */}
          <circle cx="100" cy="80" r="44" fill={visual.glowColor} opacity="0.25" filter={`url(#glow-p-${catId})`} />

          {/* Ears */}
          <polygon points="72,65 52,28 88,48" fill={visual.primaryColor} stroke={visual.glowColor} strokeWidth="2" />
          <polygon points="70,60 58,36 82,50" fill={visual.earInnerColor} />
          <polygon points="128,65 148,28 112,48" fill={visual.primaryColor} stroke={visual.glowColor} strokeWidth="2" />
          <polygon points="130,60 142,36 118,50" fill={visual.earInnerColor} />

          {/* Head */}
          <path
            d="M62,80 Q56,105 80,112 Q100,116 120,112 Q144,105 138,80 Q135,55 100,55 Q65,55 62,80 Z"
            fill={`url(#grad-p-${catId})`}
            stroke={visual.glowColor}
            strokeWidth="2"
          />

          {/* Eyes - Fierce Angular Fighting Gaze */}
          <polygon points="76,76 90,80 84,85 74,80" fill={visual.eyeColor} filter={`url(#glow-p-${catId})`} />
          <polygon points="124,76 110,80 116,85 126,80" fill={visual.eyeColor} filter={`url(#glow-p-${catId})`} />

          {/* Pupils */}
          <line x1="82" y1="78" x2="82" y2="84" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="118" y1="78" x2="118" y2="84" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

          {/* Nose & Snout */}
          <polygon points="100,88 96,84 104,84" fill={visual.glowColor} />
          <path d="M96,92 Q100,96 104,92" stroke={visual.glowColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Character feature overlays */}
          {renderHeroFeatures()}
        </svg>
      </div>
    );
  }

  // Full Hero Stance (for Menu, Character Select, Lobby)
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Floor Glow Disk */}
      {glow && (
        <div
          className="absolute -bottom-6 w-56 md:w-80 h-16 rounded-[100%] blur-xl opacity-60 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: visual.glowColor }}
        />
      )}

      {/* Hero Vector Figure */}
      <div
        className="relative z-10 animate-idle-breath"
        style={{
          width: size === 'xl' ? '280px' : size === 'lg' ? '230px' : '180px',
          height: size === 'xl' ? '300px' : size === 'lg' ? '250px' : '200px',
        }}
      >
        <svg viewBox="0 0 200 220" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          <defs>
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="aura-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={visual.glowColor} stopOpacity="0.4" />
              <stop offset="70%" stopColor={visual.glowColor} stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="body-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={visual.secondaryColor} />
              <stop offset="100%" stopColor={visual.primaryColor} />
            </linearGradient>
          </defs>

          {/* Back Aura */}
          <circle cx="100" cy="110" r="85" fill="url(#aura-grad)" />

          {/* Dynamic Tail */}
          <path
            d="M60,170 Q20,150 25,100 Q30,60 50,75 Q40,95 45,130 Q50,160 70,175 Z"
            fill={visual.primaryColor}
            stroke={visual.glowColor}
            strokeWidth="1.5"
          />

          {/* Hind Legs & Paws */}
          <ellipse cx="62" cy="180" rx="18" ry="12" fill={visual.secondaryColor} />
          <ellipse cx="138" cy="180" rx="18" ry="12" fill={visual.secondaryColor} />
          {/* Claws */}
          <line x1="52" y1="184" x2="52" y2="190" stroke="#f4f4f0" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="186" x2="62" y2="192" stroke="#f4f4f0" strokeWidth="2" strokeLinecap="round" />
          <line x1="72" y1="184" x2="72" y2="190" stroke="#f4f4f0" strokeWidth="2" strokeLinecap="round" />

          <line x1="128" y1="184" x2="128" y2="190" stroke="#f4f4f0" strokeWidth="2" strokeLinecap="round" />
          <line x1="138" y1="186" x2="138" y2="192" stroke="#f4f4f0" strokeWidth="2" strokeLinecap="round" />
          <line x1="148" y1="184" x2="148" y2="190" stroke="#f4f4f0" strokeWidth="2" strokeLinecap="round" />

          {/* Torso */}
          <path
            d="M68,115 Q60,145 62,175 Q100,186 138,175 Q140,145 132,115 Q100,105 68,115 Z"
            fill="url(#body-grad)"
            stroke={visual.glowColor}
            strokeWidth="2"
          />

          {/* Chest & Belly Plate */}
          <path
            d="M78,118 Q100,125 122,118 Q125,150 100,165 Q75,150 78,118 Z"
            fill={visual.bellyColor}
            opacity="0.8"
          />

          {/* Forearms / Combat Paws in Guard Stance */}
          <path
            d="M60,122 Q46,138 52,156 Q66,158 72,142 Q70,128 60,122 Z"
            fill={visual.secondaryColor}
            stroke={visual.glowColor}
            strokeWidth="1.5"
          />
          <path
            d="M140,122 Q154,138 148,156 Q134,158 128,142 Q130,128 140,122 Z"
            fill={visual.secondaryColor}
            stroke={visual.glowColor}
            strokeWidth="1.5"
          />

          {/* Claws on Combat Paws */}
          <path d="M48,156 L44,163 M54,158 L52,166 M60,157 L60,165" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M152,156 L156,163 M146,158 L148,166 M140,157 L140,165" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

          {/* Ears */}
          <polygon points="68,68 45,20 90,46" fill={visual.primaryColor} stroke={visual.glowColor} strokeWidth="2.5" />
          <polygon points="66,62 52,30 84,48" fill={visual.earInnerColor} />

          <polygon points="132,68 155,20 110,46" fill={visual.primaryColor} stroke={visual.glowColor} strokeWidth="2.5" />
          <polygon points="134,62 148,30 116,48" fill={visual.earInnerColor} />

          {/* Head */}
          <path
            d="M58,82 Q50,112 78,120 Q100,125 122,120 Q150,112 142,82 Q138,54 100,54 Q62,54 58,82 Z"
            fill="url(#body-grad)"
            stroke={visual.glowColor}
            strokeWidth="2.5"
          />

          {/* Muzzle */}
          <ellipse cx="100" cy="98" rx="20" ry="12" fill={visual.bellyColor} opacity="0.6" />
          <polygon points="100,92 94,86 106,86" fill={visual.glowColor} />
          <path d="M94,96 Q100,102 106,96" stroke={visual.glowColor} strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Piercing Martial Arts Eyes */}
          <polygon points="72,78 90,82 82,88 70,82" fill={visual.eyeColor} filter="url(#glow-filter)" />
          <polygon points="128,78 110,82 118,88 130,82" fill={visual.eyeColor} filter="url(#glow-filter)" />
          {/* Slit Pupils with Specular Highlight */}
          <line x1="80" y1="80" x2="80" y2="86" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="120" y1="80" x2="120" y2="86" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

          {/* Character-specific weapon/gear/aura layers */}
          {renderHeroFeatures()}
        </svg>
      </div>

      {/* Floor Mirror Reflection */}
      {showReflection && (
        <div
          className="overflow-hidden floor-reflection mt-[-18px]"
          style={{
            width: size === 'xl' ? '280px' : size === 'lg' ? '230px' : '180px',
            height: '70px',
          }}
        >
          <svg viewBox="0 0 200 220" className="w-full h-full opacity-40">
            <circle cx="100" cy="110" r="85" fill={visual.glowColor} opacity="0.2" />
            <path
              d="M68,115 Q60,145 62,175 Q100,186 138,175 Q140,145 132,115 Q100,105 68,115 Z"
              fill={visual.primaryColor}
            />
            <path
              d="M58,82 Q50,112 78,120 Q100,125 122,120 Q150,112 142,82 Q138,54 100,54 Q62,54 58,82 Z"
              fill={visual.primaryColor}
            />
          </svg>
        </div>
      )}
    </div>
  );
};
