import { Track } from '@/types/music';

// Official album covers verified from Spotify CDN, JioSaavn CDN, and Wikimedia
export const COVERS = {
  illuminati: 'https://i.scdn.co/image/ab67616d0000b273b54cdfbfaa828674ffecd12c',
  aaveshamSoundtrack: 'https://c.saavncdn.com/202/Aavesham-Original-Motion-Picture-Soundtrack-Malayalam-2024-20250910150630-500x500.jpg',
  blindingLights: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png',
  starboy: 'https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png',
  shapeOfYou: 'https://upload.wikimedia.org/wikipedia/en/4/45/Divide_cover.png',
  thinkingOutLoud: 'https://upload.wikimedia.org/wikipedia/en/a/ad/X_cover.png',
  forAReason: 'https://c.saavncdn.com/505/Street-Dreams-Hindi-2024-20240220085345-500x500.jpg',
  wavy: 'https://c.saavncdn.com/178/Wavy-Punjabi-2024-20250523044332-500x500.jpg',
  snowfall: 'https://upload.wikimedia.org/wikipedia/en/e/e1/%C3%98neheart_-_Snowfall.jpg',
};

// Official artist portraits
export const ARTIST_PHOTOS = {
  theWeeknd: 'https://c.saavncdn.com/artists/The_Weeknd_500x500.jpg',
  sushinShyam: 'https://c.saavncdn.com/artists/Sushin_Shyam_002_20250707125538_500x500.jpg',
  edSheeran: 'https://c.saavncdn.com/artists/Ed_Sheeran_500x500.jpg',
  karanAujla: 'https://c.saavncdn.com/artists/Karan_Aujla_005_20260925061936_500x500.jpg',
  travisScott: 'https://c.saavncdn.com/artists/Travis_Scott_20190823072138_500x500.jpg',
  metroBoomin: 'https://c.saavncdn.com/artists/Metro_Boomin_001_20250806083028_500x500.jpg',
};

export const FEATURED_TRACK: Track = {
  id: 'S1jo8K4kDJc',
  title: 'Illuminati (From "Aavesham")',
  artist: 'Sushin Shyam • Dabzee • Vinayak Sasikumar',
  album: 'Aavesham (Original Motion Picture Soundtrack)',
  duration: 213,
  cover: COVERS.illuminati,
  src: '/api/stream?videoId=S1jo8K4kDJc',
};

export const POPULAR_ARTISTS_LIST = [
  { name: 'The Weeknd', sub: '105M listeners', img: ARTIST_PHOTOS.theWeeknd },
  { name: 'Sushin Shyam', sub: 'Trending Now', subColor: 'var(--wx-cyan)', img: ARTIST_PHOTOS.sushinShyam },
  { name: 'Ed Sheeran', sub: 'Pop Icon', img: ARTIST_PHOTOS.edSheeran },
  { name: 'Karan Aujla', sub: 'Punjabi Wave', img: ARTIST_PHOTOS.karanAujla },
  { name: 'Travis Scott', sub: 'Utopia', img: ARTIST_PHOTOS.travisScott },
  { name: 'Metro Boomin', sub: 'Producer', img: ARTIST_PHOTOS.metroBoomin },
];

export const CORE_TRACKS: Track[] = [
  {
    id: 'S1jo8K4kDJc',
    title: 'Illuminati (From "Aavesham")',
    artist: 'Sushin Shyam, Dabzee',
    album: 'Aavesham OST',
    dateAdded: 'Yesterday',
    duration: 213,
    cover: COVERS.illuminati,
    src: '/api/stream?videoId=S1jo8K4kDJc',
  },
  {
    id: 'J7p4bzqLvCw',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    dateAdded: '3 days ago',
    duration: 202,
    cover: COVERS.blindingLights,
    src: '/api/stream?videoId=J7p4bzqLvCw',
  },
  {
    id: '3_g2un5M350',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    dateAdded: '2 weeks ago',
    duration: 231,
    cover: COVERS.starboy,
    src: '/api/stream?videoId=3_g2un5M350',
  },
  {
    id: 'xTvyyoF_LZY',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    dateAdded: '1 week ago',
    duration: 234,
    cover: COVERS.shapeOfYou,
    src: '/api/stream?videoId=xTvyyoF_LZY',
  },
  {
    id: 'fdz_cabS9BU',
    title: 'Thinking Out Loud',
    artist: 'Ed Sheeran',
    album: 'x (Multiply)',
    dateAdded: 'Oct 5',
    duration: 282,
    cover: COVERS.thinkingOutLoud,
    src: '/api/stream?videoId=fdz_cabS9BU',
  },
  {
    id: 'cWIGUPQqnSk',
    title: 'For A Reason',
    artist: 'Karan Aujla',
    album: 'Street Dreams',
    dateAdded: 'Oct 12',
    duration: 180,
    cover: COVERS.forAReason,
    src: '/api/stream?videoId=cWIGUPQqnSk',
  },
  {
    id: 'qlOwSBYKD6g',
    title: 'Wavy',
    artist: 'Karan Aujla',
    album: 'Four Me',
    dateAdded: 'Oct 8',
    duration: 184,
    cover: COVERS.wavy,
    src: '/api/stream?videoId=qlOwSBYKD6g',
  },
  {
    id: 'OtLcqr3RQJY',
    title: 'Snowfall',
    artist: 'Oneheart, reidenshi',
    album: 'Snowfall EP',
    dateAdded: 'Sep 28',
    duration: 122,
    cover: COVERS.snowfall,
    src: '/api/stream?videoId=OtLcqr3RQJY',
  },
];

export function getFallbackCover(videoId?: string): string {
  if (videoId && videoId.length === 11) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  return COVERS.illuminati;
}

