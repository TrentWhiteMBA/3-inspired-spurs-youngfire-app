import React, { useState } from "react";

function parseVideoThumbnail(url: string): string[] {
  if (!url) return ["/default-worship-thumb.png"];

  // YouTube match: regular, share, short, embed
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return [
      `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${id}/default.jpg`
    ];
  }

  // Fallback placeholder
  return ["/default-worship-thumb.png"];
}

interface VideoProps {
  title: string;
  videoUrl: string;
  customThumbnail?: string;
  onPlay: () => void;
}

export const WorshipVideoThumbnail: React.FC<VideoProps> = ({ title, videoUrl, customThumbnail, onPlay }) => {
  const fallbacks = parseVideoThumbnail(videoUrl);
  const [index, setIndex] = useState(0);
  const currentSrc = customThumbnail || fallbacks[index] || "/default-worship-thumb.png";

  const handleImgError = () => {
    if (index < fallbacks.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      onClick={onPlay}
      className="relative cursor-pointer rounded-xl overflow-hidden aspect-video bg-neutral-900 border border-amber-500/20 group hover:border-amber-500 transition-all shadow-md"
    >
      <img
        src={currentSrc}
        alt={title}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={handleImgError}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3">
        <p className="text-white text-xs md:text-sm font-semibold truncate w-full">{title}</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
