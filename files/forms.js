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
    el.style.color = ok ? '#2a6041' : '#b00020';
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
    var fetchOpts;
    if (hasFile) {
      // Let the browser set Content-Type (with the multipart boundary).
      fetchOpts = { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) };
    } else {
      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = value;
      });
      fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      };
    }

    fetch(action, fetchOpts)
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (result && result.success) {
          showStatus(
            form,
            form.getAttribute('data-success') ||
              'Thank you \u2014 your message has been sent. We will be in touch soon.',
            true
          );
          form.reset();
          form.dispatchEvent(new CustomEvent('spn:success', { bubbles: true }));
        } else {
          showStatus(form, 'Sorry, something went wrong. Please email hello@sikhpn.org.', false);
        }
      })
      .catch(function () {
        showStatus(form, 'Network error \u2014 please try again, or email hello@sikhpn.org.', false);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      });
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
