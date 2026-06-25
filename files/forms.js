/*
 * SPN form handler — submits any <form data-web3form> to Web3Forms via fetch
 * and shows an inline status message (no page reload). Works for forms that
 * are injected dynamically (e.g. the shared footer) because it listens on
 * the document via event delegation.
 *
 * The Web3Forms access key is a public form id and is safe in client code.
 */
(function () {
  'use strict';

  /* ── Success modal ── */
  var modalStylesInjected = false;

  function injectModalStyles() {
    if (modalStylesInjected) return;
    modalStylesInjected = true;
    var s = document.createElement('style');
    s.textContent = [
      '.spn-modal-overlay{',
        'position:fixed;inset:0;z-index:9999;',
        'background:rgba(10,14,26,0.72);backdrop-filter:blur(4px);',
        'display:flex;align-items:center;justify-content:center;',
        'padding:24px;opacity:0;transition:opacity .25s ease;',
      '}',
      '.spn-modal-overlay.spn-modal-visible{opacity:1}',
      '.spn-modal{',
        'background:#fff;border-radius:20px;',
        'padding:48px 40px 40px;max-width:480px;width:100%;',
        'display:flex;flex-direction:column;align-items:center;gap:16px;',
        'text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.25);',
        'transform:translateY(16px);transition:transform .3s cubic-bezier(.34,1.56,.64,1);',
      '}',
      '.spn-modal-overlay.spn-modal-visible .spn-modal{transform:translateY(0)}',
      '.spn-modal-icon{',
        'width:64px;height:64px;border-radius:50%;',
        'background:#b86c40;display:flex;align-items:center;justify-content:center;flex-shrink:0;',
      '}',
      '.spn-modal-icon svg{width:28px;height:28px}',
      '.spn-modal-title{',
        'font-family:\'Lora\',serif;font-size:28px;font-weight:400;',
        'color:#132030;line-height:36px;letter-spacing:-1px;margin:0;',
      '}',
      '.spn-modal-msg{',
        'font-family:\'Instrument Sans\',sans-serif;font-size:16px;font-weight:400;',
        'color:#5a6170;line-height:24px;margin:0;max-width:380px;',
      '}',
      '.spn-modal-close{',
        'margin-top:8px;padding:12px 32px;border-radius:6px;',
        'background:#b86c40;color:#fff;border:none;cursor:pointer;',
        'font-family:\'Instrument Sans\',sans-serif;font-size:15px;font-weight:600;',
        'transition:background .2s;',
      '}',
      '.spn-modal-close:hover{background:#132030}',
      '@media(max-width:480px){',
        '.spn-modal{padding:36px 24px 28px}',
        '.spn-modal-title{font-size:22px}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  function showSuccessModal(message) {
    injectModalStyles();

    var overlay = document.createElement('div');
    overlay.className = 'spn-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Form submitted successfully');

    overlay.innerHTML =
      '<div class="spn-modal">' +
        '<div class="spn-modal-icon">' +
          '<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M5 14.5l6.5 6.5L23 8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
        '</div>' +
        '<h3 class="spn-modal-title">You\'re all set!</h3>' +
        '<p class="spn-modal-msg">' + message + '</p>' +
        '<button class="spn-modal-close" type="button">Done</button>' +
      '</div>';

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('spn-modal-visible');
      });
    });

    function closeModal() {
      overlay.classList.remove('spn-modal-visible');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
    }

    overlay.querySelector('.spn-modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKey); }
    });
  }

  function getStatusEl(form) {
    var el = form.querySelector('.web3-status');
    if (!el) {
      el = document.createElement('p');
      el.className = 'web3-status';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.style.margin = '12px 0 0';
      el.style.fontSize = '14px';
      el.style.lineHeight = '1.4';
      form.appendChild(el);
    }
    return el;
  }

  function showStatus(form, message, ok) {
    var el = getStatusEl(form);
    el.textContent = message;
    el.style.display = 'block';
    el.style.color = ok ? '#b86c40' : '#e05252';
  }

  // ----- Devanhaar backend config -----
  // Forms marked `data-devanhaar` POST to the Devanhaar backend FIRST. If that
  // fails (network/server), we fall back to Web3Forms so a lead is never lost —
  // and we never send two emails on success. Forms without the attribute keep
  // their existing Web3Forms-only behaviour.
  // Override the base for local testing BEFORE this script loads, e.g.:
  //   <script>window.SPN_DEVANHAAR_API = 'http://localhost:3000';</script>
  var DEVANHAAR_BASE = (typeof window !== 'undefined' && window.SPN_DEVANHAAR_API) || 'https://devanhaar.com';
  var DEVANHAAR_ENDPOINT = String(DEVANHAAR_BASE).replace(/\/+$/, '') + '/api/spn-submissions';

  // POST the form's text fields to the Devanhaar backend. Resolves true on
  // success, false on any failure (so the caller can fall back to Web3Forms).
  function submitToDevanhaar(form, textPayload) {
    var data = {};
    Object.keys(textPayload).forEach(function (k) { data[k] = textPayload[k]; });
    // Resolve submission type. The events form carries Grad Awards via its modal,
    // so map an 'event' submission to 'grad_award' when it's the awards.
    var st = form.getAttribute('data-submission-type') || data.submission_type || 'join';
    if (st === 'event' && data.event_name && /graduate award/i.test(String(data.event_name))) {
      st = 'grad_award';
    }
    data.submission_type = st;
    data.source = data.source || 'SPN';
    data.page_url = (typeof location !== 'undefined') ? location.href : '';
    return fetch(DEVANHAAR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (response) {
      return response.json().then(function (r) {
        return response.ok && r && r.success === true;
      }).catch(function () { return response.ok; });
    }).catch(function () { return false; });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!(form instanceof HTMLFormElement) || !form.hasAttribute('data-web3form')) {
      return;
    }

    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var submitBtn = form.querySelector('[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending\u2026';
    }

    // Forms that include a file input must be sent as multipart/form-data so the
    // uploaded files reach Web3Forms. Forms without files keep using JSON.
    var hasFile = false;
    var fileInputs = form.querySelectorAll('input[type="file"]');
    for (var i = 0; i < fileInputs.length; i++) {
      if (fileInputs[i].files && fileInputs[i].files.length) { hasFile = true; break; }
    }

    var action = form.getAttribute('action') || 'https://api.web3forms.com/submit';
    var textPayload = {};
    new FormData(form).forEach(function (value, key) {
      if (typeof value === 'string') { textPayload[key] = value; }
    });
    // Web3Forms personalises confirmation emails using the `name` field.
    // Forms that use separate firstName/lastName fields won't have it, so
    // synthesise it here so the email reads "Thank you, Navjot Singh" etc.
    if (!textPayload.name && (textPayload.firstName || textPayload.lastName)) {
      textPayload.name = [textPayload.firstName, textPayload.lastName].filter(Boolean).join(' ');
    }
    var fetchOpts;
    if (hasFile) {
      // Let the browser set Content-Type (with the multipart boundary).
      fetchOpts = { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) };
    } else {
      fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(textPayload)
      };
    }

    function restoreBtn() {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
    function onSuccess() {
      var msg = form.getAttribute('data-success') ||
        'Thank you \u2014 your message has been sent. We will be in touch soon.';
      showSuccessModal(msg);
      form.reset();
      form.dispatchEvent(new CustomEvent('spn:success', { bubbles: true }));
      restoreBtn();
    }
    function onError() {
      showStatus(form, 'Sorry, something went wrong. Please email hello@sikhpn.org.', false);
      restoreBtn();
    }
    function submitToWeb3Forms() {
      return fetch(action, fetchOpts)
        .then(function (response) { return response.json(); })
        .then(function (result) { return !!(result && result.success); })
        .catch(function () { return false; });
    }

    if (form.hasAttribute('data-devanhaar')) {
      // Primary: Devanhaar backend. Fallback on failure: Web3Forms email.
      submitToDevanhaar(form, textPayload).then(function (ok) {
        if (ok) { onSuccess(); return; }
        submitToWeb3Forms().then(function (ok2) { if (ok2) { onSuccess(); } else { onError(); } });
      });
    } else {
      // Unchanged: Web3Forms only for non-connected forms.
      submitToWeb3Forms().then(function (ok) { if (ok) { onSuccess(); } else { onError(); } });
    }
  });
})();

/*
 * SPN mobile navigation — injects an accessible burger menu on every page.
 * Purely additive: it reads the page's existing .nav-links + .nav-cta so the
 * menu always matches that page's navigation (including the active link). The
 * burger and panel are hidden by CSS above the breakpoint, so desktop is
 * unchanged. If this script fails to run, the page behaves exactly as before.
 */
(function () {
  'use strict';

  var BREAKPOINT = 1000; // keep in sync with footer.css mobile-nav media query

  function init() {
    var navbar = document.querySelector('.navbar');
    if (!navbar || navbar.querySelector('.nav-toggle')) {
      return;
    }

    var navLinks = navbar.querySelector('.nav-links');
    var navCta = navbar.querySelector('.nav-cta');

    // Build the slide-down panel from the page's own nav so it stays in sync.
    var panel = document.createElement('div');
    panel.className = 'mobile-menu';
    panel.id = 'mobile-menu';

    // Explicit close (X) button — the panel sits above the header, so the
    // burger that morphs into an X is covered. This gives users a visible close.
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'mobile-menu-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>';
    panel.appendChild(closeBtn);

    if (navLinks) {
      navLinks.querySelectorAll('a').forEach(function (a) {
        var link = a.cloneNode(true);
        link.removeAttribute('class');
        if (a.classList.contains('active')) {
          link.className = 'active';
        }
        panel.appendChild(link);
      });
    }
    if (navCta) {
      panel.appendChild(navCta.cloneNode(true));
    }

    var backdrop = document.createElement('div');
    backdrop.className = 'mobile-menu-backdrop';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'mobile-menu');
    toggle.innerHTML =
      '<span class="nav-toggle-box">' +
      '<span class="nav-toggle-bar"></span>' +
      '<span class="nav-toggle-bar"></span>' +
      '<span class="nav-toggle-bar"></span>' +
      '</span>';

    // Insert the burger before the CTA (or at the end of the navbar).
    if (navCta) {
      navbar.insertBefore(toggle, navCta);
    } else {
      navbar.appendChild(toggle);
    }
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    function open() {
      panel.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('nav-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function close() {
      panel.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function isOpen() {
      return panel.classList.contains('open');
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) {
        close();
      } else {
        open();
      }
    });

    backdrop.addEventListener('click', close);

    closeBtn.addEventListener('click', close);

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        close();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        close();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > BREAKPOINT && isOpen()) {
        close();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/*
 * Glassmorphism sticky navbar — adds .scrolled to .site-header once the user
 * scrolls past 16px, triggering the frosted-glass CSS transition.
 */
(function () {
  'use strict';
  function initScrollNav() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 1) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollNav);
  } else {
    initScrollNav();
  }
})();

/*
 * SPN sticky glass navbar — makes the site-header fixed with glassmorphism.
 * Starts semi-transparent; gains a stronger frosted-glass backing on scroll.
 * Applies to every page since this script is loaded site-wide.
 */
(function () {
  'use strict';

  function initGlassNav() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    /* ── Inject CSS ── */
    var s = document.createElement('style');
    s.textContent = [
      '.site-header{',
        'position:fixed!important;top:0;left:0;right:0;',
        'z-index:998;',
        'background:rgba(255,255,255,0.6)!important;',
        'backdrop-filter:blur(20px) saturate(180%)!important;',
        '-webkit-backdrop-filter:blur(20px) saturate(180%)!important;',
        'border-bottom:1px solid rgba(255,255,255,0.35)!important;',
        'box-shadow:none!important;',
        'transition:background .4s ease,box-shadow .4s ease,border-color .4s ease!important;',
        'will-change:background,box-shadow;',
      '}',
      '.site-header.spn-nav--scrolled{',
        'background:rgba(255,255,255,0.88)!important;',
        'border-bottom:1px solid rgba(0,0,0,0.07)!important;',
        'box-shadow:0 4px 32px rgba(0,0,0,0.08)!important;',
      '}',
      /* Compact navbar height on scroll */
      '.site-header.spn-nav--scrolled .navbar{',
        'padding-top:16px!important;padding-bottom:16px!important;',
        'transition:padding .4s ease;',
      '}',
      '.navbar{transition:padding .4s ease!important}'
    ].join('');
    document.head.appendChild(s);

    /* ── Compensate for fixed header ── */
    function setBodyPad() {
      document.body.style.paddingTop = header.offsetHeight + 'px';
    }
    setBodyPad();
    window.addEventListener('resize', setBodyPad, { passive: true });

    /* ── Scroll handler ── */
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 24) {
            header.classList.add('spn-nav--scrolled');
          } else {
            header.classList.remove('spn-nav--scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlassNav);
  } else {
    initGlassNav();
  }
})();
