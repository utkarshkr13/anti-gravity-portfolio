/* Original canvas illustration: Gateway of India, Sea Link and the Mumbai waterfront. */
(() => {
  'use strict';
  const canvas = document.getElementById('mumbaiHarbour');
  if (!canvas) return;
  const display = canvas.getContext('2d');
  if (!display) return;
  const scene = document.createElement('canvas');
  let ctx = scene.getContext('2d');
  if (!ctx) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let width = 0, height = 0, frame = 0, phase = 0;
  let targetX = 0, targetY = 0, x = 0, y = 0, travel = 0;
  let light = document.documentElement.dataset.theme === 'light';
  let lastTime = 0;
  let lastPaint = 0;
  let dirty = true;
  let cachedX = 0, cachedY = 0, cachedTravel = 0;
  let paused = false;
  const toggle = document.getElementById('sceneMotionToggle');

  const line = (points, color, size = 1) => {
    ctx.beginPath();
    points.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.stroke();
  };

  function gateway(gx, gy, scale) {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(scale, scale);
    ctx.fillStyle = light ? '#8a7760' : '#635442';
    ctx.strokeStyle = light ? '#a28c70' : '#b29165';
    ctx.lineWidth = 1.2;
    // Central arch and twin turrets, with the characteristic Indo-Saracenic parapet.
    ctx.beginPath();
    ctx.moveTo(-80, 0); ctx.lineTo(-80, -106); ctx.lineTo(-55, -106);
    ctx.lineTo(-55, -120); ctx.lineTo(55, -120); ctx.lineTo(55, -106);
    ctx.lineTo(80, -106); ctx.lineTo(80, 0); ctx.lineTo(31, 0);
    ctx.lineTo(31, -55); ctx.bezierCurveTo(31, -91, -31, -91, -31, -55);
    ctx.lineTo(-31, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    [-68, 68].forEach(tx => {
      ctx.fillRect(tx - 17, -128, 34, 128);
      ctx.strokeRect(tx - 17, -128, 34, 128);
      ctx.beginPath(); ctx.moveTo(tx - 22, -128);
      ctx.quadraticCurveTo(tx - 18, -150, tx, -154);
      ctx.quadraticCurveTo(tx + 18, -150, tx + 22, -128);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      line([[tx, -154], [tx, -166]], ctx.strokeStyle, 1);
      ctx.fillStyle = light ? '#584e43' : '#262d30';
      ctx.fillRect(tx - 5, -115, 10, 19);
      ctx.fillStyle = light ? '#8a7760' : '#635442';
    });
    for (let i = -44; i <= 44; i += 11) {
      ctx.strokeRect(i - 3, -116, 6, 8);
    }
    [-92, -98].forEach(yy => line([[-53, yy], [53, yy]], ctx.strokeStyle));
    line([[-88, 0], [88, 0]], ctx.strokeStyle, 3);
    line([[-96, 5], [96, 5]], ctx.strokeStyle, 2);
    ctx.restore();
  }

  function bridge(horizon) {
    ctx.save();
    ctx.translate(width * 0.06 + x * 8 - travel * 28, horizon + 15);
    const span = width * 0.44;
    const towerHeight = Math.min(100, width * 0.09);
    const ink = light ? 'rgba(73,101,119,0.55)' : 'rgba(158,184,196,0.55)';
    [0.33, 0.72].forEach(ratio => {
      const tx = span * ratio;
      line([[tx - 8, 6], [tx - 3, -towerHeight], [tx + 3, -towerHeight], [tx + 8, 6]], ink, 2);
      for (let i = -5; i <= 5; i++) {
        line([[tx, -towerHeight + 8], [tx + i * span * 0.034, 0]], ink, 0.7);
      }
    });
    line([[0, 0], [span, 0]], ink, 3);
    for (let i = 0; i < 34; i++) {
      ctx.fillStyle = light ? '#af9470' : '#c6ad7b';
      ctx.fillRect(i * span / 34, -2, 1.2, 1.2);
    }
    ctx.restore();
  }

  function paintScene() {
    const horizon = height * (width < 600 ? 0.72 : 0.7) + y * 10 - travel * 18;
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, light ? '#e8eef3' : '#07121d');
    sky.addColorStop(0.55, light ? '#dce6ec' : '#142b3c');
    sky.addColorStop(0.72, light ? '#ccdce4' : '#243b48');
    sky.addColorStop(1, light ? '#edf1f4' : '#091823');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);

    // Distant harbour light and a clear sky behind the portfolio copy.
    const haze = ctx.createRadialGradient(width * 0.82, horizon, 0, width * 0.82, horizon, width * 0.7);
    haze.addColorStop(0, light ? 'rgba(255,229,190,0.34)' : 'rgba(210,154,96,0.1)');
    haze.addColorStop(1, 'rgba(210,154,96,0)');
    ctx.fillStyle = haze; ctx.fillRect(0, 0, width, height);
    if (!light) {
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(220,230,235,${0.12 + (i % 4) * 0.05})`;
        ctx.fillRect(((i * 137 + 53) % 1000) / 1000 * width + x * 3,
          ((i * 73 + 19) % 450) / 1000 * height, 1, 1);
      }
    }

    // Nariman Point's layered towers and individual lit windows.
    for (let i = 0; i < 31; i++) {
      const bx = width * (0.38 + i * 0.022) + x * 5 - travel * 20;
      const bw = width * (0.012 + (i % 3) * 0.002);
      const bh = 22 + ((i * 37) % 69) * Math.min(width / 1100, 1);
      ctx.fillStyle = light ? '#a3b5c0' : '#172a35';
      ctx.fillRect(bx, horizon - bh, bw, bh);
      if (i % 5 === 0) line([[bx + bw * 0.5, horizon - bh], [bx + bw * 0.5, horizon - bh - 9]], light ? '#8b9fae' : '#5d7078');
      for (let r = 0; r < bh / 7 - 1; r++) {
        for (let c = 0; c < bw / 5 - 1; c++) {
          if ((i + r * 3 + c * 7) % 4 === 0) continue;
          ctx.fillStyle = light ? 'rgba(225,216,191,0.4)' : `rgba(218,180,123,${0.15 + ((i + r + c) % 3) * 0.08})`;
          ctx.fillRect(bx + 3 + c * 5, horizon - bh + 5 + r * 7, 1.4, 2);
        }
      }
    }
    bridge(horizon);

    const sea = ctx.createLinearGradient(0, horizon + 18, 0, height);
    sea.addColorStop(0, light ? '#bfd0dc' : '#102735');
    sea.addColorStop(1, light ? '#e0e8ee' : '#07141e');
    ctx.fillStyle = sea; ctx.fillRect(0, horizon + 18, width, height - horizon);
    for (let i = 0; i < 70; i++) {
      const ry = horizon + 24 + (i / 70) ** 1.5 * (height - horizon);
      const rx = ((i * 173) % 1000) / 1000 * width + Math.sin(phase * 0.45 + i) * 8;
      const length = 8 + (ry - horizon) * 0.25;
      line([[rx, ry], [rx + length, ry]], light ? 'rgba(255,255,255,0.25)' : 'rgba(126,162,181,0.1)');
    }
    for (let i = 0; i < 30; i++) {
      const ry = horizon + 25 + i * 4;
      const rx = width * 0.81 + Math.sin(i * 2 + phase * 0.5) * 18;
      line([[rx - i * 1.2, ry], [rx + i * 1.2, ry]], light ? 'rgba(159,128,78,0.1)' : `rgba(206,159,96,${0.17 * (1 - i / 30)})`, 1.5);
    }

    // Foreground promenade with the Gateway at the harbour's edge.
    const scale = Math.min(width / 1050, 1.15);
    const gx = width < 600 ? width * 0.76 : width * 0.83;
    const gy = horizon + 38 + y * 3;
    ctx.fillStyle = light ? '#b8bcc0' : '#17252e';
    ctx.beginPath(); ctx.moveTo(width * 0.66, gy + 9); ctx.lineTo(width, gy - 5);
    ctx.lineTo(width, height); ctx.lineTo(width * 0.8, height); ctx.closePath(); ctx.fill();
    gateway(gx + x * 13, gy, scale);
    line([[width * 0.66, gy + 9], [width, gy - 5]], light ? '#a1a9ae' : '#6c6b61');

    // Keep the reading area clear, letting architecture emerge below the hero.
    const veil = ctx.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, light ? 'rgba(245,246,248,0.2)' : 'rgba(5,12,20,0.15)');
    veil.addColorStop(0.35, light ? 'rgba(245,246,248,0.65)' : 'rgba(5,12,20,0.62)');
    veil.addColorStop(0.6, light ? 'rgba(245,246,248,0.2)' : 'rgba(5,12,20,0.18)');
    veil.addColorStop(1, 'rgba(5,12,20,0)');
    ctx.fillStyle = veil; ctx.fillRect(0, 0, width, height);
  }

  function draw(now = 0) {
    frame = 0;
    const interval = pointer.matches ? 1000 / 30 : 1000 / 20;
    if (!dirty && now - lastPaint < interval && !motion.matches && !paused) {
      frame = requestAnimationFrame(draw);
      return;
    }
    const dt = Math.min((now - lastTime) / 1000 || 0, 0.1);
    lastTime = now;
    lastPaint = now;
    if (!motion.matches && !paused) phase += dt;
    x += (targetX - x) * 0.15;
    y += (targetY - y) * 0.15;
    // Rebuild the architecture only when the camera changes by a visible amount.
    if (dirty || Math.abs(x - cachedX) > 0.05 || Math.abs(y - cachedY) > 0.05 || Math.abs(travel - cachedTravel) > 0.025) {
      ctx = scene.getContext('2d');
      paintScene();
      cachedX = x; cachedY = y; cachedTravel = travel;
      dirty = false;
    }
    display.save();
    display.setTransform(1, 0, 0, 1, 0, 0);
    display.drawImage(scene, 0, 0);
    display.restore();
    ctx = display;
    const horizon = height * (width < 600 ? 0.72 : 0.7) + cachedY * 10 - cachedTravel * 18;
    // Only these short water highlights move while the camera is at rest.
    for (let i = 0; i < 18; i++) {
      const ry = horizon + 40 + (i / 18) ** 1.4 * (height - horizon - 45);
      const rx = ((i * 157) % 610) / 1000 * width + Math.sin(phase * 0.6 + i) * 7;
      line([[rx, ry], [rx + 12 + i * 2, ry]], light ? 'rgba(255,255,255,0.2)' : 'rgba(137,176,195,0.09)');
    }
    if (!motion.matches && !paused && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, pointer.matches ? 1.25 : 1);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    scene.width = canvas.width; scene.height = canvas.height;
    display.setTransform(dpr, 0, 0, dpr, 0, 0);
    scene.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true;
    if (!frame) frame = requestAnimationFrame(draw);
  }
  const wake = () => { if (!frame) { lastTime = 0; frame = requestAnimationFrame(draw); } };
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', event => {
    if (motion.matches || paused || !pointer.matches) return;
    targetX = event.clientX / width - 0.5; targetY = event.clientY / height - 0.5;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  addEventListener('journey-progress', event => { travel = motion.matches ? 0 : event.detail; });
  addEventListener('theme-change', () => { light = document.documentElement.dataset.theme === 'light'; dirty = true; wake(); });
  motion.addEventListener('change', () => { targetX = targetY = x = y = 0; travel = 0; dirty = true; wake(); });
  pointer.addEventListener('change', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake();
  });
  if (toggle) toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume background animation' : 'Pause background animation');
    toggle.textContent = paused ? 'Resume scene' : 'Pause scene';
    wake();
  });
  resize();
})();
