// Fruit Catcher icon - basket with falling fruit
(() => {
  const cc = document.getElementById('icon-catch');
  if (!cc) return;
  const ctx = cc.getContext('2d');
  // Falling apple
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(20, 12, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4ecca3';
  ctx.beginPath();
  ctx.ellipse(23, 6, 4, 1.5, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 5);
  ctx.lineTo(21, 2);
  ctx.stroke();
  // Falling orange
  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.arc(42, 20, 6, 0, Math.PI * 2);
  ctx.fill();
  // Basket
  ctx.fillStyle = '#c47a2a';
  ctx.beginPath();
  ctx.moveTo(12, 38);
  ctx.lineTo(48, 38);
  ctx.lineTo(44, 54);
  ctx.lineTo(16, 54);
  ctx.closePath();
  ctx.fill();
  // Basket weave lines
  ctx.strokeStyle = '#a0621a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(14, 44);
  ctx.lineTo(46, 44);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, 49);
  ctx.lineTo(45, 49);
  ctx.stroke();
  // Basket rim
  ctx.fillStyle = '#d4892e';
  ctx.fillRect(11, 36, 38, 3);
  // Grapes in basket
  ctx.fillStyle = '#9b59b6';
  ctx.beginPath();
  ctx.arc(25, 34, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(31, 33, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(28, 30, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Banana in basket
  ctx.fillStyle = '#f5c518';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#f5c518';
  ctx.beginPath();
  ctx.arc(37, 32, 6, 0.8, 2.3);
  ctx.stroke();
})();
