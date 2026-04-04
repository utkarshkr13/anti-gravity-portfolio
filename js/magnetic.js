/* ============================================================
   MAGNETIC BUTTON EFFECT
   Elements with .magnetic-wrap attract toward the cursor
   ============================================================ */

(function () {
  'use strict';

  const magnets = document.querySelectorAll('.magnetic-wrap');
  const strength = 0.35; // 0–1, how strongly the element follows the cursor

  magnets.forEach(magnet => {
    const child = magnet.children[0]; // the actual button/link inside

    magnet.addEventListener('mousemove', (e) => {
      const rect = magnet.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(child, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    magnet.addEventListener('mouseleave', () => {
      gsap.to(child, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });

})();
