export interface LaunchTrackOption {
  id: string;
  title: string;
  artist: string;
  subtext?: string;
  type: 'radio' | 'track';
  audioUrl: string;
  accentColor?: string;
}

// 24/7 Live Gospel Radio Streams (Verified continuous direct audio streams)
export const AVAILABLE_LAUNCH_TRACKS: LaunchTrackOption[] = [
  {
    id: 'youngfire_247_praise_gospel_radio',
    title: '24/7 Praise & Gospel Radio',
    artist: 'Live Apostolic & Contemporary Worship Stream',
    subtext: 'Live Apostolic & Contemporary Worship Stream',
    type: 'radio',
    audioUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    accentColor: '#F59E0B'
  },
  {
    id: 'youngfire_global_kingdom_radio',
    title: 'Kingdom Flame 24/7 Global Radio',
    artist: 'Urban & Global Kingdom Worship',
    subtext: 'Continuous High-Praise Gospel & Altar Declarations',
    type: 'radio',
    audioUrl: 'https://stream.0nlineradio.com/gospel?ref=radiobrowser',
    accentColor: '#F59E0B'
  },
  {
    id: 'youngfire_modern_praise',
    title: 'Worship 24/7 & Modern Praise',
    artist: 'Contemporary Christian Worship',
    subtext: 'Live Apostolic Altar Worship & Anthems',
    type: 'radio',
    audioUrl: 'https://emg.streamguys1.com/lift-website',
    accentColor: '#0EA5E9'
  }
];
