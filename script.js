const screens = {
  home: document.getElementById('home-screen'),
  setup: document.getElementById('setup-screen'),
  game: document.getElementById('game-screen'),
};

const homeLink = document.getElementById('home-link');
const goScoreboardBtn = document.getElementById('go-scoreboard');
const playerCountSelect = document.getElementById('player-count');
const playersInputs = document.getElementById('players-inputs');
const startGameBtn = document.getElementById('start-game');
const startScoreSelect = document.getElementById('start-score');
const backToSetupBtn = document.getElementById('back-to-setup');
const newGameBtn = document.getElementById('new-game');
const currentPlayerCard = document.getElementById('current-player-card');
const playersList = document.getElementById('players-list');
const scoreInput = document.getElementById('score-input');
const submitScoreBtn = document.getElementById('submit-score');
const keypad = document.getElementById('keypad');
const matchTitle = document.getElementById('match-title');
const scoreInputEl = document.getElementById('score-input');
const submitScoreLabel = document.getElementById('submit-score');
const backToSetupLabel = document.getElementById('back-to-setup-label');
const newGameLabel = document.getElementById('new-game-label');
const langPlBtn = document.getElementById('lang-pl');
const langEnBtn = document.getElementById('lang-en');

const state = {
  players: [],
  currentPlayer: 0,
  outMode: 'double',
  startScore: 501,
  turnInput: '',
  lang: 'pl',
};

const keypadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'C'];





function loadImageFromCandidates(img, candidates) {
  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];

  function tryNext(index) {
    if (index >= uniqueCandidates.length) return;

    const candidate = uniqueCandidates[index];
    img.src = candidate;
    img.onerror = () => tryNext(index + 1);
    img.onload = () => {
      img.onerror = null;
    };
  }

  tryNext(0);
}

function initBrandLogos() {
  const logos = document.querySelectorAll('.brand-logo');

  logos.forEach((img) => {
    const original = img.getAttribute('src') || '';
    const normalized = original.startsWith('/') ? original.slice(1) : original;
    const candidates = [
      normalized,
      `/${normalized}`,
      normalized.toLowerCase(),
      `/${normalized.toLowerCase()}`,
      normalized.replace('.png', '.PNG'),
      `/${normalized.replace('.png', '.PNG')}`,
    ];

    loadImageFromCandidates(img, candidates);
  });
}

const t = {
  pl: {
    setupTitle: 'Ustawienia meczu',
    playerCount: 'Liczba zawodników',
    outMode: 'Zakończenie lega',
    startScore: 'Start punktów',
    next: 'Dalej',
    outDouble: 'Double out',
    outSingle: 'Single out',
    backToSetup: 'Edytuj zawodników',
    newGame: 'Nowa gra',
    enterScore: 'Wpisz wynik tury',
    submit: 'Zatwierdź',
    nowThrowing: 'Rzuca teraz',
    remaining: 'Pozostało',
    average: 'Średnia 3-dart',
    checkout: 'Checkout',
    invalidTurn: 'Podaj poprawny wynik tury (0-180).',
    legWin: (name) => `${name} wygrywa lega! Startujemy nowego lega.`,
    modeDouble: 'Double out',
    modeSingle: 'Single out',
  },
  en: {
    setupTitle: 'Match settings',
    playerCount: 'Players count',
    outMode: 'Leg finish mode',
    startScore: 'Starting score',
    next: 'Next',
    outDouble: 'Double out',
    outSingle: 'Single out',
    backToSetup: 'Edit players',
    newGame: 'New game',
    enterScore: 'Enter turn score',
    submit: 'Submit',
    nowThrowing: 'Now throwing',
    remaining: 'Remaining',
    average: '3-dart avg',
    checkout: 'Checkout',
    invalidTurn: 'Enter a valid turn score (0-180).',
    legWin: (name) => `${name} wins the leg! Starting a new leg.`,
    modeDouble: 'Double out',
    modeSingle: 'Single out',
  },
};

function tr(key) {
  return t[state.lang]?.[key] ?? t.pl[key] ?? key;
}

function applyTranslations() {
  const setupTitle = document.getElementById('setup-title');
  const labelPlayerCount = document.getElementById('label-player-count');
  const labelOutMode = document.getElementById('label-out-mode');
  const labelStartScore = document.getElementById('label-start-score');

  if (setupTitle) setupTitle.textContent = tr('setupTitle');
  if (labelPlayerCount) labelPlayerCount.textContent = tr('playerCount');
  if (labelOutMode) labelOutMode.textContent = tr('outMode');
  if (labelStartScore) labelStartScore.textContent = tr('startScore');

  const outDouble = document.querySelector('input[name="out-mode"][value="double"]')?.parentElement;
  const outSingle = document.querySelector('input[name="out-mode"][value="single"]')?.parentElement;
  if (outDouble) outDouble.childNodes[outDouble.childNodes.length - 1].textContent = ` ${tr('outDouble')}`;
  if (outSingle) outSingle.childNodes[outSingle.childNodes.length - 1].textContent = ` ${tr('outSingle')}`;

  if (backToSetupLabel) backToSetupLabel.textContent = tr('backToSetup');
  if (newGameLabel) newGameLabel.textContent = tr('newGame');
  if (scoreInputEl) scoreInputEl.placeholder = tr('enterScore');
  if (submitScoreLabel) submitScoreLabel.textContent = tr('submit');
  if (startGameBtn) startGameBtn.textContent = tr('next');

  langPlBtn?.classList.toggle('active', state.lang === 'pl');
  langEnBtn?.classList.toggle('active', state.lang === 'en');
}


function showScreen(name) {
  Object.entries(screens).forEach(([screenName, element]) => {
    element.classList.toggle('active', screenName === name);
  });
}

function defaultPlayerName(i) {
  return `Zawodnik ${i + 1}`;
}

function renderPlayerInputs() {
  const count = Number(playerCountSelect.value);
  const previous = [...playersInputs.querySelectorAll('input')].map((el) => el.value.trim());

  playersInputs.innerHTML = '';

  for (let i = 0; i < count; i += 1) {
    const input = document.createElement('input');
    input.className = 'player-name';
    input.maxLength = 20;
    input.placeholder = defaultPlayerName(i);
    input.value = previous[i] || '';
    playersInputs.appendChild(input);
  }
}

function collectPlayers() {
  const names = [...playersInputs.querySelectorAll('input')].map((input, i) => input.value.trim() || defaultPlayerName(i));
  const start = Number(startScoreSelect.value);

  state.players = names.map((name, index) => ({
    id: index,
    name,
    score: start,
    legsWon: 0,
    turns: 0,
    scoredPoints: 0,
  }));

  state.currentPlayer = 0;
  state.startScore = start;
  state.outMode = document.querySelector('input[name="out-mode"]:checked').value;
  state.turnInput = '';
  applyTranslations();
}

function getAverage(player) {
  if (!player.turns) return '0.00';
  return ((player.scoredPoints / (player.turns * 3)) * 3).toFixed(2);
}

function isValidFinishingDart(dart, outMode) {
  if (outMode === 'double') {
    return dart.multiplier === 2;
  }
  return dart.multiplier === 1;
}

function buildDarts() {
  const darts = [];
  for (let n = 1; n <= 20; n += 1) {
    darts.push({ label: `S${n}`, value: n, multiplier: 1 });
    darts.push({ label: `D${n}`, value: n * 2, multiplier: 2 });
    darts.push({ label: `T${n}`, value: n * 3, multiplier: 3 });
  }
  darts.push({ label: 'SB', value: 25, multiplier: 1 });
  darts.push({ label: 'DB', value: 50, multiplier: 2 });
  return darts;
}

const darts = buildDarts();
const sortedDarts = [...darts].sort((a, b) => b.value - a.value);

function findCheckout(remaining, outMode) {
  if (remaining <= 1 || remaining > 180) return null;

  for (const d1 of sortedDarts) {
    if (d1.value === remaining && isValidFinishingDart(d1, outMode)) {
      return d1.label;
    }
  }

  for (const d1 of sortedDarts) {
    for (const d2 of sortedDarts) {
      if (d1.value + d2.value === remaining && isValidFinishingDart(d2, outMode)) {
        return `${d1.label} ${d2.label}`;
      }
    }
  }

  for (const d1 of sortedDarts) {
    for (const d2 of sortedDarts) {
      for (const d3 of sortedDarts) {
        if (d1.value + d2.value + d3.value === remaining && isValidFinishingDart(d3, outMode)) {
          return `${d1.label} ${d2.label} ${d3.label}`;
        }
      }
    }
  }

  return null;
}

function renderGame() {
  const current = state.players[state.currentPlayer];
  const checkout = findCheckout(current.score, state.outMode);

  matchTitle.textContent = `${state.outMode === 'double' ? tr('modeDouble') : tr('modeSingle')} • ${state.startScore}`;

  currentPlayerCard.innerHTML = `
    <h3>${tr('nowThrowing')}: ${current.name}</h3>
    <div class="current-player-score">
      <span class="big">${current.score}</span>
      <span>${tr('remaining')}</span>
    </div>
    <div>${tr('average')}: ${getAverage(current)}</div>
    ${checkout ? `<div class="checkout">${tr('checkout')}: ${checkout}</div>` : ''}
  `;

  playersList.innerHTML = '';
  state.players.forEach((player, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${idx === state.currentPlayer ? '🎯 ' : ''}${player.name}</span>
      <strong>${player.score}</strong>
    `;
    playersList.appendChild(li);
  });

  scoreInput.value = state.turnInput;
}

function rotatePlayer() {
  state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
}

function submitTurn() {
  const current = state.players[state.currentPlayer];
  const entered = Number(state.turnInput);

  if (!Number.isInteger(entered) || entered < 0 || entered > 180) {
    alert(tr('invalidTurn'));
    return;
  }

  const remaining = current.score - entered;
  const validCheckout = remaining === 0;

  let bust = false;

  if (entered > current.score) {
    bust = true;
  }

  if (state.outMode === 'double' && remaining === 1) {
    bust = true;
  }

  if (validCheckout) {
    const finishing = findCheckout(current.score, state.outMode);
    if (!finishing) {
      bust = true;
    }
  }

  if (!bust) {
    current.score = remaining;
    current.turns += 1;
    current.scoredPoints += entered;

    if (current.score === 0) {
      alert(tr('legWin')(current.name));
      state.players.forEach((p) => {
        p.score = state.startScore;
      });
    }
  } else {
    current.turns += 1;
  }

  state.turnInput = '';
  rotatePlayer();
  renderGame();
}

function handleHomeReset() {
  state.players = [];
  state.turnInput = '';
  playerCountSelect.value = '2';
  renderPlayerInputs();
  showScreen('home');
}

function buildKeypad() {
  keypad.innerHTML = '';
  keypadLayout.forEach((key) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = key;

    if (key === '⌫' || key === 'C') {
      btn.classList.add('action');
    }

    btn.addEventListener('click', () => {
      if (key === '⌫') {
        state.turnInput = state.turnInput.slice(0, -1);
      } else if (key === 'C') {
        state.turnInput = '';
      } else if (state.turnInput.length < 3) {
        state.turnInput += key;
      }
      scoreInput.value = state.turnInput;
    });

    keypad.appendChild(btn);
  });
}

playerCountSelect.addEventListener('change', renderPlayerInputs);
langPlBtn?.addEventListener('click', () => {
  state.lang = 'pl';
  applyTranslations();
  if (state.players.length && screens.game.classList.contains('active')) renderGame();
});

langEnBtn?.addEventListener('click', () => {
  state.lang = 'en';
  applyTranslations();
  if (state.players.length && screens.game.classList.contains('active')) renderGame();
});

goScoreboardBtn.addEventListener('click', () => {
  showScreen('setup');
});

startGameBtn.addEventListener('click', () => {
  collectPlayers();
  showScreen('game');
  renderGame();
});

backToSetupBtn.addEventListener('click', () => {
  const count = state.players.length || 2;
  playerCountSelect.value = String(count);
  renderPlayerInputs();

  const inputs = [...playersInputs.querySelectorAll('input')];
  inputs.forEach((input, i) => {
    if (state.players[i]) {
      input.value = state.players[i].name;
    }
  });

  startScoreSelect.value = String(state.startScore || 501);
  const outRadio = document.querySelector(`input[name="out-mode"][value="${state.outMode}"]`);
  if (outRadio) outRadio.checked = true;
  showScreen('setup');
});

newGameBtn.addEventListener('click', handleHomeReset);
homeLink.addEventListener('click', handleHomeReset);

submitScoreBtn.addEventListener('click', submitTurn);

initBrandLogos();
buildKeypad();
renderPlayerInputs();
applyTranslations();
showScreen('home');
