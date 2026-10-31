'use strict';

/* ================= 10. 校园服务 ================= */
function servicesHTML() {
  const itemCount = db.items.length;
  const postCount = db.posts.length;
  const openErrands = db.errands.filter((x) => x.status === 'open').length;
  const shopCount = db.shops.length;
  const arts = ['book', 'camera', 'bike'];
  return `
  <div class="page-head fade-up">
    <h1>校园服务</h1>
    <p>把闲置流转起来，把身边的小事说出来</p>
  </div>

  <div class="svc-list">
    <button class="svc-card svc-card--market" data-action="open-market">
      <div class="svc-card__top">
        <span class="svc-card__tag">01 — FLEA MARKET</span>
        <span class="svc-card__count">${itemCount} 件在售</span>
      </div>
      <div>
        <h3>跳蚤市场</h3>
        <p>教材、数码、单车、宿舍好物，校内面交，省钱又安心。</p>
      </div>
      <div class="svc-card__foot">
        <div class="svc-card__arts">${arts.map((a) => `<span class="a">${art(a)}</span>`).join('')}</div>
        <span class="svc-card__go">去逛逛 ${icon('chev', 14)}</span>
      </div>
    </button>

    <button class="svc-card svc-card--errand" data-action="open-errands">
      <div class="svc-card__top">
        <span class="svc-card__tag">02 — CAMPUS ERRAND</span>
        <span class="svc-card__count">${openErrands} 单待接</span>
      </div>
      <div>
        <h3>校园跑腿</h3>
        <p>代取快递、代取外卖、代买代送，顺路的搭把手，也赚点零花。</p>
      </div>
      <div class="svc-card__foot">
        <div class="svc-card__arts">${['parcel', 'food', 'cup'].map((a) => `<span class="a">${art(a)}</span>`).join('')}</div>
        <span class="svc-card__go">去接单 ${icon('chev', 14)}</span>
      </div>
    </button>

    <button class="svc-card svc-card--wall" data-action="open-wall">
      <div class="svc-card__top">
        <span class="svc-card__tag">03 — CAMPUS WALL</span>
        <span class="svc-card__count">${postCount} 条动态</span>
      </div>
      <div>
        <h3>校园墙</h3>
        <p>学习打卡、美食探店、失物招领，也可以只是说句心里话。</p>
      </div>
      <div class="svc-card__foot">
        <div class="svc-card__arts">${['food', 'cat', 'sun'].map((a) => `<span class="a">${art(a)}</span>`).join('')}</div>
        <span class="svc-card__go">去看看 ${icon('chev', 14)}</span>
      </div>
    </button>

    <button class="svc-card svc-card--shop" data-action="open-shops">
      <div class="svc-card__top">
        <span class="svc-card__tag">04 — NEARBY SHOPS</span>
        <span class="svc-card__count">${shopCount} 家店</span>
      </div>
      <div>
        <h3>附近好店</h3>
        <p>校门口的咖啡、打印、理发与便利店，凭校园卡还有学生价。</p>
      </div>
      <div class="svc-card__foot">
        <div class="svc-card__arts">${['store', 'cup', 'book'].map((a) => `<span class="a">${art(a)}</span>`).join('')}</div>
        <span class="svc-card__go">去逛逛 ${icon('chev', 14)}</span>
      </div>
    </button>
  </div>

  ${freshmanSectionHTML()}

  <section class="section">
    <div class="section__head"><h2><i class="idx">06</i>校园工具箱<span>TOOLKIT</span></h2></div>
    <div class="tool-grid">
      <button class="tool-card" data-action="tool" data-tool="room">
        <span class="quick-ico q-green">${icon('door', 18)}</span>
        <span><b>空教室查询</b><small>自习不用抢座</small></span>
      </button>
      <button class="tool-card" data-action="tool" data-tool="lost">
        <span class="quick-ico q-amber">${icon('bag', 18)}</span>
        <span><b>失物招领</b><small>今天 4 条信息</small></span>
      </button>
      <button class="tool-card" data-action="tool" data-tool="phone">
        <span class="quick-ico q-blue">${icon('phone', 18)}</span>
        <span><b>校园电话</b><small>常用部门直达</small></span>
      </button>
      <button class="tool-card" data-action="tool" data-tool="calendar">
        <span class="quick-ico q-coral">${icon('calendar', 18)}</span>
        <span><b>校历安排</b><small>考试周别记错</small></span>
      </button>
    </div>
  </section>

  <section class="section">
    <div class="section__head"><h2><i class="idx">07</i>校园公告<span>NOTICE</span></h2><span class="section__more">学生事务中心</span></div>
    <div class="notice-card">
      <div class="notice-row"><span class="n-date">10/28</span><p>图书馆四楼自习区延长开放至 23:00</p><span class="tag">通知</span></div>
      <div class="notice-row"><span class="n-date">10/30</span><p>校园卡系统维护，22:00–24:00 暂停充值</p><span class="tag">维护</span></div>
      <div class="notice-row"><span class="n-date">11/01</span><p>冬季供暖试运行，宿舍区注意通风</p><span class="tag">后勤</span></div>
    </div>
  </section>

  <div class="foot-note">所有交易与信息均为演示数据，请注意线下安全</div>`;
}
