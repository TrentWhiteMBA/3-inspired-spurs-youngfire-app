import React, { useState, useEffect, useRef } from "react";

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  location: string;
  streamUrl: string;
  accentColor: string;
  description: string;
}

export const GOSPEL_STATIONS: RadioStation[] = [
  {
    id: "youngfire-core",
    name: "Kingdom Flame 24/7 Global Radio",
    genre: "Urban & Global Kingdom Worship",
    location: "San Antonio, TX / Global",
    streamUrl: "https://stream.0nlineradio.com/gospel?ref=radiobrowser",
    accentColor: "#F59E0B",
    description: "Continuous high-praise gospel, contemporary Kingdom anthems, and powerful worship declarations."
  },
  {
    id: "cbn-southern-gospel",
    name: "CBN Southern Gospel Anthems",
    genre: "Southern Gospel & Quartets",
    location: "Virginia Beach, VA",
    streamUrl: "https://streams.cbnradio.com//southern-gospel-128K",
    accentColor: "#EAB308",
    description: "Soulful southern gospel melodies, four-part vocal harmonies, and classic resurrection praise."
  },
  {
    id: "worship-lift",
    name: "Worship 24/7 & Modern Praise",
    genre: "Contemporary Christian Worship",
    location: "Nashville, TN",
    streamUrl: "https://emg.streamguys1.com/lift-website",
    accentColor: "#0EA5E9",
    description: "Modern elevation praise, passionate altar worship, and stadium gospel anthems."
  },
  {
    id: "afrobeats-gospel",
    name: "Afrobeats & African Praise",
    genre: "Afro-Gospel & Highlife",
    location: "Lagos / London",
    streamUrl: "https://stream.zeno.fm/zyd9stmdlnlvv",
    accentColor: "#F97316",
    description: "Energetic African gospel rhythms, joyful dance worship, and vibrant diaspora praise."
  },
  {
    id: "gospel-east-africa",
    name: "Gospel Radio East Africa",
    genre: "East African Gospel & Praise",
    location: "Nairobi, Kenya",
    streamUrl: "https://c32.radioboss.fm:18451/stream",
    accentColor: "#10B981",
    description: "Vibrant Swahili praise, heartfelt adoration, and East African choir harmonies."
  },
  {
    id: "sanctuary-piano",
    name: "Sanctuary Soaking Piano & Hymns",
    genre: "Instrumental Worship & Meditation",
    location: "Global Prayer Room",
    streamUrl: "https://s.ruworship.ru:4045/stream",
    accentColor: "#8B5CF6",
    description: "Peaceful acoustic piano, soaking worship chords, and calm prayer room atmospheres."
  },
  {
    id: "rejoice-gospel",
    name: "Rejoice Musical Soul Food",
    genre: "Traditional & Modern Gospel",
    location: "Atlanta, GA",
    streamUrl: "https://stream.zeno.fm/4wvy4v6v2zquv",
    accentColor: "#EC4899",
    description: "Inspirational gospel anthems, uplifting choir ministrations, and holy spirit joy."
  },
  {
    id: "christmas-gospel",
    name: "Sanctuary Seasonal & Holy Praise",
    genre: "Worship Classics & Seasonal",
    location: "Jerusalem & Worldwide",
    streamUrl: "https://streams.cbnradio.com//christmas-128K",
    accentColor: "#14B8A6",
    description: "Heartfelt adoration of our King, seasonal gospel melodies, and sacred worship."
  }
];

interface LyricLine {
  time: number;
  text: string;
}

export interface LiveRadioPlayerProps {
  stationUrl?: string;
  metaApiUrl?: string;
  onBack?: () => void;
  onAudioDucking?: (shouldDuck: boolean) => void;
  activeStationId?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onSelectStation?: (station: RadioStation) => void;
  volume?: number;
  onVolumeChange?: (vol: number) => void;
}

export const LiveRadioPlayer: React.FC<LiveRadioPlayerProps> = ({
  stationUrl,
  metaApiUrl,
  onBack,
  onAudioDucking,
  activeStationId,
  isPlaying: isPlayingProp,
  onTogglePlay,
  onSelectStation,
  volume: volumeProp,
  onVolumeChange
}) => {
  const [selectedStationIndex, setSelectedStationIndex] = useState(() => {
    if (activeStationId) {
      const idx = GOSPEL_STATIONS.findIndex(s => s.id === activeStationId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [currentTrack, setCurrentTrack] = useState({ artist: "", title: "" });
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (activeStationId) {
      const idx = GOSPEL_STATIONS.findIndex(s => s.id === activeStationId);
      if (idx !== -1) {
        setSelectedStationIndex(idx);
      }
    }
  }, [activeStationId]);

  const effectivePlaying = isPlayingProp !== undefined ? isPlayingProp : isPlaying;
  const effectiveVolume = volumeProp !== undefined ? volumeProp : volume;

  const activeStation = GOSPEL_STATIONS[selectedStationIndex] || GOSPEL_STATIONS[0];
  const activeUrl = stationUrl || activeStation.streamUrl;

  const handleSelectStation = (index: number) => {
    setSelectedStationIndex(index);
    setIsDropdownOpen(false);
    const station = GOSPEL_STATIONS[index];
    if (onSelectStation) {
      onSelectStation(station);
    }
    if (!onTogglePlay && audioRef.current) {
      audioRef.current.src = station.streamUrl;
      if (effectivePlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
    // Sync with global custom event
    try {
      localStorage.setItem("yf_broadcast_station_id", station.id);
      window.dispatchEvent(new CustomEvent("yf_station_switched", { detail: { station } }));
    } catch {}
  };

  const togglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay();
      return;
    }
    if (!audioRef.current) return;
    if (effectivePlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Play error:", e);
      });
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (onVolumeChange) {
      onVolumeChange(newVol);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  // Poll current song metadata
  useEffect(() => {
    if (!metaApiUrl) {
      setCurrentTrack({
        artist: activeStation.genre,
        title: `${activeStation.name} — Live Broadcast`
      });
      return;
    }

    const fetchMeta = async () => {
      try {
        const res = await fetch(metaApiUrl);
        const data = await res.json();
        const artist = data.artist || data.current_song?.artist || activeStation.genre;
        const title = data.title || data.current_song?.title || `${activeStation.name} — Live`;

        if (artist !== currentTrack.artist || title !== currentTrack.title) {
          setCurrentTrack({ artist, title });
        }
      } catch (e) {
        console.warn("Stream metadata notice:", e);
      }
    };

    fetchMeta();
    const interval = setInterval(fetchMeta, 12000);
    return () => clearInterval(interval);
  }, [metaApiUrl, activeStation, currentTrack.artist, currentTrack.title]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-950/95 border-2 border-amber-500/40 rounded-3xl shadow-2xl relative select-none">
      {!onTogglePlay && (
        <audio
          ref={audioRef}
          src={activeUrl}
          preload="none"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Header bar: Title & Stations Dropdown Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-md"
            style={{ backgroundColor: `${activeStation.accentColor}25`, border: `1px solid ${activeStation.accentColor}60` }}
          >
            📻
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                LIVE GOSPEL BROADCAST
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" /> ON AIR
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 font-['Cinzel'] mt-0.5 truncate max-w-xs sm:max-w-md">
              {activeStation.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {activeStation.genre} • {activeStation.location}
            </p>
          </div>
        </div>

        {/* Action Controls & Stations Button */}
        <div className="flex items-center gap-2 relative">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="Return to Sanctuary"
            >
              <span>← Back</span>
            </button>
          )}

          {/* Gospel Stations Dropdown Button */}
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border-2 border-amber-400/80 text-amber-300 font-mono font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md hover:scale-102 transition-all"
            title="Choose from 8 Live Gospel Radio Stations"
          >
            <span>📻 Stations ({GOSPEL_STATIONS.length})</span>
            <span className={`text-xs transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`px-4 sm:px-5 py-2 font-mono font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              effectivePlaying
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/30"
                : "bg-slate-800 text-amber-300 border border-amber-500/40 hover:bg-slate-700"
            }`}
          >
            <span>{effectivePlaying ? "⏸ Pause Stream" : "▶ Listen Live"}</span>
          </button>
        </div>
      </div>

      {/* DROPDOWN MENU MODAL: Displays all 8 Gospel Stations with high visibility */}
      {isDropdownOpen && (
        <>
          {/* Backdrop click dismiss */}
          <div
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* High-visibility Stations List Dropdown */}
          <div className="fixed sm:absolute right-2 sm:right-6 top-16 sm:top-20 w-[calc(100vw-1.5rem)] sm:w-96 max-w-[420px] p-3 bg-[#0A0F1E] border-2 border-amber-500/70 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.98)] z-[130] animate-in fade-in zoom-in-95 duration-150 flex flex-col backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-1">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📻</span> Select Gospel Station (8 Available)
              </span>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {GOSPEL_STATIONS.map((st, idx) => {
                const isSelected = idx === selectedStationIndex;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStation(idx)}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/25 border-2 border-amber-400 text-amber-200 shadow-md font-bold"
                        : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: st.accentColor }}
                        />
                        <span className="text-xs truncate font-bold text-slate-100">
                          {st.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block truncate mt-0.5">
                        {st.genre} • {st.location}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[9px] uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Volume Controller & Stream Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-xs text-slate-400 font-mono">🔊 Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={effectiveVolume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full max-w-xs h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <span className="text-xs font-mono text-amber-400 w-9">{Math.round(effectiveVolume * 100)}%</span>
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>Bitrate: 128 kbps MP3</span>
          <span>•</span>
          <span className="text-amber-400/90 font-semibold">{activeStation.location}</span>
        </div>
      </div>

      {/* Live Lyrics Box */}
      <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-center space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80 font-bold">
          24/7 PRAISE ANTHEM & LYRICS STREAM
        </div>
        <div className="text-sm font-semibold text-amber-200">
          {currentTrack.title}
        </div>
        <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs text-slate-300 font-sans pt-2">
          {lyrics.length > 0 ? (
            lyrics.map((l, i) => <p key={i} className="py-0.5">{l.text}</p>)
          ) : (
            <p className="text-slate-500 italic py-2">
              "Praise the Lord! Sing to the Lord a new song, His praise in the assembly of the saints." — Psalm 149:1
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
