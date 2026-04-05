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

    document.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      gsap.to(heroGlow, {
        x: pointerX,
        y: pointerY,
        xPercent: -50,
        yPercent: -50,
        duration: 1.2,
        ease: 'power2.out'
      });
    });
  }

  /* ---------- Hero Seamless News Matrix ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe'); 
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    
    let headlines = [
      "Establishing secure connection...",
      "Fetching global tech markets...",
      "Neural link initialized.",
      "Parsing background matrix..."
    ];

    // Background fetch
    fetch('assets/news.json')
      .then(r => r.json())
      .then(data => { if(data.headlines && data.headlines.length > 0) headlines = data.headlines; })
      .catch(e => console.log('Using local fallback tech strings'));

    let mouse = { x: -1000, y: -1000 };
    const isLightMode = () => document.documentElement.getAttribute('data-theme') === 'light';
    let texts = [];

    class TextNode {
      constructor(text, colX, startY) {
        this.text = text;
        this.baseX = colX;
        this.x = this.baseX;
        this.y = startY;
        this.vx = 0;
        
        // Matrix flow upward
        this.speed = 0.4 + Math.random() * 0.3; 
        this.opacity = Math.random() * 0.25 + 0.15;
      }
      update() {
        this.y -= this.speed;
        if (this.y < -50) {
          this.y = height + 50;
          this.text = headlines[Math.floor(Math.random() * headlines.length)];
          this.x = this.baseX;
        }

        // Mouse Collision (Text strictly parts outward making space for mouse)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const influenceRadius = 250; 
        
        if (dist < influenceRadius) {
          const force = (influenceRadius - dist) / influenceRadius;
          // Text pushes sideways forcefully to clear path
          this.vx -= (dx / dist) * force * 5.0; 
        }

        // Kinetic recovery physics
        this.vx *= 0.88; 
        
        if (Math.abs(this.vx) < 0.1) {
          // Snap slowly back to original uniform grid column
          const recoverDx = this.baseX - this.x;
          this.x += recoverDx * 0.06;
        } else {
          this.x += this.vx;
        }
      }
      draw() {
        ctx.fillStyle = isLightMode() ? `rgba(0,0,0,${this.opacity})` : `rgba(255,255,255,${this.opacity})`;
        ctx.fillText(this.text, this.x, this.y);
      }
    }

    function initGrid() {
      texts = [];
      const colWidth = 350; // Spacious even columns
      const cols = Math.ceil(width / colWidth) + 1;
      const rowHeight = 45; // Dense enough vertically to be matrix-like
      const rows = Math.ceil(height / rowHeight) + 1;

      for (let c = -1; c < cols; c++) {
        for (let r = -1; r < rows; r++) {
          const xPos = c * colWidth + ((r % 2 === 0) ? colWidth/2 : 0); // Stagger rows beautifully like bricks
          const yPos = r * rowHeight;
          const text = headlines[Math.floor(Math.random() * headlines.length)];
          texts.push(new TextNode(text, xPos, yPos));
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

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // RENDER TEXT PASS 
      ctx.filter = 'blur(1.5px)'; // Depth of field
      ctx.font = `14px 'Courier New', Courier, monospace`; // Set once for performance
      
      for (let txt of texts) {
        txt.update();
        txt.draw();
      }
      
      ctx.filter = 'none'; 
      requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
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
