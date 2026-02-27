// Jump icon - little dinosaur
(() => {
  const jc = document.getElementById('icon-jump');
  if (!jc) return;
  const ctx = jc.getContext('2d');
  ctx.fillStyle = '#4ecca3';
  ctx.beginPath();
  ctx.ellipse(28, 30, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(44, 18, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(48, 15, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(49, 15, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3ba88a';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 8, 16);
    ctx.lineTo(23 + i * 8, 10);
    ctx.lineTo(26 + i * 8, 16);
    ctx.fill();
  }
  ctx.fillRect(22, 42, 5, 12);
  ctx.fillRect(34, 42, 5, 12);
})();
