/* Progressive enhancement: all content and links work without JavaScript. */
(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('portfolio-theme'); } catch { /* Storage can be unavailable. */ }
  const setTheme = theme => {
    root.dataset.theme = theme;
    toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  };
  setTheme(['dark', 'light'].includes(savedTheme) ? savedTheme : (themeQuery.matches ? 'dark' : 'light'));
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    savedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(savedTheme);
    try { localStorage.setItem('portfolio-theme', savedTheme); } catch { /* Theme still works for this visit. */ }
  });
  themeQuery.addEventListener('change', event => {
    if (!savedTheme) setTheme(event.matches ? 'dark' : 'light');
  });

  const cards = [...document.querySelectorAll('.project-card')];
  const filters = [...document.querySelectorAll('.filter-btn')];
  document.querySelector('.projects-filter-bar').hidden = false;
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    const category = button.dataset.filter;
    cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
    document.getElementById('filterStatus').textContent = `${cards.filter(card => !card.hidden).length} projects shown.`;
  }));

  const modal = document.getElementById('projectModal');
  let modalTrigger = null;
  if (typeof modal.showModal === 'function') {
    document.querySelectorAll('.case-link').forEach(link => link.addEventListener('click', event => {
      const notes = document.querySelector(link.getAttribute('href'));
      if (!notes) return;
      event.preventDefault();
      modalTrigger = link;
      document.getElementById('modalTitle').textContent = link.closest('.project-card').querySelector('h3').innerText.replace(/\s+/g, ' ');
      const content = notes.querySelector('.case-content').cloneNode(true);
      document.getElementById('modalContent').replaceChildren(content);
      modal.showModal();
      root.classList.add('modal-open');
      document.getElementById('modalClose').focus();
    }));
    document.getElementById('modalClose').addEventListener('click', () => modal.close());
    modal.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...modal.querySelectorAll('button, a[href], input, [tabindex="0"]')]
        .filter(element => !element.hidden && !element.disabled);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    modal.addEventListener('click', event => {
      const bounds = modal.getBoundingClientRect();
      if (event.target === modal && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) modal.close();
    });
    modal.addEventListener('close', () => {
      root.classList.remove('modal-open');
      modalTrigger?.focus();
      modalTrigger = null;
    });
  }
  // Native details remain available, including when arriving through a direct link.
  const openLinkedNotes = () => {
    const notes = document.getElementById(location.hash.slice(1));
    if (notes?.tagName === 'DETAILS') notes.open = true;
  };
  openLinkedNotes();
  window.addEventListener('hashchange', openLinkedNotes);

  const copyButton = document.getElementById('copyEmail');
  if (navigator.clipboard && window.isSecureContext) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const status = document.getElementById('copyStatus');
      try {
        await navigator.clipboard.writeText('hello@utkarsh.ind.in');
        status.textContent = 'Email address copied.';
      } catch {
        status.textContent = 'Couldn’t copy. You can use the email link above.';
      }
    });
  }
  document.getElementById('year').textContent = new Date().getFullYear();
})();
