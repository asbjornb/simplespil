(() => {
  'use strict';

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const menu = document.getElementById('menu');
  const game = document.getElementById('game');
  const winScreen = document.getElementById('win-screen');
  const startBtn = document.getElementById('start-btn');
  const againBtn = document.getElementById('again-btn');

  // Shape definitions
  const SHAPE_TYPES = ['circle', 'square', 'triangle', 'star', 'heart'];
  const SHAPE_COLORS = [
    '#e94560', // red
    '#3498db', // blue
    '#4ecca3', // green
    '#f5c518', // yellow
    '#9b59b6', // purple
  ];

  let pieces = [];
  let targets = [];
  let dragging = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let matched = 0;
  let particles = [];
  let celebrationParticles = [];
  let animFrame = 0;

  function resizeCanvas() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function shapeSize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const min = Math.min(w, h);
    // Size shapes so 5 fit comfortably with gaps
    return Math.max(40, Math.min(90, min / 6));
  }

  // Draw shape at center (cx, cy) with given radius
  function drawShape(type, cx, cy, r, color, filled) {
    ctx.save();
    ctx.beginPath();

    switch (type) {
      case 'circle':
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        break;

      case 'square':
        ctx.rect(cx - r, cy - r, r * 2, r * 2);
        break;

      case 'triangle':
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy + r * 0.8);
        ctx.lineTo(cx - r, cy + r * 0.8);
        ctx.closePath();
        break;

      case 'star': {
        const spikes = 5;
        const outerR = r;
        const innerR = r * 0.4;
        for (let i = 0; i < spikes * 2; i++) {
          const rad = (i * Math.PI) / spikes - Math.PI / 2;
          const rr = i % 2 === 0 ? outerR : innerR;
          const x = cx + Math.cos(rad) * rr;
          const y = cy + Math.sin(rad) * rr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      }

      case 'heart': {
        const s = r * 0.6;
        ctx.moveTo(cx, cy + r * 0.6);
        ctx.bezierCurveTo(cx - r * 1.2, cy - r * 0.2, cx - r * 0.6, cy - r, cx, cy - r * 0.4);
        ctx.bezierCurveTo(cx + r * 0.6, cy - r, cx + r * 1.2, cy - r * 0.2, cx, cy + r * 0.6);
        ctx.closePath();
        break;
      }
    }

    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
      // Shine highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      switch (type) {
        case 'circle':
          ctx.ellipse(cx - r * 0.2, cy - r * 0.25, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
          break;
        default:
          ctx.ellipse(cx, cy - r * 0.3, r * 0.35, r * 0.15, 0, 0, Math.PI * 2);
          break;
      }
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function layoutPositions() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const r = shapeSize();
    const count = SHAPE_TYPES.length;
    const isPortrait = h > w;

    targets.length = 0;
    const shuffledPieceIndices = shuffle([0, 1, 2, 3, 4]);

    if (isPortrait) {
      // Portrait: targets on top, pieces on bottom
      const targetY = h * 0.25;
      const pieceY = h * 0.75;
      const spacing = w / (count + 1);

      for (let i = 0; i < count; i++) {
        targets.push({
          type: SHAPE_TYPES[i],
          color: SHAPE_COLORS[i],
          cx: spacing * (i + 1),
          cy: targetY,
          r: r,
          matched: false,
        });
      }

      for (let i = 0; i < count; i++) {
        const si = shuffledPieceIndices[i];
        pieces.push({
          type: SHAPE_TYPES[si],
          color: SHAPE_COLORS[si],
          cx: spacing * (i + 1),
          cy: pieceY,
          homeX: spacing * (i + 1),
          homeY: pieceY,
          r: r,
          matched: false,
        });
      }
    } else {
      // Landscape: targets on left, pieces on right
      const targetX = w * 0.25;
      const pieceX = w * 0.75;
      const spacing = h / (count + 1);

      for (let i = 0; i < count; i++) {
        targets.push({
          type: SHAPE_TYPES[i],
          color: SHAPE_COLORS[i],
          cx: targetX,
          cy: spacing * (i + 1),
          r: r,
          matched: false,
        });
      }

      for (let i = 0; i < count; i++) {
        const si = shuffledPieceIndices[i];
        pieces.push({
          type: SHAPE_TYPES[si],
          color: SHAPE_COLORS[si],
          cx: pieceX,
          cy: spacing * (i + 1),
          homeX: pieceX,
          homeY: spacing * (i + 1),
          r: r,
          matched: false,
        });
      }
    }
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function spawnMatchParticles(cx, cy, color) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 3 + Math.random() * 4,
        color: color,
        life: 1,
      });
    }
  }

  function spawnCelebration() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const colors = ['#e94560', '#f5c518', '#4ecca3', '#3498db', '#9b59b6', '#f39c12'];
    for (let i = 0; i < 60; i++) {
      celebrationParticles.push({
        x: Math.random() * w,
        y: -10 - Math.random() * h * 0.5,
        vx: (Math.random() - 0.5) * 3,
        vy: 1.5 + Math.random() * 3,
        r: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= 0.025;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = celebrationParticles.length - 1; i >= 0; i--) {
      const p = celebrationParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.life -= 0.005;
      if (p.life <= 0 || p.y > canvas.clientHeight + 20) {
        celebrationParticles.splice(i, 1);
      }
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

    for (const p of celebrationParticles) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Draw a gentle pulsing hint ring around targets
  function drawTargetHint(target) {
    const pulse = Math.sin(animFrame * 0.04) * 0.15 + 0.85;
    ctx.save();
    ctx.globalAlpha = 0.15 + pulse * 0.1;
    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.arc(target.cx, target.cy, target.r + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Draw divider
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    if (h > w) {
      ctx.beginPath();
      ctx.moveTo(20, h * 0.5);
      ctx.lineTo(w - 20, h * 0.5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(w * 0.5, 20);
      ctx.lineTo(w * 0.5, h - 20);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // Draw targets
    for (const t of targets) {
      if (!t.matched) {
        drawTargetHint(t);
        drawShape(t.type, t.cx, t.cy, t.r, t.color, false);
      } else {
        drawShape(t.type, t.cx, t.cy, t.r, t.color, true);
      }
    }

    // Draw pieces (non-dragging first, dragging on top)
    for (const p of pieces) {
      if (p.matched || p === dragging) continue;
      drawShape(p.type, p.cx, p.cy, p.r, p.color, true);
    }

    // Draw dragging piece last (on top)
    if (dragging) {
      ctx.save();
      ctx.shadowColor = dragging.color;
      ctx.shadowBlur = 20;
      drawShape(dragging.type, dragging.cx, dragging.cy, dragging.r * 1.1, dragging.color, true);
      ctx.restore();
    }

    // Particles
    drawParticles();

    animFrame++;
  }

  function gameLoop() {
    updateParticles();
    draw();

    // Animate pieces returning home
    let needsAnim = false;
    for (const p of pieces) {
      if (p.matched || p === dragging) continue;
      if (p.returning) {
        const dx = p.homeX - p.cx;
        const dy = p.homeY - p.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) {
          p.cx = p.homeX;
          p.cy = p.homeY;
          p.returning = false;
        } else {
          p.cx += dx * 0.2;
          p.cy += dy * 0.2;
          needsAnim = true;
        }
      }
    }

    requestAnimationFrame(gameLoop);
  }

  function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  function hitTest(x, y) {
    // Test in reverse order so topmost piece is picked first
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (p.matched) continue;
      const dx = x - p.cx;
      const dy = y - p.cy;
      if (dx * dx + dy * dy < (p.r + 10) * (p.r + 10)) {
        return p;
      }
    }
    return null;
  }

  function onPointerDown(e) {
    e.preventDefault();
    const pos = getPointerPos(e);
    const piece = hitTest(pos.x, pos.y);
    if (piece) {
      dragging = piece;
      piece.returning = false;
      dragOffsetX = piece.cx - pos.x;
      dragOffsetY = piece.cy - pos.y;
      // Move to end of array so it draws on top
      const idx = pieces.indexOf(piece);
      pieces.splice(idx, 1);
      pieces.push(piece);
    }
  }

  function onPointerMove(e) {
    e.preventDefault();
    if (!dragging) return;
    const pos = getPointerPos(e);
    dragging.cx = pos.x + dragOffsetX;
    dragging.cy = pos.y + dragOffsetY;
  }

  function onPointerUp(e) {
    e.preventDefault();
    if (!dragging) return;

    // Check if dropped on matching target
    let snapped = false;
    for (const t of targets) {
      if (t.matched) continue;
      if (t.type === dragging.type) {
        const dx = dragging.cx - t.cx;
        const dy = dragging.cy - t.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < t.r + 20) {
          // Match!
          dragging.matched = true;
          t.matched = true;
          dragging.cx = t.cx;
          dragging.cy = t.cy;
          matched++;
          spawnMatchParticles(t.cx, t.cy, t.color);
          snapped = true;

          if (matched === SHAPE_TYPES.length) {
            setTimeout(() => {
              spawnCelebration();
              winScreen.style.display = 'flex';
              SimplespilStats.recordPlay('match');
            }, 400);
          }
          break;
        }
      }
    }

    if (!snapped) {
      // Return to home position
      dragging.returning = true;
    }

    dragging = null;
  }

  function startGame() {
    menu.style.display = 'none';
    game.style.display = 'flex';
    winScreen.style.display = 'none';

    resizeCanvas();

    pieces = [];
    targets = [];
    particles = [];
    celebrationParticles = [];
    matched = 0;
    dragging = null;

    layoutPositions();
    gameLoop();
  }

  // Event listeners
  startBtn.addEventListener('click', startGame);
  againBtn.addEventListener('click', startGame);

  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);

  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('touchend', onPointerUp, { passive: false });
  canvas.addEventListener('touchcancel', onPointerUp, { passive: false });

  window.addEventListener('resize', () => {
    if (game.style.display !== 'none') {
      resizeCanvas();
      // Re-layout only unmatched pieces and targets
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const r = shapeSize();
      const count = SHAPE_TYPES.length;
      const isPortrait = h > w;

      // Reposition targets
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        t.r = r;
        if (isPortrait) {
          const spacing = w / (count + 1);
          t.cx = spacing * (i + 1);
          t.cy = h * 0.25;
        } else {
          const spacing = h / (count + 1);
          t.cx = w * 0.25;
          t.cy = spacing * (i + 1);
        }
      }

      // Reposition unmatched pieces to their home spots
      const unmatchedPieces = pieces.filter(p => !p.matched);
      for (let i = 0; i < unmatchedPieces.length; i++) {
        const p = unmatchedPieces[i];
        p.r = r;
        if (isPortrait) {
          const spacing = w / (unmatchedPieces.length + 1);
          p.homeX = spacing * (i + 1);
          p.homeY = h * 0.75;
        } else {
          const spacing = h / (unmatchedPieces.length + 1);
          p.homeX = w * 0.75;
          p.homeY = spacing * (i + 1);
        }
        if (!dragging || dragging !== p) {
          p.cx = p.homeX;
          p.cy = p.homeY;
        }
      }

      // Reposition matched pieces on their targets
      for (const p of pieces) {
        if (!p.matched) continue;
        const t = targets.find(tg => tg.type === p.type);
        if (t) {
          p.cx = t.cx;
          p.cy = t.cy;
          p.r = r;
        }
      }
    }
  });
})();
