import React, { useState, useEffect, useRef } from 'react';
import { useCosmicCanvas } from '../hooks/useCosmicCanvas';
import { X, Maximize2, Minimize2, Sun, Play, Pause } from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface OledCosmicOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isWakeActive: boolean;
  onToggleWake: () => void;
  elapsedSeconds: number;
}

export const OledCosmicOverlay: React.FC<OledCosmicOverlayProps> = ({
  isOpen,
  onClose,
  isWakeActive,
  onToggleWake,
  elapsedSeconds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [intensity, setIntensity] = useState<number>(0.85);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Anti-burn-in continuous slow coordinate drift
  const [driftOffset, setDriftOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize canvas animation
  useCosmicCanvas(canvasRef, isOpen ? intensity : 0);

  // Time & date clock tick
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Organic slow drift calculation (Lissajous curve drift)
      const t = now.getTime() * 0.00015;
      const dx = Math.sin(t) * 35 + Math.cos(t * 0.6) * 15;
      const dy = Math.cos(t * 0.8) * 25 + Math.sin(t * 0.4) * 10;
      setDriftOffset({ x: dx, y: dy });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-hide controls after inactivity
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    if (!isOpen) return;
    resetHideTimer();
    const handleMove = () => resetHideTimer();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        soundEffects.playClick();
        onToggleWake();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onToggleWake]);

  const toggleFullscreen = async () => {
    soundEffects.playClick();
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  if (!isOpen) return null;

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const dateFormatted = currentTime.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black select-none overflow-hidden cursor-default">
      {/* 60fps OLED Anti-Burn-In Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ filter: `brightness(${intensity})` }}
      />

      {/* Minimal Top Controls Bar */}
      <div
        className={`absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/70 border border-white/15 backdrop-blur-xl transition-all duration-300 z-10 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Wake Lock Toggle */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onToggleWake();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase apple-pressable ${
            isWakeActive ? 'bg-white text-black' : 'bg-white/10 text-white/70'
          }`}
        >
          {isWakeActive ? (
            <Pause className="w-3.5 h-3.5 fill-current stroke-none" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current stroke-none" />
          )}
          <span>{isWakeActive ? 'AWAKE' : 'OFF'}</span>
        </button>

        {/* Dimming Slider */}
        <div className="flex items-center gap-1.5 px-2 text-white/60">
          <Sun className="w-3.5 h-3.5" />
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-16 accent-white cursor-pointer h-1 bg-white/20 rounded-lg appearance-none"
            title="Brightness"
          />
        </div>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white apple-pressable"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Close */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white apple-pressable"
          title="Exit"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Organically-Drifting Ultra-Bold Clock */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${driftOffset.x}px, ${driftOffset.y}px)`,
        }}
      >
        {/* Bold Minimal Status Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md mb-4 text-xs font-black font-mono tracking-wider text-white uppercase">
          <span
            className={`w-2 h-2 rounded-full ${isWakeActive ? 'bg-white' : 'bg-white/30'}`}
          />
          <span>{isWakeActive ? 'KEEP ON' : 'STANDBY'}</span>
          {isWakeActive && (
            <>
              <span className="text-white/40">•</span>
              <span>{formatElapsed(elapsedSeconds)}</span>
            </>
          )}
        </div>

        {/* Massive Bold Time */}
        <div className="text-8xl sm:text-[11rem] md:text-[14rem] font-black tracking-tighter text-white leading-none drop-shadow-2xl font-mono">
          {hours}:{minutes}
        </div>

        {/* Bold Minimal Date */}
        <div className="mt-4 text-sm sm:text-base font-black tracking-widest text-white/50 uppercase">
          {dateFormatted}
        </div>
      </div>
    </div>
  );
};
