// app.jonbobrow.com — small bits of behavior. Nothing here is required for the site to work.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep ?draft on internal links while previewing drafts.
  if ('draftParam' in root.dataset) {
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (/^(https?:|mailto:|#)/.test(href)) return;
      const [path, hash] = href.split('#');
      a.setAttribute('href', `${path}${path.includes('?') ? '&' : '?'}draft${hash ? `#${hash}` : ''}`);
    });
  }

  // Cookbo's produce drops in the first time its room scrolls into view, once per visit.
  document.querySelectorAll('.produce[data-drop]').forEach((produce) => {
    let landed = false;
    try { landed = sessionStorage.getItem('produce-landed') === '1'; } catch (e) {}
    if (landed || reduce || !('IntersectionObserver' in window)) {
      produce.classList.add('landed');
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      produce.classList.add('go');
      setTimeout(() => {
        produce.classList.add('landed');
        try { sessionStorage.setItem('produce-landed', '1'); } catch (e) {}
      }, 1800);
    }, { threshold: 0.6 });
    io.observe(produce);
  });
})();

// The words in the intro glide down to their app's room.
document.querySelectorAll('.intro a.kw[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', a.getAttribute('href'));
  });
});


// Slots: show a file if it exists at data-src + one of data-exts, otherwise keep the placeholder.
document.querySelectorAll('.slot[data-src]').forEach((slot) => {
  const base = slot.dataset.src;
  const exts = (slot.dataset.exts || '').split(',').filter(Boolean);
  const isVideo = slot.dataset.kind === 'video';
  const tryExt = (i) => {
    if (i >= exts.length) { slot.classList.add('missing'); return; }
    const el = document.createElement(isVideo ? 'video' : 'img');
    const shown = () => {
      slot.querySelectorAll(':scope > .slot-ph, :scope > .slot-fallback').forEach((n) => n.remove());
      slot.prepend(el);
      slot.classList.add('loaded');
    };
    el.addEventListener('error', () => tryExt(i + 1), { once: true });
    if (isVideo) {
      el.muted = true; el.loop = true; el.autoplay = true; el.playsInline = true; el.preload = 'auto';
      el.setAttribute('muted', ''); el.setAttribute('playsinline', '');
      el.addEventListener('loadedmetadata', shown, { once: true });
    } else {
      el.alt = slot.dataset.alt || '';
      el.decoding = 'async';
      el.addEventListener('load', shown, { once: true });
    }
    el.src = `${base}.${exts[i]}`;
  };
  tryExt(0);
});
