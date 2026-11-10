(() => {
  'use strict';

  const progress = document.querySelector('.journey-progress span');
  if (!progress) return;

  const updateProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
})();
