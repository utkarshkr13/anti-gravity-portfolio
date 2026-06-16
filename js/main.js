/* ============================================================
   MAIN — Theme toggle, Lenis smooth scroll, page loader, nav
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Theme Toggle ---------- */
  const html = document.documentElement;
  const THEME_KEY = 'ukr-portfolio-theme';

  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  html.setAttribute('data-theme', savedTheme);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      
      // Broadcast theme change for Canvas drawing
      window.dispatchEvent(new Event('theme-change'));
    });
  }

  /* ---------- Smooth Scroll (Lenis) ---------- */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false
  });

  // Expose Lenis globally so other components can access or control it
  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Bulletproof Scroll Containment delegation for data-lenis-prevent
  // Temporarily stops Lenis during interaction inside any element with data-lenis-prevent
  let isLenisStopped = false;

  document.addEventListener('mouseover', (e) => {
    if (e.target && typeof e.target.closest === 'function') {
      const container = e.target.closest('[data-lenis-prevent]');
      if (container) {
        if (!isLenisStopped) {
          lenis.stop();
          isLenisStopped = true;
        }
      } else {
        if (isLenisStopped) {
          lenis.start();
          isLenisStopped = false;
        }
      }
    }
  }, { passive: true });

  document.addEventListener('touchstart', (e) => {
    if (e.target && typeof e.target.closest === 'function') {
      const container = e.target.closest('[data-lenis-prevent]');
      if (container) {
        if (!isLenisStopped) {
          lenis.stop();
          isLenisStopped = true;
        }
      } else {
        if (isLenisStopped) {
          lenis.start();
          isLenisStopped = false;
        }
      }
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (isLenisStopped) {
      lenis.start();
      isLenisStopped = false;
    }
  }, { passive: true });

  /* ---------- Smooth anchor scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target, { offset: -60 });
      }
    });
  });

  /* ---------- Page Loader ---------- */
  function runLoader() {
    const loader = document.getElementById('pageLoader');
    const loaderName = document.getElementById('loaderName');
    const loaderBar = document.getElementById('loaderBar');

    if (!loader) {
      window.initAnimations();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loader, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            // Fire animations after loader
            window.initAnimations();
          }
        });
      }
    });

    tl.to(loaderName, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .to(loaderBar, {
      width: '100%',
      duration: 1.2,
      ease: 'power2.inOut'
    }, '-=0.3')
    .to(loaderName, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.in'
    }, '+=0.1');
  }

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
      lenis.scrollTo(0, { duration: 1.5, ease: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    });
  }

  /* ---------- Project Category Filters ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active class on buttons
        filterBtns.forEach(b => {
          b.classList.remove('active');
        });
        
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          
          if (filterValue === 'all' || category === filterValue) {
            // Smooth show
            card.style.display = 'block';
            gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
          } else {
            // Hide
            card.style.display = 'none';
          }
        });

        // Refresh ScrollTrigger to recalculate positions
        ScrollTrigger.refresh();
      });
    });
  }

  /* ---------- Project Case Study Modals ---------- */
  const projectDetailsData = {
    'sap-tracker': {
      title: "SAP Integration Testing Tracker",
      category: "Production Solution for CCBCSA",
      role: "Product Manager / Lead Developer",
      stack: "Vanilla JS, Clerk v5, Firebase Realtime DB, Chart.js, SheetJS, Vercel",
      problem: "During the Coca-Cola Beverages South Africa (CCBCSA) Van Sales integration rollout, API discrepancies and test logs were managed via fragmented, slow-loading Excel spreadsheets. Stakeholders lacked real-time visibility into QA status, leading to go-live delays.",
      strategy: "Engineered a centralized, secure web-based testing tracker. Drafted technical workflows for SAP and Salescode API mappings. Integrated Clerk v5 for multi-domain tenant authentication. Handled CRUD operations for 40+ daily users and aggregated test results into real-time visual progress charts.",
      impact: [
        "Saved 15+ hours/week in manual reporting overhead.",
        "Supported 40+ daily users during critical UAT cycles.",
        "Accelerated QA sign-offs, leading to successful zero-downtime go-live."
      ],
      live: "https://sap-tracker-mocha.vercel.app",
      code: "https://github.com/utkarshkr13/sap-tracker"
    },
    'client-inbox-tracker': {
      title: "L2 Client Escalation Portal",
      category: "Full-stack SaaS Product",
      role: "Product Manager & Full-stack Engineer",
      stack: "Next.js 14, TypeScript, Neon Postgres, Prisma ORM, Gmail API, NextAuth, Tailwind CSS, PWA",
      problem: "Enterprise FMCG support requests got lost in chaotic shared inbox loops. Business analysts and support teams struggled to track SLA breaches, assign ownership, and maintain private resolution logs.",
      strategy: "Designed a real-time ticketing SaaS that auto-syncs with corporate emails using Gmail API. Implemented automated regex-based ticket routing, SLA countdown indicators, and a dual-pane interface to keep internal BA notes isolated from customer views.",
      impact: [
        "Reduced average L2 ticket triage time by 40%.",
        "Prevented SLA breaches entirely across 3 active client regions.",
        "Created real-time visibility for SLA indicators and ownership."
      ],
      live: "https://client-inbox-tracker.vercel.app",
      code: "https://github.com/utkarshkr13/client-inbox-tracker"
    },
    'satellite-crop': {
      title: "Satellite Crop Classification",
      category: "VIT Capstone Project",
      role: "Research & Data Analytics Head",
      stack: "Remote Sensing, Machine Learning, Google Earth Engine, Python",
      problem: "Traditional ground surveys for crop identification are slow, expensive, and fail to track regional agricultural trends under cloudy weather conditions.",
      strategy: "Built a remote-sensing analytics workflow that combines Sentinel-1 SAR (radar) and Sentinel-2 (optical) imagery on Google Earth Engine. Pre-processed datasets to filter cloud cover and trained Random Forest models to classify crop types.",
      impact: [
        "Achieved high classification accuracy for regional crop mapping.",
        "Enabled automated, low-cost monitoring of agricultural yield indicators.",
        "Established stable SAR-optical dataset fusion workflow."
      ],
      live: "#",
      code: "#"
    },
    'cityflo-bi': {
      title: "CityFlo BI Dashboards",
      category: "Business Intelligence Dashboard",
      role: "Business Intelligence & Marketing Analyst",
      stack: "Tableau, Python, PostgreSQL, BeautifulSoup, Selenium",
      problem: "Commuter route optimization and pricing changes were slow because data was scattered across third-party sources and required manual reporting.",
      strategy: "Created automated selenium-based scraping pipelines to extract location intelligence. Modeled databases in PostgreSQL to support Tableau geospatial heatmaps and pricing analytics.",
      impact: [
        "Replaced manual reporting bottlenecks entirely.",
        "Directly supported operations in planning route updates.",
        "Supported price-elasticity modeling using competitor scrapers."
      ],
      live: "#",
      code: "#"
    }
  };

  const projectModal = document.getElementById('projectModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const caseStudyBtns = document.querySelectorAll('.btn-case-study');

  if (projectModal && modalOverlay && modalCloseBtn && caseStudyBtns.length > 0) {
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
            <div style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:4px; display:flex; align-items:center; gap:4px;"><i data-lucide="check" style="width:12px; height:12px; color:#10b981;"></i> KPI Achieved</div>
            <div style="font-size:0.82rem; font-weight:600; color:var(--text-primary); line-height:1.4;">${item}</div>
          `;
          impactContainer.appendChild(div);
        });

        // Set Links
        const liveBtn = document.getElementById('modalLiveLink');
        const codeBtn = document.getElementById('modalCodeLink');

        if (data.live && data.live !== '#') {
          liveBtn.href = data.live;
          liveBtn.style.display = 'inline-flex';
        } else {
          liveBtn.style.display = 'none';
        }

        if (data.code && data.code !== '#') {
          codeBtn.href = data.code;
          codeBtn.style.display = 'inline-flex';
        } else {
          codeBtn.style.display = 'none';
        }

        // Initialize Lucide icons
        if (window.lucide) {
          window.lucide.createIcons({ node: projectModal });
        }

        // Show Modal
        projectModal.style.display = 'flex';
        projectModal.setAttribute('aria-hidden', 'false');
        
        // Stop Lenis background scroll
        if (window.lenis) window.lenis.stop();

        // Animate elements
        gsap.fromTo(modalOverlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo('.modal-wrapper', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'power3.out' });
      });
    });

    // Close Modal Function
    const closeModal = () => {
      gsap.to('.modal-wrapper', { y: 30, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => {
        projectModal.style.display = 'none';
        projectModal.setAttribute('aria-hidden', 'true');
        if (window.lenis) window.lenis.start();
      }});
      gsap.to(modalOverlay, { opacity: 0, duration: 0.3 });
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
  }

  /* ---------- Run Everything ---------- */
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }

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
  }, 5000);

})();
