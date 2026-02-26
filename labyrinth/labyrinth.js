(() => {
  'use strict';

  // --- Maze generation (recursive backtracker) ---
  function generateMaze(cols, rows) {
    // Each cell has walls: top, right, bottom, left
    const grid = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid.push({ r, c, walls: [true, true, true, true], visited: false });
      }
    }

    const idx = (r, c) => {
      if (r < 0 || r >= rows || c < 0 || c >= cols) return -1;
      return r * cols + c;
    };

    const stack = [];
    const start = grid[0];
    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [
        { r: current.r - 1, c: current.c, wallPair: [0, 2] }, // top
        { r: current.r, c: current.c + 1, wallPair: [1, 3] }, // right
        { r: current.r + 1, c: current.c, wallPair: [2, 0] }, // bottom
        { r: current.r, c: current.c - 1, wallPair: [3, 1] }  // left
      ].filter(n => {
        const i = idx(n.r, n.c);
        return i !== -1 && !grid[i].visited;
      });

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        const nextCell = grid[idx(next.r, next.c)];
        // Remove walls between current and next
        current.walls[next.wallPair[0]] = false;
        nextCell.walls[next.wallPair[1]] = false;
        nextCell.visited = true;
        stack.push(nextCell);
      }
    }

    return grid;
  }

  // --- State ---
  let mazeSize = 8;
  let maze = [];
  let playerR = 0, playerC = 0;
  let goalR, goalC;
  let moves = 0;
  let level = 1;
  let startTime = 0;
  let timerInterval;
  let canvas, ctx;
  let cellSize;
  let canvasW, canvasH;
  let trail = [];

  // --- DOM ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const winEl = document.getElementById('win-screen');
  const movesEl = document.getElementById('moves-display');
  const timerEl = document.getElementById('timer-display');
  const levelEl = document.getElementById('level-display');
  const menuBestEl = document.getElementById('menu-best');

  // --- Difficulty ---
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      mazeSize = parseInt(btn.dataset.size, 10);
    });
  });

  // --- Start ---
  document.getElementById('start-btn').addEventListener('click', () => { level = 1; startGame(); });
  document.getElementById('next-btn').addEventListener('click', () => { level++; startGame(); });
  document.getElementById('menu-btn').addEventListener('click', () => {
    gameEl.style.display = 'none';
    winEl.style.display = 'none';
    menuEl.style.display = 'flex';
    clearInterval(timerInterval);
  });

  function startGame() {
    canvas = document.getElementById('maze-canvas');
    ctx = canvas.getContext('2d');
    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';
    winEl.style.display = 'none';

    // Generate maze
    maze = generateMaze(mazeSize, mazeSize);
    playerR = 0;
    playerC = 0;
    goalR = mazeSize - 1;
    goalC = mazeSize - 1;
    trail = [{ r: 0, c: 0 }];

    // Size canvas (leave more room on touch devices for d-pad)
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const verticalPadding = isTouchDevice ? 280 : 140;
    const maxSize = Math.min(window.innerWidth - 40, window.innerHeight - verticalPadding, 500);
    cellSize = Math.floor(maxSize / mazeSize);
    canvasW = cellSize * mazeSize;
    canvasH = cellSize * mazeSize;
    canvas.width = canvasW;
    canvas.height = canvasH;

    moves = 0;
    movesEl.textContent = 'Moves: 0';
    levelEl.textContent = `Level ${level}`;
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    timerEl.textContent = 'Time: 0:00';

    drawMaze();
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    timerEl.textContent = `Time: ${min}:${sec.toString().padStart(2, '0')}`;
  }

  function drawMaze() {
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Draw cells
    for (const cell of maze) {
      const x = cell.c * cellSize;
      const y = cell.r * cellSize;

      // Cell floor
      ctx.fillStyle = '#16213e';
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
    }

    // Draw trail
    ctx.fillStyle = 'rgba(52, 152, 219, 0.15)';
    for (const t of trail) {
      ctx.fillRect(t.c * cellSize + 2, t.r * cellSize + 2, cellSize - 4, cellSize - 4);
    }

    // Draw walls
    ctx.strokeStyle = '#4a90d9';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (const cell of maze) {
      const x = cell.c * cellSize;
      const y = cell.r * cellSize;

      if (cell.walls[0]) { // top
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }
      if (cell.walls[1]) { // right
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.walls[2]) { // bottom
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (cell.walls[3]) { // left
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
    }

    // Draw goal (star)
    const gx = goalC * cellSize + cellSize / 2;
    const gy = goalR * cellSize + cellSize / 2;
    drawStar(ctx, gx, gy, cellSize * 0.35);

    // Draw player (ball with glow)
    const px = playerC * cellSize + cellSize / 2;
    const py = playerR * cellSize + cellSize / 2;
    const radius = cellSize * 0.3;

    // Glow
    const glow = ctx.createRadialGradient(px, py, 0, px, py, radius * 2);
    glow.addColorStop(0, 'rgba(78, 204, 163, 0.4)');
    glow.addColorStop(1, 'rgba(78, 204, 163, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    const ballGrad = ctx.createRadialGradient(px - radius * 0.3, py - radius * 0.3, 0, px, py, radius);
    ballGrad.addColorStop(0, '#7fffcc');
    ballGrad.addColorStop(1, '#4ecca3');
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(px - radius * 0.25, py - radius * 0.25, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStar(ctx, cx, cy, size) {
    const spikes = 5;
    const outerR = size;
    const innerR = size * 0.45;

    // Star glow
    ctx.fillStyle = 'rgba(245, 197, 24, 0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f5c518';
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI / spikes) - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Center highlight
    ctx.fillStyle = '#ffe066';
    ctx.beginPath();
    ctx.arc(cx, cy, innerR * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Movement ---
  function movePlayer(dr, dc) {
    const cellIdx = playerR * mazeSize + playerC;
    const cell = maze[cellIdx];

    // Check walls
    if (dr === -1 && cell.walls[0]) return; // top
    if (dc === 1 && cell.walls[1]) return;  // right
    if (dr === 1 && cell.walls[2]) return;  // bottom
    if (dc === -1 && cell.walls[3]) return; // left

    playerR += dr;
    playerC += dc;
    moves++;
    movesEl.textContent = `Moves: ${moves}`;

    // Add to trail if new position
    if (!trail.some(t => t.r === playerR && t.c === playerC)) {
      trail.push({ r: playerR, c: playerC });
    }

    drawMaze();

    if (playerR === goalR && playerC === goalC) {
      win();
    }
  }

  // Keyboard
  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        movePlayer(-1, 0);
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        movePlayer(1, 0);
        break;
      case 'ArrowLeft':
      case 'KeyA':
        e.preventDefault();
        movePlayer(0, -1);
        break;
      case 'ArrowRight':
      case 'KeyD':
        e.preventDefault();
        movePlayer(0, 1);
        break;
    }
  });

  // D-pad buttons with hold-to-repeat
  document.querySelectorAll('.dpad-btn').forEach(btn => {
    let repeatTimer = null;
    let repeatInterval = null;

    const doMove = () => {
      switch (btn.dataset.dir) {
        case 'up': movePlayer(-1, 0); break;
        case 'down': movePlayer(1, 0); break;
        case 'left': movePlayer(0, -1); break;
        case 'right': movePlayer(0, 1); break;
      }
    };

    const startRepeat = (e) => {
      e.preventDefault();
      doMove();
      // After a short delay, start repeating
      repeatTimer = setTimeout(() => {
        repeatInterval = setInterval(doMove, 120);
      }, 300);
    };

    const stopRepeat = () => {
      clearTimeout(repeatTimer);
      clearInterval(repeatInterval);
      repeatTimer = null;
      repeatInterval = null;
    };

    btn.addEventListener('touchstart', startRepeat);
    btn.addEventListener('touchend', stopRepeat);
    btn.addEventListener('touchcancel', stopRepeat);
    btn.addEventListener('mousedown', startRepeat);
    btn.addEventListener('mouseup', stopRepeat);
    btn.addEventListener('mouseleave', stopRepeat);
  });

  // Tap-to-move on canvas (tap direction relative to player)
  const mazeCanvas = document.getElementById('maze-canvas');
  if (mazeCanvas) {
    let touchStartX = 0, touchStartY = 0;
    let touchMoved = false;

    mazeCanvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
    });

    mazeCanvas.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) touchMoved = true;
    });

    mazeCanvas.addEventListener('touchend', (e) => {
      if (touchMoved) {
        // Swipe: use end position relative to start
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
          movePlayer(0, dx > 0 ? 1 : -1);
        } else {
          movePlayer(dy > 0 ? 1 : -1, 0);
        }
        return;
      }

      // Tap: move toward tap position relative to player
      const rect = mazeCanvas.getBoundingClientRect();
      const scaleX = mazeCanvas.width / rect.width;
      const scaleY = mazeCanvas.height / rect.height;
      const tapX = (e.changedTouches[0].clientX - rect.left) * scaleX;
      const tapY = (e.changedTouches[0].clientY - rect.top) * scaleY;

      const playerPixelX = playerC * cellSize + cellSize / 2;
      const playerPixelY = playerR * cellSize + cellSize / 2;
      const dx = tapX - playerPixelX;
      const dy = tapY - playerPixelY;

      // Need a minimum distance so tapping right on the player does nothing
      if (Math.abs(dx) < cellSize * 0.3 && Math.abs(dy) < cellSize * 0.3) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        movePlayer(0, dx > 0 ? 1 : -1);
      } else {
        movePlayer(dy > 0 ? 1 : -1, 0);
      }
    });

    // Mouse click-to-move (for desktop too)
    mazeCanvas.addEventListener('click', (e) => {
      const rect = mazeCanvas.getBoundingClientRect();
      const scaleX = mazeCanvas.width / rect.width;
      const scaleY = mazeCanvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const playerPixelX = playerC * cellSize + cellSize / 2;
      const playerPixelY = playerR * cellSize + cellSize / 2;
      const dx = clickX - playerPixelX;
      const dy = clickY - playerPixelY;

      if (Math.abs(dx) < cellSize * 0.3 && Math.abs(dy) < cellSize * 0.3) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        movePlayer(0, dx > 0 ? 1 : -1);
      } else {
        movePlayer(dy > 0 ? 1 : -1, 0);
      }
    });
  }

  function win() {
    clearInterval(timerInterval);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const timeStr = `${min}:${sec.toString().padStart(2, '0')}`;

    document.getElementById('win-stats').textContent =
      `${moves} moves in ${timeStr}`;

    // Save best for this size
    const key = `labyrinth_best_${mazeSize}`;
    const prev = parseInt(localStorage.getItem(key) || '999999', 10);
    if (moves < prev) {
      localStorage.setItem(key, String(moves));
    }

    setTimeout(() => {
      winEl.style.display = 'flex';
    }, 400);
  }

  // Show best on menu
  function updateMenuBest() {
    const key = `labyrinth_best_${mazeSize}`;
    const best = localStorage.getItem(key);
    if (best) {
      menuBestEl.textContent = `Best: ${best} moves`;
    } else {
      menuBestEl.textContent = '';
    }
  }
  updateMenuBest();
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', updateMenuBest);
  });
})();
