import React, { useState, useEffect, useRef } from "react";

export const WheelHub: React.FC = () => {
  const [isRotating, setIsRotating] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Smooth continuous auto-rotation loop
  useEffect(() => {
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      if (isRotating && !isDraggingRef.current) {
        setRotationAngle((prev) => (prev + (delta * 0.025)) % 360);
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRotating]);

  // Touch & Pointer interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    setRotationAngle((prev) => (prev + dx * 0.4) % 360);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* Quick Controls HUD: Bell strictly DIRECTLY ABOVE the Theme HUD icon */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3 z-50 pointer-events-auto">
        {/* Notification Bell (Directly above Theme HUD icon) */}
        <button
          className="w-12 h-12 rounded-full bg-slate-900/95 border-2 border-amber-500/60 text-amber-400 flex items-center justify-center shadow-xl hover:border-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer text-lg backdrop-blur-md"
          title="Notification Hub & Alerts"
          aria-label="Notification Alerts"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("yf_open_notifications"));
          }}
        >
          🔔
        </button>

        {/* Theme HUD icon (Bottom Anchor) */}
        <button
          className="w-12 h-12 rounded-full bg-slate-900/95 border-2 border-amber-500/60 text-amber-400 flex items-center justify-center shadow-xl hover:border-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer text-lg backdrop-blur-md"
          title="Theme HUD Controls"
          aria-label="Theme HUD Controls"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("yf_open_theme_hud"));
          }}
        >
          🎨
        </button>
      </div>

      {/* Wheel Hub Canvas Container */}
      <div
        className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Outer glowing halo */}
        <div className="absolute inset-0 rounded-full border border-amber-500/30 blur-sm pointer-events-none" />

        {/* Rotating ring with spokes and portals */}
        <div
          className="absolute inset-4 rounded-full border-2 border-dashed border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex items-center justify-center transition-transform duration-75"
          style={{ transform: `rotate(${rotationAngle}deg)` }}
        >
          {/* Spoke marks around wheel */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              className="absolute w-3 h-3 rounded-full bg-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
              style={{
                transform: `rotate(${deg}deg) translate(0, -130px)`
              }}
            />
          ))}
        </div>

        {/* Central Hub Core */}
        <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[#160B03] via-[#0B1020] to-[#1C0F04] border-2 border-amber-400/70 shadow-[0_0_50px_rgba(245,158,11,0.45)] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-full h-full rounded-full bg-[#060914] border border-amber-500/30 flex flex-col items-center justify-center p-3 text-center">
            <span className="text-2xl mb-1">🔥</span>
            <div className="font-['Cinzel'] font-black text-amber-300 text-xs sm:text-sm tracking-wider uppercase">
              YoungFire
            </div>
            <div className="text-[9px] font-mono text-amber-400/80 uppercase font-bold tracking-widest mt-0.5">
              Sanctuary Realm
            </div>
            <div className="mt-2 text-[8px] font-mono text-slate-400 uppercase tracking-widest">
              {isRotating ? "Auto-Spinning" : "Paused"}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => setIsRotating((prev) => !prev)}
          className={`px-4 py-2 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer shadow-md ${
            isRotating
              ? "bg-amber-500/20 text-amber-300 border-amber-400 hover:bg-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "bg-neutral-900 text-slate-400 border-neutral-700 hover:text-white"
          }`}
        >
          {isRotating ? "☸ Pause Wheel Rotation" : "▶ Start Wheel Rotation"}
        </button>

        <button
          onClick={() => setRotationAngle(0)}
          className="px-3 py-2 text-xs font-mono rounded-xl bg-neutral-900 border border-neutral-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          Reset Angle
        </button>
      </div>
    </div>
  );
};
