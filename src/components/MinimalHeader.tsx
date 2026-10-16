import React from 'react';
import { Maximize2, Minimize2, BatteryCharging, Battery, Waves, VolumeX } from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface MinimalHeaderProps {
  isWakeActive: boolean;
  batteryLevel: number;
  isCharging: boolean;
  isBatterySupported: boolean;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  isWakeActive,
  batteryLevel,
  isCharging,
  isBatterySupported,
  isAudioPlaying,
  onToggleAudio,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
      {/* Brand: Bold, Clean, Minimal */}
      <div className="flex items-center gap-2.5">
        <span
          className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
            isWakeActive ? 'bg-emerald-400 shadow-[0_0_10px_#34c759]' : 'bg-white/20'
          }`}
        />
        <h1 className="text-xl font-black tracking-tighter text-white uppercase select-none">
          KeepItON
        </h1>
      </div>

      {/* Quick Action Icons: Minimalist, Bold */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Battery Pill */}
        {isBatterySupported && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold font-mono text-white/80">
            {isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-white/60" />
            )}
            <span>{batteryLevel}%</span>
          </div>
        )}

        {/* Audio Quick Mute/Play */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onToggleAudio();
          }}
          className={`p-2 rounded-full border apple-pressable transition-all ${
            isAudioPlaying
              ? 'bg-white text-black border-white'
              : 'bg-white/5 text-white/70 hover:text-white border-white/10 hover:bg-white/10'
          }`}
          title="Toggle Ambient Noise (M)"
        >
          {isAudioPlaying ? <Waves className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Fullscreen */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onToggleFullscreen();
          }}
          className="p-2 rounded-full bg-white/5 text-white/70 hover:text-white border border-white/10 hover:bg-white/10 apple-pressable transition-all"
          title="Toggle Fullscreen (F)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
