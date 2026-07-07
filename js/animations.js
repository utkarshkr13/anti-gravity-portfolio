/* ============================================================
   GSAP ANIMATIONS — ScrollTrigger, Hero, Counters, Reveals
   ============================================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, Flip);

  /* ---------- Hero animations ---------- */
  function initHeroAnimations() {
    const tl = gsap.timeline({ delay: 0.2 });

    // Text reveal — slide up each line
    tl.to('.hero-title-inner', {
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
      stagger: 0.15
    });

    // Fade in greeting, subtitle, CTAs, scroll indicator
    tl.to('.hero .reveal', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.12
    }, '-=0.6');


  }
  /* ---------- Hero — Full-Screen Dot Wave Matrix (Claude-style) ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe');
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    let width, height;
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    let t        = 0;
    let lastTime = performance.now();

    /* ── Smooth mouse / touch tracking ── */
    let mx = 0, my = 0;       // lerped (smooth) position
    let tmx = 0, tmy = 0;     // raw target position

    window.addEventListener('theme-change', () => {
      currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    });
    window.addEventListener('mousemove', e => { tmx = e.clientX; tmy = e.clientY; });
    window.addEventListener('touchmove', e => {
      tmx = e.touches[0].clientX;
      tmy = e.touches[0].clientY;
    }, { passive: true });

    /* ── Dot grid ── */
    const SPACING = 36;   // px between dots — tweak for density
    let dots = [];

    function buildGrid() {
      dots = [];
      const cols = Math.ceil(width  / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: c * SPACING, y: r * SPACING });
        }
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width  = window.innerWidth;
      height = window.innerHeight;
      canvas.width  = width  * dpr;
      canvas.height = height * dpr;
      canvas.style.width  = width  + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      /* Initialise mouse to center so grid isn't dark on load */
      mx = tmx = width  / 2;
      my = tmy = height / 2;
      buildGrid();
    }
    window.addEventListener('resize', resize);
    resize();

    /* ── Per-frame wave value for a dot at (x, y) ──
       Returns a number roughly in −1 … +1.
       Three layers:
         1. Slow ambient undulation (always running, 4 overlapping sine waves)
         2. Ripple from mouse  (sin wave expanding outward, decays with distance)
         3. Proximity glow    (dots very close to cursor are always bright)        */
    function waveValue(x, y) {
      /* 1 — ambient */
      const amb = (
        Math.sin(x * 0.013 + y * 0.009 + t * 0.65) * 0.32 +
        Math.sin(x * 0.009 - y * 0.012 - t * 0.48) * 0.28 +
        Math.sin((x + y) * 0.008 + t * 0.38) * 0.22 +
        Math.sin((x - y) * 0.006 - t * 0.52) * 0.18
      );  /* range ≈ ±1 */

      /* 2 — mouse ripple */
      const dx   = x - mx;
      const dy   = y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ripple = Math.sin(dist * 0.020 - t * 5.0) * Math.exp(-dist * 0.0030);

      /* 3 — proximity glow (Gaussian falloff, peaks right at cursor) */
      const prox = Math.exp(-dist * 0.0016) * 0.75;

      /* Blend — clamp to −1…+1 */
      return Math.max(-1, Math.min(1, amb * 0.55 + ripple * 0.55 + prox));
    }

    /* ── Render loop ── */
    function animate() {
      const now   = performance.now();
      let   delta = (now - lastTime) / 16.666;
      lastTime    = now;
      if (delta > 4)   delta = 4;
      if (delta < 0.1) delta = 0.1;

      t  += 0.014 * delta;

      /* Smooth mouse interpolation — easing factor tuned for responsiveness */
      const ease = 1 - Math.pow(0.90, delta);
      mx += (tmx - mx) * ease;
      my += (tmy - my) * ease;

      const isLight = currentTheme === 'light';
      ctx.clearRect(0, 0, width, height);

      /* ── Draw all dots ── */
      for (const dot of dots) {
        const wv  = waveValue(dot.x, dot.y);
        const t01 = (wv + 1) * 0.5;   /* 0 = trough, 1 = peak */

        /* Dot radius: 0.55 at rest → 2.6 at peak */
        const radius = 0.55 + t01 * 2.05;

        /* Opacity */
        const alpha = isLight
          ? 0.04 + t01 * 0.32   /* light mode: very subtle */
          : 0.05 + t01 * 0.55;  /* dark mode:  vivid peaks */

        if (alpha < 0.015) continue;  /* skip near-invisible dots */

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, 6.2832);

        /* Colour: sage green, brighter at peaks */
        if (isLight) {
          /* dark sage on light bg */
          const l = 30 + t01 * 22;
          ctx.fillStyle = `hsla(125,26%,${l | 0}%,${alpha.toFixed(3)})`;
        } else {
          /* mint→white on dark bg */
          const l = 38 + t01 * 44;
          const s = 20 + t01 * 24;
          ctx.fillStyle = `hsla(125,${s | 0}%,${l | 0}%,${alpha.toFixed(3)})`;
        }
        ctx.fill();
      }

      /* ── Soft cursor spotlight ── */
      const spotR  = 180;
      const spotG  = ctx.createRadialGradient(mx, my, 0, mx, my, spotR);
      if (isLight) {
        spotG.addColorStop(0,   'rgba(97,135,100,0.10)');
        spotG.addColorStop(0.5, 'rgba(97,135,100,0.04)');
        spotG.addColorStop(1,   'rgba(97,135,100,0)');
      } else {
        spotG.addColorStop(0,   'rgba(164,203,169,0.14)');
        spotG.addColorStop(0.5, 'rgba(97,135,100,0.05)');
        spotG.addColorStop(1,   'rgba(97,135,100,0)');
      }
      ctx.fillStyle = spotG;
      ctx.fillRect(mx - spotR, my - spotR, spotR * 2, spotR * 2);

      /* ── Edge vignette — darkens corners, keeps focus central ── */
      const vR   = Math.max(width, height) * 0.85;
      const vG   = ctx.createRadialGradient(
        width / 2, height / 2, vR * 0.25,
        width / 2, height / 2, vR
      );
      if (isLight) {
        vG.addColorStop(0, 'rgba(248,249,248,0)');
        vG.addColorStop(1, 'rgba(230,232,230,0.60)');
      } else {
        vG.addColorStop(0, 'rgba(8,9,12,0)');
        vG.addColorStop(1, 'rgba(4,5,8,0.75)');
      }
      ctx.fillStyle = vG;
      ctx.fillRect(0, 0, width, height);

      requestAnimationFrame(animate);
    }
    animate();
  }

  function initAboutSlider() {
    const slider = document.getElementById('aboutSlider');
    const container = document.getElementById('aboutGridContainer');
    const indicators = document.querySelectorAll('#sliderIndicators .indicator-dot');
    
    if (!slider || !container) return;

    const slides = slider.querySelectorAll('.about-slide');
    if (slides.length <= 1) return;

    let currentIndex = 0;
    
    function showNextSlide() {
      // Remove active from old
      slides[currentIndex].classList.remove('active');
      if (indicators[currentIndex]) {
        indicators[currentIndex].classList.remove('active');
        // Force reflow to restart css animation
        void indicators[currentIndex].offsetWidth;
      }

      // Advance
      currentIndex = (currentIndex + 1) % slides.length;
      
      // Add active to new
      slides[currentIndex].classList.add('active');
      if (indicators[currentIndex]) {
        indicators[currentIndex].classList.add('active');
      }
      
      const bgColor = slides[currentIndex].dataset.color;
      if (bgColor) {
        container.style.setProperty('--slide-accent', bgColor);
      }
    }

    // Set initial color
    const initialColor = slides[0].dataset.color;
    if (initialColor) {
        container.style.setProperty('--slide-accent', initialColor);
    }

    // Change slide every 4 seconds
    setInterval(showNextSlide, 4000);
  }

  /* ---------- Scroll-triggered reveal animations ---------- */
  function initScrollReveals() {
    // Standard fade-up reveals
    gsap.utils.toArray('.reveal').forEach(el => {
      // Skip hero reveals — they're handled by the hero timeline
      if (el.closest('.hero')) return;

      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Left reveals
    gsap.utils.toArray('.reveal-left').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Right reveals
    gsap.utils.toArray('.reveal-right').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Scale reveals (project cards)
    gsap.utils.toArray('.reveal-scale').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  /* ---------- Counter animation ---------- */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'), 10);

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            innerText: target,
            duration: 1.5,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate: function () {
              counter.textContent = Math.round(parseFloat(counter.textContent)) + '+';
            }
          });
        }
      });
    });
  }

  /* ---------- Navbar hide/show on scroll direction ---------- */
  function initNavBarScroll() {
    // Disabled dynamically hiding navbar to prevent inertial smooth-scroll jitter bugs.
    // The navbar will remain permanently locked and fully visible.
  }

  /* ---------- Active nav link on scroll ---------- */
  function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => setActiveLink(section.id),
        onEnterBack: () => setActiveLink(section.id)
      });
    });

    function setActiveLink(id) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  }

  /* ---------- Skill tags floating animation ---------- */
  function initSkillTagFloat() {
    gsap.utils.toArray('.skill-tag').forEach((tag, i) => {
      gsap.to(tag, {
        y: -3,
        duration: 1.5 + (i % 5) * 0.3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: (i % 7) * 0.2
      });
    });
  }

  /* ---------- Timeline stagger ---------- */
  function initTimelineStagger() {
    const items = gsap.utils.toArray('.timeline-item');
    items.forEach((item, i) => {
      gsap.fromTo(item, 
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  window.initAnimations = function () {
    initHeroAnimations();
    initParticles();
    initAboutSlider();
    initScrollReveals();
    initNavBarScroll();
    initActiveNavLink();
    initSkillTagFloat();
    initTimelineStagger();
  };

})();
