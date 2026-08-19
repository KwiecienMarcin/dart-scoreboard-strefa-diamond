// Ruletka (kolo fortuny) - nakladka do wstrzykniecia na dowolna strone.
// Uzycie: <script src="roulette-overlay.js"></script> (i opcjonalnie ?devBoard=N w URL do testow lokalnych).
// Zmien RLT_API na docelowy adres backendu (Railway) przed wdrozeniem produkcyjnym.
(function () {
  const RLT_API = window.RLT_API_OVERRIDE || 'http://192.168.0.245:4001';
  const RLT_POLL_MS = 3000;
  const RLT_DEV_BOARD = new URLSearchParams(location.search).get('devBoard');
  const SKIP_DELAY_MS = 5000;
  const CIRCLE_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

  let dismissedEventId = null; // event already skipped/closed this browser session
  let pollTimer = null;
  let uiBuilt = false;

  function qs(sel, root) { return (root || document).querySelector(sel); }

  // ---------------------------------------------------------------------
  // Styles (scoped with rlt- prefix so this never collides with the host page)
  // ---------------------------------------------------------------------
  function injectStyles() {
    if (qs('#rlt-styles')) return;
    if (!qs('link[href*="fonts.googleapis.com/css2?family=Bebas"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
    const style = document.createElement('style');
    style.id = 'rlt-styles';
    style.textContent = `
      #rlt-root { font-family: "Rajdhani", "Inter", sans-serif; }
      .rlt-overlay {
        display: none; position: fixed; inset: 0; z-index: 9999;
        background: rgba(3,4,8,0.55); backdrop-filter: blur(6px);
        align-items: center; justify-content: center; padding: 20px;
        animation: rlt-fade 0.4s ease;
      }
      .rlt-overlay.rlt-open { display: flex; }
      @keyframes rlt-fade { from { opacity: 0; } to { opacity: 1; } }
      .rlt-card {
        width: min(560px, 100%); max-height: 92vh; overflow-y: auto;
        background: linear-gradient(160deg, #141a29, #0b0e17); border: 1px solid rgba(242,186,42,0.4);
        border-radius: 22px; padding: 30px 32px; text-align: center; color: #fff;
        animation: rlt-pop 0.4s cubic-bezier(0.22,1,0.36,1); box-shadow: 0 30px 80px rgba(0,0,0,0.6);
      }
      @keyframes rlt-pop { from { opacity: 0; transform: scale(0.9) translateY(14px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      .rlt-title { font-family: "Bebas Neue"; font-size: 2.1rem; color: #ffd449; letter-spacing: 1px; margin: 0 0 10px; }
      .rlt-msg { font-size: 1.05rem; color: rgba(255,255,255,0.85); line-height: 1.5; margin: 0 0 6px; }
      .rlt-prizes { color: #ffd449; font-weight: 700; }
      .rlt-btn-row { display: flex; gap: 10px; justify-content: center; margin-top: 22px; flex-wrap: wrap; }
      .rlt-primary {
        background: linear-gradient(120deg, #ffd449, #f2ba2a); color: #151515; border: none; border-radius: 14px;
        padding: 13px 26px; font-family: "Rajdhani"; font-size: 1.05rem; font-weight: 700; cursor: pointer;
        transition: transform 0.15s ease;
      }
      .rlt-primary:active { transform: scale(0.95); }
      .rlt-secondary {
        background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 14px;
        padding: 12px 24px; font-family: "Rajdhani"; font-size: 0.98rem; font-weight: 700; cursor: pointer;
        opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
      }
      .rlt-secondary.rlt-visible { opacity: 1; pointer-events: auto; }

      .rlt-wheel-zone { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-top: 8px; }
      .rlt-wheel-wrap { position: relative; width: min(320px, 80vw); }
      .rlt-pointer {
        position: absolute; top: -6px; left: 50%; transform: translateX(-50%); z-index: 2;
        width: 0; height: 0; border-left: 13px solid transparent; border-right: 13px solid transparent;
        border-top: 22px solid #ffd449; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      }
      .rlt-wheel-svg { width: 100%; height: auto; display: block; filter: drop-shadow(0 10px 26px rgba(0,0,0,0.5)); }
      .rlt-band { stroke: #06080f; stroke-width: 1.5; }
      .rlt-band.black { fill: #121212; } .rlt-band.cream { fill: #ece3cd; }
      .rlt-band.red { fill: #c22a34; } .rlt-band.green { fill: #157a41; }
      .rlt-band.clickable { cursor: pointer; transition: filter 0.1s ease; }
      .rlt-band.clickable:hover { filter: brightness(1.3); }
      .rlt-backing { fill: #0a0a0a; }
      .rlt-bull-outer { fill: #157a41; stroke: #06080f; stroke-width: 1.5; }
      .rlt-bull-inner { fill: #c22a34; stroke: #06080f; stroke-width: 1.5; }
      .rlt-wedge-glow { fill: rgba(255,255,255,0); pointer-events: none; stroke: rgba(255,255,255,0); stroke-width: 3; }
      .rlt-wedge-glow.rlt-selected { fill: rgba(255,255,255,0.75) !important; stroke: rgba(255,255,255,1) !important; }
      .rlt-label { fill: rgba(255,255,255,0.9); font-family: "Rajdhani"; font-size: 20px; font-weight: 800; pointer-events: none; user-select: none; }

      .rlt-readout { font-family: "Bebas Neue"; font-size: 2.6rem; color: #ffd449; letter-spacing: 2px; min-height: 1.2em; }
      .rlt-status-text { color: rgba(255,255,255,0.7); font-size: 0.98rem; min-height: 1.4em; }

      .rlt-keypad-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; width: min(340px, 100%); margin: 4px auto 0; }
      .rlt-key {
        padding: 11px 0; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.05); color: #fff; font-weight: 700; cursor: pointer; font-family: "Rajdhani"; font-size: 0.98rem;
      }
      .rlt-key.rlt-active { background: rgba(255,255,255,0.85); color: #151515; }

      .rlt-confirm-panel {
        display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 8px;
        background: rgba(255,255,255,0.04); border: 1px solid rgba(242,186,42,0.35); border-radius: 14px;
        padding: 12px 18px; min-height: 50px; width: min(340px, 100%); margin-left: auto; margin-right: auto;
      }
      .rlt-hit-value {
        font-family: "Bebas Neue"; font-size: 1.6rem; color: #ffd449; background: rgba(242,186,42,0.1);
        border: 1px solid rgba(242,186,42,0.4); border-radius: 8px; padding: 4px 14px;
      }
      .rlt-result-title { font-family: "Bebas Neue"; font-size: 1.8rem; margin: 8px 0 6px; }
      .rlt-result-title.rlt-win { color: #ffd449; }
      .rlt-result-title.rlt-lose { color: rgba(255,255,255,0.75); }
    `;
    document.head.appendChild(style);
  }

  // ---------------------------------------------------------------------
  // Wheel SVG helpers (same wedge math as Snajper/Wieza)
  // ---------------------------------------------------------------------
  const R = { backing: 236, doubleOut: 200, doubleIn: 182, outerSingleOut: 182, outerSingleIn: 116, tripleOut: 116, tripleIn: 100, innerSingleOut: 100, innerSingleIn: 26 };
  function polar(r, angleDeg) { const rad = (angleDeg * Math.PI) / 180; return { x: r * Math.sin(rad), y: -r * Math.cos(rad) }; }
  function annularPath(rIn, rOut, a0, a1) {
    const p1 = polar(rIn, a0), p2 = polar(rOut, a0), p3 = polar(rOut, a1), p4 = polar(rIn, a1);
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${rOut} ${rOut} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${rIn} ${rIn} 0 0 0 ${p1.x} ${p1.y} Z`;
  }
  const svgNS = 'http://www.w3.org/2000/svg';

  let wheelEls = { svg: null, glow: {}, label: {} };

  function buildWheelSVG(clickable, onPick) {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '-256 -256 512 512');
    svg.setAttribute('class', 'rlt-wheel-svg');

    const backing = document.createElementNS(svgNS, 'circle');
    backing.setAttribute('r', R.backing);
    backing.setAttribute('class', 'rlt-backing');
    svg.appendChild(backing);

    wheelEls.glow = {};
    wheelEls.label = {};

    CIRCLE_ORDER.forEach((num, i) => {
      const a0 = i * 18 - 9, a1 = i * 18 + 9;
      const isEven = i % 2 === 0;
      const singleClass = isEven ? 'black' : 'cream';
      const ringClass = isEven ? 'red' : 'green';
      [
        { r0: R.innerSingleIn, r1: R.innerSingleOut, cls: singleClass },
        { r0: R.tripleIn, r1: R.tripleOut, cls: ringClass },
        { r0: R.outerSingleIn, r1: R.outerSingleOut, cls: singleClass },
        { r0: R.doubleIn, r1: R.doubleOut, cls: ringClass },
      ].forEach((band) => {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', annularPath(band.r0, band.r1, a0, a1));
        path.setAttribute('class', `rlt-band ${band.cls}${clickable ? ' clickable' : ''}`);
        if (clickable) path.addEventListener('click', () => onPick(num));
        svg.appendChild(path);
      });

      const glow = document.createElementNS(svgNS, 'path');
      glow.setAttribute('d', annularPath(R.innerSingleIn, R.doubleOut, a0, a1));
      glow.setAttribute('class', 'rlt-wedge-glow');
      svg.appendChild(glow);
      wheelEls.glow[num] = glow;

      const labelPos = polar((R.doubleOut + R.backing) / 2 + 2, i * 18);
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', labelPos.x);
      label.setAttribute('y', labelPos.y);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('class', 'rlt-label');
      label.textContent = num;
      svg.appendChild(label);
      wheelEls.label[num] = label;
    });

    const bullOuter = document.createElementNS(svgNS, 'circle');
    bullOuter.setAttribute('r', 26);
    bullOuter.setAttribute('class', 'rlt-bull-outer');
    svg.appendChild(bullOuter);
    const bullInner = document.createElementNS(svgNS, 'circle');
    bullInner.setAttribute('r', 12);
    bullInner.setAttribute('class', 'rlt-bull-inner');
    svg.appendChild(bullInner);

    wheelEls.svg = svg;
    return svg;
  }

  function numberAtPointer(rotationDeg) {
    const normalized = ((-rotationDeg % 360) + 360) % 360;
    const idx = Math.round(normalized / 18) % 20;
    return CIRCLE_ORDER[idx];
  }

  // ---------------------------------------------------------------------
  // DOM scaffold
  // ---------------------------------------------------------------------
  function buildDOM() {
    if (uiBuilt) return;
    injectStyles();
    const root = document.createElement('div');
    root.id = 'rlt-root';
    root.innerHTML = `
      <div class="rlt-overlay" id="rlt-overlay">
        <div class="rlt-card" id="rlt-card"></div>
      </div>
    `;
    document.body.appendChild(root);
    uiBuilt = true;
  }

  // ---------------------------------------------------------------------
  // Screens
  // ---------------------------------------------------------------------
  let currentState = null; // last polled /api/roulette/state response

  function showOverlay() {
    qs('#rlt-overlay').classList.add('rlt-open');
  }
  function hideOverlay() {
    qs('#rlt-overlay').classList.remove('rlt-open');
  }

  function renderIntroScreen() {
    const card = qs('#rlt-card');
    const prizesText = (currentState.prizes || []).join(', ');
    card.innerHTML = `
      <h2 class="rlt-title">Kolo Fortuny!</h2>
      <p class="rlt-msg">Rzuc lotka, zakrec kolem i sprobuj trafic ten sam numer.</p>
      <p class="rlt-msg">Mozesz wygrac: <span class="rlt-prizes">${prizesText}</span></p>
      <div class="rlt-btn-row">
        <button class="rlt-primary" id="rlt-continue-btn">Rzucam!</button>
        <button class="rlt-secondary" id="rlt-skip-btn">Pomin</button>
      </div>
    `;
    setTimeout(() => {
      const skipBtn = qs('#rlt-skip-btn');
      if (skipBtn) skipBtn.classList.add('rlt-visible');
    }, SKIP_DELAY_MS);

    qs('#rlt-continue-btn').addEventListener('click', renderThrowScreen);
    qs('#rlt-skip-btn').addEventListener('click', () => {
      dismissedEventId = currentState.eventId;
      hideOverlay();
    });
  }

  let selectedNumber = null;

  function renderThrowScreen() {
    selectedNumber = null;
    const card = qs('#rlt-card');
    card.innerHTML = `
      <h2 class="rlt-title">W co trafiles?</h2>
      <div class="rlt-wheel-zone">
        <div class="rlt-wheel-wrap">
          <div class="rlt-pointer"></div>
          <div id="rlt-wheel-slot"></div>
        </div>
        <div class="rlt-keypad-row" id="rlt-keypad"></div>
        <div class="rlt-confirm-panel">
          <span id="rlt-confirm-label" style="color:rgba(255,255,255,0.4);font-size:0.92rem;">Kliknij pole na tarczy albo uzyj klawiatury.</span>
        </div>
      </div>
    `;
    const svg = buildWheelSVG(true, onNumberPicked);
    qs('#rlt-wheel-slot').appendChild(svg);

    const keypad = qs('#rlt-keypad');
    [...CIRCLE_ORDER].sort((a, b) => a - b).forEach((num) => {
      const btn = document.createElement('button');
      btn.className = 'rlt-key';
      btn.textContent = num;
      btn.dataset.value = num;
      btn.addEventListener('click', () => onNumberPicked(num));
      keypad.appendChild(btn);
    });
  }

  function onNumberPicked(num) {
    selectedNumber = num;
    Object.entries(wheelEls.glow).forEach(([n, el]) => el.classList.toggle('rlt-selected', Number(n) === num));
    document.querySelectorAll('.rlt-key').forEach((k) => k.classList.toggle('rlt-active', Number(k.dataset.value) === num));

    const panel = qs('.rlt-confirm-panel');
    panel.innerHTML = `
      <span class="rlt-hit-value">${num}</span>
      <button class="rlt-primary" id="rlt-confirm-throw-btn" style="padding:9px 20px;font-size:0.92rem;">Zatwierdz</button>
    `;
    qs('#rlt-confirm-throw-btn').addEventListener('click', startSpin);
  }

  function startSpin() {
    const card = qs('#rlt-card');
    qs('.rlt-keypad-row')?.remove();
    qs('.rlt-confirm-panel')?.remove();
    const statusEl = document.createElement('div');
    statusEl.className = 'rlt-status-text';
    statusEl.id = 'rlt-status';
    statusEl.textContent = 'Kolo sie kreci...';
    qs('.rlt-wheel-zone').appendChild(statusEl);

    const readout = document.createElement('div');
    readout.className = 'rlt-readout';
    readout.id = 'rlt-readout';
    qs('.rlt-wheel-zone').insertBefore(readout, statusEl);

    qs('.rlt-title').textContent = 'Kreci sie...';
    qs('.rlt-msg')?.remove();

    const targetIdx = currentState.isWinner
      ? CIRCLE_ORDER.indexOf(selectedNumber)
      : CIRCLE_ORDER.indexOf(pickLosingNumber(selectedNumber));

    const fullSpins = 8 + Math.floor(Math.random() * 5);
    const finalRotation = fullSpins * 360 - targetIdx * 18;
    const duration = 4200 + Math.random() * 1400;

    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = finalRotation * eased;
      wheelEls.svg.style.transform = `rotate(${current}deg)`;
      const readoutEl = qs('#rlt-readout');
      if (readoutEl) readoutEl.textContent = numberAtPointer(current);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        finishSpin();
      }
    }
    requestAnimationFrame(tick);
  }

  function pickLosingNumber(exclude) {
    let n;
    do {
      n = CIRCLE_ORDER[Math.floor(Math.random() * CIRCLE_ORDER.length)];
    } while (n === exclude);
    return n;
  }

  function finishSpin() {
    const won = currentState.isWinner;
    const prizes = currentState.prizes && currentState.prizes.length ? currentState.prizes : ['nagroda'];
    const prize = prizes.join(', ');

    qs('#rlt-status').remove();
    qs('.rlt-title').textContent = 'Wynik';
    const card = qs('#rlt-card');
    const resultBlock = document.createElement('div');
    resultBlock.innerHTML = won
      ? `<p class="rlt-result-title rlt-win">Wygrales!</p><p class="rlt-msg">Zapraszamy do baru po jedna z nagrod: <span class="rlt-prizes">${prize}</span></p>`
      : `<p class="rlt-result-title rlt-lose">Nie tym razem</p><p class="rlt-msg">Sprobuj przy nastepnej okazji!</p>`;
    card.appendChild(resultBlock);

    const btnRow = document.createElement('div');
    btnRow.className = 'rlt-btn-row';
    btnRow.innerHTML = '<button class="rlt-primary" id="rlt-close-btn">Zamknij</button>';
    card.appendChild(btnRow);
    qs('#rlt-close-btn').addEventListener('click', () => {
      dismissedEventId = currentState.eventId;
      hideOverlay();
    });

    reportResult(won, prize);
  }

  function reportResult(won, prize) {
    fetch(`${RLT_API}/api/roulette/spin-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: currentState.eventId, board: currentState.board, won, prize }),
    }).catch(() => {});
  }

  // ---------------------------------------------------------------------
  // Polling
  // ---------------------------------------------------------------------
  async function poll() {
    try {
      const devParam = RLT_DEV_BOARD ? `?devBoard=${encodeURIComponent(RLT_DEV_BOARD)}` : '';
      const res = await fetch(`${RLT_API}/api/roulette/state${devParam}`);
      if (!res.ok) return;
      const data = await res.json();
      currentState = data;

      const overlayOpen = qs('#rlt-overlay')?.classList.contains('rlt-open');
      if (data.active && !data.alreadyUsed && data.eventId !== dismissedEventId && !overlayOpen) {
        buildDOM();
        renderIntroScreen();
        showOverlay();
      }
    } catch (e) {
      // backend unreachable - fail silently, try again next poll
    }
  }

  function init() {
    buildDOM();
    poll();
    pollTimer = setInterval(poll, RLT_POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
