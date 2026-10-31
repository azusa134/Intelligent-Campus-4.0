'use strict';

/* ================= 11. 跳蚤市场 ================= */
const M_CATS = ['全部', '教材', '数码', '生活', '出行', '其他'];
const ART_KEYS = ['book', 'laptop', 'bike', 'headphones', 'camera', 'lamp', 'keyboard', 'clothes', 'guitar', 'plant'];

function marketHTML() {
  return `
  <div class="subhead fade-up">
    <button class="icon-btn" data-action="back" aria-label="返回">${icon('back', 17)}</button>
    <h1>跳蚤市场</h1>
    <div class="sub-actions">
      <button class="pts-pill" data-action="open-points" aria-label="积分中心">${icon('coin', 12)}<span class="pts-txt">积分</span><b>${num(myPoints())}</b></button>
      <button class="pill-btn" data-action="publish-item">${icon('plus', 14)} 发布</button>
    </div>
  </div>
  <div class="searchbar">${icon('search', 17)}<input id="marketSearch" placeholder="搜一搜：教材、耳机、自行车…" value="${esc(state.mq)}" /></div>
  <div class="chips" id="mCats">
    ${M_CATS.map((c) => `<button class="chip ${state.mcat === c ? 'is-active' : ''}" data-mcat="${c}">${c === '全部' ? '全部好物' : c}</button>`).join('')}
  </div>
  <div class="boost-bar">
    <span class="bb-ico">${icon('fire', 14)}</span>
    <div class="bb-main"><b>积分推流，曝光翻倍</b><small>BOOST · ${BOOST_TIERS[0].pts} 积分起 · 置顶 ${BOOST_TIERS[0].label}</small></div>
    <button class="btn btn--primary btn--sm" data-action="open-boost" data-kind="item">去推流</button>
  </div>
  <div class="market-meta">
    <span class="count" id="mCount"></span>
    <div class="sorts" id="mSorts">
      ${[['new', '最新'], ['price', '价格'], ['wants', '热门']].map(([k, l]) => `<button class="sort-btn ${state.msort === k ? 'is-active' : ''}" data-msort="${k}">${l}</button>`).join('')}
    </div>
  </div>
  <div class="masonry card-flow" id="marketGrid"></div>
  <div class="foot-note">校内面交 · 建议当面验货后再付款</div>`;
}

function marketList() {
  let list = db.items.slice();
  if (state.mcat !== '全部') list = list.filter((i) => i.cat === state.mcat);
  if (state.mq.trim()) {
    const q = state.mq.trim().toLowerCase();
    list = list.filter((i) => (i.title + i.desc + i.seller + i.cat + i.place).toLowerCase().includes(q));
  }
  const cmp = state.msort === 'price' ? (a, b) => a.price - b.price
    : state.msort === 'wants' ? (a, b) => b.wants - a.wants
      : (a, b) => (isMine(b) ? 1 : 0) - (isMine(a) ? 1 : 0);
  list.sort((a, b) => (isBoosted(b) ? 1 : 0) - (isBoosted(a) ? 1 : 0) || cmp(a, b));
  return list;
}
function refreshMarket() {
  const grid = $('#marketGrid');
  if (!grid) return;
  const list = marketList();
  const count = $('#mCount');
  if (count) count.textContent = `${list.length} 件好物 · 校内面交`;
  $$('#mCats .chip').forEach((b) => b.classList.toggle('is-active', b.dataset.mcat === state.mcat));
  $$('#mSorts .sort-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.msort === state.msort));
  syncPointsPill();
  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="column-span:all">
      <div class="em-ico">🔍</div><b>没有找到相关好物</b><p>换个关键词，或者自己发一件试试</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map((i, idx) => `
    <div class="m-card" role="button" tabindex="0" data-action="open-item" data-id="${i.id}" style="--i:${Math.min(idx, 8)}">
      <div class="m-cover" style="background:${ART_BG[i.art] || '#F2E8D5'}">
        <span class="cond">${esc(i.cat)}${isMine(i) ? ' · MINE' : ''}</span>
        ${boostTag(i)}
        ${coverInner(i)}
      </div>
      <div class="m-body">
        <div class="m-title">${esc(i.title)}</div>
        <div class="m-price"><b><small>¥</small>${num(i.price)}</b><del>¥${num(i.orig)}</del><span class="m-cond">${esc(i.cond)}</span></div>
        <div class="m-foot">
          ${avatarHTML(i.seller)}
          <span class="m-seller">${esc(i.seller)} · ${esc(i.place)}</span>
          <span class="m-want">♡ ${i.wants}</span>
        </div>
      </div>
    </div>`).join('');
}

/* 闲置详情：与校园墙一致的全屏详情 + 封面飞入转场 */
function itemDetailHTML(it) {
  const photos = it.photos || [];
  const mine = isMine(it);
  const wanted = db.wants.includes(it.id);
  return `
  <div class="detail__top">
    <button class="detail__back" data-action="close-detail" aria-label="返回">${icon('back', 18)}</button>
    <button class="detail__share" data-action="share-item" aria-label="分享">${icon('send', 16)}</button>
    <span class="detail__count">${esc(it.cat)} · ${esc(it.cond)}</span>
  </div>
  <div class="detail__scroll">
    <div class="detail__cover" style="background:${photos.length ? '#0A1B30' : (ART_BG[it.art] || '#F2E8D5')}">${photos.length ? `<img class="photo" src="${photos[0]}" alt="实拍照片" />` : art(it.art)}</div>
    <div class="detail__body">
      ${photos.length > 1 ? `<div class="item-thumbs" id="itThumbs" style="margin:0 0 16px">${photos.map((p, i) => `<button type="button" class="${i === 0 ? 'is-on' : ''}" data-thumb="${i}" aria-label="查看第 ${i + 1} 张照片"><img src="${p}" alt="照片 ${i + 1}" /></button>`).join('')}</div>` : ''}
      <div class="detail__topic">在售 · ${esc(it.place)}</div>
      <h1 class="detail__title">${esc(it.title)}</h1>
      <div class="price-row" style="margin-top:12px"><b><small>¥</small>${num(it.price)}</b><del>原价 ¥${num(it.orig)}</del></div>
      <div class="tag-row" style="margin-top:12px">
        <span class="tag">${esc(it.cat)}</span>
        <span class="tag">${esc(it.cond)}</span>
        <span class="tag">校内面交</span>
        ${isBoosted(it) ? `<span class="tag" style="background:#FFF4DF;border-color:#F0DCB2;color:#8A5A12">推流中 · 剩余 ${boostLeft(it)}</span>` : ''}
        ${mine ? '<span class="tag" style="background:var(--sand);border-color:var(--sand-2);color:#5A3F26">我发布的</span>' : ''}
      </div>
      <p class="detail__text">${esc(it.desc)}</p>
      <div class="detail__author">
        ${avatarHTML(it.seller)}
        <div style="flex:1;min-width:0"><b>${esc(it.seller)}</b><small>${esc(it.place)} · ${esc(it.time)}</small></div>
        <span class="sb-tag">学生认证</span>
      </div>
      <div class="detail__h">INFO · 交易信息</div>
      <div class="shop-rows">
        <div class="shop-row"><span class="sr-ico">${icon('bag', 13)}</span><b>成色</b><span class="sr-val">${esc(it.cond)}</span></div>
        <div class="shop-row"><span class="sr-ico">${icon('pin', 13)}</span><b>面交地点</b><span class="sr-val">${esc(it.place)}</span></div>
        <div class="shop-row"><span class="sr-ico">${icon('heart', 13)}</span><b>想要人数</b><span class="sr-val" id="wantNum">${it.wants} 人</span></div>
      </div>
      <div style="height:6px"></div>
    </div>
  </div>
  <div class="detail__bar detail__bar--actions">
    ${mine
      ? `<button class="btn btn--ghost" data-action="boost-target" data-kind="item" data-id="${it.id}">${icon('fire', 14)} ${isBoosted(it) ? '续推' : '积分推流'}</button>
         <button class="btn btn--primary" id="soldBtn">标记已售出</button>`
      : `<button class="btn btn--ghost" data-action="chat">${icon('send', 14)} 聊一聊</button>
         <button class="btn btn--primary${wanted ? ' btn--lime' : ''}" id="wantBtn">${wanted ? '已加入想要' : '我想要'}</button>`}
  </div>`;
}

function bindItemDetail(el, it) {
  const thumbs = el.querySelector('#itThumbs');
  if (thumbs) {
    thumbs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-thumb]');
      if (!b) return;
      const img = el.querySelector('.detail__cover img');
      if (img) img.src = (it.photos || [])[Number(b.dataset.thumb)];
      $$('#itThumbs button', el).forEach((x) => x.classList.toggle('is-on', x === b));
    });
  }

  const want = el.querySelector('#wantBtn');
  if (want) {
    let wanted = db.wants.includes(it.id);
    want.addEventListener('click', () => {
      if (wanted) {
        db.wants = db.wants.filter((x) => x !== it.id);
        it.wants = Math.max(0, it.wants - 1);
        wanted = false;
        want.textContent = '我想要';
        want.classList.remove('btn--lime');
        toast('已取消想要');
      } else {
        db.wants.push(it.id);
        it.wants += 1;
        wanted = true;
        want.textContent = '已加入想要';
        want.classList.add('btn--lime');
        toast('已加入想要，卖家会收到通知');
      }
      const numEl = el.querySelector('#wantNum');
      if (numEl) numEl.textContent = `${it.wants} 人`;
      const cardWant = document.querySelector(`[data-action="open-item"][data-id="${it.id}"] .m-want`);
      if (cardWant) cardWant.textContent = `♡ ${it.wants}`;
      saveDB();
    });
  }

  const soldBtn = el.querySelector('#soldBtn');
  if (soldBtn) {
    let soldConfirm = false;
    soldBtn.addEventListener('click', () => {
      if (!soldConfirm) {
        soldConfirm = true;
        soldBtn.textContent = '再点一次确认';
        soldBtn.style.background = '#FDECE8';
        return;
      }
      db.items = db.items.filter((x) => x.id !== it.id);
      db.wants = db.wants.filter((x) => x !== it.id);
      addPoints(20, `完成交易：${it.title.slice(0, 12)}`, true);
      saveDB();
      closeDetail();
      setTimeout(() => { if ($('#marketGrid')) refreshMarket(); }, 520);
      toast('交易完成，积分 +20');
    });
  }

  el.querySelector('[data-action="chat"]')?.addEventListener('click', () => {
    toast(`已向 ${it.seller} 发起聊天（演示）`);
  });
  el.querySelector('[data-action="share-item"]')?.addEventListener('click', async () => {
    const text = `${it.title} · ¥${it.price} · 来自智慧校园4.0 跳蚤市场`;
    try {
      if (navigator.share) { await navigator.share({ title: it.title, text }); return; }
      await navigator.clipboard.writeText(`${text}\n${location.href}`);
      toast('链接已复制');
    } catch (err) { toast('分享已取消'); }
  });
  bindPullClose(el);
}

function openItem(id, origin) {
  if (detailView) return;
  const it = db.items.find((x) => x.id === id);
  if (!it) return;
  const photos = it.photos || [];
  const originCover = origin && origin.querySelector ? origin.querySelector('.m-cover, .cover') : null;
  openDetailLayer({
    kind: 'item',
    id: it.id,
    html: itemDetailHTML(it),
    bg: photos.length ? '#0A1B30' : (ART_BG[it.art] || '#F2E8D5'),
    heroHTML: photos.length ? `<img src="${photos[0]}" alt="" style="width:100%;height:100%;object-fit:cover" />` : art(it.art),
    from: originCover ? originCover.getBoundingClientRect() : null,
    bind: (el) => bindItemDetail(el, it)
  });
}

function openPublishItem() {
  let pick = 'book';
  const photos = [];
  const body = `
    <form id="itemForm" class="form-grid" novalidate>
      <label class="field"><span>宝贝标题 *</span>
        <input id="itTitle" maxlength="40" placeholder="例如：九成新 iPad Air 4，送保护壳" />
      </label>
      ${photoFieldHTML('itPhotos')}
      <div class="form-2">
        <label class="field"><span>售价（元）*</span><input id="itPrice" type="number" min="0" step="1" placeholder="0" inputmode="numeric" /></label>
        <label class="field"><span>原价（元）</span><input id="itOrig" type="number" min="0" step="1" placeholder="选填" inputmode="numeric" /></label>
      </div>
      <div class="form-2">
        <label class="field"><span>分类</span>
          <select id="itCat">${['教材', '数码', '生活', '出行', '其他'].map((c) => `<option>${c}</option>`).join('')}</select>
        </label>
        <label class="field"><span>成色</span>
          <select id="itCond">${['全新', '九五新', '九成新', '八成新', '七成新'].map((c) => `<option>${c}</option>`).join('')}</select>
        </label>
      </div>
      <div class="field">
        <span>没有实拍图时使用封面图案</span>
        <div class="art-row" id="itArt">${ART_KEYS.map((a, i) => `<button type="button" class="art-opt ${i === 0 ? 'is-active' : ''}" data-art="${a}" style="background:${ART_BG[a]}">${art(a)}</button>`).join('')}</div>
      </div>
      <label class="field"><span>宝贝描述</span>
        <textarea id="itDesc" maxlength="300" placeholder="成色、入手时间、配件、交易地点…"></textarea>
      </label>
      <label class="field"><span>交易地点</span>
        <input id="itPlace" maxlength="20" placeholder="例如：3 号宿舍楼下" value="图书馆门口" />
      </label>
    </form>`;
  const sheet = openSheet({
    title: '发布闲置',
    body,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button>
           <button class="btn btn--primary" id="itSubmit">确认发布</button>`
  });
  bindPhotoField(sheet, 'itPhotos', photos);
  sheet.querySelector('#itArt').addEventListener('click', (e) => {
    const b = e.target.closest('[data-art]');
    if (!b) return;
    pick = b.dataset.art;
    $$('#itArt .art-opt').forEach((x) => x.classList.toggle('is-active', x === b));
  });
  sheet.querySelector('#itSubmit').addEventListener('click', () => {
    const title = sheet.querySelector('#itTitle').value.trim();
    const price = Number(sheet.querySelector('#itPrice').value);
    if (!title) { toast('给宝贝起个标题吧'); return; }
    if (!(price >= 0) || !sheet.querySelector('#itPrice').value) { toast('请填写一个合理的售价'); return; }
    const orig = Number(sheet.querySelector('#itOrig').value) || Math.max(price, Math.round(price * 1.8));
    db.items.unshift({
      id: uid('i'), title, price, orig,
      cat: sheet.querySelector('#itCat').value,
      cond: sheet.querySelector('#itCond').value,
      art: pick,
      photos: photos.slice(),
      seller: me().nick,
      place: sheet.querySelector('#itPlace').value.trim() || '校内面交',
      wants: 0, time: '刚刚', mine: true, owner: db.session,
      desc: sheet.querySelector('#itDesc').value.trim() || '暂时没有更多描述，可以私聊我问细节～'
    });
    state.mcat = '全部';
    state.mq = '';
    addPoints(10, '发布闲置', true);
    saveDB(); closeSheet();
    if (state.page !== 'market') { state.tab = 'services'; state.page = 'market'; }
    renderPage();
    toast('发布成功，积分 +10');
  });
}
