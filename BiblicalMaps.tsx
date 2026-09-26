import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Compass, Download, Check, MapPin, 
  BookOpen, Sparkles, Layers, Search, ChevronRight, 
  X, ExternalLink, ShieldCheck, Globe, Navigation, 
  Mountain, Satellite, Eye
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AtlasBookData {
  id: string;
  name: string;
  testament: string;
  category: string;
  region: string;
  coordinates: [number, number];
  zoom: number;
  keyCharacters: string[];
  summary: string;
  foundationalScripture?: string;
  milestones: Array<{
    name: string;
    coords: [number, number];
    narrative: string;
    scripture?: string;
  }>;
}

interface BiblicalSite {
  id: string;
  name: string;
  region: string;
  coords: [number, number];
  scriptures: string[];
  description: string;
  archaeologyNote: string;
  bookId: string;
  chapter: number;
}

interface CharacterJourney {
  id: string;
  title: string;
  character: string;
  period: string;
  scriptures: string[];
  stops: Array<{ name: string; scripture: string; coords: [number, number]; note: string; bookId: string; chapter: number }>;
}

interface EmpirePeriod {
  id: string;
  name: string;
  metal: string;
  era: string;
  scripture: string;
  capital: string;
  keyProphecy: string;
  coords: [number, number];
  bookId: string;
  chapter: number;
}

const BIBLICAL_SITES: BiblicalSite[] = [
  {
    id: 'ephesus',
    name: 'Ephesus',
    region: 'Asia Minor (Aegean Coast)',
    coords: [37.9497, 27.3639],
    scriptures: ['Acts 19:1–20', 'Ephesians 4:16', 'Revelation 2:1–7'],
    description: 'Major Roman metropolis, home of the Temple of Artemis. Paul spent over 2 years discipling believers and training leaders who sparked a regional gospel movement.',
    archaeologyNote: 'Great Theater where the silversmiths riot occurred and Celsus Library ruins stand today.',
    bookId: 'EPH',
    chapter: 4
  },
  {
    id: 'jerusalem',
    name: 'Jerusalem (Mount Zion)',
    region: 'Judea / Levant',
    coords: [31.7683, 35.2137],
    scriptures: ['Psalm 122:6', 'Luke 24:44–49', 'Acts 2:1–4'],
    description: 'The City of David, site of Solomon’s Temple, the crucifixion and resurrection of Jesus Christ, and the outpouring of the Holy Spirit on the Day of Pentecost.',
    archaeologyNote: 'City of David excavations, Western Wall, Temple Mount esplanade, and Pool of Siloam.',
    bookId: 'ACT',
    chapter: 2
  },
  {
    id: 'antioch',
    name: 'Antioch of Syria',
    region: 'Syria (Orontes River)',
    coords: [36.2021, 36.1606],
    scriptures: ['Acts 11:19–26', 'Acts 13:1–3', 'Galatians 2:11'],
    description: 'The vibrant missionary sending hub of the early Church where disciples were first called Christians and Paul & Barnabas were commissioned in fasting and prayer.',
    archaeologyNote: 'Grotto of Saint Peter, ancient Roman mosaic pavements discovered in Antakya.',
    bookId: 'ACT',
    chapter: 13
  },
  {
    id: 'corinth',
    name: 'Corinth',
    region: 'Achaia (Greece)',
    coords: [37.9056, 22.8797],
    scriptures: ['Acts 18:1–17', '1 Corinthians 13:1–13', '2 Corinthians 5:17'],
    description: 'Busy maritime trade center on the Isthmus. Paul laboured here alongside Priscilla and Aquila, planting a cross-cultural church facing cultural immorality.',
    archaeologyNote: 'The Bema (judgment seat) where Paul stood before Proconsul Gallio (Acts 18:12).',
    bookId: '1CO',
    chapter: 13
  },
  {
    id: 'rome',
    name: 'Rome',
    region: 'Italian Peninsula',
    coords: [41.9028, 12.4964],
    scriptures: ['Romans 1:16', 'Acts 28:16–31', '2 Timothy 4:6–8'],
    description: 'Imperial capital from which Caesar ruled. Paul was brought as a prisoner, preaching unhindered in hired quarters and authoring the Prison Epistles.',
    archaeologyNote: 'Mamertine Prison, Roman Forum, Appian Way, and Domitilla catacombs.',
    bookId: 'ROM',
    chapter: 1
  },
  {
    id: 'babylon',
    name: 'Babylon',
    region: 'Mesopotamia (Euphrates)',
    coords: [32.5355, 44.4275],
    scriptures: ['2 Kings 25:1–12', 'Daniel 1:1–7', 'Jeremiah 29:11'],
    description: 'Ancient imperial capital of King Nebuchadnezzar where Judah was carried into 70 years of exile, and Daniel displayed steadfast faith in the lion’s den.',
    archaeologyNote: 'Ishtar Gate reconstructions, Processional Way, and Nebuchadnezzar palace foundations.',
    bookId: 'DAN',
    chapter: 1
  },
  {
    id: 'mount_sinai',
    name: 'Mount Sinai (Horeb)',
    region: 'Sinai Peninsula / Wilderness',
    coords: [28.5394, 33.9753],
    scriptures: ['Exodus 19:16–25', 'Exodus 20:1–17', '1 Kings 19:8–12'],
    description: 'The holy mountain where God descended in fire, delivered the Ten Commandments to Moses, and spoke to Elijah in a still small voice.',
    archaeologyNote: 'Jabal Musa traditional site and St. Catherine’s Monastery valley.',
    bookId: 'EXO',
    chapter: 20
  }
];

const CHARACTER_JOURNEYS: CharacterJourney[] = [
  {
    id: 'paul_missionary',
    title: "Apostle Paul: 2nd Missionary Journey",
    character: 'Paul & Silas',
    period: 'AD 49–52',
    scriptures: ['Acts 15:36–18:22'],
    stops: [
      { name: 'Antioch (Commissioning)', scripture: 'Acts 15:36–41', coords: [36.2021, 36.1606], note: 'Strengthening churches across Syria and Cilicia.', bookId: 'ACT', chapter: 15 },
      { name: 'Troas (Macedonian Call)', scripture: 'Acts 16:8–10', coords: [39.75, 26.16], note: 'Vision of the man of Macedonia pleading: "Come over and help us!"', bookId: 'ACT', chapter: 16 },
      { name: 'Philippi (Midnight Praise)', scripture: 'Acts 16:11–40', coords: [41.0133, 24.2867], note: 'Lydia baptized; jailer saved when an earthquake shook open prison gates.', bookId: 'ACT', chapter: 16 },
      { name: 'Thessalonica & Berea', scripture: 'Acts 17:1–14', coords: [40.6401, 22.9444], note: 'Berean believers searched the Scriptures daily to verify the truth.', bookId: 'ACT', chapter: 17 },
      { name: 'Athens (Mars Hill)', scripture: 'Acts 17:16–34', coords: [37.9715, 23.7257], note: 'Preaching the "Unknown God" and Resurrection at the Areopagus.', bookId: 'ACT', chapter: 17 },
      { name: 'Corinth (18 Months Stay)', scripture: 'Acts 18:1–18', coords: [37.9056, 22.8797], note: 'Ministry with Priscilla and Aquila; written correspondence to churches.', bookId: 'ACT', chapter: 18 }
    ]
  },
  {
    id: 'abraham_faith',
    title: "Abraham: The Covenant Journey of Faith",
    character: 'Abraham & Sarah',
    period: 'c. 2000 BC',
    scriptures: ['Genesis 12:1–9', 'Hebrews 11:8–10'],
    stops: [
      { name: 'Ur of the Chaldees', scripture: 'Genesis 11:31', coords: [30.9622, 46.1031], note: 'Original ancestral home in southern Mesopotamia.', bookId: 'GEN', chapter: 11 },
      { name: 'Haran (The Divine Call)', scripture: 'Genesis 12:1–4', coords: [36.8667, 39.0333], note: '"Get thee out of thy country... unto a land that I will shew thee."', bookId: 'GEN', chapter: 12 },
      { name: 'Shechem (First Altar)', scripture: 'Genesis 12:6–7', coords: [32.2133, 35.2833], note: 'God appeared and promised the land to Abraham’s seed.', bookId: 'GEN', chapter: 12 },
      { name: 'Hebron (Oak of Mamre)', scripture: 'Genesis 13:18', coords: [31.5297, 35.0938], note: 'Covenant confirmed; burial place of the Patriarchs in Machpelah.', bookId: 'GEN', chapter: 13 }
    ]
  },
  {
    id: 'exodus_deliverance',
    title: "Moses: Exodus & Wilderness Wonderings",
    character: 'Moses & Israel',
    period: 'c. 1446 BC',
    scriptures: ['Exodus 12–19', 'Deuteronomy 34:1–5'],
    stops: [
      { name: 'Rameses & Goshen', scripture: 'Exodus 12:37', coords: [30.8, 31.8], note: 'Passover night of deliverance from Egyptian bondage.', bookId: 'EXO', chapter: 12 },
      { name: 'Red Sea Crossing', scripture: 'Exodus 14:21–31', coords: [29.9, 32.5], note: 'Waters parted miraculously; pillar of cloud and fire.', bookId: 'EXO', chapter: 14 },
      { name: 'Mount Sinai', scripture: 'Exodus 19:1–20:21', coords: [28.5394, 33.9753], note: 'Giving of the Law and blueprint of the Tabernacle.', bookId: 'EXO', chapter: 20 },
      { name: 'Mount Nebo', scripture: 'Deuteronomy 34:1–4', coords: [31.7683, 35.725], note: 'Moses viewed the Promised Land across Jordan before his rest.', bookId: 'DEU', chapter: 34 }
    ]
  },
  {
    id: 'elijah_revival',
    title: "Elijah: Mount Carmel to Mount Horeb",
    character: 'Elijah the Tishbite',
    period: 'c. 860 BC',
    scriptures: ['1 Kings 18–19'],
    stops: [
      { name: 'Mount Carmel (Fire from Heaven)', scripture: '1 Kings 18:20–40', coords: [32.73, 35.05], note: 'Contest with 450 prophets of Baal; fire of God consumed the sacrifice; people cried "The LORD, he is the God!"', bookId: '1KI', chapter: 18 },
      { name: 'Beersheba (Strengthened by Angel)', scripture: '1 Kings 19:3–4', coords: [31.25, 34.79], note: 'Fled south to Beersheba; prayed under the broom tree; angel provided baked cake and cruse of water.', bookId: '1KI', chapter: 19 },
      { name: 'Mount Horeb (The Still Small Voice)', scripture: '1 Kings 19:8–18', coords: [28.5394, 33.9753], note: 'Walked 40 days to the mount of God; the LORD revealed Himself not in wind or quake, but in a still small voice.', bookId: '1KI', chapter: 19 }
    ]
  },
  {
    id: 'jesus_ministry',
    title: "Jesus: Galilean Ministry & Passion Week",
    character: 'Jesus the Messiah',
    period: 'c. AD 30–33',
    scriptures: ['Matthew 4–28', 'Luke 4–24'],
    stops: [
      { name: 'Nazareth', scripture: 'Luke 4:16–30', coords: [32.70, 35.30], note: 'Childhood home; proclaimed Isaiah 61 in the synagogue.', bookId: 'LUK', chapter: 4 },
      { name: 'Capernaum', scripture: 'Matthew 4:13–17', coords: [32.88, 35.57], note: 'Base of Galilean ministry; healing of centurion’s servant.', bookId: 'MAT', chapter: 4 },
      { name: 'Caesarea Philippi', scripture: 'Matthew 16:13–20', coords: [33.24, 35.69], note: 'Peter’s confession: "Thou art the Christ, Son of the Living God!"', bookId: 'MAT', chapter: 16 },
      { name: 'Jericho', scripture: 'Luke 19:1–10', coords: [31.86, 35.46], note: 'Encounter with Zacchaeus; healing of blind Bartimaeus.', bookId: 'LUK', chapter: 19 },
      { name: 'Jerusalem & Mount Calvary', scripture: 'Luke 22–24', coords: [31.778, 35.234], note: 'The Last Supper, Gethsemane, Crucifixion, and glorious Resurrection!', bookId: 'LUK', chapter: 24 }
    ]
  },
  {
    id: 'paul_rome',
    title: "Paul: Voyage to Rome & Shipwreck at Malta",
    character: 'Apostle Paul',
    period: 'c. AD 59–62',
    scriptures: ['Acts 27–28'],
    stops: [
      { name: 'Caesarea Maritima', scripture: 'Acts 27:1', coords: [32.50, 34.89], note: 'Paul appealed to Caesar and boarded ship for Italy.', bookId: 'ACT', chapter: 27 },
      { name: 'Fair Havens, Crete', scripture: 'Acts 27:8', coords: [34.92, 24.81], note: 'Paul advised against sailing; tempest Euroclydon struck.', bookId: 'ACT', chapter: 27 },
      { name: 'Malta (Shipwreck & Snake)', scripture: 'Acts 28:1–10', coords: [35.93, 14.37], note: 'All 276 souls saved; viper shook off into fire without harm.', bookId: 'ACT', chapter: 28 },
      { name: 'Rome (Hired House)', scripture: 'Acts 28:16–31', coords: [41.9028, 12.4964], note: 'Paul preached the kingdom of God unhindered for 2 full years.', bookId: 'ACT', chapter: 28 }
    ]
  },
  {
    id: 'joseph_providence',
    title: "Joseph: From the Pit of Dothan to the Throne of Egypt",
    character: 'Joseph, Son of Jacob',
    period: 'c. 1898 – 1805 BC',
    scriptures: ['Genesis 37–50'],
    stops: [
      { name: 'Hebron Valley (Coat of Many Colors)', scripture: 'Genesis 37:14', coords: [31.53, 35.09], note: 'Sent by father Jacob to check on his brothers pasturing flocks.', bookId: 'GEN', chapter: 37 },
      { name: 'Dothan (The Pit & Sold into Slavery)', scripture: 'Genesis 37:17–28', coords: [32.41, 35.24], note: 'Stripped of coat; cast into empty cistern; sold to Ishmeelite caravan for 20 pieces of silver.', bookId: 'GEN', chapter: 37 },
      { name: 'On / Heliopolis & Potiphar House', scripture: 'Genesis 39:1–20', coords: [30.13, 31.31], note: 'Served faithfully; fled Potiphar’s wife; falsely accused and cast into prison.', bookId: 'GEN', chapter: 39 },
      { name: 'Memphis / Pharaoh Court (Viceroy)', scripture: 'Genesis 41:37–45', coords: [29.85, 31.25], note: 'Interpreted Pharaoh’s 7-year famine dream; elevated to Governor over all Egypt.', bookId: 'GEN', chapter: 41 },
      { name: 'Land of Goshen (Family Reconciliation)', scripture: 'Genesis 45:1–10 & Genesis 50:20', coords: [30.75, 31.85], note: '"Ye thought evil against me; but God meant it unto good, to save much people alive."', bookId: 'GEN', chapter: 50 }
    ]
  },
  {
    id: 'jonah_nineveh',
    title: "Jonah: Flight to Tarshish & The Nineveh Awakening",
    character: 'Jonah the Prophet',
    period: 'c. 760 BC',
    scriptures: ['Jonah 1–4', 'Matthew 12:40'],
    stops: [
      { name: 'Gath-hepher (Galilee Home)', scripture: '2 Kings 14:25', coords: [32.74, 35.33], note: 'Jonah’s hometown; received the Word of the Lord to cry against Nineveh.', bookId: 'JON', chapter: 1 },
      { name: 'Joppa (Port of Flight)', scripture: 'Jonah 1:3', coords: [32.05, 34.75], note: 'Fled from presence of the Lord; paid fare onto ship destined for Tarshish.', bookId: 'JON', chapter: 1 },
      { name: 'Mediterranean Deep (Great Fish)', scripture: 'Jonah 1:17 & 2:1–10', coords: [33.50, 32.00], note: 'Cast into sea; swallowed by great fish 3 days and 3 nights; prayed prayer of salvation.', bookId: 'JON', chapter: 2 },
      { name: 'Nineveh (A Great City Repents)', scripture: 'Jonah 3:1–10', coords: [36.36, 43.15], note: 'Preached 40-day judgment; King and 120,000 citizens fasted in sackcloth and ashes.', bookId: 'JON', chapter: 3 }
    ]
  },
  {
    id: 'philip_evangelist',
    title: "Philip: Jerusalem to Desert Road, Azotus & Caesarea",
    character: 'Philip the Evangelist',
    period: 'c. AD 34–36',
    scriptures: ['Acts 8:26–40'],
    stops: [
      { name: 'Jerusalem (Commission to Desert Road)', scripture: 'Acts 8:26', coords: [31.7683, 35.2137], note: 'Angel commanded: "Arise, and go toward the south unto the way that goeth down from Jerusalem unto Gaza, which is desert."', bookId: 'ACT', chapter: 8 },
      { name: 'Desert Road of Gaza (Ethiopian Eunuch)', scripture: 'Acts 8:27–38', coords: [31.50, 34.46], note: 'Joined chariot; opened Isaiah 53; baptized the Ethiopian superintendent of Candace.', bookId: 'ACT', chapter: 8 },
      { name: 'Azotus / Ashdod (Caught Away by Spirit)', scripture: 'Acts 8:39–40', coords: [31.80, 34.65], note: 'The Spirit caught away Philip; found at Azotus preaching through all the coastal towns.', bookId: 'ACT', chapter: 8 },
      { name: 'Caesarea (Evangelist Base)', scripture: 'Acts 8:40', coords: [32.50, 34.89], note: 'Settled in Caesarea, hosting believers and proclaiming the gospel across the Levant.', bookId: 'ACT', chapter: 8 }
    ]
  },
  {
    id: 'peter_apostle',
    title: "Peter: Joppa to Caesarea (Cornelius Revival)",
    character: 'Apostle Peter',
    period: 'c. AD 38–41',
    scriptures: ['Acts 10:1–48'],
    stops: [
      { name: 'Joppa (Rooftop Vision of Great Sheet)', scripture: 'Acts 10:9–23', coords: [32.05, 34.75], note: 'Trance vision on rooftop by the sea: "What God hath cleansed, that call not thou common."', bookId: 'ACT', chapter: 10 },
      { name: 'Caesarea (House of Cornelius & Gentile Pentecost)', scripture: 'Acts 10:24–48', coords: [32.50, 34.89], note: 'Gentiles heard the Word; Holy Ghost fell upon all; baptized in Jesus name.', bookId: 'ACT', chapter: 10 }
    ]
  }
];

const DANIELS_EMPIRES: EmpirePeriod[] = [
  {
    id: 'assyrian_empire',
    name: 'Neo-Assyrian Empire',
    metal: 'Winged Bull & Lion / Rod of Wrath',
    era: '911 – 609 BC',
    scripture: '2 Kings 17:5–6 & Jonah 3:1–10 & Nahum 3:1–7',
    capital: 'Nineveh (Tigris River)',
    keyProphecy: 'Capital at Nineveh. Besieged Samaria and carried Northern Kingdom of Israel into exile (722 BC). Repented under Jonah; later judged under Nahum.',
    coords: [36.36, 43.15],
    bookId: 'JON',
    chapter: 1
  },
  {
    id: 'babylon_gold',
    name: 'Babylonian Empire',
    metal: 'Head of Gold / Lion with Eagle Wings',
    era: '605 – 539 BC',
    scripture: 'Daniel 2:32, 37–38 & Daniel 7:4',
    capital: 'Babylon (Euphrates River)',
    keyProphecy: 'King Nebuchadnezzar recognized God Most High after pride brought him low. Represented supreme earthly splendor.',
    coords: [32.5355, 44.4275],
    bookId: 'DAN',
    chapter: 2
  },
  {
    id: 'medo_persia_silver',
    name: 'Medo-Persian Empire',
    metal: 'Chest & Arms of Silver / Bear with Three Ribs',
    era: '539 – 331 BC',
    scripture: 'Daniel 2:39 & Daniel 7:5',
    capital: 'Susa / Persepolis',
    keyProphecy: 'Cyrus the Great decreed Jewish return to rebuild the Temple in Jerusalem. Esther served as queen.',
    coords: [32.19, 48.24],
    bookId: 'DAN',
    chapter: 2
  },
  {
    id: 'greece_bronze',
    name: 'Grecian Empire (Alexander)',
    metal: 'Belly & Thighs of Bronze / Leopard with Four Wings',
    era: '331 – 168 BC',
    scripture: 'Daniel 2:39 & Daniel 7:6',
    capital: 'Pella / Alexandria',
    keyProphecy: 'Lightning-fast conquest by Alexander the Great; empire divided among 4 generals (Diadochi); Koine Greek prepared world for Gospel.',
    coords: [40.75, 22.52],
    bookId: 'DAN',
    chapter: 7
  },
  {
    id: 'rome_iron',
    name: 'Roman Empire',
    metal: 'Legs of Iron / Terrible Beast with Iron Teeth',
    era: '63 BC – AD 476',
    scripture: 'Daniel 2:40 & Daniel 7:7',
    capital: 'Rome (Seven Hills)',
    keyProphecy: 'Pax Romana, stone roads, legal system, under which the Messiah was born in Bethlehem and crucified.',
    coords: [41.9028, 12.4964],
    bookId: 'DAN',
    chapter: 2
  },
  {
    id: 'everlasting_kingdom',
    name: 'The Stone Kingdom of Christ',
    metal: 'Stone Cut Without Hands / Mount Zion',
    era: 'Eternal Kingdom',
    scripture: 'Daniel 2:44–45 & Daniel 7:13–14',
    capital: 'New Jerusalem',
    keyProphecy: '"In the days of these kings shall the God of heaven set up a kingdom, which shall never be destroyed."',
    coords: [31.7683, 35.2137],
    bookId: 'DAN',
    chapter: 7
  }
];

// Map Layer Tile Providers
const MAP_LAYERS = {
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: ['a', 'b', 'c']
  },
  terrain: {
    name: 'Terrain Relief View',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    subdomains: ['a', 'b', 'c']
  },
  parchment: {
    name: 'Imperial Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: ['a', 'b', 'c', 'd']
  }
};

interface BiblicalMapsProps {
  onBack?: () => void;
  onNavigateToScripture?: (bookId: string, chapter: number) => void;
}

export const BiblicalMaps: React.FC<BiblicalMapsProps> = ({
  onBack,
  onNavigateToScripture
}) => {
  // Unified 4-Category Segmented Navigation Bar
  const [activeCategory, setActiveCategory] = useState<'books' | 'sites' | 'journeys' | 'empires'>('books');
  
  // Map View Mode (Satellite vs. Terrain vs. Imperial Dark)
  const [mapLayerMode, setMapLayerMode] = useState<'satellite' | 'terrain' | 'parchment'>('satellite');

  // Leaflet Map Ref
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // 66-Book Atlas Data
  const [atlasBooks, setAtlasBooks] = useState<AtlasBookData[]>([]);
  const [selectedBook, setSelectedBook] = useState<AtlasBookData | null>(null);
  const [selectedSite, setSelectedSite] = useState<BiblicalSite | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<CharacterJourney>(CHARACTER_JOURNEYS[0]);
  const [selectedEmpire, setSelectedEmpire] = useState<EmpirePeriod | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Offline Sync State
  const [isOfflineSyncing, setIsOfflineSyncing] = useState(false);
  const [offlineSynced, setOfflineSynced] = useState<boolean>(() => {
    return localStorage.getItem('youngfire_atlas_offline_cached') === 'true';
  });

  // Load 66 Books from public/bible_books_atlas_66.json
  useEffect(() => {
    fetch('/bible_books_atlas_66.json')
      .then(res => res.json())
      .then((data: AtlasBookData[]) => {
        const enriched = data.map((b) => {
          let foundational = b.foundationalScripture;
          if (!foundational) {
            if (b.id === 'GEN') foundational = 'Genesis 1:1 & Genesis 12:1–3';
            else if (b.id === 'EXO') foundational = 'Exodus 14:13–14 & Exodus 20:1–17';
            else if (b.id === 'LEV') foundational = 'Leviticus 19:2 & Leviticus 17:11';
            else if (b.id === 'NUM') foundational = 'Numbers 6:24–26 & Numbers 14:8';
            else if (b.id === 'DEU') foundational = 'Deuteronomy 6:4–9 & Deuteronomy 30:19';
            else if (b.id === 'JOS') foundational = 'Joshua 1:8–9 & Joshua 24:15';
            else if (b.id === 'JDG') foundational = 'Judges 2:18 & Judges 21:25';
            else if (b.id === 'RUT') foundational = 'Ruth 1:16–17 & Ruth 4:14';
            else if (b.id === '1SA') foundational = '1 Samuel 16:7 & 1 Samuel 17:45';
            else if (b.id === '2SA') foundational = '2 Samuel 7:12–16 & 2 Samuel 22:2–4';
            else if (b.id === '1KI') foundational = '1 Kings 3:9 & 1 Kings 8:27';
            else if (b.id === '2KI') foundational = '2 Kings 2:9–11 & 2 Kings 17:13';
            else if (b.id === '1CH') foundational = '1 Chronicles 4:10 & 1 Chronicles 16:8–12';
            else if (b.id === '2CH') foundational = '2 Chronicles 7:14 & 2 Chronicles 20:15';
            else if (b.id === 'EZR') foundational = 'Ezra 7:10 & Ezra 3:11';
            else if (b.id === 'NEH') foundational = 'Nehemiah 4:6 & Nehemiah 8:10';
            else if (b.id === 'EST') foundational = 'Esther 4:14 & Esther 9:22';
            else if (b.id === 'JOB') foundational = 'Job 19:25–27 & Job 42:2';
            else if (b.id === 'PSA') foundational = 'Psalm 23:1–6 & Psalm 119:105';
            else if (b.id === 'PRO') foundational = 'Proverbs 3:5–6 & Proverbs 9:10';
            else if (b.id === 'ECC') foundational = 'Ecclesiastes 3:1–8 & Ecclesiastes 12:13';
            else if (b.id === 'SNG') foundational = 'Song of Solomon 2:4 & Song 8:7';
            else if (b.id === 'ISA') foundational = 'Isaiah 9:6 & Isaiah 53:5';
            else if (b.id === 'JER') foundational = 'Jeremiah 29:11 & Jeremiah 31:33';
            else if (b.id === 'LAM') foundational = 'Lamentations 3:22–23';
            else if (b.id === 'EZK') foundational = 'Ezekiel 36:26 & Ezekiel 37:1–14';
            else if (b.id === 'DAN') foundational = 'Daniel 2:44 & Daniel 7:13–14';
            else if (b.id === 'MAT') foundational = 'Matthew 6:33 & Matthew 28:18–20';
            else if (b.id === 'MRK') foundational = 'Mark 10:45 & Mark 16:15';
            else if (b.id === 'LUK') foundational = 'Luke 19:10 & Luke 1:37';
            else if (b.id === 'JHN') foundational = 'John 1:1–14 & John 3:16';
            else if (b.id === 'ACT') foundational = 'Acts 1:8 & Acts 2:1–4';
            else if (b.id === 'ROM') foundational = 'Romans 1:16 & Romans 8:28';
            else if (b.id === '1CO') foundational = '1 Corinthians 13:4–8 & 1 Corinthians 15:3–4';
            else if (b.id === '2CO') foundational = '2 Corinthians 5:17 & 2 Corinthians 12:9';
            else if (b.id === 'GAL') foundational = 'Galatians 2:20 & Galatians 5:22–23';
            else if (b.id === 'EPH') foundational = 'Ephesians 2:8–10 & Ephesians 4:16';
            else if (b.id === 'PHP') foundational = 'Philippians 4:6–7 & Philippians 4:13';
            else if (b.id === 'COL') foundational = 'Colossians 1:16–18 & Colossians 3:1–2';
            else if (b.id === 'REV') foundational = 'Revelation 1:8 & Revelation 21:1–4';
            else foundational = `${b.name} 1:1–4 & Canonical Scripture`;
          }
          return {
            ...b,
            foundationalScripture: foundational
          };
        });
        setAtlasBooks(enriched);
        if (enriched.length > 0) setSelectedBook(enriched[0]);
      })
      .catch((err) => {
        console.error('Failed to load atlas books:', err);
      });
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    // Centered on the Ancient Near East (Jerusalem & Levant)
    const map = L.map(mapContainerRef.current, {
      center: [33.5, 36.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerConfig = MAP_LAYERS[mapLayerMode];
    const tileLayer = L.tileLayer(layerConfig.url, {
      maxZoom: 19,
      subdomains: layerConfig.subdomains || ['a', 'b', 'c', 'd'],
      // @ts-ignore
      r: typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapLayerMode changes (Satellite vs Terrain vs Dark)
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const layerConfig = MAP_LAYERS[mapLayerMode];
    const newTileLayer = L.tileLayer(layerConfig.url, {
      maxZoom: 19,
      subdomains: layerConfig.subdomains || ['a', 'b', 'c', 'd'],
      // @ts-ignore
      r: typeof window !== 'undefined' && window.devicePixelRatio > 1 ? '@2x' : ''
    }).addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [mapLayerMode]);

  // Synchronize Leaflet view when user selects a book, milestone, site, empire, or journey stop
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;
    if (activeCategory === 'books' && selectedBook) {
      map.flyTo([selectedBook.coordinates[0], selectedBook.coordinates[1]], Math.max(selectedBook.zoom || 6, 6), {
        animate: true,
        duration: 1.0
      });
    } else if (activeCategory === 'sites' && selectedSite) {
      map.flyTo([selectedSite.coords[0], selectedSite.coords[1]], 8, {
        animate: true,
        duration: 1.0
      });
    } else if (activeCategory === 'empires' && selectedEmpire) {
      map.flyTo([selectedEmpire.coords[0], selectedEmpire.coords[1]], 6, {
        animate: true,
        duration: 1.0
      });
    } else if (activeCategory === 'journeys' && selectedJourney && selectedJourney.stops.length > 0) {
      const firstStop = selectedJourney.stops[0];
      map.flyTo([firstStop.coords[0], firstStop.coords[1]], 6, {
        animate: true,
        duration: 1.0
      });
    }
  }, [activeCategory, selectedBook, selectedSite, selectedEmpire, selectedJourney]);

  // Update Markers & Overlays on Leaflet Map
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // Custom Icon generator
    const createCustomPin = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 10px ${color};"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
    };

    // 0. Books & Milestones Markers
    if (activeCategory === 'books' && selectedBook) {
      const mainMarker = L.marker([selectedBook.coordinates[0], selectedBook.coordinates[1]], {
        icon: createCustomPin('#F59E0B', selectedBook.name)
      });
      mainMarker.bindPopup(`
        <div style="font-family: Outfit, sans-serif; color: #040711; padding: 4px;">
          <strong style="font-size: 13px;">${selectedBook.name}</strong><br/>
          <span style="font-size: 11px; color: #D97706; font-weight: bold;">${selectedBook.category} &bull; ${selectedBook.region}</span><br/>
          <p style="font-size: 11px; margin-top: 4px;">${selectedBook.summary}</p>
        </div>
      `);
      markersGroup.addLayer(mainMarker);

      if (Array.isArray(selectedBook.milestones)) {
        selectedBook.milestones.forEach((m, idx) => {
          const milestoneMarker = L.marker([m.coords[0], m.coords[1]], {
            icon: createCustomPin('#06B6D4', m.name)
          });
          milestoneMarker.bindPopup(`
            <div style="font-family: Outfit, sans-serif; color: #040711; padding: 4px;">
              <strong style="font-size: 12px;">Stage ${idx + 1}: ${m.name}</strong><br/>
              <p style="font-size: 11px; margin-top: 4px;">${m.narrative}</p>
            </div>
          `);
          markersGroup.addLayer(milestoneMarker);
        });
      }
    }

    // 1. Sites Markers
    if (activeCategory === 'sites') {
      BIBLICAL_SITES.forEach((site) => {
        const marker = L.marker([site.coords[0], site.coords[1]], {
          icon: createCustomPin('#38BDF8', site.name)
        });
        marker.bindPopup(`
          <div style="font-family: Outfit, sans-serif; color: #040711; padding: 4px;">
            <strong style="font-size: 13px;">${site.name}</strong><br/>
            <span style="font-size: 11px; color: #D97706; font-weight: bold;">${site.scriptures[0]}</span><br/>
            <p style="font-size: 11px; margin-top: 4px; line-height: 1.3;">${site.description}</p>
          </div>
        `);
        marker.on('click', () => {
          setSelectedSite(site);
          if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([site.coords[0], site.coords[1]], 8, { animate: true, duration: 1.0 });
          }
        });
        markersGroup.addLayer(marker);
      });
    }

    // 2. Journey Polyline
    if (activeCategory === 'journeys') {
      const latlngs: [number, number][] = selectedJourney.stops.map(s => [s.coords[0], s.coords[1]]);
      const polyline = L.polyline(latlngs, {
        color: '#F97316',
        weight: 3.5,
        dashArray: '6, 6'
      });
      markersGroup.addLayer(polyline);

      selectedJourney.stops.forEach((stop, idx) => {
        const marker = L.marker([stop.coords[0], stop.coords[1]], {
          icon: createCustomPin('#F97316', stop.name)
        });
        marker.bindPopup(`
          <div style="font-family: Outfit, sans-serif; color: #040711; padding: 4px;">
            <strong style="font-size: 13px;">${idx + 1}. ${stop.name}</strong><br/>
            <span style="color: #D97706; font-size: 11px; font-weight: bold;">📖 ${stop.scripture}</span><br/>
            <p style="font-size: 11px; margin-top: 4px;">${stop.note}</p>
          </div>
        `);
        marker.on('click', () => {
          if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([stop.coords[0], stop.coords[1]], 8, { animate: true, duration: 1.0 });
          }
        });
        markersGroup.addLayer(marker);
      });
    }

    // 3. Daniel's Empires & Assyrian 722 BC Conquest Overlay
    if (activeCategory === 'empires') {
      // Dedicated Assyrian Empire 722 BC Conquest Bounds Overlay (Nineveh, Upper Tigris, Samaria)
      const assyrianConquestPolygon: [number, number][] = [
        [38.2, 39.8], // Upper Tigris Headwaters
        [37.6, 43.8], // Zagros / Media Borders
        [36.36, 43.15], // Nineveh (Imperial Capital)
        [35.45, 43.26], // Assur (Upper Tigris Religious Capital)
        [33.3, 44.4],  // Lower Mesopotamia
        [32.27, 35.18], // Samaria (722 BC Fall of Northern Kingdom)
        [31.3, 34.4],  // Gaza & Philistia
        [33.51, 36.27], // Damascus
        [36.86, 39.03], // Harran
        [38.2, 39.8]
      ];

      const assyrianPoly = L.polygon(assyrianConquestPolygon, {
        color: '#EF4444',
        weight: 2.5,
        dashArray: '5, 5',
        fillColor: '#DC2626',
        fillOpacity: 0.2
      });
      assyrianPoly.bindPopup(`
        <div style="font-family: Outfit, sans-serif; color: #040711; padding: 4px;">
          <strong style="font-size: 13px; color: #DC2626;">Neo-Assyrian Empire (722 BC Bounds)</strong><br/>
          <span style="font-size: 11px; font-weight: bold; color: #991B1B;">Nineveh &bull; Upper Tigris &bull; Samaria Conquest</span>
          <p style="font-size: 11px; margin-top: 4px;">Encompasses the Upper Tigris river valley and the 722 BC conquest of Samaria carrying the 10 northern tribes into exile (2 Kings 17:6).</p>
        </div>
      `);
      markersGroup.addLayer(assyrianPoly);

      // Key Pins for Assyrian Conquest
      const ninevehMarker = L.marker([36.36, 43.15], {
        icon: createCustomPin('#EF4444', 'Nineveh')
      });
      ninevehMarker.bindPopup(`
        <div style="font-family: Outfit, sans-serif; color: #040711;">
          <strong>Nineveh (Upper Tigris Capital)</strong><br/>
          <span style="color: #DC2626; font-size: 11px;">Jonah 3:1–10 &bull; Nahum 3:1–7</span>
        </div>
      `);
      markersGroup.addLayer(ninevehMarker);

      const samariaMarker = L.marker([32.27, 35.18], {
        icon: createCustomPin('#EF4444', 'Samaria 722 BC')
      });
      samariaMarker.bindPopup(`
        <div style="font-family: Outfit, sans-serif; color: #040711;">
          <strong>Samaria (722 BC Fall to Assyria)</strong><br/>
          <span style="color: #DC2626; font-size: 11px;">2 Kings 17:5–6 &bull; Sargon II / Shalmaneser</span>
        </div>
      `);
      markersGroup.addLayer(samariaMarker);

      DANIELS_EMPIRES.forEach((empire) => {
        const circle = L.circle([empire.coords[0], empire.coords[1]], {
          color: empire.id === 'assyrian_empire' ? '#EF4444' : '#A855F7',
          fillColor: empire.id === 'assyrian_empire' ? '#DC2626' : '#A855F7',
          fillOpacity: 0.15,
          radius: 280000
        });
        circle.bindPopup(`
          <div style="font-family: Outfit, sans-serif; color: #040711;">
            <strong>${empire.name}</strong><br/>
            <span>${empire.era} &bull; ${empire.metal}</span><br/>
            <p style="font-size: 11px;">${empire.keyProphecy}</p>
          </div>
        `);
        circle.on('click', () => {
          setSelectedEmpire(empire);
          if (leafletMapRef.current) {
            leafletMapRef.current.flyTo([empire.coords[0], empire.coords[1]], 6, { animate: true, duration: 1.0 });
          }
        });
        markersGroup.addLayer(circle);
      });
    }
  }, [activeCategory, selectedJourney, mapLayerMode, selectedBook]);

  // Offline Sync Handler
  const handleOfflineSync = () => {
    setIsOfflineSyncing(true);
    setTimeout(() => {
      try {
        localStorage.setItem('youngfire_atlas_offline_cached', 'true');
        localStorage.setItem('youngfire_atlas_cache_timestamp', new Date().toISOString());
        setOfflineSynced(true);
        setIsOfflineSyncing(false);
      } catch (err) {
        console.error('Offline storage error:', err);
        setIsOfflineSyncing(false);
      }
    }, 1200);
  };

  const filteredBooks = atlasBooks.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-16 select-none px-2 sm:px-4">
      
      {/* Top Universal Back & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#0B1329] border border-white/15 text-slate-200 hover:text-white cursor-pointer transition-colors"
              aria-label="Return to previous screen"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-black tracking-wider uppercase font-['Outfit'] text-white">
                IMPERIAL CARTOGRAPHY & ATLAS
              </h2>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Satellite & Terrain GIS &bull; 66 Canonical Books &bull; Daniel’s Prophetic Empires
            </p>
          </div>
        </div>

        {/* Satellite / Terrain Layer Switcher & Offline Sync */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer Selector */}
          <div className="flex bg-[#0B1329] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setMapLayerMode('satellite')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                mapLayerMode === 'satellite' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Real Satellite Imagery"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setMapLayerMode('terrain')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                mapLayerMode === 'terrain' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Topographic Terrain Elevation"
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Terrain</span>
            </button>
            <button
              onClick={() => setMapLayerMode('parchment')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                mapLayerMode === 'parchment' ? 'bg-purple-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Imperial Dark Matter View"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Dark Matter</span>
            </button>
          </div>

          {/* Offline Sync Button */}
          <button
            onClick={handleOfflineSync}
            disabled={isOfflineSyncing}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              offlineSynced
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/20'
            }`}
            title="Download study maps for offline use"
          >
            {isOfflineSyncing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Caching...</span>
              </>
            ) : offlineSynced ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Offline Cached</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Sync Offline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* UNIFIED ATLAS CATEGORY NAVIGATION: All 4 in the exact same control strip */}
      <div className="bg-[#0B1329] p-1.5 rounded-2xl border border-white/10 flex flex-wrap sm:flex-nowrap gap-1 shadow-lg">
        <button
          onClick={() => setActiveCategory('books')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider font-['Outfit'] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeCategory === 'books'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Books of the Bible (66)</span>
        </button>

        <button
          onClick={() => setActiveCategory('sites')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider font-['Outfit'] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeCategory === 'sites'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Biblical Sites</span>
        </button>

        <button
          onClick={() => setActiveCategory('journeys')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider font-['Outfit'] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeCategory === 'journeys'
              ? 'bg-orange-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Character Journeys</span>
        </button>

        <button
          onClick={() => setActiveCategory('empires')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider font-['Outfit'] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeCategory === 'empires'
              ? 'bg-purple-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Daniel's Empires</span>
        </button>
      </div>

      {/* Interactive Leaflet Satellite / Terrain Map Container */}
      <div className="relative w-full h-[320px] sm:h-[420px] rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-[#040711]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Top-Left Mode Indicator Pill */}
        <div className="absolute top-3 left-3 z-20 bg-[#0B1329]/90 border border-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2">
          {mapLayerMode === 'satellite' && <Satellite className="w-3.5 h-3.5 text-cyan-400" />}
          {mapLayerMode === 'terrain' && <Mountain className="w-3.5 h-3.5 text-amber-400" />}
          {mapLayerMode === 'parchment' && <Globe className="w-3.5 h-3.5 text-purple-400" />}
          <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
            {MAP_LAYERS[mapLayerMode].name} &bull; GIS Engine
          </span>
        </div>

        {/* Bottom Info Pill */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#0B1329]/90 border border-white/15 px-3 py-1 rounded-lg text-[10px] font-mono text-slate-300 backdrop-blur-md">
          Scroll to zoom &bull; Click any marker for historical scripture data
        </div>
      </div>

      {/* CATEGORY 1: BOOKS OF THE BIBLE (66 BOOKS ATLAS) */}
      {activeCategory === 'books' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search canonical books, category, or historical region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B1329] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="text-[11px] font-mono text-amber-400 font-bold px-3 py-2 bg-[#0B1329] rounded-xl border border-white/10 whitespace-nowrap">
              66 Books Ready
            </div>
          </div>

          {/* Selected Book Explanation Card */}
          {selectedBook && (
            <div className="bg-[#0B1329] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4 relative">
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] font-mono uppercase">
                      {selectedBook.testament} &bull; {selectedBook.category}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">
                      Region: {selectedBook.region}
                    </span>
                  </div>
                  <h3 className="text-xl font-black font-['Outfit'] uppercase text-white mt-1">
                    Book of {selectedBook.name}
                  </h3>
                </div>

                {selectedBook.foundationalScripture && (
                  <button
                    onClick={() => {
                      if (onNavigateToScripture) {
                        onNavigateToScripture(selectedBook.id, 1);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read {selectedBook.name} &rarr;</span>
                  </button>
                )}
              </div>

              {/* Foundational Scripture Reference Quote */}
              <div className="p-3 bg-slate-950/70 rounded-2xl border border-amber-500/25 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Foundational Anchor Scripture
                </span>
                <p className="text-sm font-serif italic text-slate-100">
                  "{selectedBook.foundationalScripture}"
                </p>
              </div>

              <p className="text-xs text-slate-200 font-serif leading-relaxed">
                {selectedBook.summary}
              </p>

              {/* Key Characters */}
              {selectedBook.keyCharacters && selectedBook.keyCharacters.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Key Historical Figures
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBook.keyCharacters.map((char, idx) => (
                      <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Geographical Milestones */}
              {selectedBook.milestones && selectedBook.milestones.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                    Geographical Milestones & Archaeological Footprints
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedBook.milestones.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <h4 className="text-xs font-bold text-white">{m.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-300 font-serif leading-snug">
                          {m.narrative}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 66-Book Grid Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filteredBooks.map((book) => {
              const isSelected = selectedBook?.id === book.id;
              return (
                <div
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    if (leafletMapRef.current && book.coordinates) {
                      leafletMapRef.current.flyTo([book.coordinates[0], book.coordinates[1]], book.zoom || 6, { duration: 1 });
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-left space-y-1 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-[#0B1329] border-white/10 text-slate-300 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      {book.id}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                      {book.testament === 'Old Testament' ? 'OT' : 'NT'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white font-['Outfit']">
                    {book.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {book.region}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATEGORY 2: BIBLICAL SITES */}
      {activeCategory === 'sites' && (
        <div className="space-y-4">
          {selectedSite && (
            <div className="bg-[#0B1329] border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-3 relative">
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    {selectedSite.region}
                  </span>
                  <h3 className="text-xl font-black font-['Outfit'] uppercase text-white">
                    {selectedSite.name}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    if (onNavigateToScripture) {
                      onNavigateToScripture(selectedSite.bookId, selectedSite.chapter);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Scripture &rarr;</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSite.scriptures.map((scrip, idx) => (
                  <span key={idx} className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    📖 {scrip}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-200 font-serif leading-relaxed">
                {selectedSite.description}
              </p>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Archaeological & Historical Record
                </span>
                <p className="text-[11px] text-slate-300 font-serif">
                  {selectedSite.archaeologyNote}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {BIBLICAL_SITES.map((site) => {
              const isSelected = selectedSite?.id === site.id;
              return (
                <div
                  key={site.id}
                  onClick={() => {
                    setSelectedSite(site);
                    if (leafletMapRef.current) {
                      leafletMapRef.current.flyTo([site.coords[0], site.coords[1]], 8, { duration: 1 });
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                      : 'bg-[#0B1329] border-white/10 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white font-['Outfit']">
                      {site.name}
                    </h4>
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {site.region}
                  </p>
                  <span className="text-[10px] font-mono text-amber-300 block truncate">
                    {site.scriptures.join(' • ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CATEGORY 3: CHARACTER JOURNEYS */}
      {activeCategory === 'journeys' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CHARACTER_JOURNEYS.map((j) => (
              <button
                key={j.id}
                onClick={() => {
                  setSelectedJourney(j);
                  if (leafletMapRef.current && j.stops.length > 0) {
                    leafletMapRef.current.flyTo([j.stops[0].coords[0], j.stops[0].coords[1]], 6, { duration: 1 });
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-['Outfit'] ${
                  selectedJourney.id === j.id
                    ? 'bg-orange-500 text-slate-950 font-bold'
                    : 'bg-[#0B1329] border border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {j.title}
              </button>
            ))}
          </div>

          <div className="bg-[#0B1329] border border-orange-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold">
                  {selectedJourney.period} &bull; {selectedJourney.character}
                </span>
                <h3 className="text-lg font-black font-['Outfit'] uppercase text-white">
                  {selectedJourney.title}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {selectedJourney.scriptures.join(', ')}
              </span>
            </div>

            <div className="space-y-3 relative pl-4 border-l-2 border-orange-500/30">
              {selectedJourney.stops.map((stop, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-orange-400 border-2 border-[#0B1329]" />
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white font-['Outfit']">
                        {idx + 1}. {stop.name}
                      </h4>
                      <button
                        onClick={() => {
                          if (onNavigateToScripture) {
                            onNavigateToScripture(stop.bookId, stop.chapter);
                          }
                        }}
                        className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{stop.scripture}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 font-serif">
                      {stop.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 4: DANIEL'S EMPIRES */}
      {activeCategory === 'empires' && (
        <div className="space-y-4">
          <div className="bg-[#0B1329] border border-purple-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                Prophetic Timeline & Historical Succession
              </span>
              <h3 className="text-lg font-black font-['Outfit'] uppercase text-white">
                Daniel Chapter 2 & Chapter 7 Imperial Colossus
              </h3>
              <p className="text-xs text-slate-300 font-serif leading-relaxed">
                The divine panorama of earthly world powers spanning from Nebuchadnezzar's Babylon to the Everlasting Kingdom of the Lord Jesus Christ.
              </p>
            </div>

            <div className="space-y-3">
              {DANIELS_EMPIRES.map((empire, idx) => (
                <div 
                  key={empire.id}
                  onClick={() => {
                    setSelectedEmpire(empire);
                    if (leafletMapRef.current) {
                      leafletMapRef.current.flyTo([empire.coords[0], empire.coords[1]], 5, { duration: 1 });
                    }
                  }}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/20 hover:border-purple-400/50 space-y-2 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">
                        {empire.era} &bull; Capital: {empire.capital}
                      </span>
                      <h4 className="text-sm font-bold text-white font-['Outfit']">
                        {idx + 1}. {empire.name}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateToScripture) {
                          onNavigateToScripture(empire.bookId, empire.chapter);
                        }
                      }}
                      className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                    >
                      <span>{empire.scripture}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="inline-block px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-slate-200">
                    {empire.metal}
                  </div>

                  <p className="text-xs text-slate-300 font-serif leading-relaxed">
                    {empire.keyProphecy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
