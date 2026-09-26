import React, { useState, useEffect } from 'react';
import { X, Video, ExternalLink, Copy, Check, Clock, Calendar, Shield, Users } from 'lucide-react';
import { CurrentUser } from './SettingsHUDModal';

interface ZoomMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: CurrentUser | null;
  targetGroup?: 'all' | 'men' | 'women';
}

export const ZoomMeetingModal: React.FC<ZoomMeetingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetGroup = 'all'
}) => {
  const [meetingId, setMeetingId] = useState('878 516 1298');
  const [passcode, setPasscode] = useState('FIRE2026');
  const [inviteLink, setInviteLink] = useState('https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365');
  const [schedule, setSchedule] = useState('Every Other Tuesday & Wednesday &bull; 7:00 PM CST');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sync with backend API
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/zoom')
      .then(res => res.json())
      .then(data => {
        if (data && data.config) {
          if (targetGroup === 'men' && data.config.menOnFireMeetingId) {
            setMeetingId(data.config.menOnFireMeetingId);
            setPasscode(data.config.menOnFirePasscode || 'FIRE2026');
            setInviteLink(data.config.menOnFireInviteLink || data.config.inviteLink);
          } else if (targetGroup === 'women' && data.config.womenIgnitedMeetingId) {
            setMeetingId(data.config.womenIgnitedMeetingId);
            setPasscode(data.config.womenIgnitedPasscode || 'FIRE2026');
            setInviteLink(data.config.womenIgnitedInviteLink || data.config.inviteLink);
          } else if (data.config.meetingId) {
            setMeetingId(data.config.meetingId);
            setPasscode(data.config.passcode || 'FIRE2026');
            setInviteLink(data.config.inviteLink || '');
          }
        }
      })
      .catch(() => {});
  }, [isOpen, targetGroup]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveZoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    try {
      await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId,
          passcode,
          inviteLink
        })
      });
    } catch (err) {
      console.error('Failed to persist Zoom credentials:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="bg-[#0B1329] border border-blue-500/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-[#070C1C] px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase font-['Outfit'] text-white">
                {targetGroup === 'men' 
                  ? 'Men On Fire Zoom Huddle' 
                  : targetGroup === 'women' 
                  ? 'Women Ignited Zoom Sisterhood' 
                  : 'YoungFire Small Groups Zoom'}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Joshua House of Worship &bull; Virtual Discipleship Huddle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Quick 1-Tap Launch Button */}
          <a
            href={inviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm font-['Outfit'] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 transition-transform active:scale-95 cursor-pointer"
          >
            <Video className="w-5 h-5" />
            <span>Launch Zoom Meeting Now &rarr;</span>
          </a>

          {/* Schedule Info */}
          <div className="p-3.5 rounded-2xl bg-[#070C1C] border border-white/10 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-xs font-mono">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Standard Gathering Time:</span>
              <span className="text-slate-200 font-bold" dangerouslySetInnerHTML={{ __html: schedule }} />
            </div>
          </div>

          {/* Meeting Credentials */}
          {!isEditing ? (
            <div className="space-y-3 bg-[#070C1C] p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Meeting ID</span>
                  <span className="text-sm font-mono font-bold text-white tracking-wider">{meetingId}</span>
                </div>
                <button
                  onClick={() => handleCopy(meetingId.replace(/\s+/g, ''), 'id')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedField === 'id' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="border-t border-white/5 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Passcode</span>
                  <span className="text-sm font-mono font-bold text-amber-400 tracking-wider">{passcode}</span>
                </div>
                <button
                  onClick={() => handleCopy(passcode, 'pwd')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedField === 'pwd' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="border-t border-white/5 pt-2 flex items-center justify-between">
                <div className="truncate max-w-[280px]">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Direct Invite Link</span>
                  <span className="text-xs font-mono text-cyan-400 truncate block">{inviteLink}</span>
                </div>
                <button
                  onClick={() => handleCopy(inviteLink, 'link')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedField === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedField === 'link' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {currentUser?.isAdmin && (
                <div className="pt-2 border-t border-white/10 text-right">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-mono text-amber-400 hover:underline cursor-pointer"
                  >
                    ⚙️ Edit Zoom Credentials (Leaders Only)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveZoom} className="space-y-3 bg-[#070C1C] p-4 rounded-2xl border border-white/10">
              <h4 className="text-xs font-mono font-bold uppercase text-amber-400">Edit Meeting Credentials</h4>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block">Meeting ID</label>
                <input
                  type="text"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block">Passcode</label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block">Invite Link</label>
                <input
                  type="url"
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                  className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-mono text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs font-mono"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#070C1C] px-5 py-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Joshua House &bull; Discipleship Agreement</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
