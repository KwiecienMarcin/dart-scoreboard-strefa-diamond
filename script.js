const screens = {
  home: document.getElementById('home-screen'),
  setup: document.getElementById('setup-screen'),
  game: document.getElementById('game-screen'),
};

const homeLink = document.getElementById('home-link');
const rulesLink = document.getElementById('rules-link');
const goScoreboardBtn = document.getElementById('go-scoreboard');
const playerCountPicker = document.getElementById('player-count-picker');
const playersInputs = document.getElementById('players-inputs');
const startGameBtn = document.getElementById('start-game');
const startScorePicker = document.getElementById('start-score-picker');
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
const dartSumLabelEl = document.getElementById('dart-sum-label');
const submitDartsBtn = document.getElementById('submit-darts');
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
const legwinJokeEl = document.getElementById('legwin-joke');
const liveBannerEl = document.getElementById('live-banner');
const nakkaBtn = document.getElementById('nakka-btn');
const nakkaModal = document.getElementById('nakka-modal');
const nakkaClose = document.getElementById('nakka-close');
const nakkaPinInput = document.getElementById('nakka-pin-input');
const nakkaConfirm = document.getElementById('nakka-confirm');
const nakkaError = document.getElementById('nakka-error');

const NAKKA_URL = 'https://n01darts.com/n01/';

const state = {
  players: [],
  currentPlayer: 0,
  outMode: 'double',
  startScore: 301,
  turnInput: '',
  lang: 'pl',
  inputMode: 'darts',
  turnDarts: [],
  activeMultiplier: 1,
  history: [],
};

let previousScores = {};
let lastActivePlayerIndex = -1;
let toastTimer = null;
let legWinTimer = null;
let liveBannerTimer = null;
let selectedPlayerCount = 2;
let selectedStartScore = 301;

const legWinJokes = {
  pl: [
    { min: 1, text: () => 'Dolejcie sobie piwka przy barze, zasłużyliście.' },
    { min: 1, text: () => 'Ekipa od tarczy 20 już się z was śmieje.' },
    { min: 1, text: () => 'Barman już liczy, ile dziś piw wypiliście.' },
    { min: 2, text: (c) => `${c.loser} stawia kolejkę, taka tradycja w Strefie Diamond.` },
    { min: 2, text: (c) => `${c.loser}, po takiej grze należy ci się tylko jedno. Kolejka dla reszty.` },
    { min: 2, text: (c) => `${c.loser} dziś grał jakby lotki widział pierwszy raz. Kolejka się należy.` },
    { min: 2, text: (c) => `${c.winner} wygrał tego lega, ale ${c.thirdOrSecond} już szykuje rewanż przy stole bilardowym.` },
    { min: 2, text: (c) => `${c.winner} kontra ${c.loser}. I chyba wiadomo, kto dziś stawia.` },
    { min: 3, text: (c) => `${c.third}, podgoń wynik, bo zaraz stawiasz bilard dla całej ekipy.` },
    { min: 3, text: (c) => `${c.third} trzyma się kurczowo trzeciego miejsca. Jeszcze chwila i leci stawiać bilard.` },
  ],
  en: [
    { min: 1, text: () => 'Grab a round at the bar, you earned it.' },
    { min: 1, text: () => 'The crew at board 20 is already laughing at you.' },
    { min: 1, text: () => "The bartender's already counting how many beers you had tonight." },
    { min: 2, text: (c) => `${c.loser} is buying the next round. House rule at Strefa Diamond.` },
    { min: 2, text: (c) => `${c.loser}, after that game you owe everyone a round.` },
    { min: 2, text: (c) => `${c.loser} played like they'd never seen a dart before. Round's on them.` },
    { min: 2, text: (c) => `${c.winner} took the leg, but ${c.thirdOrSecond} is already plotting a pool table rematch.` },
    { min: 2, text: (c) => `${c.winner} versus ${c.loser}. We all know who's buying tonight.` },
    { min: 3, text: (c) => `${c.third}, better catch up, you're about to be buying pool for everyone.` },
    { min: 3, text: (c) => `${c.third} is clinging to third place. One more round and they're off to buy pool.` },
  ],
};

const lowScoreJokes = {
  pl: [
    (c) => `${c.player}, ${c.amount} punktów w trzech rzutach? Wydaje mi się, że da się rzucić więcej.`,
    (c) => `${c.player} chyba dziś trenuje rzucanie do podłogi. ${c.amount} punktów.`,
    (c) => `${c.amount} punktów, ${c.player}? Tarcza jest tuż przed tobą, przysięgam.`,
  ],
  en: [
    (c) => `${c.player}, ${c.amount} points in three darts? I feel like you can do better than that.`,
    (c) => `${c.player} might be practicing throwing at the floor today. ${c.amount} points.`,
    (c) => `${c.amount} points, ${c.player}? The board is right in front of you, I promise.`,
  ],
};

const liveBannerJokes = {
  pl: [
    (c) => `${c.target}, podgoń wynik, bo ${c.player} zaraz kończy lega.`,
    (c) => `${c.target}, ostatni dzwonek. ${c.player} ma szansę na checkout.`,
    (c) => `Uwaga, ${c.player} może skończyć tę turę. ${c.target}, teraz albo nigdy.`,
  ],
  en: [
    (c) => `${c.target}, catch up, ${c.player} is about to finish the leg.`,
    (c) => `${c.target}, last call. ${c.player} has a shot at checkout.`,
    (c) => `Heads up, ${c.player} could close this out. ${c.target}, now or never.`,
  ],
};

function buildLegWinContext(standings) {
  const winner = standings[0];
  const loser = standings[standings.length - 1];
  const thirdOrSecondIdx = standings.length >= 3 ? 2 : 1;
  const thirdOrSecond = standings[Math.min(thirdOrSecondIdx, standings.length - 1)];
  const third = standings.length >= 3 ? standings[2] : null;
  return {
    winner: winner.name,
    loser: loser.name,
    thirdOrSecond: thirdOrSecond.name,
    third: third ? third.name : '',
  };
}

function pickLegWinJoke(standings) {
  const pool = legWinJokes[state.lang] ?? legWinJokes.pl;
  const eligible = pool.filter((j) => j.min <= standings.length);
  const chosen = eligible[Math.floor(Math.random() * eligible.length)];
  return chosen.text(buildLegWinContext(standings));
}

const keypadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'UNDO', '0', 'SUBMIT'];

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
    dartsSumLabel: 'Suma',
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
    dartsSumLabel: 'Sum',
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

function setupTilePicker(container, onSelect) {
  if (!container) return { setActive: () => {} };
  const buttons = [...container.querySelectorAll('.tile-btn')];

  function setActive(value) {
    buttons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.value === String(value));
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      bounceClass(btn, 'key-flash');
      setActive(btn.dataset.value);
      onSelect(btn.dataset.value);
    });
  });

  return { setActive };
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

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getNakkaPin() {
  const week = getISOWeekNumber(new Date());
  return String(week + 10);
}

function openNakkaModal() {
  if (!nakkaModal) return;
  if (nakkaError) nakkaError.hidden = true;
  if (nakkaPinInput) nakkaPinInput.value = '';
  openModal(nakkaModal);
  nakkaPinInput?.focus();
}

function submitNakkaPin() {
  if (!nakkaPinInput) return;
  if (nakkaPinInput.value.trim() === getNakkaPin()) {
    closeModal(nakkaModal);
    window.location.href = NAKKA_URL;
  } else {
    if (nakkaError) nakkaError.hidden = false;
    bounceClass(nakkaPinInput, 'key-flash');
  }
}

function showLegWinModal(name, standings) {
  if (legwinNameEl) legwinNameEl.textContent = tr('legWin')(name);
  if (legwinJokeEl) {
    const sorted = [...standings].sort((a, b) => a.score - b.score);
    legwinJokeEl.textContent = pickLegWinJoke(sorted);
  }
  openModal(legwinModal);
  clearTimeout(legWinTimer);
  legWinTimer = setTimeout(() => closeModal(legwinModal), 4500);
}

function showLiveBanner(message) {
  if (!liveBannerEl) return;
  liveBannerEl.textContent = message;
  liveBannerEl.classList.remove('show');
  void liveBannerEl.offsetWidth;
  liveBannerEl.classList.add('show');
  clearTimeout(liveBannerTimer);
  liveBannerTimer = setTimeout(() => liveBannerEl.classList.remove('show'), 4000);
}

function maybeRoastLowScore(playerName, amount) {
  if (!Number.isInteger(amount) || amount > 10) return;
  const pool = lowScoreJokes[state.lang] ?? lowScoreJokes.pl;
  const template = pool[Math.floor(Math.random() * pool.length)];
  showLiveBanner(template({ player: playerName, amount }));
}

let lastBannerPlayerIndex = -1;

function maybeTriggerLiveBanner(current, checkoutAvailable) {
  if (!checkoutAvailable) return;
  if (lastBannerPlayerIndex === state.currentPlayer) return;
  lastBannerPlayerIndex = state.currentPlayer;

  const others = state.players.filter((p) => p.id !== current.id);
  if (!others.length) return;

  const worst = [...others].sort((a, b) => b.score - a.score)[0];
  const pool = liveBannerJokes[state.lang] ?? liveBannerJokes.pl;
  const template = pool[Math.floor(Math.random() * pool.length)];
  showLiveBanner(template({ target: worst.name, player: current.name }));
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

  const outDoubleLabel = document.querySelector('label[for="out-mode-double"]');
  const outSingleLabel = document.querySelector('label[for="out-mode-single"]');
  if (outDoubleLabel) outDoubleLabel.textContent = tr('outDouble');
  if (outSingleLabel) outSingleLabel.textContent = tr('outSingle');

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
  if (dartSumLabelEl) dartSumLabelEl.textContent = tr('dartsSumLabel');
  if (legwinLabelEl) legwinLabelEl.textContent = tr('legWinBadge');
  if (legwinClose) legwinClose.textContent = tr('legWinOk');
  if (startGameBtn) startGameBtn.textContent = tr('next');

  const submitCell = keypad?.querySelector('.submit-cell');
  if (submitCell) submitCell.textContent = tr('submit');

  document.querySelectorAll('[data-key="UNDO"]').forEach((btn) => {
    btn.textContent = tr('undoEntry');
  });

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

const playerCountControl = setupTilePicker(playerCountPicker, (value) => {
  selectedPlayerCount = Number(value);
  renderPlayerInputs();
});
playerCountControl.setActive(String(selectedPlayerCount));

const startScoreControl = setupTilePicker(startScorePicker, (value) => {
  selectedStartScore = Number(value);
});
startScoreControl.setActive(String(selectedStartScore));

function renderPlayerInputs() {
  const count = selectedPlayerCount;
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
  const start = selectedStartScore;

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
  state.history = [];
  previousScores = {};
  lastActivePlayerIndex = -1;
  lastBannerPlayerIndex = -1;
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

  const currentChanged = previousScores[current.id] !== undefined && previousScores[current.id] !== current.score;
  const playerRotated = lastActivePlayerIndex !== state.currentPlayer;
  lastActivePlayerIndex = state.currentPlayer;

  currentPlayerCard.innerHTML = `
    <p class="now-throwing-label">${tr('nowThrowing')}</p>
    <h3 class="current-player-name">${current.name}</h3>
    <div class="current-player-score">
      <span class="big${currentChanged ? ' score-pulse' : ''}">${current.score}</span>
      <span class="remaining-label">${tr('remaining')}</span>
    </div>
    <div class="avg-line">${tr('average')}: ${getAverage(current)}</div>
    ${checkout ? `<div class="checkout">${tr('checkout')}: ${checkout}</div>` : ''}
  `;

  if (playerRotated) {
    bounceClass(currentPlayerCard, 'card-enter');
  }

  if (playerRotated && state.players.length >= 2) {
    maybeTriggerLiveBanner(current, Boolean(checkout));
  }

  const rankById = {};
  [...state.players]
    .sort((a, b) => a.score - b.score)
    .forEach((p, i) => {
      rankById[p.id] = i + 1;
    });

  playersList.innerHTML = '';
  state.players.forEach((player, idx) => {
    const changed = previousScores[player.id] !== undefined && previousScores[player.id] !== player.score;
    const li = document.createElement('li');
    li.className = idx === state.currentPlayer ? 'is-current' : '';
    li.innerHTML = `
      <span class="player-rank">${rankById[player.id]}</span>
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

function pushHistory() {
  state.history.push({
    players: state.players.map((p) => ({ ...p })),
    currentPlayer: state.currentPlayer,
  });
}

function undoLastTurn() {
  const last = state.history.pop();
  if (!last) return;

  state.players = last.players.map((p) => ({ ...p }));
  state.currentPlayer = last.currentPlayer;

  clearTimeout(legWinTimer);
  closeModal(legwinModal);
  renderGame();
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

  pushHistory();

  let legWon = false;
  let legStandings = null;

  if (!bust) {
    current.score = remaining;
    current.turns += 1;
    current.scoredPoints += entered;

    if (current.score === 0) {
      legWon = true;
      legStandings = state.players.map((p) => ({ id: p.id, name: p.name, score: p.score }));
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
    showLegWinModal(current.name, legStandings);
  } else {
    maybeRoastLowScore(current.name, entered);
  }
}

function handleHomeReset() {
  state.players = [];
  state.turnInput = '';
  state.turnDarts = [];
  state.activeMultiplier = 1;
  state.history = [];
  previousScores = {};
  lastActivePlayerIndex = -1;
  lastBannerPlayerIndex = -1;
  selectedPlayerCount = 2;
  playerCountControl.setActive('2');
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
      renderGame();
    } else if (state.turnDarts.length) {
      state.turnDarts.pop();
      renderGame();
    } else {
      undoLastTurn();
    }
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

  pushHistory();

  let legWon = false;
  let legStandings = null;

  if (!bust) {
    current.score = remaining;
    current.turns += 1;
    current.scoredPoints += sum;

    if (current.score === 0) {
      legWon = true;
      legStandings = state.players.map((p) => ({ id: p.id, name: p.name, score: p.score }));
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
    showLegWinModal(current.name, legStandings);
  } else {
    maybeRoastLowScore(current.name, sum);
  }
}

function buildKeypad() {
  keypad.innerHTML = '';
  keypadLayout.forEach((key) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.key = key;

    if (key === 'SUBMIT') {
      btn.textContent = tr('submit');
      btn.classList.add('action', 'submit-cell');
    } else if (key === 'UNDO') {
      btn.textContent = tr('undoEntry');
      btn.classList.add('action', 'undo-btn');
    } else {
      btn.textContent = key;
    }

    btn.addEventListener('click', () => {
      bounceClass(btn, key === 'SUBMIT' ? 'pressed' : 'key-flash');

      if (key === 'SUBMIT') {
        submitTurn();
        return;
      }

      if (key === 'UNDO') {
        if (state.turnInput.length) {
          state.turnInput = state.turnInput.slice(0, -1);
          scoreInput.value = state.turnInput;
        } else {
          undoLastTurn();
        }
        return;
      }

      if (state.turnInput.length < 3) {
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

modeSumBtn?.addEventListener('click', () => {
  bounceClass(modeSumBtn, 'key-flash');
  setInputMode('sum');
});
modeDartsBtn?.addEventListener('click', () => {
  bounceClass(modeDartsBtn, 'key-flash');
  setInputMode('darts');
});
submitDartsBtn?.addEventListener('click', () => {
  bounceClass(submitDartsBtn, 'pressed');
  submitDartsTurn();
});

rulesLink?.addEventListener('click', () => {
  bounceClass(rulesLink, 'pressed');
  openModal(rulesModal);
});
rulesClose?.addEventListener('click', () => closeModal(rulesModal));
rulesModal?.addEventListener('click', (e) => {
  if (e.target === rulesModal) closeModal(rulesModal);
});

legwinClose?.addEventListener('click', () => {
  bounceClass(legwinClose, 'pressed');
  closeModal(legwinModal);
});
legwinModal?.addEventListener('click', (e) => {
  if (e.target === legwinModal) closeModal(legwinModal);
});

nakkaBtn?.addEventListener('click', () => {
  bounceClass(nakkaBtn, 'key-flash');
  openNakkaModal();
});
nakkaClose?.addEventListener('click', () => closeModal(nakkaModal));
nakkaModal?.addEventListener('click', (e) => {
  if (e.target === nakkaModal) closeModal(nakkaModal);
});
nakkaConfirm?.addEventListener('click', () => {
  bounceClass(nakkaConfirm, 'pressed');
  submitNakkaPin();
});
nakkaPinInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitNakkaPin();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(rulesModal);
    closeModal(legwinModal);
    closeModal(nakkaModal);
  }
});

langPlBtn?.addEventListener('click', () => {
  bounceClass(langPlBtn, 'key-flash');
  state.lang = 'pl';
  applyTranslations();
  if (state.players.length && screens.game.classList.contains('active')) renderGame();
});

langEnBtn?.addEventListener('click', () => {
  bounceClass(langEnBtn, 'key-flash');
  state.lang = 'en';
  applyTranslations();
  if (state.players.length && screens.game.classList.contains('active')) renderGame();
});

goScoreboardBtn.addEventListener('click', () => {
  bounceClass(goScoreboardBtn, 'pressed');
  showScreen('setup');
});

startGameBtn.addEventListener('click', () => {
  bounceClass(startGameBtn, 'pressed');
  collectPlayers();
  showScreen('game');
  renderGame();
});

backToSetupBtn.addEventListener('click', () => {
  bounceClass(backToSetupBtn, 'pressed');
  const count = state.players.length || 2;
  selectedPlayerCount = count;
  playerCountControl.setActive(String(count));
  renderPlayerInputs();

  const inputs = [...playersInputs.querySelectorAll('input')];
  inputs.forEach((input, i) => {
    if (state.players[i]) {
      input.value = state.players[i].name;
    }
  });

  selectedStartScore = state.startScore || 301;
  startScoreControl.setActive(String(selectedStartScore));
  const outRadio = document.querySelector(`input[name="out-mode"][value="${state.outMode}"]`);
  if (outRadio) outRadio.checked = true;
  showScreen('setup');
});

newGameBtn.addEventListener('click', () => {
  bounceClass(newGameBtn, 'pressed');
  handleHomeReset();
});
homeLink.addEventListener('click', () => {
  bounceClass(homeLink, 'pressed');
  handleHomeReset();
});

buildKeypad();
buildDartsKeypad();
renderPlayerInputs();
applyTranslations();
showScreen('home');
