// Dress Up icon - little character with hat
(() => {
  const dc = document.getElementById('icon-dressup');
  if (!dc) return;
  const ctx = dc.getContext('2d');
  // Body
  ctx.fillStyle = '#e91e8f';
  ctx.fillRect(22, 28, 16, 18);
  // Head
  ctx.fillStyle = '#f5d0a9';
  ctx.beginPath();
  ctx.arc(30, 20, 12, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#2c1810';
  ctx.beginPath();
  ctx.arc(26, 18, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(34, 18, 2, 0, Math.PI * 2);
  ctx.fill();
  // Smile
  ctx.strokeStyle = '#2c1810';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(30, 21, 5, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  // Crown
  ctx.fillStyle = '#f5c518';
  ctx.beginPath();
  ctx.moveTo(20, 12);
  ctx.lineTo(20, 5);
  ctx.lineTo(25, 9);
  ctx.lineTo(30, 3);
  ctx.lineTo(35, 9);
  ctx.lineTo(40, 5);
  ctx.lineTo(40, 12);
  ctx.closePath();
  ctx.fill();
  // Legs
  ctx.fillStyle = '#3498db';
  ctx.fillRect(23, 46, 6, 10);
  ctx.fillRect(31, 46, 6, 10);
  // Shoes
  ctx.fillStyle = '#e94560';
  ctx.fillRect(21, 54, 10, 4);
  ctx.fillRect(29, 54, 10, 4);
})();
