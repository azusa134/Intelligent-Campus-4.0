'use strict';

/* ================= 9. 课表：增删改 / 智能导入 ================= */
function openCourseForm(id, pre) {
  const c = id ? db.courses.find((x) => x.id === id) : null;
  const day = c ? c.day : (pre && pre.day) || 1;
  const start = c ? c.start : (pre && pre.period) || 1;
  const len = c ? c.len : 2;
  let color = c ? c.color : Math.floor(Math.random() * 6);
  let confirmDelete = false;

  const body = `
    <form id="courseForm" class="form-grid" novalidate>
      <label class="field"><span>课程名称 *</span>
        <input id="cfName" maxlength="30" placeholder="例如：高等数学 A" value="${c ? esc(c.name) : ''}" />
      </label>
      <div class="form-2">
        <label class="field"><span>任课老师</span>
          <input id="cfTeacher" maxlength="20" placeholder="例如：张建国" value="${c ? esc(c.teacher) : ''}" />
        </label>
        <label class="field"><span>教室地点</span>
          <input id="cfRoom" maxlength="20" placeholder="例如：A301" value="${c ? esc(c.room) : ''}" />
        </label>
      </div>
      <div class="form-3">
        <label class="field"><span>星期</span>
          <select id="cfDay">${[1, 2, 3, 4, 5, 6, 7].map((d) => `<option value="${d}" ${d === day ? 'selected' : ''}>周${WD[d]}</option>`).join('')}</select>
        </label>
        <label class="field"><span>开始节次</span>
          <select id="cfStart">${PERIODS.map((p) => `<option value="${p.n}" ${p.n === start ? 'selected' : ''}>第 ${p.n} 节</option>`).join('')}</select>
        </label>
        <label class="field"><span>持续节数</span>
          <select id="cfLen">${[1, 2, 3, 4].map((n) => `<option value="${n}" ${n === len ? 'selected' : ''}>${n} 节</option>`).join('')}</select>
        </label>
      </div>
      <div class="field">
        <span>课程颜色</span>
        <div class="color-row" id="cfColors">
          ${PALETTE.map((bg, i) => `<button type="button" class="color-dot ${i === color ? 'is-active' : ''}" data-color="${i}" style="background:${bg}" aria-label="颜色 ${i + 1}"></button>`).join('')}
        </div>
      </div>
      <p class="hint" id="cfTime"></p>
      <p class="hint">${c ? '当前课程会显示在课表对应位置，修改后立即生效。' : '保存后会出现在课表里，同一格可以放多门课。'}</p>
    </form>`;

  const foot = `
    ${c ? `<button class="btn btn--danger" data-action="delete-course" data-id="${c.id}">删除</button>` : ''}
    <button class="btn btn--ghost" data-action="close-sheet">取消</button>
    <button class="btn btn--primary" data-action="save-course" data-id="${c ? c.id : ''}">保存课程</button>`;

  const sheet = openSheet({ title: c ? '编辑课程' : '添加课程', body, foot });

  sheet.querySelector('#cfColors').addEventListener('click', (e) => {
    const dot = e.target.closest('[data-color]');
    if (!dot) return;
    color = Number(dot.dataset.color);
    $$('#cfColors .color-dot').forEach((d) => d.classList.toggle('is-active', d === dot));
  });
  sheet.querySelector('#cfStart').addEventListener('change', (e) => {
    const s = Number(e.target.value);
    const max = Math.max(1, Math.min(4, PERIODS.length - s + 1));
    const sel = sheet.querySelector('#cfLen');
    if (Number(sel.value) > max) sel.value = String(max);
    updTime();
  });
  sheet.querySelector('#cfLen').addEventListener('change', updTime);
  function updTime() {
    const s = Number(sheet.querySelector('#cfStart').value);
    const l = Number(sheet.querySelector('#cfLen').value);
    const end = PERIODS[Math.min(PERIODS.length - 1, s + l - 2)];
    sheet.querySelector('#cfTime').textContent = `上课时间 ${PERIODS[s - 1].s} – ${end.e}，共 ${l} 节课`;
  }
  updTime();
  sheet.querySelector('[data-action="save-course"]').addEventListener('click', () => {
    const name = sheet.querySelector('#cfName').value.trim();
    if (!name) { toast('请填写课程名称'); sheet.querySelector('#cfName').focus(); return; }
    const data = {
      name,
      teacher: sheet.querySelector('#cfTeacher').value.trim() || '待定',
      room: sheet.querySelector('#cfRoom').value.trim() || '待定',
      day: Number(sheet.querySelector('#cfDay').value),
      start: Number(sheet.querySelector('#cfStart').value),
      len: Number(sheet.querySelector('#cfLen').value),
      color
    };
    if (c) {
      Object.assign(c, data);
      toast('课程已更新');
    } else {
      db.courses.push({ id: uid('c'), ...data });
      toast('课程已添加到课表');
    }
    saveDB(); closeSheet(); renderPage();
  });
  const delBtn = sheet.querySelector('[data-action="delete-course"]');
  if (delBtn) {
    delBtn.addEventListener('click', () => {
      if (!confirmDelete) {
        confirmDelete = true;
        delBtn.textContent = '再点一次删除';
        delBtn.style.background = '#FDECE8';
        return;
      }
      db.courses = db.courses.filter((x) => x.id !== c.id);
      saveDB(); closeSheet(); renderPage();
      toast('课程已删除');
    });
  }
  setTimeout(() => { const el = sheet.querySelector('#cfName'); if (el) el.focus(); }, 340);
}

/* 智能导入：把一行文字解析成课程 */
const DAY_MAP = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 7, 天: 7 };
function parseCourseLine(raw) {
  let s = ' ' + raw.replace(/[，,、｜|;；]+/g, ' ').replace(/\s+/g, ' ') + ' ';
  let day = 0;
  const dm = s.match(/(?:周|星期|礼拜)\s*([一二三四五六日天1-7])/);
  if (dm) {
    day = /\d/.test(dm[1]) ? Number(dm[1]) : DAY_MAP[dm[1]];
    s = s.replace(dm[0], ' ');
  }
  if (!day) return null;

  let start = 0, len = 2;
  const range = s.match(/(?:第)?\s*(\d{1,2})\s*[-~到至]\s*(\d{1,2})\s*节?/);
  if (range) {
    start = clamp(Number(range[1]), 1, 12);
    const end = clamp(Number(range[2]), start, 12);
    len = end - start + 1;
    s = s.replace(range[0], ' ');
  } else {
    const single = s.match(/(?:第)?\s*(\d{1,2})\s*节/);
    if (!single) return null;
    start = clamp(Number(single[1]), 1, 12);
    s = s.replace(single[0], ' ');
  }

  const tokens = s.split(' ').map((t) => t.trim()).filter(Boolean);
  if (!tokens.length) return null;

  let name = tokens.shift();
  name = name.replace(/^(课程|课名)[:：]?/, '');
  if (!name) return null;

  let teacher = '', room = '';
  const rest = [];
  tokens.forEach((t) => {
    if (!room && /(楼|室|馆|场|机房|中心|栋|座|校区|[A-Za-z]\s*\d{2,4}|\d{3,4})/.test(t)) { room = t; return; }
    if (!teacher && /(老师|教授|讲师|teacher)/i.test(t)) { teacher = t.replace(/(老师|教授|讲师|teacher)/gi, ''); return; }
    rest.push(t);
  });
  if (!teacher && rest.length) teacher = rest.shift();
  if (!room && rest.length) room = rest.shift();
  return { name, teacher: teacher || '待定', room: room || '待定', day, start, len };
}

function openImportSheet() {
  const demo = `高等数学A 周一 1-2节 张建国 A301
数据结构 周二 3-4节 李明 计算机楼302
大学物理 周三 5-6节 周涛 物理楼 401
大学英语 周五 1-2节 Emily B205`;
  const body = `
    <div class="field">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
        <span style="font-size:12.5px;font-weight:650;color:var(--ink-2)">粘贴你的课表文字</span>
        <button type="button" class="link" id="impDemo">载入示例</button>
      </div>
      <textarea id="impText" class="import-area" style="min-height:128px" placeholder="每行一门课，例如：&#10;高等数学A 周一 1-2节 张建国 A301&#10;数据结构 周二 3-4节 李明 计算机楼302"></textarea>
      <p class="hint">支持「周一 / 星期一 / 礼拜一」，节次支持「1-2节」「第3节」等写法。<br/>顺序不限，识别后可以再手动调整。</p>
    </div>
    <div id="impPreview"></div>`;
  const sheet = openSheet({
    title: '智能导入课表',
    body,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button>
           <button class="btn btn--primary" id="impBtn">识别课表</button>`
  });
  const btn = sheet.querySelector('#impBtn');
  const box = sheet.querySelector('#impPreview');
  const run = () => {
    const lines = sheet.querySelector('#impText').value.split(/\n+/).filter((l) => l.trim());
    const parsed = lines.map(parseCourseLine).filter(Boolean);
    delete box.dataset.payload;
    if (!lines.length) {
      box.innerHTML = `<p class="form-err">先粘贴课表文字，或者点右上角「载入示例」看看效果</p>`;
      btn.textContent = '识别课表';
      return;
    }
    if (!parsed.length) {
      box.innerHTML = `<p class="form-err">没有识别到有效课程，请检查是否包含「周几 + 节次」，例如：高等数学 周一 1-2节 张建国 A301</p>`;
      btn.textContent = '重新识别';
      return;
    }
    box.innerHTML = `<div style="border:1px solid var(--line);border-radius:14px;overflow:hidden">
      <div style="padding:10px 12px;background:var(--lime-soft);font-size:12px;font-weight:700;color:var(--brand)">识别到 ${parsed.length} 门课程</div>
      ${parsed.map((p) => `<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid var(--line-2);font-size:12px">
        <span style="flex:1;min-width:0;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.name)}</span>
        <span style="color:var(--ink-3);flex:none">周${WD[p.day]} 第${p.start}-${p.start + p.len - 1}节</span>
        <span style="color:var(--ink-3);flex:none">${esc(p.room)}</span>
      </div>`).join('')}
    </div>
    <p class="hint">确认后会追加到现有课表，不会覆盖已有课程。</p>`;
    box.dataset.payload = JSON.stringify(parsed);
    btn.textContent = `确认导入 ${parsed.length} 门`;
  };
  sheet.querySelector('#impDemo').addEventListener('click', () => {
    sheet.querySelector('#impText').value = demo;
    run();
  });
  sheet.querySelector('#impText').addEventListener('input', () => {
    box.innerHTML = '';
    delete box.dataset.payload;
    btn.textContent = '识别课表';
  });
  btn.addEventListener('click', () => {
    if (!box.dataset.payload) { run(); return; }
    const parsed = JSON.parse(box.dataset.payload);
    const added = parsed.filter((p) => !db.courses.some((c) => c.day === p.day && c.start === p.start && c.name === p.name));
    added.forEach((p) => db.courses.push({ id: uid('c'), ...p, color: Math.floor(Math.random() * 6) }));
    saveDB(); closeSheet(); renderPage();
    if (!added.length) toast('这些课程已经在课表里啦');
    else toast(`已导入 ${added.length} 门课程${added.length < parsed.length ? '，已跳过重复项' : ''}`);
  });
}
