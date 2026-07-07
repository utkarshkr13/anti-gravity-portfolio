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


  }  /* ---------- Hero — Cinematic Warp-Speed Light Trails ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, cx, cy;
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    let timeOffset  = 0;
    let scrollSpeed = 0;
    let lastScrollY = window.scrollY;
    let lastTime    = performance.now();

    window.addEventListener('theme-change', () => {
      currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    });

    /* ---- resize ---- */
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width  = window.innerWidth;
      height = window.innerHeight;
      canvas.width  = width  * dpr;
      canvas.height = height * dpr;
      canvas.style.width  = width  + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      cx = width  / 2;
      cy = height / 2;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('scroll', () => {
      const cur = window.scrollY;
      scrollSpeed = Math.abs(cur - lastScrollY);
      lastScrollY = cur;
    });

    /* ---- streak class ---- */
    class Streak {
      constructor() { this.init(true); }

      init(scatter) {
        /* Random angle from center — full 360° */
        this.angle  = Math.random() * Math.PI * 2;

        /* Start near center, end far out */
        this.startR = scatter ? Math.random() * 60 : 2 + Math.random() * 30;
        this.speed  = 3.5 + Math.random() * 6.5;          // px/frame at 60fps
        this.r      = scatter ? Math.random() * 350 : this.startR;
        this.maxR   = 260 + Math.random() * 420;           // how far it travels

        /* Visual */
        this.baseLen = 18 + Math.random() * 60;            // trail length (grows w/ speed)
        this.width   = 0.5 + Math.random() * 1.5;

        /* Colour — sage green tones with occasional white-hot core */
        const roll = Math.random();
        if (roll < 0.15) {
          this.hue = 0; this.sat = 0; this.lit = 98;       // white-hot
        } else if (roll < 0.45) {
          this.hue = 125; this.sat = 38; this.lit = 78;    // mint
        } else {
          this.hue = 125; this.sat = 22; this.lit = 58;    // sage
        }
        this.alpha  = 0.25 + Math.random() * 0.55;
      }

      update(delta) {
        this.r += (this.speed + scrollSpeed * 0.14) * delta;
        if (this.r >= this.maxR) this.init(false);
      }

      draw() {
        /* Progress 0→1 as streak flies out */
        const progress = (this.r - this.startR) / (this.maxR - this.startR);
        /* Fade in fast, fade out near edge */
        const fade = progress < 0.12
          ? progress / 0.12
          : progress > 0.75
            ? (1 - progress) / 0.25
            : 1;

        const opacity = this.alpha * fade;
        if (opacity < 0.01) return;

        /* Trail length grows as streak accelerates outward */
        const trailLen = this.baseLen * (0.4 + progress * 0.9);

        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        const x1 = cx + cos * this.r;
        const y1 = cy + sin * this.r;
        const x0 = cx + cos * Math.max(this.startR, this.r - trailLen);
        const y0 = cy + sin * Math.max(this.startR, this.r - trailLen);

        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        const col  = `hsla(${this.hue},${this.sat}%,${this.lit}%,`;
        grad.addColorStop(0, col + '0)');
        grad.addColorStop(0.6, col + opacity * 0.6 + ')');
        grad.addColorStop(1,   col + opacity + ')');

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = this.width * (0.5 + progress);
        ctx.lineCap     = 'round';
        ctx.stroke();
      }
    }

    /* ---- pool of streaks ---- */
    const STREAK_COUNT = 220;
    const streaks = Array.from({ length: STREAK_COUNT }, () => new Streak());

    /* ---- render loop ---- */
    function animate() {
      const now   = performance.now();
      let   delta = (now - lastTime) / 16.666;
      lastTime    = now;
      if (delta > 4)   delta = 4;
      if (delta < 0.1) delta = 0.1;

      timeOffset  += (0.6 + scrollSpeed * 0.06) * delta;
      scrollSpeed *= Math.pow(0.90, delta);
      if (scrollSpeed < 0.1) scrollSpeed = 0;

      /* Clear with slight motion-blur trail (NOT full clear — gives glow echo) */
      if (currentTheme === 'light') {
        ctx.fillStyle = 'rgba(245, 247, 245, 0.18)';
      } else {
        ctx.fillStyle = 'rgba(6, 7, 10, 0.22)';
      }
      ctx.fillRect(0, 0, width, height);

      /* Draw streaks */
      ctx.save();
      for (const s of streaks) {
        s.update(delta);
        s.draw();
      }
      ctx.restore();

      /* Central vanishing-point glow — pulsating */
      const pulse     = Math.sin(timeOffset * 0.045) * 10;
      const coreSize  = (currentTheme === 'light' ? 45 : 80) + pulse;
      const coreGrad  = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
      if (currentTheme === 'light') {
        coreGrad.addColorStop(0,   'rgba(164,203,169,0.95)');
        coreGrad.addColorStop(0.35,'rgba(97,135,100,0.40)');
        coreGrad.addColorStop(1,   'rgba(245,247,245,0)');
      } else {
        coreGrad.addColorStop(0,   'rgba(200,230,202,1.0)');
        coreGrad.addColorStop(0.25,'rgba(97,135,100,0.55)');
        coreGrad.addColorStop(0.6, 'rgba(97,135,100,0.10)');
        coreGrad.addColorStop(1,   'rgba(6,7,10,0)');
      }
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
      ctx.fill();

      /* Outer vignette — cinematic letterbox feel */
      const vigSize  = Math.max(width, height) * 0.85;
      const vigGrad  = ctx.createRadialGradient(cx, cy, vigSize * 0.35, cx, cy, vigSize);
      if (currentTheme === 'light') {
        vigGrad.addColorStop(0, 'rgba(245,247,245,0)');
        vigGrad.addColorStop(1, 'rgba(220,222,220,0.55)');
      } else {
        vigGrad.addColorStop(0, 'rgba(6,7,10,0)');
        vigGrad.addColorStop(1, 'rgba(4,5,8,0.72)');
      }
      ctx.fillStyle = vigGrad;
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
