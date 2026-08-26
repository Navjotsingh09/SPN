/* SPN — Accessibility toolbar
   Floating widget for text scaling (100–200%), high-contrast profiles and a
   dyslexia-friendly typeface. Preferences persist in localStorage.
   Text scaling writes explicit px sizes onto text-bearing elements so it works
   on this site's px-based type scale without resizing the layout grid. */
(function () {
  'use strict';

  var STORE_KEY = 'spn-a11y-prefs';
  var STEPS = [100, 115, 130, 150, 175, 200];
  var DYSLEXIC_FONT_HREF = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Lexend:wght@400..700&display=swap';

  var root = document.documentElement;
  var prefs = { scale: 100, contrast: 'off', dyslexic: false };

  /* ---------- preference storage ---------- */

  function load() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (STEPS.indexOf(saved.scale) > -1) prefs.scale = saved.scale;
      if (saved.contrast === 'dark' || saved.contrast === 'light') prefs.contrast = saved.contrast;
      prefs.dyslexic = saved.dyslexic === true;
    } catch (e) { /* storage unavailable or corrupt — keep defaults */ }
  }

  function save() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(prefs));
    } catch (e) { /* ignore quota / private mode failures */ }
  }

  /* ---------- text scaling ---------- */

  var SKIP_TAGS = {
    SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, LINK: 1, META: 1,
    IMG: 1, PICTURE: 1, SOURCE: 1, BR: 1, HR: 1, IFRAME: 1, OBJECT: 1,
    EMBED: 1, CANVAS: 1, VIDEO: 1, AUDIO: 1, SVG: 1, svg: 1
  };
  var FIELD_TAGS = { INPUT: 1, TEXTAREA: 1, SELECT: 1, BUTTON: 1, OPTION: 1 };

  var managed = new Set();
  var metrics = new WeakMap();

  function hasOwnText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    }
    return false;
  }

  function collect() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (el) {
        // aria-hidden subtrees are decorative (oversized watermarks, icon glyphs) — scaling them only breaks layout.
        if (el.hasAttribute('data-a11y') || el.getAttribute('aria-hidden') === 'true' ||
            SKIP_TAGS[el.tagName] || el.tagName.toLowerCase() === 'svg') {
          return NodeFilter.FILTER_REJECT;
        }
        return (hasOwnText(el) || FIELD_TAGS[el.tagName])
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });
    var el;
    while ((el = walker.nextNode())) {
      if (metrics.has(el)) { managed.add(el); continue; }
      // Record author inline values before we ever overwrite them.
      metrics.set(el, { inlineFs: el.style.fontSize, inlineLh: el.style.lineHeight, fs: 0, lh: 0 });
      managed.add(el);
    }
  }

  function restoreInline() {
    managed.forEach(function (el) {
      if (!el.isConnected) { managed.delete(el); return; }
      var m = metrics.get(el);
      el.style.fontSize = m ? m.inlineFs : '';
      el.style.lineHeight = m ? m.inlineLh : '';
    });
  }

  function applyScale() {
    var factor = prefs.scale / 100;

    if (factor === 1) {
      restoreInline();
      managed.clear();
      root.classList.remove('a11y-scaled');
      return;
    }

    collect();
    // Clear first so baselines are measured against unscaled ancestors.
    restoreInline();

    managed.forEach(function (el) {
      var m = metrics.get(el);
      if (!m) return;
      if (!m.fs) {
        var cs = window.getComputedStyle(el);
        m.fs = parseFloat(cs.fontSize) || 16;
        m.lh = cs.lineHeight === 'normal' ? 0 : (parseFloat(cs.lineHeight) || 0);
      }
      el.style.fontSize = (m.fs * factor).toFixed(2) + 'px';
      if (m.lh) el.style.lineHeight = (m.lh * factor).toFixed(2) + 'px';
    });

    root.classList.add('a11y-scaled');
  }

  /* ---------- contrast + font modes ---------- */

  function applyContrast() {
    root.classList.toggle('a11y-hc-dark', prefs.contrast === 'dark');
    root.classList.toggle('a11y-hc-light', prefs.contrast === 'light');
  }

  var dyslexicFontLoaded = false;

  function applyDyslexic() {
    if (prefs.dyslexic && !dyslexicFontLoaded) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = DYSLEXIC_FONT_HREF;
      link.setAttribute('data-a11y', '');
      document.head.appendChild(link);
      dyslexicFontLoaded = true;
    }
    root.classList.toggle('a11y-dyslexic', prefs.dyslexic);
  }

  function applyAll() {
    applyContrast();
    applyDyslexic();
    applyScale();
  }

  /* ---------- widget ---------- */

  var ui = {};

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="6.6" r="1.5" fill="currentColor" stroke="none"/>' +
    '<path d="M5.6 9.4h12.8"/><path d="M12 9.9v5.1"/><path d="M12 15l-2.4 4.2"/><path d="M12 15l2.4 4.2"/></svg>';

  function build() {
    var wrap = document.createElement('div');
    wrap.id = 'spn-a11y';
    wrap.innerHTML =
      '<div class="a11y-panel" id="spn-a11y-panel" role="dialog" aria-label="Accessibility options" hidden>' +
        '<div class="a11y-head">' +
          '<h2 class="a11y-title">Accessibility</h2>' +
          '<button type="button" class="a11y-close" aria-label="Close accessibility options">&times;</button>' +
        '</div>' +
        '<div class="a11y-group">' +
          '<span class="a11y-label" id="spn-a11y-size-label">Text size</span>' +
          '<div class="a11y-size-row" role="group" aria-labelledby="spn-a11y-size-label">' +
            '<button type="button" class="a11y-step" data-act="dec" aria-label="Decrease text size">A&minus;</button>' +
            '<span class="a11y-size-value" aria-live="polite">100%</span>' +
            '<button type="button" class="a11y-step" data-act="inc" aria-label="Increase text size">A+</button>' +
          '</div>' +
        '</div>' +
        '<div class="a11y-group">' +
          '<span class="a11y-label" id="spn-a11y-contrast-label">Contrast</span>' +
          '<div class="a11y-chips" role="group" aria-labelledby="spn-a11y-contrast-label">' +
            '<button type="button" class="a11y-chip" data-contrast="off" aria-pressed="true">Default</button>' +
            '<button type="button" class="a11y-chip" data-contrast="dark" aria-pressed="false">Dark</button>' +
            '<button type="button" class="a11y-chip" data-contrast="light" aria-pressed="false">Light</button>' +
          '</div>' +
        '</div>' +
        '<div class="a11y-group">' +
          '<span class="a11y-label">Readability</span>' +
          '<button type="button" class="a11y-toggle" data-act="dyslexic" aria-pressed="false">' +
            '<span>Dyslexia-friendly font</span><span class="a11y-switch"></span>' +
          '</button>' +
        '</div>' +
        '<button type="button" class="a11y-reset" data-act="reset">Reset all settings</button>' +
      '</div>' +
      '<button type="button" class="a11y-fab" aria-expanded="false" aria-controls="spn-a11y-panel" aria-label="Accessibility options">' + ICON + '</button>';

    document.body.appendChild(wrap);
    // Mark the whole subtree so global overrides skip the widget itself.
    wrap.setAttribute('data-a11y', '');
    wrap.querySelectorAll('*').forEach(function (el) { el.setAttribute('data-a11y', ''); });

    ui.wrap = wrap;
    ui.fab = wrap.querySelector('.a11y-fab');
    ui.panel = wrap.querySelector('.a11y-panel');
    ui.value = wrap.querySelector('.a11y-size-value');
    ui.dec = wrap.querySelector('[data-act="dec"]');
    ui.inc = wrap.querySelector('[data-act="inc"]');
    ui.dyslexic = wrap.querySelector('[data-act="dyslexic"]');
    ui.chips = wrap.querySelectorAll('[data-contrast]');
  }

  function syncUI() {
    var i = STEPS.indexOf(prefs.scale);
    ui.value.textContent = prefs.scale + '%';
    ui.dec.disabled = i <= 0;
    ui.inc.disabled = i >= STEPS.length - 1;
    ui.dyslexic.setAttribute('aria-pressed', String(prefs.dyslexic));
    ui.chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', String(chip.dataset.contrast === prefs.contrast));
    });
  }

  function openPanel(open) {
    ui.panel.hidden = !open;
    ui.fab.setAttribute('aria-expanded', String(open));
    if (open) ui.panel.querySelector('.a11y-close').focus();
  }

  function step(dir) {
    var i = STEPS.indexOf(prefs.scale) + dir;
    if (i < 0 || i >= STEPS.length) return;
    prefs.scale = STEPS[i];
    applyScale();
    save();
    syncUI();
  }

  function bind() {
    ui.fab.addEventListener('click', function () {
      openPanel(ui.panel.hidden);
    });

    ui.panel.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;

      if (btn.classList.contains('a11y-close')) {
        openPanel(false);
        ui.fab.focus();
        return;
      }
      if (btn.dataset.contrast) {
        prefs.contrast = btn.dataset.contrast;
        applyContrast();
      } else if (btn.dataset.act === 'inc') {
        return step(1);
      } else if (btn.dataset.act === 'dec') {
        return step(-1);
      } else if (btn.dataset.act === 'dyslexic') {
        prefs.dyslexic = !prefs.dyslexic;
        applyDyslexic();
      } else if (btn.dataset.act === 'reset') {
        prefs = { scale: 100, contrast: 'off', dyslexic: false };
        applyAll();
      } else {
        return;
      }
      save();
      syncUI();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !ui.panel.hidden) {
        openPanel(false);
        ui.fab.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!ui.panel.hidden && !ui.wrap.contains(e.target)) openPanel(false);
    });
  }

  /* ---------- late DOM (footer is fetched and injected at runtime) ---------- */

  function watch() {
    var timer;
    new MutationObserver(function () {
      if (prefs.scale === 100) return;
      clearTimeout(timer);
      timer = setTimeout(applyScale, 200);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    load();
    build();
    bind();
    syncUI();
    applyAll();
    watch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
