import React from 'react';
import { X, BarChart3, CheckCircle2, Flame, Award, BookOpen } from 'lucide-react';
import { BIBLE_BOOKS } from '../data/bibleBooks';

interface ReadingProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBook?: (bookId: string) => void;
}

export const ReadingProgressModal: React.FC<ReadingProgressModalProps> = ({
  isOpen,
  onClose,
  onNavigateToBook
}) => {
  if (!isOpen) return null;

  const totalChapters = 1189;
  const readChaptersCount = 142; // Sample stored progress
  const progressPercent = Math.round((readChaptersCount / totalChapters) * 100);

  const otBooks = BIBLE_BOOKS.filter(b => b.testament === 'OT');
  const ntBooks = BIBLE_BOOKS.filter(b => b.testament === 'NT');

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#0B1329] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-['Outfit'] uppercase text-white">
              DISCIPLESHIP READING PROGRESS
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Close Reading Progress"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Progress Capsule */}
        <div className="p-4 bg-slate-950/70 rounded-2xl border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300">
              66 Canonical Books Mastered
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {readChaptersCount} / {totalChapters} Chapters ({progressPercent}%)
            </span>
          </div>
          
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Old Testament: 39 Books</span>
            <span>New Testament: 27 Books</span>
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-bold text-white">Gospel Complete</div>
              <div className="text-[10px] text-slate-400 font-mono">John, Matthew, Mark, Luke</div>
            </div>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <div>
              <div className="font-bold text-white">Ephesian Armor</div>
              <div className="text-[10px] text-slate-400 font-mono">2026 Vision Theme Mastered</div>
            </div>
          </div>
        </div>

        {/* Quick Testament Books List */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 mb-2">
              New Testament Epistles & Gospels
            </h4>
            <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
              {ntBooks.slice(0, 16).map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onClose();
                    if (onNavigateToBook) onNavigateToBook(b.id);
                  }}
                  className="p-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-slate-300 hover:text-white hover:border-emerald-400 text-center cursor-pointer transition-colors"
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
