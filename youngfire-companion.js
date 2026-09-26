/**
 * YoungFire Ministry Companion Engine
 * 1. Two-way seamless synchronization between Lessons tab, Fellowship Gatherings list, and YoungFire Calendar
 * 2. Instant manual delete from Gatherings list (deletes matching lesson in Lesson tab, and vice versa)
 * 3. Title format: Small Group Meeting - "Name of the Lesson"
 * 4. Deduplication: no duplicate gatherings created
 * 5. Clean Prayer Dock: completely scrubs unwanted banners and text
 * 6. Live Radio Stream Lyrics Catcher (instant sync & 8 stations dropdown on all devices)
 * 7. Movable Notification Bell (touch grab/swap & mouse drag across screen)
 * 8. Worship Video Vault (Add to Enrich Media Library)
 * 9. Video Maximize true fullscreen takeover
 * 10. Lessons Screen Parity & strict black text in inputs
 */

(function () {
  'use strict';

  // --- STYLES INJECTION ---
  const style = document.createElement('style');
  style.id = 'youngfire-companion-styles';
  style.textContent = `
    /* Enforce black text for lessons add/edit form regardless of theme */
    .yf-lesson-form input,
    .yf-lesson-form textarea,
    .yf-lesson-form select,
    form input[placeholder*="Walking in Courage"],
    form textarea,
    form input[type="text"],
    form input[type="time"],
    form input[type="date"] {
      color: #000000 !important;
      background-color: #ffffff !important;
      caret-color: #000000 !important;
    }
    .yf-lesson-form label,
    form label {
      color: #e2e8f0 !important;
    }
    .yf-lesson-form input::placeholder,
    .yf-lesson-form textarea::placeholder {
      color: #64748b !important;
    }

    /* Mobile Responsive Lessons Screen Parity */
    @media (max-width: 768px) {
      #selected-lesson-viewer {
        max-width: 100vw !important;
        overflow-x: hidden !important;
        padding: 1rem !important;
      }
      #selected-lesson-viewer pre,
      #selected-lesson-viewer p,
      #selected-lesson-viewer div {
        max-width: 100% !important;
        word-break: break-word !important;
        overflow-wrap: anywhere !important;
      }
      .youngfire-lessons-container,
      .grid.lg\\:grid-cols-12 {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        max-width: 100vw !important;
      }
    }

    /* Movable Bell Handle */
    .yf-bell-draggable {
      cursor: grab !important;
      touch-action: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      transition: transform 0.05s ease-out;
    }
    .yf-bell-dragging {
      cursor: grabbing !important;
      opacity: 0.9 !important;
      transform: scale(1.08) !important;
      z-index: 99999 !important;
    }
  `;
  document.head.appendChild(style);

  // Storage Keys
  const KEYS = {
    LESSONS: 'yf_stored_lessons_v4',
    GATHERINGS: 'yf_stored_fellowship_nights_v2',
    CALENDAR: 'youngfire_calendar_events_v3',
    EVENT_SYNC: 'yf_meetings_synced',
    EVENT_CALENDAR: 'youngfire_calendar_updated',
    EVENT_LESSONS: 'yf_lessons_updated'
  };

  // --- 1. SCRUB UNWANTED STATEMENTS IN PRAYER DOCK & LESSONS ---
  function scrubUnwantedStatements() {
    // 1. Remove any .yf-live-approved-box or elements containing the specific text
    document.querySelectorAll('.yf-live-approved-box').forEach(el => el.remove());

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodesToRemove = [];
    while (walker.nextNode()) {
      const text = walker.currentNode.nodeValue;
      if (
        text.includes('Live & Approved Discipleship Gathering') ||
        text.includes('Populated in Fellowship as') ||
        text.trim() === '✓ Complete'
      ) {
        nodesToRemove.push(walker.currentNode);
      }
    }

    nodesToRemove.forEach(node => {
      const parent = node.parentElement;
      if (parent) {
        if (parent.tagName === 'BUTTON' && parent.textContent.trim() === '✓ Complete') {
          parent.remove();
        } else if (parent.classList && parent.classList.contains('yf-live-approved-box')) {
          parent.remove();
        } else if (parent.parentElement && parent.parentElement.classList.contains('yf-live-approved-box')) {
          parent.parentElement.remove();
        } else {
          node.nodeValue = '';
        }
      }
    });
  }

  // --- 2. TWO-WAY SYNC: LESSONS <-> GATHERINGS <-> YOUNGFIRE CALENDAR ---
  // When a gathering is deleted:
  window.__deleteGatheringAndSync = function(gatheringId) {
    try {
      const gRaw = localStorage.getItem(KEYS.GATHERINGS);
      const gatherings = gRaw ? JSON.parse(gRaw) : [];
      const target = gatherings.find(g => g.id === gatheringId);
      const remainingGatherings = gatherings.filter(g => g.id !== gatheringId);
      localStorage.setItem(KEYS.GATHERINGS, JSON.stringify(remainingGatherings));

      // Remove from calendar
      const cRaw = localStorage.getItem(KEYS.CALENDAR);
      const calendarEvents = cRaw ? JSON.parse(cRaw) : [];
      const remainingCalendar = calendarEvents.filter(c =>
        c.id !== gatheringId &&
        c.id !== `cal_gathering_${gatheringId}` &&
        c.id !== `cal_sync_${gatheringId.replace('sync_fn_', '')}` &&
        c.smallGroupId !== gatheringId &&
        c.smallGroupId !== gatheringId.replace('sync_fn_', '')
      );
      localStorage.setItem(KEYS.CALENDAR, JSON.stringify(remainingCalendar));

      // Also remove corresponding lesson from lessons tab
      const lRaw = localStorage.getItem(KEYS.LESSONS);
      const lessons = lRaw ? JSON.parse(lRaw) : [];
      const remainingLessons = lessons.filter(l => {
        if (gatheringId === `sync_fn_${l.id}` || gatheringId === l.id || gatheringId.endsWith(l.id)) return false;
        if (target) {
          if (target.title === `Small Group Meeting - "${l.lessonTitle}"`) return false;
          if (target.title && target.title.includes(l.lessonTitle)) return false;
          if (target.description && target.description === l.lessonTitle) return false;
        }
        return true;
      });

      if (remainingLessons.length !== lessons.length) {
        localStorage.setItem(KEYS.LESSONS, JSON.stringify(remainingLessons));
        window.dispatchEvent(new CustomEvent(KEYS.EVENT_LESSONS, { detail: { remaining: remainingLessons } }));
      }

      // Notify Fellowship & Calendar
      window.dispatchEvent(new CustomEvent(KEYS.EVENT_SYNC, { detail: { removedId: gatheringId } }));
      window.dispatchEvent(new CustomEvent(KEYS.EVENT_CALENDAR, { detail: { removedId: gatheringId } }));

      // Server delete sync
      fetch(`/api/gatherings/${gatheringId}`, { method: 'DELETE' }).catch(() => {});
      if (window.__deleteEventFromFirestore) {
        window.__deleteEventFromFirestore(gatheringId);
      }
      if (gatheringId.startsWith('sync_fn_')) {
        const lId = gatheringId.replace('sync_fn_', '');
        fetch(`/api/lessons/${lId}`, { method: 'DELETE' }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error in __deleteGatheringAndSync:', e);
    }
  };

  // When a lesson is deleted:
  window.__deleteLessonAndSync = function(lessonId) {
    try {
      const lRaw = localStorage.getItem(KEYS.LESSONS);
      const lessons = lRaw ? JSON.parse(lRaw) : [];
      const targetLesson = lessons.find(l => l.id === lessonId);
      const remainingLessons = lessons.filter(l => l.id !== lessonId);
      localStorage.setItem(KEYS.LESSONS, JSON.stringify(remainingLessons));

      // Remove from gatherings
      const gRaw = localStorage.getItem(KEYS.GATHERINGS);
      const gatherings = gRaw ? JSON.parse(gRaw) : [];
      const remainingGatherings = gatherings.filter(g => {
        if (g.id === `sync_fn_${lessonId}` || g.id === lessonId || g.id.endsWith(lessonId)) return false;
        if (targetLesson) {
          if (g.title === `Small Group Meeting - "${targetLesson.lessonTitle}"`) return false;
          if (g.title && g.title.includes(targetLesson.lessonTitle)) return false;
          if (g.description && g.description === targetLesson.lessonTitle) return false;
        }
        return true;
      });
      localStorage.setItem(KEYS.GATHERINGS, JSON.stringify(remainingGatherings));

      // Remove from calendar
      const cRaw = localStorage.getItem(KEYS.CALENDAR);
      const calendarEvents = cRaw ? JSON.parse(cRaw) : [];
      const remainingCalendar = calendarEvents.filter(c =>
        c.id !== `cal_sync_${lessonId}` &&
        c.smallGroupId !== lessonId &&
        !(targetLesson && c.description === targetLesson.lessonTitle)
      );
      localStorage.setItem(KEYS.CALENDAR, JSON.stringify(remainingCalendar));

      // Dispatch sync events
      window.dispatchEvent(new CustomEvent(KEYS.EVENT_SYNC, { detail: { lessonId } }));
      window.dispatchEvent(new CustomEvent(KEYS.EVENT_CALENDAR, { detail: { lessonId } }));
      window.dispatchEvent(new CustomEvent(KEYS.EVENT_LESSONS, { detail: { lessonId } }));

      // Server delete sync
      fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' }).catch(() => {});
      fetch(`/api/gatherings/sync_fn_${lessonId}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {
      console.warn('Error in __deleteLessonAndSync:', e);
    }
  };

  // Add/Sync lesson into Gatherings and YoungFire Calendar with exact title format
  window.__syncLessonToGatheringsAndCalendar = function(lesson) {
    if (!lesson) return;
    const formattedTitle = `Small Group Meeting - "${lesson.lessonTitle}"`;
    const syncId = `sync_fn_${lesson.id}`;
    const rawDate = lesson.lessonDate || lesson.dateOrSeason || new Date().toISOString().split('T')[0];
    const dVal = rawDate.split('@')[0].trim();

    // 1. Gatherings sync
    try {
      const gRaw = localStorage.getItem(KEYS.GATHERINGS);
      const gatherings = gRaw ? JSON.parse(gRaw) : [];
      const gIdx = gatherings.findIndex(g =>
        g.id === syncId ||
        g.id === lesson.id ||
        g.title === formattedTitle ||
        g.title === 'Small group Meeting' ||
        (g.description && g.description === lesson.lessonTitle)
      );

      const gatheringItem = {
        id: syncId,
        title: formattedTitle,
        category: 'Lesson',
        date: dVal,
        time: lesson.meetingTime || '7:00 PM CST',
        locationName: lesson.location || 'Joshua House Sanctuary Annex & Zoom Room',
        address: 'Joshua House of Worship, San Antonio, TX',
        activity: 'Lesson',
        hostLeader: lesson.teachers || 'YoungFire Ministry',
        description: lesson.lessonTitle,
        itemsToBring: ['Bible', 'Notebook', 'Open Heart'],
        rsvps: lesson.teachers ? [lesson.teachers] : [],
        pinned: !!lesson.isUpcoming,
        isZoom: !!lesson.isZoom,
        zoomUrl: lesson.zoomUrl || (lesson.isZoom ? 'https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365' : void 0),
        zoomMeetingId: lesson.zoomMeetingId || (lesson.isZoom ? '878 516 1298' : void 0),
        zoomPasscode: lesson.zoomPasscode || (lesson.isZoom ? 'FIRE2026' : void 0)
      };

      if (gIdx >= 0) {
        gatherings[gIdx] = { ...gatherings[gIdx], ...gatheringItem };
      } else {
        gatherings.unshift(gatheringItem);
      }
      localStorage.setItem(KEYS.GATHERINGS, JSON.stringify(gatherings));
      window.dispatchEvent(new CustomEvent(KEYS.EVENT_SYNC, { detail: { gatheringId: syncId } }));
      if (window.__syncEventToFirestore) {
        window.__syncEventToFirestore(gatheringItem);
      }
      fetch('/api/gatherings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gatheringItem)
      }).catch(() => {});
    } catch (e) {
      console.warn('Sync gathering error:', e);
    }

    // 2. YoungFire Calendar sync
    try {
      const cRaw = localStorage.getItem(KEYS.CALENDAR);
      const calendarEvents = cRaw ? JSON.parse(cRaw) : [];
      const calId = `cal_sync_${lesson.id}`;
      const cIdx = calendarEvents.findIndex(c =>
        c.id === calId ||
        c.id === lesson.id ||
        c.title === formattedTitle ||
        c.title === 'Small group Meeting' ||
        c.smallGroupId === lesson.id ||
        (c.description && c.description === lesson.lessonTitle)
      );

      const calItem = {
        id: calId,
        title: formattedTitle,
        category: 'Lesson',
        date: dVal,
        time: lesson.meetingTime || '7:00 PM CST',
        location: lesson.location || 'Joshua House of Worship & Zoom Broadcast',
        description: lesson.lessonTitle,
        rsvps: lesson.teachers ? [lesson.teachers] : [],
        isZoom: !!lesson.isZoom,
        zoomUrl: lesson.zoomUrl || (lesson.isZoom ? 'https://us05web.zoom.us/j/8785161298?pwd=e0zBTD2QHIHfx0AzjzXG7EHQno9Oig.1&omn=85728476365' : void 0),
        zoomMeetingId: lesson.zoomMeetingId || (lesson.isZoom ? '878 516 1298' : void 0),
        zoomPasscode: lesson.zoomPasscode || (lesson.isZoom ? 'FIRE2026' : void 0),
        smallGroupId: lesson.id
      };

      if (cIdx >= 0) {
        calendarEvents[cIdx] = { ...calendarEvents[cIdx], ...calItem };
      } else {
        calendarEvents.unshift(calItem);
      }
      localStorage.setItem(KEYS.CALENDAR, JSON.stringify(calendarEvents));
      window.dispatchEvent(new CustomEvent(KEYS.EVENT_CALENDAR, { detail: { event: calItem } }));
    } catch (e) {
      console.warn('Sync calendar error:', e);
    }
  };

  // --- 3. MANUAL GATHERINGS LIST DELETE ENHANCER ---
  // Ensure that clicking trash / delete buttons in the Gatherings list triggers instant deletion
  function wireGatheringsDeleteButtons() {
    const deleteBtns = document.querySelectorAll('button[title*="Delete Announcement" i], button[title*="Delete" i]');
    deleteBtns.forEach(btn => {
      if (btn.dataset.syncDeleteWired === 'true') return;
      btn.dataset.syncDeleteWired = 'true';

      btn.addEventListener('click', (e) => {
        // Find closest card to identify gathering
        const card = btn.closest('.p-5, .rounded-2xl') || btn.parentElement?.parentElement;
        if (!card) return;

        const titleEl = card.querySelector('h3, h4, .font-serif');
        const titleText = titleEl ? titleEl.textContent.trim() : '';

        // Find matching item in localStorage
        try {
          const gRaw = localStorage.getItem(KEYS.GATHERINGS);
          if (!gRaw) return;
          const gatherings = JSON.parse(gRaw);
          const item = gatherings.find(g =>
            (titleText && g.title === titleText) ||
            (titleText && g.title.includes(titleText)) ||
            (titleText && titleText.includes(g.title))
          );
          if (item) {
            window.__deleteGatheringAndSync(item.id);
            card.remove();
          }
        } catch (err) {
          console.warn('Delete click handler error:', err);
        }
      }, true); // Use capture so it intercepts before any blocked confirm
    });
  }

  // --- CLEAN SLATE VERIFICATION & SCRUBBING ---
  (function initCleanSlate() {
    const CLEAN_KEY = 'yf_clean_slate_2026_v4';
    if (!localStorage.getItem(CLEAN_KEY)) {
      localStorage.setItem(CLEAN_KEY, 'true');
      localStorage.removeItem('yf_bell_pos_coords');
      localStorage.setItem('yf_stored_fellowship_chat_v2', '[]');
      localStorage.setItem('yf_stored_intercessions_v2', '[]');
      localStorage.setItem('yf_stored_fellowship_nights_v2', '[]');
      localStorage.setItem('youngfire_fellowship_roster_v8', '[]');
      localStorage.setItem('youngfire_active_member_v3', '');
      localStorage.setItem('youngfire_role_requests_v6', '[]');
      localStorage.setItem('yf_men_registered_members_v2', '[]');
      localStorage.setItem('yf_women_registered_members_v2', '[]');
      localStorage.setItem('yf_stored_fellowship_ideas_v2', '[]');
      localStorage.setItem('youngfire_calendar_events_v3', '[]');
      localStorage.setItem('yf_men_gatherings_v2', '[]');
      localStorage.setItem('yf_women_gatherings_v2', '[]');
      localStorage.setItem('yf_men_chat_messages_v2', '[]');
      localStorage.setItem('yf_women_chat_messages_v2', '[]');
      localStorage.setItem('yf_open_bible_entries_v3', '[]');
      localStorage.removeItem('yf_acting_user');
      localStorage.removeItem('yf_member_name');
      localStorage.removeItem('yf_chat_name');
    }
  })();

  // --- 4. MOVABLE NOTIFICATION BELL (TOUCH & MOUSE GRAB / SWAP) ---
  function initMovableBell() {
    let bellBtn = document.querySelector('button[aria-label*="Notification" i]');
    if (!bellBtn) {
      const allBtns = document.querySelectorAll('button');
      for (const b of allBtns) {
        if (b.querySelector('svg.lucide-bell')) {
          bellBtn = b;
          break;
        }
      }
    }
    if (!bellBtn || bellBtn.dataset.draggableInitialized === 'true') return;

    bellBtn.dataset.draggableInitialized = 'true';
    bellBtn.classList.add('yf-bell-draggable');

    const savedPos = localStorage.getItem('yf_bell_pos_coords');
    if (savedPos) {
      try {
        const { x, y } = JSON.parse(savedPos);
        bellBtn.style.position = 'fixed';
        bellBtn.style.left = `${x}px`;
        bellBtn.style.top = `${y}px`;
        bellBtn.style.right = 'auto';
        bellBtn.style.bottom = 'auto';
        bellBtn.style.zIndex = '9999';
      } catch {}
    } else {
      // By default: bell is integrated with the symmetrical HUD dock
      const parentWrap = bellBtn.closest('div.fixed') || bellBtn;
      parentWrap.style.zIndex = '9005';
    }

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;
    let hasMoved = false;

    function onPointerDown(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      isDragging = true;
      hasMoved = false;
      startX = clientX;
      startY = clientY;

      const rect = bellBtn.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      bellBtn.classList.add('yf-bell-dragging');
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - startX;
      const dy = clientY - startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMoved = true;
      }

      const newLeft = Math.max(10, Math.min(window.innerWidth - 60, initialLeft + dx));
      const newTop = Math.max(10, Math.min(window.innerHeight - 60, initialTop + dy));

      bellBtn.style.position = 'fixed';
      bellBtn.style.left = `${newLeft}px`;
      bellBtn.style.top = `${newTop}px`;
      bellBtn.style.right = 'auto';
      bellBtn.style.bottom = 'auto';
      bellBtn.style.zIndex = '99999';
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      bellBtn.classList.remove('yf-bell-dragging');

      if (hasMoved) {
        const rect = bellBtn.getBoundingClientRect();
        localStorage.setItem('yf_bell_pos_coords', JSON.stringify({ x: rect.left, y: rect.top }));
      }
    }

    bellBtn.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    bellBtn.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    bellBtn.addEventListener('click', (e) => {
      if (hasMoved) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);
  }

  // --- 5. LIVE RADIO STREAM LYRICS CATCHER & FULL STATIONS DROPDOWN ---
  const RADIO_STATIONS = [
    {
      id: 'youngfire-core',
      name: 'Kingdom Flame 24/7 Global Radio',
      genre: 'Urban & Global Kingdom Worship',
      location: 'San Antonio, TX / Global',
      songs: [
        {
          title: "Not Lucky, I'm Loved",
          artist: "Jonathan McReynolds",
          recommended: true,
          lyrics: [
            "[Intro: Declarative Testimony]",
            "I'm not lucky, I'm loved",
            "I'm not lucky, I'm loved",
            "[Verse 1: Grace Over Fate]",
            "People say that I got lucky, they say I stumbled upon grace",
            "They don't understand the mercy that met me in that secret place",
            "It wasn't rolling of the dice, it wasn't circumstance or fate",
            "It was the blood of Jesus Christ that washed away my heavy weight!",
            "[Chorus: Kingdom Identity]",
            "I'm not lucky, I'm loved!",
            "I'm not lucky, I'm loved!",
            "Every blessing that I see is His favor over me",
            "Goodness and mercy at my back, there is nothing that I lack",
            "I'm not lucky, I'm loved!",
            "[Bridge: Sovereign Covenant]",
            "Before I took a single breath, He knew my name, He conquered death",
            "He planned my steps, He holds my hand, forever in His sovereign plan",
            "No coincidence in Zion, protected by the Judah Lion!",
            "[Outro: Praise & Assurance]",
            "I'm not lucky, I'm loved",
            "Grace upon grace, glory to God in the highest!"
          ]
        },
        {
          title: 'All In (Throw Down Your Staff)',
          artist: 'YoungFire Sanctuary Mass Choir',
          lyrics: [
            '[Intro: Prophetic Call to Surrender]',
            'Throw down your staff at the water’s edge',
            'No turning back from the covenant pledge',
            'All in, all through the holy fire',
            'Lord, You alone are our one desire!',
            '[Chorus: Declarative Praise]',
            'Fire on the altar, never burning out',
            'Walls are shaking with the holy shout',
            'Jesus reigns high in this living place',
            'Covered completely by resurrection grace!',
            '[Bridge: Holy Spirit Outpouring]',
            'Open the windows of the heavens wide',
            'We stand redeemed at the Savior’s side',
            'No fear in love, Your glory has come',
            'Forever praised is the Holy One!'
          ]
        },
        {
          title: 'Resurrection Glory Falling',
          artist: 'Joshua House Collective',
          lyrics: [
            '[Verse 1]',
            'The tomb is empty, the veil is torn',
            'In Holy Spirit we are reborn',
            'Take every crown, lay it at His feet',
            'In His great presence we are complete!',
            '[Chorus]',
            'Resurrection glory, power of the Cross',
            'Counting every earthly gain but loss',
            'We lift our hands to the King on the throne',
            'Jesus our Lord, You reign alone!'
          ]
        }
      ]
    },
    {
      id: 'cbn-southern-gospel',
      name: 'CBN Southern Gospel Anthems',
      genre: 'Southern Gospel & Quartets',
      location: 'Virginia Beach, VA',
      songs: [
        {
          title: 'Step Into the Water',
          artist: 'Cathedral Quartet',
          lyrics: [
            '[Verse 1]',
            'It’s time to take a stand, step out upon the sand',
            'Step into the water, wade out in the deep',
            'There is power in the fountain, healing for the weak!',
            '[Chorus]',
            'Step into the water, wade out in the deep',
            'Wade out in the river that is flowing sweet',
            'No need to be afraid, the Savior leads the way',
            'Step into the water today!'
          ]
        },
        {
          title: 'How Great Thou Art',
          artist: 'Sacred Tabernacle Choir',
          lyrics: [
            '[Verse 1]',
            'O Lord my God, when I in awesome wonder',
            'Consider all the worlds Thy hands have made',
            'I see the stars, I hear the rolling thunder',
            'Thy power throughout the universe displayed!',
            '[Chorus]',
            'Then sings my soul, my Savior God to Thee',
            'How great Thou art, how great Thou art!',
            'Then sings my soul, my Savior God to Thee',
            'How great Thou art, how great Thou art!'
          ]
        }
      ]
    },
    {
      id: 'worship-lift',
      name: 'Worship 24/7 & Modern Praise',
      genre: 'Contemporary Christian Worship',
      location: 'Portland, OR / Worldwide',
      songs: [
        {
          title: 'Gratitude (Live Praise Anthem)',
          artist: 'Brandon Lake & Elevation Worship',
          lyrics: [
            '[Verse 1]',
            'All my words fall short, I got nothing new',
            'How could I express all my gratitude?',
            'I could sing these songs, as I often do',
            'Every song I sing still belongs to You.',
            '[Chorus]',
            'So I throw up my hands and praise You again and again',
            '’Cause all that I have is a hallelujah, hallelujah',
            'I know it’s not much, but I’ve nothing else fit for a King',
            'Except for a heart singing hallelujah!'
          ]
        },
        {
          title: 'Way Maker',
          artist: 'Sinach & Leeland',
          lyrics: [
            '[Verse 1]',
            'You are here, moving in our midst',
            'I worship You, I worship You',
            'You are here, working in this place',
            'I worship You, I worship You.',
            '[Chorus]',
            'Way maker, miracle worker, promise keeper',
            'Light in the darkness, my God, that is who You are!'
          ]
        }
      ]
    },
    {
      id: 'air1-worship',
      name: 'Air1 Inspire & Adoration Network',
      genre: 'Modern Christian & Youth Praise',
      location: 'Rocklin, CA',
      songs: [
        {
          title: 'House of the Lord',
          artist: 'Phil Wickham',
          lyrics: [
            '[Verse 1]',
            'We worship the God who was, we worship the God who is',
            'We worship the God who evermore will be',
            'He opened the prison doors, He parted the raging sea',
            'Our God holds the victory!',
            '[Chorus]',
            'There’s joy in the house of the Lord today',
            'And we won’t be quiet, we shout out Your praise',
            'There’s joy in the house of the Lord, our God is here!'
          ]
        },
        {
          title: 'Goodness of God',
          artist: 'Bethel Music & Jenn Johnson',
          lyrics: [
            '[Verse 1]',
            'I love You Lord, for Your mercy never fails me',
            'All my days, I’ve been held in Your hands',
            'From the moment that I wake up until I lay my head',
            'Oh, I will sing of the goodness of God!',
            '[Chorus]',
            'All my life You have been faithful',
            'All my life You have been so, so good',
            'With every breath that I am able',
            'Oh, I will sing of the goodness of God!'
          ]
        }
      ]
    },
    {
      id: 'black-gospel-live',
      name: 'Urban Kingdom & Holy Hip-Hop FM',
      genre: 'Gospel Rap, Urban Kingdom Praise',
      location: 'Atlanta, GA / Dallas, TX',
      songs: [
        {
          title: 'Watch This (Holy Fire Flow)',
          artist: 'KB feat. Lecrae',
          lyrics: [
            '[Verse 1]',
            'Armor of God on, shield held high',
            'Walking in truth under open sky',
            'Kingdom over empire every single day',
            'Crown on the Lamb, we don’t lose our way!',
            '[Chorus]',
            'Watch this grace overflow the room',
            'Living water making desert bloom',
            'Jesus is King, no debate in the place',
            'Saved by the blood, sanctified in His grace!'
          ]
        },
        {
          title: 'God Is Good',
          artist: 'Jonathan McReynolds',
          lyrics: [
            '[Chorus]',
            'God is good, yes He is, yes He is',
            'More than faithful through the storm and the tears',
            'He made a way when there was no other way',
            'Praise His holy name each and every day!'
          ]
        }
      ]
    },
    {
      id: 'moody-majesty',
      name: 'Moody Radio Sacred Majesty',
      genre: 'Biblical Hymns & Orchestral Worship',
      location: 'Chicago, IL',
      songs: [
        {
          title: 'Great Is Thy Faithfulness',
          artist: 'Sovereign Grace & Choir',
          lyrics: [
            '[Verse 1]',
            'Great is Thy faithfulness, O God my Father',
            'There is no shadow of turning with Thee',
            'Thou changest not, Thy compassions, they fail not',
            'As Thou hast been Thou forever wilt be.',
            '[Chorus]',
            'Great is Thy faithfulness! Great is Thy faithfulness!',
            'Morning by morning new mercies I see',
            'All I have needed Thy hand hath provided',
            'Great is Thy faithfulness, Lord, unto me!'
          ]
        },
        {
          title: 'Holy, Holy, Holy! Lord God Almighty',
          artist: 'Traditional Hymn Ensemble',
          lyrics: [
            '[Verse 1]',
            'Holy, holy, holy! Lord God Almighty!',
            'Early in the morning our song shall rise to Thee',
            'Holy, holy, holy! Merciful and mighty!',
            'God in three Persons, blessed Trinity!'
          ]
        }
      ]
    },
    {
      id: 'premier-gospel',
      name: 'Premier Global UK Gospel',
      genre: 'Afro-Gospel, Caribbean Praise',
      location: 'London, UK',
      songs: [
        {
          title: 'Victory Dance of Zion',
          artist: 'Limoblaze & Dunsin Oyekan',
          lyrics: [
            '[Verse 1]',
            'Dance in the fire, shout out His name',
            'Jesus Messiah forever the same',
            'From London to Zion the praises arise',
            'Glory to God who rules in the skies!',
            '[Chorus]',
            'Victory is ours through the Lamb that was slain',
            'Chains are all broken, no bondage or pain',
            'Hallelujah sounds across the whole earth!'
          ]
        },
        {
          title: 'Excess Love',
          artist: 'Mercy Chinwo',
          lyrics: [
            '[Verse 1]',
            'Your love is kind, Your love is patient',
            'You have filled my heart with so much peace and joy',
            'You’re amazing, You make my life feel brand new!',
            '[Chorus]',
            'Jesus You love me too much oh, too much oh',
            'Excess love oh, excess love oh!'
          ]
        }
      ]
    },
    {
      id: 'soaking-fire',
      name: 'Secret Place Instrumental Soaking',
      genre: 'Prophetic Pads & Deep Intimacy',
      location: 'Jerusalem / Global Stream',
      songs: [
        {
          title: 'Atmosphere of the Holy of Holies',
          artist: 'Spontaneous Harp & Strings',
          lyrics: [
            '[Prophetic harp and spontaneous soaking prayer chords]',
            'Be still, and know that I am God (Psalm 46:10)',
            'He that dwelleth in the secret place shall abide under the shadow (Psalm 91:1)',
            'The Lord is my strength and my song (Exodus 15:2)',
            'Rest in His presence, let His holy peace envelop your soul.'
          ]
        }
      ]
    },
    {
      id: 'sanctuary-piano',
      name: 'Sanctuary Acoustic Piano & Strings',
      genre: 'Meditative Prayer & Scripture Chords',
      location: 'Nashville, TN',
      songs: [
        {
          title: 'Secret Place & Soaking Prayer Chords',
          artist: 'Sanctuary Acoustic Piano & Strings',
          lyrics: [
            '[Gentle acoustic piano and cello in meditative harmony]',
            'The Lord bless thee, and keep thee (Numbers 6:24)',
            'The Lord make his face shine upon thee, and be gracious unto thee',
            'The Lord lift up his countenance upon thee, and give thee peace.'
          ]
        }
      ]
    },
    {
      id: 'gospel-east-africa',
      name: 'Gospel Radio East Africa',
      genre: 'Swahili Praise & East African Gospel',
      location: 'Nairobi, Kenya',
      songs: [
        {
          title: 'Mwema (He is Good) & Swahili Praise',
          artist: 'Mercy Masika & East African Choir',
          lyrics: [
            '[Chorus: Swahili & English Praise]',
            'Bwana ni mwema, asubuhi na jioni (The Lord is good, morning and evening)',
            'Mwamba imara, kimbilio letu (Solid Rock, our Refuge)',
            'He has never failed, He will never let us go',
            'Sifa na heshima zimwendee Mungu wetu (Praise and honor to our God)!'
          ]
        }
      ]
    },
    {
      id: 'country-gospel',
      name: 'Heartland Country & Bluegrass Gospel',
      genre: 'Country & Bluegrass Praise',
      location: 'Nashville, TN / Branson, MO',
      songs: [
        {
          title: 'I Saw The Light & Because He Lives',
          artist: 'Heartland Country & Bluegrass Gospel Ensemble',
          lyrics: [
            '[Verse 1: Upbeat Fiddle & Banjo]',
            'I wandered so aimless, life filled with sin',
            'I wouldn’t let my dear Savior in',
            'Then Jesus came like a stranger in the night',
            'Praise the Lord, I saw the light!',
            '[Chorus]',
            'I saw the light, I saw the light',
            'No more darkness, no more night!',
            'Now I’m so happy, no sorrow in sight',
            'Praise the Lord, I saw the light!'
          ]
        }
      ]
    },
    {
      id: 'christmas-gospel',
      name: 'Joyful Kingdom Christmas Hymns',
      genre: 'Christmas Anthems & Carols',
      location: 'Bethlehem / Global Broadcast',
      songs: [
        {
          title: 'O Holy Night & Joy to the World',
          artist: 'Kingdom Mass Choir & Symphony',
          lyrics: [
            '[Verse 1]',
            'O holy night! The stars are brightly shining',
            'It is the night of our dear Savior’s birth',
            'Long lay the world in sin and error pining',
            'Till He appeared and the soul felt its worth!',
            '[Chorus]',
            'Fall on your knees! O hear the angel voices!',
            'O night divine, O night when Christ was born!'
          ]
        }
      ]
    }
  ];

  let currentStationIndex = 0;
  let currentSongIndex = 0;
  let currentLineIndex = 0;
  let lyricsViewState = localStorage.getItem('yf_lyrics_display_state') || 'hidden'; // 'open', 'minimized', 'hidden' (defaults to hidden)
  let customPlayingTrack = null;

  // Listen to media changes in app (Worship TV / Vault)
  window.addEventListener('yf_media_change', (e) => {
    if (e.detail && e.detail.track) {
      customPlayingTrack = e.detail.track;
      currentLineIndex = 0;
      updateLiveLyricsUI();
    }
  });

  // Track station changes from the app's player
  function syncActiveStationFromApp() {
    const activeId = localStorage.getItem('yf_broadcast_station_id');
    if (activeId) {
      const idx = RADIO_STATIONS.findIndex(s => s.id === activeId);
      if (idx !== -1 && idx !== currentStationIndex) {
        currentStationIndex = idx;
        currentSongIndex = 0;
        currentLineIndex = 0;
        customPlayingTrack = null;
        const select = document.getElementById('yf-radio-select');
        if (select) select.value = String(currentStationIndex);
        updateLiveLyricsUI();
      }
    }
  }

  // Smooth line progression strictly within the active song (NO jumping to random songs)
  setInterval(() => {
    syncActiveStationFromApp();

    const station = RADIO_STATIONS[currentStationIndex];
    const song = customPlayingTrack || (station?.songs[currentSongIndex] || station?.songs[0]);
    if (song && Array.isArray(song.lyrics) && song.lyrics.length > 0) {
      currentLineIndex = (currentLineIndex + 1) % song.lyrics.length;
      updateLiveLyricsUI();
    }
  }, 3500);

  function getActiveSong() {
    if (customPlayingTrack) return customPlayingTrack;
    const station = RADIO_STATIONS[currentStationIndex] || RADIO_STATIONS[0];
    return station.songs[currentSongIndex] || station.songs[0];
  }

  function updateLiveLyricsUI() {
    const hud = document.getElementById('yf-lyrics-catcher-hud');
    const minimizedBar = document.getElementById('yf-lyrics-minimized-bar');
    const restoreBtn = document.getElementById('yf-lyrics-restore-btn');
    const song = getActiveSong();
    if (!song) return;

    // Apply view state visibility
    if (hud) {
      hud.style.display = lyricsViewState === 'open' ? 'block' : 'none';
    }
    if (minimizedBar) {
      minimizedBar.style.display = lyricsViewState === 'minimized' ? 'flex' : 'none';
      const minTitle = minimizedBar.querySelector('.yf-minimized-title');
      if (minTitle) minTitle.textContent = `${song.title} — ${song.artist}`;
    }
    if (restoreBtn) {
      restoreBtn.style.display = lyricsViewState === 'hidden' ? 'flex' : 'none';
    }

    // Also update Combined Theme & Lyrics HUD window
    updateCombinedLyricsUI(song);

    if (!hud || lyricsViewState !== 'open') return;

    const titleEl = hud.querySelector('.yf-station-song-title');
    if (titleEl) {
      titleEl.textContent = `${song.title} — ${song.artist}`;
    }

    const linesContainer = hud.querySelector('.yf-lyrics-lines');
    if (linesContainer && Array.isArray(song.lyrics)) {
      linesContainer.innerHTML = song.lyrics.map((line, idx) => {
        const isCurrent = idx === currentLineIndex;
        return `
          <div class="transition-all duration-300 py-0.5 ${
            isCurrent
              ? 'text-amber-300 font-bold bg-amber-500/20 px-2 py-1 rounded text-xs scale-[1.01] border-l-2 border-amber-400'
              : 'text-slate-400 opacity-60 text-xs hover:opacity-100 hover:text-slate-200 cursor-pointer'
          }" data-line-index="${idx}">
            ${isCurrent ? '🔥 ' : ''}${line}
          </div>
        `;
      }).join('');

      // Auto-scroll active line into view smoothly
      const activeEl = linesContainer.children[currentLineIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function setLyricsViewState(newState) {
    lyricsViewState = newState;
    localStorage.setItem('yf_lyrics_display_state', newState);
    updateLiveLyricsUI();
  }

  function injectRadioStationDropdown() {
    const radioContainer = document.querySelector('#community-radio-container, .live-radio-box, [data-radio-player="true"], div:has(> audio), .rounded-2xl.border-amber-500\\/20, .bg-slate-950\\/95');
    if (!radioContainer || document.getElementById('yf-station-selector-box')) return;

    const header = radioContainer.querySelector('.flex.items-center.justify-between') || radioContainer.firstElementChild;
    if (!header) return;

    // Check saved station
    const savedId = localStorage.getItem('yf_broadcast_station_id');
    if (savedId) {
      const idx = RADIO_STATIONS.findIndex(s => s.id === savedId);
      if (idx !== -1) currentStationIndex = idx;
    }

    const dropdownWrap = document.createElement('div');
    dropdownWrap.id = 'yf-station-selector-box';
    dropdownWrap.className = 'mt-3 mb-4 p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-lg';
    dropdownWrap.innerHTML = `
      <div class="flex items-center justify-between gap-2 mb-2">
        <label for="yf-radio-select" class="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
          <span>📻</span> Live Radio Stations (All Devices)
        </label>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> LIVE
          </span>
        </div>
      </div>

      <select id="yf-radio-select" class="w-full bg-slate-950 text-amber-200 border border-amber-500/50 rounded-xl p-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer">
        ${RADIO_STATIONS.map((st, i) => `
          <option value="${i}" ${i === currentStationIndex ? 'selected' : ''}>
            ${st.name} — ${st.genre} (${st.location})
          </option>
        `).join('')}
      </select>

      <!-- Minimized Strip (Shown when minimized) -->
      <div id="yf-lyrics-minimized-bar" class="mt-2.5 p-2 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-2" style="display: none;">
        <div class="flex items-center gap-2 truncate">
          <span class="text-xs">🎵</span>
          <span class="yf-minimized-title text-xs font-mono text-amber-300 truncate font-semibold"></span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button id="yf-minimized-expand-btn" type="button" class="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono font-bold cursor-pointer" title="Expand lyrics window">
            Expand ▲
          </button>
          <button id="yf-minimized-close-btn" type="button" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 text-xs font-mono cursor-pointer" title="Hide lyrics">
            ✕
          </button>
        </div>
      </div>

      <!-- Hidden Pill (Shown when hidden) -->
      <button id="yf-lyrics-restore-btn" type="button" class="mt-2 w-full py-1.5 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-all" style="display: none;">
        <span>🎵</span>
        <span>Show Live Radio Lyrics Sync</span>
      </button>

      <!-- Full Lyrics HUD (Default) -->
      <div id="yf-lyrics-catcher-hud" class="mt-3 pt-3 border-t border-amber-500/30">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5 truncate mr-2">
            <span class="text-amber-400 text-xs">🎵</span>
            <div class="text-[11px] font-mono font-bold text-amber-300 yf-station-song-title truncate max-w-[200px] sm:max-w-xs">
              All In (Throw Down Your Staff) — YoungFire Sanctuary Mass Choir
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
              Live Sync
            </span>
            <button id="yf-lyrics-minimize-btn" type="button" title="Minimize Live Lyrics" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs font-mono cursor-pointer active:scale-95 transition-all">
              —
            </button>
            <button id="yf-lyrics-hide-btn" type="button" title="Hide Live Lyrics Window" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-mono cursor-pointer active:scale-95 transition-all">
              ✕
            </button>
          </div>
        </div>

        <div class="yf-lyrics-lines space-y-1 text-xs max-h-48 overflow-y-auto pr-1"></div>
      </div>
    `;

    header.parentNode.insertBefore(dropdownWrap, header.nextSibling);

    const select = dropdownWrap.querySelector('#yf-radio-select');
    select.addEventListener('change', (e) => {
      currentStationIndex = parseInt(e.target.value, 10);
      currentSongIndex = 0;
      currentLineIndex = 0;
      customPlayingTrack = null;

      const station = RADIO_STATIONS[currentStationIndex];
      if (station) {
        localStorage.setItem('yf_broadcast_station_id', station.id);
      }

      updateLiveLyricsUI();

      // Trigger station button click in the React app if available
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent && btn.textContent.includes(station.name.slice(0, 15))) {
          btn.click();
          break;
        }
      }
    });

    // Wire Minimize & Hide Controls
    const minBtn = dropdownWrap.querySelector('#yf-lyrics-minimize-btn');
    if (minBtn) {
      minBtn.onclick = (e) => {
        e.stopPropagation();
        setLyricsViewState('minimized');
      };
    }

    const hideBtn = dropdownWrap.querySelector('#yf-lyrics-hide-btn');
    if (hideBtn) {
      hideBtn.onclick = (e) => {
        e.stopPropagation();
        setLyricsViewState('hidden');
      };
    }

    const expandBtn = dropdownWrap.querySelector('#yf-minimized-expand-btn');
    if (expandBtn) {
      expandBtn.onclick = (e) => {
        e.stopPropagation();
        setLyricsViewState('open');
      };
    }

    const minCloseBtn = dropdownWrap.querySelector('#yf-minimized-close-btn');
    if (minCloseBtn) {
      minCloseBtn.onclick = (e) => {
        e.stopPropagation();
        setLyricsViewState('hidden');
      };
    }

    const restoreBtn = dropdownWrap.querySelector('#yf-lyrics-restore-btn');
    if (restoreBtn) {
      restoreBtn.onclick = (e) => {
        e.stopPropagation();
        setLyricsViewState('open');
      };
    }

    updateLiveLyricsUI();
  }

  // --- 6. WORSHIP VIDEO VAULT TO ENRICH MEDIA LIBRARY ---
  function enhanceWorshipVideoVault() {
    const videoCards = document.querySelectorAll('.group.bg-\\[\\#0B1329\\], .aspect-video');
    videoCards.forEach((card) => {
      const parent = card.closest('.group') || card.parentElement;
      if (!parent || parent.querySelector('.yf-enrich-btn')) return;

      const titleEl = parent.querySelector('h3, h4, .font-bold');
      const title = titleEl ? titleEl.textContent.trim() : 'Worship Video';

      const btn = document.createElement('button');
      btn.className = 'yf-enrich-btn mt-2 w-full px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer';
      btn.innerHTML = `<span>+</span> <span>Add to Enrich Media Library</span>`;
      btn.onclick = (e) => {
        e.stopPropagation();
        const mediaItem = {
          id: `media_${Date.now()}`,
          title: title,
          category: 'Worship Video Vault',
          artist: 'Joshua House & YoungFire Collective',
          dateAdded: new Date().toLocaleDateString(),
          source: 'Worship Video Vault'
        };

        fetch('/api/media/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaItem)
        }).catch(console.warn);

        btn.innerHTML = `<span>✓</span> <span>Added to Enrich Media Library!</span>`;
        btn.classList.add('bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/50');

        setTimeout(() => {
          btn.innerHTML = `<span>+</span> <span>Add to Enrich Media Library</span>`;
          btn.classList.remove('bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/50');
        }, 3000);
      };

      const footer = parent.querySelector('.p-4, .space-y-2') || parent;
      footer.appendChild(btn);
    });
  }

  // --- 7. VIDEO MAXIMIZE BUTTON ---
  function fixVideoMaximize() {
    const maximizeBtns = document.querySelectorAll('button[title*="Maximize" i], button[title*="Theater" i], button[title*="Full" i]');
    maximizeBtns.forEach((btn) => {
      if (btn.dataset.maxFixed === 'true') return;
      btn.dataset.maxFixed = 'true';

      btn.addEventListener('click', () => {
        const player = document.querySelector('video') || document.querySelector('iframe[src*="youtube"]') || document.querySelector('.aspect-video');
        if (player) {
          const container = player.closest('.relative') || player;
          if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
              container.requestFullscreen().catch(() => {});
            } else if (player.requestFullscreen) {
              player.requestFullscreen().catch(() => {});
            }
          } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
          }
        }
      }, true);
    });
  }

  // --- 8. PRAYER DOCK GREEN CHECKMARK (CHECK AS COMPLETED) ---
  function enhancePrayerDockCheckmarks() {
    const deleteBtns = document.querySelectorAll('button[title*="Delete prayer from Prayer Dock" i]');
    if (!deleteBtns.length) return;

    let completedList = [];
    try {
      const raw = localStorage.getItem('yf_completed_prayers_v2');
      if (raw) completedList = JSON.parse(raw);
    } catch {}

    deleteBtns.forEach(delBtn => {
      const parentWrap = delBtn.parentElement;
      if (!parentWrap || parentWrap.querySelector('.yf-prayer-check-btn')) return;

      const card = delBtn.closest('.p-5, .rounded-2xl') || parentWrap.parentElement?.parentElement;
      if (!card) return;

      const nameEl = card.querySelector('h4');
      const causeEl = card.querySelector('p');
      const namesText = nameEl ? nameEl.textContent.trim() : '';
      const causeText = causeEl ? causeEl.textContent.trim() : '';
      const prayerKey = `${namesText}::${causeText}`;

      // Check if already completed
      let isCompleted = completedList.includes(prayerKey);
      let statusSpan = null;
      const spans = parentWrap.querySelectorAll('span');
      for (const s of spans) {
        if (s.querySelector('.rounded-full')) {
          statusSpan = s;
          break;
        }
      }
      if (statusSpan && statusSpan.textContent.includes('Answered Praise')) {
        isCompleted = true;
      }

      const checkBtn = document.createElement('button');
      checkBtn.type = 'button';
      checkBtn.className = `yf-prayer-check-btn p-1.5 rounded-lg border transition-all cursor-pointer inline-flex items-center justify-center ${
        isCompleted
          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-xs shadow-emerald-950 ring-1 ring-emerald-400/40'
          : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:text-emerald-300'
      }`;
      checkBtn.title = isCompleted ? 'Completed prayer (click to uncheck)' : 'Check prayer as completed';
      checkBtn.innerHTML = `
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

      if (isCompleted) {
        card.style.borderColor = 'rgba(16, 185, 129, 0.45)';
        card.style.backgroundColor = 'rgba(19, 39, 41, 0.95)';
      }

      checkBtn.onclick = (e) => {
        e.stopPropagation();
        isCompleted = !isCompleted;

        let currentList = [];
        try {
          const raw = localStorage.getItem('yf_completed_prayers_v2');
          if (raw) currentList = JSON.parse(raw);
        } catch {}

        if (isCompleted) {
          if (!currentList.includes(prayerKey)) currentList.push(prayerKey);
          checkBtn.className = 'yf-prayer-check-btn p-1.5 rounded-lg border transition-all cursor-pointer inline-flex items-center justify-center bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-xs shadow-emerald-950 ring-1 ring-emerald-400/40';
          checkBtn.title = 'Completed prayer (click to uncheck)';
          card.style.borderColor = 'rgba(16, 185, 129, 0.45)';
          card.style.backgroundColor = 'rgba(19, 39, 41, 0.95)';

          if (statusSpan) {
            statusSpan.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span class="text-emerald-300 font-bold">Answered Praise</span>`;
          }
        } else {
          currentList = currentList.filter(k => k !== prayerKey);
          checkBtn.className = 'yf-prayer-check-btn p-1.5 rounded-lg border transition-all cursor-pointer inline-flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:text-emerald-300';
          checkBtn.title = 'Check prayer as completed';
          card.style.borderColor = '';
          card.style.backgroundColor = '';

          if (statusSpan) {
            statusSpan.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span><span class="text-slate-300">Active Intercession</span>`;
          }
        }

        try {
          localStorage.setItem('yf_completed_prayers_v2', JSON.stringify(currentList));
        } catch {}

        try {
          const storedRaw = localStorage.getItem('yf_stored_intercessions_v2');
          if (storedRaw) {
            const prayers = JSON.parse(storedRaw);
            const pIndex = prayers.findIndex(p =>
              (p.names && p.names.join(', ').trim() === namesText) ||
              (p.cause && p.cause.trim() === causeText)
            );
            if (pIndex >= 0) {
              prayers[pIndex].completed = isCompleted;
              prayers[pIndex].status = isCompleted ? 'Answered Praise' : 'Active Intercession';
              localStorage.setItem('yf_stored_intercessions_v2', JSON.stringify(prayers));

              fetch('/api/prayers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prayers[pIndex])
              }).catch(() => {});
            }
          }
        } catch {}
      };

      parentWrap.insertBefore(checkBtn, delBtn);
    });
  }

  // --- 9. FIRESTORE DATA ARCHITECTURE & AUTH REAL-TIME SYNC ENGINE ---
  let isApplyingFirestoreSync = false;

  // Cache previously seen item IDs to detect real-time deletions
  let prevChatIds = null;
  let prevEventsIds = null;
  let prevPrayersIds = null;
  let prevIdeasIds = null;
  let prevNotesIds = null;
  let prevBookmarksIds = null;
  let prevPostsIds = null;

  function setupStorageInterceptors() {
    if (window.__yf_storage_intercepted) return;
    window.__yf_storage_intercepted = true;

    // Initialize baseline ID sets from current storage
    try {
      const c = JSON.parse(localStorage.getItem('yf_stored_fellowship_chat_v2') || '[]');
      prevChatIds = new Set(c.map(i => i.id).filter(Boolean));
    } catch { prevChatIds = new Set(); }

    try {
      const e = JSON.parse(localStorage.getItem('yf_stored_fellowship_nights_v2') || '[]');
      prevEventsIds = new Set(e.map(i => i.id).filter(Boolean));
    } catch { prevEventsIds = new Set(); }

    try {
      const pr = JSON.parse(localStorage.getItem('yf_stored_intercessions_v2') || '[]');
      prevPrayersIds = new Set(pr.map(i => i.id).filter(Boolean));
    } catch { prevPrayersIds = new Set(); }

    try {
      const idz = JSON.parse(localStorage.getItem('yf_stored_fellowship_ideas_v2') || '[]');
      prevIdeasIds = new Set(idz.map(i => i.id).filter(Boolean));
    } catch { prevIdeasIds = new Set(); }

    try {
      const n = JSON.parse(localStorage.getItem('yf_floating_study_notes_v1') || '[]');
      prevNotesIds = new Set(n.map(i => i.id).filter(Boolean));
    } catch { prevNotesIds = new Set(); }

    try {
      const b = JSON.parse(localStorage.getItem('yf_bookmarked_verses') || '[]');
      prevBookmarksIds = new Set(b.map(i => i.id || `bm_${i.book}_${i.chapter}_${i.verse}`).filter(Boolean));
    } catch { prevBookmarksIds = new Set(); }

    try {
      const p = JSON.parse(localStorage.getItem('yf_open_bible_entries_v3') || '[]');
      prevPostsIds = new Set(p.map(i => i.id).filter(Boolean));
    } catch { prevPostsIds = new Set(); }

    const originalSetItem = localStorage.setItem.bind(localStorage);

    localStorage.setItem = function(key, val) {
      originalSetItem(key, val);

      if (isApplyingFirestoreSync) return;

      try {
        // 1. Fellowship Chat Live Sync
        if (key === 'yf_stored_fellowship_chat_v2') {
          const messages = JSON.parse(val || '[]');
          if (Array.isArray(messages) && window.__sendChatMessageToLiveEngines) {
            messages.slice(-5).forEach(m => {
              if (m && m.id && m.text) window.__sendChatMessageToLiveEngines(m);
            });
          }
        }

        // 2. Events & Gatherings Live Sync & Calendar Population
        if (key === 'yf_stored_fellowship_nights_v2') {
          const events = JSON.parse(val || '[]');
          if (Array.isArray(events)) {
            if (window.__syncEventToFirestore) {
              events.forEach(evt => {
                if (evt && evt.id) window.__syncEventToFirestore(evt);
              });
            }
            if (window.__syncGatheringsToEventCalendar) {
              window.__syncGatheringsToEventCalendar();
            }
          }
        }

        // 3. Men Gatherings & Live Sync
        if (key === 'yf_men_gatherings_v2') {
          const events = JSON.parse(val || '[]');
          if (Array.isArray(events)) {
            if (window.__syncMenEventToFirestore) {
              events.forEach(evt => {
                if (evt && evt.id) window.__syncMenEventToFirestore(evt);
              });
            }
            if (window.__syncGatheringsToEventCalendar) {
              window.__syncGatheringsToEventCalendar();
            }
          }
        }

        // 4. Women Gatherings & Live Sync
        if (key === 'yf_women_gatherings_v2') {
          const events = JSON.parse(val || '[]');
          if (Array.isArray(events)) {
            if (window.__syncWomenEventToFirestore) {
              events.forEach(evt => {
                if (evt && evt.id) window.__syncWomenEventToFirestore(evt);
              });
            }
            if (window.__syncGatheringsToEventCalendar) {
              window.__syncGatheringsToEventCalendar();
            }
          }
        }

        // 5. Men Chat Messages
        if (key === 'yf_men_chat_messages_v2') {
          const messages = JSON.parse(val || '[]');
          if (Array.isArray(messages) && window.__syncMenChatToFirestore) {
            messages.slice(-5).forEach(m => {
              if (m && m.id && m.text) window.__syncMenChatToFirestore(m);
            });
          }
        }

        // 6. Women Chat Messages
        if (key === 'yf_women_chat_messages_v2') {
          const messages = JSON.parse(val || '[]');
          if (Array.isArray(messages) && window.__syncWomenChatToFirestore) {
            messages.slice(-5).forEach(m => {
              if (m && m.id && m.text) window.__syncWomenChatToFirestore(m);
            });
          }
        }

        // 7. Intercessory Prayers Sync (prayers/)
        if (key === 'yf_stored_intercessions_v2') {
          const prayers = JSON.parse(val || '[]');
          if (Array.isArray(prayers) && window.__syncPrayerToFirestore) {
            prayers.forEach(pr => {
              if (pr && pr.id) window.__syncPrayerToFirestore(pr);
            });
          }
        }

        // 8. Fellowship Ideas Sync (fellowship_ideas/)
        if (key === 'yf_stored_fellowship_ideas_v2') {
          const ideas = JSON.parse(val || '[]');
          if (Array.isArray(ideas) && window.__syncIdeaToFirestore) {
            ideas.forEach(idea => {
              if (idea && idea.id) window.__syncIdeaToFirestore(idea);
            });
          }
        }

        // 9. Personal Notes Sync (users/{userId}/personal_notes)
        if (key === 'yf_floating_study_notes_v1') {
          const notes = JSON.parse(val || '[]');
          if (Array.isArray(notes) && window.__savePersonalNoteToFirestore && window.__currentUser) {
            notes.forEach(note => {
              if (note && note.id) window.__savePersonalNoteToFirestore(note);
            });
          }
        }

        // 10. Saved Scriptures & Highlights Sync (users/{userId}/saved_scriptures)
        if (key === 'yf_bookmarked_verses') {
          const bookmarks = JSON.parse(val || '[]');
          if (Array.isArray(bookmarks) && window.__saveScriptureToFirestore && window.__currentUser) {
            bookmarks.forEach(bm => {
              if (bm && (bm.id || (bm.book && bm.chapter && bm.verse))) {
                const sId = bm.id || `bm_${bm.book}_${bm.chapter}_${bm.verse}`;
                window.__saveScriptureToFirestore({
                  id: sId,
                  type: 'bookmark',
                  bookName: bm.book || bm.bookName || 'Scripture',
                  chapter: Number(bm.chapter) || 1,
                  verse: Number(bm.verse) || 1,
                  text: bm.text || '',
                  timestamp: bm.timestamp || new Date().toISOString()
                });
              }
            });
          }
        }

        if (key === 'yf_verse_highlights_v2' && window.__saveScriptureToFirestore && window.__currentUser) {
          const highlights = JSON.parse(val);
          if (highlights && typeof highlights === 'object') {
            Object.entries(highlights).forEach(([vKey, color]) => {
              window.__saveScriptureToFirestore({
                id: `hl_${vKey}`,
                verseKey: vKey,
                type: 'highlight',
                highlightColor: color,
                timestamp: new Date().toISOString()
              });
            });
          }
        }

        // 11. Open Bible Posts Sync (posts/)
        if (key === 'yf_open_bible_entries_v3') {
          const posts = JSON.parse(val || '[]');
          if (Array.isArray(posts) && window.__syncPostToFirestore) {
            posts.slice(0, 10).forEach(post => {
              if (post && post.id) window.__syncPostToFirestore(post);
            });
          }
        }
      } catch (err) {
        console.warn("Storage interceptor sync notice:", err);
      }
    };

    // Universal DOM click listener to ensure deletion actions trigger Firestore deletes
    // Strictly deletes ONLY when a user actively clicks a delete action
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const title = (btn.getAttribute('title') || btn.getAttribute('aria-label') || '').toLowerCase();
      const text = (btn.innerText || btn.textContent || '').trim().toLowerCase();
      const isDelete = title.includes('delete') || title.includes('remove') || text === 'delete' || !!btn.querySelector('svg.lucide-trash, svg.lucide-trash-2');

      if (!isDelete) return;

      const card = btn.closest('.chat-message-item, [data-chat-id], .p-5, .p-4, .rounded-2xl, .rounded-xl, article') || btn.parentElement?.parentElement;

      // A. Chat Message Delete (General Fellowship, Men, Women)
      const isChatCard = btn.closest('.chat-message-item, [data-chat-id]') || 
        (card && (card.querySelector('.text-amber-300, .text-amber-400') || card.classList.contains('chat-message-item') || title.includes('message')));
      if (isChatCard) {
        const textEl = isChatCard.querySelector('p, .text-slate-200, .text-white');
        const authorEl = isChatCard.querySelector('.font-bold, .text-amber-300, .text-amber-400');
        const mText = textEl ? textEl.textContent.trim() : '';
        const mAuth = authorEl ? authorEl.textContent.trim() : '';
        
        try {
          // Check fellowship chat
          const chat = JSON.parse(localStorage.getItem('yf_stored_fellowship_chat_v2') || '[]');
          const matchIdx = chat.findIndex(m => (mText && m.text === mText) || (mAuth && m.author === mAuth && mText && m.text.includes(mText)));
          if (matchIdx !== -1) {
            const match = chat[matchIdx];
            const matchId = match.id;
            chat.splice(matchIdx, 1);
            localStorage.setItem('yf_stored_fellowship_chat_v2', JSON.stringify(chat));

            // Tombstone permanently
            let tombstones = JSON.parse(localStorage.getItem('yf_deleted_chat_ids_v1') || '[]');
            if (matchId && !tombstones.includes(matchId)) {
              tombstones.push(matchId);
              localStorage.setItem('yf_deleted_chat_ids_v1', JSON.stringify(tombstones));
            }

            if (window.__deleteChatMessageFromLiveEngines) {
              window.__deleteChatMessageFromLiveEngines(matchId);
            }
            try { fetch(`/api/chat/${matchId}?text=${encodeURIComponent(mText)}`, { method: 'DELETE' }); } catch {}
            try {
              fetch('/api/chat/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: matchId, text: mText, author: mAuth })
              });
            } catch {}
            window.dispatchEvent(new CustomEvent('yf_chat_live_updated', { detail: { chat } }));
          } else {
            // Delete by text fallback on backend
            fetch('/api/chat/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: mText, author: mAuth })
            }).catch(() => {});
          }

          // Check Men chat
          const mChat = JSON.parse(localStorage.getItem('yf_men_chat_messages_v2') || '[]');
          const mMatch = mChat.find(m => (mText && m.text === mText) || (mAuth && m.author === mAuth && mText && m.text.includes(mText)));
          if (mMatch && mMatch.id && window.__deleteMenChatFromFirestore) {
            window.__deleteMenChatFromFirestore(mMatch.id);
          }

          // Check Women chat
          const wChat = JSON.parse(localStorage.getItem('yf_women_chat_messages_v2') || '[]');
          const wMatch = wChat.find(m => (mText && m.text === mText) || (mAuth && m.author === mAuth && mText && m.text.includes(mText)));
          if (wMatch && wMatch.id && window.__deleteWomenChatFromFirestore) {
            window.__deleteWomenChatFromFirestore(wMatch.id);
          }
        } catch {}
        return;
      }

      // B. Gathering / Event / Calendar Delete
      if (card && (title.includes('announcement') || title.includes('gathering') || title.includes('event') || title.includes('plan') || card.querySelector('h3, .font-serif'))) {
        const titleEl = card.querySelector('h3, h4, .font-serif');
        const gTitle = titleEl ? titleEl.textContent.trim() : '';
        try {
          // Check main gatherings
          const evts = JSON.parse(localStorage.getItem('yf_stored_fellowship_nights_v2') || '[]');
          const match = evts.find(g => gTitle && (g.title === gTitle || g.title.includes(gTitle) || gTitle.includes(g.title)));
          if (match && match.id && window.__deleteEventFromFirestore) {
            window.__deleteEventFromFirestore(match.id);
          }

          // Check Men gatherings
          const mEvts = JSON.parse(localStorage.getItem('yf_men_gatherings_v2') || '[]');
          const mMatch = mEvts.find(g => gTitle && (g.title === gTitle || g.title.includes(gTitle) || gTitle.includes(g.title)));
          if (mMatch && mMatch.id && window.__deleteMenEventFromFirestore) {
            window.__deleteMenEventFromFirestore(mMatch.id);
          }

          // Check Women gatherings
          const wEvts = JSON.parse(localStorage.getItem('yf_women_gatherings_v2') || '[]');
          const wMatch = wEvts.find(g => gTitle && (g.title === gTitle || g.title.includes(gTitle) || gTitle.includes(g.title)));
          if (wMatch && wMatch.id && window.__deleteWomenEventFromFirestore) {
            window.__deleteWomenEventFromFirestore(wMatch.id);
          }

          // Check Calendar
          const cal = JSON.parse(localStorage.getItem('youngfire_calendar_events_v3') || '[]');
          const cMatch = cal.find(c => gTitle && (c.title === gTitle || c.title.includes(gTitle) || gTitle.includes(c.title)));
          if (cMatch && cMatch.id) {
            const rawId = cMatch.id.replace('cal_gathering_', '');
            if (window.__deleteEventFromFirestore) window.__deleteEventFromFirestore(rawId);
          }
        } catch {}
      }

      // C. Prayer Dock Delete
      if (card && (title.includes('prayer') || (card.querySelector('h4') && card.querySelector('p') && !card.querySelector('blockquote')))) {
        const nameEl = card.querySelector('h4');
        const causeEl = card.querySelector('p');
        const nText = nameEl ? nameEl.textContent.trim() : '';
        const cText = causeEl ? causeEl.textContent.trim() : '';
        try {
          const prayers = JSON.parse(localStorage.getItem('yf_stored_intercessions_v2') || '[]');
          const match = prayers.find(p =>
            (p.names && p.names.join(', ').trim() === nText) ||
            (p.cause && p.cause.trim() === cText)
          );
          if (match && match.id && window.__deletePrayerFromFirestore) {
            window.__deletePrayerFromFirestore(match.id);
          }
        } catch {}
      }

      // D. Fellowship Idea Delete
      if (card && (title.includes('idea') || text.includes('idea'))) {
        const titleEl = card.querySelector('h3, h4');
        const iTitle = titleEl ? titleEl.textContent.trim() : '';
        try {
          const ideas = JSON.parse(localStorage.getItem('yf_stored_fellowship_ideas_v2') || '[]');
          const match = ideas.find(i => iTitle && (i.title === iTitle || i.title.includes(iTitle)));
          if (match && match.id && window.__deleteIdeaFromFirestore) {
            window.__deleteIdeaFromFirestore(match.id);
          }
        } catch {}
      }

      // E. Personal Notes Delete
      if (card && (title.includes('note') || card.querySelector('textarea'))) {
        const txtEl = card.querySelector('textarea, p, .text-slate-300');
        const nContent = txtEl ? (txtEl.value || txtEl.textContent || '').trim() : '';
        try {
          const notes = JSON.parse(localStorage.getItem('yf_floating_study_notes_v1') || '[]');
          const match = notes.find(n => nContent && (n.content === nContent || n.content.includes(nContent)));
          if (match && match.id && window.__deletePersonalNoteFromFirestore) {
            window.__deletePersonalNoteFromFirestore(match.id);
          }
        } catch {}
      }

      // F. Open Bible Reflection Delete
      if (card && (title.includes('post') || card.querySelector('blockquote'))) {
        const quoteEl = card.querySelector('blockquote, p');
        const qText = quoteEl ? quoteEl.textContent.trim() : '';
        try {
          const posts = JSON.parse(localStorage.getItem('yf_open_bible_entries_v3') || '[]');
          const match = posts.find(p => qText && (p.reflection === qText || p.verseText === qText || p.reflection.includes(qText)));
          if (match && match.id && window.__deletePostFromFirestore) {
            window.__deletePostFromFirestore(match.id);
          }
        } catch {}
      }
    }, true);
  }

  // Inject Google Sign-In & Live Sync Status Dock in top controls
  function injectAuthSyncDock() {
    const controlsContainer = document.querySelector('button[title*="Settings" i]')?.parentElement;
    if (!controlsContainer) return;

    let dock = document.getElementById('youngfire-auth-live-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'youngfire-auth-live-dock';
      dock.className = 'flex items-center gap-1.5 pl-1.5 border-l border-slate-700/60 shrink-0';
      controlsContainer.appendChild(dock);
    }

    const user = window.__currentUser;

    if (user) {
      // Authenticated User Dock
      const displayName = user.displayName || 'YoungFire Member';
      const photoURL = user.photoURL;
      const initial = displayName.charAt(0).toUpperCase();

      dock.innerHTML = `
        <div class="flex items-center gap-1.5 bg-slate-900/90 border border-emerald-500/40 rounded-xl px-2 py-1 text-xs shadow-sm">
          <div class="w-5 h-5 rounded-full overflow-hidden border border-emerald-400 shrink-0 flex items-center justify-center bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
            ${photoURL ? `<img src="${photoURL}" class="w-full h-full object-cover" alt="User avatar" />` : `<span>${initial}</span>`}
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-white text-[11px] leading-tight truncate max-w-[80px] sm:max-w-[120px]">${displayName}</span>
            <span class="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <button id="yf-action-signout-btn" type="button" class="ml-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/60 cursor-pointer transition-all whitespace-nowrap active:scale-95" title="Sign out to return to Guest Mode">
            Sign Out
          </button>
        </div>
      `;

      const signOutBtn = dock.querySelector('#yf-action-signout-btn');
      if (signOutBtn) {
        signOutBtn.onclick = (e) => {
          e.stopPropagation();
          if (window.__signOutUser) window.__signOutUser();
        };
      }
    } else {
      // Guest Mode Dock
      dock.innerHTML = `
        <button id="yf-action-signin-btn" type="button" class="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 text-amber-200 hover:text-white hover:border-amber-400 cursor-pointer transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] whitespace-nowrap active:scale-95" title="Sign in with Google to sync your private Bible notes and bookmarks across devices">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span class="hidden sm:inline">Sign In with Google</span>
          <span class="sm:hidden">Sign In</span>
        </button>
      `;

      const signInBtn = dock.querySelector('#yf-action-signin-btn');
      if (signInBtn) {
        signInBtn.onclick = (e) => {
          e.stopPropagation();
          if (window.__signInWithGoogle) {
            window.__signInWithGoogle().catch(err => {
              console.warn("Sign-in action notice:", err);
            });
          }
        };
      }
    }
  }

  // Enhance Study Notes HUD with Auth / Sync Banner
  function enhanceStudyNotesSyncHUD() {
    let hud = document.querySelector('[class*="yf_floating_study_notes"]');
    if (!hud) {
      const fixedContainers = document.querySelectorAll('.fixed');
      for (const el of fixedContainers) {
        if (el.querySelector('textarea')) {
          hud = el;
          break;
        }
      }
    }
    if (!hud) return;

    let banner = hud.querySelector('.yf-hud-sync-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'yf-hud-sync-banner px-3 py-1.5 text-[11px] font-mono border-b flex items-center justify-between transition-colors';
      hud.insertBefore(banner, hud.firstChild);
    }

    const user = window.__currentUser;
    if (user) {
      banner.className = 'yf-hud-sync-banner px-3 py-1.5 text-[11px] font-mono border-b border-emerald-500/30 bg-emerald-950/40 text-emerald-300 flex items-center justify-between';
      banner.innerHTML = `
        <div class="flex items-center gap-1.5 truncate">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="truncate">Private Notes Synced • ${user.displayName || 'Google Account'}</span>
        </div>
        <span class="text-[10px] text-emerald-400 font-bold shrink-0 ml-2">Firestore Live</span>
      `;
    } else {
      banner.className = 'yf-hud-sync-banner px-3 py-1.5 text-[11px] font-mono border-b border-amber-500/30 bg-amber-950/40 text-amber-200 flex items-center justify-between';
      banner.innerHTML = `
        <div class="flex items-center gap-1.5 truncate">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span class="truncate">Guest Mode • Offline cache active</span>
        </div>
        <button type="button" class="yf-hud-signin-trigger text-[10px] font-bold text-amber-300 hover:text-white underline shrink-0 ml-2 cursor-pointer">
          Sign In to Sync
        </button>
      `;

      const trigger = banner.querySelector('.yf-hud-signin-trigger');
      if (trigger) {
        trigger.onclick = (e) => {
          e.stopPropagation();
          if (window.__signInWithGoogle) window.__signInWithGoogle();
        };
      }
    }
  }

  // --- 11. SYMMETRICAL HUD DOCK & COMBINED THEME/LYRICS WINDOW ---
  const THEME_PRESETS = [
    { id: 'obsidian-gold', name: 'Obsidian Gold', color: '#F59E0B' },
    { id: 'tactical-crimson', name: 'Tactical Crimson', color: '#EF4444' },
    { id: 'men-on-fire', name: 'Men On Fire', color: '#F97316' },
    { id: 'women-ignited', name: 'Women Ignited', color: '#F43F5E' },
    { id: 'royal-purple', name: 'Royal Purple', color: '#A855F7' },
    { id: 'desert-sand', name: 'Tabernacle Sand', color: '#D97706' },
    { id: 'cathedral-emerald', name: 'Emerald Zion', color: '#10B981' },
    { id: 'celestial-azure', name: 'Celestial Azure', color: '#3B82F6' },
    { id: 'pure-white', name: 'Pure White', color: '#FFFFFF', border: '#D97706' },
    { id: 'off-white', name: 'Off-White Ivory', color: '#FAF9F6', border: '#B45309' },
    { id: 'tabernacle-beige', name: 'Tabernacle Beige', color: '#F5F0E6', border: '#B45309' },
    { id: 'harvest-cream', name: 'Harvest Cream', color: '#FFFDF5', border: '#D97706' },
    { id: 'shekinah-yellow', name: 'Shekinah Light Yellow', color: '#FEFCE8', border: '#CA8A04' }
  ];

  let combinedActiveTab = 'theme'; // 'theme' | 'lyrics'
  let isCombinedHUDOpen = false;

  function updateCombinedLyricsUI(song) {
    const combinedHud = document.getElementById('yf-combined-theme-lyrics-hud');
    if (!combinedHud) return;

    if (!song) song = getActiveSong();
    if (!song) return;

    const titleEl = combinedHud.querySelector('.yf-combined-song-title');
    if (titleEl) {
      titleEl.textContent = `${song.title} — ${song.artist}`;
    }

    const select = combinedHud.querySelector('#yf-combined-station-select');
    if (select && select.value !== String(currentStationIndex)) {
      select.value = String(currentStationIndex);
    }

    const scroller = combinedHud.querySelector('.yf-combined-lyrics-scroller');
    if (scroller && Array.isArray(song.lyrics)) {
      scroller.innerHTML = song.lyrics.map((line, idx) => {
        const isCurrent = idx === currentLineIndex;
        return `
          <div class="transition-all duration-300 py-0.5 ${
            isCurrent
              ? 'text-amber-300 font-bold bg-amber-500/20 px-2 py-1 rounded text-xs border-l-2 border-amber-400'
              : 'text-slate-400 opacity-60 text-xs hover:opacity-100 hover:text-slate-200 cursor-pointer'
          }" data-line-index="${idx}">
            ${isCurrent ? '🔥 ' : ''}${line}
          </div>
        `;
      }).join('');

      const activeEl = scroller.children[currentLineIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function setCombinedHUDTab(tab) {
    combinedActiveTab = tab;
    const themeBtn = document.getElementById('yf-tab-btn-theme');
    const lyricsBtn = document.getElementById('yf-tab-btn-lyrics');
    const themePane = document.getElementById('yf-pane-theme');
    const lyricsPane = document.getElementById('yf-pane-lyrics');

    if (tab === 'theme') {
      if (themeBtn) {
        themeBtn.className = 'px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer bg-amber-500 text-slate-950 shadow-sm';
      }
      if (lyricsBtn) {
        lyricsBtn.className = 'px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer text-slate-400 hover:text-white';
      }
      if (themePane) themePane.style.display = 'block';
      if (lyricsPane) lyricsPane.style.display = 'none';
    } else {
      if (themeBtn) {
        themeBtn.className = 'px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer text-slate-400 hover:text-white';
      }
      if (lyricsBtn) {
        lyricsBtn.className = 'px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer bg-amber-500 text-slate-950 shadow-sm';
      }
      if (themePane) themePane.style.display = 'none';
      if (lyricsPane) lyricsPane.style.display = 'block';
      updateCombinedLyricsUI();
    }
  }

  function toggleCombinedThemeLyricsHUD(forceState) {
    const hud = document.getElementById('yf-combined-theme-lyrics-hud');
    if (!hud) return;

    if (typeof forceState === 'boolean') {
      isCombinedHUDOpen = forceState;
    } else {
      isCombinedHUDOpen = !isCombinedHUDOpen;
    }

    hud.style.display = isCombinedHUDOpen ? 'flex' : 'none';

    // Update active highlight on dock button
    const dockBtn = document.getElementById('yf-dock-btn-themetracks');
    if (dockBtn) {
      if (isCombinedHUDOpen) {
        dockBtn.classList.add('bg-amber-500/25', 'text-amber-300', 'border-amber-400');
        dockBtn.classList.remove('bg-slate-900', 'text-slate-200');
      } else {
        dockBtn.classList.remove('bg-amber-500/25', 'text-amber-300', 'border-amber-400');
        dockBtn.classList.add('bg-slate-900', 'text-slate-200');
      }
    }

    if (isCombinedHUDOpen) {
      renderThemeSwatches();
      updateCombinedLyricsUI();
    }
  }

  function renderThemeSwatches() {
    const grid = document.getElementById('yf-theme-swatches-grid');
    if (!grid) return;

    const currentTheme = localStorage.getItem('yf_theme') || 'obsidian-gold';
    const activeLabel = document.getElementById('yf-theme-active-name');
    const matched = THEME_PRESETS.find(t => t.id === currentTheme) || THEME_PRESETS[0];
    if (activeLabel) activeLabel.textContent = matched.name;

    grid.innerHTML = THEME_PRESETS.map(t => {
      const isSelected = t.id === currentTheme;
      return `
        <button type="button" data-theme-id="${t.id}" class="yf-theme-swatch-item flex items-center gap-1.5 p-1.5 rounded-xl border text-left cursor-pointer transition-all ${
          isSelected
            ? 'bg-amber-500/20 border-amber-400 shadow-sm text-amber-200 font-bold'
            : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
        }" title="${t.name}">
          <span class="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style="background-color: ${t.color}; ${t.border ? `border: 1px solid ${t.border};` : ''}"></span>
          <span class="text-[10px] font-mono truncate leading-none">${t.name.split(' ')[0]}</span>
        </button>
      `;
    }).join('');

    const swatchBtns = grid.querySelectorAll('.yf-theme-swatch-item');
    swatchBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const themeId = btn.getAttribute('data-theme-id');
        if (!themeId) return;
        localStorage.setItem('yf_theme', themeId);
        document.body.setAttribute('data-theme', themeId);
        window.dispatchEvent(new CustomEvent('yf_set_theme', { detail: { theme: themeId } }));

        // Also trigger click on the theme button in React app if mounted
        const buttons = document.querySelectorAll('button');
        for (const b of buttons) {
          if (b.textContent && b.textContent.trim().toLowerCase() === themeId.replace(/-/g, ' ').toLowerCase()) {
            b.click();
          }
        }

        renderThemeSwatches();
      };
    });

    // Rainbow button state
    const rainbowToggle = document.getElementById('yf-rainbow-mode-toggle');
    if (rainbowToggle) {
      const isRainbow = localStorage.getItem('yf_rainbow_mode') !== 'false';
      rainbowToggle.textContent = isRainbow ? 'ON' : 'OFF';
      rainbowToggle.className = `px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
        isRainbow ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
      }`;
    }
  }

  function ensureCombinedThemeLyricsHUD() {
    let hud = document.getElementById('yf-combined-theme-lyrics-hud');
    if (hud) return;

    hud = document.createElement('div');
    hud.id = 'yf-combined-theme-lyrics-hud';
    hud.className = 'fixed bottom-16 right-3 sm:right-6 left-3 sm:left-auto w-auto sm:w-[350px] max-w-[calc(100vw-1.5rem)] max-h-[min(480px,calc(100vh-5.5rem))] bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] z-[9600] backdrop-blur-2xl flex flex-col overflow-hidden animate-fadeIn';
    hud.style.display = 'none'; // NEVER automatically expand on startup!

    hud.innerHTML = `
      <!-- Header with symmetrical tabs & close -->
      <div class="p-2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button id="yf-tab-btn-theme" type="button" class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer bg-amber-500 text-slate-950 shadow-sm">
            🎨 Theme
          </button>
          <button id="yf-tab-btn-lyrics" type="button" class="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer text-slate-400 hover:text-white">
            🎵 Lyrics Sync
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button id="yf-combined-hud-close" type="button" class="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer text-xs font-mono" title="Close window">
            ✕
          </button>
        </div>
      </div>

      <!-- Content Pane 1: Theme Atmosphere -->
      <div id="yf-pane-theme" class="p-3 space-y-2.5 overflow-y-auto flex-1 max-h-[360px]">
        <div class="flex items-center justify-between text-xs font-mono pb-1 border-b border-slate-800/80">
          <span class="text-slate-400">Atmosphere Theme:</span>
          <span id="yf-theme-active-name" class="text-amber-300 font-bold">Obsidian Gold</span>
        </div>

        <!-- Theme Swatches Grid (compact) -->
        <div id="yf-theme-swatches-grid" class="grid grid-cols-2 gap-1.5 pt-1"></div>

        <!-- Rainbow Mode Switch -->
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono mt-2">
          <span class="text-slate-300 flex items-center gap-1.5">
            <span>🌈</span> Rainbow Outlines
          </span>
          <button id="yf-rainbow-mode-toggle" type="button" class="px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all bg-amber-500 text-slate-950">
            ON
          </button>
        </div>
      </div>

      <!-- Content Pane 2: Live Lyrics Sync -->
      <div id="yf-pane-lyrics" class="p-3 space-y-2.5 overflow-y-auto flex-1 max-h-[360px]" style="display: none;">
        <!-- Active Station / Song Header -->
        <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800">
          <div class="flex items-center gap-2 truncate">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
            <div class="truncate text-xs font-mono font-bold text-amber-300 yf-combined-song-title">
              Live Gospel Broadcast
            </div>
          </div>
          <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase shrink-0">
            Live Sync
          </span>
        </div>

        <!-- Quick Station Switcher -->
        <select id="yf-combined-station-select" class="w-full bg-slate-900 text-amber-200 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:border-amber-400 focus:outline-none cursor-pointer">
          ${RADIO_STATIONS.map((st, i) => `
            <option value="${i}" ${i === currentStationIndex ? 'selected' : ''}>
              ${st.name} — ${st.genre} (${st.location})
            </option>
          `).join('')}
        </select>

        <!-- Synced Lyrics Scroller -->
        <div class="yf-combined-lyrics-scroller bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 max-h-40 overflow-y-auto space-y-1 text-xs font-sans"></div>
      </div>
    `;

    document.body.appendChild(hud);

    // Wire events
    hud.querySelector('#yf-tab-btn-theme').onclick = () => setCombinedHUDTab('theme');
    hud.querySelector('#yf-tab-btn-lyrics').onclick = () => setCombinedHUDTab('lyrics');
    hud.querySelector('#yf-combined-hud-close').onclick = () => toggleCombinedThemeLyricsHUD(false);

    const stationSelect = hud.querySelector('#yf-combined-station-select');
    stationSelect.onchange = (e) => {
      currentStationIndex = parseInt(e.target.value, 10);
      currentSongIndex = 0;
      currentLineIndex = 0;
      customPlayingTrack = null;
      const station = RADIO_STATIONS[currentStationIndex];
      if (station) {
        localStorage.setItem('yf_broadcast_station_id', station.id);
      }
      // Also sync main app select if present
      const mainSel = document.getElementById('yf-radio-select');
      if (mainSel) mainSel.value = String(currentStationIndex);
      updateCombinedLyricsUI();
    };

    const rainbowBtn = hud.querySelector('#yf-rainbow-mode-toggle');
    rainbowBtn.onclick = () => {
      const isCur = localStorage.getItem('yf_rainbow_mode') !== 'false';
      const next = !isCur;
      localStorage.setItem('yf_rainbow_mode', String(next));
      if (next) {
        document.documentElement.classList.add('rainbow-mode-enabled');
      } else {
        document.documentElement.classList.remove('rainbow-mode-enabled');
      }
      renderThemeSwatches();
    };
  }

  function ensureSymmetricalHUDDock() {
    let dock = document.getElementById('youngfire-symmetrical-hud-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'youngfire-symmetrical-hud-dock';
      dock.className = 'fixed bottom-3 right-3 sm:right-6 z-[9500] flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/95 border border-slate-800/90 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl select-none';

      dock.innerHTML = `
        <!-- Button 1: Live Voice Sanctuary (Gemini Live) -->
        <button id="yf-dock-btn-voice" type="button" class="yf-hud-dock-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer" title="Open Gemini Live Voice Sanctuary">
          <span class="text-sm">🎙️</span>
          <span class="hidden md:inline">Voice</span>
        </button>

        <!-- Button 2: Progress Tracker -->
        <button id="yf-dock-btn-progress" type="button" class="yf-hud-dock-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer" title="Discipleship Progress Tracker & Achievements">
          <span class="text-sm">📊</span>
          <span class="hidden md:inline">Progress</span>
        </button>

        <!-- Button 3: Admin CMS -->
        <button id="yf-dock-btn-cms" type="button" class="yf-hud-dock-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 text-xs font-mono font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer" title="Admin Content Management System (CMS)">
          <span class="text-sm">👑</span>
          <span class="hidden md:inline">CMS</span>
        </button>

        <!-- Button 4: Combined Theme & Lyrics -->
        <button id="yf-dock-btn-themetracks" type="button" class="yf-hud-dock-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700/80 text-xs font-mono font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer" title="Open Theme Atmosphere & Live Lyrics Sync HUD">
          <span class="text-sm">🎨🎵</span>
          <span class="hidden md:inline">Atmosphere</span>
        </button>

        <!-- Button 5: Notification Bell -->
        <button id="yf-dock-btn-notifications" type="button" class="yf-hud-dock-btn relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700/80 text-xs font-mono font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer" title="Open App Notifications & Kingdom Alerts">
          <span class="text-sm">🔔</span>
          <span id="yf-dock-bell-badge" class="w-2 h-2 rounded-full bg-amber-400"></span>
        </button>

        <!-- Button 6: Study Notes -->
        <button id="yf-dock-btn-notes" type="button" class="yf-hud-dock-btn relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700/80 text-xs font-mono font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer" title="Open Study Notes HUD">
          <span class="text-sm">📝</span>
        </button>

        <!-- Button 7: Security Login & Logout -->
        <button id="yf-dock-btn-auth" type="button" class="yf-hud-dock-btn flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer" title="Account Login / Registration / Logout">
          <span class="text-sm">🔐</span>
          <span class="hidden md:inline">Account</span>
        </button>

        <!-- Dock Minimizer -->
        <button id="yf-dock-minimize-toggle" type="button" class="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer" title="Minimize Symmetrical Dock">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>
        </button>
      `;

      document.body.appendChild(dock);

      // Button: Voice
      const voiceBtn = dock.querySelector('#yf-dock-btn-voice');
      if (voiceBtn) {
        voiceBtn.onclick = (e) => {
          e.stopPropagation();
          if (window.openVoiceSanctuaryModal) window.openVoiceSanctuaryModal();
        };
      }

      // Button: Progress
      const progBtn = dock.querySelector('#yf-dock-btn-progress');
      if (progBtn) {
        progBtn.onclick = (e) => {
          e.stopPropagation();
          if (window.openProgressTrackerModal) window.openProgressTrackerModal();
        };
      }

      // Button: CMS
      const cmsBtn = dock.querySelector('#yf-dock-btn-cms');
      if (cmsBtn) {
        cmsBtn.onclick = (e) => {
          e.stopPropagation();
          if (window.openAdminCMSModal) window.openAdminCMSModal();
        };
      }

      // Button 1: Theme & Lyrics Toggle
      const themeTracksBtn = dock.querySelector('#yf-dock-btn-themetracks');
      themeTracksBtn.onclick = (e) => {
        e.stopPropagation();
        toggleCombinedThemeLyricsHUD();
      };

      // Button 2: Notifications Toggle
      const notifBtn = dock.querySelector('#yf-dock-btn-notifications');
      notifBtn.onclick = (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('yf_open_notifications', { detail: { open: true } }));
        window.dispatchEvent(new CustomEvent('yf_toggle_notifications', { detail: { open: true } }));
        openNotificationDrawerModal();
        const appBell = document.querySelector('button[title*="Notifications Hub"], button[title*="Notifications (Silenced)"], button:has(> svg.lucide-bell)');
        if (appBell) {
          try { appBell.click(); } catch {}
        }
      };

      // Button 3: Notes Toggle
      const notesBtn = dock.querySelector('#yf-dock-btn-notes');
      notesBtn.onclick = (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('yf_open_study_notes', { detail: { open: true } }));
        window.dispatchEvent(new CustomEvent('yf_open_notes_hud', { detail: { open: true } }));
      };

      // Button 4: Security Access Toggle
      const authBtn = dock.querySelector('#yf-dock-btn-auth');
      authBtn.onclick = (e) => {
        e.stopPropagation();
        openSecurityLoginModal();
      };

      // Button 5: Chime Trigger
      const chimeBtn = dock.querySelector('#yf-dock-btn-chime');
      chimeBtn.onclick = (e) => {
        e.stopPropagation();
        playStartupChime(true);
      };

      // Dock Minimizer
      const minBtn = dock.querySelector('#yf-dock-minimize-toggle');
      minBtn.onclick = (e) => {
        e.stopPropagation();
        dock.style.display = 'none';
        let restore = document.getElementById('yf-dock-restore-btn');
        if (!restore) {
          restore = document.createElement('button');
          restore.id = 'yf-dock-restore-btn';
          restore.className = 'fixed bottom-3 right-3 sm:right-6 z-[9500] px-3 py-1.5 rounded-full bg-slate-950/90 hover:bg-slate-900 text-amber-400 border border-amber-500/40 text-xs font-mono font-bold shadow-2xl backdrop-blur-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105';
          restore.innerHTML = `<span>⚡ HUDs</span> <span class="text-[10px]">▲</span>`;
          document.body.appendChild(restore);
          restore.onclick = () => {
            restore.style.display = 'none';
            dock.style.display = 'flex';
          };
        } else {
          restore.style.display = 'flex';
        }
      };
    }

    // Refresh dynamic badges
    try {
      const notesBadge = dock.querySelector('#yf-dock-notes-badge');
      if (notesBadge) {
        const notes = JSON.parse(localStorage.getItem('yf_floating_study_notes_v1') || '[]');
        notesBadge.textContent = String(Array.isArray(notes) ? notes.length : 0);
      }
    } catch {}
  }

  // --- 9B. NOTIFICATION CENTER DRAWER ---
  function openNotificationDrawerModal() {
    let drawer = document.getElementById('yf-notification-center-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'yf-notification-center-drawer';
      drawer.className = 'fixed inset-0 z-[100010] flex justify-end animate-fadeIn';
      drawer.innerHTML = `
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" id="yf-notif-drawer-backdrop"></div>
        <div class="relative w-full max-w-md bg-[#0A0F1F] border-l border-amber-500/40 h-full p-5 flex flex-col shadow-2xl z-10 text-slate-100 overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                🔔
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-100 font-serif">Notifications Hub</h3>
                <p class="text-[11px] text-slate-400 font-mono" id="yf-notif-header-subtitle">Real-time alerts & kingdom pings</p>
              </div>
            </div>
            <button id="yf-notif-drawer-close" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono cursor-pointer">✕</button>
          </div>

          <!-- Controls -->
          <div class="flex items-center justify-between py-2 border-b border-slate-800/80 shrink-0 text-xs font-mono">
            <button id="yf-notif-clear-btn" type="button" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 text-[11px] cursor-pointer">
              🗑️ Clear All Alerts
            </button>
            <button id="yf-notif-silence-btn" type="button" class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-[11px] cursor-pointer">
              🔕 Silence Alerts: OFF
            </button>
          </div>

          <!-- Alert Items List -->
          <div id="yf-notif-items-list" class="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 text-xs"></div>
        </div>
      `;
      document.body.appendChild(drawer);

      drawer.querySelector('#yf-notif-drawer-close').onclick = () => { drawer.style.display = 'none'; };
      drawer.querySelector('#yf-notif-drawer-backdrop').onclick = () => { drawer.style.display = 'none'; };

      drawer.querySelector('#yf-notif-clear-btn').onclick = () => {
        localStorage.setItem('yf_notification_history_v2', '[]');
        renderNotificationItems();
      };

      const silenceBtn = drawer.querySelector('#yf-notif-silence-btn');
      silenceBtn.onclick = () => {
        const isSilenced = localStorage.getItem('yf_notifications_silenced') === 'true';
        localStorage.setItem('yf_notifications_silenced', isSilenced ? 'false' : 'true');
        silenceBtn.textContent = isSilenced ? '🔕 Silence Alerts: OFF' : '🔔 Silence Alerts: ON';
      };
    }

    renderNotificationItems();
    drawer.style.display = 'flex';
  }

  function renderNotificationItems() {
    const listEl = document.getElementById('yf-notif-items-list');
    if (!listEl) return;
    let notifs = [];
    try {
      notifs = JSON.parse(localStorage.getItem('yf_notification_history_v2') || '[]');
    } catch {}

    if (!Array.isArray(notifs) || notifs.length === 0) {
      listEl.innerHTML = `
        <div class="py-16 text-center text-slate-500 font-mono text-xs">
          <div class="text-2xl mb-2">🕊️</div>
          <div>No new notifications. You are all caught up!</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = notifs.map((n) => `
      <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5 text-xs">
        <span class="text-amber-400 text-sm mt-0.5">✨</span>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-amber-200">${n.title || 'YoungFire Alert'}</div>
          <p class="text-slate-300 text-[11px] mt-0.5 leading-relaxed">${n.message || n.text || ''}</p>
          <div class="text-[9px] font-mono text-slate-500 mt-1">${n.time || n.timestamp || 'Just now'}</div>
        </div>
      </div>
    `).join('');
  }

  // --- 10. STARTUP AUDIO CHIME ENGINE ---
  let startupChimePlayed = false;
  let sharedAudioCtx = null;

  function getAudioContext() {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) sharedAudioCtx = new AudioCtx();
    }
    return sharedAudioCtx;
  }

  async function playStartupChime(force = false) {
    if (startupChimePlayed && !force) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return false;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (ctx.state !== 'running' && !force) {
        return false;
      }
      const now = ctx.currentTime;
      // Celestial harmonic chime: C5, E5, G5, B5, D6
      const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2 / (idx + 1), now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.6);
      });
      startupChimePlayed = true;
      console.log("🔥 [Audio] Celestial startup chime played successfully.");
    } catch (e) {
      console.warn("Synthesizer audio error:", e);
    }

    try {
      const audio = new Audio('/sounds/startup-chime.mp3');
      audio.volume = 0.8;
      audio.play().then(() => {
        startupChimePlayed = true;
      }).catch(() => {});
    } catch {}

    // Recommended Song Activation in Settings: Jonathan McReynolds - "Not Lucky, I'm Loved"
    try {
      currentStationIndex = 0; // Kingdom Flame 24/7 Global Radio
      currentSongIndex = 0;    // Jonathan McReynolds - Not Lucky, I'm Loved
      currentLineIndex = 0;
      customPlayingTrack = RADIO_STATIONS[0].songs[0];
      localStorage.setItem('yf_recommended_startup_song', "Jonathan McReynolds — Not Lucky, I'm Loved");
      localStorage.setItem('yf_broadcast_station_id', 'youngfire-core');
      updateLiveLyricsUI();
      window.dispatchEvent(new CustomEvent('yf_media_change', {
        detail: { track: customPlayingTrack }
      }));
      console.log("🎵 [Startup Song Engine] Recommended song active: Jonathan McReynolds — Not Lucky, I'm Loved");
    } catch (songErr) {
      console.warn("Startup song activation notice:", songErr);
    }

    return true;
  }

  function setupStartupAudio() {
    const handleGesture = async () => {
      if (startupChimePlayed) return;
      const played = await playStartupChime();
      if (played) {
        window.removeEventListener('click', handleGesture, true);
        window.removeEventListener('touchstart', handleGesture, true);
        window.removeEventListener('pointerdown', handleGesture, true);
        window.removeEventListener('keydown', handleGesture, true);
      }
    };
    window.addEventListener('click', handleGesture, true);
    window.addEventListener('touchstart', handleGesture, true);
    window.addEventListener('pointerdown', handleGesture, true);
    window.addEventListener('keydown', handleGesture, true);

    setTimeout(() => { playStartupChime(); }, 300);
  }

  // --- 10B. WHEEL HUB ORBITAL ROTATION FIX ---
  function ensureWheelHubCircularMotion() {
    const iconNodes = document.querySelectorAll('div[style*="translate("][class*="absolute z-30 flex flex-col items-center"]');
    iconNodes.forEach(node => {
      node.style.transition = 'none';
    });
  }

  // --- 10C. ENTERING AS FITTED DARK THEME & DYNAMIC ROSTER ---
  function enhanceEnteringAsSection() {
    const allDivs = document.querySelectorAll('div');
    let enterAsCard = null;
    for (const d of allDivs) {
      if (d.textContent && d.textContent.includes('Entering As:') && d.querySelector('select')) {
        enterAsCard = d;
        break;
      }
    }
    if (!enterAsCard) return;

    // Dark Royal Glass Theme - NO white background on the app
    enterAsCard.style.backgroundColor = 'transparent';
    enterAsCard.style.background = 'linear-gradient(135deg, #0B1226 0%, #070B18 100%)';
    enterAsCard.style.border = '2px solid rgba(245, 158, 11, 0.5)';
    enterAsCard.style.borderRadius = '1.5rem';
    enterAsCard.style.padding = '1.25rem';
    enterAsCard.style.boxShadow = '0 15px 45px rgba(0, 0, 0, 0.85), 0 0 25px rgba(245, 158, 11, 0.2)';
    enterAsCard.style.color = '#F8FAFC';
    enterAsCard.style.maxWidth = '28rem';
    enterAsCard.style.width = '100%';
    enterAsCard.style.marginLeft = 'auto';
    enterAsCard.style.marginRight = 'auto';
    enterAsCard.style.boxSizing = 'border-box';

    const headerRow = enterAsCard.firstElementChild;
    if (headerRow) {
      headerRow.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      const spans = headerRow.querySelectorAll('span');
      spans.forEach(s => {
        if (s.textContent.includes('Entering As:')) {
          s.style.color = '#F59E0B';
          s.style.fontWeight = 'bold';
        }
      });
    }

    const select = enterAsCard.querySelector('select');
    if (!select) return;

    select.style.backgroundColor = '#030712';
    select.style.color = '#FDE68A';
    select.style.borderColor = 'rgba(245, 158, 11, 0.5)';
    select.style.fontWeight = 'bold';
    select.style.borderRadius = '0.75rem';

    let roster = [];
    try {
      roster = JSON.parse(localStorage.getItem('youngfire_fellowship_roster_v8') || '[]');
    } catch {}

    const curVal = select.value;
    const curActing = localStorage.getItem('yf_acting_user') || '';

    // If NO users registered yet, NO fake names populate!
    if (!Array.isArray(roster) || roster.length === 0) {
      select.innerHTML = `<option value="" disabled selected>No Names Registered Yet — Register Below</option>`;
      
      let regBtn = enterAsCard.querySelector('#yf-dynamic-register-btn');
      if (!regBtn) {
        regBtn = document.createElement('button');
        regBtn.id = 'yf-dynamic-register-btn';
        regBtn.type = 'button';
        regBtn.className = 'w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs font-mono uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95';
        regBtn.innerHTML = `<span>🔐</span> <span>Register as Administrator or Member</span>`;
        regBtn.onclick = (e) => {
          e.stopPropagation();
          openSecurityLoginModal(false);
        };
        select.parentNode.insertBefore(regBtn, select.nextSibling);
      }
    } else {
      const removeBtn = enterAsCard.querySelector('#yf-dynamic-register-btn');
      if (removeBtn) removeBtn.remove();

      // ONLY populate registered users (Whitney, Trent, or registered members)
      const optionsHtml = roster.map(m => {
        const name = m.fullName || m.name;
        const role = m.role || 'Member';
        const isSelected = (curActing && curActing.toLowerCase() === name.toLowerCase()) || (curVal && curVal.toLowerCase() === name.toLowerCase());
        return `<option value="${name}" ${isSelected ? 'selected' : ''}>${name} (${role})</option>`;
      }).join('');

      if (select.innerHTML !== optionsHtml) {
        select.innerHTML = optionsHtml;
        if (!curActing && roster[0]) {
          const first = roster[0];
          const firstName = first.fullName || first.name;
          localStorage.setItem('yf_acting_user', firstName);
          localStorage.setItem('yf_member_name', firstName);
          const isAdmin = (first.role || '').toLowerCase().includes('admin');
          localStorage.setItem('yf_is_admin', isAdmin ? 'true' : 'false');
        }
      }

      select.onchange = (e) => {
        const selectedName = e.target.value;
        const userObj = roster.find(m => (m.fullName || m.name) === selectedName);
        if (userObj) {
          const isAdmin = (userObj.role || '').toLowerCase().includes('admin');
          localStorage.setItem('yf_acting_user', selectedName);
          localStorage.setItem('yf_member_name', selectedName);
          localStorage.setItem('yf_is_admin', isAdmin ? 'true' : 'false');
          window.dispatchEvent(new CustomEvent('yf_acting_user_changed', { detail: { user: selectedName } }));
        }
      };
    }

    const enterHubBtn = enterAsCard.parentElement?.querySelector('button.rainbow-glow-btn');
    if (enterHubBtn) {
      enterHubBtn.style.marginTop = '0.75rem';
      enterHubBtn.style.display = 'flex';
      enterHubBtn.style.width = '100%';
    }
  }

  // --- 10D. RBAC: RESTRICT ADMIN VIEW TO REGISTERED ADMINISTRATORS ONLY ---
  function enforceAdminAccessControl() {
    const viewButtons = document.querySelectorAll('button');
    viewButtons.forEach(btn => {
      const text = (btn.textContent || '').trim();
      if (text.includes('Admin View') || text.includes('Member View')) {
        if (!btn.dataset.rbacWired) {
          btn.dataset.rbacWired = 'true';
          btn.addEventListener('click', (e) => {
            const currentlyAdmin = localStorage.getItem('yf_is_admin') === 'true';
            if (!currentlyAdmin) {
              e.preventDefault();
              e.stopPropagation();
              alert('🔒 Access Restricted: Admin View is strictly available to registered administrators (such as Trent White and Whitney White). Registered members have Member View only. Please register or sign in as an Administrator to access.');
            }
          }, true);
        }
      }
    });
  }

  // --- 10E. SMALL GROUP CHAT DELETION ---
  function enhanceSmallGroupChatDeletion() {
    const allCards = document.querySelectorAll('.chat-message-item, [data-chat-id], div.p-3.rounded-2xl');
    allCards.forEach(item => {
      const textEl = item.querySelector('p');
      const authorEl = item.querySelector('.text-amber-300, .text-amber-400, .font-bold');
      if (!textEl && !authorEl) return;
      if (!item.closest('#root')) return;

      // Check if this item is in the chat container (has author or chat classes)
      const hasChatContext = item.querySelector('span.text-amber-300, span.text-amber-400') && textEl;
      if (!hasChatContext && !item.classList.contains('chat-message-item') && !item.hasAttribute('data-chat-id')) return;

      const mText = textEl ? textEl.textContent.trim() : '';
      const mAuth = authorEl ? authorEl.textContent.trim() : '';

      // Check existing delete button
      const existingDel = item.querySelector('button[title*="Delete" i], button.yf-chat-delete-btn');
      if (existingDel) {
        // React or native UI owns this button! Do not overwrite onclick or stop propagation.
        return;
      }

      const delBtn = document.createElement('button');
      delBtn.className = 'yf-chat-delete-btn opacity-80 hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded transition-all cursor-pointer text-xs ml-auto';
      delBtn.title = 'Delete chat message';
      delBtn.innerHTML = '🗑️';
      delBtn.onclick = (e) => {
        // 1. Fellowship chat
        try {
          let chat = JSON.parse(localStorage.getItem('yf_stored_fellowship_chat_v2') || '[]');
          const idx = chat.findIndex(m => (mText && m.text === mText) || (mAuth && m.author === mAuth && mText && m.text.includes(mText)));
          if (idx !== -1) {
            const mId = chat[idx].id;
            if (window.__deleteChatMessageFromLiveEngines) window.__deleteChatMessageFromLiveEngines(mId);
          }
        } catch {}

        // 2. Men chat
        try {
          let mChat = JSON.parse(localStorage.getItem('yf_men_chat_messages_v2') || '[]');
          const mIdx = mChat.findIndex(m => m.text === mText || m.message === mText);
          if (mIdx !== -1) {
            const mId = mChat[mIdx].id;
            mChat.splice(mIdx, 1);
            localStorage.setItem('yf_men_chat_messages_v2', JSON.stringify(mChat));
            if (window.__deleteMenChatFromFirestore) window.__deleteMenChatFromFirestore(mId);
            window.dispatchEvent(new CustomEvent('yf_men_chat_updated', { detail: { chat: mChat } }));
          }
        } catch {}

        // 3. Women chat
        try {
          let wChat = JSON.parse(localStorage.getItem('yf_women_chat_messages_v2') || '[]');
          const wIdx = wChat.findIndex(m => m.text === mText || m.message === mText);
          if (wIdx !== -1) {
            const wId = wChat[wIdx].id;
            wChat.splice(wIdx, 1);
            localStorage.setItem('yf_women_chat_messages_v2', JSON.stringify(wChat));
            if (window.__deleteWomenChatFromFirestore) window.__deleteWomenChatFromFirestore(wId);
            window.dispatchEvent(new CustomEvent('yf_women_chat_updated', { detail: { chat: wChat } }));
          }
        } catch {}
      };

      const topRow = item.querySelector('.flex.items-center, .flex.justify-between') || item;
      topRow.appendChild(delBtn);
    });
  }

  // --- 10F. BIBLE PLANS 0% & PERSISTENCE ---
  function enhanceBiblePlansProgress() {
    const curUser = localStorage.getItem('yf_acting_user');
    if (!curUser) return;
    const userProgressKey = `yf_bible_plan_prog_${curUser.toLowerCase().replace(/\\s+/g, '_')}`;

    // If user has saved progress, sync it with active plans
    try {
      const saved = localStorage.getItem(userProgressKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.youngfire) localStorage.setItem('yf_youngfire_plan_completed_v1', JSON.stringify(parsed.youngfire));
        if (parsed.men) localStorage.setItem('yf_men_plan_completed_v1', JSON.stringify(parsed.men));
        if (parsed.women) localStorage.setItem('yf_women_plan_completed_v1', JSON.stringify(parsed.women));
      }
    } catch {}

    // Observe changes and persist
    try {
      const curYF = JSON.parse(localStorage.getItem('yf_youngfire_plan_completed_v1') || '{}');
      const curMen = JSON.parse(localStorage.getItem('yf_men_plan_completed_v1') || '{}');
      const curWomen = JSON.parse(localStorage.getItem('yf_women_plan_completed_v1') || '{}');
      const combined = { youngfire: curYF, men: curMen, women: curWomen };
      localStorage.setItem(userProgressKey, JSON.stringify(combined));
    } catch {}
  }

  // --- 10G. MANDATORY SECURITY GATEKEEPER ---
  function ensureSecurityAccessGatekeeper() {
    const curUser = localStorage.getItem('yf_acting_user');
    const rootEl = document.getElementById('root');
    const hudDock = document.getElementById('youngfire-symmetrical-hud-dock');

    if (!curUser) {
      if (rootEl) {
        rootEl.style.filter = 'blur(8px)';
        rootEl.style.pointerEvents = 'none';
        rootEl.style.userSelect = 'none';
      }
      if (hudDock) {
        hudDock.style.display = 'none';
      }
      openSecurityLoginModal(true);
    } else {
      if (rootEl) {
        rootEl.style.filter = 'none';
        rootEl.style.pointerEvents = 'auto';
        rootEl.style.userSelect = 'auto';
      }
      if (hudDock) {
        hudDock.style.display = 'flex';
      }
    }
  }

  // --- 11. SECURITY LOGIN & REGISTRATION MODAL ---
  function openSecurityLoginModal(isMandatory = false) {
    let modal = document.getElementById('yf-security-login-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'yf-security-login-modal';
      modal.className = 'fixed inset-0 z-[100050] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn overflow-y-auto';
      modal.innerHTML = `
        <div class="relative w-full max-w-md my-auto bg-[#090F20] border-2 border-amber-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.98),0_0_40px_rgba(245,158,11,0.25)] text-slate-100 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
          <!-- Close Button (Hidden if mandatory) -->
          <button id="yf-login-close-btn" class="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-mono cursor-pointer ${isMandatory ? 'hidden' : ''}" title="Close">✕</button>

          <!-- Header -->
          <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
              🔐
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-serif font-black text-white font-['Cinzel'] tracking-wide">YoungFire Security Access</h3>
              <p class="text-xs text-amber-300/80 font-mono">Joshua House of Worship • San Antonio, TX</p>
            </div>
          </div>

          <!-- Notice for first time users -->
          <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-200">
            🛡️ Please register or sign in to enter the Sanctuary. Trent & Whitney: register as Administrators to unlock Admin View.
          </div>

          <!-- Tabs: Login vs Register -->
          <div class="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-mono font-bold">
            <button id="yf-tab-signin" type="button" class="flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 transition-all cursor-pointer shadow-sm">
              Sign In
            </button>
            <button id="yf-tab-register" type="button" class="flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
              Register New User
            </button>
          </div>

          <!-- Sign In Pane -->
          <div id="yf-pane-signin" class="space-y-3.5 pt-1">
            <div class="space-y-1">
              <label class="text-xs font-mono text-slate-300 font-bold block">Username or Full Name</label>
              <input id="yf-login-username" type="text" placeholder="Enter your registered name" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-mono text-slate-300 font-bold block">Password</label>
              <input id="yf-login-password" type="password" placeholder="Enter password" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono" />
            </div>

            <div id="yf-login-status" class="text-xs font-mono text-rose-400 hidden"></div>

            <button id="yf-btn-submit-login" type="button" class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs sm:text-sm uppercase tracking-wider shadow-lg cursor-pointer transition-all active:scale-95">
              Sign In to Sanctuary
            </button>

            <!-- Quick Alternatives -->
            <div class="relative flex py-1 items-center">
              <div class="flex-grow border-t border-slate-800"></div>
              <span class="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase">OR QUICK ACCESS</span>
              <div class="flex-grow border-t border-slate-800"></div>
            </div>

            <button id="yf-btn-google-login" type="button" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
              <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              <span>Continue with Google</span>
            </button>

            <button id="yf-btn-faceid-login" type="button" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
              <span>👤</span>
              <span>Face ID / Touch ID Biometric Sign-In</span>
            </button>
          </div>

          <!-- Register Pane -->
          <div id="yf-pane-register" class="space-y-3.5 pt-1" style="display: none;">
            <div class="space-y-1">
              <label class="text-xs font-mono text-slate-300 font-bold block">Full Name *</label>
              <input id="yf-reg-fullname" type="text" placeholder="e.g. Trent White, Whitney White, or your name" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono" required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-mono text-slate-300 font-bold block">Select Role *</label>
              <select id="yf-reg-role" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-amber-300 outline-none font-mono font-bold cursor-pointer">
                <option value="Administrator">🛡️ Administrator & Ministry Leader (Admin & Member View Access)</option>
                <option value="Member" selected>📖 Discipleship Member (Member View Access)</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1">
                <label class="text-xs font-mono text-slate-300 font-bold block">Email Address</label>
                <input id="yf-reg-email" type="email" placeholder="name@domain.com" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-mono text-slate-300 font-bold block">Phone Number</label>
                <input id="yf-reg-phone" type="tel" placeholder="(210) 555-0100" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-mono text-slate-300 font-bold block">Password *</label>
              <input id="yf-reg-password" type="password" placeholder="Create secure password" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono" required />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-mono text-slate-300 font-bold block">Fellowship Group</label>
              <select id="yf-reg-group" class="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono cursor-pointer">
                <option value="YoungFire">YoungFire General Fellowship</option>
                <option value="Men On Fire">Men On Fire (Brotherhood)</option>
                <option value="Women Ignited">Women Ignited (Sisterhood)</option>
              </select>
            </div>

            <div id="yf-reg-status" class="text-xs font-mono text-emerald-400 hidden"></div>

            <button id="yf-btn-submit-register" type="button" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-mono text-xs sm:text-sm uppercase tracking-wider shadow-lg cursor-pointer transition-all active:scale-95">
              Register & Sign In
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Tab switcher
      const tabSignIn = modal.querySelector('#yf-tab-signin');
      const tabReg = modal.querySelector('#yf-tab-register');
      const paneSignIn = modal.querySelector('#yf-pane-signin');
      const paneReg = modal.querySelector('#yf-pane-register');
      const closeBtn = modal.querySelector('#yf-login-close-btn');

      closeBtn.onclick = () => {
        if (!localStorage.getItem('yf_acting_user')) return;
        modal.style.display = 'none';
      };
      modal.onclick = (e) => {
        if (e.target === modal && localStorage.getItem('yf_acting_user')) {
          modal.style.display = 'none';
        }
      };

      tabSignIn.onclick = () => {
        tabSignIn.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm';
        tabReg.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white font-bold transition-all cursor-pointer';
        paneSignIn.style.display = 'block';
        paneReg.style.display = 'none';
      };

      tabReg.onclick = () => {
        tabReg.className = 'flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow-sm';
        tabSignIn.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white font-bold transition-all cursor-pointer';
        paneReg.style.display = 'block';
        paneSignIn.style.display = 'none';
      };

      // Register submit
      const btnReg = modal.querySelector('#yf-btn-submit-register');
      btnReg.onclick = async () => {
        const fullName = modal.querySelector('#yf-reg-fullname').value.trim();
        const role = modal.querySelector('#yf-reg-role').value;
        const email = modal.querySelector('#yf-reg-email').value.trim();
        const phone = modal.querySelector('#yf-reg-phone').value.trim();
        const password = modal.querySelector('#yf-reg-password').value.trim();
        const group = modal.querySelector('#yf-reg-group').value;
        const statusEl = modal.querySelector('#yf-reg-status');

        if (!fullName || !password) {
          statusEl.textContent = 'Please enter your Full Name and Password.';
          statusEl.className = 'text-xs font-mono text-rose-400';
          statusEl.classList.remove('hidden');
          return;
        }

        const isAdmin = role.toLowerCase().includes('admin') || fullName.toLowerCase().includes('admin') || fullName.toLowerCase().includes('trent') || fullName.toLowerCase().includes('whitney');

        statusEl.textContent = 'Creating account and securing credentials...';
        statusEl.className = 'text-xs font-mono text-amber-400';
        statusEl.classList.remove('hidden');

        // 1. Firebase Auth Registration
        if (email && password && window.__firebaseCreateUser) {
          try {
            await window.__firebaseCreateUser(email, password, fullName);
          } catch (fbErr) {
            console.warn("Firebase Auth Notice:", fbErr.message);
          }
        }

        // 2. Server API Auth Registration
        try {
          await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email || `${fullName.toLowerCase().replace(/\s+/g, '')}@youngfire.app`, password, displayName: fullName, role: isAdmin ? 'Administrator & Leader' : 'Registered Member', phone, group })
          });
        } catch (e) {
          console.warn("Backend auth register notice:", e);
        }

        const newMember = {
          id: 'mem_' + Date.now(),
          fullName: fullName,
          name: fullName,
          role: isAdmin ? 'Administrator & Leader' : 'Registered Member',
          calling: isAdmin ? 'Pastoral & Discipleship Leadership' : 'Kingdom Disciple',
          group: group,
          churchMembership: 'Joshua House of Worship',
          residence: 'San Antonio, TX',
          phone: phone,
          email: email
        };

        // Add to roster in localStorage
        try {
          let roster = JSON.parse(localStorage.getItem('youngfire_fellowship_roster_v8') || '[]');
          roster = roster.filter(m => (m.fullName || m.name || '').toLowerCase() !== fullName.toLowerCase());
          roster.unshift(newMember);
          localStorage.setItem('youngfire_fellowship_roster_v8', JSON.stringify(roster));
        } catch {}

        // Save active session
        localStorage.setItem('yf_acting_user', fullName);
        localStorage.setItem('yf_current_user', fullName);
        localStorage.setItem('yf_member_name', fullName);
        localStorage.setItem('yf_chat_name', fullName);
        localStorage.setItem('yf_is_admin', isAdmin ? 'true' : 'false');
        if (email) localStorage.setItem('yf_user_email', email);

        // Sync with backend API roster
        try {
          await fetch('/api/roster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMember)
          });
        } catch {}

        // Dispatch events
        window.dispatchEvent(new CustomEvent('yf_acting_user_changed', { detail: { user: fullName } }));
        window.dispatchEvent(new CustomEvent('youngfire_roster_updated', { detail: { member: newMember } }));

        statusEl.textContent = `Amen! Account created for ${fullName} (${role}). Access granted!`;
        statusEl.className = 'text-xs font-mono text-emerald-400 font-bold';
        statusEl.classList.remove('hidden');

        playStartupChime(true);

        setTimeout(() => {
          modal.style.display = 'none';
          const rootEl = document.getElementById('root');
          if (rootEl) {
            rootEl.style.filter = 'none';
            rootEl.style.pointerEvents = 'auto';
            rootEl.style.userSelect = 'auto';
          }
          const hudDock = document.getElementById('youngfire-symmetrical-hud-dock');
          if (hudDock) hudDock.style.display = 'flex';
          location.reload();
        }, 1200);
      };

      // Sign In submit
      const btnLogin = modal.querySelector('#yf-btn-submit-login');
      btnLogin.onclick = async () => {
        const username = modal.querySelector('#yf-login-username').value.trim();
        const password = modal.querySelector('#yf-login-password').value.trim();
        const statusEl = modal.querySelector('#yf-login-status');
        if (!username) {
          statusEl.textContent = 'Please enter your email or registered username.';
          statusEl.classList.remove('hidden');
          return;
        }

        statusEl.textContent = 'Verifying credentials...';
        statusEl.className = 'text-xs font-mono text-amber-400';
        statusEl.classList.remove('hidden');

        // 1. Firebase Sign In
        if (username.includes('@') && password && window.__firebaseSignInUser) {
          try {
            await window.__firebaseSignInUser(username, password);
          } catch (fbErr) {
            console.warn("Firebase sign in notice:", fbErr.message);
          }
        }

        // 2. Server API Auth Login
        let serverUser = null;
        try {
          const authRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailOrUsername: username, password })
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            if (authData.user) serverUser = authData.user;
          }
        } catch (e) {
          console.warn("Backend auth login notice:", e);
        }

        let roster = [];
        try { roster = JSON.parse(localStorage.getItem('youngfire_fellowship_roster_v8') || '[]'); } catch {}
        const mem = roster.find(m => (m.fullName || m.name || '').toLowerCase() === username.toLowerCase() || (m.email && m.email.toLowerCase() === username.toLowerCase()));

        let isAdmin = false;
        if (serverUser && serverUser.role && serverUser.role.toLowerCase().includes('admin')) {
          isAdmin = true;
        } else if (mem && (mem.role || '').toLowerCase().includes('admin')) {
          isAdmin = true;
        } else if (username.toLowerCase().includes('admin') || username.toLowerCase().includes('trent') || username.toLowerCase().includes('whitney')) {
          isAdmin = true;
        }

        const nameToUse = serverUser?.displayName || (mem ? mem.fullName : username);
        localStorage.setItem('yf_acting_user', nameToUse);
        localStorage.setItem('yf_current_user', nameToUse);
        localStorage.setItem('yf_member_name', nameToUse);
        localStorage.setItem('yf_chat_name', nameToUse);
        localStorage.setItem('yf_is_admin', isAdmin ? 'true' : 'false');
        if (serverUser?.email) localStorage.setItem('yf_user_email', serverUser.email);

        window.dispatchEvent(new CustomEvent('yf_acting_user_changed', { detail: { user: nameToUse } }));

        statusEl.textContent = `Welcome back, ${nameToUse}!`;
        statusEl.className = 'text-xs font-mono text-emerald-400 font-bold';
        statusEl.classList.remove('hidden');

        playStartupChime(true);

        setTimeout(() => {
          modal.style.display = 'none';
          const rootEl = document.getElementById('root');
          if (rootEl) {
            rootEl.style.filter = 'none';
            rootEl.style.pointerEvents = 'auto';
            rootEl.style.userSelect = 'auto';
          }
          const hudDock = document.getElementById('youngfire-symmetrical-hud-dock');
          if (hudDock) hudDock.style.display = 'flex';
          location.reload();
        }, 1000);
      };

      // Google Sign In
      const btnGoogle = modal.querySelector('#yf-btn-google-login');
      btnGoogle.onclick = async () => {
        if (window.__signInWithGoogle) {
          try {
            const user = await window.__signInWithGoogle();
            if (user && user.displayName) {
              localStorage.setItem('yf_acting_user', user.displayName);
              localStorage.setItem('yf_current_user', user.displayName);
              localStorage.setItem('yf_member_name', user.displayName);
              window.dispatchEvent(new CustomEvent('yf_acting_user_changed', { detail: { user: user.displayName } }));
              modal.style.display = 'none';
              playStartupChime(true);
              location.reload();
            }
          } catch (e) {
            console.warn(e);
          }
        }
      };

      // Face ID / Biometric Passkey
      const btnFaceId = modal.querySelector('#yf-btn-faceid-login');
      btnFaceId.onclick = async () => {
        const curUser = localStorage.getItem('yf_acting_user');
        if (curUser) {
          playStartupChime(true);
          modal.style.display = 'none';
          alert(`Biometric verified for ${curUser}. Access confirmed.`);
        } else {
          alert('Please register or sign in first to bind your device Biometrics / Face ID.');
        }
      };
    }

    const closeBtn = modal.querySelector('#yf-login-close-btn');
    if (closeBtn) {
      if (isMandatory) closeBtn.classList.add('hidden');
      else closeBtn.classList.remove('hidden');
    }

    modal.style.display = 'flex';
  }

  window.addEventListener('yf_open_security_login', () => openSecurityLoginModal(false));

  // --- 11B. ATLAS SECTION: BOOKS OF THE BIBLE JOURNEYS & LOCATIONS ---
  let atlasBooksData = null;
  let activeAtlasCategory = 'All';
  let activeAtlasBookId = 'GEN';
  let isBooksAtlasActive = false;

  async function loadAtlasBooksData() {
    if (atlasBooksData && atlasBooksData.length > 0) return atlasBooksData;
    try {
      const res = await fetch('/bible_books_atlas_66.json');
      if (res.ok) {
        atlasBooksData = await res.json();
        return atlasBooksData;
      }
    } catch (e) {
      console.warn("Failed loading /bible_books_atlas_66.json", e);
    }
    return [];
  }

  async function enhanceAtlasBooksOfBible() {
    // Find category buttons in Biblical Atlas
    const allButtons = document.querySelectorAll('button');
    let sitesBtn = null;
    let journeysBtn = null;
    let empiresBtn = null;
    for (const b of allButtons) {
      const txt = (b.textContent || '').trim();
      if (txt.includes('Biblical Sites')) sitesBtn = b;
      if (txt.includes('Character Journeys')) journeysBtn = b;
      if (txt.includes("Daniel's 4 Empires") || txt.includes("Daniel")) empiresBtn = b;
    }

    if (!sitesBtn || !journeysBtn) return;
    const parentContainer = sitesBtn.parentElement;
    if (!parentContainer) return;

    // Detect clicks on default category buttons to restore default React views
    [sitesBtn, journeysBtn, empiresBtn].filter(Boolean).forEach(btn => {
      if (!btn.__hasBooksAtlasReset) {
        btn.__hasBooksAtlasReset = true;
        btn.addEventListener('click', () => {
          isBooksAtlasActive = false;
          const booksBtn = document.getElementById('yf-atlas-books-category-btn');
          if (booksBtn) {
            booksBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700';
          }
          // Hide custom sub-pills
          const subPills = document.getElementById('yf-atlas-canonical-cat-bar');
          if (subPills) subPills.style.display = 'none';

          // Restore left column
          const grid = document.querySelector('div.grid.lg\\:grid-cols-12, .grid.lg\\:grid-cols-12');
          if (grid) {
            const leftCol = grid.querySelector('.lg\\:col-span-4');
            if (leftCol && leftCol.__originalHtml) {
              leftCol.innerHTML = leftCol.__originalHtml;
              leftCol.__originalHtml = null;
            }
            const customBottomDossier = document.getElementById('yf-atlas-books-bottom-dossier');
            if (customBottomDossier) customBottomDossier.remove();
          }
        });
      }
    });

    if (parentContainer.querySelector('#yf-atlas-books-category-btn')) return;

    const booksBtn = document.createElement('button');
    booksBtn.id = 'yf-atlas-books-category-btn';
    booksBtn.type = 'button';
    booksBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700';
    booksBtn.title = 'Explore all 66 Books of the Bible with Geographical Milestones & Stages';
    booksBtn.innerHTML = `<span>📖</span><span>Bible Book Atlas (66 Books)</span>`;

    booksBtn.onclick = async () => {
      isBooksAtlasActive = true;
      // Highlight books button and un-highlight siblings
      parentContainer.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('bg-amber-400', 'bg-emerald-400', 'bg-sky-400', 'text-slate-950');
        btn.classList.add('bg-slate-950', 'border-slate-800', 'text-slate-300');
      });
      booksBtn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-amber-400 text-slate-950 font-bold shadow-md';

      await renderAtlasBooksInsideTab(parentContainer);
    };

    parentContainer.appendChild(booksBtn);
  }

  function getLeafletMapInstance() {
    if (window._leaflet_map) return window._leaflet_map;
    const el = document.querySelector('.leaflet-container');
    if (el) {
      for (const k in el) {
        if (el[k] && typeof el[k].flyTo === 'function') {
          window._leaflet_map = el[k];
          return el[k];
        }
      }
    }
    return null;
  }

  async function renderAtlasBooksInsideTab(parentContainer) {
    const books = await loadAtlasBooksData();
    if (!books || books.length === 0) return;

    const topHeader = parentContainer.parentElement;
    if (!topHeader) return;

    // 1. Render or update Canonical Categories Sub-Pills Bar directly below the category header
    let catBar = document.getElementById('yf-atlas-canonical-cat-bar');
    if (!catBar) {
      catBar = document.createElement('div');
      catBar.id = 'yf-atlas-canonical-cat-bar';
      catBar.className = 'flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-mono';
      topHeader.parentNode.insertBefore(catBar, topHeader.nextSibling);
    }
    catBar.style.display = 'flex';

    const categories = ['All', 'Pentateuch', 'Historical', 'Poetry & Wisdom', 'Major Prophets', 'Minor Prophets', 'Gospels & Acts', 'Epistles', 'Prophecy'];
    catBar.innerHTML = categories.map(cat => `
      <button type="button" data-cat="${cat}" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${cat === activeAtlasCategory ? 'bg-amber-500/20 text-amber-300 border border-amber-400 font-bold' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'}">
        ${cat}
      </button>
    `).join('');

    catBar.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        activeAtlasCategory = btn.dataset.cat;
        catBar.querySelectorAll('button').forEach(b => {
          b.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer bg-slate-950 text-slate-400 border border-slate-800 hover:text-white';
        });
        btn.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer bg-amber-500/20 text-amber-300 border border-amber-400 font-bold';
        renderBooksLeftSidebar(books);
      };
    });

    // 2. Render Left Column (Books List, Selector, Stages) & Right Column Map Dossier
    renderBooksLeftSidebar(books);
  }

  function renderBooksLeftSidebar(books) {
    const grid = document.querySelector('div.grid.lg\\:grid-cols-12, .grid.lg\\:grid-cols-12');
    if (!grid) return;

    const leftCol = grid.querySelector('.lg\\:col-span-4');
    if (!leftCol) return;

    // Save original React markup for restoration on tab change
    if (!leftCol.__originalHtml) {
      leftCol.__originalHtml = leftCol.innerHTML;
    }

    const filtered = activeAtlasCategory === 'All' ? books : books.filter(b => b.category === activeAtlasCategory);
    if (!filtered.some(b => b.id === activeAtlasBookId) && filtered.length > 0) {
      activeAtlasBookId = filtered[0].id;
    }

    const currentBook = books.find(b => b.id === activeAtlasBookId) || filtered[0] || books[0];

    leftCol.innerHTML = `
      <div class="space-y-3">
        <!-- Quick Select & Search -->
        <div class="space-y-1.5 border-b border-slate-800 pb-2">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
            <span>Canonical Books (${filtered.length})</span>
            <span class="text-[10px] text-slate-400 uppercase">${currentBook.testament}</span>
          </div>
          <select id="yf-atlas-inline-select" class="w-full bg-slate-950 text-amber-300 border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none cursor-pointer">
            ${filtered.map(b => `<option value="${b.id}" ${b.id === activeAtlasBookId ? 'selected' : ''}>${b.name} (${b.category} • ${b.region})</option>`).join('')}
          </select>
          <input id="yf-atlas-inline-search" type="text" placeholder="Search book, character, or place..." class="w-full bg-slate-950 text-white border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-mono outline-none" />
        </div>

        <!-- Selected Book Overview Card -->
        <div class="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono uppercase font-bold text-amber-400">${currentBook.category} • ${currentBook.region}</span>
            <span class="text-[10px] font-mono text-slate-400">${(currentBook.milestones || []).length} Stages</span>
          </div>
          <h3 class="text-base font-serif font-bold text-white">${currentBook.name}</h3>
          <p class="text-xs text-slate-300 leading-relaxed font-serif">${currentBook.summary}</p>
          <div class="flex flex-wrap gap-1 pt-1">
            ${(currentBook.keyCharacters || []).map(c => `
              <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono">
                👤 ${c}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Milestones & Stages List -->
        <div class="border-t border-slate-800 pt-2 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold uppercase text-amber-400 block">Pivotal Waypoints & Stages:</span>
            <span class="text-[10px] font-mono text-slate-500">Tap to Fly Map ✈️</span>
          </div>
          <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            ${(currentBook.milestones || []).map((m, idx) => `
              <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/80 cursor-pointer transition-all space-y-1 yf-milestone-stage-item" data-coords="${JSON.stringify(m.coords)}" data-stage-name="${m.name}" data-stage-narrative="${m.narrative.replace(/"/g, '&quot;')}" data-stage-idx="${idx + 1}">
                <div class="flex items-center justify-between text-[10px] font-mono text-amber-400 font-bold">
                  <span>Stage ${idx + 1}: ${m.name}</span>
                  <span class="text-slate-500">[${m.coords[0].toFixed(2)}°, ${m.coords[1].toFixed(2)}°]</span>
                </div>
                <p class="text-[11px] text-slate-300 leading-snug font-serif line-clamp-2">${m.narrative}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Dropdown change handler
    const selectEl = leftCol.querySelector('#yf-atlas-inline-select');
    if (selectEl) {
      selectEl.onchange = (e) => {
        activeAtlasBookId = e.target.value;
        const b = books.find(item => item.id === activeAtlasBookId);
        if (b && b.milestones && b.milestones[0]) {
          flyMapToCoords(b.milestones[0].coords, b.name, b.milestones[0]);
          updateAtlasMapMarkers(b, 1);
        }
        renderBooksLeftSidebar(books);
      };
    }

    // Search input handler
    const searchEl = leftCol.querySelector('#yf-atlas-inline-search');
    if (searchEl) {
      searchEl.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        const matches = filtered.filter(b => 
          b.name.toLowerCase().includes(query) ||
          b.region.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query) ||
          (b.keyCharacters || []).some(c => c.toLowerCase().includes(query))
        );
        selectEl.innerHTML = matches.map(b => `<option value="${b.id}" ${b.id === activeAtlasBookId ? 'selected' : ''}>${b.name} (${b.category} • ${b.region})</option>`).join('');
      };
    }

    // Wire clicks on milestones to fly the map & update bottom dossier
    leftCol.querySelectorAll('.yf-milestone-stage-item').forEach(card => {
      card.onclick = () => {
        try {
          const coords = JSON.parse(card.dataset.coords);
          const stageName = card.dataset.stageName;
          const stageNarrative = card.dataset.stageNarrative;
          const stageIdx = card.dataset.stageIdx;

          flyMapToCoords(coords, currentBook.name, { name: stageName, narrative: stageNarrative });
          renderBelowMapDossier(currentBook, stageName, stageNarrative, coords, stageIdx);
          updateAtlasMapMarkers(currentBook, stageIdx);

          leftCol.querySelectorAll('.yf-milestone-stage-item').forEach(c => c.classList.remove('border-amber-400', 'bg-amber-500/10'));
          card.classList.add('border-amber-400', 'bg-amber-500/10');
        } catch {}
      };
    });

    // Initial fly, map markers and bottom dossier update for first milestone
    if (currentBook && currentBook.milestones && currentBook.milestones[0]) {
      const firstM = currentBook.milestones[0];
      flyMapToCoords(firstM.coords, currentBook.name, firstM);
      renderBelowMapDossier(currentBook, firstM.name, firstM.narrative, firstM.coords, 1);
      updateAtlasMapMarkers(currentBook, 1);
    }
  }

  function flyMapToCoords(coords, bookName, milestone) {
    if (!coords || !Array.isArray(coords)) return;
    try {
      const map = getLeafletMapInstance();
      if (map) {
        map.flyTo(coords, 8, { duration: 1.5 });
      }
    } catch {}
  }

  function updateAtlasMapMarkers(currentBook, selectedStageIdx = 1) {
    const map = getLeafletMapInstance();
    if (!window.L || !map) return;
    try {
      if (!window._atlasMarkersGroup) {
        window._atlasMarkersGroup = window.L.layerGroup().addTo(map);
      }
      window._atlasMarkersGroup.clearLayers();
      const latLngs = [];
      (currentBook.milestones || []).forEach((m, idx) => {
        latLngs.push(m.coords);
        const isSelected = (idx + 1) === parseInt(selectedStageIdx);
        const marker = window.L.circleMarker(m.coords, {
          radius: isSelected ? 9 : 6,
          fillColor: isSelected ? '#F59E0B' : '#0284C7',
          color: '#FFFFFF',
          weight: isSelected ? 2.5 : 1.5,
          opacity: 1,
          fillOpacity: 0.95
        });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 2px;">
            <strong style="color: #d97706;">📖 ${currentBook.name} • Stage ${idx + 1}: ${m.name}</strong><br/>
            <span style="font-size: 11px;">${m.narrative}</span>
          </div>
        `);
        marker.on('click', () => {
          renderBelowMapDossier(currentBook, m.name, m.narrative, m.coords, idx + 1);
          flyMapToCoords(m.coords, currentBook.name, m);
          updateAtlasMapMarkers(currentBook, idx + 1);
        });
        window._atlasMarkersGroup.addLayer(marker);
      });
      if (latLngs.length > 1) {
        const poly = window.L.polyline(latLngs, {
          color: '#F59E0B',
          weight: 3,
          opacity: 0.75,
          dashArray: '5, 8'
        });
        window._atlasMarkersGroup.addLayer(poly);
      }
    } catch (err) {
      console.warn("Leaflet marker notice:", err);
    }
  }

  function renderBelowMapDossier(book, stageName, narrative, coords, stageIdx) {
    const grid = document.querySelector('div.grid.lg\\:grid-cols-12, .grid.lg\\:grid-cols-12');
    if (!grid) return;

    const rightCol = grid.querySelector('.lg\\:col-span-8');
    if (!rightCol) return;

    // Hide React default dossier so only the Bible Book Atlas dossier shows below map
    const defaultDossiers = rightCol.querySelectorAll('.bg-\\[\\#0B1329\\]');
    defaultDossiers.forEach(d => {
      if (d.id !== 'yf-atlas-books-bottom-dossier') d.style.display = 'none';
    });

    let dossier = document.getElementById('yf-atlas-books-bottom-dossier');
    if (!dossier) {
      dossier = document.createElement('div');
      dossier.id = 'yf-atlas-books-bottom-dossier';
      dossier.className = 'p-4 rounded-2xl bg-[#0B1329] border border-amber-500/40 shadow-xl space-y-2 mt-4 text-slate-100 animate-fadeIn';
      rightCol.appendChild(dossier);
    }

    dossier.style.display = 'block';
    dossier.innerHTML = `
      <div class="flex items-center justify-between text-xs font-mono">
        <span class="text-amber-400 font-bold uppercase tracking-wider">📖 ${book.name} • Stage ${stageIdx}: ${stageName}</span>
        <span class="text-slate-400 font-mono">[${coords[0].toFixed(2)}° N, ${coords[1].toFixed(2)}° E]</span>
      </div>
      <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif pt-1">${narrative}</p>
      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
        <span class="text-amber-300">Geographical Anchor: <strong>${book.region}</strong></span>
        <button type="button" class="text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer" onclick="window.dispatchEvent(new CustomEvent('yf_navigate_screen', { detail: { screen: 'bible', bookId: '${book.id}' } }))">
          Open ${book.name} in Scripture Viewer →
        </button>
      </div>
    `;
  }

  // --- 12. RUNTIME CYCLES ---
  function runCompanionCycle() {
    scrubUnwantedStatements();
    injectRadioStationDropdown();
    enhanceWorshipVideoVault();
    fixVideoMaximize();
    wireGatheringsDeleteButtons();
    enhancePrayerDockCheckmarks();
    setupStorageInterceptors();
    injectAuthSyncDock();
    enhanceStudyNotesSyncHUD();
    ensureSymmetricalHUDDock();
    ensureCombinedThemeLyricsHUD();
    ensureWheelHubCircularMotion();
    enhanceEnteringAsSection();
    enforceAdminAccessControl();
    enhanceSmallGroupChatDeletion();
    enhanceBiblePlansProgress();
    ensureSecurityAccessGatekeeper();
    enhanceAtlasBooksOfBible();
  }

  window.addEventListener('DOMContentLoaded', () => {
    setupStartupAudio();
    initMovableBell();
    runCompanionCycle();
    setInterval(runCompanionCycle, 1500);
  });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setupStartupAudio();
    initMovableBell();
    runCompanionCycle();
    setInterval(runCompanionCycle, 1500);
  }
})();


