/*!
 * SUI · fundo-grade-movimento
 * Requer _core/sui-core.js e _core/tokens.css.
 *
 *   <section class="secao">            <!-- position:relative; overflow:hidden -->
 *     <div class="sui-grade" data-sui-grade data-density="20"></div>
 *     <div class="conteudo">…</div>
 *   </section>
 */

/* @sui-core:start */
(function (g) {
  'use strict';
  if (g.SUI) return;                       // nucleo ja instalado: nao duplica

  var reg = {};
  var ready = false;

  function num(v, f) { var n = parseFloat(v); return isNaN(n) ? f : n; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function onVisible(el, cb, opt) {
    if (!g.IntersectionObserver) { cb(true); return function () {}; }
    var io = new IntersectionObserver(function (e) { cb(e[0].isIntersecting); },
      opt || { threshold: 0 });
    io.observe(el);
    return function () { io.disconnect(); };
  }

  function initOne(name, scope) {
    var out = [];
    var nodes = scope.querySelectorAll('[data-sui-' + name + ']');
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.__sui) return;                // ja inicializado
      var inst;
      try {
        inst = reg[name](el);
      } catch (err) {
        if (g.console) g.console.error('[SUI] falha em "' + name + '"', err, el);
        return;
      }
      if (inst) { el.__sui = inst; out.push(inst); }
    });
    return out;
  }

  var SUI = {
    version: '1.0.0',
    register: function (name, f) {
      if (typeof f !== 'function') return;
      reg[name] = f;
      SUI[name] = f;
      if (ready) initOne(name, document);
    },
    init: function (scope) {
      var s = scope || document, out = [];
      Object.keys(reg).forEach(function (n) { out = out.concat(initOne(n, s)); });
      return out;
    },
    destroy: function (scope) {
      var nodes = (scope || document).querySelectorAll('*');
      Array.prototype.forEach.call(nodes, function (el) {
        if (el.__sui && typeof el.__sui.destroy === 'function') {
          el.__sui.destroy();
          el.__sui = null;
        }
      });
    },
    util: {
      num: num,
      clamp: clamp,
      onVisible: onVisible,
      reduceMotion: !!(g.matchMedia &&
        g.matchMedia('(prefers-reduced-motion: reduce)').matches)
    }
  };

  g.SUI = SUI;

  function boot() { ready = true; SUI.init(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
/* @sui-core:end */

(function () {
  'use strict';

  if (!window.SUI) return;
  var util = window.SUI.util;

  function grade(root, options) {
    var o = options || {};
    var d = root.dataset;

    var density = util.num(d.density, o.density || 18);
    var minSize = util.num(d.minSize, o.minSize || 4);
    var maxSize = util.num(d.maxSize, o.maxSize || 14);
    var gridSize = util.num(d.grid, o.grid || 0);

    // metade da densidade no mobile: menos pintura, mesma leitura
    if (window.innerWidth < 720) density = Math.round(density / 2);
    if (gridSize) root.style.setProperty('--sui-grade-size', gridSize + 'px');

    root.innerHTML = '';
    root.setAttribute('aria-hidden', 'true');

    var blocks = [];
    var frag = document.createDocumentFragment();

    for (var i = 0; i < density; i++) {
      var b = document.createElement('i');
      var size = minSize + Math.random() * (maxSize - minSize);

      b.style.width = size.toFixed(1) + 'px';
      b.style.height = size.toFixed(1) + 'px';
      b.style.left = (Math.random() * 100).toFixed(2) + '%';
      b.style.top = (Math.random() * 100).toFixed(2) + '%';

      b.style.setProperty('--sui-dx', (Math.random() * 60 - 30).toFixed(1) + 'px');
      b.style.setProperty('--sui-dy', (-20 - Math.random() * 50).toFixed(1) + 'px');
      b.style.setProperty('--sui-dur', (12 + Math.random() * 14).toFixed(1) + 's');
      b.style.setProperty('--sui-delay', (-Math.random() * 12).toFixed(1) + 's');
      // faixas de opacidade parametrizaveis via data-o1-min/max e data-o2-min/max
      // (projeto Coach'tigo: faixas navy pedem blocos mais discretos que o padrao da lib)
      var o1min = util.num(d.o1Min, 0.06), o1max = util.num(d.o1Max, 0.14);
      var o2min = util.num(d.o2Min, 0.22), o2max = util.num(d.o2Max, 0.44);
      b.style.setProperty('--sui-o1', (o1min + Math.random() * (o1max - o1min)).toFixed(2));
      b.style.setProperty('--sui-o2', (o2min + Math.random() * (o2max - o2min)).toFixed(2));

      blocks.push(b);
      frag.appendChild(b);
    }
    root.appendChild(frag);

    // fora da viewport a animação para: não gasta composição à toa
    var off = util.onVisible(root, function (visible) {
      var state = visible ? 'running' : 'paused';
      for (var j = 0; j < blocks.length; j++) {
        blocks[j].style.animationPlayState = state;
      }
    });

    return {
      destroy: function () {
        off();
        root.innerHTML = '';
      }
    };
  }

  window.SUI.register('grade', grade);
})();
