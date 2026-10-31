'use strict';

/* ================= 16. 事件分发 ================= */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;
  switch (a) {
    case 'close-sheet': closeSheet(); break;
    case 'back':
      if (state.page) { state.page = null; renderPage(true); }
      else switchTab('home');
      break;
    case 'open-market':
      state.tab = 'services'; state.page = 'market'; renderPage(true); break;
    case 'open-wall':
      state.tab = 'services'; state.page = 'wall'; renderPage(true); break;
    case 'open-errands':
      state.tab = 'services'; state.page = 'errands'; renderPage(true); break;
    case 'open-shops':
      state.tab = 'services'; state.page = 'shops'; renderPage(true); break;
    case 'open-errand': openErrand(el.dataset.id, el); break;
    case 'open-shop': openShop(el.dataset.id, el); break;
    case 'open-guide': openGuide(el.dataset.id, el); break;
    case 'open-qa': openQA(el.dataset.id || ''); break;
    case 'ask-question': openAskQuestion(); break;
    case 'publish-errand': openPublishErrand(); break;
    case 'publish-shop': openShopForm(); break;
    case 'open-points': openPoints(); break;
    case 'open-boost': openBoostHub(el.dataset.kind || 'item'); break;
    case 'boost-target': openBoostSheet(el.dataset.kind || 'item', el.dataset.id); break;
    case 'invite-friend':
      addPoints(30, '邀请新同学', true);
      openPoints();
      toast('已模拟一次邀请，积分 +30');
      break;
    case 'my-errands': openMyErrands(); break;
    case 'go-profile': switchTab('profile'); break;
    case 'week': {
      const d = Number(el.dataset.delta);
      state.weekOffset = d === 0 ? 0 : clamp(state.weekOffset + d, -8, 8);
      renderPage();
      break;
    }
    case 'month': {
      const d = Number(el.dataset.delta);
      const y = window.scrollY;
      state.monthOffset = d === 0 ? 0 : clamp(state.monthOffset + d, -8, 8);
      renderPage();
      window.scrollTo(0, y);
      break;
    }
    case 'open-calendar': openCalendar(el.dataset.date || ''); break;
    case 'toggle-periods': {
      const y = window.scrollY;
      state.showAllPeriods = !state.showAllPeriods;
      renderPage();
      window.scrollTo(0, y);
      break;
    }
    case 'add-course':
      openCourseForm(null, { day: Number(el.dataset.day) || 1, period: Number(el.dataset.period) || 1 });
      break;
    case 'edit-course': openCourseForm(el.dataset.id); break;
    case 'import': openImportSheet(); break;
    case 'open-item': openItem(el.dataset.id, el); break;
    case 'open-post': openPost(el.dataset.id, el); break;
    case 'close-detail': closeDetail(); break;
    case 'publish-item': openPublishItem(); break;
    case 'publish-post': openPublishPost(); break;
    case 'tool': openTool(el.dataset.tool); break;
    case 'edit-profile': openEditProfile(); break;
    case 'my-posts': openMyPosts(); break;
    case 'favorites': openFavorites(); break;
    case 'about': openAbout(); break;
    case 'reset-demo': openReset(); break;
    case 'open-ai': openAI(); break;
    case 'open-library': openLibrary(); break;
    case 'ai-billing': openAIBilling(); break;
    case 'logout': logout(); break;
    case 'manage-course':
      state.tab = 'home'; state.page = null;
      renderPage(true);
      toast('点击课表格子就能添加或编辑课程');
      break;
    case 'toggle-notify': {
      db.notify = !db.notify;
      saveDB();
      const sw = $('#notifySwitch');
      if (sw) sw.classList.toggle('is-on', db.notify);
      toast(db.notify ? '已开启上课提醒' : '已关闭上课提醒');
      break;
    }
    case 'chat': toast('已发起聊天（演示）'); break;
    default: break;
  }
});

document.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-mcat]');
  if (chip) { state.mcat = chip.dataset.mcat; refreshMarket(); return; }
  const sort = e.target.closest('[data-msort]');
  if (sort) { state.msort = sort.dataset.msort; refreshMarket(); return; }
  const topic = e.target.closest('[data-wtopic]');
  if (topic) { state.wtopic = topic.dataset.wtopic; refreshWall(); return; }
  const ecat = e.target.closest('[data-ecat]');
  if (ecat) { state.ecat = ecat.dataset.ecat; refreshErrands(); return; }
  const esort = e.target.closest('[data-esort]');
  if (esort) { state.esort = esort.dataset.esort; refreshErrands(); return; }
  const scat = e.target.closest('[data-scat]');
  if (scat) { state.scat = scat.dataset.scat; refreshShops(); return; }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'marketSearch') {
    state.mq = e.target.value;
    refreshMarket();
  } else if (e.target.id === 'errandSearch') {
    state.eq = e.target.value;
    refreshErrands();
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-action]')) {
    e.preventDefault();
    e.target.click();
  }
});

$$('.tab-item').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
$('#aiFab').addEventListener('click', openAI);

/* ================= 17. 启动 ================= */
(function init() {
  if (db.session && db.users.some((u) => u.u === db.session)) {
    enterApp(false);
  } else {
    const welcome = $('#welcomeView');
    if (welcome) welcome.classList.remove('hidden');
    else $('#authView').classList.remove('hidden');
    $('#authView').classList.add('hidden');
    $('#appView').classList.add('hidden');
  }
})();
