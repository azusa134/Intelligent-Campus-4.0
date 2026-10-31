'use strict';

/* ================= 1. 基础工具 ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const uid = (p) => p + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 5);
const num = (n) => Number(n || 0).toLocaleString('zh-CN');
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const WD = ['日', '一', '二', '三', '四', '五', '六'];

const ICON = {
  search: '<circle cx="11" cy="11" r="6.4"/><path d="M16 16.3 21 21.3"/>',
  back: '<path d="M15 4.5 7.5 12 15 19.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  heart: '<path d="M12 20.2C6.2 16 3.4 12.7 3.4 9.4A4.5 4.5 0 0 1 11.6 6.2L12 6.6l.4-.4a4.5 4.5 0 0 1 8.2 3.2c0 3.3-2.8 6.6-8.6 10.8z"/>',
  star: '<path d="M12 3.8l2.6 5.2 5.7.8-4.1 4 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.1-4 5.7-.8z"/>',
  send: '<path d="M21 3 10.6 13.4M21 3l-6.8 18-3.6-7.6L3 9.8z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.4V12l3 2"/>',
  pin: '<path d="M12 21s6.5-6 6.5-10.5A6.5 6.5 0 0 0 5.5 10.5C5.5 15 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/>',
  bell: '<path d="M18 9.5a6 6 0 1 0-12 0c0 5-2 6.2-2 6.2h16s-2-1.2-2-6.2"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
  check: '<path d="M5 12.5 9.5 17 19 7.5"/>',
  edit: '<path d="M4 20h4L18.4 9.6a2.1 2.1 0 0 0-3-3L5 17z"/>',
  trash: '<path d="M4 7h16M9.5 7V4.2h5V7M6.4 7l.9 13h9.4l.9-13"/>',
  bag: '<path d="M5.4 8h13.2l-1 12.2H6.4z"/><path d="M9 8V6.2a3 3 0 0 1 6 0V8"/>',
  spark: '<path d="M12 3.4l1.7 4.7 4.7 1.7-4.7 1.7L12 16.2l-1.7-4.7L5.6 9.8l4.7-1.7z"/><path d="M18.4 14.6l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  fire: '<path d="M12 3c1.2 4-1.4 5.4-2.6 7.3-1 1.6-.8 3.4.6 4.1-.2-2 .9-3.4 2-4.2-.2 2.6 1.2 3.6 1.5 5.4.2 1.2-.2 2.2-.9 3 3.4-.4 5.4-3 5.4-6 0-4.6-4-7.3-6-9.6z"/>',
  grid: '<rect x="3.2" y="3.2" width="7.4" height="7.4" rx="2.2"/><rect x="13.4" y="3.2" width="7.4" height="7.4" rx="2.2"/><rect x="3.2" y="13.4" width="7.4" height="7.4" rx="2.2"/><rect x="13.4" y="13.4" width="7.4" height="7.4" rx="2.2"/>',
  calendar: '<rect x="3.4" y="5" width="17.2" height="16" rx="3"/><path d="M8 3v4M16 3v4M3.4 10h17.2"/>',
  door: '<path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3H17a1 1 0 0 1 1 1v17"/><path d="M3 21h18M14 12h.01"/>',
  phone: '<path d="M6.2 3.5h3l1.5 4-2 1.4a11 11 0 0 0 5.4 5.4l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2z"/>',
  box: '<path d="M3.8 8.1 12 4l8.2 4.1v7.8L12 20l-8.2-4.1z"/><path d="M3.9 8.1 12 12.2l8.1-4.1M12 12.2V20"/>',
  store: '<path d="M4 10.4v9.1h16v-9.1"/><path d="M3.2 10.4 5 4.5h14l1.8 5.9z"/><path d="M9.6 19.5v-5.4h4.8v5.4"/>',
  coin: '<circle cx="12" cy="12" r="8.2"/><path d="M9.4 9.2h5.2M9.4 12h5.2M12 9.2v6.4"/>',
  folder: '<path d="M3.6 7.6a2 2 0 0 1 2-2h4l2.1 2.6h6.7a2 2 0 0 1 2 2v8.2a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2z"/>'
};
function icon(name, size = 18, extra = '') {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICON[name] || ''}</svg>`;
}
function iconFill(name, size = 18, color = 'currentColor') {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" stroke="none">${ICON[name] || ''}</svg>`;
}

/* ================= 2. 插画系统 ================= */
const ART_BG = {
  book: '#F2E8D5', laptop: '#EDE7D9', bike: '#E9EADF', headphones: '#F0E5E3',
  camera: '#F3E6DB', plant: '#E8EDE1', food: '#F9EAD1', lamp: '#F3EEDC',
  keyboard: '#ECE9E1', clothes: '#F1E7E9', guitar: '#F8E8D6', ball: '#F8E2D2',
  key: '#EDEBDC', heart: '#F9E5E2', cat: '#F2EADC', cup: '#F2E9DB', sun: '#FAEFD6',
  parcel: '#F4EAD9', store: '#E9E9DC', printer: '#ECEAE2', salon: '#F1E7E9',
  washer: '#E8EBE6', gear: '#EFE7D3'
};
const ART = {
  book: `<rect x="24" y="31" width="72" height="59" rx="7" fill="#FFFDF6" stroke="#43382C" stroke-width="3"/>
    <path d="M60 31v59" stroke="#43382C" stroke-width="3"/>
    <path d="M33 45h17M33 54h13M70 45h17M70 54h13" stroke="#43382C" stroke-width="3" opacity=".28" stroke-linecap="round"/>
    <path d="M33 76h14M73 76h14" stroke="#C98A63" stroke-width="6" stroke-linecap="round"/>`,
  laptop: `<path d="M20 76h80l7 10H13z" fill="#FFFDF6" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <rect x="30" y="30" width="60" height="42" rx="6" fill="#43382C"/>
    <rect x="36" y="36" width="48" height="30" rx="3" fill="#E7CBA9"/>
    <path d="M52 81h16" stroke="#43382C" stroke-width="4" stroke-linecap="round"/>`,
  bike: `<circle cx="35" cy="76" r="16" fill="none" stroke="#43382C" stroke-width="4"/>
    <circle cx="85" cy="76" r="16" fill="none" stroke="#43382C" stroke-width="4"/>
    <path d="M35 76l15-26h13l17 26" fill="none" stroke="#43382C" stroke-width="4" stroke-linejoin="round"/>
    <path d="M50 50h25" stroke="#E7CBA9" stroke-width="7" stroke-linecap="round"/>
    <path d="M58 45h13" stroke="#43382C" stroke-width="5" stroke-linecap="round"/>
    <circle cx="62" cy="76" r="4.5" fill="#43382C"/>`,
  headphones: `<path d="M30 68V58a30 30 0 0 1 60 0v10" fill="none" stroke="#43382C" stroke-width="5" stroke-linecap="round"/>
    <rect x="21" y="60" width="17" height="28" rx="8" fill="#E7CBA9" stroke="#43382C" stroke-width="3"/>
    <rect x="82" y="60" width="17" height="28" rx="8" fill="#E7CBA9" stroke="#43382C" stroke-width="3"/>`,
  camera: `<rect x="24" y="42" width="72" height="48" rx="10" fill="#FFFDF6" stroke="#43382C" stroke-width="3"/>
    <rect x="44" y="32" width="22" height="12" rx="5" fill="#43382C"/>
    <circle cx="60" cy="66" r="16" fill="#E7CBA9" stroke="#43382C" stroke-width="3"/>
    <circle cx="60" cy="66" r="6.5" fill="#43382C"/>
    <circle cx="85" cy="54" r="3" fill="#E9A13B"/>`,
  plant: `<path d="M60 84V52" stroke="#43382C" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 64c-16 2-25-8-25-20 15-2 25 6 25 20z" fill="#E7CBA9" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M60 56c16 2 25-8 25-20-15-2-25 6-25 20z" fill="#D9B48F" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M41 84h38l-5 18H46z" fill="#E9A13B" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>`,
  food: `<path d="M27 62h66c0 20-15 32-33 32S27 82 27 62z" fill="#FFFDF6" stroke="#43382C" stroke-width="3"/>
    <path d="M24 60h72" stroke="#43382C" stroke-width="5" stroke-linecap="round"/>
    <path d="M47 48c0-6 7-6 7-13M62 48c0-6 7-6 7-13" stroke="#43382C" stroke-width="3" stroke-linecap="round" opacity=".3"/>
    <path d="M82 30l14 26" stroke="#E9A13B" stroke-width="5" stroke-linecap="round"/>`,
  lamp: `<ellipse cx="60" cy="92" rx="21" ry="6" fill="#43382C"/>
    <path d="M60 92V58" stroke="#43382C" stroke-width="5" stroke-linecap="round"/>
    <path d="M42 58h36l-9-26H51z" fill="#E7CBA9" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>`,
  keyboard: `<rect x="18" y="42" width="84" height="38" rx="9" fill="#FFFDF6" stroke="#43382C" stroke-width="3"/>
    <g stroke="#43382C" stroke-width="6" stroke-linecap="round" opacity=".3">
      <path d="M28 52h8M42 52h8M56 52h8M70 52h8M84 52h8"/>
      <path d="M28 64h8M42 64h8M56 64h8M70 64h8M84 64h8"/>
    </g>
    <path d="M44 74h32" stroke="#43382C" stroke-width="6" stroke-linecap="round" opacity=".3"/>`,
  clothes: `<path d="M46 32 30 42l9 17 9-5v33h24V54l9 5 9-17-16-10-14 7z" fill="#E7CBA9" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>`,
  guitar: `<circle cx="44" cy="78" r="20" fill="#E9A13B" stroke="#43382C" stroke-width="3"/>
    <circle cx="44" cy="78" r="7.5" fill="#43382C"/>
    <path d="M55 68 79 40" stroke="#43382C" stroke-width="7" stroke-linecap="round"/>
    <rect x="74" y="29" width="17" height="12" rx="4" transform="rotate(-42 82.5 35)" fill="#43382C"/>`,
  ball: `<circle cx="60" cy="62" r="30" fill="#E9A13B" stroke="#43382C" stroke-width="3"/>
    <path d="M30 62h60M60 32v60" stroke="#43382C" stroke-width="3" opacity=".32"/>
    <path d="M38 40c14 9 30 9 44 0M38 84c14-9 30-9 44 0" stroke="#43382C" stroke-width="3" opacity=".32"/>`,
  key: `<circle cx="42" cy="46" r="15" fill="none" stroke="#43382C" stroke-width="5"/>
    <circle cx="42" cy="46" r="4" fill="#43382C"/>
    <path d="M52 57l25 25M68 73l8-8M77 82l8-8" stroke="#43382C" stroke-width="5" stroke-linecap="round"/>`,
  heart: `<path d="M60 87 34 61a15 15 0 0 1 21-21l5 5 5-5a15 15 0 0 1 21 21z" fill="#C0563B" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>`,
  cat: `<path d="M38 54l-3-18 15 8h20l15-8-3 18v20c0 11-9 18-22 18s-22-7-22-18z" fill="#E9C79A" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="49" cy="62" r="2.6" fill="#43382C"/><circle cx="71" cy="62" r="2.6" fill="#43382C"/>
    <path d="M56 72c2 3 6 3 8 0" stroke="#43382C" stroke-width="3" stroke-linecap="round"/>`,
  cup: `<path d="M32 48h44v20a18 18 0 0 1-18 18h-8a18 18 0 0 1-18-18z" fill="#FFFDF6" stroke="#43382C" stroke-width="3"/>
    <path d="M76 54h7a8 8 0 0 1 0 16h-7" fill="none" stroke="#43382C" stroke-width="3"/>
    <path d="M44 36c0-5 6-5 6-10M58 36c0-5 6-5 6-10" stroke="#43382C" stroke-width="3" opacity=".28" stroke-linecap="round"/>
    <path d="M32 48h44" stroke="#E9A13B" stroke-width="4"/>`,
  sun: `<circle cx="60" cy="60" r="22" fill="#E9A13B" stroke="#43382C" stroke-width="3"/>
    <g stroke="#43382C" stroke-width="4" stroke-linecap="round"><path d="M60 22v10M60 88v10M22 60h10M88 60h10M33 33l7 7M80 80l7 7M87 33l-7 7M40 80l-7 7"/></g>`,
  parcel: `<path d="M28 38 60 23l32 15v44L60 97 28 82z" fill="#F2E2C6" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M28 38 60 53l32-15M60 53v44" fill="none" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M44 31 76 46v11L44 42z" fill="#E9A13B" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M60 53v13" stroke="#E7CBA9" stroke-width="6" stroke-linecap="round"/>
    <path d="M36 47l16 8M69 55l16-8" stroke="#43382C" stroke-width="2.5" stroke-linecap="round" opacity=".26"/>`,
  store: `<path d="M24 51h72v41H24z" fill="#FFFDF6" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M18 51 27 29h66l9 22z" fill="#E7CBA9" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M18 51c0 6 4.6 9 9.6 9s9.6-3 9.6-9M37.2 51c0 6 4.6 9 9.6 9s9.6-3 9.6-9M56.4 51c0 6 4.6 9 9.6 9s9.6-3 9.6-9M75.6 51c0 6 4.6 9 9.6 9s9.6-3 9.6-9" fill="#FFFDF6" stroke="#43382C" stroke-width="2.6" stroke-linejoin="round"/>
    <rect x="38" y="66" width="20" height="26" rx="3" fill="#43382C"/>
    <circle cx="53" cy="79" r="2.4" fill="#E7CBA9"/>
    <rect x="66" y="66" width="18" height="15" rx="2" fill="#E7CBA9" stroke="#43382C" stroke-width="3"/>
    <path d="M75 66v15M66 73.5h18" stroke="#43382C" stroke-width="2.2"/>`,
  printer: `<rect x="22" y="48" width="76" height="34" rx="5" fill="#FFFDF6" stroke="#43382C" stroke-width="3"/>
    <path d="M35 48V28h50v20" fill="#FFFDF8" stroke="#43382C" stroke-width="3" stroke-linejoin="round"/>
    <rect x="35" y="44" width="50" height="6" fill="#E7CBA9" stroke="#43382C" stroke-width="3"/>
    <rect x="34" y="66" width="52" height="24" rx="2" fill="#E7CBA9" stroke="#43382C" stroke-width="3"/>
    <path d="M43 74h34M43 81h22" stroke="#43382C" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    <circle cx="89" cy="58" r="3.4" fill="#E9A13B"/>`,
  salon: `<circle cx="37" cy="45" r="10" fill="none" stroke="#43382C" stroke-width="3"/>
    <circle cx="37" cy="77" r="10" fill="none" stroke="#43382C" stroke-width="3"/>
    <path d="M45 51 87 85M45 71 87 37" stroke="#43382C" stroke-width="4" stroke-linecap="round"/>
    <circle cx="65" cy="61" r="4" fill="#E9A13B" stroke="#43382C" stroke-width="2.4"/>`,
  washer: `<rect x="30" y="24" width="60" height="74" rx="7" fill="#FFFDF6" stroke="#43382C" stroke-width="3"/>
    <path d="M30 50h60" stroke="#43382C" stroke-width="3"/>
    <circle cx="60" cy="68" r="18" fill="#E7CBA9" stroke="#43382C" stroke-width="3"/>
    <circle cx="60" cy="68" r="8" fill="#FFFDF6" stroke="#43382C" stroke-width="2.6"/>
    <rect x="39" y="34" width="11" height="6" rx="3" fill="#43382C"/>
    <rect x="54" y="34" width="11" height="6" rx="3" fill="#43382C" opacity=".32"/>
    <circle cx="84" cy="37" r="3" fill="#E9A13B"/>`,
  gear: `<circle cx="60" cy="60" r="18" fill="none" stroke="#43382C" stroke-width="4"/>
    <circle cx="60" cy="60" r="6.5" fill="#E7CBA9" stroke="#43382C" stroke-width="3"/>
    <g stroke="#43382C" stroke-width="7" stroke-linecap="round">
      <path d="M60 34v-8M60 94v-8M34 60h-8M94 60h-8M42 42l-6-6M84 84l6 6M84 42l6-6M42 84l-6 6"/>
    </g>`
};
function art(key, w = '100%') {
  const k = ART[key] ? key : 'book';
  return `<svg viewBox="0 0 120 120" width="${w}" height="100%" role="img" aria-hidden="true">${ART[k]}</svg>`;
}
const AV_COLORS = ['#EBDCC4', '#F4DACE', '#DEE7DA', '#E6E0EC', '#EFE6CE', '#DCE4EC'];
function avatarHTML(name, cls = '') {
  const n = (name || '轻').trim();
  const ch = Array.from(n)[0] || '轻';
  let h = 0;
  for (const c of n) h = (h * 31 + c.charCodeAt(0)) % 997;
  return `<span class="avatar ${cls}" style="background:${AV_COLORS[h % AV_COLORS.length]}">${esc(ch)}</span>`;
}

/* ================= 3. 数据层 ================= */
const KEY = 'limeCampusDB_v1';
const PERIODS = [
  { n: 1, s: '08:00', e: '08:45' }, { n: 2, s: '08:55', e: '09:40' },
  { n: 3, s: '10:00', e: '10:45' }, { n: 4, s: '10:55', e: '11:40' },
  { n: 5, s: '14:00', e: '14:45' }, { n: 6, s: '14:55', e: '15:40' },
  { n: 7, s: '16:00', e: '16:45' }, { n: 8, s: '16:55', e: '17:40' },
  { n: 9, s: '19:00', e: '19:45' }, { n: 10, s: '19:55', e: '20:40' },
  { n: 11, s: '20:50', e: '21:35' }, { n: 12, s: '21:45', e: '22:30' }
];
const PALETTE = ['#E0EDFF', '#F7ECC8', '#FBE1D7', '#DDE9FB', '#E8E2FA', '#FBDDE7'];

function seedDB() {
  return {
    version: 1,
    session: null,
    notify: true,
    users: [{
      u: 'demo', p: '123456', nick: '林小满', sid: '20231028',
      college: '计算机学院 · 软件工程', bio: '大二｜摄影、骑行和一点点咖啡因',
      created: Date.now(),
      points: 320,
      pointLog: [
        { d: 100, r: '新人注册奖励', t: '9 月 1 日' },
        { d: 60, r: '邀请新同学 × 2', t: '10 月 12 日' },
        { d: 120, r: '完成交易 × 6', t: '10 月 20 日' },
        { d: 40, r: '发布闲置 × 4', t: '10 月 26 日' }
      ]
    }],
    courses: [
      { id: 'c01', day: 1, start: 1, len: 2, name: '高等数学 A', teacher: '张建国', room: 'A301', color: 1 },
      { id: 'c02', day: 1, start: 3, len: 2, name: '大学英语', teacher: 'Emily', room: 'B205', color: 3 },
      { id: 'c03', day: 2, start: 1, len: 2, name: '数据结构', teacher: '李明', room: '计算机楼 302', color: 0 },
      { id: 'c04', day: 2, start: 5, len: 2, name: '体育（网球）', teacher: '王强', room: '东区网球场', color: 4 },
      { id: 'c05', day: 3, start: 1, len: 2, name: '操作系统', teacher: '陈静', room: 'A408', color: 2 },
      { id: 'c06', day: 3, start: 3, len: 2, name: '数据结构实验', teacher: '李明', room: '机房 205', color: 0 },
      { id: 'c07', day: 3, start: 7, len: 2, name: '创新创业基础', teacher: '赵敏', room: '众创空间', color: 5 },
      { id: 'c08', day: 4, start: 1, len: 2, name: '计算机网络', teacher: '刘洋', room: 'A305', color: 3 },
      { id: 'c09', day: 4, start: 3, len: 2, name: '高等数学 A', teacher: '张建国', room: 'A301', color: 1 },
      { id: 'c10', day: 5, start: 1, len: 2, name: '大学英语', teacher: 'Emily', room: 'B205', color: 3 },
      { id: 'c11', day: 5, start: 5, len: 2, name: '毛泽东思想和中国特色社会主义理论体系概论', teacher: '孙丽', room: 'C101', color: 4 }
    ],
    items: [
      { id: 'i01', title: '《高等数学》同济第七版 上下册，笔记齐全', price: 28, orig: 79, cat: '教材', cond: '九成新', art: 'book', seller: '陈同学', place: '3 号宿舍楼', wants: 42, time: '2 小时前', mine: false, desc: '大一用过一学期，书角有轻微折痕，内页笔记很全（都是重点）。\n可送到 3 号楼楼下，也可以约图书馆门口。' },
      { id: 'i02', title: 'iPad Air 4 64G 深空灰，送保护壳', price: 1580, orig: 4399, cat: '数码', cond: '八成新', art: 'laptop', seller: '阿哲', place: '东区 12 栋', wants: 128, time: '4 小时前', mine: false, boostUntil: Date.now() + 8 * 3600e3, desc: '屏幕无划痕，电池健康 89%，一直贴膜带壳使用。\n换新出，配件有原装充电器和两个保护壳。' },
      { id: 'i03', title: '捷安特 ATX 山地车，毕业急出', price: 420, orig: 1298, cat: '出行', cond: '七成新', art: 'bike', seller: '老王', place: '南门车棚', wants: 76, time: '昨天', mine: false, desc: '骑了两年，刹车和变速都正常，刚换过后胎。\n带车锁和打气筒，南门车棚自提。' },
      { id: 'i04', title: 'Sony WH-1000XM4 降噪耳机', price: 780, orig: 2299, cat: '数码', cond: '九五新', art: 'headphones', seller: 'Momo', place: '西区 6 栋', wants: 203, time: '昨天', mine: false, desc: '去年双十一买的，用得很少，耳罩无掉皮。\n包装盒、收纳包、音频线都在。' },
      { id: 'i05', title: '宿舍护眼台灯，三档调光', price: 15, orig: 59, cat: '生活', cond: '九成新', art: 'lamp', seller: '小林', place: '6 号楼', wants: 18, time: '2 天前', mine: false, desc: 'USB 供电，三档色温，搬宿舍带不走了。\n15 块拿走，可以送到楼下。' },
      { id: 'i06', title: '佳能 EOS 200D 单反套机，适合入门', price: 1980, orig: 3699, cat: '数码', cond: '八成新', art: 'camera', seller: '摄影社学长', place: '艺术楼', wants: 91, time: '3 天前', mine: false, desc: '快门数 1.2 万，镜头 18-55mm，成像正常。\n附带相机包、32G 卡、两块电池。' },
      { id: 'i07', title: '四六级真题 + 手写笔记一套', price: 12, orig: 45, cat: '教材', cond: '全新', art: 'book', seller: '学姐', place: '图书馆', wants: 33, time: '3 天前', mine: false, desc: '买重复了，全新未拆封，笔记是电子版打印的。\n图书馆一楼自习区自取。' },
      { id: 'i08', title: '尤克里里 23 寸，送入门教程', price: 120, orig: 368, cat: '生活', cond: '九成新', art: 'guitar', seller: '阿音', place: '5 号楼', wants: 47, time: '4 天前', mine: false, desc: '大一社团买的，弹了几次就吃灰了。\n琴身无磕碰，送拨片、琴包和一本教程。' },
      { id: 'i09', title: '87 键机械键盘 茶轴，手感很好', price: 95, orig: 299, cat: '数码', cond: '八成新', art: 'keyboard', seller: 'KK', place: '北区 8 栋', wants: 26, time: '5 天前', mine: false, desc: '茶轴，打字不吵，键帽有轻微使用痕迹。\n换了新键盘所以出，附赠手托。' },
      { id: 'i10', title: '冬季加厚棉服 L 码，米白色', price: 60, orig: 399, cat: '生活', cond: '九成新', art: 'clothes', seller: '小满', place: '3 号楼', wants: 12, time: '6 天前', mine: false, desc: '去年冬天买的，只穿过几次，洗过一次。\nL 码，165-172 都能穿。' }
    ],
    posts: [
      { id: 'p01', title: '图书馆四楼靠窗的位置，下午三点的光真的绝了', content: '带了杯美式坐了一下午，效率高得离谱。\n推荐给所有需要赶 due 的朋友，记得早点来占座～', topic: '学习打卡', art: 'book', author: '林小满', likes: 128, collects: 32, time: '1 小时前', mine: true, owner: 'demo', anon: false, comments: [{ who: '陈同学', text: '四楼东侧那排吗？明天去试试', time: '32 分钟前' }, { who: 'Momo', text: '这家咖啡是哪家的呀', time: '18 分钟前' }] },
      { id: 'p02', title: '二食堂新出的麻辣香锅，8 块钱一大盘！', content: '自选三个素菜加一份鸡肉，阿姨手一点都不抖。\n微辣刚好，米饭免费续，性价比直接拉满。', topic: '美食探店', art: 'food', author: '干饭王', likes: 342, collects: 96, time: '3 小时前', mine: false, anon: false, comments: [{ who: '小满', text: '明天中午冲！', time: '1 小时前' }] },
      { id: 'p03', title: '在操场捡到一张校园卡，失主看到请联系我', content: '卡面姓陈，尾号 0427，现在放在 3 号楼宿管阿姨那里。\n有认识的同学帮忙转告一下～', topic: '失物招领', art: 'key', author: '热心市民', likes: 56, collects: 8, time: '5 小时前', mine: false, anon: true, comments: [] },
      { id: 'p04', title: '吉他社秋季招新｜零基础也超欢迎', content: '每周三晚上在艺术楼 201 有免费体验课，琴可以借。\n不用会乐理，带着好奇心来就行。', topic: '社团招新', art: 'guitar', author: '吉他社', likes: 89, collects: 41, time: '昨天', mine: false, anon: false, comments: [{ who: '阿音', text: '请问大一可以加吗', time: '昨天' }] },
      { id: 'p05', title: '期中考完去操场跑了五公里，风很舒服', content: '最近压力有点大，跑完出了一身汗，突然就轻松了。\n建议大家都去试试，耳机里放点喜欢的歌。', topic: '日常碎片', art: 'ball', author: '跑步的鱼', likes: 210, collects: 19, time: '昨天', mine: false, anon: false, comments: [] },
      { id: 'p06', title: '有人一起拼咖啡豆吗，还差两个人', content: '看中一家烘焙店的耶加雪菲，半磅 78，三个人分刚好。\n宿舍有手磨，可以一起在活动室冲。', topic: '拼单搭子', art: 'cup', author: '咖啡因依赖', likes: 34, collects: 12, time: '2 天前', mine: false, anon: false, comments: [] },
      { id: 'p07', title: '宿舍阳台的绿萝长疯了，分几枝给大家', content: '水培就能活，放在书桌上很治愈。\n需要的同学在评论区说一声，我带到教学楼。', topic: '日常碎片', art: 'plant', author: '园艺小白', likes: 167, collects: 58, time: '2 天前', mine: false, anon: false, comments: [] },
      { id: 'p08', title: '求推荐：学校附近安静的自习空间', content: '图书馆周末人太多了，想找个能久坐、有插座的地方。\n咖啡店也行，最好不要太吵。', topic: '求助', art: 'lamp', author: '一只柚子', likes: 45, collects: 27, time: '3 天前', mine: false, anon: true, comments: [] }
    ],
    errands: [
      { id: 'r01', type: '代取快递', title: '菜鸟驿站两个小件，送到 3 号楼 502', reward: 5, from: '南门菜鸟驿站', to: '3 号楼 502', deadline: '今天 18:00 前', art: 'parcel',
        note: '两个小盒子不重，取件码我私聊发你。送到 502 门口就行，我一般都在宿舍。', photos: [], publisher: '陈同学', time: '12 分钟前', wants: 6, status: 'open', owner: null, boostUntil: 0 },
      { id: 'r02', type: '代取外卖', title: '一食堂麻辣香锅带到图书馆四楼', reward: 4, from: '一食堂二楼', to: '图书馆四楼自习区', deadline: '30 分钟内', art: 'food',
        note: '微辣，加一份米饭。到了在门口发消息，我出来拿，别放前台。', photos: [], publisher: '干饭王', time: '25 分钟前', wants: 3, status: 'open', owner: null, boostUntil: 0 },
      { id: 'r03', type: '代取快递', title: '京东大件（显示器）搬到东区 12 栋', reward: 12, from: '北门京东快递点', to: '东区 12 栋 208', deadline: '今晚 20:00 前', art: 'parcel',
        note: '箱子有点大，一个人能抱动，有电梯。辛苦费 12 元，可以微信转。', photos: [], publisher: '阿哲', time: '1 小时前', wants: 11, status: 'open', owner: null, boostUntil: Date.now() + 5 * 3600e3 },
      { id: 'r04', type: '代买', title: '帮忙带一份打印纸和两支黑笔', reward: 5, from: '西门文具店', to: '计算机楼 302', deadline: '今天 17:00 前', art: 'store',
        note: 'A4 打印纸一包 500 张，黑笔 0.5 就行。钱先垫，见面一起结。', photos: [], publisher: 'KK', time: '2 小时前', wants: 2, status: 'open', owner: null, boostUntil: 0 },
      { id: 'r05', type: '代取外卖', title: '北门麦当劳取餐送到北区 8 栋', reward: 8, from: '北门麦当劳', to: '北区 8 栋 401', deadline: '40 分钟内', art: 'food',
        note: '两份套餐，有点烫，麻烦平放。到楼下打电话，我下去取。', photos: [], publisher: '小满', time: '3 小时前', wants: 5, status: 'open', owner: null, boostUntil: 0 },
      { id: 'r06', type: '代送', title: '把纸质材料送到 B 楼 205 办公室', reward: 10, from: '教务处一楼大厅', to: 'B 楼 205', deadline: '今天 16:30 前', art: 'book',
        note: '一份盖章材料，用文件袋装好了，送到 205 交给值班老师即可。', photos: [], publisher: '一只柚子', time: '4 小时前', wants: 4, status: 'open', owner: null, boostUntil: 0 },
      { id: 'r07', type: '代排队', title: '校医院帮忙排个号，8 点半到', reward: 15, from: '校医院一楼', to: '3 号楼', deadline: '明天 08:30', art: 'key',
        note: '只需要帮忙取号排队，我 9 点到，把号给我就行。', photos: [], publisher: '跑步的鱼', time: '昨天', wants: 8, status: 'open', owner: null, boostUntil: 0 },
      { id: 'r08', type: '代取快递', title: '邮政 EMS 取件，顺路带一下', reward: 5, from: '东门邮政 EMS', to: '6 号楼 316', deadline: '今天 19:00 前', art: 'parcel',
        note: '一个小包裹，不着急，顺路的同学帮个忙就行。', photos: [], publisher: '小林', time: '昨天', wants: 1, status: 'open', owner: null, boostUntil: 0 }
    ],
    shops: [
      { id: 's01', name: '山丘咖啡 Hill Coffee', cat: '餐饮', addr: '东门文创街 12 号', hours: '08:00 – 22:00', phone: '020-8888 2101', rate: 4.8, art: 'cup', badge: '学生优惠',
        intro: '开在东门文创街的独立咖啡店，自家烘焙豆子，手冲和拿铁都稳。二楼有一排靠窗长桌，插座管够，很多同学在这里赶 due。',
        promo: [
          { t: '满 20 减 5', d: '堂食与自提均可，结账时出示校园卡', until: '长期有效' },
          { t: '自习套餐 19.9', d: '任意咖啡 + 可颂，限 14:00–17:00', until: '至 12 月 31 日' }
        ],
        feed: [
          { title: '新到耶加雪菲 SOE', text: '浅烘，柑橘和茉莉的香气，手冲 22 元一杯，限量 30 杯。', time: '2 小时前', art: 'cup' },
          { title: '二楼加了两张长桌', text: '现在能坐 14 个人，每桌都有插座，晚上人少。', time: '昨天', art: 'lamp' }
        ] },
      { id: 's02', name: '三味书屋（二手书店）', cat: '书店', addr: '南门学府路 8 号', hours: '09:30 – 21:00', phone: '020-8888 2233', rate: 4.7, art: 'book', badge: '教材回收',
        intro: '开了十几年的老书店，教材、考研资料、文学书都有，也收二手书。老板会根据品相给价，教材常年八折回收。',
        promo: [
          { t: '教材 8 折回收', d: '凭学生证，成色较好即可，当场结算', until: '长期有效' },
          { t: '考研资料买二送一', d: '指定书架，送完为止', until: '至 11 月 30 日' }
        ],
        feed: [
          { title: '期末教材回收开始', text: '高数、线代、数据结构都在收，成色好的价格更高。', time: '3 小时前', art: 'book' },
          { title: '新到一批考研英语真题', text: '近十年真题合集，二手指回，20 元一套。', time: '2 天前', art: 'book' }
        ] },
      { id: 's03', name: '快印客图文', cat: '打印', addr: '北门科技路 3 号', hours: '08:30 – 20:00', phone: '020-8888 2345', rate: 4.9, art: 'printer', badge: '学生价',
        intro: '论文打印、装订、彩印、扫描都能做，支持微信传文件到店取。高峰期建议提前一小时线上排队，店里会叫号。',
        promo: [
          { t: '论文打印 0.08 元/页', d: '双面黑白，50 页起，含简单装订', until: '长期有效' },
          { t: '彩色打印 0.6 元/页', d: 'A4 铜版纸，课程作业常用', until: '长期有效' }
        ],
        feed: [
          { title: '期中论文高峰期提醒', text: '本周排队约 40 分钟，建议线上先传文件再来取。', time: '1 小时前', art: 'printer' },
          { title: '新增胶装服务', text: '毕业论文胶装 8 元/本，当天可取。', time: '3 天前', art: 'printer' }
        ] },
      { id: 's04', name: '轻氧健身工作室', cat: '健身', addr: '西门体育路 21 号', hours: '06:00 – 23:00', phone: '020-8888 2468', rate: 4.6, art: 'ball', badge: '新店',
        intro: '小而全的社区健身房，器械区、自由力量区和团课房都有。学生月卡 199，团课需要提前一天在小程序预约。',
        promo: [
          { t: '学生月卡 199', d: '凭学生证办理，含团课', until: '至 12 月 31 日' },
          { t: '两人同行 8 折', d: '同时办卡，第二人八折', until: '长期有效' }
        ],
        feed: [
          { title: '周三晚新增搏击操', text: '19:30–20:20，教练带课，限 16 人。', time: '5 小时前', art: 'ball' },
          { title: '器械区换新跑步机', text: '新增 4 台，早 6 点到 8 点人最少。', time: '4 天前', art: 'ball' }
        ] },
      { id: 's05', name: '剪艺造型（校园店）', cat: '理发', addr: '东门文创街 5 号', hours: '10:00 – 21:30', phone: '020-8888 2579', rate: 4.5, art: 'salon', badge: '学生价',
        intro: '校内同学常去的理发店，剪发不推销办卡，价格为明码标价。周末人多，建议工作日下午过去。',
        promo: [
          { t: '学生剪发 25 元', d: '洗剪吹，不限男女，凭校园卡', until: '长期有效' },
          { t: '烫染 7 折', d: '周一到周四，需提前预约', until: '至 12 月 15 日' }
        ],
        feed: [
          { title: '周末预约已开放', text: '周六还有 4 个位置，微信可约。', time: '昨天', art: 'salon' },
          { title: '新到几款学生短发', text: '店里有样片，可以直接照着剪。', time: '5 天前', art: 'salon' }
        ] },
      { id: 's06', name: '24h 便利站', cat: '超市', addr: '3 号楼一层东侧', hours: '24 小时营业', phone: '020-8888 2680', rate: 4.8, art: 'store', badge: '夜间配送',
        intro: '宿舍楼下的便利店，饮料、零食、日用品、关东煮都有。22:00 后可以送到宿舍门口，加 2 元配送费。',
        promo: [
          { t: '夜宵第二件半价', d: '22:00–02:00，关东煮与面包', until: '长期有效' },
          { t: '满 15 元送宿舍', d: '3 号楼与 6 号楼，夜间下单', until: '至 11 月 30 日' }
        ],
        feed: [
          { title: '关东煮换新汤底', text: '新增番茄口味，夜间卖得最好。', time: '3 小时前', art: 'food' },
          { title: '补货：暖宝宝和热水袋', text: '降温了，货架二层，数量有限。', time: '昨天', art: 'store' }
        ] }
    ],
    guides: [
      { id: 'g01', cat: '报到', title: '开学报到指南', art: 'key', reads: 1280,
        summary: '路线、材料、领钥匙，一次走完',
        intro: '报到日人最多，按这个顺序走基本不用来回跑：先到学院报到点核验材料，再去宿舍楼领钥匙，最后回学院交回执。',
        steps: [
          { t: '到校前', d: '录取通知书、身份证、党团组织关系材料放进同一个文件袋；提前在迎新系统填好到校时间与车站。' },
          { t: '报到点', d: '图书馆一楼按学院分区：核验材料 → 领校园卡 → 拿宿舍分配单，全程约 15 分钟。' },
          { t: '宿舍楼', d: '凭分配单到楼下宿管处领钥匙和空调遥控器，登记入住时间，顺手存下宿管电话。' },
          { t: '回执与缴费', d: '回学院交回执；学费、住宿费在「校园卡」小程序里缴，别在陌生链接付款。' }
        ],
        tips: ['家长的车可以进校，东门登记后即停即走', '行李多可以先寄到菜鸟驿站，报到当天再取', '穿红马甲的迎新志愿者可以直接问路'] },
      { id: 'g02', cat: '生活', title: '订水到宿舍', art: 'cup', reads: 960,
        summary: '扫码下单，桶装水直接送到门口',
        intro: '宿舍喝水有两种方式：楼层直饮水机扫码，或者订桶装水送到宿舍。前者便宜，后者适合宿舍一起用。',
        steps: [
          { t: '楼层直饮水', d: '每层水房有直饮水机，扫码 0.3 元/升，冷热都有，杯子自带。' },
          { t: '订桶装水', d: '关注「校园订水」小程序，绑定楼栋与房间号，18:00 前的订单当天送。' },
          { t: '押金与空桶', d: '首次订水付 30 元桶押金，退宿时拿空桶退押金，单据要留好。' }
        ],
        tips: ['开学第一周送水排队，建议一次订两桶', '空桶别扔，一个桶 30 元', '18:00 之后下单顺延到次日上午'] },
      { id: 'g03', cat: '生活', title: '洗衣机安装与使用', art: 'washer', reads: 742,
        summary: '合买或公用，登记流程与功率限制',
        intro: '学校不统一配洗衣机。宿舍可以四个人合买一台放阳台，也可以直接用楼层公共洗衣机。',
        steps: [
          { t: '公共洗衣机', d: '每层洗衣房 2–3 台，扫码 3 元一次，标准洗 35 分钟；晚 9 点后是高峰期。' },
          { t: '自行购买', d: '建议 5–6 kg 波轮，占地小；到货后先到宿管处登记型号与功率。' },
          { t: '安装与用电', d: '功率不超过 500W，必须用带接地的独立插座，禁止私拉插线板。' },
          { t: '排水', d: '阳台地漏保持通畅，排水管固定好，避免漏水到楼下。' }
        ],
        tips: ['四人合买写个简单的分摊说明，毕业时好处理', '毕业季二手洗衣机很多，可以捡漏', '退宿前把机器处理掉，别留在宿舍'] },
      { id: 'g04', cat: '报修', title: '宿舍报修指南', art: 'gear', reads: 1105,
        summary: '水电、门锁、网络，报修入口与时效',
        intro: '宿舍水电、门锁、网络出问题都能报修，不用自己找师傅。分清入口能省很多时间。',
        steps: [
          { t: '报修入口', d: '「校园服务 → 宿舍报修」，或直接扫楼道里的报修二维码。' },
          { t: '填写信息', d: '写清楼栋房间号、故障类型、方便上门的时间，最好附一张照片。' },
          { t: '响应时效', d: '水电急修 2 小时内上门，门锁与家具 24 小时内，网络故障由运营商次日处理。' },
          { t: '进度查询', d: '提交后可在「我的报修」查看进度，完成后记得确认。' }
        ],
        tips: ['跳闸先看自己房间的空气开关，再报修', '门锁被反锁可以找宿管借备用钥匙', '网络问题先重启光猫，多半能解决'] }
    ],
    questions: [
      { id: 'q05', q: '宿舍可以用吹风机吗？功率有限制吗？', tag: '住宿', asker: '新生小鱼', time: '1 小时前', likes: 6,
        a: '', answerer: '' },
      { id: 'q01', q: '宿舍床帘可以自己装吗？查寝会不会扣分', tag: '住宿', asker: '新生小林', time: '2 天前', likes: 42,
        a: '可以装，但只能用免打孔的伸缩杆，退宿时要能恢复原样。查寝主要看卫生和用电安全，床帘本身不影响。',
        answerer: '阿音（学姐）' },
      { id: 'q02', q: '洗衣机是学校统一装还是自己买？', tag: '住宿', asker: '新生小周', time: '3 天前', likes: 67,
        a: '学校不统一配。可以宿舍四个人合买一台放阳台，也可以直接用楼层公共洗衣机（扫码 3 元一次）。自己装要先在宿管处登记，功率不超过 500W。',
        answerer: '老陈（学长）' },
      { id: 'q03', q: '订水多久能送到？晚上下单有人送吗？', tag: '生活', asker: '新生阿 May', time: '4 天前', likes: 31,
        a: '18:00 前的单当天送，之后顺延到第二天上午。开学第一周会排队，建议一次订两桶。',
        answerer: '宿管中心' },
      { id: 'q04', q: '报到当天家长的车能开进学校吗？', tag: '报到', asker: '新生家长', time: '5 天前', likes: 88,
        a: '可以，从东门进，出示录取通知书登记就行；宿舍楼下即停即走，不能过夜。',
        answerer: '迎新志愿者' }
    ],
    likes: [], collects: [], wants: []
  };
}
/* 旧版本数据平滑升级：补齐跑腿 / 好店 / 积分字段，不覆盖用户已有内容 */
function migrateDB(d) {
  const seed = seedDB();
  if (!Array.isArray(d.errands)) d.errands = seed.errands;
  if (!Array.isArray(d.shops)) d.shops = seed.shops;
  if (!Array.isArray(d.guides)) d.guides = seed.guides;
  if (!Array.isArray(d.questions)) d.questions = seed.questions;
  if (!Array.isArray(d.likes)) d.likes = [];
  if (!Array.isArray(d.collects)) d.collects = [];
  if (!Array.isArray(d.wants)) d.wants = [];
  d.users.forEach((u) => {
    if (typeof u.points !== 'number') u.points = 200;
    if (!Array.isArray(u.pointLog)) u.pointLog = [{ d: 200, r: '历史积分结转', t: '升级时' }];
  });
  return d;
}
function loadDB() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.version === 1 && Array.isArray(d.courses)) return migrateDB(d);
    }
  } catch (e) { /* ignore */ }
  const s = seedDB();
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  return s;
}
let db = loadDB();
function saveDB() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
  catch (e) { toast('本机存储空间不足，可减少图片数量后重试'); return false; }
}
function me() { return db.users.find((u) => u.u === db.session) || db.users[0]; }
function isMine(x) { return !!x && x.owner === db.session; }

/* ================= 3.5 积分 / 推流 / 照片 ================= */
const POINT_RULES = [
  { k: 'register', label: '新人注册', pts: 100, note: '注册即到账，一次性', i: 'spark' },
  { k: 'item', label: '发布闲置 / 跑腿', pts: 10, note: '每条内容发布后到账', i: 'bag' },
  { k: 'post', label: '发布校园墙动态', pts: 5, note: '每日最多 3 次', i: 'heart' },
  { k: 'deal', label: '完成一笔交易', pts: 20, note: '标记售出或确认完成', i: 'check' },
  { k: 'run', label: '完成一次跑腿', pts: 15, note: '接单并送达后到账', i: 'box' },
  { k: 'answer', label: '解答新生提问', pts: 5, note: '回答发布后立即到账', i: 'heart' },
  { k: 'invite', label: '邀请新同学', pts: 30, note: '对方注册成功后到账', i: 'send' }
];
const BOOST_TIERS = [
  { h: 6, pts: 30, label: '6 小时', desc: '小范围优先展示' },
  { h: 24, pts: 80, label: '24 小时', desc: '列表前排 + 推流标识' },
  { h: 72, pts: 200, label: '3 天', desc: '持续置顶，曝光最高' }
];
function myPoints() { return me().points || 0; }
function addPoints(n, reason, silent) {
  const u = me();
  u.points = Math.max(0, (u.points || 0) + n);
  if (!Array.isArray(u.pointLog)) u.pointLog = [];
  u.pointLog.unshift({ d: n, r: reason, t: '刚刚' });
  u.pointLog = u.pointLog.slice(0, 40);
  saveDB();
  syncPointsPill();
  if (!silent) toast(n > 0 ? `积分 +${n} · ${reason}` : `积分 ${n} · ${reason}`);
  return u.points;
}
function syncPointsPill() {
  $$('.pts-pill b').forEach((el) => { el.textContent = num(myPoints()); });
}
function isBoosted(x) { return !!x && (x.boostUntil || 0) > Date.now(); }
function boostLeft(x) {
  const ms = (x.boostUntil || 0) - Date.now();
  if (ms <= 0) return '';
  const h = Math.ceil(ms / 3600000);
  return h >= 24 ? `${Math.ceil(h / 24)} 天` : `${h} 小时`;
}
function boostTag(x) {
  return isBoosted(x) ? `<span class="boost-tag">${icon('fire', 9)}推流中</span>` : '';
}
function coverInner(rec) {
  const p = rec && rec.photos && rec.photos[0];
  return p ? `<img class="photo" src="${p}" alt="${esc(rec.title || '照片')}" />` : art((rec && rec.art) || 'book');
}
function recThumb(rec, size = '34px') {
  const p = rec && rec.photos && rec.photos[0];
  return `<span class="src-thumb">${p ? `<img class="photo" src="${p}" alt="" />` : art((rec && rec.art) || 'book', size)}</span>`;
}

/* 本地图片读取 + 压缩，避免 localStorage 被原图撑爆 */
function compressImage(file, maxSide = 1000, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('not image')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read fail'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode fail'));
      img.onload = () => {
        try {
          const scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
          const w = Math.max(1, Math.round((img.width || 1) * scale));
          const h = Math.max(1, Math.round((img.height || 1) * scale));
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          const ctx = cv.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(cv.toDataURL('image/jpeg', quality));
        } catch (e) { reject(e); }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
const PHOTO_MAX = 4;
function photoFieldHTML(id) {
  return `<div class="field">
      <span>实拍照片<span style="font-weight:400;color:var(--ink-3);margin-left:6px">选填 · 最多 ${PHOTO_MAX} 张</span></span>
      <div class="photo-row" id="${id}"></div>
      <input type="file" id="${id}Input" accept="image/*" multiple hidden />
      <p class="hint" id="${id}Hint">支持 JPG / PNG，导入后自动压缩并保存在本机。</p>
    </div>`;
}
function bindPhotoField(sheet, id, store) {
  const row = sheet.querySelector('#' + id);
  const input = sheet.querySelector('#' + id + 'Input');
  const hint = sheet.querySelector('#' + id + 'Hint');
  if (!row || !input || !hint) return;
  const draw = () => {
    row.innerHTML = store.map((src, i) => `<div class="photo-thumb"><img src="${src}" alt="照片 ${i + 1}" /><button type="button" class="rm" data-rm="${i}" aria-label="删除照片">${icon('close', 10)}</button></div>`).join('')
      + (store.length < PHOTO_MAX ? `<label class="photo-add" for="${id}Input">${icon('plus', 15)}<span>添加</span></label>` : '');
    hint.textContent = store.length
      ? `已添加 ${store.length}/${PHOTO_MAX} 张 · 第一张作为封面`
      : '支持 JPG / PNG，最多 4 张，可直接用手机拍照上传';
  };
  row.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm]');
    if (!rm) return;
    store.splice(Number(rm.dataset.rm), 1);
    draw();
  });
  input.addEventListener('change', async () => {
    const files = Array.from(input.files || []).slice(0, PHOTO_MAX - store.length);
    input.value = '';
    if (!files.length) return;
    hint.textContent = '正在压缩图片…';
    for (const f of files) {
      try { store.push(await compressImage(f)); } catch (e) { toast('有一张图片读取失败，已跳过'); }
    }
    draw();
  });
  draw();
}

/* ================= 4. 日期 ================= */
function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function fmtMD(d) { return `${d.getMonth() + 1}/${d.getDate()}`; }
function todayIdx() { const g = new Date().getDay(); return g === 0 ? 7 : g; }
function nowMin() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
function toMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function greet() {
  const h = new Date().getHours();
  if (h < 5) return '夜深了';
  if (h < 9) return '早上好';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

/* ================= 5. 全局状态 & 提示 ================= */
const state = {
  tab: 'home', page: null, weekOffset: 0, monthOffset: 0, showAllPeriods: false,
  mcat: '全部', msort: 'new', mq: '',
  ecat: '全部', esort: 'new', eq: '',
  scat: '全部',
  wtopic: '全部', authTab: 'login'
};
let sheetTimer = null;
let pageTransitionId = 0;
let viewTransitionId = 0;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionDelay = (ms) => new Promise((resolve) => setTimeout(resolve, reduceMotion() ? 0 : ms));

function toast(msg, ms = 2200) {
  const root = $('#toastRoot');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 320);
  }, ms);
}
function openSheet(opts) {
  const root = $('#sheetRoot');
  root.innerHTML = `
    <div class="sheet-backdrop" data-action="close-sheet"></div>
    <div class="sheet ${opts.cls || ''}" role="dialog" aria-modal="true">
      <div class="sheet__grab"></div>
      ${opts.head === false ? '' : `<div class="sheet__head"><h3>${esc(opts.title || '')}</h3><button class="sheet__x" data-action="close-sheet" aria-label="关闭">${icon('close', 17)}</button></div>`}
      <div class="sheet__body">${opts.body || ''}</div>
      ${opts.foot ? `<div class="sheet__foot">${opts.foot}</div>` : ''}
    </div>`;
  root.style.display = 'block';
  root.classList.toggle('is-over-detail', !!detailView);
  void root.offsetHeight;
  root.classList.add('is-open');
  document.body.classList.add('no-scroll');
  clearTimeout(sheetTimer);
  return root.querySelector('.sheet');
}
function closeSheet() {
  const root = $('#sheetRoot');
  if (!root.classList.contains('is-open')) return;
  root.classList.remove('is-open');
  document.body.classList.remove('no-scroll');
  clearTimeout(sheetTimer);
  sheetTimer = setTimeout(() => {
    if (!root.classList.contains('is-open')) {
      root.innerHTML = '';
      root.style.display = '';
    }
  }, 340);
}
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (detailView) closeDetail();
  else closeSheet();
});
