// Four in a Row icon - mini board with discs
(() => {
  const fc = document.getElementById('icon-four');
  if (!fc) return;
  const ctx = fc.getContext('2d');
  // Board background
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(5, 15, 50, 40);
  // Holes (3x4 grid)
  const discColors = [
    [null, null, null, null],
    [null, null, '#f5c518', null],
    ['#e94560', '#f5c518', '#e94560', null],
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const cx = 13 + c * 12;
      const cy = 23 + r * 12;
      const color = discColors[r][c];
      ctx.fillStyle = color || '#1a1a2e';
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Falling piece
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(37, 9, 4.5, 0, Math.PI * 2);
  ctx.fill();
})();
