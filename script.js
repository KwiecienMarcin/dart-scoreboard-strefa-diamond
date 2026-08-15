const screens = {
  home: document.getElementById('home-screen'),
  setup: document.getElementById('setup-screen'),
  game: document.getElementById('game-screen'),
};

const homeLink = document.getElementById('home-link');
const rulesLink = document.getElementById('rules-link');
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
const keypad = document.getElementById('keypad');
const keypadDarts = document.getElementById('keypad-darts');
const inputSideEl = document.querySelector('.input-side');
const modeSumBtn = document.getElementById('mode-sum');
const modeDartsBtn = document.getElementById('mode-darts');
const dartSlotsEl = document.getElementById('dart-slots');
const dartSumEl = document.getElementById('dart-sum');
const submitDartsBtn = document.getElementById('submit-darts');
const matchTitle = document.getElementById('match-title');
const scoreInputEl = document.getElementById('score-input');
const backToSetupLabel = document.getElementById('back-to-setup-label');
const newGameLabel = document.getElementById('new-game-label');
const langPlBtn = document.getElementById('lang-pl');
const langEnBtn = document.getElementById('lang-en');
const inputModeHeadingEl = document.getElementById('input-mode-heading');
const sumCaptionEl = document.getElementById('sum-caption');
const dartsCaptionEl = document.getElementById('darts-caption');
const toastEl = document.getElementById('toast');
const rulesModal = document.getElementById('rules-modal');
const rulesClose = document.getElementById('rules-close');
const rulesTitleEl = document.getElementById('rules-title');
const rulesBodyEl = document.getElementById('rules-body');
const legwinModal = document.getElementById('legwin-modal');
const legwinClose = document.getElementById('legwin-close');
const legwinLabelEl = document.getElementById('legwin-label');
const legwinNameEl = document.getElementById('legwin-name');

const state = {
  players: [],
  currentPlayer: 0,
  outMode: 'double',
  startScore: 501,
  turnInput: '',
  lang: 'pl',
  inputMode: 'darts',
  turnDarts: [],
  activeMultiplier: 1,
};

let previousScores = {};
let lastActivePlayerIndex = -1;
let toastTimer = null;
let legWinTimer = null;

const keypadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'SUBMIT'];

const dartsKeypadLayout = [
  '1', '2', '3', '4', '5',
  '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15',
  '16', '17', '18', '19', '20',
  '0', '25', 'DOUBLE', 'TRIPLE', 'UNDO',
];

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
    homeLink: 'Strona główna',
    enterScore: 'Wpisz sumę rzutów',
    submit: 'Zatwierdź',
    nowThrowing: 'Rzuca teraz',
    remaining: 'Pozostało',
    average: 'Średnia 3-dart',
    checkout: 'Checkout',
    invalidTurn: 'Podaj poprawny wynik tury (0-180).',
    legWin: (name) => `${name} wygrywa lega!`,
    modeDouble: 'Double out',
    modeSingle: 'Single out',
    inputModeHeading: 'Wybierz sposób wpisywania punktów',
    inputModeSum: 'Suma rzutów',
    inputModeDarts: 'Pojedyncze rzuty',
    sumCaption: 'Grasz w darta od dawna i dobrze liczysz w pamięci? Ten tryb jest dla Ciebie.',
    dartsCaption: 'Wpisuj każdy z rzutów osobno — bez liczenia.',
    undoEntry: 'Cofnij wpisanie',
    rulesButton: 'Zasady darta',
    rulesTitle: 'Zasady gry w darta',
    legWinBadge: 'WYGRANA LEGA',
    legWinOk: 'Dalej',
    rulesSections: [
      { title: 'Cel gry', body: 'Każdy zawodnik zaczyna z ustaloną liczbą punktów (301, 501 lub 701) i rzuca po trzy lotki w turze, dążąc do zejścia z wynikiem dokładnie do zera.' },
      { title: 'Wartość pól', body: 'Pojedyncze pole (1-20) daje jego wartość. Double (zewnętrzny cienki pierścień) mnoży ją razy 2, Triple (wewnętrzny pierścień) razy 3. Zewnętrzne koło środka to 25 punktów (Bull), środek tarczy to 50 punktów (Bullseye).' },
      { title: 'Double Out', body: 'Aby zakończyć lega, ostatnia lotka musi trafić w pole double (lub w Bullseye, czyli 50). Zejście do zera bez trafienia w double na finiszu to bust — tura się nie liczy.' },
      { title: 'Single Out', body: 'W tym trybie do zakończenia lega wystarczy dowolny rzut, który sprowadzi wynik dokładnie do zera — bez wymogu trafienia w double.' },
      { title: 'Bust', body: 'Jeśli rzut zejdzie poniżej zera, zostawi dokładnie 1 punkt (przy Double Out) albo trafi zero bez wymaganego finiszu, cała tura zostaje anulowana, a wynik wraca do stanu sprzed tury.' },
      { title: 'Nowy leg', body: 'Po wygranej ledze wszyscy zawodnicy wracają do wybranej liczby punktów startowych i rozgrywka toczy się dalej.' },
    ],
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
    homeLink: 'Home',
    enterScore: 'Enter throws sum',
    submit: 'Submit',
    nowThrowing: 'Now throwing',
    remaining: 'Remaining',
    average: '3-dart avg',
    checkout: 'Checkout',
    invalidTurn: 'Enter a valid turn score (0-180).',
    legWin: (name) => `${name} wins the leg!`,
    modeDouble: 'Double out',
    modeSingle: 'Single out',
    inputModeHeading: 'Choose how to enter points',
    inputModeSum: 'Throws sum',
    inputModeDarts: 'Single throws',
    sumCaption: "Been playing darts a while and good at mental math? This mode's for you.",
    dartsCaption: 'Enter every throw separately — no counting needed.',
    undoEntry: 'Undo entry',
    rulesButton: 'Darts rules',
    rulesTitle: 'Darts rules',
    legWinBadge: 'LEG WON',
    legWinOk: 'Continue',
    rulesSections: [
      { title: 'Goal', body: 'Each player starts with a fixed score (301, 501 or 701) and throws three darts per turn, aiming to bring the score down to exactly zero.' },
      { title: 'Segment values', body: 'A single segment (1-20) scores its face value. Double (thin outer ring) multiplies it by 2, Triple (inner ring) by 3. The outer bull ring scores 25, the center bullseye scores 50.' },
      { title: 'Double Out', body: 'To win a leg, the final dart of the turn must land on a double (or the bullseye, 50). Reaching zero without a double finish is a bust — the whole turn is voided.' },
      { title: 'Single Out', body: 'In this mode any throw that brings the score to exactly zero finishes the leg — no double required.' },
      { title: 'Bust', body: 'If a throw would take the score below zero, leave exactly 1 point (in Double Out), or reach zero without a valid finish, the whole turn is cancelled and the score reverts to what it was before the turn.' },
      { title: 'New leg', body: 'After a leg is won, every player resets to the chosen starting score and play continues.' },
    ],
  },
};

function tr(key) {
  return t[state.lang]?.[key] ?? t.pl[key] ?? key;
}

function bounceClass(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function renderRulesContent() {
  if (!rulesBodyEl) return;
  const sections = tr('rulesSections');
  rulesBodyEl.innerHTML = sections.map((s) => `<h3>${s.title}</h3><p>${s.body}</p>`).join('');
}

function openModal(overlay) {
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeModal(overlay) {
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove('show');
  void toastEl.offsetWidth;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

function showLegWinModal(name) {
  if (legwinNameEl) legwinNameEl.textContent = tr('legWin')(name);
  openModal(legwinModal);
  clearTimeout(legWinTimer);
  legWinTimer = setTimeout(() => closeModal(legwinModal), 3200);
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
  if (rulesLink) rulesLink.textContent = tr('rulesButton');
  if (rulesTitleEl) rulesTitleEl.textContent = tr('rulesTitle');
  if (scoreInputEl) scoreInputEl.placeholder = tr('enterScore');
  if (submitDartsBtn) submitDartsBtn.textContent = tr('submit');
  if (inputModeHeadingEl) inputModeHeadingEl.textContent = tr('inputModeHeading');
  if (modeSumBtn) modeSumBtn.textContent = tr('inputModeSum');
  if (modeDartsBtn) modeDartsBtn.textContent = tr('inputModeDarts');
  if (sumCaptionEl) sumCaptionEl.textContent = tr('sumCaption');
  if (dartsCaptionEl) dartsCaptionEl.textContent = tr('dartsCaption');
  if (legwinLabelEl) legwinLabelEl.textContent = tr('legWinBadge');
  if (legwinClose) legwinClose.textContent = tr('legWinOk');
  if (startGameBtn) startGameBtn.textContent = tr('next');

  const submitCell = keypad?.querySelector('.submit-cell');
  if (submitCell) submitCell.textContent = tr('submit');

  const undoBtn = keypadDarts?.querySelector('[data-key="UNDO"]');
  if (undoBtn) undoBtn.textContent = tr('undoEntry');

  renderRulesContent();

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
  state.turnDarts = [];
  state.activeMultiplier = 1;
  previousScores = {};
  lastActivePlayerIndex = -1;
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

  const currentChanged = previousScores[current.id] !== undefined && previousScores[current.id] !== current.score;
  const playerRotated = lastActivePlayerIndex !== state.currentPlayer;
  lastActivePlayerIndex = state.currentPlayer;

  currentPlayerCard.innerHTML = `
    <h3>${tr('nowThrowing')}: ${current.name}</h3>
    <div class="current-player-score">
      <span class="big${currentChanged ? ' score-pulse' : ''}">${current.score}</span>
      <span>${tr('remaining')}</span>
    </div>
    <div>${tr('average')}: ${getAverage(current)}</div>
    ${checkout ? `<div class="checkout">${tr('checkout')}: ${checkout}</div>` : ''}
  `;

  if (playerRotated) {
    bounceClass(currentPlayerCard, 'card-enter');
  }

  playersList.innerHTML = '';
  state.players.forEach((player, idx) => {
    const changed = previousScores[player.id] !== undefined && previousScores[player.id] !== player.score;
    const li = document.createElement('li');
    li.className = idx === state.currentPlayer ? 'is-current' : '';
    li.innerHTML = `
      <span>${player.name}</span>
      <strong class="${changed ? 'score-pulse' : ''}">${player.score}</strong>
    `;
    playersList.appendChild(li);
    previousScores[player.id] = player.score;
  });

  scoreInput.value = state.turnInput;
  renderDartSlots();
  updateDartsKeypadState();
}

function renderDartSlots() {
  if (!dartSlotsEl) return;
  const slots = dartSlotsEl.querySelectorAll('.dart-slot');
  slots.forEach((slot, i) => {
    const dart = state.turnDarts[i];
    slot.textContent = dart ? String(dart.value) : '';
    slot.classList.toggle('filled', Boolean(dart));
  });

  if (dartSumEl) {
    const sum = state.turnDarts.reduce((acc, d) => acc + d.value, 0);
    dartSumEl.textContent = String(sum);
  }
}

function updateDartsKeypadState() {
  if (!keypadDarts) return;
  const doubleBtn = keypadDarts.querySelector('[data-key="DOUBLE"]');
  const tripleBtn = keypadDarts.querySelector('[data-key="TRIPLE"]');
  doubleBtn?.classList.toggle('mult-active', state.activeMultiplier === 2);
  tripleBtn?.classList.toggle('mult-active', state.activeMultiplier === 3);

  const full = state.turnDarts.length >= 3;
  keypadDarts.querySelectorAll('button').forEach((btn) => {
    const key = btn.dataset.key;
    if (key === 'DOUBLE' || key === 'TRIPLE' || key === 'UNDO') return;
    btn.disabled = full;
  });
}

function rotatePlayer() {
  state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
}

function submitTurn() {
  const current = state.players[state.currentPlayer];
  const entered = Number(state.turnInput);

  if (!Number.isInteger(entered) || entered < 0 || entered > 180) {
    showToast(tr('invalidTurn'));
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

  let legWon = false;

  if (!bust) {
    current.score = remaining;
    current.turns += 1;
    current.scoredPoints += entered;

    if (current.score === 0) {
      legWon = true;
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

  if (legWon) {
    showLegWinModal(current.name);
  }
}

function handleHomeReset() {
  state.players = [];
  state.turnInput = '';
  state.turnDarts = [];
  state.activeMultiplier = 1;
  previousScores = {};
  lastActivePlayerIndex = -1;
  playerCountSelect.value = '2';
  renderPlayerInputs();
  showScreen('home');
}

function setInputMode(mode) {
  state.inputMode = mode;
  state.turnInput = '';
  state.turnDarts = [];
  state.activeMultiplier = 1;

  modeSumBtn?.classList.toggle('active', mode === 'sum');
  modeDartsBtn?.classList.toggle('active', mode === 'darts');
  inputSideEl?.classList.toggle('mode-sum', mode === 'sum');
  inputSideEl?.classList.toggle('mode-darts', mode === 'darts');

  renderGame();
}

function handleDartKey(key) {
  if (key === 'UNDO') {
    if (state.activeMultiplier !== 1) {
      state.activeMultiplier = 1;
    } else {
      state.turnDarts.pop();
    }
    renderGame();
    return;
  }

  if (key === 'DOUBLE') {
    state.activeMultiplier = state.activeMultiplier === 2 ? 1 : 2;
    renderGame();
    return;
  }

  if (key === 'TRIPLE') {
    state.activeMultiplier = state.activeMultiplier === 3 ? 1 : 3;
    renderGame();
    return;
  }

  if (state.turnDarts.length >= 3) return;

  const base = Number(key);
  let multiplier = state.activeMultiplier;
  if (base === 0) multiplier = 1;
  if (base === 25 && multiplier === 3) multiplier = 1;

  state.turnDarts.push({ base, multiplier, value: base * multiplier });
  state.activeMultiplier = 1;

  renderGame();
}

function submitDartsTurn() {
  if (!state.turnDarts.length) return;

  const current = state.players[state.currentPlayer];
  const sum = state.turnDarts.reduce((acc, d) => acc + d.value, 0);
  const lastDart = state.turnDarts[state.turnDarts.length - 1];
  const remaining = current.score - sum;

  let bust = false;

  if (remaining < 0) {
    bust = true;
  } else if (state.outMode === 'double' && remaining === 1) {
    bust = true;
  } else if (remaining === 0 && !isValidFinishingDart(lastDart, state.outMode)) {
    bust = true;
  }

  let legWon = false;

  if (!bust) {
    current.score = remaining;
    current.turns += 1;
    current.scoredPoints += sum;

    if (current.score === 0) {
      legWon = true;
      state.players.forEach((p) => {
        p.score = state.startScore;
      });
    }
  } else {
    current.turns += 1;
  }

  state.turnDarts = [];
  state.activeMultiplier = 1;
  rotatePlayer();
  renderGame();

  if (legWon) {
    showLegWinModal(current.name);
  }
}

function buildKeypad() {
  keypad.innerHTML = '';
  keypadLayout.forEach((key) => {
    const btn = document.createElement('button');
    btn.type = 'button';

    if (key === 'SUBMIT') {
      btn.textContent = tr('submit');
      btn.classList.add('action', 'submit-cell');
    } else {
      btn.textContent = key;
      if (key === '⌫') btn.classList.add('action');
    }

    btn.addEventListener('click', () => {
      bounceClass(btn, key === 'SUBMIT' ? 'pressed' : 'key-flash');

      if (key === 'SUBMIT') {
        submitTurn();
        return;
      }

      if (key === '⌫') {
        state.turnInput = state.turnInput.slice(0, -1);
      } else if (state.turnInput.length < 3) {
        state.turnInput += key;
      }
      scoreInput.value = state.turnInput;
    });

    keypad.appendChild(btn);
  });
}

function buildDartsKeypad() {
  if (!keypadDarts) return;
  keypadDarts.innerHTML = '';
  dartsKeypadLayout.forEach((key) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.key = key;

    if (key === 'UNDO') {
      btn.textContent = tr('undoEntry');
      btn.classList.add('action', 'undo-btn');
    } else if (key === 'DOUBLE' || key === 'TRIPLE') {
      btn.textContent = key;
      btn.classList.add('action', 'mult-btn');
    } else {
      btn.textContent = key;
    }

    btn.addEventListener('click', () => {
      bounceClass(btn, 'key-flash');
      handleDartKey(key);
    });
    keypadDarts.appendChild(btn);
  });
}

modeSumBtn?.addEventListener('click', () => setInputMode('sum'));
modeDartsBtn?.addEventListener('click', () => setInputMode('darts'));
submitDartsBtn?.addEventListener('click', () => {
  bounceClass(submitDartsBtn, 'pressed');
  submitDartsTurn();
});

rulesLink?.addEventListener('click', () => openModal(rulesModal));
rulesClose?.addEventListener('click', () => closeModal(rulesModal));
rulesModal?.addEventListener('click', (e) => {
  if (e.target === rulesModal) closeModal(rulesModal);
});

legwinClose?.addEventListener('click', () => closeModal(legwinModal));
legwinModal?.addEventListener('click', (e) => {
  if (e.target === legwinModal) closeModal(legwinModal);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(rulesModal);
    closeModal(legwinModal);
  }
});

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

buildKeypad();
buildDartsKeypad();
renderPlayerInputs();
applyTranslations();
showScreen('home');
