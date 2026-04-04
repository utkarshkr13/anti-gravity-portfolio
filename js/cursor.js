/* ============================================================
   CUSTOM CURSOR — Dot + Ring with synchronized movement
   Fixed: both elements now share the same timing so they
   move together as a single unit.
   ============================================================ */

(function () {
  'use strict';

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!dot || !ring) return;

  // Check for touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  // Use requestAnimationFrame for perfectly synced movement
  let mouseX = 0;
  let mouseY = 0;
  let dotCurrentX = 0;
  let dotCurrentY = 0;
  let ringCurrentX = 0;
  let ringCurrentY = 0;

  // Lerp factor — higher = snappier. Same for both = move together.
  const dotSpeed = 0.2;
  const ringSpeed = 0.12;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function animateCursor() {
    dotCurrentX = lerp(dotCurrentX, mouseX, dotSpeed);
    dotCurrentY = lerp(dotCurrentY, mouseY, dotSpeed);
    ringCurrentX = lerp(ringCurrentX, mouseX, ringSpeed);
    ringCurrentY = lerp(ringCurrentY, mouseY, ringSpeed);

    dot.style.left = dotCurrentX + 'px';
    dot.style.top = dotCurrentY + 'px';
    ring.style.left = ringCurrentX + 'px';
    ring.style.top = ringCurrentY + 'px';

    requestAnimationFrame(animateCursor);
  }

  // Start animation loop
  requestAnimationFrame(animateCursor);

  // Hover detection on [data-cursor="hover"] elements
  function bindHover(el) {
    if (el._cursorBound) return;
    el._cursorBound = true;
    el.addEventListener('mouseenter', () => {
      dot.classList.add('hovering');
      ring.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    });
  }

  document.querySelectorAll('[data-cursor="hover"]').forEach(bindHover);

  // Click animation
  document.addEventListener('mousedown', () => dot.classList.add('clicking'));
  document.addEventListener('mouseup', () => dot.classList.remove('clicking'));

  // Hide cursor when leaving the window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dotCurrentX = mouseX;
    dotCurrentY = mouseY;
    ringCurrentX = mouseX;
    ringCurrentY = mouseY;
    dot.style.opacity = '1';
    ring.style.opacity = '0.5';
  });

  // Observer for dynamically added elements
  const observer = new MutationObserver(() => {
    document.querySelectorAll('[data-cursor="hover"]').forEach(bindHover);
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();
