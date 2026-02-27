(() => {
  'use strict';

  // --- Button definitions ---
  const ALL_BUTTONS = [
    { color: 'red', label: 'Red' },
    { color: 'blue', label: 'Blue' },
    { color: 'green', label: 'Green' },
    { color: 'yellow', label: 'Yellow' },
    { color: 'purple', label: 'Purple' },
    { color: 'orange', label: 'Orange' },
  ];

  // --- Difficulty tiers ---
  // Each tier: [minRound, buttonCount, flashDuration, pauseBetween]
  const TIERS = [
    { minRound: 1,  buttons: 4, flash: 700, pause: 300 },
    { minRound: 6,  buttons: 4, flash: 550, pause: 250 },
    { minRound: 11, buttons: 5, flash: 550, pause: 250 },
    { minRound: 16, buttons: 5, flash: 420, pause: 200 },
    { minRound: 21, buttons: 6, flash: 380, pause: 180 },
    { minRound: 30, buttons: 6, flash: 300, pause: 150 },
  ];

  // --- State ---
  let sequence = [];
  let playerIndex = 0;
  let round = 1;
  let score = 0;
  let currentButtonCount = 4;
  let isPlaying = false;
  let isShowingSequence = false;
  let startingRound = 1;

  // --- DOM ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const ringEl = document.getElementById('button-ring');
  const statusEl = document.getElementById('status');
  const levelEl = document.getElementById('level-display');
  const scoreEl = document.getElementById('score-display');
  const gameOverEl = document.getElementById('game-over');
  const finalScoreEl = document.getElementById('final-score');
  const finalLevelEl = document.getElementById('final-level');

  // --- Starting difficulty based on play history ---
  function getStartingRound() {
    const plays = SimplespilStats.getCount('memory');
    if (plays >= 30) return 11;
    if (plays >= 15) return 6;
    if (plays >= 5) return 3;
    return 1;
  }

  // --- Get tier for a given round ---
  function getTier(r) {
    let tier = TIERS[0];
    for (const t of TIERS) {
      if (r >= t.minRound) tier = t;
    }
    return tier;
  }

  // --- Build buttons for current tier ---
  function buildButtons(count) {
    ringEl.innerHTML = '';
    ringEl.className = 'button-ring';
    if (count >= 5) ringEl.classList.add(`buttons-${count}`);

    const buttons = ALL_BUTTONS.slice(0, count);
    buttons.forEach((btn) => {
      const el = document.createElement('button');
      el.className = 'simon-btn';
      el.dataset.color = btn.color;
      el.setAttribute('aria-label', btn.label);
      el.addEventListener('click', () => onButtonClick(btn.color));
      ringEl.appendChild(el);
    });
    currentButtonCount = count;
  }

  // --- Flash a button ---
  function flashButton(color, duration) {
    return new Promise((resolve) => {
      const el = ringEl.querySelector(`[data-color="${color}"]`);
      if (!el) { resolve(); return; }
      el.classList.add('lit');
      setTimeout(() => {
        el.classList.remove('lit');
        resolve();
      }, duration);
    });
  }

  // --- Play the full sequence ---
  async function playSequence() {
    isShowingSequence = true;
    setStatus('Watch carefully...', 'watching');
    disableButtons(true);

    const tier = getTier(round);

    // Brief pause before starting
    await wait(500);

    for (let i = 0; i < sequence.length; i++) {
      if (!isPlaying) return;
      await flashButton(sequence[i], tier.flash);
      if (i < sequence.length - 1) {
        await wait(tier.pause);
      }
    }

    await wait(300);
    isShowingSequence = false;
    setStatus('Your turn!', 'your-turn');
    disableButtons(false);
    playerIndex = 0;
  }

  // --- Add a new step to the sequence ---
  function extendSequence() {
    const tier = getTier(round);
    const count = tier.buttons;

    // If button count changed, rebuild and remap sequence
    if (count !== currentButtonCount) {
      buildButtons(count);
    }

    const available = ALL_BUTTONS.slice(0, count).map(b => b.color);
    const next = available[Math.floor(Math.random() * available.length)];
    sequence.push(next);
  }

  // --- Handle player input ---
  function onButtonClick(color) {
    if (!isPlaying || isShowingSequence) return;

    const expected = sequence[playerIndex];

    if (color === expected) {
      // Correct
      flashButton(color, 200);
      playerIndex++;
      score += round;

      if (playerIndex >= sequence.length) {
        // Round complete
        round++;
        updateHUD();
        setTimeout(() => {
          extendSequence();
          playSequence();
        }, 800);
      }
    } else {
      // Wrong
      const el = ringEl.querySelector(`[data-color="${color}"]`);
      if (el) el.classList.add('wrong-flash');
      setTimeout(() => { if (el) el.classList.remove('wrong-flash'); }, 400);

      setStatus('Wrong!', 'wrong');
      disableButtons(true);
      setTimeout(() => gameOver(), 800);
    }
  }

  // --- Disable/enable buttons ---
  function disableButtons(disabled) {
    ringEl.querySelectorAll('.simon-btn').forEach(el => {
      if (disabled) {
        el.classList.add('disabled');
      } else {
        el.classList.remove('disabled');
      }
    });
  }

  // --- Update HUD ---
  function updateHUD() {
    levelEl.textContent = `Round ${round}`;
    scoreEl.textContent = `Score: ${score}`;
  }

  // --- Set status text ---
  function setStatus(text, cls) {
    statusEl.textContent = text;
    statusEl.className = 'status-text';
    if (cls) statusEl.classList.add(cls);
  }

  // --- Game over ---
  function gameOver() {
    isPlaying = false;
    const roundsCompleted = round - 1;
    finalScoreEl.textContent = `Score: ${score}`;
    finalLevelEl.textContent = `You reached round ${round} (completed ${roundsCompleted} round${roundsCompleted === 1 ? '' : 's'})`;
    gameOverEl.style.display = 'flex';
  }

  // --- Start game ---
  function startGame() {
    SimplespilStats.recordPlay('memory');

    startingRound = getStartingRound();
    round = 1;
    score = 0;
    sequence = [];
    playerIndex = 0;
    isPlaying = true;
    isShowingSequence = false;

    const tier = getTier(startingRound);
    buildButtons(tier.buttons);

    menuEl.style.display = 'none';
    gameOverEl.style.display = 'none';
    gameEl.style.display = 'flex';

    updateHUD();

    // Pre-fill sequence to starting round length
    for (let i = 0; i < startingRound; i++) {
      const available = ALL_BUTTONS.slice(0, tier.buttons).map(b => b.color);
      sequence.push(available[Math.floor(Math.random() * available.length)]);
    }
    round = startingRound;
    updateHUD();

    playSequence();
  }

  // --- Utility ---
  function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // --- Event listeners ---
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('retry-btn').addEventListener('click', startGame);
  document.getElementById('menu-btn').addEventListener('click', () => {
    isPlaying = false;
    gameEl.style.display = 'none';
    menuEl.style.display = 'flex';
  });
})();
