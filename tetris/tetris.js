(() => {
  'use strict';

  // --- Constants ---
  const COLS = 10;
  const ROWS = 20;
  const BLOCK = 30;
  const COLORS = {
    I: '#3498db',
    O: '#f5c518',
    T: '#9b59b6',
    S: '#4ecca3',
    Z: '#e94560',
    J: '#0f3460',
    L: '#f39c12'
  };
  const GHOST_ALPHA = 0.2;

  // Tetromino shapes (each rotation is a list of [row, col] offsets)
  const SHAPES = {
    I: [
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[2,0],[3,0]],
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[2,0],[3,0]]
    ],
    O: [
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[1,0],[1,1]]
    ],
    T: [
      [[0,0],[0,1],[0,2],[1,1]],
      [[0,0],[1,0],[2,0],[1,1]],
      [[1,0],[1,1],[1,2],[0,1]],
      [[0,0],[1,0],[2,0],[1,-1]]
    ],
    S: [
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,0],[1,0],[1,1],[2,1]],
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,0],[1,0],[1,1],[2,1]]
    ],
    Z: [
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,1],[1,0],[1,1],[2,0]],
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,1],[1,0],[1,1],[2,0]]
    ],
    J: [
      [[0,0],[1,0],[1,1],[1,2]],
      [[0,0],[0,1],[1,0],[2,0]],
      [[0,0],[0,1],[0,2],[1,2]],
      [[0,0],[1,0],[2,0],[2,-1]]
    ],
    L: [
      [[0,2],[1,0],[1,1],[1,2]],
      [[0,0],[1,0],[2,0],[2,1]],
      [[0,0],[0,1],[0,2],[1,0]],
      [[0,0],[0,1],[1,1],[2,1]]
    ]
  };

  const PIECE_TYPES = Object.keys(SHAPES);
  const LOCK_DELAY = 500; // ms before piece locks after landing
  const LINES_PER_LEVEL = 10;

  // --- State ---
  let board = [];
  let current = null;   // { type, rotation, row, col }
  let nextType = null;
  let score = 0;
  let lines = 0;
  let level = 1;
  let highScore = parseInt(localStorage.getItem('tetris_highscore')) || 0;
  let gameRunning = false;
  let dropInterval = null;
  let lockTimer = null;
  let animatingRows = null; // rows being cleared (flash animation)
  let animFrame = 0;

  // --- DOM ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const boardCanvas = document.getElementById('board-canvas');
  const boardCtx = boardCanvas.getContext('2d');
  const nextCanvas = document.getElementById('next-canvas');
  const nextCtx = nextCanvas.getContext('2d');
  const scoreEl = document.getElementById('score-value');
  const levelEl = document.getElementById('level-value');
  const linesEl = document.getElementById('lines-value');
  const gameOverEl = document.getElementById('game-over');
  const finalScoreEl = document.getElementById('final-score');
  const newHighEl = document.getElementById('new-high');
  const menuHighEl = document.getElementById('menu-high-score');

  // --- Init ---
  function init() {
    boardCanvas.width = COLS * BLOCK;
    boardCanvas.height = ROWS * BLOCK;
    nextCanvas.width = 4 * BLOCK;
    nextCanvas.height = 4 * BLOCK;

    if (highScore > 0) {
      menuHighEl.textContent = 'High Score: ' + highScore;
    }

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('menu-btn').addEventListener('click', showMenu);

    document.addEventListener('keydown', onKey);
    setupTouch();
    resizeBoard();
    window.addEventListener('resize', resizeBoard);
  }

  function resizeBoard() {
    // Scale the board canvas to fit the viewport while keeping aspect ratio
    // On touch devices, reserve space for the fixed touch controls at the bottom
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const controlsHeight = isTouchDevice ? 200 : 0;
    const maxH = (window.innerHeight - controlsHeight) * 0.75;
    const maxW = window.innerWidth * 0.6;
    const scale = Math.min(maxH / (ROWS * BLOCK), maxW / (COLS * BLOCK), 1);
    boardCanvas.style.width = (COLS * BLOCK * scale) + 'px';
    boardCanvas.style.height = (ROWS * BLOCK * scale) + 'px';

    const nextScale = Math.min(scale, 0.8);
    nextCanvas.style.width = (4 * BLOCK * nextScale) + 'px';
    nextCanvas.style.height = (4 * BLOCK * nextScale) + 'px';
  }

  // --- Game flow ---
  function showMenu() {
    gameRunning = false;
    clearInterval(dropInterval);
    menuEl.style.display = '';
    gameEl.style.display = 'none';
    gameOverEl.style.display = 'none';
    if (highScore > 0) {
      menuHighEl.textContent = 'High Score: ' + highScore;
    }
  }

  function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    score = 0;
    lines = 0;
    level = 1;
    animatingRows = null;

    menuEl.style.display = 'none';
    gameEl.style.display = '';
    gameOverEl.style.display = 'none';
    updateHUD();

    nextType = randomType();
    spawnPiece();
    gameRunning = true;
    resetDropInterval();
    draw();
  }

  function gameOver() {
    gameRunning = false;
    clearInterval(dropInterval);

    let isNew = false;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('tetris_highscore', highScore);
      isNew = true;
    }

    finalScoreEl.textContent = 'Score: ' + score;
    newHighEl.style.display = isNew ? '' : 'none';
    gameOverEl.style.display = '';
  }

  // --- Piece logic ---
  function randomType() {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }

  function spawnPiece() {
    current = {
      type: nextType,
      rotation: 0,
      row: 0,
      col: Math.floor((COLS - 2) / 2)
    };
    nextType = randomType();

    // Check if spawn position is blocked
    if (!isValid(current.row, current.col, current.type, current.rotation)) {
      gameOver();
      return;
    }

    drawNext();
    clearLockTimer();
  }

  function getCells(row, col, type, rotation) {
    return SHAPES[type][rotation].map(([dr, dc]) => [row + dr, col + dc]);
  }

  function isValid(row, col, type, rotation) {
    const cells = getCells(row, col, type, rotation);
    return cells.every(([r, c]) =>
      r >= 0 && r < ROWS && c >= 0 && c < COLS && !board[r][c]
    );
  }

  function ghostRow() {
    let r = current.row;
    while (isValid(r + 1, current.col, current.type, current.rotation)) {
      r++;
    }
    return r;
  }

  // --- Movement ---
  function moveLeft() {
    if (!gameRunning || !current || animatingRows) return;
    if (isValid(current.row, current.col - 1, current.type, current.rotation)) {
      current.col--;
      resetLockIfLifted();
      draw();
    }
  }

  function moveRight() {
    if (!gameRunning || !current || animatingRows) return;
    if (isValid(current.row, current.col + 1, current.type, current.rotation)) {
      current.col++;
      resetLockIfLifted();
      draw();
    }
  }

  function moveDown() {
    if (!gameRunning || !current || animatingRows) return;
    if (isValid(current.row + 1, current.col, current.type, current.rotation)) {
      current.row++;
      draw();
      return true;
    }
    startLockTimer();
    return false;
  }

  function hardDrop() {
    if (!gameRunning || !current || animatingRows) return;
    let dropped = 0;
    while (isValid(current.row + 1, current.col, current.type, current.rotation)) {
      current.row++;
      dropped++;
    }
    score += dropped * 2;
    updateHUD();
    lockPiece();
  }

  function rotate() {
    if (!gameRunning || !current || animatingRows) return;
    const newRot = (current.rotation + 1) % 4;
    // Try basic rotation, then wall kicks
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (isValid(current.row, current.col + kick, current.type, newRot)) {
        current.rotation = newRot;
        current.col += kick;
        resetLockIfLifted();
        draw();
        return;
      }
    }
  }

  // --- Lock delay ---
  function startLockTimer() {
    if (lockTimer) return;
    lockTimer = setTimeout(() => {
      if (current && !isValid(current.row + 1, current.col, current.type, current.rotation)) {
        lockPiece();
      }
      lockTimer = null;
    }, LOCK_DELAY);
  }

  function clearLockTimer() {
    if (lockTimer) {
      clearTimeout(lockTimer);
      lockTimer = null;
    }
  }

  function resetLockIfLifted() {
    // If piece is no longer on the ground after a move, cancel the lock timer
    if (lockTimer && isValid(current.row + 1, current.col, current.type, current.rotation)) {
      clearLockTimer();
    }
  }

  // --- Locking & line clearing ---
  function lockPiece() {
    clearLockTimer();
    const cells = getCells(current.row, current.col, current.type, current.rotation);
    cells.forEach(([r, c]) => {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        board[r][c] = current.type;
      }
    });
    current = null;

    // Check for completed lines
    const fullRows = [];
    for (let r = 0; r < ROWS; r++) {
      if (board[r].every(cell => cell !== null)) {
        fullRows.push(r);
      }
    }

    if (fullRows.length > 0) {
      animatingRows = fullRows;
      animFrame = 0;
      flashRows();
    } else {
      spawnPiece();
    }
  }

  function flashRows() {
    animFrame++;
    draw();
    if (animFrame < 6) {
      requestAnimationFrame(flashRows);
    } else {
      clearRows(animatingRows);
      animatingRows = null;
      spawnPiece();
      draw();
    }
  }

  function clearRows(rowIndices) {
    const count = rowIndices.length;
    // Remove rows top-to-bottom (sorted ascending) and add empty rows at top
    rowIndices.sort((a, b) => a - b);
    for (const r of rowIndices) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(null));
    }

    // Scoring: 100, 300, 500, 800 for 1-4 lines
    const points = [0, 100, 300, 500, 800][count] * level;
    score += points;
    lines += count;

    const newLevel = Math.floor(lines / LINES_PER_LEVEL) + 1;
    if (newLevel !== level) {
      level = newLevel;
      resetDropInterval();
    }
    updateHUD();
  }

  // --- Drop interval ---
  function getDropSpeed() {
    // Gets faster per level (in ms). Level 1 = 800ms, speeds up
    return Math.max(100, 800 - (level - 1) * 70);
  }

  function resetDropInterval() {
    clearInterval(dropInterval);
    if (gameRunning) {
      dropInterval = setInterval(() => {
        if (current && !animatingRows) {
          if (!moveDown()) {
            // piece can't move down, lock timer handles it
          }
        }
      }, getDropSpeed());
    }
  }

  // --- HUD ---
  function updateHUD() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
  }

  // --- Drawing ---
  function draw() {
    const ctx = boardCtx;
    ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

    // Draw background grid
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
      }
    }

    // Draw locked blocks
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          // Flash animation for clearing rows
          if (animatingRows && animatingRows.includes(r)) {
            if (animFrame % 2 === 0) {
              drawBlock(ctx, c, r, '#ffffff');
            } else {
              drawBlock(ctx, c, r, COLORS[board[r][c]]);
            }
          } else {
            drawBlock(ctx, c, r, COLORS[board[r][c]]);
          }
        }
      }
    }

    if (current && !animatingRows) {
      // Draw ghost
      const gr = ghostRow();
      const ghostCells = getCells(gr, current.col, current.type, current.rotation);
      ctx.globalAlpha = GHOST_ALPHA;
      ghostCells.forEach(([r, c]) => {
        if (r >= 0) drawBlock(ctx, c, r, COLORS[current.type]);
      });
      ctx.globalAlpha = 1;

      // Draw current piece
      const cells = getCells(current.row, current.col, current.type, current.rotation);
      cells.forEach(([r, c]) => {
        if (r >= 0) drawBlock(ctx, c, r, COLORS[current.type]);
      });
    }
  }

  function drawBlock(ctx, col, row, color) {
    const x = col * BLOCK;
    const y = row * BLOCK;
    const inset = 1;

    ctx.fillStyle = color;
    ctx.fillRect(x + inset, y + inset, BLOCK - inset * 2, BLOCK - inset * 2);

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + inset, y + inset, BLOCK - inset * 2, 3);
    ctx.fillRect(x + inset, y + inset, 3, BLOCK - inset * 2);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + inset, y + BLOCK - inset - 3, BLOCK - inset * 2, 3);
    ctx.fillRect(x + BLOCK - inset - 3, y + inset, 3, BLOCK - inset * 2);
  }

  function drawNext() {
    const ctx = nextCtx;
    ctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    ctx.fillStyle = 'rgba(10,10,26,0.5)';
    ctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const cells = SHAPES[nextType][0];
    // Center the piece in the preview
    let minC = 4, maxC = 0, minR = 4, maxR = 0;
    cells.forEach(([r, c]) => {
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
    });
    const pw = maxC - minC + 1;
    const ph = maxR - minR + 1;
    const offC = (4 - pw) / 2 - minC;
    const offR = (4 - ph) / 2 - minR;

    cells.forEach(([r, c]) => {
      drawBlock(ctx, c + offC, r + offR, COLORS[nextType]);
    });
  }

  // --- Input ---
  function onKey(e) {
    if (!gameRunning) return;
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        e.preventDefault();
        moveLeft();
        break;
      case 'ArrowRight':
      case 'd':
        e.preventDefault();
        moveRight();
        break;
      case 'ArrowDown':
      case 's':
        e.preventDefault();
        moveDown();
        score += 1;
        updateHUD();
        break;
      case 'ArrowUp':
      case 'w':
        e.preventDefault();
        rotate();
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
    }
  }

  function setupTouch() {
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        fn();
      });
      // Also support mouse for hybrid devices
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        fn();
      });
    };

    bind('btn-left', moveLeft);
    bind('btn-right', moveRight);
    bind('btn-down', () => {
      moveDown();
      score += 1;
      updateHUD();
    });
    bind('btn-rotate', rotate);
    bind('btn-drop', hardDrop);
  }

  // --- Start ---
  init();
})();
