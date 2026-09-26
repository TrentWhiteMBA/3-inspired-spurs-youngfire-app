import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Maximize2, Minimize2, Move, ExternalLink } from 'lucide-react';
import { VideoItem } from './KingdomVideoVault';
import { cleanYouTubeId } from '../data/mediaVaultData';

interface FloatingVideoPlayerProps {
  video: VideoItem | null;
  onClose: () => void;
  onExpand: () => void;
}

export const FloatingVideoPlayer: React.FC<FloatingVideoPlayerProps> = ({
  video,
  onClose,
  onExpand
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const defaultX = Math.max(16, window.innerWidth - 380);
      const defaultY = Math.max(80, window.innerHeight - 300);
      return { x: defaultX, y: defaultY };
    }
    return { x: 20, y: 100 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  // Keep inside screen viewport on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const maxX = Math.max(0, window.innerWidth - 320);
        const maxY = Math.max(0, window.innerHeight - 100);
        return {
          x: Math.min(Math.max(8, prev.x), maxX),
          y: Math.min(Math.max(8, prev.y), maxY)
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer / Touch Drag Handlers with Window Tracking
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    const clientX = e.clientX;
    const clientY = e.clientY;
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y
    };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    const playerWidth = isMinimized ? 240 : 340;
    const playerHeight = isMinimized ? 50 : 260;
    const maxX = Math.max(0, window.innerWidth - playerWidth - 8);
    const maxY = Math.max(0, window.innerHeight - playerHeight - 8);

    const newX = Math.max(8, Math.min(maxX, dragRef.current.initialX + deltaX));
    const newY = Math.max(8, Math.min(maxY, dragRef.current.initialY + deltaY));
    setPosition({ x: newX, y: newY });
  }, [isMinimized]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    setIsDragging(false);
    dragRef.current = null;
    try {
      (e.target as HTMLElement)?.releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  // Global window listeners while dragging to guarantee uninterrupted dragging over iframes
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  if (!video) return null;

  const rawId = video.youtubeId || (video as any).id || '';
  const cleanId = cleanYouTubeId(rawId);

  return (
    <div 
      ref={playerRef}
      className={`fixed top-0 left-0 z-[9999] rounded-2xl overflow-hidden border border-amber-500/60 bg-[#0B1329] backdrop-blur-xl touch-none select-none transition-shadow ${
        isMinimized ? 'w-64 sm:w-72' : 'w-72 sm:w-80 md:w-96'
      }`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        boxShadow: isDragging 
          ? '0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(245, 158, 11, 0.55)'
          : '0 20px 50px rgba(0,0,0,0.85), 0 0 25px rgba(245, 158, 11, 0.35)',
        cursor: isDragging ? 'grabbing' : 'auto',
        willChange: 'transform'
      }}
    >
      {/* Draggable Top Header Handle */}
      <div 
        onPointerDown={handlePointerDown}
        className="bg-[#070C1C] px-3 py-2 flex items-center justify-between border-b border-white/10 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 truncate pr-2 pointer-events-none">
          <Move className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
          <span className="text-[10px] font-mono font-bold text-amber-300 truncate">
            {video.title}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 pointer-events-auto">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            title={isMinimized ? "Show Video" : "Hide Video Frame"}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={onExpand}
            className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/10 cursor-pointer"
            title="Expand to Full TV Screen"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 cursor-pointer"
            title="Close Floating Video"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Video Container (16:9 ratio) */}
      {!isMinimized && cleanId && (
        <div className="relative aspect-video w-full bg-black">
          {/* Transparent overlay while dragging prevents iframe event swallowing */}
          {isDragging && <div className="absolute inset-0 z-20 bg-transparent" />}
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${cleanId}?autoplay=1&enablejsapi=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Mini Info Footer */}
      <div className="px-3 py-1.5 bg-[#0B1329] flex items-center justify-between text-[10px] font-mono border-t border-white/5 select-none">
        <span className="text-slate-300 truncate font-semibold">
          {video.speaker || video.artist || 'Joshua House of Worship'}
        </span>
        <button
          onClick={onExpand}
          className="text-amber-400 hover:underline flex-shrink-0 ml-2 font-bold cursor-pointer"
        >
          Expand &rarr;
        </button>
      </div>
    </div>
  );
};
