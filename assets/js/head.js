// Runs in <head>, before the first paint.
(() => {
  // Flip to true when the site goes live. Until then, drafts and empty placeholders show everywhere.
  // After launch, add ?draft to any URL to see them again.
  const LAUNCHED = false;

  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: (k) => { try { sessionStorage.removeItem(k); } catch (e) {} },
  };

  if (params.has('draft')) root.dataset.draftParam = '';
  if (!LAUNCHED || params.has('draft')) root.classList.add('show-drafts');

  // ?slowmo plays the page transition 10× slower (or ?slowmo=4 for 4×) for the rest of this tab. ?slowmo=0 turns it off.
  if (params.has('slowmo')) {
    const v = parseFloat(params.get('slowmo') || '10');
    if (v > 0 && v !== 1) store.set('slowmo', String(v)); else store.del('slowmo');
  }
  const slow = parseFloat(store.get('slowmo'));
  if (slow > 0) root.style.setProperty('--vt-slow', String(slow));

  // ─── Room expands ───
  // Only the room being opened or returned to carries view-transition names, so the browser
  // snapshots a handful of pieces instead of every room on the page.
  const nameRoom = (room) => {
    const slug = room.dataset.app;
    room.querySelectorAll('[data-vt]').forEach((el) => { el.style.viewTransitionName = `${el.dataset.vt}-${slug}`; });
  };
  // Whatever sits under that room on screen (the next rooms, the footer) rides along with its bottom edge.
  const nameBelow = (room) => {
    let n = 0;
    for (const el of document.querySelectorAll('a.room, .site-foot')) {
      if (el === room || !(room.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
      const r = el.getBoundingClientRect();
      if (r.top >= innerHeight || n === 4) break;
      if (r.bottom <= 0) continue;
      n += 1;
      el.style.viewTransitionName = `below-${n}`;
      el.style.viewTransitionClass = 'below';
    }
    return n;
  };
  const clearRooms = () => {
    document.querySelectorAll('a.room [data-vt], a.room, .site-foot').forEach((el) => {
      if (el.closest('.hero')) return;
      el.style.viewTransitionName = '';
      el.style.viewTransitionClass = '';
    });
  };
  const openRoom = (room) => { clearRooms(); nameRoom(room); nameBelow(room); };
  window.rooms = { openRoom, clearRooms };

  // Move the pieces below the room so their top edge stays glued to the room's bottom edge.
  // The browser animates the room itself; we read where its bottom starts and ends and follow it.
  const glueBelow = (slug, arriving) => {
    const html = document.documentElement;
    const groupName = `::view-transition-group(room-${slug})`;
    const anim = document.getAnimations().find((a) => a.effect && a.effect.pseudoElement === groupName);
    if (!anim) return;
    const frames = anim.effect.getKeyframes();
    const end = getComputedStyle(html, groupName);
    const y = (t) => { const m = /matrix\(([^)]+)\)/.exec(t || ''); return m ? parseFloat(m[1].split(',')[5]) : 0; };
    const first = frames[0], last = frames[frames.length - 1];
    const fromBottom = y(first.transform) + parseFloat(first.height);
    const toBottom = y(last.transform || end.transform) + parseFloat(last.height || end.height);
    const shift = toBottom - fromBottom;
    if (!isFinite(shift)) return;
    const timing = {
      duration: 720 * (parseFloat(store.get('slowmo')) || 1),
      easing: getComputedStyle(html).getPropertyValue('--vt-ease').trim() || 'ease-in-out',
      fill: 'both',
    };
    for (let i = 1; i <= 4; i += 1) {
      const group = `::view-transition-group(below-${i})`;
      if (arriving) {
        // Coming back: the rooms below start at the big room's bottom edge and rise with it, fading in early.
        html.animate([{ translate: `0 ${-shift}px` }, { translate: '0 0' }], { ...timing, pseudoElement: group });
        html.animate([{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 1 }], { ...timing, easing: 'linear', pseudoElement: `::view-transition-new(below-${i})` });
      } else {
        // Opening: the rooms below get pushed down by the growing room and dissolve into the new page.
        html.animate([{ translate: '0 0' }, { translate: `0 ${shift}px` }], { ...timing, pseudoElement: group });
        html.animate([{ opacity: 1 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], { ...timing, easing: 'linear', pseudoElement: `::view-transition-old(below-${i})` });
      }
    }
  };

  // App pages remember which room they are, so the homepage knows which room to shrink back into.
  const page = root.dataset.page;
  if (page === 'app') store.set('room-from', root.dataset.app);
  else if (page !== 'home') store.del('room-from');

  window.addEventListener('pagereveal', (e) => {
    const vt = e.viewTransition;
    if (!vt) return;
    if (vt.types) vt.types.add(page === 'home' ? 'to-home' : 'to-app');
    let slug = null;
    if (page === 'home') {
      const from = store.get('room-from');
      store.del('room-from');
      const room = from && document.querySelector(`a.room[data-app="${from}"]`);
      if (room) { openRoom(room); slug = from; }
    } else if (page === 'app') {
      slug = root.dataset.app;
    }
    if (slug) vt.ready.then(() => glueBelow(slug, page === 'home')).catch(() => {});
    vt.finished.finally(clearRooms);
  });
})();
