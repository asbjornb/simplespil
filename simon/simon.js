(() => {
  'use strict';

  const PAD_COUNT = 4;

  // Speed presets: delay between notes in ms
  const SPEEDS = {
    slow: { show: 600, pause: 250 },
    normal: { show: 400, pause: 150 },
    fast: { show: 250, pause: 100 }
  };

  // Audio: generate tones for each pad using AudioContext
  const TONES = [329.63, 261.63, 220.00, 164.81]; // E4, C4, A3, E3

  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(index, duration) {
    try {
      ensureAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = TONES[index];
      gain.gain.value = 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration / 1000);
    } catch {
      // Audio not supported, continue silently
    }
  }

  function playBuzz() {
    try {
      ensureAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 80;
      gain.gain.value = 0.25;
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio not supported, continue silently
    }
  }

  // DOM elements
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const scoreEl = document.getElementById('score-display');
  const bestEl = document.getElementById('best-display');
  const statusEl = document.getElementById('status-text');
  const centerEl = document.getElementById('center-display');
  const gameOverEl = document.getElementById('game-over');
  const finalScoreEl = document.getElementById('final-score');
  const bestScoreEl = document.getElementById('best-score');

  const pads = [];
  for (let i = 0; i < PAD_COUNT; i++) {
    pads.push(document.querySelector(`.simon-pad[data-pad="${i}"]`));
  }

  // Game state
  let sequence = [];
  let playerIndex = 0;
  let round = 1;
  let speed = 'normal';
  let accepting = false;
  let playbackTimeout = null;

  // Speed selection
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      speed = btn.dataset.speed;
    });
  });

  // Start game
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('retry-btn').addEventListener('click', startGame);
  document.getElementById('menu-btn').addEventListener('click', backToMenu);

  function startGame() {
    SimplespilStats.recordPlay('simon');

    sequence = [];
    playerIndex = 0;
    round = 1;
    accepting = false;

    menuEl.style.display = 'none';
    gameOverEl.style.display = 'none';
    gameEl.style.display = 'flex';

    updateHud();
    loadBest();
    enablePads(false);

    // Start first round after a short pause
    setTimeout(() => {
      addToSequence();
    }, 600);
  }

  function backToMenu() {
    gameEl.style.display = 'none';
    gameOverEl.style.display = 'none';
    menuEl.style.display = 'flex';
    clearTimeout(playbackTimeout);
    accepting = false;
  }

  function addToSequence() {
    const next = Math.floor(Math.random() * PAD_COUNT);
    sequence.push(next);
    round = sequence.length;
    updateHud();
    playSequence();
  }

  function playSequence() {
    accepting = false;
    enablePads(false);
    statusEl.textContent = 'Watch...';
    centerEl.textContent = '';

    const { show, pause } = SPEEDS[speed];
    let i = 0;

    function showNext() {
      if (i >= sequence.length) {
        // Sequence done, player's turn
        setTimeout(() => {
          playerIndex = 0;
          accepting = true;
          enablePads(true);
          statusEl.textContent = 'Your turn!';
        }, pause);
        return;
      }

      const padIndex = sequence[i];
      lightPad(padIndex, show);
      playTone(padIndex, show);

      i++;
      playbackTimeout = setTimeout(showNext, show + pause);
    }

    // Brief delay before starting playback
    playbackTimeout = setTimeout(showNext, 400);
  }

  function lightPad(index, duration) {
    const pad = pads[index];
    pad.classList.add('lit');
    setTimeout(() => {
      pad.classList.remove('lit');
    }, duration);
  }

  function enablePads(enabled) {
    pads.forEach(pad => {
      if (enabled) {
        pad.classList.remove('disabled');
      } else {
        pad.classList.add('disabled');
      }
    });
  }

  // Pad input handling
  pads.forEach((pad, index) => {
    const handlePress = (e) => {
      e.preventDefault();
      if (!accepting) return;
      onPadPress(index);
    };
    pad.addEventListener('pointerdown', handlePress);
  });

  function onPadPress(index) {
    // Light up and play tone for feedback
    lightPad(index, 250);
    playTone(index, 250);

    if (sequence[playerIndex] === index) {
      // Correct
      playerIndex++;

      if (playerIndex >= sequence.length) {
        // Round complete
        accepting = false;
        enablePads(false);
        statusEl.textContent = 'Nice!';
        centerEl.textContent = round;

        setTimeout(() => {
          addToSequence();
        }, 800);
      }
    } else {
      // Wrong
      gameOver();
    }
  }

  function gameOver() {
    accepting = false;
    enablePads(false);
    clearTimeout(playbackTimeout);
    playBuzz();

    // Flash all pads to indicate error
    pads.forEach(pad => pad.classList.add('wrong'));
    statusEl.textContent = '';

    setTimeout(() => {
      pads.forEach(pad => pad.classList.remove('wrong'));

      const reached = sequence.length;
      finalScoreEl.textContent = `You reached round ${reached}`;

      // Save best
      const bestKey = `simon_best_${speed}`;
      const prev = parseInt(localStorage.getItem(bestKey) || '0', 10);
      if (reached > prev) {
        localStorage.setItem(bestKey, String(reached));
        bestScoreEl.textContent = `New best for ${speed} speed!`;
      } else {
        bestScoreEl.textContent = `Best: round ${prev} (${speed})`;
      }

      gameOverEl.style.display = 'flex';
    }, 800);
  }

  function updateHud() {
    scoreEl.textContent = `Round: ${sequence.length || 1}`;
  }

  function loadBest() {
    const bestKey = `simon_best_${speed}`;
    const best = parseInt(localStorage.getItem(bestKey) || '0', 10);
    if (best > 0) {
      bestEl.textContent = `Best: ${best}`;
    } else {
      bestEl.textContent = '';
    }
  }

  // Keyboard support: 1-4 or Q-W-A-S mapping
  document.addEventListener('keydown', (e) => {
    if (!accepting) return;
    const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'q': 0, 'w': 1, 'a': 2, 's': 3 };
    const index = keyMap[e.key.toLowerCase()];
    if (index !== undefined) {
      e.preventDefault();
      onPadPress(index);
    }
  });
})();
