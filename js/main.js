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
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
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
  /* ---------- Interactive Key-Sequence Easter Eggs ---------- */
  function triggerThunderRain() {
    let flashes = 0;
    let flashInt = setInterval(() => {
      document.body.style.setProperty('background-color', flashes % 2 === 0 ? '#fff' : '', 'important');
      flashes++;
      if (flashes > 5) clearInterval(flashInt);
    }, 100);

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let drops = [];
    for(let i=0; i<300; i++) drops.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vy: 15 + Math.random()*15, l: 20 + Math.random()*20 });

    function draw() {
      if(!canvas.parentElement) return;
      ctx.clearRect(0,0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(174,194,224,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      drops.forEach(d => {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.l);
        d.y += d.vy;
        if (d.y > canvas.height) d.y = -d.l;
      });
      ctx.stroke();
      requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => { canvas.style.opacity = 0; canvas.style.transition = 'opacity 2s'; setTimeout(()=>canvas.remove(),2000)}, 6000);
  }

  function triggerAntiGravity() {
    document.querySelectorAll('section, nav, .btn, .timeline-item, .stat-card, .project-card, .cert-card').forEach(el => {
      gsap.to(el, {
        y: () => -Math.random() * 800 - 200,
        x: () => (Math.random() - 0.5) * 400,
        rotation: () => (Math.random() - 0.5) * 90,
        opacity: 0,
        duration: 4 + Math.random() * 6,
        ease: 'power1.inOut'
      });
    });
  }

  // Hacker Console Art
  console.log(`%c
██╗   ██╗████████╗██╗  ██╗ █████╗ ██████╗ ███████╗██╗  ██╗
██║   ██║╚══██╔══╝██║ ██╔╝██╔══██╗██╔══██╗██╔════╝██║  ██║
██║   ██║   ██║   █████╔╝ ███████║██████╔╝███████╗███████║
██║   ██║   ██║   ██╔═██╗ ██╔══██║██╔══██╗╚════██║██╔══██║
╚██████╔╝   ██║   ██║  ██╗██║  ██║██║  ██║███████║██║  ██║
 ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
  `, "color: #3b82f6; font-weight: bold; font-size: 14px;");
  console.log("%cHello Recruiter! Welcome to the Matrix. Thanks for checking under the hood.", "color: #22c55e; font-size: 16px;");

  let keySequence = '';
  const konami = 'arrowuparrowuparrowdownarrowdownarrowleftarrowrightarrowleftarrowrightba';
  
  window.addEventListener('keydown', (e) => {
    if (e.key) keySequence += e.key.toLowerCase();
    if (keySequence.length > 100) keySequence = keySequence.slice(-100);

    if (keySequence.includes('hire')) {
      keySequence = '';
      if(window.confetti) confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, zIndex: 999999 });
    }
    if (keySequence.includes('salescode')) {
      keySequence = '';
      triggerThunderRain();
    }
    if (keySequence.includes(konami)) {
      keySequence = '';
      triggerAntiGravity();
    }
  });

  /* ---------- Run Everything ---------- */
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }

})();
