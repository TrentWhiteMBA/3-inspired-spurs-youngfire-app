import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Shield, Heart, Users, MessageSquare, 
  Send, Sparkles, Video, Calendar, ArrowRight, 
  BookOpen, Radio, Music, Briefcase, HandHeart, 
  Camera, Flame, Check, ChevronDown, ChevronUp, 
  ExternalLink, Layers, Disc, Upload, Image as ImageIcon,
  Plus, Trash2, Edit3, ThumbsUp, ThumbsDown, CheckCircle, FileText,
  Bookmark, Award, Star, FolderUp, Maximize2, Clock,
  Sun, Moon, Sunrise, Sunset
} from 'lucide-react';
import { WheelHub } from './WheelHub';
import { OpenBibleThursdays } from './OpenBibleThursdays';
import { FellowshipCalendar } from './FellowshipCalendar';
import { INITIAL_AUTHENTIC_LESSONS, DiscipleshipLesson, LessonAttachment } from '../data/lessonsData';
import { CurrentUser } from './SettingsHUDModal';

interface FellowshipHubProps {
  onNavigate: (dest: string, subView?: any) => void;
  onBack?: () => void;
  initialDrillDown?: string | null;
  currentUser?: CurrentUser | null;
}

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  avatarText: string;
  avatarUrl?: string;
  text: string;
  timestamp: string;
}

interface PhotoMoment {
  id: string;
  title: string;
  category: string;
  caption: string;
  scripture: string;
  imageUrl: string;
  date: string;
}

interface FellowshipIdea {
  id: string;
  title: string;
  description: string;
  author: string;
  votes: number;
  date: string;
  scheduledDate?: string;
  scheduledStatus?: boolean;
}

interface PrayerItem {
  id: string;
  date: string;
  names: string[];
  cause: string;
  status: string;
  completed?: boolean;
  authorId?: string;
  authorName?: string;
  intercessorsCount?: number;
  intercessors?: string[];
  prayedBy?: string[];
}

interface ReadingPlan {
  id: string;
  title: string;
  category: string;
  durationDays: number;
  days: Array<{
    day: number;
    title: string;
    scripture: string;
    devotional: string;
    challenge: string;
    completed?: boolean;
  }>;
}

// 6 Authentic HD Photos Uploaded by Trent White
const INITIAL_AUTHENTIC_PHOTOS: PhotoMoment[] = [
  {
    id: 'p1',
    title: 'Pulpit Leadership & Truth Proclamation',
    category: 'Leadership',
    caption: 'Trent White and Whitney White proclaiming the Word of Truth at Joshua House of Worship.',
    scripture: '2 Timothy 4:2 — Preach the word; be instant in season, out of season.',
    imageUrl: '/image_4.png',
    date: 'Sanctuary Leadership'
  },
  {
    id: 'p2',
    title: 'Living Room Fellowship & Warm Welcome',
    category: 'Small Groups',
    caption: 'YoungFire disciples gathered in living room fellowship, sharing dinner, laughter, and spiritual encouragement.',
    scripture: 'Ephesians 4:16 — Fitly joined together and compacted by that which every joint supplieth.',
    imageUrl: '/image_2.png',
    date: 'Discipleship Gathering'
  },
  {
    id: 'p3',
    title: 'He Is Risen: YoungFire Family & Generations',
    category: 'Sanctuary Life',
    caption: 'Sanctuary family celebrating Christ’s resurrection with parents, children, and believers in unity.',
    scripture: 'Romans 15:7 — Receive ye one another, as Christ also received us to the glory of God.',
    imageUrl: '/image_3.png',
    date: 'Resurrection Celebration'
  },
  {
    id: 'p4',
    title: 'Sanctuary Presentation & Youth Leadership',
    category: 'Youth Commissioning',
    caption: 'Trent and Whitney White alongside youth leader during sanctuary presentation and gift recognition.',
    scripture: '1 Timothy 4:12 — Let no man despise thy youth; but be thou an example of the believers.',
    imageUrl: '/image_7.png',
    date: 'Sanctuary Presentation'
  },
  {
    id: 'p5',
    title: 'Fellowship Painting Night',
    category: 'Fellowship Nights',
    caption: 'Community creativity at the dining table, painting portrait canvases and sharing laughter together.',
    scripture: 'Proverbs 17:22 — A merry heart doeth good like a medicine.',
    imageUrl: '/image_5.png',
    date: 'Creative Fellowship'
  },
  {
    id: 'p6',
    title: 'Locked in Intercession & Prayer Watch',
    category: 'Prayer Tower',
    caption: 'Young adults standing firm in prayer circle, interceding for San Antonio and the next generation.',
    scripture: '1 Thessalonians 5:17 — Pray without ceasing.',
    imageUrl: '/image_6.png',
    date: 'Prayer Watch'
  }
];

export const FellowshipHub: React.FC<FellowshipHubProps> = ({ 
  onNavigate, 
  onBack,
  initialDrillDown = null,
  currentUser = null
}) => {
  const [hubViewMode, setHubViewMode] = useState<'grid' | 'wheel'>('grid');
  const [activeDrillDown, setActiveDrillDown] = useState<string | null>(initialDrillDown);

  const activeUser = currentUser || (() => {
    try {
      const s = localStorage.getItem('youngfire_user_session');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const handleEnterMenOnFire = () => {
    if (activeUser?.isAdmin || activeUser?.gender === 'male') {
      setActiveDrillDown('men');
    } else {
      alert("Men On Fire is a consecrated space for brothers.");
    }
  };

  const handleEnterWomenIgnited = () => {
    if (activeUser?.isAdmin || activeUser?.gender === 'female') {
      setActiveDrillDown('women');
    } else {
      alert("Women Ignited is a sacred space for sisters.");
    }
  };

  useEffect(() => {
    if (initialDrillDown === 'men') {
      if (activeUser?.isAdmin || activeUser?.gender === 'male') {
        setActiveDrillDown('men');
      } else {
        alert("Men On Fire is a consecrated space for brothers.");
        setActiveDrillDown(null);
      }
    } else if (initialDrillDown === 'women') {
      if (activeUser?.isAdmin || activeUser?.gender === 'female') {
        setActiveDrillDown('women');
      } else {
        alert("Women Ignited is a sacred space for sisters.");
        setActiveDrillDown(null);
      }
    } else if (initialDrillDown) {
      setActiveDrillDown(initialDrillDown);
    }
  }, [initialDrillDown, activeUser]);

  // Gallery Photos (with batch 160+ and folder upload capability)
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoMoment[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_gallery_photos');
      return saved ? JSON.parse(saved) : INITIAL_AUTHENTIC_PHOTOS;
    } catch {
      return INITIAL_AUTHENTIC_PHOTOS;
    }
  });

  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<PhotoMoment | null>(null);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // 12 Authentic Lessons State
  const [lessons, setLessons] = useState<DiscipleshipLesson[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_authentic_lessons');
      return saved ? JSON.parse(saved) : INITIAL_AUTHENTIC_LESSONS;
    } catch {
      return INITIAL_AUTHENTIC_LESSONS;
    }
  });
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [expandedLessonSection, setExpandedLessonSection] = useState<'core' | 'notes' | 'keypoints' | 'questions' | 'application' | 'handouts' | 'video'>('core');

  // New Lesson Modal
  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonSeries, setNewLessonSeries] = useState('YoungFire Discipleship');
  const [newLessonTeachingDate, setNewLessonTeachingDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newLessonPassage, setNewLessonPassage] = useState('');
  const [newLessonTeachers, setNewLessonTeachers] = useState('Trent White & Whitney White (YoungFire Discipleship Leaders)');
  const [newLessonTheme, setNewLessonTheme] = useState('');
  const [newLessonSummary, setNewLessonSummary] = useState('');
  const [newLessonNotes, setNewLessonNotes] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');

  // Edit Lesson Modal (Two-Way Lesson Link & Sync)
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonSeries, setEditLessonSeries] = useState('');
  const [editLessonTeachingDate, setEditLessonTeachingDate] = useState('');
  const [editLessonPassage, setEditLessonPassage] = useState('');
  const [editLessonTeachers, setEditLessonTeachers] = useState('');
  const [editLessonTheme, setEditLessonTheme] = useState('');
  const [editLessonSummary, setEditLessonSummary] = useState('');
  const [editLessonNotes, setEditLessonNotes] = useState('');
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState('');

  // Facilitator Idea Scheduling to Sanctuary Calendar
  const [schedulingIdea, setSchedulingIdea] = useState<FellowshipIdea | null>(null);
  const [schedulingDate, setSchedulingDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Facilitator detection
  const isFacilitator = (() => {
    if (!activeUser) return true;
    const role = (activeUser.role || '').toLowerCase();
    const name = (activeUser.name || '').toLowerCase();
    return role.includes('facilitator') || role.includes('overseer') || role.includes('admin') || role.includes('leader') || name.includes('trent');
  })();

  // Attachment upload on existing lesson
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean Slate Chat Threads (No mock messages!)
  const [activeChatThread, setActiveChatThread] = useState<'men' | 'women' | 'groups'>('groups');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('youngfire_chat_threads_v2');
      return saved ? JSON.parse(saved) : { groups: [], men: [], women: [] };
    } catch {
      return { groups: [], men: [], women: [] };
    }
  });
  const [newChatInput, setNewChatInput] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatText, setEditingChatText] = useState('');

  // 24/7 Prayer Tower & Dock with Green Checkmarks
  const [prayers, setPrayers] = useState<PrayerItem[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_prayers_dock');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newPrayerName, setNewPrayerName] = useState('');
  const [newPrayerCause, setNewPrayerCause] = useState('');
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [prayerFilter, setPrayerFilter] = useState<'all' | 'active' | 'answered'>('all');
  const [editingPrayer, setEditingPrayer] = useState<PrayerItem | null>(null);
  const [editPrayerNames, setEditPrayerNames] = useState('');
  const [editPrayerCause, setEditPrayerCause] = useState('');

  // Dual Daily Bread Feed State ('morning' | 'evening')
  const [dailyBreadTab, setDailyBreadTab] = useState<'morning' | 'evening'>('morning');

  // Fellowship Ideas & Voting
  const [ideas, setIdeas] = useState<FellowshipIdea[]>(() => {
    try {
      const saved = localStorage.getItem('youngfire_fellowship_ideas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [isIdeaFormOpen, setIsIdeaFormOpen] = useState(false);

  // Sync with backend API
  useEffect(() => {
    // Load prayers
    fetch('/api/prayers')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.prayers) && data.prayers.length > 0) {
          setPrayers(data.prayers);
        }
      })
      .catch(() => {});

    // Load gallery
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.gallery) && data.gallery.length > 0) {
          setGalleryPhotos(data.gallery);
        }
      })
      .catch(() => {});

    // Load ideas
    fetch('/api/fellowship/ideas')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.ideas) && data.ideas.length > 0) {
          setIdeas(data.ideas);
        }
      })
      .catch(() => {});

    // Load lessons
    fetch('/api/lessons')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.lessons) && data.lessons.length > 0) {
          setLessons(data.lessons);
        }
      })
      .catch(() => {});
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('youngfire_gallery_photos', JSON.stringify(galleryPhotos));
    } catch {}
  }, [galleryPhotos]);

  useEffect(() => {
    try {
      localStorage.setItem('youngfire_authentic_lessons', JSON.stringify(lessons));
    } catch {}
  }, [lessons]);

  useEffect(() => {
    try {
      localStorage.setItem('youngfire_chat_threads_v2', JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('youngfire_prayers_dock', JSON.stringify(prayers));
    } catch {}
  }, [prayers]);

  useEffect(() => {
    try {
      localStorage.setItem('youngfire_fellowship_ideas', JSON.stringify(ideas));
    } catch {}
  }, [ideas]);

  // --- Photo Upload Handler (Supports Multi-File and Entire Folders for 160+ photos) ---
  const handleBatchPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingBatch(true);
    setUploadProgress(`Processing ${files.length} photos...`);

    const newPhotoList: PhotoMoment[] = [];
    let loadedCount = 0;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        
        newPhotoList.push({
          id: `photo_${Date.now()}_${index}`,
          title: cleanName || `YoungFire Moment ${galleryPhotos.length + index + 1}`,
          category: 'Sanctuary Life',
          caption: 'Authentic fellowship moment captured with YoungFire disciples.',
          scripture: 'Psalm 133:1 — Behold, how good and how pleasant it is for brethren to dwell together in unity!',
          imageUrl: dataUrl,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });

        loadedCount++;
        setUploadProgress(`Uploaded ${loadedCount} of ${files.length} photos...`);

        if (loadedCount === files.length) {
          const combined = [...newPhotoList, ...galleryPhotos];
          setGalleryPhotos(combined);
          setIsUploadingBatch(false);
          setUploadProgress('');

          // Sync to backend API
          fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPhotoList)
          }).catch(() => {});
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = galleryPhotos.filter(p => p.id !== id);
    setGalleryPhotos(updated);
    fetch(`/api/gallery/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // --- Chat Handlers (With Edit and Delete Controls for Men, Women & Groups) ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;

    const senderName = activeUser?.name || 'YoungFire Disciple';
    const senderRole = activeUser?.isAdmin 
      ? 'Executive Facilitator' 
      : (activeUser?.gender === 'female' ? 'Sister (Young Adult Disciple)' : 'Brother (Young Adult Disciple)');
    const avatarInitials = senderName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'YF';

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: senderName,
      role: senderRole,
      avatarText: avatarInitials,
      avatarUrl: activeUser?.avatar,
      text: newChatInput.trim(),
      timestamp: 'Just now'
    };

    setChatMessages(prev => ({
      ...prev,
      [activeChatThread]: [newMsg, ...(prev[activeChatThread] || [])]
    }));
    setNewChatInput('');
  };

  const handleDeleteChatMessage = (thread: string, id: string) => {
    setChatMessages(prev => ({
      ...prev,
      [thread]: (prev[thread] || []).filter(m => m.id !== id)
    }));
  };

  const handleStartEditChatMessage = (msg: ChatMessage) => {
    setEditingChatId(msg.id);
    setEditingChatText(msg.text);
  };

  const handleSaveEditChatMessage = (thread: string, id: string) => {
    if (!editingChatText.trim()) return;
    setChatMessages(prev => ({
      ...prev,
      [thread]: (prev[thread] || []).map(m => m.id === id ? { ...m, text: editingChatText.trim() } : m)
    }));
    setEditingChatId(null);
    setEditingChatText('');
  };

  const handleClearChatThread = (thread: string) => {
    if (confirm(`Are you sure you want to clear the ${thread} chat space?`)) {
      setChatMessages(prev => ({
        ...prev,
        [thread]: []
      }));
    }
  };

  // --- Prayer Dock Handlers (With Green Checkmarks) ---
  const handleTogglePrayerCompleted = (id: string) => {
    const updated = prayers.map(p => {
      if (p.id === id) {
        const isNowCompleted = !p.completed;
        return {
          ...p,
          completed: isNowCompleted,
          status: isNowCompleted ? 'Answered Praise' : 'Active Intercession'
        };
      }
      return p;
    });
    setPrayers(updated);

    const target = updated.find(p => p.id === id);
    if (target) {
      fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      }).catch(() => {});
    }
  };

  const canModifyPrayer = (prayer: PrayerItem) => {
    if (!activeUser) return true;
    const role = (activeUser.role || '').toLowerCase();
    const isAdmin = role.includes('admin') || role.includes('overseer') || role.includes('facilitator') || role.includes('leader');
    const isAuthor = (prayer.authorId && prayer.authorId === activeUser.id) ||
                     (prayer.authorName && prayer.authorName.toLowerCase() === activeUser.name?.toLowerCase()) ||
                     (Array.isArray(prayer.names) && prayer.names.some(n => n.toLowerCase().includes(activeUser.name?.toLowerCase())));
    return isAdmin || isAuthor;
  };

  const handlePrayForRequest = async (id: string) => {
    const updated = prayers.map(p => {
      if (p.id === id) {
        const curIntercessors = Array.isArray(p.intercessors) ? [...p.intercessors] : [];
        const userKey = activeUser?.id || activeUser?.name || 'disciple';
        if (!curIntercessors.includes(userKey)) {
          curIntercessors.push(userKey);
        }
        const curCount = Math.max(p.intercessorsCount || 0, curIntercessors.length);
        return {
          ...p,
          intercessors: curIntercessors,
          intercessorsCount: curCount + 1
        };
      }
      return p;
    });
    setPrayers(updated);
    try {
      localStorage.setItem('youngfire_prayers_dock', JSON.stringify(updated));
      await fetch(`/api/prayers/${id}/pray`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUser?.id, userName: activeUser?.name })
      });
    } catch {}
  };

  const handleStartEditPrayer = (prayer: PrayerItem) => {
    setEditingPrayer(prayer);
    setEditPrayerNames(Array.isArray(prayer.names) ? prayer.names.join(', ') : prayer.names);
    setEditPrayerCause(prayer.cause);
  };

  const handleSaveEditPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrayer || !editPrayerCause.trim()) return;

    const updatedNames = editPrayerNames.trim()
      ? editPrayerNames.split(',').map(s => s.trim()).filter(Boolean)
      : editingPrayer.names;

    const updated = prayers.map(p => {
      if (p.id === editingPrayer.id) {
        return {
          ...p,
          names: updatedNames,
          cause: editPrayerCause.trim()
        };
      }
      return p;
    });

    setPrayers(updated);
    const target = updated.find(p => p.id === editingPrayer.id);
    setEditingPrayer(null);

    if (target) {
      try {
        localStorage.setItem('youngfire_prayers_dock', JSON.stringify(updated));
        fetch(`/api/prayers/${target.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target)
        }).catch(() => {});
      } catch {}
    }
  };

  const handleAddPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerCause.trim()) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newP: PrayerItem = {
      id: `prayer_${Date.now()}`,
      date: dateStr,
      names: newPrayerName.trim() ? [newPrayerName.trim()] : ['Fellow Disciple in Need'],
      cause: newPrayerCause.trim(),
      status: 'Active Intercession',
      completed: false,
      authorId: activeUser?.id,
      authorName: activeUser?.name || 'Fellow Disciple',
      intercessorsCount: 1,
      intercessors: [activeUser?.id || activeUser?.name || 'author']
    };

    setPrayers([newP, ...prayers]);
    setNewPrayerName('');
    setNewPrayerCause('');
    setIsPrayerModalOpen(false);

    fetch('/api/prayers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newP)
    }).catch(() => {});
  };

  const handleDeletePrayer = (id: string) => {
    const target = prayers.find(p => p.id === id);
    if (target && !canModifyPrayer(target)) {
      alert("Only the prayer author or a ministry facilitator can delete this request.");
      return;
    }
    if (!window.confirm('Remove this prayer request from the dock?')) return;
    const updated = prayers.filter(p => p.id !== id);
    setPrayers(updated);
    try {
      localStorage.setItem('youngfire_prayers_dock', JSON.stringify(updated));
    } catch {}
    fetch(`/api/prayers/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // --- Lesson Handlers (Create, Upload Attachments & Videos) ---
  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !newLessonPassage.trim()) return;

    const teachingDateValue = newLessonTeachingDate.trim() || new Date().toISOString().split('T')[0];

    const newLesson: DiscipleshipLesson = {
      id: `lesson_${Date.now()}`,
      title: newLessonTitle.trim(),
      lessonTitle: newLessonTitle.trim(),
      teachingDate: teachingDateValue,
      facilitator: newLessonTeachers || 'Trent White',
      description: newLessonSummary.trim() || 'Biblical study and practical discipleship application.',
      scripturePassage: newLessonPassage.trim(),
      studyNotes: newLessonNotes.trim() || 'Lesson notes taken during discipleship gathering.',
      attachmentUrls: [],
      youtubeUrl: newLessonVideoUrl || undefined,
      seriesTitle: newLessonSeries || 'YoungFire Discipleship',
      dateOrSeason: `${teachingDateValue} • Taught Session`,
      primaryPassage: newLessonPassage.trim(),
      bookId: 'EPH',
      chapter: 4,
      teachers: newLessonTeachers || 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
      theme: newLessonTheme || 'Kingdom Character & Discipleship',
      summary: newLessonSummary.trim() || 'Biblical study and practical discipleship application.',
      notesContent: newLessonNotes.trim() || 'Lesson notes taken during discipleship gathering.',
      youtubeId: newLessonVideoUrl ? (newLessonVideoUrl.match(/v=([a-zA-Z0-9_-]+)/)?.[1] || newLessonVideoUrl) : undefined,
      videoUrl: newLessonVideoUrl,
      questions: [
        'How does this Scripture challenge your daily walk?',
        'What step of obedience is God calling you to take this week?'
      ],
      challenge: 'Apply this truth directly in your workplace, school, or home today.',
      attachments: [],
      canEdit: true
    };

    const updated = [newLesson, ...lessons];
    setLessons(updated);
    setIsNewLessonModalOpen(false);
    setSelectedLessonIndex(0);

    fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLesson)
    }).catch(() => {});
  };

  const handleStartEditLesson = (lesson: DiscipleshipLesson) => {
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.lessonTitle || lesson.title);
    setEditLessonSeries(lesson.seriesTitle || '');
    setEditLessonTeachingDate(lesson.teachingDate || new Date().toISOString().split('T')[0]);
    setEditLessonPassage(lesson.primaryPassage || lesson.scripturePassage || '');
    setEditLessonTeachers(lesson.teachers || lesson.facilitator || '');
    setEditLessonTheme(lesson.theme || '');
    setEditLessonSummary(lesson.summary || lesson.description || '');
    setEditLessonNotes(lesson.notesContent || lesson.studyNotes || '');
    setEditLessonVideoUrl(lesson.videoUrl || lesson.youtubeUrl || '');
    setIsEditLessonModalOpen(true);
  };

  const handleSaveLessonEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLessonId) return;

    const targetIdx = lessons.findIndex(l => l.id === editingLessonId);
    if (targetIdx === -1) return;

    const current = lessons[targetIdx];
    const updated: DiscipleshipLesson = {
      ...current,
      title: editLessonTitle.trim(),
      lessonTitle: editLessonTitle.trim(),
      seriesTitle: editLessonSeries.trim() || current.seriesTitle,
      teachingDate: editLessonTeachingDate || current.teachingDate,
      dateOrSeason: `${editLessonTeachingDate} • Taught Session`,
      scripturePassage: editLessonPassage.trim() || current.scripturePassage,
      primaryPassage: editLessonPassage.trim() || current.primaryPassage,
      facilitator: editLessonTeachers.trim() || current.facilitator,
      teachers: editLessonTeachers.trim() || current.teachers,
      theme: editLessonTheme.trim() || current.theme,
      description: editLessonSummary.trim() || current.description,
      summary: editLessonSummary.trim() || current.summary,
      studyNotes: editLessonNotes.trim() || current.studyNotes,
      notesContent: editLessonNotes.trim() || current.notesContent,
      youtubeUrl: editLessonVideoUrl.trim() || current.youtubeUrl,
      videoUrl: editLessonVideoUrl.trim() || current.videoUrl,
      youtubeId: editLessonVideoUrl ? (editLessonVideoUrl.match(/v=([a-zA-Z0-9_-]+)/)?.[1] || editLessonVideoUrl) : current.youtubeId
    };

    const updatedLessons = lessons.map(l => l.id === editingLessonId ? updated : l);
    setLessons(updatedLessons);
    setIsEditLessonModalOpen(false);

    fetch(`/api/lessons/${editingLessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});
  };

  const handleUploadLessonAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const activeLesson = lessons[selectedLessonIndex];
    if (!activeLesson) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const fileUrl = loadEvt.target?.result as string;
        const newAttachment: LessonAttachment = {
          name: file.name,
          url: fileUrl,
          size: `${Math.round(file.size / 1024)} KB`,
          type: file.type || 'application/octet-stream'
        };

        const updatedLesson = {
          ...activeLesson,
          attachments: [...(activeLesson.attachments || []), newAttachment]
        };

        const updatedLessons = lessons.map((l, idx) => idx === selectedLessonIndex ? updatedLesson : l);
        setLessons(updatedLessons);

        fetch(`/api/lessons/${activeLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLesson)
        }).catch(() => {});
      };
      reader.readAsDataURL(file);
    });
  };

  // --- Fellowship Ideas Handlers ---
  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;

    const ideaPayload: FellowshipIdea = {
      id: `idea_${Date.now()}`,
      title: newIdeaTitle.trim(),
      description: newIdeaDesc.trim() || 'Gathering idea proposed by YoungFire disciple.',
      author: 'YoungFire Disciple',
      votes: 1,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    setIdeas([ideaPayload, ...ideas]);
    setNewIdeaTitle('');
    setNewIdeaDesc('');
    setIsIdeaFormOpen(false);

    fetch('/api/fellowship/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ideaPayload)
    }).catch(() => {});
  };

  const handleVoteIdea = (id: string) => {
    const updated = ideas.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i);
    setIdeas(updated);
    fetch(`/api/fellowship/ideas/${id}/vote`, { method: 'POST' }).catch(() => {});
  };

  const handleDownvoteIdea = (id: string) => {
    const updated = ideas.map(i => i.id === id ? { ...i, votes: Math.max(0, i.votes - 1) } : i);
    setIdeas(updated);
    fetch(`/api/fellowship/ideas/${id}/downvote`, { method: 'POST' }).catch(() => {});
  };

  const handleScheduleIdeaToCalendar = (idea: FellowshipIdea, targetDate: string) => {
    const updatedIdea = { ...idea, scheduledDate: targetDate, scheduledStatus: true };
    const updated = ideas.map(i => i.id === idea.id ? updatedIdea : i);
    setIdeas(updated);
    setSchedulingIdea(null);
    fetch(`/api/fellowship/ideas/${idea.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedIdea)
    }).catch(() => {});
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 select-none px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black uppercase font-['Outfit'] text-white">
                YOUNGFIRE FELLOWSHIP SANCTUARY
              </h2>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Brotherhood &bull; Sisterhood &bull; Discipleship Lessons &bull; 24/7 Prayer Dock
            </p>
          </div>
        </div>

        {/* View Switcher: [ Grid Hubs ] | [ ☸ Orbit Wheel Hub ] */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#0B1329] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => { setHubViewMode('grid'); setActiveDrillDown(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                hubViewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => { setHubViewMode('wheel'); setActiveDrillDown(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                hubViewMode === 'wheel'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ☸ Orbit Wheel
            </button>
          </div>
        </div>
      </div>

      {/* WHEEL VIEW MODE */}
      {hubViewMode === 'wheel' && !activeDrillDown && (
        <div className="bg-[#0B1329] border border-amber-500/30 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center space-y-4">
          <WheelHub />
          <p className="text-xs font-mono text-slate-400 text-center max-w-md">
            Interactive Orbit Wheel: Drag to spin the wheel or tap any orbital node above to navigate to that pillar!
          </p>
        </div>
      )}

      {/* MAIN HUBS OVERVIEW (GRID VIEW) */}
      {hubViewMode === 'grid' && !activeDrillDown && (
        <div className="space-y-6">
          {/* Hero Scrim Card with Authentic Pulpit Photo */}
          <div 
            className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-amber-500/40 shadow-2xl bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(4, 7, 17, 0.45) 0%, rgba(4, 7, 17, 0.90) 80%, #040711 100%), url('/image_4.png')`
            }}
          >
            <div className="relative z-10 max-w-xl space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] font-mono tracking-widest uppercase">
                SANCTUARY DISCIPLESHIP
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-['Outfit'] uppercase text-white leading-tight">
                EVERY JOINT SUPPLIES
              </h3>
              <p className="text-xs text-slate-200 font-serif leading-relaxed">
                Led by Trent & Whitney White alongside Joshua House of Worship, YoungFire exists to ignite young adult disciples into holy boldness, prayerful accountability, and authentic brotherhood and sisterhood.
              </p>
            </div>
          </div>

          {/* Core 4 Interactive Fellowship Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Men On Fire */}
            <div 
              onClick={handleEnterMenOnFire}
              className="p-5 rounded-3xl bg-[#0B1329] border border-orange-500/30 hover:border-orange-500/60 cursor-pointer transition-all hover:bg-orange-950/20 shadow-xl group space-y-3 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-orange-400 font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                  Brotherhood
                </span>
              </div>
              <div>
                <h4 className="text-base font-black uppercase text-white font-['Outfit']">Men On Fire</h4>
                <p className="text-xs text-slate-300 font-serif mt-1">
                  7-Day Spiritual Armor Plan, weekly Monday Zoom huddle, and iron-sharpens-iron brotherhood discussion.
                </p>
              </div>
              <div className="flex items-center text-orange-400 text-xs font-mono font-bold group-hover:translate-x-1 transition-transform">
                <span>Enter Brotherhood Space &rarr;</span>
              </div>
            </div>

            {/* Card 2: Women Ignited */}
            <div 
              onClick={handleEnterWomenIgnited}
              className="p-5 rounded-3xl bg-[#0B1329] border border-rose-500/30 hover:border-rose-500/60 cursor-pointer transition-all hover:bg-rose-950/20 shadow-xl group space-y-3 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                  Sisterhood
                </span>
              </div>
              <div>
                <h4 className="text-base font-black uppercase text-white font-['Outfit']">Women Ignited</h4>
                <p className="text-xs text-slate-300 font-serif mt-1">
                  7-Day Proverbs 31 Sacred Plan, Thursday Zoom prayer circle, and holy sisterhood encouragement.
                </p>
              </div>
              <div className="flex items-center text-rose-400 text-xs font-mono font-bold group-hover:translate-x-1 transition-transform">
                <span>Enter Sisterhood Space &rarr;</span>
              </div>
            </div>

            {/* Card 3: Discipleship Lessons Vault */}
            <div 
              onClick={() => setActiveDrillDown('discipleship')}
              className="p-5 rounded-3xl bg-[#0B1329] border border-cyan-500/30 hover:border-cyan-500/60 cursor-pointer transition-all hover:bg-cyan-950/20 shadow-xl group space-y-3 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {lessons.length} Authentic Lessons
                </span>
              </div>
              <div>
                <h4 className="text-base font-black uppercase text-white font-['Outfit']">Small Groups & Lessons Vault</h4>
                <p className="text-xs text-slate-300 font-serif mt-1">
                  Expository studies, PDF attachments, video uploads, and ability for viewers and leaders to create and edit lessons.
                </p>
              </div>
              <div className="flex items-center text-cyan-400 text-xs font-mono font-bold group-hover:translate-x-1 transition-transform">
                <span>Open Discipleship Vault &rarr;</span>
              </div>
            </div>

            {/* Card 4: Fellowship Hub, Ideas & Schedule */}
            <div 
              onClick={() => setActiveDrillDown('fellowship_hub')}
              className="p-5 rounded-3xl bg-[#0B1329] border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all hover:bg-amber-950/20 shadow-xl group space-y-3 border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  Community Hub
                </span>
              </div>
              <div>
                <h4 className="text-base font-black uppercase text-white font-['Outfit']">Fellowship Hub & Gatherings</h4>
                <p className="text-xs text-slate-300 font-serif mt-1">
                  Weekly gathering schedule, YoungFire community chat, user-submitted idea list with voting, and events RSVP.
                </p>
              </div>
              <div className="flex items-center text-amber-400 text-xs font-mono font-bold group-hover:translate-x-1 transition-transform">
                <span>View Schedule & Idea List &rarr;</span>
              </div>
            </div>
          </div>

          {/* Fellowship Sanctuary Calendar & Two-Way Lesson Sync */}
          <FellowshipCalendar
            lessons={lessons}
            ideas={ideas}
            onSelectLesson={(lessonIdx) => {
              setSelectedLessonIndex(lessonIdx);
              setActiveDrillDown('discipleship');
            }}
            currentUser={activeUser}
          />

          {/* ALL 12 REORGANIZED HUBS & PILLARS */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold px-1">
              All 12 Sanctuary Pillars & Hubs
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* 1. Men On Fire */}
              <div 
                onClick={handleEnterMenOnFire}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-orange-500/50 cursor-pointer transition-all hover:bg-orange-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <Shield className="w-5 h-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Men On Fire</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">7-Day Armor & Brotherhood</p>
              </div>

              {/* 2. Women Ignited */}
              <div 
                onClick={handleEnterWomenIgnited}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-rose-500/50 cursor-pointer transition-all hover:bg-rose-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <Heart className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Women Ignited</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">7-Day Proverbs 31 Plan</p>
              </div>

              {/* 3. Open Bible Thursdays */}
              <div 
                onClick={() => setActiveDrillDown('openbible')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-amber-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <BookOpen className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Open Bible Thursdays</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">66-Book Random Engine</p>
              </div>

              {/* 4. Small Groups Lessons Vault */}
              <div 
                onClick={() => setActiveDrillDown('discipleship')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-cyan-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <Users className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Lessons Vault</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{lessons.length} Taught Lessons</p>
              </div>

              {/* 5. Fellowship Hub (Replaces Creative Arts) */}
              <div 
                onClick={() => setActiveDrillDown('fellowship_hub')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-purple-500/50 cursor-pointer transition-all hover:bg-purple-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <Calendar className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Fellowship Hub</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ideas, Voting & Schedule</p>
              </div>

              {/* 6. Daily Bread Hub (Replaces Young Professionals) */}
              <div 
                onClick={() => setActiveDrillDown('daily_bread')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-blue-500/50 cursor-pointer transition-all hover:bg-blue-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <BookOpen className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Daily Bread Hub</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Verse of the Day & Manna</p>
              </div>

              {/* 7. 24/7 Prayer Tower & Dock */}
              <div 
                onClick={() => setActiveDrillDown('prayer_dock')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-emerald-500/50 cursor-pointer transition-all hover:bg-emerald-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <Flame className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">24/7 Prayer Dock</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Intercession & Praise Check</p>
              </div>

              {/* 8. Bible Tracker Analytics (Replaces Marriage Covenant) */}
              <div 
                onClick={() => setActiveDrillDown('bible_analytics')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-amber-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <Award className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Tracker Analytics</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">52-Wk Goals & Badges</p>
              </div>

              {/* 9. Reading Plans Hub (Replaces City Outreach) */}
              <div 
                onClick={() => setActiveDrillDown('reading_plans')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-teal-500/50 cursor-pointer transition-all hover:bg-teal-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <FileText className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Reading Plans</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">5-Day, 7-Day & Custom</p>
              </div>

              {/* 10. Authentic Photo Gallery (Multi-file & Folders) */}
              <div 
                onClick={() => setActiveDrillDown('wall')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-pink-500/50 cursor-pointer transition-all hover:bg-pink-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <Camera className="w-5 h-5 text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Photo Vault</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{galleryPhotos.length} HD Photos Uploaded</p>
              </div>

              {/* 11. Kingdom Video Vault & TV */}
              <div 
                onClick={() => onNavigate('tv')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-rose-500/50 cursor-pointer transition-all hover:bg-rose-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <Video className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Kingdom TV</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">200+ Praise & JHOW Live</p>
              </div>

              {/* 12. 24/7 Gospel Radio */}
              <div 
                onClick={() => onNavigate('radio')}
                className="p-4 rounded-2xl bg-[#0B1329] border border-white/10 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-amber-950/20 group border-t border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              >
                <Radio className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black uppercase text-white font-['Outfit']">Gospel Radio</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">8 Global Stations 24/7</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRILL DOWN SUBVIEW 1: OPEN BIBLE THURSDAYS */}
      {activeDrillDown === 'openbible' && (
        <OpenBibleThursdays
          onBack={() => setActiveDrillDown(null)}
          onNavigateToScripture={(bookId, chapter) => onNavigate('word', 'bible')}
          currentUser={activeUser}
        />
      )}

      {/* DRILL DOWN SUBVIEW 2: MEN ON FIRE (7-Day Plan + Zoom + Live Chat with Edit/Delete) */}
      {activeDrillDown === 'men' && (
        !(activeUser?.isAdmin || activeUser?.gender === 'male') ? (
          <div className="bg-[#0B1329] border border-orange-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mx-auto">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black uppercase text-white font-['Outfit']">
              Access Restricted
            </h3>
            <p className="text-sm font-mono text-orange-300 font-bold">
              Men On Fire is a consecrated space for brothers.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              This holy hub is consecrated specifically for brotherhood discipleship and lead facilitators.
            </p>
            <button
              onClick={() => setActiveDrillDown(null)}
              className="px-5 py-2.5 rounded-xl bg-orange-500 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-lg hover:bg-orange-400 transition-colors"
            >
              Return to Fellowship Hub
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <button
                onClick={() => setActiveDrillDown(null)}
                className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                  Brotherhood Cohort &bull; Led by Trent White
                </span>
                <h3 className="text-lg font-black font-['Outfit'] uppercase text-white">
                  Men On Fire Ministry
                </h3>
              </div>
            </div>

            {/* Men On Fire Zoom HUD Card */}
            <div className="bg-[#0B1329] border border-orange-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-orange-400 font-bold block">
                    Weekly Brotherhood Zoom Huddle
                  </span>
                  <p className="text-xs text-white font-mono font-bold">
                    Meeting ID: <span className="text-amber-300">878 516 1298</span> &bull; Passcode: <span className="text-amber-300">FIRE2026</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-serif">Mondays @ 7:00 PM CST</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Join Zoom</span>
                </a>
              </div>
            </div>

            {/* Brotherhood Live Chat Thread with Edit and Delete */}
            <div className="bg-[#0B1329] border border-orange-500/30 rounded-3xl p-5 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <span>🛡️ Men On Fire Brotherhood Thread</span>
                  <span className="text-[10px] text-slate-400">({(chatMessages.men || []).length} Messages)</span>
                </h4>
                <button
                  onClick={() => handleClearChatThread('men')}
                  className="text-[10px] font-mono text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  Clear Space
                </button>
              </div>

              <div className="h-48 overflow-y-auto space-y-2">
                {(chatMessages.men || []).length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-serif">
                    Clean space active. No messages yet. Post an encouraging word or prayer request below!
                  </div>
                ) : (
                  (chatMessages.men || []).map((msg) => (
                    <div key={msg.id} className="p-2.5 bg-slate-950/70 rounded-xl border border-white/5 text-xs group flex items-start gap-2.5">
                      {msg.avatarUrl ? (
                        <img 
                          src={msg.avatarUrl} 
                          alt={msg.sender} 
                          className="w-7 h-7 rounded-full object-cover border border-orange-500/40 flex-shrink-0 mt-0.5" 
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
                          {msg.avatarText || (msg.sender || 'D').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <strong className="text-orange-400">{msg.sender}</strong>
                            {msg.role && (
                              <span className="text-[9px] text-slate-400 px-1.5 py-0.2 rounded bg-white/5 border border-white/10 font-normal">
                                {msg.role}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span>{msg.timestamp}</span>
                            <button
                              onClick={() => handleStartEditChatMessage(msg)}
                              className="hover:text-amber-300 opacity-60 hover:opacity-100 cursor-pointer"
                              title="Edit Message"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteChatMessage('men', msg.id)}
                              className="hover:text-rose-400 opacity-60 hover:opacity-100 cursor-pointer"
                              title="Delete Message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {editingChatId === msg.id ? (
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={editingChatText}
                              onChange={(e) => setEditingChatText(e.target.value)}
                              className="flex-1 bg-black border border-amber-400 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <button
                              onClick={() => handleSaveEditChatMessage('men', msg.id)}
                              className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingChatId(null)}
                              className="px-2 py-1 bg-white/10 text-slate-300 rounded-lg text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-slate-200">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            <form onSubmit={(e) => {
              setActiveChatThread('men');
              handleSendMessage(e);
            }} className="flex gap-2">
              <input
                type="text"
                placeholder="Post brotherhood encouragement or prayer..."
                value={newChatInput}
                onChange={(e) => setNewChatInput(e.target.value)}
                className="flex-1 bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button type="submit" className="p-2.5 rounded-xl bg-orange-500 text-slate-950 font-bold cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
        )
      )}

      {/* DRILL DOWN SUBVIEW 3: WOMEN IGNITED (7-Day Plan + Zoom + Live Chat with Edit/Delete) */}
      {activeDrillDown === 'women' && (
        !(activeUser?.isAdmin || activeUser?.gender === 'female') ? (
          <div className="bg-[#0B1329] border border-rose-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black uppercase text-white font-['Outfit']">
              Access Restricted
            </h3>
            <p className="text-sm font-mono text-rose-300 font-bold">
              Women Ignited is a sacred space for sisters.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              This holy hub is consecrated specifically for sacred sisterhood and lead facilitators.
            </p>
            <button
              onClick={() => setActiveDrillDown(null)}
              className="px-5 py-2.5 rounded-xl bg-rose-500 text-slate-950 font-bold font-mono text-xs cursor-pointer shadow-lg hover:bg-rose-400 transition-colors"
            >
              Return to Fellowship Hub
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <button
                onClick={() => setActiveDrillDown(null)}
                className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                  Sacred Sisterhood &bull; Led by Whitney White
                </span>
                <h3 className="text-lg font-black font-['Outfit'] uppercase text-white">
                  Women Ignited Ministry
                </h3>
              </div>
            </div>

            {/* Women Ignited Zoom HUD Card */}
            <div className="bg-[#0B1329] border border-rose-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                    Weekly Sisterhood Prayer Huddle
                  </span>
                  <p className="text-xs text-white font-mono font-bold">
                    Meeting ID: <span className="text-rose-300">878 516 1298</span> &bull; Passcode: <span className="text-rose-300">FIRE2026</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-serif">Thursdays @ 6:30 PM CST</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Join Zoom</span>
                </a>
              </div>
            </div>

            {/* Sisterhood Live Chat Thread with Edit and Delete */}
            <div className="bg-[#0B1329] border border-rose-500/30 rounded-3xl p-5 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <span>💖 Women Ignited Sisterhood Thread</span>
                  <span className="text-[10px] text-slate-400">({(chatMessages.women || []).length} Messages)</span>
                </h4>
                <button
                  onClick={() => handleClearChatThread('women')}
                  className="text-[10px] font-mono text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  Clear Space
                </button>
              </div>

              <div className="h-48 overflow-y-auto space-y-2">
                {(chatMessages.women || []).length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-serif">
                    Clean space active. No messages yet. Post an encouraging word or prayer request below!
                  </div>
                ) : (
                  (chatMessages.women || []).map((msg) => (
                    <div key={msg.id} className="p-2.5 bg-slate-950/70 rounded-xl border border-white/5 text-xs group flex items-start gap-2.5">
                      {msg.avatarUrl ? (
                        <img 
                          src={msg.avatarUrl} 
                          alt={msg.sender} 
                          className="w-7 h-7 rounded-full object-cover border border-rose-500/40 flex-shrink-0 mt-0.5" 
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
                          {msg.avatarText || (msg.sender || 'D').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <strong className="text-rose-400">{msg.sender}</strong>
                            {msg.role && (
                              <span className="text-[9px] text-slate-400 px-1.5 py-0.2 rounded bg-white/5 border border-white/10 font-normal">
                                {msg.role}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span>{msg.timestamp}</span>
                            <button
                              onClick={() => handleStartEditChatMessage(msg)}
                              className="hover:text-amber-300 opacity-60 hover:opacity-100 cursor-pointer"
                              title="Edit Message"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteChatMessage('women', msg.id)}
                              className="hover:text-rose-400 opacity-60 hover:opacity-100 cursor-pointer"
                              title="Delete Message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {editingChatId === msg.id ? (
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={editingChatText}
                              onChange={(e) => setEditingChatText(e.target.value)}
                              className="flex-1 bg-black border border-rose-400 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <button
                              onClick={() => handleSaveEditChatMessage('women', msg.id)}
                              className="px-2 py-1 bg-rose-500 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingChatId(null)}
                              className="px-2 py-1 bg-white/10 text-slate-300 rounded-lg text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-slate-200">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            <form onSubmit={(e) => {
              setActiveChatThread('women');
              handleSendMessage(e);
            }} className="flex gap-2">
              <input
                type="text"
                placeholder="Post sisterhood encouragement or prayer..."
                value={newChatInput}
                onChange={(e) => setNewChatInput(e.target.value)}
                className="flex-1 bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button type="submit" className="p-2.5 rounded-xl bg-rose-500 text-slate-950 font-bold cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
        )
      )}

      {/* DRILL DOWN SUBVIEW 4: DISCIPLESHIP LESSONS VAULT (12 Authentic Lessons + Add/Edit + Uploads) */}
      {activeDrillDown === 'discipleship' && (() => {
        const activeLesson = lessons[selectedLessonIndex] || lessons[0] || INITIAL_AUTHENTIC_LESSONS[0];
        return (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveDrillDown(null)}
                  className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Discipleship Lessons Vault &bull; {lessons.length} Taught Sessions
                  </span>
                  <h3 className="text-base sm:text-lg font-black font-['Outfit'] uppercase text-white">
                    {activeLesson.lessonTitle}
                  </h3>
                </div>
              </div>

              {/* Add New Lesson Button for Viewers & Administrators */}
              <button
                onClick={() => setIsNewLessonModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add New Lesson</span>
              </button>
            </div>

            {/* Horizontal Session Selector (All 12 Lessons) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {lessons.map((les, idx) => (
                <button
                  key={les.id}
                  onClick={() => {
                    setSelectedLessonIndex(idx);
                    setExpandedLessonSection('core');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all border ${
                    selectedLessonIndex === idx
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                      : 'bg-[#0B1329] text-slate-300 hover:text-white border-white/10'
                  }`}
                >
                  <span>{idx + 1}. {les.lessonTitle.length > 25 ? `${les.lessonTitle.slice(0, 25)}...` : les.lessonTitle}</span>
                </button>
              ))}
            </div>

            {/* Lesson Metadata Header */}
            <div className="p-4 bg-[#0B1329] border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 block">{activeLesson.dateOrSeason} &bull; {activeLesson.teachers}</span>
                <span className="text-amber-400 font-bold">Theme: {activeLesson.theme}</span>
                {activeLesson.teachingDate && (
                  <span className="text-cyan-400 text-[10px] font-mono flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>Teaching Date: {activeLesson.teachingDate} (2-Way Calendar Sync)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleStartEditLesson(activeLesson)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                  title="Edit lesson details and teaching date"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Lesson</span>
                </button>

                <button
                  onClick={() => onNavigate('word', 'bible')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open {activeLesson.primaryPassage}</span>
                </button>
              </div>
            </div>

            {/* Video Section (if attached or embedded) */}
            {activeLesson.youtubeId && (
              <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeLesson.youtubeId}?rel=0`}
                  title={activeLesson.lessonTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Vertical Flow Sections */}
            <div className="space-y-3">
              {/* 1. Core Scripture Passage & Exposition */}
              <div className="bg-[#0B1329] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedLessonSection(expandedLessonSection === 'core' ? ('' as any) : 'core')}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold font-['Outfit'] uppercase text-white">
                      1. Core Scripture & Summary ({activeLesson.primaryPassage})
                    </span>
                  </div>
                  {expandedLessonSection === 'core' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedLessonSection === 'core' && (
                  <div className="p-4 pt-0 text-xs text-slate-200 space-y-3 border-t border-white/5">
                    <p className="leading-relaxed font-serif text-slate-200 text-sm">
                      {activeLesson.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Verbatim Lesson Notes & Outline */}
              <div className="bg-[#0B1329] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedLessonSection(expandedLessonSection === 'notes' ? ('' as any) : 'notes')}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold font-['Outfit'] uppercase text-white">
                      2. Detailed Teaching Notes & Scripture Outline
                    </span>
                  </div>
                  {expandedLessonSection === 'notes' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedLessonSection === 'notes' && (
                  <div className="p-4 pt-0 text-xs text-slate-200 border-t border-white/5">
                    <pre className="whitespace-pre-wrap font-serif text-xs leading-relaxed text-slate-200 bg-slate-950/60 p-4 rounded-xl border border-white/5">
                      {activeLesson.notesContent}
                    </pre>
                  </div>
                )}
              </div>

              {/* 3. Small Group Discussion Questions */}
              <div className="bg-[#0B1329] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedLessonSection(expandedLessonSection === 'questions' ? ('' as any) : 'questions')}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold font-['Outfit'] uppercase text-white">
                      3. Small Group Discussion Questions ({activeLesson.questions?.length || 0})
                    </span>
                  </div>
                  {expandedLessonSection === 'questions' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedLessonSection === 'questions' && (
                  <div className="p-4 pt-0 text-xs text-slate-200 space-y-2 border-t border-white/5">
                    {(activeLesson.questions || []).map((q, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/70 rounded-xl border border-white/5 flex gap-2">
                        <span className="text-amber-400 font-bold font-mono">{idx + 1}.</span>
                        <p className="font-serif text-slate-200">{q}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Action Challenge & Consecration */}
              <div className="bg-[#0B1329] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedLessonSection(expandedLessonSection === 'application' ? ('' as any) : 'application')}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold font-['Outfit'] uppercase text-white">
                      4. Today's Kingdom Challenge & Practical Consecration
                    </span>
                  </div>
                  {expandedLessonSection === 'application' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedLessonSection === 'application' && (
                  <div className="p-4 pt-0 text-xs text-slate-200 space-y-2 border-t border-white/5">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 font-serif leading-relaxed">
                      <span className="font-bold uppercase font-mono text-emerald-400 block mb-1 text-[11px]">Today's Action Mandate:</span>
                      {activeLesson.challenge}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Attachments & Study Handouts (With Direct Upload) */}
              <div className="bg-[#0B1329] border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedLessonSection(expandedLessonSection === 'handouts' ? ('' as any) : 'handouts')}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold font-['Outfit'] uppercase text-white">
                      5. Lesson Attachments & Handouts ({activeLesson.attachments?.length || 0})
                    </span>
                  </div>
                  {expandedLessonSection === 'handouts' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedLessonSection === 'handouts' && (
                  <div className="p-4 pt-0 text-xs text-slate-200 space-y-3 border-t border-white/5">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-mono text-slate-400">PDFs, Word Docs & Images for this lesson:</span>
                      <label className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Attachment</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,image/*"
                          onChange={handleUploadLessonAttachment}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {activeLesson.attachments && activeLesson.attachments.length > 0 ? (
                      <div className="space-y-2">
                        {activeLesson.attachments.map((att, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/70 rounded-xl border border-white/5 flex items-center justify-between">
                            <span className="text-slate-300 font-mono text-[11px] truncate">{att.name} ({att.size})</span>
                            <a
                              href={att.url}
                              download={att.name}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold cursor-pointer hover:bg-amber-500/30"
                            >
                              Download Handout
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-950/40 rounded-xl border border-white/5">
                        No attachments uploaded yet. Tap <strong>Upload Attachment</strong> to attach your lesson notes, PDF, or study guide!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* DRILL DOWN SUBVIEW 5: FELLOWSHIP HUB (Schedule, YoungFire Chat, Idea List with Voting) */}
      {activeDrillDown === 'fellowship_hub' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <button
              onClick={() => setActiveDrillDown(null)}
              className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                Community Life &bull; Ideas & Gatherings
              </span>
              <h3 className="text-lg font-black font-['Outfit'] uppercase text-white">
                Fellowship Hub & Schedule
              </h3>
            </div>
          </div>

          {/* Interactive Sanctuary Calendar with Two-Way Lesson Sync */}
          <FellowshipCalendar
            lessons={lessons}
            ideas={ideas}
            onSelectLesson={(lessonIdx) => {
              setSelectedLessonIndex(lessonIdx);
              setActiveDrillDown('discipleship');
            }}
            currentUser={activeUser}
          />

          {/* Gathering Schedule Card */}
          <div className="bg-[#0B1329] border border-purple-500/30 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Weekly YoungFire Discipleship Schedule</span>
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-orange-400 font-bold block">MONDAYS @ 7:00 PM CST</span>
                <h5 className="text-xs font-bold text-white mt-1">Men On Fire Brotherhood</h5>
                <p className="text-[11px] text-slate-400 font-serif">Zoom Huddle & Iron Sharpens Iron</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-amber-400 font-bold block">TUESDAYS @ 6:30 PM CST</span>
                <h5 className="text-xs font-bold text-white mt-1">Small Group Discipleship</h5>
                <p className="text-[11px] text-slate-400 font-serif">Living Room Study & Dinner</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-rose-400 font-bold block">THURSDAYS @ 6:30 PM CST</span>
                <h5 className="text-xs font-bold text-white mt-1">Women Ignited / Open Bible</h5>
                <p className="text-[11px] text-slate-400 font-serif">Sisterhood Prayer & 66-Book Dive</p>
              </div>
            </div>
          </div>

          {/* Fellowship Idea List with Community Voting */}
          <div className="bg-[#0B1329] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Community Fellowship Ideas & Voting</span>
                </h4>
                <p className="text-[10px] font-mono text-slate-400">Propose gathering ideas; top voted ideas get placed on the schedule!</p>
              </div>

              <button
                onClick={() => setIsIdeaFormOpen(!isIdeaFormOpen)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono cursor-pointer"
              >
                {isIdeaFormOpen ? 'Close' : '+ Propose Idea'}
              </button>
            </div>

            {isIdeaFormOpen && (
              <form onSubmit={handleAddIdea} className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/30 space-y-3">
                <input
                  type="text"
                  placeholder="Idea Title (e.g. Park Volleyball & Worship Picnic)"
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <textarea
                  placeholder="Details, location idea, and what we will do..."
                  value={newIdeaDesc}
                  onChange={(e) => setNewIdeaDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl p-3 text-xs text-white"
                />
                <div className="flex justify-end gap-2">
                  <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">
                    Submit Idea for Voting
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {ideas.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-serif">
                  No ideas submitted yet. Be the first to propose a fellowship event!
                </div>
              ) : (
                ideas.map((idea) => {
                  const isTopVoted = idea.votes >= 3;
                  return (
                    <div key={idea.id} className="p-3.5 bg-slate-950/70 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-xs font-bold text-white font-['Outfit']">{idea.title}</h5>
                          {isTopVoted && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/40">
                              🔥 Top Voted
                            </span>
                          )}
                          {idea.scheduledDate && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>On Calendar: {idea.scheduledDate}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 font-serif">{idea.description}</p>
                        <span className="text-[10px] font-mono text-slate-400">Proposed by {idea.author} &bull; {idea.date}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                        {/* Upvote button */}
                        <button
                          onClick={() => handleVoteIdea(idea.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title="Upvote gathering idea"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{idea.votes}</span>
                        </button>

                        {/* Downvote button */}
                        <button
                          onClick={() => handleDownvoteIdea(idea.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-rose-400 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title="Downvote gathering idea"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Facilitator Add to Calendar button on top-voted ideas */}
                        {isFacilitator && (
                          <button
                            onClick={() => {
                              setSchedulingIdea(idea);
                              setSchedulingDate(idea.scheduledDate || new Date().toISOString().split('T')[0]);
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                              idea.scheduledStatus
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/40'
                            }`}
                            title="Schedule this idea on the Fellowship Sanctuary Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{idea.scheduledStatus ? 'Reschedule' : 'Add to Calendar'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* General YoungFire Fellowship Live Chat */}
          <div className="bg-[#0B1329] border border-purple-500/30 rounded-3xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>YoungFire General Fellowship Chat</span>
                <span className="text-[10px] text-slate-400">({(chatMessages.groups || []).length} Messages)</span>
              </h4>
              <button
                onClick={() => handleClearChatThread('groups')}
                className="text-[10px] font-mono text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                Clear Space
              </button>
            </div>

            <div className="h-44 overflow-y-auto space-y-2">
              {(chatMessages.groups || []).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-serif">
                  Clean space active. No messages yet. Say hello to your YoungFire family!
                </div>
              ) : (
                (chatMessages.groups || []).map((msg) => (
                  <div key={msg.id} className="p-2.5 bg-slate-950/70 rounded-xl border border-white/5 text-xs group">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                      <strong className="text-purple-400">{msg.sender}</strong>
                      <div className="flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => handleStartEditChatMessage(msg)}
                          className="hover:text-amber-300 opacity-60 hover:opacity-100 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteChatMessage('groups', msg.id)}
                          className="hover:text-rose-400 opacity-60 hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {editingChatId === msg.id ? (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={editingChatText}
                          onChange={(e) => setEditingChatText(e.target.value)}
                          className="flex-1 bg-black border border-purple-400 rounded-lg px-2 py-1 text-xs text-white"
                        />
                        <button
                          onClick={() => handleSaveEditChatMessage('groups', msg.id)}
                          className="px-2 py-1 bg-purple-500 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingChatId(null)}
                          className="px-2 py-1 bg-white/10 text-slate-300 rounded-lg text-[10px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-slate-200">{msg.text}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={(e) => {
              setActiveChatThread('groups');
              handleSendMessage(e);
            }} className="flex gap-2">
              <input
                type="text"
                placeholder="Share a thought with the whole fellowship..."
                value={newChatInput}
                onChange={(e) => setNewChatInput(e.target.value)}
                className="flex-1 bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button type="submit" className="p-2.5 rounded-xl bg-purple-500 text-white font-bold cursor-pointer">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRILL DOWN SUBVIEW 6: 24/7 PRAYER TOWER & DOCK (With Green Checkmarks for Answered Prayer) */}
      {activeDrillDown === 'prayer_dock' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveDrillDown(null)}
                className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  24/7 Intercession Watch & Praise Altar
                </span>
                <h3 className="text-lg font-black font-['Outfit'] uppercase text-white">
                  The Prayer Dock
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsPrayerModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Submit Prayer Request</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setPrayerFilter('all')}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                prayerFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-[#0B1329] text-slate-300 border-white/10'
              }`}
            >
              All Prayers ({prayers.length})
            </button>
            <button
              onClick={() => setPrayerFilter('active')}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                prayerFilter === 'active'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                  : 'bg-[#0B1329] text-slate-300 border-white/10'
              }`}
            >
              Active Intercession ({prayers.filter(p => !p.completed).length})
            </button>
            <button
              onClick={() => setPrayerFilter('answered')}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                prayerFilter === 'answered'
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-[#0B1329] text-slate-300 border-white/10'
              }`}
            >
              Answered Praises ({prayers.filter(p => p.completed).length})
            </button>
          </div>

          {/* Prayer Request Modal */}
          {isPrayerModalOpen && (
            <form onSubmit={handleAddPrayer} className="p-5 bg-[#0B1329] border border-emerald-500/40 rounded-3xl space-y-3 shadow-2xl">
              <h4 className="text-xs font-bold font-mono uppercase text-emerald-400">
                Submit Intercession to the 24/7 Prayer Dock
              </h4>
              <input
                type="text"
                placeholder="Name of Believer / Family in Need"
                value={newPrayerName}
                onChange={(e) => setNewPrayerName(e.target.value)}
                className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
              <textarea
                placeholder="What is the prayer request or spiritual burden? (Physical healing, salvation, family peace, breakthrough...)"
                value={newPrayerCause}
                onChange={(e) => setNewPrayerCause(e.target.value)}
                rows={3}
                className="w-full bg-[#070C1C] border border-white/10 rounded-xl p-3 text-xs text-white"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrayerModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white/10 text-slate-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs font-mono cursor-pointer"
                >
                  Place on Prayer Dock
                </button>
              </div>
            </form>
          )}

          {/* Prayers List */}
          <div className="space-y-3">
            {prayers.filter(p => prayerFilter === 'all' ? true : prayerFilter === 'active' ? !p.completed : p.completed).length === 0 ? (
              <div className="p-8 bg-[#0B1329] border border-white/10 rounded-3xl text-center space-y-3">
                <Flame className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                <h5 className="text-sm font-bold text-white font-['Outfit']">Prayer Dock Clean Slate</h5>
                <p className="text-xs text-slate-300 font-serif max-w-sm mx-auto">
                  No requests in this filter. Tap <strong>Submit Prayer Request</strong> to bring a need before the body!
                </p>
              </div>
            ) : (
              prayers.filter(p => prayerFilter === 'all' ? true : prayerFilter === 'active' ? !p.completed : p.completed).map((prayer) => (
                <div 
                  key={prayer.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    prayer.completed
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md'
                      : 'bg-[#0B1329] border-white/10'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-black uppercase text-white font-['Outfit']">
                        {Array.isArray(prayer.names) ? prayer.names.join(', ') : prayer.names}
                      </h5>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        prayer.completed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {prayer.completed ? 'Answered Praise ✨' : 'Active Intercession 🔥'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-serif leading-relaxed">
                      {prayer.cause}
                    </p>

                    <span className="text-[10px] font-mono text-slate-400 block">
                      Posted on {prayer.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Green Checkmark Button for Answered Praise */}
                    <button
                      onClick={() => handleTogglePrayerCompleted(prayer.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                        prayer.completed
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                      title={prayer.completed ? 'Mark as active intercession' : 'Check prayer as answered praise!'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span className="text-[10px] font-mono font-bold hidden sm:inline">
                        {prayer.completed ? 'Answered' : 'Check Answered'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDeletePrayer(prayer.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 cursor-pointer"
                      title="Delete prayer from dock"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DRILL DOWN SUBVIEW 7: DAILY BREAD HUB (Replaces Young Professionals) */}
      {activeDrillDown === 'daily_bread' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <button
              onClick={() => setActiveDrillDown(null)}
              className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                Daily Manna &bull; Spiritual Sustenance
              </span>
              <h3 className="text-lg font-black font-['Outfit'] uppercase text-white">
                Daily Bread Hub
              </h3>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-950/40 via-[#0B1329] to-slate-900 border border-blue-500/30 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold">
                Today's Verse of the Day
              </span>
              <span className="text-xs font-mono text-slate-400">Matthew 4:4</span>
            </div>

            <blockquote className="text-lg sm:text-xl font-serif italic text-white leading-relaxed">
              "Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God."
            </blockquote>

            <p className="text-xs text-slate-300 font-serif leading-relaxed">
              Before opening your social feeds or checking text notifications, feed your spirit on the incorruptible seed of God’s Word. The decisions you make today will flow from what you meditate upon in the secret place.
            </p>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => onNavigate('word', 'bible')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read in 66-Book Bible</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRILL DOWN SUBVIEW 8: BIBLE TRACKER ANALYTICS (Replaces Marriage Covenant) */}
      {activeDrillDown === 'bible_analytics' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <button
              onClick={() => setActiveDrillDown(null)}
              className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Paper Sword Check-In & Annual Goals
              </span>
              <h3 className="text-lg font-black font-['Outfit'] uppercase text-white">
                Bible Tracker Analytics Hub
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-[#0B1329] border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Annual Goal</span>
              <h4 className="text-xl font-black text-amber-400 font-mono">52 WEEKS</h4>
              <p className="text-[11px] text-slate-300">Target for physical Bible sessions</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1329] border border-cyan-500/30 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Current Milestone</span>
              <h4 className="text-xl font-black text-cyan-400 font-mono">LIVING WORD</h4>
              <p className="text-[11px] text-slate-300">Scripture Faithful Badge Unlocked</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B1329] border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Community Tracking</span>
              <h4 className="text-xl font-black text-emerald-400 font-mono">100% PAPER SWORD</h4>
              <p className="text-[11px] text-slate-300">Physical Bible discipleship</p>
            </div>
          </div>

          <div className="p-5 bg-[#0B1329] border border-white/10 rounded-3xl space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-white">Open Physical Bible Tracker</h4>
            <p className="text-xs text-slate-300 font-serif">
              Log each time you bring your physical Bible to church, small group, or personal study!
            </p>
            <button
              onClick={() => onNavigate('bibletracker')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono cursor-pointer shadow-md inline-flex items-center gap-1.5"
            >
              <span>Launch Paper Sword Check-In &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* DRILL DOWN SUBVIEW 9: READING PLANS HUB (5-Day, 7-Day & Custom Plan Generator) */}
      {activeDrillDown === 'reading_plans' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <button
              onClick={() => setActiveDrillDown(null)}
              className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold">
                Structured Discipleship &bull; Custom Plans
              </span>
              <h3 className="text-lg font-black font-['Outfit'] uppercase text-white">
                Bible Reading Plans Hub
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Plan 1 */}
            <div className="p-4 bg-[#0B1329] border border-orange-500/30 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-orange-400 font-bold">5-DAY PLAN</span>
              <h4 className="text-xs font-bold text-white uppercase font-['Outfit']">The Whole Armor of God</h4>
              <p className="text-[11px] text-slate-300 font-serif">Ephesians 6:10-18 study on helmet of salvation, sword of the Spirit, and breastplate of righteousness.</p>
              <button onClick={() => onNavigate('word', 'bible')} className="text-xs font-mono text-orange-400 hover:underline font-bold">Start Plan &rarr;</button>
            </div>

            {/* Plan 2 */}
            <div className="p-4 bg-[#0B1329] border border-rose-500/30 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-rose-400 font-bold">7-DAY PLAN</span>
              <h4 className="text-xs font-bold text-white uppercase font-['Outfit']">Proverbs 31 Sacred Wisdom</h4>
              <p className="text-[11px] text-slate-300 font-serif">A week of consecration in holy dignity, industrious grace, and fearing the Lord.</p>
              <button onClick={() => onNavigate('word', 'bible')} className="text-xs font-mono text-rose-400 hover:underline font-bold">Start Plan &rarr;</button>
            </div>

            {/* Plan 3 */}
            <div className="p-4 bg-[#0B1329] border border-cyan-500/30 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">7-DAY PLAN</span>
              <h4 className="text-xs font-bold text-white uppercase font-['Outfit']">Walk with the Messiah</h4>
              <p className="text-[11px] text-slate-300 font-serif">From the Sermon on the Mount to the empty tomb in Jerusalem.</p>
              <button onClick={() => onNavigate('word', 'bible')} className="text-xs font-mono text-cyan-400 hover:underline font-bold">Start Plan &rarr;</button>
            </div>
          </div>
        </div>
      )}

      {/* DRILL DOWN SUBVIEW 10: AUTHENTIC HD PHOTO GALLERY & FOLDERS UPLOAD */}
      {activeDrillDown === 'wall' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveDrillDown(null)}
                className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-black font-['Outfit'] uppercase text-white">
                  Authentic HD Photo Gallery & Vault ({galleryPhotos.length} Photos)
                </h3>
                <p className="text-[10px] font-mono text-slate-400">
                  Joshua House of Worship &bull; YoungFire Discipleship Moments
                </p>
              </div>
            </div>

            {/* Upload Buttons: Single, Multiple, or Entire Folder (Supports 160+ files!) */}
            <div className="flex items-center gap-2 flex-wrap">
              <label className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-md">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBatchPhotoUpload}
                  className="hidden"
                />
              </label>

              <label className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-md">
                <FolderUp className="w-3.5 h-3.5" />
                <span>Upload Entire Folder</span>
                <input
                  type="file"
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleBatchPhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {isUploadingBatch && (
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span>{uploadProgress || 'Processing photos...'}</span>
            </div>
          )}

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryPhotos.map((photo) => (
              <div 
                key={photo.id} 
                onClick={() => setActiveLightboxPhoto(photo)}
                className="rounded-3xl overflow-hidden border border-white/10 bg-[#0B1329] shadow-xl flex flex-col justify-between group cursor-pointer hover:border-amber-400/50 transition-all"
              >
                <div className="relative aspect-video sm:aspect-square overflow-hidden bg-slate-950">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title} 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-amber-300 font-bold backdrop-blur-xs">
                    {photo.category}
                  </span>
                  <button
                    onClick={(e) => handleDeletePhoto(photo.id, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-slate-400 hover:text-rose-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4 space-y-1.5">
                  <h4 className="text-xs font-bold text-white font-['Outfit'] truncate">{photo.title}</h4>
                  <p className="text-[11px] text-slate-300 font-serif leading-snug line-clamp-2">{photo.caption}</p>
                  <p className="text-[10px] font-mono text-amber-400 font-bold pt-1 border-t border-white/5 truncate">
                    {photo.scripture}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Fullscreen HD Lightbox Modal */}
          {activeLightboxPhoto && (
            <div 
              className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none"
              onClick={() => setActiveLightboxPhoto(null)}
            >
              <div 
                className="w-full max-w-4xl bg-[#0B1329] border border-white/20 rounded-3xl overflow-hidden shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative aspect-video max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={activeLightboxPhoto.imageUrl}
                    alt={activeLightboxPhoto.title}
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => setActiveLightboxPhoto(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white font-['Outfit']">{activeLightboxPhoto.title}</h3>
                    <span className="text-xs font-mono text-amber-400">{activeLightboxPhoto.date}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-serif leading-relaxed">{activeLightboxPhoto.caption}</p>
                  <p className="text-xs font-mono text-amber-300 font-bold">{activeLightboxPhoto.scripture}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NEW LESSON MODAL (Allows Viewers & Admins to Enter Lessons) */}
      {isNewLessonModalOpen && (
        <div 
          className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setIsNewLessonModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-[#0B1329] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-['Outfit'] uppercase">
                Add Discipleship Lesson
              </h3>
              <button 
                onClick={() => setIsNewLessonModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Lesson Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Walking in Resurrection Power"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-cyan-400 block mb-1 font-bold">Teaching Date (Calendar Sync)</label>
                  <input
                    type="date"
                    value={newLessonTeachingDate}
                    onChange={(e) => setNewLessonTeachingDate(e.target.value)}
                    className="w-full bg-[#070C1C] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Series Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Seven Churches or Soli Deo Gloria"
                    value={newLessonSeries}
                    onChange={(e) => setNewLessonSeries(e.target.value)}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Teachers / Leaders</label>
                  <input
                    type="text"
                    placeholder="Trent White & Whitney White (YoungFire Discipleship Leaders)"
                    value={newLessonTeachers}
                    onChange={(e) => setNewLessonTeachers(e.target.value)}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Primary Scripture Passage</label>
                <input
                  type="text"
                  placeholder="e.g. Ephesians 4:11-16"
                  value={newLessonPassage}
                  onChange={(e) => setNewLessonPassage(e.target.value)}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Thematic Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Covenant Unity, Spiritual Warfare & Prayer"
                  value={newLessonTheme}
                  onChange={(e) => setNewLessonTheme(e.target.value)}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Summary Overview</label>
                <textarea
                  placeholder="Overview of what was taught..."
                  value={newLessonSummary}
                  onChange={(e) => setNewLessonSummary(e.target.value)}
                  rows={2}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Verbatim Lesson Notes & Outline</label>
                <textarea
                  placeholder="Full teaching notes, Scripture quotes, illustrations..."
                  value={newLessonNotes}
                  onChange={(e) => setNewLessonNotes(e.target.value)}
                  rows={5}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl p-3 text-xs text-white font-serif"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Video Link or YouTube ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://www.youtube.com/watch?v=KwX1f2gYKZ4 or video ID"
                  value={newLessonVideoUrl}
                  onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewLessonModalOpen(false)}
                  className="px-4 py-2 bg-white/10 text-slate-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono cursor-pointer shadow-md"
                >
                  Save & Publish Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LESSON MODAL (Two-Way Lesson Link & Sync) */}
      {isEditLessonModalOpen && (
        <div 
          className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setIsEditLessonModalOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-[#0B1329] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] uppercase flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <span>Edit Discipleship Lesson</span>
                </h3>
                <p className="text-[10px] font-mono text-cyan-400 mt-0.5">
                  Two-Way Calendar Sync: Modifying teaching date will update its placement on the monthly calendar.
                </p>
              </div>
              <button 
                onClick={() => setIsEditLessonModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLessonEdit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Lesson Title</label>
                  <input
                    type="text"
                    value={editLessonTitle}
                    onChange={(e) => setEditLessonTitle(e.target.value)}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-cyan-400 block mb-1 font-bold">Teaching Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={editLessonTeachingDate}
                    onChange={(e) => setEditLessonTeachingDate(e.target.value)}
                    className="w-full bg-[#070C1C] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Series Title</label>
                  <input
                    type="text"
                    value={editLessonSeries}
                    onChange={(e) => setEditLessonSeries(e.target.value)}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Teachers / Leaders</label>
                  <input
                    type="text"
                    value={editLessonTeachers}
                    onChange={(e) => setEditLessonTeachers(e.target.value)}
                    className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Primary Scripture Passage</label>
                <input
                  type="text"
                  value={editLessonPassage}
                  onChange={(e) => setEditLessonPassage(e.target.value)}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Theme</label>
                <input
                  type="text"
                  value={editLessonTheme}
                  onChange={(e) => setEditLessonTheme(e.target.value)}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Summary Overview</label>
                <textarea
                  value={editLessonSummary}
                  onChange={(e) => setEditLessonSummary(e.target.value)}
                  rows={2}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Verbatim Lesson Notes & Outline</label>
                <textarea
                  value={editLessonNotes}
                  onChange={(e) => setEditLessonNotes(e.target.value)}
                  rows={5}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl p-3 text-xs text-white font-serif"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Video Link or YouTube ID</label>
                <input
                  type="text"
                  value={editLessonVideoUrl}
                  onChange={(e) => setEditLessonVideoUrl(e.target.value)}
                  className="w-full bg-[#070C1C] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditLessonModalOpen(false)}
                  className="px-4 py-2 bg-white/10 text-slate-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-mono cursor-pointer shadow-md"
                >
                  Update Lesson & Sync Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULING IDEA TO SANCTUARY CALENDAR MODAL */}
      {schedulingIdea && (
        <div 
          className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setSchedulingIdea(null)}
        >
          <div 
            className="w-full max-w-md bg-[#0B1329] border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] uppercase flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Schedule Idea to Calendar</span>
                </h3>
                <p className="text-[10px] font-mono text-purple-300 mt-0.5">
                  Facilitator Tool: Places event onto the Sanctuary Calendar
                </p>
              </div>
              <button 
                onClick={() => setSchedulingIdea(null)}
                className="text-slate-400 hover:text-white cursor-pointer font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/5 space-y-1">
                <span className="text-xs font-bold text-white block">{schedulingIdea.title}</span>
                <p className="text-[11px] text-slate-300 font-serif">{schedulingIdea.description}</p>
                <span className="text-[10px] font-mono text-amber-400 block">{schedulingIdea.votes} Community Votes</span>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Select Event Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={schedulingDate}
                  onChange={(e) => setSchedulingDate(e.target.value)}
                  className="w-full bg-[#070C1C] border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-purple-300 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSchedulingIdea(null)}
                  className="px-4 py-2 bg-white/10 text-slate-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleScheduleIdeaToCalendar(schedulingIdea, schedulingDate)}
                  className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-xs font-mono cursor-pointer shadow-md"
                >
                  Confirm & Place on Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
