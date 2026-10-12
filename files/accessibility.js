/* SPN — Accessibility toolbar
   SPN-styled profiles, typography, contrast, reading and media controls.
   Preferences persist in localStorage; media resets restore prior mute state.
   Text scaling writes explicit px sizes onto text-bearing elements so it works
   on this site's px-based type scale without resizing the layout grid. */
(function () {
  'use strict';

  var STORE_KEY = 'spn-a11y-prefs';
  var STEPS = [80, 90, 100, 110, 120, 130, 140, 150, 175, 200];
  var DYSLEXIC_FONT_HREF = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Lexend:wght@400..700&display=swap';

  var root = document.documentElement;
  function defaults() {
    return { scale: 100, contrast: 'off', saturation: 'off', profile: 'off',
      dyslexic: false, spacing: false, lineHeight: false, bold: false,
      links: false, motion: false, reading: false, videos: false, muted: false };
  }
  var prefs = defaults();

  /* ---------- preference storage ---------- */

  function load() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (STEPS.indexOf(saved.scale) > -1) prefs.scale = saved.scale;
      if (saved.contrast === 'dark' || saved.contrast === 'light') prefs.contrast = saved.contrast;
      prefs.dyslexic = saved.dyslexic === true;
      ['spacing', 'lineHeight', 'bold', 'links', 'motion', 'reading', 'videos', 'muted'].forEach(function (key) {
        prefs[key] = saved[key] === true;
      });
      if (saved.saturation === 'low' || saved.saturation === 'grayscale') prefs.saturation = saved.saturation;
      if (['seizure', 'adhd', 'lowvision'].indexOf(saved.profile) > -1) prefs.profile = saved.profile;
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

    // Measure every baseline before writing: nested text must not scale twice.
    managed.forEach(function (el) {
      var m = metrics.get(el);
      if (!m) return;
      var cs = window.getComputedStyle(el);
      m.fs = parseFloat(cs.fontSize) || 16;
      m.lh = cs.lineHeight === 'normal' ? 0 : (parseFloat(cs.lineHeight) || 0);
    });
    managed.forEach(function (el) {
      var m = metrics.get(el);
      if (!m) return;
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
    ['spacing', 'lineHeight', 'bold', 'links', 'motion'].forEach(function (key) {
      root.classList.toggle('a11y-' + key, prefs[key]);
    });
    applyScale();
    root.classList.toggle('a11y-grayscale', prefs.saturation === 'grayscale');
    root.classList.toggle('a11y-low-saturation', prefs.saturation === 'low');
    if (ui.mask) ui.mask.hidden = !prefs.reading;
    applyMedia();
    document.dispatchEvent(new CustomEvent('spn-a11y-motion', { detail: { paused: prefs.motion } }));
  }

  /* ---------- reading and media ---------- */

  var originalMuted = new Map();
  var vimeoPlayers = new Map();
  var vimeoVolumes = new Map();
  var vimeoLoading = false;

  function applyVimeo() {
    if (!window.Vimeo || !window.Vimeo.Player) return;
    document.querySelectorAll('iframe[src*="player.vimeo.com"]').forEach(function (frame) {
      var player = vimeoPlayers.get(frame);
      if (!player) {
        player = new window.Vimeo.Player(frame);
        vimeoPlayers.set(frame, player);
      }
      if (prefs.videos) player.pause().catch(function () {});
      if (prefs.muted && !vimeoVolumes.has(frame)) {
        vimeoVolumes.set(frame, null);
        player.getVolume().then(function (volume) {
          if (!prefs.muted) { vimeoVolumes.delete(frame); return; }
          vimeoVolumes.set(frame, volume);
          player.setVolume(0).catch(function () {});
        }).catch(function () { vimeoVolumes.delete(frame); });
      } else if (!prefs.muted && vimeoVolumes.has(frame)) {
        var volume = vimeoVolumes.get(frame);
        vimeoVolumes.delete(frame);
        if (volume !== null) player.setVolume(volume).catch(function () {});
      }
    });
  }

  function applyMedia() {
    document.querySelectorAll('video, audio').forEach(function (media) {
      if (prefs.videos && media.tagName === 'VIDEO') media.pause();
      if (prefs.muted) {
        if (!originalMuted.has(media)) originalMuted.set(media, media.muted);
        media.muted = true;
      } else if (originalMuted.has(media)) {
        media.muted = originalMuted.get(media);
        originalMuted.delete(media);
      }
    });
    if (window.Vimeo && window.Vimeo.Player) return applyVimeo();
    if (vimeoLoading || (!prefs.videos && !prefs.muted) ||
        !document.querySelector('iframe[src*="player.vimeo.com"]')) return;
    vimeoLoading = true;
    var script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    script.setAttribute('data-a11y', '');
    script.onload = function () { vimeoLoading = false; applyVimeo(); };
    script.onerror = function () { vimeoLoading = false; };
    document.head.appendChild(script);
  }

  function moveMask(y) {
    if (prefs.reading) ui.mask.style.top = Math.max(0, Math.min(window.innerHeight - 150, y - 75)) + 'px';
  }

  function toggleButton(key, label) {
    return '<button type="button" class="a11y-toggle" data-toggle="' + key + '" aria-pressed="false">' +
      '<span>' + label + '</span><span class="a11y-switch" aria-hidden="true"></span></button>';
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
          '<div><span class="a11y-eyebrow">SPN · Your preferences</span><h2 class="a11y-title">Accessibility</h2></div>' +
          '<button type="button" class="a11y-close" aria-label="Close accessibility options">&times;</button>' +
        '</div>' +
        '<p class="a11y-intro">Make SPN easier to read and navigate.</p>' +
        '<div class="a11y-group">' +
          '<h3 class="a11y-label">Accessibility profiles</h3>' +
          '<div class="a11y-profiles">' +
            '<button type="button" class="a11y-chip" data-profile="seizure" aria-pressed="false">Reduce motion<span>Pause motion &amp; videos</span></button>' +
            '<button type="button" class="a11y-chip" data-profile="adhd" aria-pressed="false">ADHD friendly<span>Focus on your reading</span></button>' +
            '<button type="button" class="a11y-chip" data-profile="lowvision" aria-pressed="false">Low vision<span>Larger, bolder text</span></button>' +
          '</div>' +
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
          toggleButton('dyslexic', 'Dyslexia-friendly font') +
          toggleButton('spacing', 'Increase letter spacing') +
          toggleButton('lineHeight', 'Increase line height') +
          toggleButton('bold', 'Bold text') +
          toggleButton('links', 'Highlight links') +
          toggleButton('reading', 'Reading guide') +
        '</div>' +
        '<div class="a11y-group"><span class="a11y-label">Colour</span><div class="a11y-chips">' +
          '<button type="button" class="a11y-chip" data-saturation="off" aria-pressed="true">Default</button>' +
          '<button type="button" class="a11y-chip" data-saturation="low" aria-pressed="false">Muted</button>' +
          '<button type="button" class="a11y-chip" data-saturation="grayscale" aria-pressed="false">Grayscale</button>' +
        '</div></div>' +
        '<div class="a11y-group"><span class="a11y-label">Motion &amp; audio</span>' +
          toggleButton('motion', 'Pause animations') +
          toggleButton('videos', 'Pause videos') +
          toggleButton('muted', 'Mute audio') +
        '</div>' +
        '<button type="button" class="a11y-reset" data-act="reset">Reset all settings</button>' +
        '<p class="a11y-footnote">Your preferences are saved on this device.</p>' +
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
    ui.chips = wrap.querySelectorAll('[data-contrast]');
    ui.mask = document.createElement('div');
    ui.mask.id = 'spn-a11y-reading-mask';
    ui.mask.setAttribute('data-a11y', '');
    ui.mask.setAttribute('aria-hidden', 'true');
    ui.mask.hidden = true;
    document.body.appendChild(ui.mask);
  }

  function syncUI() {
    var i = STEPS.indexOf(prefs.scale);
    ui.value.textContent = prefs.scale + '%';
    ui.dec.disabled = i <= 0;
    ui.inc.disabled = i >= STEPS.length - 1;
    ui.wrap.querySelectorAll('[data-toggle]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(prefs[button.dataset.toggle]));
    });
    ui.wrap.querySelectorAll('[data-profile], [data-saturation]').forEach(function (button) {
      var key = button.dataset.profile ? 'profile' : 'saturation';
      button.setAttribute('aria-pressed', String(button.dataset[key] === prefs[key]));
    });
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
    prefs.profile = 'off';
    applyAll();
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
      if (btn.dataset.profile) {
        var profile = prefs.profile === btn.dataset.profile ? 'off' : btn.dataset.profile;
        prefs = defaults();
        prefs.profile = profile;
        if (profile === 'seizure') {
          prefs.motion = true; prefs.videos = true; prefs.saturation = 'grayscale';
        } else if (profile === 'adhd') {
          prefs.motion = true; prefs.reading = true; prefs.spacing = true;
        } else if (profile === 'lowvision') {
          prefs.scale = 150; prefs.bold = true; prefs.contrast = 'dark';
        }
      } else if (btn.dataset.contrast) {
        prefs.contrast = btn.dataset.contrast;
        prefs.profile = 'off';
      } else if (btn.dataset.saturation) {
        prefs.saturation = btn.dataset.saturation;
        prefs.profile = 'off';
      } else if (btn.dataset.act === 'inc') {
        return step(1);
      } else if (btn.dataset.act === 'dec') {
        return step(-1);
      } else if (btn.dataset.toggle) {
        prefs[btn.dataset.toggle] = !prefs[btn.dataset.toggle];
        prefs.profile = 'off';
      } else if (btn.dataset.act === 'reset') {
        prefs = defaults();
      } else {
        return;
      }
      applyAll();
      save();
      syncUI();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && !ui.panel.hidden && ui.panel.contains(e.target)) {
        var buttons = Array.from(ui.panel.querySelectorAll('button:not(:disabled)'));
        if (e.shiftKey && e.target === buttons[0]) {
          e.preventDefault(); buttons[buttons.length - 1].focus();
        } else if (!e.shiftKey && e.target === buttons[buttons.length - 1]) {
          e.preventDefault(); buttons[0].focus();
        }
      }
      if (e.key === 'Escape' && !ui.panel.hidden) {
        openPanel(false);
        ui.fab.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!ui.panel.hidden && !ui.wrap.contains(e.target)) openPanel(false);
    });
    document.addEventListener('pointermove', function (e) { moveMask(e.clientY); }, { passive: true });
    document.addEventListener('touchmove', function (e) { moveMask(e.touches[0].clientY); }, { passive: true });
    document.addEventListener('focusin', function (e) {
      if (!ui.wrap.contains(e.target)) {
        var rect = e.target.getBoundingClientRect(); moveMask(rect.top + rect.height / 2);
      }
    });
    document.addEventListener('play', function (e) {
      if (prefs.videos && e.target.tagName === 'VIDEO') e.target.pause();
      if (prefs.muted && /^(VIDEO|AUDIO)$/.test(e.target.tagName)) applyMedia();
    }, true);
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { applyScale(); moveMask(window.innerHeight / 2); }, 100);
    });
  }

  /* ---------- late DOM (footer is fetched and injected at runtime) ---------- */

  function watch() {
    var timer;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () { applyScale(); applyMedia(); }, 200);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    if (document.getElementById('spn-a11y')) return;
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
