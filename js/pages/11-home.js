'use strict';

/* ================= 8. 首页 ================= */
function scheduleHTML() {
  const today = new Date();
  const tIdx = todayIdx();
  const monday = addDays(mondayOf(today), state.weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const isThisWeek = state.weekOffset === 0;
  const todayCourses = db.courses.filter((c) => c.day === tIdx).sort((a, b) => a.start - b.start);
  const mins = nowMin();
  const next = todayCourses.find((c) => PERIODS[c.start - 1] && toMin(PERIODS[c.start - 1].s) > mins);
  const inClass = todayCourses.find((c) => {
    const s = PERIODS[c.start - 1]; const e = PERIODS[Math.min(11, c.start + c.len - 2)];
    return s && e && toMin(s.s) <= mins && toMin(e.e) >= mins;
  });

  const weekSum = db.courses.reduce((n, c) => n + c.len, 0);
  const termWeek = Math.min(20, Math.max(1, Math.round((monday - mondayOf(new Date(2026, 8, 7))) / 604800000) + 1));
  let nextK = 'NEXT', nextV = '', nextS = '';
  if (state.weekOffset !== 0) {
    nextK = 'WEEK';
    nextV = String(weekSum);
    nextS = '节课 · 点格添加';
  } else if (next) {
    nextV = PERIODS[next.start - 1].s;
    nextS = `${next.name} · ${next.room}`;
  } else if (inClass) {
    nextK = 'OFF';
    nextV = PERIODS[Math.min(11, inClass.start + inClass.len - 2)].e;
    nextS = `${inClass.name} 下课`;
  } else {
    nextK = 'DONE';
    nextV = String(todayCourses.length);
    nextS = '门课 · 今日已结束';
  }

  const grid = {};
  db.courses.forEach((c) => {
    for (let k = 0; k < c.len; k++) grid[`${c.day}-${c.start + k}`] = c;
  });

  const lastUsed = db.courses.reduce((m, c) => Math.max(m, c.start + c.len - 1), 0);
  const maxPeriod = state.showAllPeriods ? PERIODS.length : Math.max(8, Math.min(PERIODS.length, lastUsed));
  let cells = '';
  for (let p = 1; p <= maxPeriod; p++) {
    cells += `<div class="tt-time" style="grid-column:1;grid-row:${p}"><b>${p}</b><span>${PERIODS[p - 1].s}</span></div>`;
  }
  for (let d = 1; d <= 7; d++) {
    for (let p = 1; p <= maxPeriod; p++) {
      const c = grid[`${d}-${p}`];
      if (c) {
        if (c.start === p) {
          const len = Math.min(c.len, maxPeriod - p + 1);
          cells += `<div class="course c${c.color}" role="button" tabindex="0" data-action="edit-course" data-id="${c.id}"
            style="grid-column:${d + 1};grid-row:${p} / span ${len}" title="${esc(c.name)} · ${esc(c.room)} · ${esc(c.teacher)}">
            <b>${esc(c.name)}</b><i>${esc(c.room)}</i><i class="c-tea">${esc(c.teacher)}</i><em class="c-time">${PERIODS[c.start - 1].s}–${PERIODS[Math.min(11, c.start + c.len - 2)].e}</em></div>`;
        }
      } else {
        cells += `<div class="tt-slot" data-action="add-course" data-day="${d}" data-period="${p}" title="点击添加课程" style="grid-column:${d + 1};grid-row:${p}"></div>`;
      }
    }
  }

  const weekLabel = state.weekOffset === 0 ? '本周' : state.weekOffset === -1 ? '上周' : state.weekOffset === 1 ? '下周' : `${state.weekOffset > 0 ? '后' : '前'} ${Math.abs(state.weekOffset)} 周`;

  return `
  <section class="card schedule fade-up">
    <header class="schedule__head">
      <div class="sched-date">
        <span class="sched-kicker">TODAY / 今日课表</span>
        <div class="sched-date__row">
          <b class="sched-day">${today.getDate()}</b>
          <span class="sched-md">${today.getMonth() + 1} 月<br /><i>星期${WD[today.getDay()]}</i></span>
        </div>
      </div>
      <div class="sched-term">
        <span>FALL TERM · 2026</span>
        <b>第 ${termWeek} 教学周</b>
        <small>${fmtMD(monday)} — ${fmtMD(addDays(monday, 6))}</small>
      </div>
      <div class="campus-scene" id="campusScene" aria-hidden="true">
        <svg class="campus-scene__fallback" viewBox="0 0 120 100" fill="none">
          <ellipse cx="60" cy="82" rx="37" ry="8" fill="#2A1E14" opacity=".28"/>
          <path d="M17 65 56 44 103 63 62 87Z" fill="#CDB99C"/>
          <path d="M17 65v7l45 22v-7Z" fill="#A98F6E"/>
          <path d="m62 87 41-24v7L62 94Z" fill="#8E765A"/>
          <path d="m32 49 29-15 31 14-30 16Z" fill="#FBF4E6"/>
          <path d="M32 49v18l30 15V64Z" fill="#F0E3CD"/>
          <path d="m62 64 30-16v18L62 82Z" fill="#D8C4A4"/>
          <path d="m28 47 33-18 35 16-34 19Z" fill="#C0563B"/>
          <path d="M28 47v5l34 18v-6Z" fill="#D9815F"/>
          <path d="m62 64 34-19v5L62 70Z" fill="#A6492E"/>
          <path d="M52 29V14l11-6 12 6v15L63 36Z" fill="#F6EAD7"/>
          <path d="m63 8 12 6-12 7-11-7Z" fill="#FFFDF8"/>
          <path d="M63 21v15l12-7V14Z" fill="#CDB392"/>
          <path d="m49 13 14-9 15 8-15 9Z" fill="#C0563B"/>
          <path d="M57 26h6v6h-6z" fill="#4E3C2C"/>
          <path d="M39 54h6v9h-6zm12 6h6v9h-6zm18-4h6v9h-6zm12-6h6v9h-6z" fill="#4E3C2C" opacity=".85"/>
          <path d="m52 73 8 4v-9l-8-4Z" fill="#2A211A"/>
          <path d="M22 38 43 26m39 4 19 10" stroke="#C0563B" stroke-width="1" stroke-dasharray="2 3" opacity=".55"/>
          <circle cx="21" cy="38" r="3" fill="#C0563B"/><circle cx="102" cy="40" r="2.5" fill="#E9C9A3"/>
        </svg>
        <canvas id="campusCanvas"></canvas>
      </div>
      <div class="sched-next">
        <span class="sched-next__k">${nextK}</span>
        <b>${nextV}</b>
        <small>${nextS}</small>
      </div>
    </header>
    <div class="schedule__bar">
      <div class="weeknav">
        <button class="wnav-btn" data-action="week" data-delta="-1" aria-label="上一周">${icon('back', 15)}</button>
        <button class="weeknav__label" data-action="week" data-delta="0" title="回到本周">${weekLabel} ${fmtMD(monday)}–${fmtMD(addDays(monday, 6))}</button>
        <button class="wnav-btn" data-action="week" data-delta="1" aria-label="下一周">${icon('chev', 15)}</button>
      </div>
      <div class="spacer"></div>
      <button class="btn-ghost-sm" data-action="import">${icon('spark', 13)} 智能导入</button>
      <button class="btn-add" data-action="add-course">${icon('plus', 13)} 添加</button>
    </div>
    <div class="tt-pad">
      <div class="tt-head">
        <div class="tt-corner">时间</div>
        ${days.map((d, i) => {
          const isToday = isThisWeek && i + 1 === tIdx;
          return `<div class="tt-day ${isToday ? 'is-today' : ''}"><b>周${WD[(i + 1) % 7]}</b><small>${fmtMD(d)}</small></div>`;
        }).join('')}
      </div>
      <div class="tt">${cells}</div>
      <div class="c-add-tip">
        <span>${icon('plus', 10)} 点空白格添加课程</span>
        ${(state.showAllPeriods ? lastUsed < PERIODS.length : maxPeriod < PERIODS.length)
          ? `<button class="tt-toggle" data-action="toggle-periods">${state.showAllPeriods ? '收起晚间节次 ↑' : `展开 ${maxPeriod + 1}–12 节 ↓`}</button>`
          : ''}
      </div>
    </div>
  </section>`;
}

/* 轻量 3D 校园模型：本地几何体 + Canvas 投影，无第三方依赖 */
let campusSceneCleanup = null;
function destroyCampusScene() {
  if (!campusSceneCleanup) return;
  const cleanup = campusSceneCleanup;
  campusSceneCleanup = null;
  cleanup();
}
function initCampusScene() {
  const scene = $('#campusScene');
  const canvas = $('#campusCanvas');
  if (!scene || !canvas) return;
  let ctx;
  try { ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }); } catch (e) { return; }
  if (!ctx) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4)
    || (navigator.connection && navigator.connection.saveData);
  const frameInterval = 1000 / (lowPower ? 20 : 30);
  const faces = [];
  const rgb = (hex) => {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  function addFace(points, color, alpha = 1) {
    const a = points[0], b = points[1], c = points[2];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const len = Math.hypot(n[0], n[1], n[2]) || 1;
    faces.push({ points, normal: n.map((x) => x / len), color: rgb(color), alpha });
  }
  function addBox(x, y, z, w, d, h, color) {
    const x0 = x - w / 2, x1 = x + w / 2, y0 = y - d / 2, y1 = y + d / 2, z1 = z + h;
    const p = [
      [x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]
    ];
    [[3, 2, 1, 0], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]
      .forEach((f) => addFace(f.map((i) => p[i]), color));
  }
  function addPrism(x, y, z, rx, ry, h, color, sides = 8) {
    const lo = [], hi = [];
    for (let i = 0; i < sides; i++) {
      const a = Math.PI / sides + i * Math.PI * 2 / sides;
      lo.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry, z]);
      hi.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry, z + h]);
    }
    addFace(lo.slice().reverse(), color);
    addFace(hi, color);
    for (let i = 0; i < sides; i++) {
      const j = (i + 1) % sides;
      addFace([lo[i], lo[j], hi[j], hi[i]], color);
    }
  }
  function addPyramid(x, y, z, w, d, h, color) {
    const p = [[x - w / 2, y - d / 2, z], [x + w / 2, y - d / 2, z], [x + w / 2, y + d / 2, z], [x - w / 2, y + d / 2, z]];
    const top = [x, y, z + h];
    addFace(p.slice().reverse(), color);
    for (let i = 0; i < 4; i++) addFace([p[i], p[(i + 1) % 4], top], color);
  }

  /* 校园主楼、塔楼、书本共同对应学习与校园生活 */
  addPrism(0, 0, -0.34, 4.15, 3.25, 0.42, '#CDB99C', 8);
  addPrism(0, 0, 0.08, 3.98, 3.08, 0.10, '#D7EAF8', 8);
  addBox(0, 0, 0.18, 3.65, 2.25, 1.34, '#E8F3FC');
  addBox(-2.22, 0.06, 0.18, 1.02, 1.85, 0.94, '#F0E3CD');
  addBox(2.22, 0.06, 0.18, 1.02, 1.85, 0.94, '#F0E3CD');
  addBox(0, 0, 1.52, 4.08, 2.60, 0.22, '#C0563B');
  addBox(-2.22, 0.06, 1.12, 1.28, 2.10, 0.16, '#E5D2B4');
  addBox(2.22, 0.06, 1.12, 1.28, 2.10, 0.16, '#E5D2B4');
  addBox(0, 1.46, 0.18, 2.45, 0.76, 0.16, '#EBDCC4');
  [-1.30, -0.65, 0.65, 1.30].forEach((x) => addBox(x, 1.145, 0.74, 0.36, 0.045, 0.47, '#4E3C2C'));
  [-1.34, -0.45, 0.45, 1.34].forEach((x) => addBox(x, 1.22, 0.25, 0.13, 0.13, 1.18, '#FFFDF8'));
  addBox(0, 1.16, 0.20, 0.46, 0.055, 0.76, '#2A211A');
  [-2.22, 2.22].forEach((x) => addBox(x, 1.005, 0.53, 0.43, 0.045, 0.40, '#4E3C2C'));
  addBox(0, 0, 1.74, 1.06, 1.06, 1.06, '#F8EEDC');
  addBox(0, 0.555, 2.13, 0.44, 0.045, 0.44, '#4E3C2C');
  addBox(0, 0.584, 2.25, 0.045, 0.02, 0.17, '#E9C9A3');
  addBox(0.055, 0.586, 2.28, 0.15, 0.02, 0.04, '#E9C9A3');
  addPyramid(0, 0, 2.80, 1.48, 1.48, 0.66, '#C0563B');
  addBox(2.55, 1.60, 0.18, 1.18, 0.76, 0.14, '#B0803A');
  addBox(2.51, 1.58, 0.33, 1.05, 0.69, 0.13, '#FFFDF8');
  addBox(2.48, 1.55, 0.47, 0.95, 0.62, 0.10, '#C0563B');

  let width = 0, height = 0, dpr = 1;
  let reduced = motionQuery.matches, visible = true, destroyed = false;
  let raf = 0, lastFrame = 0, lastNow = 0, elapsed = 0;
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0, hover = 0, targetHover = 0;
  let scrollY = 0, targetScroll = clamp(window.scrollY * 0.018, 0, 5);

  function draw(time) {
    if (!width || !height || destroyed) return;
    const t = reduced ? 0 : time;
    pointerX += (targetX - pointerX) * 0.075;
    pointerY += (targetY - pointerY) * 0.075;
    hover += (targetHover - hover) * 0.075;
    scrollY += (targetScroll - scrollY) * 0.075;
    const yaw = -0.66 + Math.sin(t * 0.00014) * 0.20 + pointerX * 0.15 + (reduced ? 0 : scrollY * 0.009);
    const pitch = 0.57 + pointerY * 0.055;
    const cyaw = Math.cos(yaw), syaw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const scale = Math.min(width / 10.4, height / 6.4) * (1 + hover * 0.025);
    const centerX = width / 2;
    const centerY = height * 0.57 + Math.sin(t * 0.0009) * 1.25 - (reduced ? 0 : scrollY * 0.55);
    const project = (p) => {
      const x = p[0] * cyaw - p[1] * syaw;
      const y = p[0] * syaw + p[1] * cyaw;
      return [centerX + x * scale, centerY + (y * sp - p[2] * cp) * scale, y * cp + p[2] * sp];
    };

    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(2,17,35,.12)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 1.58 * scale, 3.35 * scale, 0.64 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    const ring = [];
    for (let i = 0; i <= 56; i++) {
      const a = i / 56 * Math.PI * 2;
      ring.push(project([Math.cos(a) * 4.45, Math.sin(a) * 4.45, 1.03]));
    }
    ctx.beginPath();
    ring.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.setLineDash([2, 4]);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = 'rgba(125,211,252,.30)';
    ctx.stroke();
    ctx.setLineDash([]);

    const tower = project([0, 0, 2.72]);
    const nodes = [0.15, 2.25, 4.30].map((a, i) => {
      const angle = a + t * 0.000055;
      return { p: project([Math.cos(angle) * 4.42, Math.sin(angle) * 4.42, 1.05 + Math.sin(angle * 2) * 0.18]), color: ['#D9815F', '#E9C9A3', '#B0803A'][i] };
    });
    ctx.lineWidth = 0.65;
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.moveTo(tower[0], tower[1]);
      ctx.lineTo(n.p[0], n.p[1]);
      ctx.strokeStyle = 'rgba(125,211,252,.16)';
      ctx.stroke();
    });

    const rendered = faces.map((face) => {
      let depth = 0;
      const points = face.points.map((p) => {
        const v = project(p);
        depth += v[2];
        return v;
      });
      return { face, points, depth: depth / points.length };
    }).sort((a, b) => a.depth - b.depth);

    rendered.forEach(({ face, points }) => {
      const n = face.normal;
      const nx = n[0] * cyaw - n[1] * syaw;
      const ny = n[0] * syaw + n[1] * cyaw;
      const light = Math.max(0, nx * -0.38 + ny * 0.48 + n[2] * 0.79);
      const shade = 0.66 + light * 0.38;
      const c = face.color;
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.closePath();
      ctx.fillStyle = `rgba(${Math.min(255, Math.round(c[0] * shade))},${Math.min(255, Math.round(c[1] * shade))},${Math.min(255, Math.round(c[2] * shade))},${face.alpha})`;
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(7,32,59,.13)';
      ctx.stroke();
    });

    nodes.forEach((n) => {
      ctx.fillStyle = n.color;
      ctx.globalAlpha = 0.13 + hover * 0.08;
      ctx.beginPath(); ctx.arc(n.p[0], n.p[1], 4.6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(n.p[0], n.p[1], 1.9, 0, Math.PI * 2); ctx.fill();
    });
  }

  function resize() {
    if (destroyed) return;
    const rect = scene.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    width = rect.width; height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(elapsed);
    scene.classList.add('is-ready');
  }
  function canRun() { return !destroyed && visible && !document.hidden && !reduced; }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0; lastNow = 0;
  }
  function frame(now) {
    raf = 0;
    if (!canRun()) return;
    if (lastFrame && now - lastFrame < frameInterval) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const delta = lastNow ? Math.min(50, now - lastNow) : 16.7;
    lastNow = now; lastFrame = now; elapsed += delta;
    draw(elapsed);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!canRun() || raf) return;
    lastNow = 0;
    raf = requestAnimationFrame(frame);
  }
  function onPointerMove(e) {
    if (reduced || e.pointerType !== 'mouse') return;
    const rect = scene.getBoundingClientRect();
    targetX = clamp((e.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    targetY = clamp((e.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
    targetHover = 1;
  }
  function onPointerLeave() { targetX = 0; targetY = 0; targetHover = 0; }
  function onScroll() { targetScroll = clamp(window.scrollY * 0.018, 0, 5); }
  function onVisibility() { document.hidden ? stop() : start(); }
  function onMotion(e) {
    reduced = e.matches;
    if (reduced) {
      stop(); elapsed = 0;
      targetX = targetY = targetHover = pointerX = pointerY = hover = scrollY = 0;
      draw(0);
    } else start();
  }

  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(scene);
  else window.addEventListener('resize', resize, { passive: true });
  const intersectionObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    visible ? start() : stop();
  }, { threshold: 0.04 }) : null;
  if (intersectionObserver) intersectionObserver.observe(scene);
  scene.addEventListener('pointermove', onPointerMove, { passive: true });
  scene.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotion);
  else motionQuery.addListener(onMotion);

  campusSceneCleanup = () => {
    destroyed = true;
    stop();
    if (resizeObserver) resizeObserver.disconnect();
    else window.removeEventListener('resize', resize);
    if (intersectionObserver) intersectionObserver.disconnect();
    scene.removeEventListener('pointermove', onPointerMove);
    scene.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    if (motionQuery.removeEventListener) motionQuery.removeEventListener('change', onMotion);
    else motionQuery.removeListener(onMotion);
  };
  resize();
  start();
}

/* 首页校历：与课表卡同款报头的月历，日期格内直接挂当天安排 */
const TERM_START = new Date(2026, 8, 7);
const TERM_END = new Date(2027, 1, 1);
function homeCalMonth() {
  const today = new Date();
  const inTerm = today >= TERM_START && today <= TERM_END;
  const base = inTerm ? today : new Date(2026, 10, 1);
  return new Date(base.getFullYear(), base.getMonth() + state.monthOffset, 1);
}
function homeCalendarHTML() {
  const ym = homeCalMonth();
  const y = ym.getFullYear();
  const m = ym.getMonth();
  const todayKey = dateKey(new Date());
  const firstDay = new Date(y, m, 1);
  const lead = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = lead - 1; i >= 0; i--) cells.push({ d: new Date(y, m - 1, prevDays - i), out: true });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ d: new Date(y, m, i), out: false });
  while (cells.length % 7) cells.push({ d: new Date(y, m + 1, cells.length - lead - daysInMonth + 1), out: true });

  const monthEvents = eventsInMonth(y, m);
  const inTerm = firstDay >= TERM_START && firstDay < TERM_END;
  const weekOf = (d) => clamp(Math.round((mondayOf(d) - mondayOf(TERM_START)) / 604800000) + 1, 1, 20);
  const w1 = weekOf(firstDay);
  const w2 = weekOf(new Date(y, m, daysInMonth));
  const termLine = inTerm
    ? (w1 === w2 ? `第 ${w1} 教学周` : `第 ${w1}–${w2} 教学周`)
    : (firstDay < TERM_START ? '学期未开始' : '寒假');
  const navLabel = state.monthOffset === 0 ? `本月 ${m + 1}/01–${m + 1}/${daysInMonth}` : '回到本月';

  return `
  <section class="card cal-card fade-up">
    <header class="cal-card__head">
      <div class="cal-card__date">
        <span class="cal-card__kicker">CALENDAR / 校历安排</span>
        <div class="cal-card__row">
          <b class="cal-card__m">${m + 1}</b>
          <span class="cal-card__my">${y} 年<br /><i>${termLine}</i></span>
        </div>
      </div>
      <div class="cal-card__stat">
        <span>MONTH</span>
        <b>${monthEvents.length}</b>
        <small>项安排</small>
      </div>
    </header>
    <div class="cal-card__bar">
      <div class="weeknav">
        <button class="wnav-btn" data-action="month" data-delta="-1" aria-label="上个月">${icon('back', 15)}</button>
        <button class="weeknav__label" data-action="month" data-delta="0" title="回到本月">${navLabel}</button>
        <button class="wnav-btn" data-action="month" data-delta="1" aria-label="下个月">${icon('chev', 15)}</button>
      </div>
      <div class="spacer"></div>
      <button class="btn-ghost-sm cal-card__all" data-action="open-calendar" data-date="${dateKey(firstDay)}">${icon('calendar', 13)} 完整校历</button>
    </div>
    <div class="cal-card__body">      <div class="cal-grid">
        ${['一', '二', '三', '四', '五', '六', '日'].map((w) => `<div class="cal-dow">${w}</div>`).join('')}
        ${cells.map(({ d, out }) => {
          const key = dateKey(d);
          const evs = out ? [] : eventsOn(key);
          return `<button class="cal-cell${out ? ' is-out' : ''}${!out && key === todayKey ? ' is-today' : ''}" data-action="open-calendar" data-date="${key}"${out ? ' tabindex="-1"' : ''} aria-label="${key} 的安排">
            <span class="cal-d">${d.getDate()}</span>
            ${evs.slice(0, 1).map((e) => `<span class="cal-ev cal-ev--${e.tone}">${esc(e.short)}</span>`).join('')}
            ${evs.length > 1 ? `<span class="cal-ev cal-ev--more">+${evs.length - 1}</span>` : ''}
          </button>`;
        }).join('')}
      </div>
      <div class="cal-card__list">
        ${monthEvents.length
          ? monthEvents.slice(0, 3).map((e) => `<button class="cal-card__item" data-action="open-calendar" data-date="${e.start}">
              <span class="ci-day">${calRangeLabel(e)}</span>
              <b>${esc(e.title)}</b>
              <span class="tag" style="flex:none;font-size:8.5px;padding:1px 5px">${esc(e.tag)}</span>
            </button>`).join('')
          : '<div class="cal-card__empty">本月暂无安排，左右切换月份看看</div>'}
      </div>
    </div>
  </section>`;
}

function homeHTML() {
  const u = me();
  const today = new Date();
  const hotPosts = db.posts.slice(0, 4);
  const recItems = db.items.slice(0, 6);
  const weekCount = db.courses.reduce((n, c) => n + c.len, 0);
  const termStart = new Date(2026, 8, 7);
  const termWeek = Math.min(20, Math.max(1, Math.round((mondayOf(today) - mondayOf(termStart)) / 604800000) + 1));
  return `
  <div class="home-top">
    <div class="home-hello">
      <span class="brand__mark">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
          <path d="M20.2 3.8C10.8 3.8 4.6 8.4 4.6 15.6c0 2.3 1.3 4.2 3.2 4.2 6.8 0 11.6-6.3 12.4-16z" fill="#4A3623"/>
          <path d="M5.6 20.2C7.6 13.9 12 9.2 17.6 6.2" stroke="#E8B79E" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <div class="home-hello__txt">
        <small>第 ${termWeek} 教学周 · 晴 24°</small>
        <b>${greet()}，${esc(u.nick)}</b>
      </div>
    </div>
    <div class="home-tools">
      <span class="weather">☀️ 24°</span>
      <button class="avatar" data-action="go-profile" style="background:${AV_COLORS[0]}" aria-label="个人中心">${esc(Array.from(u.nick)[0] || '轻')}</button>
    </div>
  </div>

  ${scheduleHTML()}

  ${homeCalendarHTML()}

  <section class="section">
    <div class="section__head"><h2><i class="idx">01</i>常用服务<span>QUICK ACCESS</span></h2></div>
    <div class="quick-grid">
      <button class="quick-item" data-action="open-market">
        <span class="quick-ico q-amber" style="color:#8A5A12">${icon('bag', 18)}</span>
        <span class="quick-label">跳蚤市场<i>${db.items.length} 件在售</i></span>
      </button>
      <button class="quick-item" data-action="open-errands">
        <span class="quick-ico" style="background:#FBF0DC;color:#8A5A12">${icon('box', 18)}</span>
        <span class="quick-label">校园跑腿<i>${db.errands.filter((x) => x.status === 'open').length} 单待接</i></span>
      </button>
      <button class="quick-item" data-action="open-shops">
        <span class="quick-ico" style="background:#E9F1FA;color:#2C5A96">${icon('store', 18)}</span>
        <span class="quick-label">附近好店<i>${db.shops.length} 家店</i></span>
      </button>
      <button class="quick-item" data-action="open-wall">
        <span class="quick-ico q-coral" style="color:#B23B25">${icon('heart', 18)}</span>
        <span class="quick-label">校园墙<i>${db.posts.length} 条动态</i></span>
      </button>
      <button class="quick-item" data-action="tool" data-tool="room">
        <span class="quick-ico q-green" style="color:#2C5A96">${icon('door', 18)}</span>
        <span class="quick-label">空教室<i>实时空位</i></span>
      </button>
      <button class="quick-item" data-action="tool" data-tool="calendar">
        <span class="quick-ico q-blue" style="color:#2C5A96">${icon('calendar', 18)}</span>
        <span class="quick-label">校历<i>第 ${termWeek} 周</i></span>
      </button>
    </div>
  </section>

  <div class="home-bottom">
  <section class="section">
    <div class="section__head">
      <h2><i class="idx">02</i>校园墙<span>正在发生</span></h2>
      <button class="section__more" data-action="open-wall">全部 ${icon('chev', 13)}</button>
    </div>
    <div class="hscroll">
      ${hotPosts.map((p) => `
        <button class="mini-post" data-action="open-post" data-id="${p.id}">
          <span class="cover" style="background:${ART_BG[p.art]}">${art(p.art)}</span>
          <span class="body">
            <b>${esc(p.title)}</b>
            <span class="meta">${avatarHTML(p.author)}<span>${esc(p.anon ? '匿名同学' : p.author)}</span><span style="margin-left:auto">♡ ${p.likes}</span></span>
          </span>
        </button>`).join('')}
    </div>
  </section>

  <section class="section">
    <div class="section__head">
      <h2><i class="idx">03</i>跳蚤市场<span>手慢无</span></h2>
      <button class="section__more" data-action="open-market">去逛逛 ${icon('chev', 13)}</button>
    </div>
    <div class="hscroll">
      ${recItems.map((it) => `
        <button class="mini-item" data-action="open-item" data-id="${it.id}">
          <span class="cover" style="background:${ART_BG[it.art]}">${art(it.art)}</span>
          <b>${esc(it.title)}</b>
          <span class="price"><small>¥</small>${num(it.price)}</span>
        </button>`).join('')}
    </div>
  </section>
  </div>

  <div class="section" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-radius:18px;background:linear-gradient(120deg,#28231D,#1B1815);color:#F8F1E5;box-shadow:0 18px 38px -30px rgba(28,24,18,.85)">
    <div>
      <div style="font-size:12px;font-weight:700">本周共 ${weekCount} 节课</div>
      <div style="font-size:10.5px;color:rgba(242,232,218,.6);margin-top:3px">课表支持智能导入，粘贴文字就能生成</div>
    </div>
    <button class="btn btn--lime btn--sm" data-action="import">试一试</button>
  </div>
  <div class="foot-note">智慧校园4.0 · 连接校园，让智慧发生</div>`;
}
