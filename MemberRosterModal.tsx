import React, { useState, useEffect } from 'react';
import { 
  X, Users, UserPlus, Search, Phone, Mail, MapPin, 
  Shield, Heart, Flame, Trash2, Edit3, Check, RefreshCw 
} from 'lucide-react';
import { CurrentUser } from './SettingsHUDModal';

export interface RosterMember {
  id: string;
  fullName: string;
  name?: string;
  role: string;
  calling: string;
  group: 'YoungFire' | 'Men On Fire' | 'Women Ignited' | 'All';
  churchMembership?: string;
  residence?: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female';
  avatar?: string;
  prayerRequests?: string;
  notes?: string;
}

interface MemberRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: CurrentUser | null;
  initialGroup?: 'YoungFire' | 'Men On Fire' | 'Women Ignited' | 'All';
}

export const MemberRosterModal: React.FC<MemberRosterModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialGroup = 'All'
}) => {
  const [members, setMembers] = useState<RosterMember[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_member_roster_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedGroup, setSelectedGroup] = useState<'YoungFire' | 'Men On Fire' | 'Women Ignited' | 'All'>(initialGroup);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [group, setGroup] = useState<'YoungFire' | 'Men On Fire' | 'Women Ignited' | 'All'>('YoungFire');
  const [role, setRole] = useState('Disciple');
  const [calling, setCalling] = useState('Praise & Intercession');
  const [churchMembership, setChurchMembership] = useState('Joshua House of Worship');
  const [residence, setResidence] = useState('San Antonio, TX');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [prayerRequests, setPrayerRequests] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Synchronize with backend API
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/roster')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.members)) {
          setMembers(data.members);
          try {
            localStorage.setItem('youngfire_member_roster_v2', JSON.stringify(data.members));
          } catch {}
        }
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    setSelectedGroup(initialGroup);
  }, [initialGroup]);

  if (!isOpen) return null;

  const handleOpenAddForm = () => {
    setEditingMemberId(null);
    setFullName('');
    setGroup(selectedGroup === 'All' ? 'YoungFire' : selectedGroup);
    setRole('Disciple');
    setCalling('Praise & Intercession');
    setChurchMembership('Joshua House of Worship');
    setResidence('San Antonio, TX');
    setEmail('');
    setPhone('');
    setPrayerRequests('');
    setIsRegisterOpen(true);
  };

  const handleEditMember = (m: RosterMember) => {
    setEditingMemberId(m.id);
    setFullName(m.fullName || m.name || '');
    setGroup(m.group || 'YoungFire');
    setRole(m.role || 'Disciple');
    setCalling(m.calling || 'Serving');
    setChurchMembership(m.churchMembership || 'Joshua House of Worship');
    setResidence(m.residence || 'San Antonio, TX');
    setEmail(m.email || '');
    setPhone(m.phone || '');
    setPrayerRequests(m.prayerRequests || '');
    setIsRegisterOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const memberPayload: RosterMember = {
      id: editingMemberId || `member_${Date.now()}`,
      fullName: fullName.trim(),
      name: fullName.trim(),
      group,
      role: role.trim() || 'Disciple',
      calling: calling.trim() || 'Fellowship',
      churchMembership: churchMembership.trim() || 'Joshua House of Worship',
      residence: residence.trim() || 'San Antonio, TX',
      email: email.trim(),
      phone: phone.trim(),
      prayerRequests: prayerRequests.trim()
    };

    let updatedList: RosterMember[] = [];
    if (editingMemberId) {
      updatedList = members.map(m => m.id === editingMemberId ? memberPayload : m);
    } else {
      updatedList = [memberPayload, ...members];
    }

    setMembers(updatedList);
    try {
      localStorage.setItem('youngfire_member_roster_v2', JSON.stringify(updatedList));
      await fetch('/api/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberPayload)
      });
    } catch (err) {
      console.error('Error saving roster member:', err);
    }

    setSuccessMessage(editingMemberId ? 'Member details updated!' : 'Successfully registered in Fellowship Roster!');
    setTimeout(() => {
      setSuccessMessage('');
      setIsRegisterOpen(false);
    }, 1200);
  };

  const handleDeleteMember = async (id: string) => {
    const target = members.find(m => m.id === id);
    if (target) {
      const nameLower = (target.fullName || target.name || '').toLowerCase();
      const emailLower = (target.email || '').toLowerCase();
      if (nameLower.includes('trent') || nameLower.includes('whitney') || emailLower.includes('trent') || emailLower.includes('whitney')) {
        alert("Cannot delete primary facilitator account (Trent White / Whitney White).");
        return;
      }
    }
    if (!window.confirm('Remove this member from the fellowship roster?')) return;
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    try {
      localStorage.setItem('youngfire_member_roster_v2', JSON.stringify(updated));
      await fetch(`/api/roster/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const filteredMembers = members.filter(m => {
    const matchesGroup = selectedGroup === 'All' || m.group === selectedGroup || m.group === 'All';
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (m.fullName || m.name || '').toLowerCase().includes(query) ||
      (m.calling || '').toLowerCase().includes(query) ||
      (m.role || '').toLowerCase().includes(query) ||
      (m.residence || '').toLowerCase().includes(query) ||
      (m.email || '').toLowerCase().includes(query);
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      <div className="bg-[#0B1329] border border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar with Logos */}
        <div className="bg-[#070C1C] px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase font-['Outfit'] text-white">
                  YoungFire Fellowship Roster
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {members.length} Disciples
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Joshua House of Worship &bull; Contact Directory & Spiritual Callings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddForm}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md hover:opacity-90 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Register</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Group Filter Tabs with Logos */}
        <div className="px-5 py-3 bg-[#080E21] border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => setSelectedGroup('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedGroup === 'All'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <span>🌐 All Groups</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {members.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedGroup('YoungFire')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedGroup === 'YoungFire'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-bold'
                  : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              <span>🔥 YoungFire (18–35)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {members.filter(m => m.group === 'YoungFire' || m.group === 'All').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedGroup('Men On Fire')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedGroup === 'Men On Fire'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 shadow-md font-bold'
                  : 'bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 border border-orange-500/30'
              }`}
            >
              <span>⚔️ Men On Fire</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {members.filter(m => m.group === 'Men On Fire' || m.group === 'All').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedGroup('Women Ignited')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedGroup === 'Women Ignited'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-slate-950 shadow-md font-bold'
                  : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30'
              }`}
            >
              <span>👑 Women Ignited</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {members.filter(m => m.group === 'Women Ignited' || m.group === 'All').length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search disciples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#050A18] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Modal Form for Registration / Editing */}
        {isRegisterOpen ? (
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold uppercase font-mono text-amber-400">
                {editingMemberId ? 'Edit Disciple Record' : 'Register New Disciple in Fellowship Roster'}
              </h4>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            {successMessage && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-400 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Matthews"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Group / Fellowship Space *</label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value as any)}
                    className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="YoungFire">🔥 YoungFire (18–35)</option>
                    <option value="Men On Fire">⚔️ Men On Fire</option>
                    <option value="Women Ignited">👑 Women Ignited</option>
                    <option value="All">🌐 All Fellowship Groups</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Calling & Spiritual Focus</label>
                  <input
                    type="text"
                    placeholder="e.g. Prayer Watch, Worship, Outreach"
                    value={calling}
                    onChange={(e) => setCalling(e.target.value)}
                    className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Role / Involvement</label>
                  <input
                    type="text"
                    placeholder="e.g. Small Group Member, Servant Leader"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="disciple@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(210) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Prayer Watch & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Personal prayer focus or spiritual goals..."
                  value={prayerRequests}
                  onChange={(e) => setPrayerRequests(e.target.value)}
                  className="w-full bg-[#050A18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs font-mono cursor-pointer shadow-md"
                >
                  Save to Roster &rarr;
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Members Directory List */
          <div className="p-5 overflow-y-auto max-h-[70vh] space-y-3">
            {filteredMembers.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-[#070C1C] border border-dashed border-white/15 space-y-3">
                <Users className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300 font-mono">
                  No Disciples Found in Selected Filter
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  The fellowship roster is completely clean with no mock data. Be the first to register or add your fellowship brothers and sisters!
                </p>
                <button
                  onClick={handleOpenAddForm}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-mono font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register First Member</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredMembers.map((m) => {
                  const isMen = m.group === 'Men On Fire';
                  const isWomen = m.group === 'Women Ignited';
                  const badgeColor = isMen 
                    ? 'border-orange-500/40 bg-orange-500/15 text-orange-300' 
                    : isWomen 
                    ? 'border-rose-500/40 bg-rose-500/15 text-rose-300' 
                    : 'border-amber-500/40 bg-amber-500/15 text-amber-300';

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-[#070C1C] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center font-bold text-amber-400 text-sm">
                            {(m.fullName || m.name || 'D').charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white font-['Outfit']">
                              {m.fullName || m.name}
                            </h4>
                            <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border mt-0.5 ${badgeColor}`}>
                              {m.group === 'Men On Fire' && '⚔️ '}
                              {m.group === 'Women Ignited' && '👑 '}
                              {m.group === 'YoungFire' && '🔥 '}
                              {m.group} &bull; {m.role}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditMember(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 cursor-pointer"
                            title="Edit Disciple Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {currentUser?.isAdmin && !((m.fullName || m.name || '').toLowerCase().includes('trent') || (m.fullName || m.name || '').toLowerCase().includes('whitney')) && (
                            <button
                              onClick={() => handleDeleteMember(m.id)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                              title="Delete Disciple Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300 font-mono pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Calling:</span>
                          <span className="text-white font-semibold">{m.calling || 'Kingdom Fellowship'}</span>
                        </div>
                        {m.email && (
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <a href={`mailto:${m.email}`} className="text-cyan-400 hover:underline truncate">
                              {m.email}
                            </a>
                          </div>
                        )}
                        {m.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <a href={`tel:${m.phone}`} className="text-slate-300 hover:text-white">
                              {m.phone}
                            </a>
                          </div>
                        )}
                        {m.prayerRequests && (
                          <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-amber-200/90 italic">
                            "{m.prayerRequests}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-[#070C1C] px-5 py-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Joshua House of Worship &bull; Consecrated YoungFire Protocol</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
