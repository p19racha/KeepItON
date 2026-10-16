import React from 'react';
import { Power } from 'lucide-react';
import confetti from 'canvas-confetti';
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
    if (!isActive) {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#34C759', '#FFFFFF', '#007AFF'],
      });
    }
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
            <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white drop-shadow-[0_0_50px_rgba(52,199,89,0.25)]">
              AWAKE
            </div>
          )
        ) : (
          <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-neutral-800">
            STANDBY
          </div>
        )}
      </div>

      {/* Hero Power Trigger Button: Stripped down, bold, tactile */}
      <button
        onClick={handleClick}
        className={`group relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center apple-pressable transition-all duration-300 ${
          isActive
            ? 'bg-neutral-950 border-4 border-emerald-400 minimal-glow-green text-emerald-400 shadow-2xl'
            : 'bg-neutral-950 border-2 border-white/20 hover:border-white/50 text-white/40 hover:text-white shadow-xl'
        }`}
        title="Toggle (Space)"
      >
        <Power
          className={`w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300 ${
            isActive ? 'stroke-[3] scale-110 drop-shadow-[0_0_12px_#34c759]' : 'stroke-[2] group-hover:scale-105'
          }`}
        />
      </button>

      {/* Bold Minimal State Line */}
      <div className="mt-8 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase">
        {isActive ? (
          <span className="text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACTIVE {formatElapsed(elapsedSeconds)}</span>
          </span>
        ) : (
          <span className="text-white/30">TAP TO KEEP ON</span>
        )}
      </div>
    </div>
  );
};
