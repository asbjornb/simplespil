(() => {
  // --- Mole type definitions ---
  const MOLE_COLORS = {
    normal: { body: '#8B6914', belly: '#D4A44C', ear: '#6B4F10', innerEar: '#D4A44C', snout: '#D4A44C', nose: '#4a2800', whisker: '#6B4F10', pupil: '#1a1a2e' },
    golden: { body: '#FFD700', belly: '#FFF8DC', ear: '#DAA520', innerEar: '#FFF8DC', snout: '#FFF8DC', nose: '#8B6914', whisker: '#DAA520', pupil: '#1a1a2e' },
    speed:  { body: '#2277DD', belly: '#88BBEE', ear: '#1155AA', innerEar: '#88BBEE', snout: '#88BBEE', nose: '#112244', whisker: '#1155AA', pupil: '#1a1a2e' },
    bomb:   { body: '#8B1A1A', belly: '#CC4444', ear: '#660000', innerEar: '#CC4444', snout: '#CC6666', nose: '#1a0000', whisker: '#440000', pupil: '#cc0000' },
  };

  const MOLE_POINTS = { normal: 1, golden: 3, speed: 2, bomb: -2 };

  // --- Difficulty presets ---
  const DIFFICULTIES = {
    easy:   { totalWaves: 8,  baseMoles: 4, molesGrowth: 1, baseInterval: 1300, minInterval: 500, baseUp: 75, minUp: 35 },
    normal: { totalWaves: 10, baseMoles: 5, molesGrowth: 1, baseInterval: 1200, minInterval: 400, baseUp: 70, minUp: 30 },
    hard:   { totalWaves: 12, baseMoles: 5, molesGrowth: 2, baseInterval: 1100, minInterval: 350, baseUp: 60, minUp: 25 },
  };

  // --- Game state ---
  let canvas, ctx;
  let gameRunning = false;
  let animFrame = null;
  let score = 0;
  let highScore = SimplespilHighScores.get('whacamole');
  let frame = 0;
  let lastMoleSpawn = 0;
  let difficulty = 'normal';

  // Wave state
  let wave = 0;
  let waveParams = null;
  let molesSpawned = 0;
  let molesResolved = 0;
  let waveTransition = false;
  let waveTransitionTimer = 0;
  const WAVE_TRANSITION_FRAMES = 120;

  // Grid: 3 columns x 3 rows of holes
  const COLS = 3;
  const ROWS = 3;
  const holes = [];

  // Particles & popups
  const particles = [];
  const popups = [];

  // Hammer cursor state
  let hammerHitting = false;
  let hammerTimer = 0;

  // --- DOM refs ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const scoreDisplay = document.getElementById('score-display');
  const waveDisplay = document.getElementById('wave-display');
  const highScoreDisplay = document.getElementById('high-score-display');
  const gameOverEl = document.getElementById('game-over');
  const gameOverTitle = document.getElementById('game-over-title');
  const finalScoreEl = document.getElementById('final-score');
  const finalWaveEl = document.getElementById('final-wave');
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
      difficulty = btn.dataset.difficulty;
    });
  });

  // --- Show high score on menu ---
  function updateMenuHighScore() {
    menuHighScore.textContent = highScore > 0 ? `Best: ${highScore}` : '';
  }
  updateMenuHighScore();

  // --- Wave parameters ---
  function getWaveParams(waveNum) {
    const d = DIFFICULTIES[difficulty];
    const progress = (waveNum - 1) / Math.max(1, d.totalWaves - 1);
    return {
      moleCount: d.baseMoles + (waveNum - 1) * d.molesGrowth,
      spawnInterval: Math.max(d.minInterval, d.baseInterval - progress * (d.baseInterval - d.minInterval)),
      upDuration: Math.max(d.minUp, d.baseUp - progress * (d.baseUp - d.minUp)),
      goldenChance: waveNum >= 2 ? Math.min(0.18, (waveNum - 1) * 0.03) : 0,
      speedChance:  waveNum >= 3 ? Math.min(0.20, (waveNum - 2) * 0.04) : 0,
      bombChance:   waveNum >= 4 ? Math.min(0.15, (waveNum - 3) * 0.03) : 0,
    };
  }

  function pickMoleType() {
    if (!waveParams) return 'normal';
    const r = Math.random();
    let threshold = 0;
    threshold += waveParams.bombChance;
    if (r < threshold) return 'bomb';
    threshold += waveParams.speedChance;
    if (r < threshold) return 'speed';
    threshold += waveParams.goldenChance;
    if (r < threshold) return 'golden';
    return 'normal';
  }

  function getWaveTip(waveNum) {
    if (waveNum === 2) return { text: 'Golden moles = 3 points!', color: '#FFD700' };
    if (waveNum === 3) return { text: 'Speed moles are fast! +2 points', color: '#4499FF' };
    if (waveNum === 4) return { text: 'Don\'t hit bomb moles! -2 points', color: '#FF4444' };
    return null;
  }

  // --- Drawing helpers ---

  function drawStar(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      const outerX = cx + Math.cos(angle) * r;
      const outerY = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);
      const innerAngle = angle + Math.PI / 5;
      ctx.lineTo(cx + Math.cos(innerAngle) * r * 0.4, cy + Math.sin(innerAngle) * r * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 1.6, y, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x - size * 0.7, y + size * 0.2, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Draw mole (type-aware) ---

  function drawMole(cx, cy, size, moleY, state, bonkFrame, type) {
    const s = size;
    const c = MOLE_COLORS[type] || MOLE_COLORS.normal;

    // Dirt mound (always visible)
    ctx.fillStyle = '#8B5E3C';
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.15, s * 0.55, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(cx, my + s * 0.1, s * 0.35, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = c.belly;
    ctx.beginPath();
    ctx.ellipse(cx, my + s * 0.18, s * 0.22, s * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(cx, my - s * 0.2, s * 0.3, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = c.ear;
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.25, my - s * 0.35, s * 0.08, s * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.25, my - s * 0.35, s * 0.08, s * 0.1, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Inner ears
    ctx.fillStyle = c.innerEar;
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.25, my - s * 0.35, s * 0.04, s * 0.06, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.25, my - s * 0.35, s * 0.04, s * 0.06, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // --- Type-specific decorations ---

    // Golden crown
    if (type === 'golden' && state !== 'bonked') {
      ctx.fillStyle = '#FFA500';
      const crownY = my - s * 0.48;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.12, crownY + s * 0.08);
      ctx.lineTo(cx - s * 0.12, crownY);
      ctx.lineTo(cx - s * 0.06, crownY + s * 0.04);
      ctx.lineTo(cx, crownY - s * 0.02);
      ctx.lineTo(cx + s * 0.06, crownY + s * 0.04);
      ctx.lineTo(cx + s * 0.12, crownY);
      ctx.lineTo(cx + s * 0.12, crownY + s * 0.08);
      ctx.closePath();
      ctx.fill();
      // Sparkles
      ctx.fillStyle = '#FFF8DC';
      for (let i = 0; i < 4; i++) {
        const angle = frame * 0.05 + i * Math.PI / 2;
        const sx = cx + Math.cos(angle) * s * 0.45;
        const sy = my - s * 0.1 + Math.sin(angle) * s * 0.3;
        drawStar(sx, sy, s * 0.03);
      }
    }

    // Bomb fuse
    if (type === 'bomb' && state !== 'bonked') {
      ctx.strokeStyle = '#444';
      ctx.lineWidth = Math.max(2, s * 0.03);
      ctx.beginPath();
      ctx.moveTo(cx, my - s * 0.45);
      ctx.quadraticCurveTo(cx + s * 0.1, my - s * 0.55, cx + s * 0.05, my - s * 0.6);
      ctx.stroke();
      const sparkSize = s * 0.04 + Math.sin(frame * 0.3) * s * 0.02;
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.arc(cx + s * 0.05, my - s * 0.6, sparkSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(cx + s * 0.05, my - s * 0.6, sparkSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Speed lightning bolts
    if (type === 'speed' && state !== 'bonked') {
      ctx.fillStyle = '#FFFF00';
      ctx.strokeStyle = '#FFAA00';
      ctx.lineWidth = Math.max(1, s * 0.02);
      const drawBolt = (bx, by, flip) => {
        const f = flip ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(bx, by - s * 0.06);
        ctx.lineTo(bx + f * s * 0.05, by - s * 0.02);
        ctx.lineTo(bx + f * s * 0.02, by - s * 0.02);
        ctx.lineTo(bx + f * s * 0.07, by + s * 0.04);
        ctx.lineTo(bx + f * s * 0.03, by);
        ctx.lineTo(bx + f * s * 0.05, by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      };
      drawBolt(cx - s * 0.38, my - s * 0.15, false);
      drawBolt(cx + s * 0.38, my - s * 0.15, true);
    }

    // Snout
    ctx.fillStyle = c.snout;
    ctx.beginPath();
    ctx.ellipse(cx, my - s * 0.12, s * 0.15, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = c.nose;
    ctx.beginPath();
    ctx.ellipse(cx, my - s * 0.16, s * 0.06, s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    if (state === 'bonked') {
      // X eyes
      ctx.strokeStyle = type === 'bomb' ? '#FFD700' : '#4a2800';
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
      ctx.fillStyle = type === 'bomb' ? '#e94560' : '#f5c518';
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
      ctx.fillStyle = c.pupil;
      ctx.beginPath();
      ctx.arc(cx - s * 0.13, my - s * 0.25, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + s * 0.15, my - s * 0.25, s * 0.035, 0, Math.PI * 2);
      ctx.fill();

      // Angry eyebrows for bomb mole
      if (type === 'bomb') {
        ctx.strokeStyle = c.nose;
        ctx.lineWidth = Math.max(2, s * 0.04);
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.22, my - s * 0.36);
        ctx.lineTo(cx - s * 0.08, my - s * 0.32);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + s * 0.22, my - s * 0.36);
        ctx.lineTo(cx + s * 0.08, my - s * 0.32);
        ctx.stroke();
      }
    }

    // Whiskers
    ctx.strokeStyle = c.whisker;
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, my - s * 0.13);
    ctx.lineTo(cx - s * 0.35, my - s * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, my - s * 0.1);
    ctx.lineTo(cx - s * 0.35, my - s * 0.1);
    ctx.stroke();
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

  // --- Whack effect particles ---

  function spawnWhackEffect(x, y, isBomb) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        size: 4 + Math.random() * 4,
        color: isBomb
          ? (Math.random() > 0.5 ? '#FF4444' : '#FF8800')
          : (Math.random() > 0.5 ? '#f5c518' : '#e94560')
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
            bonkFrame: 0,
            type: 'normal'
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
    if (!waveParams || molesSpawned >= waveParams.moleCount) return;
    if (now - lastMoleSpawn < waveParams.spawnInterval) return;

    const hiddenHoles = holes.filter(h => h.mole.state === 'hidden');
    if (hiddenHoles.length === 0) return;

    const hole = hiddenHoles[Math.floor(Math.random() * hiddenHoles.length)];
    hole.mole.state = 'rising';
    hole.mole.timer = 0;
    hole.mole.yOffset = 0;
    hole.mole.bonkFrame = 0;
    hole.mole.type = pickMoleType();
    molesSpawned++;
    lastMoleSpawn = now;
  }

  // --- Mole update ---
  function updateMoles() {
    holes.forEach(hole => {
      const m = hole.mole;
      const isSpeed = m.type === 'speed';
      const isGolden = m.type === 'golden';

      const riseSpeed = isSpeed ? 0.12 : 0.08;
      const sinkSpeed = isSpeed ? 0.09 : 0.06;
      let upDuration = waveParams ? waveParams.upDuration : 70;
      if (isSpeed) upDuration *= 0.55;
      if (isGolden) upDuration *= 0.75;

      if (m.state === 'rising') {
        m.yOffset += riseSpeed;
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
        m.yOffset -= sinkSpeed;
        if (m.yOffset <= 0) {
          m.yOffset = 0;
          m.state = 'hidden';
          molesResolved++;
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

          const points = MOLE_POINTS[m.type] || 1;
          score = Math.max(0, score + points);
          scoreDisplay.textContent = `Score: ${score}`;

          const isBomb = m.type === 'bomb';
          spawnWhackEffect(hole.x, moleY, isBomb);

          if (points > 0) {
            const color = m.type === 'golden' ? '#FFD700' : m.type === 'speed' ? '#4499FF' : '#f5c518';
            spawnScorePopup(hole.x, moleY - hole.size * 0.3, `+${points}`, color);
          } else {
            spawnScorePopup(hole.x, moleY - hole.size * 0.3, `${points}`, '#FF4444');
          }
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

  function draw() {
    drawBackground();

    // Draw holes and moles
    holes.forEach(hole => {
      const m = hole.mole;
      const moleY = hole.y - m.yOffset * hole.size * 0.6;
      drawMole(hole.x, hole.y, hole.size, moleY, m.state, m.bonkFrame, m.type);
    });

    drawParticles();
    drawPopups();

    // Title
    const font = getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = `bold ${Math.round(canvas.width * 0.06)}px ${font}`;
    ctx.textAlign = 'center';
    ctx.fillText('Whack-a-Mole!', canvas.width / 2 + 2, canvas.height * 0.12 + 2);
    ctx.fillStyle = '#fff';
    ctx.fillText('Whack-a-Mole!', canvas.width / 2, canvas.height * 0.12);
  }

  // --- Wave transition overlay ---
  function drawWaveTransition() {
    const fadeIn = Math.min(1, (WAVE_TRANSITION_FRAMES - waveTransitionTimer) / 15);
    const fadeOut = Math.min(1, waveTransitionTimer / 15);
    const opacity = Math.min(fadeIn, fadeOut);

    ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * opacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const font = getComputedStyle(document.body).fontFamily;

    ctx.globalAlpha = opacity;

    // Wave number
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(canvas.width * 0.1)}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Wave ${wave}`, centerX, centerY - canvas.height * 0.04);

    // Tip for new mole types or encouragement
    const tip = getWaveTip(wave);
    if (tip) {
      ctx.fillStyle = tip.color;
      ctx.font = `bold ${Math.round(canvas.width * 0.04)}px ${font}`;
      ctx.fillText(tip.text, centerX, centerY + canvas.height * 0.06);
    } else {
      ctx.fillStyle = '#ccc';
      ctx.font = `${Math.round(canvas.width * 0.035)}px ${font}`;
      ctx.fillText('Get ready!', centerX, centerY + canvas.height * 0.06);
    }

    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
  }

  // --- Wave management ---
  function startWave(waveNum) {
    waveParams = getWaveParams(waveNum);
    molesSpawned = 0;
    molesResolved = 0;
    lastMoleSpawn = 0;

    holes.forEach(h => {
      h.mole.state = 'hidden';
      h.mole.timer = 0;
      h.mole.yOffset = 0;
      h.mole.type = 'normal';
    });
  }

  // --- Game loop ---
  function gameLoop() {
    if (!gameRunning) return;
    frame++;

    updateParticles();
    updatePopups();

    if (hammerTimer > 0) {
      hammerTimer--;
      if (hammerTimer === 0) hammerHitting = false;
    }

    if (waveTransition) {
      waveTransitionTimer--;
      draw();
      drawWaveTransition();
      if (waveTransitionTimer <= 0) {
        waveTransition = false;
        startWave(wave);
      }
      animFrame = requestAnimationFrame(gameLoop);
      return;
    }

    const now = performance.now();
    trySpawnMole(now);
    updateMoles();

    // Check wave completion
    if (waveParams && molesSpawned >= waveParams.moleCount && molesResolved >= waveParams.moleCount) {
      const d = DIFFICULTIES[difficulty];
      if (wave >= d.totalWaves) {
        endGame();
        return;
      }
      wave++;
      waveTransition = true;
      waveTransitionTimer = WAVE_TRANSITION_FRAMES;
      waveDisplay.textContent = `Wave ${wave}/${d.totalWaves}`;
    }

    draw();
    animFrame = requestAnimationFrame(gameLoop);
  }

  // --- Start / stop ---
  function startGame() {
    SimplespilStats.recordPlay('whacamole');

    score = 0;
    frame = 0;
    particles.length = 0;
    popups.length = 0;
    hammerHitting = false;
    hammerTimer = 0;
    waveTransition = false;

    const d = DIFFICULTIES[difficulty];
    wave = 1;

    scoreDisplay.textContent = 'Score: 0';
    waveDisplay.textContent = `Wave 1/${d.totalWaves}`;
    highScoreDisplay.textContent = `Best: ${highScore}`;
    gameOverEl.style.display = 'none';

    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';

    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();

    gameRunning = true;
    startWave(1);
    gameLoop();
  }

  function endGame() {
    gameRunning = false;
    if (animFrame) cancelAnimationFrame(animFrame);

    const result = SimplespilHighScores.save('whacamole', score);
    highScore = result.highScore;

    const d = DIFFICULTIES[difficulty];
    gameOverTitle.textContent = wave >= d.totalWaves ? 'All Waves Complete!' : 'Game Over!';
    finalScoreEl.textContent = `Score: ${score}`;
    finalWaveEl.textContent = `Waves: ${wave}/${d.totalWaves}`;
    newHighEl.style.display = result.isNew ? 'block' : 'none';
    gameOverEl.style.display = 'flex';
  }

  // --- Input ---
  function handleInput(px, py) {
    if (!gameRunning || waveTransition) return;
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
