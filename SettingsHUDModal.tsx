import React, { useState } from 'react';
import { 
  X, Volume2, Music, Check, ShieldAlert, Sparkles, 
  BarChart3, LogOut, Sliders, ShieldCheck, UserCheck, 
  Bell, Mic, Palette, Radio, Globe, Calendar, Video 
} from 'lucide-react';
import { AVAILABLE_LAUNCH_TRACKS, LaunchTrackOption } from '../data/launchTracks';
import { GOSPEL_STATIONS, RadioStation } from '../data/radioStations';
import { APP_THEMES } from './ThemeHUDModal';

export interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  gender?: 'male' | 'female';
  avatar?: string;
  isAdmin: boolean;
}

interface SettingsHUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  selectedTrack: LaunchTrackOption;
  onSelectTrack: (track: LaunchTrackOption) => void;
  appVolume: number;
  onVolumeChange: (vol: number) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onOpenVoiceSanctuary: () => void;
  onOpenProgress: () => void;
  onOpenAdminCMS: () => void;
  onLogout: () => void;
}

export const SettingsHUDModal: React.FC<SettingsHUDModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  selectedTrack,
  onSelectTrack,
  appVolume,
  onVolumeChange,
  soundEnabled,
  onToggleSound,
  onOpenVoiceSanctuary,
  onOpenProgress,
  onOpenAdminCMS,
  onLogout,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('youngfire_notifications_enabled') !== 'false';
  });
  const [dailyReminders, setDailyReminders] = useState(() => {
    return localStorage.getItem('youngfire_daily_reminders') !== 'false';
  });
  const [voiceSensitivity, setVoiceSensitivity] = useState(0.8);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('youngfire_theme_id') || 'spurs-silver';
  });

  if (!isOpen) return null;

  const handleToggleNotifications = (val: boolean) => {
    setNotificationsEnabled(val);
    localStorage.setItem('youngfire_notifications_enabled', String(val));
  };

  const handleToggleDaily = (val: boolean) => {
    setDailyReminders(val);
    localStorage.setItem('youngfire_daily_reminders', String(val));
  };

  const handleSelectTheme = (id: string) => {
    setCurrentTheme(id);
    localStorage.setItem('youngfire_theme_id', id);
    const targetTheme = APP_THEMES.find(t => t.id === id);
    if (targetTheme) {
      document.documentElement.style.setProperty('--theme-bg', targetTheme.bgHex);
      document.documentElement.style.setProperty('--theme-card', targetTheme.cardHex);
      document.documentElement.style.setProperty('--theme-accent', targetTheme.accentHex);
      document.documentElement.style.setProperty('--theme-border', targetTheme.borderHex);
      document.body.style.backgroundColor = targetTheme.bgHex;
    }
    window.dispatchEvent(new CustomEvent('yf_theme_applied', { detail: { themeId: id } }));
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#0B1329] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Outfit'] uppercase text-white tracking-wide">
                SANCTUARY PREFERENCES & HUD
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                Spurs Heritage &bull; Liturgical Settings &bull; Audio Routing
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white cursor-pointer transition-colors"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: STARTUP AUDIO & RADIO */}
        <div className="p-4 bg-[#070C1C] rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <Music className="w-4 h-4" />
              <span>1. Startup Audio & Gospel Radio</span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              Background Auto-Stream
            </span>
          </div>
          
          <p className="text-[11px] text-slate-300 font-mono">
            Default stream plays upon entering Sanctuary until manually paused:
          </p>

          <div className="space-y-2">
            {AVAILABLE_LAUNCH_TRACKS.map((track) => {
              const isSelected = track.id === selectedTrack.id;
              return (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(track)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                      {track.type === 'radio' ? <Radio className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{track.artist}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Master Sound Volume */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            <div className="flex justify-between text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Master Sanctuary Volume</span>
              </span>
              <span className="text-amber-400 font-bold">{Math.round(appVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={appVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* SECTION 2: NOTIFICATIONS & ALERTS */}
        <div className="p-4 bg-[#070C1C] rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>2. Notifications & Gathering Alerts</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span>Small Group & Event Reminders</span>
            <button
              onClick={() => handleToggleNotifications(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                notificationsEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                notificationsEnabled ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5">
            <span>Daily Bread (Morning & Evening Alerts)</span>
            <button
              onClick={() => handleToggleDaily(!dailyReminders)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                dailyReminders ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                dailyReminders ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {/* SECTION 3: LIVE VOICE SANCTUARY MIC & AUDIO PREFERENCES */}
        <div className="p-4 bg-[#070C1C] rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <Mic className="w-4 h-4" />
              <span>3. Live Voice Sanctuary & Mic Sensitivity</span>
            </div>
            <button
              onClick={() => { onClose(); onOpenVoiceSanctuary(); }}
              className="text-[10px] font-mono text-cyan-300 hover:underline"
            >
              Open Live Mic &rarr;
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-300">
              <span>Mic Gain / Voice Sensitivity</span>
              <span className="text-cyan-400 font-bold">{Math.round(voiceSensitivity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={voiceSensitivity}
              onChange={(e) => setVoiceSensitivity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <button
            onClick={() => { onClose(); onOpenProgress(); }}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2 text-emerald-300">
              <BarChart3 className="w-4 h-4" />
              <span>View 66-Book Reading Progress Tracker</span>
            </span>
            <span className="text-slate-400">&rarr;</span>
          </button>
        </div>

        {/* SECTION 4: THEME & PALETTES (10 LITURGICAL PALETTES) */}
        <div className="p-4 bg-[#070C1C] rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <Palette className="w-4 h-4" />
              <span>4. 10 Liturgical Palettes</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Instant Theme Switch</span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {APP_THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-white/10 shadow-sm'
                      : 'border-white/5 bg-black/40 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: theme.accentHex }}
                    />
                    <span className="text-xs font-bold text-white truncate font-['Outfit']">
                      {theme.name.split(' ')[0]} {theme.name.split(' ')[1] || ''}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 block truncate mt-0.5">
                    {theme.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: ADMIN CMS (VISIBLE FOR ADMINISTRATORS ONLY) */}
        {currentUser.isAdmin && (
          <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>5. Executive Leadership Controls</span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                For Administrators Only
              </span>
            </div>

            <p className="text-[11px] text-slate-300 font-mono">
              Annual Theme: <strong className="text-white">"Rebuilding Better Together" &bull; Eph 4:16</strong>
            </p>

            <button
              onClick={() => { onClose(); onOpenAdminCMS(); }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Open Admin CMS (Theme, Zoom Sync & Roster) &rarr;</span>
            </button>
          </div>
        )}

        {/* SECTION 6: USER PROFILE & LOGOUT */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-9 h-9 rounded-full object-cover border border-amber-500/40"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-white font-['Outfit']">{currentUser.name}</div>
              <div className="text-[10px] font-mono text-slate-400">
                {currentUser.isAdmin ? 'App Administrator / Facilitator' : 'YoungFire Disciple'}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
