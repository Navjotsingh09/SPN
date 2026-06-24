(function () {
  'use strict';

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  function setup() {
    var viewH = window.innerHeight;
    document.querySelectorAll('img').forEach(function (img) {
      // Skip nav, footer, and SVG icons
      if (img.closest('nav')) return;
      if (img.closest('#site-footer')) return;
      if (img.closest('.footer-inner')) return;
      var src = img.getAttribute('src') || '';
      if (src.indexOf('.svg') !== -1) return;

      // Images already in viewport on load need no animation
      var rect = img.getBoundingClientRect();
      if (rect.top < viewH && rect.bottom > 0) return;

      img.classList.add('img-anim');
      observer.observe(img);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

})();
