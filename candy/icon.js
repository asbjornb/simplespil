// Candy Match icon - colorful candies in a grid
(() => {
  const candyc = document.getElementById('icon-candy');
  if (!candyc) return;
  const ctx = candyc.getContext('2d');
  const colors = ['#e94560', '#4ecca3', '#f5c518', '#e91e8f', '#3498db', '#9b59b6'];
  const s = 14;
  // 3x3 grid of candy circles
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cx = 12 + c * 18;
      const cy = 12 + r * 18;
      const ci = (r * 3 + c) % colors.length;
      ctx.fillStyle = colors[ci];
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.45, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.ellipse(cx - 2, cy - 2, s * 0.18, s * 0.12, -0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Swap arrows hint
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(36, 30);
  ctx.lineTo(44, 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(42, 28);
  ctx.lineTo(44, 30);
  ctx.lineTo(42, 32);
  ctx.stroke();
  // Star sparkle
  ctx.fillStyle = '#f5c518';
  ctx.beginPath();
  const sx = 50, sy = 8, sr = 5;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? sr : sr * 0.35;
    ctx.lineTo(sx + Math.cos(a) * rad, sy + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
})();
