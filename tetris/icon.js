// Tetris icon - mini tetris blocks
(() => {
  const tc = document.getElementById('icon-tetris');
  if (!tc) return;
  const ctx = tc.getContext('2d');
  const b = 9; // block size
  const drawB = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, b - 1, b - 1);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x, y, b - 1, 2);
    ctx.fillRect(x, y, 2, b - 1);
  };
  // T piece
  drawB(12, 38, '#9b59b6');
  drawB(21, 38, '#9b59b6');
  drawB(30, 38, '#9b59b6');
  drawB(21, 29, '#9b59b6');
  // L piece
  drawB(3, 47, '#f39c12');
  drawB(3, 38, '#f39c12');
  drawB(3, 29, '#f39c12');
  drawB(12, 47, '#f39c12');
  // S piece
  drawB(39, 47, '#4ecca3');
  drawB(48, 47, '#4ecca3');
  drawB(48, 38, '#4ecca3');
  drawB(39, 38, '#e94560');
  // I piece (falling)
  drawB(21, 5, '#3498db');
  drawB(21, 14, '#3498db');
  drawB(21, 23, '#3498db');
  // Bottom row fill
  drawB(3, 47, '#f39c12');
  drawB(12, 47, '#f39c12');
  drawB(21, 47, '#f5c518');
  drawB(30, 47, '#f5c518');
  drawB(39, 47, '#4ecca3');
  drawB(48, 47, '#4ecca3');
})();
