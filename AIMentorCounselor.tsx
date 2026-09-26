import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, Send, Volume2, VolumeX, 
  BookOpen, Heart, Shield, RefreshCw, Compass, MessageSquare 
} from 'lucide-react';

interface AIMentorCounselorProps {
  onBack?: () => void;
  onAudioDucking?: (shouldDuck: boolean) => void;
  onNavigateToScripture?: (bookId: string, chapter: number) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  scriptures?: string[];
  timestamp: string;
}

const COUNSEL_STARTERS = [
  "How do I balance high-demand work with spiritual discipline?",
  "What scriptures guide purity and intentional dating for young adults?",
  "How do I discover my calling and spiritual gifts in YoungFire?",
  "I am feeling anxious about future career decisions and feeling alone.",
  "How do I overcome spiritual warfare and daily temptation?"
];

export const AIMentorCounselor: React.FC<AIMentorCounselorProps> = ({
  onBack,
  onAudioDucking,
  onNavigateToScripture
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'mentor',
      text: "Grace and peace to you in Christ Jesus, disciple! I am your YoungFire Pastoral Counselor and Young Adult Discipleship Mentor at Joshua House of Worship in San Antonio, TX. Whatever you are walking through—whether it is career pressure, dating and purity, spiritual dry seasons, or discerning your calling—I am here to listen and anchor you in the living Word of God. What is weighing on your spirit today?",
      scriptures: ["Proverbs 3:5–6", "Ephesians 4:16"],
      timestamp: "Just now"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (onAudioDucking) onAudioDucking(false);
    };
  }, [onAudioDucking]);

  // Single Voice Instance Speech Synthesis with Audio Ducking
  const handleToggleVoice = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Voice speech synthesis is not supported on this device.");
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      setIsVoiceActive(false);
      if (onAudioDucking) onAudioDucking(false);
      return;
    }

    window.speechSynthesis.cancel();
    if (onAudioDucking) onAudioDucking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
      setIsVoiceActive(false);
      if (onAudioDucking) onAudioDucking(false);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
      setIsVoiceActive(false);
      if (onAudioDucking) onAudioDucking(false);
    };

    setSpeakingMessageId(msgId);
    setIsVoiceActive(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputValue;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Build conversation history to prevent repetitive answers
    const historyPayload = messages.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text
    }));

    try {
      // 1. Attempt server AI call with Gemini
      const res = await fetch('/api/counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q.trim(), history: historyPayload })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          // Parse out any quoted scriptures from the response
          const scriptureMatches = data.response.match(/([1-3]?[A-Za-z]+ \d+:\d+(?:–\d+)?)/g) || ["Ephesians 4:16"];
          const mentorMsg: Message = {
            id: `m-${Date.now()}`,
            sender: 'mentor',
            text: data.response,
            scriptures: Array.from(new Set(scriptureMatches)).slice(0, 3) as string[],
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          };
          setMessages(prev => [...prev, mentorMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('AI endpoint unavailable, using rich scriptural fallback:', err);
    }

    // 2. Realistic, empathetic fallback with full scripture quotes
    setTimeout(() => {
      const promptLower = q.toLowerCase();
      let scriptureRef = 'Philippians 4:6–7 & Isaiah 41:10';
      let fullScriptureText = '"Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus." (Philippians 4:6–7)';
      let counselBody = "I hear the weight in what you are carrying. When decisions, expectations, or emotional fatigue press against your mind, God never designed you to absorb the pressure alone. Take 10 minutes tonight before you sleep to physically open your Bible and speak this scripture out loud over your home.";
      let practicalAction = "1. Unplug from social media and work emails at least 30 minutes before bed.\n2. Bring this exact situation to Tuesday Small Group Huddle for confidential prayer.\n3. Write this verse on an index card and keep it on your desk tomorrow.";
      let blessing = "May the Lord bless you with supernatural peace that transcends earthly understanding. He is with you wherever you go, and your steps are ordered by His grace.";

      if (promptLower.includes('dating') || promptLower.includes('relationship') || promptLower.includes('purity') || promptLower.includes('marriage')) {
        scriptureRef = 'Proverbs 4:23 & 1 Corinthians 13:4–7';
        fullScriptureText = '"Keep thy heart with all diligence; for out of it are the issues of life." (Proverbs 4:23) & "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up." (1 Corinthians 13:4)';
        counselBody = "Kingdom relationships are not about finding someone to complete you; they are about two whole believers running after Jesus with everything in them, locked arm in arm. Protect your emotional and physical boundaries with honor. A godly spouse will always draw you closer to Christ, never compromise your consecration.";
        practicalAction = "1. Set clear, spoken boundaries early in any intentional relationship.\n2. Seek accountability with a mature married couple or ministry leader in YoungFire.\n3. Pray together before making any major emotional commitments.";
        blessing = "May God give you the spirit of wisdom and discernment to guard your heart, honor your body as a temple of the Holy Ghost, and recognize the godly partner He prepares in His timing.";
      } else if (promptLower.includes('job') || promptLower.includes('career') || promptLower.includes('work') || promptLower.includes('college')) {
        scriptureRef = 'Colossians 3:23–24 & Proverbs 16:3';
        fullScriptureText = '"And whatsoever ye do, do it heartily, as to the Lord, and not unto men; Knowing that of the Lord ye shall receive the reward of the inheritance: for ye serve the Lord Christ." (Colossians 3:23–24)';
        counselBody = "In the marketplace, remember you are not just working for a paycheck or promotion—you are a kingdom ambassador stationed behind a desk, in a clinic, or on a job site. When you do your work with excellence, integrity, and humility, your character becomes a living sermon before you ever preach a word.";
        practicalAction = "1. Pray over your workplace each morning before walking through the doors.\n2. When work stress spikes, step away for 60 seconds and whisper: 'Lord, I work for You today.'\n3. Connect with other YoungFire disciples in the Young Professionals pillar for marketplace encouragement.";
        blessing = "May the Lord establish the work of your hands with divine favor, grant you creative insight that honors His name, and open doors that no man can shut.";
      } else if (promptLower.includes('calling') || promptLower.includes('purpose') || promptLower.includes('gifts')) {
        scriptureRef = 'Ephesians 4:16 & Romans 12:4–6';
        fullScriptureText = '"From whom the whole body fitly joined together and compacted by that which every joint supplieth, according to the effectual working in the measure of every part, maketh increase of the body unto the edifying of itself in love." (Ephesians 4:16)';
        counselBody = "Your divine purpose is rarely found by sitting still and waiting for lightning to strike; it is discovered in active service. When you use your hands to serve in Small Groups, greet new visitors, pray on Thursday nights, or help with media, God reveals your spiritual wiring and burden for people.";
        practicalAction = "1. Plug into one of our 12 YoungFire Hubs (like Outreach, Media, or Small Groups) this month.\n2. Ask Pastor Trent or Whitney where the greatest hands-on need is right now.\n3. Keep a journal of what spiritual tasks bring you holy joy and kingdom fruit.";
        blessing = "May the Father unveil the fullness of the gifts He deposited in you from before the foundation of the world. You are a chosen vessel, fitly framed for such a time as this!";
      }

      const mentorMsg: Message = {
        id: `m-${Date.now()}`,
        sender: 'mentor',
        text: `Grace and peace, disciple. I hear your heart, and the Word of God speaks directly to where your feet are planted today.\n\n📖 **The Scripture Anchor:**\n${fullScriptureText}\n\n💡 **Pastoral Counsel for You:**\n${counselBody}\n\n⚔️ **Concrete Action Steps Today:**\n${practicalAction}\n\n🙏 **A Blessing Over Your Life:**\n${blessing}`,
        scriptures: [scriptureRef],
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };

      setMessages(prev => [...prev, mentorMsg]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-24 select-none px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-black uppercase font-['Outfit'] text-white">
                SCRIPTURE COUNSELOR & MENTOR
              </h2>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Grounded Exclusively in Holy Scripture &bull; Pastoral Care for Ages 18–35
            </p>
          </div>
        </div>

        {isVoiceActive && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold animate-pulse">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice Audio Active</span>
          </div>
        )}
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {COUNSEL_STARTERS.map((starter, i) => (
          <button
            key={i}
            onClick={() => handleSend(starter)}
            className="text-[11px] font-mono text-slate-300 bg-[#0B1329] hover:bg-purple-950/40 border border-white/10 hover:border-purple-400/40 px-3 py-1.5 rounded-full transition-all cursor-pointer text-left"
          >
            "{starter}"
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="bg-[#0B1329] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto">
        {messages.map((msg) => {
          const isMentor = msg.sender === 'mentor';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMentor ? 'justify-start' : 'justify-end'}`}
            >
              {isMentor && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0 text-purple-300 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[88%] space-y-2.5 ${
                isMentor 
                  ? 'bg-slate-950/80 border border-purple-500/30 rounded-3xl p-4 text-white' 
                  : 'bg-amber-500 text-slate-950 font-medium rounded-3xl p-3.5 shadow-md'
              }`}>
                <div className="flex items-center justify-between gap-4 text-[10px] font-mono opacity-70">
                  <span className="font-bold">{isMentor ? 'YOUNGFIRE PASTORAL COUNSEL' : 'DISCIPLE'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className={`text-xs leading-relaxed whitespace-pre-wrap ${isMentor ? 'text-slate-100 font-serif' : 'text-slate-950 font-sans'}`}>
                  {msg.text}
                </div>

                {/* Grounded Scriptures Deep Link */}
                {isMentor && msg.scriptures && msg.scriptures.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                      Scripture Anchor Points:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.scriptures.map((scrip, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (onNavigateToScripture) {
                              const bookName = scrip.split(' ')[0].substring(0, 3).toUpperCase();
                              const chapterNum = parseInt(scrip.split(' ')[1]) || 1;
                              onNavigateToScripture(bookName, chapterNum);
                            }
                          }}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono hover:bg-amber-500/30 cursor-pointer flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{scrip} &rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Voice Read Aloud Toggle Button */}
                {isMentor && (
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleToggleVoice(msg.id, msg.text)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      title="Read counsel aloud"
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-400" />
                          <span className="text-rose-300">Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-cyan-400" />
                          <span>Listen Aloud (TTS)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-2xl border border-white/5 text-xs text-purple-300 font-mono">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Seeking scriptural discernment and pastoral wisdom...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask for biblical advice on career, dating, prayer, doubts, or calling..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-[#0B1329] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 shadow-inner"
        />
        <button
          type="submit"
          className="px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-purple-600/20 flex items-center justify-center transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
