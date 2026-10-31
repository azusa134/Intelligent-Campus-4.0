'use strict';

/* ================= 12. 校园墙 ================= */
const W_TOPICS = ['全部', '学习打卡', '美食探店', '失物招领', '社团招新', '日常碎片', '拼单搭子', '求助'];
const W_ASPECT = ['3 / 4', '1 / 1', '4 / 5', '5 / 6'];

function wallHTML() {
  return `
  <div class="subhead fade-up">
    <button class="icon-btn" data-action="back" aria-label="返回">${icon('back', 17)}</button>
    <h1>校园墙</h1>
    <div class="sub-actions">
      <button class="pill-btn" data-action="publish-post">${icon('plus', 14)} 发帖</button>
    </div>
  </div>
  <div class="chips" id="wTopics">
    ${W_TOPICS.map((t) => `<button class="chip ${state.wtopic === t ? 'is-active' : ''}" data-wtopic="${t}">${t === '全部' ? '全部动态' : '#' + t}</button>`).join('')}
  </div>
  <div class="wall-meta" style="display:flex;align-items:center;justify-content:space-between;padding:0 2px 12px">
    <span style="font-size:11.5px;color:var(--ink-3)" id="wCount"></span>
    <span style="font-size:10.5px;color:var(--ink-3)">点开卡片查看详情与评论</span>
  </div>
  <div class="wall-wrap card-flow" id="wallGrid"></div>
  <div class="foot-note">友善发言 · 匿名也会留下温柔的痕迹</div>`;
}
function wallList() {
  let list = db.posts.slice();
  if (state.wtopic !== '全部') list = list.filter((p) => p.topic === state.wtopic);
  return list;
}
function refreshWall() {
  const grid = $('#wallGrid');
  if (!grid) return;
  const list = wallList();
  const c = $('#wCount');
  if (c) c.textContent = `${list.length} 条动态 · ${new Date().getDate()} 日更新`;
  $$('#wTopics .chip').forEach((b) => b.classList.toggle('is-active', b.dataset.wtopic === state.wtopic));
  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="column-span:all"><div class="em-ico">🌱</div><b>这个话题还很安静</b><p>来做第一个发帖的人吧</p></div>`;
    return;
  }
  grid.innerHTML = list.map((p, i) => `
    <div class="w-card" role="button" tabindex="0" data-action="open-post" data-id="${p.id}" style="--i:${Math.min(i, 8)}">
      <div class="w-cover" style="background:${ART_BG[p.art] || '#F2E8D5'};aspect-ratio:${W_ASPECT[i % 4]}">
        <span class="w-no">${String(i + 1).padStart(2, '0')}</span>
        ${art(p.art)}
        ${p.anon ? '<span class="w-anon">匿名</span>' : ''}
      </div>
      <div class="w-body">
        <div class="w-topic">#${esc(p.topic)}</div>
        <div class="w-title">${esc(p.title)}</div>
        <div class="w-foot">
          ${avatarHTML(p.anon ? '匿名同学' : p.author)}
          <span class="w-name">${esc(p.anon ? '匿名同学' : p.author)}</span>
          <span class="w-like">${db.likes.includes(p.id) ? '❤️' : '♡'} ${p.likes}</span>
        </div>
      </div>
    </div>`).join('');
}

let detailView = null;

function postDetailHTML(p) {
  const idx = db.posts.findIndex((x) => x.id === p.id) + 1;
  const total = db.posts.length;
  const liked = db.likes.includes(p.id);
  const collected = db.collects.includes(p.id);
  return `
  <div class="detail__top">
    <button class="detail__back" data-action="close-detail" aria-label="返回">${icon('back', 18)}</button>
    <button class="detail__share" data-action="share-post" aria-label="分享">${icon('send', 16)}</button>
    <span class="detail__count">NO.${String(idx).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
  </div>
  <div class="detail__scroll">
    <div class="detail__cover" style="background:${ART_BG[p.art] || '#E8F2FC'}">${art(p.art)}</div>
    <div class="detail__body">
      <div class="detail__topic">#${esc(p.topic)}${p.anon ? ' · 匿名' : ''}</div>
      <h1 class="detail__title">${esc(p.title)}</h1>
      <p class="detail__text">${esc(p.content)}</p>
      <div class="detail__author">
        ${avatarHTML(p.anon ? '匿名同学' : p.author)}
        <div style="flex:1;min-width:0"><b>${esc(p.anon ? '匿名同学' : p.author)}</b><small>${esc(p.time)} · 校园墙</small></div>
        <button class="btn btn--ghost btn--sm" data-action="follow">关注</button>
      </div>
      <div class="detail__comments">
        <div class="detail__ct" id="cmtMeta">COMMENTS · ${p.comments.length}</div>
        <div id="cmtList">${p.comments.length ? p.comments.map((c) => `
          <div class="cmt">${avatarHTML(c.who)}<div class="cmt__main"><b>${esc(c.who)}</b><p>${esc(c.text)}</p><small>${esc(c.time)}</small></div></div>`).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:4px 0 8px">还没有评论，来说两句吧</p>'}</div>
      </div>
    </div>
  </div>
  <div class="detail__bar">
    <input id="cmtInput" maxlength="80" placeholder="说点什么…" />
    <button class="detail__send" id="cmtSend">发送</button>
    <button class="detail__ibtn ${liked ? 'is-on' : ''}" id="likeBtn" aria-label="点赞">${liked ? iconFill('heart', 17, '#D2452C') : icon('heart', 17)}<span class="n" id="likeNum">${p.likes}</span></button>
    <button class="detail__ibtn ${collected ? 'is-on' : ''}" id="colBtn" aria-label="收藏">${collected ? iconFill('star', 17, '#A9482F') : icon('star', 17)}<span class="n" id="colTxt">${collected ? '已藏' : '收藏'}</span></button>
  </div>`;
}

function bindDetail(el, p) {
  let liked = db.likes.includes(p.id);
  let collected = db.collects.includes(p.id);

  el.querySelector('#likeBtn').addEventListener('click', (e) => {
    const b = e.currentTarget;
    if (liked) {
      db.likes = db.likes.filter((x) => x !== p.id);
      p.likes = Math.max(0, p.likes - 1);
      liked = false;
      b.classList.remove('is-on');
      b.innerHTML = `${icon('heart', 17)}<span class="n" id="likeNum">${p.likes}</span>`;
    } else {
      db.likes.push(p.id);
      p.likes += 1;
      liked = true;
      b.classList.add('is-on');
      b.innerHTML = `${iconFill('heart', 17, '#D2452C')}<span class="n" id="likeNum">${p.likes}</span>`;
    }
    saveDB();
  });
  el.querySelector('#colBtn').addEventListener('click', (e) => {
    const b = e.currentTarget;
    if (collected) {
      db.collects = db.collects.filter((x) => x !== p.id);
      collected = false;
      b.classList.remove('is-on');
      b.innerHTML = `${icon('star', 17)}<span class="n" id="colTxt">收藏</span>`;
      toast('已取消收藏');
    } else {
      db.collects.push(p.id);
      collected = true;
      b.classList.add('is-on');
      b.innerHTML = `${iconFill('star', 17, '#A9482F')}<span class="n" id="colTxt">已藏</span>`;
      toast('已收藏到个人中心');
    }
    saveDB();
  });
  el.querySelector('[data-action="follow"]').addEventListener('click', (e) => {
    e.currentTarget.textContent = '已关注';
    e.currentTarget.style.color = 'var(--brand-3)';
    toast('关注成功');
  });
  el.querySelector('[data-action="share-post"]').addEventListener('click', async () => {
    const text = `${p.title} · 来自智慧校园4.0 校园墙`;
    try {
      if (navigator.share) { await navigator.share({ title: p.title, text }); return; }
      await navigator.clipboard.writeText(`${text}\n${location.href}`);
      toast('链接已复制');
    } catch (err) { toast('分享已取消'); }
  });

  const send = () => {
    const input = el.querySelector('#cmtInput');
    const text = input.value.trim();
    if (!text) return;
    const c = { who: me().nick, text, time: '刚刚' };
    p.comments.push(c);
    saveDB();
    input.value = '';
    const list = el.querySelector('#cmtList');
    if (!list.querySelector('.cmt')) list.innerHTML = '';
    list.insertAdjacentHTML('beforeend', `<div class="cmt">${avatarHTML(c.who)}<div class="cmt__main"><b>${esc(c.who)}</b><p>${esc(c.text)}</p><small>刚刚</small></div></div>`);
    el.querySelector('#cmtMeta').textContent = `COMMENTS · ${p.comments.length}`;
    list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    toast('评论成功');
  };
  el.querySelector('#cmtSend').addEventListener('click', send);
  el.querySelector('#cmtInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

  // 下拉返回（与卡片位置联动）
  bindPullClose(el);
}

/* 详情层下拉关闭：校园墙与附近好店共用 */
function bindPullClose(el) {
  let sy = 0, dy = 0, dragging = false;
  el.addEventListener('touchstart', (e) => {
    if (detailView && detailView.closing) return;
    if (e.target.closest('.detail__bar, button, input, a, label')) return;
    if (el.scrollTop > 0) return;
    sy = e.touches[0].clientY;
    dy = 0;
    dragging = true;
    el.style.transition = 'none';
  }, { passive: true });
  el.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const d = e.touches[0].clientY - sy;
    if (d <= 0) { dy = 0; el.style.transform = ''; return; }
    if (el.scrollTop > 0) { dragging = false; el.style.transform = ''; return; }
    if (d > 8 && e.cancelable) e.preventDefault();
    dy = d * 0.82;
    el.style.transform = `translate3d(0,${dy}px,0) scale(${Math.max(0.92, 1 - dy / 2600)})`;
    el.style.borderRadius = `${Math.min(16, dy / 9)}px`;
  }, { passive: false });
  el.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    if (dy > 96) { closeDetail(); return; }
    el.style.transition = 'transform .36s cubic-bezier(.22,1,.36,1), border-radius .36s';
    el.style.transform = '';
    el.style.borderRadius = '';
    dy = 0;
  });
}

/* 详情层通用入口：四类卡片（校园墙 / 闲置 / 跑腿 / 好店）共用同一套开合转场 */
function openDetailLayer(opts) {
  if (detailView) return null;
  const el = document.createElement('div');
  el.className = 'detail';
  el.dataset.id = opts.id;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = opts.html;
  document.body.appendChild(el);
  document.body.classList.add('detail-lock');
  detailView = {
    el,
    kind: opts.kind,
    id: opts.id,
    bg: opts.bg,
    heroHTML: opts.heroHTML,
    closing: false,
    hero: null
  };
  if (opts.bind) opts.bind(el);
  startDetail(el, { from: opts.from, bg: opts.bg, heroHTML: opts.heroHTML });
  return el;
}

/* 详情层通用入场：卡片封面 hero-fly → 详情封面，与校园墙一致 */
function startDetail(el, opts) {
  requestAnimationFrame(() => el.classList.add('is-open'));
  const from = opts.from;
  const cover = el.querySelector('.detail__cover');
  if (reduceMotion() || !from || from.width < 4 || !cover) {
    el.classList.add('is-ready');
    return;
  }
  const to = cover.getBoundingClientRect();
  cover.style.visibility = 'hidden';
  const hero = document.createElement('div');
  hero.className = 'hero-fly';
  hero.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;background:${opts.bg};border-radius:10px`;
  hero.innerHTML = opts.heroHTML;
  document.body.appendChild(hero);
  if (detailView) detailView.hero = hero;

  const anim = hero.animate([
    { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: '10px' },
    { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: '0px' }
  ], { duration: 460, easing: 'cubic-bezier(.3,.72,.2,1)', fill: 'forwards' });

  setTimeout(() => {
    if (!detailView || detailView.el !== el) return;
    el.classList.add('is-ready');
  }, 300);

  anim.onfinish = () => {
    cover.style.visibility = 'visible';
    hero.remove();
    if (detailView && detailView.el === el) detailView.hero = null;
  };
}

function openPost(id, origin) {
  if (detailView) return;
  const p = db.posts.find((x) => x.id === id);
  if (!p) return;
  const originCover = origin && origin.querySelector ? origin.querySelector('.w-cover, .cover') : null;
  openDetailLayer({
    kind: 'post',
    id: p.id,
    html: postDetailHTML(p),
    bg: ART_BG[p.art] || '#E8F2FC',
    heroHTML: art(p.art),
    from: originCover ? originCover.getBoundingClientRect() : null,
    bind: (el) => bindDetail(el, p)
  });
}

function closeDetail() {
  const dv = detailView;
  if (!dv || dv.closing) return;
  dv.closing = true;
  const el = dv.el;
  if (dv.hero) {
    dv.hero.getAnimations().forEach((a) => a.cancel());
    dv.hero.remove();
    dv.hero = null;
  }
  const cover = el.querySelector('.detail__cover');
  if (cover) cover.style.visibility = 'visible';

  const ACTION_OF = { post: 'open-post', shop: 'open-shop', item: 'open-item', errand: 'open-errand', guide: 'open-guide' };
  const card = document.querySelector(`[data-action="${ACTION_OF[dv.kind] || 'open-post'}"][data-id="${dv.id}"]`);
  const targetEl = card ? card.querySelector('.m-cover, .w-cover, .cover, .g-ico') : null;
  const to = targetEl ? targetEl.getBoundingClientRect() : null;
  const from = cover ? cover.getBoundingClientRect() : null;
  const scrolled = el.scrollTop > 24;

  el.classList.remove('is-ready', 'is-open');
  el.classList.add('is-closing');
  el.style.transform = '';

  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    el.remove();
    document.body.classList.remove('detail-lock');
    detailView = null;
  };

  if (reduceMotion() || !to || !from || scrolled || from.width < 4) {
    setTimeout(done, 230);
    return;
  }

  cover.style.visibility = 'hidden';
  const hero = document.createElement('div');
  hero.className = 'hero-fly';
  hero.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;background:${dv.bg};border-radius:0`;
  hero.innerHTML = dv.heroHTML;
  document.body.appendChild(hero);

  const anim = hero.animate([
    { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, borderRadius: '0px' },
    { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: '10px' }
  ], { duration: 400, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });

  anim.onfinish = () => { hero.remove(); done(); };
  setTimeout(() => { if (document.body.contains(hero)) hero.remove(); done(); }, 760);
}

function openPublishPost() {
  let pick = 'sun';
  let anon = false;
  const body = `
    <form id="postForm" class="form-grid" novalidate>
      <label class="field"><span>标题 *</span>
        <input id="poTitle" maxlength="40" placeholder="一句话说清你想分享的事" />
      </label>
      <label class="field"><span>正文</span>
        <textarea id="poContent" maxlength="600" style="min-height:120px" placeholder="多写一点，会更容易被看到～"></textarea>
      </label>
      <label class="field"><span>选择话题</span>
        <select id="poTopic">${W_TOPICS.slice(1).map((t) => `<option>${t}</option>`).join('')}</select>
      </label>
      <div class="field">
        <span>封面图案</span>
        <div class="art-row" id="poArt">${ART_KEYS.map((a, i) => `<button type="button" class="art-opt ${i === 0 ? 'is-active' : ''}" data-art="${a}" style="background:${ART_BG[a]}">${art(a)}</button>`).join('')}</div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0 2px;border-top:1px solid var(--line-2);margin-top:4px">
        <div><b style="font-size:13px;display:block">匿名发布</b><small style="font-size:11px;color:var(--ink-3)">开启后不展示你的昵称</small></div>
        <button type="button" class="switch" id="poAnon" aria-label="匿名发布"></button>
      </div>
    </form>`;
  const sheet = openSheet({
    title: '发一条校园动态',
    body,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button>
           <button class="btn btn--primary" id="poSubmit">发布</button>`
  });
  sheet.querySelector('#poArt').addEventListener('click', (e) => {
    const b = e.target.closest('[data-art]');
    if (!b) return;
    pick = b.dataset.art;
    $$('#poArt .art-opt').forEach((x) => x.classList.toggle('is-active', x === b));
  });
  const sw = sheet.querySelector('#poAnon');
  sw.addEventListener('click', () => {
    anon = !anon;
    sw.classList.toggle('is-on', anon);
  });
  sheet.querySelector('#poSubmit').addEventListener('click', () => {
    const title = sheet.querySelector('#poTitle').value.trim();
    if (!title) { toast('还没有写标题哦'); sheet.querySelector('#poTitle').focus(); return; }
    db.posts.unshift({
      id: uid('p'), title,
      content: sheet.querySelector('#poContent').value.trim() || '（只可意会，不可言传）',
      topic: sheet.querySelector('#poTopic').value,
      art: pick, author: me().nick, anon,
      likes: 0, collects: 0, time: '刚刚', mine: true, owner: db.session, comments: []
    });
    state.wtopic = '全部';
    addPoints(5, '发布校园墙动态', true);
    saveDB(); closeSheet();
    if (state.page !== 'wall') { state.tab = 'services'; state.page = 'wall'; }
    renderPage();
    toast('发布成功，积分 +5');
  });
}
