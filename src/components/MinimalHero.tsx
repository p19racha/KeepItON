import React from 'react';
import { Play, Pause } from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface MinimalHeroProps {
  isActive: boolean;
  onToggle: () => Promise<void>;
}

export const MinimalHero: React.FC<MinimalHeroProps> = ({
  isActive,
  onToggle,
}) => {
  const handleClick = async () => {
    soundEffects.playClick();
    await onToggle();
  };

  return (
    <div className="flex flex-col items-center justify-center my-8 sm:my-14 select-none">
      {/* Massive Bold Headline */}
      <div className="mb-8 sm:mb-12 text-center">
        {isActive ? (
          <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white">
            AWAKE
          </div>
        ) : (
          <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-neutral-800">
            STANDBY
          </div>
        )}
      </div>

      {/* Central Play / Pause Symbol */}
      <button
        onClick={handleClick}
        className="p-6 sm:p-8 text-white hover:text-white/70 active:scale-90 transition-all duration-150 cursor-pointer focus:outline-none flex items-center justify-center"
        title={isActive ? 'Pause (Space)' : 'Play (Space)'}
      >
        {isActive ? (
          <Pause className="w-20 h-20 sm:w-28 sm:h-28 fill-current stroke-none" />
        ) : (
          <Play className="w-20 h-20 sm:w-28 sm:h-28 fill-current stroke-none translate-x-1" />
        )}
      </button>

      {/* Minimal Status Hint */}
      <div className="mt-8 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase text-white/30">
        {isActive ? 'TAP TO PAUSE' : 'TAP TO PLAY'}
      </div>
    </div>
  );
};
