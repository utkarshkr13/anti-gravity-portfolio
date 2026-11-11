(() => {
  'use strict';

  const canvas = document.getElementById('heroParticles');
  const art = canvas?.parentElement;
  const context = canvas?.getContext('2d');
  if (!art || !context) return;

  const mask = document.createElement('canvas');
  mask.width = 550;
  mask.height = 380;
  const ink = mask.getContext('2d', { willReadFrequently: true });
  if (!ink) return;

  ink.font = 'italic 700 314px Georgia';
  ink.textAlign = 'center';
  ink.textBaseline = 'middle';
  ink.fillText('UR', 270, 198);
  const pixels = ink.getImageData(0, 0, mask.width, mask.height).data;

  let seed = 7029;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const particles = [];
  for (let y = 0; y < mask.height; y += 3) {
    for (let x = 0; x < mask.width; x += 3) {
      const solid = pixels[(y * mask.width + x) * 4 + 3] > 100;
      if (!solid && random() > 0.034) continue;
      const tone = Math.min(4, Math.floor((x / mask.width * 3 + y / mask.height + random()) * 1.04));
      particles.push({
        x: x - 275 + (random() - 0.5) * 4,
        y: y - 193 + (random() - 0.5) * 4,
        z: (random() - 0.5) * (solid ? 48 : 110),
        spread: (random() - 0.5) * 190,
        rise: (random() - 0.5) * 130,
        radius: solid ? 0.65 + random() * 0.95 : 0.4 + random() * 0.75,
        tone,
        alpha: solid ? 0.48 + random() * 0.5 : 0.12 + random() * 0.28
      });
    }
  }

  // A loose stream passes behind the letterforms and breaks up at either end.
  for (let index = 0; index < 1200; index++) {
    const position = random();
    const spread = (random() - 0.5) * (30 + Math.abs(position - 0.5) * 145);
    particles.push({
      x: (position - 0.5) * 560,
      y: 95 * Math.sin(position * Math.PI * 2 - 0.7) + spread,
      z: -64 + random() * 55,
      spread: (random() - 0.5) * 160,
      rise: (random() - 0.5) * 160,
      radius: 0.4 + random() * 1.05,
      tone: Math.min(4, Math.floor(position * 5)),
      alpha: (0.12 + random() * 0.42) * Math.sin(position * Math.PI)
    });
  }

  const dark = ['#bdb0f3', '#eda7c7', '#ffc78c', '#e6e59d', '#a5dba8'];
  const light = ['#684879', '#a33d67', '#9b4c25', '#76651c', '#466842'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const duration = 1550;
  let width = 0;
  let height = 0;
  let visible = false;
  let frame = 0;
  let startedAt;
  let assembled = reduced.matches;
  let pitch = 0;
  let yaw = 0;
  let targetPitch = 0;
  let targetYaw = 0;

  function paint(progress) {
    const palette = document.documentElement.dataset.theme === 'light' ? light : dark;
    const scale = Math.min(width / 550, height / 380);
    const scatter = 1 - progress;
    const turn = yaw - 0.16 - scatter * 0.76;
    const tilt = pitch + 0.12;
    const cosY = Math.cos(turn);
    const sinY = Math.sin(turn);
    const cosX = Math.cos(tilt);
    const sinX = Math.sin(tilt);

    context.clearRect(0, 0, width, height);
    for (const point of particles) {
      const x = point.x + point.spread * scatter;
      const y = point.y + point.rise * scatter;
      const z = point.z + point.spread * scatter * 0.25;
      const turnedX = x * cosY + z * sinY;
      const turnedZ = z * cosY - x * sinY;
      const tiltedY = y * cosX - turnedZ * sinX;
      const depth = y * sinX + turnedZ * cosX;
      const perspective = 620 / (620 - depth);
      const size = Math.max(0.6, point.radius * scale * perspective);
      const drawX = width * 0.5 + turnedX * scale * perspective;
      const drawY = height * 0.48 + tiltedY * scale * perspective;

      context.globalAlpha = point.alpha * (0.38 + progress * 0.62);
      context.fillStyle = palette[point.tone];
      context.fillRect(drawX, drawY, size, size);
    }
    context.globalAlpha = 1;
  }

  function render(now) {
    frame = 0;
    startedAt ??= now;
    const elapsed = assembled ? 1 : Math.min(1, (now - startedAt) / duration);
    assembled = elapsed === 1;
    pitch += (targetPitch - pitch) * 0.14;
    yaw += (targetYaw - yaw) * 0.14;
    paint(1 - Math.pow(1 - elapsed, 3));
    if (!assembled || Math.abs(targetPitch - pitch) + Math.abs(targetYaw - yaw) > 0.002) wake();
  }

  function wake() {
    if (visible && !document.hidden && !frame && width) frame = requestAnimationFrame(render);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  new ResizeObserver(([entry]) => {
    width = entry.contentRect.width;
    height = entry.contentRect.height;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    paint(assembled ? 1 : 0);
    art.dataset.ready = '';
    wake();
  }).observe(art);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
    else {
      if (startedAt !== undefined) assembled = true;
      stop();
    }
  }).observe(art);

  art.addEventListener('pointermove', event => {
    if (reduced.matches || !fine.matches) return;
    const bounds = art.getBoundingClientRect();
    targetYaw = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.55;
    targetPitch = (0.5 - (event.clientY - bounds.top) / bounds.height) * 0.38;
    wake();
  });

  art.addEventListener('pointerleave', () => {
    targetYaw = targetPitch = 0;
    wake();
  });

  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    assembled = true;
    pitch = yaw = targetPitch = targetYaw = 0;
    stop();
    if (width) paint(1);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else wake();
  });

  window.addEventListener('theme-change', () => {
    if (width) paint(1);
  });
})();
