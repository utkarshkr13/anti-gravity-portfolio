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


  }  /* ---------- Hero 3D Share Market Tunnel Background ---------- */
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

    // 3D coordinate system configuration (Extended depth to create infinite tunnel effect)
    const maxDepth = 2500;
    const focalLength = 320;
    const tunnelRadius = 380;
    
    // Smooth centers (Locked at screen center to remove mouse parallax)
    let currentCenterX = 0;
    let currentCenterY = 0;

    // Floating Ambient Light Motes for high-end depth layers
    class LightMote {
      constructor(z) {
        this.reset(z);
      }
      reset(zValue) {
        this.z = zValue !== undefined ? zValue : maxDepth;
        const angle = Math.random() * Math.PI * 2;
        // Distribute them inside the cylinder tunnel space
        const radius = (tunnelRadius * 0.2) + Math.random() * (tunnelRadius * 0.85);
        this.x = Math.cos(angle) * radius;
        this.y = Math.sin(angle) * radius;
        this.size = 0.8 + Math.random() * 2.0;
        this.speedZ = 1.0 + Math.random() * 1.6;
        this.driftSpeed = 0.01 + Math.random() * 0.02;
        this.driftOffset = Math.random() * 100;
      }
      update(delta) {
        this.z -= (this.speedZ + scrollSpeed * 0.12) * delta;
        if (this.z <= 10) {
          this.reset(maxDepth);
        }
      }
      draw(centerX, centerY) {
        const scale = focalLength / this.z;
        // Slow float drift
        const dx = Math.sin(timeOffset * this.driftSpeed + this.driftOffset) * 12;
        const dy = Math.cos(timeOffset * this.driftSpeed + this.driftOffset) * 12;
        
        const screenX = centerX + (this.x + dx) * scale;
        const screenY = centerY + (this.y + dy) * scale;
        
        let opacity = scale * 1.2;
        if (this.z > 1800) opacity *= (maxDepth - this.z) / 700;
        else if (this.z < 100) opacity *= (this.z - 10) / 90;
        opacity = Math.min(0.65, Math.max(0, opacity));
        
        if (opacity < 0.02) return;
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size * scale, 0, Math.PI * 2);
        if (currentTheme === 'light') {
          ctx.fillStyle = `rgba(97, 135, 100, ${opacity * 0.5})`;
        } else {
          ctx.fillStyle = `rgba(164, 203, 169, ${opacity * 0.8})`;
        }
        ctx.fill();
      }
    }

    let motes = [];
    const moteCount = 80;
    for (let i = 0; i < moteCount; i++) {
      motes.push(new LightMote(10 + (maxDepth / moteCount) * i));
    }
    
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
      
      currentCenterX = width / 2;
      currentCenterY = height / 2;
      mouse.targetX = width / 2;
      mouse.targetY = height / 2;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
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
      
      // Locked camera centers for a stable, clean Apple-style aesthetic
      currentCenterX = width / 2;
      currentCenterY = height / 2;
      
      // --- PART 1: Soft Longitudinal Light Ribbons (Apple Aesthetic) ---
      function drawLongitudinalLines() {
        const radialLinesCount = 16; // Cleaner, less busy structure
        
        for (let j = 0; j < radialLinesCount; j++) {
          const theta = (Math.PI * 2 / radialLinesCount) * j;
          ctx.beginPath();
          
          let first = true;
          // Trace depth points from maxDepth down to 40
          for (let zVal = maxDepth; zVal >= 40; zVal -= 50) {
            const scale = focalLength / zVal;
            const offsetFactor = (maxDepth - zVal) / maxDepth;
            
            // Waving ripple effect
            const wave = Math.sin(zVal * 0.005 - timeOffset * 0.03) * 15 * offsetFactor;
            const radius = tunnelRadius + wave;
            
            const ptX = currentCenterX + radius * Math.cos(theta) * scale;
            const ptY = currentCenterY + radius * Math.sin(theta) * scale;
            
            if (first) {
              ctx.moveTo(ptX, ptY);
              first = false;
            } else {
              ctx.lineTo(ptX, ptY);
            }
          }
          
          // Draw as a soft, wide ribbon of light that scales with Z-depth
          if (currentTheme === 'light') {
            ctx.strokeStyle = 'rgba(97, 135, 100, 0.035)';
          } else {
            ctx.strokeStyle = 'rgba(164, 203, 169, 0.07)';
          }
          ctx.lineWidth = 3.5;
          ctx.stroke();
        }
      }
      
      drawLongitudinalLines();
      
      // --- PART 2: Volumetric Hollow Segmented Glass Rings (Alternating Rotations) ---
      const totalRings = 24; 
      for (let i = 0; i < totalRings; i++) {
        let ringZ = ((i * (maxDepth / totalRings)) - timeOffset) % maxDepth;
        if (ringZ < 0) ringZ += maxDepth;
        if (ringZ < 30 || ringZ > 2450) continue;
        
        const scale = focalLength / ringZ;
        const offsetFactor = (maxDepth - ringZ) / maxDepth;
        
        // Waving ripple wave matching the longitudinal lines
        const wave = Math.sin(ringZ * 0.005 - timeOffset * 0.03) * 15 * offsetFactor;
        const baseRadius = tunnelRadius + wave;
        
        // Solid volumetric body: outer and inner ring boundaries
        const outerRadius = (baseRadius + 20) * scale;
        const innerRadius = (baseRadius - 20) * scale;
        
        // Fade out rings near the horizon
        let opacityMultiplier = 1.0;
        if (ringZ > 1800) {
          opacityMultiplier = (maxDepth - ringZ) / 700;
        }
        const opacity = scale * 1.5 * opacityMultiplier;
        if (opacity < 0.02) continue;
        
        // High-end alternating slow rotation for each segment washer
        const rotDir = (i % 2 === 0) ? 1 : -1;
        const ringAngle = timeOffset * 0.005 * rotDir + (i * 0.12);
        
        // Draw 3 curved hollow glass segments with gaps (scifi/telemetry look)
        const segments = 3;
        for (let s = 0; s < segments; s++) {
          const startAngle = ringAngle + (s * Math.PI * 2 / segments);
          const endAngle = startAngle + (Math.PI * 2 / segments * 0.72); // 72% segment, 28% gap
          
          ctx.beginPath();
          ctx.arc(currentCenterX, currentCenterY, outerRadius, startAngle, endAngle);
          ctx.arc(currentCenterX, currentCenterY, innerRadius, endAngle, startAngle, true);
          if (currentTheme === 'light') {
            ctx.fillStyle = `rgba(97, 135, 100, ${0.06 * opacity})`;
          } else {
            ctx.fillStyle = `rgba(97, 135, 100, ${0.14 * opacity})`;
          }
          ctx.fill();
          
          // Draw soft glowing segment borders
          ctx.beginPath();
          ctx.arc(currentCenterX, currentCenterY, outerRadius, startAngle, endAngle);
          if (currentTheme === 'light') {
            ctx.strokeStyle = `rgba(61, 91, 64, ${0.2 * opacity})`;
          } else {
            ctx.strokeStyle = `rgba(164, 203, 169, ${0.36 * opacity})`;
          }
          ctx.lineWidth = 0.8 * scale;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(currentCenterX, currentCenterY, innerRadius, startAngle, endAngle);
          if (currentTheme === 'light') {
            ctx.strokeStyle = `rgba(61, 91, 64, ${0.12 * opacity})`;
          } else {
            ctx.strokeStyle = `rgba(164, 203, 169, ${0.22 * opacity})`;
          }
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();
        }
      }

      // --- PART 3: Floating Atmospheric Light Motes ---
      for (let mote of motes) {
        mote.update(delta);
        mote.draw(currentCenterX, currentCenterY);
      }

      // --- PART 4: Glowing Pulsating Horizon vanishing point (Apple-style breathing light) ---
      const pulse = Math.sin(timeOffset * 0.04) * 8;
      const glowRadius = (currentTheme === 'light' ? 60 : 120) + pulse;
      
      const gradient = ctx.createRadialGradient(
        currentCenterX, currentCenterY, 0,
        currentCenterX, currentCenterY, glowRadius
      );
      if (currentTheme === 'light') {
        gradient.addColorStop(0, 'rgba(164, 203, 169, 0.85)');
        gradient.addColorStop(0.3, 'rgba(97, 135, 100, 0.28)');
        gradient.addColorStop(1, 'rgba(248, 249, 250, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(164, 203, 169, 0.95)');
        gradient.addColorStop(0.2, 'rgba(97, 135, 100, 0.4)');
        gradient.addColorStop(0.5, 'rgba(164, 203, 169, 0.12)');
        gradient.addColorStop(1, 'rgba(8, 9, 12, 0)');
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(currentCenterX, currentCenterY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      
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
