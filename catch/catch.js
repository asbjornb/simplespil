(() => {
  // --- Fruit definitions ---
  const FRUITS = [
    {
      name: 'apple',
      color: '#e94560',
      points: 1,
      draw(ctx, x, y, r) {
        // Apple body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y + r * 0.1, r, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.ellipse(x - r * 0.3, y - r * 0.2, r * 0.25, r * 0.4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Stem
        ctx.strokeStyle = '#5a3a1a';
        ctx.lineWidth = r * 0.12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y - r * 0.8);
        ctx.lineTo(x + r * 0.1, y - r * 1.2);
        ctx.stroke();
        // Leaf
        ctx.fillStyle = '#4ecca3';
        ctx.beginPath();
        ctx.ellipse(x + r * 0.3, y - r * 1.1, r * 0.35, r * 0.15, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      name: 'banana',
      color: '#f5c518',
      points: 1,
      draw(ctx, x, y, r) {
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.3);
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, r * 0.3);
        ctx.quadraticCurveTo(-r * 0.6, -r * 1.0, 0, -r * 0.9);
        ctx.quadraticCurveTo(r * 0.6, -r * 0.7, r * 0.8, r * 0.1);
        ctx.quadraticCurveTo(r * 0.5, -r * 0.3, 0, -r * 0.4);
        ctx.quadraticCurveTo(-r * 0.4, -r * 0.3, -r * 0.8, r * 0.3);
        ctx.fill();
        // Tip
        ctx.fillStyle = '#8B6914';
        ctx.beginPath();
        ctx.arc(r * 0.8, r * 0.1, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    {
      name: 'orange',
      color: '#f39c12',
      points: 1,
      draw(ctx, x, y, r) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.ellipse(x - r * 0.25, y - r * 0.25, r * 0.3, r * 0.4, -0.4, 0, Math.PI * 2);
        ctx.fill();
        // Navel
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(x, y + r * 0.5, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        // Stem spot
        ctx.fillStyle = '#4ecca3';
        ctx.beginPath();
        ctx.arc(x, y - r * 0.85, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      name: 'grapes',
      color: '#9b59b6',
      points: 2,
      draw(ctx, x, y, r) {
        const gr = r * 0.35;
        const positions = [
          [0, -r * 0.5], [-gr, -r * 0.1], [gr, -r * 0.1],
          [-gr * 1.5, r * 0.3], [-gr * 0.5, r * 0.3], [gr * 0.5, r * 0.3], [gr * 1.5, r * 0.3],
          [-gr, r * 0.7], [0, r * 0.7], [gr, r * 0.7]
        ];
        ctx.fillStyle = this.color;
        for (const [ox, oy] of positions) {
          ctx.beginPath();
          ctx.arc(x + ox, y + oy, gr, 0, Math.PI * 2);
          ctx.fill();
        }
        // Highlights on top grapes
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (const [ox, oy] of positions.slice(0, 3)) {
          ctx.beginPath();
          ctx.arc(x + ox - gr * 0.2, y + oy - gr * 0.2, gr * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Stem
        ctx.strokeStyle = '#5a3a1a';
        ctx.lineWidth = r * 0.1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y - r * 0.5);
        ctx.lineTo(x, y - r * 1.0);
        ctx.stroke();
      }
    },
    {
      name: 'strawberry',
      color: '#e91e8f',
      points: 2,
      draw(ctx, x, y, r) {
        // Berry body
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.moveTo(x, y + r);
        ctx.bezierCurveTo(x - r * 1.1, y + r * 0.2, x - r * 0.9, y - r * 0.7, x, y - r * 0.6);
        ctx.bezierCurveTo(x + r * 0.9, y - r * 0.7, x + r * 1.1, y + r * 0.2, x, y + r);
        ctx.fill();
        // Seeds
        ctx.fillStyle = '#f5c518';
        const seeds = [
          [-0.2, -0.1], [0.2, -0.1], [0, 0.25],
          [-0.35, 0.3], [0.35, 0.3], [-0.15, 0.55], [0.15, 0.55]
        ];
        for (const [sx, sy] of seeds) {
          ctx.beginPath();
          ctx.ellipse(x + sx * r, y + sy * r, r * 0.06, r * 0.09, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        // Leaves
        ctx.fillStyle = '#4ecca3';
        for (let i = 0; i < 5; i++) {
          const angle = -Math.PI / 2 + (i - 2) * 0.4;
          ctx.beginPath();
          ctx.ellipse(
            x + Math.cos(angle) * r * 0.3,
            y - r * 0.6 + Math.sin(angle) * r * 0.1,
            r * 0.3, r * 0.1, angle + 0.3, 0, Math.PI * 2
          );
          ctx.fill();
        }
      }
    },
    {
      name: 'watermelon',
      color: '#4ecca3',
      points: 3,
      draw(ctx, x, y, r) {
        // Slice shape (half circle)
        ctx.fillStyle = '#4ecca3';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        // Rind edge
        ctx.fillStyle = '#2d8a6e';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI);
        ctx.arc(x, y, r * 0.85, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();
        // Red flesh
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.82, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        // Seeds
        ctx.fillStyle = '#1a1a2e';
        const seedAngles = [0.3, 0.6, 1.0, 1.4, 1.8, 2.1, 2.5, 2.8];
        for (const a of seedAngles) {
          const sr = r * 0.5;
          ctx.beginPath();
          ctx.ellipse(
            x + Math.cos(a) * sr,
            y + Math.sin(a) * sr * 0.6,
            r * 0.05, r * 0.09, a, 0, Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  ];

  // --- Bomb definition ---
  const BOMB = {
    name: 'bomb',
    draw(ctx, x, y, r) {
      // Body
      ctx.fillStyle = '#2c2c2c';
      ctx.beginPath();
      ctx.arc(x, y + r * 0.1, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.ellipse(x - r * 0.3, y - r * 0.15, r * 0.2, r * 0.35, -0.4, 0, Math.PI * 2);
      ctx.fill();
      // Fuse top
      ctx.strokeStyle = '#8B6914';
      ctx.lineWidth = r * 0.12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + r * 0.3, y - r * 0.7);
      ctx.quadraticCurveTo(x + r * 0.6, y - r * 1.2, x + r * 0.2, y - r * 1.3);
      ctx.stroke();
      // Spark
      ctx.fillStyle = '#f5c518';
      ctx.beginPath();
      ctx.arc(x + r * 0.2, y - r * 1.35, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(x + r * 0.15, y - r * 1.45, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // --- Basket drawing ---
  function drawBasket(ctx, x, y, w, h) {
    // Main basket body
    const topW = w;
    const botW = w * 0.7;
    const topX = x - topW / 2;
    const botX = x - botW / 2;

    ctx.fillStyle = '#c47a2a';
    ctx.beginPath();
    ctx.moveTo(topX, y);
    ctx.lineTo(topX + topW, y);
    ctx.lineTo(botX + botW, y + h);
    ctx.lineTo(botX, y + h);
    ctx.closePath();
    ctx.fill();

    // Weave lines
    ctx.strokeStyle = '#a0621a';
    ctx.lineWidth = 1.5;
    const rows = 4;
    for (let i = 1; i <= rows; i++) {
      const t = i / (rows + 1);
      const ly = y + h * t;
      const lw = topW + (botW - topW) * t;
      const lx = x - lw / 2;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + lw, ly);
      ctx.stroke();
    }

    // Vertical weave
    const cols = 6;
    for (let i = 1; i < cols; i++) {
      const t = i / cols;
      ctx.beginPath();
      ctx.moveTo(topX + topW * t, y);
      ctx.lineTo(botX + botW * t, y + h);
      ctx.stroke();
    }

    // Rim
    ctx.fillStyle = '#d4892e';
    ctx.fillRect(topX - 2, y - 4, topW + 4, 6);

    // Handle
    ctx.strokeStyle = '#a0621a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y - 4, w * 0.3, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = '#c47a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 4, w * 0.3, Math.PI, 0);
    ctx.stroke();
  }

  // --- Particle effects ---
  const particles = [];

  function spawnCatchParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3) - 2,
        life: 1,
        color,
        r: 3 + Math.random() * 3
      });
    }
  }

  function spawnBombParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.3;
      const speed = 3 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        color: i % 2 === 0 ? '#f5c518' : '#e94560',
        r: 4 + Math.random() * 4
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
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles(ctx) {
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // --- Score popups ---
  const popups = [];

  function spawnPopup(x, y, text, color) {
    popups.push({ x, y, text, color, life: 1 });
  }

  function updatePopups() {
    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      p.y -= 1.5;
      p.life -= 0.025;
      if (p.life <= 0) popups.splice(i, 1);
    }
  }

  function drawPopups(ctx) {
    for (const p of popups) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.font = 'bold 24px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  // --- Game state ---
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  let gameRunning = false;
  let animFrame = null;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('catch_highscore')) || 0;
  let lives = 3;
  let combo = 0;
  let gameTime = 0;

  const BASKET_W = 90;
  const BASKET_H = 50;
  const FRUIT_R = 18;
  const MAX_LIVES = 3;

  let basket = { x: 0, y: 0 };
  let fallingItems = [];
  let spawnTimer = 0;

  // Input state
  let inputX = null; // null means no active touch/mouse drag
  let keysDown = {};

  // --- DOM elements ---
  const menuEl = document.getElementById('menu');
  const gameContainerEl = document.getElementById('game-container');
  const gameOverEl = document.getElementById('game-over');
  const playBtn = document.getElementById('play-btn');
  const restartBtn = document.getElementById('restart-btn');
  const menuBtn = document.getElementById('menu-btn');
  const hudScoreEl = document.getElementById('hud-score');
  const hudBestEl = document.getElementById('hud-best');
  const hudLivesEl = document.getElementById('hud-lives');
  const finalScoreEl = document.getElementById('final-score');
  const newBestEl = document.getElementById('new-best');
  const highScoreEl = document.getElementById('high-score');

  // Show high score on menu
  function updateHighScoreDisplay() {
    highScoreEl.textContent = highScore > 0 ? `Best: ${highScore}` : '';
  }
  updateHighScoreDisplay();

  // --- Canvas sizing ---
  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  // --- Start game ---
  function startGame() {
    menuEl.style.display = 'none';
    gameOverEl.style.display = 'none';
    gameContainerEl.style.display = '';

    resizeCanvas();

    score = 0;
    lives = MAX_LIVES;
    combo = 0;
    gameTime = 0;
    fallingItems = [];
    particles.length = 0;
    popups.length = 0;
    spawnTimer = 0;

    basket.x = canvas.width / 2;
    basket.y = canvas.height - BASKET_H - 20;

    inputX = null;
    keysDown = {};

    updateHud();
    gameRunning = true;
    animFrame = requestAnimationFrame(gameLoop);
  }

  // --- Game loop ---
  let lastTime = 0;

  function gameLoop(timestamp) {
    if (!gameRunning) return;

    const dt = lastTime ? Math.min((timestamp - lastTime) / 16.67, 3) : 1;
    lastTime = timestamp;

    update(dt);
    draw();

    animFrame = requestAnimationFrame(gameLoop);
  }

  // --- Difficulty scaling ---
  function getSpawnInterval() {
    // Start at 60 frames, decrease to 25 over time
    return Math.max(25, 60 - gameTime * 0.003);
  }

  function getFallSpeed() {
    // Start at 2.5, increase to 7 over time
    return Math.min(7, 2.5 + gameTime * 0.002);
  }

  function getBombChance() {
    // Start at 10%, increase to 25% over time
    return Math.min(0.25, 0.10 + gameTime * 0.0001);
  }

  // --- Update ---
  function update(dt) {
    gameTime += dt;

    // Move basket with keyboard
    const speed = 8 * dt;
    if (keysDown['ArrowLeft'] || keysDown['KeyA']) {
      basket.x -= speed;
    }
    if (keysDown['ArrowRight'] || keysDown['KeyD']) {
      basket.x += speed;
    }

    // Clamp basket position
    const halfW = BASKET_W / 2;
    basket.x = Math.max(halfW, Math.min(canvas.width - halfW, basket.x));

    // Spawn items
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnItem();
      spawnTimer = getSpawnInterval();
    }

    // Update falling items
    const fallSpeed = getFallSpeed();
    for (let i = fallingItems.length - 1; i >= 0; i--) {
      const item = fallingItems[i];
      item.y += fallSpeed * dt;
      item.wobble += 0.05 * dt;

      // Check if caught by basket
      const dx = item.x - basket.x;
      const dy = item.y - basket.y;
      if (Math.abs(dx) < halfW + FRUIT_R * 0.3 && dy > -FRUIT_R && dy < BASKET_H * 0.6) {
        if (item.isBomb) {
          // Hit bomb - lose a life
          lives--;
          combo = 0;
          spawnBombParticles(item.x, item.y);
          spawnPopup(item.x, item.y - 20, '-1', '#e94560');
          fallingItems.splice(i, 1);
          updateHud();
          if (lives <= 0) {
            endGame();
            return;
          }
        } else {
          // Caught fruit
          combo++;
          const comboMult = combo >= 10 ? 3 : combo >= 5 ? 2 : 1;
          const points = item.fruit.points * comboMult;
          score += points;
          const label = comboMult > 1 ? `+${points} x${comboMult}` : `+${points}`;
          spawnCatchParticles(item.x, item.y, item.fruit.color);
          spawnPopup(item.x, item.y - 20, label, item.fruit.color);
          fallingItems.splice(i, 1);
          updateHud();
        }
        continue;
      }

      // Missed - fell below screen
      if (item.y > canvas.height + FRUIT_R * 2) {
        if (!item.isBomb) {
          // Missed a fruit
          lives--;
          combo = 0;
          updateHud();
          if (lives <= 0) {
            endGame();
            return;
          }
        }
        fallingItems.splice(i, 1);
      }
    }

    updateParticles();
    updatePopups();
  }

  function spawnItem() {
    const margin = FRUIT_R * 2;
    const x = margin + Math.random() * (canvas.width - margin * 2);
    const isBomb = Math.random() < getBombChance();

    if (isBomb) {
      fallingItems.push({
        x, y: -FRUIT_R * 2,
        isBomb: true,
        wobble: Math.random() * Math.PI * 2,
        fruit: null
      });
    } else {
      const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      fallingItems.push({
        x, y: -FRUIT_R * 2,
        isBomb: false,
        wobble: Math.random() * Math.PI * 2,
        fruit
      });
    }
  }

  // --- Draw ---
  function draw() {
    const w = canvas.width;
    const h = canvas.height;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#1a1a3e');
    skyGrad.addColorStop(0.5, '#16213e');
    skyGrad.addColorStop(1, '#0f3460');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, h - 15, w, 15);
    ctx.fillStyle = '#3a7a32';
    ctx.fillRect(0, h - 15, w, 4);

    // Draw falling items
    for (const item of fallingItems) {
      ctx.save();
      const wobbleX = Math.sin(item.wobble) * 2;
      ctx.translate(wobbleX, 0);
      if (item.isBomb) {
        BOMB.draw(ctx, item.x, item.y, FRUIT_R);
      } else {
        item.fruit.draw(ctx, item.x, item.y, FRUIT_R);
      }
      ctx.restore();
    }

    // Draw basket
    drawBasket(ctx, basket.x, basket.y, BASKET_W, BASKET_H);

    // Draw particles and popups
    drawParticles(ctx);
    drawPopups(ctx);

    // Combo indicator
    if (combo >= 3) {
      ctx.fillStyle = combo >= 10 ? '#f5c518' : combo >= 5 ? '#f39c12' : '#4ecca3';
      ctx.font = 'bold 16px ' + getComputedStyle(document.body).fontFamily;
      ctx.textAlign = 'center';
      ctx.fillText(`Combo x${combo}!`, basket.x, basket.y - 30);
    }
  }

  // --- HUD ---
  function updateHud() {
    hudScoreEl.textContent = score;
    hudBestEl.textContent = highScore > 0 ? `Best: ${highScore}` : '';
    // Hearts for lives
    hudLivesEl.textContent = '';
    for (let i = 0; i < MAX_LIVES; i++) {
      hudLivesEl.textContent += i < lives ? '\u2764\ufe0f ' : '\ud83e\udea6 ';
    }
  }

  // --- End game ---
  function endGame() {
    gameRunning = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    lastTime = 0;

    const isNewBest = score > highScore;
    if (isNewBest) {
      highScore = score;
      localStorage.setItem('catch_highscore', highScore);
    }
    updateHighScoreDisplay();

    SimplespilStats.recordPlay('catch');

    finalScoreEl.textContent = score;
    newBestEl.style.display = isNewBest ? '' : 'none';
    gameContainerEl.style.display = 'none';
    gameOverEl.style.display = '';
  }

  // --- Show menu ---
  function showMenu() {
    gameRunning = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    lastTime = 0;
    gameContainerEl.style.display = 'none';
    gameOverEl.style.display = 'none';
    menuEl.style.display = '';
    updateHighScoreDisplay();
  }

  // --- Input handling ---

  // Keyboard
  document.addEventListener('keydown', (e) => {
    keysDown[e.code] = true;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', (e) => {
    keysDown[e.code] = false;
  });

  // Touch controls - drag to move basket
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    inputX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    basket.x = inputX;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    inputX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    basket.x = inputX;
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    inputX = null;
  });

  // Mouse controls - click and drag
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    inputX = (e.clientX - rect.left) * (canvas.width / rect.width);
    basket.x = inputX;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (e.buttons > 0) {
      const rect = canvas.getBoundingClientRect();
      inputX = (e.clientX - rect.left) * (canvas.width / rect.width);
      basket.x = inputX;
    }
  });

  canvas.addEventListener('mouseup', () => {
    inputX = null;
  });

  // Window resize
  window.addEventListener('resize', () => {
    if (gameRunning) {
      resizeCanvas();
      basket.y = canvas.height - BASKET_H - 20;
    }
  });

  // --- Button handlers ---
  playBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
  menuBtn.addEventListener('click', showMenu);
})();
