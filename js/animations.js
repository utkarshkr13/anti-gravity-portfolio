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

  /* ---------- Hero Hyperspace News Matrix & Spaceships ---------- */
  function initParticles() {
    const canvas = document.getElementById('heroGlobe'); 
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    
    // Starter fallbacks while Python JSON loads natively
    let headlines = [
      "Establishing secure connection...",
      "Fetching global tech markets...",
      "Neural link initialized.",
      "Parsing hyperspace matrix..."
    ];

    // Background asynchronous fetch to grab API JSON (created by our scheduled job)
    fetch('assets/news.json')
      .then(r => r.json())
      .then(data => { if(data.headlines && data.headlines.length > 0) headlines = data.headlines; })
      .catch(e => console.log('Using local fallback tech strings'));

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    window.addEventListener('resize', resize);
    resize();

    let mouse = { x: width/2, y: height/2 };

    const isLightMode = () => document.documentElement.getAttribute('data-theme') === 'light';

    // 1. 3D Spaceships Class
    class Spaceship {
      constructor() {
        this.reset(true);
      }
      reset(randomizeZ = false) {
        // Spawn slightly off-center randomly
        this.x = width / 2 + (Math.random() - 0.5) * 50;
        this.y = height / 2 + (Math.random() - 0.5) * 50;
        this.z = randomizeZ ? Math.random() * 2000 + 100 : 2000; // depth coordinate (Z axis)
        
        // Massive warp speed
        this.speed = Math.random() * 15 + 10;
        
        // Slight strafing drift
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
      }
      update() {
        this.z -= this.speed; // Fly towards the camera (closer = smaller Z)
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.z < 10) this.reset(); // Pass perfectly behind the screen
      }
      draw() {
        // 3D Perspective Projection
        const fov = 400; // Field of view
        const scale = fov / this.z;
        const projX = (this.x - width/2) * scale + width/2;
        const projY = (this.y - height/2) * scale + height/2;
        const size = scale * 12; // Base size of spaceship scales up drastically as it gets closer

        if (projX < 0 || projX > width || projY < 0 || projY > height) {
          this.reset();
          return;
        }

        ctx.save();
        ctx.translate(projX, projY);
        
        // Nose always points directly outward from the exact dead-center of screen
        const angle = Math.atan2(projY - height/2, projX - width/2);
        ctx.rotate(angle);

        // Vector Spaceship Design (Star Wars aesthetic)
        ctx.beginPath();
        ctx.moveTo(size * 1.8, 0);             // Extended nose
        ctx.lineTo(-size, -size * 0.9);        // Left vast wing
        ctx.lineTo(-size * 0.5, 0);            // Engine notch
        ctx.lineTo(-size, size * 0.9);         // Right vast wing
        ctx.closePath();
        
        ctx.fillStyle = isLightMode() ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)';
        ctx.fill();

        // Reactor Thrust Glow
        ctx.beginPath();
        ctx.arc(-size * 0.5, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.9)'; // Electric Blue Engine
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgb(59, 130, 246)'; // Engine bloom effect
        ctx.restore();

        // Exposing absolute projection coords manually for text collision
        this.px = projX;
        this.py = projY;
        this.psize = size;
      }
    }

    // 2. The Blurred News Node Class
    class TextNode {
      constructor(text, yPos) {
        this.text = text;
        this.baseX = Math.random() * width;
        this.y = yPos;
        this.x = this.baseX;
        this.vx = 0;
        
        // Matrix flow upward
        this.speed = (Math.random() * 0.8) + 0.2; 
        this.opacity = Math.random() * 0.4 + 0.1;
        this.fontSize = Math.floor(Math.random() * 5) + 12; // Dynamic code-size
      }
      update(ships) {
        // Continuous scroll loop
        this.y -= this.speed;
        if (this.y < -50) {
          this.y = height + 50;
          this.text = headlines[Math.floor(Math.random() * headlines.length)];
          this.baseX = Math.random() * width;
          this.x = this.baseX;
        }

        // Violent Collision checks against all Spaceships!
        for (let ship of ships) {
          if (!ship.px) continue;
          const dx = ship.px - this.x;
          const dy = ship.py - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Size-based hitboxes (as ships get closer to the screen they grow, carving larger swathes)
          const influenceRadius = ship.psize * 4 + 40; 
          
          if (dist < influenceRadius) {
            // Apply horizontal force depending on which side of the ship it is
            const force = (influenceRadius - dist) / influenceRadius;
            this.vx -= (dx / dist) * force * 5; 
          }
        }

        // Kinetic recovery physics
        this.vx *= 0.90; // Natural braking friction
        
        if (Math.abs(this.vx) < 0.2) {
          // Snap slowly back to original flow line
          const recoverDx = this.baseX - this.x;
          this.x += recoverDx * 0.08;
        } else {
          this.x += this.vx;
        }
      }
      draw() {
        ctx.font = `${this.fontSize}px 'Courier New', Courier, monospace`;
        ctx.fillStyle = isLightMode() ? `rgba(0,0,0,${this.opacity})` : `rgba(255,255,255,${this.opacity})`;
        ctx.fillText(this.text, this.x, this.y);
      }
    }

    // Instantiation
    const ships = [];
    for (let i = 0; i < 30; i++) ships.push(new Spaceship()); // 30 simultaneous ships zooming

    const texts = [];
    for (let i = 0; i < 70; i++) texts.push(new TextNode(headlines[i % headlines.length], Math.random() * height)); // 70 lines of data stream

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Slight 3D pan tilt responsive to user mouse
      const panX = (mouse.x - width/2) * 0.02;
      const panY = (mouse.y - height/2) * 0.02;
      
      ctx.save();
      ctx.translate(-panX, -panY);

      // RENDER TEXT PASS (Blurred Pre-text layer)
      ctx.filter = 'blur(1.5px)'; // Heavy depth of field blur for text
      for (let txt of texts) {
        txt.update(ships);
        txt.draw();
      }

      // RENDER SHIPS PASS (Crisp Foreground Zooming)
      ctx.filter = 'none'; // Unblur hardware context
      for (let ship of ships) {
        ship.update();
        ship.draw();
      }
      
      ctx.restore();
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
