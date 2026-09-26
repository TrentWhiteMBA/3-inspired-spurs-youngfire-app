import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Play, Film, Sparkles, Video, ExternalLink, 
  Search, Bookmark, Check, Music, Heart, Flame 
} from 'lucide-react';
import { 
  CANONICAL_MEDIA_VAULT, 
  cleanYouTubeId, 
  getYouTubeThumbnail 
} from '../data/mediaVaultData';

export const getYouTubeThumb = (id: string) => getYouTubeThumbnail(id, 'hq');

export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  artist?: string;
  speaker?: string;
  category: string;
  duration: string;
  albumArt?: string;
  description?: string;
  thematicFocus?: string;
  lyricsSnippet?: string;
  lyricsText?: string;
  isJhowOfficial?: boolean;
}

const FALLBACK_VIDEOS: VideoItem[] = CANONICAL_MEDIA_VAULT;

interface KingdomVideoVaultProps {
  onBack?: () => void;
  onAudioDucking?: (shouldDuck: boolean) => void;
  onFloatVideo?: (video: VideoItem) => void;
}

export const KingdomVideoVault: React.FC<KingdomVideoVaultProps> = ({ onBack, onAudioDucking, onFloatVideo }) => {
  const [videos, setVideos] = useState<VideoItem[]>(FALLBACK_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<VideoItem>(FALLBACK_VIDEOS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedFavorites, setSavedFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_video_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load items and ensure 1:1 match with verified canonical metadata
  useEffect(() => {
    fetch('/gospel_tracks_200.json')
      .then(res => res.json())
      .then((data: VideoItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map(item => {
            const canonicalMatch = CANONICAL_MEDIA_VAULT.find(c => 
              c.id === item.id || cleanYouTubeId(c.youtubeId) === cleanYouTubeId(item.youtubeId)
            );
            return {
              ...item,
              title: canonicalMatch ? canonicalMatch.title : item.title,
              speaker: canonicalMatch ? (canonicalMatch.speaker || canonicalMatch.artist) : (item.speaker || item.artist || 'YoungFire Praise'),
              description: canonicalMatch ? canonicalMatch.thematicFocus : (item.thematicFocus || item.description || ''),
              thematicFocus: canonicalMatch ? canonicalMatch.thematicFocus : item.thematicFocus,
              lyricsText: canonicalMatch ? canonicalMatch.lyricsText : undefined,
              isJhowOfficial: canonicalMatch ? canonicalMatch.isJhowOfficial : item.isJhowOfficial
            };
          });
          setVideos(normalized);
          setActiveVideo(normalized[0]);
        }
      })
      .catch((err) => {
        console.warn('Could not load gospel_tracks_200.json, using fallback tracks:', err);
      });
  }, []);

  const handleSelectVideo = (v: VideoItem) => {
    setActiveVideo(v);
    if (onAudioDucking) onAudioDucking(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedFavorites.includes(id)
      ? savedFavorites.filter(favId => favId !== id)
      : [...savedFavorites, id];
    setSavedFavorites(updated);
    try {
      localStorage.setItem('youngfire_video_favorites', JSON.stringify(updated));
    } catch {}
  };

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);

  // Dynamic category list from all loaded videos
  const categories = [
    'All',
    'JHOW Sermons & Live',
    'Contemporary Praise & Worship',
    'Bible Book Overviews',
    'Christian Podcasts',
    'Elevation Rhythm & Youth Anthems',
    'Urban Gospel & Classics',
    'Christian Hip-Hop & R&B',
    'Deliverance & Warfare Sessions',
    'Country Gospel & Bluegrass Hymns',
    'Traditional Mass Choir Anthems',
    'Instrumental & Saxophone Soaking',
    'Live 24/7 Gospel TV',
    'YoungFire Testimonies'
  ];

  const filteredVideos = videos.filter(v => {
    if (showOnlyFavorites && !savedFavorites.includes(v.id)) return false;
    const matchesCategory = selectedCategory === 'All' || v.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.speaker || v.artist || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.thematicFocus || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.lyricsSnippet || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-24 select-none px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={() => {
                if (onAudioDucking) onAudioDucking(false);
                onBack();
              }}
              className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-black uppercase font-['Outfit'] text-white">
                KINGDOM VIDEO & TV VAULT
              </h2>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              200+ Full Praise Anthems &bull; JHOW Live Sermons &bull; BibleProject
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
            {videos.length} Videos Loaded
          </span>
        </div>
      </div>

      {/* Official JHOW Links Banner */}
      <div className="p-3 rounded-2xl bg-[#070C1C] border border-white/10 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold uppercase text-[10px]">Joshua House of Worship Official:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://joshuahouseofworship.org/?gad_source=1&gad_campaignid=22511961809&gbraid=0AAAAAokP8RuIRI9d2BQ0D9gIGOHqBstPs&gclid=Cj0KCQjw2t3VBhD8ARIsAK0F6qwAHx2FFX_4sFV9FTMQO4BDJmT1e5E4st2V9pF_5Yo_Ik1tBqMssUQaAi7qEALw_wcB"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3 h-3 text-cyan-400" />
            <span>JHOW Website</span>
          </a>
          <a
            href="https://www.youtube.com/@JoshuaHouseOfWorshipSanAntonio"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3 h-3 text-rose-400" />
            <span>JHOW YouTube Channel</span>
          </a>
          <a
            href="https://www.facebook.com/JoshuaHouseofWorshipSanAntonio/"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3 h-3 text-blue-400" />
            <span>JHOW Facebook</span>
          </a>
        </div>
      </div>

      {/* Main Docked Video Player (16:9 Aspect Ratio) */}
      <div className="bg-[#0B1329] border border-rose-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${cleanYouTubeId(activeVideo.youtubeId)}?autoplay=1&rel=0`}
            title={activeVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {activeVideo.category || 'Kingdom Media'} &bull; {activeVideo.duration}
              </span>
              {activeVideo.isJhowOfficial && (
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  JHOW Official
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onFloatVideo && (
                <button
                  onClick={() => onFloatVideo(activeVideo)}
                  className="text-xs font-mono flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold cursor-pointer transition-colors shadow-sm"
                  title="Keep video playing in draggable small floating window while browsing app"
                >
                  <span>📺 Draggable PIP</span>
                </button>
              )}

              <button
                onClick={(e) => toggleFavorite(activeVideo.id, e)}
                className="text-xs font-mono flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer"
              >
                <Heart className={`w-3.5 h-3.5 ${savedFavorites.includes(activeVideo.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span>{savedFavorites.includes(activeVideo.id) ? 'Favorited' : 'Add to Favorites'}</span>
              </button>
            </div>
          </div>

          <h3 className="text-base sm:text-xl font-bold text-white font-['Outfit']">
            {activeVideo.title}
          </h3>

          <p className="text-xs font-mono text-slate-400">
            Speaker / Worship Leader: <span className="text-amber-300">{activeVideo.speaker || activeVideo.artist}</span>
          </p>

          {activeVideo.thematicFocus && (
            <div className="p-3 bg-slate-950/70 rounded-xl border border-white/5 text-xs text-slate-200 font-serif leading-relaxed">
              <span className="text-amber-400 font-bold block mb-0.5 text-[10px] font-mono uppercase">Thematic Scripture Focus:</span>
              {activeVideo.thematicFocus}
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search 200+ songs, sermons, BibleProject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1329] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 shadow-inner"
            />
          </div>
        </div>

        {/* Category Pills & Favorites Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 border ${
              showOnlyFavorites
                ? 'bg-rose-500 text-slate-950 border-rose-400 font-bold shadow-md'
                : 'bg-[#0B1329] text-rose-300 hover:text-white border-rose-500/30'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-slate-950 text-slate-950' : 'text-rose-400'}`} />
            <span>Favorites ({savedFavorites.length})</span>
          </button>

          {categories.map((cat) => {
            const count = cat === 'All' 
              ? videos.length 
              : videos.filter(v => v.category?.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = !showOnlyFavorites && selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  setShowOnlyFavorites(false);
                  setSelectedCategory(cat);
                  setVisibleCount(36);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-rose-500 text-slate-950 shadow-md font-bold border-rose-400'
                    : 'bg-[#0B1329] text-slate-300 hover:text-white border-white/10'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/30 text-slate-950 font-bold' : 'bg-white/10 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Cards Grid (Displaying 200+ items with pagination or virtualized flow) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1 text-xs font-mono text-slate-400">
          <span>Showing {Math.min(visibleCount, filteredVideos.length)} of {filteredVideos.length} Worship Videos</span>
          {savedFavorites.length > 0 && <span>{savedFavorites.length} Saved in Favorites</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredVideos.slice(0, visibleCount).map((video) => {
            const isActive = activeVideo.id === video.id;
            const isFav = savedFavorites.includes(video.id);

            return (
              <div
                key={video.id}
                onClick={() => handleSelectVideo(video)}
                className={`rounded-2xl overflow-hidden border transition-all cursor-pointer group bg-[#0B1329] flex flex-col justify-between border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${
                  isActive ? 'border-rose-400 shadow-xl shadow-rose-500/20' : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Static crisp dark container while thumbnail loads to prevent layout jumps */}
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={getYouTubeThumb(video.youtubeId)}
                    alt={video.title}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('mqdefault')) {
                        target.src = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-rose-500 text-slate-950 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    {video.duration}
                  </span>
                  {video.isJhowOfficial && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-mono font-black">
                      JHOW
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-mono uppercase text-rose-400 font-bold block truncate">
                      {video.category}
                    </span>
                    <button
                      onClick={(e) => toggleFavorite(video.id, e)}
                      className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 font-['Outfit']">
                    {video.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {video.speaker || video.artist}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredVideos.length && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setVisibleCount(prev => prev + 36)}
              className="px-6 py-2.5 rounded-2xl bg-[#0B1329] border border-rose-500/40 hover:border-rose-400 text-white font-mono text-xs font-bold cursor-pointer transition-all hover:bg-rose-950/20 shadow-lg border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              Load More Praise Videos ({filteredVideos.length - visibleCount} Remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
