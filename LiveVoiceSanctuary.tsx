import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Mic, MicOff, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

interface LiveVoiceSanctuaryProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioDucking?: (shouldDuck: boolean) => void;
}

const SANCTUARY_VOICE_PASSAGES = [
  {
    ref: 'Ephesians 4:16',
    title: 'Rebuilding Better Together',
    text: 'From whom the whole body fitly joined together and compacted by that which every joint supplieth, according to the effectual working in the measure of every part, maketh increase of the body unto the edifying of itself in love.'
  },
  {
    ref: 'Philippians 4:6–7',
    title: 'Peace of God',
    text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.'
  },
  {
    ref: 'Psalm 23:1–6',
    title: 'The Lord is My Shepherd',
    text: 'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.'
  },
  {
    ref: 'Romans 8:28, 31',
    title: 'More Than Conquerors',
    text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose. If God be for us, who can be against us?'
  }
];

export const LiveVoiceSanctuary: React.FC<LiveVoiceSanctuaryProps> = ({
  isOpen,
  onClose,
  onAudioDucking
}) => {
  const [selectedPassage, setSelectedPassage] = useState(SANCTUARY_VOICE_PASSAGES[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (onAudioDucking) onAudioDucking(false);
    };
  }, [onAudioDucking]);

  if (!isOpen) return null;

  // Single Voice Instance Speech Synthesis: Always cancel prior to speaking!
  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      if (onAudioDucking) onAudioDucking(false);
      return;
    }

    // Enforce single voice instance
    window.speechSynthesis.cancel();
    if (onAudioDucking) onAudioDucking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onAudioDucking) onAudioDucking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onAudioDucking) onAudioDucking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleMic = () => {
    setIsMicListening(!isMicListening);
  };

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#0B1329] border border-cyan-400/40 rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - High contrast white #FFFFFF with ice-blue #38BDF8 accents */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Outfit'] uppercase text-[#FFFFFF]">
                LIVE VOICE SANCTUARY
              </h2>
              <p className="text-[10px] font-mono text-[#38BDF8]">
                Scripture Narration & Audio Intercession
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              if (onAudioDucking) onAudioDucking(false);
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white cursor-pointer"
            aria-label="Close Voice Sanctuary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Scripture Voice Card */}
        <div className="p-5 bg-slate-950/80 rounded-2xl border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
              {selectedPassage.ref} &bull; {selectedPassage.title}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              KJV Canonical
            </span>
          </div>

          <p className="text-sm font-serif italic text-[#FFFFFF] leading-relaxed">
            "{selectedPassage.text}"
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              onClick={() => handleSpeak(selectedPassage.text)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                isSpeaking
                  ? 'bg-rose-600/30 border border-rose-500 text-rose-300 shadow-md'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-black'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Cancel Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Recite Aloud</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleMic}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isMicListening
                  ? 'bg-rose-500 text-slate-950 border-rose-400 animate-pulse'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Voice Input"
            >
              {isMicListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Passage Selection List */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-300 uppercase font-bold block">
            Select Sanctuary Passage:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SANCTUARY_VOICE_PASSAGES.map((p) => {
              const isSelected = selectedPassage.ref === p.ref;
              return (
                <div
                  key={p.ref}
                  onClick={() => {
                    setSelectedPassage(p);
                    if (isSpeaking) handleSpeak(p.text);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <h4 className="text-xs font-bold text-white">{p.ref}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{p.title}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
