/* ============================================================
   GSAP ANIMATIONS — ScrollTrigger, Hero, Counters, Reveals
   ============================================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

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

  /* ---------- Hero mouse parallax (glow follows cursor) ---------- */
  function initHeroParallax() {
    const heroGlow = document.getElementById('heroGlow');
    const hero = document.getElementById('hero');

    if (!heroGlow || !hero) return;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(heroGlow, {
        x: x - 300,
        y: y - 300,
        duration: 1.2,
        ease: 'power2.out'
      });
    });
  }

  /* ---------- Hero Interactive 3D Globe ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const mouse = { x: 0, y: 0 };
    const numParticles = 600;
    const radius = 350; 

    function initGlobe() {
      particles = [];
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const angleIncrement = Math.PI * 2 * goldenRatio;

      for (let i = 0; i < numParticles; i++) {
        const t = i / numParticles;
        const inclination = Math.acos(1 - 2 * t);
        const azimuth = angleIncrement * i;

        const x = radius * Math.sin(inclination) * Math.cos(azimuth);
        const y = radius * Math.cos(inclination);
        const z = radius * Math.sin(inclination) * Math.sin(azimuth);

        particles.push({ x, y, z });
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    window.addEventListener('resize', resize);
    resize();
    initGlobe();

    document.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / width - 0.5) * 2;
      mouse.y = (e.clientY / height - 0.5) * 2;
    });

    let rotationY = 0;
    let rotationX = 0;

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Spin smoothly, influenced by cursor
      rotationY += 0.003 + (mouse.x * 0.005);
      rotationX += (mouse.y * 0.005 - rotationX) * 0.05; // spring to mouse Y

      const sinY = Math.sin(rotationY);
      const cosY = Math.cos(rotationY);
      const sinX = Math.sin(rotationX);
      const cosX = Math.cos(rotationX);

      // Determine dot color based on active theme
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const colorPrefix = isLight ? '0, 0, 0' : '255, 255, 255';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 3D Rotation Matrix
        let rotX = p.x * cosY - p.z * sinY;
        let rotZ = p.z * cosY + p.x * sinY;

        let rotY2 = p.y * cosX - rotZ * sinX;
        let rotZ2 = rotZ * cosX + p.y * sinX;

        // Perspective Projection
        const scale = 1000 / (1000 + rotZ2);
        const projX = width / 2 + rotX * scale;
        const projY = height / 2 + rotY2 * scale;

        // Alpha fade for depth (further away = darker/smaller)
        const depthAlpha = Math.max(0.1, (rotZ2 + radius) / (radius * 2));
        
        ctx.beginPath();
        ctx.arc(projX, projY, 1.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorPrefix}, ${depthAlpha * 0.8})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ---------- About Section Image Slider ---------- */
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
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const currentScroll = self.scroll();
        if (currentScroll > 100) {
          if (currentScroll > lastScroll && self.direction === 1) {
            navbar.classList.add('hidden');
          } else {
            navbar.classList.remove('hidden');
          }
        } else {
          navbar.classList.remove('hidden');
        }
        lastScroll = currentScroll;
      }
    });
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

  /* ---------- Expose init function ---------- */
  window.initAnimations = function () {
    initHeroAnimations();
    initHeroParallax();
    initParticles();
    initAboutSlider();
    initScrollReveals();
    initNavBarScroll();
    initActiveNavLink();
    initSkillTagFloat();
    initTimelineStagger();
  };

})();
