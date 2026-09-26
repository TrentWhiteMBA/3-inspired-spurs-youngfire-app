import React, { useState } from 'react';
import { 
  Flame, Calendar, Clock, MapPin, Users, Heart, 
  Send, CheckCircle2, ArrowRight, ExternalLink, Globe,
  Video, Sparkles, Shield, Bookmark, ChevronRight
} from 'lucide-react';

interface WelcomeSanctuaryProps {
  onEnterSanctuary: () => void;
  onOpenRoster?: () => void;
}

export const WelcomeSanctuary: React.FC<WelcomeSanctuaryProps> = ({
  onEnterSanctuary,
  onOpenRoster
}) => {
  // Connect Card Form State
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [prayerNeed, setPrayerNeed] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // High-Res Image Loading States for Shimmer Pulse
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);
  const [leadershipImgLoaded, setLeadershipImgLoaded] = useState(false);

  const handleSubmitConnectCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    setIsSubmitting(true);
    const cardData = {
      id: `card_${Date.now()}`,
      name: name.trim(),
      contact: contact.trim(),
      prayerNeed: prayerNeed.trim(),
      createdAt: new Date().toISOString()
    };

    // Save to local storage for instant offline resilience
    try {
      const existing = JSON.parse(localStorage.getItem('youngfire_connect_cards') || '[]');
      existing.unshift(cardData);
      localStorage.setItem('youngfire_connect_cards', JSON.stringify(existing));
    } catch {}

    // Save to server/Firestore proxy
    try {
      await fetch('/api/connect-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });
    } catch {}

    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#040711] text-white select-none pb-28">
      {/* 1. HERO HEADER WITH /image_4.png & SPURS ATHLETIC DARK GRADIENT SCRIM */}
      <div className="relative w-full min-h-[460px] sm:min-h-[520px] flex flex-col justify-between overflow-hidden bg-[#040711]">
        {/* Shimmer skeleton while background loads */}
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

        {/* Athletic dark scrim overlay: linear-gradient(180deg, rgba(4,7,17,0.45) 0%, rgba(4,7,17,0.85) 70%, #040711 100%) */}
        <div 
          className="absolute inset-0 pointer-events-none z-1" 
          style={{
            background: 'linear-gradient(180deg, rgba(4, 7, 17, 0.45) 0%, rgba(4, 7, 17, 0.85) 70%, #040711 100%)'
          }}
        />

        {/* Top Ministry Badge Bar */}
        <div className="relative z-10 p-5 sm:p-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-amber-300/40">
              <Flame className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold block">
                DISCIPLESHIP SANCTUARY
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-widest uppercase font-['Outfit'] text-white">
                YOUNG<span className="text-amber-400">FIRE</span>
              </h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>San Antonio, TX</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="relative z-10 p-5 sm:p-8 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ephesians 4:16 &bull; Rebuilding Better Together</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase font-['Outfit'] tracking-tight text-white leading-tight drop-shadow-xl">
            WELCOME TO THE SANCTUARY
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-serif leading-relaxed drop-shadow max-w-2xl">
            YoungFire Discipleship &bull; Joshua House of Worship, San Antonio, TX. Sharpening iron with iron through authentic fellowship, systematic expository study, and fervent prayer.
          </p>

          {/* Primary CTA Button: Enter the Sanctuary / Join Roster */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onEnterSanctuary}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-black text-sm font-['Outfit'] uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-amber-500/30 hover:brightness-110 active:scale-98 cursor-pointer transition-all"
            >
              <span>Enter the Sanctuary / Join Roster</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {onOpenRoster && (
              <button
                onClick={onOpenRoster}
                className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>View Member Roster</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 mt-6">
        {/* 2. BI-WEEKLY RHYTHM HIGHLIGHT */}
        <div className="bg-[#0B1329] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black font-['Outfit'] uppercase text-white tracking-wide">
              YoungFire Discipleship Rhythm
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Small Groups Monday */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-orange-500/40 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono text-[10px] font-bold border border-orange-500/40">
                  Bi-Weekly Mondays
                </span>
                <span className="text-xs font-mono font-bold text-orange-400">7:00 PM CST</span>
              </div>
              <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase">
                YoungFire Small Groups
              </h4>
              <p className="text-xs text-slate-300 font-serif leading-relaxed">
                Living room fellowship, discipleship cohorts, and dinner. Meeting <strong>every other Monday at 7:00 PM CST</strong>.
              </p>
            </div>

            {/* Open Bible Thursdays */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                  Weekly Thursdays
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">7:30 PM CST</span>
              </div>
              <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase">
                Open Bible Thursdays
              </h4>
              <p className="text-xs text-slate-300 font-serif leading-relaxed">
                Spontaneous expository study and hermeneutics across all 66 books. Meeting <strong>every Thursday at 7:30 PM CST</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 3. LEADERSHIP & MINISTRY ROOTS (PHOTO /image_7.png WITH NO "PASTORS" / "MINISTERS" LABELS) */}
        <div className="bg-[#0B1329] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <Users className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base sm:text-lg font-black font-['Outfit'] uppercase text-white tracking-wide">
                Leadership & Ministry Roots
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Joshua House of Worship &bull; Rooted in discipleship and servant leadership
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Leadership Monolith Card with /image_7.png */}
            <div className="relative aspect-video sm:aspect-[16/10] rounded-2xl overflow-hidden border-t border-white/20 border border-white/10 bg-slate-950 shadow-2xl">
              {!leadershipImgLoaded && (
                <div className="absolute inset-0 bg-slate-900 animate-pulse z-0" />
              )}
              <img
                src="/image_7.png"
                alt="Facilitators Trent & Whitney White"
                onLoad={() => setLeadershipImgLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  leadershipImgLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ objectPosition: 'center 20%' }}
              />
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(4,7,17,0.1) 0%, rgba(4,7,17,0.7) 60%, #040711 100%)'
                }}
              />
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  LEADERSHIP ROOTS
                </span>
                <p className="text-sm font-bold text-white font-['Outfit'] drop-shadow">
                  Facilitators Trent & Whitney White
                </p>
              </div>
            </div>

            {/* Leadership Narrative */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Facilitators Trent & Whitney White</span>
              </div>

              <h4 className="text-base font-black font-['Outfit'] uppercase text-white">
                Called to Equip the Body in San Antonio
              </h4>

              <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed">
                YoungFire was birthed out of a burden to see young adults rooted in the living Word of God. Under the spiritual covering of Joshua House of Worship, Facilitators Trent & Whitney White walk alongside believers in intentional discipleship, transparent community, and practical exposition.
              </p>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">Foundational Creed:</span>
                <p className="text-xs font-serif italic text-slate-200">
                  "Till we all come in the unity of the faith, and of the knowledge of the Son of God, unto a perfect man, unto the measure of the stature of the fulness of Christ." &mdash; Ephesians 4:13
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. DIGITAL CONNECT CARD */}
        <div className="bg-[#0B1329] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base sm:text-lg font-black font-['Outfit'] uppercase text-white tracking-wide">
                  Digital Connect Card
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  Connect with YoungFire facilitators and submit prayer requests
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/40">
              Confidential
            </span>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/50 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white font-['Outfit'] uppercase">
                Welcome to the Family!
              </h4>
              <p className="text-xs text-slate-200 font-serif max-w-md mx-auto">
                Thank you for filling out the connect card. Facilitators Trent & Whitney White have received your information and are covering your requests in prayer.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-white/15 text-slate-300 hover:text-white text-xs font-mono cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitConnectCard} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Johnathan Davis"
                    className="w-full bg-[#070C1C] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Email or Phone Number</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. johnathan@example.com or (210) 555-0199"
                    className="w-full bg-[#070C1C] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">How can we pray for you? (Optional)</label>
                <textarea
                  rows={3}
                  value={prayerNeed}
                  onChange={(e) => setPrayerNeed(e.target.value)}
                  placeholder="Share any prayer requests, spiritual questions, or life transitions..."
                  className="w-full bg-[#070C1C] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-serif leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-slate-400">
                  Joshua House of Worship &bull; YoungFire Ministry
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Connect Card'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 5. OFFICIAL ACTION LINKS (JHOW WEBSITE, YOUTUBE, FACEBOOK) */}
        <div className="bg-[#0B1329] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-black font-['Outfit'] uppercase text-white tracking-wide">
              Official Ministry Connections
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* JHOW Official Website */}
            <a
              href="https://www.joshuahouseofworship.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 flex flex-col justify-between gap-3 group transition-all"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">
                  JHOW Main Website
                </h4>
                <p className="text-[11px] text-slate-400 font-serif">
                  Joshua House of Worship official home, mission, and giving.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400">
                <span>Visit Website</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>

            {/* YouTube Broadcasts */}
            <a
              href="https://www.youtube.com/@joshuahouseofworship"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-rose-400/50 flex flex-col justify-between gap-3 group transition-all"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Video className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-rose-300">
                  YouTube Broadcasts
                </h4>
                <p className="text-[11px] text-slate-400 font-serif">
                  Live sermon streams, worship anthems, and archives.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-rose-400">
                <span>Watch Channel</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>

            {/* Facebook Community */}
            <a
              href="https://www.facebook.com/joshuahouseofworship"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-blue-400/50 flex flex-col justify-between gap-3 group transition-all"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300">
                  Facebook Community
                </h4>
                <p className="text-[11px] text-slate-400 font-serif">
                  Church announcements, service updates, and photos.
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-blue-400">
                <span>Follow on Facebook</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Banner Button */}
        <div className="text-center pt-2">
          <button
            onClick={onEnterSanctuary}
            className="w-full max-w-md mx-auto py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 font-black text-sm font-['Outfit'] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-98 cursor-pointer transition-all"
          >
            <span>Enter the Sanctuary / Join Roster</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
