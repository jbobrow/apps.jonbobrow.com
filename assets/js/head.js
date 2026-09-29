// Runs in <head>, before the first paint.
(() => {
  // Flip to true when the site goes live. Until then, drafts and empty placeholders show everywhere.
  // After launch, add ?draft to any URL to see them again.
  const LAUNCHED = false;

  const root = document.documentElement;
  const draftParam = new URLSearchParams(location.search).has('draft');
  if (draftParam) root.dataset.draftParam = '';
  if (!LAUNCHED || draftParam) root.classList.add('show-drafts');

  // Coming back home, fade the homepage in rather than sliding it up.
  window.addEventListener('pagereveal', (e) => {
    if (e.viewTransition && root.dataset.page === 'home' && e.viewTransition.types) e.viewTransition.types.add('to-home');
  });
})();
