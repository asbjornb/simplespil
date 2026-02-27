(() => {
  // --- Constants ---
  const CANDY_COLORS = [
    '#e94560', // red
    '#4ecca3', // green
    '#3498db', // blue
    '#f5c518', // yellow
    '#9b59b6', // purple
    '#f39c12', // orange
  ];
  const CANDY_SHAPES = ['circle', 'diamond', 'square', 'triangle', 'star', 'heart'];
  const MATCH_MIN = 3;
  const TOTAL_MOVES = 30;

  // --- State ---
  let gridSize = 7;
  let board = [];       // board[row][col] = candy index (0-5) or -1
  let cellSize = 0;
  let boardPx = 0;
  let offsetX = 0;
  let offsetY = 0;
  let score = 0;
  let moves = 0;
  let highScore = parseInt(localStorage.getItem('candycrush_highscore') || '0', 10);
  let gameRunning = false;
  let animating = false;
  let selected = null;   // {row, col} or null
  let canvas, ctx;

  // Animation state
  let fallingCandies = [];  // [{row, col, fromRow, progress}]
  let removingCandies = []; // [{row, col, progress}]
  let swapAnim = null;      // {r1,c1,r2,c2,progress,reverse}
  let scorePopups = [];     // [{x, y, text, progress}]

  // --- DOM refs ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const gameOverEl = document.getElementById('game-over');
  const scoreEl = document.getElementById('score-display');
  const movesEl = document.getElementById('moves-display');
  const highScoreEl = document.getElementById('high-score-display');
  const finalScoreEl = document.getElementById('final-score');
  const newHighEl = document.getElementById('new-high');
  const menuHighEl = document.getElementById('menu-high-score');

  // --- Difficulty selection ---
  const diffBtns = document.querySelectorAll('.diff-btn');
  diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diffBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gridSize = parseInt(btn.dataset.size, 10);
    });
  });

  // --- Board logic ---
  function createBoard() {
    board = [];
    for (let r = 0; r < gridSize; r++) {
      board[r] = [];
      for (let c = 0; c < gridSize; c++) {
        board[r][c] = randomCandy(r, c);
      }
    }
    // Ensure no initial matches
    let safety = 0;
    while (findMatches().length > 0 && safety < 200) {
      const matches = findMatches();
      for (const { row, col } of matches) {
        board[row][col] = randomCandy(row, col);
      }
      safety++;
    }
  }

  function randomCandy(row, col) {
    // Avoid creating matches on initial fill
    const avoid = new Set();
    if (col >= 2 && board[row][col - 1] === board[row][col - 2] && board[row][col - 1] !== -1) {
      avoid.add(board[row][col - 1]);
    }
    if (row >= 2 && board[row - 1][col] === board[row - 2][col] && board[row - 1][col] !== -1) {
      avoid.add(board[row - 1][col]);
    }
    const choices = CANDY_COLORS.map((_, i) => i).filter(i => !avoid.has(i));
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function findMatches() {
    const matched = new Set();
    // Horizontal
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c <= gridSize - MATCH_MIN; c++) {
        if (board[r][c] === -1) continue;
        let len = 1;
        while (c + len < gridSize && board[r][c + len] === board[r][c]) len++;
        if (len >= MATCH_MIN) {
          for (let i = 0; i < len; i++) matched.add(`${r},${c + i}`);
        }
      }
    }
    // Vertical
    for (let c = 0; c < gridSize; c++) {
      for (let r = 0; r <= gridSize - MATCH_MIN; r++) {
        if (board[r][c] === -1) continue;
        let len = 1;
        while (r + len < gridSize && board[r + len][c] === board[r][c]) len++;
        if (len >= MATCH_MIN) {
          for (let i = 0; i < len; i++) matched.add(`${r + i},${c}`);
        }
      }
    }
    return [...matched].map(s => {
      const [row, col] = s.split(',').map(Number);
      return { row, col };
    });
  }

  function isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }

  function swapCells(r1, c1, r2, c2) {
    const tmp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = tmp;
  }

  // --- Cascade: remove matches, drop, fill, repeat ---
  function processBoardCascade() {
    animating = true;
    const matches = findMatches();
    if (matches.length === 0) {
      animating = false;
      checkGameOver();
      return;
    }

    // Score
    const points = matches.length * 10;
    score += points;
    scoreEl.textContent = `Score: ${score}`;

    // Score popup at the center of matched cells
    const avgX = matches.reduce((s, m) => s + m.col, 0) / matches.length;
    const avgY = matches.reduce((s, m) => s + m.row, 0) / matches.length;
    scorePopups.push({
      x: offsetX + (avgX + 0.5) * cellSize,
      y: offsetY + (avgY + 0.5) * cellSize,
      text: `+${points}`,
      progress: 0
    });

    // Start remove animation
    removingCandies = matches.map(m => ({ row: m.row, col: m.col, progress: 0 }));
    animateRemoval(() => {
      // Clear matched cells
      for (const { row, col } of matches) {
        board[row][col] = -1;
      }
      // Drop candies down
      dropCandies(() => {
        // Fill empty cells at top
        fillTop(() => {
          // Recurse for cascading matches
          processBoardCascade();
        });
      });
    });
  }

  function animateRemoval(cb) {
    const duration = 15; // frames
    let frame = 0;
    function step() {
      frame++;
      const p = frame / duration;
      for (const rc of removingCandies) rc.progress = p;
      draw();
      if (frame < duration) {
        requestAnimationFrame(step);
      } else {
        removingCandies = [];
        cb();
      }
    }
    requestAnimationFrame(step);
  }

  function dropCandies(cb) {
    // For each column, move candies down to fill gaps
    fallingCandies = [];
    for (let c = 0; c < gridSize; c++) {
      let emptyRow = gridSize - 1;
      for (let r = gridSize - 1; r >= 0; r--) {
        if (board[r][c] !== -1) {
          if (r !== emptyRow) {
            fallingCandies.push({ row: emptyRow, col: c, fromRow: r, candy: board[r][c], progress: 0 });
            board[emptyRow][c] = board[r][c];
            board[r][c] = -1;
          }
          emptyRow--;
        }
      }
    }

    if (fallingCandies.length === 0) { cb(); return; }

    const duration = 12;
    let frame = 0;
    function step() {
      frame++;
      const p = Math.min(frame / duration, 1);
      // Ease out
      const eased = 1 - (1 - p) * (1 - p);
      for (const fc of fallingCandies) fc.progress = eased;
      draw();
      if (frame < duration) {
        requestAnimationFrame(step);
      } else {
        fallingCandies = [];
        cb();
      }
    }
    requestAnimationFrame(step);
  }

  function fillTop(cb) {
    // Fill empty cells at top with new candies (fall in from above)
    fallingCandies = [];
    for (let c = 0; c < gridSize; c++) {
      let above = -1;
      for (let r = 0; r < gridSize; r++) {
        if (board[r][c] === -1) {
          board[r][c] = Math.floor(Math.random() * CANDY_COLORS.length);
          fallingCandies.push({ row: r, col: c, fromRow: above, candy: board[r][c], progress: 0 });
          above--;
        }
      }
    }

    if (fallingCandies.length === 0) { cb(); return; }

    const duration = 14;
    let frame = 0;
    function step() {
      frame++;
      const p = Math.min(frame / duration, 1);
      const eased = 1 - (1 - p) * (1 - p);
      for (const fc of fallingCandies) fc.progress = eased;
      draw();
      if (frame < duration) {
        requestAnimationFrame(step);
      } else {
        fallingCandies = [];
        cb();
      }
    }
    requestAnimationFrame(step);
  }

  // --- Swap animation ---
  function animateSwap(r1, c1, r2, c2, reverse, cb) {
    swapAnim = { r1, c1, r2, c2, progress: 0, reverse };
    const duration = 10;
    let frame = 0;
    function step() {
      frame++;
      swapAnim.progress = Math.min(frame / duration, 1);
      draw();
      if (frame < duration) {
        requestAnimationFrame(step);
      } else {
        swapAnim = null;
        cb();
      }
    }
    requestAnimationFrame(step);
  }

  // --- Input handling ---
  function handleSelect(row, col) {
    if (!gameRunning || animating) return;
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;

    if (selected === null) {
      selected = { row, col };
      draw();
    } else if (selected.row === row && selected.col === col) {
      selected = null;
      draw();
    } else if (isAdjacent(selected.row, selected.col, row, col)) {
      // Attempt swap
      const r1 = selected.row, c1 = selected.col;
      const r2 = row, c2 = col;
      selected = null;
      animating = true;

      // Animate swap
      animateSwap(r1, c1, r2, c2, false, () => {
        swapCells(r1, c1, r2, c2);
        const matches = findMatches();
        if (matches.length > 0) {
          moves--;
          movesEl.textContent = `Moves: ${moves}`;
          processBoardCascade();
        } else {
          // Swap back
          swapCells(r1, c1, r2, c2);
          animateSwap(r1, c1, r2, c2, true, () => {
            animating = false;
          });
        }
      });
    } else {
      selected = { row, col };
      draw();
    }
  }

  // Touch/mouse support with drag-to-swap
  let pointerStart = null;

  function getCellFromPos(px, py) {
    const col = Math.floor((px - offsetX) / cellSize);
    const row = Math.floor((py - offsetY) / cellSize);
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) return { row, col };
    return null;
  }

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  function onPointerDown(e) {
    e.preventDefault();
    const pos = getCanvasPos(e);
    const cell = getCellFromPos(pos.x, pos.y);
    if (cell) {
      pointerStart = cell;
    }
  }

  function onPointerUp(e) {
    e.preventDefault();
    if (!pointerStart) return;
    const pos = getCanvasPos(e.changedTouches ? e.changedTouches[0] : e);
    const cell = getCellFromPos(pos.x, pos.y);

    if (cell && (cell.row !== pointerStart.row || cell.col !== pointerStart.col) &&
        isAdjacent(pointerStart.row, pointerStart.col, cell.row, cell.col)) {
      // Drag swap
      selected = null;
      handleSwapDirect(pointerStart.row, pointerStart.col, cell.row, cell.col);
    } else if (cell) {
      // Tap select
      handleSelect(pointerStart.row, pointerStart.col);
    }
    pointerStart = null;
  }

  function handleSwapDirect(r1, c1, r2, c2) {
    if (!gameRunning || animating) return;
    animating = true;

    animateSwap(r1, c1, r2, c2, false, () => {
      swapCells(r1, c1, r2, c2);
      const matches = findMatches();
      if (matches.length > 0) {
        moves--;
        movesEl.textContent = `Moves: ${moves}`;
        processBoardCascade();
      } else {
        swapCells(r1, c1, r2, c2);
        animateSwap(r1, c1, r2, c2, true, () => {
          animating = false;
        });
      }
    });
  }

  // --- Check game over ---
  function checkGameOver() {
    if (moves <= 0) {
      endGame();
      return;
    }
    // Check if any valid moves exist
    if (!hasValidMoves()) {
      // Shuffle the board
      shuffleBoard();
    }
  }

  function hasValidMoves() {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Try swap right
        if (c + 1 < gridSize) {
          swapCells(r, c, r, c + 1);
          if (findMatches().length > 0) { swapCells(r, c, r, c + 1); return true; }
          swapCells(r, c, r, c + 1);
        }
        // Try swap down
        if (r + 1 < gridSize) {
          swapCells(r, c, r + 1, c);
          if (findMatches().length > 0) { swapCells(r, c, r + 1, c); return true; }
          swapCells(r, c, r + 1, c);
        }
      }
    }
    return false;
  }

  function shuffleBoard() {
    let safety = 0;
    do {
      // Fisher-Yates on the flat board
      const flat = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) flat.push(board[r][c]);
      }
      for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
      }
      let idx = 0;
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) board[r][c] = flat[idx++];
      }
      safety++;
    } while ((findMatches().length > 0 || !hasValidMoves()) && safety < 100);

    // If still has matches, just clear them
    while (findMatches().length > 0) {
      const matches = findMatches();
      for (const { row, col } of matches) {
        board[row][col] = Math.floor(Math.random() * CANDY_COLORS.length);
      }
    }

    draw();
  }

  function endGame() {
    gameRunning = false;
    let isNew = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('candycrush_highscore', String(highScore));
      isNew = true;
    }
    finalScoreEl.textContent = `Score: ${score}`;
    newHighEl.style.display = isNew ? 'block' : 'none';
    updateHighScoreDisplay();
    gameOverEl.style.display = 'flex';
  }

  function updateHighScoreDisplay() {
    highScoreEl.textContent = `Best: ${highScore}`;
    if (highScore > 0) {
      menuHighEl.textContent = `High Score: ${highScore}`;
    }
  }

  // --- Drawing ---
  function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Board background
    ctx.fillStyle = 'rgba(22, 33, 62, 0.6)';
    ctx.beginPath();
    ctx.roundRect(offsetX - 4, offsetY - 4, boardPx + 8, boardPx + 8, 12);
    ctx.fill();

    // Grid cells and candies
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = offsetX + c * cellSize;
        const y = offsetY + r * cellSize;

        // Cell background (checkerboard)
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)';
        ctx.fillRect(x, y, cellSize, cellSize);

        // Skip if being animated elsewhere
        if (isSwapping(r, c) || isFalling(r, c) || isRemoving(r, c)) continue;

        if (board[r][c] >= 0) {
          drawCandy(x + cellSize / 2, y + cellSize / 2, cellSize * 0.38, board[r][c], 1);
        }
      }
    }

    // Selection highlight
    if (selected) {
      const sx = offsetX + selected.col * cellSize;
      const sy = offsetY + selected.row * cellSize;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(sx + 2, sy + 2, cellSize - 4, cellSize - 4, 6);
      ctx.stroke();
    }

    // Swap animation
    if (swapAnim) {
      const { r1, c1, r2, c2, progress } = swapAnim;
      const p = swapAnim.reverse ? 1 - progress : progress;
      // Candy 1 moves toward candy 2's position
      const x1 = offsetX + (c1 + (c2 - c1) * p) * cellSize + cellSize / 2;
      const y1 = offsetY + (r1 + (r2 - r1) * p) * cellSize + cellSize / 2;
      const x2 = offsetX + (c2 + (c1 - c2) * p) * cellSize + cellSize / 2;
      const y2 = offsetY + (r2 + (r1 - r2) * p) * cellSize + cellSize / 2;
      drawCandy(x1, y1, cellSize * 0.38, board[r1][c1], 1);
      drawCandy(x2, y2, cellSize * 0.38, board[r2][c2], 1);
    }

    // Falling candies
    for (const fc of fallingCandies) {
      const fromY = offsetY + fc.fromRow * cellSize + cellSize / 2;
      const toY = offsetY + fc.row * cellSize + cellSize / 2;
      const curY = fromY + (toY - fromY) * fc.progress;
      const curX = offsetX + fc.col * cellSize + cellSize / 2;
      drawCandy(curX, curY, cellSize * 0.38, fc.candy, 1);
    }

    // Removing candies
    for (const rc of removingCandies) {
      const x = offsetX + rc.col * cellSize + cellSize / 2;
      const y = offsetY + rc.row * cellSize + cellSize / 2;
      const scale = 1 - rc.progress;
      const alpha = 1 - rc.progress;
      if (board[rc.row][rc.col] >= 0) {
        ctx.globalAlpha = alpha;
        drawCandy(x, y, cellSize * 0.38 * scale, board[rc.row][rc.col], 1);
        ctx.globalAlpha = 1;
      }
    }

    // Score popups
    for (let i = scorePopups.length - 1; i >= 0; i--) {
      const popup = scorePopups[i];
      popup.progress += 0.02;
      if (popup.progress >= 1) {
        scorePopups.splice(i, 1);
        continue;
      }
      const alpha = 1 - popup.progress;
      const y = popup.y - popup.progress * 40;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#f5c518';
      ctx.font = `bold ${cellSize * 0.45}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(popup.text, popup.x, y);
      ctx.globalAlpha = 1;
    }

    // Continuously redraw for popups
    if (scorePopups.length > 0) {
      requestAnimationFrame(draw);
    }
  }

  function isSwapping(r, c) {
    if (!swapAnim) return false;
    return (swapAnim.r1 === r && swapAnim.c1 === c) || (swapAnim.r2 === r && swapAnim.c2 === c);
  }

  function isFalling(r, c) {
    return fallingCandies.some(fc => fc.row === r && fc.col === c);
  }

  function isRemoving(r, c) {
    return removingCandies.some(rc => rc.row === r && rc.col === c);
  }

  function drawCandy(cx, cy, radius, type, scale) {
    const r = radius * scale;
    const color = CANDY_COLORS[type];
    const shape = CANDY_SHAPES[type];

    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.5);
        ctx.lineTo(cx - r * 0.4, cy);
        ctx.lineTo(cx, cy - r * 0.1);
        ctx.closePath();
        ctx.fill();
        break;

      case 'square':
        ctx.beginPath();
        ctx.roundRect(cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, r * 0.25);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(cx - r * 0.5, cy - r * 0.5, r * 0.4, r * 0.4);
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r * 0.95, cy + r * 0.7);
        ctx.lineTo(cx - r * 0.95, cy + r * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.4);
        ctx.lineTo(cx + r * 0.3, cy + r * 0.2);
        ctx.lineTo(cx - r * 0.3, cy + r * 0.2);
        ctx.closePath();
        ctx.fill();
        break;

      case 'star': {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
          ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          const ia = a + Math.PI / 5;
          ctx.lineTo(cx + Math.cos(ia) * r * 0.45, cy + Math.sin(ia) * r * 0.45);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'heart': {
        ctx.beginPath();
        const hr = r * 0.85;
        ctx.moveTo(cx, cy + hr * 0.8);
        ctx.bezierCurveTo(cx - hr * 1.5, cy - hr * 0.2, cx - hr * 0.8, cy - hr * 1.2, cx, cy - hr * 0.4);
        ctx.bezierCurveTo(cx + hr * 0.8, cy - hr * 1.2, cx + hr * 1.5, cy - hr * 0.2, cx, cy + hr * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx - hr * 0.35, cy - hr * 0.4, hr * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }

  // --- Canvas sizing ---
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const maxSize = Math.min(canvas.width - 20, canvas.height - 80);
    cellSize = Math.floor(maxSize / gridSize);
    boardPx = cellSize * gridSize;
    offsetX = Math.floor((canvas.width - boardPx) / 2);
    offsetY = Math.floor((canvas.height - boardPx) / 2) + 20;
    if (gameRunning) draw();
  }

  // --- Start / Restart ---
  function startGame() {
    SimplespilStats.recordPlay('candycrush');
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();

    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';
    gameOverEl.style.display = 'none';

    score = 0;
    moves = TOTAL_MOVES;
    gameRunning = true;
    animating = false;
    selected = null;
    fallingCandies = [];
    removingCandies = [];
    swapAnim = null;
    scorePopups = [];

    createBoard();
    updateHighScoreDisplay();
    scoreEl.textContent = `Score: ${score}`;
    movesEl.textContent = `Moves: ${moves}`;
    draw();

    // Input listeners
    canvas.removeEventListener('mousedown', onPointerDown);
    canvas.removeEventListener('mouseup', onPointerUp);
    canvas.removeEventListener('touchstart', onPointerDown);
    canvas.removeEventListener('touchend', onPointerUp);

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchend', onPointerUp, { passive: false });
  }

  // --- Button handlers ---
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', startGame);
  document.getElementById('menu-btn').addEventListener('click', () => {
    gameRunning = false;
    gameEl.style.display = 'none';
    gameOverEl.style.display = 'none';
    menuEl.style.display = 'flex';
  });

  window.addEventListener('resize', () => {
    if (canvas) resizeCanvas();
  });

  updateHighScoreDisplay();
})();
