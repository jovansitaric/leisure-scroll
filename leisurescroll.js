(function () {
  var supportsCSSScroll = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline', 'view()'));
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // CSS already forces opacity:1 / no animation via @media (prefers-reduced-motion: reduce),
  // so there's nothing for JS to do in either case.
  if (reducedMotion) return;

  // Native path: browser handles everything via animation-timeline — 0KB JS runs.
  if (supportsCSSScroll) {
    window.LeisureScroll = window.LeisureScroll || {};
    window.LeisureScroll.refresh = function () {}; // no-op: CSS selectors match new elements automatically
    return;
  }

  // --- Fallback: IntersectionObserver-driven reveal for older browsers ---
  var observer;

  function activate(el) {
    var once = el.dataset.lsOnce !== 'false';
    el.classList.add('ls-animated');
    if (once) {
      observer.unobserve(el);
      el.addEventListener('transitionend', function handler() {
        el.style.willChange = 'auto'; // drop the compositor layer once settled
        el.removeEventListener('transitionend', handler);
      });
    }
  }

  function deactivate(el) {
    el.classList.remove('ls-animated');
  }

  function observeNew(root) {
    (root || document).querySelectorAll('[data-ls]:not([data-ls-observed])').forEach(function (el) {
      el.setAttribute('data-ls-observed', '');
      observer.observe(el);
    });
  }

  function start() {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        var once = el.dataset.lsOnce !== 'false';
        if (entry.isIntersecting) {
          activate(el);
        } else if (!once) {
          deactivate(el);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    });

    observeNew();

    window.LeisureScroll = window.LeisureScroll || {};
    // Call after injecting new [data-ls] elements dynamically (AJAX, infinite scroll, etc.)
    window.LeisureScroll.refresh = function (root) { observeNew(root); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start(); // DOM already parsed (e.g. script loaded with defer / at end of body)
  }
})();
