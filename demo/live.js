/* ═══════════════════════════════════════════════════════════════════
   SPOTIFY JAM MAP — LIVE (real multiplayer)
   Real friends log in from their own devices (Firebase Realtime DB +
   anonymous auth). You connect via an invite link, then send each other
   songs and chat in real time.
   ═══════════════════════════════════════════════════════════════════ */
'use strict';

/* ── Avatar engine (shared visual language with the demo) ── */
const SKIN_TONES = ['#FFE0BD', '#F5CFA0', '#E8B98A', '#C68642', '#8D5524', '#5C3A21'];
const HAIR_COLORS = ['#1a1a1a', '#4a2c14', '#8B5A2B', '#D4A017', '#C0C0C0', '#E8613C', '#9b59f7'];
const SHIRT_COLORS = ['#1DB954', '#e22134', '#4a90e2', '#9b59f7', '#ffb800', '#ff69b4', '#ffffff', '#282828'];
const HEADPHONES = [
  { id: 'airpods',    name: 'AirPods',      type: 'buds', color: '#ffffff', accent: '#e5e5e5' },
  { id: 'airpodsmax', name: 'AirPods Max',  type: 'over', color: '#c9c6cf', accent: '#a8a5ad' },
  { id: 'beats',      name: 'Beats',        type: 'over', color: '#e22134', accent: '#b81a29' },
  { id: 'sony',       name: 'Sony',         type: 'over', color: '#1a1a1a', accent: '#000000' },
  { id: 'galaxy',     name: 'Galaxy Buds',  type: 'buds', color: '#7b4fd4', accent: '#5f3ba8' },
];
const HAIRSTYLES = [
  { id: 'short', name: 'Short' }, { id: 'buzz', name: 'Buzz' }, { id: 'wavy', name: 'Wavy' },
  { id: 'curly', name: 'Curly' }, { id: 'bangs', name: 'Bangs' }, { id: 'long', name: 'Long' },
  { id: 'bun', name: 'Bun' }, { id: 'ponytail', name: 'Ponytail' },
];
const INK = '#2a1e15';

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
function headphoneSVG(phones) {
  const hp = HEADPHONES.find(h => h.id === phones); if (!hp) return '';
  if (hp.type === 'over') return `<path d="M22 52 Q22 18 50 18 Q78 18 78 52" fill="none" stroke="${hp.accent}" stroke-width="7" stroke-linecap="round"/><path d="M22 52 Q22 20 50 20 Q78 20 78 52" fill="none" stroke="${hp.color}" stroke-width="4" stroke-linecap="round"/><rect x="13" y="46" width="16" height="26" rx="8" fill="${hp.color}" stroke="${hp.accent}" stroke-width="2"/><rect x="71" y="46" width="16" height="26" rx="8" fill="${hp.color}" stroke="${hp.accent}" stroke-width="2"/>`;
  return `<circle cx="21" cy="56" r="6" fill="${hp.color}" stroke="${hp.accent}" stroke-width="1.5"/><rect x="18.5" y="58" width="5" height="14" rx="2.5" fill="${hp.color}"/><circle cx="79" cy="56" r="6" fill="${hp.color}" stroke="${hp.accent}" stroke-width="1.5"/><rect x="76.5" y="58" width="5" height="14" rx="2.5" fill="${hp.color}"/>`;
}
function hairstyleSVG(style, hair) {
  const hl = shade(hair, 0.35), dk = shade(hair, -0.3);
  const strand = `<path d="M40 30 Q50 27 60 30" stroke="${hl}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/>`;
  switch (style) {
    case 'buzz': return { back: '', front: `<path d="M31 45 Q31 26 50 26 Q69 26 69 45 Q62 37 50 36.5 Q38 37 31 45 Z" fill="${hair}"/>` };
    case 'wavy': return { back: '', front: `<path d="M27 48 Q26 22 50 22 Q74 22 73 48 Q71 40 66 34 Q63 42 57 34 Q54 42 50 33 Q46 42 43 34 Q37 42 34 34 Q29 40 27 48 Z" fill="${hair}"/>${strand}` };
    case 'curly': return { back: `<g fill="${hair}"><circle cx="30" cy="46" r="8"/><circle cx="70" cy="46" r="8"/></g>`, front: `<g fill="${hair}"><circle cx="34" cy="34" r="10"/><circle cx="47" cy="28" r="11"/><circle cx="60" cy="31" r="10"/><circle cx="30" cy="42" r="8"/><circle cx="70" cy="42" r="8"/></g>` };
    case 'bangs': return { back: `<path d="M27 44 Q27 46 28 56 L34 56 L34 44 Z" fill="${hair}"/><path d="M73 44 Q73 46 72 56 L66 56 L66 44 Z" fill="${hair}"/>`, front: `<path d="M27 47 Q27 22 50 22 Q73 22 73 47 Q73 45 68 44 L64 44 Q62 45 59 44 L55 44 Q52 45 49 44 L45 44 Q42 45 39 44 L35 44 Q30 45 27 47 Z" fill="${hair}"/>` };
    case 'long': return { back: `<path d="M25 44 Q25 20 50 20 Q75 20 75 44 L75 76 Q75 82 68 83 L62 60 L62 46 L38 46 L38 60 L32 83 Q25 82 25 76 Z" fill="${hair}"/>`, front: `<path d="M27 47 Q27 21 50 21 Q73 21 73 47 Q69 31 50 30 Q31 31 27 47 Z" fill="${hair}"/>${strand}` };
    case 'bun': return { back: `<circle cx="50" cy="19" r="8" fill="${hair}"/>`, front: `<path d="M29 45 Q29 24 50 24 Q71 24 71 45 Q64 33 50 32.5 Q36 33 29 45 Z" fill="${hair}"/>${strand}` };
    case 'ponytail': return { back: `<path d="M67 32 Q84 38 82 58 Q81 68 74 70 Q80 58 75 47 Q71 39 65 39 Z" fill="${hair}"/>`, front: `<path d="M29 45 Q29 24 50 24 Q71 24 71 45 Q64 33 50 32.5 Q36 33 29 45 Z" fill="${hair}"/>${strand}` };
    default: return { back: '', front: `<path d="M28 46 Q27 23 50 23 Q73 23 72 46 Q66 32 50 31 Q34 32 28 46 Z" fill="${hair}"/><path d="M28 46 Q26 36 31 29 Q30 41 34 44 Z" fill="${hair}"/><path d="M72 46 Q74 36 69 29 Q70 41 66 44 Z" fill="${hair}"/>${strand}` };
  }
}
function outfitSVG(color) {
  const dk = shade(color, -0.28);
  return `<path d="M15 100 Q15 73 50 72 Q85 73 85 100 Z" fill="${color}"/><path d="M40 73 Q50 80 60 73" fill="none" stroke="${dk}" stroke-width="2" stroke-linecap="round"/>`;
}
function avatarSVG(spec) {
  const skin = spec.skin, hair = spec.hair, color = spec.shirt || '#1DB954';
  const wig = hairstyleSVG(spec.hairstyle || 'short', hair);
  const uid = spec._uid || 'x';
  const sOut = shade(skin, -0.5), sSh = shade(skin, -0.16), brow = shade(hair, -0.2);
  const iris = shade(hair === '#1a1a1a' ? '#5b3a1e' : hair, -0.05);
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="c-${uid}"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#c-${uid})">
    <rect width="100" height="100" fill="#1c1c1c"/><circle cx="50" cy="50" r="50" fill="#262626"/>
    <g stroke="${INK}" stroke-width="1.2" stroke-linejoin="round">${wig.back}</g>
    <g stroke="${INK}" stroke-width="1.6" stroke-linejoin="round">${outfitSVG(color)}</g>
    <path d="M43 61 h14 v10 q-7 4 -14 0 Z" fill="${skin}" stroke="${sOut}" stroke-width="1.2"/>
    <circle cx="29.5" cy="49" r="5" fill="${skin}" stroke="${sOut}" stroke-width="1.2"/><circle cx="70.5" cy="49" r="5" fill="${skin}" stroke="${sOut}" stroke-width="1.2"/>
    <path d="M30 44 Q30 22 50 22 Q70 22 70 44 Q70 60 60 66 Q55 69 50 69 Q45 69 40 66 Q30 60 30 44 Z" fill="${skin}" stroke="${sOut}" stroke-width="1.4" stroke-linejoin="round"/>
    <ellipse cx="37.5" cy="55" rx="4" ry="2.6" fill="#ff8f7a" opacity=".26"/><ellipse cx="62.5" cy="55" rx="4" ry="2.6" fill="#ff8f7a" opacity=".26"/>
    <path d="M37 43 Q42 40 47 42.5" stroke="${brow}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M53 42.5 Q58 40 63 43" stroke="${brow}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="42" cy="49" rx="3.7" ry="4.3" fill="#fff"/><ellipse cx="58" cy="49" rx="3.7" ry="4.3" fill="#fff"/>
    <circle cx="42.3" cy="49.5" r="2.7" fill="${iris}"/><circle cx="58.3" cy="49.5" r="2.7" fill="${iris}"/>
    <circle cx="42.3" cy="49.5" r="1.4" fill="#171717"/><circle cx="58.3" cy="49.5" r="1.4" fill="#171717"/>
    <circle cx="43.4" cy="48.1" r="1" fill="#fff"/><circle cx="59.4" cy="48.1" r="1" fill="#fff"/>
    <path d="M38.3 46.6 Q42 44.6 45.7 46.6" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M54.3 46.6 Q58 44.6 61.7 46.6" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M42.5 59.5 Q50 65.5 57.5 59.5" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M45 61 Q50 63.8 55 61 Q50 62 45 61 Z" fill="#fff"/>
    <g stroke="${INK}" stroke-width="1.3" stroke-linejoin="round">${wig.front}</g>
    ${headphoneSVG(spec.phones)}
  </g></svg>`;
}
let _uid = 0;
function renderAvatar(spec) { return avatarSVG(Object.assign({}, spec, { _uid: 'a' + (_uid++) })); }

/* ── Song catalog (metadata only) ── */
const SONGS = [
  { name: 'Blinding Lights', artist: 'The Weeknd', art: 'https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268' },
  { name: 'bad guy', artist: 'Billie Eilish', art: 'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163' },
  { name: 'As It Was', artist: 'Harry Styles', art: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0' },
  { name: 'Flowers', artist: 'Miley Cyrus', art: 'https://i.scdn.co/image/ab67616d0000b273b8aa2c63cff1a92cd23f5cc2' },
  { name: 'Anti-Hero', artist: 'Taylor Swift', art: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' },
  { name: 'Levitating', artist: 'Dua Lipa', art: 'https://i.scdn.co/image/ab67616d0000b2734bc66095f8a70bc4e6593f4f' },
  { name: 'Heat Waves', artist: 'Glass Animals', art: 'https://i.scdn.co/image/ab67616d0000b273712b1a8f2e5680c5d6d9a931' },
  { name: 'Starboy', artist: 'The Weeknd', art: 'https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268' },
  { name: 'drivers license', artist: 'Olivia Rodrigo', art: 'https://i.scdn.co/image/ab67616d0000b27363f1f3c03a8f9b74eaf0f8a7' },
  { name: 'Shape of You', artist: 'Ed Sheeran', art: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96' },
];

/* ── Cultural Passport data ── */
const COUNTRIES = [
  {n:'Spain',f:'🇪🇸',r:'Europe'},{n:'United Kingdom',f:'🇬🇧',r:'Europe'},{n:'France',f:'🇫🇷',r:'Europe'},{n:'Italy',f:'🇮🇹',r:'Europe'},
  {n:'Germany',f:'🇩🇪',r:'Europe'},{n:'Portugal',f:'🇵🇹',r:'Europe'},{n:'Sweden',f:'🇸🇪',r:'Europe'},{n:'Ireland',f:'🇮🇪',r:'Europe'},
  {n:'Greece',f:'🇬🇷',r:'Europe'},{n:'Poland',f:'🇵🇱',r:'Europe'},{n:'Netherlands',f:'🇳🇱',r:'Europe'},{n:'Turkey',f:'🇹🇷',r:'Europe'},
  {n:'United States',f:'🇺🇸',r:'Americas'},{n:'Canada',f:'🇨🇦',r:'Americas'},{n:'Mexico',f:'🇲🇽',r:'Americas'},{n:'Brazil',f:'🇧🇷',r:'Americas'},
  {n:'Argentina',f:'🇦🇷',r:'Americas'},{n:'Colombia',f:'🇨🇴',r:'Americas'},{n:'Puerto Rico',f:'🇵🇷',r:'Americas'},{n:'Jamaica',f:'🇯🇲',r:'Americas'},
  {n:'Chile',f:'🇨🇱',r:'Americas'},{n:'Peru',f:'🇵🇪',r:'Americas'},{n:'Cuba',f:'🇨🇺',r:'Americas'},
  {n:'South Korea',f:'🇰🇷',r:'Asia'},{n:'Japan',f:'🇯🇵',r:'Asia'},{n:'China',f:'🇨🇳',r:'Asia'},{n:'India',f:'🇮🇳',r:'Asia'},
  {n:'Indonesia',f:'🇮🇩',r:'Asia'},{n:'Philippines',f:'🇵🇭',r:'Asia'},{n:'Thailand',f:'🇹🇭',r:'Asia'},{n:'Vietnam',f:'🇻🇳',r:'Asia'},
  {n:'Nigeria',f:'🇳🇬',r:'Africa'},{n:'South Africa',f:'🇿🇦',r:'Africa'},{n:'Egypt',f:'🇪🇬',r:'Africa'},{n:'Ghana',f:'🇬🇭',r:'Africa'},
  {n:'Kenya',f:'🇰🇪',r:'Africa'},{n:'Morocco',f:'🇲🇦',r:'Africa'},{n:'Senegal',f:'🇸🇳',r:'Africa'},
  {n:'Australia',f:'🇦🇺',r:'Oceania'},{n:'New Zealand',f:'🇳🇿',r:'Oceania'},
];
const WORLD_TOTAL = 236;
const REGIONS = ['Europe', 'Americas', 'Asia', 'Africa', 'Oceania'];
const SONG_COUNTRY = {
  'Blinding Lights': 'Canada', 'Starboy': 'Canada', 'bad guy': 'United States', 'Flowers': 'United States',
  'Anti-Hero': 'United States', 'drivers license': 'United States', 'As It Was': 'United Kingdom',
  'Levitating': 'United Kingdom', 'Heat Waves': 'United Kingdom', 'Shape of You': 'United Kingdom',
};
function songCountry(n) { return SONG_COUNTRY[n] || 'United States'; }
function passportTitle(pct) {
  if (pct >= 100) return '🏆 Cultural Legend'; if (pct >= 60) return '🌟 World Citizen';
  if (pct >= 35) return '🧭 Globetrotter'; if (pct >= 15) return '✈️ Wanderer';
  if (pct >= 5) return '🎒 Explorer'; return '🌱 Rookie Listener';
}

/* ── State ── */
const ME = { name: '', skin: SKIN_TONES[0], hair: HAIR_COLORS[0], hairstyle: 'short', shirt: SHIRT_COLORS[0], phones: 'airpods' };
let db = null, myUid = null, myConnRef = null;
let collectedCountries = new Set();
const friends = {};        // uid -> {profile, unread}
let activeFriend = null;   // uid
let pendingInvite = null;   // uid to connect after join

/* ── Boot: decide which screen to show ── */
window.addEventListener('DOMContentLoaded', () => {
  // capture invite ?jam=<uid>
  const params = new URLSearchParams(location.search);
  pendingInvite = params.get('jam');

  if (!window.FIREBASE_CONFIG) { show('setup'); return; }

  try {
    firebase.initializeApp(window.FIREBASE_CONFIG);
    db = firebase.database();
  } catch (e) {
    console.error('Firebase init failed', e);
    show('setup'); return;
  }

  // returning user? restore profile
  const saved = localStorage.getItem('jamme');
  if (saved) { try { Object.assign(ME, JSON.parse(saved)); } catch (e) {} }

  loadPassport();
  buildLoginControls();
  renderPreview();
  document.getElementById('me-name').value = ME.name || '';
  if (pendingInvite) document.getElementById('login-sub').innerHTML = '🎉 A friend invited you to Jam Map! Create your character to connect.';

  // Show the login/character screen right away — no need to wait on the network.
  show('login');

  const autoResume = !!ME.name;   // returning user: auto-go-live once auth is ready
  firebase.auth().signInAnonymously().catch(err => { console.error(err); toast('⚠️', 'Connection failed — check your internet'); });
  firebase.auth().onAuthStateChanged(user => {
    if (!user) return;
    myUid = user.uid;
    if (wantStart) { wantStart = false; startApp(); }
    else if (autoResume && !document.getElementById('app').classList.contains('on')) startApp();
  });
});

let wantStart = false;

function show(id) {
  ['setup', 'login'].forEach(s => document.getElementById(s).classList.remove('on'));
  document.getElementById('app').classList.remove('on');
  if (id === 'app') document.getElementById('app').classList.add('on');
  else document.getElementById(id).classList.add('on');
}

/* ── Login / avatar builder ── */
function buildLoginControls() {
  document.getElementById('opt-skin').innerHTML = SKIN_TONES.map(c => sw(c, 'skin')).join('');
  document.getElementById('opt-hair').innerHTML = HAIR_COLORS.map(c => sw(c, 'hair')).join('');
  document.getElementById('opt-shirt').innerHTML = SHIRT_COLORS.map(c => sw(c, 'shirt')).join('');
  document.getElementById('opt-style').innerHTML = HAIRSTYLES.map(h =>
    `<button class="chip ${ME.hairstyle === h.id ? 'sel' : ''}" onclick="pick('hairstyle','${h.id}',this)">${h.name}</button>`).join('');
  document.getElementById('opt-phones').innerHTML = HEADPHONES.map(h =>
    `<button class="chip ${ME.phones === h.id ? 'sel' : ''}" onclick="pick('phones','${h.id}',this)">${h.name}</button>`).join('');
}
function sw(color, kind) {
  return `<div class="sw ${ME[kind] === color ? 'sel' : ''}" style="background:${color}" onclick="pickSw('${kind}','${color}',this)"></div>`;
}
function pickSw(kind, color, el) {
  ME[kind] = color;
  el.parentElement.querySelectorAll('.sw').forEach(s => s.classList.remove('sel'));
  el.classList.add('sel'); renderPreview();
}
function pick(kind, val, el) {
  ME[kind] = val;
  el.parentElement.querySelectorAll('.chip').forEach(s => s.classList.remove('sel'));
  el.classList.add('sel'); renderPreview();
}
function renderPreview() { document.getElementById('av-preview').innerHTML = renderAvatar(ME); }

function doJoin() {
  const name = document.getElementById('me-name').value.trim();
  if (!name) { toast('✏️', 'Enter your name first'); return; }
  ME.name = name;
  localStorage.setItem('jamme', JSON.stringify(ME));
  if (myUid) startApp();
  else { wantStart = true; toast('🔄', 'Connecting…'); }   // auth still in flight
}

/* ── Go live: write presence, wire listeners ── */
function startApp() {
  if (!myUid || !db) return;
  show('app');
  document.getElementById('me-chip-name').textContent = ME.name;
  document.getElementById('me-chip-av').innerHTML = renderAvatar(ME);

  const meRef = db.ref('users/' + myUid);
  const profile = { name: ME.name, avatar: { skin: ME.skin, hair: ME.hair, hairstyle: ME.hairstyle, shirt: ME.shirt, phones: ME.phones }, online: true, passportCount: collectedCountries.size, lastSeen: firebase.database.ServerValue.TIMESTAMP };
  meRef.update(profile);
  updatePassportBadge();

  // presence
  const conn = db.ref('.info/connected');
  conn.on('value', s => {
    if (s.val()) {
      meRef.child('online').onDisconnect().set(false);
      meRef.child('lastSeen').onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
      meRef.update({ online: true });
    }
  });

  // connect the inviter, if any
  if (pendingInvite && pendingInvite !== myUid) {
    connectTo(pendingInvite);
    pendingInvite = null;
    history.replaceState(null, '', location.pathname);
  }

  // watch my connections
  myConnRef = db.ref('connections/' + myUid);
  myConnRef.on('child_added', snap => watchFriend(snap.key));
  myConnRef.on('child_removed', snap => { delete friends[snap.key]; renderPeople(); });

  // inbox: songs sent to me
  db.ref('inbox/' + myUid).on('child_added', snap => {
    const v = snap.val();
    if (!v) return;
    // ignore old messages (older than page load - 5s) to avoid replay spam
    toast('🎵', `${v.fromName || 'A friend'} sent you "${v.song?.name}"`);
    playSong(v.song?.name, v.song?.artist, v.song?.art);
    if (activeFriend !== v.fromUid && friends[v.fromUid]) { friends[v.fromUid].unread = (friends[v.fromUid].unread || 0) + 1; renderPeople(); }
    snap.ref.remove(); // consume
  });

  updateInviteLink();
}

function watchFriend(uid) {
  if (uid === myUid) return;
  db.ref('users/' + uid).on('value', snap => {
    const p = snap.val();
    if (!p) return;
    friends[uid] = friends[uid] || { unread: 0 };
    friends[uid].profile = p;
    renderPeople();
    if (activeFriend === uid) refreshHero();
  });
}

function connectTo(otherUid) {
  if (!db || !myUid || otherUid === myUid) return;
  db.ref('connections/' + myUid + '/' + otherUid).set(true);
  db.ref('connections/' + otherUid + '/' + myUid).set(true);
  toast('🤝', 'Connected! You can now send songs.');
}

/* ── People list ── */
function renderPeople() {
  const ids = Object.keys(friends);
  const onlineN = ids.filter(id => friends[id].profile?.online).length;
  document.getElementById('online-count').textContent = onlineN + ' online';
  const el = document.getElementById('people');
  if (!ids.length) {
    el.innerHTML = `<div class="empty"><span class="big">👋</span>No friends connected yet.<br/>Tap <b style="color:var(--green)">Invite a friend</b> above and send Simon the link!</div>`;
    return;
  }
  // online first
  ids.sort((a, b) => (friends[b].profile?.online ? 1 : 0) - (friends[a].profile?.online ? 1 : 0));
  el.innerHTML = ids.map(id => {
    const f = friends[id], p = f.profile || {};
    const on = p.online;
    return `<div class="person ${activeFriend === id ? 'sel' : ''}" onclick="openFriend('${id}')">
      <div class="p-avwrap"><div class="p-av">${p.avatar ? renderAvatar(p.avatar) : ''}</div><div class="p-dot ${on ? 'on' : 'off'}"></div></div>
      <div class="p-info"><div class="p-name">${escapeHTML(p.name || 'Friend')}</div>
        <div class="p-status">${on ? '🟢 Online now' : '⚪ ' + lastSeenText(p.lastSeen)}</div></div>
      ${f.unread ? `<span class="p-unread">${f.unread}</span>` : ''}
    </div>`;
  }).join('');
}

function openFriend(uid) {
  activeFriend = uid;
  friends[uid].unread = 0;
  renderPeople();
  document.getElementById('panel-empty').style.display = 'none';
  document.getElementById('panel-chat').style.display = 'flex';
  document.getElementById('panel').classList.add('mobile-on');
  refreshHero();
  setPane('send', document.querySelector('.tab'));
  document.getElementById('song-search').value = '';
  renderSongs('');
  watchChat(uid);
}
function refreshHero() {
  const p = friends[activeFriend]?.profile || {};
  document.getElementById('ch-av').innerHTML = p.avatar ? renderAvatar(p.avatar) : '';
  document.getElementById('ch-name').textContent = p.name || 'Friend';
  document.getElementById('ch-status').textContent = p.online ? '🟢 Online — listening now' : '⚪ ' + lastSeenText(p.lastSeen);
}
function setPane(name, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('pane-' + name).classList.add('on');
  if (name === 'chat') setTimeout(() => document.getElementById('chat-input').focus(), 80);
}

/* ── Songs ── */
function renderSongs(q) {
  const t = (q || '').trim().toLowerCase();
  const list = t ? SONGS.filter(s => s.name.toLowerCase().includes(t) || s.artist.toLowerCase().includes(t)) : SONGS;
  document.getElementById('songs').innerHTML = list.map(s => `
    <div class="song">
      <div class="song-art"><img src="${s.art}" onerror="this.style.display='none'"/></div>
      <div class="song-info"><div class="song-name">${escapeHTML(s.name)}</div><div class="song-artist">${escapeHTML(s.artist)}</div></div>
      <button class="song-send" onclick='sendSong(${JSON.stringify(s).replace(/'/g, "&#39;")})'>Send →</button>
    </div>`).join('');
}
function sendSong(song) {
  if (!activeFriend) return;
  const payload = { fromUid: myUid, fromName: ME.name, song, time: firebase.database.ServerValue.TIMESTAMP };
  db.ref('inbox/' + activeFriend).push(payload);
  db.ref('chats/' + pairKey(myUid, activeFriend)).push({ fromUid: myUid, song, time: firebase.database.ServerValue.TIMESTAMP });
  blip();
  toast('🎵', `Sent "${song.name}" to ${friends[activeFriend]?.profile?.name || 'friend'}!`);
  collectC(song.name);
}

/* ── Chat ── */
let chatRef = null;
function watchChat(uid) {
  document.getElementById('chat').innerHTML = '';
  if (chatRef) chatRef.off();
  chatRef = db.ref('chats/' + pairKey(myUid, uid)).limitToLast(100);
  chatRef.on('child_added', snap => renderMsg(snap.val()));
}
function renderMsg(m) {
  if (!m) return;
  const mine = m.fromUid === myUid;
  const chat = document.getElementById('chat');
  let html;
  if (m.song) {
    html = `<div class="msg-song ${mine ? 'me' : 'them'}" onclick='playSong(${JSON.stringify(m.song.name)},${JSON.stringify(m.song.artist)},${JSON.stringify(m.song.art)})'>
      <img src="${m.song.art}" onerror="this.style.display='none'"/>
      <div style="flex:1;min-width:0"><div class="ms-name">${escapeHTML(m.song.name)}</div><div class="ms-art">${escapeHTML(m.song.artist)}</div></div>
      <div class="ms-play">▶</div></div>`;
  } else {
    html = `<div class="msg ${mine ? 'me' : 'them'}">${escapeHTML(m.text || '')}<div class="msg-t">${timeText(m.time)}</div></div>`;
  }
  chat.insertAdjacentHTML('beforeend', html);
  chat.scrollTop = chat.scrollHeight;
}
function sendMsg() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !activeFriend) return;
  db.ref('chats/' + pairKey(myUid, activeFriend)).push({ fromUid: myUid, text, time: firebase.database.ServerValue.TIMESTAMP });
  input.value = '';
}

/* ── Invite ── */
function inviteURL() { return location.origin + location.pathname + '?jam=' + myUid; }
function updateInviteLink() { const i = document.getElementById('invite-link'); if (i) i.value = inviteURL(); }
function openInvite() { updateInviteLink(); document.getElementById('invite-modal').classList.add('on'); }
function closeInvite() { document.getElementById('invite-modal').classList.remove('on'); }
function copyInvite() { navigator.clipboard?.writeText(inviteURL()).catch(() => {}); toast('🔗', 'Invite link copied!'); }
function shareVia(app) {
  const url = inviteURL(), text = `Jam with me on Spotify Jam Map 🎧 ${url}`;
  if (navigator.share) { navigator.share({ title: 'Jam Map', text, url }).catch(() => {}); return; }
  toast('📤', `Share via ${app}: link copied`);
  navigator.clipboard?.writeText(url).catch(() => {});
}

/* ── Audio (synth preview) ── */
let audioCtx = null, audioMaster = null, audioLoop = null, step = 0;
const MELODY = [261.63, 329.63, 392.0, 493.88, 392.0, 329.63];
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    audioCtx = new AC(); audioMaster = audioCtx.createGain(); audioMaster.gain.value = 0.05; audioMaster.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return true;
}
function startMusic() {
  if (!ensureAudio()) return; stopMusic(); step = 0;
  audioLoop = setInterval(() => {
    const t = audioCtx.currentTime, o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.value = MELODY[step % MELODY.length];
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g); g.connect(audioMaster); o.start(t); o.stop(t + 0.45); step++;
  }, 280);
}
function stopMusic() { if (audioLoop) { clearInterval(audioLoop); audioLoop = null; } }
function blip() {
  if (!ensureAudio()) return;
  const t = audioCtx.currentTime, o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(660, t); o.frequency.exponentialRampToValueAtTime(990, t + 0.12);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  o.connect(g); g.connect(audioMaster); o.start(t); o.stop(t + 0.22);
}
let playing = false;
function playSong(name, artist, art) {
  toast('▶️', `Now playing "${name}"`);
  if (!playing) { playing = true; startMusic(); }
  collectC(name);
}

/* ── Cultural Passport (LIVE) ── */
function ppPct() { return collectedCountries.size / WORLD_TOTAL * 100; }
function loadPassport() {
  try { const s = JSON.parse(localStorage.getItem('jampp') || '[]'); collectedCountries = new Set(s); } catch (e) { collectedCountries = new Set(); }
  if (collectedCountries.size === 0) collectedCountries.add('United States'); // seed 1
}
function savePassport() {
  localStorage.setItem('jampp', JSON.stringify([...collectedCountries]));
  if (db && myUid) db.ref('users/' + myUid).update({ passportCount: collectedCountries.size });
}
function collectC(songName) {
  const c = songCountry(songName);
  if (collectedCountries.has(c)) return;
  collectedCountries.add(c);
  savePassport();
  updatePassportBadge();
  const meta = COUNTRIES.find(x => x.n === c);
  toast(meta ? meta.f : '🌍', `${c} unlocked! ${ppPct().toFixed(1)}% of the world`);
}
function updatePassportBadge() {
  const b = document.getElementById('pp-badge');
  if (b) b.textContent = ppPct().toFixed(1) + '%';
}
function openLivePassport() {
  const pct = ppPct();
  document.getElementById('lpp-pct').textContent = pct.toFixed(1) + '%';
  document.getElementById('lpp-count').textContent = `${collectedCountries.size} of ${WORLD_TOTAL} countries`;
  document.getElementById('lpp-rank').textContent = passportTitle(pct);
  const ring = document.getElementById('lpp-ring');
  const circ = 2 * Math.PI * 52;
  ring.style.strokeDasharray = circ;
  ring.style.strokeDashoffset = circ * (1 - Math.min(pct / 100, 1));
  // flags by region
  document.getElementById('lpp-flags').innerHTML = REGIONS.map(region => {
    const inR = COUNTRIES.filter(c => c.r === region);
    return `<div class="lpp-region-h">${region} · ${inR.filter(c => collectedCountries.has(c.n)).length}/${inR.length}</div>
      <div class="lpp-grid">` + inR.map(c => `<div class="lpp-flag ${collectedCountries.has(c.n) ? 'got' : 'locked'}" title="${c.n}">${c.f}</div>`).join('') + `</div>`;
  }).join('');
  // leaderboard of connected friends + me
  const rows = Object.keys(friends).map(uid => ({ name: friends[uid].profile?.name || 'Friend', av: friends[uid].profile?.avatar, pct: ((friends[uid].profile?.passportCount || 0) / WORLD_TOTAL) * 100, me: false }));
  rows.push({ name: ME.name + ' (you)', av: { skin: ME.skin, hair: ME.hair, hairstyle: ME.hairstyle, shirt: ME.shirt, phones: ME.phones }, pct, me: true });
  rows.sort((a, b) => b.pct - a.pct);
  const medals = ['🥇', '🥈', '🥉'];
  document.getElementById('lpp-lb').innerHTML = '<div class="lpp-lb-h">🏆 Leaderboard</div>' + rows.map((r, i) =>
    `<div class="lpp-lb-row ${r.me ? 'me' : ''}"><span class="lpp-lb-rank">${medals[i] || (i + 1)}</span>
      <div class="lpp-lb-av">${r.av ? renderAvatar(r.av) : ''}</div>
      <span class="lpp-lb-name">${escapeHTML(r.name)}</span><span class="lpp-lb-pct">${r.pct.toFixed(1)}%</span></div>`).join('');
  document.getElementById('pp-modal').classList.add('on');
}
function closePassport() { document.getElementById('pp-modal').classList.remove('on'); }

/* ── helpers ── */
function pairKey(a, b) { return [a, b].sort().join('__'); }
function escapeHTML(s) { return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function timeText(ts) { if (!ts) return ''; const d = new Date(ts); let h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0'); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${m} ${ap}`; }
function lastSeenText(ts) { if (!ts) return 'offline'; const mins = Math.floor((Date.now() - ts) / 60000); if (mins < 1) return 'just now'; if (mins < 60) return `${mins} min ago`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs / 24)}d ago`; }
let toastT;
function toast(ico, msg) {
  document.getElementById('t-ico').textContent = ico; document.getElementById('t-msg').textContent = msg;
  const el = document.getElementById('toast'); el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 3200);
}
