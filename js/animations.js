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
  /* ---------- Hero — 3D Wave Grid (Linear.app style) ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    let t = 0;                     // global time
    let scrollSpeed = 0;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();

    window.addEventListener('theme-change', () => {
      currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    });

    /* ── resize ── */
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width  = window.innerWidth;
      height = window.innerHeight;
      canvas.width  = width  * dpr;
      canvas.height = height * dpr;
      canvas.style.width  = width  + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('scroll', () => {
      const cur = window.scrollY;
      scrollSpeed = Math.abs(cur - lastScrollY);
      lastScrollY = cur;
    });

    /* ── Grid parameters ──
       World-space: X left↔right, Z near→far (depth), Y = wave height.
       Camera sits above the plane looking toward the +Z horizon.         */
    const COLS     = 72;    // columns across X
    const ROWS     = 38;    // rows along Z (depth)
    const WORLD_W  = 2800;  // world width (X span)
    const WORLD_D  = 2200;  // world depth (Z span)
    const MAX_WAVE = 95;    // max wave amplitude

    /* Camera / projection */
    const CAM_Y  = 340;    // camera height above plane
    const CAM_Z  = -180;   // camera Z (behind near edge)
    const FOCAL  = 620;    // perspective focal length

    function horizonY() { return height * 0.48; }

    /* ── Perspective projection ── */
    function project(wx, wy, wz) {
      const rx = wx;
      const ry = wy - CAM_Y;
      const rz = wz - CAM_Z;
      if (rz <= 0) return null;
      const s  = FOCAL / rz;
      return { x: width / 2 + rx * s, y: horizonY() - ry * s, s };
    }

    /* ── Wave surface — overlapping sines give organic topology ── */
    function waveH(wx, wz, time) {
      const nx = wx / WORLD_W;
      const nz = wz / WORLD_D;
      return (
        Math.sin(nx * 6.2  + time * 0.55) * 0.42 +
        Math.sin(nz * 5.1  - time * 0.42) * 0.38 +
        Math.sin((nx + nz) * 4.3 + time * 0.28) * 0.22 +
        Math.sin((nx - nz) * 7.8 - time * 0.61) * 0.14 +
        Math.sin(nx * 11.4 + time * 0.18) * 0.08 +
        Math.sin(nz *  9.7 + time * 0.22) * 0.06
      ) * MAX_WAVE;
    }

    /* ── Project an entire row ── */
    function projectRow(r, time) {
      const wz  = (r / ROWS) * WORLD_D;
      const pts = [];
      for (let c = 0; c <= COLS; c++) {
        const wx = -WORLD_W / 2 + (c / COLS) * WORLD_W;
        const wy = waveH(wx, wz, time);
        pts.push(project(wx, wy, wz));
      }
      return pts;
    }

    /* ── Height → colour (sage green palette) ── */
    function hColor(normH, depthFade, isLight) {
      const t01 = (normH + 1) / 2;            // 0 = trough, 1 = peak
      if (isLight) {
        const l = 30 + t01 * 38;
        const a = (0.07 + t01 * 0.26) * (1 - depthFade * 0.80);
        return `hsla(125,28%,${l|0}%,${a.toFixed(3)})`;
      } else {
        const l = 20 + t01 * 54;
        const s = 16 + t01 * 30;
        const a = (0.10 + t01 * 0.58) * (1 - depthFade * 0.82);
        return `hsla(125,${s|0}%,${l|0}%,${a.toFixed(3)})`;
      }
    }

    /* ── Render loop ── */
    function animate() {
      const now   = performance.now();
      let   delta = (now - lastTime) / 16.666;
      lastTime    = now;
      if (delta > 4)   delta = 4;
      if (delta < 0.1) delta = 0.1;

      t           += (0.016 + scrollSpeed * 0.003) * delta;
      scrollSpeed *= Math.pow(0.88, delta);
      if (scrollSpeed < 0.05) scrollSpeed = 0;

      const isLight = currentTheme === 'light';

      ctx.clearRect(0, 0, width, height);

      /* Horizon glow */
      const hY    = horizonY();
      const hGlow = height * 0.40;
      const hGrad = ctx.createRadialGradient(width / 2, hY, 0, width / 2, hY, hGlow);
      if (isLight) {
        hGrad.addColorStop(0,    'rgba(164,203,169,0.50)');
        hGrad.addColorStop(0.40, 'rgba(97,135,100,0.16)');
        hGrad.addColorStop(1,    'rgba(248,249,248,0)');
      } else {
        hGrad.addColorStop(0,    'rgba(180,222,186,0.42)');
        hGrad.addColorStop(0.35, 'rgba(97,135,100,0.20)');
        hGrad.addColorStop(0.75, 'rgba(24,34,26,0.08)');
        hGrad.addColorStop(1,    'rgba(6,7,10,0)');
      }
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, 0, width, height);

      /* Pre-compute all rows */
      const allRows = [];
      for (let r = 0; r <= ROWS; r++) allRows.push(projectRow(r, t));

      /* Draw back-to-front (painter's algorithm) */
      for (let r = ROWS; r >= 0; r--) {
        const df   = r / ROWS;          // depthFade: 0=near bright, 1=far faint
        const pts  = allRows[r];
        const wz   = (r / ROWS) * WORLD_D;

        /* Horizontal lines */
        for (let c = 0; c < COLS; c++) {
          const p0 = pts[c], p1 = pts[c + 1];
          if (!p0 || !p1) continue;
          const wx0  = -WORLD_W / 2 + (c / COLS) * WORLD_W;
          const wx1  = -WORLD_W / 2 + ((c + 1) / COLS) * WORLD_W;
          const h0   = waveH(wx0, wz, t) / MAX_WAVE;
          const h1   = waveH(wx1, wz, t) / MAX_WAVE;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = hColor((h0 + h1) / 2, df, isLight);
          ctx.lineWidth   = Math.max(0.25, (1 - df * 0.75) * 1.15);
          ctx.stroke();
        }

        /* Vertical lines (every 2nd col to keep it elegant) */
        if (r < ROWS) {
          const nPts = allRows[r + 1];
          const dfV  = (r + 0.5) / ROWS;
          for (let c = 0; c <= COLS; c += 2) {
            const p0 = pts[c], p1 = nPts[c];
            if (!p0 || !p1) continue;
            const wx = -WORLD_W / 2 + (c / COLS) * WORLD_W;
            const h0 = waveH(wx, wz, t) / MAX_WAVE;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.strokeStyle = hColor(h0, dfV, isLight);
            ctx.lineWidth   = Math.max(0.15, (1 - dfV * 0.80) * 0.65);
            ctx.stroke();
          }
        }
      }

      /* Radial vignette — draws focus to horizon */
      const vSize = Math.max(width, height) * 0.90;
      const vGrad = ctx.createRadialGradient(width/2, hY, vSize*0.28, width/2, hY, vSize);
      if (isLight) {
        vGrad.addColorStop(0, 'rgba(248,249,248,0)');
        vGrad.addColorStop(1, 'rgba(235,237,235,0.62)');
      } else {
        vGrad.addColorStop(0, 'rgba(6,7,10,0)');
        vGrad.addColorStop(1, 'rgba(4,5,8,0.78)');
      }
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, width, height);

      /* Bottom dissolve — grid fades under hero text */
      const bGrad = ctx.createLinearGradient(0, height * 0.70, 0, height);
      if (isLight) {
        bGrad.addColorStop(0, 'rgba(248,249,248,0)');
        bGrad.addColorStop(1, 'rgba(248,249,248,0.96)');
      } else {
        bGrad.addColorStop(0, 'rgba(6,7,10,0)');
        bGrad.addColorStop(1, 'rgba(6,7,10,0.96)');
      }
      ctx.fillStyle = bGrad;
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
