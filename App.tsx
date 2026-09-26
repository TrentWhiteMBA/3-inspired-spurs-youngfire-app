import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AVAILABLE_LAUNCH_TRACKS, LaunchTrackOption } from './data/launchTracks';
import { GOSPEL_STATIONS, RadioStation } from './data/radioStations';
import { SpursSanctuaryHero } from './components/SpursSanctuaryHero';
import { BiblicalMaps } from './components/BiblicalMaps';
import { FellowshipHub } from './components/FellowshipHub';
import { BottomNavBar } from './components/BottomNavBar';
import { BroadcastStingerWipe } from './components/BroadcastStingerWipe';
import { SettingsHUDModal, CurrentUser } from './components/SettingsHUDModal';
import { AuthSecurityPortal } from './components/AuthSecurityPortal';
import { PhysicalBibleTracker } from './components/PhysicalBibleTracker';
import { AIMentorCounselor } from './components/AIMentorCounselor';
import { KingdomVideoVault, VideoItem } from './components/KingdomVideoVault';
import { LiveVoiceSanctuary } from './components/LiveVoiceSanctuary';
import { AdminCMSModal } from './components/AdminCMSModal';
import { ReadingProgressModal } from './components/ReadingProgressModal';
import { ScriptureViewer } from './components/ScriptureViewer';
import { LiveRadioPlayer } from './components/LiveRadioPlayer';
import { FloatingVideoPlayer } from './components/FloatingVideoPlayer';
import { MemberRosterModal } from './components/MemberRosterModal';
import { ZoomMeetingModal } from './components/ZoomMeetingModal';
import { NotesHUDModal } from './components/NotesHUDModal';
import { ThemeHUDModal, APP_THEMES } from './components/ThemeHUDModal';
import { Radio, Volume2, VolumeX, Sparkles, BookOpen, Compass, Music, Bell, X, CheckCircle2 } from 'lucide-react';

interface ActiveAudioStream {
  id: string;
  name: string;
  genreOrArtist: string;
  streamUrl: string;
  isRadio: boolean;
  accentColor?: string;
}

export default function App() {
  // 1. Authentication State (Pre-authenticated default for Trent White / Lead Overseer)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const saved = localStorage.getItem('youngfire_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.gender) {
          parsed.gender = parsed.email?.toLowerCase().includes('whitney') ? 'female' : 'male';
        }
        return parsed;
      }
      return { 
        id: 'admin-trent-1', 
        name: 'Trent D. White', 
        email: 'trentwhite0308@gmail.com', 
        gender: 'male',
        avatar: '/image_4.png',
        isAdmin: true 
      };
    } catch {
      return { 
        id: 'admin-trent-1', 
        name: 'Trent D. White', 
        email: 'trentwhite0308@gmail.com', 
        gender: 'male',
        avatar: '/image_4.png',
        isAdmin: true 
      };
    }
  });

  // 2. Navigation State ('sanctuary' | 'word' | 'fellowship' | 'mentor' | 'bibletracker' | 'tv' | 'radio')
  const [activeTab, setActiveTab] = useState<string>('sanctuary');
  const [wordSubView, setWordSubView] = useState<'bible' | 'atlas'>('bible');
  const [scripturePassage, setScripturePassage] = useState<{ bookId: string; chapter: number }>({
    bookId: 'EPH',
    chapter: 4
  });
  const [fellowshipInitialDrillDown, setFellowshipInitialDrillDown] = useState<string | null>(null);

  // Broadcast Stinger Wipe
  const [stingerActive, setStingerActive] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // New Global Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isVoiceSanctuaryOpen, setIsVoiceSanctuaryOpen] = useState<boolean>(false);
  const [isProgressOpen, setIsProgressOpen] = useState<boolean>(false);
  const [isAdminCMSOpen, setIsAdminCMSOpen] = useState<boolean>(false);
  const [isRosterOpen, setIsRosterOpen] = useState<boolean>(false);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isThemeOpen, setIsThemeOpen] = useState<boolean>(false);
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return localStorage.getItem('youngfire_theme_id') || 'spurs-silver';
  });

  const activeTheme = useMemo(() => {
    return APP_THEMES.find(t => t.id === currentThemeId) || APP_THEMES[0];
  }, [currentThemeId]);

  // Synchronize color palette across app, localStorage, and CSS custom properties
  useEffect(() => {
    const handleThemeApplied = (e: Event) => {
      const customEv = e as CustomEvent<{ themeId: string }>;
      if (customEv?.detail?.themeId) {
        setCurrentThemeId(customEv.detail.themeId);
      }
    };
    window.addEventListener('yf_theme_applied', handleThemeApplied);
    return () => window.removeEventListener('yf_theme_applied', handleThemeApplied);
  }, []);

  useEffect(() => {
    if (activeTheme) {
      document.documentElement.style.setProperty('--theme-bg', activeTheme.bgHex);
      document.documentElement.style.setProperty('--theme-card', activeTheme.cardHex);
      document.documentElement.style.setProperty('--theme-accent', activeTheme.accentHex);
      document.documentElement.style.setProperty('--theme-border', activeTheme.borderHex);
      document.body.style.backgroundColor = activeTheme.bgHex;
    }
  }, [activeTheme]);

  // Floating Mini-Player for Kingdom Videos
  const [floatingVideo, setFloatingVideo] = useState<VideoItem | null>(null);

  // Notification Banner
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Sound Controls
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.85);

  // 3. Centralized Audio Stream State (Radio or Launch Track playing in background across all tabs)
  const [selectedLaunchTrack, setSelectedLaunchTrack] = useState<LaunchTrackOption>(() => {
    return AVAILABLE_LAUNCH_TRACKS[0];
  });

  const [activeAudio, setActiveAudio] = useState<ActiveAudioStream>(() => {
    const defaultTrack = AVAILABLE_LAUNCH_TRACKS[0];
    return {
      id: defaultTrack.id,
      name: defaultTrack.title,
      genreOrArtist: defaultTrack.artist,
      streamUrl: defaultTrack.audioUrl,
      isRadio: true,
      accentColor: defaultTrack.accentColor || '#F59E0B'
    };
  });

  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and synchronize persistent background audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(activeAudio.streamUrl);
      audioRef.current.loop = !activeAudio.isRadio;
    } else {
      audioRef.current.src = activeAudio.streamUrl;
      audioRef.current.loop = !activeAudio.isRadio;
      if (isAudioPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
    audioRef.current.volume = masterVolume;
  }, [activeAudio.streamUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = masterVolume;
    }
  }, [masterVolume]);

  // Autoplay handler with touch-unblock listener
  useEffect(() => {
    let triggered = false;
    const startLaunchAudio = () => {
      if (!triggered && audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsAudioPlaying(true);
            triggered = true;
          })
          .catch(() => {});
        window.removeEventListener('click', startLaunchAudio);
        window.removeEventListener('touchstart', startLaunchAudio);
      }
    };

    const timer = setTimeout(startLaunchAudio, 800);
    window.addEventListener('click', startLaunchAudio);
    window.addEventListener('touchstart', startLaunchAudio);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', startLaunchAudio);
      window.removeEventListener('touchstart', startLaunchAudio);
    };
  }, []);

  // Listen to Global Custom Events
  useEffect(() => {
    const handleOpenRoster = () => setIsRosterOpen(true);
    const handleOpenZoom = () => setIsZoomOpen(true);
    const handleOpenNotes = () => setIsNotesOpen(true);
    const handleOpenTheme = () => setIsThemeOpen(true);
    const handleNotifications = () => {
      setNotificationToast("🔔 YoungFire Sanctuary Alert: Tuesday Discipleship Huddle at 7:00 PM CST (In-Person & Zoom). 2026 Theme: Rebuilding Better Together (Ephesians 4:16).");
      setTimeout(() => setNotificationToast(null), 6000);
    };

    window.addEventListener('yf_open_roster', handleOpenRoster);
    window.addEventListener('yf_open_zoom', handleOpenZoom);
    window.addEventListener('yf_open_study_notes', handleOpenNotes);
    window.addEventListener('yf_open_theme_hud', handleOpenTheme);
    window.addEventListener('yf_open_notifications', handleNotifications);

    return () => {
      window.removeEventListener('yf_open_roster', handleOpenRoster);
      window.removeEventListener('yf_open_zoom', handleOpenZoom);
      window.removeEventListener('yf_open_study_notes', handleOpenNotes);
      window.removeEventListener('yf_open_theme_hud', handleOpenTheme);
      window.removeEventListener('yf_open_notifications', handleNotifications);
    };
  }, []);

  // Audio Ducking (for Video Vault, AI Voice Mentor, or Scripture Narration)
  const handleAudioDucking = (shouldDuck: boolean) => {
    if (!audioRef.current) return;
    if (shouldDuck) {
      audioRef.current.volume = 0.1;
    } else {
      audioRef.current.volume = masterVolume;
    }
  };

  // Toggle Audio Playback
  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsAudioPlaying(true))
        .catch(() => {});
    }
  };

  // Switch Radio Station (keeps playing across all tabs)
  const handleSelectRadioStation = (station: RadioStation) => {
    setActiveAudio({
      id: station.id,
      name: station.name,
      genreOrArtist: `${station.genre} • ${station.location}`,
      streamUrl: station.streamUrl,
      isRadio: true,
      accentColor: station.accentColor
    });
    if (audioRef.current) {
      audioRef.current.src = station.streamUrl;
      audioRef.current.loop = false;
      audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => {});
    }
  };

  // Stinger Wipe Navigation Transition
  const handleNavigateWithStinger = (targetTab: string, subView?: 'bible' | 'atlas') => {
    if (targetTab === activeTab && !subView) return;
    if (subView) setWordSubView(subView);

    if (targetTab === 'bibletracker' || (activeTab === 'word' && targetTab === 'word')) {
      setActiveTab(targetTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setPendingTab(targetTab);
    setStingerActive(true);
  };

  const handleStingerComplete = () => {
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setStingerActive(false);
  };

  // Direct Scripture Deep-Linking
  const handleDeepLinkToScripture = (bookId: string, chapter: number) => {
    setScripturePassage({ bookId, chapter });
    setWordSubView('bible');
    setActiveTab('word');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User Authentication Logout
  const handleLogout = () => {
    localStorage.removeItem('youngfire_user_session');
    setCurrentUser(null);
    setIsSettingsOpen(false);
  };

  // If not logged in, render Auth Gate
  if (!currentUser) {
    return (
      <AuthSecurityPortal
        onAuthenticated={(user) => {
          localStorage.setItem('youngfire_user_session', JSON.stringify(user));
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div 
      className="min-h-screen text-white flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-black font-['Outfit'] transition-colors duration-500"
      style={{ backgroundColor: activeTheme.bgHex }}
    >
      {/* Dynamic Ambient Theme Glow: shifts hue smoothly based on the active liturgical color palette */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[420px] pointer-events-none z-0 opacity-25 blur-3xl transition-all duration-700"
        style={{ 
          background: `radial-gradient(circle at 50% 10%, ${activeTheme.accentHex} 0%, ${activeTheme.cardHex} 50%, transparent 80%)` 
        }}
      />
      
      {/* 1. Notification Toast */}
      {notificationToast && (
        <div className="fixed top-4 inset-x-4 max-w-lg mx-auto z-50 p-4 rounded-2xl bg-[#0B1329] border border-amber-500/60 text-white shadow-2xl flex items-start justify-between gap-3 animate-slideDown">
          <div className="flex items-start gap-2.5">
            <Bell className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-mono text-slate-200 leading-relaxed">{notificationToast}</p>
          </div>
          <button
            onClick={() => setNotificationToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Spurs-Style Full Screen Broadcast Stinger Wipe */}
      <BroadcastStingerWipe 
        show={stingerActive} 
        onComplete={handleStingerComplete} 
      />

      {/* 3. Main Content Views */}
      <main className="flex-1 pb-36">
        {/* PILLAR 1: SANCTUARY (HOME) */}
        {activeTab === 'sanctuary' && (
          <SpursSanctuaryHero
            onNavigate={(dest) => {
              if (dest === 'bibletracker') setActiveTab('bibletracker');
              else if (dest === 'maps') {
                setWordSubView('atlas');
                handleNavigateWithStinger('word');
              } else if (dest === 'counselor') {
                handleNavigateWithStinger('mentor');
              } else if (dest === 'tv') {
                setActiveTab('tv');
              } else if (dest === 'radio') {
                setActiveTab('radio');
              } else if (dest === 'men') {
                if (currentUser?.isAdmin || currentUser?.gender === 'male') {
                  setFellowshipInitialDrillDown('men');
                  handleNavigateWithStinger('fellowship');
                } else {
                  alert("Men On Fire is a consecrated space for brothers.");
                }
              } else if (dest === 'women') {
                if (currentUser?.isAdmin || currentUser?.gender === 'female') {
                  setFellowshipInitialDrillDown('women');
                  handleNavigateWithStinger('fellowship');
                } else {
                  alert("Women Ignited is a sacred space for sisters.");
                }
              } else if (dest === 'hub' || dest === 'groups') {
                setFellowshipInitialDrillDown(null);
                handleNavigateWithStinger('fellowship');
              } else {
                handleNavigateWithStinger(dest);
              }
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isRadioPlaying={isAudioPlaying}
            onToggleRadio={handleToggleAudio}
            onOpenRoster={() => setIsRosterOpen(true)}
            onOpenZoom={() => setIsZoomOpen(true)}
          />
        )}

        {/* PILLAR 2: WORD & MAP (Scripture Reader & Imperial Atlas) */}
        {activeTab === 'word' && (
          <div className="p-3 sm:p-5 space-y-4 max-w-5xl mx-auto">
            {/* Top 2-Way Switcher: [ 📖 66-Book Scripture ] | [ 🗺️ Imperial Atlas ] */}
            <div className="flex bg-[#0B1329] p-1.5 rounded-2xl border border-white/10 shadow-lg">
              <button
                onClick={() => setWordSubView('bible')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all font-['Outfit'] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 ${
                  wordSubView === 'bible'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>📖 66-Book Scripture</span>
              </button>
              <button
                onClick={() => setWordSubView('atlas')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all font-['Outfit'] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 ${
                  wordSubView === 'atlas'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>🗺️ Imperial Atlas</span>
              </button>
            </div>

            {/* Sub-view: 66-Book Scripture Reader */}
            {wordSubView === 'bible' ? (
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white text-slate-900">
                <ScriptureViewer
                  initialBookId={scripturePassage.bookId}
                  initialChapter={scripturePassage.chapter}
                  onBack={() => setActiveTab('sanctuary')}
                />
              </div>
            ) : (
              /* Sub-view: Imperial Atlas */
              <BiblicalMaps
                onBack={() => setActiveTab('sanctuary')}
                onNavigateToScripture={handleDeepLinkToScripture}
              />
            )}
          </div>
        )}

        {/* PILLAR 3: FELLOWSHIP (Hubs & Sister Ministries) */}
        {activeTab === 'fellowship' && (
          <div className="p-3 sm:p-5 max-w-5xl mx-auto">
            <FellowshipHub
              onNavigate={(dest, subView) => {
                if (dest === 'tv') setActiveTab('tv');
                else if (dest === 'radio') setActiveTab('radio');
                else if (dest === 'bibletracker') setActiveTab('bibletracker');
                else if (dest === 'mentor') setActiveTab('mentor');
                else handleNavigateWithStinger(dest, subView);
              }}
              onBack={() => {
                setFellowshipInitialDrillDown(null);
                setActiveTab('sanctuary');
              }}
              initialDrillDown={fellowshipInitialDrillDown}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* PILLAR 4: COUNSEL (AI Young Adult Mentor) */}
        {activeTab === 'mentor' && (
          <div className="p-3 sm:p-5 max-w-3xl mx-auto">
            <AIMentorCounselor
              onBack={() => setActiveTab('sanctuary')}
              onAudioDucking={handleAudioDucking}
              onNavigateToScripture={handleDeepLinkToScripture}
            />
          </div>
        )}

        {/* DIRECT SUB-VIEW: PHYSICAL BIBLE TRACKER */}
        {activeTab === 'bibletracker' && (
          <div className="p-4 max-w-lg mx-auto">
            <PhysicalBibleTracker onBack={() => setActiveTab('sanctuary')} />
          </div>
        )}

        {/* DIRECT SUB-VIEW: KINGDOM VIDEO VAULT & TV */}
        {activeTab === 'tv' && (
          <div className="p-3 sm:p-5 max-w-5xl mx-auto">
            <KingdomVideoVault
              onBack={() => setActiveTab('sanctuary')}
              onAudioDucking={handleAudioDucking}
              onFloatVideo={(video) => setFloatingVideo(video)}
            />
          </div>
        )}

        {/* DIRECT SUB-VIEW: 24/7 GOSPEL RADIO ECOSYSTEM (8 STATIONS) */}
        {activeTab === 'radio' && (
          <div className="p-3 sm:p-5 max-w-4xl mx-auto">
            <LiveRadioPlayer
              onBack={() => setActiveTab('sanctuary')}
              onAudioDucking={handleAudioDucking}
              activeStationId={activeAudio.isRadio ? activeAudio.id : undefined}
              isPlaying={isAudioPlaying}
              onTogglePlay={handleToggleAudio}
              onSelectStation={handleSelectRadioStation}
              volume={masterVolume}
              onVolumeChange={setMasterVolume}
            />
          </div>
        )}
      </main>

      {/* 4. Small Floating Window Video Player (PIP) */}
      {floatingVideo && activeTab !== 'tv' && (
        <FloatingVideoPlayer
          video={floatingVideo}
          onClose={() => setFloatingVideo(null)}
          onExpand={() => {
            setActiveTab('tv');
            setFloatingVideo(null);
          }}
        />
      )}

      {/* 5. Persistent Background Radio / Music Player Dock (Positioned cleanly above bottom nav bar) */}
      {!stingerActive && (
        <div className="fixed bottom-[68px] sm:bottom-[72px] inset-x-3 max-w-lg mx-auto bg-[#0B1329]/95 border border-amber-500/50 rounded-2xl p-2.5 backdrop-blur-xl shadow-2xl flex items-center justify-between z-30 select-none border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div 
            onClick={() => setActiveTab('radio')}
            className="flex items-center gap-2.5 truncate cursor-pointer group flex-1 mr-2"
            title="Open 24/7 Gospel Radio Player"
          >
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-950 flex-shrink-0 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: activeAudio.accentColor || '#F59E0B' }}
            >
              <Radio className={`w-4 h-4 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 truncate">
                <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors font-['Outfit']">
                  {activeAudio.name}
                </h5>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                  24/7 Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {activeAudio.genreOrArtist} &bull; Tap for Radio Hub
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Animated Equalizer: 4-bar animated gold equalizer whenever audio is playing */}
            {isAudioPlaying ? (
              <div className="flex items-end gap-0.5 h-3 px-1" title="Broadcasting 24/7 Praise">
                <span className="w-0.5 bg-amber-400 animate-[bounce_1s_infinite_100ms] h-full"></span>
                <span className="w-0.5 bg-amber-400 animate-[bounce_1s_infinite_300ms] h-2/3"></span>
                <span className="w-0.5 bg-amber-400 animate-[bounce_1s_infinite_200ms] h-4/5"></span>
                <span className="w-0.5 bg-amber-400 animate-[bounce_1s_infinite_400ms] h-1/2"></span>
              </div>
            ) : (
              <div className="flex items-end gap-0.5 h-3 px-1 opacity-40">
                <span className="w-0.5 bg-slate-500 h-1"></span>
                <span className="w-0.5 bg-slate-500 h-2"></span>
                <span className="w-0.5 bg-slate-500 h-1.5"></span>
                <span className="w-0.5 bg-slate-500 h-1"></span>
              </div>
            )}

            {/* Play/Pause Button */}
            <button 
              onClick={handleToggleAudio}
              className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors shadow-md active:scale-95"
              title={isAudioPlaying ? 'Pause Audio' : 'Play Audio'}
            >
              {isAudioPlaying ? '❚❚' : '▶'}
            </button>
          </div>
        </div>
      )}

      {/* 6. Sticky 4-Pill Bottom Navigation Bar */}
      {!stingerActive && (
        <BottomNavBar 
          currentTab={activeTab === 'tv' || activeTab === 'bibletracker' || activeTab === 'radio' ? 'sanctuary' : activeTab} 
          onSelectTab={handleNavigateWithStinger} 
        />
      )}

      {/* 7. Solid Settings HUD Modal */}
      <SettingsHUDModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        selectedTrack={selectedLaunchTrack}
        onSelectTrack={(t) => {
          setSelectedLaunchTrack(t);
          localStorage.setItem('youngfire_launch_track_id', t.id);
          setActiveAudio({
            id: t.id,
            name: t.title,
            genreOrArtist: t.artist,
            streamUrl: t.audioUrl,
            isRadio: true,
            accentColor: '#F59E0B'
          });
          if (audioRef.current) {
            audioRef.current.src = t.audioUrl;
            audioRef.current.loop = false;
            audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => {});
          }
        }}
        appVolume={masterVolume}
        onVolumeChange={setMasterVolume}
        soundEnabled={soundEffectsEnabled}
        onToggleSound={setSoundEffectsEnabled}
        onOpenVoiceSanctuary={() => setIsVoiceSanctuaryOpen(true)}
        onOpenProgress={() => setIsProgressOpen(true)}
        onOpenAdminCMS={() => setIsAdminCMSOpen(true)}
        onLogout={handleLogout}
      />

      {/* 8. Relocated Modal: Live Voice Sanctuary */}
      <LiveVoiceSanctuary
        isOpen={isVoiceSanctuaryOpen}
        onClose={() => setIsVoiceSanctuaryOpen(false)}
        onAudioDucking={handleAudioDucking}
      />

      {/* 9. Relocated Modal: Discipleship Reading Progress */}
      <ReadingProgressModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        onNavigateToBook={(bId) => {
          handleDeepLinkToScripture(bId, 1);
        }}
      />

      {/* 10. Relocated Modal: Admin CMS Portal (For Administrators Only) */}
      <AdminCMSModal
        isOpen={isAdminCMSOpen}
        onClose={() => setIsAdminCMSOpen(false)}
        currentUser={currentUser}
      />

      {/* 11. Member Roster Modal */}
      <MemberRosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        currentUser={currentUser}
      />

      {/* 12. Zoom Meeting Modal */}
      <ZoomMeetingModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        currentUser={currentUser}
      />

      {/* 13. Study Notes & Journal HUD Modal */}
      <NotesHUDModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        onNavigateToScripture={handleDeepLinkToScripture}
      />

      {/* 14. Theme HUD Modal (Visual Color Palettes) */}
      <ThemeHUDModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        currentThemeId={currentThemeId}
        onSelectTheme={(id) => setCurrentThemeId(id)}
      />

    </div>
  );
}
