'use strict';

/* ================= 13. 校园工具箱 ================= */
const ROOM_DATA = [
  { b: 'A 楼', r: 'A203', cap: '60 座', when: '上午 1-2 节' },
  { b: 'A 楼', r: 'A305', cap: '80 座', when: '上午 3-4 节' },
  { b: 'A 楼', r: 'A408', cap: '45 座', when: '下午 5-6 节' },
  { b: 'B 楼', r: 'B205', cap: '50 座', when: '上午 1-2 节' },
  { b: 'B 楼', r: 'B301', cap: '70 座', when: '下午 7-8 节' },
  { b: '图书馆', r: '四楼自习区', cap: '120 座', when: '全天' },
  { b: '图书馆', r: '二楼研读间', cap: '30 座', when: '晚上 9-12 节' },
  { b: '计算机楼', r: '机房 205', cap: '40 座', when: '下午 5-6 节' }
];
const LOST_DATA = [
  { type: '招领', title: '校园卡（陈，尾号 0427）', place: '3 号楼宿管处', time: '今天 09:20', art: 'key' },
  { type: '招领', title: '白色 AirPods 左耳', place: '图书馆四楼', time: '昨天 18:40', art: 'headphones' },
  { type: '求助', title: '黑色雨伞，伞柄有划痕', place: 'B 楼 301 附近', time: '昨天 14:10', art: 'umbrella' },
  { type: '招领', title: '《线性代数》课本，写满笔记', place: 'A 楼 305', time: '10 月 26 日', art: 'book' }
];
const PHONE_DATA = [
  { n: '校园保卫处（24h）', t: '020-8888 0110', d: '紧急求助 / 夜间护送' },
  { n: '校医院急诊', t: '020-8888 0120', d: '24 小时值班' },
  { n: '图书馆总服务台', t: '020-8888 0136', d: '借阅 / 研读间预约' },
  { n: '学生事务中心', t: '020-8888 0158', d: '奖助学金 / 证明开具' },
  { n: '心理咨询中心', t: '020-8888 0177', d: '预约制，免费' },
  { n: '宿管中心', t: '020-8888 0190', d: '宿舍报修 / 晚归登记' }
];
/* 校历事件：ISO 日期区间，start === end 表示单日活动 */
const CAL_EVENTS = [
  { start: '2026-09-07', end: '2026-09-07', title: '秋季学期开学 · 第一天上课', short: '开学', tag: '学期', tone: 'green', note: 'A/B 楼 8:00 开始第一节课，记得提前 10 分钟到教室。' },
  { start: '2026-09-14', end: '2026-09-20', title: '社团招新周 · 百团大战', short: '招新', tag: '活动', tone: 'amber', note: '每天 11:30–13:30 在中心广场摆摊，吉他社、摄影社、骑行社都在。' },
  { start: '2026-09-25', end: '2026-09-27', title: '中秋节放假调休', short: '中秋', tag: '假期', tone: 'green', note: '9 月 25–27 日放假，25 日（周五）课程调至 9 月 20 日。' },
  { start: '2026-10-01', end: '2026-10-07', title: '国庆假期 · 图书馆正常开放', short: '国庆', tag: '假期', tone: 'green', note: '10 月 1–7 日放假，图书馆 9:00–17:00 开放，食堂部分窗口轮休。' },
  { start: '2026-10-17', end: '2026-10-18', title: '校园秋季运动会', short: '运动会', tag: '活动', tone: 'amber', note: '东区田径场，17 日上午 8:30 开幕式，当天上午课程暂停。' },
  { start: '2026-11-02', end: '2026-11-13', title: '期中考试周', short: '期中', tag: '考试', tone: 'red', note: '按学院分批考试，考场与座位号提前三天在教务系统公布。' },
  { start: '2026-11-28', end: '2026-11-28', title: '校园 AI 智能体创新应用大赛决赛', short: 'AI 决赛', tag: '活动', tone: 'amber', note: '上午 9:00 起在众创空间路演厅，观众席对全校开放。' },
  { start: '2026-12-12', end: '2026-12-12', title: '大学英语四六级考试', short: '四六级', tag: '考试', tone: 'red', note: '上午四级 9:00 开考，下午六级 15:00 开考，需带准考证与身份证。' },
  { start: '2026-12-31', end: '2026-12-31', title: '元旦晚会 · 跨年市集', short: '元旦', tag: '活动', tone: 'amber', note: '19:00 大学生活动中心，凭校园卡入场，市集 17:00 开始。' },
  { start: '2027-01-04', end: '2027-01-15', title: '期末考试周', short: '期末', tag: '考试', tone: 'red', note: '考试安排以教务系统为准，图书馆四楼延长开放至 23:00。' },
  { start: '2027-01-18', end: '2027-01-18', title: '寒假开始', short: '寒假', tag: '假期', tone: 'green', note: '宿舍 1 月 20 日 12:00 前清空，返校时间另行通知。' }
];

function openTool(name) {
  if (name === 'room') {
    let period = '全部';
    const sheet = openSheet({
      title: '空教室查询',
      body: `
        <div class="chips" id="roomChips" style="padding-bottom:12px">
          ${['全部', '上午', '下午', '晚上'].map((p) => `<button class="chip ${p === '全部' ? 'is-active' : ''}" data-period="${p}">${p}</button>`).join('')}
        </div>
        <div id="roomList"></div>
        <p class="sheet-note">数据每小时更新一次，仅作参考。考试周部分教室会被占用。</p>`,
      foot: `<button class="btn btn--primary" data-action="close-sheet">知道了</button>`
    });
    const render = () => {
      const list = ROOM_DATA.filter((r) => period === '全部' || r.when.includes(period));
      sheet.querySelector('#roomList').innerHTML = list.map((r) => `
        <div style="display:flex;align-items:center;gap:10px;padding:12px 2px;border-bottom:1px solid var(--line-2)">
          <span style="width:36px;height:36px;border-radius:11px;background:var(--lime-soft);display:grid;place-items:center;flex:none">${icon('door', 17)}</span>
          <div style="flex:1;min-width:0"><b style="font-size:13px;display:block">${esc(r.b)} ${esc(r.r)}</b><small style="font-size:11px;color:var(--ink-3)">${esc(r.cap)} · 空闲 ${esc(r.when)}</small></div>
          <span class="tag" style="flex:none">可自习</span>
        </div>`).join('') || '<p class="muted" style="font-size:12px;padding:20px 0;text-align:center">这个时段暂时没有空教室</p>';
    };
    sheet.querySelector('#roomChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-period]');
      if (!b) return;
      period = b.dataset.period;
      $$('#roomChips .chip').forEach((x) => x.classList.toggle('is-active', x === b));
      render();
    });
    render();
  }

  if (name === 'lost') {
    openSheet({
      title: '失物招领',
      body: `
        <div style="display:flex;gap:8px;margin-bottom:14px">
          <span class="tag" style="background:var(--lime-soft);color:var(--brand)">今日新增 2 条</span>
          <span class="tag">累计找回 128 件</span>
        </div>
        ${LOST_DATA.map((l) => `
          <div style="display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid var(--line-2)">
            <span style="width:46px;height:46px;border-radius:12px;background:${ART_BG[l.art] || '#F2E8D5'};display:grid;place-items:center;flex:none;overflow:hidden">${art(l.art || 'book', '40px')}</span>
            <div style="flex:1;min-width:0"><b style="font-size:12.5px;display:block">${esc(l.title)}</b><small style="font-size:10.5px;color:var(--ink-3)">${esc(l.place)} · ${esc(l.time)}</small></div>
            <span class="tag" style="flex:none;${l.type === '求助' ? 'color:#B23B25;border-color:#F3CCC3;background:#FDF1EE' : ''}">${l.type}</span>
          </div>`).join('')}
        <p class="sheet-note">捡到东西可以交到图书馆一楼服务台，或直接在校园墙发帖。</p>`,
      foot: `<button class="btn btn--primary" data-action="close-sheet">好的</button>`
    });
  }

  if (name === 'phone') {
    openSheet({
      title: '校园常用电话',
      body: `
        ${PHONE_DATA.map((p) => `
          <a href="tel:${p.t.replace(/\s/g, '')}" style="display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid var(--line-2)">
            <span style="width:36px;height:36px;border-radius:11px;background:var(--surface-2);display:grid;place-items:center;flex:none">${icon('phone', 16)}</span>
            <div style="flex:1;min-width:0"><b style="font-size:12.5px;display:block">${esc(p.n)}</b><small style="font-size:10.5px;color:var(--ink-3)">${esc(p.d)}</small></div>
            <span style="font-size:12px;color:var(--brand);font-weight:650;flex:none">${esc(p.t)}</span>
          </a>`).join('')}
        <p class="sheet-note">点击号码可直接拨号（手机端）。紧急情况请优先拨打 110 / 120。</p>`,
      foot: `<button class="btn btn--primary" data-action="close-sheet">关闭</button>`
    });
  }

  if (name === 'calendar') openCalendar();
}

/* 校历：月历网格 + 日期格内事项 + 选中日详情，日期与安排一一对应 */
const pad2 = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const keyToDate = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
function eventsOn(key) { return CAL_EVENTS.filter((e) => key >= e.start && key <= e.end); }
function eventsInMonth(y, m) {
  const first = `${y}-${pad2(m + 1)}-01`;
  const last = `${y}-${pad2(m + 1)}-${pad2(new Date(y, m + 1, 0).getDate())}`;
  return CAL_EVENTS.filter((e) => e.start <= last && e.end >= first);
}
function calRangeLabel(e) {
  const s = `${Number(e.start.slice(5, 7))}/${Number(e.start.slice(8, 10))}`;
  if (e.start === e.end) return s;
  return `${s}–${Number(e.end.slice(5, 7))}/${Number(e.end.slice(8, 10))}`;
}
function openCalendar(focus) {
  const today = new Date();
  const todayKey = dateKey(today);
  const termStart = new Date(2026, 8, 7);
  const termEnd = new Date(2027, 1, 1);
  const inTerm = today >= termStart && today <= termEnd;
  let ym = inTerm ? new Date(today.getFullYear(), today.getMonth(), 1) : new Date(2026, 10, 1);
  let sel = inTerm ? todayKey : '2026-11-02';
  if (focus && /^\d{4}-\d{2}-\d{2}$/.test(focus)) {
    const d = keyToDate(focus);
    ym = new Date(d.getFullYear(), d.getMonth(), 1);
    sel = focus;
  }

  const sheet = openSheet({
    title: '校历安排',
    cls: 'sheet--cal',
    body: `<div id="calBody"></div>
      <p class="sheet-note">点击任意日期查看当天安排；灰色日期属于相邻月份，可切换月份浏览。</p>`,
    foot: `<button class="btn btn--ghost" data-action="cal-today">回到本月</button>
           <button class="btn btn--primary" data-action="close-sheet">知道了</button>`
  });

  const draw = () => {
    const y = ym.getFullYear();
    const m = ym.getMonth();
    const firstDay = new Date(y, m, 1);
    const offset = (firstDay.getDay() + 6) % 7; // 周一为第一列
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevMonthDays = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = offset - 1; i >= 0; i--) cells.push({ d: new Date(y, m - 1, prevMonthDays - i), out: true });
    for (let i = 1; i <= daysInMonth; i++) cells.push({ d: new Date(y, m, i), out: false });
    while (cells.length % 7) cells.push({ d: new Date(y, m + 1, cells.length - offset - daysInMonth + 1), out: true });

    const termWeek = clamp(Math.round((mondayOf(new Date(y, m, 1)) - mondayOf(termStart)) / 604800000) + 1, 1, 20);
    const selEvents = eventsOn(sel);
    const monthEvents = eventsInMonth(y, m);

    const head = `<div class="cal-head">
      <button class="cal-nav" data-cal-nav="-1" aria-label="上个月">${icon('back', 14)}</button>
      <div class="cal-ym"><b>${y} 年 ${m + 1} 月</b><small>FALL TERM · 第 ${termWeek} 教学周</small></div>
      <button class="cal-nav" data-cal-nav="1" aria-label="下个月">${icon('chev', 14)}</button>
    </div>`;

    const grid = `<div class="cal-grid">
      ${['一', '二', '三', '四', '五', '六', '日'].map((w) => `<div class="cal-dow">周${w}</div>`).join('')}
      ${cells.map(({ d, out }) => {
        const key = dateKey(d);
        const evs = out ? [] : eventsOn(key);
        const isToday = !out && key === todayKey;
        const wk = d.getDay() === 0 || d.getDay() === 6;
        return `<button class="cal-cell${out ? ' is-out' : ''}${isToday ? ' is-today' : ''}${key === sel ? ' is-sel' : ''}${wk ? ' is-weekend' : ''}" data-cal="${key}"${out ? ' tabindex="-1"' : ''} aria-label="${key} 安排">
          <span class="cal-d">${d.getDate()}</span>
          ${evs.slice(0, 2).map((e) => `<span class="cal-ev cal-ev--${e.tone}">${esc(e.short)}</span>`).join('')}
          ${evs.length > 2 ? `<span class="cal-ev cal-ev--more">+${evs.length - 2}</span>` : ''}
        </button>`;
      }).join('')}
    </div>`;

    const legend = `<div class="cal-legend">
      <span><i style="background:#E7F3EC"></i>假期 / 学期</span>
      <span><i style="background:#FCEBE7"></i>考试</span>
      <span><i style="background:#FFF4DF"></i>活动</span>
      <span><i style="background:#EAF2FC"></i>其他</span>
    </div>`;

    const dayPanel = `<div class="cal-day">
      <span class="cd-k">DAY · ${sel.replace(/-/g, ' / ')} 星期${WD[keyToDate(sel).getDay()]}</span>
      ${selEvents.length
        ? selEvents.map((e) => `<b>${esc(e.title)}</b><p>${esc(e.note)}</p>`).join('')
        : '<b>这天没有特殊安排</b><p>按正常课表上课，可以在首页查看当天的课程与时间。</p>'}
    </div>`;

    const list = `<div class="cal-list">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-family:var(--mono);font-size:8px;letter-spacing:.12em;color:var(--ink-3)">MONTH · 本月安排</span>
        <span style="font-family:var(--mono);font-size:8px;color:var(--ink-3)">共 ${monthEvents.length} 项</span>
      </div>
      ${monthEvents.length ? monthEvents.map((e) => {
        const hit = sel >= e.start && sel <= e.end;
        return `<div class="cal-li${hit ? ' is-sel' : ''}">
          <span class="cl-date">${calRangeLabel(e)}</span>
          <div class="cl-main"><b>${esc(e.title)}</b><small>${esc(e.note)}</small></div>
          <span class="tag" style="flex:none;font-size:9px;padding:2px 6px">${esc(e.tag)}</span>
        </div>`;
      }).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:10px 0">本月暂无安排，切换月份看看</p>'}
    </div>`;

    const box = sheet.querySelector('#calBody');
    if (box) box.innerHTML = head + grid + legend + dayPanel + list;
  };

  const bodyEl = sheet.querySelector('.sheet__body');
  bodyEl.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-cal-nav]');
    if (nav) {
      ym = new Date(ym.getFullYear(), ym.getMonth() + Number(nav.dataset.calNav), 1);
      const ymKey = `${ym.getFullYear()}-${pad2(ym.getMonth() + 1)}`;
      if (sel.slice(0, 7) !== ymKey) {
        const firstEv = CAL_EVENTS.find((x) => x.start.slice(0, 7) === ymKey);
        sel = firstEv ? firstEv.start : `${ymKey}-01`;
      }
      draw();
      bodyEl.scrollTop = 0;
      return;
    }
    const cell = e.target.closest('[data-cal]');
    if (cell) {
      sel = cell.dataset.cal;
      draw();
    }
  });
  sheet.querySelector('[data-action="cal-today"]').addEventListener('click', () => {
    const now = new Date();
    const ok = now >= termStart && now <= termEnd;
    ym = ok ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(2026, 10, 1);
    sel = ok ? dateKey(now) : '2026-11-02';
    draw();
    bodyEl.scrollTop = 0;
    toast('已定位到当前月份');
  });
  draw();
}
