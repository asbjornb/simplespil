(() => {
  'use strict';

  // --- Character drawing functions ---
  const characters = {
    dino: {
      color: '#4ecca3',
      draw(ctx, x, y, w, h, frame) {
        const legOffset = Math.sin(frame * 0.3) * 4;
        // Body
        ctx.fillStyle = '#4ecca3';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.45, y + h * 0.45, w * 0.35, h * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.ellipse(x + w * 0.75, y + h * 0.2, w * 0.2, h * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + w * 0.82, y + h * 0.16, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(x + w * 0.84, y + h * 0.16, 2, 0, Math.PI * 2);
        ctx.fill();
        // Spikes
        ctx.fillStyle = '#3ba88a';
        for (let i = 0; i < 4; i++) {
          const sx = x + w * 0.3 + i * w * 0.13;
          const sy = y + h * 0.12;
          ctx.beginPath();
          ctx.moveTo(sx - 4, sy + 8);
          ctx.lineTo(sx, sy - 4);
          ctx.lineTo(sx + 4, sy + 8);
          ctx.fill();
        }
        // Tail
        ctx.fillStyle = '#4ecca3';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.1, y + h * 0.45);
        ctx.quadraticCurveTo(x - w * 0.05, y + h * 0.2, x + w * 0.02, y + h * 0.15);
        ctx.quadraticCurveTo(x + w * 0.08, y + h * 0.25, x + w * 0.15, y + h * 0.35);
        ctx.fill();
        // Legs
        ctx.fillStyle = '#3ba88a';
        ctx.fillRect(x + w * 0.3, y + h * 0.7 + legOffset, 8, h * 0.25);
        ctx.fillRect(x + w * 0.55, y + h * 0.7 - legOffset, 8, h * 0.25);
        // Mouth
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + w * 0.85, y + h * 0.24, 5, 0, Math.PI * 0.8);
        ctx.stroke();
      }
    },
    unicorn: {
      color: '#e91e8f',
      draw(ctx, x, y, w, h, frame) {
        const bounce = Math.sin(frame * 0.25) * 3;
        // Body
        ctx.fillStyle = '#f8b4d9';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.45, y + h * 0.5, w * 0.35, h * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.ellipse(x + w * 0.78, y + h * 0.28, w * 0.18, h * 0.2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Horn
        ctx.fillStyle = '#f5c518';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.85, y + h * 0.12);
        ctx.lineTo(x + w * 0.9, y - h * 0.1 + bounce);
        ctx.lineTo(x + w * 0.8, y + h * 0.12);
        ctx.fill();
        // Horn stripes
        ctx.strokeStyle = '#e0a800';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.83, y + h * 0.06);
        ctx.lineTo(x + w * 0.88, y + h * 0.06);
        ctx.stroke();
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + w * 0.83, y + h * 0.24, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(x + w * 0.84, y + h * 0.24, 2, 0, Math.PI * 2);
        ctx.fill();
        // Mane
        const maneColors = ['#e94560', '#9b59b6', '#3498db', '#4ecca3', '#f5c518'];
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = maneColors[i];
          const mx = x + w * 0.65 - i * w * 0.06;
          const my = y + h * 0.15 + Math.sin(frame * 0.2 + i) * 3;
          ctx.beginPath();
          ctx.ellipse(mx, my, 5, 8, -0.3 + i * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        // Legs
        ctx.fillStyle = '#f0a0cc';
        const legKick = Math.sin(frame * 0.3) * 3;
        ctx.fillRect(x + w * 0.28, y + h * 0.7 + legKick, 7, h * 0.26);
        ctx.fillRect(x + w * 0.38, y + h * 0.7 - legKick, 7, h * 0.26);
        ctx.fillRect(x + w * 0.52, y + h * 0.7 + legKick, 7, h * 0.26);
        ctx.fillRect(x + w * 0.62, y + h * 0.7 - legKick, 7, h * 0.26);
        // Tail
        const tailColors = ['#e94560', '#f5c518', '#9b59b6'];
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = tailColors[i];
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + w * 0.12, y + h * 0.45);
          ctx.quadraticCurveTo(
            x - w * 0.05, y + h * (0.2 + i * 0.08) + Math.sin(frame * 0.2 + i) * 5,
            x - w * 0.02, y + h * (0.1 + i * 0.1)
          );
          ctx.stroke();
        }
      }
    },
    hamster: {
      color: '#f39c12',
      draw(ctx, x, y, w, h, frame) {
        const cheekPuff = Math.sin(frame * 0.15) * 2;
        // Body
        ctx.fillStyle = '#f5c06e';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.45, y + h * 0.5, w * 0.35, h * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
        // Belly
        ctx.fillStyle = '#fde8c8';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.45, y + h * 0.55, w * 0.22, h * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.fillStyle = '#f5c06e';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.72, y + h * 0.32, w * 0.22, h * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = '#e8a84c';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.62, y + h * 0.12, 7, 9, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.82, y + h * 0.12, 7, 9, 0.4, 0, Math.PI * 2);
        ctx.fill();
        // Inner ears
        ctx.fillStyle = '#f8b4d9';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.62, y + h * 0.13, 4, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.82, y + h * 0.13, 4, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();
        // Cheeks
        ctx.fillStyle = '#f8b4d9';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(x + w * 0.6, y + h * 0.38, 8 + cheekPuff, 6 + cheekPuff, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.84, y + h * 0.38, 8 + cheekPuff, 6 + cheekPuff, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Eyes
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(x + w * 0.66, y + h * 0.28, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w * 0.78, y + h * 0.28, 3.5, 0, Math.PI * 2);
        ctx.fill();
        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + w * 0.67, y + h * 0.27, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w * 0.79, y + h * 0.27, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Nose
        ctx.fillStyle = '#e8a84c';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.72, y + h * 0.34, 3, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Whiskers
        ctx.strokeStyle = '#d49a4e';
        ctx.lineWidth = 1;
        for (let side = -1; side <= 1; side += 2) {
          for (let j = 0; j < 2; j++) {
            ctx.beginPath();
            ctx.moveTo(x + w * 0.72 + side * 8, y + h * 0.36 + j * 4);
            ctx.lineTo(x + w * 0.72 + side * 22, y + h * 0.34 + j * 6 - 2);
            ctx.stroke();
          }
        }
        // Legs (tiny paws)
        ctx.fillStyle = '#e8a84c';
        const legMove = Math.sin(frame * 0.3) * 3;
        ctx.beginPath();
        ctx.ellipse(x + w * 0.3, y + h * 0.82 + legMove, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.55, y + h * 0.82 - legMove, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.strokeStyle = '#e8a84c';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.12, y + h * 0.5);
        ctx.quadraticCurveTo(x - w * 0.02, y + h * 0.35, x + w * 0.05, y + h * 0.3);
        ctx.stroke();
      }
    },
    slime: {
      color: '#7bed9f',
      draw(ctx, x, y, w, h, frame) {
        const wobble = Math.sin(frame * 0.2) * 2;
        const squish = Math.sin(frame * 0.15) * 1.5;

        // Drip trails on ground
        ctx.fillStyle = 'rgba(123, 237, 159, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.25, y + h * 0.95, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.7, y + h * 0.93, 3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body (blobby shape using overlapping arcs)
        ctx.fillStyle = '#7bed9f';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.1, y + h * 0.9);
        ctx.quadraticCurveTo(x - w * 0.02 + wobble, y + h * 0.45, x + w * 0.2, y + h * 0.15 - squish);
        ctx.quadraticCurveTo(x + w * 0.4, y - h * 0.05 - squish, x + w * 0.55, y + h * 0.1 - squish);
        ctx.quadraticCurveTo(x + w * 0.75, y + h * 0.02 - squish, x + w * 0.85, y + h * 0.2);
        ctx.quadraticCurveTo(x + w * 1.02 - wobble, y + h * 0.5, x + w * 0.9, y + h * 0.9);
        ctx.quadraticCurveTo(x + w * 0.5, y + h * 1.0 + squish, x + w * 0.1, y + h * 0.9);
        ctx.fill();

        // Body highlight (lighter blob for shine)
        ctx.fillStyle = 'rgba(170, 255, 200, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.35, y + h * 0.35 - squish, w * 0.18, h * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Small drip on right side
        ctx.fillStyle = '#7bed9f';
        ctx.beginPath();
        ctx.moveTo(x + w * 0.82, y + h * 0.65);
        ctx.quadraticCurveTo(x + w * 0.88, y + h * 0.7 + Math.sin(frame * 0.25) * 2, x + w * 0.83, y + h * 0.78 + Math.sin(frame * 0.25) * 2);
        ctx.quadraticCurveTo(x + w * 0.78, y + h * 0.72, x + w * 0.82, y + h * 0.65);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.38, y + h * 0.35 - squish, 9, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.62, y + h * 0.33 - squish, 9, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (look slightly forward)
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.41, y + h * 0.37 - squish, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.65, y + h * 0.35 - squish, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + w * 0.36, y + h * 0.31 - squish, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w * 0.6, y + h * 0.29 - squish, 3, 0, Math.PI * 2);
        ctx.fill();

        // Mouth (happy smile)
        ctx.strokeStyle = '#2d8a56';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + h * 0.48 - squish, 8, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Blush spots
        ctx.fillStyle = 'rgba(255, 150, 180, 0.35)';
        ctx.beginPath();
        ctx.ellipse(x + w * 0.25, y + h * 0.48 - squish, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + w * 0.75, y + h * 0.46 - squish, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // --- Obstacle drawing ---
  function drawCactus(ctx, x, y, w, h) {
    ctx.fillStyle = '#5a8a4a';
    // Main trunk
    ctx.fillRect(x + w * 0.35, y, w * 0.3, h);
    // Left arm
    ctx.fillRect(x, y + h * 0.2, w * 0.35, w * 0.25);
    ctx.fillRect(x, y + h * 0.05, w * 0.25, h * 0.2);
    // Right arm
    ctx.fillRect(x + w * 0.65, y + h * 0.35, w * 0.35, w * 0.25);
    ctx.fillRect(x + w * 0.75, y + h * 0.15, w * 0.25, h * 0.25);
    // Spines
    ctx.strokeStyle = '#7ab86a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const sy = y + h * 0.1 + i * h * 0.18;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.35, sy);
      ctx.lineTo(x + w * 0.25, sy - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w * 0.65, sy);
      ctx.lineTo(x + w * 0.75, sy - 3);
      ctx.stroke();
    }
  }

  function drawRock(ctx, x, y, w, h) {
    ctx.fillStyle = '#7a7a8a';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w * 0.15, y + h * 0.3);
    ctx.lineTo(x + w * 0.4, y);
    ctx.lineTo(x + w * 0.7, y + h * 0.15);
    ctx.lineTo(x + w, y + h * 0.4);
    ctx.lineTo(x + w * 0.9, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a8a9a';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.4, y);
    ctx.lineTo(x + w * 0.5, y + h * 0.5);
    ctx.lineTo(x + w * 0.15, y + h * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // --- Cloud drawing ---
  function drawCloud(ctx, x, y, size) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 1.2, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 2, y, size * 0.9, 0, Math.PI * 2);
    ctx.arc(x + size, y + size * 0.2, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Game state ---
  let selectedChar = 'dino';
  let canvas, ctx;
  let gameRunning = false;
  let animFrame = 0;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('jump_highscore') || '0', 10);
  let gameSpeed = 4;
  let groundY;
  let player = {};
  let obstacles = [];
  let clouds = [];
  let groundTiles = [];
  let frameCount = 0;

  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const PLAYER_W = 60;
  const PLAYER_H = 55;
  const MIN_OBSTACLE_GAP = 250;

  // --- DOM refs ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const gameOverEl = document.getElementById('game-over');
  const scoreEl = document.getElementById('score-display');
  const highScoreEl = document.getElementById('high-score-display');
  const finalScoreEl = document.getElementById('final-score');
  const newHighEl = document.getElementById('new-high');
  const menuHighEl = document.getElementById('menu-high-score');

  // --- Character select ---
  const charBtns = document.querySelectorAll('.char-btn');
  charBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      charBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedChar = btn.dataset.char;
    });
  });

  // Draw character previews
  function drawPreviews() {
    for (const [name, char] of Object.entries(characters)) {
      const previewCanvas = document.getElementById(`preview-${name}`);
      if (!previewCanvas) continue;
      const pctx = previewCanvas.getContext('2d');
      pctx.clearRect(0, 0, 80, 80);
      char.draw(pctx, 5, 5, 70, 70, 0);
    }
  }
  drawPreviews();

  // --- Start ---
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', startGame);
  document.getElementById('menu-btn').addEventListener('click', () => {
    gameRunning = false;
    gameEl.style.display = 'none';
    gameOverEl.style.display = 'none';
    menuEl.style.display = 'flex';
    drawPreviews();
  });

  function updateHighScoreDisplay() {
    highScoreEl.textContent = `Best: ${highScore}`;
    if (highScore > 0) {
      menuHighEl.textContent = `High Score: ${highScore}`;
    }
  }

  function startGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';
    gameOverEl.style.display = 'none';

    groundY = canvas.height - 60;
    score = 0;
    gameSpeed = 4;
    frameCount = 0;
    obstacles = [];
    clouds = [];

    // Init ground tiles
    groundTiles = [];
    for (let i = 0; i < canvas.width + 40; i += 20) {
      groundTiles.push({ x: i });
    }

    // Init clouds
    for (let i = 0; i < 5; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: 40 + Math.random() * (groundY * 0.4),
        size: 15 + Math.random() * 20,
        speed: 0.3 + Math.random() * 0.5
      });
    }

    player = {
      x: 60,
      y: groundY - PLAYER_H,
      w: PLAYER_W,
      h: PLAYER_H,
      vy: 0,
      jumping: false,
      grounded: true
    };

    updateHighScoreDisplay();
    gameRunning = true;
    animFrame = 0;
    requestAnimationFrame(gameLoop);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', () => {
    if (canvas) {
      resizeCanvas();
      if (gameRunning) {
        groundY = canvas.height - 60;
        player.y = Math.min(player.y, groundY - PLAYER_H);
      }
    }
  });

  // --- Input ---
  function jump() {
    if (!gameRunning) return;
    if (player.grounded) {
      player.vy = JUMP_FORCE;
      player.jumping = true;
      player.grounded = false;
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jump();
    }
  });

  canvas = document.getElementById('game-canvas');
  if (canvas) {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      jump();
    });
    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      jump();
    });
  }

  // --- Game loop ---
  function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  function update() {
    frameCount++;
    animFrame++;

    // Score increases over time
    if (frameCount % 5 === 0) {
      score++;
      scoreEl.textContent = `Score: ${score}`;
    }

    // Speed up gradually
    gameSpeed = 4 + score * 0.01;
    if (gameSpeed > 14) gameSpeed = 14;

    // Player physics
    player.vy += GRAVITY;
    player.y += player.vy;
    if (player.y >= groundY - PLAYER_H) {
      player.y = groundY - PLAYER_H;
      player.vy = 0;
      player.jumping = false;
      player.grounded = true;
    }

    // Spawn obstacles
    const lastObs = obstacles[obstacles.length - 1];
    const minGap = MIN_OBSTACLE_GAP - score * 0.3;
    const gap = Math.max(minGap, 150);
    if (!lastObs || lastObs.x < canvas.width - gap) {
      if (Math.random() < 0.02 + score * 0.0002) {
        const type = Math.random() < 0.5 ? 'cactus' : 'rock';
        const ow = type === 'cactus' ? 30 + Math.random() * 20 : 35 + Math.random() * 25;
        const oh = type === 'cactus' ? 40 + Math.random() * 25 : 25 + Math.random() * 15;
        obstacles.push({
          x: canvas.width + 20,
          y: groundY - oh,
          w: ow,
          h: oh,
          type
        });
      }
    }

    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= gameSpeed;
      if (obstacles[i].x + obstacles[i].w < -20) {
        obstacles.splice(i, 1);
      }
    }

    // Move clouds
    for (const cloud of clouds) {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.size * 3 < 0) {
        cloud.x = canvas.width + 20;
        cloud.y = 40 + Math.random() * (groundY * 0.4);
        cloud.size = 15 + Math.random() * 20;
      }
    }

    // Move ground
    for (const tile of groundTiles) {
      tile.x -= gameSpeed;
      if (tile.x < -20) {
        tile.x += groundTiles.length * 20;
      }
    }

    // Collision detection (with forgiving hitbox)
    const px = player.x + 10;
    const py = player.y + 8;
    const pw = player.w - 20;
    const ph = player.h - 12;

    for (const obs of obstacles) {
      const ox = obs.x + 4;
      const oy = obs.y + 4;
      const ow = obs.w - 8;
      const oh = obs.h - 4;

      if (px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy) {
        endGame();
        return;
      }
    }
  }

  function draw() {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.6, '#1a1a3e');
    grad.addColorStop(1, '#2a1a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 137.5 + frameCount * 0.1) % canvas.width;
      const sy = (i * 97.3) % (groundY * 0.5);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Clouds
    for (const cloud of clouds) {
      drawCloud(ctx, cloud.x, cloud.y, cloud.size);
    }

    // Ground
    ctx.fillStyle = '#2d2d44';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.strokeStyle = '#3d3d55';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Ground texture
    ctx.fillStyle = '#3d3d55';
    for (const tile of groundTiles) {
      ctx.fillRect(tile.x, groundY + 8, 12, 2);
      ctx.fillRect(tile.x + 5, groundY + 18, 8, 2);
    }

    // Obstacles
    for (const obs of obstacles) {
      if (obs.type === 'cactus') {
        drawCactus(ctx, obs.x, obs.y, obs.w, obs.h);
      } else {
        drawRock(ctx, obs.x, obs.y, obs.w, obs.h);
      }
    }

    // Player
    characters[selectedChar].draw(ctx, player.x, player.y, player.w, player.h, animFrame);
  }

  function endGame() {
    gameRunning = false;
    let isNew = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('jump_highscore', String(highScore));
      isNew = true;
    }
    finalScoreEl.textContent = `Score: ${score}`;
    newHighEl.style.display = isNew ? 'block' : 'none';
    updateHighScoreDisplay();
    gameOverEl.style.display = 'flex';
  }

  // Show menu high score on load
  updateHighScoreDisplay();
})();
