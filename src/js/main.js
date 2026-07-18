// ─────────────────────────────────────────────────────────
//  TKD University — main.js
//  Keeps JS lean: only what CSS can't do.
// ─────────────────────────────────────────────────────────


// ── SCROLL REVEAL FALLBACK ────────────────────────────────
// CSS animation-timeline: view() handles reveals natively
// in modern browsers. This IntersectionObserver runs only
// in browsers that don't support it yet (mainly Safari < 17).

if (!CSS.supports('animation-timeline: view()')) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('in', entry.isIntersecting);
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll('.tw-reveal, .tw-stagger').forEach((el) => {
    observer.observe(el);
  });
}


// ── CAROUSEL ARROW HELPER ─────────────────────────────────
// Used by sections with desktop left/right arrow buttons.
// Usage in HTML:
//   <button onclick="scrollCarousel('my-track', -1)">←</button>
//   <button onclick="scrollCarousel('my-track',  1)">→</button>
//   <div id="my-track" class="tw-swipe-track">...</div>

function scrollCarousel(trackId, direction) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const scrollAmount = Math.min(track.clientWidth * 0.8, 400);
  track.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}


// ── MARQUEE — WAAPI ping-pong + auto-fill ────────────────
// Uses the Web Animations API (element.animate) instead of rAF so the
// compositor owns the transform — no inline style mutation every frame,
// which keeps browser DevTools inspector usable during playback.
(function () {
  document.querySelectorAll('.tw-marquee').forEach(function (marquee) {
    var track = marquee.querySelector('.tw-marquee-track');
    if (!track) return;

    var orig = track.innerHTML;
    var currentAnim = null;

    function setup() {
      track.innerHTML = orig;
      var singleW = track.scrollWidth;
      var inner = marquee.querySelector('.tw-marquee-inner') || marquee;
      var cw = inner.offsetWidth || 1200;
      while (track.scrollWidth < cw * 3) {
        track.insertAdjacentHTML('beforeend', orig);
      }
      return singleW;
    }

    function start() {
      var oneWidth = setup();
      // full round-trip duration in ms: distance / speed × 2 directions
      var duration = (oneWidth / 45) * 1000 * 2;

      if (currentAnim) currentAnim.cancel();
      currentAnim = track.animate(
        [
          { transform: 'translate3d(0, 0, 0)' },
          { transform: 'translate3d(' + (-oneWidth) + 'px, 0, 0)' }
        ],
        {
          duration: duration,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'linear',
          fill: 'none'
        }
      );
    }

    start();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 250);
    });
  });
}());


// ── STICKY CTA HIDE-ON-SCROLL ─────────────────────────────
// Hides the sticky bottom bar while the hero is visible.
// The bar reappears as soon as the user scrolls past the hero.

const stickyCta  = document.querySelector('.tw-sticky-cta');
const heroSection = document.querySelector('[data-tw-hero]');

if (stickyCta && heroSection) {
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      stickyCta.style.display = entry.isIntersecting ? 'none' : '';
    },
    { threshold: 0.1 }
  );
  heroObserver.observe(heroSection);
}
