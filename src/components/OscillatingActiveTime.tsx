import React from 'react';

interface OscillatingActiveTimeProps {
  isActive: boolean;
  elapsedSeconds: number;
}

export const OscillatingActiveTime: React.FC<OscillatingActiveTimeProps> = ({
  isActive,
  elapsedSeconds,
}) => {
  if (!isActive) return null;

  const formatElapsed = (sec: number): string => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 pointer-events-none select-none z-20 overflow-hidden px-4">
      <div className="oscillate-to-and-fro inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/85 border border-white/20 backdrop-blur-md shadow-2xl">
        <span className="w-2 h-2 rounded-full bg-white" />
        <span className="font-mono text-xs sm:text-sm font-black tracking-widest text-white uppercase">
          ACTIVE {formatElapsed(elapsedSeconds)}
        </span>
      </div>
    </div>
  );
};
