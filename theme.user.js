// ==UserScript==
// @name         Bozkurtya PixelPlanet and Clones Theme
// @author       [m2zm.is-best.net]
// @match        *://pixelplanet.fun/*
// @match        *://pixelya.fun/*
// @match        *://pixuniverse.fun/*
// @match        *://pixmap.fun/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  var CSS_URL = 'https://raw.githubusercontent.com/Bozkurtya/bozkurtya-theme/main/theme.css';
  var STYLE_ID = 'bozkurtya-tema';
  var VAR_ID = 'bozkurtya-tema-var';
  var CACHE_KEY = 'bk_css';
  var CACHE_MIN = 30 * 60 * 1000;

  var state = {
    enabled: GM_getValue('bk_enabled', true),
    glass: GM_getValue('bk_glass', 0.86),
    winAlpha: GM_getValue('bk_winalpha', 0.86)
  };

  var css = GM_getValue(CACHE_KEY, '');
  var cssAt = GM_getValue('bk_css_at', 0);

  function styleEl(id) {
    return document.getElementById(id);
  }

  function put(id, text) {
    var el = styleEl(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      el.setAttribute('data-bk', '1');
    }
    el.textContent = text;
    var parent = document.body || document.documentElement;
    if (parent) parent.appendChild(el);
  }

  function render() {
    put(STYLE_ID, state.enabled ? css : '');
    put(VAR_ID, state.enabled ? varCss() : '');
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  function rgba(alpha) {
    return 'rgba(58, 42, 28, ' + clamp(alpha, 0.05, 1) + ')';
  }

  function rgbaDeep(alpha) {
    return 'rgba(36, 26, 17, ' + clamp(alpha, 0.05, 1) + ')';
  }

  var SECTIONS = [
    '.profile-hero',
    '.userarea-panel',
    '.ua-section-shell',
    '.profile-meta-card',
    '.profile-stat-card',
    '.profile-canvas-stats',
    '.rankings-panel',
    '.gift-card',
    '.profile-description',
    '.posts-list-head',
    '.forumAbout',
    '.settings-content .setitem',
    '.canvas-list-row',
    '.tpl-card',
    '.icon-card',
    '.ban-card',
    '.watch-card',
    '.st-card',
    '.external-link-card',
    '.announcement-card',
    '.turnstile-card'
  ];

  var NESTED = [
    '.profile-meta-card',
    '.profile-stat-card',
    '.profile-canvas-stats',
    '.rankings-panel',
    '.canvas-list-row',
    '.tpl-card',
    '.icon-card',
    '.ban-card',
    '.watch-card',
    '.st-card',
    '.external-link-card',
    '.announcement-card',
    '.turnstile-card'
  ];

  var WINDOWS = [
    '.window',
    '.popup-modal',
    '.Alert',
    '.modal',
    '.BanAlert',
    '.CaptchaAlert',
    '.SuccessAlert',
    '.window-error'
  ];

  function varCss() {
    var g = state.glass;
    var n = Math.max(0.35, g - 0.08);
    var w = state.winAlpha;
    var out = [];

    out.push(SECTIONS.join(',') + '{background-color:' + rgba(g) + ' !important;}');
    out.push(NESTED.join(',') + '{background-color:' + rgba(n) + ' !important;}');
    out.push(WINDOWS.join(',') + '{background-color:' + rgbaDeep(w) + ' !important;}');
    out.push('.panel{background-color:' + rgbaDeep(w) + ' !important;}');
    out.push('*{box-shadow:none !important;}');

    return out.join('\n');
  }

  function fetchCss(done) {
    var fresh = css && (Date.now() - cssAt) < CACHE_MIN;
    if (fresh) {
      done();
      return;
    }
    GM_xmlhttpRequest({
      method: 'GET',
      url: CSS_URL,
      timeout: 15000,
      onload: function (res) {
        if (res.status >= 200 && res.status < 300 && res.responseText && res.responseText.indexOf('{') > 0) {
          css = res.responseText;
          cssAt = Date.now();
          GM_setValue(CACHE_KEY, css);
          GM_setValue('bk_css_at', cssAt);
        }
        done();
      },
      onerror: done,
      ontimeout: done
    });
  }

  function boot() {
    render();
    fetchCss(function () {
      render();
    });

    var start = document.body || document.documentElement;
    if (start) {
      var mo = new MutationObserver(function () {
        var a = styleEl(STYLE_ID);
        var b = styleEl(VAR_ID);
        if (!a || !a.isConnected || !b || !b.isConnected) render();
        else if (a.parentNode !== document.body) document.body.appendChild(a);
        if (b.parentNode !== document.body) document.body.appendChild(b);
      });
      mo.observe(start, { childList: true });
    }
    document.addEventListener('DOMContentLoaded', render);
    window.addEventListener('load', render);
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);

  function persist() {
    GM_setValue('bk_enabled', state.enabled);
    GM_setValue('bk_glass', state.glass);
    GM_setValue('bk_winalpha', state.winAlpha);
  }

  function toggle() {
    state.enabled = !state.enabled;
    persist();
    render();
  }

  function stepGlass(delta) {
    state.glass = clamp(Math.round((state.glass + delta) * 100) / 100, 0.4, 1);
    persist();
    render();
  }

  function stepWin(delta) {
    state.winAlpha = clamp(Math.round((state.winAlpha + delta) * 100) / 100, 0.3, 1);
    persist();
    render();
  }

  function refresh() {
    cssAt = 0;
    fetchCss(function () {
      render();
    });
  }

  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('Toggle theme', toggle);
    GM_registerMenuCommand('More transparent', function () {
      stepGlass(-0.06);
    });
    GM_registerMenuCommand('Less transparent', function () {
      stepGlass(0.06);
    });
    GM_registerMenuCommand('Window bg more visible', function () {
      stepWin(-0.06);
    });
    GM_registerMenuCommand('Window bg less visible', function () {
      stepWin(0.06);
    });
    GM_registerMenuCommand('Refresh CSS from GitHub', refresh);
  }
})();
