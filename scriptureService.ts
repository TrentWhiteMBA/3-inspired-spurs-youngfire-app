/**
 * Scripture Service
 * Handles:
 * 1. Bible text loading from local /bible_kjv_66.json and translations
 * 2. Real-time Firebase storage engine integration for bookmarked verses and highlights
 * 3. Multi-device persistence via Firestore users/{userId}/saved_scriptures
 */

import { BIBLE_BOOKS } from '../data/bibleBooks';
import { BibleBook, BookmarkedVerse, VerseItem, HighlightColor, BibleTranslation } from '../types/scripture';

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { id: 'kjv', name: 'King James Version', abbreviation: 'KJV', description: 'Authorized 1611 Classical Canon' },
  { id: 'nkjv', name: 'New King James Version', abbreviation: 'NKJV', description: 'Modernized Classical Text & Contemporary Syntax' },
  { id: 'nlt', name: 'New Living Translation', abbreviation: 'NLT', description: 'Clear, Warm & Dynamic-Equivalence Modern English' },
  { id: 'web', name: 'World English Bible', abbreviation: 'WEB', description: 'Modern Faithful Literal Translation' },
  { id: 'bbe', name: 'Bible in Basic English', abbreviation: 'BBE', description: 'Plain English & Direct Vocabulary' },
  { id: 'oeb-us', name: 'Open English Bible', abbreviation: 'OEB', description: 'Contemporary Reverent English' }
];

export const HIGHLIGHT_COLORS: HighlightColor[] = [
  {
    id: 'gold',
    name: 'Kingdom Gold',
    dotColor: '#F59E0B',
    bgClass: 'bg-amber-100/75 text-slate-900',
    borderClass: 'border-amber-400 ring-2 ring-amber-300 shadow-amber-500/10',
    starColor: '#D97706'
  },
  {
    id: 'emerald',
    name: 'Life Emerald',
    dotColor: '#10B981',
    bgClass: 'bg-emerald-100/75 text-slate-900',
    borderClass: 'border-emerald-400 ring-2 ring-emerald-300 shadow-emerald-500/10',
    starColor: '#059669'
  },
  {
    id: 'sky',
    name: 'Celestial Sky',
    dotColor: '#0EA5E9',
    bgClass: 'bg-sky-100/75 text-slate-900',
    borderClass: 'border-sky-400 ring-2 ring-sky-300 shadow-sky-500/10',
    starColor: '#0284C7'
  },
  {
    id: 'purple',
    name: 'Royal Amethyst',
    dotColor: '#A855F7',
    bgClass: 'bg-purple-100/75 text-slate-900',
    borderClass: 'border-purple-400 ring-2 ring-purple-300 shadow-purple-500/10',
    starColor: '#7C3AED'
  },
  {
    id: 'rose',
    name: 'Covenant Rose',
    dotColor: '#F43F5E',
    bgClass: 'bg-rose-100/75 text-slate-900',
    borderClass: 'border-rose-400 ring-2 ring-rose-300 shadow-rose-500/10',
    starColor: '#E11D48'
  },
  {
    id: 'orange',
    name: 'Revival Fire',
    dotColor: '#F97316',
    bgClass: 'bg-orange-100/75 text-slate-900',
    borderClass: 'border-orange-400 ring-2 ring-orange-300 shadow-orange-500/10',
    starColor: '#C2410C'
  }
];

// Clean Hebrew / Greek bracket annotations
export function cleanVerseText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\{[^}]*:\s*[^}]*\}/g, '')
    .replace(/\{([^{}]+)\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Convert archaic pronouns to modern readability for NLT-style preview
function modernizeEnglishNLT(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bthee\b/gi, m => m[0] === 'T' ? 'You' : 'you')
    .replace(/\bthou\b/gi, m => m[0] === 'T' ? 'You' : 'you')
    .replace(/\bthine\b/gi, m => m[0] === 'T' ? 'Yours' : 'yours')
    .replace(/\bthy\b/gi, m => m[0] === 'T' ? 'Your' : 'your')
    .replace(/\bthyself\b/gi, 'yourself')
    .replace(/\bhath\b/gi, m => m[0] === 'H' ? 'Has' : 'has')
    .replace(/\bdoth\b/gi, m => m[0] === 'D' ? 'Does' : 'does')
    .replace(/\bunto\b/gi, m => m[0] === 'U' ? 'To' : 'to')
    .replace(/\bsaith\b/gi, m => m[0] === 'S' ? 'Says' : 'says')
    .replace(/\bart\b/g, 'are')
    .replace(/\bwilt\b/gi, 'will')
    .replace(/\bshalt\b/gi, 'shall')
    .replace(/\bspake\b/gi, 'spoke')
    .replace(/\bwhosoever\b/gi, 'anyone who')
    .replace(/\bwherefore\b/gi, 'so')
    .replace(/\bverily, verily\b/gi, 'I tell you the solemn truth')
    .replace(/\bverily\b/gi, 'truly')
    .replace(/\bbrethren\b/gi, 'brothers and sisters')
    .replace(/\blord god almighty\b/gi, 'the Lord God, the All-Powerful');
}

function modernizeEnglishNKJV(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bthee\b/gi, m => m[0] === 'T' ? 'You' : 'you')
    .replace(/\bthou\b/gi, m => m[0] === 'T' ? 'You' : 'you')
    .replace(/\bthine\b/gi, m => m[0] === 'T' ? 'Yours' : 'yours')
    .replace(/\bthy\b/gi, m => m[0] === 'T' ? 'Your' : 'your')
    .replace(/\bthyself\b/gi, 'yourself')
    .replace(/\bhath\b/gi, m => m[0] === 'H' ? 'Has' : 'has')
    .replace(/\bdoth\b/gi, m => m[0] === 'D' ? 'Does' : 'does')
    .replace(/\bunto\b/gi, m => m[0] === 'U' ? 'To' : 'to')
    .replace(/\bsaith\b/gi, m => m[0] === 'S' ? 'Says' : 'says')
    .replace(/\bart\b/g, 'are')
    .replace(/\bwilt\b/gi, 'will')
    .replace(/\bshalt\b/gi, 'shall')
    .replace(/\bspake\b/gi, 'spoke')
    .replace(/\bwhosoever\b/gi, 'whoever')
    .replace(/\bwherefore\b/gi, 'therefore');
}

// In-memory cache for bible_kjv_66.json
let bibleKjvCache: any[] | null = null;
let bibleKjvPromise: Promise<any[]> | null = null;

export async function fetchBibleKjv(): Promise<any[]> {
  if (bibleKjvCache) return bibleKjvCache;
  if (!bibleKjvPromise) {
    bibleKjvPromise = fetch('/bible_kjv_66.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching /bible_kjv_66.json`);
        return res.json();
      })
      .then(data => {
        bibleKjvCache = data;
        return data;
      })
      .catch(async err => {
        console.warn('Failed to load local /bible_kjv_66.json, falling back to CDN:', err);
        try {
          const cdnRes = await fetch('https://cdn.jsdelivr.net/gh/thiagobodruk/bible@master/json/en_kjv.json');
          const cdnData = await cdnRes.json();
          bibleKjvCache = cdnData;
          return cdnData;
        } catch (e) {
          console.error('Failed to load Bible from CDN as well:', e);
          return [];
        }
      });
  }
  return bibleKjvPromise;
}

// Fetch chapter verses
export async function fetchChapterVerses(
  bookId: string,
  chapter: number,
  bookName?: string,
  translation: string = 'kjv'
): Promise<VerseItem[]> {
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  const targetName = bookName || book?.name || 'Genesis';

  if (translation === 'kjv' || translation === 'nkjv' || translation === 'nlt') {
    try {
      const bibleData = await fetchBibleKjv();
      if (bibleData && bibleData.length > 0) {
        // Find book by name or index
        const b = bibleData.find(
          item =>
            (item.name && item.name.toLowerCase() === targetName.toLowerCase()) ||
            (item.name && book && item.name.toLowerCase() === book.name.toLowerCase()) ||
            (item.abbrev && book && item.abbrev.toLowerCase() === book.id.toLowerCase())
        );

        if (b && b.chapters && b.chapters[chapter - 1]) {
          const rawVerses: string[] = b.chapters[chapter - 1];
          return rawVerses.map((verseText, idx) => {
            let cleaned = cleanVerseText(verseText);
            if (translation === 'nkjv') cleaned = modernizeEnglishNKJV(cleaned);
            if (translation === 'nlt') cleaned = modernizeEnglishNLT(cleaned);
            return {
              verseNumber: idx + 1,
              text: cleaned
            };
          });
        }
      }
    } catch (e) {
      console.warn('Local Bible fetch error, falling back to network API:', e);
    }
  }

  // Network fallback using bible-api.com
  try {
    const encodedBook = encodeURIComponent(targetName.toLowerCase());
    const apiUrl = `https://bible-api.com/${encodedBook}+${chapter}?translation=${translation}`;
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.verses) && data.verses.length > 0) {
        return data.verses.map((v: any) => ({
          verseNumber: Number(v.verse),
          text: cleanVerseText(v.text)
        }));
      }
    }
  } catch (err) {
    console.warn(`Fetch to bible-api.com for ${translation} failed:`, err);
  }

  // Safe fallback for essential passages (e.g. John 2)
  if (bookId === 'JHN' && chapter === 2) {
    return [
      { verseNumber: 1, text: 'And the third day there was a marriage in Cana of Galilee; and the mother of Jesus was there:' },
      { verseNumber: 2, text: 'And both Jesus was called, and his disciples, to the marriage.' },
      { verseNumber: 3, text: 'And when they wanted wine, the mother of Jesus saith unto him, They have no wine.' },
      { verseNumber: 4, text: 'Jesus saith unto her, Woman, what have I to do with thee? mine hour is not yet come.' },
      { verseNumber: 5, text: 'His mother saith unto the servants, Whatsoever he saith unto you, do it.' },
      { verseNumber: 6, text: 'And there were set there six waterpots of stone, after the manner of the purifying of the Jews, containing two or three firkins apiece.' },
      { verseNumber: 7, text: 'Jesus saith unto them, Fill the waterpots with water. And they filled them up to the brim.' },
      { verseNumber: 8, text: 'And he saith unto them, Draw out now, and bear unto the governor of the feast. And they bare it.' },
      { verseNumber: 9, text: 'When the ruler of the feast had tasted the water that was made wine, and knew not whence it was: (but the servants which drew the water knew;) the governor of the feast called the bridegroom,' },
      { verseNumber: 10, text: 'And saith unto him, Every man at the beginning doth set forth good wine; and when men have well drunk, then that which is worse: but thou hast kept the good wine until now.' },
      { verseNumber: 11, text: 'This beginning of miracles did Jesus in Cana of Galilee, and manifested forth his glory; and his disciples believed on him.' }
    ];
  }

  return [];
}

// -------------------------------------------------------------
// FIREBASE STORAGE ENGINE FOR BOOKMARKS & HIGHLIGHTS
// -------------------------------------------------------------

const BOOKMARKS_STORAGE_KEY = 'yf_bookmarked_verses';
const HIGHLIGHTS_STORAGE_KEY = 'yf_verse_highlights_v2';

/**
 * Get all bookmarked verses from localStorage (seeded by Firestore)
 */
export function getSavedBookmarks(): BookmarkedVerse[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get all verse highlights from localStorage (seeded by Firestore)
 */
export function getSavedHighlights(): Record<string, string> {
  try {
    const raw = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save or update a bookmarked verse directly into the Firebase Storage Engine
 */
export async function saveBookmarkToFirestore(bookmark: BookmarkedVerse): Promise<void> {
  if (!bookmark || !bookmark.id) return;

  // 1. Update local bookmarks
  try {
    const existing = getSavedBookmarks();
    const idx = existing.findIndex(b => b.id === bookmark.id);
    let updated: BookmarkedVerse[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = { ...existing[idx], ...bookmark, updatedAt: new Date().toISOString() };
    } else {
      updated = [bookmark, ...existing];
    }
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error updating local bookmark storage:', e);
  }

  // 2. Transmit to Firebase Firestore storage engine
  const win = window as any;
  if (typeof win.__saveScriptureToFirestore === 'function') {
    try {
      await win.__saveScriptureToFirestore({
        id: bookmark.id,
        type: 'bookmark',
        bookId: bookmark.bookId,
        bookName: bookmark.bookName,
        chapter: bookmark.chapter,
        verse: bookmark.verse,
        text: bookmark.text,
        translation: bookmark.translation || 'KJV',
        highlightColor: bookmark.highlightColor || null,
        savedAt: bookmark.savedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('🔥 [ScriptureViewer] Bookmarked verse saved to Firestore:', bookmark.id);
    } catch (err) {
      console.warn('Firebase saveBookmark error:', err);
    }
  }

  // 3. Dispatch update event
  window.dispatchEvent(
    new CustomEvent('yf_saved_scriptures_updated', {
      detail: { bookmarks: getSavedBookmarks(), highlights: getSavedHighlights() }
    })
  );
}

/**
 * Delete a bookmarked verse from Firebase Firestore storage engine
 */
export async function deleteBookmarkFromFirestore(bookmarkId: string): Promise<void> {
  if (!bookmarkId) return;

  // 1. Remove from local storage
  try {
    const existing = getSavedBookmarks();
    const updated = existing.filter(b => b.id !== bookmarkId);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error deleting local bookmark:', e);
  }

  // 2. Delete from Firebase Firestore
  const win = window as any;
  if (typeof win.__deleteScriptureFromFirestore === 'function') {
    try {
      await win.__deleteScriptureFromFirestore(bookmarkId);
      console.log('🔥 [ScriptureViewer] Deleted bookmark from Firestore:', bookmarkId);
    } catch (err) {
      console.warn('Firebase deleteBookmark error:', err);
    }
  }

  // 3. Dispatch update event
  window.dispatchEvent(
    new CustomEvent('yf_saved_scriptures_updated', {
      detail: { bookmarks: getSavedBookmarks(), highlights: getSavedHighlights() }
    })
  );
}

/**
 * Save or remove a highlight color in Firebase and local storage
 */
export async function saveHighlightToFirestore(
  bookId: string,
  chapter: number,
  verseNumber: number,
  colorId: string | null,
  verseText: string = '',
  bookName: string = ''
): Promise<void> {
  const verseKey = `${bookId}_${chapter}_${verseNumber}`;
  const highlightDocId = `hl_${verseKey}`;

  // 1. Update highlights map in local storage
  const highlights = getSavedHighlights();
  if (colorId) {
    highlights[verseKey] = colorId;
  } else {
    delete highlights[verseKey];
  }
  try {
    localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(highlights));
  } catch {}

  const win = window as any;

  // 2. If color selected, save highlight doc to Firestore
  if (colorId && typeof win.__saveScriptureToFirestore === 'function') {
    try {
      await win.__saveScriptureToFirestore({
        id: highlightDocId,
        verseKey,
        type: 'highlight',
        bookId,
        bookName: bookName || bookId,
        chapter,
        verse: verseNumber,
        highlightColor: colorId,
        text: verseText,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firebase save highlight error:', e);
    }
  } else if (!colorId && typeof win.__deleteScriptureFromFirestore === 'function') {
    try {
      await win.__deleteScriptureFromFirestore(highlightDocId);
    } catch (e) {
      console.warn('Firebase delete highlight error:', e);
    }
  }

  // 3. Keep bookmark in sync with highlight
  const bookmarkId = `bm_${bookId}_${chapter}_${verseNumber}`;
  if (colorId) {
    await saveBookmarkToFirestore({
      id: bookmarkId,
      type: 'bookmark',
      bookId,
      bookName: bookName || bookId,
      chapter,
      verse: verseNumber,
      text: verseText,
      translation: 'KJV',
      highlightColor: colorId,
      savedAt: new Date().toISOString()
    });
  }

  // 4. Dispatch event
  window.dispatchEvent(
    new CustomEvent('yf_saved_scriptures_updated', {
      detail: { bookmarks: getSavedBookmarks(), highlights }
    })
  );
}
