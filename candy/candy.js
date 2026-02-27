(() => {
  // --- Candy types with colors and canvas draw functions ---
  const CANDY_TYPES = [
    {
      name: 'lollipop',
      color: '#e94560',
      draw(ctx, x, y, s) {
        const r = s * 0.32;
        // Stick
        ctx.strokeStyle = '#d4a44c';
        ctx.lineWidth = s * 0.08;
        ctx.beginPath();
        ctx.moveTo(x, y + r * 0.3);
        ctx.lineTo(x, y + s * 0.44);
        ctx.stroke();
        // Circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.06, r, 0, Math.PI * 2);
        ctx.fill();
        // Swirl
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
        // Bear body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(x, y + s * 0.04, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(x, y - s * 0.18, s * 0.18, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.beginPath();
        ctx.arc(x - s * 0.14, y - s * 0.3, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + s * 0.14, y - s * 0.3, s * 0.07, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(x - s * 0.07, y - s * 0.2, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + s * 0.07, y - s * 0.2, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
        // Smile
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
        // Highlight
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
        // Highlight
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
        // Teardrop / wrapped candy shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wrapper twist left
        ctx.beginPath();
        ctx.moveTo(x - r, y - s * 0.04);
        ctx.lineTo(x - r * 1.5, y - s * 0.16);
        ctx.lineTo(x - r * 1.5, y + s * 0.08);
        ctx.closePath();
        ctx.fill();
        // Wrapper twist right
        ctx.beginPath();
        ctx.moveTo(x + r, y - s * 0.04);
        ctx.lineTo(x + r * 1.5, y - s * 0.16);
        ctx.lineTo(x + r * 1.5, y + s * 0.08);
        ctx.closePath();
        ctx.fill();
        // Stripe
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
        // Facet
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x, y - h * 0.15);
        ctx.lineTo(x - w, y);
        ctx.closePath();
        ctx.fill();
        // Sparkle
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(x - w * 0.3, y - h * 0.4, s * 0.04, s * 0.06, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  ];

  // --- Game state ---
  let gridSize = 7;
  let grid = [];        // grid[row][col] = candy type index
  let cellSize = 0;
  let boardX = 0, boardY = 0;
  let score = 0;
  let moves = 0;
  let selected = null;  // {row, col}
  let animating = false;
  let particles = [];
  let swapAnim = null;
  let fallAnims = [];
  let clearAnims = [];
  let comboCount = 0;

  // --- DOM refs ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score-display');
  const movesEl = document.getElementById('moves-display');
  const winEl = document.getElementById('win-screen');
  const finalScoreEl = document.getElementById('final-score');
  const finalMovesEl = document.getElementById('final-moves');

  // --- Sizing ---
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;
    const padding = 20;
    const hudHeight = 50;
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
    // Use fewer types on smaller boards for easier matching
    return gridSize <= 6 ? 5 : 6;
  }

  function randomType() {
    return Math.floor(Math.random() * numTypes());
  }

  function createGrid() {
    grid = [];
    for (let r = 0; r < gridSize; r++) {
      grid[r] = [];
      for (let c = 0; c < gridSize; c++) {
        let t;
        // Avoid creating matches on initial board
        do {
          t = randomType();
        } while (
          (c >= 2 && grid[r][c - 1] === t && grid[r][c - 2] === t) ||
          (r >= 2 && grid[r - 1][c] === t && grid[r - 2][c] === t)
        );
        grid[r][c] = t;
      }
    }
    // If no moves are possible, regenerate
    if (!hasValidMoves()) createGrid();
  }

  function findMatches() {
    const matched = new Set();
    // Horizontal
    for (let r = 0; r < gridSize; r++) {
      let run = 1;
      for (let c = 1; c <= gridSize; c++) {
        if (c < gridSize && grid[r][c] === grid[r][c - 1] && grid[r][c] !== -1) {
          run++;
        } else {
          if (run >= 3) {
            for (let k = c - run; k < c; k++) {
              matched.add(r * gridSize + k);
            }
          }
          run = 1;
        }
      }
    }
    // Vertical
    for (let c = 0; c < gridSize; c++) {
      let run = 1;
      for (let r = 1; r <= gridSize; r++) {
        if (r < gridSize && grid[r][c] === grid[r - 1][c] && grid[r][c] !== -1) {
          run++;
        } else {
          if (run >= 3) {
            for (let k = r - run; k < r; k++) {
              matched.add(k * gridSize + c);
            }
          }
          run = 1;
        }
      }
    }
    return matched;
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
        // Try swap right
        if (c < gridSize - 1) {
          swapCells(r, c, r, c + 1);
          if (findMatches().size > 0) { swapCells(r, c, r, c + 1); return true; }
          swapCells(r, c, r, c + 1);
        }
        // Try swap down
        if (r < gridSize - 1) {
          swapCells(r, c, r + 1, c);
          if (findMatches().size > 0) { swapCells(r, c, r + 1, c); return true; }
          swapCells(r, c, r + 1, c);
        }
      }
    }
    return false;
  }

  // --- Particles ---
  function spawnParticles(cx, cy, color) {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 2.5;
      particles.push({
        x: cx, y: cy,
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
      p.life -= 0.03;
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

  // --- Drawing ---
  function cellCenter(r, c) {
    return {
      x: boardX + c * cellSize + cellSize / 2,
      y: boardY + r * cellSize + cellSize / 2
    };
  }

  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Board background with checkerboard
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = boardX + c * cellSize;
        const y = boardY + r * cellSize;
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)';
        ctx.fillRect(x, y, cellSize, cellSize);
      }
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
        if (grid[r][c] < 0) continue;
        const { x, y } = cellCenter(r, c);
        CANDY_TYPES[grid[r][c]].draw(ctx, x, y, cellSize);
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
      if (swapAnim.type1 >= 0) CANDY_TYPES[swapAnim.type1].draw(ctx, ax, ay, cellSize);
      if (swapAnim.type2 >= 0) CANDY_TYPES[swapAnim.type2].draw(ctx, bx, by, cellSize);
    }

    // Draw fall animations
    for (const fa of fallAnims) {
      if (fa.type < 0) continue;
      const destPos = cellCenter(fa.r, fa.c);
      const startY = destPos.y - fa.dist * cellSize;
      const curY = startY + (destPos.y - startY) * fa.t;
      CANDY_TYPES[fa.type].draw(ctx, destPos.x, curY, cellSize);
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
  }

  // --- Animations ---
  function animateSwap(r1, c1, r2, c2, callback) {
    animating = true;
    swapAnim = {
      r1, c1, r2, c2,
      type1: grid[r1][c1],
      type2: grid[r2][c2],
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

  function animateClear(matched, callback) {
    clearAnims = [];
    for (const idx of matched) {
      const r = Math.floor(idx / gridSize);
      const c = idx % gridSize;
      const type = grid[r][c];
      clearAnims.push({ r, c, type, t: 1 });
      const { x, y } = cellCenter(r, c);
      spawnParticles(x, y, CANDY_TYPES[type].color);
    }
    const duration = 250;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const t = 1 - Math.min(elapsed / duration, 1);
      for (const ca of clearAnims) ca.t = t;
      updateParticles();
      drawBoard();
      if (t > 0) {
        requestAnimationFrame(step);
      } else {
        clearAnims = [];
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
      // Ease out bounce
      const eased = t < 0.7 ? (t / 0.7) : 1 + Math.sin((t - 0.7) / 0.3 * Math.PI) * 0.06;
      for (const fa of fallAnims) fa.t = eased;
      updateParticles();
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
        if (grid[r][c] >= 0) {
          if (r !== writePos) {
            grid[writePos][c] = grid[r][c];
            grid[r][c] = -1;
            falls.push({ r: writePos, c, type: grid[writePos][c], dist: writePos - r });
          }
          writePos--;
        }
      }
      // Fill empty top cells with new candies
      for (let r = writePos; r >= 0; r--) {
        grid[r][c] = randomType();
        falls.push({ r, c, type: grid[r][c], dist: writePos - r + 1 });
      }
    }
    return falls;
  }

  function processCascade() {
    const matched = findMatches();
    if (matched.size === 0) {
      animating = false;
      // Check if board still has valid moves
      if (!hasValidMoves()) {
        shuffleBoard();
      }
      return;
    }

    comboCount++;
    const points = matched.size * 10 * comboCount;
    score += points;
    scoreEl.textContent = 'Score: ' + score;

    animateClear(matched, () => {
      // Remove matched
      for (const idx of matched) {
        const r = Math.floor(idx / gridSize);
        const c = idx % gridSize;
        grid[r][c] = -1;
      }
      const falls = applyGravity();
      animateFall(falls, () => {
        processCascade();
      });
    });
  }

  function shuffleBoard() {
    // Collect all current types and redistribute
    const types = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        types.push(grid[r][c]);
      }
    }
    // Fisher-Yates
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
    // If still no moves or there are existing matches, just regenerate
    if (!hasValidMoves() || findMatches().size > 0) {
      createGrid();
    }
    drawBoard();
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

  function handlePointerDown(px, py) {
    if (animating) return;
    const cell = getCellFromPos(px, py);
    if (!cell) return;

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
      // Determine swipe direction (constrain to cardinal)
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

    animateSwap(r1, c1, r2, c2, () => {
      swapCells(r1, c1, r2, c2);
      const matched = findMatches();
      if (matched.size > 0) {
        moves++;
        movesEl.textContent = 'Moves: ' + moves;
        processCascade();
      } else {
        // No match - swap back
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

  // --- Game start / menu ---
  function startGame(size) {
    gridSize = size;
    score = 0;
    moves = 0;
    selected = null;
    animating = false;
    particles = [];
    swapAnim = null;
    fallAnims = [];
    clearAnims = [];
    comboCount = 0;

    scoreEl.textContent = 'Score: 0';
    movesEl.textContent = 'Moves: 0';
    winEl.style.display = 'none';
    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';

    SimplespilStats.recordPlay('candy');
    resize();
    createGrid();
    drawBoard();
  }

  function showMenu() {
    menuEl.style.display = 'flex';
    gameEl.style.display = 'none';
  }

  // Size buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      startGame(parseInt(btn.dataset.size, 10));
    });
  });

  document.getElementById('again-btn').addEventListener('click', () => {
    startGame(gridSize);
  });

  document.getElementById('menu-btn').addEventListener('click', showMenu);

  window.addEventListener('resize', () => {
    if (gameEl.style.display !== 'none') {
      resize();
      drawBoard();
    }
  });
})();
