(() => {
  'use strict';

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const menu = document.getElementById('menu');
  const game = document.getElementById('game');
  const winScreen = document.getElementById('win-screen');
  const againBtn = document.getElementById('again-btn');
  const nextBtn = document.getElementById('next-btn');
  const levelsBtn = document.getElementById('levels-btn');

  // ─── Constants ───────────────────────────────────────────

  const ALL_COLORS = [
    '#e94560', '#3498db', '#4ecca3', '#f5c518', '#9b59b6', '#f39c12',
  ];

  const ALL_SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];

  const ALL_ANIMALS = ['cat', 'dog', 'fish', 'bird', 'bunny', 'frog'];

  const ALL_FRUITS = ['apple', 'banana', 'orange', 'grape', 'strawberry', 'cherry'];

  const FRUIT_COLORS = {
    apple: '#e94560',
    banana: '#f5c518',
    orange: '#f39c12',
    grape: '#9b59b6',
    strawberry: '#e94560',
    cherry: '#e94560',
  };

  const LEVEL_IDS = ['colors', 'shapes', 'animals', 'numbers', 'fruits', 'mix'];

  const DIFFICULTIES = {
    easy:   { count: 3, sizeScale: 1.3, scattered: false },
    normal: { count: 5, sizeScale: 1.0, scattered: false },
    hard:   { count: 6, sizeScale: 0.85, scattered: true },
  };

  // ─── State ───────────────────────────────────────────────

  let currentLevelIdx = 0;
  let currentDifficulty = 'normal';
  let pieces = [];
  let targets = [];
  let totalCount = 0;
  let dragging = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let matched = 0;
  let particles = [];
  let celebrationParticles = [];
  let animFrame = 0;
  let loopRunning = false;

  // ─── Canvas helpers ──────────────────────────────────────

  function resizeCanvas() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function shapeSize(count, scale) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const isPortrait = h > w;
    const span = isPortrait ? w : h;
    const maxPerItem = span / (count + 1);
    const base = Math.max(22, Math.min(70, maxPerItem * 0.65));
    return base * scale;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ─── Shape drawing ──────────────────────────────────────

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
        ctx.moveTo(cx, cy + r * 0.6);
        ctx.bezierCurveTo(cx - r * 1.2, cy - r * 0.2, cx - r * 0.6, cy - r, cx, cy - r * 0.4);
        ctx.bezierCurveTo(cx + r * 0.6, cy - r, cx + r * 1.2, cy - r * 0.2, cx, cy + r * 0.6);
        ctx.closePath();
        break;
      }

      case 'diamond':
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r * 0.65, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r * 0.65, cy);
        ctx.closePath();
        break;
    }

    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      if (type === 'circle') {
        ctx.ellipse(cx - r * 0.2, cy - r * 0.25, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
      } else {
        ctx.ellipse(cx, cy - r * 0.3, r * 0.3, r * 0.13, 0, 0, Math.PI * 2);
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

  // ─── Animal drawing ─────────────────────────────────────

  function drawAnimal(type, cx, cy, r, color, filled) {
    ctx.save();

    function apply() {
      if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    switch (type) {
      case 'cat': {
        // Head
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.1, r * 0.6, 0, Math.PI * 2);
        apply();
        // Left ear
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.5, cy - r * 0.2);
        ctx.lineTo(cx - r * 0.3, cy - r * 0.8);
        ctx.lineTo(cx - r * 0.08, cy - r * 0.3);
        ctx.closePath();
        apply();
        // Right ear
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.5, cy - r * 0.2);
        ctx.lineTo(cx + r * 0.3, cy - r * 0.8);
        ctx.lineTo(cx + r * 0.08, cy - r * 0.3);
        ctx.closePath();
        apply();
        if (filled) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - r * 0.2, cy + r * 0.03, r * 0.08, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.2, cy + r * 0.03, r * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.2, cy + r * 0.03, r * 0.04, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.2, cy + r * 0.03, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffb6c1';
          ctx.beginPath();
          ctx.moveTo(cx, cy + r * 0.18);
          ctx.lineTo(cx - r * 0.05, cy + r * 0.24);
          ctx.lineTo(cx + r * 0.05, cy + r * 0.24);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'dog': {
        // Head
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
        apply();
        // Left ear
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.5, cy + r * 0.05, r * 0.2, r * 0.4, -0.15, 0, Math.PI * 2);
        apply();
        // Right ear
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.5, cy + r * 0.05, r * 0.2, r * 0.4, 0.15, 0, Math.PI * 2);
        apply();
        if (filled) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - r * 0.18, cy - r * 0.1, r * 0.08, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.18, cy - r * 0.1, r * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.18, cy - r * 0.1, r * 0.04, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.18, cy - r * 0.1, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(cx, cy + r * 0.12, r * 0.09, r * 0.06, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'fish': {
        // Body
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.05, cy, r * 0.55, r * 0.35, 0, 0, Math.PI * 2);
        apply();
        // Tail
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.4, cy);
        ctx.lineTo(cx + r * 0.8, cy - r * 0.35);
        ctx.lineTo(cx + r * 0.8, cy + r * 0.35);
        ctx.closePath();
        apply();
        if (filled) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - r * 0.22, cy - r * 0.07, r * 0.07, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.22, cy - r * 0.07, r * 0.035, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'bird': {
        // Body
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.1, r * 0.45, 0, Math.PI * 2);
        apply();
        // Head
        ctx.beginPath();
        ctx.arc(cx + r * 0.2, cy - r * 0.3, r * 0.28, 0, Math.PI * 2);
        apply();
        // Beak
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.42, cy - r * 0.3);
        ctx.lineTo(cx + r * 0.75, cy - r * 0.25);
        ctx.lineTo(cx + r * 0.42, cy - r * 0.17);
        ctx.closePath();
        apply();
        if (filled) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx + r * 0.24, cy - r * 0.35, r * 0.055, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.1, cy + r * 0.08, r * 0.25, r * 0.15, -0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'bunny': {
        // Head
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.2, r * 0.5, 0, Math.PI * 2);
        apply();
        // Left ear
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.18, cy - r * 0.5, r * 0.12, r * 0.4, -0.1, 0, Math.PI * 2);
        apply();
        // Right ear
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.18, cy - r * 0.5, r * 0.12, r * 0.4, 0.1, 0, Math.PI * 2);
        apply();
        if (filled) {
          ctx.fillStyle = '#ffb6c1';
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.18, cy - r * 0.5, r * 0.06, r * 0.28, -0.1, 0, Math.PI * 2);
          ctx.ellipse(cx + r * 0.18, cy - r * 0.5, r * 0.06, r * 0.28, 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - r * 0.16, cy + r * 0.12, r * 0.07, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.16, cy + r * 0.12, r * 0.07, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.16, cy + r * 0.12, r * 0.035, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.16, cy + r * 0.12, r * 0.035, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffb6c1';
          ctx.beginPath();
          ctx.arc(cx, cy + r * 0.3, r * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'frog': {
        // Body
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.08, r * 0.5, r * 0.4, 0, 0, Math.PI * 2);
        apply();
        // Left eye bump
        ctx.beginPath();
        ctx.arc(cx - r * 0.28, cy - r * 0.3, r * 0.18, 0, Math.PI * 2);
        apply();
        // Right eye bump
        ctx.beginPath();
        ctx.arc(cx + r * 0.28, cy - r * 0.3, r * 0.18, 0, Math.PI * 2);
        apply();
        if (filled) {
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - r * 0.28, cy - r * 0.33, r * 0.09, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.28, cy - r * 0.33, r * 0.09, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.28, cy - r * 0.33, r * 0.045, 0, Math.PI * 2);
          ctx.arc(cx + r * 0.28, cy - r * 0.33, r * 0.045, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(cx, cy + r * 0.15, r * 0.25, 0.1, Math.PI - 0.1);
          ctx.stroke();
        }
        break;
      }
    }
    ctx.restore();
  }

  // ─── Fruit drawing ──────────────────────────────────────

  function drawFruit(type, cx, cy, r, color, filled) {
    ctx.save();

    function apply() {
      if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    switch (type) {
      case 'apple': {
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.05, r * 0.55, 0, Math.PI * 2);
        apply();
        if (filled) {
          ctx.strokeStyle = '#8B4513';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(cx, cy - r * 0.45);
          ctx.lineTo(cx + r * 0.05, cy - r * 0.7);
          ctx.stroke();
          ctx.fillStyle = '#4ecca3';
          ctx.beginPath();
          ctx.ellipse(cx + r * 0.13, cy - r * 0.6, r * 0.13, r * 0.06, 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(cx - r * 0.18, cy - r * 0.08, r * 0.13, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'banana': {
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.45, cy + r * 0.25);
        ctx.quadraticCurveTo(cx - r * 0.55, cy - r * 0.5, cx, cy - r * 0.45);
        ctx.quadraticCurveTo(cx + r * 0.35, cy - r * 0.4, cx + r * 0.45, cy - r * 0.05);
        ctx.quadraticCurveTo(cx + r * 0.25, cy - r * 0.15, cx, cy - r * 0.1);
        ctx.quadraticCurveTo(cx - r * 0.25, cy - r * 0.05, cx - r * 0.45, cy + r * 0.25);
        ctx.closePath();
        apply();
        if (filled) {
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.15, cy - r * 0.2, r * 0.25, r * 0.06, -0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'orange': {
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.05, r * 0.55, 0, Math.PI * 2);
        apply();
        if (filled) {
          ctx.fillStyle = '#4ecca3';
          ctx.beginPath();
          ctx.arc(cx, cy - r * 0.5, r * 0.07, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.beginPath();
          ctx.arc(cx - r * 0.13, cy - r * 0.08, r * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'grape': {
        const positions = [
          [0, -0.35], [-0.22, -0.08], [0.22, -0.08],
          [-0.3, 0.22], [0, 0.18], [0.3, 0.22],
          [-0.12, 0.45], [0.12, 0.45],
        ];
        for (const [ox, oy] of positions) {
          ctx.beginPath();
          ctx.arc(cx + r * ox, cy + r * oy, r * 0.18, 0, Math.PI * 2);
          apply();
        }
        if (filled) {
          ctx.strokeStyle = '#4ecca3';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(cx, cy - r * 0.5);
          ctx.lineTo(cx, cy - r * 0.7);
          ctx.stroke();
        }
        break;
      }

      case 'strawberry': {
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.65);
        ctx.quadraticCurveTo(cx - r * 0.6, cy + r * 0.1, cx - r * 0.4, cy - r * 0.2);
        ctx.quadraticCurveTo(cx - r * 0.15, cy - r * 0.5, cx, cy - r * 0.3);
        ctx.quadraticCurveTo(cx + r * 0.15, cy - r * 0.5, cx + r * 0.4, cy - r * 0.2);
        ctx.quadraticCurveTo(cx + r * 0.6, cy + r * 0.1, cx, cy + r * 0.65);
        ctx.closePath();
        apply();
        if (filled) {
          ctx.fillStyle = '#4ecca3';
          ctx.beginPath();
          ctx.moveTo(cx - r * 0.3, cy - r * 0.45);
          ctx.lineTo(cx - r * 0.08, cy - r * 0.3);
          ctx.lineTo(cx, cy - r * 0.5);
          ctx.lineTo(cx + r * 0.08, cy - r * 0.3);
          ctx.lineTo(cx + r * 0.3, cy - r * 0.45);
          ctx.lineTo(cx + r * 0.15, cy - r * 0.25);
          ctx.lineTo(cx - r * 0.15, cy - r * 0.25);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#f5c518';
          const seeds = [[-0.08, 0], [0.08, 0.05], [-0.12, 0.22], [0.12, 0.18], [0, 0.38]];
          for (const [sx, sy] of seeds) {
            ctx.beginPath();
            ctx.arc(cx + r * sx, cy + r * sy, r * 0.025, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'cherry': {
        ctx.beginPath();
        ctx.arc(cx - r * 0.22, cy + r * 0.15, r * 0.32, 0, Math.PI * 2);
        apply();
        ctx.beginPath();
        ctx.arc(cx + r * 0.22, cy + r * 0.15, r * 0.32, 0, Math.PI * 2);
        apply();
        if (filled) {
          ctx.strokeStyle = '#4ecca3';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(cx - r * 0.18, cy - r * 0.12);
          ctx.quadraticCurveTo(cx - r * 0.08, cy - r * 0.55, cx + r * 0.08, cy - r * 0.65);
          ctx.moveTo(cx + r * 0.18, cy - r * 0.12);
          ctx.quadraticCurveTo(cx + r * 0.12, cy - r * 0.45, cx + r * 0.08, cy - r * 0.65);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(cx - r * 0.3, cy + r * 0.05, r * 0.09, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
    }
    ctx.restore();
  }

  // ─── Digit drawing ──────────────────────────────────────

  function drawDigit(num, cx, cy, r, color, filled) {
    ctx.save();
    if (filled) {
      // Colored circle background
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      // White digit
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + (r * 1.0) + 'px ' + getComputedStyle(document.body).fontFamily;
      ctx.fillStyle = '#fff';
      ctx.fillText(String(num), cx, cy + r * 0.03);
    } else {
      // Dashed circle with faint number
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + (r * 1.0) + 'px ' + getComputedStyle(document.body).fontFamily;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.strokeText(String(num), cx, cy + r * 0.03);
    }
    ctx.restore();
  }

  // ─── Dot pattern drawing ────────────────────────────────

  function getDotPositions(count, spread) {
    switch (count) {
      case 1: return [[0, 0]];
      case 2: return [[-0.35, 0], [0.35, 0]];
      case 3: return [[0, -0.3], [-0.3, 0.2], [0.3, 0.2]];
      case 4: return [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]];
      case 5: return [[-0.3, -0.3], [0.3, -0.3], [0, 0], [-0.3, 0.3], [0.3, 0.3]];
      case 6: return [[-0.3, -0.35], [0.3, -0.35], [-0.3, 0], [0.3, 0], [-0.3, 0.35], [0.3, 0.35]];
      default: return [[0, 0]];
    }
  }

  function drawDots(count, cx, cy, r, color, filled) {
    ctx.save();
    const dotR = r * 0.12;
    const positions = getDotPositions(count, r * 0.5);

    // Container circle
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
    if (filled) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Dots
    for (const [dx, dy] of positions) {
      ctx.beginPath();
      ctx.arc(cx + r * dx, cy + r * dy, dotR, 0, Math.PI * 2);
      if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // ─── Item drawing dispatcher ────────────────────────────

  function drawItem(category, kind, cx, cy, r, color, filled) {
    switch (category) {
      case 'shape':  drawShape(kind, cx, cy, r, color, filled); break;
      case 'animal': drawAnimal(kind, cx, cy, r, color, filled); break;
      case 'fruit':  drawFruit(kind, cx, cy, r, color, filled); break;
      case 'digit':  drawDigit(kind, cx, cy, r, color, filled); break;
      case 'dots':   drawDots(kind, cx, cy, r, color, filled); break;
    }
  }

  // ─── Level generation ───────────────────────────────────

  function generateItems(levelId, count) {
    switch (levelId) {
      case 'colors': {
        const selected = shuffle(ALL_COLORS).slice(0, count);
        return selected.map(c => ({
          matchId: c,
          color: c,
          pieceCategory: 'shape', pieceKind: 'circle',
          targetCategory: 'shape', targetKind: 'circle',
        }));
      }

      case 'shapes': {
        const selected = shuffle(ALL_SHAPES).slice(0, count);
        return selected.map((s, i) => ({
          matchId: s,
          color: ALL_COLORS[i % ALL_COLORS.length],
          pieceCategory: 'shape', pieceKind: s,
          targetCategory: 'shape', targetKind: s,
        }));
      }

      case 'animals': {
        const selected = shuffle(ALL_ANIMALS).slice(0, count);
        return selected.map((a, i) => ({
          matchId: a,
          color: ALL_COLORS[i % ALL_COLORS.length],
          pieceCategory: 'animal', pieceKind: a,
          targetCategory: 'animal', targetKind: a,
        }));
      }

      case 'numbers': {
        const nums = shuffle([1, 2, 3, 4, 5, 6]).slice(0, count);
        return nums.map((n, i) => ({
          matchId: String(n),
          color: ALL_COLORS[i % ALL_COLORS.length],
          pieceCategory: 'digit', pieceKind: n,
          targetCategory: 'dots', targetKind: n,
        }));
      }

      case 'fruits': {
        const selected = shuffle(ALL_FRUITS).slice(0, count);
        return selected.map(f => ({
          matchId: f,
          color: FRUIT_COLORS[f],
          pieceCategory: 'fruit', pieceKind: f,
          targetCategory: 'fruit', targetKind: f,
        }));
      }

      case 'mix': {
        const combos = [];
        for (const s of ALL_SHAPES) {
          for (const c of ALL_COLORS) {
            combos.push({ shape: s, color: c });
          }
        }
        const selected = shuffle(combos).slice(0, count);
        return selected.map(item => ({
          matchId: item.shape + '_' + item.color,
          color: item.color,
          pieceCategory: 'shape', pieceKind: item.shape,
          targetCategory: 'shape', targetKind: item.shape,
        }));
      }

      default:
        return [];
    }
  }

  // ─── Layout ─────────────────────────────────────────────

  function generateScatteredPositions(count, r, isTarget, w, h, isPortrait) {
    let area;
    if (isPortrait) {
      const yRange = isTarget
        ? [r + 30, h * 0.43 - r]
        : [h * 0.57 + r, h - r - 20];
      area = { x1: r + 15, x2: w - r - 15, y1: yRange[0], y2: yRange[1] };
    } else {
      const xRange = isTarget
        ? [r + 30, w * 0.43 - r]
        : [w * 0.57 + r, w - r - 15];
      area = { x1: xRange[0], x2: xRange[1], y1: r + 15, y2: h - r - 15 };
    }

    const positions = [];
    const minSep = r * 0.6;

    for (let i = 0; i < count; i++) {
      let bestPos = null;
      let bestMinDist = -1;

      for (let attempt = 0; attempt < 60; attempt++) {
        const x = area.x1 + Math.random() * (area.x2 - area.x1);
        const y = area.y1 + Math.random() * (area.y2 - area.y1);

        let closest = Infinity;
        for (const pos of positions) {
          const dx = x - pos.x;
          const dy = y - pos.y;
          closest = Math.min(closest, Math.sqrt(dx * dx + dy * dy));
        }

        if (closest > bestMinDist) {
          bestMinDist = closest;
          bestPos = { x, y };
        }
        if (closest > minSep) break;
      }
      positions.push(bestPos);
    }
    return positions;
  }

  function createPiecesAndTargets(items, difficulty) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const diff = DIFFICULTIES[difficulty];
    const count = items.length;
    const r = shapeSize(count, diff.sizeScale);
    const isPortrait = h > w;

    targets = [];
    pieces = [];
    totalCount = count;

    const pieceOrder = shuffle([...Array(count).keys()]);

    if (diff.scattered) {
      const targetPositions = generateScatteredPositions(count, r, true, w, h, isPortrait);
      const piecePositions = generateScatteredPositions(count, r, false, w, h, isPortrait);

      for (let i = 0; i < count; i++) {
        const item = items[i];
        targets.push({
          matchId: item.matchId,
          color: item.color,
          category: item.targetCategory,
          kind: item.targetKind,
          cx: targetPositions[i].x,
          cy: targetPositions[i].y,
          r,
          matched: false,
        });
      }

      for (let i = 0; i < count; i++) {
        const si = pieceOrder[i];
        const item = items[si];
        pieces.push({
          matchId: item.matchId,
          color: item.color,
          category: item.pieceCategory,
          kind: item.pieceKind,
          cx: piecePositions[i].x,
          cy: piecePositions[i].y,
          homeX: piecePositions[i].x,
          homeY: piecePositions[i].y,
          r,
          matched: false,
        });
      }
    } else {
      // Neat row/column layout
      if (isPortrait) {
        const targetY = h * 0.25;
        const pieceY = h * 0.75;
        const spacing = w / (count + 1);

        for (let i = 0; i < count; i++) {
          const item = items[i];
          targets.push({
            matchId: item.matchId,
            color: item.color,
            category: item.targetCategory,
            kind: item.targetKind,
            cx: spacing * (i + 1),
            cy: targetY,
            r,
            matched: false,
          });
        }

        for (let i = 0; i < count; i++) {
          const si = pieceOrder[i];
          const item = items[si];
          pieces.push({
            matchId: item.matchId,
            color: item.color,
            category: item.pieceCategory,
            kind: item.pieceKind,
            cx: spacing * (i + 1),
            cy: pieceY,
            homeX: spacing * (i + 1),
            homeY: pieceY,
            r,
            matched: false,
          });
        }
      } else {
        const targetX = w * 0.25;
        const pieceX = w * 0.75;
        const spacing = h / (count + 1);

        for (let i = 0; i < count; i++) {
          const item = items[i];
          targets.push({
            matchId: item.matchId,
            color: item.color,
            category: item.targetCategory,
            kind: item.targetKind,
            cx: targetX,
            cy: spacing * (i + 1),
            r,
            matched: false,
          });
        }

        for (let i = 0; i < count; i++) {
          const si = pieceOrder[i];
          const item = items[si];
          pieces.push({
            matchId: item.matchId,
            color: item.color,
            category: item.pieceCategory,
            kind: item.pieceKind,
            cx: pieceX,
            cy: spacing * (i + 1),
            homeX: pieceX,
            homeY: spacing * (i + 1),
            r,
            matched: false,
          });
        }
      }
    }
  }

  // ─── Particles ──────────────────────────────────────────

  function spawnMatchParticles(cx, cy, color) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 3 + Math.random() * 4,
        color,
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

  // ─── Drawing ────────────────────────────────────────────

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

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Divider line
    const diff = DIFFICULTIES[currentDifficulty];
    if (!diff.scattered) {
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
    }

    // Draw targets
    for (const t of targets) {
      if (!t.matched) {
        drawTargetHint(t);
        drawItem(t.category, t.kind, t.cx, t.cy, t.r, t.color, false);
      } else {
        drawItem(t.category, t.kind, t.cx, t.cy, t.r, t.color, true);
      }
    }

    // Draw non-dragging pieces
    for (const p of pieces) {
      if (p.matched || p === dragging) continue;
      drawItem(p.category, p.kind, p.cx, p.cy, p.r, p.color, true);
    }

    // Draw dragging piece on top
    if (dragging) {
      ctx.save();
      ctx.shadowColor = dragging.color;
      ctx.shadowBlur = 20;
      drawItem(dragging.category, dragging.kind, dragging.cx, dragging.cy,
        dragging.r * 1.1, dragging.color, true);
      ctx.restore();
    }

    drawParticles();
    animFrame++;
  }

  // ─── Game loop ──────────────────────────────────────────

  function gameLoop() {
    if (!loopRunning) return;
    updateParticles();

    for (const p of pieces) {
      if (p.matched || p === dragging) continue;
      if (p.returning) {
        const dx = p.homeX - p.cx;
        const dy = p.homeY - p.cy;
        if (Math.sqrt(dx * dx + dy * dy) < 1) {
          p.cx = p.homeX;
          p.cy = p.homeY;
          p.returning = false;
        } else {
          p.cx += dx * 0.2;
          p.cy += dy * 0.2;
        }
      }
    }

    draw();
    requestAnimationFrame(gameLoop);
  }

  // ─── Input handling ─────────────────────────────────────

  function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  function hitTest(x, y) {
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (p.matched) continue;
      const dx = x - p.cx;
      const dy = y - p.cy;
      if (dx * dx + dy * dy < (p.r + 10) * (p.r + 10)) return p;
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

    let snapped = false;
    for (const t of targets) {
      if (t.matched) continue;
      if (t.matchId === dragging.matchId) {
        const dx = dragging.cx - t.cx;
        const dy = dragging.cy - t.cy;
        if (Math.sqrt(dx * dx + dy * dy) < t.r + 20) {
          dragging.matched = true;
          t.matched = true;
          dragging.cx = t.cx;
          dragging.cy = t.cy;
          matched++;
          spawnMatchParticles(t.cx, t.cy, t.color);
          snapped = true;

          if (matched === totalCount) {
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
      dragging.returning = true;
    }
    dragging = null;
  }

  // ─── Game flow ──────────────────────────────────────────

  function startGame() {
    menu.style.display = 'none';
    game.style.display = 'flex';
    winScreen.style.display = 'none';

    resizeCanvas();

    const diff = DIFFICULTIES[currentDifficulty];
    const levelId = LEVEL_IDS[currentLevelIdx];
    const items = generateItems(levelId, diff.count);

    pieces = [];
    targets = [];
    particles = [];
    celebrationParticles = [];
    matched = 0;
    dragging = null;

    createPiecesAndTargets(items, currentDifficulty);

    if (!loopRunning) {
      loopRunning = true;
      gameLoop();
    }
  }

  function goToMenu() {
    loopRunning = false;
    game.style.display = 'none';
    menu.style.display = 'flex';
    winScreen.style.display = 'none';
  }

  // ─── Event listeners ────────────────────────────────────

  againBtn.addEventListener('click', startGame);
  nextBtn.addEventListener('click', () => {
    currentLevelIdx = (currentLevelIdx + 1) % LEVEL_IDS.length;
    startGame();
  });
  levelsBtn.addEventListener('click', goToMenu);

  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);

  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('touchend', onPointerUp, { passive: false });
  canvas.addEventListener('touchcancel', onPointerUp, { passive: false });

  // ─── Resize handling ────────────────────────────────────

  window.addEventListener('resize', () => {
    if (game.style.display === 'none') return;
    resizeCanvas();

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const diff = DIFFICULTIES[currentDifficulty];
    const count = totalCount;
    const r = shapeSize(count, diff.sizeScale);
    const isPortrait = h > w;

    if (diff.scattered) {
      // Re-scatter on resize
      const targetPositions = generateScatteredPositions(count, r, true, w, h, isPortrait);
      const piecePositions = generateScatteredPositions(count, r, false, w, h, isPortrait);

      for (let i = 0; i < targets.length; i++) {
        targets[i].r = r;
        targets[i].cx = targetPositions[i].x;
        targets[i].cy = targetPositions[i].y;
      }

      const unmatchedPieces = pieces.filter(p => !p.matched);
      for (let i = 0; i < unmatchedPieces.length; i++) {
        const p = unmatchedPieces[i];
        p.r = r;
        p.homeX = piecePositions[i].x;
        p.homeY = piecePositions[i].y;
        if (!dragging || dragging !== p) {
          p.cx = p.homeX;
          p.cy = p.homeY;
        }
      }
    } else {
      // Neat layout
      if (isPortrait) {
        const spacing = w / (count + 1);
        for (let i = 0; i < targets.length; i++) {
          targets[i].r = r;
          targets[i].cx = spacing * (i + 1);
          targets[i].cy = h * 0.25;
        }

        const unmatchedPieces = pieces.filter(p => !p.matched);
        for (let i = 0; i < unmatchedPieces.length; i++) {
          const p = unmatchedPieces[i];
          p.r = r;
          const sp = w / (unmatchedPieces.length + 1);
          p.homeX = sp * (i + 1);
          p.homeY = h * 0.75;
          if (!dragging || dragging !== p) {
            p.cx = p.homeX;
            p.cy = p.homeY;
          }
        }
      } else {
        const spacing = h / (count + 1);
        for (let i = 0; i < targets.length; i++) {
          targets[i].r = r;
          targets[i].cx = w * 0.25;
          targets[i].cy = spacing * (i + 1);
        }

        const unmatchedPieces = pieces.filter(p => !p.matched);
        for (let i = 0; i < unmatchedPieces.length; i++) {
          const p = unmatchedPieces[i];
          p.r = r;
          const sp = h / (unmatchedPieces.length + 1);
          p.homeX = w * 0.75;
          p.homeY = sp * (i + 1);
          if (!dragging || dragging !== p) {
            p.cx = p.homeX;
            p.cy = p.homeY;
          }
        }
      }
    }

    // Snap matched pieces to their targets
    for (const p of pieces) {
      if (!p.matched) continue;
      const t = targets.find(tg => tg.matchId === p.matchId);
      if (t) {
        p.cx = t.cx;
        p.cy = t.cy;
        p.r = r;
      }
    }
  });

  // ─── Menu setup ─────────────────────────────────────────

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDifficulty = btn.dataset.diff;
    });
  });

  document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
      currentLevelIdx = parseInt(card.dataset.level, 10);
      startGame();
    });
  });

  // ─── Level card icons ───────────────────────────────────

  function drawLevelIcons() {
    const canvases = document.querySelectorAll('.level-icon-canvas');
    const dpr = window.devicePixelRatio || 1;

    canvases.forEach((c, idx) => {
      c.width = 60 * dpr;
      c.height = 60 * dpr;
      const lctx = c.getContext('2d');
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      switch (idx) {
        case 0: // Colors
          lctx.beginPath(); lctx.arc(15, 20, 10, 0, Math.PI * 2);
          lctx.fillStyle = '#e94560'; lctx.fill();
          lctx.beginPath(); lctx.arc(30, 38, 10, 0, Math.PI * 2);
          lctx.fillStyle = '#3498db'; lctx.fill();
          lctx.beginPath(); lctx.arc(45, 20, 10, 0, Math.PI * 2);
          lctx.fillStyle = '#4ecca3'; lctx.fill();
          break;

        case 1: // Shapes
          // Triangle
          lctx.beginPath();
          lctx.moveTo(15, 30); lctx.lineTo(25, 12); lctx.lineTo(5, 30);
          lctx.closePath(); lctx.fillStyle = '#3498db'; lctx.fill();
          // Star
          drawMiniStar(lctx, 42, 22, 12, '#f5c518');
          // Square
          lctx.fillStyle = '#e94560';
          lctx.fillRect(20, 36, 16, 16);
          break;

        case 2: // Animals
          // Mini cat face
          lctx.beginPath(); lctx.arc(30, 34, 14, 0, Math.PI * 2);
          lctx.fillStyle = '#4ecca3'; lctx.fill();
          lctx.beginPath();
          lctx.moveTo(19, 26); lctx.lineTo(23, 14); lctx.lineTo(27, 26); lctx.closePath();
          lctx.fill();
          lctx.beginPath();
          lctx.moveTo(41, 26); lctx.lineTo(37, 14); lctx.lineTo(33, 26); lctx.closePath();
          lctx.fill();
          lctx.fillStyle = '#fff';
          lctx.beginPath(); lctx.arc(25, 32, 3, 0, Math.PI * 2); lctx.fill();
          lctx.beginPath(); lctx.arc(35, 32, 3, 0, Math.PI * 2); lctx.fill();
          lctx.fillStyle = '#ffb6c1';
          lctx.beginPath();
          lctx.moveTo(30, 37); lctx.lineTo(28, 40); lctx.lineTo(32, 40); lctx.closePath();
          lctx.fill();
          break;

        case 3: // Numbers
          lctx.textAlign = 'center';
          lctx.textBaseline = 'middle';
          lctx.font = 'bold 18px sans-serif';
          lctx.fillStyle = '#e94560'; lctx.fillText('1', 12, 24);
          lctx.fillStyle = '#3498db'; lctx.fillText('2', 30, 24);
          lctx.fillStyle = '#4ecca3'; lctx.fillText('3', 48, 24);
          // Dots below
          lctx.fillStyle = '#f5c518';
          lctx.beginPath(); lctx.arc(12, 44, 3, 0, Math.PI * 2); lctx.fill();
          lctx.beginPath(); lctx.arc(26, 44, 3, 0, Math.PI * 2); lctx.fill();
          lctx.beginPath(); lctx.arc(34, 44, 3, 0, Math.PI * 2); lctx.fill();
          lctx.beginPath(); lctx.arc(44, 40, 3, 0, Math.PI * 2); lctx.fill();
          lctx.beginPath(); lctx.arc(48, 46, 3, 0, Math.PI * 2); lctx.fill();
          lctx.beginPath(); lctx.arc(52, 40, 3, 0, Math.PI * 2); lctx.fill();
          break;

        case 4: // Fruits
          // Apple
          lctx.beginPath(); lctx.arc(20, 32, 12, 0, Math.PI * 2);
          lctx.fillStyle = '#e94560'; lctx.fill();
          lctx.strokeStyle = '#8B4513'; lctx.lineWidth = 1.5;
          lctx.beginPath(); lctx.moveTo(20, 21); lctx.lineTo(21, 16); lctx.stroke();
          lctx.fillStyle = '#4ecca3';
          lctx.beginPath(); lctx.ellipse(24, 17, 4, 2, 0.5, 0, Math.PI * 2); lctx.fill();
          // Banana
          lctx.fillStyle = '#f5c518';
          lctx.beginPath();
          lctx.moveTo(38, 42);
          lctx.quadraticCurveTo(35, 22, 44, 18);
          lctx.quadraticCurveTo(50, 20, 50, 30);
          lctx.quadraticCurveTo(48, 28, 44, 26);
          lctx.quadraticCurveTo(40, 28, 38, 42);
          lctx.closePath(); lctx.fill();
          break;

        case 5: // Mix
          drawMiniStar(lctx, 20, 24, 12, '#e94560');
          lctx.beginPath();
          lctx.moveTo(45, 42);
          lctx.bezierCurveTo(33, 30, 39, 18, 45, 24);
          lctx.bezierCurveTo(51, 18, 57, 30, 45, 42);
          lctx.closePath();
          lctx.fillStyle = '#3498db'; lctx.fill();
          lctx.fillStyle = '#f5c518';
          lctx.fillRect(10, 40, 14, 14);
          break;
      }
    });
  }

  function drawMiniStar(lctx, cx, cy, r, color) {
    lctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = (i * Math.PI) / 5 - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.4;
      const x = cx + Math.cos(rad) * rr;
      const y = cy + Math.sin(rad) * rr;
      if (i === 0) lctx.moveTo(x, y);
      else lctx.lineTo(x, y);
    }
    lctx.closePath();
    lctx.fillStyle = color;
    lctx.fill();
  }

  drawLevelIcons();
})();
