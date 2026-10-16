import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { soundEffects } from '../utils/appleChime';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Toggle Keep-Awake ON / OFF' },
    { key: 'O', desc: 'Launch OLED Cosmic Anti-Burn Mode' },
    { key: 'F', desc: 'Toggle Fullscreen Mode' },
    { key: 'M', desc: 'Mute / Play Ambient Audio' },
    { key: '1 - 6', desc: 'Switch Timer Presets (Always ON, 15m, 30m...)' },
    { key: 'Esc', desc: 'Close dialogs or exit OLED mode' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="apple-glass-card rounded-3xl p-6 sm:p-8 w-full max-w-md border border-white/20 shadow-2xl relative">
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white apple-pressable"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-white/10 text-white">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
            <p className="text-xs text-white/50">Control KeepItON hands-free</p>
          </div>
        </div>

        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-xs text-white/70">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white font-mono text-xs shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 text-center">
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold apple-pressable"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
