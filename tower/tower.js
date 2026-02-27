(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  // DOM refs
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const gameOverEl = document.getElementById('game-over');
  const scoreDisplay = document.getElementById('score-display');
  const highScoreDisplay = document.getElementById('high-score-display');
  const comboDisplay = document.getElementById('combo-display');
  const finalScoreEl = document.getElementById('final-score');
  const newHighEl = document.getElementById('new-high');
  const menuHighScore = document.getElementById('menu-high-score');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const menuBtn = document.getElementById('menu-btn');

  // Game constants
  const GRAVITY = 0.45;
  const JUMP_FORCE = -11;
  const SUPER_JUMP_FORCE = -15;
  const MOVE_SPEED = 4.5;
  const MOVE_ACCEL = 0.6;
  const MOVE_FRICTION = 0.82;
  const PLAYER_W = 28;
  const PLAYER_H = 36;
  const PLATFORM_H = 12;
  const MIN_PLATFORM_W = 70;
  const MAX_PLATFORM_W = 140;
  const FLOOR_SPACING = 55;
  const CAMERA_SMOOTH = 0.08;
  const FALL_DEATH_MARGIN = 250;

  // Game state
  let gameRunning = false;
  let platforms = [];
  let player = {};
  let camera = { y: 0 };
  let highestFloor = 0;
  let combo = 0;
  let comboTimer = 0;
  let frameCount = 0;
  let keys = {};
  let particles = [];
  let screenShake = 0;

  // Touch state
  let touchId = null;
  let touchStartX = 0;
  let touchActive = false;
  let touchDir = 0;

  // Background stars (drawn once, scroll with parallax)
  let stars = [];

  // Rounded rectangle helper (ctx.roundRect not supported in all browsers)
  function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  function generateStars() {
    stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 20000 - 10000,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.3
      });
    }
  }

  function createPlatform(floor) {
    const y = -floor * FLOOR_SPACING;
    // Platforms get narrower and more varied as you go higher
    const progress = Math.min(floor / 150, 1);
    const w = MAX_PLATFORM_W - (MAX_PLATFORM_W - MIN_PLATFORM_W) * progress * 0.7;
    const actualW = w + (Math.random() - 0.5) * 30;
    const clampedW = Math.max(MIN_PLATFORM_W, Math.min(MAX_PLATFORM_W, actualW));
    const x = Math.random() * (canvas.width - clampedW);
    return { x, y, w: clampedW, floor };
  }

  function initPlatforms() {
    platforms = [];
    // Ground platform (full width)
    platforms.push({ x: 0, y: 0, w: canvas.width, floor: 0 });
    // Generate initial platforms
    for (let i = 1; i <= 80; i++) {
      platforms.push(createPlatform(i));
    }
  }

  function initPlayer() {
    player = {
      x: canvas.width / 2 - PLAYER_W / 2,
      y: -PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: true,
      facing: 1,
      currentFloor: 0,
      jumpCount: 0,
      walkFrame: 0
    };
  }

  function startGame() {
    SimplespilStats.recordPlay('tower');

    // Show game container BEFORE resizing so canvas has layout dimensions
    gameOverEl.style.display = 'none';
    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';
    newHighEl.style.display = 'none';

    resizeCanvas();
    generateStars();
    initPlatforms();
    initPlayer();

    camera.y = 0;
    highestFloor = 0;
    combo = 0;
    comboTimer = 0;
    frameCount = 0;
    particles = [];
    screenShake = 0;

    const hs = SimplespilHighScores.get('tower');
    highScoreDisplay.textContent = 'Best: ' + hs;

    gameRunning = true;
    requestAnimationFrame(gameLoop);
  }

  function endGame() {
    gameRunning = false;
    const result = SimplespilHighScores.save('tower', highestFloor);
    finalScoreEl.textContent = 'You reached floor ' + highestFloor + '!';
    if (result.isNew && highestFloor > 0) {
      newHighEl.style.display = '';
    }
    gameOverEl.style.display = '';
  }

  function showMenu() {
    gameRunning = false;
    menuEl.style.display = '';
    gameEl.style.display = 'none';
    const hs = SimplespilHighScores.get('tower');
    if (hs > 0) {
      menuHighScore.textContent = 'High score: floor ' + hs;
    }
  }

  // --- Particles ---
  function spawnJumpParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: x + Math.random() * PLAYER_W,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * -2 - 1,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        color: combo > 2 ? '#f5c518' : '#4ecca3',
        size: Math.random() * 3 + 2
      });
    }
  }

  function spawnComboParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + PLAYER_W / 2,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -4 - 2,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color: ['#e94560', '#f5c518', '#4ecca3', '#f39c12', '#e91e8f'][Math.floor(Math.random() * 5)],
        size: Math.random() * 4 + 2
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - camera.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // --- Update ---
  function update() {
    frameCount++;

    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a'] || touchDir < 0) {
      player.vx -= MOVE_ACCEL;
      player.facing = -1;
      player.walkFrame += 0.2;
    } else if (keys['ArrowRight'] || keys['d'] || touchDir > 0) {
      player.vx += MOVE_ACCEL;
      player.facing = 1;
      player.walkFrame += 0.2;
    } else {
      player.walkFrame = 0;
    }
    player.vx *= MOVE_FRICTION;
    if (Math.abs(player.vx) > MOVE_SPEED) {
      player.vx = MOVE_SPEED * Math.sign(player.vx);
    }
    player.x += player.vx;

    // Wrap around screen edges
    if (player.x + PLAYER_W < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -PLAYER_W;

    // Vertical physics
    player.vy += GRAVITY;
    player.y += player.vy;
    player.onGround = false;

    // Platform collision (only when falling)
    if (player.vy >= 0) {
      for (const plat of platforms) {
        const playerBottom = player.y + PLAYER_H;
        const prevBottom = playerBottom - player.vy;
        if (
          playerBottom >= plat.y && prevBottom <= plat.y + PLATFORM_H &&
          player.x + PLAYER_W - 4 > plat.x && player.x + 4 < plat.x + plat.w
        ) {
          player.y = plat.y - PLAYER_H;
          player.vy = 0;
          player.onGround = true;

          // Track floor progression
          if (plat.floor > player.currentFloor) {
            const floorsJumped = plat.floor - player.currentFloor;
            player.currentFloor = plat.floor;

            // Combo system
            if (floorsJumped >= 2) {
              combo += floorsJumped;
              comboTimer = 90;
              spawnComboParticles(player.x, player.y, floorsJumped * 4);
              screenShake = Math.min(floorsJumped * 2, 8);
            } else {
              if (comboTimer <= 0) combo = 0;
            }

            if (plat.floor > highestFloor) {
              highestFloor = plat.floor;
            }
          }
          break;
        }
      }
    }

    // Jump
    if (player.onGround && (keys['ArrowUp'] || keys['w'] || keys[' '] || touchJump)) {
      const speed = Math.abs(player.vx);
      // Super jump if moving fast
      if (speed > MOVE_SPEED * 0.7) {
        player.vy = SUPER_JUMP_FORCE;
      } else {
        player.vy = JUMP_FORCE;
      }
      player.onGround = false;
      player.jumpCount++;
      spawnJumpParticles(player.x, player.y + PLAYER_H);
      touchJump = false;
    }

    // Combo timer
    if (comboTimer > 0) comboTimer--;
    if (comboTimer <= 0 && player.onGround) combo = 0;

    // Screen shake decay
    if (screenShake > 0) screenShake *= 0.85;

    // Camera follows player (smooth)
    const targetY = player.y - canvas.height * 0.45;
    if (targetY < camera.y) {
      camera.y += (targetY - camera.y) * CAMERA_SMOOTH;
    }

    // Generate more platforms as player climbs
    const topPlatFloor = platforms[platforms.length - 1].floor;
    const neededFloor = Math.floor(-camera.y / FLOOR_SPACING) + 30;
    if (topPlatFloor < neededFloor) {
      for (let i = topPlatFloor + 1; i <= neededFloor; i++) {
        platforms.push(createPlatform(i));
      }
    }

    // Remove platforms far below camera
    const bottomY = camera.y + canvas.height + 200;
    while (platforms.length > 1 && platforms[0].y > bottomY) {
      platforms.shift();
    }

    updateParticles();

    // Death: fell below visible area
    if (player.y - camera.y > canvas.height + FALL_DEATH_MARGIN) {
      endGame();
    }

    // Update HUD
    scoreDisplay.textContent = 'Floor: ' + highestFloor;
    if (combo > 2) {
      comboDisplay.textContent = 'Combo x' + combo + '!';
    } else {
      comboDisplay.textContent = '';
    }
  }

  // --- Drawing ---
  function drawBackground() {
    // Gradient sky that shifts with height
    const heightProgress = Math.min(-camera.y / 8000, 1);
    const r1 = Math.floor(26 + heightProgress * (-10));
    const g1 = Math.floor(26 + heightProgress * (-5));
    const b1 = Math.floor(46 + heightProgress * 40);
    const r2 = Math.floor(22 + heightProgress * 10);
    const g2 = Math.floor(33 + heightProgress * 5);
    const b2 = Math.floor(62 + heightProgress * 60);

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, `rgb(${Math.max(0, r1)},${Math.max(0, g1)},${Math.min(255, b1)})`);
    grad.addColorStop(1, `rgb(${Math.max(0, r2)},${Math.max(0, g2)},${Math.min(255, b2)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars (parallax)
    for (const star of stars) {
      const sy = (star.y - camera.y * 0.15) % (canvas.height + 100);
      const sx = (star.x) % (canvas.width + 100);
      const twinkle = 0.6 + 0.4 * Math.sin(frameCount * 0.03 + star.x);
      ctx.globalAlpha = star.brightness * twinkle;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlatform(plat) {
    const sy = plat.y - camera.y;
    if (sy > canvas.height + 20 || sy < -40) return;

    const heightProgress = Math.min(plat.floor / 100, 1);

    // Platform color shifts from icy blue to purple/pink as you climb
    const r = Math.floor(100 + heightProgress * 120);
    const g = Math.floor(180 + heightProgress * (-80));
    const b = Math.floor(220 + heightProgress * 35);
    const mainColor = `rgb(${r},${g},${b})`;

    // Platform body
    ctx.fillStyle = mainColor;
    drawRoundedRect(plat.x, sy, plat.w, PLATFORM_H, 4);
    ctx.fill();

    // Top highlight (icy shine)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(plat.x + 3, sy, plat.w - 6, 3);

    // Floor number every 10 floors
    if (plat.floor > 0 && plat.floor % 10 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(plat.floor, plat.x + plat.w / 2, sy + PLATFORM_H - 2);
    }
  }

  function drawPlayer() {
    const sx = player.x;
    const sy = player.y - camera.y;
    const f = player.facing;

    ctx.save();
    ctx.translate(sx + PLAYER_W / 2, sy + PLAYER_H);
    if (f < 0) ctx.scale(-1, 1);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 2, PLAYER_W / 2 - 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bodyBounce = player.onGround ? Math.sin(player.walkFrame) * 2 : 0;
    const squash = player.vy > 5 ? 0.9 : (player.vy < -5 ? 1.15 : 1);
    const stretch = player.vy > 5 ? 1.12 : (player.vy < -5 ? 0.88 : 1);

    ctx.save();
    ctx.scale(stretch, squash);

    // Legs
    const legOffset = player.onGround ? Math.sin(player.walkFrame * 2) * 4 : 3;
    ctx.fillStyle = '#2a5db0';
    ctx.fillRect(-8, -14 + bodyBounce, 6, 14);
    ctx.fillRect(2, -14 + bodyBounce + (player.onGround ? -legOffset : 0), 6, 14);

    // Torso
    ctx.fillStyle = '#e94560';
    drawRoundedRect(-10, -30 + bodyBounce, 20, 18, 3);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffd5a3';
    ctx.beginPath();
    ctx.arc(0, -34 + bodyBounce, 9, 0, Math.PI * 2);
    ctx.fill();

    // Hat (beanie)
    ctx.fillStyle = '#4ecca3';
    ctx.beginPath();
    ctx.arc(0, -37 + bodyBounce, 9, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-9, -38 + bodyBounce, 18, 3);
    // Pom pom
    ctx.fillStyle = '#f5c518';
    ctx.beginPath();
    ctx.arc(0, -44 + bodyBounce, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(3, -34 + bodyBounce, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(4, -32 + bodyBounce, 3, 0, Math.PI * 0.6);
    ctx.stroke();

    ctx.restore(); // squash/stretch
    ctx.restore(); // translate/scale

    // Speed lines when moving fast
    if (Math.abs(player.vx) > MOVE_SPEED * 0.6 && !player.onGround) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const lx = sx + PLAYER_W / 2 - player.facing * (15 + i * 8);
        const ly = sy + 8 + i * 10;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - player.facing * 12, ly);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawComboText() {
    if (combo <= 2) return;
    const pulse = 1 + Math.sin(frameCount * 0.15) * 0.1;
    ctx.save();
    ctx.font = `bold ${Math.floor(24 * pulse)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5c518';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    const tx = canvas.width / 2;
    const ty = 80;
    ctx.strokeText('COMBO x' + combo + '!', tx, ty);
    ctx.fillText('COMBO x' + combo + '!', tx, ty);
    ctx.restore();
  }

  function draw() {
    ctx.save();

    // Screen shake
    if (screenShake > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * screenShake,
        (Math.random() - 0.5) * screenShake
      );
    }

    drawBackground();

    // Draw platforms
    for (const plat of platforms) {
      drawPlatform(plat);
    }

    // Particles behind player
    drawParticles();

    // Draw player
    drawPlayer();

    // Combo text overlay
    drawComboText();

    ctx.restore();
  }

  // --- Game loop ---
  function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // --- Input ---
  let touchJump = false;

  window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchId = touch.identifier;
    touchStartX = touch.clientX;
    touchActive = true;

    // Tap to jump
    touchJump = true;

    // Determine left/right based on touch position
    if (touch.clientX < canvas.width * 0.35) {
      touchDir = -1;
    } else if (touch.clientX > canvas.width * 0.65) {
      touchDir = 1;
    } else {
      touchDir = 0;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === touchId) {
        if (touch.clientX < canvas.width * 0.35) {
          touchDir = -1;
        } else if (touch.clientX > canvas.width * 0.65) {
          touchDir = 1;
        } else {
          touchDir = 0;
        }
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === touchId) {
        touchActive = false;
        touchDir = 0;
        touchId = null;
      }
    }
  });

  canvas.addEventListener('touchcancel', () => {
    touchActive = false;
    touchDir = 0;
    touchId = null;
  });

  // --- Buttons ---
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
  menuBtn.addEventListener('click', showMenu);

  window.addEventListener('resize', () => {
    if (gameRunning) resizeCanvas();
  });

  // Show high score on menu load
  const hs = SimplespilHighScores.get('tower');
  if (hs > 0) {
    menuHighScore.textContent = 'High score: floor ' + hs;
  }
})();
