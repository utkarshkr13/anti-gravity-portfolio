/* ============================================================
   GLOW EFFECT — Radial gradient follows mouse on cards
   Replaces tilt effect with a subtle light gradient
   ============================================================ */

(function () {
  'use strict';

  // All card-like elements that should get the glow
  const glowSelectors = [
    '.timeline-card',
    '.skill-category',
    '.stat-card',
    '.project-card',
    '.cert-card',
    '.contact-link'
  ];

  function createGlowOverlay(card) {
    // Skip if already has a glow overlay
    if (card.querySelector('.glow-overlay')) return;

    const overlay = document.createElement('div');
    overlay.classList.add('glow-overlay');
    card.appendChild(overlay);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Get theme to adjust glow opacity
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const glowOpacity = isDark ? 0.12 : 0.08;

      overlay.style.background = `radial-gradient(
        600px circle at ${x}px ${y}px,
        hsla(210, 40%, 70%, ${glowOpacity}),
        transparent 40%
      )`;
    });

    card.addEventListener('mouseleave', () => {
      overlay.style.background = 'none';
    });
  }

  function initGlow() {
    glowSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(card => {
        createGlowOverlay(card);
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlow);
  } else {
    initGlow();
  }

  // Re-init on dynamic content changes
  const observer = new MutationObserver(() => {
    initGlow();
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();
