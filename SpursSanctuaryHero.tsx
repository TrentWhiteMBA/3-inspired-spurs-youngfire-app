import React from 'react';
import { 
  Flame, Calendar, ArrowRight, Shield, Heart, 
  BookMarked, Compass, Radio, Sparkles, Video, 
  Sliders, Video as VideoIcon, Download, ExternalLink,
  Users, UserCheck, Bell, Palette, FileText
} from 'lucide-react';

interface SpursSanctuaryHeroProps {
  onNavigate: (dest: string) => void;
  onOpenSettings: () => void;
  isRadioPlaying: boolean;
  onToggleRadio: () => void;
  onOpenRoster?: () => void;
  onOpenZoom?: () => void;
}

export const SpursSanctuaryHero: React.FC<SpursSanctuaryHeroProps> = ({
  onNavigate,
  onOpenSettings,
  isRadioPlaying,
  onToggleRadio,
  onOpenRoster,
  onOpenZoom
}) => {
  const [heroImgLoaded, setHeroImgLoaded] = React.useState(false);

  // 1-Tap Calendar Subscription (.ics generation for Bi-Weekly Monday Small Group)
  const handleDownloadICS = (e: React.MouseEvent) => {
    e.stopPropagation();
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//YoungFire Ministry//Sanctuary Huddle//EN',
      'BEGIN:VEVENT',
      'SUMMARY:YoungFire Small Group - Bi-Weekly Monday Gathering',
      'DESCRIPTION:YoungFire Bi-Weekly Discipleship Huddle & Expository Study. Every other Monday at 7:00 PM CST.',
      'LOCATION:Joshua House of Worship, San Antonio, TX & Zoom',
      'RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO',
      'DTSTART:20261005T190000',
      'DTEND:20261005T203000',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'youngfire_small_group.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Google Calendar direct 1-tap link (Every Other Monday 7:00 PM CST)
  const handleOpenGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=YoungFire+Small+Group+Huddle&dates=20261005T190000/20261005T203000&details=YoungFire+Discipleship+Sanctuary.+Bi-Weekly+Mondays+at+7:00+PM+CST.+Ephesians+4:16.&location=Joshua+House+of+Worship,+San+Antonio,+TX&recur=RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO`;
    window.open(gCalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-transparent text-white pb-32 select-none max-w-lg mx-auto">
      
      {/* 1. SPURS-STYLE HERO BANNER WITH USER'S AUTHENTIC HD PULPIT PHOTO (/image_4.png) */}
      <div className="relative h-[400px] w-full flex flex-col justify-between p-5 bg-[#040711] overflow-hidden rounded-b-3xl">
        {/* Shimmer pulse skeleton while loading */}
        {!heroImgLoaded && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse z-0" />
        )}

        <img
          src="/image_4.png"
          alt="YoungFire Ministry at Joshua House of Worship"
          onLoad={() => setHeroImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${
            heroImgLoaded ? 'opacity-90' : 'opacity-0'
          }`}
          style={{ objectPosition: '50% 20%' }}
        />

        {/* Athletic dark scrim overlay: linear-gradient(180deg, rgba(4,7,17,0.35) 0%, rgba(4,7,17,0.85) 65%, #040711 100%) */}
        <div 
          className="absolute inset-0 pointer-events-none z-1" 
          style={{
            background: 'linear-gradient(180deg, rgba(4, 7, 17, 0.35) 0%, rgba(4, 7, 17, 0.85) 65%, #040711 100%)'
          }}
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-amber-300/30">
              <Flame className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-widest uppercase font-['Outfit'] drop-shadow-md">
                YOUNG<span className="text-amber-400">FIRE</span>
              </h1>
              <p className="text-[10px] text-slate-300 font-mono tracking-widest uppercase drop-shadow">
                Joshua House of Worship &bull; SA, TX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleRadio}
              className={`px-2.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
                isRadioPlaying
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                  : 'bg-black/60 border-white/15 text-slate-300 hover:text-white'
              }`}
              title="Toggle Live Audio"
            >
              <Radio className={`w-3.5 h-3.5 ${isRadioPlaying ? 'animate-pulse text-amber-400' : 'text-slate-400'}`} />
              <span className="text-[11px] font-bold">{isRadioPlaying ? 'Playing' : 'Live Audio'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-black/60 border border-white/20 text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Sanctuary Settings & Voice"
              aria-label="Settings"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Hero Title & Vision (Ephesians 4:16) */}
        <div className="relative z-10 space-y-2 mb-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] tracking-widest uppercase font-mono">
            <span>2026 ANNUAL THEME</span>
            <span className="opacity-75">&bull; EPHESIANS 4:16</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase font-['Outfit'] leading-none text-white drop-shadow-lg">
            REBUILDING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">
              BETTER TOGETHER
            </span>
          </h2>

          <p className="text-xs text-slate-200 font-serif italic max-w-sm line-clamp-2 leading-relaxed drop-shadow">
            "According to the effectual working in the measure of every part, maketh increase of the body unto the edifying of itself in love."
          </p>

          {/* Quick Roster & Zoom Bar */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (onOpenRoster) onOpenRoster();
                else window.dispatchEvent(new CustomEvent('yf_open_roster'));
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Fellowship Roster</span>
            </button>

            <button
              onClick={() => {
                if (onOpenZoom) onOpenZoom();
                else window.dispatchEvent(new CustomEvent('yf_open_zoom'));
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-blue-300 text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all"
            >
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Zoom Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LOWER DASHBOARD (FROSTED SOLID MONOLITH CARDS) */}
      <div className="px-4 space-y-4 -mt-3 relative z-10">
        
        {/* Next Gathering Ticket Card with 1-Tap Calendar */}
        <div className="bg-[#0B1329] border border-amber-500/30 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                  Next Gathering &bull; Bi-Weekly Mondays
                </span>
                <h3 className="text-sm font-black uppercase text-white font-['Outfit']">
                  YoungFire Small Group Huddle
                </h3>
                <p className="text-[11px] text-slate-300 font-mono">
                  Every Other Monday @ 7:00 PM CST &bull; In-Person & Zoom
                </p>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('groups')}
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 cursor-pointer transition-colors"
              title="View Gathering Details"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Calendar & Zoom Actions */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">Add Reminder:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenGoogleCalendar}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3 text-cyan-400" />
                <span>Google Cal</span>
              </button>
              <button
                onClick={handleDownloadICS}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>Apple/iCal (.ics)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick 4-Pillar Action Tiles with Authentic User Photos */}
        <div className="grid grid-cols-2 gap-3">
          {/* Men on Fire */}
          <div 
            onClick={() => onNavigate('men')}
            className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-orange-500/50 cursor-pointer transition-all hover:bg-orange-950/20 group relative overflow-hidden border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <div 
              className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none group-hover:opacity-30 transition-opacity"
              style={{ backgroundImage: `url('/image_6.png')` }}
            />
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-2.5">
                <Shield className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-orange-300 font-['Outfit']">
                Men On Fire
              </h4>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">Iron Sharpens Iron</p>
            </div>
          </div>

          {/* Women Ignited */}
          <div 
            onClick={() => onNavigate('women')}
            className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-rose-500/50 cursor-pointer transition-all hover:bg-rose-950/20 group relative overflow-hidden border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <div 
              className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none group-hover:opacity-30 transition-opacity"
              style={{ backgroundImage: `url('/image_2.png')` }}
            />
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-2.5">
                <Heart className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-rose-300 font-['Outfit']">
                Women Ignited
              </h4>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">Sacred Sisterhood</p>
            </div>
          </div>

          {/* Bible Tracker */}
          <div 
            onClick={() => onNavigate('bibletracker')}
            className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-amber-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-2.5">
              <BookMarked className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-amber-300 font-['Outfit']">
              Bible Tracker
            </h4>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Paper Sword Check-In</p>
          </div>

          {/* Imperial Atlas */}
          <div 
            onClick={() => onNavigate('maps')}
            className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-cyan-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-2.5">
              <Compass className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-cyan-300 font-['Outfit']">
              Imperial Atlas
            </h4>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">66 Books Mapped</p>
          </div>
        </div>

        {/* Discipleship & Media Highlights */}
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              Discipleship & Media
            </span>
            <button 
              onClick={() => onNavigate('hub')}
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1 font-bold"
            >
              <span>All 12 Hubs & Wheel</span>
              <span>&rarr;</span>
            </button>
          </div>

          {/* AI Mentor Card */}
          <div
            onClick={() => onNavigate('counselor')}
            className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-[#0B1329] border border-purple-500/30 flex items-center justify-between cursor-pointer hover:border-purple-400/50 transition-all shadow-lg border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-['Outfit']">Ask AI Young Adult Mentor</h4>
                <p className="text-[10px] text-slate-300 font-mono">Scriptural advice, guidance & prayer</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </div>

          {/* Kingdom Video Vault Card (200+ Videos) */}
          <div
            onClick={() => onNavigate('tv')}
            className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-rose-500/40 flex items-center justify-between cursor-pointer transition-all shadow-lg border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
                <VideoIcon className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-['Outfit']">Kingdom Video Vault & Worship</h4>
                <p className="text-[10px] text-slate-300 font-mono">200+ JHOW sermons, BibleProject & praise</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* 24/7 Gospel Radio Ecosystem (8 Global Stations) */}
          <div
            onClick={() => onNavigate('radio')}
            className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-amber-500/40 flex items-center justify-between cursor-pointer transition-all shadow-lg border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                <Radio className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-['Outfit']">24/7 Gospel Radio Ecosystem</h4>
                <p className="text-[10px] text-slate-300 font-mono">8 global broadcast stations & live streams</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </div>
        </div>

      </div>
    </div>
  );
};
