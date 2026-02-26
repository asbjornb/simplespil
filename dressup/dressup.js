(() => {
  'use strict';

  // --- Item definitions ---
  // Each category has items. Index 0 = "none" for optional categories.
  // Colors are referenced by index into their palette.

  const SKIN_COLORS = ['#f5d0a9', '#e8b88a', '#c68e5b', '#8d5c34', '#6b3f1f', '#fde7d6'];
  const HAIR_COLORS = ['#2c1810', '#5a3420', '#c4842d', '#f5c518', '#e94560', '#3498db', '#9b59b6', '#4ecca3'];

  const ITEMS = {
    skin: {
      label: 'Skin',
      type: 'color',
      colors: SKIN_COLORS,
    },
    hair: {
      label: 'Hair',
      options: [
        { name: 'None' },
        { name: 'Short' },
        { name: 'Long' },
        { name: 'Curly' },
        { name: 'Pigtails' },
        { name: 'Spiky' },
      ],
      colors: HAIR_COLORS,
    },
    hat: {
      label: 'Hat',
      options: [
        { name: 'None' },
        { name: 'Cap' },
        { name: 'Beanie' },
        { name: 'Crown' },
        { name: 'Bow' },
      ],
    },
    top: {
      label: 'Top',
      options: [
        { name: 'T-Shirt' },
        { name: 'Hoodie' },
        { name: 'Tank Top' },
        { name: 'Dress' },
      ],
      colors: ['#e94560', '#3498db', '#4ecca3', '#9b59b6', '#f5c518', '#f39c12', '#e91e8f', '#ffffff'],
    },
    bottom: {
      label: 'Bottom',
      options: [
        { name: 'Pants' },
        { name: 'Shorts' },
        { name: 'Skirt' },
      ],
      colors: ['#0f3460', '#2c3e50', '#e94560', '#9b59b6', '#4ecca3', '#f5c518'],
    },
    shoes: {
      label: 'Shoes',
      options: [
        { name: 'Sneakers' },
        { name: 'Boots' },
        { name: 'Sandals' },
      ],
      colors: ['#e94560', '#3498db', '#2c1810', '#f5c518', '#4ecca3', '#ffffff'],
    },
  };

  // --- State ---
  const state = {
    skin: 0,
    hair: 1,
    hairColor: 0,
    hat: 0,
    top: 0,
    topColor: 0,
    bottom: 0,
    bottomColor: 0,
    shoes: 0,
    shoesColor: 0,
  };

  const canvas = document.getElementById('character');
  const ctx = canvas.getContext('2d');

  // --- URL sharing ---
  function encodeState() {
    // Pack state into a compact string: key values joined by dots
    const values = [
      state.skin, state.hair, state.hairColor, state.hat,
      state.top, state.topColor, state.bottom, state.bottomColor,
      state.shoes, state.shoesColor,
    ];
    return values.map(v => v.toString(36)).join('.');
  }

  function decodeState(str) {
    const parts = str.split('.');
    if (parts.length < 10) return false;
    const values = parts.map(p => parseInt(p, 36));
    if (values.some(v => isNaN(v))) return false;
    const keys = [
      'skin', 'hair', 'hairColor', 'hat',
      'top', 'topColor', 'bottom', 'bottomColor',
      'shoes', 'shoesColor',
    ];
    keys.forEach((k, i) => { state[k] = values[i]; });
    return true;
  }

  function loadFromURL() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      decodeState(hash);
      clampState();
    }
  }

  function clampState() {
    const clamp = (val, max) => Math.max(0, Math.min(val, max - 1));
    state.skin = clamp(state.skin, SKIN_COLORS.length);
    state.hair = clamp(state.hair, ITEMS.hair.options.length);
    state.hairColor = clamp(state.hairColor, HAIR_COLORS.length);
    state.hat = clamp(state.hat, ITEMS.hat.options.length);
    state.top = clamp(state.top, ITEMS.top.options.length);
    state.topColor = clamp(state.topColor, ITEMS.top.colors.length);
    state.bottom = clamp(state.bottom, ITEMS.bottom.options.length);
    state.bottomColor = clamp(state.bottomColor, ITEMS.bottom.colors.length);
    state.shoes = clamp(state.shoes, ITEMS.shoes.options.length);
    state.shoesColor = clamp(state.shoesColor, ITEMS.shoes.colors.length);
  }

  // --- Drawing ---
  // Character proportions (within 300x420 canvas)
  const CX = 150; // center x
  const HEAD_Y = 90;
  const HEAD_R = 50;
  const BODY_TOP = 145;
  const BODY_W = 90;
  const BODY_H = 110;
  const LEG_TOP = BODY_TOP + BODY_H;
  const LEG_H = 100;
  const LEG_W = 35;
  const FOOT_H = 20;

  function drawCharacter() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const skinColor = SKIN_COLORS[state.skin];

    // --- Legs ---
    const bottomColor = ITEMS.bottom.colors[state.bottomColor];
    const bottomType = state.bottom;
    const legGap = 8;
    const leftLegX = CX - legGap - LEG_W;
    const rightLegX = CX + legGap;
    const legEndY = LEG_TOP + LEG_H;

    if (bottomType === 2) {
      // Skirt
      ctx.fillStyle = bottomColor;
      ctx.beginPath();
      ctx.moveTo(CX - BODY_W / 2, BODY_TOP + BODY_H - 10);
      ctx.lineTo(CX - BODY_W / 2 - 15, LEG_TOP + 55);
      ctx.lineTo(CX + BODY_W / 2 + 15, LEG_TOP + 55);
      ctx.lineTo(CX + BODY_W / 2, BODY_TOP + BODY_H - 10);
      ctx.closePath();
      ctx.fill();
      // Visible legs below skirt
      ctx.fillStyle = skinColor;
      roundRect(leftLegX, LEG_TOP + 45, LEG_W, LEG_H - 45, 8);
      roundRect(rightLegX, LEG_TOP + 45, LEG_W, LEG_H - 45, 8);
    } else {
      const pantEndY = bottomType === 1 ? LEG_TOP + 40 : legEndY; // shorts vs pants
      ctx.fillStyle = bottomColor;
      roundRect(leftLegX, LEG_TOP, LEG_W, pantEndY - LEG_TOP, 8);
      roundRect(rightLegX, LEG_TOP, LEG_W, pantEndY - LEG_TOP, 8);
      if (pantEndY < legEndY) {
        ctx.fillStyle = skinColor;
        roundRect(leftLegX, pantEndY, LEG_W, legEndY - pantEndY, 8);
        roundRect(rightLegX, pantEndY, LEG_W, legEndY - pantEndY, 8);
      }
    }

    // --- Shoes ---
    const shoeColor = ITEMS.shoes.colors[state.shoesColor];
    const shoeType = state.shoes;
    ctx.fillStyle = shoeColor;
    if (shoeType === 0) {
      // Sneakers
      roundRect(leftLegX - 3, legEndY - 4, LEG_W + 8, FOOT_H, 6);
      roundRect(rightLegX - 3, legEndY - 4, LEG_W + 8, FOOT_H, 6);
    } else if (shoeType === 1) {
      // Boots
      roundRect(leftLegX - 2, legEndY - 20, LEG_W + 6, FOOT_H + 20, 6);
      roundRect(rightLegX - 2, legEndY - 20, LEG_W + 6, FOOT_H + 20, 6);
    } else {
      // Sandals - thin strap
      roundRect(leftLegX - 3, legEndY, LEG_W + 8, 10, 4);
      roundRect(rightLegX - 3, legEndY, LEG_W + 8, 10, 4);
      // Straps
      ctx.fillRect(leftLegX + 8, legEndY - 6, 5, 10);
      ctx.fillRect(leftLegX + LEG_W - 12, legEndY - 6, 5, 10);
      ctx.fillRect(rightLegX + 8, legEndY - 6, 5, 10);
      ctx.fillRect(rightLegX + LEG_W - 12, legEndY - 6, 5, 10);
    }

    // --- Arms (behind body) ---
    ctx.fillStyle = skinColor;
    roundRect(CX - BODY_W / 2 - 22, BODY_TOP + 10, 24, 80, 12);
    roundRect(CX + BODY_W / 2 - 2, BODY_TOP + 10, 24, 80, 12);

    // --- Body / Top ---
    const topColor = ITEMS.top.colors[state.topColor];
    const topType = state.top;
    ctx.fillStyle = topColor;

    if (topType === 0) {
      // T-Shirt
      roundRect(CX - BODY_W / 2, BODY_TOP, BODY_W, BODY_H, 10);
      // Sleeves
      roundRect(CX - BODY_W / 2 - 18, BODY_TOP + 5, 22, 40, 10);
      roundRect(CX + BODY_W / 2 - 4, BODY_TOP + 5, 22, 40, 10);
    } else if (topType === 1) {
      // Hoodie
      roundRect(CX - BODY_W / 2 - 4, BODY_TOP, BODY_W + 8, BODY_H + 5, 10);
      roundRect(CX - BODY_W / 2 - 22, BODY_TOP + 5, 26, 70, 12);
      roundRect(CX + BODY_W / 2 - 2, BODY_TOP + 5, 26, 70, 12);
      // Hood detail
      ctx.fillStyle = darkenColor(topColor, 0.15);
      roundRect(CX - 20, BODY_TOP + 2, 40, 20, 8);
      // Pocket
      ctx.fillStyle = darkenColor(topColor, 0.1);
      roundRect(CX - 25, BODY_TOP + 60, 50, 25, 6);
    } else if (topType === 2) {
      // Tank Top
      roundRect(CX - BODY_W / 2 + 8, BODY_TOP, BODY_W - 16, BODY_H, 10);
      // Straps
      ctx.fillRect(CX - 28, BODY_TOP - 8, 16, 20);
      ctx.fillRect(CX + 12, BODY_TOP - 8, 16, 20);
    } else if (topType === 3) {
      // Dress - extends over bottom
      ctx.fillStyle = topColor;
      roundRect(CX - BODY_W / 2, BODY_TOP, BODY_W, BODY_H, 10);
      // Sleeves
      roundRect(CX - BODY_W / 2 - 18, BODY_TOP + 5, 22, 35, 10);
      roundRect(CX + BODY_W / 2 - 4, BODY_TOP + 5, 22, 35, 10);
      // Flared skirt part
      ctx.beginPath();
      ctx.moveTo(CX - BODY_W / 2, BODY_TOP + BODY_H - 10);
      ctx.lineTo(CX - BODY_W / 2 - 20, LEG_TOP + 60);
      ctx.lineTo(CX + BODY_W / 2 + 20, LEG_TOP + 60);
      ctx.lineTo(CX + BODY_W / 2, BODY_TOP + BODY_H - 10);
      ctx.closePath();
      ctx.fill();
    }

    // --- Neck ---
    ctx.fillStyle = skinColor;
    roundRect(CX - 12, BODY_TOP - 15, 24, 20, 6);

    // --- Head ---
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(CX, HEAD_Y, HEAD_R, 0, Math.PI * 2);
    ctx.fill();

    // --- Face ---
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(CX - 16, HEAD_Y - 4, 10, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(CX + 16, HEAD_Y - 4, 10, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupils
    ctx.fillStyle = '#2c1810';
    ctx.beginPath();
    ctx.arc(CX - 14, HEAD_Y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CX + 18, HEAD_Y - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(CX - 12, HEAD_Y - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CX + 20, HEAD_Y - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.strokeStyle = '#2c1810';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(CX, HEAD_Y + 8, 16, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // Cheeks
    ctx.fillStyle = 'rgba(233, 69, 96, 0.25)';
    ctx.beginPath();
    ctx.ellipse(CX - 32, HEAD_Y + 10, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(CX + 32, HEAD_Y + 10, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- Hair ---
    const hairType = state.hair;
    const hairColor = HAIR_COLORS[state.hairColor];
    if (hairType > 0) {
      ctx.fillStyle = hairColor;
      if (hairType === 1) {
        // Short
        ctx.beginPath();
        ctx.arc(CX, HEAD_Y - 8, HEAD_R + 4, Math.PI, 2 * Math.PI);
        ctx.fill();
        roundRect(CX - HEAD_R - 4, HEAD_Y - 20, HEAD_R * 2 + 8, 18, 8);
      } else if (hairType === 2) {
        // Long
        ctx.beginPath();
        ctx.arc(CX, HEAD_Y - 8, HEAD_R + 6, Math.PI * 0.85, Math.PI * 2.15);
        ctx.fill();
        roundRect(CX - HEAD_R - 6, HEAD_Y - 20, HEAD_R * 2 + 12, 18, 8);
        // Side hair
        roundRect(CX - HEAD_R - 8, HEAD_Y - 10, 16, 90, 8);
        roundRect(CX + HEAD_R - 8, HEAD_Y - 10, 16, 90, 8);
      } else if (hairType === 3) {
        // Curly
        for (let angle = Math.PI; angle <= 2 * Math.PI; angle += 0.3) {
          const bx = CX + Math.cos(angle) * (HEAD_R + 8);
          const by = HEAD_Y - 8 + Math.sin(angle) * (HEAD_R + 8);
          ctx.beginPath();
          ctx.arc(bx, by, 14, 0, Math.PI * 2);
          ctx.fill();
        }
        // Side curls
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(CX - HEAD_R - 6, HEAD_Y - 10 + i * 18, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(CX + HEAD_R + 6, HEAD_Y - 10 + i * 18, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (hairType === 4) {
        // Pigtails
        ctx.beginPath();
        ctx.arc(CX, HEAD_Y - 8, HEAD_R + 4, Math.PI, 2 * Math.PI);
        ctx.fill();
        roundRect(CX - HEAD_R - 4, HEAD_Y - 20, HEAD_R * 2 + 8, 18, 8);
        // Pigtail bunches
        ctx.beginPath();
        ctx.arc(CX - HEAD_R - 14, HEAD_Y - 10, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(CX + HEAD_R + 14, HEAD_Y - 10, 18, 0, Math.PI * 2);
        ctx.fill();
        // Hair ties
        ctx.fillStyle = ITEMS.top.colors[state.topColor];
        ctx.beginPath();
        ctx.arc(CX - HEAD_R - 2, HEAD_Y - 12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(CX + HEAD_R + 2, HEAD_Y - 12, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (hairType === 5) {
        // Spiky
        ctx.fillStyle = hairColor;
        for (let i = 0; i < 7; i++) {
          const angle = Math.PI + (i / 6) * Math.PI;
          const bx = CX + Math.cos(angle) * HEAD_R;
          const by = HEAD_Y - 8 + Math.sin(angle) * HEAD_R;
          const tx = CX + Math.cos(angle) * (HEAD_R + 28);
          const ty = HEAD_Y - 8 + Math.sin(angle) * (HEAD_R + 28);
          ctx.beginPath();
          ctx.moveTo(bx - 10, by);
          ctx.lineTo(tx, ty);
          ctx.lineTo(bx + 10, by);
          ctx.closePath();
          ctx.fill();
        }
        // Cover base
        ctx.beginPath();
        ctx.arc(CX, HEAD_Y - 8, HEAD_R + 2, Math.PI, 2 * Math.PI);
        ctx.fill();
      }
    }

    // --- Hat ---
    const hatType = state.hat;
    if (hatType > 0) {
      if (hatType === 1) {
        // Baseball Cap
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(CX, HEAD_Y - HEAD_R + 8, HEAD_R + 6, Math.PI, 2 * Math.PI);
        ctx.fill();
        // Brim
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.ellipse(CX + 10, HEAD_Y - HEAD_R + 10, 45, 10, 0.1, Math.PI, 2 * Math.PI);
        ctx.fill();
      } else if (hatType === 2) {
        // Beanie
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(CX, HEAD_Y - HEAD_R + 10, HEAD_R + 6, Math.PI, 2 * Math.PI);
        ctx.fill();
        roundRect(CX - HEAD_R - 6, HEAD_Y - HEAD_R + 4, (HEAD_R + 6) * 2, 16, 4);
        // Pom pom
        ctx.fillStyle = '#c39bd3';
        ctx.beginPath();
        ctx.arc(CX, HEAD_Y - HEAD_R - 20, 10, 0, Math.PI * 2);
        ctx.fill();
        // Stripe
        ctx.fillStyle = '#7d3c98';
        roundRect(CX - HEAD_R - 4, HEAD_Y - HEAD_R + 6, (HEAD_R + 4) * 2, 6, 2);
      } else if (hatType === 3) {
        // Crown
        ctx.fillStyle = '#f5c518';
        ctx.beginPath();
        ctx.moveTo(CX - 36, HEAD_Y - HEAD_R + 12);
        ctx.lineTo(CX - 36, HEAD_Y - HEAD_R - 20);
        ctx.lineTo(CX - 20, HEAD_Y - HEAD_R - 5);
        ctx.lineTo(CX, HEAD_Y - HEAD_R - 28);
        ctx.lineTo(CX + 20, HEAD_Y - HEAD_R - 5);
        ctx.lineTo(CX + 36, HEAD_Y - HEAD_R - 20);
        ctx.lineTo(CX + 36, HEAD_Y - HEAD_R + 12);
        ctx.closePath();
        ctx.fill();
        // Gems
        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(CX, HEAD_Y - HEAD_R, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(CX - 20, HEAD_Y - HEAD_R + 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(CX + 20, HEAD_Y - HEAD_R + 4, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (hatType === 4) {
        // Bow
        ctx.fillStyle = '#e91e8f';
        // Left loop
        ctx.beginPath();
        ctx.ellipse(CX - 18, HEAD_Y - HEAD_R - 6, 20, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right loop
        ctx.beginPath();
        ctx.ellipse(CX + 18, HEAD_Y - HEAD_R - 6, 20, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Center knot
        ctx.fillStyle = '#c0147a';
        ctx.beginPath();
        ctx.arc(CX, HEAD_Y - HEAD_R - 4, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function darkenColor(hex, amount) {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) * (1 - amount));
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  }

  // --- UI setup ---
  function buildControls() {
    // Skin - color swatches
    buildColorPickers('skin', SKIN_COLORS, 'skin');

    // Hair - style buttons then color pickers
    buildOptionButtons('hair', ITEMS.hair.options, 'hair');
    buildColorPickers('hair', HAIR_COLORS, 'hairColor');

    // Hat - option buttons only
    buildOptionButtons('hat', ITEMS.hat.options, 'hat');

    // Top - options + colors
    buildOptionButtons('top', ITEMS.top.options, 'top');
    buildColorPickers('top', ITEMS.top.colors, 'topColor');

    // Bottom - options + colors
    buildOptionButtons('bottom', ITEMS.bottom.options, 'bottom');
    buildColorPickers('bottom', ITEMS.bottom.colors, 'bottomColor');

    // Shoes - options + colors
    buildOptionButtons('shoes', ITEMS.shoes.options, 'shoes');
    buildColorPickers('shoes', ITEMS.shoes.colors, 'shoesColor');
  }

  function buildOptionButtons(category, options, stateKey) {
    const container = document.querySelector(`.category[data-category="${category}"] .options`);
    options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt.name;
      btn.dataset.stateKey = stateKey;
      btn.dataset.index = i;
      if (state[stateKey] === i) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        state[stateKey] = i;
        updateSelections(stateKey);
        drawCharacter();
      });
      container.appendChild(btn);
    });
  }

  function buildColorPickers(category, colors, stateKey) {
    const container = document.querySelector(`.category[data-category="${category}"] .options`);
    colors.forEach((color, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn color-swatch';
      btn.style.background = color;
      btn.dataset.stateKey = stateKey;
      btn.dataset.index = i;
      if (color === '#ffffff') {
        btn.style.border = '2px solid #555';
      }
      if (state[stateKey] === i) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        state[stateKey] = i;
        updateSelections(stateKey);
        drawCharacter();
      });
      container.appendChild(btn);
    });
  }

  function updateSelections(stateKey) {
    document.querySelectorAll(`.option-btn[data-state-key="${stateKey}"]`).forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.index) === state[stateKey]);
    });
  }

  // --- Random outfit ---
  function randomize() {
    const randInt = (max) => Math.floor(Math.random() * max);
    state.skin = randInt(SKIN_COLORS.length);
    state.hair = randInt(ITEMS.hair.options.length);
    state.hairColor = randInt(HAIR_COLORS.length);
    state.hat = randInt(ITEMS.hat.options.length);
    state.top = randInt(ITEMS.top.options.length);
    state.topColor = randInt(ITEMS.top.colors.length);
    state.bottom = randInt(ITEMS.bottom.options.length);
    state.bottomColor = randInt(ITEMS.bottom.colors.length);
    state.shoes = randInt(ITEMS.shoes.options.length);
    state.shoesColor = randInt(ITEMS.shoes.colors.length);
    refreshAllSelections();
    drawCharacter();
  }

  function refreshAllSelections() {
    const keys = ['skin', 'hairColor', 'hair', 'hat', 'top', 'topColor', 'bottom', 'bottomColor', 'shoes', 'shoesColor'];
    keys.forEach(k => updateSelections(k));
  }

  // --- Share modal ---
  const modal = document.getElementById('share-modal');
  const shareUrlInput = document.getElementById('share-url');
  const copyFeedback = document.getElementById('copy-feedback');

  document.getElementById('btn-share').addEventListener('click', () => {
    const encoded = encodeState();
    const url = window.location.origin + window.location.pathname + '#' + encoded;
    shareUrlInput.value = url;
    modal.classList.remove('hidden');
    copyFeedback.classList.add('hidden');
    shareUrlInput.select();
  });

  document.getElementById('btn-copy').addEventListener('click', () => {
    shareUrlInput.select();
    navigator.clipboard.writeText(shareUrlInput.value).then(() => {
      copyFeedback.classList.remove('hidden');
    }).catch(() => {
      // Fallback
      document.execCommand('copy');
      copyFeedback.classList.remove('hidden');
    });
  });

  document.getElementById('btn-close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  document.getElementById('btn-random').addEventListener('click', randomize);

  // --- Init ---
  loadFromURL();
  buildControls();
  drawCharacter();
})();
