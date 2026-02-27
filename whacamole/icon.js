// Whack-a-Mole icon - mole popping out of hole
(() => {
  const wc = document.getElementById('icon-whacamole');
  if (!wc) return;
  const ctx = wc.getContext('2d');
  // Dirt mound
  ctx.fillStyle = '#8B5E3C';
  ctx.beginPath();
  ctx.ellipse(30, 46, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hole
  ctx.fillStyle = '#2a1a0a';
  ctx.beginPath();
  ctx.ellipse(30, 44, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Mole body
  ctx.fillStyle = '#8B6914';
  ctx.beginPath();
  ctx.ellipse(30, 32, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly
  ctx.fillStyle = '#D4A44C';
  ctx.beginPath();
  ctx.ellipse(30, 36, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Snout
  ctx.fillStyle = '#D4A44C';
  ctx.beginPath();
  ctx.ellipse(30, 28, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose
  ctx.fillStyle = '#4a2800';
  ctx.beginPath();
  ctx.ellipse(30, 26, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(25, 23, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(35, 23, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(26, 23, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(36, 23, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Ears
  ctx.fillStyle = '#6B4F10';
  ctx.beginPath();
  ctx.ellipse(20, 17, 3, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(40, 17, 3, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Front mound (covers bottom of mole)
  ctx.fillStyle = '#8B5E3C';
  ctx.beginPath();
  ctx.ellipse(30, 46, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Star (whack indicator)
  ctx.fillStyle = '#f5c518';
  const drawStar = (cx, cy, r) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      const ia = a + Math.PI / 5;
      ctx.lineTo(cx + Math.cos(ia) * r * 0.4, cy + Math.sin(ia) * r * 0.4);
    }
    ctx.closePath();
    ctx.fill();
  };
  drawStar(48, 12, 7);
  drawStar(10, 10, 5);
})();
