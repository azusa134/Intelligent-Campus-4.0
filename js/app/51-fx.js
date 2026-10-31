'use strict';

/* ================= 17. V3 交互：卡片光斑（Aceternity card spotlight） =================
   指针在卡片上移动时写入 --mx / --my，CSS 用径向渐变画出跟随光斑。
   只做视觉，不参与布局；触屏与 prefers-reduced-motion 下自动不生效。 */
(() => {
  const SPOT_SEL = '.m-card,.w-card,.svc-card,.g-card,.tool-card,.notice-card,.quick-item,.mini-post,.mini-item,.tier';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0;
  let pending = null;

  const paint = () => {
    raf = 0;
    if (!pending) return;
    const { el, x, y } = pending;
    pending = null;
    el.style.setProperty('--mx', x.toFixed(0) + 'px');
    el.style.setProperty('--my', y.toFixed(0) + 'px');
  };

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || reduce.matches) return;
    const el = e.target && e.target.closest ? e.target.closest(SPOT_SEL) : null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    pending = { el, x: e.clientX - r.left, y: e.clientY - r.top };
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });

  const mark = (node) => {
    if (!node || node.nodeType !== 1) return;
    if (node.matches && node.matches(SPOT_SEL)) node.classList.add('spot');
    if (node.querySelectorAll) node.querySelectorAll(SPOT_SEL).forEach((el) => el.classList.add('spot'));
  };

  mark(document);
  const observe = (root) => {
    if (!root) return;
    new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach(mark)))
      .observe(root, { childList: true, subtree: true });
  };
  observe(document.getElementById('pageHost'));
  observe(document.getElementById('sheetRoot'));
})();


/* ================= 18. 登录页背景：等距立方体网格（Background Cubes Grid） =================
   纯 Canvas 2D 实现，无外部依赖：
   - 等距投影的立方体网格，按对角线从后往前绘制，保证遮挡正确；
   - 高度由两组正弦波叠加驱动，形成缓慢起伏的地形；
   - 指针附近立方体抬升，并叠加一枚暖色聚光；
   - 登录页不可见时停帧，prefers-reduced-motion 下只画一帧静态图。 */
(() => {
  const canvas = document.getElementById('authCubes');
  const view = document.getElementById('authView');
  if (!canvas || !view) return;
  const host = canvas.parentNode;
  let ctx;
  try { ctx = canvas.getContext('2d', { alpha: true, desynchronized: true }); } catch (e) { return; }
  if (!ctx) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CUBE_GAP = 0.94;

  let W = 0, H = 0, dpr = 1;
  let cols = 19, rows = 19, s = 18, cx = 0, cy = 0, hMax = 40;
  let raf = 0, last = 0, lastDraw = 0, time = 0;
  let px = 0.5, py = 0.5, tx = 0.5, ty = 0.5;

  function layout() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const narrow = W < 720;
    cols = narrow ? 14 : 19;
    rows = narrow ? 16 : 19;
    s = Math.max(10, (W + (narrow ? 210 : 140)) / (cols + rows));
    hMax = s * 2.45;
    cx = W * 0.5;
    cy = H * (narrow ? 0.44 : 0.52) - (cols + rows) * s * 0.1;
  }

  function cubeHeight(c, r) {
    const a = c * 0.62 + r * 0.46 - time * 1.15;
    const b = c * 0.21 - r * 0.33 + time * 0.62;
    let v = 0.5 + 0.36 * Math.sin(a) + 0.16 * Math.sin(b + 1.7);
    v = Math.max(0, Math.min(1, v));

    const x = cx + (c - (cols - 1) / 2 - (r - (rows - 1) / 2)) * s;
    const y = cy + (c - (cols - 1) / 2 + r - (rows - 1) / 2) * s * 0.5;
    const dx = (x - px * W) / (W * 0.42);
    const dy = (y - py * H) / (H * 0.42);
    const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
    return Math.min(1, v + near * near * 0.42);
  }

  function drawCube(x, y, v, alpha) {
    const h = v * hMax;
    const topY = y - h;
    const half = s * CUBE_GAP;
    const hue = 15 + (1 - v) * 9;
    const sat = 34 + v * 26;
    const light = 13 + v * 44;

    ctx.globalAlpha = alpha;

    ctx.fillStyle = `hsl(${hue} ${sat}% ${Math.max(7, light - 15)}%)`;
    ctx.beginPath();
    ctx.moveTo(x - half, topY);
    ctx.lineTo(x, topY + half * 0.5);
    ctx.lineTo(x, y + half * 0.5);
    ctx.lineTo(x - half, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `hsl(${hue} ${sat}% ${Math.max(8, light - 8)}%)`;
    ctx.beginPath();
    ctx.moveTo(x + half, topY);
    ctx.lineTo(x, topY + half * 0.5);
    ctx.lineTo(x, y + half * 0.5);
    ctx.lineTo(x + half, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
    ctx.beginPath();
    ctx.moveTo(x, topY - half * 0.5);
    ctx.lineTo(x + half, topY);
    ctx.lineTo(x, topY + half * 0.5);
    ctx.lineTo(x - half, topY);
    ctx.closePath();
    ctx.fill();

    if (v > 0.45) {
      ctx.strokeStyle = `rgba(255, 216, 186, ${(v - 0.45) * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    const gx = px * W;
    const gy = py * H;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(W, H) * 0.5);
    glow.addColorStop(0, 'rgba(192, 86, 59, 0.20)');
    glow.addColorStop(0.45, 'rgba(192, 86, 59, 0.06)');
    glow.addColorStop(1, 'rgba(192, 86, 59, 0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const lastD = cols + rows - 2;
    for (let d = 0; d <= lastD; d++) {
      for (let c = 0; c < cols; c++) {
        const r = d - c;
        if (r < 0 || r >= rows) continue;
        const x = cx + (c - (cols - 1) / 2 - (r - (rows - 1) / 2)) * s;
        const y = cy + (c - (cols - 1) / 2 + r - (rows - 1) / 2) * s * 0.5;
        if (x < -s * 2 || x > W + s * 2 || y < -hMax * 2 || y > H + s * 3) continue;
        const v = cubeHeight(c, r);
        drawCube(x, y, v, 0.34 + 0.66 * (d / lastD));
      }
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(48, now - last) : 16;
    last = now;
    time += dt / 1000;
    px += (tx - px) * 0.06;
    py += (ty - py) * 0.06;

    // 约 30fps，够顺滑又省电
    if (now - lastDraw >= 27) {
      lastDraw = now;
      render();
    }

    if (!motion.matches && !view.classList.contains('hidden')) {
      raf = requestAnimationFrame(frame);
    }
  }

  function start() {
    if (raf || motion.matches || view.classList.contains('hidden')) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function boot() {
    layout();
    if (motion.matches) {
      time = 2.6;
      render();
      host.classList.add('is-ready');
      return;
    }
    host.classList.add('is-ready');
    start();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener('resize', () => {
    layout();
    if (!raf) {
      last = 0;
      render();
    }
  });

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX / Math.max(1, window.innerWidth);
    ty = e.clientY / Math.max(1, window.innerHeight);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  new MutationObserver(() => {
    if (view.classList.contains('hidden')) stop();
    else start();
  }).observe(view, { attributes: true, attributeFilter: ['class'] });
})();
/* ================= 19. 微交互：磁性 AI 入口 ================= */
(() => {
  const fab = document.getElementById('aiFab');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fab || reduce.matches) return;

  let rect = null;
  let measuredAt = 0;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

  const measure = () => {
    rect = fab.getBoundingClientRect();
    measuredAt = performance.now();
  };
  // 应用页一开始是隐藏的，rect 会是全 0；命中前按需重测
  const ensureRect = () => {
    if (!rect || rect.width === 0 || performance.now() - measuredAt > 500) measure();
  };
  const loop = () => {
    raf = 0;
    cx += (tx - cx) * 0.16;
    cy += (ty - cy) * 0.16;
    fab.style.setProperty('--fx', cx.toFixed(2) + 'px');
    fab.style.setProperty('--fy', cy.toFixed(2) + 'px');
    if (Math.abs(tx - cx) > 0.15 || Math.abs(ty - cy) > 0.15) raf = requestAnimationFrame(loop);
  };

  const onMove = (e) => {
    if (e.pointerType === 'touch') return;
    ensureRect();
    if (!rect || rect.width === 0) return;
    const mx = rect.left + rect.width / 2;
    const my = rect.top + rect.height / 2;
    const dx = e.clientX - mx;
    const dy = e.clientY - my;
    const dist = Math.hypot(dx, dy);
    const radius = 170;
    if (dist < radius) {
      const f = 1 - dist / radius;
      tx = dx * 0.26 * f;
      ty = dy * 0.26 * f;
    } else {
      tx = 0;
      ty = 0;
    }
    if (!raf) raf = requestAnimationFrame(loop);
  };

  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('pointermove', onMove, { passive: true });
})();

/* ================= 20. 微交互：服务卡 3D 倾斜 + 指针暖光 ================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const app = document.querySelector('.app');
  if (!app) return;

  // 指针暖光：写 --gx / --gy，背景里那一层径向渐变跟着走
  let gx = 50, gy = 18, tgx = 50, tgy = 18, glowRaf = 0;
  const paintGlow = () => {
    glowRaf = 0;
    gx += (tgx - gx) * 0.12;
    gy += (tgy - gy) * 0.12;
    app.style.setProperty('--gx', gx.toFixed(1) + '%');
    app.style.setProperty('--gy', gy.toFixed(1) + '%');
    if (Math.abs(tgx - gx) > 0.2 || Math.abs(tgy - gy) > 0.2) glowRaf = requestAnimationFrame(paintGlow);
  };

  if (!reduce.matches) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      tgx = (e.clientX / Math.max(1, window.innerWidth)) * 100;
      tgy = (e.clientY / Math.max(1, window.innerHeight)) * 100;
      if (!glowRaf) glowRaf = requestAnimationFrame(paintGlow);
    }, { passive: true });
  }

  // 服务卡 3D 倾斜（仅精细指针）
  if (!fine.matches || reduce.matches) return;
  let active = null;
  const reset = () => {
    if (active) active.style.transform = '';
    active = null;
  };
  document.addEventListener('pointermove', (e) => {
    const card = e.target && e.target.closest ? e.target.closest('.svc-card') : null;
    if (active && active !== card) reset();
    if (!card) return;
    active = card;
    const r = card.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform =
      'perspective(1000px) rotateX(' + (-py * 8).toFixed(2) + 'deg) rotateY(' + (px * 9).toFixed(2) + 'deg) translateY(-3px) scale(1.008)';
  }, { passive: true });
  document.addEventListener('pointerdown', reset, { passive: true });
  window.addEventListener('scroll', reset, { passive: true });
})();
