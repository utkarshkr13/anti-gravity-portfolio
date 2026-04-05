/* ============================================================
   MAIN — Theme toggle, Lenis smooth scroll, page loader, nav
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Theme Toggle ---------- */
  const html = document.documentElement;
  const THEME_KEY = 'ukr-portfolio-theme';

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  html.setAttribute('data-theme', savedTheme);

  window.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
        
        // Broadcast theme change for Canvas drawing
        window.dispatchEvent(new Event('theme-change'));
      });
    }
  });

  /* ---------- Smooth Scroll (Lenis) ---------- */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- Smooth anchor scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target, { offset: -60 });
      }
    });
  });

  /* ---------- Page Loader ---------- */
  function runLoader() {
    const loader = document.getElementById('pageLoader');
    const loaderName = document.getElementById('loaderName');
    const loaderBar = document.getElementById('loaderBar');

    if (!loader) {
      window.initAnimations();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            // Fire animations after loader
            window.initAnimations();
          }
        });
      }
    });

    tl.to(loaderName, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .to(loaderBar, {
      width: '100%',
      duration: 1.2,
      ease: 'power2.inOut'
    }, '-=0.3')
    .to(loaderName, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.in'
    }, '+=0.1');
  }

  /* ---------- Scroll to Top Button ---------- */
  window.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      lenis.on('scroll', () => {
        if (window.scrollY > 300) {
          scrollTopBtn.classList.add('visible');
        } else {
          scrollTopBtn.classList.remove('visible');
        }
      });

      scrollTopBtn.addEventListener('click', () => {
        lenis.scrollTo(0, { duration: 1.5, ease: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      });
    }
  });

  /* ---------- Run Everything ---------- */
  window.addEventListener('DOMContentLoaded', () => {
    runLoader();
  });

})();
