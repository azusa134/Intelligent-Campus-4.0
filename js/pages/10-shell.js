'use strict';

/* ================= 7. 页面渲染 ================= */
function updateTabs() {
  $$('.tab-item').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === state.tab));
}
async function renderPage(animate = false) {
  destroyCampusScene();
  const host = $('#pageHost');
  const transitionId = ++pageTransitionId;
  if (animate && host.childElementCount && !reduceMotion()) {
    host.classList.remove('is-entering');
    host.classList.add('is-leaving');
    await motionDelay(150);
    if (transitionId !== pageTransitionId) return;
  }
  host.classList.remove('is-leaving', 'is-entering');
  if (state.tab === 'home') {
    host.innerHTML = homeHTML();
    initCampusScene();
  } else if (state.tab === 'services') {
    if (state.page === 'market') { host.innerHTML = marketHTML(); refreshMarket(); }
    else if (state.page === 'wall') { host.innerHTML = wallHTML(); refreshWall(); }
    else if (state.page === 'errands') { host.innerHTML = errandsHTML(); refreshErrands(); }
    else if (state.page === 'shops') { host.innerHTML = shopsHTML(); refreshShops(); }
    else host.innerHTML = servicesHTML();
  } else host.innerHTML = profileHTML();
  updateTabs();
  window.scrollTo(0, 0);
  if (animate && !reduceMotion()) {
    void host.offsetWidth;
    host.classList.add('is-entering');
    setTimeout(() => {
      if (transitionId === pageTransitionId) host.classList.remove('is-entering');
    }, 480);
  }
}
function switchTab(tab) {
  if (state.tab === tab && !state.page) return;
  state.tab = tab;
  state.page = null;
  renderPage(true);
}
