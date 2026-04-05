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

    /* ---------- Matrix Hyperdrive Easter Egg ---------- */
    let clickCount = 0;
    let clickTimeout;
    const heroNameExt = document.querySelector('.hero-name');
    if (heroNameExt) {
      heroNameExt.addEventListener('click', () => {
        clickCount++;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => { clickCount = 0; }, 1000);
        
        if (clickCount >= 5) {
          clickCount = 0;
          window.dispatchEvent(new Event('matrix-hyperdrive'));
        }
      });
    }
  }

  // Removed hero glow as per tunnel background update.

  /* ---------- Hero Market Ticker Background ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe'); 
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    
    let marketData = [
      {"symbol": "AAPL", "currency": "$", "price": 175.00, "change_pct": 1.2, "is_positive": true},
    ];

    fetch('assets/market.json')
      .then(r => r.json())
      .then(data => { if(data.tickers && data.tickers.length > 0) marketData = data.tickers; })
      .catch(e => console.log('Using fallback market strings'));

    let mouse = { x: -1000, y: -1000 };
    const isLightMode = () => document.documentElement.getAttribute('data-theme') === 'light';
    let texts = [];

    // Hyperdrive State
    let isHyperdrive = false;
    window.addEventListener('matrix-hyperdrive', () => {
      isHyperdrive = !isHyperdrive;
      if (isHyperdrive) {
        document.body.style.setProperty('background-color', '#020602', 'important');
        texts.forEach(t => {
          t.scrollSpeed = 35.0; // Warp speed matrix
          t.isPositive = true; // Force all green
          t.opacity = 0.9;
        });
      } else {
        location.reload(); // Refresh to exit matrix cleanly
      }
    });

    class TextNode {
      constructor(stockData, colX, rowY) {
        // Format CNBC Style: AAPL $175.00 (+1.2%)
        const sign = stockData.change_pct >= 0 ? '+' : '';
        this.text = `${stockData.symbol}  ${stockData.currency}${stockData.price}  (${sign}${stockData.change_pct}%)`;
        this.isPositive = stockData.is_positive;
        
        ctx.font = `14px 'Courier New', Courier, monospace`;
        this.textWidth = ctx.measureText(this.text).width;
        
        this.baseX = colX;
        this.baseY = rowY;
        this.x = this.baseX;
        this.y = this.baseY;
        this.vx = 0;
        this.vy = 0;
        this.opacity = 0.55; 
        this.scrollSpeed = 0.8; // Uniform tracking speed for all market nodes
      }
      update() {
        // Continuous rightward CNBC scroll
        this.baseX += this.scrollSpeed;
        
        // Wrap around off-screen seamlessly without overlapping
        if (this.baseX > width + 100) {
          // Find the left-most element currently in THIS specific row
          let minX = this.baseX;
          for (let i = 0; i < texts.length; i++) {
            if (texts[i].baseY === this.baseY && texts[i].baseX < minX) {
              minX = texts[i].baseX;
            }
          }
          // Attach to the extreme tail behind the last node smoothly (60px gap)
          this.baseX = minX - this.textWidth - 60;
          this.x = this.baseX;
        }

        // True Mouse Collision
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const influenceRadius = 250; 
        
        if (dist < influenceRadius) {
          const force = (influenceRadius - dist) / influenceRadius;
          // Pushes text spherically away from cursor
          this.vx -= (dx / dist) * force * 5.0;
          this.vy -= (dy / dist) * force * 5.0;
        }

        // Spring physics to snap back to exact horizontal sequence
        const springDx = (this.baseX - this.x) * 0.05;
        const springDy = (this.baseY - this.y) * 0.05;
        
        this.vx += springDx;
        this.vy += springDy;

        // Friction to steady the oscillation
        this.vx *= 0.85;
        this.vy *= 0.85;

        this.x += this.vx;
        this.y += this.vy;
      }
      draw() {
        // Green for positive returns, Red for negative returns
        if (this.isPositive) {
            ctx.fillStyle = `rgba(34, 197, 94, ${this.opacity})`; // Neon Green
        } else {
            ctx.fillStyle = `rgba(239, 68, 68, ${this.opacity})`; // Hot Red
        }
        
        ctx.fillText(this.text, this.x, this.y);
      }
    }

    function initGrid() {
      texts = [];
      ctx.font = `14px 'Courier New', Courier, monospace`; 
      
      const marginX = 60; // Gap between discrete tickers
      const rowHeight = 40; 
      const rows = Math.ceil(height / rowHeight) + 1;

      let index = 0;
      
      for (let r = 0; r < rows; r++) {
        let currentX = -Math.random() * 200; // Stagger start positions dynamically
        
        // Spawn multiple tickers per lane
        while (currentX < width + 500) {
          const stockData = marketData[index % marketData.length];
          const node = new TextNode(stockData, currentX, r * rowHeight + 20);
          texts.push(node);
          
          currentX += node.textWidth + marginX;
          index++;
        }
      }
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initGrid();
    }

    window.addEventListener('resize', resize);
    resize();

    // Hot-reload grid once the live API data hydrates so spacing initializes beautifully
    const reinitInterval = setInterval(() => {
      if (marketData.length > 1) {
        initGrid();
        clearInterval(reinitInterval);
      }
    }, 500);

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // NO ctx.filter HERE! Render pure text here. GPU Hardware CSS handles blurring.
      ctx.font = `14px 'Courier New', Courier, monospace`; 
      
      for (let txt of texts) {
        txt.update();
        txt.draw();
      }
      
      requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

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

  /* ---------- Expose init function ---------- */
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
