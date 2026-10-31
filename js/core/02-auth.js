'use strict';

/* ================= 6. 登录 / 注册 ================= */
function setAuthTab(tab) {
  if (state.authTab === tab) return;
  state.authTab = tab;
  $$('[data-auth]').forEach((b) => {
    const active = b.dataset.auth === tab;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-selected', String(active));
  });
  $('#loginForm').classList.toggle('hidden', tab !== 'login');
  $('#registerForm').classList.toggle('hidden', tab !== 'register');
  $('#loginErr').hidden = true;
  $('#regErr').hidden = true;
  const form = tab === 'login' ? $('#loginForm') : $('#registerForm');
  form.classList.remove('auth-form-enter');
  void form.offsetWidth;
  form.classList.add('auth-form-enter');
}
function showErr(el, msg) {
  el.textContent = msg;
  el.hidden = false;
}
async function enterApp(animate = true) {
  const auth = $('#authView');
  const app = $('#appView');
  const transitionId = ++viewTransitionId;
  if (animate && !auth.classList.contains('hidden') && !reduceMotion()) {
    auth.classList.add('view-leaving');
    await motionDelay(220);
    if (transitionId !== viewTransitionId) return;
  }
  auth.classList.add('hidden');
  auth.classList.remove('view-leaving', 'auth-view-enter');
  const welcome = $('#welcomeView');
  if (welcome) welcome.classList.add('hidden');
  app.classList.remove('hidden', 'view-leaving', 'app-view-enter');
  state.tab = 'home';
  state.page = null;
  renderPage(false);
  window.scrollTo(0, 0);
  if (animate && !reduceMotion()) {
    void app.offsetWidth;
    app.classList.add('app-view-enter');
  }
}
async function logout() {
  db.session = null;
  saveDB();
  aiHistory = [];
  closeSheet();
  const auth = $('#authView');
  const app = $('#appView');
  const transitionId = ++viewTransitionId;
  if (!reduceMotion()) {
    app.classList.add('view-leaving');
    await motionDelay(220);
    if (transitionId !== viewTransitionId) return;
  }
  app.classList.add('hidden');
  app.classList.remove('view-leaving', 'app-view-enter');
  const welcome = $('#welcomeView');
  if (welcome) {
    showWelcome(false);
  } else {
    auth.classList.remove('hidden', 'view-leaving', 'auth-view-enter');
    window.scrollTo(0, 0);
    if (!reduceMotion()) {
      void auth.offsetWidth;
      auth.classList.add('auth-view-enter');
    }
  }
  $('#loginPass').value = '123456';
  $('#loginErr').hidden = true;
  toast('已退出登录');
}

$('#loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = $('#loginUser').value.trim();
  const p = $('#loginPass').value;
  const err = $('#loginErr');
  if (!u || !p) return showErr(err, '请输入用户名和登录密码');
  const user = db.users.find((x) => x.u.toLowerCase() === u.toLowerCase());
  if (!user || user.p !== p) return showErr(err, '用户名或密码不正确，可以试试 demo / 123456');
  db.session = user.u;
  saveDB();
  enterApp();
  toast(`欢迎回来，${user.nick}`);
});
$('#registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = $('#regUser').value.trim();
  const nick = $('#regNick').value.trim() || u;
  const sid = $('#regSid').value.trim();
  const p = $('#regPass').value;
  const p2 = $('#regPass2').value;
  const err = $('#regErr');
  if (!/^[A-Za-z0-9_]{3,16}$/.test(u)) return showErr(err, '用户名需为 3-16 位字母、数字或下划线');
  if (db.users.some((x) => x.u.toLowerCase() === u.toLowerCase())) return showErr(err, '这个用户名已经被注册啦，换一个试试');
  if (p.length < 6) return showErr(err, '密码至少需要 6 位');
  if (p !== p2) return showErr(err, '两次输入的密码不一致');
  db.users.push({
    u, p, nick, sid, college: '未填写学院', bio: '刚来到智慧校园4.0，请多关照',
    created: Date.now(),
    points: 100,
    pointLog: [{ d: 100, r: '新人注册奖励', t: '刚刚' }]
  });
  db.session = u;
  saveDB();
  enterApp();
  toast('注册成功，已送 100 积分');
});
$$('[data-eye]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.eye);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? '隐藏' : '显示';
  });
});
$$('[data-auth]').forEach((btn) => btn.addEventListener('click', () => setAuthTab(btn.dataset.auth)));
$('#demoFill').addEventListener('click', () => {
  $('#loginUser').value = 'demo';
  $('#loginPass').value = '123456';
  $('#loginErr').hidden = true;
  toast('已填入试用账号');
});
$('#forgotBtn').addEventListener('click', () => {
  toast('演示版本：请使用 demo / 123456 登录');
});
