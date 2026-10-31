'use strict';

/* ================= 14. 个人中心 ================= */
function profileHTML() {
  const u = me();
  const myItems = db.items.filter(isMine);
  const myPosts = db.posts.filter(isMine);
  const myErrands = db.errands.filter(isMine);
  const myTakes = db.errands.filter((x) => x.taker && x.taker === u.nick && !isMine(x));
  const weekCount = db.courses.reduce((n, c) => n + c.len, 0);
  return `
  <div class="profile-wrap">
  <div class="profile-hero fade-up">
    <div class="profile-hero__top">
      ${avatarHTML(u.nick, 'avatar--lg')}
      <div class="profile-id">
        <h1>${esc(u.nick)}</h1>
        <p>${esc(u.college)}</p>
      </div>
      <button class="profile-edit" data-action="edit-profile">编辑资料</button>
    </div>
    <p class="profile-bio">${esc(u.bio || '这个人很懒，还没有写简介')}</p>
    <div class="profile-stats">
      <div class="pstat"><b>${myItems.length + myPosts.length + myErrands.length}</b><span>我的发布</span></div>
      <div class="pstat"><b>${num(u.points || 0)}</b><span>积分</span></div>
      <div class="pstat"><b>${db.collects.length}</b><span>收藏</span></div>
    </div>
  </div>

  <div class="course-summary">
    <div class="cs-num">${weekCount}<small>节</small></div>
    <div class="cs-txt">
      <b>本周课表已安排 ${db.courses.length} 门课</b>
      <small>点击课表空白格即可添加，支持一键导入</small>
    </div>
    <button class="btn btn--primary btn--sm" data-action="manage-course">管理</button>
  </div>

  <div class="profile-section">
    <button class="prow" data-action="open-points">
      <span class="quick-ico q-amber">${icon('coin', 17)}</span>
      <span class="prow__main"><b>积分账户</b><small>${num(u.points || 0)} 积分 · 可兑换推流曝光</small></span>
      ${icon('chev', 16, 'class="chev"')}
    </button>
    <button class="prow" data-action="my-posts">
      <span class="quick-ico q-amber">${icon('bag', 17)}</span>
      <span class="prow__main"><b>我的发布</b><small>闲置 ${myItems.length} 件 · 跑腿 ${myErrands.length} 单 · 动态 ${myPosts.length} 条</small></span>
      ${icon('chev', 16, 'class="chev"')}
    </button>
    <button class="prow" data-action="my-errands">
      <span class="quick-ico" style="background:#FBF0DC;color:#8A5A12">${icon('box', 17)}</span>
      <span class="prow__main"><b>我的跑腿</b><small>发布 ${myErrands.length} 单 · 我接的 ${myTakes.length} 单</small></span>
      ${icon('chev', 16, 'class="chev"')}
    </button>
    <button class="prow" data-action="favorites">
      <span class="quick-ico q-coral">${icon('heart', 17)}</span>
      <span class="prow__main"><b>我的收藏</b><small>想要 ${db.wants.length} 件 · 收藏 ${db.collects.length} 条</small></span>
      ${icon('chev', 16, 'class="chev"')}
    </button>
    <button class="prow" data-action="toggle-notify">
      <span class="quick-ico q-green">${icon('bell', 17)}</span>
      <span class="prow__main"><b>上课提醒</b><small>课前 15 分钟提醒我</small></span>
      <span class="switch ${db.notify ? 'is-on' : ''}" id="notifySwitch"></span>
    </button>
    <button class="prow" data-action="open-ai">
      <span class="quick-ico q-blue">${icon('spark', 17)}</span>
      <span class="prow__main"><b>小轻 AI 助手</b><small>查奖学金、入党材料、课表</small></span>
      ${icon('chev', 16, 'class="chev"')}
    </button>
  </div>

  <div class="profile-section">
    <button class="prow" data-action="about">
      <span class="quick-ico q-green">${icon('grid', 17)}</span>
      <span class="prow__main"><b>关于智慧校园4.0</b><small>v4.0 · 智慧校园服务原型</small></span>
      ${icon('chev', 16, 'class="chev"')}
    </button>
    <button class="prow" data-action="reset-demo">
      <span class="quick-ico" style="background:#F2F1EC">${icon('trash', 17)}</span>
      <span class="prow__main"><b>清除演示数据</b><small>恢复初始课表与内容</small></span>
      ${icon('chev', 16, 'class="chev"')}
    </button>
  </div>

  <div class="logout-wrap">
    <button class="btn btn--danger btn--block" data-action="logout">${icon('logout', 17)} 退出登录</button>
  </div>
  <div class="foot-note">智慧校园4.0 · 数据保存在本机浏览器</div>
  </div>`;
}

function openEditProfile() {
  const u = me();
  const body = `
    <form class="form-grid" novalidate>
      <label class="field"><span>昵称</span><input id="pfNick" maxlength="12" value="${esc(u.nick)}" /></label>
      <label class="field"><span>学院 / 专业</span><input id="pfCollege" maxlength="24" value="${esc(u.college)}" /></label>
      <label class="field"><span>学号</span><input id="pfSid" maxlength="16" value="${esc(u.sid || '')}" placeholder="选填" /></label>
      <label class="field"><span>个人签名</span><textarea id="pfBio" maxlength="50" style="min-height:80px">${esc(u.bio || '')}</textarea></label>
      <p class="hint">昵称会显示在二手市场和校园墙的发布内容里。</p>
    </form>`;
  const sheet = openSheet({
    title: '编辑资料',
    body,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button>
           <button class="btn btn--primary" id="pfSave">保存</button>`
  });
  sheet.querySelector('#pfSave').addEventListener('click', () => {
    const nick = sheet.querySelector('#pfNick').value.trim();
    if (!nick) { toast('昵称不能为空'); return; }
    u.nick = nick;
    u.college = sheet.querySelector('#pfCollege').value.trim() || '未填写学院';
    u.sid = sheet.querySelector('#pfSid').value.trim();
    u.bio = sheet.querySelector('#pfBio').value.trim();
    saveDB(); closeSheet(); renderPage();
    toast('资料已更新');
  });
}

function openMyPosts() {
  const items = db.items.filter(isMine);
  const posts = db.posts.filter(isMine);
  const errands = db.errands.filter(isMine);
  const body = `
    <div class="section__head" style="margin-bottom:8px"><h2 style="font-size:14px">跑腿需求<span>${errands.length}</span></h2></div>
    ${errands.length ? errands.map((x) => `
      <div class="prow" role="button" tabindex="0" data-action="open-errand" data-id="${x.id}" style="padding:10px 0">
        ${recThumb(x, '40px')}
        <span class="prow__main"><b>${esc(x.title)}</b><small>悬赏 ¥${num(x.reward)} · ${E_STATUS[x.status] || '待接单'}${isBoosted(x) ? ` · 推流剩余 ${boostLeft(x)}` : ''}</small></span>
        ${icon('chev', 15, 'class="chev"')}
      </div>`).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:8px 0 14px">还没有发布过跑腿需求</p>'}
    <div class="section__head" style="margin:18px 0 8px"><h2 style="font-size:14px">闲置好物<span>${items.length}</span></h2></div>
    ${items.length ? items.map((i) => `
      <div class="prow" role="button" tabindex="0" data-action="open-item" data-id="${i.id}" style="padding:10px 0">
        ${recThumb(i, '40px')}
        <span class="prow__main"><b>${esc(i.title)}</b><small>¥${num(i.price)} · ${i.wants} 人想要${isBoosted(i) ? ` · 推流剩余 ${boostLeft(i)}` : ''}</small></span>
        ${icon('chev', 15, 'class="chev"')}
      </div>`).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:8px 0 14px">还没有发布过闲置</p>'}
    <div class="section__head" style="margin:18px 0 8px"><h2 style="font-size:14px">校园动态<span>${posts.length}</span></h2></div>
    ${posts.length ? posts.map((p) => `
      <div class="prow" role="button" tabindex="0" data-action="open-post" data-id="${p.id}" style="padding:10px 0">
        <span style="width:44px;height:44px;border-radius:7px;background:${ART_BG[p.art]};display:grid;place-items:center;flex:none;overflow:hidden">${art(p.art, '40px')}</span>
        <span class="prow__main"><b>${esc(p.title)}</b><small>#${esc(p.topic)} · ${p.likes} 赞 · ${p.comments.length} 评论</small></span>
        ${icon('chev', 15, 'class="chev"')}
      </div>`).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:8px 0 14px">还没有发过动态，去校园墙说点什么吧</p>'}`;
  openSheet({ title: '我的发布', body, foot: `<button class="btn btn--primary" data-action="close-sheet">关闭</button>` });
}

function openMyErrands() {
  const mine = db.errands.filter(isMine);
  const takes = db.errands.filter((x) => x.taker && x.taker === me().nick && !isMine(x));
  const row = (x) => `<div class="prow" role="button" tabindex="0" data-action="open-errand" data-id="${x.id}" style="padding:10px 0">
      ${recThumb(x, '40px')}
      <span class="prow__main"><b>${esc(x.title)}</b><small>${esc(x.from)} → ${esc(x.to)} · ¥${num(x.reward)} · ${E_STATUS[x.status] || '待接单'}</small></span>
      ${icon('chev', 15, 'class="chev"')}
    </div>`;
  const body = `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:7px;background:#FBFDFF;margin-bottom:14px">
      <span style="flex:1;font-size:11.5px;color:var(--ink-2)">我的积分</span>
      <b style="font-family:var(--serif);font-size:18px;color:var(--brand)">${num(myPoints())}</b>
      <button class="btn btn--ghost btn--sm" data-action="open-points">积分中心</button>
    </div>
    <div class="section__head" style="margin-bottom:8px"><h2 style="font-size:14px">我发布的<span>${mine.length}</span></h2></div>
    ${mine.length ? mine.map(row).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:8px 0 14px">还没有发布过跑腿需求</p>'}
    <div class="section__head" style="margin:18px 0 8px"><h2 style="font-size:14px">我接的单<span>${takes.length}</span></h2></div>
    ${takes.length ? takes.map(row).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:8px 0 14px">去校园跑腿看看有没有顺路的单</p>'}`;
  openSheet({ title: '我的跑腿', body, foot: `<button class="btn btn--primary" data-action="close-sheet">关闭</button>` });
}

function openFavorites() {
  const posts = db.posts.filter((p) => db.collects.includes(p.id));
  const items = db.items.filter((i) => db.wants.includes(i.id));
  const body = `
    <div class="section__head" style="margin-bottom:8px"><h2 style="font-size:14px">我想要的<span>${items.length}</span></h2></div>
    ${items.length ? items.map((i) => `
      <div class="prow" role="button" tabindex="0" data-action="open-item" data-id="${i.id}" style="padding:10px 0">
        ${recThumb(i, '40px')}
        <span class="prow__main"><b>${esc(i.title)}</b><small>¥${num(i.price)} · ${esc(i.seller)}</small></span>
        ${icon('chev', 15, 'class="chev"')}
      </div>`).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:8px 0 14px">看到喜欢的好物，点「我想要」就会出现在这里</p>'}
    <div class="section__head" style="margin:18px 0 8px"><h2 style="font-size:14px">收藏的动态<span>${posts.length}</span></h2></div>
    ${posts.length ? posts.map((p) => `
      <div class="prow" role="button" tabindex="0" data-action="open-post" data-id="${p.id}" style="padding:10px 0">
        <span style="width:44px;height:44px;border-radius:12px;background:${ART_BG[p.art]};display:grid;place-items:center;flex:none;overflow:hidden">${art(p.art, '42px')}</span>
        <span class="prow__main"><b>${esc(p.title)}</b><small>#${esc(p.topic)} · ${esc(p.author)}</small></span>
        ${icon('chev', 15, 'class="chev"')}
      </div>`).join('') : '<p style="font-size:12px;color:var(--ink-3);padding:8px 0 14px">还没有收藏任何动态</p>'}`;
  openSheet({ title: '我的收藏', body, foot: `<button class="btn btn--primary" data-action="close-sheet">关闭</button>` });
}

function openAbout() {
  openSheet({
    title: '关于智慧校园4.0',
    body: `
      <div style="text-align:center;padding:14px 0 18px">
        <div style="width:64px;height:64px;border-radius:20px;background:linear-gradient(145deg,#D9815F,#C0563B);color:#fff;display:grid;place-items:center;margin:0 auto 12px;box-shadow:0 18px 34px -20px rgba(192,86,59,.8)">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none"><path d="M5 8.5 12 5l7 3.5v7L12 19l-7-3.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="m8.5 10.5 3.5 2 3.5-2M12 12.5V16" stroke="#E8B79E" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <b style="font-size:17px">智慧校园4.0</b>
        <p style="font-size:11.5px;color:var(--ink-3);margin-top:4px">v4.0 · 智慧校园服务原型</p>
      </div>
      <p style="font-size:13px;line-height:1.85;color:var(--ink-2)">把课表、闲置流转、跑腿互助和校园周边放在一个入口里：课表支持手动添加与文字智能识别，跳蚤市场与跑腿都支持实拍图和积分推流，校园墙用瀑布流记录身边的小事，附近好店让校外商家也能进来。</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
        <span class="tag">纯前端实现</span><span class="tag">数据存于本机</span><span class="tag">积分推流</span><span class="tag">多端适配</span><span class="tag">AI 助手</span><span class="tag">资料库检索</span>
      </div>
      <p class="sheet-note" style="margin-top:16px">本作品为校园 AI 智能体创新应用大赛演示原型，所有人物、商品与动态均为虚构示例，不涉及真实个人信息。</p>`,
    foot: `<button class="btn btn--primary" data-action="close-sheet">好的</button>`
  });
}

function openReset() {
  const sheet = openSheet({
    title: '清除演示数据',
    body: `<p style="font-size:13px;line-height:1.8;color:var(--ink-2)">将清空当前浏览器里保存的账号、课表、二手商品和校园墙内容，并恢复到初始演示数据。此操作不可撤销。</p>
           <p class="sheet-note">如果你注册过账号，也会一并清除。</p>`,
    foot: `<button class="btn btn--ghost" data-action="close-sheet">取消</button>
           <button class="btn btn--danger" id="resetOk" style="flex:1">确认清除</button>`
  });
  sheet.querySelector('#resetOk').addEventListener('click', () => {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    location.reload();
  });
}
