/* ============================================================
   CUSTOM CURSOR — Dot + Ring with GSAP quickTo
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

  // GSAP quickTo for buttery-smooth following
  const dotX = gsap.quickTo(dot, 'left', { duration: 0.15, ease: 'power2.out' });
  const dotY = gsap.quickTo(dot, 'top', { duration: 0.15, ease: 'power2.out' });
  const ringX = gsap.quickTo(ring, 'left', { duration: 0.35, ease: 'power2.out' });
  const ringY = gsap.quickTo(ring, 'top', { duration: 0.35, ease: 'power2.out' });

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    dotX(e.clientX);
    dotY(e.clientY);
    ringX(e.clientX);
    ringY(e.clientY);
  });

  // Hover detection on [data-cursor="hover"] elements
  const hoverTargets = document.querySelectorAll('[data-cursor="hover"]');

  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('hovering');
      ring.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('hovering');
      ring.classList.remove('hovering');
    });
  });

  // Click animation
  document.addEventListener('mousedown', () => dot.classList.add('clicking'));
  document.addEventListener('mouseup', () => dot.classList.remove('clicking'));

  // Hide cursor when leaving the window
  document.addEventListener('mouseleave', () => {
    gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
  });

  // Also track hover for elements added later (e.g. dynamic content)
  const observer = new MutationObserver(() => {
    document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
      if (!el._cursorBound) {
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
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();
