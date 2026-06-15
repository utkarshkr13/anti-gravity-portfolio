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

  // Removed hero glow as per tunnel background update.

  /* ---------- Hero Market Ticker Background ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe'); 
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    
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

    let mouse = { x: -1000, y: -1000 };
    let texts = [];

    class TextNode {
      constructor(stockData, colX, rowY, rowSpeed) {
        const sign = stockData.change_pct >= 0 ? '+' : '';
        const arrow = stockData.change_pct >= 0 ? '▲' : '▼';
        this.text = `${stockData.symbol}  ${stockData.currency || '$'}${stockData.price}  ${arrow} ${sign}${stockData.change_pct}%`;
        this.isPositive = stockData.change_pct >= 0;
        
        ctx.font = `13px 'Courier New', Courier, monospace`;
        this.textWidth = ctx.measureText(this.text).width;
        
        this.baseX = colX;
        this.baseY = rowY;
        this.x = this.baseX;
        this.y = this.baseY;
        this.vx = 0;
        this.vy = 0;
        this.opacity = 0.45; 
        this.scrollSpeed = rowSpeed || 0.8;
      }
      
      update() {
        // Horizontally scroll to the right
        this.baseX += this.scrollSpeed;
        
        // Wrap around off-screen seamlessly
        if (this.baseX > width + 100) {
          let minX = this.baseX;
          for (let i = 0; i < texts.length; i++) {
            if (texts[i].baseY === this.baseY && texts[i].baseX < minX) {
              minX = texts[i].baseX;
            }
          }
          this.baseX = minX - this.textWidth - 75;
          this.x = this.baseX;
        }

        // True Interactive Cursor Collision
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = 220; 
        
        if (dist < influenceRadius) {
          const force = (influenceRadius - dist) / influenceRadius;
          // Displace text spherically away from cursor coordinates
          this.vx -= (dx / dist) * force * 4.5;
          this.vy -= (dy / dist) * force * 4.5;
        }

        // Spring physics restore
        const springDx = (this.baseX - this.x) * 0.05;
        const springDy = (this.baseY - this.y) * 0.05;
        
        this.vx += springDx;
        this.vy += springDy;

        // Velocity friction
        this.vx *= 0.85;
        this.vy *= 0.85;

        this.x += this.vx;
        this.y += this.vy;
      }
      
      draw() {
        if (this.isPositive) {
          ctx.fillStyle = `rgba(34, 197, 94, ${this.opacity})`; // Neon Green
        } else {
          ctx.fillStyle = `rgba(239, 68, 68, ${this.opacity})`; // CNBC Red
        }
        ctx.fillText(this.text, this.x, this.y);
      }
    }

    function initGrid() {
      texts = [];
      ctx.font = `13px 'Courier New', Courier, monospace`; 
      
      const gapX = 75; 
      const rowHeight = 45; 
      const rows = Math.ceil(height / rowHeight) + 1;

      let index = 0;
      
      for (let r = 0; r < rows; r++) {
        const baseSpeed = 0.6 + (r % 4) * 0.2; 
        const rowSpeed = baseSpeed + Math.random() * 0.1;
        let currentX = -Math.random() * 250; 
        
        while (currentX < width + 600) {
          const stockData = marketData[index % marketData.length];
          const node = new TextNode(stockData, currentX, r * rowHeight + 25, rowSpeed);
          texts.push(node);
          
          currentX += node.textWidth + gapX;
          index++;
        }
      }
    }

    let lastWidth = 0;
    function resize() {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const widthChanged = Math.abs(currentWidth - lastWidth) > 20;
      
      const dpr = window.devicePixelRatio || 1;
      width = currentWidth;
      height = currentHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      
      if (widthChanged || texts.length === 0) {
        lastWidth = currentWidth;
        initGrid();
      }
    }

    window.addEventListener('resize', resize);
    resize();

    // Hot-reload spacing once data hydrates
    const reinitInterval = setInterval(() => {
      if (marketData.length > 11) {
        initGrid();
        clearInterval(reinitInterval);
      }
    }, 600);

    function animate() {
      ctx.clearRect(0, 0, width, height);
      if (!tickerActive) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.font = `13px 'Courier New', Courier, monospace`; 
      
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
