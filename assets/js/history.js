// ─────────────────────────────────────────────────────────
//  Our History page — sticky year bar + scroll-spy
//  Loaded only on /our-history (gated in default.html).
// ─────────────────────────────────────────────────────────
(function () {
  const root = document.querySelector('.tw-hist');
  if (!root) return;

  const nav      = document.getElementById('mainNav');
  const bar      = root.querySelector('.tw-hist-yearbar');
  const track    = root.querySelector('.tw-hist-yearbar-track');
  const chips    = Array.from(root.querySelectorAll('.tw-hist-yearchip'));
  const entries  = Array.from(root.querySelectorAll('.tw-hist-entry'));
  if (!bar || !entries.length) return;

  // ── Keep --nav-h / --bar-h in sync with the (fixed, shrinking) nav ──
  // The nav is position:fixed and adds .navbar-shrink on scroll, changing
  // its height; the sticky year bar's `top` and the entries' scroll offset
  // both depend on it, so track it live rather than hard-coding a value.
  function syncHeights() {
    if (nav) root.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    root.style.setProperty('--bar-h', bar.offsetHeight + 'px');
  }
  syncHeights();
  window.addEventListener('resize', syncHeights);
  if (window.ResizeObserver && nav) {
    new ResizeObserver(syncHeights).observe(nav);
  }

  // ── Click a year → smooth-scroll to its entry ──
  // Uses window.scrollTo with an explicit offset (nav + sticky bar + gap)
  // rather than scrollIntoView, so the landing point is exact regardless of
  // the fixed nav / sticky bar overlapping the top of the viewport.
  function offsetTop() {
    return (nav ? nav.offsetHeight : 80) + bar.offsetHeight + 24;
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const target = document.getElementById(chip.dataset.target);
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - offsetTop();
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });
  });

  // ── Scroll-spy: highlight whichever entry the reader is currently in ──
  const chipFor = {};
  chips.forEach(function (c) { chipFor[c.dataset.target] = c; });

  let activeId = null;
  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    entries.forEach(function (e) { e.classList.toggle('is-active', e.id === id); });
    chips.forEach(function (c) { c.classList.toggle('is-active', c.dataset.target === id); });

    // Keep the active chip visible/centered in the horizontal track.
    const chip = chipFor[id];
    if (chip && track) {
      const target = chip.offsetLeft - (track.clientWidth - chip.offsetWidth) / 2;
      track.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
  }

  // The "active" entry is the last one whose top has scrolled up past a
  // reference line just below the sticky year bar. A plain scroll handler
  // (rAF-throttled) is more predictable than a narrow-band IntersectionObserver
  // — it can't miss an entry that's taller than the observation band, and it
  // reacts to programmatic scrolls too.
  function updateActive() {
    // +8px tolerance so an entry that a click parks exactly at the reference
    // line (top === offsetTop) still counts as active despite sub-pixel rounding.
    const line = offsetTop() + 8;
    let current = entries[0];
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].getBoundingClientRect().top <= line) current = entries[i];
      else break;
    }
    if (current) setActive(current.id);
  }

  // Throttled by timestamp rather than requestAnimationFrame: the rect loop
  // is cheap (9 entries, early break), this runs even when rAF is paused
  // (e.g. a backgrounded/hidden tab), and there's no "stuck flag" failure mode.
  let lastRun = 0;
  function onScroll() {
    const now = Date.now();
    if (now - lastRun < 80) return;
    lastRun = now;
    updateActive();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateActive();

  // ── Photo stack galleries ──────────────────────────────
  Array.from(root.querySelectorAll('.tw-hist-stack[data-gallery]')).forEach(initStack);

  function initStack(stack) {
    const pips = Array.from(stack.querySelectorAll('.tw-hist-pip'));
    if (pips.length <= 1) return;

    const photos    = pips.map(function (p) { return p.dataset.photo; });
    const frontCard = stack.querySelector('.tw-hist-card-front');
    const backCard  = stack.querySelector('.tw-hist-card-back');
    const frontImg  = frontCard.querySelector('img');
    const backImg   = backCard.querySelector('img');
    let currentIdx  = 0;
    let animating   = false;

    function updatePips() {
      pips.forEach(function (pip, i) {
        pip.classList.toggle('is-active', i === currentIdx);
        pip.setAttribute('aria-selected', i === currentIdx ? 'true' : 'false');
      });
    }

    function goTo(idx) {
      if (animating || idx === currentIdx) return;
      animating = true;
      currentIdx = idx;

      var outAnim = frontCard.animate(
        [{ opacity: '1', transform: 'scale(1)' }, { opacity: '0', transform: 'scale(0.93)' }],
        { duration: 160, easing: 'ease', fill: 'forwards' }
      );

      outAnim.finished.then(function () {
        frontImg.src = photos[currentIdx];
        backImg.src  = photos[(currentIdx + 1) % photos.length];
        updatePips();

        var inAnim = frontCard.animate(
          [{ opacity: '0', transform: 'scale(0.93)' }, { opacity: '1', transform: 'scale(1)' }],
          { duration: 220, easing: 'ease', fill: 'forwards' }
        );
        inAnim.finished.then(function () {
          frontCard.style.opacity   = '';
          frontCard.style.transform = '';
          animating = false;
        });
      });
    }

    // Next arrow (desktop)
    var nextBtn = stack.querySelector('.tw-hist-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo((currentIdx + 1) % photos.length);
      });
    }

    // Pip clicks
    pips.forEach(function (pip, i) {
      pip.addEventListener('click', function () { goTo(i); });
    });

    // Swipe (pointer events — covers touch and mouse drag)
    var startX = 0, startY = 0, dragging = false;

    frontCard.addEventListener('pointerdown', function (e) {
      startX   = e.clientX;
      startY   = e.clientY;
      dragging = true;
      frontCard.setPointerCapture(e.pointerId);
    });

    frontCard.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0) {
          goTo((currentIdx + 1) % photos.length);
        } else {
          goTo((currentIdx - 1 + photos.length) % photos.length);
        }
      }
    });

    frontCard.addEventListener('pointercancel', function () { dragging = false; });
  }
})();
