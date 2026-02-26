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

const state = {
  players: [],
  currentPlayer: 0,
  outMode: 'double',
  startScore: 501,
  turnInput: '',
};

const keypadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'C'];


function enableLogoFallbacks() {
  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => {
      const fallback = img.getAttribute('data-fallback');
      if (fallback && img.getAttribute('src') !== fallback) {
        img.setAttribute('src', fallback);
      }
    });
  });
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

  matchTitle.textContent = `${state.outMode === 'double' ? 'Double out' : 'Single out'} • ${state.startScore}`;

  currentPlayerCard.innerHTML = `
    <h3>Rzuca teraz: ${current.name}</h3>
    <div class="current-player-score">
      <span class="big">${current.score}</span>
      <span>Pozostało</span>
    </div>
    <div>Średnia 3-dart: ${getAverage(current)}</div>
    ${checkout ? `<div class="checkout">Checkout: ${checkout}</div>` : ''}
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
    alert('Podaj poprawny wynik tury (0-180).');
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
      alert(`${current.name} wygrywa lega! Startujemy nowego lega.`);
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

buildKeypad();
enableLogoFallbacks();
renderPlayerInputs();
showScreen('home');
