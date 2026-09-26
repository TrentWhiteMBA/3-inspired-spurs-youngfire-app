import React, { useState, useEffect } from 'react';
import { 
  X, ShieldAlert, Calendar, Users, 
  Trash2, CheckCircle2, Save, Video, Sparkles, AlertTriangle 
} from 'lucide-react';
import { RosterMember } from './MemberRosterModal';

interface AdminCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; name: string; isAdmin: boolean };
}

interface ZoomGroupConfig {
  title: string;
  inviteLink: string;
  meetingId: string;
  passcode: string;
}

export const AdminCMSModal: React.FC<AdminCMSModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'zoom' | 'roster' | 'gatherings'>('theme');
  const [toastMsg, setToastMsg] = useState('');

  // 1. Annual Theme State
  const [annualThemeTitle, setAnnualThemeTitle] = useState(() => {
    return localStorage.getItem('youngfire_annual_theme_title') || 'Rebuilding Better Together';
  });
  const [annualThemeScripture, setAnnualThemeScripture] = useState(() => {
    return localStorage.getItem('youngfire_annual_theme_scripture') || 'Ephesians 4:16';
  });
  const [annualThemeDeclaration, setAnnualThemeDeclaration] = useState(() => {
    return localStorage.getItem('youngfire_annual_theme_decl') || 'According to the effectual working in the measure of every part, maketh increase of the body unto the edifying of itself in love.';
  });

  // 2. Dedicated Zoom Configs (3 distinct groups)
  const [generalZoom, setGeneralZoom] = useState<ZoomGroupConfig>({
    title: 'YoungFire General Small Group Zoom (Bi-weekly Mondays @ 7:00 PM CST)',
    inviteLink: 'https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365',
    meetingId: '878 516 1298',
    passcode: 'FIRE2026'
  });

  const [menZoom, setMenZoom] = useState<ZoomGroupConfig>({
    title: 'Men On Fire Brotherhood Zoom Huddle',
    inviteLink: 'https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365',
    meetingId: '878 516 1298',
    passcode: 'FIRE2026'
  });

  const [womenZoom, setWomenZoom] = useState<ZoomGroupConfig>({
    title: 'Women Ignited Sisterhood Zoom Huddle',
    inviteLink: 'https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365',
    meetingId: '878 516 1298',
    passcode: 'FIRE2026'
  });

  // 3. Live Roster State (Clean slate + persistent API)
  const [rosterMembers, setRosterMembers] = useState<RosterMember[]>([]);
  const [memberToDelete, setMemberToDelete] = useState<RosterMember | null>(null);

  // Sync initial data from backend / localStorage
  useEffect(() => {
    if (!isOpen) return;

    // Load Zoom
    fetch('/api/zoom')
      .then(res => res.json())
      .then(data => {
        if (data?.config) {
          const cfg = data.config;
          setGeneralZoom({
            title: 'YoungFire General Small Group Zoom (Bi-weekly Mondays @ 7:00 PM CST)',
            inviteLink: cfg.inviteLink || generalZoom.inviteLink,
            meetingId: cfg.meetingId || generalZoom.meetingId,
            passcode: cfg.passcode || generalZoom.passcode
          });
          setMenZoom({
            title: 'Men On Fire Brotherhood Zoom Huddle',
            inviteLink: cfg.menOnFireInviteLink || cfg.inviteLink || menZoom.inviteLink,
            meetingId: cfg.menOnFireMeetingId || cfg.meetingId || menZoom.meetingId,
            passcode: cfg.menOnFirePasscode || cfg.passcode || menZoom.passcode
          });
          setWomenZoom({
            title: 'Women Ignited Sisterhood Zoom Huddle',
            inviteLink: cfg.womenIgnitedInviteLink || cfg.inviteLink || womenZoom.inviteLink,
            meetingId: cfg.womenIgnitedMeetingId || cfg.meetingId || womenZoom.meetingId,
            passcode: cfg.womenIgnitedPasscode || cfg.passcode || womenZoom.passcode
          });
        }
      })
      .catch(() => {});

    // Load Roster
    fetch('/api/roster')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.members)) {
          setRosterMembers(data.members);
        } else {
          try {
            const saved = localStorage.getItem('youngfire_member_roster_v2');
            if (saved) setRosterMembers(JSON.parse(saved));
          } catch {}
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('youngfire_member_roster_v2');
          if (saved) setRosterMembers(JSON.parse(saved));
        } catch {}
      });
  }, [isOpen]);

  if (!isOpen) return null;

  // Strict Security Gate for Administrators
  if (!currentUser.isAdmin) {
    return (
      <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0B1329] border border-rose-500/40 rounded-3xl p-6 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Restricted Leadership CMS</h3>
          <p className="text-xs text-slate-300">
            Access to the Executive Admin CMS is reserved for Lead Facilitators (Trent White & Whitney White).
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-mono font-bold cursor-pointer"
          >
            Return to Sanctuary
          </button>
        </div>
      </div>
    );
  }

  // 1. Save Annual Theme
  const handleSaveTheme = () => {
    localStorage.setItem('youngfire_annual_theme_title', annualThemeTitle);
    localStorage.setItem('youngfire_annual_theme_scripture', annualThemeScripture);
    localStorage.setItem('youngfire_annual_theme_decl', annualThemeDeclaration);
    setToastMsg('Annual Sanctuary Theme Updated Successfully');
    setTimeout(() => setToastMsg(''), 2500);
  };

  // 2. Save Dedicated Zoom Configs
  const handleSaveZoom = async () => {
    try {
      await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: generalZoom.meetingId,
          passcode: generalZoom.passcode,
          inviteLink: generalZoom.inviteLink,
          menOnFireMeetingId: menZoom.meetingId,
          menOnFirePasscode: menZoom.passcode,
          menOnFireInviteLink: menZoom.inviteLink,
          womenIgnitedMeetingId: womenZoom.meetingId,
          womenIgnitedPasscode: womenZoom.passcode,
          womenIgnitedInviteLink: womenZoom.inviteLink
        })
      });
      setToastMsg('All 3 Zoom Configurations Synchronized Globally');
      setTimeout(() => setToastMsg(''), 2500);
    } catch (err) {
      console.error('Failed to sync Zoom:', err);
    }
  };

  // 3. Confirm Delete Roster Member (with Overseer Safeguard)
  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;
    const nameLower = (memberToDelete.fullName || memberToDelete.name || '').toLowerCase();
    const emailLower = (memberToDelete.email || '').toLowerCase();
    
    // Safeguard: Prevent deletion of primary overseer accounts
    if (nameLower.includes('trent') || nameLower.includes('whitney') || emailLower.includes('trent') || emailLower.includes('whitney')) {
      alert("Cannot delete primary facilitator account (Trent White / Whitney White).");
      setMemberToDelete(null);
      return;
    }

    const updated = rosterMembers.filter(m => m.id !== memberToDelete.id);
    setRosterMembers(updated);
    try {
      localStorage.setItem('youngfire_member_roster_v2', JSON.stringify(updated));
      await fetch(`/api/roster/${memberToDelete.id}`, { method: 'DELETE' });
    } catch {}

    setToastMsg(`Removed ${memberToDelete.fullName || memberToDelete.name} from Roster`);
    setMemberToDelete(null);
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0B1329] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Outfit'] uppercase text-white">
                ADMINISTRATOR CMS PORTAL
              </h2>
              <p className="text-[10px] font-mono text-amber-300">
                Executive Leadership Console &bull; For Administrators Only
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Close Admin CMS"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {toastMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex bg-[#070C1C] p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeTab === 'theme' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Annual Theme
          </button>
          <button
            onClick={() => setActiveTab('zoom')}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeTab === 'zoom' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Zoom Controls (3)
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeTab === 'roster' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Disciples Roster ({rosterMembers.length})
          </button>
        </div>

        {/* TAB 1: ANNUAL THEME CONTROLS */}
        {activeTab === 'theme' && (
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Sanctuary Annual Theme Proclamation</span>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Theme Title</label>
              <input
                type="text"
                value={annualThemeTitle}
                onChange={(e) => setAnnualThemeTitle(e.target.value)}
                className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Scripture Anchor</label>
              <input
                type="text"
                value={annualThemeScripture}
                onChange={(e) => setAnnualThemeScripture(e.target.value)}
                className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Foundational Declaration Text</label>
              <textarea
                rows={3}
                value={annualThemeDeclaration}
                onChange={(e) => setAnnualThemeDeclaration(e.target.value)}
                className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white leading-relaxed"
              />
            </div>

            <button
              onClick={handleSaveTheme}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow-md"
            >
              Update Sanctuary Theme Across All Screens &rarr;
            </button>
          </div>
        )}

        {/* TAB 2: DEDICATED ZOOM CONTROLS (3 DISTINCT HUBS) */}
        {activeTab === 'zoom' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 font-mono">
              Configure independent Zoom credentials for YoungFire, Men On Fire, and Women Ignited:
            </p>

            {/* 1. General YoungFire Zoom */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase font-mono">
                <Video className="w-4 h-4" />
                <span>1. YoungFire General Small Group Zoom</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Schedule: Every other Monday @ 7:00 PM CST</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block">Meeting ID</label>
                  <input
                    type="text"
                    value={generalZoom.meetingId}
                    onChange={(e) => setGeneralZoom({ ...generalZoom, meetingId: e.target.value })}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block">Passcode</label>
                  <input
                    type="text"
                    value={generalZoom.passcode}
                    onChange={(e) => setGeneralZoom({ ...generalZoom, passcode: e.target.value })}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block">Invite URL</label>
                <input
                  type="url"
                  value={generalZoom.inviteLink}
                  onChange={(e) => setGeneralZoom({ ...generalZoom, inviteLink: e.target.value })}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono"
                />
              </div>
            </div>

            {/* 2. Men On Fire Brotherhood Zoom */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-orange-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase font-mono">
                <Video className="w-4 h-4" />
                <span>2. Men On Fire Brotherhood Zoom</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block">Meeting ID</label>
                  <input
                    type="text"
                    value={menZoom.meetingId}
                    onChange={(e) => setMenZoom({ ...menZoom, meetingId: e.target.value })}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block">Passcode</label>
                  <input
                    type="text"
                    value={menZoom.passcode}
                    onChange={(e) => setMenZoom({ ...menZoom, passcode: e.target.value })}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block">Invite URL</label>
                <input
                  type="url"
                  value={menZoom.inviteLink}
                  onChange={(e) => setMenZoom({ ...menZoom, inviteLink: e.target.value })}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono"
                />
              </div>
            </div>

            {/* 3. Women Ignited Sisterhood Zoom */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase font-mono">
                <Video className="w-4 h-4" />
                <span>3. Women Ignited Sisterhood Zoom</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block">Meeting ID</label>
                  <input
                    type="text"
                    value={womenZoom.meetingId}
                    onChange={(e) => setWomenZoom({ ...womenZoom, meetingId: e.target.value })}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block">Passcode</label>
                  <input
                    type="text"
                    value={womenZoom.passcode}
                    onChange={(e) => setWomenZoom({ ...womenZoom, passcode: e.target.value })}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block">Invite URL</label>
                <input
                  type="url"
                  value={womenZoom.inviteLink}
                  onChange={(e) => setWomenZoom({ ...womenZoom, inviteLink: e.target.value })}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSaveZoom}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
            >
              Sync All 3 Zoom Channels Across Clients &rarr;
            </button>
          </div>
        )}

        {/* TAB 3: DISCIPLES ROSTER MANAGEMENT (WITH ADMIN DELETION) */}
        {activeTab === 'roster' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                Registered Disciples ({rosterMembers.length})
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                Admin Deletion Privileges Active
              </span>
            </div>

            {rosterMembers.length === 0 ? (
              <div className="p-8 bg-slate-950/40 rounded-2xl border border-dashed border-white/10 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-mono text-slate-400">
                  Roster is clean! As real disciples register in the app, their profiles appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {rosterMembers.map((member) => {
                  const isPrimaryOverseer = (member.fullName || member.name || '').toLowerCase().includes('trent') ||
                                            (member.fullName || member.name || '').toLowerCase().includes('whitney') ||
                                            (member.email || '').toLowerCase().includes('trent') ||
                                            (member.email || '').toLowerCase().includes('whitney');

                  return (
                    <div 
                      key={member.id}
                      className="p-3 bg-slate-950/70 rounded-xl border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={member.fullName || member.name} 
                            className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
                            {(member.fullName || member.name || 'D').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-xs truncate font-['Outfit']">
                              {member.fullName || member.name}
                            </h5>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                              {member.group || 'YoungFire'}
                            </span>
                            {member.gender && (
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                                member.gender === 'female' ? 'bg-rose-500/20 text-rose-300' : 'bg-orange-500/20 text-orange-300'
                              }`}>
                                {member.gender === 'female' ? 'Sister' : 'Brother'}
                              </span>
                            )}
                            {isPrimaryOverseer && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                Overseer
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {member.calling || 'Disciple'} &bull; {member.email || 'No email provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {currentUser.isAdmin && !isPrimaryOverseer ? (
                          <button
                            onClick={() => setMemberToDelete(member)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-rose-950/40 border border-rose-500"
                            title={`Delete ${member.fullName || member.name} from Roster`}
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                            <span>Delete Member</span>
                          </button>
                        ) : isPrimaryOverseer ? (
                          <span className="text-[10px] font-mono text-amber-300 font-bold px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30">
                            Protected Lead
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal for Roster Deletion */}
        {memberToDelete && (
          <div className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#0B1329] border border-rose-500/50 rounded-3xl p-5 space-y-4 text-center">
              <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
              <h4 className="text-sm font-bold text-white uppercase font-['Outfit']">
                Confirm Disciple Removal
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Remove <strong className="text-white">{memberToDelete.fullName || memberToDelete.name}</strong> from the YoungFire Fellowship Roster?
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setMemberToDelete(null)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-mono rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteMember}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono rounded-xl cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
