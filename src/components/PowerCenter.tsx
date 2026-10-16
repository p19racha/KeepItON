import React from 'react';
import { Power } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/appleChime';

interface PowerCenterProps {
  isActive: boolean;
  onToggle: () => Promise<void>;
  elapsedSeconds: number;
}

export const PowerCenter: React.FC<PowerCenterProps> = ({
  isActive,
  onToggle,
  elapsedSeconds,
}) => {
  const handleClick = async () => {
    soundEffects.playClick();
    if (!isActive) {
      // Gentle celebratory confetti burst on activation
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.45 },
        colors: ['#34C759', '#30D158', '#007AFF', '#5856D6', '#AF52DE'],
      });
    }
    await onToggle();
  };

  const formatElapsed = (sec: number): string => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
    }
    return `${pad(mins)}m ${pad(secs)}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center my-6 sm:my-10 relative">
      {/* Dynamic Background Aura Glow */}
      <div
        className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full transition-all duration-1000 -z-10 blur-3xl pointer-events-none ${
          isActive
            ? 'bg-emerald-500/25 scale-110'
            : 'bg-white/5 scale-90 opacity-40'
        }`}
      />

      {/* Hero Outer Concentric Rings */}
      <div className="relative flex items-center justify-center">
        {isActive && (
          <>
            <span className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-emerald-500/30 animate-ping opacity-40 pointer-events-none" />
            <span className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-emerald-400/20 pointer-events-none" />
          </>
        )}

        {/* Tactile Cupertino Power Button */}
        <button
          onClick={handleClick}
          className={`relative group w-44 h-44 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center apple-pressable transition-all duration-500 cursor-pointer ${
            isActive
              ? 'apple-glass bg-emerald-950/40 border-2 border-emerald-400/60 apple-glow-green shadow-2xl shadow-emerald-900/50'
              : 'apple-glass bg-neutral-900/40 border border-white/15 hover:border-white/30 hover:bg-neutral-800/40 shadow-xl'
          }`}
          title="Toggle Keep Screen Awake (Hotkey: Space)"
        >
          {/* Inner Disc with Specular Top Highlight */}
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${
              isActive
                ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-900/40 border border-emerald-400/40'
                : 'bg-gradient-to-b from-white/10 to-white/0 border border-white/10 group-hover:border-white/20'
            }`}
          >
            <Power
              className={`w-14 h-14 sm:w-16 sm:h-16 transition-all duration-500 ${
                isActive
                  ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,199,89,0.8)] scale-105'
                  : 'text-white/40 group-hover:text-white/80 group-hover:scale-105'
              }`}
              strokeWidth={isActive ? 2.5 : 1.75}
            />

            <span
              className={`text-xs font-semibold uppercase tracking-widest mt-2 transition-colors duration-300 ${
                isActive ? 'text-emerald-300 font-bold' : 'text-white/50 group-hover:text-white/75'
              }`}
            >
              {isActive ? 'Kept ON' : 'Turn ON'}
            </span>
          </div>
        </button>
      </div>

      {/* Status Description & Ticker */}
      <div className="mt-6 text-center">
        <h2 className="text-xl sm:text-2xl font-light tracking-tight text-white/95">
          {isActive ? 'Your Screen is Kept Awake' : 'Ready to Keep Screen Awake'}
        </h2>

        <p className="text-sm text-white/50 mt-1 font-normal flex items-center justify-center gap-2">
          {isActive ? (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active duration: <strong className="font-mono text-emerald-300 font-medium">{formatElapsed(elapsedSeconds)}</strong></span>
            </>
          ) : (
            <span>Click the button or tap <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 text-xs font-mono">Space</kbd></span>
          )}
        </p>
      </div>
    </div>
  );
};
