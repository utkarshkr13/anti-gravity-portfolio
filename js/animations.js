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

  // Removed hero glow as per tunnel background update.  /* ---------- Hero 3D Share Market Tunnel Background ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe'); 
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let tickerActive = true;
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    
    // Top-tier fallbacks matching Utkarsh's global FMCG and SaaS background
    let marketData = [
      {"symbol": "AAPL", "currency": "$", "price": 178.45, "change_pct": 1.24, "is_positive": true},
      {"symbol": "MSFT", "currency": "$", "price": 415.60, "change_pct": 0.85, "is_positive": true},
      {"symbol": "GOOGL", "currency": "$", "price": 152.30, "change_pct": -0.42, "is_positive": false},
      {"symbol": "NVDA", "currency": "$", "price": 875.12, "change_pct": 4.15, "is_positive": true},
      {"symbol": "TSLA", "currency": "$", "price": 175.34, "change_pct": -2.10, "is_positive": false},
      {"symbol": "RELIANCE", "currency": "₹", "price": 2870.50, "change_pct": 1.15, "is_positive": true},
      {"symbol": "TCS", "currency": "₹", "price": 3950.20, "change_pct": -0.80, "is_positive": false},
      {"symbol": "HINDUNILVR", "currency": "₹", "price": 2240.15, "change_pct": 0.55, "is_positive": true},
      {"symbol": "COCACOLA", "currency": "$", "price": 61.20, "change_pct": 0.35, "is_positive": true},
      {"symbol": "BTC", "currency": "$", "price": 64250, "change_pct": 3.85, "is_positive": true},
      {"symbol": "ETH", "currency": "$", "price": 3150, "change_pct": -1.45, "is_positive": false}
    ];

    fetch('assets/market.json')
      .then(r => r.json())
      .then(data => { 
        if(data.tickers && data.tickers.length > 0) marketData = data.tickers; 
      })
      .catch(e => console.log('Using robust global fallback market data'));

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
    
    // Ticker node instances
    class TunnelTicker {
      constructor(stockData, z) {
        this.stock = stockData;
        this.reset(z);
      }
      
      reset(zValue) {
        this.z = zValue !== undefined ? zValue : maxDepth;
        this.theta = Math.random() * Math.PI * 2;
        
        // Pick a random stock from the latest available dataset
        this.stock = marketData[Math.floor(Math.random() * marketData.length)];
        
        const sign = this.stock.change_pct >= 0 ? '+' : '';
        const arrow = this.stock.change_pct >= 0 ? '▲' : '▼';
        this.text = `${this.stock.symbol}  ${this.stock.currency || '$'}${this.stock.price}  ${arrow} ${sign}${this.stock.change_pct}%`;
        this.isPositive = this.stock.change_pct >= 0;
        
        // Speed of movement along Z axis
        this.baseSpeedZ = 1.2 + Math.random() * 0.6;
        // Rotational offset speed for spiral effect (makes them spin around the tunnel)
        this.rotationDirection = Math.random() < 0.5 ? 1 : -1;
        this.angularSpeed = this.rotationDirection * (0.006 + Math.random() * 0.006);
      }
      
      update(delta) {
        // Move towards the camera (Z decreases)
        // Scroll velocity increases speed
        const currentSpeedZ = (this.baseSpeedZ + (scrollSpeed * 0.18)) * delta;
        this.z -= currentSpeedZ;
        this.theta += this.angularSpeed * delta;
        
        // Recycle back to the tunnel end once past the camera
        if (this.z <= 10) {
          this.reset(maxDepth);
        }
      }
      
      draw(centerX, centerY, dx, dy) {
        const scale = focalLength / this.z;
        
        // Calculate center at this specific z-depth (bend factor)
        const offsetFactor = (maxDepth - this.z) / maxDepth;
        const ptCenterX = centerX + dx * 0.85 * offsetFactor;
        const ptCenterY = centerY + dy * 0.85 * offsetFactor;
        
        // Project onto screen coordinate space
        const x3d = tunnelRadius * Math.cos(this.theta);
        const y3d = tunnelRadius * Math.sin(this.theta);
        
        const screenX = ptCenterX + x3d * scale;
        const screenY = ptCenterY + y3d * scale;
        
        // Font sizing based on 3D depth scale
        const fontSize = Math.max(5, Math.floor(14 * scale));
        ctx.font = `bold ${fontSize}px 'Courier New', Courier, monospace`;
        
        // Opacity mapping (fade in at back, fade out when passing by camera)
        let opacity = scale * 1.6;
        if (this.z > 800) {
          opacity *= (maxDepth - this.z) / 200; // fade in at the back
        } else if (this.z < 150) {
          opacity *= (this.z - 10) / 140;     // fade out near camera
        }
        opacity = Math.min(1.0, Math.max(0, opacity));
        
        if (opacity < 0.02) return;
        
        // Sage Green Accent Theme colors:
        // Positive/Gain: Bright Glowing Light Sage for contrast.
        // Negative/Drop: Muted Sage Green.
        if (currentTheme === 'light') {
          if (this.isPositive) {
            ctx.fillStyle = `rgba(61, 91, 64, ${opacity * 0.85})`;  // Dark Sage Green
          } else {
            ctx.fillStyle = `rgba(71, 85, 105, ${opacity * 0.85})`;  // Slate Grey
          }
        } else {
          if (this.isPositive) {
            ctx.fillStyle = `rgba(164, 203, 169, ${opacity * 0.95})`; // Glowing Light Sage
          } else {
            ctx.fillStyle = `rgba(97, 135, 100, ${opacity * 0.9})`;   // Glowing Sage Green
          }
        }
        
        ctx.save();
        ctx.translate(screenX, screenY);
        // Rotate text to face outward/tangent to the tunnel curvature
        ctx.rotate(this.theta + Math.PI / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
      }
    }
    
    // Create pool of tunnel tickers
    let tickers = [];
    const tickerCount = 100;
    
    function initTunnel() {
      tickers = [];
      for (let i = 0; i < tickerCount; i++) {
        // Distribute them evenly in depth initially to fill the tunnel
        const initialZ = 10 + (maxDepth / tickerCount) * i;
        tickers.push(new TunnelTicker(marketData[i % marketData.length], initialZ));
      }
    }
    
    initTunnel();
    
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
      
      // Update tunnel timeOffset
      timeOffset += (1.5 + scrollSpeed * 0.18) * delta;
      
      // Decelerate scroll velocity impact smoothly
      scrollSpeed *= Math.pow(0.92, delta);
      if (scrollSpeed < 0.1) scrollSpeed = 0;
      
      // Interpolate center point for smooth mouse tracking inertia (frame-rate independent)
      currentCenterX += (mouse.targetX - currentCenterX) * (1 - Math.pow(1 - 0.06, delta));
      currentCenterY += (mouse.targetY - currentCenterY) * (1 - Math.pow(1 - 0.06, delta));
      
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
        
        const radialLinesCount = 20;
        for (let j = 0; j < radialLinesCount; j++) {
          const theta = (Math.PI * 2 / radialLinesCount) * j;
          ctx.beginPath();
          
          let first = true;
          // Trace depth points from z = 1000 down to 40
          for (let zVal = 1000; zVal >= 40; zVal -= 40) {
            const scale = focalLength / zVal;
            const offsetFactor = (maxDepth - zVal) / maxDepth;
            const ptCenterX = currentCenterX + dx * 0.85 * offsetFactor;
            const ptCenterY = currentCenterY + dy * 0.85 * offsetFactor;
            
            const ptX = ptCenterX + tunnelRadius * Math.cos(theta) * scale;
            const ptY = ptCenterY + tunnelRadius * Math.sin(theta) * scale;
            
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
      const totalRings = 15;
      for (let i = 0; i < totalRings; i++) {
        let ringZ = ((i * (maxDepth / totalRings)) - timeOffset) % maxDepth;
        if (ringZ < 0) ringZ += maxDepth;
        if (ringZ < 30 || ringZ > 950) continue;
        
        const scale = focalLength / ringZ;
        const ringRadius = tunnelRadius * scale;
        
        const offsetFactor = (maxDepth - ringZ) / maxDepth;
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
      
      // --- PART 3: Draw and update each spiraling stock ticker ---
      for (let ticker of tickers) {
        ticker.update(delta);
        ticker.draw(currentCenterX, currentCenterY, dx, dy);
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
