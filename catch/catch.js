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

  // --- Power-up definitions ---
  const POWERUPS = [
    {
      name: 'wide',
      color: '#ffd700',
      label: 'Wide Basket!',
      duration: 300, // ~5 seconds in frames
      draw(ctx, x, y, r, shimmer) {
        // Golden apple
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x, y + r * 0.1, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + shimmer * 0.2) + ')';
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
        // Golden leaf
        ctx.fillStyle = '#ffe066';
        ctx.beginPath();
        ctx.ellipse(x + r * 0.3, y - r * 1.1, r * 0.35, r * 0.15, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      name: 'freeze',
      color: '#00d4ff',
      label: 'Freeze!',
      duration: 300,
      draw(ctx, x, y, r, shimmer) {
        // Ice crystal / frozen fruit
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // Inner glow
        ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + shimmer * 0.3) + ')';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        // Snowflake cross
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = r * 0.1;
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const a = (Math.PI * i) / 3;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7);
          ctx.lineTo(x - Math.cos(a) * r * 0.7, y - Math.sin(a) * r * 0.7);
          ctx.stroke();
        }
      }
    },
    {
      name: 'double',
      color: '#ff69b4',
      label: 'Double Points!',
      duration: 300,
      draw(ctx, x, y, r, shimmer) {
        // Rainbow star
        const spikes = 5;
        const outerR = r;
        const innerR = r * 0.45;
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI * i) / spikes - Math.PI / 2;
          const px = x + Math.cos(angle) * radius;
          const py = y + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        // Shimmer center
        ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + shimmer * 0.3) + ')';
        ctx.beginPath();
        ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        // x2 text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + (r * 0.7) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('x2', x, y + 1);
      }
    },
    {
      name: 'heart',
      color: '#ff4466',
      label: '+1 Life!',
      duration: 0, // instant effect
      draw(ctx, x, y, r, shimmer) {
        // Heart shape
        ctx.fillStyle = '#ff4466';
        ctx.beginPath();
        const topY = y - r * 0.3;
        ctx.moveTo(x, y + r * 0.8);
        ctx.bezierCurveTo(x - r * 1.5, y - r * 0.2, x - r * 0.8, topY - r * 0.8, x, topY);
        ctx.bezierCurveTo(x + r * 0.8, topY - r * 0.8, x + r * 1.5, y - r * 0.2, x, y + r * 0.8);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + shimmer * 0.2) + ')';
        ctx.beginPath();
        ctx.ellipse(x - r * 0.3, y - r * 0.3, r * 0.2, r * 0.3, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  ];

  // --- Power-up state ---
  let activePowerups = {}; // { wide: framesLeft, freeze: framesLeft, double: framesLeft }
  let totalCatches = 0;

  function getPowerupChance() {
    // 5% base, only after 10 seconds of play
    return gameTime > 600 ? 0.05 : 0;
  }

  function applyPowerup(powerup) {
    if (powerup.name === 'heart') {
      if (lives < MAX_LIVES) {
        lives++;
        updateHud();
      }
    } else {
      activePowerups[powerup.name] = powerup.duration;
    }
  }

  function updatePowerups(dt) {
    for (const name of Object.keys(activePowerups)) {
      activePowerups[name] -= dt;
      if (activePowerups[name] <= 0) {
        delete activePowerups[name];
      }
    }
  }

  function getBasketWidth() {
    return activePowerups.wide ? BASKET_W * 1.5 : BASKET_W;
  }

  function getEffectiveFallSpeed() {
    const base = getFallSpeed();
    return activePowerups.freeze ? base * 0.4 : base;
  }

  function getPointsMultiplier() {
    return activePowerups.double ? 2 : 1;
  }

  // --- Streak celebration system ---
  const celebrations = [];
  const STREAK_MILESTONES = [
    { count: 5, text: 'Nice!', color: '#4ecca3' },
    { count: 10, text: 'Great!', color: '#f5c518' },
    { count: 20, text: 'Amazing!', color: '#f39c12' },
    { count: 30, text: 'Incredible!', color: '#ff69b4' },
    { count: 50, text: 'UNSTOPPABLE!', color: '#ff4444' },
    { count: 75, text: 'LEGENDARY!', color: '#ffd700' },
    { count: 100, text: 'GOD MODE!', color: '#00ffff' },
  ];
  let lastMilestone = 0;

  function checkStreak() {
    for (const m of STREAK_MILESTONES) {
      if (totalCatches === m.count && totalCatches > lastMilestone) {
        lastMilestone = totalCatches;
        celebrations.push({
          text: m.text,
          color: m.color,
          life: 1,
          scale: 0,
          y: canvas.height * 0.3
        });
        // Spawn celebration particles across the screen
        for (let i = 0; i < 16; i++) {
          const px = Math.random() * canvas.width;
          const py = canvas.height * 0.3 + (Math.random() - 0.5) * 60;
          particles.push({
            x: px, y: py,
            vx: (Math.random() - 0.5) * 6,
            vy: -(2 + Math.random() * 4),
            life: 1,
            color: m.color,
            r: 3 + Math.random() * 5
          });
        }
      }
    }
  }

  function updateCelebrations() {
    for (let i = celebrations.length - 1; i >= 0; i--) {
      const c = celebrations[i];
      // Scale up quickly, then hold, then fade
      if (c.scale < 1) {
        c.scale = Math.min(1, c.scale + 0.08);
      }
      c.y -= 0.3;
      c.life -= 0.012;
      if (c.life <= 0) celebrations.splice(i, 1);
    }
  }

  function drawCelebrations(ctx) {
    const font = getComputedStyle(document.body).fontFamily;
    for (const c of celebrations) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, c.life * 2);
      ctx.translate(canvas.width / 2, c.y);
      ctx.scale(c.scale, c.scale);
      // Shadow for readability
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.font = 'bold 48px ' + font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.text, 2, 2);
      // Main text
      ctx.fillStyle = c.color;
      ctx.fillText(c.text, 0, 0);
      ctx.restore();
    }
  }

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
  let highScore = SimplespilHighScores.get('catch');
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
    gameContainerEl.style.display = 'block';

    resizeCanvas();

    score = 0;
    lives = MAX_LIVES;
    combo = 0;
    gameTime = 0;
    totalCatches = 0;
    lastMilestone = 0;
    fallingItems = [];
    particles.length = 0;
    popups.length = 0;
    celebrations.length = 0;
    activePowerups = {};
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
    // Start at 60 frames, decrease to 20 over ~90 seconds
    return Math.max(20, 60 - gameTime * 0.007);
  }

  function getFallSpeed() {
    // Start at 2.5, increase to 10 over ~2 minutes
    return Math.min(10, 2.5 + gameTime * 0.001);
  }

  function getBombChance() {
    // Start at 10%, increase to 25% over ~2 minutes
    return Math.min(0.25, 0.10 + gameTime * 0.00002);
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

    // Clamp basket position (use effective basket width)
    const currentBasketW = getBasketWidth();
    const halfW = currentBasketW / 2;
    basket.x = Math.max(halfW, Math.min(canvas.width - halfW, basket.x));

    // Spawn items
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnItem();
      spawnTimer = getSpawnInterval();
    }

    // Update power-up timers
    updatePowerups(dt);

    // Update falling items
    const fallSpeed = getEffectiveFallSpeed();
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
        } else if (item.isPowerup) {
          // Caught power-up
          applyPowerup(item.powerup);
          spawnCatchParticles(item.x, item.y, item.powerup.color);
          spawnPopup(item.x, item.y - 20, item.powerup.label, item.powerup.color);
          fallingItems.splice(i, 1);
          updateHud();
        } else {
          // Caught fruit
          combo++;
          totalCatches++;
          const comboMult = 1 + Math.floor(combo / 5);
          const pointsMult = getPointsMultiplier();
          const points = item.fruit.points * comboMult * pointsMult;
          score += points;
          let label = `+${points}`;
          if (comboMult > 1 && pointsMult > 1) label += ` x${comboMult} x${pointsMult}`;
          else if (comboMult > 1) label += ` x${comboMult}`;
          else if (pointsMult > 1) label += ` x${pointsMult}`;
          spawnCatchParticles(item.x, item.y, item.fruit.color);
          spawnPopup(item.x, item.y - 20, label, item.fruit.color);
          fallingItems.splice(i, 1);
          updateHud();
          checkStreak();
        }
        continue;
      }

      // Missed - fell below screen
      if (item.y > canvas.height + FRUIT_R * 2) {
        if (!item.isBomb && !item.isPowerup) {
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
    updateCelebrations();
  }

  function spawnItem() {
    const margin = FRUIT_R * 2;
    const x = margin + Math.random() * (canvas.width - margin * 2);
    const isBomb = Math.random() < getBombChance();

    if (isBomb) {
      fallingItems.push({
        x, y: -FRUIT_R * 2,
        isBomb: true, isPowerup: false,
        wobble: Math.random() * Math.PI * 2,
        fruit: null, powerup: null
      });
      return;
    }

    // Check for power-up spawn
    if (Math.random() < getPowerupChance()) {
      // Pick a random power-up, but only allow heart if lives < MAX
      let available = POWERUPS;
      if (lives >= MAX_LIVES) {
        available = POWERUPS.filter(p => p.name !== 'heart');
      }
      const powerup = available[Math.floor(Math.random() * available.length)];
      fallingItems.push({
        x, y: -FRUIT_R * 2,
        isBomb: false, isPowerup: true,
        wobble: Math.random() * Math.PI * 2,
        fruit: null, powerup
      });
      return;
    }

    const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    fallingItems.push({
      x, y: -FRUIT_R * 2,
      isBomb: false, isPowerup: false,
      wobble: Math.random() * Math.PI * 2,
      fruit, powerup: null
    });
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
      } else if (item.isPowerup) {
        // Glow effect behind power-up
        const shimmer = Math.sin(item.wobble * 3) * 0.5 + 0.5;
        ctx.save();
        ctx.shadowColor = item.powerup.color;
        ctx.shadowBlur = 12 + shimmer * 8;
        ctx.beginPath();
        ctx.arc(item.x, item.y, FRUIT_R * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.01)';
        ctx.fill();
        ctx.restore();
        item.powerup.draw(ctx, item.x, item.y, FRUIT_R, shimmer);
      } else {
        item.fruit.draw(ctx, item.x, item.y, FRUIT_R);
      }
      ctx.restore();
    }

    // Draw basket (with power-up width)
    const currentBasketW = getBasketWidth();
    drawBasket(ctx, basket.x, basket.y, currentBasketW, BASKET_H);

    // Glow effect on basket when wide power-up is active
    if (activePowerups.wide) {
      ctx.save();
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = 'rgba(255,215,0,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(basket.x - currentBasketW / 2 - 2, basket.y - 4, currentBasketW + 4, BASKET_H + 8);
      ctx.stroke();
      ctx.restore();
    }

    // Draw particles and popups
    drawParticles(ctx);
    drawPopups(ctx);

    // Draw celebrations
    drawCelebrations(ctx);

    // Active power-up indicators (top-left area)
    const font = getComputedStyle(document.body).fontFamily;
    let indicatorY = 60;
    for (const name of Object.keys(activePowerups)) {
      const pu = POWERUPS.find(p => p.name === name);
      if (!pu) continue;
      const remaining = activePowerups[name];
      const fraction = remaining / pu.duration;
      // Background bar
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.roundRect(10, indicatorY, 120, 22, 6);
      ctx.fill();
      // Fill bar
      ctx.fillStyle = pu.color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.roundRect(10, indicatorY, 120 * fraction, 22, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px ' + font;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(pu.label, 16, indicatorY + 11);
      indicatorY += 28;
    }

    // Freeze tint overlay
    if (activePowerups.freeze) {
      ctx.fillStyle = 'rgba(0,180,255,0.05)';
      ctx.fillRect(0, 0, w, h);
    }

    // Combo indicator - only show when multiplier is active
    const comboMult = 1 + Math.floor(combo / 5);
    if (comboMult > 1) {
      ctx.fillStyle = comboMult >= 4 ? '#f5c518' : comboMult >= 2 ? '#f39c12' : '#4ecca3';
      ctx.font = 'bold 16px ' + font;
      ctx.textAlign = 'center';
      ctx.fillText(`x${comboMult} bonus!`, basket.x, basket.y - 30);
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

    const result = SimplespilHighScores.save('catch', score);
    highScore = result.highScore;
    updateHighScoreDisplay();

    SimplespilStats.recordPlay('catch');

    finalScoreEl.textContent = score;
    newBestEl.style.display = result.isNew ? 'block' : 'none';
    gameContainerEl.style.display = 'none';
    gameOverEl.style.display = 'flex';
  }

  // --- Show menu ---
  function showMenu() {
    gameRunning = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    lastTime = 0;
    gameContainerEl.style.display = 'none';
    gameOverEl.style.display = 'none';
    menuEl.style.display = 'flex';
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
