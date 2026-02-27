// Match icon - shapes with dashed outlines and filled pieces
(() => {
  const matchc = document.getElementById('icon-match');
  if (!matchc) return;
  const ctx = matchc.getContext('2d');
  // Dashed circle outline (target)
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(14, 16, 9, 0, Math.PI * 2);
  ctx.stroke();
  // Dashed triangle outline (target)
  ctx.strokeStyle = '#4ecca3';
  ctx.beginPath();
  ctx.moveTo(44, 7);
  ctx.lineTo(54, 25);
  ctx.lineTo(34, 25);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  // Filled star (piece)
  ctx.fillStyle = '#f5c518';
  ctx.beginPath();
  const sx = 14, sy = 44, sr = 8;
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? sr : sr * 0.4;
    ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  // Filled heart (piece)
  ctx.fillStyle = '#9b59b6';
  const hx = 44, hy = 46, hr = 8;
  ctx.beginPath();
  ctx.moveTo(hx, hy + hr * 0.5);
  ctx.bezierCurveTo(hx - hr, hy - hr * 0.2, hx - hr * 0.5, hy - hr * 0.9, hx, hy - hr * 0.3);
  ctx.bezierCurveTo(hx + hr * 0.5, hy - hr * 0.9, hx + hr, hy - hr * 0.2, hx, hy + hr * 0.5);
  ctx.fill();
  // Arrow hint
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(24, 30);
  ctx.lineTo(36, 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(33, 27);
  ctx.lineTo(36, 30);
  ctx.lineTo(33, 33);
  ctx.stroke();
})();
