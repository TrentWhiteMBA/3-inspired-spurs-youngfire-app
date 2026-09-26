import React, { useState } from 'react';
import { BookmarkedVerse, HighlightColor } from '../types/scripture';
import { HIGHLIGHT_COLORS } from '../services/scriptureService';
import { X, Bookmark, Trash2, ExternalLink, Copy, Check, Search, CloudCheck } from 'lucide-react';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkedVerse[];
  onNavigateToVerse: (bookId: string, chapter: number, verse: number) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onNavigateToVerse,
  onDeleteBookmark
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const filteredBookmarks = bookmarks.filter(bm => {
    const q = filterText.toLowerCase();
    return (
      bm.bookName.toLowerCase().includes(q) ||
      bm.text.toLowerCase().includes(q) ||
      `${bm.chapter}:${bm.verse}`.includes(q)
    );
  });

  const handleCopy = (bm: BookmarkedVerse) => {
    const citation = `${bm.bookName} ${bm.chapter}:${bm.verse} - "${bm.text}" (${bm.translation || 'KJV'})`;
    navigator.clipboard.writeText(citation);
    setCopiedId(bm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100 animate-slideInRight"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Bookmark className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-['Cinzel'] text-white">Bookmarked Verses</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  {bookmarks.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono mt-0.5">
                <CloudCheck className="w-3.5 h-3.5" />
                <span>Connected to Firebase Cloud Storage</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Search bookmarks by book or verse..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl focus:border-amber-400 focus:outline-none font-mono placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredBookmarks.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Bookmark className="w-10 h-10 mx-auto text-slate-600 opacity-50 stroke-[1.5]" />
              <p className="text-xs font-mono">
                {bookmarks.length === 0
                  ? 'No verses bookmarked yet.'
                  : 'No bookmarks matched your filter.'}
              </p>
              <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
                Click the bookmark star or choose a highlight color on any verse to sync it with your Firebase account across all devices.
              </p>
            </div>
          ) : (
            filteredBookmarks.map(bm => {
              const colorObj = HIGHLIGHT_COLORS.find(c => c.id === bm.highlightColor);
              const isCopied = copiedId === bm.id;

              return (
                <div
                  key={bm.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-amber-300 font-mono">
                        {bm.bookName} {bm.chapter}:{bm.verse}
                      </span>
                      {colorObj && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold"
                          style={{
                            backgroundColor: `${colorObj.dotColor}22`,
                            color: colorObj.dotColor,
                            border: `1px solid ${colorObj.dotColor}44`
                          }}
                        >
                          {colorObj.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(bm)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copy verse citation"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onNavigateToVerse(bm.bookId, bm.chapter, bm.verse);
                          onClose();
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Jump to verse in chapter"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteBookmark(bm.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove bookmark from Firebase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-serif leading-relaxed line-clamp-3">
                    "{bm.text}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                    <span>{bm.translation || 'KJV'}</span>
                    <span>
                      {bm.savedAt
                        ? new Date(bm.savedAt).toLocaleDateString()
                        : 'Saved to Firebase'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
