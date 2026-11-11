/* ============================================================
   MAIN — Theme, navigation, and case studies
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Theme Toggle with Liquid Sweep Transition ---------- */
  const html = document.documentElement;
  const THEME_KEY = 'ukr-portfolio-theme';
  const themeStorage = {
    get() {
      try { return window.localStorage.getItem(THEME_KEY); } catch (_) { return null; }
    },
    set(value) {
      try { window.localStorage.setItem(THEME_KEY, value); } catch (_) { /* Storage may be disabled. */ }
    }
  };

  // Load saved theme or default to dark
  const savedTheme = themeStorage.get() || 'dark';
  html.setAttribute('data-theme', savedTheme);

  const toggle = document.getElementById('themeToggle');
  const sweepCircle = document.getElementById('themeSweepCircle');
  const navbar = document.getElementById('navbar');
  const navMenuToggle = document.getElementById('navMenuToggle');

  if (navbar && navMenuToggle) {
    navMenuToggle.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('menu-open');
      navMenuToggle.setAttribute('aria-expanded', String(isOpen));
      navMenuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });

    navbar.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navbar.classList.remove('menu-open');
        navMenuToggle.setAttribute('aria-expanded', 'false');
        navMenuToggle.setAttribute('aria-label', 'Open navigation menu');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !navbar.classList.contains('menu-open')) return;
      navbar.classList.remove('menu-open');
      navMenuToggle.setAttribute('aria-expanded', 'false');
      navMenuToggle.setAttribute('aria-label', 'Open navigation menu');
      navMenuToggle.focus();
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (toggle && sweepCircle && !reducedMotion.matches) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      

      // Position sweep circle
      const rect = toggle.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      sweepCircle.style.left = x + 'px';
      sweepCircle.style.top = y + 'px';
      sweepCircle.style.background = next === 'light' ? '#f8f9fa' : '#08090c';
      
      // Sweep sweep!
      sweepCircle.style.transition = 'none';
      sweepCircle.style.transform = 'translate(-50%, -50%) scale(0)';
      sweepCircle.style.opacity = '1';
      void sweepCircle.offsetWidth; // force reflow
      
      sweepCircle.style.transition = 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)';
      sweepCircle.style.transform = 'translate(-50%, -50%) scale(3000)';
      
      setTimeout(() => {
        html.setAttribute('data-theme', next);
        themeStorage.set(next);
        window.dispatchEvent(new Event('theme-change'));
      }, 400);
      
      setTimeout(() => {
        sweepCircle.style.transition = 'opacity 0.4s ease';
        sweepCircle.style.opacity = '0';
      }, 800);
    });
  } else if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      themeStorage.set(next);
      window.dispatchEvent(new Event('theme-change'));
    });
  }

  /* ---------- Smooth Scroll (Lenis) ---------- */
  const smoothScroll = window.matchMedia('(pointer: fine)').matches && !reducedMotion.matches;
  const lenis = smoothScroll && typeof window.Lenis === 'function' ? new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false
  }) : null;

  // Expose Lenis globally so other components can access or control it
  if (lenis) window.lenis = lenis;

  // Sync Lenis with GSAP ScrollTrigger
  if (lenis && window.ScrollTrigger && window.gsap) {
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  }

  // Leave section links to the browser so the address bar, Back and focus work.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      if (window.gsap) {
        window.gsap.set('.reveal-char', { opacity: 1, y: '0%', rotateX: 0 });
      }
    });
  });

  /* ---------- Scroll to Top Button ---------- */
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.5, ease: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ---------- Project Category Filters ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        filterBtns.forEach(button => {
          const selected = button === btn;
          button.classList.toggle('active', selected);
          button.setAttribute('aria-pressed', String(selected));
        });
        
        const filterValue = btn.getAttribute('data-filter');
        
        const canAnimateFilter = window.Flip && window.gsap && window.ScrollTrigger &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const state = canAnimateFilter ? window.Flip.getState(projectCards) : null;
        
        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          
          // Kill active tweens to prevent layout stutter
          if (window.gsap) window.gsap.killTweensOf(card);
          
          if (filterValue === 'all' || category === filterValue) {
            // Clear the display style
            card.style.display = '';
          } else {
            // Hide card
            card.style.display = 'none';
          }
        });

        if (canAnimateFilter) {
          window.Flip.from(state, {
            duration: 0.5,
            ease: 'power2.out',
            absolute: true,
            onComplete: () => window.ScrollTrigger.refresh()
          });
        }
      });
    });
  }

  /* ---------- Project Case Study Modals ---------- */
  const projectDetailsData = {
    'sap-tracker': {
      title: "SAP Integration Testing Tracker",
      category: "Integration Testing Platform",
      role: "Business Analyst / Builder",
      stack: "Vanilla JS, Clerk v5, Firebase Realtime DB, Chart.js, SheetJS, Vercel",
      problem: "Testing updates were spread across spreadsheets and follow-ups. Teams lacked one shared view of test results, pending issues, and sign-off status.",
      strategy: "Built a centralized testing tracker with a shared status model, CRUD workflows, API readiness tracking, and visual progress summaries across 3 client workstreams.",
      impact: [
        "Reduced status-tracking effort by 40% across 3 client workstreams.",
        "Made pending issues and sign-off status visible in one shared view.",
        "Created a consistent workflow for test entries and release reporting."
      ],
      live: 'https://sap-tracker-mocha.vercel.app',
      code: "https://github.com/utkarshkr13/sap-tracker"
    },
    'client-inbox-tracker': {
      title: "L2 Client Escalation Portal",
      category: "Internal Escalation Tool",
      role: "Business Analyst / Builder",
      stack: "Next.js 14, TypeScript, Neon Postgres, Prisma ORM, Gmail API, NextAuth, Tailwind CSS, PWA",
      problem: "Enterprise FMCG support requests got lost in chaotic shared inbox loops. Business analysts and support teams struggled to track SLA breaches, assign ownership, and maintain private resolution logs.",
      strategy: "Designed an internal ticketing tool that auto-syncs with corporate emails using Gmail API. Implemented automated regex-based ticket routing, SLA countdown indicators, and a dual-pane interface to keep internal BA notes isolated from customer views.",
      impact: [
        "Centralized tickets, assignments, internal notes, and follow-up reminders.",
        "Made ownership and pending actions easier to track outside email threads.",
        "Created real-time visibility for ticket status and ownership."
      ],
      live: "https://client-inbox-tracker.vercel.app",
      code: "https://github.com/utkarshkr13/client-inbox-tracker"
    },
    'satellite-crop': {
      title: "Satellite Crop Classification",
      category: "VIT Capstone Project",
      role: "VIT Capstone Project Contributor",
      stack: "Remote Sensing, Machine Learning, Google Earth Engine, Python",
      problem: "Traditional ground surveys for crop identification are slow, expensive, and fail to track regional agricultural trends under cloudy weather conditions.",
      strategy: "Built a remote-sensing analytics workflow that combines Sentinel-1 SAR (radar) and Sentinel-2 (optical) imagery on Google Earth Engine. Pre-processed datasets to filter cloud cover and trained Random Forest models to classify crop types.",
      impact: [
        "Combined Sentinel-1 radar and Sentinel-2 optical imagery in one workflow.",
        "Trained a Random Forest model to classify crop types."
      ],
      live: null,
      code: null
    },
    'cityflo-bi': {
      title: "CityFlo BI Dashboards",
      category: "Business Intelligence Dashboard",
      role: "Business Intelligence & Marketing Intern",
      stack: "Tableau, Python, PostgreSQL, BeautifulSoup, Selenium",
      problem: "Commuter route optimization and pricing changes were slow because data was scattered across third-party sources and required manual reporting.",
      strategy: "Created automated selenium-based scraping pipelines to extract location intelligence. Modeled databases in PostgreSQL to support Tableau geospatial heatmaps and pricing analytics.",
      impact: [
        "Automated parts of the data collection and reporting workflow.",
        "Built views the operations team could use to assess routes and pricing."
      ],
      live: null,
      code: null
    }
  };

  const projectModal = document.getElementById('projectModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const caseStudyBtns = document.querySelectorAll('.btn-case-study');
  const modalWrapper = projectModal?.querySelector('.modal-wrapper');
  const modalBody = projectModal?.querySelector('.modal-container');

  if (projectModal && modalOverlay && modalCloseBtn && modalWrapper && caseStudyBtns.length > 0) {
    let modalTrigger = null;
    let closingModal = false;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const closeModal = () => {
      if (closingModal || projectModal.getAttribute('aria-hidden') === 'true') return;
      closingModal = true;

      const finishClose = () => {
        projectModal.style.display = 'none';
        projectModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        const navWrapper = document.querySelector('.nav-wrapper');
        if (navWrapper) navWrapper.style.display = '';
        if (window.lenis) window.lenis.start();
        modalTrigger?.focus({ preventScroll: true });
        modalTrigger = null;
        closingModal = false;
      };

      if (window.gsap && !reducedMotion.matches) {
        window.gsap.killTweensOf([modalWrapper, modalOverlay]);
        window.gsap.to(modalWrapper, { y: 30, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: finishClose });
        window.gsap.to(modalOverlay, { opacity: 0, duration: 0.2 });
      } else {
        finishClose();
      }
    };

    const trapModalFocus = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...modalWrapper.querySelectorAll(focusableSelector)].filter((element) => !element.hidden);
      if (focusable.length === 0) {
        event.preventDefault();
        modalWrapper.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    projectModal.addEventListener('keydown', trapModalFocus);

    // Open Modal
    caseStudyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-project');
        const data = projectDetailsData[projectId];
        if (!data) return;

        // Populate Modal Fields
        document.getElementById('modalTitle').innerText = data.title;
        document.getElementById('modalCategory').innerText = data.category;
        document.getElementById('modalRole').innerText = data.role;
        document.getElementById('modalStack').innerText = data.stack;
        document.getElementById('modalProblem').innerText = data.problem;
        document.getElementById('modalStrategy').innerText = data.strategy;

        const impactContainer = document.getElementById('modalImpact');
        impactContainer.innerHTML = '';
        data.impact.forEach(item => {
          const div = document.createElement('div');
          div.style.cssText = "padding:12px; background:var(--bg-subtle); border:1px solid var(--border-color); border-radius:8px;";
          div.innerHTML = `
            <div style="font-size:0.82rem; font-weight:600; color:var(--text-primary); line-height:1.4;">${item}</div>
          `;
          impactContainer.appendChild(div);
        });

        // Set Links
        const liveBtn = document.getElementById('modalLiveLink');
        const codeBtn = document.getElementById('modalCodeLink');

        if (data.live) {
          liveBtn.href = data.live;
          liveBtn.hidden = false;
        } else {
          liveBtn.removeAttribute('href');
          liveBtn.hidden = true;
        }

        if (data.code) {
          codeBtn.href = data.code;
          codeBtn.hidden = false;
        } else {
          codeBtn.removeAttribute('href');
          codeBtn.hidden = true;
        }

        // Initialize Lucide icons
        if (window.lucide) {
          window.lucide.createIcons({ node: projectModal });
        }

        // Show Modal
        projectModal.style.display = 'flex';
        if (modalBody) modalBody.scrollTop = 0;
        projectModal.setAttribute('aria-hidden', 'false');
        modalTrigger = btn;
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        const navWrapper = document.querySelector('.nav-wrapper');
        if (navWrapper) navWrapper.style.display = 'none';
        
        // Stop Lenis background scroll
        if (window.lenis) window.lenis.stop();

        // Animate elements
        if (window.gsap && !reducedMotion.matches) {
          window.gsap.fromTo(modalOverlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
          window.gsap.fromTo(modalWrapper, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'power3.out' });
        } else {
          modalWrapper.style.removeProperty('transform');
          modalWrapper.style.removeProperty('opacity');
          modalOverlay.style.removeProperty('opacity');
        }
        modalCloseBtn.focus({ preventScroll: true });
      });
    });

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
  }

  /* ---------- Mumbai Live Clock Widget ---------- */
  const clockEl = document.getElementById('mumbaiTime');
  if (clockEl) {
    const updateClock = () => {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      clockEl.textContent = formatter.format(new Date());
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ---------- Command Palette Modal Interaction ---------- */
  const cmdPalette = document.getElementById('cmdPalette');
  const cmdOverlay = document.getElementById('cmdOverlay');
  const cmdSearchInput = document.getElementById('cmdSearchInput');
  const cmdItems = document.querySelectorAll('.cmd-palette-item');

  if (cmdPalette && cmdSearchInput) {
    let activeIndex = 0;

    const showPalette = () => {
      // Clear input
      cmdSearchInput.value = '';
      cmdItems.forEach(item => item.style.display = 'flex');

      cmdPalette.style.display = 'flex';
      cmdPalette.classList.add('open');
      cmdPalette.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      const navWrapper = document.querySelector('.nav-wrapper');
      if (navWrapper) navWrapper.style.display = 'none';
      if (window.lenis) window.lenis.stop();
      
      setTimeout(() => cmdSearchInput.focus(), 50);
      activeIndex = 0;
      updateActiveItem();
    };

    const hidePalette = () => {
      cmdPalette.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const navWrapper = document.querySelector('.nav-wrapper');
      if (navWrapper) navWrapper.style.display = '';
      
      setTimeout(() => {
        cmdPalette.style.display = 'none';
        cmdPalette.setAttribute('aria-hidden', 'true');
        if (window.lenis) window.lenis.start();
      }, 300);
    };

    // Keyboard trigger: Cmd+K / Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (projectModal?.getAttribute('aria-hidden') === 'false') return;
        e.preventDefault();
        if (cmdPalette.classList.contains('open')) {
          hidePalette();
        } else {
          showPalette();
        }
      }
    });

    if (cmdOverlay) cmdOverlay.addEventListener('click', hidePalette);

    // Escape closes palette
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cmdPalette.classList.contains('open')) {
        hidePalette();
      }
    });

    // Live filtering
    cmdSearchInput.addEventListener('input', () => {
      const val = cmdSearchInput.value.toLowerCase().trim();
      cmdItems.forEach(item => {
        const titleEl = item.querySelector('.cmd-palette-item-title');
        const text = titleEl ? titleEl.textContent.toLowerCase() : item.textContent.toLowerCase();
        if (text.includes(val)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
      activeIndex = 0;
      updateActiveItem();
    });

    // Arrow keys + Enter navigation
    window.addEventListener('keydown', (e) => {
      if (!cmdPalette.classList.contains('open')) return;

      const visibleItems = Array.from(cmdItems).filter(item => item.style.display !== 'none');
      if (visibleItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % visibleItems.length;
        updateActiveItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + visibleItems.length) % visibleItems.length;
        updateActiveItem();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        visibleItems[activeIndex].click();
      }
    });

    const updateActiveItem = () => {
      const visibleItems = Array.from(cmdItems).filter(item => item.style.display !== 'none');
      cmdItems.forEach(item => item.classList.remove('active'));
      if (visibleItems[activeIndex]) {
        visibleItems[activeIndex].classList.add('active');
        visibleItems[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    };

    // Click handler for item actions
    cmdItems.forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        const target = item.getAttribute('data-target');

        hidePalette();

        if (action === 'nav' && target) {
          const link = document.querySelector(`.nav-link[href="${target}"]`);
          link?.click();
        } else if (action === 'theme') {
          const themeToggle = document.getElementById('themeToggle');
          if (themeToggle) {
            setTimeout(() => themeToggle.click(), 350);
          }
        } else if (action === 'experience') {
          document.getElementById('ctaResume')?.click();
        }
      });
    });

    // Alt + number shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.altKey) {
        if (e.key >= '1' && e.key <= '5') {
          e.preventDefault();
          const navItems = Array.from(cmdItems).filter(item => item.getAttribute('data-action') === 'nav');
          const index = parseInt(e.key, 10) - 1;
          if (navItems[index]) navItems[index].click();
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          const themeItem = Array.from(cmdItems).find(item => item.getAttribute('data-action') === 'theme');
          if (themeItem) themeItem.click();
        } else if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          document.getElementById('ctaResume')?.click();
        }
      }
    });
  }

  /* ---------- Run Everything ---------- */
  window.initAnimations?.();
  window.lucide?.createIcons();

  /* ---------- Safety: Force-dismiss loader after 5s ---------- */
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader && loader.style.display !== 'none') {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.4s ease';
      setTimeout(() => {
        loader.style.display = 'none';
        if (window.initAnimations) window.initAnimations();
      }, 400);
    }
  }, 2500);

})();
