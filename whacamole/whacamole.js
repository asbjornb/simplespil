(() => {
  // --- Game state ---
  let canvas, ctx;
  let gameRunning = false;
  let animFrame = null;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('whacamole_highscore')) || 0;
  let timeLeft = 30;
  let selectedTime = 30;
  let timerInterval = null;
  let lastMoleSpawn = 0;
  let spawnInterval = 1200;
  let frame = 0;

  // Grid: 3 columns x 3 rows of holes
  const COLS = 3;
  const ROWS = 3;
  const holes = [];

  // Mole states: 'hidden', 'rising', 'up', 'sinking', 'bonked'
  // Each hole: { x, y, radius, mole: { state, timer, y, targetY } }

  // --- DOM refs ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const scoreDisplay = document.getElementById('score-display');
  const timerDisplay = document.getElementById('timer-display');
  const highScoreDisplay = document.getElementById('high-score-display');
  const gameOverEl = document.getElementById('game-over');
  const finalScoreEl = document.getElementById('final-score');
  const newHighEl = document.getElementById('new-high');
  const menuHighScore = document.getElementById('menu-high-score');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const menuBtn = document.getElementById('menu-btn');

  // --- Difficulty selection ---
  const diffBtns = document.querySelectorAll('.diff-btn');
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTime = parseInt(btn.dataset.time);
    });
  });

  // --- Show high score on menu ---
  function updateMenuHighScore() {
    if (highScore > 0) {
      menuHighScore.textContent = `Best: ${highScore}`;
    } else {
      menuHighScore.textContent = '';
    }
  }
  updateMenuHighScore();

  // --- Drawing functions ---

  function drawMole(cx, cy, size, moleY, state, bonkFrame) {
    const s = size;

    // Dirt mound (always visible) - oval at hole position
    ctx.fillStyle = '#8B5E3C';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.15, s * 0.55, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Darker front edge
    ctx.fillStyle = '#6B3F1F';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.22, s * 0.55, s * 0.1, 0, 0, Math.PI);
    ctx.fill();

    if (state === 'hidden') return;

    // Clip region: mole only visible above hole
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - s, cy - s * 2, s * 2, s * 2 + s * 0.15);
    ctx.clip();

    const my = moleY;

    // Body
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(cx, my + s * 0.1, s * 0.35, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#D4A44C';
    ctx.beginPath();
    ctx.ellipse(cx, my + s * 0.18, s * 0.22, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#8B6914';
    ctx.beginPath();
    ctx.ellipse(cx, my - s * 0.2, s * 0.3, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#6B4F10';
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.25, my - s * 0.35, s * 0.08, s * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.25, my - s * 0.35, s * 0.08, s * 0.1, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Inner ears
    ctx.fillStyle = '#D4A44C';
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.25, my - s * 0.35, s * 0.04, s * 0.06, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.25, my - s * 0.35, s * 0.04, s * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = '#D4A44C';
    ctx.beginPath();
    ctx.ellipse(cx, my - s * 0.12, s * 0.15, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#4a2800';
    ctx.beginPath();
    ctx.ellipse(cx, my - s * 0.16, s * 0.06, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    if (state === 'bonked') {
      // X eyes
      ctx.strokeStyle = '#4a2800';
      ctx.lineWidth = Math.max(2, s * 0.04);
      const eyeSize = s * 0.06;
      // Left X
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.14 - eyeSize, my - s * 0.26 - eyeSize);
      ctx.lineTo(cx - s * 0.14 + eyeSize, my - s * 0.26 + eyeSize);
      ctx.moveTo(cx - s * 0.14 + eyeSize, my - s * 0.26 - eyeSize);
      ctx.lineTo(cx - s * 0.14 - eyeSize, my - s * 0.26 + eyeSize);
      ctx.stroke();
      // Right X
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.14 - eyeSize, my - s * 0.26 - eyeSize);
      ctx.lineTo(cx + s * 0.14 + eyeSize, my - s * 0.26 + eyeSize);
      ctx.moveTo(cx + s * 0.14 + eyeSize, my - s * 0.26 - eyeSize);
      ctx.lineTo(cx + s * 0.14 - eyeSize, my - s * 0.26 + eyeSize);
      ctx.stroke();

      // Stars around head
      ctx.fillStyle = '#f5c518';
      for (let i = 0; i < 3; i++) {
        const angle = bonkFrame * 0.08 + i * (Math.PI * 2 / 3);
        const sx = cx + Math.cos(angle) * s * 0.35;
        const sy = my - s * 0.38 + Math.sin(angle) * s * 0.1;
        drawStar(sx, sy, s * 0.05);
      }
    } else {
      // Normal eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(cx - s * 0.14, my - s * 0.26, s * 0.07, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.14, my - s * 0.26, s * 0.07, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.arc(cx - s * 0.13, my - s * 0.25, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + s * 0.15, my - s * 0.25, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }

    // Whiskers
    ctx.strokeStyle = '#6B4F10';
    ctx.lineWidth = Math.max(1, s * 0.02);
    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, my - s * 0.13);
    ctx.lineTo(cx - s * 0.35, my - s * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, my - s * 0.1);
    ctx.lineTo(cx - s * 0.35, my - s * 0.1);
    ctx.stroke();
    // Right whiskers
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.12, my - s * 0.13);
    ctx.lineTo(cx + s * 0.35, my - s * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.12, my - s * 0.1);
    ctx.lineTo(cx + s * 0.35, my - s * 0.1);
    ctx.stroke();

    ctx.restore();

    // Dirt mound front (on top of mole body, hides the bottom)
    ctx.fillStyle = '#8B5E3C';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.15, s * 0.55, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6B3F1F';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.22, s * 0.55, s * 0.1, 0, 0, Math.PI);
    ctx.fill();

    // Hole darkness behind mound
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.12, s * 0.38, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStar(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      const outerX = cx + Math.cos(angle) * r;
      const outerY = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);

      const innerAngle = angle + Math.PI / 5;
      const innerX = cx + Math.cos(innerAngle) * r * 0.4;
      const innerY = cy + Math.sin(innerAngle) * r * 0.4;
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawHammer(x, y, size, hitting) {
    ctx.save();
    ctx.translate(x, y);
    if (hitting) {
      ctx.rotate(-0.5);
    } else {
      ctx.rotate(0.3);
    }

    // Handle
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(-size * 0.06, 0, size * 0.12, size * 0.5);

    // Head
    ctx.fillStyle = '#888';
    ctx.fillRect(-size * 0.2, -size * 0.12, size * 0.4, size * 0.15);

    // Head highlight
    ctx.fillStyle = '#aaa';
    ctx.fillRect(-size * 0.18, -size * 0.12, size * 0.36, size * 0.04);

    ctx.restore();
  }

  // --- Whack effect particles ---
  const particles = [];

  function spawnWhackEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        size: 4 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#f5c518' : '#e94560'
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= 0.03;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      drawStar(p.x, p.y, p.size);
      ctx.globalAlpha = 1;
    });
  }

  // --- Score popup ---
  const popups = [];

  function spawnScorePopup(x, y, text, color) {
    popups.push({ x, y, text, color, life: 1 });
  }

  function updatePopups() {
    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      p.y -= 1.5;
      p.life -= 0.025;
      if (p.life <= 0) {
        popups.splice(i, 1);
      }
    }
  }

  function drawPopups() {
    popups.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.font = `bold ${Math.round(canvas.width * 0.05)}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
      ctx.globalAlpha = 1;
    });
  }

  // --- Cursor state ---
  let hammerX = 0, hammerY = 0;
  let hammerHitting = false;
  let hammerTimer = 0;

  // --- Layout ---
  function layoutHoles() {
    const w = canvas.width;
    const h = canvas.height;
    const gridW = w * 0.85;
    const gridH = h * 0.6;
    const startX = (w - gridW) / 2 + gridW / (COLS * 2);
    const startY = h * 0.22 + gridH / (ROWS * 2);
    const spacingX = gridW / COLS;
    const spacingY = gridH / ROWS;
    const holeSize = Math.min(spacingX, spacingY) * 0.55;

    holes.length = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        holes.push({
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          size: holeSize,
          mole: {
            state: 'hidden',
            timer: 0,
            yOffset: 0,
            bonkFrame: 0
          }
        });
      }
    }
  }

  // --- Canvas setup ---
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    layoutHoles();
  }

  // --- Mole spawning ---
  function trySpawnMole(now) {
    if (now - lastMoleSpawn < spawnInterval) return;

    const hiddenHoles = holes.filter(h => h.mole.state === 'hidden');
    if (hiddenHoles.length === 0) return;

    const hole = hiddenHoles[Math.floor(Math.random() * hiddenHoles.length)];
    hole.mole.state = 'rising';
    hole.mole.timer = 0;
    hole.mole.yOffset = 0;
    hole.mole.bonkFrame = 0;
    lastMoleSpawn = now;

    // Gradually increase difficulty
    const elapsed = selectedTime - timeLeft;
    const progress = elapsed / selectedTime;
    spawnInterval = Math.max(400, 1200 - progress * 700);
  }

  // --- Mole update ---
  function updateMoles() {
    const elapsed = selectedTime - timeLeft;
    const progress = elapsed / selectedTime;
    const upDuration = Math.max(30, 70 - progress * 35);

    holes.forEach(hole => {
      const m = hole.mole;
      if (m.state === 'rising') {
        m.yOffset += 0.08;
        if (m.yOffset >= 1) {
          m.yOffset = 1;
          m.state = 'up';
          m.timer = 0;
        }
      } else if (m.state === 'up') {
        m.timer++;
        if (m.timer > upDuration) {
          m.state = 'sinking';
        }
      } else if (m.state === 'sinking') {
        m.yOffset -= 0.06;
        if (m.yOffset <= 0) {
          m.yOffset = 0;
          m.state = 'hidden';
        }
      } else if (m.state === 'bonked') {
        m.bonkFrame++;
        m.timer++;
        if (m.timer > 20) {
          m.state = 'sinking';
        }
      }
    });
  }

  // --- Hit detection ---
  function tryWhack(px, py) {
    hammerHitting = true;
    hammerTimer = 8;

    for (let i = holes.length - 1; i >= 0; i--) {
      const hole = holes[i];
      const m = hole.mole;
      if (m.state === 'rising' || m.state === 'up') {
        const moleY = hole.y - m.yOffset * hole.size * 0.6;
        const dx = px - hole.x;
        const dy = py - moleY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < hole.size * 0.5) {
          m.state = 'bonked';
          m.timer = 0;
          m.bonkFrame = 0;
          score++;
          scoreDisplay.textContent = `Score: ${score}`;
          spawnWhackEffect(hole.x, moleY);
          spawnScorePopup(hole.x, moleY - hole.size * 0.3, '+1', '#f5c518');
          return;
        }
      }
    }
  }

  // --- Drawing ---
  function drawBackground() {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(0.5, '#98D8C8');
    grad.addColorStop(1, '#4a8c3f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    ctx.fillStyle = '#f5c518';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.85, canvas.height * 0.1, canvas.width * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    drawCloud(canvas.width * 0.15, canvas.height * 0.08, canvas.width * 0.04);
    drawCloud(canvas.width * 0.55, canvas.height * 0.12, canvas.width * 0.035);
    drawCloud(canvas.width * 0.75, canvas.height * 0.06, canvas.width * 0.03);

    // Ground
    ctx.fillStyle = '#5a9e3e';
    ctx.fillRect(0, canvas.height * 0.45, canvas.width, canvas.height * 0.55);

    // Ground texture - darker patches
    ctx.fillStyle = '#4a8c3f';
    for (let i = 0; i < 6; i++) {
      const gx = (canvas.width * (i * 0.18 + 0.05));
      const gy = canvas.height * (0.55 + (i % 3) * 0.12);
      ctx.beginPath();
      ctx.ellipse(gx, gy, canvas.width * 0.08, canvas.height * 0.02, 0.2 * i, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grass blades at ground line
    ctx.fillStyle = '#66b344';
    for (let i = 0; i < canvas.width; i += 15) {
      ctx.beginPath();
      ctx.moveTo(i, canvas.height * 0.45);
      ctx.lineTo(i + 4, canvas.height * 0.45 - 8 - Math.sin(i) * 4);
      ctx.lineTo(i + 8, canvas.height * 0.45);
      ctx.fill();
    }
  }

  function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 1.6, y, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x - size * 0.7, y + size * 0.2, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    drawBackground();

    // Draw holes and moles
    holes.forEach(hole => {
      const m = hole.mole;
      const moleY = hole.y - m.yOffset * hole.size * 0.6;
      drawMole(hole.x, hole.y, hole.size, moleY, m.state, m.bonkFrame);
    });

    drawParticles();
    drawPopups();

    // Title
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = `bold ${Math.round(canvas.width * 0.06)}px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('Whack-a-Mole!', canvas.width / 2 + 2, canvas.height * 0.12 + 2);
    ctx.fillStyle = '#fff';
    ctx.fillText('Whack-a-Mole!', canvas.width / 2, canvas.height * 0.12);
  }

  // --- Game loop ---
  function gameLoop() {
    if (!gameRunning) return;
    frame++;
    const now = performance.now();

    trySpawnMole(now);
    updateMoles();
    updateParticles();
    updatePopups();

    if (hammerTimer > 0) {
      hammerTimer--;
      if (hammerTimer === 0) hammerHitting = false;
    }

    draw();
    animFrame = requestAnimationFrame(gameLoop);
  }

  // --- Start / stop ---
  function startGame() {
    SimplespilStats.recordPlay('whacamole');

    score = 0;
    timeLeft = selectedTime;
    lastMoleSpawn = 0;
    spawnInterval = 1200;
    frame = 0;
    particles.length = 0;
    popups.length = 0;
    hammerHitting = false;
    hammerTimer = 0;

    holes.forEach(h => {
      h.mole.state = 'hidden';
      h.mole.timer = 0;
      h.mole.yOffset = 0;
    });

    scoreDisplay.textContent = 'Score: 0';
    timerDisplay.textContent = `Time: ${timeLeft}`;
    highScoreDisplay.textContent = `Best: ${highScore}`;
    gameOverEl.style.display = 'none';

    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';

    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();

    gameRunning = true;

    timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `Time: ${timeLeft}`;
      if (timeLeft <= 10) {
        timerDisplay.style.color = '#e94560';
      }
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);

    gameLoop();
  }

  function endGame() {
    gameRunning = false;
    clearInterval(timerInterval);
    if (animFrame) cancelAnimationFrame(animFrame);

    let isNewHigh = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('whacamole_highscore', highScore);
      isNewHigh = true;
    }

    finalScoreEl.textContent = `Score: ${score}`;
    newHighEl.style.display = isNewHigh ? 'block' : 'none';
    gameOverEl.style.display = 'flex';
  }

  // --- Input ---
  function handleInput(px, py) {
    if (!gameRunning) return;
    // Convert page coords to canvas coords
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (px - rect.left) * scaleX;
    const cy = (py - rect.top) * scaleY;
    tryWhack(cx, cy);
  }

  // --- Event listeners ---
  startBtn.addEventListener('click', startGame);

  restartBtn.addEventListener('click', () => {
    gameOverEl.style.display = 'none';
    startGame();
  });

  menuBtn.addEventListener('click', () => {
    gameOverEl.style.display = 'none';
    gameEl.style.display = 'none';
    menuEl.style.display = 'flex';
    timerDisplay.style.color = '';
    updateMenuHighScore();
  });

  document.addEventListener('mousedown', (e) => {
    if (!gameRunning) return;
    handleInput(e.clientX, e.clientY);
  });

  document.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;
    e.preventDefault();
    for (const touch of e.changedTouches) {
      handleInput(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  window.addEventListener('resize', () => {
    if (canvas) resizeCanvas();
  });
})();
