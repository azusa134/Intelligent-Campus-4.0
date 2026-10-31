'use strict';

/* ================= 11.5 校园跑腿 ================= */
const E_TYPES = ['全部', '代取快递', '代取外卖', '代买代送', '代排队', '其他'];
const E_STATUS = { open: '待接单', taken: '进行中', done: '已完成' };

function errandsHTML() {
  return `
  <div class="subhead fade-up">
    <button class="icon-btn" data-action="back" aria-label="返回">${icon('back', 17)}</button>
    <h1>校园跑腿</h1>
    <div class="sub-actions">
      <button class="pts-pill" data-action="open-points" aria-label="积分中心">${icon('coin', 12)}<span class="pts-txt">积分</span><b>${num(myPoints())}</b></button>
      <button class="pill-btn" data-action="publish-errand">${icon('plus', 14)} 发布</button>
    </div>
  </div>
  <div class="searchbar">${icon('search', 17)}<input id="errandSearch" placeholder="搜一搜：快递、外卖、教学楼…" value="${esc(state.eq)}" /></div>
  <div class="chips" id="eTypes">
    ${E_TYPES.map((t) => `<button class="chip ${state.ecat === t ? 'is-active' : ''}" data-ecat="${t}">${t === '全部' ? '全部需求' : t}</button>`).join('')}
  </div>
  <div class="boost-bar">
    <span class="bb-ico">${icon('fire', 14)}</span>
    <div class="bb-main"><b>急单可用积分推流</b><small>BOOST · 置顶后更容易被顺路的同学看到</small></div>
    <button class="btn btn--primary btn--sm" data-action="open-boost" data-kind="errand">去推流</button>
  </div>
  <div class="market-meta">
    <span class="count" id="eCount"></span>
    <div class="sorts" id="eSorts">
      ${[['new', '最新'], ['reward', '悬赏'], ['wants', '热门']].map(([k, l]) => `<button class="sort-btn ${state.esort === k ? 'is-active' : ''}" data-esort="${k}">${l}</button>`).join('')}
    </div>
  </div>
  <div class="masonry card-flow" id="errandGrid"></div>
  <div class="foot-note">接单前请确认时间与地点 · 仅限校内互助</div>`;
}

function errandList() {
  let list = db.errands.slice();
  if (state.ecat !== '全部') list = list.filter((x) => x.type === state.ecat);
  if (state.eq.trim()) {
    const q = state.eq.trim().toLowerCase();
    list = list.filter((x) => (x.title + x.note + x.from + x.to + x.type + x.publisher).toLowerCase().includes(q));
  }
  const cmp = state.esort === 'reward' ? (a, b) => b.reward - a.reward
    : state.esort === 'wants' ? (a, b) => b.wants - a.wants
      : (a, b) => 0;
  list.sort((a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0)
    || (isBoosted(b) ? 1 : 0) - (isBoosted(a) ? 1 : 0)
    || cmp(a, b));
  return list;
}

function refreshErrands() {
  const grid = $('#errandGrid');
  if (!grid) return;
  const list = errandList();
  const openCount = db.errands.filter((x) => x.status === 'open').length;
  const c = $('#eCount');
  if (c) c.textContent = `${list.length} 条需求 · ${openCount} 单待接`;
  $$('#eTypes .chip').forEach((b) => b.classList.toggle('is-active', b.dataset.ecat === state.ecat));
  $$('#eSorts .sort-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.esort === state.esort));
  syncPointsPill();
  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="column-span:all"><div class="em-ico">🏃</div><b>暂时没有这类需求</b><p>换个分类，或者自己发一条试试</p></div>`;
    return;
  }
  grid.innerHTML = list.map((x, idx) => `
    <div class="m-card" role="button" tabindex="0" data-action="open-errand" data-id="${x.id}" style="--i:${Math.min(idx, 8)}">
      <div class="m-cover" style="background:${ART_BG[x.art] || '#F4EAD9'}">
        <span class="cond">${esc(x.type)}${isMine(x) ? ' · MINE' : ''}</span>
        ${boostTag(x)}
        ${coverInner(x)}
        ${x.status !== 'open' ? `<span class="e-state">${E_STATUS[x.status] || ''}</span>` : ''}
      </div>
      <div class="m-body">
        <div class="m-title">${esc(x.title)}</div>
        <div class="m-price"><b><small>¥</small>${num(x.reward)}</b><span class="m-cond">${esc(x.deadline)}</span></div>
        <div class="m-foot">
          ${avatarHTML(x.publisher)}
          <span class="m-seller">${esc(x.publisher)} · ${esc(x.to)}</span>
          <span class="m-want">♡ ${x.wants}</span>
        </div>
      </div>
    </div>`).join('');
}

/* 跑腿详情：与校园墙一致的全屏详情 + 封面飞入转场 */
function errandDetailHTML(x) {
  const photos = x.photos || [];
  const mine = isMine(x);
  const taken = x.status === 'taken' && x.taker === me().nick;
  const foot = mine
    ? `<button class="btn btn--ghost" data-action="boost-target" data-kind="errand" data-id="${x.id}">${icon('fire', 14)} ${isBoosted(x) ? '续推' : '积分推流'}</button>
       <button class="btn btn--primary" data-action="close-detail">关闭</button>`
    : x.status === 'open'
      ? `<button class="btn btn--ghost" data-action="close-detail">再看看</button>
         <button class="btn btn--primary" id="acceptBtn">接单 · 得 15 积分</button>`
      : taken
        ? `<button class="btn btn--ghost" data-action="close-detail">关闭</button>
           <button class="btn btn--primary" id="finishBtn">确认送达 · 得 20 积分</button>`
        : `<button class="btn btn--primary" data-action="close-detail">关闭</button>`;
  return `
  <div class="detail__top">
    <button class="detail__back" data-action="close-detail" aria-label="返回">${icon('back', 18)}</button>
    <button class="detail__share" data-action="share-errand" aria-label="分享">${icon('send', 16)}</button>
    <span class="detail__count">${esc(x.type)} · ${E_STATUS[x.status] || '待接单'}</span>
  </div>
  <div class="detail__scroll">
    <div class="detail__cover" style="background:${photos.length ? '#0A1B30' : (ART_BG[x.art] || '#F4EAD9')}">${photos.length ? `<img class="photo" src="${photos[0]}" alt="实拍照片" />` : art(x.art)}</div>
    <div class="detail__body">
      ${photos.length > 1 ? `<div class="item-thumbs" style="margin:0 0 16px">${photos.slice(1).map((p, i) => `<button type="button" aria-label="照片 ${i + 2}"><img src="${p}" alt="照片 ${i + 2}" /></button>`).join('')}</div>` : ''}
      <div class="detail__topic">悬赏 · ${esc(x.deadline)}</div>
      <h1 class="detail__title">${esc(x.title)}</h1>
      <div class="price-row" style="margin-top:12px"><b><small>¥</small>${num(x.reward)}</b><span style="font-size:11.5px;color:var(--ink-3)">悬赏金额</span></div>
      <div class="tag-row" style="margin-top:12px">
        <span class="tag">${esc(x.type)}</span>
        <span class="tag">${E_STATUS[x.status] || '待接单'}</span>
        ${isBoosted(x) ? `<span class="tag" style="background:#FFF4DF;border-color:#F0DCB2;color:#8A5A12">推流中 · 剩余 ${boostLeft(x)}</span>` : ''}
        ${mine ? '<span class="tag" style="background:var(--sand);border-color:var(--sand-2);color:#5A3F26">我发布的</span>' : ''}
      </div>
      <div class="shop-rows">
        <div class="shop-row"><span class="sr-ico">${icon('pin', 13)}</span><b>取货</b><span class="sr-val">${esc(x.from)}</span></div>
        <div class="shop-row"><span class="sr-ico">${icon('door', 13)}</span><b>送达</b><span class="sr-val">${esc(x.to)}</span></div>
        <div class="shop-row"><span class="sr-ico">${icon('clock', 13)}</span><b>期望</b><span class="sr-val">${esc(x.deadline)}</span></div>
      </div>
      <p class="detail__text">${esc(x.note)}</p>
      <div class="detail__author">
        ${avatarHTML(x.publisher)}
        <div style="flex:1;min-width:0"><b>${esc(x.publisher)}</b><small>${esc(x.time)} · 发布</small></div>
        <span class="sb-tag">${E_STATUS[x.status] || '待接单'}</span>
      </div>
      <div class="detail__h">STATUS · 接单状态</div>
      <div class="shop-rows">
        <div class="shop-row"><span class="sr-ico">${icon('heart', 13)}</span><b>关注人数</b><span class="sr-val">${x.wants} 人</span></div>
        <div class="shop-row"><span class="sr-ico">${icon('box', 13)}</span><b>接单人</b><span class="sr-val">${x.taker ? esc(x.taker) : '还没有人接单'}</span></div>
      </div>
      <div style="height:6px"></div>
    </div>
  </div>
  <div class="detail__bar detail__bar--actions">${foot}</div>`;
}

function bindErrandDetail(el, x) {
  const finishFlow = () => {
    closeDetail();
    setTimeout(() => { if ($('#errandGrid')) refreshErrands(); }, 520);
  };
  const accept = el.querySelector('#acceptBtn');
  if (accept) {
    accept.addEventListener('click', () => {
      x.status = 'taken';
      x.taker = me().nick;
      x.wants += 1;
      addPoints(15, '接下跑腿单', true);
      saveDB();
      finishFlow();
      toast('接单成功，记得按时送到 · 积分 +15');
    });
  }
  const finish = el.querySelector('#finishBtn');
  if (finish) {
    finish.addEventListener('click', () => {
      x.status = 'done';
      addPoints(20, '完成跑腿', true);
      saveDB();
      finishFlow();
      toast('跑腿完成，积分 +20');
    });
  }
  el.querySelector('[data-action="share-errand"]')?.addEventListener('click', async () => {
    const text = `${x.title} · 悬赏 ¥${x.reward} · 来自智慧校园4.0 校园跑腿`;
    try {
      if (navigator.share) { await navigator.share({ title: x.title, text }); return; }
      await navigator.clipboard.writeText(`${text}\n${location.href}`);
      toast('链接已复制');
    } catch (err) { toast('分享已取消'); }
  });
  bindPullClose(el);
}

function openErrand(id, origin) {
  if (detailView) return;
  const x = db.errands.find((v) => v.id === id);
  if (!x) return;
  const photos = x.photos || [];
  const originCover = origin && origin.querySelector ? origin.querySelector('.m-cover, .cover') : null;
  openDetailLayer({
    kind: 'errand',
    id: x.id,
    html: errandDetailHTML(x),
    bg: photos.length ? '#0A1B30' : (ART_BG[x.art] || '#F4EAD9'),
    heroHTML: photos.length ? `<img src="${photos[0]}" alt="" style="width:100%;height:100%;object-fit:cover" />` : art(x.art),
    from: originCover ? originCover.getBoundingClientRect() : null,
    bind: (el) => bindErrandDetail(el, x)
  });
}

function openPublishErrand() {
  const photos = [];
  const body = `
    <form class="form-grid" novalidate>
      <label class="field"><span>需求类型 *</span>
        <select id="erType">${['代取快递', '代取外卖', '代买代送', '代排队', '其他'].map((t) => `<option>${t}</option>`).join('')}</select>
      </label>
      <label class="field"><span>标题 *</span>
        <input id="erTitle" maxlength="40" placeholder="例如：菜鸟驿站两个小件，送到 3 号楼" />
      </label>
      ${photoFieldHTML('erPhotos')}
      <div class="form-2">
        <label class="field"><span>悬赏金额（元）*</span><input id="erReward" type="number" min="0" step="1" placeholder="5" inputmode="numeric" /></label>
        <label class="field"><span>期望送达</span><input id="erDeadline" maxlength="16" placeholder="今天 18:00 前" value="今天 18:00 前" /></label>
      </div>
      <div class="form-2">
        <label class="field"><span>取货地点 *</span><input id="erFrom" maxlength="20" placeholder="南门菜鸟驿站" /></label>
        <label class="field"><span>送达地点 *</span><input id="erTo" maxlength="20" placeholder="3 号楼 502" /></label>
      </div>
      <label class="field"><span>补充说明</span>
        <textarea id="erNote" maxlength="200" placeholder="件数、重量、取件码怎么给你…"></textarea>
      </label>
      <p class="hint">发布后可随时用积分给这条需求推流，让更多顺路的同学看到。</p>
    </form>`;
  const sheet = openSheet({
    title: '发布跑腿需求',
    body,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button>
           <button class="btn btn--primary" id="erSubmit">确认发布</button>`
  });
  bindPhotoField(sheet, 'erPhotos', photos);
  sheet.querySelector('#erSubmit').addEventListener('click', () => {
    const title = sheet.querySelector('#erTitle').value.trim();
    const reward = Number(sheet.querySelector('#erReward').value);
    const from = sheet.querySelector('#erFrom').value.trim();
    const to = sheet.querySelector('#erTo').value.trim();
    if (!title) { toast('先写一句需求标题吧'); return; }
    if (!(reward > 0)) { toast('请填写悬赏金额'); return; }
    if (!from || !to) { toast('取货和送达地点都要填一下'); return; }
    db.errands.unshift({
      id: uid('r'), type: sheet.querySelector('#erType').value,
      title, reward, from, to,
      deadline: sheet.querySelector('#erDeadline').value.trim() || '时间可商量',
      art: 'parcel', photos: photos.slice(),
      note: sheet.querySelector('#erNote').value.trim() || '具体细节可以私聊沟通～',
      publisher: me().nick, time: '刚刚', wants: 0,
      status: 'open', owner: db.session, boostUntil: 0
    });
    state.ecat = '全部';
    state.eq = '';
    addPoints(10, '发布跑腿需求', true);
    saveDB(); closeSheet();
    if (state.page !== 'errands') { state.tab = 'services'; state.page = 'errands'; }
    renderPage();
    toast('发布成功，积分 +10');
  });
}
