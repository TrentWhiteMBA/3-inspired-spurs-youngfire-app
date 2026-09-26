import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, BookMarked, CheckCircle2, Award, 
  Calendar, Flame, Sparkles, Shield, Bookmark, Check, 
  BarChart3, TrendingUp, Clock, Users, BookOpen 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhysicalBibleTrackerProps {
  onBack: () => void;
}

interface BibleCheckIn {
  id: string;
  date: string;
  timestamp: string;
  gatheringType: string;
  passageRead: string;
  notes: string;
  chaptersCount: number;
}

export const PhysicalBibleTracker: React.FC<PhysicalBibleTrackerProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'analytics'>('checkin');

  const [checkIns, setCheckIns] = useState<BibleCheckIn[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_bible_checkins');
      return saved ? JSON.parse(saved) : [
        {
          id: 'ci-1',
          date: 'Tuesday, Sep 22',
          timestamp: '7:15 PM CST',
          gatheringType: 'Tuesday Small Group Huddle',
          passageRead: 'Ephesians 4:11–16',
          notes: 'Every joint supplies what the body needs. Fitly framed together.',
          chaptersCount: 1
        },
        {
          id: 'ci-2',
          date: 'Thursday, Sep 17',
          timestamp: '7:40 PM CST',
          gatheringType: 'Open Bible Thursdays',
          passageRead: 'John 15:1–8',
          notes: 'Abide in the True Vine. Bearing lasting kingdom fruit.',
          chaptersCount: 1
        },
        {
          id: 'ci-3',
          date: 'Tuesday, Sep 15',
          timestamp: '7:10 PM CST',
          gatheringType: 'Tuesday Small Group Huddle',
          passageRead: 'Joshua 1:1–9',
          notes: 'Be strong and of a good courage; do not be afraid.',
          chaptersCount: 1
        },
        {
          id: 'ci-4',
          date: 'Thursday, Sep 10',
          timestamp: '7:30 PM CST',
          gatheringType: 'Open Bible Thursdays',
          passageRead: 'Hebrews 4:12–16',
          notes: 'Word of God is sharper than any two-edged sword.',
          chaptersCount: 1
        }
      ];
    } catch {
      return [];
    }
  });

  const [gatheringType, setGatheringType] = useState('Tuesday Small Group Huddle');
  const [passageRead, setPassageRead] = useState('');
  const [chaptersCount, setChaptersCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Save to localStorage immediately
  useEffect(() => {
    try {
      localStorage.setItem('youngfire_bible_checkins', JSON.stringify(checkIns));
    } catch (e) {
      console.error('Failed to save check-ins', e);
    }
  }, [checkIns]);

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passageRead.trim()) return;

    const newCheckIn: BibleCheckIn = {
      id: `ci-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ' CST',
      gatheringType,
      passageRead: passageRead.trim(),
      notes: notes.trim(),
      chaptersCount: Number(chaptersCount) || 1
    };

    setCheckIns(prev => [newCheckIn, ...prev]);
    setPassageRead('');
    setNotes('');
    setShowSuccessToast(true);

    // Gold ember confetti burst on physical Bible check-in milestone
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#D97706', '#FEF08A', '#FFA500'],
        shapes: ['circle', 'square'],
        ticks: 180,
        gravity: 1.1,
        scalar: 1.1
      });
    } catch (err) {
      console.warn('Confetti trigger error:', err);
    }

    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const streakCount = checkIns.length;
  const totalChapters = checkIns.reduce((acc, ci) => acc + (ci.chaptersCount || 1), 0);
  const prayerHoursEst = (checkIns.length * 0.75).toFixed(1);

  const BADGES = [
    { id: 'b1', name: 'Sword Carrier', desc: '1st Physical Bible Check-In', min: 1, icon: BookMarked, unlocked: streakCount >= 1 },
    { id: 'b2', name: 'Battle Tested', desc: '3 Check-In Streak', min: 3, icon: Shield, unlocked: streakCount >= 3 },
    { id: 'b3', name: 'Locked In', desc: '7 Check-In Streak', min: 7, icon: Flame, unlocked: streakCount >= 7 },
    { id: 'b4', name: 'Berean Disciple', desc: '10+ Gathering Check-Ins', min: 10, icon: Award, unlocked: streakCount >= 10 },
    { id: 'b5', name: '52-Week Pillar', desc: 'Year-Round Consecration', min: 52, icon: Sparkles, unlocked: streakCount >= 52 },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-20 select-none px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
            aria-label="Back to Sanctuary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase font-['Outfit'] text-white">
              PHYSICAL BIBLE TRACKER & ANALYTICS
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              Hebrews 4:12 &bull; Weapon of Truth &bull; Discipleship Metric Hub
            </p>
          </div>
        </div>

        {/* View Switcher: Check-In vs Analytics */}
        <div className="flex bg-[#0B1329] p-1 rounded-xl border border-white/10 text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              activeTab === 'checkin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sword Check-In
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
              activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics Hub</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessToast && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-400 rounded-2xl flex items-center gap-2.5 text-emerald-300 text-xs font-mono font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Physical Sword Checked In! Analytics & streaks synced.</span>
        </div>
      )}

      {/* TAB 1: SWORD CHECK-IN */}
      {activeTab === 'checkin' && (
        <div className="space-y-5">
          {/* Main Check-In Form Card */}
          <div className="bg-[#0B1329] border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-4 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Consecration Check-In Window
              </span>
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                Check In Your Paper Sword
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log the scripture opened in your physical print Bible during tonight's study or personal devotion.
              </p>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Gathering / Session
                  </label>
                  <select
                    value={gatheringType}
                    onChange={(e) => setGatheringType(e.target.value)}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Tuesday Small Group Huddle">Tuesday Small Group Huddle</option>
                    <option value="Open Bible Thursdays">Open Bible Thursdays</option>
                    <option value="Sunday Worship Service">Sunday Worship Service</option>
                    <option value="Personal Morning Watch">Personal Morning Watch</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Chapters Read
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={chaptersCount}
                    onChange={(e) => setChaptersCount(Number(e.target.value))}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Passage / Chapter Opened *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ephesians 4:1–16 or Romans 8:28"
                  value={passageRead}
                  onChange={(e) => setPassageRead(e.target.value)}
                  required
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Key Rhema / Reflection Note
                </label>
                <textarea
                  rows={2}
                  placeholder="What verse stood out from the physical page?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase tracking-wider text-xs font-['Outfit'] hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20"
              >
                Verify Sword Check-In &rarr;
              </button>
            </form>
          </div>

          {/* Badges Shelf */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold px-1">
              Consecration Milestones
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BADGES.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center gap-3 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${
                      b.unlocked
                        ? 'bg-amber-500/15 border-amber-400/50 text-white'
                        : 'bg-[#0B1329] border-white/5 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      b.unlocked ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-white/5 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold font-['Outfit'] text-white">
                        {b.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Check-Ins Log */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold px-1">
              Recent Check-Ins
            </h4>
            <div className="space-y-2">
              {checkIns.map((ci) => (
                <div
                  key={ci.id}
                  className="p-3.5 bg-[#0B1329] border border-white/10 rounded-2xl space-y-1 text-left border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {ci.passageRead}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {ci.date} &bull; {ci.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    {ci.gatheringType} ({ci.chaptersCount || 1} chapter)
                  </p>
                  {ci.notes && (
                    <p className="text-xs text-slate-200 font-serif italic pt-1 border-t border-white/5">
                      "{ci.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS HUB */}
      {activeTab === 'analytics' && (
        <div className="space-y-5">
          {/* Key Metric Numbers Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#0B1329] border border-amber-500/30 rounded-2xl space-y-1 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                Sword Streak
              </span>
              <div className="text-2xl font-black font-['Outfit'] text-white">
                {streakCount} Wks
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Active consistency</span>
            </div>

            <div className="p-4 bg-[#0B1329] border border-cyan-500/30 rounded-2xl space-y-1 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                Chapters Read
              </span>
              <div className="text-2xl font-black font-['Outfit'] text-white">
                {totalChapters}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Canonical verses</span>
            </div>

            <div className="p-4 bg-[#0B1329] border border-emerald-500/30 rounded-2xl space-y-1 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                Prayer Time
              </span>
              <div className="text-2xl font-black font-['Outfit'] text-white">
                {prayerHoursEst} hrs
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Intercession</span>
            </div>

            <div className="p-4 bg-[#0B1329] border border-purple-500/30 rounded-2xl space-y-1 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                Fellowships
              </span>
              <div className="text-2xl font-black font-['Outfit'] text-white">
                {checkIns.length}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Huddles attended</span>
            </div>
          </div>

          {/* Visual Discipleship Progress Bars */}
          <div className="bg-[#0B1329] border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
              Consecration Progress Across Pillars
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Physical Bible Mastery</span>
                  <span className="text-amber-400 font-bold">{Math.min(100, Math.round((totalChapters / 20) * 100))}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(100, Math.round((totalChapters / 20) * 100))}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Small Group Huddle Attendance</span>
                  <span className="text-cyan-400 font-bold">{Math.min(100, streakCount * 15)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(100, streakCount * 15)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Open Bible Thursdays Participation</span>
                  <span className="text-emerald-400 font-bold">85%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Discipleship Goal */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">52-Week Goal</span>
              <h5 className="text-xs font-bold text-white">Sword Carrier Milestone: 52 Gathering Check-Ins</h5>
              <p className="text-[10px] text-slate-400">Consecrated sword in hand for every Joshua House huddle.</p>
            </div>
            <div className="text-sm font-mono font-black text-amber-300">
              {streakCount} / 52
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
