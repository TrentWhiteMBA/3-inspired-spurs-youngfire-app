import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, BookOpen, Shuffle, Heart, MessageSquare, 
  Send, Sparkles, Flame, Check, Share2, Bookmark, Info, RefreshCw,
  Edit3, Trash2, Calendar, Clock, CheckCircle2, User, ChevronRight
} from 'lucide-react';
import { BIBLE_BOOKS } from '../data/bibleBooks';
import { CurrentUser } from './SettingsHUDModal';

export interface OpenBiblePost {
  id: string;
  author: string;
  authorId?: string;
  authorAvatar?: string;
  authorRole: string;
  date: string; // Formatted display e.g. "Thursday, 7:42 PM CST"
  timestamp: number; // Unix timestamp for robust date filtering
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  reflection: string;
  likes: number;
  comments: Array<{
    id: string;
    author: string;
    text: string;
    date: string;
  }>;
}

interface KjvBook {
  abbrev: string;
  chapters: string[][];
}

interface ScriptureCard {
  bookName: string;
  bookId: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
}

interface OpenBibleThursdaysProps {
  onBack?: () => void;
  onNavigateToScripture?: (bookId: string, chapter: number) => void;
  currentUser?: CurrentUser | null;
}

// Classical Fisher-Yates (Knuth) Shuffle Algorithm
function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// Generate formatted timestamp string: "Thursday, 7:42 PM CST"
function formatThursdayTimestamp(date: Date = new Date()): string {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true, 
    timeZone: 'America/Chicago' 
  });
  return `${dayName}, ${timeStr} CST`;
}

export const OpenBibleThursdays: React.FC<OpenBibleThursdaysProps> = ({
  onBack,
  onNavigateToScripture,
  currentUser = null
}) => {
  // Archive filter tabs: 'this_thursday' | 'weekly' | 'monthly' | 'all'
  const [archiveFilter, setArchiveFilter] = useState<'this_thursday' | 'weekly' | 'monthly' | 'all'>('this_thursday');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Active user session resolution
  const activeUser = currentUser || (() => {
    try {
      const saved = localStorage.getItem('youngfire_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })() || {
    id: 'roster_trent',
    name: 'Trent D. White',
    role: 'Lead Facilitator & Overseer',
    avatar: '/image_4.png'
  };

  // Community Reflections State (synced with API + localStorage)
  const [posts, setPosts] = useState<OpenBiblePost[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_openbible_posts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // KJV Database for canonical 66-book indexing
  const [kjvData, setKjvData] = useState<KjvBook[]>([]);

  // Fisher-Yates Session Deck State
  const [sessionDeck, setSessionDeck] = useState<ScriptureCard[]>([]);
  const [sessionDeckIndex, setSessionDeckIndex] = useState<number>(0);

  // Current Active Drawn Scripture
  const [currentScripture, setCurrentScripture] = useState<ScriptureCard>({
    bookName: 'Ephesians',
    bookId: 'EPH',
    chapter: 4,
    verseNumber: 16,
    verseText: 'From whom the whole body fitly joined together and compacted by that which every joint supplieth, according to the effectual working in the measure of every part, maketh increase of the body unto the edifying of itself in love.'
  });

  const [isFlipping, setIsFlipping] = useState(false);
  const [copyConfirmed, setCopyConfirmed] = useState(false);

  // New Reflection Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formBookName, setFormBookName] = useState('Ephesians');
  const [formChapter, setFormChapter] = useState(4);
  const [formVerseNumber, setFormVerseNumber] = useState(16);
  const [formVerseText, setFormVerseText] = useState('');
  const [formReflection, setFormReflection] = useState('');

  // Comment input state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // 1. Load initial posts from server
  useEffect(() => {
    fetch('/api/openbible')
      .then(res => res.json())
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(prev => {
            const ids = new Set(prev.map(p => p.id));
            const newEntries = data.filter((d: any) => !ids.has(d.id));
            return [...prev, ...newEntries];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Sync posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('youngfire_openbible_posts', JSON.stringify(posts));
    } catch {}
  }, [posts]);

  // 2. Build full canonical verse pool across all 66 books and initialize Fisher-Yates Deck
  const buildAndShuffleDeck = useCallback((books: KjvBook[]): ScriptureCard[] => {
    const pool: ScriptureCard[] = [];

    books.forEach((book, bIdx) => {
      const canonicalMeta = BIBLE_BOOKS[bIdx] || { 
        name: book.abbrev.toUpperCase(), 
        id: book.abbrev.toUpperCase() 
      };

      if (!book.chapters || book.chapters.length === 0) return;

      // Extract high-impact verses across every chapter of all 66 books
      book.chapters.forEach((chapterVerses, chIdx) => {
        if (!chapterVerses || chapterVerses.length === 0) return;

        // Sample up to 2 verses per chapter across all 66 books
        const step = Math.max(1, Math.floor(chapterVerses.length / 2));
        for (let vIdx = 0; vIdx < chapterVerses.length; vIdx += step) {
          const rawText = chapterVerses[vIdx];
          if (!rawText) continue;
          const cleanText = rawText.replace(/\{.*?\}/g, '').trim();

          pool.push({
            bookName: canonicalMeta.name,
            bookId: canonicalMeta.id,
            chapter: chIdx + 1,
            verseNumber: vIdx + 1,
            verseText: cleanText
          });
        }
      });
    });

    // Execute session-persistent Fisher-Yates Shuffle
    const shuffled = fisherYatesShuffle(pool);

    try {
      sessionStorage.setItem('youngfire_openbible_fy_deck', JSON.stringify(shuffled));
      sessionStorage.setItem('youngfire_openbible_fy_index', '0');
    } catch {}

    return shuffled;
  }, []);

  // 3. Load KJV bible data for 66-book random generator
  useEffect(() => {
    fetch('/bible_kjv_66.json')
      .then(res => res.json())
      .then((data: KjvBook[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setKjvData(data);

          // Check if existing session deck exists in sessionStorage
          try {
            const savedDeck = sessionStorage.getItem('youngfire_openbible_fy_deck');
            const savedIdx = sessionStorage.getItem('youngfire_openbible_fy_index');

            if (savedDeck) {
              const parsedDeck = JSON.parse(savedDeck);
              if (Array.isArray(parsedDeck) && parsedDeck.length > 0) {
                const idx = savedIdx ? parseInt(savedIdx, 10) || 0 : 0;
                setSessionDeck(parsedDeck);
                setSessionDeckIndex(idx);
                if (parsedDeck[idx]) {
                  setCurrentScripture(parsedDeck[idx]);
                }
                return;
              }
            }
          } catch {}

          // Otherwise build new Fisher-Yates deck across all 66 books
          const newDeck = buildAndShuffleDeck(data);
          setSessionDeck(newDeck);
          setSessionDeckIndex(0);
          if (newDeck.length > 0) {
            setCurrentScripture(newDeck[0]);
          }
        }
      })
      .catch(err => console.warn('Could not load KJV bible data:', err));
  }, [buildAndShuffleDeck]);

  // 4. Non-Repeating Randomizer Draw (Fisher-Yates Pointer)
  const handleRandomFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    let deck = sessionDeck;
    let nextIndex = sessionDeckIndex + 1;

    // If deck exhausted or empty, reshuffle entire 66-book pool
    if (deck.length === 0 || nextIndex >= deck.length) {
      if (kjvData.length > 0) {
        deck = buildAndShuffleDeck(kjvData);
        nextIndex = 0;
        setSessionDeck(deck);
      } else {
        // Safe fallback
        const randomBook = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
        const card: ScriptureCard = {
          bookName: randomBook.name,
          bookId: randomBook.id,
          chapter: 1,
          verseNumber: 1,
          verseText: `${randomBook.name} 1:1 — The Living Word of God enduring through all generations.`
        };
        setTimeout(() => {
          setCurrentScripture(card);
          setIsFlipping(false);
        }, 500);
        return;
      }
    }

    const selectedVerse = deck[nextIndex];
    setSessionDeckIndex(nextIndex);

    try {
      sessionStorage.setItem('youngfire_openbible_fy_index', nextIndex.toString());
    } catch {}

    // Visual roll-flip animation
    let shuffleCount = 0;
    const interval = setInterval(() => {
      shuffleCount++;
      if (shuffleCount > 7) {
        clearInterval(interval);
        setCurrentScripture(selectedVerse);
        setFormBookName(selectedVerse.bookName);
        setFormChapter(selectedVerse.chapter);
        setFormVerseNumber(selectedVerse.verseNumber);
        setFormVerseText(selectedVerse.verseText);
        setIsFlipping(false);
      }
    }, 60);
  };

  // Manual Reshuffle handler
  const handleManualReshuffle = () => {
    if (kjvData.length === 0) return;
    const newDeck = buildAndShuffleDeck(kjvData);
    setSessionDeck(newDeck);
    setSessionDeckIndex(0);
    if (newDeck.length > 0) {
      setCurrentScripture(newDeck[0]);
    }
  };

  // Copy citation to clipboard
  const handleCopyCitation = () => {
    const citation = `"${currentScripture.verseText}" — ${currentScripture.bookName} ${currentScripture.chapter}:${currentScripture.verseNumber} (KJV)`;
    navigator.clipboard?.writeText(citation).then(() => {
      setCopyConfirmed(true);
      setTimeout(() => setCopyConfirmed(false), 2000);
    }).catch(() => {});
  };

  // Form Open Trigger with current verse loaded
  const handleOpenFormWithCurrentScripture = () => {
    setFormBookName(currentScripture.bookName);
    setFormChapter(currentScripture.chapter);
    setFormVerseNumber(currentScripture.verseNumber);
    setFormVerseText(currentScripture.verseText);
    setIsFormOpen(true);
  };

  // 5. Post Reflection Handler
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReflection.trim()) return;

    const now = new Date();
    const dateFormatted = formatThursdayTimestamp(now);

    const newPost: OpenBiblePost = {
      id: `ob_${Date.now()}`,
      author: activeUser?.name || 'YoungFire Disciple',
      authorId: activeUser?.id,
      authorAvatar: activeUser?.avatar || '',
      authorRole: activeUser?.role || 'Kingdom Believer',
      date: dateFormatted,
      timestamp: now.getTime(),
      bookName: formBookName || currentScripture.bookName,
      chapter: formChapter || currentScripture.chapter,
      verseNumber: formVerseNumber || currentScripture.verseNumber,
      verseText: formVerseText || currentScripture.verseText,
      reflection: formReflection.trim(),
      likes: 0,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setFormReflection('');
    setIsFormOpen(false);

    // Sync to backend
    fetch('/api/openbible', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    }).catch(() => {});
  };

  // Edit and Delete Permissions
  const canModifyPost = (post: OpenBiblePost): boolean => {
    if (!activeUser) return true;
    const role = (activeUser.role || '').toLowerCase();
    const isAdmin = role.includes('admin') || role.includes('overseer') || role.includes('facilitator') || role.includes('leader');
    const isAuthor = post.author?.toLowerCase().trim() === activeUser.name?.toLowerCase().trim() || 
                     (post.authorId && post.authorId === activeUser.id);
    return isAdmin || isAuthor;
  };

  const handleDeletePost = (id: string) => {
    if (!window.confirm('Delete this Thursday reflection?')) return;
    setPosts(prev => prev.filter(p => p.id !== id));
    fetch(`/api/openbible/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    const updated = posts.map(p => p.id === id ? { ...p, reflection: editingText.trim() } : p);
    setPosts(updated);
    setEditingPostId(null);
    setEditingText('');

    const target = updated.find(p => p.id === id);
    if (target) {
      fetch(`/api/openbible/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      }).catch(() => {});
    }
  };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    }));
    fetch(`/api/openbible/${id}/like`, { method: 'POST' }).catch(() => {});
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `c_${Date.now()}`,
              author: activeUser?.name || 'Fellow Disciple',
              text,
              date: 'Just now'
            }
          ]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // 6. Filter Reflections Logic
  const filteredPosts = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;

    return posts.filter(post => {
      if (archiveFilter === 'all') return true;

      const postTime = post.timestamp || now;
      const ageMs = now - postTime;

      if (archiveFilter === 'this_thursday') {
        // Within 7 days and posted on Thursday or date label contains "Thursday"
        const isRecent = ageMs <= sevenDaysMs;
        const mentionsThursday = (post.date || '').toLowerCase().includes('thursday');
        return isRecent && (mentionsThursday || ageMs <= 2 * oneDayMs);
      }

      if (archiveFilter === 'weekly') {
        return ageMs <= sevenDaysMs;
      }

      if (archiveFilter === 'monthly') {
        return ageMs <= thirtyDaysMs;
      }

      return true;
    });
  }, [posts, archiveFilter]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 select-none px-2 sm:px-4">
      {/* 1. TOP HEADER WITH PURPOSE SUBTITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-start gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors mt-0.5"
              title="Return to Fellowship Sanctuary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-black uppercase font-['Outfit'] text-white tracking-wide">
                OPEN BIBLE THURSDAYS
              </h2>
            </div>
            {/* Explicit Purpose Subtitle */}
            <p className="text-xs text-amber-300/90 font-serif mt-1 max-w-2xl leading-relaxed">
              Spontaneous Expository Encounter — sharpening the sword through Spirit-led, non-repeating verse selection for young adult hermeneutics and group discussion.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleManualReshuffle}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400/50 text-slate-300 hover:text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Reshuffle the session deck across all 66 books"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reshuffle Deck</span>
          </button>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFormOpen ? 'Close Form' : 'Post Reflection'}</span>
          </button>
        </div>
      </div>

      {/* 2. PURPOSE HERO BANNER WITH /image_6.png & SUBTLE DARK VIGNETTE */}
      <div 
        className="relative border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(4, 7, 17, 0.72) 0%, rgba(4, 7, 17, 0.85) 60%, rgba(4, 7, 17, 0.95) 100%), url('/image_6.png')`
        }}
      >
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5 shadow-inner">
            <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                PURPOSE & HERMENEUTICS
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Thursday 7:30 PM CST
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                Session Fisher-Yates Active
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black font-['Outfit'] uppercase text-white tracking-wide">
              Spontaneous Expository Encounter
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-100 font-serif leading-relaxed">
              <strong>Spontaneous Expository Encounter — sharpening the sword through Spirit-led, non-repeating verse selection for young adult hermeneutics and group discussion.</strong>
            </p>

            <p className="text-xs text-slate-300 font-serif leading-relaxed">
              Every passage drawn during this session uses a mathematical Fisher-Yates shuffle array spanning Genesis through Revelation, guaranteeing <strong>zero repeated verses</strong> throughout your gathering.
            </p>
          </div>
        </div>
      </div>

      {/* 3. NON-REPEATING RANDOMIZER CONSOLE (FISHER-YATES SHUFFLE ENGINE) */}
      <div className="bg-[#0B1329] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Session Shuffle Counter Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
            <Shuffle className="w-4 h-4" />
            <span>SESSION FISHER-YATES SHUFFLE ARRAY</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Deck Draw: #{sessionDeckIndex + 1} of {sessionDeck.length > 0 ? sessionDeck.length : 66}</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-emerald-400 font-bold">Zero Repeats Active</span>
          </div>
        </div>

        {/* Drawn Scripture Card */}
        <div className="p-6 sm:p-8 bg-slate-950/90 rounded-2xl border-2 border-amber-500/30 space-y-4 max-w-3xl mx-auto shadow-2xl relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold tracking-wide">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>{currentScripture.bookName} {currentScripture.chapter}:{currentScripture.verseNumber} (KJV)</span>
          </div>

          <p className={`text-base sm:text-xl font-serif italic text-white leading-relaxed tracking-wide ${isFlipping ? 'opacity-20 blur-sm scale-98 transition-all' : 'opacity-100 scale-100 transition-all'}`}>
            "{currentScripture.verseText}"
          </p>

          {/* Quick Context & Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-white/10 text-xs font-mono">
            {onNavigateToScripture && (
              <button
                onClick={() => onNavigateToScripture(currentScripture.bookId, currentScripture.chapter)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="Read entire chapter in Scripture Atlas"
              >
                <span>Read Full Chapter</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleCopyCitation}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {copyConfirmed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copyConfirmed ? 'Citation Copied!' : 'Copy Citation'}</span>
            </button>

            <button
              onClick={handleOpenFormWithCurrentScripture}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-1.5 cursor-pointer transition-all font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reflect on This Passage</span>
            </button>
          </div>
        </div>

        {/* Big Flip Button */}
        <div>
          <button
            onClick={handleRandomFlip}
            disabled={isFlipping}
            className={`w-full max-w-md mx-auto py-3.5 px-6 rounded-2xl font-mono font-bold text-sm tracking-wide uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
              isFlipping
                ? 'bg-amber-600/50 text-slate-900 cursor-wait'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 hover:brightness-110 shadow-amber-500/25 active:scale-98'
            }`}
          >
            <Shuffle className={`w-5 h-5 ${isFlipping ? 'animate-spin' : ''}`} />
            <span>{isFlipping ? 'Unrolling Canonical Scripture...' : 'Draw Next Non-Repeating Scripture'}</span>
          </button>
          <p className="text-[11px] font-mono text-slate-400 mt-2">
            66-Book Fisher-Yates Deck: Guaranteed distinct verses for active young adult study.
          </p>
        </div>
      </div>

      {/* 4. POST REFLECTION ACCORDION FORM */}
      {isFormOpen && (
        <form onSubmit={handleCreatePost} className="bg-[#0B1329] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-black font-['Outfit'] uppercase text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Publish Thursday Hermeneutical Reflection</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Logged as <span className="text-amber-400 font-bold">{activeUser?.name}</span> &bull; Timestamp will record automatically
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-white cursor-pointer font-mono text-xs"
            >
              ✕ Close
            </button>
          </div>

          {/* Passage Citation Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Bible Book</label>
              <input
                type="text"
                value={formBookName}
                onChange={(e) => setFormBookName(e.target.value)}
                className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Chapter</label>
              <input
                type="number"
                min="1"
                value={formChapter}
                onChange={(e) => setFormChapter(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Verse Number</label>
              <input
                type="number"
                min="1"
                value={formVerseNumber}
                onChange={(e) => setFormVerseNumber(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">Passage Text Cited</label>
            <textarea
              value={formVerseText}
              onChange={(e) => setFormVerseText(e.target.value)}
              rows={2}
              className="w-full bg-[#070C1C] border border-white/10 rounded-xl p-3 text-xs text-amber-200/90 font-serif italic"
              placeholder="The Scripture verse..."
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Your Expository Reflection & Hermeneutics
            </label>
            <textarea
              value={formReflection}
              onChange={(e) => setFormReflection(e.target.value)}
              rows={4}
              className="w-full bg-[#070C1C] border border-white/10 rounded-xl p-3 text-xs text-white font-serif leading-relaxed"
              placeholder="What is the Holy Spirit revealing in this text? How does this sharpen your faith or challenge practical obedience today?"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-mono text-slate-400">
              Timestamp: <strong className="text-amber-400">{formatThursdayTimestamp()}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono cursor-pointer shadow-md"
              >
                Publish Reflection
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 5. ARCHIVE & REFLECTION HISTORY FEED */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 border-b border-white/10 pb-3">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Thursday Reflection Archive ({filteredPosts.length})</span>
            </h4>
            <p className="text-[10px] font-mono text-amber-400">
              Expository Reflections &bull; Real Timestamps &bull; Editable by Authors & Admins
            </p>
          </div>

          {/* Filter Tabs: "This Thursday", "Weekly Archive", "Monthly Archive", "All" */}
          <div className="flex items-center gap-1.5 bg-[#0B1329] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setArchiveFilter('this_thursday')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                archiveFilter === 'this_thursday'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Thursday
            </button>
            <button
              onClick={() => setArchiveFilter('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                archiveFilter === 'weekly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Archive
            </button>
            <button
              onClick={() => setArchiveFilter('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                archiveFilter === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Archive
            </button>
            <button
              onClick={() => setArchiveFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                archiveFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-[#0B1329] border border-white/10 rounded-3xl p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
            <h5 className="text-sm font-bold text-white font-['Outfit'] uppercase">
              No Reflections for {archiveFilter === 'this_thursday' ? 'This Thursday' : archiveFilter === 'weekly' ? 'This Week' : 'This Month'}
            </h5>
            <p className="text-xs text-slate-300 font-serif max-w-md mx-auto">
              Flip a fresh scripture using the Fisher-Yates generator above, meditate on the text with your small group, and post your reflection.
            </p>
            <button
              onClick={handleOpenFormWithCurrentScripture}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono cursor-pointer inline-flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Post Reflection for {currentScripture.bookName} {currentScripture.chapter}:{currentScripture.verseNumber}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const canEdit = canModifyPost(post);
              return (
                <div key={post.id} className="bg-[#0B1329] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  {/* Reflection Card Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      {post.authorAvatar ? (
                        <img 
                          src={post.authorAvatar} 
                          alt={post.author} 
                          className="w-9 h-9 rounded-full object-cover border border-amber-500/40"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-black">
                          {post.author.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{post.author}</h5>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                            {post.authorRole}
                          </span>
                        </div>
                        {/* Timestamp: "Thursday, 7:42 PM CST" */}
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{post.bookName} {post.chapter}:{post.verseNumber}</span>
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingPostId(post.id);
                              setEditingText(post.reflection);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-amber-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Edit Reflection"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px] font-mono">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-rose-400 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Delete Reflection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px] font-mono">Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cited Scripture Blockquote */}
                  <blockquote className="p-3.5 bg-slate-950/70 rounded-2xl border border-white/5 font-serif italic text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                    "{post.verseText}"
                  </blockquote>

                  {/* Reflection Text or In-place Editor */}
                  {editingPostId === post.id ? (
                    <div className="space-y-3 p-3 bg-slate-950/80 rounded-2xl border border-amber-500/40">
                      <label className="text-[10px] font-mono text-amber-400 block font-bold">Editing Reflection:</label>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full bg-[#070C1C] border border-white/15 rounded-xl p-3 text-xs text-white font-serif leading-relaxed"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2 text-xs font-mono">
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(post.id)}
                          className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-200 font-serif leading-relaxed">
                      {post.reflection}
                    </p>
                  )}

                  {/* Actions & Praises */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.likes > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes} {post.likes === 1 ? 'Praise' : 'Praises'}</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments.length} Comments</span>
                    </div>
                  </div>

                  {/* Comments Thread */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      {post.comments.map((c) => (
                        <div key={c.id} className="p-2.5 bg-slate-950/40 rounded-xl border border-white/5 text-xs space-y-0.5">
                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <strong className="text-amber-400">{c.author}</strong>
                            <span>{c.date}</span>
                          </div>
                          <p className="text-slate-200 font-serif">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add kingdom encouragement..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }
                      }}
                      className="flex-1 bg-[#070C1C] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(post.id)}
                      className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
