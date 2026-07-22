// ─────────────────────────────────────────────────────────
//  Mobile menu open/close — vanilla, no jQuery, no Bootstrap collapse.
//
//  Replaces Bootstrap's collapse plugin for #navbarResponsive. The
//  toggler's data-toggle/data-target attributes were removed from
//  _includes/nav.html so Bootstrap never binds to it and can't fight us.
//  Bootstrap's collapse *CSS* still supplies the show/hide display rule
//  (.collapse:not(.show){display:none}), which is why .show is added
//  before we measure scrollHeight.
//
//  Timing is deliberately asymmetric:
//    open  — 200ms height ease-out + a 40ms-per-item stagger
//    close — instant. .is-closing kills every transition and delay so the
//            panel is gone on the same frame the tap lands.
//
//  Styles live in _sass/components/_navbar.scss (mobile menu block).
// ─────────────────────────────────────────────────────────
(function () {
  'use strict';

  var nav = document.getElementById('mainNav');
  if (!nav) return;

  var toggler = nav.querySelector('.navbar-toggler');
  var menu = nav.querySelector('.navbar-collapse');
  if (!toggler || !menu) return;

  var DESKTOP_MIN = 992;   // matches .navbar-expand-lg
  var OPEN_MS = 200;       // keep in sync with the height transition in CSS
  var isOpen = false;
  var openTimer = null;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_MIN;
  }

  function open() {
    if (isOpen || isDesktop()) return;
    isOpen = true;
    clearTimeout(openTimer);

    menu.classList.remove('is-closing');
    // .show first: while hidden the element has no scrollHeight to measure.
    menu.classList.add('show');

    // Hand each item its 0-based index; CSS turns it into a stagger delay.
    // Read fresh every open so CMS-driven menu changes are picked up, and so
    // the timing scales to any number of items.
    var items = menu.querySelectorAll('.nav-item');
    for (var i = 0; i < items.length; i++) {
      items[i].style.setProperty('--i', i);
    }

    menu.style.height = 'auto';
    var target = menu.scrollHeight;
    menu.style.height = '0px';

    // Flush the base state so the browser has a real "from" to interpolate
    // against — you cannot transition out of display:none, so without this the
    // items would just appear at their end state. Reading offsetHeight forces
    // layout; reading a child's computed opacity guarantees the items
    // themselves are resolved, not just the panel.
    void menu.offsetHeight;
    if (items.length) void getComputedStyle(items[0]).opacity;

    // Both classes flip synchronously, right after that flush. Deliberately
    // NOT in requestAnimationFrame: rAF is throttled in background tabs, and a
    // dropped callback would strand the items at 50% opacity forever.
    menu.classList.add('is-animating');
    menu.classList.add('items-in');
    menu.style.height = target + 'px';

    toggler.setAttribute('aria-expanded', 'true');
    nav.classList.add('menu-open');

    // Hand height back to the content once the run finishes, so submenus or
    // an orientation change can't get clipped by a stale pixel height.
    openTimer = setTimeout(function () {
      menu.classList.remove('is-animating');
      menu.style.height = '';
    }, OPEN_MS);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    clearTimeout(openTimer);

    // is-closing suppresses transitions/delays for this frame → instant.
    menu.classList.add('is-closing');
    menu.classList.remove('is-animating');
    menu.classList.remove('items-in');   // reset so the next open animates again
    menu.classList.remove('show');
    menu.style.height = '';

    toggler.setAttribute('aria-expanded', 'false');
    nav.classList.remove('menu-open');

    // Drop the flag once the frame has painted so the next open animates.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        menu.classList.remove('is-closing');
      });
    });
  }

  toggler.addEventListener('click', function (e) {
    e.preventDefault();
    if (isOpen) { close(); } else { open(); }
  });

  // Tapping a link closes instantly, so the new page isn't loaded behind an
  // open panel. Submenu links included.
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });

  // Esc closes.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) close();
  });

  // Crossing into desktop: Bootstrap's own CSS shows the menu inline there,
  // so clear our state rather than leaving an inline height behind.
  window.addEventListener('resize', function () {
    if (isDesktop() && isOpen) close();
  });
})();


// ─── Sync --nav-h to :root on every page ─────────────────────────────────────
//  Used by hero/header padding (tw-cpage-header, tw-hist-header, etc.) so
//  they always clear the current nav height. history.js re-scopes it onto
//  .tw-hist for the yearbar; this global fallback covers every other page.
(function () {
  var nav = document.getElementById('mainNav');
  if (!nav) return;
  var root = document.documentElement;
  function syncNavH() {
    root.style.setProperty('--nav-h', nav.offsetHeight + 'px');
  }
  syncNavH();
  window.addEventListener('resize', syncNavH, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(syncNavH).observe(nav);
})();


// ─── Utility nav: scroll-coupled show/hide ───────────────────────────────────
//  Drives both the utility bar's transform and the main nav's top offset
//  directly from scrollY on every scroll event — no transitions, no timers,
//  no class toggles. The elements move in lockstep with the page scroll so
//  the whole header feels like it's part of the document flow.
//
//  At scrollY = 0:          utility fully visible, main nav at top: utilH
//  At scrollY = utilH:      utility scrolled off-screen, main nav at top: 0
//  At scrollY > utilH:      both stay in their final positions
//  On mobile (< 992px):     inline styles cleared, CSS defaults take over
(function () {
  var util = document.getElementById('utilityNav');
  var nav  = document.getElementById('mainNav');
  if (!util || !nav) return;

  var DESKTOP = 992;
  var utilH   = 0;

  function measure() {
    // offsetHeight is 0 when display:none (mobile); only measure on desktop.
    if (window.innerWidth >= DESKTOP) utilH = util.offsetHeight || 36;
  }

  function update() {
    if (window.innerWidth < DESKTOP) {
      // Reset to CSS defaults so mobile nav is unaffected.
      util.style.transform = '';
      nav.style.top        = '';
      return;
    }
    // Clamp to [0, utilH] so rubber-band over-scroll (negative scrollY on iOS)
    // and scrolling beyond utilH both stay at their endpoints.
    var shift = Math.max(0, Math.min(window.scrollY, utilH));
    util.style.transform = 'translateY(' + (-shift) + 'px)';
    nav.style.top        = (utilH - shift) + 'px';
  }

  measure();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', function () { measure(); update(); }, { passive: true });
  update();
})();
