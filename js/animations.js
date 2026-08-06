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
  /* ---------- Hero — Full-Screen Dot Wave Matrix (Claude-style) with 3D depth, gravity well, and shockwaves ---------- */
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

    /* ── Shockwave Click Ripples ── */
    let activeRipples = [];

    window.addEventListener('theme-change', () => {
      currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    });
    window.addEventListener('mousemove', e => { tmx = e.clientX; tmy = e.clientY; });
    window.addEventListener('touchmove', e => {
      tmx = e.touches[0].clientX;
      tmy = e.touches[0].clientY;
    }, { passive: true });

    // Track clicks on the window to spawn shockwaves
    window.addEventListener('mousedown', e => {
      activeRipples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(window.innerWidth, window.innerHeight) * 1.2,
        speed: 15,
        thickness: 90,
        intensity: 1.0
      });
    });

    /* ── 3D Parallax Layers Definition ── */
    const layers = [
      {
        z: 0.6,          // Depth factor (furthest)
        spacing: 42,
        dotRadius: 0.45,
        alphaMult: 0.3,
        dots: []
      },
      {
        z: 1.0,          // Depth factor (midground)
        spacing: 34,
        dotRadius: 0.75,
        alphaMult: 0.6,
        dots: []
      },
      {
        z: 1.5,          // Depth factor (closest)
        spacing: 26,
        dotRadius: 1.1,
        alphaMult: 0.9,
        dots: []
      }
    ];

    function buildGrid() {
      layers.forEach(layer => {
        layer.dots = [];
        const cols = Math.ceil(width  / layer.spacing) + 4;
        const rows = Math.ceil(height / layer.spacing) + 4;
        // Start slightly negative to handle offsets and parallax shift
        for (let r = -2; r < rows; r++) {
          for (let c = -2; c < cols; c++) {
            layer.dots.push({
              ox: c * layer.spacing, // original x
              oy: r * layer.spacing  // original y
            });
          }
        }
      });
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

    /* ── Wave amplitude and structure ── */
    function getWaveValue(x, y, z) {
      // Ambient waves: differ slightly by depth z to animate layers independently
      const amb = (
        Math.sin(x * 0.013 + y * 0.009 + t * 0.5 * z) * 0.35 +
        Math.sin(x * 0.009 - y * 0.012 - t * 0.4 * z) * 0.30 +
        Math.sin((x + y) * 0.008 + t * 0.3 * z) * 0.20 +
        Math.sin((x - y) * 0.006 - t * 0.45 * z) * 0.15
      );
      return Math.max(-1, Math.min(1, amb));
    }

    /* ── Render loop ── */
    function animate() {
      const now   = performance.now();
      let   delta = (now - lastTime) / 16.666;
      lastTime    = now;
      if (delta > 4)   delta = 4;
      if (delta < 0.1) delta = 0.1;

      t  += 0.014 * delta;

      /* Smooth mouse interpolation */
      const ease = 1 - Math.pow(0.90, delta);
      mx += (tmx - mx) * ease;
      my += (tmy - my) * ease;

      // Update ripples
      activeRipples.forEach(ripple => {
        ripple.radius += ripple.speed * delta;
        ripple.intensity *= Math.pow(0.965, delta); // decay over time
      });
      // Remove dead ripples
      activeRipples = activeRipples.filter(r => r.intensity > 0.02 && r.radius < r.maxRadius);

      const isLight = currentTheme === 'light';
      ctx.clearRect(0, 0, width, height);

      /* ── Draw layers from back to front ── */
      layers.forEach(layer => {
        // Parallax offset based on depth (z-factor)
        const px = (mx - width / 2) * (layer.z - 1.0) * 0.05;
        const py = (my - height / 2) * (layer.z - 1.0) * 0.05;

        for (const dot of layer.dots) {
          // 1. Calculate actual base coordinates after parallax offset
          let x = dot.ox + px;
          let y = dot.oy + py;

          // 2. Mouse Gravity Well effect: pulls dots toward the mouse
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const gravityRadius = 260;

          if (dist < gravityRadius && dist > 1) {
            // Stronger pull closer to cursor, fading to zero at gravityRadius
            const force = (gravityRadius - dist) / gravityRadius;
            // Displacement scale factor: higher layer means closer to screen, moves more
            const pull = force * force * 35 * (1.0 / layer.z);
            x -= (dx / dist) * pull;
            y -= (dy / dist) * pull;
          }

          // 3. Shockwave Click Ripples: displace dots along the wave boundary
          let rippleDisplacementX = 0;
          let rippleDisplacementY = 0;
          let rippleOpacityBoost = 0;

          activeRipples.forEach(ripple => {
            const rdx = x - ripple.x;
            const rdy = y - ripple.y;
            const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
            
            // If dot is near the wave boundary
            const distFromWave = Math.abs(rdist - ripple.radius);
            if (distFromWave < ripple.thickness) {
              const waveFactor = 1.0 - (distFromWave / ripple.thickness); // 0 at edge, 1 at peak
              const pushForce = waveFactor * waveFactor * 45 * ripple.intensity;
              
              // Displace outwards from click center
              if (rdist > 0) {
                rippleDisplacementX += (rdx / rdist) * pushForce;
                rippleDisplacementY += (rdy / rdist) * pushForce;
              }
              // Brightness boost on the ripple peak
              rippleOpacityBoost += waveFactor * ripple.intensity * 0.7;
            }
          });

          x += rippleDisplacementX;
          y += rippleDisplacementY;

          // Skip drawing if dot is off-screen
          if (x < -20 || x > width + 20 || y < -20 || y > height + 20) {
            continue;
          }

          // 4. Wave undulation + mouse proximity glow
          const wv  = getWaveValue(x, y, layer.z);
          // Mouse proximity glow factor
          const glow = Math.exp(-dist * 0.0018) * 0.70;
          const t01 = Math.max(-1, Math.min(1, wv * 0.6 + glow * 0.4 + rippleOpacityBoost));
          const normVal = (t01 + 1) * 0.5; // 0..1

          /* Radius: scales with layer depth and wave height */
          const radius = layer.dotRadius * (0.6 + normVal * 1.5);

          /* Alpha: layered baseline + wave influence */
          let alpha = isLight
            ? (0.02 + normVal * 0.22) * layer.alphaMult
            : (0.03 + normVal * 0.45) * layer.alphaMult;

          // Apply extra opacity boost from shockwaves
          alpha = Math.min(0.9, alpha + rippleOpacityBoost * 0.4);

          if (alpha < 0.008) continue;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 6.2832);

          // Render dot with HSL based on current theme
          if (isLight) {
            // Darker forest green/sage on light theme
            const l = 25 + normVal * 20;
            ctx.fillStyle = `hsla(125, 26%, ${l | 0}%, ${alpha.toFixed(3)})`;
          } else {
            // Mint green glowing on dark theme
            const l = 40 + normVal * 42;
            const s = 18 + normVal * 22;
            ctx.fillStyle = `hsla(125, ${s | 0}%, ${l | 0}%, ${alpha.toFixed(3)})`;
          }
          ctx.fill();
        }
      });

      /* ── Soft cursor spotlight (always midground depth) ── */
      const spotR  = 200;
      const spotG  = ctx.createRadialGradient(mx, my, 0, mx, my, spotR);
      if (isLight) {
        spotG.addColorStop(0,   'rgba(97,135,100,0.08)');
        spotG.addColorStop(0.5, 'rgba(97,135,100,0.03)');
        spotG.addColorStop(1,   'rgba(97,135,100,0)');
      } else {
        spotG.addColorStop(0,   'rgba(164,203,169,0.12)');
        spotG.addColorStop(0.5, 'rgba(97,135,100,0.04)');
        spotG.addColorStop(1,   'rgba(97,135,100,0)');
      }
      ctx.fillStyle = spotG;
      ctx.fillRect(mx - spotR, my - spotR, spotR * 2, spotR * 2);

      /* ── Edge vignette ── */
      const vR   = Math.max(width, height) * 0.85;
      const vG   = ctx.createRadialGradient(
        width / 2, height / 2, vR * 0.25,
        width / 2, height / 2, vR
      );
      if (isLight) {
        vG.addColorStop(0, 'rgba(248,249,248,0)');
        vG.addColorStop(1, 'rgba(230,232,230,0.55)');
      } else {
        vG.addColorStop(0, 'rgba(8,9,12,0)');
        vG.addColorStop(1, 'rgba(4,5,8,0.70)');
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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Standard fade-up reveals
    gsap.utils.toArray('.reveal').forEach(el => {
      // Skip hero reveals — they're handled by the hero timeline
      if (el.closest('.hero')) return;

      // If already in viewport or reduced motion: snap to final state immediately
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (prefersReducedMotion || inView) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }

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
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });

    // Left reveals
    gsap.utils.toArray('.reveal-left').forEach(el => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (prefersReducedMotion || inView) {
        gsap.set(el, { opacity: 1, x: 0 });
        return;
      }
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
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });

    // Right reveals
    gsap.utils.toArray('.reveal-right').forEach(el => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (prefersReducedMotion || inView) {
        gsap.set(el, { opacity: 1, x: 0 });
        return;
      }
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
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });

    // Scale reveals (project cards)
    gsap.utils.toArray('.reveal-scale').forEach(el => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (prefersReducedMotion || inView) {
        gsap.set(el, { opacity: 1, scale: 1 });
        return;
      }
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
            toggleActions: 'play none none none',
            once: true
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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = gsap.utils.toArray('.timeline-item');
    items.forEach((item, i) => {
      if (prefersReducedMotion) {
        gsap.set(item, { opacity: 1, y: 0 });
        return;
      }
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
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });
  }

  /* ---------- Text Letter Reveal ---------- */
  function initTextLetterReveals() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = document.querySelectorAll('.text-letter-reveal');
    revealElements.forEach(el => {
      const text = el.textContent.trim();
      el.textContent = '';
      
      // Wrap characters in spans
      const chars = text.split('').map(char => {
        const span = document.createElement('span');
        span.className = 'reveal-char';
        span.textContent = char === ' ' ? '\u00A0' : char; // use non-breaking space
        el.appendChild(span);
        return span;
      });

      // If reduced motion: show all chars immediately
      if (prefersReducedMotion) {
        gsap.set(chars, { opacity: 1, y: '0%', rotateX: 0 });
        return;
      }

      // Check if element is already in viewport — snap if so
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        gsap.set(chars, { opacity: 1, y: '0%', rotateX: 0 });
        return;
      }

      // Animate characters via GSAP ScrollTrigger
      gsap.fromTo(chars,
        { opacity: 0, y: '30%', rotateX: -20 },
        {
          opacity: 1,
          y: '0%',
          rotateX: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.02,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Fallback: if ScrollTrigger fails or gets stuck after entering viewport, force snap after 1.2s
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                gsap.set(chars, { opacity: 1, y: '0%', rotateX: 0 });
              }, 1200);
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.05 });
        observer.observe(el);
      }
    });
  }

  window.initAnimations = function () {
    initHeroAnimations();
    // initParticles is NOT called here by default.
    // The YouTube background replaces particles.
    // If YouTube fails, showParticleFallback() in index.html calls window._startParticlesFallback().
    initAboutSlider();
    initScrollReveals();
    initNavBarScroll();
    initActiveNavLink();
    initSkillTagFloat();
    initTimelineStagger();
    initTextLetterReveals();
  };

  // Called by the YouTube fallback handler if video fails to load
  window._startParticlesFallback = function () {
    if (window._particlesStarted) return;
    window._particlesStarted = true;
    initParticles();
  };

})();
