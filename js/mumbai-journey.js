/* A lightweight city journey layered over the existing Lenis / ScrollTrigger experience. */
(() => {
  'use strict';

  const journey = document.querySelector('.portfolio-journey');
  const progress = document.querySelector('.journey-progress span');
  const locationLabel = document.getElementById('journeyLocation');
  if (!journey || !progress || !locationLabel) return;

  const sections = Array.from(journey.querySelectorAll('section[data-route]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let pointerFrame = 0;
  let latestPointer;
  let activeSection = '';

  const updateScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    journey.style.setProperty('--journey-progress', fraction.toFixed(4));
    progress.style.transform = `scaleX(${fraction})`;
    window.dispatchEvent(new CustomEvent('journey-progress', { detail: fraction }));
    const marker = window.innerHeight * 0.42;
    const current = sections.slice().reverse().find(section => section.getBoundingClientRect().top <= marker);
    setActiveSection(current || sections[0]);
  };

  const setActiveSection = (section) => {
    if (!section || activeSection === section.id) return;
    activeSection = section.id;
    locationLabel.textContent = `Mumbai · ${section.dataset.route.replace(/^\d+\s*·\s*/, '')}`;
  };

  if (window.lenis && typeof window.lenis.on === 'function') {
    window.lenis.on('scroll', updateScroll);
  } else {
    window.addEventListener('scroll', updateScroll, { passive: true });
  }
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  let pointerInteractionsBound = false;
  const bindPointerInteractions = () => {
    if (!finePointer.matches || reducedMotion.matches || pointerInteractionsBound) return;
    pointerInteractionsBound = true;

    const setPointer = (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      latestPointer = event;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!latestPointer) return;
        const x = (latestPointer.clientX / window.innerWidth - 0.5) * 12;
        const y = (latestPointer.clientY / window.innerHeight - 0.5) * 8;
        journey.style.setProperty('--pointer-x', `${x.toFixed(2)}px`);
        journey.style.setProperty('--pointer-y', `${y.toFixed(2)}px`);
      });
    };
    window.addEventListener('pointermove', setPointer, { passive: true });
    window.addEventListener('pointerleave', () => {
      journey.style.setProperty('--pointer-x', '0px');
      journey.style.setProperty('--pointer-y', '0px');
    }, { passive: true });

    journey.querySelectorAll('.project-card').forEach((card) => {
      let cardFrame = 0;
      let lastEvent = null;
      card.addEventListener('pointermove', (event) => {
        if (!finePointer.matches || reducedMotion.matches) return;
        lastEvent = event;
        if (cardFrame) return;
        cardFrame = requestAnimationFrame(() => {
          cardFrame = 0;
          if (!lastEvent) return;
          const rect = card.getBoundingClientRect();
          const dx = (lastEvent.clientX - rect.left) / rect.width - 0.5;
          const dy = (lastEvent.clientY - rect.top) / rect.height - 0.5;
          const image = card.querySelector('.project-card-image img');
          if (!image) return;
          image.style.setProperty('--image-x', `${(-dy * 3).toFixed(2)}deg`);
          image.style.setProperty('--image-y', `${(dx * 3).toFixed(2)}deg`);
        });
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(cardFrame);
        cardFrame = 0;
        lastEvent = null;
        const image = card.querySelector('.project-card-image img');
        if (image) {
          image.style.setProperty('--image-x', '0deg');
          image.style.setProperty('--image-y', '0deg');
        }
      });
    });
  };

  bindPointerInteractions();

  reducedMotion.addEventListener('change', (event) => {
    if (!event.matches) {
      bindPointerInteractions();
      return;
    }
    cancelAnimationFrame(pointerFrame);
    journey.style.setProperty('--pointer-x', '0px');
    journey.style.setProperty('--pointer-y', '0px');
    journey.querySelectorAll('.project-card').forEach((card) => {
      const image = card.querySelector('.project-card-image img');
      if (image) {
        image.style.setProperty('--image-x', '0deg');
        image.style.setProperty('--image-y', '0deg');
      }
    });
  });

  finePointer.addEventListener('change', (event) => {
    if (event.matches && !reducedMotion.matches) {
      bindPointerInteractions();
      return;
    }
    journey.style.setProperty('--pointer-x', '0px');
    journey.style.setProperty('--pointer-y', '0px');
    journey.querySelectorAll('.project-card').forEach((card) => {
      const image = card.querySelector('.project-card-image img');
      if (image) {
        image.style.setProperty('--image-x', '0deg');
        image.style.setProperty('--image-y', '0deg');
      }
    });
  });
})();
