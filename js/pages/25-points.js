'use strict';

/* ================= 11.7 积分中心 / 推流 ================= */
function openPoints() {
  const u = me();
  const body = `
    <div class="pts-hero">
      <span class="ph-k">MY POINTS · 我的积分</span>
      <div class="ph-n">${num(u.points || 0)}<small>积分</small></div>
      <p class="ph-t">积分可用于闲置与跑腿的推流曝光，让内容在列表里排得更前。</p>
    </div>

    <div class="section__head" style="margin:16px 0 6px"><h2 style="font-size:13px">推流档位<span>BOOST</span></h2></div>
    <div class="tier-list">
      ${BOOST_TIERS.map((t) => `<div class="tier" style="cursor:default">
        <span class="t-pts">${t.pts}</span>
        <span class="t-main"><b>推流 ${t.label}</b><small>${t.desc}</small></span>
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin:10px 0 2px">
      <button class="btn btn--primary btn--sm" style="flex:1" data-action="open-boost" data-kind="item">给闲置推流</button>
      <button class="btn btn--ghost btn--sm" style="flex:1" data-action="open-boost" data-kind="errand">给跑腿推流</button>
    </div>

    <div class="section__head" style="margin:18px 0 2px"><h2 style="font-size:13px">怎么赚积分<span>EARN</span></h2></div>
    ${POINT_RULES.map((r) => `<div class="rule-row">
      <span class="r-ico">${icon(r.i, 13)}</span>
      <span class="r-main"><b>${r.label}</b><small>${r.note}</small></span>
      <span class="r-pts">+${r.pts}</span>
    </div>`).join('')}
    <button class="btn btn--ghost btn--block" style="margin-top:11px;height:40px;font-size:12.5px" data-action="invite-friend">${icon('send', 14)} 邀请新同学，双方各得 ${POINT_RULES.find((r) => r.k === 'invite').pts} 积分</button>

    <div class="section__head" style="margin:18px 0 2px"><h2 style="font-size:13px">积分明细<span>LOG</span></h2></div>
    ${(u.pointLog || []).length ? u.pointLog.slice(0, 10).map((l) => `<div class="log-row"><span class="l-t">${esc(l.r)}</span><span style="font-family:var(--mono);font-size:8px;color:var(--ink-3)">${esc(l.t)}</span><span class="l-d ${l.d > 0 ? 'up' : 'down'}">${l.d > 0 ? '+' : ''}${l.d}</span></div>`).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:8px 0">还没有积分记录</p>'}
    <p class="sheet-note">积分与推流为演示机制，不涉及真实支付，「邀请」按钮会直接模拟一次邀请奖励。</p>`;
  openSheet({ title: '积分中心', body, foot: `<button class="btn btn--primary" data-action="close-sheet">知道了</button>` });
}

function openBoostHub(kind) {
  const list = kind === 'errand' ? db.errands.filter(isMine) : db.items.filter(isMine);
  const body = `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:7px;background:#FBFDFF;margin-bottom:12px">
      <span style="flex:1;font-size:11.5px;color:var(--ink-2)">当前可用积分</span>
      <b style="font-family:var(--serif);font-size:19px;color:var(--brand)">${num(myPoints())}</b>
      <button class="btn btn--ghost btn--sm" data-action="open-points">积分中心</button>
    </div>
    ${list.length ? list.map((x) => `<div class="prow" style="padding:10px 0;border-bottom:1px solid var(--line-2)">
      <span style="flex:none">${recThumb(x)}</span>
      <span class="prow__main"><b>${esc(x.title)}</b><small>${isBoosted(x) ? `推流中 · 剩余 ${boostLeft(x)}` : (kind === 'errand' ? `悬赏 ¥${num(x.reward)}` : `售价 ¥${num(x.price)}`)}</small></span>
      <button class="btn btn--primary btn--sm" data-action="boost-target" data-kind="${kind}" data-id="${x.id}">${isBoosted(x) ? '续推' : '推流'}</button>
    </div>`).join('') : `<div class="empty" style="padding:26px 10px"><div class="em-ico">🔥</div><b>还没有可推流的内容</b><p>先发布一条${kind === 'errand' ? '跑腿需求' : '闲置'}吧</p></div>`}
    <p class="sheet-note">推流会把内容置顶到列表最前，并显示「推流中」标识；同一内容续推会顺延时长。</p>`;
  openSheet({
    title: kind === 'errand' ? '给跑腿推流' : '给闲置推流',
    body,
    foot: `<button class="btn btn--primary" data-action="close-sheet">完成</button>`
  });
}

function openBoostSheet(kind, id) {
  const list = kind === 'errand' ? db.errands : db.items;
  const x = list.find((v) => v.id === id);
  if (!x) return;
  let pick = 0;
  const body = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      ${recThumb(x, '38px')}
      <div style="flex:1;min-width:0">
        <b style="display:block;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.title)}</b>
        <small style="font-family:var(--mono);font-size:8.5px;color:var(--ink-3)">${isBoosted(x) ? `推流中 · 剩余 ${boostLeft(x)}` : '当前未推流'}</small>
      </div>
    </div>
    <div class="tier-list" id="boostTiers">
      ${BOOST_TIERS.map((t, i) => `<button class="tier ${i === 0 ? 'is-active' : ''}" data-tier="${i}" type="button">
        <span class="t-pts">${t.pts}</span>
        <span class="t-main"><b>${t.label}曝光</b><small>${t.desc}</small></span>
        <span class="t-ck">${icon('check', 11)}</span>
      </button>`).join('')}
    </div>
    <p class="hint" id="boostCost"></p>`;
  const sheet = openSheet({
    title: '积分推流',
    body,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button><button class="btn btn--primary" id="boostOk">确认推流</button>`
  });
  const cost = sheet.querySelector('#boostCost');
  const upd = () => {
    const t = BOOST_TIERS[pick];
    const rest = myPoints() - t.pts;
    cost.textContent = rest >= 0
      ? `将消耗 ${t.pts} 积分，剩余 ${rest} 积分 · ${t.label}内置顶展示`
      : `还差 ${-rest} 积分，完成交易或发帖可以继续赚积分`;
  };
  upd();
  sheet.querySelector('#boostTiers').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tier]');
    if (!b) return;
    pick = Number(b.dataset.tier);
    $$('#boostTiers .tier').forEach((n, i) => n.classList.toggle('is-active', i === pick));
    upd();
  });
  sheet.querySelector('#boostOk').addEventListener('click', () => {
    const t = BOOST_TIERS[pick];
    if (myPoints() < t.pts) { toast('积分不足，先去做几个任务吧'); return; }
    addPoints(-t.pts, `推流 ${t.label}`, true);
    const base = isBoosted(x) ? x.boostUntil : Date.now();
    x.boostUntil = base + t.h * 3600e3;
    saveDB();
    const hadDetail = !!detailView;
    const refreshGrid = () => {
      if ($('#errandGrid')) refreshErrands();
      else if ($('#marketGrid')) refreshMarket();
      syncPointsPill();
    };
    closeSheet();
    if (hadDetail) {
      setTimeout(() => { closeDetail(); setTimeout(refreshGrid, 480); }, 300);
    } else {
      refreshGrid();
    }
    toast(`推流成功，${t.label}内置顶展示`);
  });
}
