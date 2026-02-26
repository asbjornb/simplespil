(() => {
  'use strict';

  // --- Constants ---
  const COLS = 7;
  const ROWS = 6;
  const EMPTY = 0;
  const RED = 1;
  const YELLOW = 2;
  const RED_COLOR = '#e94560';
  const YELLOW_COLOR = '#f5c518';
  const BOARD_COLOR = '#0f3460';
  const BOARD_BORDER = '#1a3a6e';
  const BG_COLOR = '#1a1a2e';
  const HIGHLIGHT_COLOR = 'rgba(255,255,255,0.25)';
  const DROP_SPEED = 0.035; // fraction of total distance per frame

  // --- DOM ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const canvas = document.getElementById('board-canvas');
  const ctx = canvas.getContext('2d');
  const turnDisc = document.getElementById('turn-disc');
  const turnCtx = turnDisc.getContext('2d');
  const turnText = document.getElementById('turn-text');
  const gameOverEl = document.getElementById('game-over');
  const winnerText = document.getElementById('winner-text');
  const btn2p = document.getElementById('btn-2p');
  const btnBot = document.getElementById('btn-bot');
  const restartBtn = document.getElementById('restart-btn');
  const menuBtn = document.getElementById('menu-btn');

  // --- State ---
  let board = [];
  let currentPlayer = RED;
  let vsBot = false;
  let gameActive = false;
  let hoverCol = -1;
  let winCells = null;
  let animating = false;
  let dropAnim = null; // { col, row, player, y, targetY }

  // --- Layout ---
  let cellSize = 0;
  let boardX = 0;
  let boardY = 0;
  let boardW = 0;
  let boardH = 0;
  let padding = 0;

  // --- Init ---
  function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
      board.push(new Array(COLS).fill(EMPTY));
    }
    currentPlayer = RED;
    gameActive = true;
    winCells = null;
    animating = false;
    dropAnim = null;
    hoverCol = -1;
    gameOverEl.style.display = 'none';
    updateTurnIndicator();
  }

  function sizeCanvas() {
    const maxW = Math.min(window.innerWidth - 24, 500);
    const maxH = window.innerHeight - 180;
    cellSize = Math.floor(Math.min(maxW / (COLS + 1), maxH / (ROWS + 2)));
    cellSize = Math.max(cellSize, 36);
    padding = Math.floor(cellSize * 0.5);
    boardW = COLS * cellSize;
    boardH = ROWS * cellSize;
    canvas.width = boardW + padding * 2;
    canvas.height = boardH + padding * 2 + cellSize; // extra row on top for preview
    boardX = padding;
    boardY = padding + cellSize;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
  }

  // --- Drawing ---
  function draw() {
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    // Preview piece (hovering piece above the board)
    if (hoverCol >= 0 && gameActive && !animating) {
      const px = boardX + hoverCol * cellSize + cellSize / 2;
      const py = boardY - cellSize / 2;
      drawDisc(ctx, px, py, cellSize * 0.4, currentPlayer);
    }

    // Drop animation piece (piece in flight)
    if (dropAnim) {
      const px = boardX + dropAnim.col * cellSize + cellSize / 2;
      drawDisc(ctx, px, dropAnim.y, cellSize * 0.4, dropAnim.player);
    }

    // Board background
    ctx.fillStyle = BOARD_COLOR;
    roundRect(ctx, boardX - 4, boardY - 4, boardW + 8, boardH + 8, 10);
    ctx.fill();
    ctx.strokeStyle = BOARD_BORDER;
    ctx.lineWidth = 2;
    roundRect(ctx, boardX - 4, boardY - 4, boardW + 8, boardH + 8, 10);
    ctx.stroke();

    // Cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cx = boardX + c * cellSize + cellSize / 2;
        const cy = boardY + r * cellSize + cellSize / 2;
        const radius = cellSize * 0.4;

        // Hole punch effect
        ctx.fillStyle = BG_COLOR;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
        ctx.fill();

        // Skip drawing the disc if it's currently being animated into this cell
        if (dropAnim && dropAnim.col === c && dropAnim.row === r) {
          continue;
        }

        const val = board[r][c];
        if (val !== EMPTY) {
          drawDisc(ctx, cx, cy, radius, val);
        }
      }
    }

    // Winning highlight
    if (winCells) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      for (const [r, c] of winCells) {
        const cx = boardX + c * cellSize + cellSize / 2;
        const cy = boardY + r * cellSize + cellSize / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, cellSize * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    // Column highlight on hover
    if (hoverCol >= 0 && gameActive && !animating) {
      ctx.fillStyle = HIGHLIGHT_COLOR;
      ctx.fillRect(boardX + hoverCol * cellSize, boardY, cellSize, boardH);
    }
  }

  function drawDisc(context, x, y, radius, player) {
    const color = player === RED ? RED_COLOR : YELLOW_COLOR;
    // Main disc
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    // Inner highlight
    const grad = context.createRadialGradient(x - radius * 0.25, y - radius * 0.25, 0, x, y, radius);
    grad.addColorStop(0, 'rgba(255,255,255,0.3)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    grad.addColorStop(1, 'rgba(0,0,0,0.15)');
    context.fillStyle = grad;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  function roundRect(context, x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }

  function updateTurnIndicator() {
    turnCtx.clearRect(0, 0, 28, 28);
    drawDisc(turnCtx, 14, 14, 12, currentPlayer);
    const name = playerName(currentPlayer);
    if (vsBot && currentPlayer === YELLOW) {
      turnText.textContent = "Bot's turn";
    } else {
      turnText.textContent = name + "'s turn";
    }
  }

  function playerName(p) {
    return p === RED ? 'Red' : 'Yellow';
  }

  // --- Game Logic ---
  function getDropRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === EMPTY) return r;
    }
    return -1;
  }

  function dropPiece(col) {
    if (!gameActive || animating) return;
    const row = getDropRow(col);
    if (row < 0) return; // column full

    animating = true;
    const startY = boardY - cellSize / 2;
    const targetY = boardY + row * cellSize + cellSize / 2;
    dropAnim = {
      col,
      row,
      player: currentPlayer,
      y: startY,
      targetY,
      vy: 0
    };

    animateDrop();
  }

  function animateDrop() {
    if (!dropAnim) return;

    const gravity = cellSize * 0.06;
    dropAnim.vy += gravity;
    dropAnim.y += dropAnim.vy;

    if (dropAnim.y >= dropAnim.targetY) {
      dropAnim.y = dropAnim.targetY;
      // Place piece on board
      board[dropAnim.row][dropAnim.col] = dropAnim.player;
      const placedPlayer = dropAnim.player;
      dropAnim = null;
      animating = false;

      draw();

      // Check win / draw
      const win = checkWin(placedPlayer);
      if (win) {
        winCells = win;
        gameActive = false;
        draw();
        showWin(placedPlayer);
        return;
      }

      if (isBoardFull()) {
        gameActive = false;
        showDraw();
        return;
      }

      // Switch turns
      currentPlayer = currentPlayer === RED ? YELLOW : RED;
      updateTurnIndicator();
      draw();

      // Bot move
      if (vsBot && currentPlayer === YELLOW && gameActive) {
        setTimeout(botMove, 400);
      }
      return;
    }

    draw();
    requestAnimationFrame(animateDrop);
  }

  function checkWin(player) {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (board[r][c] === player && board[r][c + 1] === player &&
            board[r][c + 2] === player && board[r][c + 3] === player) {
          return [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]];
        }
      }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r <= ROWS - 4; r++) {
        if (board[r][c] === player && board[r + 1][c] === player &&
            board[r + 2][c] === player && board[r + 3][c] === player) {
          return [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]];
        }
      }
    }
    // Diagonal down-right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (board[r][c] === player && board[r + 1][c + 1] === player &&
            board[r + 2][c + 2] === player && board[r + 3][c + 3] === player) {
          return [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]];
        }
      }
    }
    // Diagonal down-left
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 3; c < COLS; c++) {
        if (board[r][c] === player && board[r + 1][c - 1] === player &&
            board[r + 2][c - 2] === player && board[r + 3][c - 3] === player) {
          return [[r, c], [r + 1, c - 1], [r + 2, c - 2], [r + 3, c - 3]];
        }
      }
    }
    return null;
  }

  function isBoardFull() {
    for (let c = 0; c < COLS; c++) {
      if (board[0][c] === EMPTY) return false;
    }
    return true;
  }

  function showWin(player) {
    const name = (vsBot && player === YELLOW) ? 'Bot' : playerName(player);
    winnerText.textContent = name + ' wins!';
    winnerText.style.color = player === RED ? RED_COLOR : YELLOW_COLOR;
    gameOverEl.style.display = 'flex';
  }

  function showDraw() {
    winnerText.textContent = "It's a draw!";
    winnerText.style.color = 'var(--color-text)';
    gameOverEl.style.display = 'flex';
  }

  // --- Bot AI ---
  function botMove() {
    if (!gameActive || currentPlayer !== YELLOW) return;

    const col = botChooseCol();
    if (col >= 0) {
      hoverCol = col;
      draw();
      setTimeout(() => dropPiece(col), 200);
    }
  }

  function botChooseCol() {
    // 1. Win if possible
    for (let c = 0; c < COLS; c++) {
      if (canPlay(c) && wouldWin(c, YELLOW)) return c;
    }
    // 2. Block opponent win
    for (let c = 0; c < COLS; c++) {
      if (canPlay(c) && wouldWin(c, RED)) return c;
    }
    // 3. Avoid moves that let opponent win next turn
    const safe = [];
    for (let c = 0; c < COLS; c++) {
      if (!canPlay(c)) continue;
      if (!givesOpponentWin(c)) safe.push(c);
    }
    const candidates = safe.length > 0 ? safe : availableCols();
    // 4. Prefer center columns
    return pickWeighted(candidates);
  }

  function canPlay(col) {
    return board[0][col] === EMPTY;
  }

  function availableCols() {
    const cols = [];
    for (let c = 0; c < COLS; c++) {
      if (canPlay(c)) cols.push(c);
    }
    return cols;
  }

  function wouldWin(col, player) {
    const row = getDropRow(col);
    if (row < 0) return false;
    board[row][col] = player;
    const win = checkWin(player);
    board[row][col] = EMPTY;
    return win !== null;
  }

  function givesOpponentWin(col) {
    const row = getDropRow(col);
    if (row < 0) return false;
    board[row][col] = YELLOW;
    // Check if placing here exposes a win for RED above
    if (row > 0) {
      board[row - 1][col] = RED;
      const oppWin = checkWin(RED);
      board[row - 1][col] = EMPTY;
      if (oppWin) {
        board[row][col] = EMPTY;
        return true;
      }
    }
    board[row][col] = EMPTY;
    return false;
  }

  function pickWeighted(cols) {
    if (cols.length === 0) return -1;
    // Weight center columns higher: center = 3, adjacent = 2, edges = 1
    const center = Math.floor(COLS / 2);
    const weights = cols.map(c => {
      const dist = Math.abs(c - center);
      return Math.max(1, 4 - dist);
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < cols.length; i++) {
      r -= weights[i];
      if (r <= 0) return cols[i];
    }
    return cols[cols.length - 1];
  }

  // --- Input ---
  function getColFromX(x) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const canvasX = (x - rect.left) * scaleX;
    const col = Math.floor((canvasX - boardX) / cellSize);
    if (col < 0 || col >= COLS) return -1;
    return col;
  }

  canvas.addEventListener('mousemove', (e) => {
    if (!gameActive || animating) return;
    hoverCol = getColFromX(e.clientX);
    draw();
  });

  canvas.addEventListener('mouseleave', () => {
    hoverCol = -1;
    draw();
  });

  canvas.addEventListener('click', (e) => {
    if (!gameActive || animating) return;
    if (vsBot && currentPlayer === YELLOW) return; // bot's turn
    const col = getColFromX(e.clientX);
    if (col >= 0) dropPiece(col);
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameActive || animating) return;
    if (vsBot && currentPlayer === YELLOW) return;
    const touch = e.touches[0];
    const col = getColFromX(touch.clientX);
    if (col >= 0) {
      hoverCol = col;
      dropPiece(col);
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!gameActive || animating) return;
    const touch = e.touches[0];
    hoverCol = getColFromX(touch.clientX);
    draw();
  });

  // --- Navigation ---
  function showMenu() {
    menuEl.style.display = 'flex';
    gameEl.style.display = 'none';
  }

  function startGame(bot) {
    SimplespilStats.recordPlay('fourinarow');
    vsBot = bot;
    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';
    sizeCanvas();
    initBoard();
    draw();
  }

  btn2p.addEventListener('click', () => startGame(false));
  btnBot.addEventListener('click', () => startGame(true));
  restartBtn.addEventListener('click', () => {
    initBoard();
    sizeCanvas();
    draw();
  });
  menuBtn.addEventListener('click', showMenu);

  window.addEventListener('resize', () => {
    sizeCanvas();
    draw();
  });

  // Keyboard support: left/right to pick column, space/enter to drop
  window.addEventListener('keydown', (e) => {
    if (!gameActive || animating) return;
    if (vsBot && currentPlayer === YELLOW) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (hoverCol < 0) hoverCol = Math.floor(COLS / 2);
      else hoverCol = Math.max(0, hoverCol - 1);
      draw();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (hoverCol < 0) hoverCol = Math.floor(COLS / 2);
      else hoverCol = Math.min(COLS - 1, hoverCol + 1);
      draw();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (hoverCol >= 0) dropPiece(hoverCol);
    }
  });
})();
