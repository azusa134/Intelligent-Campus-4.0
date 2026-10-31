'use strict';

/* ================= 21. 欢迎页：GDIP 照片蒙赛克与视图切换 ================= */
const WELCOME_PHOTOS = Object.freeze([
  '01', '03', '07', '08', '09', '10', '11', '12', '13', '14',
  '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
  '25', '26', '27', '28', '29', '30', '31', '32', '33', '34',
  '35', '36', '38', '39', '40', '41', '42', '43'
]);

const GDIP_GLYPHS = Object.freeze([
  {
    letter: 'G',
    rows: ['01110', '11000', '10000', '10111', '10001', '11001', '01110']
  },
  {
    letter: 'D',
    rows: ['11110', '11011', '10011', '10011', '10011', '11011', '11110']
  },
  {
    letter: 'I',
    rows: ['11111', '00100', '00100', '00100', '00100', '00100', '11111']
  },
  {
    letter: 'P',
    rows: ['11110', '11011', '10011', '11011', '11110', '11000', '10000']
  }
]);

let welcomeViewTransitionId = 0;

async function showLogin() {
  const welcome = $('#welcomeView');
  const auth = $('#authView');
  if (!welcome || !auth || !auth.classList.contains('hidden')) return;

  const transitionId = ++welcomeViewTransitionId;
  if (!welcome.classList.contains('hidden') && !reduceMotion()) {
    welcome.classList.add('view-leaving');
    await motionDelay(220);
    if (transitionId !== welcomeViewTransitionId) return;
  }

  welcome.classList.add('hidden');
  welcome.classList.remove('view-leaving', 'welcome-view-enter');
  auth.classList.remove('hidden', 'view-leaving', 'auth-view-enter');
  window.scrollTo(0, 0);
  if (!reduceMotion()) {
    void auth.offsetWidth;
    auth.classList.add('auth-view-enter');
  }
}

async function showWelcome(animate = true) {
  const welcome = $('#welcomeView');
  const auth = $('#authView');
  if (!welcome || !auth || !welcome.classList.contains('hidden')) return;

  const transitionId = ++welcomeViewTransitionId;
  if (animate && !auth.classList.contains('hidden') && !reduceMotion()) {
    auth.classList.add('view-leaving');
    await motionDelay(220);
    if (transitionId !== welcomeViewTransitionId) return;
  }

  auth.classList.add('hidden');
  auth.classList.remove('view-leaving', 'auth-view-enter');
  welcome.classList.remove('hidden', 'view-leaving', 'welcome-view-enter');
  window.scrollTo(0, 0);
  if (animate && !reduceMotion()) {
    void welcome.offsetWidth;
    welcome.classList.add('welcome-view-enter');
  }
}

(() => {
  const view = document.getElementById('welcomeView');
  const mosaic = document.getElementById('gdipMosaic');
  const loginButton = document.getElementById('welcomeLogin');
  const backButton = document.getElementById('authBack');
  if (!view || !mosaic) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const delayedCycles = new Set();
  let activeLetter = null;
  let letterTimer = 0;

  const photoURL = (index) => {
    const length = WELCOME_PHOTOS.length;
    const normalized = ((index % length) + length) % length;
    return 'photo/' + WELCOME_PHOTOS[normalized] + '.jpg';
  };

  function createTile(photoIndex, entranceIndex) {
    const tile = document.createElement('span');
    tile.className = 'mosaic-tile';
    tile.dataset.photoIndex = String(photoIndex);
    tile.style.setProperty('--d', String(Math.min(entranceIndex, 32)));

    const current = new Image();
    const next = new Image();
    current.className = 'mosaic-tile__image is-current';
    next.className = 'mosaic-tile__image';
    [current, next].forEach((image) => {
      image.alt = '';
      image.draggable = false;
      image.decoding = 'async';
      image.setAttribute('aria-hidden', 'true');
    });
    current.src = photoURL(photoIndex);
    tile.append(current, next);
    return tile;
  }

  function cycleTile(tile, step) {
    if (!tile || tile.dataset.swapping === '1' || view.classList.contains('hidden')) return;
    const current = tile.querySelector('.mosaic-tile__image.is-current');
    const next = Array.from(tile.children).find((image) => image !== current);
    if (!current || !next) return;

    const nextIndex = Number(tile.dataset.photoIndex) + step;
    tile.dataset.swapping = '1';

    const swap = () => {
      next.onload = null;
      next.onerror = null;
      tile.dataset.photoIndex = String(nextIndex);
      requestAnimationFrame(() => {
        next.classList.add('is-current');
        current.classList.remove('is-current');
        window.setTimeout(() => { tile.dataset.swapping = '0'; }, motion.matches ? 0 : 460);
      });
    };

    next.onload = swap;
    next.onerror = () => {
      next.onload = null;
      next.onerror = null;
      tile.dataset.swapping = '0';
    };
    next.src = photoURL(nextIndex);
    if (next.complete && next.naturalWidth) swap();
  }

  function cycleLetter(letter) {
    if (!letter || view.classList.contains('hidden')) return;
    const round = Number(letter.dataset.round || 0) + 1;
    letter.dataset.round = String(round);
    const step = 1 + (round % 2);
    const tiles = letter.querySelectorAll('.mosaic-tile');

    tiles.forEach((tile, index) => {
      const delay = motion.matches ? 0 : (index % 7) * 42;
      const timer = window.setTimeout(() => {
        delayedCycles.delete(timer);
        cycleTile(tile, step);
      }, delay);
      delayedCycles.add(timer);
    });
  }

  function stopLetter() {
    if (letterTimer) window.clearInterval(letterTimer);
    letterTimer = 0;
    delayedCycles.forEach((timer) => window.clearTimeout(timer));
    delayedCycles.clear();
    if (activeLetter) activeLetter.classList.remove('is-active');
    activeLetter = null;
  }

  function startLetter(letter) {
    if (activeLetter === letter && letterTimer) return;
    stopLetter();
    activeLetter = letter;
    letter.classList.add('is-active');
    cycleLetter(letter);
    if (!motion.matches) {
      letterTimer = window.setInterval(() => cycleLetter(letter), 1180);
    }
  }

  GDIP_GLYPHS.forEach((glyph, letterIndex) => {
    const letter = document.createElement('button');
    letter.className = 'mosaic-letter';
    letter.type = 'button';
    letter.dataset.letter = glyph.letter;
    letter.setAttribute('aria-label', '切换 ' + glyph.letter + ' 字母区域的校园照片');
    let tileIndex = 0;

    glyph.rows.forEach((row, rowIndex) => {
      Array.from(row).forEach((cell, columnIndex) => {
        if (cell === '1') {
          const photoIndex = letterIndex * 11 + tileIndex * 5 + rowIndex * 2 + columnIndex;
          letter.appendChild(createTile(photoIndex, tileIndex + letterIndex * 5));
          tileIndex += 1;
        } else {
          const empty = document.createElement('span');
          empty.className = 'mosaic-cell mosaic-cell--empty';
          empty.setAttribute('aria-hidden', 'true');
          letter.appendChild(empty);
        }
      });
    });

    letter.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') startLetter(letter);
    });
    letter.addEventListener('pointerleave', stopLetter);
    letter.addEventListener('focus', () => {
      if (letter.matches(':focus-visible')) startLetter(letter);
    });
    letter.addEventListener('blur', stopLetter);
    letter.addEventListener('click', () => cycleLetter(letter));
    mosaic.appendChild(letter);
  });

  if (loginButton) loginButton.addEventListener('click', showLogin);
  if (backButton) backButton.addEventListener('click', () => showWelcome());

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLetter();
  });
  motion.addEventListener('change', stopLetter);
  new MutationObserver(() => {
    if (view.classList.contains('hidden')) stopLetter();
  }).observe(view, { attributes: true, attributeFilter: ['class'] });
})();
