// Puzzle icon - 4 puzzle pieces
(() => {
  const pc = document.getElementById('icon-puzzle');
  if (!pc) return;
  const ctx = pc.getContext('2d');
  const colors = ['#e94560', '#f5c518', '#4ecca3', '#3498db'];
  const positions = [[4, 4], [32, 4], [4, 32], [32, 32]];
  positions.forEach(([x, y], i) => {
    ctx.fillStyle = colors[i];
    ctx.fillRect(x, y, 24, 24);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 24, 24);
  });
  // Puzzle nubs
  ctx.fillStyle = colors[0];
  ctx.beginPath();
  ctx.arc(28, 16, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.arc(28, 44, 5, 0, Math.PI * 2);
  ctx.fill();
})();
