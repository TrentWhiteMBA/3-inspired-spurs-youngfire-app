import React, { useEffect } from 'react';

interface BroadcastStingerProps {
  show: boolean;
  onComplete: () => void;
}

export const BroadcastStingerWipe: React.FC<BroadcastStingerProps> = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 750); // Snappy 750ms broadcast cutoff
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#040711] flex items-center justify-center pointer-events-auto select-none overflow-hidden">
      {/* 1. Spurs-Style 15-Degree Dynamic Slash Accents */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[180%] h-36 bg-gradient-to-r from-transparent via-amber-500/25 to-transparent -rotate-12 transform scale-x-125 animate-pulse" />
      </div>

      {/* 2. Centered Identity Monolith */}
      <div className="relative z-10 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
        {/* Emblem Container with Subtle Backlit Amber Glow */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-amber-500/25 blur-2xl animate-ping" />
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/40 border border-white/20">
            <span className="text-4xl filter drop-shadow">🔥</span>
          </div>
        </div>

        {/* High-Contrast Athletic Typography */}
        <div className="text-center space-y-0.5">
          <h2 className="text-xl font-black uppercase tracking-[0.25em] text-white font-['Outfit']">
            YOUNG<span className="text-amber-400">FIRE</span>
          </h2>
          <p className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-slate-400">
            JOSHUA HOUSE OF WORSHIP
          </p>
        </div>
      </div>
    </div>
  );
};
