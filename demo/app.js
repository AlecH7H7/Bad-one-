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
const HAIR_COLORS = ['#1a1a1a', '#4a2c14', '#8B5A2B', '#D4A017', '#C0C0C0', '#E8613C', '#9b59f7'];
const SHIRT_COLORS = ['#1DB954', '#e22134', '#4a90e2', '#9b59f7', '#ffb800', '#ff69b4', '#ffffff', '#282828'];

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
];

/* Friends. Each has their own avatar spec (skin, hair, shirt, phones). */
const FRIENDS = [
  { id:1, name:'Max',    city:'New York',  country:'USA',    flag:'🇺🇸', lat:40.71,  lng:-74.00,  ring:'#FF6B6B', online:true,  lastSeen:null,          skin:'#F5CFA0', hair:'#4a2c14', shirt:'#FF6B6B', phones:'beats',      acc:'cap',     track:'Blinding Lights', artist:'The Weeknd',   art:SONGS[0].art, unread:1 },
  { id:2, name:'Sofia',  city:'Barcelona', country:'Spain',  flag:'🇪🇸', lat:41.38,  lng:2.17,    ring:'#9b59f7', online:true,  lastSeen:null,          skin:'#E8B98A', hair:'#1a1a1a', shirt:'#9b59f7', phones:'airpods',    acc:'shades',  track:'bad guy',         artist:'Billie Eilish',art:SONGS[1].art, unread:0 },
  { id:3, name:'Jake',   city:'London',    country:'UK',     flag:'🇬🇧', lat:51.50,  lng:-0.12,   ring:'#4a90e2', online:true,  lastSeen:null,          skin:'#FFE0BD', hair:'#D4A017', shirt:'#4a90e2', phones:'sony',       acc:'none',    track:'As It Was',       artist:'Harry Styles', art:SONGS[2].art, unread:0 },
  { id:4, name:'Mia',    city:'Tokyo',     country:'Japan',  flag:'🇯🇵', lat:35.68,  lng:139.69,  ring:'#FF69B4', online:true,  lastSeen:null,          skin:'#F5CFA0', hair:'#e8613c', shirt:'#FF69B4', phones:'airpodsmax', acc:'glasses', track:'Seven',           artist:'Jung Kook',    art:SONGS[8].art, unread:0 },
  { id:5, name:'Carlos', city:'São Paulo', country:'Brazil', flag:'🇧🇷', lat:-23.55, lng:-46.63,  ring:'#2ACEA7', online:false, lastSeen:'20 min ago',  skin:'#C68642', hair:'#1a1a1a', shirt:'#2ACEA7', phones:'jbl',        acc:'none',    track:'Flowers',         artist:'Miley Cyrus',  art:SONGS[3].art, unread:0 },
  { id:6, name:'Priya',  city:'Mumbai',    country:'India',  flag:'🇮🇳', lat:19.07,  lng:72.87,   ring:'#FFB800', online:false, lastSeen:'2 hours ago', skin:'#C68642', hair:'#1a1a1a', shirt:'#FFB800', phones:'galaxy',     acc:'none',    track:'Levitating',      artist:'Dua Lipa',     art:SONGS[5].art, unread:0 },
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
  { name:'Emma', sub:'@emma_beats · 3 mutual',    skin:'#FFE0BD', hair:'#8B5A2B', shirt:'#ff69b4', phones:'airpods' },
  { name:'Leo',  sub:'@leo.wav · 7 mutual',       skin:'#C68642', hair:'#1a1a1a', shirt:'#4a90e2', phones:'sony' },
  { name:'Nina', sub:'@ninatunes · 1 mutual',     skin:'#F5CFA0', hair:'#9b59f7', shirt:'#9b59f7', phones:'beats' },
  { name:'Omar', sub:'@omar_g · 12 mutual',       skin:'#8D5524', hair:'#1a1a1a', shirt:'#ffb800', phones:'galaxy' },
];

/* ═══════════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════════ */

const ME = {
  name: 'Alec',
  skin: SKIN_TONES[0],
  hair: HAIR_COLORS[0],
  shirt: SHIRT_COLORS[0],
  phones: 'airpods',
  acc: 'none',
  city: 'Paris',
  country: 'France',
  lat: 48.85,
  lng: 2.35,
};

let curFriend = null;
let blockChoice = null;
let isPlaying = false, progVal = 35, progTimer = null;
let visSongs = SONGS;
const SW = {};              // swipe state per row
const THRESH = 110;         // swipe threshold px
let map = null;
const markerRefs = {};      // friend id -> leaflet marker

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

/* Returns a full SVG string for a character. */
function avatarSVG(spec) {
  const skin = spec.skin, hair = spec.hair, shirt = spec.shirt;
  const showHairTop = !(spec.acc === 'cap' || spec.acc === 'beanie');
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="clip-${spec._uid || 'x'}"><circle cx="50" cy="50" r="50"/></clipPath>
    </defs>
    <g clip-path="url(#clip-${spec._uid || 'x'})">
      <rect width="100" height="100" fill="#181818"/>
      <circle cx="50" cy="50" r="50" fill="#202020"/>
      <!-- shoulders / shirt -->
      <path d="M18 100 Q18 74 50 74 Q82 74 82 100 Z" fill="${shirt}"/>
      <path d="M42 72 h16 v8 q-8 5 -16 0 Z" fill="${skin}"/>
      <!-- neck -->
      <rect x="43" y="64" width="14" height="12" rx="5" fill="${skin}"/>
      <!-- head -->
      <ellipse cx="50" cy="48" rx="21" ry="23" fill="${skin}"/>
      <!-- ears -->
      <circle cx="29" cy="50" r="4.5" fill="${skin}"/>
      <circle cx="71" cy="50" r="4.5" fill="${skin}"/>
      <!-- hair (top) -->
      ${showHairTop ? `<path d="M28 44 Q28 24 50 24 Q72 24 72 44 Q72 34 50 33 Q28 34 28 44 Z" fill="${hair}"/>
      <path d="M28 44 Q26 34 32 28 Q30 40 34 42 Z" fill="${hair}"/>
      <path d="M72 44 Q74 34 68 28 Q70 40 66 42 Z" fill="${hair}"/>` : ''}
      <!-- eyes -->
      <circle cx="42" cy="49" r="2.6" fill="#2a2a2a"/>
      <circle cx="58" cy="49" r="2.6" fill="#2a2a2a"/>
      <circle cx="42.8" cy="48.2" r=".9" fill="#fff"/>
      <circle cx="58.8" cy="48.2" r=".9" fill="#fff"/>
      <!-- brows -->
      <path d="M38 44 q4 -2 8 0" stroke="${hair}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M54 44 q4 -2 8 0" stroke="${hair}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <!-- smile -->
      <path d="M43 58 q7 6 14 0" stroke="#b3654a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- accessory (glasses/shades/hat) -->
      ${accessorySVG(spec.acc, skin)}
      <!-- headphones on top -->
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

function goToBuilder() {
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

  document.getElementById('opt-phones').innerHTML = HEADPHONES.map(h => `
    <button class="tile ${ME.phones === h.id ? 'sel' : ''}" data-phones="${h.id}" onclick="pickPhones('${h.id}',this)">
      <div class="tile-ico">${miniPhoneIcon(h)}</div>
      <div class="tile-txt"><div class="tile-name">${h.name}</div><div class="tile-sub">${h.sub}</div></div>
    </button>`).join('');

  document.getElementById('opt-acc').innerHTML = ACCESSORIES.map(a => `
    <button class="tile ${ME.acc === a.id ? 'sel' : ''}" data-acc="${a.id}" onclick="pickAcc('${a.id}',this)">
      <div class="tile-ico" style="font-size:22px">${a.emoji || '🚫'}</div>
      <div class="tile-txt"><div class="tile-name">${a.name}</div></div>
    </button>`).join('');
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

function renderAvatarPreview() {
  ME.name = document.getElementById('me-name').value || 'You';
  document.getElementById('avatar-svg').innerHTML = renderAvatar(ME);
}

function randomizeAvatar() {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  ME.skin = pick(SKIN_TONES);
  ME.hair = pick(HAIR_COLORS);
  ME.shirt = pick(SHIRT_COLORS);
  ME.phones = pick(HEADPHONES.filter(h => h.type !== 'none')).id;
  ME.acc = pick(ACCESSORIES).id;
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
  if (!map) initMap();

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
  L.marker([ME.lat, ME.lng], { icon: L.divIcon({ html: you, className: '', iconSize: [70, 84], iconAnchor: [35, 74] }) })
    .addTo(map)
    .bindTooltip(`<strong>You</strong> · ${ME.city}`, { direction: 'top', offset: [0, -70], opacity: 1 });
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
  toast('🎵', `"${song.name}" sent to ${curFriend.name}'s queue!`);
  // also drop into chat as a shared song
  (CHATS[curFriend.id] = CHATS[curFriend.id] || []).push({ from: 'me', song: { name: song.name, artist: song.artist, art: song.art }, time: nowTime() });
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
      return `<div class="msg-song ${side}">
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
   8. PLAYER
   ═══════════════════════════════════════════════════════════════════ */
function togglePlay() {
  isPlaying = !isPlaying;
  document.getElementById('play-svg').innerHTML = isPlaying
    ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'
    : '<path d="M8 5v14l11-7z"/>';
  isPlaying ? startProg() : stopProg();
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
    closeSheet();
    ['blk-modal', 'lt-modal', 'af-modal', 'prof-modal', 'nc-modal'].forEach(closeModal);
  }
});

// render initial builder avatar as soon as the file loads (welcome screen still up)
window.addEventListener('DOMContentLoaded', () => {
  // pre-warm nothing heavy; builder controls build on demand
});
