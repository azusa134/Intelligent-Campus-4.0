'use strict';

/* ================= 11.6 附近好店 ================= */
const S_CATS = ['全部', '餐饮', '书店', '打印', '健身', '理发', '超市'];

function shopsHTML() {
  return `
  <div class="subhead fade-up">
    <button class="icon-btn" data-action="back" aria-label="返回">${icon('back', 17)}</button>
    <h1>附近好店</h1>
    <div class="sub-actions">
      <button class="pill-btn" data-action="publish-shop">${icon('store', 14)} 商家入驻</button>
    </div>
  </div>
  <div class="chips" id="sCats">
    ${S_CATS.map((c) => `<button class="chip ${state.scat === c ? 'is-active' : ''}" data-scat="${c}">${c === '全部' ? '全部店铺' : c}</button>`).join('')}
  </div>
  <div class="market-meta">
    <span class="count" id="sCount"></span>
    <span style="font-family:var(--mono);font-size:8.5px;color:var(--ink-3)">凭校园卡可享学生价</span>
  </div>
  <div class="masonry card-flow" id="shopGrid"></div>
  <div class="foot-note">店铺信息由商家自行维护 · 演示数据</div>`;
}

function shopList() {
  return state.scat === '全部' ? db.shops.slice() : db.shops.filter((s) => s.cat === state.scat);
}

function refreshShops() {
  const grid = $('#shopGrid');
  if (!grid) return;
  const list = shopList();
  const c = $('#sCount');
  if (c) c.textContent = `${list.length} 家店 · 校园周边`;
  $$('#sCats .chip').forEach((b) => b.classList.toggle('is-active', b.dataset.scat === state.scat));
  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="column-span:all"><div class="em-ico">🏪</div><b>这个分类还没有店铺</b><p>欢迎商家入驻，把好店带给同学</p></div>`;
    return;
  }
  grid.innerHTML = list.map((s, idx) => `
    <div class="m-card" role="button" tabindex="0" data-action="open-shop" data-id="${s.id}" style="--i:${Math.min(idx, 8)}">
      <div class="m-cover" style="background:${ART_BG[s.art] || '#E7EEF7'};aspect-ratio:4/3">
        <span class="cond">${esc(s.cat)}</span>
        <span class="s-rate">★ ${Number(s.rate || 0).toFixed(1)}</span>
        ${art(s.art)}
      </div>
      <div class="m-body">
        <div class="m-title">${esc(s.name)}</div>
        <div class="s-meta">
          <span>${icon('pin', 9)}${esc(s.addr)}</span>
          <span>${icon('clock', 9)}${esc(s.hours)}</span>
          <span>${icon('phone', 9)}${esc(s.phone)}</span>
        </div>
        ${s.promo && s.promo[0] ? `<span class="s-promo">${esc(s.promo[0].t)}</span>` : ''}
      </div>
    </div>`).join('');
}

function shopDetailHTML(s) {
  return `
  <div class="detail__top">
    <button class="detail__back" data-action="close-detail" aria-label="返回">${icon('back', 18)}</button>
    <button class="detail__share" data-action="share-shop" aria-label="分享">${icon('send', 16)}</button>
    <span class="detail__count">${esc(s.cat)} · ${s.rate ? `★ ${Number(s.rate).toFixed(1)}` : '新店'}</span>
  </div>
  <div class="detail__scroll">
    <div class="detail__cover" style="background:${ART_BG[s.art] || '#E7EEF7'}">${art(s.art)}</div>
    <div class="detail__body">
      <div class="detail__topic">附近好店 · ${esc(s.badge || '校园周边')}</div>
      <h1 class="detail__title">${esc(s.name)}</h1>
      <div class="tag-row" style="margin-top:12px">
        <span class="tag">${esc(s.cat)}</span>
        <span class="tag">营业中</span>
        ${s.promo && s.promo.length ? `<span class="tag" style="background:#FDEFE6;border-color:#F7DDCC;color:#B4471F">${s.promo.length} 个促销</span>` : ''}
      </div>
      <p class="detail__text">${esc(s.intro)}</p>
      <div class="shop-rows">
        <div class="shop-row"><span class="sr-ico">${icon('pin', 13)}</span><b>地址</b><span class="sr-val">${esc(s.addr)}</span></div>
        <div class="shop-row"><span class="sr-ico">${icon('clock', 13)}</span><b>营业时间</b><span class="sr-val">${esc(s.hours)}</span></div>
        <a class="shop-row" href="tel:${esc((s.phone || '').replace(/\s/g, ''))}"><span class="sr-ico">${icon('phone', 13)}</span><b>联系电话</b><span class="sr-val" style="color:var(--brand-3)">${esc(s.phone)}</span></a>
      </div>
      <div class="detail__h">PROMOTION · 促销活动</div>
      ${(s.promo || []).map((p) => `<div class="promo-item"><b>${esc(p.t)}</b><p>${esc(p.d)}</p><span class="until">${esc(p.until)}</span></div>`).join('') || '<p style="font-size:12px;color:var(--ink-3)">暂无促销活动</p>'}
      <div class="detail__h">FEED · 店铺动态</div>
      ${(s.feed || []).map((f) => `<div class="feed-item">
        <span class="f-ico" style="background:${ART_BG[f.art] || '#F2E8D5'}">${art(f.art || 'store', '40px')}</span>
        <div style="flex:1;min-width:0"><b>${esc(f.title)}</b><p>${esc(f.text)}</p><small>${esc(f.time)}</small></div>
      </div>`).join('') || '<p style="font-size:12px;color:var(--ink-3);padding-bottom:10px">店铺还没有发布动态</p>'}
      <div class="detail__author" style="margin-top:18px">
        <span class="src-thumb" style="background:${ART_BG[s.art] || '#E7EEF7'}">${art(s.art, '36px')}</span>
        <div style="flex:1;min-width:0"><b>${esc(s.name)}</b><small>商家入驻 · 信息由商家维护</small></div>
      </div>
    </div>
  </div>
  <div class="detail__bar detail__bar--actions">
    <a class="btn btn--ghost btn--sm" href="tel:${esc((s.phone || '').replace(/\s/g, ''))}">${icon('phone', 14)} 拨打电话</a>
    <button class="btn btn--primary btn--sm" data-action="shop-nav">${icon('pin', 14)} 到这去</button>
  </div>`;
}

function bindShopDetail(el, s) {
  el.querySelector('[data-action="shop-nav"]')?.addEventListener('click', () => {
    toast(`已为你规划到「${s.name}」的步行路线（演示）`);
  });
  el.querySelector('[data-action="share-shop"]')?.addEventListener('click', async () => {
    const text = `${s.name} · ${s.addr} · 来自智慧校园4.0 附近好店`;
    try {
      if (navigator.share) { await navigator.share({ title: s.name, text }); return; }
      await navigator.clipboard.writeText(`${text}\n${location.href}`);
      toast('链接已复制');
    } catch (err) { toast('分享已取消'); }
  });
  // 下拉关闭，与校园墙详情一致
  bindPullClose(el);
}

function openShop(id, origin) {
  if (detailView) return;
  const s = db.shops.find((x) => x.id === id);
  if (!s) return;
  const originCover = origin && origin.querySelector ? origin.querySelector('.m-cover, .cover') : null;
  openDetailLayer({
    kind: 'shop',
    id: s.id,
    html: shopDetailHTML(s),
    bg: ART_BG[s.art] || '#E7EEF7',
    heroHTML: art(s.art),
    from: originCover ? originCover.getBoundingClientRect() : null,
    bind: (el) => bindShopDetail(el, s)
  });
}

function openShopForm() {
  const body = `
    <form class="form-grid" novalidate>
      <label class="field"><span>店铺名称 *</span><input id="shName" maxlength="24" placeholder="例如：山丘咖啡" /></label>
      <div class="form-2">
        <label class="field"><span>店铺分类</span>
          <select id="shCat">${S_CATS.slice(1).map((c) => `<option>${c}</option>`).join('')}</select>
        </label>
        <label class="field"><span>联系电话 *</span><input id="shPhone" maxlength="20" placeholder="020-8888 0000" /></label>
      </div>
      <label class="field"><span>店铺地址 *</span><input id="shAddr" maxlength="30" placeholder="东门文创街 12 号" /></label>
      <label class="field"><span>营业时间 *</span><input id="shHours" maxlength="20" placeholder="08:00 – 22:00" value="09:00 – 21:00" /></label>
      <label class="field"><span>店铺简介</span><textarea id="shIntro" maxlength="200" placeholder="主营什么、有什么特色、适不适合自习…"></textarea></label>
      <label class="field"><span>首个促销活动</span><input id="shPromo" maxlength="30" placeholder="例如：凭校园卡满 20 减 5" /></label>
      <p class="hint">提交后店铺会立即出现在「附近好店」，同学可以直接看到地址、营业时间与电话。</p>
    </form>`;
  const sheet = openSheet({
    title: '商家入驻',
    body,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button>
           <button class="btn btn--primary" id="shSubmit">提交入驻</button>`
  });
  sheet.querySelector('#shSubmit').addEventListener('click', () => {
    const name = sheet.querySelector('#shName').value.trim();
    const addr = sheet.querySelector('#shAddr').value.trim();
    const hours = sheet.querySelector('#shHours').value.trim();
    const phone = sheet.querySelector('#shPhone').value.trim();
    if (!name) { toast('请填写店铺名称'); return; }
    if (!addr || !hours || !phone) { toast('地址、营业时间和电话都要填一下'); return; }
    const promo = sheet.querySelector('#shPromo').value.trim();
    const cat = sheet.querySelector('#shCat').value;
    const artMap = { 餐饮: 'cup', 书店: 'book', 打印: 'printer', 健身: 'ball', 理发: 'salon', 超市: 'store' };
    db.shops.unshift({
      id: uid('s'), name, cat, addr, hours, phone,
      rate: 4.6, art: artMap[cat] || 'store', badge: '新入驻',
      intro: sheet.querySelector('#shIntro').value.trim() || '刚入驻智慧校园4.0，欢迎同学们来逛逛。',
      promo: promo ? [{ t: promo, d: '凭校园卡到店出示即可', until: '长期有效' }] : [],
      feed: [{ title: '店铺已入驻', text: `${name} 已在附近好店上线，欢迎同学们到店。`, time: '刚刚', art: artMap[cat] || 'store' }]
    });
    state.scat = '全部';
    saveDB(); closeSheet();
    if (state.page !== 'shops') { state.tab = 'services'; state.page = 'shops'; }
    renderPage();
    toast('入驻成功，店铺已上线');
  });
}
