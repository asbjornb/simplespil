(() => {
  'use strict';

  // --- Procedural picture generators ---
  const pictures = [
    {
      name: 'Sunset',
      draw(ctx, w, h) {
        // Sky gradient
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
        sky.addColorStop(0, '#1a0533');
        sky.addColorStop(0.3, '#e94560');
        sky.addColorStop(0.6, '#f39c12');
        sky.addColorStop(1, '#f5c518');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h * 0.7);
        // Sun
        ctx.fillStyle = '#f5c518';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.45, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.45, w * 0.07, 0, Math.PI * 2);
        ctx.fill();
        // Water
        const water = ctx.createLinearGradient(0, h * 0.65, 0, h);
        water.addColorStop(0, '#3498db');
        water.addColorStop(1, '#0f3460');
        ctx.fillStyle = water;
        ctx.fillRect(0, h * 0.65, w, h * 0.35);
        // Reflection
        ctx.fillStyle = 'rgba(245, 197, 24, 0.2)';
        ctx.fillRect(w * 0.35, h * 0.65, w * 0.3, h * 0.35);
        // Mountains
        ctx.fillStyle = '#2d1b4e';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.65);
        ctx.lineTo(w * 0.2, h * 0.35);
        ctx.lineTo(w * 0.4, h * 0.65);
        ctx.fill();
        ctx.fillStyle = '#3d2b5e';
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h * 0.65);
        ctx.lineTo(w * 0.55, h * 0.3);
        ctx.lineTo(w * 0.8, h * 0.65);
        ctx.fill();
        ctx.fillStyle = '#2d1b4e';
        ctx.beginPath();
        ctx.moveTo(w * 0.6, h * 0.65);
        ctx.lineTo(w * 0.85, h * 0.4);
        ctx.lineTo(w, h * 0.55);
        ctx.lineTo(w, h * 0.65);
        ctx.fill();
      }
    },
    {
      name: 'Forest',
      draw(ctx, w, h) {
        // Sky
        const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        sky.addColorStop(0, '#87ceeb');
        sky.addColorStop(1, '#c8e6c9');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
        // Ground
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, h * 0.65, w, h * 0.35);
        ctx.fillStyle = '#3d6b34';
        ctx.fillRect(0, h * 0.85, w, h * 0.15);
        // Trees
        const treePositions = [0.1, 0.25, 0.42, 0.58, 0.75, 0.9];
        treePositions.forEach((tx, i) => {
          const th = h * (0.35 + (i % 3) * 0.08);
          const baseY = h * 0.65;
          // Trunk
          ctx.fillStyle = '#8B5E3C';
          ctx.fillRect(tx * w - 5, baseY - th * 0.4, 10, th * 0.4);
          // Foliage layers
          const colors = ['#2d8a4e', '#3da85e', '#4ecca3'];
          for (let j = 0; j < 3; j++) {
            ctx.fillStyle = colors[j];
            ctx.beginPath();
            ctx.moveTo(tx * w - w * (0.06 - j * 0.012), baseY - th * (0.3 + j * 0.2));
            ctx.lineTo(tx * w, baseY - th * (0.6 + j * 0.15));
            ctx.lineTo(tx * w + w * (0.06 - j * 0.012), baseY - th * (0.3 + j * 0.2));
            ctx.fill();
          }
        });
        // Flowers
        const flowerColors = ['#e94560', '#f5c518', '#9b59b6', '#e91e8f'];
        for (let i = 0; i < 12; i++) {
          ctx.fillStyle = flowerColors[i % 4];
          const fx = (i * w / 12) + w * 0.04;
          const fy = h * 0.72 + Math.sin(i * 2) * h * 0.05;
          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f5c518';
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      name: 'Space',
      draw(ctx, w, h) {
        // Background
        const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7);
        bg.addColorStop(0, '#1a1a3e');
        bg.addColorStop(1, '#0a0a15');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        // Stars
        for (let i = 0; i < 80; i++) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
          ctx.fillRect(
            Math.sin(i * 47.3) * w * 0.5 + w * 0.5,
            Math.cos(i * 31.7) * h * 0.5 + h * 0.5,
            1 + Math.random() * 2, 1 + Math.random() * 2
          );
        }
        // Planet
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(w * 0.35, h * 0.4, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.arc(w * 0.32, h * 0.37, w * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4ecca3';
        ctx.beginPath();
        ctx.arc(w * 0.39, h * 0.44, w * 0.04, 0, Math.PI * 2);
        ctx.fill();
        // Ring
        ctx.strokeStyle = '#f5c518';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(w * 0.35, h * 0.4, w * 0.25, w * 0.05, -0.3, 0, Math.PI * 2);
        ctx.stroke();
        // Rocket
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.moveTo(w * 0.75, h * 0.25);
        ctx.lineTo(w * 0.72, h * 0.45);
        ctx.lineTo(w * 0.78, h * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f5c518';
        ctx.beginPath();
        ctx.moveTo(w * 0.73, h * 0.45);
        ctx.lineTo(w * 0.75, h * 0.55);
        ctx.lineTo(w * 0.77, h * 0.45);
        ctx.closePath();
        ctx.fill();
        // Window
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.arc(w * 0.75, h * 0.35, w * 0.015, 0, Math.PI * 2);
        ctx.fill();
        // Moon
        ctx.fillStyle = '#f0e68c';
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.75, w * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ddd685';
        ctx.beginPath();
        ctx.arc(w * 0.78, h * 0.73, w * 0.02, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w * 0.83, h * 0.77, w * 0.015, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      name: 'Castle',
      draw(ctx, w, h) {
        // Sky
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#4a90d9');
        sky.addColorStop(1, '#87ceeb');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);
        // Clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        [[0.2, 0.15, 25], [0.7, 0.1, 30], [0.5, 0.2, 20]].forEach(([cx, cy, r]) => {
          ctx.beginPath();
          ctx.arc(w * cx, h * cy, r, 0, Math.PI * 2);
          ctx.arc(w * cx + r, h * cy - 5, r * 0.7, 0, Math.PI * 2);
          ctx.arc(w * cx - r * 0.5, h * cy, r * 0.6, 0, Math.PI * 2);
          ctx.fill();
        });
        // Ground / hill
        ctx.fillStyle = '#4a7c3f';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.75);
        ctx.quadraticCurveTo(w * 0.5, h * 0.55, w, h * 0.75);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();
        ctx.fillStyle = '#3d6b34';
        ctx.fillRect(0, h * 0.88, w, h * 0.12);
        // Castle
        const ccx = w * 0.3, cy = h * 0.38, cw = w * 0.4, ch = h * 0.35;
        ctx.fillStyle = '#a0a0b8';
        ctx.fillRect(ccx, cy, cw, ch);
        // Towers
        ctx.fillStyle = '#8a8a9a';
        ctx.fillRect(ccx - w * 0.04, cy - h * 0.1, w * 0.08, ch + h * 0.1);
        ctx.fillRect(ccx + cw - w * 0.04, cy - h * 0.1, w * 0.08, ch + h * 0.1);
        // Tower tops
        ctx.fillStyle = '#e94560';
        [ccx, ccx + cw].forEach(tx => {
          ctx.beginPath();
          ctx.moveTo(tx - w * 0.05, cy - h * 0.1);
          ctx.lineTo(tx, cy - h * 0.22);
          ctx.lineTo(tx + w * 0.05, cy - h * 0.1);
          ctx.fill();
        });
        // Battlements
        ctx.fillStyle = '#8a8a9a';
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(ccx + i * (cw / 6) + 2, cy - h * 0.03, cw / 8, h * 0.03);
        }
        // Gate
        ctx.fillStyle = '#5a4a3a';
        ctx.beginPath();
        ctx.moveTo(ccx + cw * 0.35, cy + ch);
        ctx.lineTo(ccx + cw * 0.35, cy + ch * 0.55);
        ctx.arc(ccx + cw * 0.5, cy + ch * 0.55, cw * 0.15, Math.PI, 0);
        ctx.lineTo(ccx + cw * 0.65, cy + ch);
        ctx.fill();
        // Windows
        ctx.fillStyle = '#f5c518';
        [[0.38, 0.35], [0.62, 0.35], [0.5, 0.15]].forEach(([wx, wy]) => {
          ctx.fillRect(ccx + cw * wx - 5, cy + ch * wy, 10, 14);
        });
        // Flag
        ctx.strokeStyle = '#5a4a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ccx + cw * 0.5, cy - h * 0.03);
        ctx.lineTo(ccx + cw * 0.5, cy - h * 0.13);
        ctx.stroke();
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.moveTo(ccx + cw * 0.5, cy - h * 0.13);
        ctx.lineTo(ccx + cw * 0.5 + 15, cy - h * 0.1);
        ctx.lineTo(ccx + cw * 0.5, cy - h * 0.07);
        ctx.fill();
      }
    },
    {
      name: 'Rainbow',
      draw(ctx, w, h) {
        // Sky
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(0, 0, w, h);
        // Ground
        ctx.fillStyle = '#4ecca3';
        ctx.fillRect(0, h * 0.75, w, h * 0.25);
        ctx.fillStyle = '#3da85e';
        ctx.fillRect(0, h * 0.85, w, h * 0.15);
        // Rainbow
        const colors = ['#e94560', '#f39c12', '#f5c518', '#4ecca3', '#3498db', '#9b59b6'];
        const rcx = w * 0.5, rcy = h * 0.75;
        colors.forEach((c, i) => {
          ctx.strokeStyle = c;
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(rcx, rcy, w * 0.38 - i * 12, Math.PI, 0);
          ctx.stroke();
        });
        // Sun
        ctx.fillStyle = '#f5c518';
        ctx.beginPath();
        ctx.arc(w * 0.85, h * 0.12, 25, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          ctx.strokeStyle = '#f5c518';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(w * 0.85 + Math.cos(angle) * 30, h * 0.12 + Math.sin(angle) * 30);
          ctx.lineTo(w * 0.85 + Math.cos(angle) * 40, h * 0.12 + Math.sin(angle) * 40);
          ctx.stroke();
        }
        // Butterflies
        const bfColors = ['#e94560', '#9b59b6', '#f39c12'];
        [[0.15, 0.35], [0.8, 0.45], [0.45, 0.25]].forEach(([bx, by], i) => {
          ctx.fillStyle = bfColors[i];
          ctx.beginPath();
          ctx.ellipse(w * bx - 6, h * by, 6, 10, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(w * bx + 6, h * by, 6, 10, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(w * bx - 1, h * by - 4, 2, 8);
        });
        // Flowers in grass
        for (let i = 0; i < 10; i++) {
          const fx = w * 0.05 + i * w * 0.1;
          const fy = h * 0.78 + Math.sin(i * 3) * 8;
          ctx.fillStyle = ['#e94560', '#f5c518', '#9b59b6', '#e91e8f'][i % 4];
          for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(fx + Math.cos(angle) * 5, fy + Math.sin(angle) * 5, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#f5c518';
          ctx.beginPath();
          ctx.arc(fx, fy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      name: 'Ocean',
      draw(ctx, w, h) {
        // Water gradient
        const water = ctx.createLinearGradient(0, 0, 0, h);
        water.addColorStop(0, '#1a8fb4');
        water.addColorStop(0.4, '#0f6d8e');
        water.addColorStop(1, '#0a3d5c');
        ctx.fillStyle = water;
        ctx.fillRect(0, 0, w, h);
        // Light rays
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#87ceeb';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(w * (0.1 + i * 0.2), 0);
          ctx.lineTo(w * (0.05 + i * 0.2), h);
          ctx.lineTo(w * (0.2 + i * 0.2), h);
          ctx.lineTo(w * (0.15 + i * 0.2), 0);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Sand / sea floor
        ctx.fillStyle = '#c2a66b';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.85);
        ctx.quadraticCurveTo(w * 0.3, h * 0.82, w * 0.5, h * 0.88);
        ctx.quadraticCurveTo(w * 0.7, h * 0.92, w, h * 0.85);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();
        // Fish
        const fishColors = ['#e94560', '#f5c518', '#4ecca3', '#9b59b6'];
        [[0.2, 0.3], [0.7, 0.45], [0.4, 0.6], [0.85, 0.25]].forEach(([fx, fy], i) => {
          ctx.fillStyle = fishColors[i];
          ctx.beginPath();
          ctx.ellipse(w * fx, h * fy, 18, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(w * fx - 18, h * fy);
          ctx.lineTo(w * fx - 28, h * fy - 8);
          ctx.lineTo(w * fx - 28, h * fy + 8);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(w * fx + 10, h * fy - 2, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(w * fx + 11, h * fy - 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
        // Bubbles
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 15; i++) {
          const bx = (i * 73.7) % w;
          const by = (i * 51.3) % (h * 0.8);
          const br = 3 + (i % 5) * 2;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Seaweed
        ctx.strokeStyle = '#2d8a4e';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++) {
          const sx = w * 0.1 + i * w * 0.16;
          ctx.beginPath();
          ctx.moveTo(sx, h * 0.88);
          ctx.quadraticCurveTo(sx + 10, h * 0.75, sx - 5, h * 0.65);
          ctx.stroke();
        }
      }
    }
  ];

  // --- State ---
  let selectedPic = 0;
  let gridSize = 3;
  let moves = 0;
  let startTime = 0;
  let timerInterval;
  let sourceCanvas;
  let boardSize;
  let pieceSize;
  let trayPieceSize;
  let imageDataURL;
  let placedCount = 0;
  let totalPieces = 0;
  let selectedPieceEl = null;
  let showingHint = false;
  let hintTimeout;

  // --- DOM ---
  const menuEl = document.getElementById('menu');
  const gameEl = document.getElementById('game');
  const winEl = document.getElementById('win-screen');
  const movesEl = document.getElementById('moves-display');
  const timerEl = document.getElementById('timer-display');
  const picSelectEl = document.getElementById('picture-select');
  const boardEl = document.getElementById('puzzle-board');
  const trayEl = document.getElementById('piece-tray');

  // --- Build picture previews ---
  pictures.forEach((pic, i) => {
    const btn = document.createElement('button');
    btn.className = `pic-btn${i === 0 ? ' selected' : ''}`;
    btn.dataset.idx = i;
    const c = document.createElement('canvas');
    c.width = 90;
    c.height = 90;
    try {
      pic.draw(c.getContext('2d'), 90, 90);
    } catch (e) {
      const fallbackCtx = c.getContext('2d');
      fallbackCtx.fillStyle = ['#e94560', '#4ecca3', '#3498db', '#f5c518', '#9b59b6', '#f39c12'][i % 6];
      fallbackCtx.fillRect(0, 0, 90, 90);
    }
    btn.appendChild(c);
    const label = document.createElement('div');
    label.style.cssText = 'font-size:0.7rem;color:var(--color-text-muted);margin-top:2px;';
    label.textContent = pic.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pic-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPic = i;
    });
    picSelectEl.appendChild(btn);
  });

  // --- Difficulty select ---
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gridSize = parseInt(btn.dataset.grid, 10);
    });
  });

  // --- Button handlers ---
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('next-btn').addEventListener('click', () => {
    selectedPic = (selectedPic + 1) % pictures.length;
    startGame();
  });
  document.getElementById('menu-btn-win').addEventListener('click', () => {
    gameEl.style.display = 'none';
    winEl.style.display = 'none';
    menuEl.style.display = 'flex';
    clearInterval(timerInterval);
  });
  document.getElementById('hint-btn').addEventListener('click', showHint);

  // --- Game ---
  function startGame() {
    SimplespilStats.recordPlay('puzzle');
    showingHint = false;
    clearTimeout(hintTimeout);
    selectedPieceEl = null;

    menuEl.style.display = 'none';
    gameEl.style.display = 'flex';
    winEl.style.display = 'none';

    // Size the board to fit screen with room for the tray
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const isMobile = screenW <= 480;
    const hudSpace = isMobile ? 70 : 50;
    const trayMinHeight = 100;
    const paddings = 100;
    const availableH = screenH - hudSpace - trayMinHeight - paddings;
    const maxBoardSize = Math.min(screenW - 40, availableH, 420);
    boardSize = Math.floor(maxBoardSize / gridSize) * gridSize;
    pieceSize = boardSize / gridSize;
    trayPieceSize = Math.max(40, Math.min(pieceSize, 90));
    totalPieces = gridSize * gridSize;
    placedCount = 0;

    // Pre-render full image
    sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = boardSize;
    sourceCanvas.height = boardSize;
    try {
      pictures[selectedPic].draw(sourceCanvas.getContext('2d'), boardSize, boardSize);
    } catch (e) {
      const sctx = sourceCanvas.getContext('2d');
      const grad = sctx.createLinearGradient(0, 0, boardSize, boardSize);
      grad.addColorStop(0, '#e94560');
      grad.addColorStop(0.5, '#f5c518');
      grad.addColorStop(1, '#4ecca3');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, boardSize, boardSize);
    }
    imageDataURL = sourceCanvas.toDataURL();

    buildBoard();
    buildTray();

    moves = 0;
    movesEl.textContent = 'Moves: 0';
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    timerEl.textContent = 'Time: 0:00';
  }

  function buildBoard() {
    boardEl.innerHTML = '';
    boardEl.style.width = boardSize + 'px';
    boardEl.style.height = boardSize + 'px';
    boardEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        // Faint guide showing where this piece belongs
        cell.style.backgroundImage = `url(${imageDataURL})`;
        cell.style.backgroundSize = `${boardSize}px ${boardSize}px`;
        cell.style.backgroundPosition = `${-col * pieceSize}px ${-row * pieceSize}px`;
        cell.addEventListener('click', onBoardCellClick);
        boardEl.appendChild(cell);
      }
    }
  }

  function buildTray() {
    trayEl.innerHTML = '';

    // Shuffle piece order
    const pieceIds = [];
    for (let i = 0; i < totalPieces; i++) pieceIds.push(i);
    for (let i = pieceIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieceIds[i], pieceIds[j]] = [pieceIds[j], pieceIds[i]];
    }

    const scaledBgSize = gridSize * trayPieceSize;

    pieceIds.forEach(id => {
      const row = Math.floor(id / gridSize);
      const col = id % gridSize;
      const piece = document.createElement('div');
      piece.className = 'tray-piece';
      piece.dataset.id = id;
      piece.style.width = trayPieceSize + 'px';
      piece.style.height = trayPieceSize + 'px';
      piece.style.backgroundImage = `url(${imageDataURL})`;
      piece.style.backgroundSize = `${scaledBgSize}px ${scaledBgSize}px`;
      piece.style.backgroundPosition = `${-col * trayPieceSize}px ${-row * trayPieceSize}px`;
      piece.addEventListener('pointerdown', onPiecePointerDown);
      trayEl.appendChild(piece);
    });
  }

  // --- Interaction: drag and tap-to-place ---
  function onPiecePointerDown(e) {
    e.preventDefault();
    const piece = e.currentTarget;
    const id = parseInt(piece.dataset.id, 10);
    const startX = e.clientX;
    const startY = e.clientY;
    let isDragging = false;
    let clone = null;

    const onMove = (ev) => {
      ev.preventDefault();
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      if (!isDragging && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        isDragging = true;
        const row = Math.floor(id / gridSize);
        const col = id % gridSize;
        clone = document.createElement('div');
        clone.className = 'drag-clone';
        clone.style.width = pieceSize + 'px';
        clone.style.height = pieceSize + 'px';
        clone.style.backgroundImage = `url(${imageDataURL})`;
        clone.style.backgroundSize = `${boardSize}px ${boardSize}px`;
        clone.style.backgroundPosition = `${-col * pieceSize}px ${-row * pieceSize}px`;
        document.body.appendChild(clone);
        piece.classList.add('dragging');
        // Deselect any selected piece
        if (selectedPieceEl) {
          selectedPieceEl.classList.remove('selected');
          selectedPieceEl = null;
        }
      }

      if (isDragging && clone) {
        clone.style.left = (ev.clientX - pieceSize / 2) + 'px';
        clone.style.top = (ev.clientY - pieceSize / 2) + 'px';
      }
    };

    const onUp = (ev) => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);

      if (isDragging && clone) {
        clone.remove();
        piece.classList.remove('dragging');
        const cell = findBoardCellAt(ev.clientX, ev.clientY);
        if (cell) {
          tryPlacePiece(id, cell, piece);
        }
      } else {
        // Tap: toggle selection
        if (selectedPieceEl === piece) {
          piece.classList.remove('selected');
          selectedPieceEl = null;
        } else {
          if (selectedPieceEl) selectedPieceEl.classList.remove('selected');
          piece.classList.add('selected');
          selectedPieceEl = piece;
        }
      }
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  function onBoardCellClick(e) {
    if (!selectedPieceEl) return;
    const cell = e.currentTarget;
    if (cell.classList.contains('filled')) return;

    const pieceId = parseInt(selectedPieceEl.dataset.id, 10);
    const pieceEl = selectedPieceEl;
    selectedPieceEl.classList.remove('selected');
    selectedPieceEl = null;
    tryPlacePiece(pieceId, cell, pieceEl);
  }

  function findBoardCellAt(clientX, clientY) {
    const cells = boardEl.querySelectorAll('.board-cell:not(.filled)');
    for (const cell of cells) {
      const rect = cell.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom) {
        return cell;
      }
    }
    return null;
  }

  function tryPlacePiece(pieceId, cell, pieceEl) {
    const targetRow = parseInt(cell.dataset.row, 10);
    const targetCol = parseInt(cell.dataset.col, 10);
    const targetId = targetRow * gridSize + targetCol;

    moves++;
    movesEl.textContent = `Moves: ${moves}`;

    if (pieceId === targetId) {
      // Correct placement
      cell.classList.add('filled');
      cell.classList.add('just-placed');
      setTimeout(() => cell.classList.remove('just-placed'), 500);
      pieceEl.remove();
      placedCount++;

      if (selectedPieceEl === pieceEl) {
        selectedPieceEl = null;
      }

      if (placedCount === totalPieces) {
        onWin();
      }
    } else {
      // Wrong spot - shake the cell
      cell.classList.add('wrong');
      setTimeout(() => cell.classList.remove('wrong'), 400);
    }
  }

  // --- Win ---
  function onWin() {
    clearInterval(timerInterval);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const winStats = document.getElementById('win-stats');
    winStats.textContent = `${moves} moves in ${min}:${sec.toString().padStart(2, '0')}`;
    setTimeout(() => {
      winEl.style.display = 'flex';
    }, 500);
  }

  // --- Timer ---
  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    timerEl.textContent = `Time: ${min}:${sec.toString().padStart(2, '0')}`;
  }

  // --- Hint: briefly show the full image on the board ---
  function showHint() {
    if (showingHint) return;
    showingHint = true;
    const cells = boardEl.querySelectorAll('.board-cell');
    cells.forEach(cell => cell.classList.add('hint-show'));
    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => {
      showingHint = false;
      cells.forEach(cell => cell.classList.remove('hint-show'));
    }, 1500);
  }
})();
