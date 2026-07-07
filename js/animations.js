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

  /* ---------- Hero 3D Share Market Tunnel Background ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe'); 
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let tickerActive = true;
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollSpeed = 0;
    let lastScrollY = window.scrollY;
    let timeOffset = 0;

    // Listen for theme-change events
    window.addEventListener('theme-change', () => {
      currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    });

    // 3D coordinate system configuration
    const maxDepth = 1000;
    const focalLength = 320;
    const tunnelRadius = 380;
    
    // Smooth centers for mouse reactive bending (parallax)
    let currentCenterX = 0;
    let currentCenterY = 0;
    
    // Handle viewport resizing
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      
      if (currentCenterX === 0 && currentCenterY === 0) {
        currentCenterX = width / 2;
        currentCenterY = height / 2;
      }
      mouse.targetX = width / 2;
      mouse.targetY = height / 2;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    // Track cursor coordinates
    document.addEventListener('mousemove', (e) => {
      // Scale coordinates to control bending radius
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      mouse.targetX = window.innerWidth / 2 + dx * 0.55;
      mouse.targetY = window.innerHeight / 2 + dy * 0.55;
    });
    
    // Monitor scroll velocity
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      scrollSpeed = Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;
    });

    let lastTime = performance.now();

    // Render loop
    function animate() {
      ctx.clearRect(0, 0, width, height);
      if (!tickerActive) {
        requestAnimationFrame(animate);
        return;
      }
      
      const currentTime = performance.now();
      // Calculate elapsed time delta normalized to 60fps (16.66ms per frame)
      let delta = (currentTime - lastTime) / 16.666;
      lastTime = currentTime;
      
      // Clamp delta to prevent massive jumps when returning to backgrounded tab
      if (delta > 4.0) delta = 4.0;
      if (delta < 0.1) delta = 0.1;
      
      // Update tunnel timeOffset - travels slowly and elegantly (igloo.inc style)
      timeOffset += (0.6 + scrollSpeed * 0.08) * delta;
      
      // Decelerate scroll velocity impact smoothly
      scrollSpeed *= Math.pow(0.92, delta);
      if (scrollSpeed < 0.1) scrollSpeed = 0;
      
      // Interpolate center point for smooth mouse tracking inertia (frame-rate independent)
      // Lerp rate is 0.035 to make camera movements extremely heavy, smooth, and fluid
      currentCenterX += (mouse.targetX - currentCenterX) * (1 - Math.pow(1 - 0.035, delta));
      currentCenterY += (mouse.targetY - currentCenterY) * (1 - Math.pow(1 - 0.035, delta));
      
      // Calculate bending offset vectors
      const dx = currentCenterX - width / 2;
      const dy = currentCenterY - height / 2;
      
      // --- PART 1: Curved Longitudinal Grid Lines (Double-Pass Glowing Neon) ---
      function drawLongitudinalLines(pass) {
        if (currentTheme === 'light') {
          ctx.strokeStyle = pass === 1 
            ? 'rgba(97, 135, 100, 0.06)'  // thicker transparent sage
            : 'rgba(61, 91, 64, 0.25)';    // thinner dark sage
          ctx.lineWidth = pass === 1 ? 3.0 : 0.8;
        } else {
          ctx.strokeStyle = pass === 1 
            ? 'rgba(97, 135, 100, 0.18)'  // thicker transparent sage
            : 'rgba(164, 203, 169, 0.65)'; // thinner glowing light sage
          ctx.lineWidth = pass === 1 ? 4.0 : 1.0;
        }
        
        const radialLinesCount = 24; // slightly denser for extra structure
        for (let j = 0; j < radialLinesCount; j++) {
          const theta = (Math.PI * 2 / radialLinesCount) * j;
          ctx.beginPath();
          
          let first = true;
          // Trace depth points from z = 1000 down to 40
          for (let zVal = 1000; zVal >= 40; zVal -= 30) {
            const scale = focalLength / zVal;
            const offsetFactor = (maxDepth - zVal) / maxDepth;
            const ptCenterX = currentCenterX + dx * 0.85 * offsetFactor;
            const ptCenterY = currentCenterY + dy * 0.85 * offsetFactor;
            
            // Igloo-style organic undulation ripple wave (pulses organically near camera)
            const wave = Math.sin(zVal * 0.006 - timeOffset * 0.03) * 18 * offsetFactor;
            const radius = tunnelRadius + wave;
            
            const ptX = ptCenterX + radius * Math.cos(theta) * scale;
            const ptY = ptCenterY + radius * Math.sin(theta) * scale;
            
            if (first) {
              ctx.moveTo(ptX, ptY);
              first = false;
            } else {
              ctx.lineTo(ptX, ptY);
            }
          }
          ctx.stroke();
        }
      }
      
      drawLongitudinalLines(1);
      drawLongitudinalLines(2);
      
      // --- PART 2: Concentric Depth Rings (Double-Pass Glowing Neon) ---
      const totalRings = 18; // slightly denser concentric rings
      for (let i = 0; i < totalRings; i++) {
        let ringZ = ((i * (maxDepth / totalRings)) - timeOffset) % maxDepth;
        if (ringZ < 0) ringZ += maxDepth;
        if (ringZ < 30 || ringZ > 950) continue;
        
        const scale = focalLength / ringZ;
        const offsetFactor = (maxDepth - ringZ) / maxDepth;
        
        // Igloo-style organic undulation ripple wave matching the longitudinal lines
        const wave = Math.sin(ringZ * 0.006 - timeOffset * 0.03) * 18 * offsetFactor;
        const ringRadius = (tunnelRadius + wave) * scale;
        
        const ringCenterX = currentCenterX + dx * 0.85 * offsetFactor;
        const ringCenterY = currentCenterY + dy * 0.85 * offsetFactor;
        
        // Pass 1: Thicker glowing sage base
        ctx.beginPath();
        ctx.arc(ringCenterX, ringCenterY, ringRadius, 0, Math.PI * 2);
        if (currentTheme === 'light') {
          ctx.strokeStyle = `rgba(97, 135, 100, ${0.06 * scale})`;
          ctx.lineWidth = 3.5;
        } else {
          ctx.strokeStyle = `rgba(97, 135, 100, ${0.18 * scale})`;
          ctx.lineWidth = 4.5;
        }
        ctx.stroke();
        
        // Pass 2: Thinner glowing light sage core
        ctx.beginPath();
        ctx.arc(ringCenterX, ringCenterY, ringRadius, 0, Math.PI * 2);
        if (currentTheme === 'light') {
          ctx.strokeStyle = `rgba(61, 91, 64, ${0.25 * scale})`;
          ctx.lineWidth = 0.8;
        } else {
          ctx.strokeStyle = `rgba(164, 203, 169, ${0.65 * scale})`;
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();
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
