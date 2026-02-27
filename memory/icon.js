// Memory icon - four colored Simon-style buttons
(() => {
  const memc = document.getElementById('icon-memory');
  if (!memc) return;
  const ctx = memc.getContext('2d');
  const colors = ['#d63031', '#2980b9', '#27ae60', '#f1c40f'];
  const positions = [[6, 6], [32, 6], [6, 32], [32, 32]];
  positions.forEach(([x, y], i) => {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 18, y);
    ctx.quadraticCurveTo(x + 22, y, x + 22, y + 4);
    ctx.lineTo(x + 22, y + 18);
    ctx.quadraticCurveTo(x + 22, y + 22, x + 18, y + 22);
    ctx.lineTo(x + 4, y + 22);
    ctx.quadraticCurveTo(x, y + 22, x, y + 18);
    ctx.lineTo(x, y + 4);
    ctx.quadraticCurveTo(x, y, x + 4, y);
    ctx.fill();
    // Shine highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 11, y + 6, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // Lit effect on top-right button
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(36, 6);
  ctx.lineTo(50, 6);
  ctx.quadraticCurveTo(54, 6, 54, 10);
  ctx.lineTo(54, 24);
  ctx.quadraticCurveTo(54, 28, 50, 28);
  ctx.lineTo(36, 28);
  ctx.quadraticCurveTo(32, 28, 32, 24);
  ctx.lineTo(32, 10);
  ctx.quadraticCurveTo(32, 6, 36, 6);
  ctx.fill();
})();
