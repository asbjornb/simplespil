(() => {
  const canvas = document.getElementById('icon-tower');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Tower platforms (icy blue)
  const platforms = [
    { x: 5, y: 50, w: 50 },
    { x: 12, y: 38, w: 40 },
    { x: 8, y: 26, w: 36 },
    { x: 16, y: 14, w: 30 }
  ];

  for (const p of platforms) {
    ctx.fillStyle = '#64b5f6';
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, 6, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(p.x + 2, p.y, p.w - 4, 2);
  }

  // Little character on second platform
  // Body
  ctx.fillStyle = '#e94560';
  ctx.fillRect(28, 28, 8, 8);
  // Head
  ctx.fillStyle = '#ffd5a3';
  ctx.beginPath();
  ctx.arc(32, 25, 5, 0, Math.PI * 2);
  ctx.fill();
  // Hat
  ctx.fillStyle = '#4ecca3';
  ctx.beginPath();
  ctx.arc(32, 23, 5, Math.PI, 0);
  ctx.fill();
  // Pom pom
  ctx.fillStyle = '#f5c518';
  ctx.beginPath();
  ctx.arc(32, 18, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Arrow pointing up
  ctx.strokeStyle = '#f5c518';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 20);
  ctx.lineTo(50, 6);
  ctx.lineTo(46, 11);
  ctx.moveTo(50, 6);
  ctx.lineTo(54, 11);
  ctx.stroke();
})();
