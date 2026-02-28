(() => {
  // --- Candy types with colors and canvas draw functions ---
  const CANDY_TYPES = [
    {
      name: 'lollipop',
      color: '#e94560',
      draw(ctx, x, y, s) {
        const r = s * 0.32;
        ctx.strokeStyle = '#d4a44c';
        ctx.lineWidth = s * 0.08;
        ctx.beginPath();
        ctx.moveTo(x, y + r * 0.3);
        ctx.lineTo(x, y + s * 0.44);
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.06, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = s * 0.04;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.06, r * 0.55, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y - s * 0.06, r * 0.2, 0, Math.PI);
        ctx.stroke();
      }
    },
    {
      name: 'gummy',
      color: '#4ecca3',
      draw(ctx, x, y, s) {
        const w = s * 0.36, h = s * 0.28;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(x, y + s * 0.04, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y - s * 0.18, s * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - s * 0.14, y - s * 0.3, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + s * 0.14, y - s * 0.3, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(x - s * 0.07, y - s * 0.2, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + s * 0.07, y - s * 0.2, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = s * 0.025;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.14, s * 0.06, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
    },
    {
      name: 'star',
      color: '#f5c518',
      draw(ctx, x, y, s) {
        const r = s * 0.36;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          const rad = i % 2 === 0 ? r : r * 0.42;
          ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.ellipse(x - r * 0.15, y - r * 0.25, r * 0.25, r * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      name: 'heart',
      color: '#e91e8f',
      draw(ctx, x, y, s) {
        const r = s * 0.34;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(x, y + r * 0.65);
        ctx.bezierCurveTo(x - r * 1.1, y - r * 0.15, x - r * 0.55, y - r * 0.95, x, y - r * 0.35);
        ctx.bezierCurveTo(x + r * 0.55, y - r * 0.95, x + r * 1.1, y - r * 0.15, x, y + r * 0.65);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(x - r * 0.25, y - r * 0.35, r * 0.18, r * 0.12, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      name: 'drop',
      color: '#3498db',
      draw(ctx, x, y, s) {
        const r = s * 0.3;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - r, y - s * 0.04);
        ctx.lineTo(x - r * 1.5, y - s * 0.16);
        ctx.lineTo(x - r * 1.5, y + s * 0.08);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + r, y - s * 0.04);
        ctx.lineTo(x + r * 1.5, y - s * 0.16);
        ctx.lineTo(x + r * 1.5, y + s * 0.08);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = s * 0.04;
        ctx.beginPath();
        ctx.moveTo(x - r * 0.35, y - r * 0.9);
        ctx.lineTo(x - r * 0.35, y + r * 0.9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + r * 0.35, y - r * 0.9);
        ctx.lineTo(x + r * 0.35, y + r * 0.9);
        ctx.stroke();
      }
    },
    {
      name: 'diamond',
      color: '#9b59b6',
      draw(ctx, x, y, s) {
        const w = s * 0.32, h = s * 0.4;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x - w, y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x, y - h * 0.15);
        ctx.lineTo(x - w, y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(x - w * 0.3, y - h * 0.4, s * 0.04, s * 0.06, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  ];

  // --- Special candy types ---
  // 'none' = normal candy, 'striped_h' = clears row, 'striped_v' = clears column,
  // 'wrapped' = 3x3 explosion, 'bomb' = clears all of one color
  const SPECIAL_NONE = 'none';
  const SPECIAL_STRIPED_H = 'striped_h';
  const SPECIAL_STRIPED_V = 'striped_v';
  const SPECIAL_WRAPPED = 'wrapped';
  const SPECIAL_BOMB = 'bomb';

  // --- Level definitions ---
  const LEVELS = [
    { target: 300,  maxMoves: 20, grid: 6 },
    { target: 500,  maxMoves: 18, grid: 6 },
    { target: 800,  maxMoves: 20, grid: 7 },
    { target: 1200, maxMoves: 22, grid: 7 },
    { target: 1500, maxMoves: 20, grid: 7 },
    { target: 2000, maxMoves: 22, grid: 7 },
    { target: 2500, maxMoves: 25, grid: 8 },
    { target: 3000, maxMoves: 22, grid: 8 },
    { target: 3500, maxMoves: 20, grid: 8 },
    { target: 4000, maxMoves: 22, grid: 8 },
    { target: 5000, maxMoves: 25, grid: 8 },
    { target: 6000, maxMoves: 25, grid: 8 },
  ];

  // --- Game state ---
  let gridSize = 7;
  let grid = [];          // grid[r][c] = { type: candy index, special: SPECIAL_* }
  let cellSize = 0;
  let boardX = 0, boardY = 0;
  let score = 0;
  let moves = 0;
  let selected = null;
  let animating = false;
  let particles = [];
  let floatingTexts = [];
  let swapAnim = null;
  let fallAnims = [];
  let clearAnims = [];
  let comboCount = 0;
  let currentLevel = 0;
  let movesLeft = 20;
  let targetScore = 300;
  let screenShake = 0;
  let hintTimer = 0;
  let hintMove = null;   // { r1, c1, r2, c2 }
  let hintGlow = 0;
  let lastInputTime = 0;
  const HINT_DELAY = 4000; // ms before showing hint

  // --- DOM refs ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-display');
  const movesEl = document.getElementById('moves-display');
  const levelEl = document.getElementById('level-display');
  const targetEl = document.getElementById('target-display');
  const progressFill = document.getElementById('progress-fill');
  const winEl = document.getElementById('win-screen');
  const finalScoreEl = document.getElementById('final-score');
  const failEl = document.getElementById('fail-screen');
  const failScoreEl = document.getElementById('fail-score');

  // --- Sizing ---
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;
    const padding = 20;
    const hudHeight = 80;
    const availW = maxW - padding * 2;
    const availH = maxH - hudHeight - padding * 2;
    cellSize = Math.floor(Math.min(availW, availH) / gridSize);
    const boardSize = cellSize * gridSize;
    canvas.width = boardSize * dpr;
    canvas.height = boardSize * dpr;
    canvas.style.width = boardSize + 'px';
    canvas.style.height = boardSize + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    boardX = 0;
    boardY = 0;
  }

  // --- Grid helpers ---
  function numTypes() {
    return gridSize <= 6 ? 5 : 6;
  }

  function randomType() {
    return Math.floor(Math.random() * numTypes());
  }

  function makeCell(type) {
    return { type, special: SPECIAL_NONE };
  }

  function createGrid() {
    grid = [];
    for (let r = 0; r < gridSize; r++) {
      grid[r] = [];
      for (let c = 0; c < gridSize; c++) {
        let t;
        do {
          t = randomType();
        } while (
          (c >= 2 && grid[r][c - 1].type === t && grid[r][c - 2].type === t) ||
          (r >= 2 && grid[r - 1][c].type === t && grid[r - 2][c].type === t)
        );
        grid[r][c] = makeCell(t);
      }
    }
    if (!hasValidMoves()) createGrid();
  }

  // --- Match detection with special candy creation ---
  function findMatchRuns() {
    // Returns array of match groups: { cells: [{r,c}], horizontal: bool }
    const matches = [];
    // Horizontal runs
    for (let r = 0; r < gridSize; r++) {
      let run = [{ r, c: 0 }];
      for (let c = 1; c < gridSize; c++) {
        if (grid[r][c].type === grid[r][c - 1].type && grid[r][c].type >= 0) {
          run.push({ r, c });
        } else {
          if (run.length >= 3) matches.push({ cells: run, horizontal: true });
          run = [{ r, c }];
        }
      }
      if (run.length >= 3) matches.push({ cells: run, horizontal: true });
    }
    // Vertical runs
    for (let c = 0; c < gridSize; c++) {
      let run = [{ r: 0, c }];
      for (let r = 1; r < gridSize; r++) {
        if (grid[r][c].type === grid[r - 1][c].type && grid[r][c].type >= 0) {
          run.push({ r, c });
        } else {
          if (run.length >= 3) matches.push({ cells: run, horizontal: false });
          run = [{ r, c }];
        }
      }
      if (run.length >= 3) matches.push({ cells: run, horizontal: false });
    }
    return matches;
  }

  function findMatches() {
    const matched = new Set();
    const runs = findMatchRuns();
    for (const run of runs) {
      for (const cell of run.cells) {
        matched.add(cell.r * gridSize + cell.c);
      }
    }
    return matched;
  }

  // Determine what special candy to create from a match, and where to place it
  function determineSpecials(matchRuns, swapR, swapC) {
    // Returns array of { r, c, special, type } to create after clearing
    const specials = [];
    const cellKey = (r, c) => r * gridSize + c;
    const allMatchedCells = new Set();
    for (const run of matchRuns) {
      for (const cell of run.cells) {
        allMatchedCells.add(cellKey(cell.r, cell.c));
      }
    }

    // Check for L/T shapes (intersections) -> wrapped candy
    // Check each cell that appears in both a horizontal and vertical match
    const hCells = new Set();
    const vCells = new Set();
    for (const run of matchRuns) {
      for (const cell of run.cells) {
        if (run.horizontal) hCells.add(cellKey(cell.r, cell.c));
        else vCells.add(cellKey(cell.r, cell.c));
      }
    }

    const intersections = new Set();
    for (const key of hCells) {
      if (vCells.has(key)) intersections.add(key);
    }

    const usedRuns = new Set();

    // Process intersections first (wrapped candies from L/T shapes)
    for (const key of intersections) {
      const r = Math.floor(key / gridSize);
      const c = key % gridSize;
      const type = grid[r][c].type;
      specials.push({ r, c, special: SPECIAL_WRAPPED, type });
      // Mark runs containing this intersection as used
      for (let i = 0; i < matchRuns.length; i++) {
        for (const cell of matchRuns[i].cells) {
          if (cell.r === r && cell.c === c) usedRuns.add(i);
        }
      }
    }

    // Process remaining runs
    for (let i = 0; i < matchRuns.length; i++) {
      if (usedRuns.has(i)) continue;
      const run = matchRuns[i];
      if (run.cells.length === 5) {
        // 5-match -> color bomb
        // Place at swap position if it's in the run, else middle
        let placeR, placeC;
        const inRun = run.cells.find(c => c.r === swapR && c.c === swapC);
        if (inRun) { placeR = swapR; placeC = swapC; }
        else { const mid = run.cells[2]; placeR = mid.r; placeC = mid.c; }
        specials.push({ r: placeR, c: placeC, special: SPECIAL_BOMB, type: grid[placeR][placeC].type });
      } else if (run.cells.length === 4) {
        // 4-match -> striped candy (perpendicular to match direction)
        let placeR, placeC;
        const inRun = run.cells.find(c => c.r === swapR && c.c === swapC);
        if (inRun) { placeR = swapR; placeC = swapC; }
        else { const mid = run.cells[1]; placeR = mid.r; placeC = mid.c; }
        const special = run.horizontal ? SPECIAL_STRIPED_V : SPECIAL_STRIPED_H;
        specials.push({ r: placeR, c: placeC, special, type: grid[placeR][placeC].type });
      }
      // 3-match -> no special
    }

    return specials;
  }

  function swapCells(r1, c1, r2, c2) {
    const tmp = grid[r1][c1];
    grid[r1][c1] = grid[r2][c2];
    grid[r2][c2] = tmp;
  }

  function isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }

  function hasValidMoves() {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (c < gridSize - 1) {
          swapCells(r, c, r, c + 1);
          if (findMatches().size > 0) { swapCells(r, c, r, c + 1); return true; }
          swapCells(r, c, r, c + 1);
        }
        if (r < gridSize - 1) {
          swapCells(r, c, r + 1, c);
          if (findMatches().size > 0) { swapCells(r, c, r + 1, c); return true; }
          swapCells(r, c, r + 1, c);
        }
      }
    }
    return false;
  }

  function findFirstValidMove() {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (c < gridSize - 1) {
          swapCells(r, c, r, c + 1);
          if (findMatches().size > 0) { swapCells(r, c, r, c + 1); return { r1: r, c1: c, r2: r, c2: c + 1 }; }
          swapCells(r, c, r, c + 1);
        }
        if (r < gridSize - 1) {
          swapCells(r, c, r + 1, c);
          if (findMatches().size > 0) { swapCells(r, c, r + 1, c); return { r1: r, c1: c, r2: r + 1, c2: c }; }
          swapCells(r, c, r + 1, c);
        }
      }
    }
    return null;
  }

  // --- Detonation logic for special candies ---
  function collectSpecialDetonations(r, c, cell, alreadyCleared) {
    // Returns set of idx to clear from this special candy's effect
    const toClear = new Set();
    const key = (r2, c2) => r2 * gridSize + c2;
    if (cell.special === SPECIAL_STRIPED_H) {
      for (let cc = 0; cc < gridSize; cc++) toClear.add(key(r, cc));
    } else if (cell.special === SPECIAL_STRIPED_V) {
      for (let rr = 0; rr < gridSize; rr++) toClear.add(key(rr, c));
    } else if (cell.special === SPECIAL_WRAPPED) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
            toClear.add(key(nr, nc));
          }
        }
      }
    } else if (cell.special === SPECIAL_BOMB) {
      // Clear all candies of the most common type on board (excluding -1)
      // In normal play this is triggered by swapping with another candy,
      // so we pick a random type to clear
      const targetType = cell.type;
      for (let rr = 0; rr < gridSize; rr++) {
        for (let cc = 0; cc < gridSize; cc++) {
          if (grid[rr][cc].type === targetType) {
            toClear.add(key(rr, cc));
          }
        }
      }
    }
    return toClear;
  }

  // --- Particles ---
  function spawnParticles(cx, cy, color, count) {
    const n = count || 8;
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 4,
        color,
        life: 1
      });
    }
  }

  function spawnLineParticles(x1, y1, x2, y2, color) {
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      particles.push({
        x: px, y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 3,
        color,
        life: 1
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // --- Floating text (combo words, score popups) ---
  function spawnFloatingText(text, x, y, color, size) {
    floatingTexts.push({
      text, x, y, color,
      size: size || 24,
      life: 1,
      vy: -1.5
    });
  }

  function updateFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= 0.018;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function drawFloatingTexts() {
    for (const ft of floatingTexts) {
      ctx.globalAlpha = ft.life;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.size}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Text outline for readability
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
  }

  const COMBO_WORDS = ['Nice!', 'Sweet!', 'Yummy!', 'Awesome!', 'Amazing!', 'Incredible!', 'DIVINE!'];

  // --- Drawing ---
  function cellCenter(r, c) {
    return {
      x: boardX + c * cellSize + cellSize / 2,
      y: boardY + r * cellSize + cellSize / 2
    };
  }

  function drawSpecialOverlay(ctx, x, y, s, special) {
    if (special === SPECIAL_STRIPED_H) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = s * 0.05;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(x - s * 0.35, y + i * s * 0.1);
        ctx.lineTo(x + s * 0.35, y + i * s * 0.1);
        ctx.stroke();
      }
    } else if (special === SPECIAL_STRIPED_V) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = s * 0.05;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * s * 0.1, y - s * 0.35);
        ctx.lineTo(x + i * s * 0.1, y + s * 0.35);
        ctx.stroke();
      }
    } else if (special === SPECIAL_WRAPPED) {
      ctx.strokeStyle = 'rgba(255,255,200,0.8)';
      ctx.lineWidth = s * 0.06;
      ctx.setLineDash([s * 0.06, s * 0.06]);
      ctx.beginPath();
      ctx.arc(x, y, s * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (special === SPECIAL_BOMB) {
      // Rainbow glow
      const t = performance.now() / 600;
      const hue = (t * 60) % 360;
      ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
      ctx.lineWidth = s * 0.07;
      ctx.beginPath();
      ctx.arc(x, y, s * 0.32, 0, Math.PI * 2);
      ctx.stroke();
      // Inner sparkles
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) {
        const a = t * 2 + (i * Math.PI / 2);
        const sr = s * 0.2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * sr, y + Math.sin(a) * sr, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawBoard() {
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    if (screenShake > 0) screenShake *= 0.9;
    if (screenShake < 0.5) screenShake = 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);
    ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);

    // Board background with checkerboard
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = boardX + c * cellSize;
        const y = boardY + r * cellSize;
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)';
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }

    // Hint glow
    if (hintMove && !animating) {
      hintGlow += 0.05;
      const alpha = 0.15 + Math.sin(hintGlow) * 0.15;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      const h1x = boardX + hintMove.c1 * cellSize;
      const h1y = boardY + hintMove.r1 * cellSize;
      const h2x = boardX + hintMove.c2 * cellSize;
      const h2y = boardY + hintMove.r2 * cellSize;
      ctx.fillRect(h1x, h1y, cellSize, cellSize);
      ctx.fillRect(h2x, h2y, cellSize, cellSize);
    }

    // Draw candies (skip ones being animated)
    const swapping = new Set();
    if (swapAnim) {
      swapping.add(swapAnim.r1 * gridSize + swapAnim.c1);
      swapping.add(swapAnim.r2 * gridSize + swapAnim.c2);
    }
    const falling = new Set();
    for (const fa of fallAnims) {
      falling.add(fa.r * gridSize + fa.c);
    }
    const clearing = new Set();
    for (const ca of clearAnims) {
      clearing.add(ca.r * gridSize + ca.c);
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const idx = r * gridSize + c;
        if (swapping.has(idx) || falling.has(idx) || clearing.has(idx)) continue;
        const cell = grid[r][c];
        if (cell.type < 0) continue;
        const { x, y } = cellCenter(r, c);
        CANDY_TYPES[cell.type].draw(ctx, x, y, cellSize);
        if (cell.special !== SPECIAL_NONE) {
          drawSpecialOverlay(ctx, x, y, cellSize, cell.special);
        }
      }
    }

    // Draw swap animation
    if (swapAnim) {
      const t = swapAnim.t;
      const p1 = cellCenter(swapAnim.r1, swapAnim.c1);
      const p2 = cellCenter(swapAnim.r2, swapAnim.c2);
      const ax = p1.x + (p2.x - p1.x) * t;
      const ay = p1.y + (p2.y - p1.y) * t;
      const bx = p2.x + (p1.x - p2.x) * t;
      const by = p2.y + (p1.y - p2.y) * t;
      if (swapAnim.type1 >= 0) {
        CANDY_TYPES[swapAnim.type1].draw(ctx, ax, ay, cellSize);
        if (swapAnim.special1 !== SPECIAL_NONE) drawSpecialOverlay(ctx, ax, ay, cellSize, swapAnim.special1);
      }
      if (swapAnim.type2 >= 0) {
        CANDY_TYPES[swapAnim.type2].draw(ctx, bx, by, cellSize);
        if (swapAnim.special2 !== SPECIAL_NONE) drawSpecialOverlay(ctx, bx, by, cellSize, swapAnim.special2);
      }
    }

    // Draw fall animations
    for (const fa of fallAnims) {
      if (fa.type < 0) continue;
      const destPos = cellCenter(fa.r, fa.c);
      const startY = destPos.y - fa.dist * cellSize;
      const curY = startY + (destPos.y - startY) * fa.t;
      CANDY_TYPES[fa.type].draw(ctx, destPos.x, curY, cellSize);
      if (fa.special !== SPECIAL_NONE) {
        drawSpecialOverlay(ctx, destPos.x, curY, cellSize, fa.special);
      }
    }

    // Draw clearing animations
    for (const ca of clearAnims) {
      if (ca.type < 0) continue;
      const { x, y } = cellCenter(ca.r, ca.c);
      ctx.globalAlpha = ca.t;
      const scale = 0.5 + ca.t * 0.5;
      CANDY_TYPES[ca.type].draw(ctx, x, y, cellSize * scale);
      ctx.globalAlpha = 1;
    }

    // Selected highlight
    if (selected && !animating) {
      const x = boardX + selected.col * cellSize;
      const y = boardY + selected.row * cellSize;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
    }

    drawParticles();
    drawFloatingTexts();
    ctx.restore();
  }

  // --- Animations ---
  function animateSwap(r1, c1, r2, c2, callback) {
    animating = true;
    swapAnim = {
      r1, c1, r2, c2,
      type1: grid[r1][c1].type,
      type2: grid[r2][c2].type,
      special1: grid[r1][c1].special,
      special2: grid[r2][c2].special,
      t: 0
    };
    const duration = 180;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      swapAnim.t = Math.min(elapsed / duration, 1);
      drawBoard();
      if (swapAnim.t < 1) {
        requestAnimationFrame(step);
      } else {
        swapAnim = null;
        callback();
      }
    }
    requestAnimationFrame(step);
  }

  function animateClear(matched, specialDets, callback) {
    clearAnims = [];
    const allToClear = new Set(matched);

    // Process special candy detonations
    const detonated = new Set();
    const toProcess = [...matched];
    while (toProcess.length > 0) {
      const idx = toProcess.pop();
      if (detonated.has(idx)) continue;
      const r = Math.floor(idx / gridSize);
      const c = idx % gridSize;
      const cell = grid[r][c];
      if (cell.special !== SPECIAL_NONE) {
        detonated.add(idx);
        const extra = collectSpecialDetonations(r, c, cell, allToClear);
        const { x, y } = cellCenter(r, c);

        // Visual effects for special detonations
        if (cell.special === SPECIAL_STRIPED_H || cell.special === SPECIAL_STRIPED_V) {
          screenShake = 6;
          const color = CANDY_TYPES[cell.type].color;
          if (cell.special === SPECIAL_STRIPED_H) {
            const ly = boardY + r * cellSize + cellSize / 2;
            spawnLineParticles(boardX, ly, boardX + gridSize * cellSize, ly, color);
          } else {
            const lx = boardX + c * cellSize + cellSize / 2;
            spawnLineParticles(lx, boardY, lx, boardY + gridSize * cellSize, color);
          }
        } else if (cell.special === SPECIAL_WRAPPED) {
          screenShake = 10;
          spawnParticles(x, y, CANDY_TYPES[cell.type].color, 20);
        } else if (cell.special === SPECIAL_BOMB) {
          screenShake = 14;
          spawnParticles(x, y, '#fff', 30);
        }

        for (const eIdx of extra) {
          if (!allToClear.has(eIdx)) {
            allToClear.add(eIdx);
            toProcess.push(eIdx);
          }
        }
      }
    }

    for (const idx of allToClear) {
      const r = Math.floor(idx / gridSize);
      const c = idx % gridSize;
      const cell = grid[r][c];
      if (cell.type < 0) continue;
      clearAnims.push({ r, c, type: cell.type, t: 1 });
      const { x, y } = cellCenter(r, c);
      spawnParticles(x, y, CANDY_TYPES[cell.type].color, 8);
    }

    // Place specials BEFORE clearing (they survive the clear)
    const specialPositions = new Set();
    for (const sp of specialDets) {
      specialPositions.add(sp.r * gridSize + sp.c);
    }

    const duration = 250;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const t = 1 - Math.min(elapsed / duration, 1);
      for (const ca of clearAnims) ca.t = t;
      updateParticles();
      updateFloatingTexts();
      drawBoard();
      if (t > 0) {
        requestAnimationFrame(step);
      } else {
        clearAnims = [];
        // Actually remove matched cells, but keep special spawn positions
        for (const idx of allToClear) {
          const r = Math.floor(idx / gridSize);
          const c = idx % gridSize;
          if (!specialPositions.has(idx)) {
            grid[r][c] = makeCell(-1);
          }
        }
        // Now place specials
        for (const sp of specialDets) {
          grid[sp.r][sp.c] = { type: sp.type, special: sp.special };
          // Visual feedback for special creation
          const { x, y } = cellCenter(sp.r, sp.c);
          spawnParticles(x, y, '#fff', 12);
        }
        callback();
      }
    }
    requestAnimationFrame(step);
  }

  function animateFall(fallData, callback) {
    fallAnims = fallData.map(f => ({ ...f, t: 0 }));
    if (fallAnims.length === 0) { callback(); return; }
    const duration = 200;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.7 ? (t / 0.7) : 1 + Math.sin((t - 0.7) / 0.3 * Math.PI) * 0.06;
      for (const fa of fallAnims) fa.t = eased;
      updateParticles();
      updateFloatingTexts();
      drawBoard();
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        fallAnims = [];
        callback();
      }
    }
    requestAnimationFrame(step);
  }

  // --- Cascade logic ---
  function applyGravity() {
    const falls = [];
    for (let c = 0; c < gridSize; c++) {
      let writePos = gridSize - 1;
      for (let r = gridSize - 1; r >= 0; r--) {
        if (grid[r][c].type >= 0) {
          if (r !== writePos) {
            grid[writePos][c] = grid[r][c];
            grid[r][c] = makeCell(-1);
            falls.push({ r: writePos, c, type: grid[writePos][c].type, special: grid[writePos][c].special, dist: writePos - r });
          }
          writePos--;
        }
      }
      for (let r = writePos; r >= 0; r--) {
        grid[r][c] = makeCell(randomType());
        falls.push({ r, c, type: grid[r][c].type, special: SPECIAL_NONE, dist: writePos - r + 1 });
      }
    }
    return falls;
  }

  // Track the swap position for special candy placement during cascades
  let cascadeSwapR = -1, cascadeSwapC = -1;

  function processCascade() {
    const matchRuns = findMatchRuns();
    const matched = new Set();
    for (const run of matchRuns) {
      for (const cell of run.cells) {
        matched.add(cell.r * gridSize + cell.c);
      }
    }

    if (matched.size === 0) {
      animating = false;
      // Check level status
      if (score >= targetScore) {
        showLevelComplete();
        return;
      }
      if (movesLeft <= 0) {
        showLevelFailed();
        return;
      }
      if (!hasValidMoves()) {
        shuffleBoard();
      }
      // Reset hint timer
      lastInputTime = performance.now();
      hintMove = null;
      return;
    }

    comboCount++;
    const points = matched.size * 10 * comboCount;
    score += points;
    updateHUD();

    // Combo text
    if (comboCount >= 2) {
      const word = COMBO_WORDS[Math.min(comboCount - 2, COMBO_WORDS.length - 1)];
      const cx = boardX + (gridSize * cellSize) / 2;
      const cy = boardY + (gridSize * cellSize) / 2;
      const fontSize = Math.min(28 + comboCount * 4, 48);
      spawnFloatingText(word, cx, cy - 20, '#fff', fontSize);
    }

    // Score popup near the match
    if (matched.size > 0) {
      const firstIdx = matched.values().next().value;
      const pr = Math.floor(firstIdx / gridSize);
      const pc = firstIdx % gridSize;
      const { x, y } = cellCenter(pr, pc);
      spawnFloatingText('+' + points, x, y, '#f5c518', 20);
    }

    // Determine specials from these runs
    const specials = determineSpecials(matchRuns, cascadeSwapR, cascadeSwapC);

    animateClear(matched, specials, () => {
      const falls = applyGravity();
      animateFall(falls, () => {
        processCascade();
      });
    });
  }

  function shuffleBoard() {
    const types = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        types.push(grid[r][c]);
      }
    }
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    let idx = 0;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        grid[r][c] = types[idx++];
      }
    }
    if (!hasValidMoves() || findMatches().size > 0) {
      createGrid();
    }
    drawBoard();
  }

  // --- HUD update ---
  function updateHUD() {
    scoreEl.textContent = score;
    movesEl.textContent = movesLeft;
    levelEl.textContent = 'Level ' + (currentLevel + 1);
    targetEl.textContent = targetScore;
    const pct = Math.min(score / targetScore * 100, 100);
    progressFill.style.width = pct + '%';
  }

  // --- Level complete / fail ---
  function showLevelComplete() {
    winEl.style.display = 'flex';
    const stars = score >= targetScore * 2 ? 3 : score >= targetScore * 1.4 ? 2 : 1;
    const starStr = '\u2B50'.repeat(stars) + '\u2606'.repeat(3 - stars);
    finalScoreEl.textContent = starStr + '  Score: ' + score;
    // Celebration particles
    for (let i = 0; i < 40; i++) {
      const px = Math.random() * gridSize * cellSize;
      const py = Math.random() * gridSize * cellSize;
      const colors = ['#e94560', '#4ecca3', '#f5c518', '#e91e8f', '#3498db', '#9b59b6'];
      spawnParticles(px, py, colors[Math.floor(Math.random() * colors.length)], 3);
    }
    animateCelebration();
  }

  function showLevelFailed() {
    failEl.style.display = 'flex';
    failScoreEl.textContent = 'Score: ' + score + ' / ' + targetScore;
  }

  function animateCelebration() {
    if (winEl.style.display === 'none') return;
    updateParticles();
    drawBoard();
    requestAnimationFrame(animateCelebration);
  }

  // --- Hint system ---
  function updateHint() {
    if (animating || winEl.style.display !== 'none' || failEl.style.display !== 'none') {
      hintMove = null;
      return;
    }
    const now = performance.now();
    if (now - lastInputTime > HINT_DELAY && !hintMove) {
      hintMove = findFirstValidMove();
      hintGlow = 0;
    }
  }

  // --- Input handling ---
  function getCellFromPos(px, py) {
    const rect = canvas.getBoundingClientRect();
    const x = px - rect.left - boardX;
    const y = py - rect.top - boardY;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      return { row, col };
    }
    return null;
  }

  let dragStart = null;
  let dragging = false;

  function resetInput() {
    lastInputTime = performance.now();
    hintMove = null;
  }

  function handlePointerDown(px, py) {
    if (animating) return;
    const cell = getCellFromPos(px, py);
    if (!cell) return;
    resetInput();
    dragStart = cell;
    dragging = false;

    if (selected) {
      if (selected.row === cell.row && selected.col === cell.col) {
        selected = null;
        drawBoard();
        return;
      }
      if (isAdjacent(selected.row, selected.col, cell.row, cell.col)) {
        trySwap(selected.row, selected.col, cell.row, cell.col);
        return;
      }
    }
    selected = cell;
    drawBoard();
  }

  function handlePointerMove(px, py) {
    if (animating || !dragStart || dragging) return;
    const cell = getCellFromPos(px, py);
    if (!cell) return;
    if (cell.row !== dragStart.row || cell.col !== dragStart.col) {
      const dr = cell.row - dragStart.row;
      const dc = cell.col - dragStart.col;
      let tr, tc;
      if (Math.abs(dr) >= Math.abs(dc)) {
        tr = dragStart.row + (dr > 0 ? 1 : -1);
        tc = dragStart.col;
      } else {
        tr = dragStart.row;
        tc = dragStart.col + (dc > 0 ? 1 : -1);
      }
      if (tr >= 0 && tr < gridSize && tc >= 0 && tc < gridSize) {
        dragging = true;
        selected = null;
        resetInput();
        trySwap(dragStart.row, dragStart.col, tr, tc);
      }
    }
  }

  function handlePointerUp() {
    dragStart = null;
    dragging = false;
  }

  function trySwap(r1, c1, r2, c2) {
    selected = null;
    comboCount = 0;
    cascadeSwapR = r1;
    cascadeSwapC = c1;

    // Special case: swapping a color bomb with another candy
    const cell1 = grid[r1][c1];
    const cell2 = grid[r2][c2];
    if (cell1.special === SPECIAL_BOMB || cell2.special === SPECIAL_BOMB) {
      animateSwap(r1, c1, r2, c2, () => {
        swapCells(r1, c1, r2, c2);
        // The bomb takes the type of the other candy
        if (grid[r1][c1].special === SPECIAL_BOMB) {
          grid[r1][c1] = { type: grid[r2][c2].type, special: SPECIAL_BOMB };
        }
        if (grid[r2][c2].special === SPECIAL_BOMB) {
          grid[r2][c2] = { type: grid[r1][c1].type, special: SPECIAL_BOMB };
        }
        movesLeft--;
        moves++;
        updateHUD();
        processCascade();
      });
      return;
    }

    animateSwap(r1, c1, r2, c2, () => {
      swapCells(r1, c1, r2, c2);
      const matched = findMatches();
      if (matched.size > 0) {
        movesLeft--;
        moves++;
        updateHUD();
        processCascade();
      } else {
        animateSwap(r2, c2, r1, c1, () => {
          swapCells(r1, c1, r2, c2);
          animating = false;
        });
      }
    });
  }

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handlePointerDown(e.clientX, e.clientY);
  });
  canvas.addEventListener('mousemove', (e) => {
    handlePointerMove(e.clientX, e.clientY);
  });
  canvas.addEventListener('mouseup', () => handlePointerUp());

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    handlePointerDown(t.clientX, t.clientY);
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    handlePointerMove(t.clientX, t.clientY);
  });
  canvas.addEventListener('touchend', () => handlePointerUp());

  // --- Game loop for hint + particles ---
  let loopRunning = false;
  function gameLoop() {
    if (!loopRunning) return;
    updateHint();
    if (!animating) {
      updateParticles();
      updateFloatingTexts();
      drawBoard();
    }
    requestAnimationFrame(gameLoop);
  }

  // --- Game start / menu ---
  function startLevel(levelIdx) {
    currentLevel = levelIdx;
    const lvl = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
    // Scale difficulty for levels beyond the defined set
    if (levelIdx >= LEVELS.length) {
      targetScore = lvl.target + (levelIdx - LEVELS.length + 1) * 1000;
    } else {
      targetScore = lvl.target;
    }
    movesLeft = lvl.maxMoves;
    gridSize = lvl.grid;
    score = 0;
    moves = 0;
    selected = null;
    animating = false;
    particles = [];
    floatingTexts = [];
    swapAnim = null;
    fallAnims = [];
    clearAnims = [];
    comboCount = 0;
    screenShake = 0;
    hintMove = null;
    hintTimer = 0;
    lastInputTime = performance.now();

    winEl.style.display = 'none';
    failEl.style.display = 'none';
    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';

    SimplespilStats.recordPlay('candy');
    resize();
    createGrid();
    updateHUD();
    drawBoard();
    loopRunning = true;
    requestAnimationFrame(gameLoop);
  }

  function showMenu() {
    loopRunning = false;
    menuEl.style.display = 'flex';
    gameEl.style.display = 'none';
    winEl.style.display = 'none';
    failEl.style.display = 'none';
    // Update level buttons display
    updateLevelButtons();
  }

  function getHighestUnlockedLevel() {
    try {
      return parseInt(localStorage.getItem('candy-level') || '0', 10);
    } catch (e) { return 0; }
  }

  function saveProgress(levelIdx) {
    try {
      const current = getHighestUnlockedLevel();
      if (levelIdx > current) {
        localStorage.setItem('candy-level', levelIdx.toString());
      }
    } catch (e) { /* ignore */ }
  }

  function updateLevelButtons() {
    const unlocked = getHighestUnlockedLevel();
    const container = document.getElementById('level-buttons');
    container.innerHTML = '';
    const count = Math.max(LEVELS.length, unlocked + 1);
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'level-btn';
      btn.textContent = i + 1;
      if (i <= unlocked) {
        btn.classList.add('unlocked');
        btn.addEventListener('click', () => startLevel(i));
      } else {
        btn.classList.add('locked');
        btn.disabled = true;
      }
      container.appendChild(btn);
    }
  }

  // Win screen buttons
  document.getElementById('next-btn').addEventListener('click', () => {
    saveProgress(currentLevel + 1);
    startLevel(currentLevel + 1);
  });
  document.getElementById('again-btn').addEventListener('click', () => {
    startLevel(currentLevel);
  });
  document.getElementById('menu-btn').addEventListener('click', showMenu);
  document.getElementById('retry-btn').addEventListener('click', () => {
    startLevel(currentLevel);
  });
  document.getElementById('fail-menu-btn').addEventListener('click', showMenu);

  window.addEventListener('resize', () => {
    if (gameEl.style.display !== 'none') {
      resize();
      drawBoard();
    }
  });

  // Init
  showMenu();
})();
