/* ═══════════════════════════════════════════════════════════════════
   SPOTIFY JAM MAP — CONCEPT DEMO
   Client-side prototype. No backend, no login. Mock data only.
   Sections:
     1. Data (headphones, accessories, palettes, songs, friends, chat)
     2. SVG avatar generator (Bitmoji-style characters + headphones)
     3. Character builder screen
     4. Map (Leaflet, Snapchat-style avatar pins)
     5. Sidebar (friends list, activity feed)
     6. Friend sheet (send songs, swipe-to-queue, chat)
     7. Listen Together / Block / Add Friend / Profile / Notifications
     8. Player bar
     9. Keyboard shortcuts + init
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   1. DATA
   ═══════════════════════════════════════════════════════════════════ */

const SKIN_TONES = ['#FFE0BD', '#F5CFA0', '#E8B98A', '#C68642', '#8D5524', '#5C3A21'];
const HAIR_COLORS = ['#1a1a1a', '#4a2c14', '#8B5A2B', '#D4A017', '#C0C0C0', '#E8613C', '#9b59f7', '#e84393', '#00b894'];
const SHIRT_COLORS = ['#1DB954', '#e22134', '#4a90e2', '#9b59f7', '#ffb800', '#ff69b4', '#ffffff', '#282828', '#00cec9', '#fd79a8'];

/* Headphone styles — each is a small SVG-drawing spec.
   type: 'over' (over-ear cans), 'buds' (earbuds w/ stem), 'clip' (bone-conduction) */
const HEADPHONES = [
  { id: 'airpods',    name: 'AirPods',       sub: 'Apple',       type: 'buds', color: '#ffffff', accent: '#e5e5e5' },
  { id: 'airpodsmax', name: 'AirPods Max',   sub: 'Apple',       type: 'over', color: '#c9c6cf', accent: '#a8a5ad' },
  { id: 'beats',      name: 'Beats Studio',  sub: 'Beats',       type: 'over', color: '#e22134', accent: '#b81a29' },
  { id: 'beatsfit',   name: 'Beats Fit',     sub: 'Beats',       type: 'buds', color: '#111111', accent: '#000000' },
  { id: 'sony',       name: 'Sony WH-1000',  sub: 'Sony',        type: 'over', color: '#1a1a1a', accent: '#000000' },
  { id: 'bose',       name: 'Bose QC',       sub: 'Bose',        type: 'over', color: '#2b3a55', accent: '#1e2a3f' },
  { id: 'jbl',        name: 'JBL Tune',      sub: 'JBL',         type: 'over', color: '#ff6600', accent: '#cc5200' },
  { id: 'marshall',   name: 'Marshall',      sub: 'Marshall',    type: 'over', color: '#1a1a1a', accent: '#d4af37' },
  { id: 'sennheiser', name: 'Sennheiser',    sub: 'Sennheiser',  type: 'over', color: '#0a2540', accent: '#c9a227' },
  { id: 'skullcandy', name: 'Skullcandy',    sub: 'Skullcandy',  type: 'buds', color: '#00d2ff', accent: '#0096b3' },
  { id: 'galaxy',     name: 'Galaxy Buds',   sub: 'Samsung',     type: 'buds', color: '#7b4fd4', accent: '#5f3ba8' },
  { id: 'shokz',      name: 'Shokz OpenRun', sub: 'Bone-conduct',type: 'clip', color: '#00c2b8', accent: '#009c94' },
  { id: 'none',       name: 'No headphones', sub: 'Speaker mode',type: 'none', color: '#000',    accent: '#000' },
];

/* Accessories — small extras drawn on the avatar */
const ACCESSORIES = [
  { id: 'none',    name: 'None',        emoji: '' },
  { id: 'glasses', name: 'Glasses',     emoji: '👓' },
  { id: 'shades',  name: 'Sunglasses',  emoji: '🕶️' },
  { id: 'cap',     name: 'Cap',         emoji: '🧢' },
  { id: 'beanie',  name: 'Beanie',      emoji: '🎿' },
];

/* Hairstyles — each drawn as SVG (see hairstyleSVG). */
const HAIRSTYLES = [
  { id: 'short',    name: 'Short' },
  { id: 'buzz',     name: 'Buzz cut' },
  { id: 'wavy',     name: 'Wavy' },
  { id: 'curly',    name: 'Curly' },
  { id: 'bangs',    name: 'Bangs' },
  { id: 'long',     name: 'Long' },
  { id: 'bun',      name: 'Top bun' },
  { id: 'ponytail', name: 'Ponytail' },
  { id: 'bald',     name: 'Bald / shaved' },
];

/* Outfits — drawn with the chosen outfit color (see outfitSVG). */
const OUTFITS = [
  { id: 'tee',    name: 'T-shirt', emoji: '👕' },
  { id: 'hoodie', name: 'Hoodie',  emoji: '🧥' },
  { id: 'jacket', name: 'Leather', emoji: '🖤' },
  { id: 'denim',  name: 'Denim',   emoji: '👖' },
];

/* Facial hair — drawn in the hair color (see facialHairSVG). */
const FACIAL_HAIR = [
  { id: 'none',     name: 'None',     emoji: '🚫' },
  { id: 'stubble',  name: 'Stubble',  emoji: '🧔' },
  { id: 'mustache', name: 'Mustache', emoji: '👨' },
  { id: 'goatee',   name: 'Goatee',   emoji: '🐐' },
  { id: 'beard',    name: 'Full beard',emoji: '🧔‍♂️' },
];

/* The "ink" outline colour that gives the Bitmoji look. */
const INK = '#2a1e15';

/* ═══════════════════════════════════════════════════════════════════
   CULTURAL PASSPORT — every country you hear music from gets collected.
   Your "% of worldwide cultural listening" = collected / total countries.
   ═══════════════════════════════════════════════════════════════════ */
const COUNTRIES = [
  // Europe
  {n:'Spain',f:'🇪🇸',r:'Europe'},{n:'United Kingdom',f:'🇬🇧',r:'Europe'},{n:'France',f:'🇫🇷',r:'Europe'},{n:'Italy',f:'🇮🇹',r:'Europe'},
  {n:'Germany',f:'🇩🇪',r:'Europe'},{n:'Portugal',f:'🇵🇹',r:'Europe'},{n:'Netherlands',f:'🇳🇱',r:'Europe'},{n:'Sweden',f:'🇸🇪',r:'Europe'},
  {n:'Ireland',f:'🇮🇪',r:'Europe'},{n:'Norway',f:'🇳🇴',r:'Europe'},{n:'Greece',f:'🇬🇷',r:'Europe'},{n:'Poland',f:'🇵🇱',r:'Europe'},
  {n:'Ukraine',f:'🇺🇦',r:'Europe'},{n:'Russia',f:'🇷🇺',r:'Europe'},{n:'Iceland',f:'🇮🇸',r:'Europe'},{n:'Belgium',f:'🇧🇪',r:'Europe'},
  {n:'Switzerland',f:'🇨🇭',r:'Europe'},{n:'Austria',f:'🇦🇹',r:'Europe'},{n:'Denmark',f:'🇩🇰',r:'Europe'},{n:'Finland',f:'🇫🇮',r:'Europe'},
  {n:'Croatia',f:'🇭🇷',r:'Europe'},{n:'Serbia',f:'🇷🇸',r:'Europe'},{n:'Romania',f:'🇷🇴',r:'Europe'},{n:'Hungary',f:'🇭🇺',r:'Europe'},
  {n:'Czechia',f:'🇨🇿',r:'Europe'},{n:'Turkey',f:'🇹🇷',r:'Europe'},
  // Americas
  {n:'United States',f:'🇺🇸',r:'Americas'},{n:'Canada',f:'🇨🇦',r:'Americas'},{n:'Mexico',f:'🇲🇽',r:'Americas'},{n:'Brazil',f:'🇧🇷',r:'Americas'},
  {n:'Argentina',f:'🇦🇷',r:'Americas'},{n:'Colombia',f:'🇨🇴',r:'Americas'},{n:'Puerto Rico',f:'🇵🇷',r:'Americas'},{n:'Chile',f:'🇨🇱',r:'Americas'},
  {n:'Peru',f:'🇵🇪',r:'Americas'},{n:'Jamaica',f:'🇯🇲',r:'Americas'},{n:'Cuba',f:'🇨🇺',r:'Americas'},{n:'Dominican Republic',f:'🇩🇴',r:'Americas'},
  {n:'Venezuela',f:'🇻🇪',r:'Americas'},{n:'Ecuador',f:'🇪🇨',r:'Americas'},{n:'Uruguay',f:'🇺🇾',r:'Americas'},{n:'Bolivia',f:'🇧🇴',r:'Americas'},
  {n:'Guatemala',f:'🇬🇹',r:'Americas'},{n:'Costa Rica',f:'🇨🇷',r:'Americas'},{n:'Panama',f:'🇵🇦',r:'Americas'},{n:'Trinidad & Tobago',f:'🇹🇹',r:'Americas'},
  // Asia
  {n:'South Korea',f:'🇰🇷',r:'Asia'},{n:'Japan',f:'🇯🇵',r:'Asia'},{n:'China',f:'🇨🇳',r:'Asia'},{n:'India',f:'🇮🇳',r:'Asia'},
  {n:'Indonesia',f:'🇮🇩',r:'Asia'},{n:'Philippines',f:'🇵🇭',r:'Asia'},{n:'Thailand',f:'🇹🇭',r:'Asia'},{n:'Vietnam',f:'🇻🇳',r:'Asia'},
  {n:'Malaysia',f:'🇲🇾',r:'Asia'},{n:'Pakistan',f:'🇵🇰',r:'Asia'},{n:'Bangladesh',f:'🇧🇩',r:'Asia'},{n:'Israel',f:'🇮🇱',r:'Asia'},
  {n:'Saudi Arabia',f:'🇸🇦',r:'Asia'},{n:'United Arab Emirates',f:'🇦🇪',r:'Asia'},{n:'Iran',f:'🇮🇷',r:'Asia'},{n:'Kazakhstan',f:'🇰🇿',r:'Asia'},
  {n:'Sri Lanka',f:'🇱🇰',r:'Asia'},{n:'Nepal',f:'🇳🇵',r:'Asia'},{n:'Singapore',f:'🇸🇬',r:'Asia'},{n:'Lebanon',f:'🇱🇧',r:'Asia'},
  // Africa
  {n:'Nigeria',f:'🇳🇬',r:'Africa'},{n:'South Africa',f:'🇿🇦',r:'Africa'},{n:'Egypt',f:'🇪🇬',r:'Africa'},{n:'Ghana',f:'🇬🇭',r:'Africa'},
  {n:'Kenya',f:'🇰🇪',r:'Africa'},{n:'Morocco',f:'🇲🇦',r:'Africa'},{n:'Ethiopia',f:'🇪🇹',r:'Africa'},{n:'Tanzania',f:'🇹🇿',r:'Africa'},
  {n:'Senegal',f:'🇸🇳',r:'Africa'},{n:'Angola',f:'🇦🇴',r:'Africa'},{n:'Algeria',f:'🇩🇿',r:'Africa'},{n:'Ivory Coast',f:'🇨🇮',r:'Africa'},
  {n:'Cameroon',f:'🇨🇲',r:'Africa'},{n:'Uganda',f:'🇺🇬',r:'Africa'},{n:'Congo (DRC)',f:'🇨🇩',r:'Africa'},{n:'Zimbabwe',f:'🇿🇼',r:'Africa'},
  {n:'Tunisia',f:'🇹🇳',r:'Africa'},{n:'Mali',f:'🇲🇱',r:'Africa'},
  // Oceania
  {n:'Australia',f:'🇦🇺',r:'Oceania'},{n:'New Zealand',f:'🇳🇿',r:'Oceania'},{n:'Fiji',f:'🇫🇯',r:'Oceania'},{n:'Papua New Guinea',f:'🇵🇬',r:'Oceania'},
];
/* The user's vision: "if there are 236 countries, the % is out of that." */
const WORLD_TOTAL = 236;
const REGIONS = ['Europe','Americas','Asia','Africa','Oceania'];

/* Which country each track's music comes from. */
const SONG_COUNTRY = {
  'Blinding Lights':'Canada','Starboy':'Canada','Peaches':'Canada','Señorita':'Canada','Stay':'Australia',
  'bad guy':'United States','Flowers':'United States','Anti-Hero':'United States','Cruel Summer':'United States',
  'drivers license':'United States','Closer':'United States','Thunder':'United States','Sunflower':'United States',
  'As It Was':'United Kingdom','Watermelon Sugar':'United Kingdom','Levitating':'United Kingdom','Heat Waves':'United Kingdom',
  'Shape of You':'United Kingdom','Uptown Funk':'United Kingdom','Seven':'South Korea','Dynamite':'South Korea',
  'Dance Monkey':'Australia','You Can Be Loved':'Jamaica',
  // international additions below
  'Despacito':'Puerto Rico','Gangnam Style':'South Korea','Waka Waka':'Colombia','Jerusalema':'South Africa',
  'La Vie en Rose':'France','Volare':'Italy','Calm Down':'Nigeria','Baila Esta Cumbia':'Mexico',
};
function songCountry(name){ return SONG_COUNTRY[name] || 'United States'; }

/* Approximate coordinates (capital-ish) for glowing collected countries on the map. */
const COUNTRY_COORDS = {
  'Spain':[40.4,-3.7],'United Kingdom':[51.5,-0.1],'France':[48.85,2.35],'Italy':[41.9,12.5],'Germany':[52.52,13.4],
  'Portugal':[38.72,-9.14],'Netherlands':[52.37,4.9],'Sweden':[59.33,18.06],'Ireland':[53.35,-6.26],'Norway':[59.91,10.75],
  'Greece':[37.98,23.73],'Poland':[52.23,21.01],'Ukraine':[50.45,30.52],'Russia':[55.75,37.62],'Iceland':[64.15,-21.95],
  'Belgium':[50.85,4.35],'Switzerland':[46.95,7.45],'Austria':[48.21,16.37],'Denmark':[55.68,12.57],'Finland':[60.17,24.94],
  'Croatia':[45.81,15.98],'Serbia':[44.79,20.45],'Romania':[44.43,26.1],'Hungary':[47.5,19.04],'Czechia':[50.08,14.44],'Turkey':[39.93,32.86],
  'United States':[38.9,-77.04],'Canada':[45.42,-75.7],'Mexico':[19.43,-99.13],'Brazil':[-15.79,-47.88],'Argentina':[-34.6,-58.38],
  'Colombia':[4.71,-74.07],'Puerto Rico':[18.47,-66.11],'Chile':[-33.45,-70.67],'Peru':[-12.05,-77.04],'Jamaica':[18.02,-76.8],
  'Cuba':[23.11,-82.37],'Dominican Republic':[18.49,-69.9],'Venezuela':[10.48,-66.9],'Ecuador':[-0.18,-78.47],'Uruguay':[-34.9,-56.16],
  'Bolivia':[-16.5,-68.15],'Guatemala':[14.63,-90.51],'Costa Rica':[9.93,-84.08],'Panama':[8.98,-79.52],'Trinidad & Tobago':[10.65,-61.5],
  'South Korea':[37.57,126.98],'Japan':[35.68,139.69],'China':[39.9,116.4],'India':[28.61,77.21],'Indonesia':[-6.2,106.85],
  'Philippines':[14.6,120.98],'Thailand':[13.75,100.5],'Vietnam':[21.03,105.85],'Malaysia':[3.14,101.69],'Pakistan':[33.69,73.06],
  'Bangladesh':[23.81,90.41],'Israel':[31.77,35.21],'Saudi Arabia':[24.71,46.68],'United Arab Emirates':[24.45,54.38],'Iran':[35.69,51.39],
  'Kazakhstan':[51.16,71.44],'Sri Lanka':[6.93,79.85],'Nepal':[27.7,85.32],'Singapore':[1.35,103.82],'Lebanon':[33.89,35.5],
  'Nigeria':[9.08,7.4],'South Africa':[-25.75,28.19],'Egypt':[30.04,31.24],'Ghana':[5.6,-0.19],'Kenya':[-1.29,36.82],
  'Morocco':[34.02,-6.83],'Ethiopia':[9.03,38.74],'Tanzania':[-6.16,35.75],'Senegal':[14.72,-17.47],'Angola':[-8.84,13.23],
  'Algeria':[36.75,3.06],'Ivory Coast':[5.35,-4.03],'Cameroon':[3.85,11.5],'Uganda':[0.35,32.58],'Congo (DRC)':[-4.32,15.31],
  'Zimbabwe':[-17.83,31.05],'Tunisia':[36.8,10.18],'Mali':[12.64,-8.0],
  'Australia':[-35.28,149.13],'New Zealand':[-41.29,174.78],'Fiji':[-18.14,178.44],'Papua New Guinea':[-9.44,147.18],
};

/* Explorer rank/title based on how much of the world you've heard. */
function passportTitle(pct) {
  if (pct >= 100) return '🏆 Cultural Legend';
  if (pct >= 60) return '🌟 World Citizen';
  if (pct >= 35) return '🧭 Globetrotter';
  if (pct >= 15) return '✈️ Wanderer';
  if (pct >= 5) return '🎒 Explorer';
  return '🌱 Rookie Listener';
}

/* Mock passport % for demo friends (for the leaderboard). */
const FRIEND_PASSPORT = { 1: 14.4, 2: 22.0, 3: 6.4, 4: 31.4, 5: 4.7, 6: 18.6, 7: 9.7 };

/* Song catalog (mock). Album art from Spotify CDN. */
const SONGS = [
  { name:'Blinding Lights',  artist:'The Weeknd',                     album:'After Hours',              dur:'3:59', art:'https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268' },
  { name:'bad guy',          artist:'Billie Eilish',                  album:'WHEN WE ALL FALL ASLEEP…', dur:'3:14', art:'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163' },
  { name:'As It Was',        artist:'Harry Styles',                   album:"Harry's House",            dur:'2:37', art:'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0' },
  { name:'Flowers',          artist:'Miley Cyrus',                    album:'Endless Summer Vacation',  dur:'3:21', art:'https://i.scdn.co/image/ab67616d0000b273b8aa2c63cff1a92cd23f5cc2' },
  { name:'Anti-Hero',        artist:'Taylor Swift',                   album:'Midnights',                dur:'3:20', art:'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' },
  { name:'Levitating',       artist:'Dua Lipa',                       album:'Future Nostalgia',         dur:'3:23', art:'https://i.scdn.co/image/ab67616d0000b2734bc66095f8a70bc4e6593f4f' },
  { name:'Stay',             artist:'The Kid LAROI & Justin Bieber',  album:'F*CK LOVE 3',              dur:'2:21', art:'https://i.scdn.co/image/ab67616d0000b27344b40b744e8d0e2f1dda4b48' },
  { name:'Heat Waves',       artist:'Glass Animals',                  album:'Dreamland',                dur:'3:59', art:'https://i.scdn.co/image/ab67616d0000b273712b1a8f2e5680c5d6d9a931' },
  { name:'Seven',            artist:'Jung Kook ft. Latto',            album:'Golden',                   dur:'3:03', art:'https://i.scdn.co/image/ab67616d0000b27369026e59440706b3a7d0fa4a' },
  { name:'Shape of You',     artist:'Ed Sheeran',                     album:'÷ (Divide)',               dur:'3:53', art:'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96' },
  { name:'drivers license',  artist:'Olivia Rodrigo',                 album:'SOUR',                     dur:'4:02', art:'https://i.scdn.co/image/ab67616d0000b27363f1f3c03a8f9b74eaf0f8a7' },
  { name:'Starboy',          artist:'The Weeknd ft. Daft Punk',       album:'Starboy',                  dur:'3:50', art:'https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268' },
  { name:'Dance Monkey',     artist:'Tones and I',                    album:'The Kids Are Coming',      dur:'3:29', art:'https://i.scdn.co/image/ab67616d0000b273712b1a8f2e5680c5d6d9a931' },
  { name:'Watermelon Sugar', artist:'Harry Styles',                   album:'Fine Line',                dur:'2:54', art:'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0' },
  { name:'Closer',           artist:'The Chainsmokers ft. Halsey',    album:'Collage',                  dur:'4:05', art:'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163' },
  { name:'Thunder',          artist:'Imagine Dragons',                album:'Evolve',                   dur:'3:07', art:'https://i.scdn.co/image/ab67616d0000b2736b26b56c07f04c69cf6c225f' },
  { name:'Uptown Funk',      artist:'Mark Ronson ft. Bruno Mars',     album:'Uptown Special',           dur:'4:30', art:'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163' },
  { name:'Peaches',          artist:'Justin Bieber ft. Daniel Caesar',album:'Justice',                  dur:'3:18', art:'https://i.scdn.co/image/ab67616d0000b2739478c87599550dd73bfa7e02' },
  { name:'Sunflower',        artist:'Post Malone & Swae Lee',         album:'Spider-Man: Into…',        dur:'2:38', art:'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f' },
  { name:'Cruel Summer',     artist:'Taylor Swift',                   album:'Lover',                    dur:'2:58', art:'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' },
  { name:'You Can Be Loved', artist:'Jam Map Sessions',               album:'Singles',                  dur:'3:12', art:'https://i.scdn.co/image/ab67616d0000b2734bc66095f8a70bc4e6593f4f' },
  { name:'Despacito',        artist:'Luis Fonsi ft. Daddy Yankee',    album:'Vida',                     dur:'3:47', art:'https://i.scdn.co/image/ab67616d0000b273ef0d4234e1a645740f77d59c' },
  { name:'Gangnam Style',    artist:'PSY',                            album:'Psy 6',                    dur:'3:39', art:'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163' },
  { name:'Waka Waka',        artist:'Shakira',                        album:'Listen Up!',               dur:'3:22', art:'https://i.scdn.co/image/ab67616d0000b273b8aa2c63cff1a92cd23f5cc2' },
  { name:'Jerusalema',       artist:'Master KG ft. Nomcebo',         album:'Jerusalema',               dur:'4:15', art:'https://i.scdn.co/image/ab67616d0000b273712b1a8f2e5680c5d6d9a931' },
  { name:'Calm Down',        artist:'Rema',                           album:'Rave & Roses',             dur:'3:40', art:'https://i.scdn.co/image/ab67616d0000b27369026e59440706b3a7d0fa4a' },
];

/* Friends. Each has their own avatar spec (skin, hair, shirt, phones). */
const FRIENDS = [
  { id:1, name:'Max',    city:'New York',  country:'USA',    flag:'🇺🇸', lat:40.71,  lng:-74.00,  ring:'#FF6B6B', online:true,  lastSeen:null,          skin:'#F5CFA0', hair:'#4a2c14', hairstyle:'short',    beard:'stubble', shirt:'#3a3a3a', outfit:'jacket', phones:'beats',      acc:'none',    track:'Blinding Lights', artist:'The Weeknd',   art:SONGS[0].art, unread:1 },
  { id:2, name:'Sofia',  city:'Barcelona', country:'Spain',  flag:'🇪🇸', lat:41.38,  lng:2.17,    ring:'#9b59f7', online:true,  lastSeen:null,          skin:'#E8B98A', hair:'#1a1a1a', hairstyle:'long',     beard:'none',    shirt:'#2b2b2b', outfit:'jacket', phones:'airpods',    acc:'shades',  track:'bad guy',         artist:'Billie Eilish',art:SONGS[1].art, unread:0 },
  { id:3, name:'Jake',   city:'London',    country:'UK',     flag:'🇬🇧', lat:51.50,  lng:-0.12,   ring:'#4a90e2', online:true,  lastSeen:null,          skin:'#FFE0BD', hair:'#D4A017', hairstyle:'buzz',     beard:'none',    shirt:'#ffffff', outfit:'tee',    phones:'sony',       acc:'none',    track:'As It Was',       artist:'Harry Styles', art:SONGS[2].art, unread:0 },
  { id:4, name:'Mia',    city:'Tokyo',     country:'Japan',  flag:'🇯🇵', lat:35.68,  lng:139.69,  ring:'#FF69B4', online:true,  lastSeen:null,          skin:'#F5CFA0', hair:'#e8613c', hairstyle:'bangs',    beard:'none',    shirt:'#8fb6e8', outfit:'denim',  phones:'airpodsmax', acc:'glasses', track:'Seven',           artist:'Jung Kook',    art:SONGS[8].art, unread:0 },
  { id:5, name:'Carlos', city:'São Paulo', country:'Brazil', flag:'🇧🇷', lat:-23.55, lng:-46.63,  ring:'#2ACEA7', online:false, lastSeen:'20 min ago',  skin:'#8D5524', hair:'#1a1a1a', hairstyle:'curly',    beard:'beard',   shirt:'#2ACEA7', outfit:'hoodie', phones:'jbl',        acc:'none',    track:'Flowers',         artist:'Miley Cyrus',  art:SONGS[3].art, unread:0 },
  { id:6, name:'Priya',  city:'Mumbai',    country:'India',  flag:'🇮🇳', lat:19.07,  lng:72.87,   ring:'#FFB800', online:false, lastSeen:'2 hours ago', skin:'#C68642', hair:'#1a1a1a', hairstyle:'ponytail', beard:'none',    shirt:'#8fb6e8', outfit:'denim',  phones:'galaxy',     acc:'none',    track:'Levitating',      artist:'Dua Lipa',     art:SONGS[5].art, unread:0 },
  { id:7, name:'Simon',  city:'Madrid',    country:'Spain',  flag:'🇪🇸', lat:40.42,  lng:-3.70,   ring:'#1DB954', online:true,  lastSeen:null,          skin:'#E8B98A', hair:'#4a2c14', hairstyle:'short',    beard:'goatee',  shirt:'#1DB954', outfit:'hoodie', phones:'airpods',    acc:'none',    track:'Starboy',         artist:'The Weeknd',   art:SONGS[11].art, unread:0 },
];

/* Chat history keyed by friend id */
const CHATS = {
  1: [
    { day:'YESTERDAY' },
    { from:'them', text:'yo you gotta hear this', time:'9:42 PM' },
    { from:'them', song:{ name:'Blinding Lights', artist:'The Weeknd', art:SONGS[0].art }, time:'9:42 PM' },
    { from:'me',   text:'ADDED. this goes so hard 🔥', time:'9:45 PM' },
    { day:'TODAY' },
    { from:'them', text:'send me something new', time:'11:02 AM' },
  ],
  2: [
    { day:'TODAY' },
    { from:'me',   text:'barcelona weather must be unreal rn', time:'2:10 PM' },
    { from:'them', text:'perfect ☀️ making a summer playlist', time:'2:12 PM' },
    { from:'them', song:{ name:'bad guy', artist:'Billie Eilish', art:SONGS[1].art }, time:'2:13 PM' },
  ],
  3: [ { day:'TODAY' }, { from:'them', text:'listening together later?', time:'4:30 PM' } ],
  4: [ { day:'TODAY' }, { from:'me', text:'ohayo 🌸', time:'8:00 AM' }, { from:'them', text:'send tunes!', time:'8:05 AM' } ],
  5: [ { day:'LAST WEEK' }, { from:'them', text:'thanks for the flowers track 💚', time:'Mon' } ],
  6: [ { day:'LAST WEEK' }, { from:'me', text:'levitating is stuck in my head', time:'Fri' } ],
  7: [ { day:'TODAY' }, { from:'them', text:'yo I just logged into Jam Map 🎧', time:'10:15 AM' }, { from:'them', text:'send me something good', time:'10:15 AM' } ],
};

/* Activity feed */
const ACTIVITY = [
  { ico:'🎵', color:'#FF6B6B', msg:'<strong>Max</strong> added "Blinding Lights" to your queue', time:'just now' },
  { ico:'🎧', color:'#FFB800', msg:'<strong>Priya</strong> started listening to "Levitating"',    time:'2 min ago' },
  { ico:'📍', color:'#4a90e2', msg:'<strong>Jake</strong> just came online in London',            time:'5 min ago' },
  { ico:'💬', color:'#9b59f7', msg:'<strong>Sofia</strong> sent you a message',                    time:'8 min ago' },
  { ico:'💿', color:'#9b59f7', msg:'<strong>Sofia</strong> shared a song: "bad guy"',              time:'12 min ago' },
  { ico:'🤝', color:'#FF69B4', msg:'<strong>Mia</strong> listened together with you',              time:'28 min ago' },
  { ico:'🚀', color:'#2ACEA7', msg:'<strong>Carlos</strong> joined Spotify Jam Map',               time:'1 hr ago' },
];

/* People you might know (Add Friend > Find) */
const SUGGESTED = [
  { name:'Emma', sub:'@emma_beats · 3 mutual',    skin:'#FFE0BD', hair:'#8B5A2B', hairstyle:'wavy',  shirt:'#ff69b4', outfit:'hoodie', phones:'airpods' },
  { name:'Leo',  sub:'@leo.wav · 7 mutual',       skin:'#C68642', hair:'#1a1a1a', hairstyle:'short', shirt:'#4a90e2', outfit:'tee',    phones:'sony' },
  { name:'Nina', sub:'@ninatunes · 1 mutual',     skin:'#F5CFA0', hair:'#9b59f7', hairstyle:'bun',   shirt:'#9b59f7', outfit:'jacket', phones:'beats' },
  { name:'Omar', sub:'@omar_g · 12 mutual',       skin:'#8D5524', hair:'#1a1a1a', hairstyle:'curly', shirt:'#ffb800', outfit:'denim',  phones:'galaxy' },
];

/* ═══════════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════════ */

const ME = {
  name: 'Alec',
  skin: SKIN_TONES[0],
  hair: HAIR_COLORS[0],
  hairstyle: 'short',
  shirt: SHIRT_COLORS[0],
  outfit: 'tee',
  phones: 'airpods',
  acc: 'none',
  beard: 'none',
  city: 'Paris',
  country: 'France',
  lat: 48.85,
  lng: 2.35,
};

let curFriend = null;
let blockChoice = null;
let isPlaying = false, progVal = 35, progTimer = null;
let visSongs = SONGS;
// Cultural Passport — seed a few countries so it looks lived-in.
const collectedCountries = new Set(['United States', 'United Kingdom', 'Canada', 'Spain', 'South Korea', 'Brazil', 'Japan', 'Nigeria']);
const SW = {};              // swipe state per row
const THRESH = 110;         // swipe threshold px
let map = null;
const markerRefs = {};      // friend id -> leaflet marker
let youMarker = null;       // your own map pin (hidden in ghost mode)

/* Privacy & permissions */
const PRIVACY = {
  ghost: false,             // hide my location
  addPolicy: 'all',         // 'all' | 'close' | 'none' — who can add to my Jam
  askFirst: false,          // approve each incoming song
  closeFriends: new Set(),  // trusted friend ids (for 'close' policy)
};
let pendingReq = null;      // the incoming request awaiting approval

/* ═══════════════════════════════════════════════════════════════════
   2. SVG AVATAR GENERATOR
   Builds a Bitmoji-ish head+shoulders character with headphones drawn on.
   spec = { skin, hair, shirt, phones, acc }
   ═══════════════════════════════════════════════════════════════════ */

function headphoneSVG(phones) {
  const hp = HEADPHONES.find(h => h.id === phones) || HEADPHONES[0];
  if (hp.type === 'none') return '';

  if (hp.type === 'over') {
    // Over-ear headphones: headband arc + two ear cups
    return `
      <path d="M22 52 Q22 18 50 18 Q78 18 78 52" fill="none" stroke="${hp.accent}" stroke-width="7" stroke-linecap="round"/>
      <path d="M22 52 Q22 20 50 20 Q78 20 78 52" fill="none" stroke="${hp.color}" stroke-width="4" stroke-linecap="round"/>
      <rect x="13" y="46" width="16" height="26" rx="8" fill="${hp.color}" stroke="${hp.accent}" stroke-width="2"/>
      <rect x="71" y="46" width="16" height="26" rx="8" fill="${hp.color}" stroke="${hp.accent}" stroke-width="2"/>
      <ellipse cx="21" cy="59" rx="4" ry="7" fill="${hp.accent}" opacity=".6"/>
      <ellipse cx="79" cy="59" rx="4" ry="7" fill="${hp.accent}" opacity=".6"/>`;
  }

  if (hp.type === 'buds') {
    // Earbuds with little stems on each side
    return `
      <g>
        <circle cx="21" cy="56" r="6" fill="${hp.color}" stroke="${hp.accent}" stroke-width="1.5"/>
        <rect x="18.5" y="58" width="5" height="14" rx="2.5" fill="${hp.color}" stroke="${hp.accent}" stroke-width="1"/>
        <circle cx="79" cy="56" r="6" fill="${hp.color}" stroke="${hp.accent}" stroke-width="1.5"/>
        <rect x="76.5" y="58" width="5" height="14" rx="2.5" fill="${hp.color}" stroke="${hp.accent}" stroke-width="1"/>
      </g>`;
  }

  if (hp.type === 'clip') {
    // Bone-conduction: thin band behind head + hooks over ears
    return `
      <path d="M18 60 Q10 50 18 42" fill="none" stroke="${hp.color}" stroke-width="4" stroke-linecap="round"/>
      <path d="M82 60 Q90 50 82 42" fill="none" stroke="${hp.color}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="19" cy="58" r="3.5" fill="${hp.accent}"/>
      <circle cx="81" cy="58" r="3.5" fill="${hp.accent}"/>`;
  }
  return '';
}

function accessorySVG(acc, skin) {
  switch (acc) {
    case 'glasses':
      return `<g stroke="#222" stroke-width="2.5" fill="rgba(255,255,255,.15)">
        <circle cx="39" cy="52" r="8"/><circle cx="61" cy="52" r="8"/>
        <line x1="47" y1="52" x2="53" y2="52"/></g>`;
    case 'shades':
      return `<g fill="#111" stroke="#000" stroke-width="1.5">
        <rect x="30" y="46" width="18" height="12" rx="5"/><rect x="52" y="46" width="18" height="12" rx="5"/>
        <line x1="48" y1="50" x2="52" y2="50" stroke="#111" stroke-width="3"/></g>`;
    case 'cap':
      return `<g><path d="M26 34 Q50 14 74 34 L74 38 Q50 30 26 38 Z" fill="#1DB954"/>
        <path d="M26 37 Q18 39 16 44 L30 42 Z" fill="#149c46"/></g>`;
    case 'beanie':
      return `<g><path d="M26 36 Q50 12 74 36 L74 42 Q50 34 26 42 Z" fill="#e22134"/>
        <rect x="26" y="38" width="48" height="7" rx="3" fill="#b81a29"/></g>`;
    default: return '';
  }
}

/* Darken/lighten a hex color by pct (-1..1). Used for shading. */
function shade(hex, pct) {
  hex = (hex || '#000').replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  let r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  const f = 1 + pct;
  r = Math.max(0, Math.min(255, Math.round(r * f)));
  g = Math.max(0, Math.min(255, Math.round(g * f)));
  b = Math.max(0, Math.min(255, Math.round(b * f)));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/* Hair: returns { back, front } SVG layers for a given style + color.
   'back' renders behind the head/shoulders; 'front' over the forehead. */
function hairstyleSVG(style, hair) {
  const hl = shade(hair, 0.35);   // highlight
  const dk = shade(hair, -0.3);   // shadow
  const strand = `<path d="M40 30 Q50 27 60 30" stroke="${hl}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/>`;
  switch (style) {
    case 'bald':
      return { back: '', front: `<path d="M31 42 Q33 30 50 29 Q67 30 69 42 Q60 38 50 38 Q40 38 31 42 Z" fill="${hair}" opacity=".25"/>` };
    case 'buzz':
      return { back: '', front:
        `<path d="M31 45 Q31 26 50 26 Q69 26 69 45 Q62 37 50 36.5 Q38 37 31 45 Z" fill="${hair}"/>
         <path d="M31 45 Q31 26 50 26 Q69 26 69 45" fill="none" stroke="${dk}" stroke-width="1" opacity=".4"/>` };
    case 'short':
      return { back: '', front:
        `<path d="M28 46 Q27 23 50 23 Q73 23 72 46 Q66 32 50 31 Q34 32 28 46 Z" fill="${hair}"/>
         <path d="M28 46 Q26 36 31 29 Q30 41 34 44 Z" fill="${hair}"/>
         <path d="M72 46 Q74 36 69 29 Q70 41 66 44 Z" fill="${hair}"/>${strand}` };
    case 'wavy':
      return { back: '', front:
        `<path d="M27 48 Q26 22 50 22 Q74 22 73 48 Q71 40 66 34 Q63 42 57 34 Q54 42 50 33 Q46 42 43 34 Q37 42 34 34 Q29 40 27 48 Z" fill="${hair}"/>${strand}` };
    case 'curly':
      return { back:
        `<g fill="${hair}"><circle cx="30" cy="46" r="8"/><circle cx="70" cy="46" r="8"/></g>`, front:
        `<g fill="${hair}"><circle cx="34" cy="34" r="10"/><circle cx="47" cy="28" r="11"/><circle cx="60" cy="31" r="10"/><circle cx="30" cy="42" r="8"/><circle cx="70" cy="42" r="8"/></g>
         <g fill="${hl}" opacity=".5"><circle cx="45" cy="26" r="3"/><circle cx="58" cy="29" r="2.5"/></g>` };
    case 'bangs':
      return { back:
        `<path d="M27 44 Q27 46 28 56 L34 56 L34 44 Z" fill="${hair}"/><path d="M73 44 Q73 46 72 56 L66 56 L66 44 Z" fill="${hair}"/>`, front:
        `<path d="M27 47 Q27 22 50 22 Q73 22 73 47 Q73 45 68 44 L64 44 Q62 45 59 44 L55 44 Q52 45 49 44 L45 44 Q42 45 39 44 L35 44 Q30 45 27 47 Z" fill="${hair}"/>${strand}` };
    case 'long':
      return { back:
        `<path d="M25 44 Q25 20 50 20 Q75 20 75 44 L75 76 Q75 82 68 83 L62 60 L62 46 L38 46 L38 60 L32 83 Q25 82 25 76 Z" fill="${hair}"/>
         <path d="M25 44 L38 44 L38 62 L30 62 Z" fill="${dk}" opacity=".5"/>
         <path d="M75 44 L62 44 L62 62 L70 62 Z" fill="${dk}" opacity=".5"/>`, front:
        `<path d="M27 47 Q27 21 50 21 Q73 21 73 47 Q69 31 50 30 Q31 31 27 47 Z" fill="${hair}"/>
         <path d="M50 30 Q49 40 46 47 M50 30 Q51 40 54 47" stroke="${dk}" stroke-width="1" opacity=".3" fill="none"/>${strand}` };
    case 'bun':
      return { back:
        `<circle cx="50" cy="19" r="8" fill="${hair}"/><ellipse cx="50" cy="19" rx="8" ry="8" fill="${hl}" opacity=".25"/>`, front:
        `<path d="M29 45 Q29 24 50 24 Q71 24 71 45 Q64 33 50 32.5 Q36 33 29 45 Z" fill="${hair}"/>
         <path d="M42 25 Q50 21 58 25" stroke="${dk}" stroke-width="1.2" fill="none" opacity=".4"/>${strand}` };
    case 'ponytail':
      return { back:
        `<path d="M67 32 Q84 38 82 58 Q81 68 74 70 Q80 58 75 47 Q71 39 65 39 Z" fill="${hair}"/>
         <path d="M69 40 Q76 46 74 58" stroke="${dk}" stroke-width="1.2" fill="none" opacity=".4"/>`, front:
        `<path d="M29 45 Q29 24 50 24 Q71 24 71 45 Q64 33 50 32.5 Q36 33 29 45 Z" fill="${hair}"/>${strand}` };
    default:
      return { back: '', front: `<path d="M28 46 Q27 23 50 23 Q73 23 72 46 Q66 32 50 31 Q34 32 28 46 Z" fill="${hair}"/>` };
  }
}

/* Outfit: shoulders/torso drawn with the chosen color + brand-ish details. */
function outfitSVG(outfit, color) {
  const dk = shade(color, -0.28), dk2 = shade(color, -0.45), lt = shade(color, 0.25);
  const base = `<path d="M15 100 Q15 73 50 72 Q85 73 85 100 Z" fill="${color}"/>`;
  switch (outfit) {
    case 'hoodie':
      return `${base}
        <path d="M34 74 Q50 68 66 74 Q60 86 50 86 Q40 86 34 74 Z" fill="${dk}"/>
        <path d="M46 80 L46 96 M54 80 L54 96" stroke="${dk2}" stroke-width="1.5"/>
        <circle cx="46" cy="97" r="1.6" fill="${lt}"/><circle cx="54" cy="97" r="1.6" fill="${lt}"/>
        <rect x="30" y="90" width="40" height="10" fill="${dk}" opacity=".5"/>`;
    case 'jacket':
      return `<path d="M15 100 Q15 73 50 72 Q85 73 85 100 Z" fill="${shade(color, -0.15)}"/>
        <path d="M50 72 L40 100 L34 100 Q32 84 40 74 Z" fill="${dk2}"/>
        <path d="M50 72 L60 100 L66 100 Q68 84 60 74 Z" fill="${dk2}"/>
        <path d="M48 74 L48 100 L52 100 L52 74 Z" fill="${dk}"/>
        <path d="M49.5 78 L49.5 98" stroke="${lt}" stroke-width="1" opacity=".6"/>
        <circle cx="41" cy="90" r="1.4" fill="${lt}"/><circle cx="59" cy="90" r="1.4" fill="${lt}"/>`;
    case 'denim':
      return `${base}
        <path d="M50 72 L42 100 L36 100 Q35 85 41 74 Z" fill="${dk}"/>
        <path d="M50 72 L58 100 L64 100 Q65 85 59 74 Z" fill="${dk}"/>
        <path d="M48 74 L48 100 L52 100 L52 74 Z" fill="${dk2}"/>
        <path d="M39 82 L44 84 M61 82 L56 84" stroke="${dk2}" stroke-width="1.2" stroke-dasharray="2 2"/>
        <circle cx="41" cy="92" r="1.3" fill="${lt}"/><circle cx="59" cy="92" r="1.3" fill="${lt}"/>`;
    default: // tee
      return `${base}
        <path d="M40 73 Q50 80 60 73" fill="none" stroke="${dk}" stroke-width="2" stroke-linecap="round"/>
        <path d="M20 82 Q18 90 17 98" stroke="${dk}" stroke-width="1" opacity=".3" fill="none"/>`;
  }
}

/* Facial hair, drawn in the hair colour with an ink outline. */
function facialHairSVG(id, hair) {
  const dk = shade(hair, -0.2);
  switch (id) {
    case 'stubble':
      return `<path d="M34 58 Q34 70 50 70 Q66 70 66 58 Q64 64 58 64 Q54 66 50 66 Q46 66 42 64 Q36 64 34 58 Z" fill="${hair}" opacity=".28"/>`;
    case 'mustache':
      return `<path d="M43 58.5 Q46 57 50 58 Q54 57 57 58.5 Q54 61 50 60 Q46 61 43 58.5 Z" fill="${hair}" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round"/>`;
    case 'goatee':
      return `<path d="M44 58.5 Q46 57 50 58 Q54 57 56 58.5 Q54 60.5 50 59.8 Q46 60.5 44 58.5 Z" fill="${hair}"/>
        <path d="M45 63 Q50 72 55 63 Q53 67 50 67 Q47 67 45 63 Z" fill="${hair}" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round"/>`;
    case 'beard':
      return `<path d="M32 50 Q31 66 42 72 Q46 74 50 74 Q54 74 58 72 Q69 66 68 50 Q66 60 60 63 L60 60 Q55 62 50 62 Q45 62 40 60 L40 63 Q34 60 32 50 Z" fill="${hair}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>
        <path d="M43 58 Q46 56.5 50 57.5 Q54 56.5 57 58 Q54 60.5 50 59.6 Q46 60.5 43 58 Z" fill="${dk}"/>`;
    default: return '';
  }
}

/* Returns a full SVG string for a character. Cel-shaded, bold-outlined
   Bitmoji-inspired portrait. */
function avatarSVG(spec) {
  const skin = spec.skin, hair = spec.hair, color = spec.shirt;
  const style = spec.hairstyle || 'short';
  const outfit = spec.outfit || 'tee';
  const beard = spec.beard || 'none';
  const uid = spec._uid || 'x';
  const wig = hairstyleSVG(style, hair);
  const hatOn = (spec.acc === 'cap' || spec.acc === 'beanie');
  const skinShadow = shade(skin, -0.16);
  const skinOutline = shade(skin, -0.5);
  const browColor = shade(hair, -0.2);
  const irisColor = shade(hair === '#1a1a1a' ? '#5b3a1e' : hair, -0.05);
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="clip-${uid}"><circle cx="50" cy="50" r="50"/></clipPath></defs>
    <g clip-path="url(#clip-${uid})">
      <rect width="100" height="100" fill="#1c1c1c"/>
      <circle cx="50" cy="50" r="50" fill="#262626"/>

      <!-- back hair (long/curly/bun/ponytail) -->
      ${hatOn ? '' : `<g stroke="${INK}" stroke-width="1.2" stroke-linejoin="round">${wig.back}</g>`}

      <!-- outfit (bold outline) -->
      <g stroke="${INK}" stroke-width="1.6" stroke-linejoin="round">${outfitSVG(outfit, color)}</g>

      <!-- neck + shadow -->
      <path d="M43 61 h14 v10 q-7 4 -14 0 Z" fill="${skin}" stroke="${skinOutline}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M43 62 q7 5 14 0 v3.5 q-7 4 -14 0 Z" fill="${skinShadow}" opacity=".55"/>

      <!-- ears -->
      <circle cx="29.5" cy="49" r="5" fill="${skin}" stroke="${skinOutline}" stroke-width="1.2"/>
      <circle cx="70.5" cy="49" r="5" fill="${skin}" stroke="${skinOutline}" stroke-width="1.2"/>
      <path d="M28.5 47 Q31 49 29.5 51.5" stroke="${skinOutline}" stroke-width="1" fill="none" opacity=".6"/>
      <path d="M71.5 47 Q69 49 70.5 51.5" stroke="${skinOutline}" stroke-width="1" fill="none" opacity=".6"/>

      <!-- head -->
      <path d="M30 44 Q30 22 50 22 Q70 22 70 44 Q70 60 60 66 Q55 69 50 69 Q45 69 40 66 Q30 60 30 44 Z" fill="${skin}" stroke="${skinOutline}" stroke-width="1.4" stroke-linejoin="round"/>
      <!-- jaw/temple cel-shadow -->
      <path d="M30 44 Q30 58 40 65 Q34 58 33 46 Z" fill="${skinShadow}" opacity=".35"/>
      <path d="M70 44 Q70 58 60 65 Q66 58 67 46 Z" fill="${skinShadow}" opacity=".35"/>

      <!-- cheeks blush -->
      <ellipse cx="37.5" cy="55" rx="4" ry="2.6" fill="#ff8f7a" opacity=".28"/>
      <ellipse cx="62.5" cy="55" rx="4" ry="2.6" fill="#ff8f7a" opacity=".28"/>

      <!-- eyebrows -->
      <path d="M37 43 Q42 40 47 42.5" stroke="${browColor}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M53 42.5 Q58 40 63 43" stroke="${browColor}" stroke-width="2.4" fill="none" stroke-linecap="round"/>

      <!-- eyes: white, iris, pupil, highlight, lash line -->
      <ellipse cx="42" cy="49" rx="3.7" ry="4.3" fill="#fff"/>
      <ellipse cx="58" cy="49" rx="3.7" ry="4.3" fill="#fff"/>
      <circle cx="42.3" cy="49.5" r="2.7" fill="${irisColor}"/>
      <circle cx="58.3" cy="49.5" r="2.7" fill="${irisColor}"/>
      <circle cx="42.3" cy="49.5" r="1.4" fill="#171717"/>
      <circle cx="58.3" cy="49.5" r="1.4" fill="#171717"/>
      <circle cx="43.4" cy="48.1" r="1" fill="#fff"/>
      <circle cx="59.4" cy="48.1" r="1" fill="#fff"/>
      <!-- upper lash line (Bitmoji signature) -->
      <path d="M38.3 46.6 Q42 44.6 45.7 46.6" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M54.3 46.6 Q58 44.6 61.7 46.6" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>

      <!-- nose -->
      <path d="M50 51 Q48.2 55 50 56.4 Q51 56.6 51.6 56" stroke="${skinOutline}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>

      <!-- smile -->
      <path d="M42.5 59.5 Q50 65.5 57.5 59.5" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M45 61 Q50 63.8 55 61 Q50 62 45 61 Z" fill="#fff"/>

      <!-- facial hair -->
      ${facialHairSVG(beard, hair)}

      <!-- front hair (bold outline) -->
      ${hatOn ? '' : `<g stroke="${INK}" stroke-width="1.3" stroke-linejoin="round">${wig.front}</g>`}

      <!-- accessory -->
      ${accessorySVG(spec.acc, skin)}

      <!-- headphones -->
      ${headphoneSVG(spec.phones)}
    </g>
  </svg>`;
}

let _uidCounter = 0;
function renderAvatar(spec) {
  const s = Object.assign({}, spec, { _uid: 'a' + (_uidCounter++) });
  return avatarSVG(s);
}

/* ═══════════════════════════════════════════════════════════════════
   3. CHARACTER BUILDER
   ═══════════════════════════════════════════════════════════════════ */

let _wantTour = false;
function goToBuilder(wantTour) {
  _wantTour = !!wantTour;
  document.getElementById('welcome').classList.add('gone');
  setTimeout(() => {
    document.getElementById('builder').classList.add('show');
    buildBuilderControls();
    renderAvatarPreview();
  }, 380);
}

function buildBuilderControls() {
  document.getElementById('opt-skin').innerHTML  = SKIN_TONES.map(c   => swatchHTML(c, 'skin')).join('');
  document.getElementById('opt-hair').innerHTML  = HAIR_COLORS.map(c  => swatchHTML(c, 'hair')).join('');
  document.getElementById('opt-shirt').innerHTML = SHIRT_COLORS.map(c => swatchHTML(c, 'shirt')).join('');

  buildHairstyleTiles();

  document.getElementById('opt-outfit').innerHTML = OUTFITS.map(o => `
    <button class="tile ${ME.outfit === o.id ? 'sel' : ''}" data-outfit="${o.id}" onclick="pickOutfit('${o.id}',this)">
      <div class="tile-ico" style="font-size:20px">${o.emoji}</div>
      <div class="tile-txt"><div class="tile-name">${o.name}</div></div>
    </button>`).join('');

  document.getElementById('opt-phones').innerHTML = HEADPHONES.map(h => `
    <button class="tile ${ME.phones === h.id ? 'sel' : ''}" data-phones="${h.id}" onclick="pickPhones('${h.id}',this)">
      <div class="tile-ico">${miniPhoneIcon(h)}</div>
      <div class="tile-txt"><div class="tile-name">${h.name}</div><div class="tile-sub">${h.sub}</div></div>
    </button>`).join('');

  document.getElementById('opt-beard').innerHTML = FACIAL_HAIR.map(f => `
    <button class="tile ${ME.beard === f.id ? 'sel' : ''}" data-beard="${f.id}" onclick="pickBeard('${f.id}',this)">
      <div class="tile-ico" style="font-size:20px">${f.emoji}</div>
      <div class="tile-txt"><div class="tile-name">${f.name}</div></div>
    </button>`).join('');

  document.getElementById('opt-acc').innerHTML = ACCESSORIES.map(a => `
    <button class="tile ${ME.acc === a.id ? 'sel' : ''}" data-acc="${a.id}" onclick="pickAcc('${a.id}',this)">
      <div class="tile-ico" style="font-size:22px">${a.emoji || '🚫'}</div>
      <div class="tile-txt"><div class="tile-name">${a.name}</div></div>
    </button>`).join('');
}

/* Hairstyle tiles show a live mini face preview using the current colors. */
function buildHairstyleTiles() {
  document.getElementById('opt-hairstyle').innerHTML = HAIRSTYLES.map(hs => {
    const preview = renderAvatar({ skin: ME.skin, hair: ME.hair, hairstyle: hs.id, outfit: 'tee', shirt: '#333', phones: 'none', acc: 'none' });
    return `<button class="tile ${ME.hairstyle === hs.id ? 'sel' : ''}" data-hairstyle="${hs.id}" onclick="pickHairstyle('${hs.id}',this)">
      <div class="tile-ico" style="width:38px;height:38px">${preview}</div>
      <div class="tile-txt"><div class="tile-name">${hs.name}</div></div>
    </button>`;
  }).join('');
}

function swatchHTML(color, kind) {
  const sel = ME[kind] === color ? 'sel' : '';
  return `<div class="swatch ${sel}" style="background:${color}" data-kind="${kind}" data-color="${color}" onclick="pickSwatch('${kind}','${color}',this)"></div>`;
}

/* small preview icon of a headphone for the tile */
function miniPhoneIcon(h) {
  if (h.type === 'none') return '<span style="font-size:22px">🔇</span>';
  if (h.type === 'over')
    return `<svg viewBox="0 0 40 40"><path d="M8 24 Q8 8 20 8 Q32 8 32 24" fill="none" stroke="${h.color}" stroke-width="4" stroke-linecap="round"/><rect x="5" y="20" width="8" height="14" rx="4" fill="${h.color}"/><rect x="27" y="20" width="8" height="14" rx="4" fill="${h.color}"/></svg>`;
  if (h.type === 'buds')
    return `<svg viewBox="0 0 40 40"><circle cx="14" cy="14" r="5" fill="${h.color}" stroke="${h.accent}"/><rect x="12" y="16" width="4" height="12" rx="2" fill="${h.color}"/><circle cx="26" cy="14" r="5" fill="${h.color}" stroke="${h.accent}"/><rect x="24" y="16" width="4" height="12" rx="2" fill="${h.color}"/></svg>`;
  if (h.type === 'clip')
    return `<svg viewBox="0 0 40 40"><path d="M10 26 Q4 18 12 12" fill="none" stroke="${h.color}" stroke-width="4" stroke-linecap="round"/><path d="M30 26 Q36 18 28 12" fill="none" stroke="${h.color}" stroke-width="4" stroke-linecap="round"/></svg>`;
  return '';
}

function pickSwatch(kind, color, el) {
  ME[kind] = color;
  el.parentElement.querySelectorAll('.swatch').forEach(s => s.classList.remove('sel'));
  el.classList.add('sel');
  // keep the hairstyle mini-previews in sync with skin/hair color changes
  if (kind === 'skin' || kind === 'hair') buildHairstyleTiles();
  renderAvatarPreview();
}
function pickHairstyle(id, el) {
  ME.hairstyle = id;
  document.querySelectorAll('#opt-hairstyle .tile').forEach(t => t.classList.remove('sel'));
  el.classList.add('sel');
  renderAvatarPreview();
}
function pickOutfit(id, el) {
  ME.outfit = id;
  document.querySelectorAll('#opt-outfit .tile').forEach(t => t.classList.remove('sel'));
  el.classList.add('sel');
  renderAvatarPreview();
}
function pickPhones(id, el) {
  ME.phones = id;
  document.querySelectorAll('#opt-phones .tile').forEach(t => t.classList.remove('sel'));
  el.classList.add('sel');
  renderAvatarPreview();
}
function pickAcc(id, el) {
  ME.acc = id;
  document.querySelectorAll('#opt-acc .tile').forEach(t => t.classList.remove('sel'));
  el.classList.add('sel');
  renderAvatarPreview();
}
function pickBeard(id, el) {
  ME.beard = id;
  document.querySelectorAll('#opt-beard .tile').forEach(t => t.classList.remove('sel'));
  el.classList.add('sel');
  renderAvatarPreview();
}

function renderAvatarPreview() {
  ME.name = document.getElementById('me-name').value || 'You';
  document.getElementById('avatar-svg').innerHTML = renderAvatar(ME);
}

function randomizeAvatar() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  ME.skin = pick(SKIN_TONES);
  ME.hair = pick(HAIR_COLORS);
  ME.hairstyle = pick(HAIRSTYLES).id;
  ME.shirt = pick(SHIRT_COLORS);
  ME.outfit = pick(OUTFITS).id;
  ME.phones = pick(HEADPHONES.filter(h => h.type !== 'none')).id;
  ME.acc = pick(ACCESSORIES.filter(a => a.id === 'none' || Math.random() > 0.5)).id;
  ME.beard = pick(FACIAL_HAIR.filter(f => f.id === 'none' || Math.random() > 0.5)).id;
  buildBuilderControls();
  renderAvatarPreview();
}

function finishBuilder() {
  ME.name = document.getElementById('me-name').value || 'You';
  document.getElementById('builder').classList.remove('show');
  document.getElementById('app').classList.add('show');
  bootApp();
}

function reopenBuilder() {
  document.getElementById('app').classList.remove('show');
  document.getElementById('builder').classList.add('show');
  buildBuilderControls();
  renderAvatarPreview();
}

/* ═══════════════════════════════════════════════════════════════════
   APP BOOT
   ═══════════════════════════════════════════════════════════════════ */

function bootApp() {
  // header/profile avatar + name
  document.getElementById('uc-av').innerHTML = renderAvatar(ME);
  document.getElementById('uc-name').textContent = ME.name;
  const dev = HEADPHONES.find(h => h.id === ME.phones);
  document.getElementById('p-device-name').textContent = dev && dev.type !== 'none' ? dev.name : 'This device';
  document.getElementById('prof-device').textContent = dev && dev.type !== 'none' ? dev.name : 'Speaker';

  buildSidebar();
  buildActivity();
  buildSuggested();
  updateOnlineCount();
  updatePassportBadge();
  if (!map) initMap();

  // If the user chose the guided tour, launch it instead of demo popups
  if (_wantTour) {
    setTimeout(startTour, 600);
    return;
  }

  // demo notifications trickling in
  setTimeout(() => pushNotif('🎵', 'New queue request', 'Max added "Blinding Lights" to your queue'), 1600);
  setTimeout(() => pushNotif('📍', 'Friend online', 'Jake just came online from London'), 6500);
  setTimeout(showLTDemo, 5200);
}

/* ═══════════════════════════════════════════════════════════════════
   4. MAP
   ═══════════════════════════════════════════════════════════════════ */

function initMap() {
  if (typeof L === 'undefined') {
    // Leaflet CDN unavailable (offline). Show a friendly fallback so the app still works.
    document.getElementById('map').innerHTML =
      '<div style="height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;color:#727272;text-align:center;padding:24px">' +
      '<div style="font-size:40px">🗺️</div><div style="font-size:14px;font-weight:600;color:#b3b3b3">Map needs an internet connection</div>' +
      '<div style="font-size:12px">Connect to load the world map — friends still work in the sidebar →</div></div>';
    return;
  }
  map = L.map('map', { zoomControl: true, attributionControl: true, minZoom: 2, worldCopyJump: true }).setView([28, 8], 2);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://openstreetmap.org">OSM</a> © <a href="https://carto.com">CARTO</a>',
    subdomains: 'abcd', maxZoom: 19,
  }).addTo(map);

  FRIENDS.forEach(f => addFriendMarker(f));
  renderPassportGlows();

  // "You" marker
  const you = document.createElement('div');
  you.className = 'mpin';
  you.innerHTML = `
    <div class="mpin-name">You</div>
    <div class="mpin-bubble">
      <div class="mpin-p1" style="background:rgba(155,89,247,.22)"></div>
      <div class="mpin-av" style="border-color:#9b59f7">${renderAvatar(ME)}</div>
      <div class="mpin-eq" style="background:#9b59f7"><div></div><div></div><div></div></div>
    </div>
    <div class="mpin-tail" style="border-top-color:#9b59f7"></div>`;
  youMarker = L.marker([ME.lat, ME.lng], { icon: L.divIcon({ html: you, className: '', iconSize: [70, 84], iconAnchor: [35, 74] }) })
    .bindTooltip(`<strong>You</strong> · ${ME.city}`, { direction: 'top', offset: [0, -70], opacity: 1 });
  if (!PRIVACY.ghost) youMarker.addTo(map);
}

function addFriendMarker(f) {
  const el = document.createElement('div');
  el.className = 'mpin' + (f.online ? '' : ' is-off');
  el.innerHTML = `
    <div class="mpin-name">${f.name}</div>
    <div class="mpin-bubble">
      ${f.online ? `<div class="mpin-p1" style="background:${f.ring}33"></div><div class="mpin-p2" style="background:${f.ring}22"></div>` : ''}
      <div class="mpin-av" style="border-color:${f.online ? f.ring : '#555'}">${renderAvatar(f)}</div>
      ${f.online
        ? `<div class="mpin-eq" style="background:${f.ring}"><div></div><div></div><div></div></div>`
        : `<div class="mpin-off">💤</div>`}
    </div>
    <div class="mpin-tail" style="border-top-color:${f.online ? f.ring : '#555'}"></div>`;
  el.onclick = () => openSheet(f.id);
  const marker = L.marker([f.lat, f.lng], { icon: L.divIcon({ html: el, className: '', iconSize: [70, 84], iconAnchor: [35, 74] }) }).addTo(map);
  marker.bindTooltip(
    f.online ? `<strong>${f.name}</strong> · ${f.track}` : `<strong>${f.name}</strong> · offline ${f.lastSeen}`,
    { direction: 'top', offset: [0, -70], opacity: 1 }
  );
  markerRefs[f.id] = marker;
}

/* ═══════════════════════════════════════════════════════════════════
   5. SIDEBAR
   ═══════════════════════════════════════════════════════════════════ */

function setTab(name, el) {
  document.querySelectorAll('.sb-tab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('#main .tab-pane').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('tab-' + name).classList.add('on');
}

function buildSidebar() {
  const online = FRIENDS.filter(f => f.online);
  const offline = FRIENDS.filter(f => !f.online);
  let html = '';
  if (online.length) html += `<div class="grp-label">🟢 ONLINE — ${online.length}</div>` + online.map(friendCardHTML).join('');
  if (offline.length) html += `<div class="grp-label">⚪ OFFLINE — ${offline.length}</div>` + offline.map(friendCardHTML).join('');
  document.getElementById('friends-list').innerHTML = html;
}

function friendCardHTML(f) {
  return `
    <div class="fc ${f.online ? '' : 'offline'}" id="fc${f.id}" onclick="openSheet(${f.id})">
      <div class="fc-avwrap">
        <div class="fc-av">${renderAvatar(f)}</div>
        <div class="fc-dot ${f.online ? 'online' : 'offline'}"></div>
      </div>
      <div class="fc-info">
        <div class="fc-name">${f.name} <span style="color:var(--t3);font-weight:400;font-size:11px">${f.flag}</span></div>
        ${f.online
          ? `<div class="fc-np"><div class="np-eq"><span></span><span></span><span></span></div><span class="np-txt">${f.track} — ${f.artist}</span></div>`
          : `<div class="fc-loc">Last seen ${f.lastSeen} · ${f.city}</div>`}
      </div>
      ${f.unread ? `<span class="fc-unread">${f.unread}</span>` : ''}
    </div>`;
}

function buildActivity() {
  document.getElementById('act-list').innerHTML = ACTIVITY.map(a => `
    <div class="act-item">
      <div class="act-ico" style="background:${a.color}1a;border:1px solid ${a.color}33">${a.ico}</div>
      <div class="act-body"><div class="act-msg">${a.msg}</div><div class="act-time">${a.time}</div></div>
    </div>`).join('');
}

function updateOnlineCount() {
  const n = FRIENDS.filter(f => f.online).length;
  document.getElementById('online-count').textContent = n + ' online';
}

/* ═══════════════════════════════════════════════════════════════════
   6. FRIEND SHEET
   ═══════════════════════════════════════════════════════════════════ */

function openSheet(id) {
  const f = FRIENDS.find(x => x.id === id);
  if (!f) return;
  curFriend = f;

  document.getElementById('sh-glow').style.background = `linear-gradient(135deg,${f.ring}16,${f.ring}04)`;
  document.getElementById('sh-av').style.borderColor = f.online ? f.ring : '#555';
  document.getElementById('sh-av').innerHTML = renderAvatar(f);
  document.getElementById('sh-dot').className = 'sh-av-dot ' + (f.online ? 'online' : 'offline');
  document.querySelectorAll('.sh-eq span').forEach(s => s.style.background = f.ring);
  document.getElementById('sh-name').innerHTML = `${f.name} <span style="font-size:13px">${f.flag}</span>`;
  document.getElementById('sh-loc').textContent = `📍 ${f.city}, ${f.country}`;

  const now = document.getElementById('sh-now');
  if (f.online) {
    now.innerHTML = `<div class="sh-eq" id="sh-eq"><span style="background:${f.ring}"></span><span style="background:${f.ring}"></span><span style="background:${f.ring}"></span></div><span class="sh-track">${f.track} — ${f.artist}</span>`;
    document.getElementById('lt-btn').disabled = false;
    document.getElementById('lt-btn').innerHTML = '🎧 Listen';
  } else {
    now.innerHTML = `<span class="sh-status-off">💤 Offline · last seen ${f.lastSeen}</span>`;
    document.getElementById('lt-btn').disabled = true;
    document.getElementById('lt-btn').innerHTML = '🎧 Offline';
  }

  // block modal avatar/name
  document.getElementById('blk-name').textContent = f.name;
  document.getElementById('blk-av').innerHTML = renderAvatar(f);

  // reset to send tab
  setSheetTab('send', document.querySelector('.sh-tab'));
  document.getElementById('sh-search').value = '';
  visSongs = SONGS;
  document.getElementById('sec-lbl').textContent = 'SUGGESTED FOR THEM';
  renderSongs(SONGS);
  renderChat(f.id);
  updateChatBadge(f);

  // clear unread
  if (f.unread) { f.unread = 0; buildSidebar(); }

  document.getElementById('sheet').classList.add('on');
  document.getElementById('overlay').classList.add('on');
  document.querySelectorAll('.fc').forEach(c => c.classList.remove('sel'));
  document.getElementById('fc' + id)?.classList.add('sel');
  map?.flyTo([f.lat, f.lng], 5, { animate: true, duration: 1.4, easeLinearity: .5 });
}

function closeSheet() {
  document.getElementById('sheet').classList.remove('on');
  document.getElementById('overlay').classList.remove('on');
  document.querySelectorAll('.fc').forEach(c => c.classList.remove('sel'));
  curFriend = null;
}

function setSheetTab(name, el) {
  document.querySelectorAll('.sh-tab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.sh-panel').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('sh-panel-' + name).classList.add('on');
  if (name === 'chat') {
    if (curFriend) renderChat(curFriend.id);
    setTimeout(() => document.getElementById('chat-input').focus(), 100);
  }
  if (name === 'profile' && curFriend) renderProfile(curFriend);
}

function updateChatBadge(f) {
  document.getElementById('sh-chat-badge').textContent = '';
}

/* ── SONGS ── */
function renderSongs(list) {
  const el = document.getElementById('tracks-list');
  if (!list.length) {
    el.innerHTML = `<div class="tempty"><span class="tempty-ico">🔍</span><div class="tempty-ttl">No songs found</div><div>Try a different search</div></div>`;
    return;
  }
  el.innerHTML = list.map((s, i) => `
    <div class="trow" id="tr${i}">
      <div class="tswipe-bg" id="tbg${i}"><span class="sq-icon">🎵</span><span class="sq-lbl">ADD TO QUEUE</span></div>
      <div class="tinner" id="ti${i}"
        onmousedown="swStart(event,${i})" onmousemove="swMove(event,${i})" onmouseup="swEnd(event,${i})" onmouseleave="swLeave(event,${i})"
        ontouchstart="swStart(event,${i})" ontouchmove="swMove(event,${i})" ontouchend="swEnd(event,${i})">
        <span class="tnum">${i + 1}</span>
        <div class="tart"><img src="${s.art}" onerror="this.style.display='none'"/></div>
        <div class="tmeta"><div class="tname">${s.name}</div><div class="tsub">${s.artist} · ${s.album}</div></div>
        <span class="tdur">${s.dur}</span>
        <div class="tcue"><span class="tcue-a">←</span><span class="tcue-t">SWIPE</span></div>
      </div>
    </div>`).join('');
}

function filterSongs(q) {
  const t = q.trim().toLowerCase();
  visSongs = t ? SONGS.filter(s => s.name.toLowerCase().includes(t) || s.artist.toLowerCase().includes(t) || s.album.toLowerCase().includes(t)) : SONGS;
  document.getElementById('sec-lbl').textContent = t ? `RESULTS FOR "${q.toUpperCase()}"` : 'SUGGESTED FOR THEM';
  renderSongs(visSongs);
}

/* ── SWIPE ── */
function gx(e) { return e.clientX ?? e.touches?.[0]?.clientX ?? 0; }

function swStart(e, i) {
  if (e.type === 'mousedown') e.preventDefault();
  SW[i] = { x0: gx(e), off: 0, active: true, fired: false };
}
function swMove(e, i) {
  const s = SW[i]; if (!s?.active) return;
  const dx = Math.min(0, gx(e) - s.x0);
  s.off = dx;
  const ti = document.getElementById('ti' + i), tbg = document.getElementById('tbg' + i);
  if (!ti || !tbg) return;
  const abs = Math.abs(dx), pct = Math.min(abs / THRESH, 1);
  ti.style.transform = `translateX(${dx}px)`;
  ti.style.transition = 'none';
  tbg.style.width = abs + 'px';
  tbg.style.opacity = 0.5 + pct * 0.5;
  if (abs >= THRESH && !s.fired) { s.fired = true; queueSong(i); }
}
function swEnd(e, i) {
  const s = SW[i]; if (!s?.active) return;
  s.active = false;
  const ti = document.getElementById('ti' + i), tbg = document.getElementById('tbg' + i);
  if (ti) { ti.style.transition = 'transform .3s cubic-bezier(.32,.72,0,1)'; ti.style.transform = 'translateX(0)'; }
  if (tbg) { tbg.style.transition = 'width .3s,opacity .25s'; tbg.style.width = '0'; tbg.style.opacity = '0'; }
  delete SW[i];
}
function swLeave(e, i) {
  const s = SW[i]; if (!s?.active) return;
  if (Math.abs(s.off) > 5) swEnd(e, i); else { s.active = false; delete SW[i]; }
}
function queueSong(i) {
  const song = visSongs[i];
  if (!song || !curFriend) return;
  blip();
  toast('🎵', `"${song.name}" sent to ${curFriend.name}'s queue!`);
  // also drop into chat as a shared song
  (CHATS[curFriend.id] = CHATS[curFriend.id] || []).push({ from: 'me', song: { name: song.name, artist: song.artist, art: song.art }, time: nowTime() });
  collectCountry(song.name);
}

/* ── PROFILE (recently played + playlists) ── */
const PLAYLIST_POOL = [
  { name: 'Late Night Drive', emoji: '🌙' }, { name: 'Gym Pump', emoji: '💪' },
  { name: 'Chill Vibes', emoji: '🌿' }, { name: 'Throwback Hits', emoji: '📼' },
  { name: 'Focus Flow', emoji: '🎯' }, { name: 'Party Starters', emoji: '🎉' },
  { name: 'Summer 2024', emoji: '☀️' }, { name: 'Sad Hours', emoji: '🥀' },
  { name: 'Road Trip', emoji: '🚗' }, { name: 'Coffee Shop', emoji: '☕' },
];

function friendRecent(f) {
  const times = ['now', '14 min ago', '52 min ago', '2 hr ago', 'yesterday'];
  const others = SONGS.filter(s => s.name !== f.track).slice(f.id * 2, f.id * 2 + 4);
  const list = [{ name: f.track, artist: f.artist, art: f.art }, ...others].slice(0, 5);
  return list.map((s, i) => ({ name: s.name, artist: s.artist, art: s.art, time: times[i] || 'earlier', nowPlaying: i === 0 && f.online }));
}
function friendPlaylists(f) {
  const start = f.id % PLAYLIST_POOL.length;
  const out = [];
  for (let i = 0; i < 4; i++) {
    const p = PLAYLIST_POOL[(start + i) % PLAYLIST_POOL.length];
    out.push({ name: p.name, emoji: p.emoji, count: 16 + ((f.id * 7 + i * 13) % 90), art: SONGS[(f.id + i * 3) % SONGS.length].art });
  }
  return out;
}

function renderProfile(f) {
  const recent = friendRecent(f);
  const playlists = friendPlaylists(f);
  const esc = s => (s || '').replace(/'/g, "\\'");
  const html = `
    <div class="pf-stats">
      <div class="pf-stat"><div class="pf-stat-num">${friendPlaylists(f).reduce((a, p) => a + p.count, 0)}</div><div class="pf-stat-lbl">SONGS</div></div>
      <div class="pf-stat"><div class="pf-stat-num">${4 + (f.id % 5)}</div><div class="pf-stat-lbl">PLAYLISTS</div></div>
      <div class="pf-stat"><div class="pf-stat-num">${FRIEND_PASSPORT[f.id] ? FRIEND_PASSPORT[f.id].toFixed(0) + '%' : '—'}</div><div class="pf-stat-lbl">WORLD</div></div>
    </div>
    <div class="pf-section-label"><span>${f.online ? '🎧 LISTENING NOW & RECENT' : '🎧 RECENTLY PLAYED'}</span></div>
    <div class="pf-recent">
      ${recent.map(s => `
        <div class="pf-track" onclick="playSong('${esc(s.name)}','${esc(s.artist)}','${esc(s.art)}')">
          <div class="pf-track-art"><img src="${s.art}" onerror="this.style.display='none'"/></div>
          <div class="pf-track-info"><div class="pf-track-name">${s.name}</div><div class="pf-track-sub">${s.artist}</div></div>
          <div class="pf-track-time">${s.nowPlaying ? '<div class="np-eq"><span></span><span></span><span></span></div>' : ''}${s.time}</div>
        </div>`).join('')}
    </div>
    <div class="pf-section-label"><span>💿 ${f.name.toUpperCase()}'S PLAYLISTS</span></div>
    <div class="pf-playlists">
      ${playlists.map(p => `
        <div class="pf-pl" onclick="toast('💿','Opening &quot;${esc(p.name)}&quot;…')">
          <div class="pf-pl-cover"><img src="${p.art}" onerror="this.style.display='none'"/><span class="pf-pl-emoji">${p.emoji}</span></div>
          <div class="pf-pl-body"><div class="pf-pl-name">${p.name}</div><div class="pf-pl-count">${p.count} songs</div></div>
        </div>`).join('')}
    </div>`;
  document.getElementById('profile-body').innerHTML = html;
}

/* ── CHAT ── */
function renderChat(id) {
  const msgs = CHATS[id] || [];
  const sc = document.getElementById('chat-scroll');
  if (!msgs.length) {
    sc.innerHTML = `<div class="tempty" style="margin:auto"><span class="tempty-ico">💬</span><div class="tempty-ttl">No messages yet</div><div>Say hi or send a song 🎵</div></div>`;
    return;
  }
  sc.innerHTML = msgs.map(m => {
    if (m.day) return `<div class="chat-day">${m.day}</div>`;
    if (m.song) {
      const side = m.from === 'me' ? 'me-song' : 'them-song';
      const esc = s => (s || '').replace(/'/g, "\\'");
      return `<div class="msg-song ${side}" onclick="playSong('${esc(m.song.name)}','${esc(m.song.artist)}','${esc(m.song.art)}')" style="cursor:pointer">
        <div class="msg-song-art"><img src="${m.song.art}" onerror="this.style.display='none'"/></div>
        <div class="msg-song-info"><div class="msg-song-label">🎵 ${m.from === 'me' ? 'YOU SENT' : 'SHARED A SONG'}</div>
          <div class="msg-song-name">${m.song.name}</div><div class="msg-song-artist">${m.song.artist}</div></div>
        <div class="msg-song-play">▶</div>
      </div>`;
    }
    return `<div class="msg ${m.from}">${escapeHTML(m.text)}<div class="msg-time">${m.time}</div></div>`;
  }).join('');
  sc.scrollTop = sc.scrollHeight;
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !curFriend) return;
  (CHATS[curFriend.id] = CHATS[curFriend.id] || []).push({ from: 'me', text, time: nowTime() });
  input.value = '';
  renderChat(curFriend.id);
  // simulate a reply for online friends
  if (curFriend.online) {
    const fid = curFriend.id;
    setTimeout(() => {
      const replies = ['🔥🔥', 'yesss', 'sending you one back', 'haha good taste', 'adding now 🎧', 'ok this is a vibe'];
      (CHATS[fid] = CHATS[fid] || []).push({ from: 'them', text: replies[Math.floor(Math.random() * replies.length)], time: nowTime() });
      if (curFriend && curFriend.id === fid) renderChat(fid);
    }, 1200 + Math.random() * 1000);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   7. MODALS
   ═══════════════════════════════════════════════════════════════════ */

function closeModal(id) { document.getElementById(id).classList.remove('on'); }

/* BLOCK */
function openBlock() {
  closeSheet();
  blockChoice = null;
  document.querySelectorAll('.blk-opt').forEach(o => o.classList.remove('sel'));
  document.getElementById('blk-confirm').disabled = true;
  document.getElementById('blk-modal').classList.add('on');
}
function pickBlock(el, val) {
  document.querySelectorAll('.blk-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel'); blockChoice = val;
  document.getElementById('blk-confirm').disabled = false;
}
function doBlock() {
  const labels = { '2h': '2 hours', '24h': '24 hours', '7d': '7 days', 'forever': 'forever' };
  closeModal('blk-modal');
  const name = document.getElementById('blk-name').textContent;
  pushNotif('🚫', 'User blocked', `${name} blocked for ${labels[blockChoice]}`);
  toast('🚫', `Blocked ${name} for ${labels[blockChoice]}`);
}

/* LISTEN TOGETHER */
function showLTDemo() {
  const f = curFriend || FRIENDS[0];
  document.getElementById('lt-av').style.borderColor = f.ring;
  document.getElementById('lt-av').innerHTML = renderAvatar(f);
  document.getElementById('lt-av-me').style.borderColor = '#9b59f7';
  document.getElementById('lt-av-me').innerHTML = renderAvatar(ME);
  document.getElementById('lt-ttl').textContent = `Listen together with ${f.name}?`;
  document.getElementById('lt-tname').textContent = f.track;
  document.getElementById('lt-tartist').textContent = f.artist;
  document.getElementById('lt-art').src = f.art;
  document.getElementById('lt-modal').classList.add('on');
}
function openLT() { if (curFriend && !curFriend.online) return; showLTDemo(); }
function joinLT() {
  closeModal('lt-modal');
  const f = curFriend || FRIENDS[0];
  pushNotif('🎧', 'Listening together!', `Synced with ${f.name} in real time`);
  toast('🎧', `Now synced with ${f.name}!`);
  // reflect on player
  document.getElementById('p-song').textContent = f.track;
  document.getElementById('p-artist').textContent = f.artist + ' · with ' + f.name;
  document.getElementById('p-art-img').src = f.art;
  if (!isPlaying) togglePlay();
}

/* ADD FRIEND */
function openAddFriend() { setAFTab('link', document.querySelector('.af-tab')); document.getElementById('af-modal').classList.add('on'); }
function setAFTab(name, el) {
  document.querySelectorAll('.af-tab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.af-pane').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('af-' + name).classList.add('on');
}
function copyLink() {
  const val = document.getElementById('af-link-val').value;
  navigator.clipboard?.writeText('https://' + val).catch(() => {});
  toast('🔗', 'Invite link copied!');
}
function shareVia(app) { toast('📤', `Sharing your Jam Map link via ${app}…`); }
function importFrom(app) {
  toast('🔄', `Importing friends from ${app}…`);
  setTimeout(() => pushNotif('🤝', `${app} synced`, `Found friends from ${app} — imagine the full collab!`), 900);
}
function buildSuggested() {
  document.getElementById('af-suggest-list').innerHTML = SUGGESTED.map((p, i) => `
    <div class="af-suggest">
      <div class="af-suggest-av">${renderAvatar(p)}</div>
      <div class="af-suggest-info"><div class="af-suggest-name">${p.name}</div><div class="af-suggest-sub">${p.sub}</div></div>
      <button class="af-add-btn" id="add-sug-${i}" onclick="addSuggested(${i},'${p.name}')">+ Add</button>
    </div>`).join('');
}
function addSuggested(i, name) {
  const btn = document.getElementById('add-sug-' + i);
  btn.textContent = '✓ Added'; btn.classList.add('added');
  toast('🤝', `Friend request sent to ${name}`);
}

/* PROFILE */
function openProfile() {
  document.getElementById('prof-av').innerHTML = renderAvatar(ME);
  document.getElementById('prof-name').textContent = ME.name;
  document.getElementById('prof-friends').textContent = FRIENDS.length;
  const dev = HEADPHONES.find(h => h.id === ME.phones);
  document.getElementById('prof-device').textContent = dev && dev.type !== 'none' ? dev.name : 'Speaker';
  document.getElementById('prof-modal').classList.add('on');
}

/* NOTIFICATION CENTER */
const NOTIF_CENTER = [
  { ico: '🎵', color: '#1DB954', msg: '<strong>Max</strong> added a song to your queue', time: 'just now', unread: true },
  { ico: '💬', color: '#9b59f7', msg: '<strong>Sofia</strong> sent you a message',       time: '8 min ago', unread: true },
  { ico: '📍', color: '#4a90e2', msg: '<strong>Jake</strong> came online',                time: '5 min ago', unread: true },
  { ico: '🤝', color: '#FF69B4', msg: '<strong>Mia</strong> listened together with you',  time: '28 min ago', unread: false },
  { ico: '🚀', color: '#2ACEA7', msg: '<strong>Carlos</strong> joined Jam Map',           time: '1 hr ago', unread: false },
];
function openNotifCenter() {
  document.getElementById('nc-list').innerHTML = NOTIF_CENTER.map(n => `
    <div class="nc-item ${n.unread ? 'unread' : ''}">
      <div class="nc-ico" style="background:${n.color}1a">${n.ico}</div>
      <div class="nc-body"><div class="nc-msg">${n.msg}</div><div class="nc-time">${n.time}</div></div>
    </div>`).join('');
  document.getElementById('nc-modal').classList.add('on');
  document.getElementById('notif-badge').style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════════════
   TOASTS + NOTIFS
   ═══════════════════════════════════════════════════════════════════ */
let toastT;
function toast(ico, msg) {
  document.getElementById('t-ico').textContent = ico;
  document.getElementById('t-msg').textContent = msg;
  const el = document.getElementById('toast');
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('on'), 3400);
}
function pushNotif(ico, ttl, msg) {
  const stack = document.getElementById('nstack');
  const el = document.createElement('div');
  el.className = 'notif';
  el.innerHTML = `<div class="notif-ico">${ico}</div><div class="notif-body"><div class="notif-ttl">${ttl}</div><div class="notif-msg">${msg}</div></div>`;
  stack.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
  setTimeout(() => { el.classList.remove('on'); setTimeout(() => el.remove(), 400); }, 4500);
}

/* ═══════════════════════════════════════════════════════════════════
   8. PLAYER  (+ built-in Web Audio synth so the play button makes sound)

   NOTE: We can't stream real Spotify songs in a standalone demo — that
   needs the real Spotify connection (licensing). So the play button
   plays an original synthesized "preview" melody, generated live in the
   browser, so the app is audibly interactive with zero copyright issues.
   ═══════════════════════════════════════════════════════════════════ */

let audioCtx = null, audioMaster = null, audioLoop = null, audioStep = 0;
// A pleasant original chord/arpeggio loop (Cmaj7-ish), purely synthesized.
const MELODY = [261.63, 329.63, 392.00, 493.88, 392.00, 329.63];

function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    audioCtx = new AC();
    audioMaster = audioCtx.createGain();
    audioMaster.gain.value = 0.05;
    audioMaster.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return true;
}

function startMusic() {
  if (!ensureAudio()) return;
  stopMusic();
  audioStep = 0;
  audioLoop = setInterval(() => {
    const t = audioCtx.currentTime;
    const freq = MELODY[audioStep % MELODY.length];
    // pluck note
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(1, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g); g.connect(audioMaster); o.start(t); o.stop(t + 0.45);
    // soft bass every other step
    if (audioStep % 2 === 0) {
      const b = audioCtx.createOscillator(), bg = audioCtx.createGain();
      b.type = 'sine'; b.frequency.value = freq / 2;
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.linearRampToValueAtTime(0.6, t + 0.03);
      bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      b.connect(bg); bg.connect(audioMaster); b.start(t); b.stop(t + 0.55);
    }
    audioStep++;
  }, 280);
}

function stopMusic() {
  if (audioLoop) { clearInterval(audioLoop); audioLoop = null; }
}

/* short confirmation blip when a song is queued/sent */
function blip() {
  if (!ensureAudio()) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(660, t); o.frequency.exponentialRampToValueAtTime(990, t + 0.12);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g); g.connect(audioMaster); o.start(t); o.stop(t + 0.22);
}

function togglePlay() {
  isPlaying = !isPlaying;
  document.getElementById('play-svg').innerHTML = isPlaying
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
  if (isPlaying) { startProg(); startMusic(); }
  else { stopProg(); stopMusic(); }
}

/* Play a specific song in the bottom bar (used by chat song cards & rows). */
function playSong(name, artist, art) {
  document.getElementById('p-song').textContent = name;
  document.getElementById('p-artist').textContent = artist;
  if (art) { const im = document.getElementById('p-art-img'); im.src = art; im.style.display = ''; }
  progVal = 0; document.getElementById('p-fill').style.width = '0%'; document.getElementById('p-cur').textContent = '0:00';
  if (!isPlaying) togglePlay();
  toast('▶️', `Now playing "${name}"`);
  collectCountry(name);
}

/* ═══════════════════════════════════════════════════════════════════
   CULTURAL PASSPORT
   ═══════════════════════════════════════════════════════════════════ */
function passportPct() { return (collectedCountries.size / WORLD_TOTAL) * 100; }

function collectCountry(songName) { collect(songCountry(songName)); }

/* Core: add a country to the passport (with fanfare + map glow). */
function collect(country) {
  if (!country || collectedCountries.has(country)) return false;
  collectedCountries.add(country);
  const c = COUNTRIES.find(x => x.n === country);
  const flag = c ? c.f : '🌍';
  pushNotif(flag, 'New culture unlocked!', `${country} added to your passport · ${passportPct().toFixed(1)}% of the world`);
  toast(flag, `${country} unlocked! (+${(100 / WORLD_TOTAL).toFixed(1)}%)`);
  updatePassportBadge();
  renderPassportGlows();
  return true;
}

/* Green glowing pins on the map for every collected country. */
let passportLayer = null;
function renderPassportGlows() {
  if (!map || typeof L === 'undefined') return;
  if (!passportLayer) passportLayer = L.layerGroup().addTo(map);
  passportLayer.clearLayers();
  collectedCountries.forEach(country => {
    const co = COUNTRY_COORDS[country];
    if (!co) return;
    const c = COUNTRIES.find(x => x.n === country);
    const el = document.createElement('div');
    el.className = 'glow-pin';
    el.innerHTML = `<div class="glow-ring"></div><div class="glow-core">${c ? c.f : '🌍'}</div>`;
    const icon = L.divIcon({ html: el, className: '', iconSize: [26, 26], iconAnchor: [13, 13] });
    L.marker(co, { icon, interactive: false, keyboard: false }).addTo(passportLayer);
  });
}

function updatePassportBadge() {
  const b = document.getElementById('passport-badge');
  if (b) b.textContent = passportPct().toFixed(1) + '%';
}

function openPassport() {
  const pct = passportPct();
  document.getElementById('pp-pct').textContent = pct.toFixed(1) + '%';
  document.getElementById('pp-count').textContent = `${collectedCountries.size} of ${WORLD_TOTAL} countries`;
  document.getElementById('pp-title-rank').textContent = passportTitle(pct);
  // progress ring
  const ring = document.getElementById('pp-ring-fill');
  const circ = 2 * Math.PI * 52;
  ring.style.strokeDasharray = circ;
  ring.style.strokeDashoffset = circ * (1 - Math.min(pct / 100, 1));
  // region breakdown + flags
  let html = '';
  REGIONS.forEach(region => {
    const inRegion = COUNTRIES.filter(c => c.r === region);
    const got = inRegion.filter(c => collectedCountries.has(c.n));
    html += `<div class="pp-region">
      <div class="pp-region-head"><span>${region}</span><span class="pp-region-n">${got.length}/${inRegion.length}</span></div>
      <div class="pp-flags">` +
      inRegion.map(c => `<div class="pp-flag ${collectedCountries.has(c.n) ? 'got' : 'locked'}" title="${c.n}">
        <span class="ppf-emoji">${c.f}</span><span class="ppf-name">${c.n}</span></div>`).join('') +
      `</div></div>`;
  });
  document.getElementById('pp-regions').innerHTML = html;
  document.getElementById('pp-modal').classList.add('on');
}

/* Discover: play a song from a random country you haven't collected yet. */
function discoverCountry() {
  // prefer countries that have a song so we can actually play one
  const songCountries = [...new Set(Object.values(SONG_COUNTRY))];
  let pool = songCountries.filter(c => !collectedCountries.has(c));
  let song = null;
  if (pool.length) {
    const country = pool[Math.floor(Math.random() * pool.length)];
    const name = Object.keys(SONG_COUNTRY).find(n => SONG_COUNTRY[n] === country);
    song = SONGS.find(s => s.name === name);
  }
  if (!song) {
    // fall back to unlocking any uncollected country directly
    const rest = COUNTRIES.filter(c => !collectedCountries.has(c.n));
    if (!rest.length) { toast('🏆', 'You\'ve explored the whole world!'); return; }
    collect(rest[Math.floor(Math.random() * rest.length)].n);
    openPassport();
    return;
  }
  closeModal('pp-modal');
  playSong(song.name, song.artist, song.art);   // playSong collects the country
}

/* ═══════════════════════════════════════════════════════════════════
   FRIENDS LEADERBOARD — who's explored the most of the world
   ═══════════════════════════════════════════════════════════════════ */
function openLeaderboard() {
  closeModal('pp-modal');
  const rows = FRIENDS.map(f => ({ name: f.name, av: renderAvatar(f), pct: FRIEND_PASSPORT[f.id] || 0, me: false }));
  rows.push({ name: ME.name + ' (you)', av: renderAvatar(ME), pct: passportPct(), me: true });
  rows.sort((a, b) => b.pct - a.pct);
  const medals = ['🥇', '🥈', '🥉'];
  document.getElementById('lb-list').innerHTML = rows.map((r, i) => `
    <div class="lb-row ${r.me ? 'me' : ''}">
      <div class="lb-rank">${medals[i] || (i + 1)}</div>
      <div class="lb-av">${r.av}</div>
      <div class="lb-info">
        <div class="lb-name">${escapeHTML(r.name)}</div>
        <div class="lb-bar"><div class="lb-fill" style="width:${Math.min(r.pct, 100)}%"></div></div>
      </div>
      <div class="lb-pct">${r.pct.toFixed(1)}%</div>
    </div>`).join('');
  document.getElementById('lb-modal').classList.add('on');
}

/* ═══════════════════════════════════════════════════════════════════
   PRIVACY & PERMISSIONS — ghost mode, add-policy, ask-first
   ═══════════════════════════════════════════════════════════════════ */
function openPrivacy() {
  document.getElementById('sw-ghost').checked = PRIVACY.ghost;
  document.getElementById('sw-ask').checked = PRIVACY.askFirst;
  document.querySelectorAll('#seg-policy .seg-opt').forEach(b => b.classList.toggle('on', b.dataset.p === PRIVACY.addPolicy));
  document.getElementById('close-list').classList.toggle('hidden', PRIVACY.addPolicy !== 'close');
  renderCloseList();
  document.getElementById('privacy-modal').classList.add('on');
}

function toggleGhost(on) {
  PRIVACY.ghost = on;
  if (map && youMarker) {
    if (on) map.removeLayer(youMarker);
    else youMarker.addTo(map);
  }
  document.getElementById('ghost-chip').classList.toggle('hidden', !on);
  toast(on ? '👻' : '📍', on ? 'Ghost mode ON — you\'re hidden from the map' : 'Location sharing back on');
}

function setAddPolicy(p, el) {
  PRIVACY.addPolicy = p;
  document.querySelectorAll('#seg-policy .seg-opt').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('close-list').classList.toggle('hidden', p !== 'close');
  const labels = { all: 'Everyone can add to your Jam', close: 'Only your close friends can add songs', none: 'No one can add to your Jam' };
  toast('🎵', labels[p]);
}

function renderCloseList() {
  document.getElementById('close-list').innerHTML =
    '<div class="cf-hint">Pick who you trust to add songs anytime:</div>' +
    FRIENDS.map(f => `
      <label class="cf-row">
        <div class="cf-av">${renderAvatar(f)}</div>
        <span class="cf-name">${f.name}</span>
        <input type="checkbox" ${PRIVACY.closeFriends.has(f.id) ? 'checked' : ''} onchange="toggleCloseFriend(${f.id}, this.checked)"/>
      </label>`).join('');
}
function toggleCloseFriend(id, on) {
  if (on) PRIVACY.closeFriends.add(id); else PRIVACY.closeFriends.delete(id);
}

/* Demo: simulate a friend trying to add a song to YOUR jam, respecting your rules. */
function simulateIncomingRequest() {
  const online = FRIENDS.filter(f => f.online);
  const f = online[Math.floor(Math.random() * online.length)];
  const song = SONGS[Math.floor(Math.random() * SONGS.length)];
  if (PRIVACY.addPolicy === 'none') {
    pushNotif('🚫', 'Request blocked', `${f.name} tried to add "${song.name}" — your Jam is set to No one`);
    return;
  }
  if (PRIVACY.addPolicy === 'close' && !PRIVACY.closeFriends.has(f.id)) {
    pushNotif('🔒', 'Request blocked', `${f.name} isn't a close friend — song not added`);
    return;
  }
  if (PRIVACY.askFirst) { showRequestModal(f, song); }
  else { addToMyQueue(f, song); }
}
function addToMyQueue(f, song) {
  pushNotif('🎵', 'Added to your Jam', `${f.name} added "${song.name}" to your queue`);
  playSong(song.name, song.artist, song.art);
}
function showRequestModal(f, song) {
  pendingReq = { f, song };
  document.getElementById('req-avatar').innerHTML = renderAvatar(f);
  document.getElementById('req-name').textContent = f.name;
  document.getElementById('req-art').src = song.art;
  document.getElementById('req-song').textContent = song.name;
  document.getElementById('req-artist').textContent = song.artist;
  document.getElementById('req-modal').classList.add('on');
}
function allowRequest() {
  closeModal('req-modal');
  if (pendingReq) addToMyQueue(pendingReq.f, pendingReq.song);
}
function denyRequest() {
  closeModal('req-modal');
  if (pendingReq) toast('🚫', `Denied ${pendingReq.f.name}'s song request`);
}
function startProg() {
  clearInterval(progTimer);
  progTimer = setInterval(() => {
    progVal = Math.min(progVal + 0.4, 100);
    document.getElementById('p-fill').style.width = progVal + '%';
    const cur = Math.floor(239 * progVal / 100);
    document.getElementById('p-cur').textContent = `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')}`;
    if (progVal >= 100) { isPlaying = false; stopProg(); }
  }, 1000);
}
function stopProg() { clearInterval(progTimer); }
function seekTo(e) {
  const r = e.currentTarget.getBoundingClientRect();
  progVal = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
  document.getElementById('p-fill').style.width = progVal + '%';
}
function prevTrack() { progVal = 0; document.getElementById('p-fill').style.width = '0%'; document.getElementById('p-cur').textContent = '0:00'; }
function nextTrack() { progVal = 0; document.getElementById('p-fill').style.width = '0%'; document.getElementById('p-cur').textContent = '0:00'; }
function toggleHeart(btn) {
  const liked = btn.classList.toggle('liked');
  btn.textContent = liked ? '♥' : '♡';
}

/* ═══════════════════════════════════════════════════════════════════
   GUIDED TOUR
   Spotlights each feature with a tooltip card. Some steps run an action
   (open a friend, switch tab) so the viewer sees the flow live.
   ═══════════════════════════════════════════════════════════════════ */

const TOUR_STEPS = [
  {
    target: '#mapwrap',
    title: 'A world map of your friends 🗺️',
    text: 'Just like Snap Map — every friend is their own <b>custom character</b>, wherever they are. A green pulse + music bars means they\'re <b>listening right now</b>. Collected countries glow green.',
    placement: 'center',
  },
  {
    target: '#sidebar',
    title: 'See who\'s online 🎧',
    text: 'Every friend, grouped by online/offline, showing exactly what they\'re playing in real time. Offline friends show their <b>last-seen</b> time.',
    placement: 'right',
  },
  {
    before: () => { const t = document.querySelectorAll('.sb-tab')[1]; if (t) setTab('activity', t); },
    wait: 300,
    target: '#tab-activity',
    title: 'Live activity feed 🔔',
    text: 'Song sends, friends coming online, shared tracks and listen-together sessions — a running feed of what your circle is doing.',
    placement: 'right',
  },
  {
    before: () => { const t = document.querySelectorAll('.sb-tab')[0]; if (t) setTab('friends', t); openSheet(1); },
    wait: 750,
    target: '#sheet',
    title: 'Tap a friend to open them',
    text: 'This is <b>Max</b>, listening in New York. From his sheet you can send songs, see his profile, chat, or listen together.',
    placement: 'above',
  },
  {
    target: '#tracks-list',
    title: 'Swipe a song into their queue 🎵',
    text: 'Search Spotify\'s 80M+ tracks, then <b>swipe any song left</b> — it drops straight into their queue and pops up in your chat.',
    placement: 'above',
    demoSwipe: true,
  },
  {
    before: () => { const t = document.querySelectorAll('.sh-tab')[1]; if (t) setSheetTab('profile', t); },
    wait: 400,
    target: '#sh-panel-profile',
    title: 'Peek at their profile 🎧',
    text: 'Their <b>recently played</b> songs and all their <b>playlists</b> — the quickest way to get someone\'s music taste.',
    placement: 'above',
  },
  {
    before: () => { const t = document.querySelectorAll('.sh-tab')[2]; if (t) setSheetTab('chat', t); },
    wait: 400,
    target: '#sh-panel-chat',
    title: 'Chat & share 💬',
    text: 'A private chat with each friend. Songs you send appear as <b>playable cards</b> right in the conversation.',
    placement: 'above',
  },
  {
    before: () => { const t = document.querySelectorAll('.sh-tab')[0]; if (t) setSheetTab('send', t); },
    wait: 250,
    target: '#lt-btn',
    title: 'Listen together 🎶',
    text: 'Tap to <b>sync playback in real time</b> — you both hear the same song at the same second, anywhere in the world.',
    placement: 'above',
  },
  {
    target: '.more-btn',
    title: 'Block anyone annoying 🚫',
    text: 'The <b>···</b> lets you block someone for 2 hours, a day, a week, or forever — they auto-unblock when the time\'s up.',
    placement: 'above',
  },
  {
    before: () => { closeSheet(); },
    wait: 450,
    target: 'button[title="Cultural Passport"]',
    title: 'Your Cultural Passport 🌍',
    text: 'Every country you hear music from gets <b>collected</b>. Track your <b>% of the world</b>, level up explorer ranks, hit <b>🎲 Discover</b> for a new country, and climb the <b>friends leaderboard</b>.',
    placement: 'below',
  },
  {
    target: '#player',
    title: 'Player & controls 🎵',
    text: 'The bar at the bottom plays music for real (built-in preview), with play, skip, seek, like and volume — plus your headphone brand as the active device.',
    placement: 'above',
  },
  {
    target: '.add-friend-btn',
    title: 'Bring your friends in 🤝',
    text: 'Invite by link, or import from <b>WhatsApp, Snapchat, Instagram</b> & contacts. Imagine your whole Snap friend list, right on the map.',
    placement: 'right',
  },
  {
    before: () => { document.getElementById('map')?.scrollIntoView(); },
    target: '.user-chip',
    title: 'That\'s Spotify Jam Map ✨',
    text: 'A social map, song-sending, profiles, chat, listen-together, and a game to explore the world\'s music — all in one. Enjoy exploring!',
    placement: 'below',
  },
];

let tourIdx = 0;

function startTour() {
  // must be inside the app
  if (!document.getElementById('app').classList.contains('show')) return;
  closeSheet();
  ['blk-modal', 'lt-modal', 'af-modal', 'prof-modal', 'nc-modal'].forEach(closeModal);
  tourIdx = 0;
  document.getElementById('tour').classList.add('on');
  buildTourDots();
  showTourStep();
}

function buildTourDots() {
  document.getElementById('tour-dots').innerHTML =
    TOUR_STEPS.map((_, i) => `<div class="tour-dot ${i === tourIdx ? 'on' : ''}"></div>`).join('');
}

function showTourStep() {
  const step = TOUR_STEPS[tourIdx];
  if (!step) { endTour(); return; }

  const run = () => {
    // demo an actual swipe so the viewer sees the queue animation
    if (step.demoSwipe) setTimeout(demoSwipe, 500);
    positionTour(step);
  };

  if (step.before) { step.before(); setTimeout(run, step.wait || 350); }
  else run();

  document.getElementById('tour-badge').textContent = `✨ STEP ${tourIdx + 1} / ${TOUR_STEPS.length}`;
  document.getElementById('tour-title').innerHTML = step.title;
  document.getElementById('tour-text').innerHTML = step.text;
  document.getElementById('tour-next').textContent = tourIdx === TOUR_STEPS.length - 1 ? 'Finish ✓' : 'Next →';
  buildTourDots();
}

function positionTour(step) {
  const el = document.querySelector(step.target);
  const spot = document.getElementById('tour-spot');
  const card = document.getElementById('tour-card');
  if (!el) { // fallback: center card, hide spotlight
    spot.style.opacity = '0';
    card.style.left = '50%'; card.style.top = '50%';
    card.style.transform = 'translate(-50%,-50%)';
    return;
  }
  spot.style.opacity = '1';
  const r = el.getBoundingClientRect();
  const pad = 8;
  spot.style.left = (r.left - pad) + 'px';
  spot.style.top = (r.top - pad) + 'px';
  spot.style.width = (r.width + pad * 2) + 'px';
  spot.style.height = (r.height + pad * 2) + 'px';

  // place card relative to spotlight, clamped to viewport
  const cw = 300, ch = card.offsetHeight || 190, gap = 18;
  let left, top;
  const place = step.placement || 'below';
  if (place === 'center') { left = (window.innerWidth - cw) / 2; top = (window.innerHeight - ch) / 2; }
  else if (place === 'right') { left = r.right + gap; top = r.top; }
  else if (place === 'above') { left = r.left + r.width / 2 - cw / 2; top = r.top - ch - gap; }
  else if (place === 'below') { left = r.left + r.width / 2 - cw / 2; top = r.bottom + gap; }
  else { left = r.left; top = r.bottom + gap; }

  left = Math.max(16, Math.min(left, window.innerWidth - cw - 16));
  top = Math.max(16, Math.min(top, window.innerHeight - ch - 16));
  card.style.transform = 'none';
  card.style.left = left + 'px';
  card.style.top = top + 'px';
}

/* Programmatic swipe animation on the first track row (tour demo) */
function demoSwipe() {
  const ti = document.getElementById('ti0'), tbg = document.getElementById('tbg0');
  if (!ti || !tbg) return;
  ti.style.transition = 'transform .5s cubic-bezier(.32,.72,0,1)';
  tbg.style.transition = 'width .5s,opacity .4s';
  tbg.style.width = '150px'; tbg.style.opacity = '1';
  ti.style.transform = 'translateX(-150px)';
  setTimeout(() => {
    if (visSongs[0] && curFriend) toast('🎵', `"${visSongs[0].name}" sent to ${curFriend.name}'s queue!`);
    ti.style.transform = 'translateX(0)';
    tbg.style.width = '0'; tbg.style.opacity = '0';
  }, 900);
}

function tourNext() {
  tourIdx++;
  if (tourIdx >= TOUR_STEPS.length) { endTour(); return; }
  showTourStep();
}

function endTour() {
  document.getElementById('tour').classList.remove('on');
  closeSheet();
  toast('✨', 'Tour complete — explore freely!');
}

// keep spotlight aligned if the window resizes mid-tour
window.addEventListener('resize', () => {
  if (document.getElementById('tour').classList.contains('on')) positionTour(TOUR_STEPS[tourIdx]);
});

/* ═══════════════════════════════════════════════════════════════════
   9. HELPERS + KEYBOARD + INIT
   ═══════════════════════════════════════════════════════════════════ */
function nowTime() {
  const d = new Date();
  let h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
function escapeHTML(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (document.getElementById('app').classList.contains('show')) {
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowRight') nextTrack();
    if (e.code === 'ArrowLeft') prevTrack();
  }
  if (e.code === 'Escape') {
    if (document.getElementById('tour').classList.contains('on')) { endTour(); return; }
    closeSheet();
    ['blk-modal', 'lt-modal', 'af-modal', 'prof-modal', 'nc-modal', 'pp-modal', 'lb-modal', 'privacy-modal', 'req-modal'].forEach(closeModal);
  }
});

// render initial builder avatar as soon as the file loads (welcome screen still up)
window.addEventListener('DOMContentLoaded', () => {
  // pre-warm nothing heavy; builder controls build on demand
});
