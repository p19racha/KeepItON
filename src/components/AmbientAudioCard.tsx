import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Waves, 
  Radio 
} from 'lucide-react';
import type { AmbientSoundType } from '../hooks/useAmbientAudio';
import { soundEffects } from '../utils/appleChime';

interface AmbientAudioCardProps {
  currentSound: AmbientSoundType;
  volume: number;
  onSelectSound: (sound: AmbientSoundType) => void;
  onVolumeChange: (vol: number) => void;
}

export const AmbientAudioCard: React.FC<AmbientAudioCardProps> = ({
  currentSound,
  volume,
  onSelectSound,
  onVolumeChange,
}) => {
  const isPlaying = currentSound !== 'none';

  const soundOptions: { type: AmbientSoundType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: 'none',
      label: 'Mute',
      icon: <VolumeX className="w-4 h-4" />,
      desc: 'Silent',
    },
    {
      type: 'brown',
      label: 'Brown Noise',
      icon: <Waves className="w-4 h-4" />,
      desc: 'Deep focus',
    },
    {
      type: 'rain',
      label: 'Rainfall',
      icon: <CloudRain className="w-4 h-4" />,
      desc: 'Gentle drops',
    },
    {
      type: 'white',
      label: 'White Noise',
      icon: <Radio className="w-4 h-4" />,
      desc: 'Sound masking',
    },
  ];

  return (
    <div className="apple-glass-card rounded-3xl p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/15 text-indigo-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white/90">Ambient Sound</h3>
            <p className="text-xs text-white/50">Procedural relaxation & focus audio</p>
          </div>
        </div>

        {/* Live Audio Animated EQ Bars */}
        {isPlaying && (
          <div className="flex items-end gap-1 h-4 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <span className="w-1 bg-indigo-400 rounded-full animate-pulse h-3"></span>
            <span className="w-1 bg-indigo-400 rounded-full animate-pulse h-4" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 bg-indigo-400 rounded-full animate-pulse h-2" style={{ animationDelay: '0.4s' }}></span>
          </div>
        )}
      </div>

      {/* Sound Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {soundOptions.map((opt) => {
          const isSelected = currentSound === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => {
                soundEffects.playClick();
                onSelectSound(opt.type);
              }}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl apple-pressable transition-all border ${
                isSelected
                  ? 'bg-indigo-600/30 border-indigo-400/50 text-white shadow-lg shadow-indigo-950/40'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <div className={`mb-1.5 ${isSelected ? 'text-indigo-300' : 'text-white/60'}`}>
                {opt.icon}
              </div>
              <span className="text-xs font-semibold">{opt.label}</span>
              <span className="text-[10px] text-white/40 mt-0.5">{opt.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Volume Slider */}
      {isPlaying && (
        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
          <VolumeX className="w-4 h-4 text-white/40" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            title="Volume Slider"
          />
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-white/60 font-mono w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
