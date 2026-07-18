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


// ── MARQUEE — JS ping-pong + auto-fill ───────────────────
// B: contained to 1500px with CSS mask-image gradient fade (see input.css).
// C: JS measures one copy width, clones until track fills 3× the container,
//    then drives a cosine ease-in-out ping-pong via requestAnimationFrame.
//    No CSS animation property — JS owns the transform entirely.
(function () {
  document.querySelectorAll('.tw-marquee').forEach(function (marquee) {
    var track = marquee.querySelector('.tw-marquee-track');
    if (!track) return;

    var orig = track.innerHTML; // one copy from the server-rendered HTML

    function setup() {
      track.innerHTML = orig;
      var singleW = track.scrollWidth;           // one copy width
      var cw = marquee.offsetWidth || 1200;
      // clone until track is 3× container — ensures no gap at any point in the sweep
      while (track.scrollWidth < cw * 3) {
        track.insertAdjacentHTML('beforeend', orig);
      }
      return singleW;
    }

    var oneWidth = setup();
    var SPEED = 45; // px/s — constant linear velocity
    var elapsed = 0;
    var prev = null;
    var raf;

    function tick(now) {
      if (prev === null) prev = now;
      elapsed += (now - prev) / 1000;
      prev = now;
      // triangle wave: linear 0→1→0→1... with no easing at the ends
      var halfCycle = oneWidth / SPEED;
      var t = (elapsed / halfCycle) % 2;
      var progress = t <= 1 ? t : 2 - t;
      track.style.transform = 'translate3d(' + (-oneWidth * progress) + 'px, 0, 0)';
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    // on resize: re-clone, recalculate, restart from zero
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        cancelAnimationFrame(raf);
        oneWidth = setup();
        CYCLE = (oneWidth / 45) * 2;
        elapsed = 0;
        prev = null;
        raf = requestAnimationFrame(tick);
      }, 250);
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
