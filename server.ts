import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Port configuration: AI Studio and container proxy expects port 3000.
// Port 8080 is reserved for Nginx, so we ignore PORT=8080.
let port = 3000;
const portIndex = process.argv.indexOf('--port');
if (portIndex !== -1 && process.argv[portIndex + 1]) {
  const parsed = parseInt(process.argv[portIndex + 1], 10);
  if (!isNaN(parsed) && parsed !== 8080) port = parsed;
} else if (process.env.APP_PORT) {
  const parsed = parseInt(process.env.APP_PORT, 10);
  if (!isNaN(parsed) && parsed !== 8080) port = parsed;
} else if (process.env.PORT && process.env.PORT !== '8080') {
  const parsed = parseInt(process.env.PORT, 10);
  if (!isNaN(parsed)) port = parsed;
}

app.use(express.json({ limit: '50mb' }));

// Health check endpoints for probes
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Shared AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// In-memory data store with persistent defaults
interface RosterMember {
  id: string;
  fullName: string;
  name: string;
  role: string;
  calling: string;
  group: string;
  gender?: string;
  avatar?: string;
  email?: string;
  churchMembership: string;
  residence: string;
}

interface EventItem {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  videoLink?: string;
  description: string;
  isZoom: boolean;
  zoomUrl?: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
  rsvps: string[];
}

interface OpenBibleEntry {
  id: string;
  author: string;
  authorRole: string;
  date: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  reflection: string;
  tags: string[];
  likes: number;
  comments: Array<{
    id: string;
    author: string;
    authorRole: string;
    date: string;
    text: string;
  }>;
  isArchived: boolean;
  timestamp: number;
}

interface BibleLog {
  id: string;
  userId: string;
  userName: string;
  dateString: string;
  timestamp: number;
  gatheringTitle: string;
  bibleTranslationOrName: string;
  notes: string;
}

// Initial Data - Clean persistent defaults with overseers and disciples
let roster: RosterMember[] = [
  {
    id: 'roster_trent',
    fullName: 'Trent D. White',
    name: 'Trent D. White',
    role: 'Lead Facilitator & Overseer',
    calling: 'Preaching & Discipleship Leadership',
    group: 'Men On Fire',
    gender: 'male',
    avatar: '/images/jhow_pulpit_leadership_1790403554820.jpg',
    email: 'trentwhite0308@gmail.com',
    churchMembership: 'Joshua House of Worship',
    residence: 'San Antonio, TX'
  },
  {
    id: 'roster_whitney',
    fullName: 'Whitney White',
    name: 'Whitney White',
    role: 'Lead Facilitator & Sisterhood Overseer',
    calling: 'Prayer Watch & Women’s Ministry',
    group: 'Women Ignited',
    gender: 'female',
    avatar: '/images/group_welcome_selfie_1790403632138.jpg',
    email: 'whitneywhite@jhow.org',
    churchMembership: 'Joshua House of Worship',
    residence: 'San Antonio, TX'
  },
  {
    id: 'roster_caleb',
    fullName: 'Caleb Joshua Vance',
    name: 'Caleb Joshua Vance',
    role: 'Brother (Young Adult Disciple)',
    calling: 'Worship & Media Technology',
    group: 'Men On Fire',
    gender: 'male',
    avatar: '/images/young_adults_prayer_1790403569974.jpg',
    email: 'caleb.vance@jhow.org',
    churchMembership: 'Joshua House of Worship',
    residence: 'San Antonio, TX'
  },
  {
    id: 'roster_maya',
    fullName: 'Maya Jordan Lewis',
    name: 'Maya Jordan Lewis',
    role: 'Sister (Young Adult Disciple)',
    calling: 'Intercessory Prayer & Hospitality',
    group: 'Women Ignited',
    gender: 'female',
    avatar: '/images/fellowship_painting_1790403613370.jpg',
    email: 'maya.lewis@jhow.org',
    churchMembership: 'Joshua House of Worship',
    residence: 'San Antonio, TX'
  }
];
let events: EventItem[] = [];
let openBibleEntries: OpenBibleEntry[] = [];
let bibleLogs: BibleLog[] = [];

let zoomConfig: Record<string, string> = {
  meetingId: "878 516 1298",
  passcode: "FIRE2026",
  inviteLink: "https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365",
  profileUrl: "https://us05web.zoom.us/meeting/85728476365",
  menOnFireMeetingId: "878 516 1298",
  menOnFirePasscode: "FIRE2026",
  menOnFireInviteLink: "https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365",
  womenIgnitedMeetingId: "878 516 1298",
  womenIgnitedPasscode: "FIRE2026",
  womenIgnitedInviteLink: "https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365"
};

// 1. Roster API
app.get('/api/roster', (_req, res) => {
  res.json({ members: roster });
});

app.post('/api/roster', (req, res) => {
  const newMember = req.body;
  if (!newMember.id) {
    newMember.id = `member_${Date.now()}`;
  }
  const existingIndex = roster.findIndex(m => m.id === newMember.id || m.fullName.toLowerCase() === (newMember.fullName || '').toLowerCase());
  if (existingIndex >= 0) {
    roster[existingIndex] = { ...roster[existingIndex], ...newMember };
  } else {
    roster.unshift(newMember);
  }
  res.json({ success: true, member: newMember, members: roster });
});

app.put('/api/roster/:id', (req, res) => {
  const { id } = req.params;
  const idx = roster.findIndex(m => m.id === id);
  if (idx >= 0) {
    roster[idx] = { ...roster[idx], ...req.body };
    res.json({ success: true, member: roster[idx] });
  } else {
    res.status(404).json({ error: 'Member not found' });
  }
});

app.delete('/api/roster/:id', (req, res) => {
  const { id } = req.params;
  const target = roster.find(m => m.id === id);
  if (target) {
    const nameLower = (target.fullName || target.name || '').toLowerCase();
    const emailLower = (target.email || '').toLowerCase();
    if (nameLower.includes('trent') || nameLower.includes('whitney') || emailLower.includes('trent') || emailLower.includes('whitney')) {
      return res.status(403).json({ error: 'Cannot delete primary facilitator account (Trent White / Whitney White).' });
    }
  }
  roster = roster.filter(m => m.id !== id);
  res.json({ success: true, members: roster });
});

// 2. Events API
app.get('/api/events', (_req, res) => {
  res.json({ events });
});

app.post('/api/events/sync-gatherings', (req, res) => {
  const incoming = Array.isArray(req.body) ? req.body : (req.body.gatherings || []);
  if (Array.isArray(incoming)) {
    incoming.forEach((g: any) => {
      if (!g || !g.id) return;
      const calId = g.id.startsWith('cal_gathering_') ? g.id : `cal_gathering_${g.id}`;
      let dateStr = (g.date || '').trim();
      const d = new Date(g.date);
      if (!isNaN(d.getTime()) && !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        dateStr = match ? match[0] : new Date().toISOString().split('T')[0];
      }
      const existingIdx = events.findIndex(e => e.id === calId || e.id === g.id);
      const formatted: EventItem = {
        id: calId,
        title: g.title || 'Fellowship Gathering',
        type: g.activity?.toLowerCase().includes('study') ? 'Small Group' : 'Fellowship Night',
        date: dateStr,
        time: g.time || '6:30 PM CST',
        location: `${g.locationName || 'Joshua House of Worship'}${g.address ? ` (${g.address})` : ''}`,
        description: g.description || `Host: ${g.hostLeader || 'YoungFire Ministry'}`,
        isZoom: !!g.isZoom,
        zoomUrl: g.zoomUrl,
        zoomMeetingId: g.zoomMeetingId,
        zoomPasscode: g.zoomPasscode,
        rsvps: g.rsvps || (g.hostLeader ? [g.hostLeader] : [])
      };
      if (existingIdx >= 0) {
        events[existingIdx] = { ...events[existingIdx], ...formatted };
      } else {
        events.unshift(formatted);
      }
    });
  }
  res.json({ success: true, count: events.length, events });
});

app.post('/api/events', (req, res) => {
  const newEvt = req.body;
  if (!newEvt.id) {
    newEvt.id = `evt_${Date.now()}`;
  }
  if (!Array.isArray(newEvt.rsvps)) {
    newEvt.rsvps = [];
  }
  events.push(newEvt);
  res.json({ success: true, event: newEvt, events });
});

app.post('/api/events/:id/rsvp', (req, res) => {
  const { id } = req.params;
  const { userName } = req.body;
  const evt = events.find(e => e.id === id);
  if (!evt) {
    return res.status(404).json({ error: 'Event not found' });
  }
  if (!Array.isArray(evt.rsvps)) {
    evt.rsvps = [];
  }
  const index = evt.rsvps.indexOf(userName);
  if (index >= 0) {
    evt.rsvps.splice(index, 1);
  } else {
    evt.rsvps.push(userName);
  }
  res.json({ success: true, rsvps: evt.rsvps });
});

app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const idx = events.findIndex(e => e.id === id);
  if (idx >= 0) {
    events[idx] = { ...events[idx], ...req.body };
    res.json({ success: true, event: events[idx], events });
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  events = events.filter(e => e.id !== id);
  res.json({ success: true, events });
});

// 3. Zoom API
app.get('/api/zoom', (_req, res) => {
  res.json({ zoom: zoomConfig });
});

app.post('/api/zoom', (req, res) => {
  zoomConfig = { ...zoomConfig, ...req.body };
  res.json({ success: true, zoom: zoomConfig });
});

// 4. Open Bible API
app.get('/api/openbible', (_req, res) => {
  res.json(openBibleEntries);
});

app.post('/api/openbible', (req, res) => {
  const newEntry = req.body;
  if (!newEntry.id) {
    newEntry.id = `ob_${Date.now()}`;
  }
  if (newEntry.likes === undefined) newEntry.likes = 0;
  if (!Array.isArray(newEntry.comments)) newEntry.comments = [];
  newEntry.timestamp = Date.now();
  openBibleEntries.unshift(newEntry);
  res.json({ success: true, entry: newEntry, entries: openBibleEntries });
});

app.post('/api/openbible/:id/like', (req, res) => {
  const { id } = req.params;
  const entry = openBibleEntries.find(e => e.id === id);
  if (entry) {
    entry.likes = (entry.likes || 0) + 1;
    res.json({ success: true, likes: entry.likes });
  } else {
    res.status(404).json({ error: 'Entry not found' });
  }
});

app.put('/api/openbible/:id', (req, res) => {
  const { id } = req.params;
  const idx = openBibleEntries.findIndex(e => e.id === id);
  if (idx >= 0) {
    openBibleEntries[idx] = { ...openBibleEntries[idx], ...req.body };
    res.json({ success: true, entry: openBibleEntries[idx], entries: openBibleEntries });
  } else {
    res.status(404).json({ error: 'Entry not found' });
  }
});

app.delete('/api/openbible/:id', (req, res) => {
  const { id } = req.params;
  openBibleEntries = openBibleEntries.filter(e => e.id !== id);
  res.json({ success: true, entries: openBibleEntries });
});

// 5. Bible Tracker API
app.get('/api/bible-tracker/logs', (_req, res) => {
  res.json({ logs: bibleLogs, totalCount: bibleLogs.length });
});

app.post('/api/bible-tracker/logs', (req, res) => {
  const { userId, userName, gatheringTitle, bibleTranslationOrName, notes } = req.body;
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const newLog: BibleLog = {
    id: `bible_log_${Date.now()}`,
    userId: userId || 'user_guest',
    userName: userName || 'Fellow Believer',
    dateString,
    timestamp: Date.now(),
    gatheringTitle: gatheringTitle || 'YoungFire Small Group',
    bibleTranslationOrName: bibleTranslationOrName || 'Physical Bible',
    notes: notes || 'Physical Bible Logged'
  };
  bibleLogs.unshift(newLog);
  res.json({ success: true, log: newLog });
});

app.delete('/api/bible-tracker/logs/:id', (req, res) => {
  const { id } = req.params;
  bibleLogs = bibleLogs.filter(l => l.id !== id);
  res.json({ success: true });
});

// --- Persistent Storage Helpers for User Inputs (Prayers, Gatherings, Lessons, Custom Media) ---
const STORE_FILE = path.resolve(process.cwd(), 'data', 'youngfire_store.json');

interface PersistentStore {
  prayers: Array<{
    id: string;
    date: string;
    names: string[];
    cause: string;
    status: string;
    completed?: boolean;
  }>;
  gatherings: any[];
  lessons: any[];
  customMedia: any[];
  chat: any[];
  deletedChatIds?: string[];
  users?: any[];
  articles?: any[];
  cmsMedia?: any[];
  events?: any[];
  activities?: any[];
  reflections?: any[];
  gallery?: any[];
  ideas?: any[];
  notes?: any[];
}

function loadPersistentStore(): PersistentStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8').trim();
      if (content) {
        const parsed = JSON.parse(content);
        if (!parsed.chat) parsed.chat = [];
        if (!parsed.prayers) parsed.prayers = [];
        if (!parsed.gatherings) parsed.gatherings = [];
        if (!parsed.lessons) parsed.lessons = [];
        if (!parsed.customMedia) parsed.customMedia = [];
        if (!parsed.deletedChatIds) parsed.deletedChatIds = [];
        if (!parsed.users) parsed.users = [];
        if (!parsed.articles) parsed.articles = [];
        if (!parsed.cmsMedia) parsed.cmsMedia = [];
        if (!parsed.events) parsed.events = [];
        if (!parsed.activities) parsed.activities = [];
        if (!parsed.reflections) parsed.reflections = [];
        if (!parsed.gallery) parsed.gallery = [];
        if (!parsed.ideas) parsed.ideas = [];
        if (!parsed.notes) parsed.notes = [];
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading store file, using defaults:', err);
  }
  return {
    prayers: [],
    gatherings: [],
    lessons: [],
    customMedia: [],
    chat: [],
    deletedChatIds: [],
    users: [],
    articles: [],
    cmsMedia: [],
    events: [],
    activities: [],
    reflections: [],
    gallery: [],
    ideas: [],
    notes: []
  };
}

function savePersistentStore(store: PersistentStore) {
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store file:', err);
  }
}

let persistentStore = loadPersistentStore();

// 6. Prayers API (Persistent across server)
app.get('/api/prayers', (_req, res) => {
  res.json({ prayers: persistentStore.prayers });
});

app.post('/api/prayers', (req, res) => {
  const prayer = req.body;
  if (!prayer.id) {
    prayer.id = `prayer_${Date.now()}`;
  }
  if (!Array.isArray(prayer.names)) {
    prayer.names = prayer.names ? [prayer.names] : ['Believer in Need'];
  }
  if (prayer.completed === undefined) {
    prayer.completed = false;
  }
  const idx = persistentStore.prayers.findIndex(p => p.id === prayer.id);
  if (idx >= 0) {
    persistentStore.prayers[idx] = { ...persistentStore.prayers[idx], ...prayer };
  } else {
    persistentStore.prayers.unshift(prayer);
  }
  savePersistentStore(persistentStore);
  res.json({ success: true, prayer, prayers: persistentStore.prayers });
});

app.put('/api/prayers/:id', (req, res) => {
  const { id } = req.params;
  const idx = persistentStore.prayers.findIndex(p => p.id === id);
  if (idx >= 0) {
    persistentStore.prayers[idx] = { ...persistentStore.prayers[idx], ...req.body };
    savePersistentStore(persistentStore);
    res.json({ success: true, prayer: persistentStore.prayers[idx], prayers: persistentStore.prayers });
  } else {
    res.status(404).json({ error: 'Prayer not found' });
  }
});

app.delete('/api/prayers/:id', (req, res) => {
  const { id } = req.params;
  persistentStore.prayers = persistentStore.prayers.filter(p => p.id !== id);
  savePersistentStore(persistentStore);
  res.json({ success: true, prayers: persistentStore.prayers });
});

app.post('/api/prayers/:id/pray', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body || {};
  const idx = persistentStore.prayers.findIndex(p => p.id === id);
  if (idx >= 0) {
    const prayer = persistentStore.prayers[idx];
    const intercessors = Array.isArray(prayer.intercessors) ? prayer.intercessors : [];
    const intercessorKey = userId || userName || 'disciple';
    if (!intercessors.includes(intercessorKey)) {
      intercessors.push(intercessorKey);
    }
    prayer.intercessors = intercessors;
    prayer.prayedCount = Math.max(prayer.prayedCount || 0, intercessors.length);
    savePersistentStore(persistentStore);
    res.json({ success: true, prayer, prayedCount: prayer.prayedCount, prayers: persistentStore.prayers });
  } else {
    res.status(404).json({ error: 'Prayer not found' });
  }
});

app.post('/api/connect-card', (req, res) => {
  const { name, contact, prayerNeed } = req.body || {};
  if (!name || !contact) {
    return res.status(400).json({ error: 'Name and contact are required.' });
  }
  if (!persistentStore.connectCards) {
    persistentStore.connectCards = [];
  }
  const entry = {
    id: `card_${Date.now()}`,
    name,
    contact,
    prayerNeed: prayerNeed || '',
    date: new Date().toISOString()
  };
  persistentStore.connectCards.unshift(entry);
  savePersistentStore(persistentStore);
  res.json({ success: true, card: entry });
});

// 7. Gatherings / Fellowship Events API
app.get('/api/gatherings', (_req, res) => {
  res.json({ gatherings: persistentStore.gatherings });
});

app.post('/api/gatherings', (req, res) => {
  const gathering = req.body;
  if (!gathering.id) {
    gathering.id = `fn_${Date.now()}`;
  }
  const idx = persistentStore.gatherings.findIndex(g => g.id === gathering.id);
  if (idx >= 0) {
    persistentStore.gatherings[idx] = { ...persistentStore.gatherings[idx], ...gathering };
  } else {
    persistentStore.gatherings.unshift(gathering);
  }
  savePersistentStore(persistentStore);
  res.json({ success: true, gathering, gatherings: persistentStore.gatherings });
});

app.put('/api/gatherings/:id', (req, res) => {
  const { id } = req.params;
  const idx = persistentStore.gatherings.findIndex(g => g.id === id);
  if (idx >= 0) {
    persistentStore.gatherings[idx] = { ...persistentStore.gatherings[idx], ...req.body };
    savePersistentStore(persistentStore);
    res.json({ success: true, gathering: persistentStore.gatherings[idx], gatherings: persistentStore.gatherings });
  } else {
    res.status(404).json({ error: 'Gathering not found' });
  }
});

app.delete('/api/gatherings/:id', (req, res) => {
  const { id } = req.params;
  persistentStore.gatherings = persistentStore.gatherings.filter(g => g.id !== id);
  savePersistentStore(persistentStore);
  res.json({ success: true, gatherings: persistentStore.gatherings });
});

// 8. Lessons API (Persist new user entered lessons)
app.get('/api/lessons', (_req, res) => {
  res.json({ lessons: persistentStore.lessons });
});

app.post('/api/lessons', (req, res) => {
  const lesson = req.body;
  if (!lesson.id) {
    lesson.id = `lesson_user_${Date.now()}`;
  }
  const idx = persistentStore.lessons.findIndex(l => l.id === lesson.id);
  if (idx >= 0) {
    persistentStore.lessons[idx] = { ...persistentStore.lessons[idx], ...lesson };
  } else {
    persistentStore.lessons.unshift(lesson);
  }
  savePersistentStore(persistentStore);
  res.json({ success: true, lesson, lessons: persistentStore.lessons });
});

app.put('/api/lessons/:id', (req, res) => {
  const { id } = req.params;
  if (!persistentStore.lessons) persistentStore.lessons = [];
  const idx = persistentStore.lessons.findIndex(l => l.id === id);
  if (idx >= 0) {
    persistentStore.lessons[idx] = { ...persistentStore.lessons[idx], ...req.body };
    savePersistentStore(persistentStore);
    res.json({ success: true, lesson: persistentStore.lessons[idx], lessons: persistentStore.lessons });
  } else {
    res.status(404).json({ error: 'Lesson not found' });
  }
});

app.delete('/api/lessons/:id', (req, res) => {
  const { id } = req.params;
  persistentStore.lessons = persistentStore.lessons.filter(l => l.id !== id);
  savePersistentStore(persistentStore);
  res.json({ success: true, lessons: persistentStore.lessons });
});

// Gallery API (Batch/Folder Photos upload, persistent storage, and deletion)
app.get('/api/gallery', (_req, res) => {
  res.json({ gallery: persistentStore.gallery || [] });
});

app.post('/api/gallery', (req, res) => {
  const incoming = Array.isArray(req.body) ? req.body : [req.body];
  if (!persistentStore.gallery) persistentStore.gallery = [];
  
  for (const item of incoming) {
    if (!item.id) item.id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const idx = persistentStore.gallery.findIndex(g => g.id === item.id);
    if (idx >= 0) {
      persistentStore.gallery[idx] = { ...persistentStore.gallery[idx], ...item };
    } else {
      persistentStore.gallery.unshift(item);
    }
  }
  savePersistentStore(persistentStore);
  res.json({ success: true, count: persistentStore.gallery.length, gallery: persistentStore.gallery });
});

app.delete('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  if (persistentStore.gallery) {
    persistentStore.gallery = persistentStore.gallery.filter(g => g.id !== id);
    savePersistentStore(persistentStore);
  }
  res.json({ success: true, gallery: persistentStore.gallery || [] });
});

// Fellowship Ideas & Voting API
app.get('/api/fellowship/ideas', (_req, res) => {
  res.json({ ideas: persistentStore.ideas || [] });
});

app.post('/api/fellowship/ideas', (req, res) => {
  const idea = req.body;
  if (!idea.id) idea.id = `idea_${Date.now()}`;
  if (idea.votes === undefined) idea.votes = 1;
  if (!persistentStore.ideas) persistentStore.ideas = [];
  persistentStore.ideas.unshift(idea);
  savePersistentStore(persistentStore);
  res.json({ success: true, idea, ideas: persistentStore.ideas });
});

app.post('/api/fellowship/ideas/:id/vote', (req, res) => {
  const { id } = req.params;
  if (!persistentStore.ideas) persistentStore.ideas = [];
  const idx = persistentStore.ideas.findIndex(i => i.id === id);
  if (idx >= 0) {
    persistentStore.ideas[idx].votes = (persistentStore.ideas[idx].votes || 0) + 1;
    savePersistentStore(persistentStore);
    res.json({ success: true, idea: persistentStore.ideas[idx], ideas: persistentStore.ideas });
  } else {
    res.status(404).json({ error: 'Idea not found' });
  }
});

app.post('/api/fellowship/ideas/:id/downvote', (req, res) => {
  const { id } = req.params;
  if (!persistentStore.ideas) persistentStore.ideas = [];
  const idx = persistentStore.ideas.findIndex(i => i.id === id);
  if (idx >= 0) {
    persistentStore.ideas[idx].votes = Math.max(0, (persistentStore.ideas[idx].votes || 0) - 1);
    savePersistentStore(persistentStore);
    res.json({ success: true, idea: persistentStore.ideas[idx], ideas: persistentStore.ideas });
  } else {
    res.status(404).json({ error: 'Idea not found' });
  }
});

app.put('/api/fellowship/ideas/:id', (req, res) => {
  const { id } = req.params;
  if (!persistentStore.ideas) persistentStore.ideas = [];
  const idx = persistentStore.ideas.findIndex(i => i.id === id);
  if (idx >= 0) {
    persistentStore.ideas[idx] = { ...persistentStore.ideas[idx], ...req.body };
    savePersistentStore(persistentStore);
    res.json({ success: true, idea: persistentStore.ideas[idx], ideas: persistentStore.ideas });
  } else {
    res.status(404).json({ error: 'Idea not found' });
  }
});

// Notes HUD API (Generate and persist study notes)
app.get('/api/notes', (_req, res) => {
  res.json({ notes: persistentStore.notes || [] });
});

app.post('/api/notes', (req, res) => {
  const note = req.body;
  if (!note.id) note.id = `note_${Date.now()}`;
  note.timestamp = note.timestamp || Date.now();
  if (!persistentStore.notes) persistentStore.notes = [];
  const idx = persistentStore.notes.findIndex(n => n.id === note.id);
  if (idx >= 0) {
    persistentStore.notes[idx] = { ...persistentStore.notes[idx], ...note };
  } else {
    persistentStore.notes.unshift(note);
  }
  savePersistentStore(persistentStore);
  res.json({ success: true, note, notes: persistentStore.notes });
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  if (persistentStore.notes) {
    persistentStore.notes = persistentStore.notes.filter(n => n.id !== id);
    savePersistentStore(persistentStore);
  }
  res.json({ success: true, notes: persistentStore.notes || [] });
});

// 9. Custom Media / Worship Video Vault to Enrich Library API
app.get('/api/media/custom', (_req, res) => {
  res.json({ customMedia: persistentStore.customMedia });
});

app.post('/api/media/custom', (req, res) => {
  const item = req.body;
  if (!item.id) {
    item.id = `custom_media_${Date.now()}`;
  }
  const idx = persistentStore.customMedia.findIndex(m => m.id === item.id);
  if (idx >= 0) {
    persistentStore.customMedia[idx] = { ...persistentStore.customMedia[idx], ...item };
  } else {
    persistentStore.customMedia.unshift(item);
  }
  savePersistentStore(persistentStore);
  res.json({ success: true, item, customMedia: persistentStore.customMedia });
});

app.delete('/api/media/custom/:id', (req, res) => {
  const { id } = req.params;
  persistentStore.customMedia = persistentStore.customMedia.filter(m => m.id !== id);
  savePersistentStore(persistentStore);
  res.json({ success: true, customMedia: persistentStore.customMedia });
});

// 10. Fellowship Chat Realtime Sync API
app.get('/api/chat', (_req, res) => {
  const deletedSet = new Set(persistentStore.deletedChatIds || []);
  const activeChat = (persistentStore.chat || []).filter(m => !deletedSet.has(m.id));
  res.json({ chat: activeChat });
});

app.post('/api/chat', (req, res) => {
  const msg = req.body;
  if (!msg.id) msg.id = `msg_${Date.now()}`;
  
  if (!persistentStore.deletedChatIds) persistentStore.deletedChatIds = [];
  if (persistentStore.deletedChatIds.includes(msg.id)) {
    return res.status(400).json({ success: false, error: 'Message has been deleted' });
  }

  if (!persistentStore.chat) persistentStore.chat = [];
  const idx = persistentStore.chat.findIndex(m => m.id === msg.id);
  if (idx >= 0) {
    persistentStore.chat[idx] = { ...persistentStore.chat[idx], ...msg };
  } else {
    persistentStore.chat.push(msg);
  }
  savePersistentStore(persistentStore);
  
  const deletedSet = new Set(persistentStore.deletedChatIds || []);
  const activeChat = persistentStore.chat.filter(m => !deletedSet.has(m.id));
  res.json({ success: true, message: msg, chat: activeChat });
});

app.delete('/api/chat/:id', (req, res) => {
  const { id } = req.params;
  const textQuery = (req.query.text as string) || '';
  if (!persistentStore.deletedChatIds) persistentStore.deletedChatIds = [];
  if (id && !persistentStore.deletedChatIds.includes(id)) {
    persistentStore.deletedChatIds.push(id);
  }
  if (persistentStore.chat) {
    persistentStore.chat = persistentStore.chat.filter(m => {
      if (m.id === id) return false;
      if (textQuery && m.text && m.text.trim() === textQuery.trim()) {
        if (m.id && !persistentStore.deletedChatIds!.includes(m.id)) {
          persistentStore.deletedChatIds!.push(m.id);
        }
        return false;
      }
      return true;
    });
    savePersistentStore(persistentStore);
  }
  const deletedSet = new Set(persistentStore.deletedChatIds || []);
  const activeChat = (persistentStore.chat || []).filter(m => !deletedSet.has(m.id));
  res.json({ success: true, deletedId: id, chat: activeChat });
});

app.post('/api/chat/delete', (req, res) => {
  const { id, text } = req.body;
  if (!persistentStore.deletedChatIds) persistentStore.deletedChatIds = [];
  if (id && !persistentStore.deletedChatIds.includes(id)) {
    persistentStore.deletedChatIds.push(id);
  }
  if (persistentStore.chat) {
    persistentStore.chat = persistentStore.chat.filter(m => {
      if (id && m.id === id) return false;
      if (text && m.text && m.text.trim() === text.trim()) {
        if (m.id && !persistentStore.deletedChatIds!.includes(m.id)) {
          persistentStore.deletedChatIds!.push(m.id);
        }
        return false;
      }
      return true;
    });
    savePersistentStore(persistentStore);
  }
  const deletedSet = new Set(persistentStore.deletedChatIds || []);
  const activeChat = (persistentStore.chat || []).filter(m => !deletedSet.has(m.id));
  res.json({ success: true, deletedId: id, chat: activeChat });
});

// 11. USER AUTHENTICATION SYSTEM (Email & Password, Login, Logout)
if (!persistentStore.users) {
  persistentStore.users = [
    {
      id: 'usr_admin_default',
      email: 'collegefootballplayoffs56@gmail.com',
      password: 'password123',
      name: 'Trent White',
      role: 'Administrator',
      calling: 'Lead Discipleship Overseer',
      group: 'YoungFire',
      churchMembership: 'Joshua House of Worship',
      createdAt: new Date().toISOString()
    }
  ];
}

app.post('/api/auth/register', (req, res) => {
  const { email, password, role = 'Member', group = 'YoungFire', churchMembership = 'Joshua House of Worship' } = req.body;
  const userName = (req.body.name || req.body.displayName || req.body.fullName || '').trim();
  const userEmail = (email || `${userName.toLowerCase().replace(/\s+/g, '')}@youngfire.app`).trim().toLowerCase();

  if (!userEmail || !password || !userName) {
    return res.status(400).json({ success: false, error: 'Email, password, and full name are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }
  if (!persistentStore.users) persistentStore.users = [];
  const existing = persistentStore.users.find((u: any) => u.email.toLowerCase() === userEmail);
  if (existing) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
  }

  const isAdmin = role.toLowerCase().includes('admin') || userEmail === 'collegefootballplayoffs56@gmail.com' || userName.toLowerCase().includes('trent') || userName.toLowerCase().includes('whitney');
  const newUser = {
    id: `usr_${Date.now()}`,
    email: userEmail,
    password: password.trim(),
    name: userName,
    role: isAdmin ? 'Administrator' : 'Member',
    calling: isAdmin ? 'Lead Discipleship Overseer' : 'Kingdom Disciple',
    group,
    churchMembership,
    createdAt: new Date().toISOString()
  };

  persistentStore.users.push(newUser);
  savePersistentStore(persistentStore);

  const { password: _, ...userSafe } = newUser;
  res.json({ success: true, user: userSafe });
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const identifier = (req.body.email || req.body.username || '').trim().toLowerCase();
  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: 'Email/username and password are required.' });
  }
  if (!persistentStore.users) persistentStore.users = [];
  
  let user = persistentStore.users.find((u: any) => 
    u.email.toLowerCase() === identifier || 
    (u.name && u.name.toLowerCase() === identifier)
  );
  
  // Auto-bootstrap admin account if collegefootballplayoffs56@gmail.com logs in
  if (!user && identifier === 'collegefootballplayoffs56@gmail.com') {
    user = {
      id: 'usr_admin_default',
      email: 'collegefootballplayoffs56@gmail.com',
      password: password.trim(),
      name: 'Trent White',
      role: 'Administrator',
      calling: 'Lead Discipleship Overseer',
      group: 'YoungFire',
      churchMembership: 'Joshua House of Worship',
      createdAt: new Date().toISOString()
    };
    persistentStore.users.push(user);
    savePersistentStore(persistentStore);
  }

  if (!user || user.password !== password.trim()) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const { password: _, ...userSafe } = user;
  res.json({ success: true, user: userSafe });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/me', (req, res) => {
  const email = (req.query.email as string || '').toLowerCase();
  if (email && persistentStore.users) {
    const user = persistentStore.users.find((u: any) => u.email.toLowerCase() === email);
    if (user) {
      const { password: _, ...userSafe } = user;
      return res.json({ success: true, user: userSafe });
    }
  }
  res.json({ success: true, user: null });
});

// 12. CONTENT MANAGEMENT SYSTEM (CMS) API (Articles, Media, Events)
if (!persistentStore.articles) {
  persistentStore.articles = [
    {
      id: 'art_1',
      title: 'Walking in Kingdom Authority as Young Adults',
      slug: 'walking-in-kingdom-authority',
      category: 'Discipleship & Identity',
      author: 'Trent White (YoungFire Discipleship Leader)',
      readingTime: '5 min',
      scriptureAnchor: 'Romans 12:1-2',
      coverImage: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80',
      summary: 'Discover how daily surrender and holiness unlock supernatural purpose in college, career, and culture.',
      content: `The world pressures young adults to conform to its rhythms, anxiety, and moral compromises. But Romans 12:2 offers a radically different path: "Be not conformed to this world: but be ye transformed by the renewing of your mind."\n\nWhen we anchor our decisions in the secret place of prayer and align our daily walk with Scripture, we step into the true spiritual authority Christ purchased for us. You are not called to fit in; you are called to set a standard of purity, humility, and faith!`,
      tags: ['Identity', 'Purity', 'Spiritual Warfare'],
      status: 'Published',
      createdAt: '2026-09-20T10:00:00.000Z',
      updatedAt: '2026-09-20T10:00:00.000Z'
    },
    {
      id: 'art_2',
      title: 'The Discipline of the Secret Place: Hearing God Daily',
      slug: 'discipline-of-secret-place',
      category: 'Spiritual Disciplines',
      author: 'Whitney White',
      readingTime: '4 min',
      scriptureAnchor: 'Matthew 6:6',
      coverImage: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=1200&q=80',
      summary: 'Practical keys to quiet your phone notifications and hear the still small voice of the Holy Spirit.',
      content: `In a world inundated with constant push notifications, social media metrics, and noisy feeds, intimacy with God requires intentional stillness. Jesus commanded: "Enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret."\n\nStart your morning with 15 minutes of uninterrupted Scripture before checking your phone. Open Psalm 23 or John 15. Let God's love be the first voice that anchors your heart each day.`,
      tags: ['Prayer', 'Quiet Time', 'Devotion'],
      status: 'Published',
      createdAt: '2026-09-22T14:30:00.000Z',
      updatedAt: '2026-09-22T14:30:00.000Z'
    }
  ];
}

if (!persistentStore.cmsMedia) {
  persistentStore.cmsMedia = [
    {
      id: 'media_1',
      title: 'YoungFire Night of Worship & Fire',
      category: 'Worship Nights',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      caption: 'Acoustic worship and deep intercession at the Joshua House Sanctuary Annex.',
      tags: ['Worship', 'Sanctuary', 'Fire'],
      createdAt: '2026-09-18T19:00:00.000Z'
    },
    {
      id: 'media_2',
      title: 'Community Serve Day: Feeding San Antonio Families',
      category: 'Outreach & Missions',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
      caption: 'YoungFire disciples handing out fresh groceries and praying for neighbors.',
      tags: ['Service', 'Outreach', 'Kingdom Work'],
      createdAt: '2026-09-15T09:30:00.000Z'
    }
  ];
}

// CMS Articles endpoints
app.get('/api/cms/articles', (_req, res) => {
  res.json({ articles: persistentStore.articles || [] });
});

app.post('/api/cms/articles', (req, res) => {
  const article = req.body;
  if (!article.title) return res.status(400).json({ error: 'Title is required' });
  if (!article.id) article.id = `art_${Date.now()}`;
  article.createdAt = article.createdAt || new Date().toISOString();
  article.updatedAt = new Date().toISOString();
  if (!persistentStore.articles) persistentStore.articles = [];
  persistentStore.articles.unshift(article);
  savePersistentStore(persistentStore);
  res.json({ success: true, article, articles: persistentStore.articles });
});

app.put('/api/cms/articles/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (!persistentStore.articles) persistentStore.articles = [];
  const idx = persistentStore.articles.findIndex((a: any) => a.id === id);
  if (idx >= 0) {
    persistentStore.articles[idx] = { ...persistentStore.articles[idx], ...updates, updatedAt: new Date().toISOString() };
    savePersistentStore(persistentStore);
    return res.json({ success: true, article: persistentStore.articles[idx], articles: persistentStore.articles });
  }
  res.status(404).json({ error: 'Article not found' });
});

app.delete('/api/cms/articles/:id', (req, res) => {
  const { id } = req.params;
  if (persistentStore.articles) {
    persistentStore.articles = persistentStore.articles.filter((a: any) => a.id !== id);
    savePersistentStore(persistentStore);
  }
  res.json({ success: true, articles: persistentStore.articles || [] });
});

// CMS Media Vault endpoints
app.get('/api/cms/media', (_req, res) => {
  res.json({ media: persistentStore.cmsMedia || [] });
});

app.post('/api/cms/media', (req, res) => {
  const item = req.body;
  if (!item.title || !item.imageUrl) return res.status(400).json({ error: 'Title and imageUrl are required' });
  if (!item.id) item.id = `media_${Date.now()}`;
  item.createdAt = item.createdAt || new Date().toISOString();
  if (!persistentStore.cmsMedia) persistentStore.cmsMedia = [];
  persistentStore.cmsMedia.unshift(item);
  savePersistentStore(persistentStore);
  res.json({ success: true, item, media: persistentStore.cmsMedia });
});

app.put('/api/cms/media/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (!persistentStore.cmsMedia) persistentStore.cmsMedia = [];
  const idx = persistentStore.cmsMedia.findIndex((m: any) => m.id === id);
  if (idx >= 0) {
    persistentStore.cmsMedia[idx] = { ...persistentStore.cmsMedia[idx], ...updates };
    savePersistentStore(persistentStore);
    return res.json({ success: true, item: persistentStore.cmsMedia[idx], media: persistentStore.cmsMedia });
  }
  res.status(404).json({ error: 'Media not found' });
});

app.delete('/api/cms/media/:id', (req, res) => {
  const { id } = req.params;
  if (persistentStore.cmsMedia) {
    persistentStore.cmsMedia = persistentStore.cmsMedia.filter((m: any) => m.id !== id);
    savePersistentStore(persistentStore);
  }
  res.json({ success: true, media: persistentStore.cmsMedia || [] });
});

// CMS Event Itinerary endpoints
app.get('/api/cms/events', (_req, res) => {
  res.json({ events: persistentStore.events || [] });
});

app.post('/api/cms/events', (req, res) => {
  const item = req.body;
  if (!item.title || !item.date) return res.status(400).json({ error: 'Title and date are required' });
  if (!item.id) item.id = `event_${Date.now()}`;
  if (!persistentStore.events) persistentStore.events = [];
  persistentStore.events.unshift(item);
  savePersistentStore(persistentStore);
  res.json({ success: true, event: item, events: persistentStore.events });
});

app.put('/api/cms/events/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (!persistentStore.events) persistentStore.events = [];
  const idx = persistentStore.events.findIndex((e: any) => e.id === id);
  if (idx >= 0) {
    persistentStore.events[idx] = { ...persistentStore.events[idx], ...updates };
    savePersistentStore(persistentStore);
    return res.json({ success: true, event: persistentStore.events[idx], events: persistentStore.events });
  }
  res.status(404).json({ error: 'Event not found' });
});

app.delete('/api/cms/events/:id', (req, res) => {
  const { id } = req.params;
  if (persistentStore.events) {
    persistentStore.events = persistentStore.events.filter((e: any) => e.id !== id);
    savePersistentStore(persistentStore);
  }
  res.json({ success: true, events: persistentStore.events || [] });
});

// 13. USER PROGRESS TRACKER API (Activities, Reflections, Achievements)
if (!persistentStore.activities) {
  persistentStore.activities = [
    {
      id: 'act_seed_1',
      userId: 'usr_admin_default',
      userName: 'Trent White',
      type: 'scripture',
      title: 'Read John Chapters 1 - 3',
      detail: 'Meditation on the Word made flesh and Nicodemus rebirth',
      metricCount: 3,
      date: '2026-09-24',
      timestamp: Date.now() - 86400000
    },
    {
      id: 'act_seed_2',
      userId: 'usr_admin_default',
      userName: 'Trent White',
      type: 'prayer',
      title: 'Morning Intercession Watch',
      detail: 'Prayed for young adult revival in San Antonio',
      metricCount: 45, // minutes
      date: '2026-09-25',
      timestamp: Date.now() - 3600000
    }
  ];
}

if (!persistentStore.reflections) {
  persistentStore.reflections = [
    {
      id: 'ref_seed_1',
      userId: 'usr_admin_default',
      userName: 'Trent White',
      scriptureRef: 'John 15:5',
      prompt: 'Heart Audit & Fruitfulness',
      notes: 'Apart from Jesus, I can do nothing. In this busy ministry season, my primary work is remaining closely attached to the Vine.',
      date: '2026-09-24',
      timestamp: Date.now() - 86400000
    }
  ];
}

app.get('/api/progress/activities', (req, res) => {
  const userId = req.query.userId as string;
  let list = persistentStore.activities || [];
  if (userId) {
    list = list.filter((a: any) => a.userId === userId);
  }
  res.json({ activities: list });
});

app.post('/api/progress/activities', (req, res) => {
  const act = req.body;
  if (!act.title || !act.type) return res.status(400).json({ error: 'Title and type are required' });
  if (!act.id) act.id = `act_${Date.now()}`;
  act.timestamp = act.timestamp || Date.now();
  act.date = act.date || new Date().toISOString().split('T')[0];
  if (!persistentStore.activities) persistentStore.activities = [];
  persistentStore.activities.unshift(act);
  savePersistentStore(persistentStore);
  res.json({ success: true, activity: act, activities: persistentStore.activities });
});

app.delete('/api/progress/activities/:id', (req, res) => {
  const { id } = req.params;
  if (persistentStore.activities) {
    persistentStore.activities = persistentStore.activities.filter((a: any) => a.id !== id);
    savePersistentStore(persistentStore);
  }
  res.json({ success: true, activities: persistentStore.activities || [] });
});

app.get('/api/progress/reflections', (req, res) => {
  const userId = req.query.userId as string;
  let list = persistentStore.reflections || [];
  if (userId) {
    list = list.filter((r: any) => r.userId === userId);
  }
  res.json({ reflections: list });
});

app.post('/api/progress/reflections', (req, res) => {
  const ref = req.body;
  if (!ref.notes) return res.status(400).json({ error: 'Reflection notes are required' });
  if (!ref.id) ref.id = `ref_${Date.now()}`;
  ref.timestamp = ref.timestamp || Date.now();
  ref.date = ref.date || new Date().toISOString().split('T')[0];
  if (!persistentStore.reflections) persistentStore.reflections = [];
  persistentStore.reflections.unshift(ref);
  savePersistentStore(persistentStore);
  res.json({ success: true, reflection: ref, reflections: persistentStore.reflections });
});

app.delete('/api/progress/reflections/:id', (req, res) => {
  const { id } = req.params;
  if (persistentStore.reflections) {
    persistentStore.reflections = persistentStore.reflections.filter((r: any) => r.id !== id);
    savePersistentStore(persistentStore);
  }
  res.json({ success: true, reflections: persistentStore.reflections || [] });
});

app.get('/api/progress/stats', (_req, res) => {
  const acts = persistentStore.activities || [];
  const refs = persistentStore.reflections || [];

  let scriptureCount = 0;
  let prayerMinutes = 0;
  let fellowshipCount = 0;
  let serviceCount = 0;

  for (const a of acts) {
    if (a.type === 'scripture') scriptureCount += (Number(a.metricCount) || 1);
    else if (a.type === 'prayer') prayerMinutes += (Number(a.metricCount) || 15);
    else if (a.type === 'fellowship') fellowshipCount += 1;
    else if (a.type === 'service') serviceCount += 1;
  }

  // Calculate streak based on activity dates
  const uniqueDates = Array.from(new Set(acts.map((a: any) => a.date))).sort();
  const streak = uniqueDates.length > 0 ? Math.min(uniqueDates.length, 7) : 1;

  const achievements = [
    { id: 'ach_1', title: 'Fire Starter', desc: 'Logged first discipleship activity', unlocked: acts.length >= 1, icon: '🔥' },
    { id: 'ach_2', title: 'Berean Scholar', desc: 'Read 5+ chapters of Holy Scripture', unlocked: scriptureCount >= 5, icon: '📖' },
    { id: 'ach_3', title: 'Intercession Watchman', desc: 'Over 30 minutes in private prayer', unlocked: prayerMinutes >= 30, icon: '🕊️' },
    { id: 'ach_4', title: 'Heart Auditor', desc: 'Logged 2+ personal reflections with God', unlocked: refs.length >= 2, icon: '✍️' },
    { id: 'ach_5', title: 'Kingdom Pillar', desc: 'Active in small groups and service', unlocked: (fellowshipCount + serviceCount) >= 2, icon: '👑' },
  ];

  res.json({
    streak,
    scriptureCount,
    prayerHours: Number((prayerMinutes / 60).toFixed(1)),
    fellowshipCount,
    serviceCount,
    reflectionsCount: refs.length,
    achievements
  });
});

// 14. GEMINI LIVE VOICE API & CONVERSATION REST FALLBACK
app.post('/api/voice/counselor', async (req, res) => {
  const { prompt, voiceName = 'Zephyr' } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const systemInstruction = 'You are the YoungFire Pastoral Voice Counselor for Joshua House of Worship. Provide warm, uplifting, scripture-anchored spoken counsel. Be conversational and concise (1-2 short spoken paragraphs).';
    
    // First generate text response with gemini-3.8-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { systemInstruction }
    });

    const replyText = response.text || 'Grace and peace to you. God is working all things together for your good.';
    
    // Attempt speech generation with gemini-3.8-flash-lite-tts
    let audioBase64: string | null = null;
    try {
      const speechRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: replyText, speechMetadata: { style: 'Warm pastoral counsel' } }]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName as any } }
          }
        }
      });
      audioBase64 = speechRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (speechErr) {
      console.warn('TTS generation fallback:', speechErr);
    }

    res.json({
      text: replyText,
      audioBase64,
      voiceName
    });
  } catch (err: any) {
    console.error('Error in voice counselor:', err);
    res.json({
      text: `Grace and peace to you in Christ Jesus. Remember Philippians 4:6-7: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God." You are covered and walking in purpose.`,
      audioBase64: null,
      voiceName
    });
  }
});

app.get('/api/bible-tracker/community-analytics', (_req, res) => {
  const userMap = new Map<string, { count: number; name: string; lastBible: string }>();
  for (const log of bibleLogs) {
    const prev = userMap.get(log.userId) || { count: 0, name: log.userName, lastBible: log.bibleTranslationOrName };
    prev.count += 1;
    userMap.set(log.userId, prev);
  }

  const users = Array.from(userMap.entries()).map(([userId, val]) => ({
    userId,
    userName: val.name,
    sessionsCount: val.count,
    streakWeeks: Math.min(val.count, 4),
    percent52Goal: Math.round((val.count / 52) * 100),
    milestoneBadge: val.count >= 10 ? 'Scripture Champion' : 'Living Word Faithful',
    badgeIcon: val.count >= 10 ? '👑' : '✨',
    lastActive: 'Active',
    lastBible: val.lastBible
  }));

  res.json({
    totalLogs: bibleLogs.length,
    activeUsersCount: userMap.size,
    users,
    weeklyTrend: [
      { weekLabel: 'Aug 5', totalCount: 0, weekIndex: 1 },
      { weekLabel: 'Aug 12', totalCount: 0, weekIndex: 2 },
      { weekLabel: 'Aug 19', totalCount: 0, weekIndex: 3 },
      { weekLabel: 'Aug 26', totalCount: 0, weekIndex: 4 },
      { weekLabel: 'Sep 2', totalCount: 0, weekIndex: 5 },
      { weekLabel: 'Sep 9', totalCount: 0, weekIndex: 6 },
      { weekLabel: 'Sep 16', totalCount: 2, weekIndex: 7 },
      { weekLabel: 'Sep 23', totalCount: bibleLogs.length, weekIndex: 8 }
    ],
    annualGoalWeeks: 52,
    highestStreak: 2
  });
});

// 6. Media Search API
app.get('/api/media/search', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase().trim();
  const sampleResults = [
    {
      id: "yt_KwX1f2gYKZ4",
      title: "YoungFire Worship Anthem & Praise Session",
      artist: "Joshua House Worship Collective",
      category: "Worship & Praise",
      youtubeId: "KwX1f2gYKZ4",
      duration: "5:24",
      albumArt: "https://img.youtube.com/vi/KwX1f2gYKZ4/hqdefault.jpg",
      thematicFocus: "Unfiltered praise and fervent intercession"
    },
    {
      id: "yt_jj2-xwfagxA",
      title: `${query || 'Worship'} - Expository Teaching Session`,
      artist: "Christian Discipleship Library",
      category: "Bible Book Overviews",
      youtubeId: "jj2-xwfagxA",
      duration: "Full Session",
      albumArt: "https://img.youtube.com/vi/jj2-xwfagxA/hqdefault.jpg",
      thematicFocus: "In-depth biblical study and historical context"
    }
  ];
  res.json({ results: sampleResults });
});

// 7. AI Spiritual Mentor / Counselor API
app.post('/api/counselor', async (req, res) => {
  const { prompt, history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({
      response: `Grace and peace to you in Jesus' name! "Trust in the Lord with all your heart, and lean not on your own understanding; In all your ways acknowledge Him, and He shall direct your paths." (Proverbs 3:5-6). We encourage you to bring this before God in prayer and share with your Small Group leaders.`
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Construct conversation history for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const systemInstruction = `You are the YoungFire Ministry Spiritual Counselor and Young Adult Discipleship Mentor at Joshua House of Worship in San Antonio, TX.
Your calling is to mentor, comfort, and guide young adults (ages 18-35) with realistic, practical, and deeply sound biblical wisdom.

CRITICAL REQUIREMENTS:
1. Provide authentic, realistic, empathetic guidance tailored directly to the user's situation (mental burdens, career, relationships, purity, loneliness, spiritual warfare, campus life, faith doubts). Speak as a loving, seasoned mentor, not an outline.
2. ALWAYS support your counsel with FULL Holy Scripture: quote the actual Scripture text word-for-word along with the exact Book, Chapter, and Verse reference (KJV, NKJV, or ESV). Never give just a citation without the full text.
3. Walk through the practical application: give concrete, realistic steps the young disciple can take today in prayer, habit, and kingdom community.
4. Conclude with a warm, encouraging blessing or short prayer over them.`;

    // Helper with timeout
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))
      ]);

    // Candidate models to attempt: prefer gemini-3.6-flash with resilient fallbacks
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let aiResponseText = '';
    let lastError: unknown = null;

    for (const model of candidateModels) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 1500
            }
          }),
          25000
        );
        if (response && response.text) {
          aiResponseText = response.text;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Attempt with ${model} failed, trying next candidate...`, err);
      }
    }

    if (aiResponseText) {
      return res.json({ response: aiResponseText });
    }

    throw lastError || new Error('No response from AI models');
  } catch (error) {
    console.error('Error in AI counselor:', error);
    // Realistic, full-scripture biblical pastoral fallback
    const promptLower = (prompt || '').toLowerCase();
    let scripture = 'Philippians 4:6-7';
    let verseText = 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.';
    let guidance = 'Take a deep breath and lay this weight directly at the altar. When life and responsibilities feel overwhelming, God does not ask you to carry the load in your own strength. Step back, spend 10 quiet minutes in worship or silent prayer, and let His peace guard your mind before tackling the next task.';

    if (promptLower.includes('fear') || promptLower.includes('anxi') || promptLower.includes('worry') || promptLower.includes('stress')) {
      scripture = '2 Timothy 1:7 & 1 Peter 5:7';
      verseText = '"For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." (2 Timothy 1:7) & "Casting all your care upon him; for he careth for you." (1 Peter 5:7)';
      guidance = 'Anxiety tries to convince us we are alone and unequipped. But Scripture reminds us that fear is not from God. His spirit gives you supernatural power, authentic love, and clarity of mind. Hand over this worry specifically by name today.';
    } else if (promptLower.includes('sin') || promptLower.includes('guilt') || promptLower.includes('forgiv') || promptLower.includes('purity')) {
      scripture = '1 John 1:9 & Psalm 103:12';
      verseText = '"If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness." (1 John 1:9) & "As far as the east is from the west, so far hath he removed our transgressions from us." (Psalm 103:12)';
      guidance = 'There is no condemnation for those who are in Christ Jesus. The enemy wants you stuck in shame, but Jesus offers immediate cleansing and renewal. Repent honestly, accept His forgiveness, and walk forward in freedom and accountability with your YoungFire brothers and sisters.';
    } else if (promptLower.includes('direction') || promptLower.includes('decision') || promptLower.includes('future') || promptLower.includes('career') || promptLower.includes('college')) {
      scripture = 'Proverbs 3:5-6 & Jeremiah 29:11';
      verseText = '"Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths." (Proverbs 3:5-6) & "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end." (Jeremiah 29:11)';
      guidance = 'You do not have to have the next five years figured out today. Seek God for today\'s step of obedience. Ask the Holy Spirit for discernment, seek godly counsel from your pastors and ministry leaders, and trust that God is opening the right doors.';
    }

    res.json({
      response: `Grace and peace to you in Christ Jesus. I hear your heart, and the Word of God speaks directly to where you are standing right now.\n\n📖 **The Scripture Anchor:**\n${verseText}\n\n💡 **Biblical Guidance for You:**\n${guidance}\n\n🙏 **A Blessing Over You:**\nMay the God of hope fill you with all peace, courage, and divine wisdom. You are chosen, covered by the blood of Jesus, and walking in kingdom purpose. We stand in agreement with you!`
    });
  }
});

// Vite / Static handling
async function startServer() {
  const server = http.createServer(app);

  server.on('error', (err: any) => {
    console.error('YoungFire Server error:', err);
  });

  // WebSocket Server for Gemini Live Real-time Audio
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('error', (err: any) => {
    console.warn('Gemini Live WebSocket server error:', err);
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('🎙️ [Gemini Live] Client connected to live voice stream');
    let liveSession: any = null;

    try {
      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are the YoungFire Pastoral Voice Counselor for Joshua House of Worship in San Antonio, Texas. You minister to young adults and disciples. Speak with compassion, warmth, hope, and biblical grounding. Keep spoken answers concise, conversational, and uplifting (1-3 spoken paragraphs).',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (audio) {
              clientWs.send(JSON.stringify({ type: 'audio', audio, text }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
            }
          },
        },
      });

      clientWs.on('message', (data: any) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'audio' && msg.audio) {
            liveSession.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' }
            });
          } else if (msg.type === 'text' && msg.text) {
            liveSession.sendRealtimeInput({
              text: msg.text
            });
          }
        } catch (err) {
          console.error('Error in live WebSocket message handling:', err);
        }
      });

      clientWs.on('close', () => {
        console.log('🎙️ [Gemini Live] Client disconnected');
        try {
          if (liveSession) liveSession.close();
        } catch {}
      });
    } catch (liveErr) {
      console.warn('Gemini Live initialization error:', liveErr);
      clientWs.send(JSON.stringify({ type: 'error', message: 'Gemini Live connect unavailable, using audio fallback' }));
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`YoungFire Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
