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

    var payload = {};
    new FormData(form).forEach(function (value, key) {
      payload[key] = value;
    });

    fetch(form.getAttribute('action') || 'https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
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
        } else {
          showStatus(form, 'Sorry, something went wrong. Please email Admin@sikhpn.org.', false);
        }
      })
      .catch(function () {
        showStatus(form, 'Network error \u2014 please try again, or email Admin@sikhpn.org.', false);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      });
  });
})();
