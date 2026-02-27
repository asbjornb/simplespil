(() => {
  'use strict';

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const menu = document.getElementById('menu');
  const game = document.getElementById('game');
  const winScreen = document.getElementById('win-screen');
  const startBtn = document.getElementById('start-btn');
  const againBtn = document.getElementById('again-btn');
  const nextBtn = document.getElementById('next-btn');
  const menuBtn = document.getElementById('menu-btn');

  // ─── Level & difficulty config ───────────────────────────────

  const LEVEL_ORDER = ['colors', 'shapes', 'animals', 'numbers', 'sizes', 'fruits'];

  const COLORS = {
    red: '#e94560',
    blue: '#3498db',
    green: '#4ecca3',
    yellow: '#f5c518',
    purple: '#9b59b6',
    orange: '#f39c12',
    pink: '#e91e8f',
  };

  const DIFFICULTY = {
    easy:   { count: 3, overlap: false },
    normal: { count: 5, overlap: false },
    hard:   { count: 6, overlap: true },
  };

  let selectedLevel = 'colors';
  let selectedDiff = 'easy';

  // ─── Game state ──────────────────────────────────────────────

  let pieces = [];
  let targets = [];
  let dragging = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let matched = 0;
  let totalCount = 0;
  let particles = [];
  let celebrationParticles = [];
  let animFrame = 0;
  let running = false;

  // ─── Canvas helpers ──────────────────────────────────────────

  function resizeCanvas() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function shapeSize(count) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const min = Math.min(w, h);
    return Math.max(30, Math.min(80, min / (count + 2)));
  }

  // ─── Shape drawing ───────────────────────────────────────────

  function drawBasicShape(type, cx, cy, r) {
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
      case 'heart':
        ctx.moveTo(cx, cy + r * 0.6);
        ctx.bezierCurveTo(cx - r * 1.2, cy - r * 0.2, cx - r * 0.6, cy - r, cx, cy - r * 0.4);
        ctx.bezierCurveTo(cx + r * 0.6, cy - r, cx + r * 1.2, cy - r * 0.2, cx, cy + r * 0.6);
        ctx.closePath();
        break;
      case 'diamond':
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r * 0.7, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r * 0.7, cy);
        ctx.closePath();
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      case 'cross': {
        const t = r * 0.3;
        ctx.moveTo(cx - t, cy - r);
        ctx.lineTo(cx + t, cy - r);
        ctx.lineTo(cx + t, cy - t);
        ctx.lineTo(cx + r, cy - t);
        ctx.lineTo(cx + r, cy + t);
        ctx.lineTo(cx + t, cy + t);
        ctx.lineTo(cx + t, cy + r);
        ctx.lineTo(cx - t, cy + r);
        ctx.lineTo(cx - t, cy + t);
        ctx.lineTo(cx - r, cy + t);
        ctx.lineTo(cx - r, cy - t);
        ctx.lineTo(cx - t, cy - t);
        ctx.closePath();
        break;
      }
    }
  }

  // Draw animal silhouettes
  function drawAnimal(type, cx, cy, r, color, filled) {
    ctx.save();
    if (filled) {
      ctx.fillStyle = color;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
    }

    switch (type) {
      case 'cat':
        // Body
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.15, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.45, r * 0.38, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Ears
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.35, cy - r * 0.65);
        ctx.lineTo(cx - r * 0.15, cy - r * 0.95);
        ctx.lineTo(cx - r * 0.05, cy - r * 0.6);
        ctx.closePath();
        if (filled) ctx.fill(); else ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.35, cy - r * 0.65);
        ctx.lineTo(cx + r * 0.15, cy - r * 0.95);
        ctx.lineTo(cx + r * 0.05, cy - r * 0.6);
        ctx.closePath();
        if (filled) ctx.fill(); else ctx.stroke();
        // Tail
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.lineWidth = filled ? 3 : 3;
        if (filled) { ctx.strokeStyle = color; }
        ctx.moveTo(cx + r * 0.55, cy + r * 0.1);
        ctx.quadraticCurveTo(cx + r, cy - r * 0.5, cx + r * 0.7, cy - r * 0.6);
        ctx.stroke();
        if (filled) {
          // Eyes
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.14, cy - r * 0.5, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(cx + r * 0.14, cy - r * 0.5, r * 0.07, r * 0.09, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.14, cy - r * 0.48, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + r * 0.14, cy - r * 0.48, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'dog':
        // Body
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.2, r * 0.65, r * 0.45, 0, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.4, r * 0.4, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Floppy ears
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.45, cy - r * 0.25, r * 0.15, r * 0.3, 0.3, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.45, cy - r * 0.25, r * 0.15, r * 0.3, -0.3, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Snout
        ctx.beginPath();
        ctx.ellipse(cx, cy - r * 0.25, r * 0.18, r * 0.12, 0, 0, Math.PI * 2);
        if (filled) { ctx.fillStyle = lighten(color, 30); ctx.fill(); } else ctx.stroke();
        if (filled) {
          // Eyes
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - r * 0.15, cy - r * 0.5, r * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + r * 0.15, cy - r * 0.5, r * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.15, cy - r * 0.48, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + r * 0.15, cy - r * 0.48, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
          // Nose
          ctx.beginPath();
          ctx.arc(cx, cy - r * 0.28, r * 0.06, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'fish':
        // Body
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.1, cy, r * 0.65, r * 0.4, 0, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Tail
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.45, cy);
        ctx.lineTo(cx + r, cy - r * 0.45);
        ctx.lineTo(cx + r, cy + r * 0.45);
        ctx.closePath();
        if (filled) ctx.fill(); else ctx.stroke();
        if (filled) {
          // Eye
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - r * 0.35, cy - r * 0.08, r * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.33, cy - r * 0.07, r * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'bird':
        // Body
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.1, r * 0.55, r * 0.4, -0.2, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.28, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Beak
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.6, cy - r * 0.35);
        ctx.lineTo(cx - r * 0.9, cy - r * 0.25);
        ctx.lineTo(cx - r * 0.55, cy - r * 0.22);
        ctx.closePath();
        if (filled) { ctx.fillStyle = '#f39c12'; ctx.fill(); } else ctx.stroke();
        // Wing
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.1, cy, r * 0.35, r * 0.2, -0.5, 0, Math.PI * 2);
        if (filled) { ctx.fillStyle = lighten(color, 20); ctx.fill(); } else ctx.stroke();
        if (filled) {
          // Eye
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - r * 0.42, cy - r * 0.42, r * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.41, cy - r * 0.41, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'bunny':
        // Body
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.25, r * 0.5, r * 0.45, 0, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.3, r * 0.35, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Ears
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.18, cy - r * 0.8, r * 0.1, r * 0.3, -0.1, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.18, cy - r * 0.8, r * 0.1, r * 0.3, 0.1, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        if (filled) {
          // Inner ears
          ctx.fillStyle = '#e91e8f';
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.18, cy - r * 0.78, r * 0.05, r * 0.2, -0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(cx + r * 0.18, cy - r * 0.78, r * 0.05, r * 0.2, 0.1, 0, Math.PI * 2);
          ctx.fill();
          // Eyes
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(cx - r * 0.12, cy - r * 0.35, r * 0.07, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + r * 0.12, cy - r * 0.35, r * 0.07, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx - r * 0.12, cy - r * 0.33, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + r * 0.12, cy - r * 0.33, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
          // Nose
          ctx.fillStyle = '#e91e8f';
          ctx.beginPath();
          ctx.ellipse(cx, cy - r * 0.22, r * 0.05, r * 0.035, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'turtle':
        // Shell
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 0.6, r * 0.45, 0, Math.PI, 0);
        ctx.ellipse(cx, cy, r * 0.6, r * 0.15, 0, 0, Math.PI);
        if (filled) ctx.fill(); else ctx.stroke();
        // Shell pattern
        if (filled) {
          ctx.fillStyle = lighten(color, 20);
          ctx.beginPath();
          ctx.ellipse(cx, cy - r * 0.1, r * 0.3, r * 0.2, 0, Math.PI, 0);
          ctx.fill();
        }
        // Head
        ctx.beginPath();
        ctx.arc(cx + r * 0.7, cy + r * 0.05, r * 0.2, 0, Math.PI * 2);
        if (filled) { ctx.fillStyle = lighten(color, 15); ctx.fill(); } else ctx.stroke();
        // Legs
        const legPositions = [[-0.35, 0.25], [0.35, 0.25], [-0.45, 0.1], [0.45, 0.1]];
        for (const [lx, ly] of legPositions) {
          ctx.beginPath();
          ctx.ellipse(cx + r * lx, cy + r * ly, r * 0.1, r * 0.15, lx < 0 ? 0.3 : -0.3, 0, Math.PI * 2);
          if (filled) ctx.fill(); else ctx.stroke();
        }
        if (filled) {
          // Eye
          ctx.fillStyle = '#1a1a2e';
          ctx.beginPath();
          ctx.arc(cx + r * 0.75, cy - r * 0.02, r * 0.04, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  // Draw fruit shapes
  function drawFruit(type, cx, cy, r, color, filled) {
    ctx.save();
    if (filled) {
      ctx.fillStyle = color;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
    }

    switch (type) {
      case 'apple':
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.7);
        ctx.bezierCurveTo(cx - r * 0.9, cy + r * 0.7, cx - r * 0.9, cy - r * 0.4, cx, cy - r * 0.3);
        ctx.bezierCurveTo(cx + r * 0.9, cy - r * 0.4, cx + r * 0.9, cy + r * 0.7, cx, cy + r * 0.7);
        if (filled) ctx.fill(); else ctx.stroke();
        // Stem
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = filled ? '#5d4037' : color;
        ctx.lineWidth = 2;
        ctx.moveTo(cx, cy - r * 0.3);
        ctx.quadraticCurveTo(cx + r * 0.15, cy - r * 0.6, cx + r * 0.05, cy - r * 0.75);
        ctx.stroke();
        // Leaf
        if (filled) {
          ctx.fillStyle = '#4ecca3';
          ctx.beginPath();
          ctx.ellipse(cx + r * 0.2, cy - r * 0.55, r * 0.18, r * 0.08, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'banana':
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.5, cy - r * 0.6);
        ctx.quadraticCurveTo(cx + r * 0.8, cy - r * 0.3, cx + r * 0.4, cy + r * 0.6);
        ctx.quadraticCurveTo(cx + r * 0.1, cy + r * 0.5, cx - r * 0.1, cy + r * 0.3);
        ctx.quadraticCurveTo(cx + r * 0.3, cy, cx - r * 0.5, cy - r * 0.6);
        ctx.closePath();
        if (filled) ctx.fill(); else ctx.stroke();
        break;

      case 'orange':
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.05, r * 0.65, 0, Math.PI * 2);
        if (filled) ctx.fill(); else ctx.stroke();
        // Stem nub
        if (filled) {
          ctx.fillStyle = '#4ecca3';
          ctx.beginPath();
          ctx.arc(cx, cy - r * 0.6, r * 0.1, 0, Math.PI * 2);
          ctx.fill();
        }
        // Texture dots
        if (filled) {
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          for (let i = 0; i < 5; i++) {
            const a = Math.PI * 2 * i / 5;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * r * 0.3, cy + r * 0.05 + Math.sin(a) * r * 0.3, r * 0.05, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case 'grape':
        // Cluster of circles
        const grapePositions = [
          [0, -0.3], [-0.25, -0.05], [0.25, -0.05],
          [-0.35, 0.25], [0, 0.2], [0.35, 0.25],
          [-0.15, 0.5], [0.15, 0.5],
        ];
        for (const [gx, gy] of grapePositions) {
          ctx.beginPath();
          ctx.arc(cx + r * gx, cy + r * gy, r * 0.2, 0, Math.PI * 2);
          if (filled) ctx.fill(); else ctx.stroke();
        }
        // Stem
        if (filled) {
          ctx.strokeStyle = '#5d4037';
          ctx.setLineDash([]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy - r * 0.5);
          ctx.lineTo(cx, cy - r * 0.8);
          ctx.stroke();
        }
        break;

      case 'strawberry':
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.8);
        ctx.bezierCurveTo(cx - r * 0.7, cy + r * 0.1, cx - r * 0.55, cy - r * 0.5, cx, cy - r * 0.45);
        ctx.bezierCurveTo(cx + r * 0.55, cy - r * 0.5, cx + r * 0.7, cy + r * 0.1, cx, cy + r * 0.8);
        if (filled) ctx.fill(); else ctx.stroke();
        // Leaves
        if (filled) {
          ctx.fillStyle = '#4ecca3';
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.2, cy - r * 0.5, r * 0.2, r * 0.08, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(cx + r * 0.2, cy - r * 0.5, r * 0.2, r * 0.08, 0.4, 0, Math.PI * 2);
          ctx.fill();
          // Seeds
          ctx.fillStyle = '#f5c518';
          const seedPos = [[0, 0], [-0.2, -0.15], [0.2, -0.15], [-0.15, 0.2], [0.15, 0.2], [0, 0.4]];
          for (const [sx, sy] of seedPos) {
            ctx.beginPath();
            ctx.ellipse(cx + r * sx, cy + r * sy, r * 0.035, r * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case 'watermelon':
        // Slice shape
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.2, r * 0.7, Math.PI, 0);
        ctx.lineTo(cx + r * 0.7, cy + r * 0.2);
        ctx.lineTo(cx - r * 0.7, cy + r * 0.2);
        ctx.closePath();
        if (filled) ctx.fill(); else ctx.stroke();
        // Rind
        if (filled) {
          ctx.fillStyle = '#4ecca3';
          ctx.beginPath();
          ctx.arc(cx, cy + r * 0.2, r * 0.7, Math.PI, 0);
          ctx.arc(cx, cy + r * 0.2, r * 0.55, 0, Math.PI, true);
          ctx.closePath();
          ctx.fill();
          // Seeds
          ctx.fillStyle = '#1a1a2e';
          const seedAngles = [0.25, 0.4, 0.55, 0.65, 0.8];
          for (const a of seedAngles) {
            const sa = Math.PI + a * Math.PI;
            ctx.beginPath();
            ctx.ellipse(
              cx + Math.cos(sa) * r * 0.35,
              cy + r * 0.2 + Math.sin(sa) * r * 0.35,
              r * 0.03, r * 0.06, sa, 0, Math.PI * 2
            );
            ctx.fill();
          }
        }
        break;
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  // Draw a number digit
  function drawNumber(num, cx, cy, r, color, filled) {
    ctx.save();
    if (filled) {
      ctx.fillStyle = color;
      ctx.font = `bold ${r * 1.4}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(num), cx, cy);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.font = `bold ${r * 1.4}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(String(num), cx, cy);
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // Draw dot count
  function drawDots(num, cx, cy, r, color, filled) {
    ctx.save();
    const dotR = r * 0.15;
    const positions = getDotPositions(num, cx, cy, r * 0.55);

    for (const [dx, dy] of positions) {
      ctx.beginPath();
      ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
      if (filled) {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
      }
    }

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
    if (filled) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  function getDotPositions(num, cx, cy, spread) {
    switch (num) {
      case 1: return [[cx, cy]];
      case 2: return [[cx - spread * 0.4, cy], [cx + spread * 0.4, cy]];
      case 3: return [[cx, cy - spread * 0.4], [cx - spread * 0.35, cy + spread * 0.3], [cx + spread * 0.35, cy + spread * 0.3]];
      case 4: return [[cx - spread * 0.35, cy - spread * 0.35], [cx + spread * 0.35, cy - spread * 0.35], [cx - spread * 0.35, cy + spread * 0.35], [cx + spread * 0.35, cy + spread * 0.35]];
      case 5: return [[cx - spread * 0.35, cy - spread * 0.35], [cx + spread * 0.35, cy - spread * 0.35], [cx, cy], [cx - spread * 0.35, cy + spread * 0.35], [cx + spread * 0.35, cy + spread * 0.35]];
      case 6: return [[cx - spread * 0.35, cy - spread * 0.4], [cx + spread * 0.35, cy - spread * 0.4], [cx - spread * 0.35, cy], [cx + spread * 0.35, cy], [cx - spread * 0.35, cy + spread * 0.4], [cx + spread * 0.35, cy + spread * 0.4]];
      default: return [[cx, cy]];
    }
  }

  // Draw size shapes (same shape but different sizes)
  function drawSizeShape(sizeIdx, cx, cy, r, color, filled) {
    const scale = 0.4 + sizeIdx * 0.2; // 0.4, 0.6, 0.8, 1.0, 1.2, 1.4
    const sr = r * scale;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, sr, 0, Math.PI * 2);
    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.ellipse(cx - sr * 0.2, cy - sr * 0.25, sr * 0.3, sr * 0.15, -0.4, 0, Math.PI * 2);
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

  // Generic draw for any shape with filled/outline support
  function drawShape(type, cx, cy, r, color, filled) {
    ctx.save();
    ctx.beginPath();
    drawBasicShape(type, cx, cy, r);

    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
      // Shine highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      if (type === 'circle') {
        ctx.ellipse(cx - r * 0.2, cy - r * 0.25, r * 0.35, r * 0.2, -0.4, 0, Math.PI * 2);
      } else {
        ctx.ellipse(cx, cy - r * 0.3, r * 0.35, r * 0.15, 0, 0, Math.PI * 2);
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

  function lighten(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r},${g},${b})`;
  }

  // ─── Universal draw dispatcher ───────────────────────────────

  function drawItem(item, cx, cy, r, filled) {
    switch (item.level) {
      case 'colors':
        drawShape('circle', cx, cy, r, item.color, filled);
        break;
      case 'shapes':
        drawShape(item.shapeType, cx, cy, r, item.color, filled);
        break;
      case 'animals':
        drawAnimal(item.shapeType, cx, cy, r, item.color, filled);
        break;
      case 'numbers':
        if (item.isPiece) {
          drawNumber(item.num, cx, cy, r, item.color, filled);
        } else {
          drawDots(item.num, cx, cy, r, item.color, filled);
        }
        break;
      case 'sizes':
        drawSizeShape(item.sizeIdx, cx, cy, r, item.color, filled);
        break;
      case 'fruits':
        drawFruit(item.shapeType, cx, cy, r, item.color, filled);
        break;
    }
  }

  // ─── Level item generators ───────────────────────────────────

  const ANIMAL_TYPES = ['cat', 'dog', 'fish', 'bird', 'bunny', 'turtle'];
  const ANIMAL_COLORS = [COLORS.orange, COLORS.blue, COLORS.green, COLORS.red, COLORS.pink, COLORS.green];

  const SHAPE_TYPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'hexagon', 'cross'];
  const SHAPE_COLORS_LIST = [COLORS.red, COLORS.blue, COLORS.green, COLORS.yellow, COLORS.purple, COLORS.orange, COLORS.pink, COLORS.green];

  const FRUIT_TYPES = ['apple', 'banana', 'orange', 'grape', 'strawberry', 'watermelon'];
  const FRUIT_COLORS_LIST = [COLORS.red, '#f5c518', COLORS.orange, COLORS.purple, COLORS.red, COLORS.green];

  const COLOR_NAMES = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];
  const COLOR_VALUES = [COLORS.red, COLORS.blue, COLORS.green, COLORS.yellow, COLORS.purple, COLORS.orange, COLORS.pink];

  const SIZE_COLORS = [COLORS.red, COLORS.blue, COLORS.green, COLORS.yellow, COLORS.purple, COLORS.orange];

  function generateLevelItems(level, count) {
    const items = [];
    switch (level) {
      case 'colors':
        for (let i = 0; i < count; i++) {
          items.push({ level, id: COLOR_NAMES[i], color: COLOR_VALUES[i] });
        }
        break;
      case 'shapes':
        for (let i = 0; i < count; i++) {
          items.push({ level, id: SHAPE_TYPES[i], shapeType: SHAPE_TYPES[i], color: SHAPE_COLORS_LIST[i] });
        }
        break;
      case 'animals':
        for (let i = 0; i < count; i++) {
          items.push({ level, id: ANIMAL_TYPES[i], shapeType: ANIMAL_TYPES[i], color: ANIMAL_COLORS[i] });
        }
        break;
      case 'numbers':
        for (let i = 0; i < count; i++) {
          const num = i + 1;
          items.push({ level, id: String(num), num, color: COLOR_VALUES[i] });
        }
        break;
      case 'sizes':
        for (let i = 0; i < count; i++) {
          items.push({ level, id: String(i), sizeIdx: i, color: SIZE_COLORS[i] });
        }
        break;
      case 'fruits':
        for (let i = 0; i < count; i++) {
          items.push({ level, id: FRUIT_TYPES[i], shapeType: FRUIT_TYPES[i], color: FRUIT_COLORS_LIST[i] });
        }
        break;
    }
    return items;
  }

  // ─── Layout ──────────────────────────────────────────────────

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function layoutPositions(overlap) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const count = totalCount;
    const r = shapeSize(count);
    const isPortrait = h > w;

    targets.length = 0;
    const items = generateLevelItems(selectedLevel, count);
    const shuffledIndices = shuffle(Array.from({ length: count }, (_, i) => i));

    if (overlap) {
      // Hard mode: scatter everything randomly, pieces and targets intermixed
      const margin = r * 1.5;
      const positions = [];

      // Generate non-colliding positions for all items (targets + pieces)
      for (let i = 0; i < count * 2; i++) {
        let tries = 0;
        let px, py;
        do {
          px = margin + Math.random() * (w - margin * 2);
          py = margin + Math.random() * (h - margin * 2);
          tries++;
        } while (tries < 100 && positions.some(p => Math.hypot(p[0] - px, p[1] - py) < r * 1.8));
        positions.push([px, py]);
      }

      // First half = targets, second half = pieces
      for (let i = 0; i < count; i++) {
        const item = items[i];
        targets.push({
          ...item,
          cx: positions[i][0],
          cy: positions[i][1],
          r,
          matched: false,
        });
      }

      for (let i = 0; i < count; i++) {
        const si = shuffledIndices[i];
        const item = items[si];
        const pos = positions[count + i];
        pieces.push({
          ...item,
          isPiece: true,
          cx: pos[0],
          cy: pos[1],
          homeX: pos[0],
          homeY: pos[1],
          r,
          matched: false,
        });
      }
    } else {
      // Easy/normal: separated halves
      if (isPortrait) {
        const targetY = h * 0.25;
        const pieceY = h * 0.75;
        const spacing = w / (count + 1);

        for (let i = 0; i < count; i++) {
          const item = items[i];
          targets.push({
            ...item,
            cx: spacing * (i + 1),
            cy: targetY,
            r,
            matched: false,
          });
        }

        for (let i = 0; i < count; i++) {
          const si = shuffledIndices[i];
          const item = items[si];
          pieces.push({
            ...item,
            isPiece: true,
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
            ...item,
            cx: targetX,
            cy: spacing * (i + 1),
            r,
            matched: false,
          });
        }

        for (let i = 0; i < count; i++) {
          const si = shuffledIndices[i];
          const item = items[si];
          pieces.push({
            ...item,
            isPiece: true,
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

  // ─── Particles ───────────────────────────────────────────────

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
    const colors = [COLORS.red, COLORS.yellow, COLORS.green, COLORS.blue, COLORS.purple, COLORS.orange];
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

  // ─── Target hint pulse ───────────────────────────────────────

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

  // ─── Main draw ───────────────────────────────────────────────

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Divider line (only in non-overlap mode)
    if (!DIFFICULTY[selectedDiff].overlap) {
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
        drawItem(t, t.cx, t.cy, t.r, false);
      } else {
        drawItem(t, t.cx, t.cy, t.r, true);
      }
    }

    // Draw pieces (non-dragging first)
    for (const p of pieces) {
      if (p.matched || p === dragging) continue;
      drawItem(p, p.cx, p.cy, p.r, true);
    }

    // Draw dragging piece last (on top)
    if (dragging) {
      ctx.save();
      ctx.shadowColor = dragging.color;
      ctx.shadowBlur = 20;
      drawItem(dragging, dragging.cx, dragging.cy, dragging.r * 1.1, true);
      ctx.restore();
    }

    drawParticles();
    animFrame++;
  }

  // ─── Game loop ───────────────────────────────────────────────

  function gameLoop() {
    if (!running) return;
    updateParticles();
    draw();

    // Animate pieces returning home
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
        }
      }
    }

    requestAnimationFrame(gameLoop);
  }

  // ─── Pointer handling ────────────────────────────────────────

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
      if (t.id === dragging.id) {
        const dx = dragging.cx - t.cx;
        const dy = dragging.cy - t.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < t.r + 20) {
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
              // Hide "Next Level" if on last level
              const levelIdx = LEVEL_ORDER.indexOf(selectedLevel);
              nextBtn.style.display = levelIdx < LEVEL_ORDER.length - 1 ? '' : 'none';
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

  // ─── Game start / navigation ─────────────────────────────────

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

    const diff = DIFFICULTY[selectedDiff];
    totalCount = diff.count;
    layoutPositions(diff.overlap);

    running = true;
    gameLoop();
  }

  function goToMenu() {
    running = false;
    game.style.display = 'none';
    menu.style.display = 'flex';
    winScreen.style.display = 'none';
  }

  function nextLevel() {
    const idx = LEVEL_ORDER.indexOf(selectedLevel);
    if (idx < LEVEL_ORDER.length - 1) {
      selectedLevel = LEVEL_ORDER[idx + 1];
      // Update UI selection
      document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
      const card = document.querySelector(`.level-card[data-level="${selectedLevel}"]`);
      if (card) card.classList.add('selected');
    }
    startGame();
  }

  // ─── Menu UI ─────────────────────────────────────────────────

  // Level card selection
  document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedLevel = card.dataset.level;
    });
  });

  // Difficulty selection
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDiff = btn.dataset.diff;
    });
  });

  startBtn.addEventListener('click', startGame);
  againBtn.addEventListener('click', startGame);
  nextBtn.addEventListener('click', nextLevel);
  menuBtn.addEventListener('click', goToMenu);

  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('touchend', onPointerUp, { passive: false });
  canvas.addEventListener('touchcancel', onPointerUp, { passive: false });

  // ─── Resize handling ─────────────────────────────────────────

  window.addEventListener('resize', () => {
    if (game.style.display === 'none') return;
    resizeCanvas();
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const r = shapeSize(totalCount);
    const count = totalCount;
    const isPortrait = h > w;
    const overlap = DIFFICULTY[selectedDiff].overlap;

    if (overlap) {
      // In overlap mode, just rescale radius - positions stay relative
      for (const t of targets) t.r = r;
      for (const p of pieces) p.r = r;
    } else {
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

      for (const p of pieces) {
        if (!p.matched) continue;
        const t = targets.find(tg => tg.id === p.id);
        if (t) {
          p.cx = t.cx;
          p.cy = t.cy;
          p.r = r;
        }
      }
    }
  });

  // ─── Level selector icons ───────────────────────────────────

  function drawMenuIcons() {
    // Colors icon
    const colorsCanvas = document.getElementById('icon-colors');
    if (colorsCanvas) {
      const c = colorsCanvas.getContext('2d');
      const s = colorsCanvas.width;
      c.clearRect(0, 0, s, s);
      const iconColors = [COLORS.red, COLORS.blue, COLORS.green, COLORS.yellow];
      const positions = [[s * 0.3, s * 0.3], [s * 0.7, s * 0.3], [s * 0.3, s * 0.7], [s * 0.7, s * 0.7]];
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.arc(positions[i][0], positions[i][1], s * 0.17, 0, Math.PI * 2);
        c.fillStyle = iconColors[i];
        c.fill();
      }
    }

    // Shapes icon
    const shapesCanvas = document.getElementById('icon-shapes');
    if (shapesCanvas) {
      const c = shapesCanvas.getContext('2d');
      const s = shapesCanvas.width;
      c.clearRect(0, 0, s, s);
      // Circle
      c.beginPath();
      c.arc(s * 0.3, s * 0.3, s * 0.15, 0, Math.PI * 2);
      c.fillStyle = COLORS.red;
      c.fill();
      // Square
      c.fillStyle = COLORS.blue;
      c.fillRect(s * 0.55, s * 0.15, s * 0.3, s * 0.3);
      // Triangle
      c.beginPath();
      c.moveTo(s * 0.3, s * 0.55);
      c.lineTo(s * 0.45, s * 0.85);
      c.lineTo(s * 0.15, s * 0.85);
      c.closePath();
      c.fillStyle = COLORS.green;
      c.fill();
      // Star
      c.fillStyle = COLORS.yellow;
      c.beginPath();
      const cx = s * 0.7, cy = s * 0.7, sr = s * 0.15;
      for (let i = 0; i < 10; i++) {
        const rad = (i * Math.PI) / 5 - Math.PI / 2;
        const rr = i % 2 === 0 ? sr : sr * 0.4;
        if (i === 0) c.moveTo(cx + Math.cos(rad) * rr, cy + Math.sin(rad) * rr);
        else c.lineTo(cx + Math.cos(rad) * rr, cy + Math.sin(rad) * rr);
      }
      c.closePath();
      c.fill();
    }

    // Animals icon
    const animalsCanvas = document.getElementById('icon-animals');
    if (animalsCanvas) {
      const c = animalsCanvas.getContext('2d');
      const s = animalsCanvas.width;
      c.clearRect(0, 0, s, s);
      // Simple cat face
      c.fillStyle = COLORS.orange;
      c.beginPath();
      c.arc(s * 0.5, s * 0.55, s * 0.3, 0, Math.PI * 2);
      c.fill();
      // Ears
      c.beginPath();
      c.moveTo(s * 0.2, s * 0.4);
      c.lineTo(s * 0.3, s * 0.1);
      c.lineTo(s * 0.42, s * 0.35);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(s * 0.8, s * 0.4);
      c.lineTo(s * 0.7, s * 0.1);
      c.lineTo(s * 0.58, s * 0.35);
      c.closePath();
      c.fill();
      // Eyes
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(s * 0.38, s * 0.48, s * 0.07, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(s * 0.62, s * 0.48, s * 0.07, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#1a1a2e';
      c.beginPath();
      c.arc(s * 0.38, s * 0.48, s * 0.035, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.arc(s * 0.62, s * 0.48, s * 0.035, 0, Math.PI * 2);
      c.fill();
      // Nose
      c.fillStyle = '#e91e8f';
      c.beginPath();
      c.arc(s * 0.5, s * 0.58, s * 0.04, 0, Math.PI * 2);
      c.fill();
    }

    // Numbers icon
    const numbersCanvas = document.getElementById('icon-numbers');
    if (numbersCanvas) {
      const c = numbersCanvas.getContext('2d');
      const s = numbersCanvas.width;
      c.clearRect(0, 0, s, s);
      c.font = `bold ${s * 0.45}px ${getComputedStyle(document.body).fontFamily}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = COLORS.blue;
      c.fillText('3', s * 0.3, s * 0.45);
      // Dots
      c.fillStyle = COLORS.yellow;
      const dotPositions = [[s * 0.65, s * 0.3], [s * 0.55, s * 0.6], [s * 0.78, s * 0.6]];
      for (const [dx, dy] of dotPositions) {
        c.beginPath();
        c.arc(dx, dy, s * 0.06, 0, Math.PI * 2);
        c.fill();
      }
    }

    // Sizes icon
    const sizesCanvas = document.getElementById('icon-sizes');
    if (sizesCanvas) {
      const c = sizesCanvas.getContext('2d');
      const s = sizesCanvas.width;
      c.clearRect(0, 0, s, s);
      const sizes = [s * 0.08, s * 0.14, s * 0.22];
      const xPos = [s * 0.2, s * 0.5, s * 0.78];
      const sizeColors = [COLORS.green, COLORS.blue, COLORS.purple];
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(xPos[i], s * 0.55, sizes[i], 0, Math.PI * 2);
        c.fillStyle = sizeColors[i];
        c.fill();
      }
    }

    // Fruits icon
    const fruitsCanvas = document.getElementById('icon-fruits');
    if (fruitsCanvas) {
      const c = fruitsCanvas.getContext('2d');
      const s = fruitsCanvas.width;
      c.clearRect(0, 0, s, s);
      // Apple
      c.fillStyle = COLORS.red;
      c.beginPath();
      c.arc(s * 0.3, s * 0.5, s * 0.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#4ecca3';
      c.beginPath();
      c.ellipse(s * 0.32, s * 0.3, s * 0.08, s * 0.03, 0.5, 0, Math.PI * 2);
      c.fill();
      // Banana
      c.fillStyle = COLORS.yellow;
      c.beginPath();
      c.moveTo(s * 0.55, s * 0.25);
      c.quadraticCurveTo(s * 0.9, s * 0.35, s * 0.75, s * 0.75);
      c.quadraticCurveTo(s * 0.65, s * 0.65, s * 0.6, s * 0.55);
      c.quadraticCurveTo(s * 0.7, s * 0.4, s * 0.55, s * 0.25);
      c.closePath();
      c.fill();
    }
  }

  drawMenuIcons();
})();
