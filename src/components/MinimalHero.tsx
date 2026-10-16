import React from 'react';
import { Play, Pause } from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface MinimalHeroProps {
  isActive: boolean;
  onToggle: () => Promise<void>;
  isTimed: boolean;
  formattedRemaining: string;
  elapsedSeconds: number;
}

export const MinimalHero: React.FC<MinimalHeroProps> = ({
  isActive,
  onToggle,
  isTimed,
  formattedRemaining,
  elapsedSeconds,
}) => {
  const handleClick = async () => {
    soundEffects.playClick();
    await onToggle();
  };

  const formatElapsed = (sec: number): string => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center my-8 sm:my-14 select-none">
      {/* Massive Bold Headline / Countdown */}
      <div className="mb-6 sm:mb-10 text-center">
        {isActive ? (
          isTimed ? (
            <div className="font-mono text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white">
              {formattedRemaining}
            </div>
          ) : (
            <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white">
              AWAKE
            </div>
          )
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

      {/* Bold Minimal State Line */}
      <div className="mt-6 sm:mt-8 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase">
        {isActive ? (
          <span className="text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>ACTIVE {formatElapsed(elapsedSeconds)}</span>
          </span>
        ) : (
          <span className="text-white/30">TAP TO KEEP ON</span>
        )}
      </div>
    </div>
  );
};
