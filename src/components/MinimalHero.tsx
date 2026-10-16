import React from 'react';
import { Power } from 'lucide-react';
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
      <div className="mb-8 sm:mb-12 text-center">
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

      {/* Hero Power Trigger Button: Pure Monochrome, High Contrast */}
      <button
        onClick={handleClick}
        className={`group relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center apple-pressable transition-colors duration-150 ${
          isActive
            ? 'bg-white border-4 border-white text-black shadow-2xl'
            : 'bg-neutral-950 border-2 border-white/20 hover:border-white/50 text-white/40 hover:text-white shadow-xl'
        }`}
        title="Toggle (Space)"
      >
        <Power
          className={`w-14 h-14 sm:w-16 sm:h-16 ${
            isActive ? 'stroke-[3]' : 'stroke-[2]'
          }`}
        />
      </button>

      {/* Bold Minimal State Line */}
      <div className="mt-8 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase">
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
