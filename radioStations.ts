export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  location: string;
  streamUrl: string;
  accentColor: string;
  description: string;
}

export const GOSPEL_STATIONS: RadioStation[] = [
  {
    id: "youngfire-core",
    name: "24/7 Praise & Gospel Radio",
    genre: "Live Apostolic & Contemporary Worship Stream",
    location: "San Antonio, TX / Global",
    streamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
    accentColor: "#F59E0B",
    description: "Live apostolic and contemporary worship stream: continuous high-praise gospel, Holy Ghost worship, and Jesus exaltation."
  },
  {
    id: "cbn-southern-gospel",
    name: "CBN Southern Gospel Anthems",
    genre: "Southern Gospel & Quartets",
    location: "Virginia Beach, VA",
    streamUrl: "https://streams.cbnradio.com//southern-gospel-128K",
    accentColor: "#EAB308",
    description: "Soulful southern gospel melodies, four-part vocal harmonies, and classic resurrection praise."
  },
  {
    id: "worship-lift",
    name: "Worship 24/7 & Modern Praise",
    genre: "Contemporary Christian Worship",
    location: "Nashville, TN",
    streamUrl: "https://emg.streamguys1.com/lift-website",
    accentColor: "#0EA5E9",
    description: "Modern elevation praise, passionate altar worship, and stadium gospel anthems."
  },
  {
    id: "afrobeats-gospel",
    name: "Afrobeats & African Praise",
    genre: "Afro-Gospel & Highlife",
    location: "Lagos / London",
    streamUrl: "https://stream.zeno.fm/zyd9stmdlnlvv",
    accentColor: "#F97316",
    description: "Energetic African gospel rhythms, joyful dance worship, and vibrant diaspora praise."
  },
  {
    id: "gospel-east-africa",
    name: "Gospel Radio East Africa",
    genre: "East African Gospel & Praise",
    location: "Nairobi, Kenya",
    streamUrl: "https://c32.radioboss.fm:18451/stream",
    accentColor: "#10B981",
    description: "Vibrant Swahili praise, heartfelt adoration, and East African choir harmonies."
  },
  {
    id: "sanctuary-piano",
    name: "Sanctuary Soaking Piano & Hymns",
    genre: "Instrumental Worship & Meditation",
    location: "Global Prayer Room",
    streamUrl: "https://s.ruworship.ru:4045/stream",
    accentColor: "#8B5CF6",
    description: "Peaceful acoustic piano, soaking worship chords, and calm prayer room atmospheres."
  },
  {
    id: "rejoice-gospel",
    name: "Rejoice Musical Soul Food",
    genre: "Traditional & Modern Gospel",
    location: "Atlanta, GA",
    streamUrl: "https://stream.zeno.fm/4wvy4v6v2zquv",
    accentColor: "#EC4899",
    description: "Inspirational gospel anthems, uplifting choir ministrations, and holy spirit joy."
  },
  {
    id: "christmas-gospel",
    name: "Sanctuary Seasonal & Holy Praise",
    genre: "Worship Classics & Seasonal",
    location: "Jerusalem & Worldwide",
    streamUrl: "https://streams.cbnradio.com//christmas-128K",
    accentColor: "#14B8A6",
    description: "Heartfelt adoration of our King, seasonal gospel melodies, and sacred worship."
  }
];
