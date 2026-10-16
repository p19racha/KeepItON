import React, { useState, useEffect, useRef } from 'react';
import { useCosmicCanvas } from '../hooks/useCosmicCanvas';
import { X, Maximize2, Minimize2, Sun, Play, Pause } from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface OledCosmicOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isWakeActive: boolean;
  onToggleWake: () => void;
}

export const OledCosmicOverlay: React.FC<OledCosmicOverlayProps> = ({
  isOpen,
  onClose,
  isWakeActive,
  onToggleWake,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [intensity, setIntensity] = useState<number>(1.0);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize full-screen full-brightness smooth color cycle
  useCosmicCanvas(canvasRef, isOpen ? intensity : 0);

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
    }, 2500);
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

  return (
    <div className="fixed inset-0 z-50 bg-black select-none overflow-hidden cursor-default">
      {/* Full-Screen Full-Brightness Color Transition Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-pointer"
        onClick={() => setShowControls((prev) => !prev)}
      />

      {/* Auto-Hiding Minimal Top Controls Bar */}
      <div
        className={`absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/85 border border-white/20 backdrop-blur-xl transition-all duration-300 z-10 shadow-2xl ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Wake Lock Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundEffects.playClick();
            onToggleWake();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase apple-pressable ${
            isWakeActive ? 'bg-white text-black' : 'bg-white/10 text-white/70'
          }`}
          title="Toggle Keep-Awake"
        >
          {isWakeActive ? (
            <Pause className="w-3.5 h-3.5 fill-current stroke-none" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current stroke-none" />
          )}
          <span>{isWakeActive ? 'AWAKE' : 'OFF'}</span>
        </button>

        {/* Dimming Slider */}
        <div
          className="flex items-center gap-1.5 px-2 text-white/70"
          onClick={(e) => e.stopPropagation()}
        >
          <Sun className="w-3.5 h-3.5" />
          <input
            type="range"
            min="0.1"
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
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white apple-pressable"
          title="Fullscreen (F)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Exit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundEffects.playClick();
            onClose();
          }}
          className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white apple-pressable"
          title="Exit (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
