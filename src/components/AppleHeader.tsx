import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Keyboard, 
  Download 
} from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface AppleHeaderProps {
  isWakeActive: boolean;
  engineMode: 'native' | 'fallback' | 'none';
  onOpenOled: () => void;
  onOpenShortcuts: () => void;
}

export const AppleHeader: React.FC<AppleHeaderProps> = ({
  isWakeActive,
  engineMode,
  onOpenOled,
  onOpenShortcuts,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    soundEffects.playClick();
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  const handleInstallPwa = async () => {
    if (!installPrompt) return;
    soundEffects.playClick();
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <header className="w-full max-w-4xl mx-auto pt-6 px-4 mb-8">
      <div className="apple-glass rounded-full px-5 py-3 flex items-center justify-between shadow-2xl">
        {/* Brand Logo & Dynamic Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-wider">ON</span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">KeepItON</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Live Engine Diagnostic Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs">
          <span className="relative flex h-2 w-2">
            {isWakeActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isWakeActive ? 'bg-emerald-400' : 'bg-white/30'
              }`}
            ></span>
          </span>
          <span className="text-white/70 font-medium">
            {isWakeActive
              ? engineMode === 'native'
                ? 'Native Screen Lock'
                : 'Fallback Engine'
              : 'Standby'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* OLED Cosmic ScreenSaver Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenOled();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-200 text-xs font-semibold apple-pressable hover:border-purple-400 hover:shadow-lg hover:shadow-purple-900/30 transition-all"
            title="Launch OLED Cosmic Anti-Burn-In Mode (Hotkey: O)"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>OLED Cosmic</span>
          </button>

          {/* PWA Install Button if available */}
          {installPrompt && (
            <button
              onClick={handleInstallPwa}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white apple-pressable transition-colors"
              title="Install Web App"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Shortcuts Info */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenShortcuts();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white apple-pressable transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white apple-pressable transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/p19racha/KeepItON"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white apple-pressable transition-colors"
            title="GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};
