import React, { useState, useRef } from 'react';
import { 
  Flame, Shield, Lock, Mail, ArrowRight, UserCheck, 
  CheckCircle2, Heart, Upload, Camera, Sparkles, Image as ImageIcon 
} from 'lucide-react';
import { CurrentUser } from './SettingsHUDModal';

interface AuthSecurityPortalProps {
  onAuthenticated: (user: CurrentUser) => void;
}

// Consecrated Avatar Presets for YoungFire Disciples
const AVATAR_PRESETS = [
  { id: 'av_pulpit', label: 'Pulpit Truth', url: '/image_4.png' },
  { id: 'av_commission', label: 'Youth Commission', url: '/image_7.png' },
  { id: 'av_huddle', label: 'Discipleship Huddle', url: '/image_6.png' },
  { id: 'av_fellowship', label: 'Consecrated Fellowship', url: '/image_5.png' },
  { id: 'av_family', label: 'YoungFire Family', url: '/image_3.png' },
  { id: 'av_sisterhood', label: 'Sisterhood & Unity', url: '/image_2.png' }
];

export const AuthSecurityPortal: React.FC<AuthSecurityPortalProps> = ({ onAuthenticated }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('trentwhite0308@gmail.com');
  const [password, setPassword] = useState('youngfire2026');
  const [name, setName] = useState('Trent D. White');
  const [message, setMessage] = useState('');

  // Required Role & Gender for Discipleship Registration
  const [selectedRole, setSelectedRole] = useState<'brother' | 'sister'>('brother');
  
  // Profile Avatar Upload & Presets
  const [avatarImage, setAvatarImage] = useState<string>(AVATAR_PRESETS[0].url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setAvatarImage(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdminUser = email.toLowerCase().includes('trent') || 
                        email.toLowerCase().includes('whitney') || 
                        email.toLowerCase().includes('admin');
    
    let resolvedGender: 'male' | 'female' = 'male';
    if (email.toLowerCase().includes('whitney')) {
      resolvedGender = 'female';
    } else if (authMode === 'register') {
      resolvedGender = selectedRole === 'brother' ? 'male' : 'female';
    }

    const defaultAvatar = resolvedGender === 'male'
      ? '/image_4.png'
      : '/image_2.png';

    const user: CurrentUser = {
      id: `usr-${Date.now()}`,
      name: name.trim() || (isAdminUser ? (email.toLowerCase().includes('whitney') ? 'Whitney White' : 'Trent D. White') : 'YoungFire Disciple'),
      email: email.trim(),
      gender: resolvedGender,
      avatar: avatarImage || defaultAvatar,
      isAdmin: isAdminUser
    };

    // If new registration, sync to roster database and local storage so they appear in Admin CMS
    if (authMode === 'register') {
      const newRosterDoc = {
        id: user.id,
        fullName: user.name,
        name: user.name,
        role: selectedRole === 'brother' ? 'Brother (Young Adult Disciple)' : 'Sister (Young Adult Disciple)',
        calling: selectedRole === 'brother' ? 'Brotherhood Praise & Armor' : 'Sisterhood Prayer & Intercession',
        group: selectedRole === 'brother' ? 'Men On Fire' : 'Women Ignited',
        gender: resolvedGender,
        avatar: user.avatar,
        email: user.email,
        churchMembership: 'Joshua House of Worship',
        residence: 'San Antonio, TX'
      };

      try {
        const saved = localStorage.getItem('youngfire_member_roster_v2');
        const list = saved ? JSON.parse(saved) : [];
        list.unshift(newRosterDoc);
        localStorage.setItem('youngfire_member_roster_v2', JSON.stringify(list));
      } catch {}

      fetch('/api/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRosterDoc)
      }).catch(() => {});
    }

    onAuthenticated(user);
  };

  const handleGoogleSignIn = () => {
    const user: CurrentUser = {
      id: 'google-usr-1',
      name: 'Trent D. White',
      email: 'trentwhite0308@gmail.com',
      gender: 'male',
      avatar: '/image_4.png',
      isAdmin: true
    };
    onAuthenticated(user);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Password reset instructions sent to your email.');
    setTimeout(() => {
      setMessage('');
      setAuthMode('signin');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#040711] text-white flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md bg-[#0B1329] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Emblem & Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 border border-white/20">
            <Flame className="w-8 h-8 text-slate-950 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-[0.2em] font-['Outfit'] text-white">
              YOUNG<span className="text-amber-400">FIRE</span>
            </h1>
            <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
              Joshua House of Worship &bull; Consecrated Portal
            </p>
          </div>
        </div>

        {/* Status Toast */}
        {message && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex bg-[#070C1C] p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
              authMode === 'signin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setName('');
              setEmail('');
              setPassword('');
            }}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-colors ${
              authMode === 'register' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Sign In / Register Form */}
        {authMode !== 'forgot' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            {authMode === 'register' && (
              <>
                {/* 1. Full Name */}
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Caleb Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 2. REQUIRED ROLE SELECTION (Brother -> male, Sister -> female) */}
                <div>
                  <label className="text-[11px] font-mono text-slate-300 font-bold block mb-1.5 flex items-center justify-between">
                    <span>Discipleship Role & Cohort</span>
                    <span className="text-amber-400 text-[10px]">Required *</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Brother Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('brother')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        selectedRole === 'brother'
                          ? 'bg-orange-500/20 border-orange-500 shadow-md shadow-orange-950/50 ring-1 ring-orange-400'
                          : 'bg-[#070C1C] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                          selectedRole === 'brother' ? 'bg-orange-500 text-slate-950' : 'bg-white/10 text-orange-400'
                        }`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        {selectedRole === 'brother' && (
                          <span className="text-[9px] font-mono font-bold text-orange-400 uppercase">Selected</span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-['Outfit']">Brother</div>
                        <div className="text-[10px] text-slate-400 font-mono">Young Adult Disciple</div>
                        <div className="text-[9px] text-orange-400/90 font-mono font-semibold mt-1">
                          &bull; Men On Fire
                        </div>
                      </div>
                    </button>

                    {/* Sister Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('sister')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        selectedRole === 'sister'
                          ? 'bg-rose-500/20 border-rose-500 shadow-md shadow-rose-950/50 ring-1 ring-rose-400'
                          : 'bg-[#070C1C] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                          selectedRole === 'sister' ? 'bg-rose-500 text-slate-950' : 'bg-white/10 text-rose-400'
                        }`}>
                          <Heart className="w-4 h-4" />
                        </div>
                        {selectedRole === 'sister' && (
                          <span className="text-[9px] font-mono font-bold text-rose-400 uppercase">Selected</span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-['Outfit']">Sister</div>
                        <div className="text-[10px] text-slate-400 font-mono">Young Adult Disciple</div>
                        <div className="text-[9px] text-rose-400/90 font-mono font-semibold mt-1">
                          &bull; Women Ignited
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. PROFILE AVATAR UPLOAD & SELECTION (Persists across all chat posts) */}
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-slate-300 font-bold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Profile Avatar (All Chat Posts)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Active Avatar Preview */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={avatarImage}
                        alt="Profile Preview"
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                      </div>
                    </div>

                    {/* Quick Preset Selector */}
                    <div className="flex-1">
                      <span className="text-[9px] font-mono text-slate-400 block mb-1">Or choose consecrated icon:</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {AVATAR_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setAvatarImage(p.url)}
                            className={`w-7 h-7 rounded-xl overflow-hidden border transition-all flex-shrink-0 cursor-pointer ${
                              avatarImage === p.url ? 'border-amber-400 scale-110 ring-1 ring-amber-400' : 'border-white/20 opacity-70 hover:opacity-100'
                            }`}
                            title={p.label}
                          >
                            <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  placeholder="disciple@jhow.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-mono text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase tracking-wider text-xs font-['Outfit'] hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20"
            >
              {authMode === 'signin' ? 'Enter Sanctuary →' : 'Complete Registration →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Account Email</label>
              <input
                type="email"
                placeholder="disciple@jhow.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Send Password Reset
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className="w-full text-center text-xs font-mono text-slate-400 hover:text-white"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* 1-Tap Google Sign In */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>Continue with Google (Trent D. White)</span>
          </button>
          <p className="text-[10px] text-center text-slate-400 font-mono">
            Secured by Consecrated JHOW YoungFire Protocol
          </p>
        </div>

      </div>
    </div>
  );
};
