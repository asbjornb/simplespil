// Maze icon - mini maze
(() => {
  const mc = document.getElementById('icon-maze');
  if (!mc) return;
  const ctx = mc.getContext('2d');
  ctx.strokeStyle = '#4a90d9';
  ctx.lineWidth = 2;
  // Outer walls
  ctx.strokeRect(5, 5, 50, 50);
  // Internal walls
  const walls = [
    [5, 18, 22, 18], [18, 5, 18, 15], [30, 12, 30, 30],
    [18, 30, 30, 30], [40, 18, 40, 42], [18, 42, 40, 42],
    [48, 30, 55, 30]
  ];
  walls.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
  // Player dot
  ctx.fillStyle = '#4ecca3';
  ctx.beginPath();
  ctx.arc(12, 12, 4, 0, Math.PI * 2);
  ctx.fill();
  // Goal star
  ctx.fillStyle = '#f5c518';
  ctx.beginPath();
  ctx.arc(48, 48, 4, 0, Math.PI * 2);
  ctx.fill();
})();
