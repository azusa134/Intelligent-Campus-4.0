'use strict';

/* ================= 10.5 新生必看：指南 + 新生问答 ================= */
function freshmanSectionHTML() {
  const qs = db.questions;
  const answered = qs.filter((q) => q.a).length;
  const preview = qs.slice(0, 3);
  return `
  <section class="section">
    <div class="section__head">
      <h2><i class="idx">05</i>新生必看<span>FRESHMAN GUIDE</span></h2>
      <button class="section__more" data-action="open-qa">新生问答 ${icon('chev', 12)}</button>
    </div>
    <div class="g-grid card-flow">
      ${db.guides.map((g, i) => `<button class="g-card" data-action="open-guide" data-id="${g.id}" style="--i:${Math.min(i, 8)}">
        <span class="g-ico" style="background:${ART_BG[g.art] || '#F1E7D8'}">${art(g.art, '34px')}</span>
        <span class="g-main">
          <span class="g-tag">${esc(g.cat)} · 阅读 ${num(g.reads)}</span>
          <b>${esc(g.title)}</b>
          <small>${esc(g.summary)}</small>
        </span>
      </button>`).join('')}
    </div>
    <div class="qa-card">
      <div class="qa-head">
        <div class="qa-head__main">
          <b>新生问答</b>
          <small>${qs.length} 个问题 · ${answered} 个已解答</small>
        </div>
        <button class="btn btn--primary btn--sm" data-action="ask-question">${icon('plus', 12)} 我要提问</button>
      </div>
      ${preview.map((q) => `<div class="qa-item" role="button" tabindex="0" data-action="open-qa" data-id="${q.id}">
        <div class="qa-q"><span class="qb">Q</span><span>${esc(q.q)}</span></div>
        ${q.a
          ? `<div class="qa-a"><span class="qb qb--a">A</span><p>${esc(q.a)}</p></div>`
          : '<div class="qa-wait">还没有人解答 · 点开看看，或者你来当第一个</div>'}
        <div class="qa-meta"><span>${esc(q.asker)}</span><span>·</span><span>${esc(q.tag)}</span><span>·</span><span>${q.likes} 人同问</span>${q.a ? `<span>·</span><span>${esc(q.answerer)} 解答</span>` : ''}</div>
      </div>`).join('')}
      <button class="qa-more" data-action="open-qa">查看全部 ${qs.length} 个问题</button>
    </div>
  </section>`;
}

function guideDetailHTML(g) {
  return `
  <div class="detail__top">
    <button class="detail__back" data-action="close-detail" aria-label="返回">${icon('back', 18)}</button>
    <button class="detail__share" data-action="share-guide" aria-label="分享">${icon('send', 16)}</button>
    <span class="detail__count">新生必看 · ${esc(g.cat)}</span>
  </div>
  <div class="detail__scroll">
    <div class="detail__cover" style="background:${ART_BG[g.art] || '#F1E7D8'}">${art(g.art)}</div>
    <div class="detail__body">
      <div class="detail__topic">新生必看 · ${esc(g.cat)} · 阅读 ${num(g.reads)}</div>
      <h1 class="detail__title">${esc(g.title)}</h1>
      <p class="detail__text">${esc(g.intro)}</p>
      <div class="detail__h">STEPS · 办理步骤</div>
      <div class="guide-steps">
        ${g.steps.map((s, i) => `<div class="guide-step">
          <span class="gs-n">${String(i + 1).padStart(2, '0')}</span>
          <div><b>${esc(s.t)}</b><p>${esc(s.d)}</p></div>
        </div>`).join('')}
      </div>
      <div class="detail__h">TIPS · 学长学姐提醒</div>
      <div>${g.tips.map((t) => `<div class="guide-tip">${esc(t)}</div>`).join('')}</div>
      <div style="height:8px"></div>
    </div>
  </div>
  <div class="detail__bar detail__bar--actions">
    <button class="btn btn--ghost" data-action="close-detail">关闭</button>
    <button class="btn btn--primary" data-action="ask-question">还有问题？去提问</button>
  </div>`;
}

function bindGuideDetail(el, g) {
  el.querySelector('[data-action="share-guide"]')?.addEventListener('click', async () => {
    const text = `${g.title} · 新生必看 · 来自智慧校园4.0`;
    try {
      if (navigator.share) { await navigator.share({ title: g.title, text }); return; }
      await navigator.clipboard.writeText(`${text}\n${location.href}`);
      toast('链接已复制');
    } catch (err) { toast('分享已取消'); }
  });
  bindPullClose(el);
}

function openGuide(id, origin) {
  if (detailView) return;
  const g = db.guides.find((x) => x.id === id);
  if (!g) return;
  const originCover = origin && origin.querySelector ? origin.querySelector('.g-ico') : null;
  openDetailLayer({
    kind: 'guide',
    id: g.id,
    html: guideDetailHTML(g),
    bg: ART_BG[g.art] || '#F1E7D8',
    heroHTML: art(g.art),
    from: originCover ? originCover.getBoundingClientRect() : null,
    bind: (el) => bindGuideDetail(el, g)
  });
}

function openQA(focusId) {
  const qs = db.questions;
  const body = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="flex:1;font-size:11.5px;color:var(--ink-3)">${qs.length} 个问题 · ${qs.filter((q) => q.a).length} 个已解答</span>
      <button class="btn btn--primary btn--sm" data-action="ask-question">${icon('plus', 12)} 我要提问</button>
    </div>
    ${qs.map((q) => `<div class="qa-full${q.id === focusId ? ' is-focus' : ''}">
      <div class="qa-full__q"><span class="qb">Q</span><span>${esc(q.q)}</span></div>
      <div class="qa-full__meta">${esc(q.asker)} · ${esc(q.tag)} · ${esc(q.time)} · ${q.likes} 人同问</div>
      ${q.a
        ? `<div class="qa-full__a"><span class="qb qb--a">A</span><div><p>${esc(q.a)}</p><small>${esc(q.answerer)} · 解答</small></div></div>`
        : `<div class="qa-full__wait"><span>还没有学长学姐解答</span><button class="btn btn--ghost btn--sm" data-answer="${q.id}">我来解答</button></div>`}
    </div>`).join('')}
    <p class="sheet-note">问答由同学互助维护，涉及缴费、证件的信息请以学校官方通知为准。</p>`;
  const sheet = openSheet({
    title: '新生问答',
    body,
    foot: `<button class="btn btn--primary" data-action="close-sheet">关闭</button>`
  });
  sheet.querySelector('.sheet__body').addEventListener('click', (e) => {
    const b = e.target.closest('[data-answer]');
    if (!b) return;
    openAnswerQuestion(b.dataset.answer);
  });
}

function openAskQuestion() {
  const body = `
    <form class="form-grid" novalidate>
      <label class="field"><span>你的问题 *</span>
        <textarea id="qText" maxlength="120" style="min-height:96px" placeholder="例如：宿舍可以用吹风机吗？功率有限制吗？"></textarea>
      </label>
      <label class="field"><span>问题分类</span>
        <select id="qTag">${['住宿', '报到', '生活', '学习', '其他'].map((t) => `<option>${t}</option>`).join('')}</select>
      </label>
      <p class="hint">提问会出现在「新生问答」里，学长学姐看到就会来解答；被解答后你会收到提醒。</p>
    </form>`;
  const sheet = openSheet({
    title: '我要提问',
    body,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button>
           <button class="btn btn--primary" id="qSubmit">发布问题</button>`
  });
  sheet.querySelector('#qSubmit').addEventListener('click', () => {
    const q = sheet.querySelector('#qText').value.trim();
    if (!q) { toast('先写一下你的问题吧'); return; }
    db.questions.unshift({
      id: uid('q'), q,
      tag: sheet.querySelector('#qTag').value,
      asker: me().nick, time: '刚刚', likes: 0, a: '', answerer: ''
    });
    saveDB();
    closeSheet();
    if (state.tab === 'services' && !state.page) renderPage();
    toast('问题已发布，等学长学姐来解答');
  });
}

function openAnswerQuestion(id) {
  const q = db.questions.find((x) => x.id === id);
  if (!q) return;
  const body = `
    <div class="qa-quote"><span class="qb">Q</span><span>${esc(q.q)}</span></div>
    <label class="field" style="margin-top:12px"><span>你的解答 *</span>
      <textarea id="aText" maxlength="200" style="min-height:110px" placeholder="尽量写清条件、地点和时效，新生更容易看懂"></textarea>
    </label>
    <p class="hint">解答发布后会显示在这条问题下，并获得 5 积分。</p>`;
  const sheet = openSheet({
    title: '解答新生提问',
    body,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button>
           <button class="btn btn--primary" id="aSubmit">发布解答</button>`
  });
  sheet.querySelector('#aSubmit').addEventListener('click', () => {
    const text = sheet.querySelector('#aText').value.trim();
    if (!text) { toast('写两句再发布吧'); return; }
    q.a = text;
    q.answerer = me().nick;
    addPoints(5, '解答新生提问', true);
    saveDB();
    closeSheet();
    if (state.tab === 'services' && !state.page) renderPage();
    toast('解答已发布，感谢帮忙 · 积分 +5');
  });
}
