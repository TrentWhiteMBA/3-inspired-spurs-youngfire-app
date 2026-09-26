export interface MediaVaultVideo {
  id: string;
  youtubeId: string;
  title: string;
  artist?: string;
  speaker?: string;
  category: string;
  duration: string;
  thematicFocus?: string;
  lyricsSnippet?: string;
  lyricsText?: string;
  isJhowOfficial?: boolean;
}

// Function to clean YouTube ID (strip &list=, ?si=, etc.) and extract canonical 11 chars
export const cleanYouTubeId = (urlOrId: string): string => {
  if (!urlOrId) return '';
  let id = urlOrId.trim();
  // Strip url parts if full url passed
  if (id.includes('v=')) {
    id = id.split('v=')[1]?.split('&')[0]?.split('?')[0] || id;
  } else if (id.includes('youtu.be/')) {
    id = id.split('youtu.be/')[1]?.split('&')[0]?.split('?')[0] || id;
  } else if (id.includes('embed/')) {
    id = id.split('embed/')[1]?.split('&')[0]?.split('?')[0] || id;
  }
  // Strip query params
  id = id.split('&')[0].split('?')[0];
  // Must be 11 characters
  return id.substring(0, 11);
};

export const getYouTubeThumbnail = (id: string, quality: 'hq' | 'mq' | 'default' = 'hq'): string => {
  const cleanId = cleanYouTubeId(id);
  if (!cleanId) return '/favicon.png';
  return `https://img.youtube.com/vi/${cleanId}/${quality}default.jpg`;
};

export const CANONICAL_MEDIA_VAULT: MediaVaultVideo[] = [
  {
    id: 'jhow_annual_celebration',
    youtubeId: 'rCSwaCZsAHg',
    title: 'Rebuilding Better Together — 2026 Annual Theme Celebration',
    speaker: 'Joshua House of Worship (San Antonio)',
    category: 'JHOW Live & Sermons',
    duration: '1:12:45',
    thematicFocus: 'Ephesians 4:16 — Every joint supplying growth and edifying the body in love.',
    isJhowOfficial: true
  },
  {
    id: 'mcreynolds_not_lucky',
    youtubeId: 'bB4oZlDau4g',
    title: 'Not Lucky, I’m Loved — Worship & Testimony',
    artist: 'Jonathan McReynolds',
    speaker: 'Jonathan McReynolds',
    category: 'High Praise & Worship',
    duration: '4:25',
    thematicFocus: 'Divine favor, grace, and redemption: Not lucky, I am loved by the King of Kings.',
    lyricsSnippet: 'I’m not lucky, I am loved. Hands down, grace has found me.',
    lyricsText: `I’m not lucky, I am loved
Hands down, grace has found me
I am not lucky, I am loved by the King of Kings
Grace found me in the valley; mercy pulled me into His light
Every joint supplies, the body fitly joined together
Rebuilding better together, rooted in holy love and apostolic truth
Glory in the church throughout all ages, world without end
Holy fire ignited in our hearts; we will not grow cold`
  },
  {
    id: 'elevation_goodbye_yesterday',
    youtubeId: 'I41mcfilEKQ',
    title: 'Goodbye Yesterday — High Energy Praise',
    artist: 'ELEVATION RHYTHM',
    speaker: 'ELEVATION RHYTHM',
    category: 'Youth Ignition Praise',
    duration: '3:40',
    thematicFocus: 'Stepping into the new season of holiness and joy in Christ Jesus.',
    lyricsSnippet: 'Goodbye yesterday, you can’t hold me back no more. I am alive in Christ!',
    lyricsText: `Goodbye yesterday, you can’t hold me back no more
I am alive in Christ, walking in the light of His glory
The old has passed away, behold all things are become new
Walking in kingdom authority and Holy Ghost power
Jesus broke the chains, now I am free indeed`
  },
  {
    id: 'bibleproject_ephesians',
    youtubeId: '1O4bT3Zt7sM',
    title: 'Ephesians Visual Guide: One New Humanity',
    speaker: 'BibleProject',
    category: 'Bible Book Overviews',
    duration: '8:45',
    thematicFocus: 'Visual theology unfolding Paul’s message of reconciliation, unity, and the whole armor of God.'
  },
  {
    id: 'bibleproject_daniel',
    youtubeId: 'm8m6A9bMfq4',
    title: 'Daniel Visual Guide: God Rules the Nations',
    speaker: 'BibleProject',
    category: 'Bible Book Overviews',
    duration: '8:50',
    thematicFocus: 'Prophetic succession, Babylonian exile, and the Everlasting Stone Kingdom.'
  },
  {
    id: 'forrest_frank_god_is_good',
    youtubeId: 'q5m09rqOoxE',
    title: 'GOD IS GOOD — Joy in the Lord',
    artist: 'Forrest Frank',
    speaker: 'Forrest Frank',
    category: 'High Praise & Worship',
    duration: '3:15',
    thematicFocus: 'Uplifting gospel celebration of God’s daily mercy and goodness.',
    lyricsSnippet: 'God is good all the time, and all the time God is good.',
    lyricsText: `God is good all the time, and all the time God is good
Woke up this morning with the sunshine on my face
Praising the Lord for His unending mercy and grace
Joy unspeakable and full of glory
He turned my mourning into dancing`
  },
  {
    id: 'chandler_moore_jireh',
    youtubeId: 'mC-zw0zCCtg',
    title: 'Jireh — More Than Enough',
    artist: 'Elevation Worship & Maverick City Music',
    speaker: 'Chandler Moore & Naomi Raine',
    category: 'High Praise & Worship',
    duration: '9:58',
    thematicFocus: 'Jehovah Jireh will provide; you are more than enough for every season.',
    lyricsSnippet: 'I will be content in every circumstance, You are Jireh, You are enough.',
    lyricsText: `I will be content in every circumstance
You are Jireh, You are enough
Forever enough, always enough, more than enough
More than enough for me
Jehovah Jireh, my provider, His grace is sufficient for me`
  },
  {
    id: 'tasha_cobbs_break_every_chain',
    youtubeId: 'E_kUuC2Bv2Y',
    title: 'Break Every Chain — Altar Warfare Praise',
    artist: 'Tasha Cobbs Leonard',
    speaker: 'Tasha Cobbs Leonard',
    category: 'Deliverance & Warfare',
    duration: '8:19',
    thematicFocus: 'The power in the name of Jesus to break every chain and set the captives free.',
    lyricsSnippet: 'There is power in the name of Jesus to break every chain, break every chain.',
    lyricsText: `There is power in the name of Jesus
There is power in the name of Jesus
To break every chain, break every chain, break every chain
All sufficient sacrifice, freely given, highest price
Bought our redemption, a rough hide for a crown`
  },
  {
    id: 'cece_winans_goodness_of_god',
    youtubeId: '9sE5kEnitqE',
    title: 'Goodness of God — Live Worship',
    artist: 'CeCe Winans',
    speaker: 'CeCe Winans',
    category: 'High Praise & Worship',
    duration: '4:56',
    thematicFocus: 'All my life You have been faithful; all my life You have been so good.',
    lyricsSnippet: 'With every breath that I am able, I will sing of the goodness of God.',
    lyricsText: `All my life You have been faithful
All my life You have been so, so good
With every breath that I am able
I will sing of the goodness of God
I love Your voice, You have led me through the fire
In darkest night You are close like no other`
  },
  {
    id: 'pastor_mike_jr_bigness',
    youtubeId: 'L8g3TqA6Dfg',
    title: 'BIGNESS OF GOD — Praise Celebration',
    artist: 'Pastor Mike Jr.',
    speaker: 'Pastor Mike Jr.',
    category: 'Urban Gospel & Classics',
    duration: '4:12',
    thematicFocus: 'Celebrating that our God is bigger than any mountain or circumstance.'
  },
  {
    id: 'brandon_lake_gratitude',
    youtubeId: 'dQw3eYx3fP8',
    title: 'Gratitude — Halleluiah Song',
    artist: 'Brandon Lake',
    speaker: 'Brandon Lake',
    category: 'High Praise & Worship',
    duration: '5:37',
    thematicFocus: 'Throw up your hands and praise the Lord; let everything that hath breath praise.'
  },
  {
    id: 'toby_mac_help_is_on_way',
    youtubeId: 'U2eU8_L4Qzg',
    title: 'Help Is On The Way (Maybe Midnight)',
    artist: 'TobyMac',
    speaker: 'TobyMac',
    category: 'Youth Ignition Praise',
    duration: '3:30',
    thematicFocus: 'Hold fast in the waiting season; God rolls up His sleeves and delivers.'
  }
];

export const getVerifiedLyricsForVideo = (videoIdOrYoutubeId: string): string | undefined => {
  const cleanId = cleanYouTubeId(videoIdOrYoutubeId);
  const video = CANONICAL_MEDIA_VAULT.find(v => v.id === videoIdOrYoutubeId || cleanYouTubeId(v.youtubeId) === cleanId);
  return video?.lyricsText;
};
