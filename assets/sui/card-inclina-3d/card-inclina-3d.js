/*!
 * SUI · card-inclina-3d
 * Pasta autossuficiente: o núcleo vem embutido abaixo e o _core é opcional.
 *
 *   <article class="sui-inclina" data-sui-inclina data-numero="04">
 *     <svg class="sui-inclina__icone" viewBox="0 0 24 24">…</svg>
 *     <h3>Estratégia</h3>
 *     <p>Visão de longo prazo e planejamento…</p>
 *   </article>
 *
 * Você escreve só o conteúdo. A JS envolve tudo em .sui-inclina__corpo e
 * injeta brilho, cantos e número — assim a marcação da página fica limpa.
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

  function inclina(root, options) {
    var o = options || {};
    var d = root.dataset;

    var max = util.num(d.grau, o.grau || 10);        // inclinação máxima em graus
    var eleva = util.num(d.eleva, o.eleva || 6);     // quanto o cartão sobe, em px
    var numero = d.numero || o.numero || '';

    /* ---------- monta a estrutura ---------- */

    var corpo = root.querySelector('.sui-inclina__corpo');
    if (!corpo) {
      corpo = document.createElement('div');
      corpo.className = 'sui-inclina__corpo';
      while (root.firstChild) corpo.appendChild(root.firstChild);
      root.appendChild(corpo);
    }

    if (numero && !corpo.querySelector('.sui-inclina__numero')) {
      var num = document.createElement('span');
      num.className = 'sui-inclina__numero';
      num.textContent = numero;
      num.setAttribute('aria-hidden', 'true');   // decorativo: o texto já diz a ordem
      corpo.insertBefore(num, corpo.firstChild);
    }

    var brilho = corpo.querySelector('.sui-inclina__brilho');
    if (!brilho) {
      brilho = document.createElement('span');
      brilho.className = 'sui-inclina__brilho';
      brilho.setAttribute('aria-hidden', 'true');
      corpo.appendChild(brilho);
    }

    var cantos = corpo.querySelector('.sui-inclina__cantos');
    if (!cantos) {
      cantos = document.createElement('span');
      cantos.className = 'sui-inclina__cantos';
      cantos.setAttribute('aria-hidden', 'true');
      cantos.innerHTML = '<i></i><i></i><i></i><i></i>';
      corpo.appendChild(cantos);
    }

    var svg = corpo.querySelector('svg');
    if (svg) {
      svg.classList.add('sui-inclina__icone');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
    }

    /* ---------- inclinação ---------- */

    // ponteiro grosso (toque) ou movimento reduzido: só os estados, sem giro
    var fino = !window.matchMedia || window.matchMedia('(hover: hover)').matches;
    var anima = fino && !util.reduceMotion;

    var raf = 0;
    var alvo = { rx: 0, ry: 0, bx: 50, by: 50 };

    function aplicar() {
      raf = 0;
      corpo.style.transform =
        'rotateX(' + alvo.rx.toFixed(2) + 'deg) ' +
        'rotateY(' + alvo.ry.toFixed(2) + 'deg) ' +
        'translateY(' + (-eleva) + 'px)';
      corpo.style.setProperty('--sui-bx', alvo.bx.toFixed(1) + '%');
      corpo.style.setProperty('--sui-by', alvo.by.toFixed(1) + '%');
    }

    function onMove(e) {
      var r = corpo.getBoundingClientRect();
      if (!r.width || !r.height) return;

      var px = (e.clientX - r.left) / r.width;      // 0 à esquerda, 1 à direita
      var py = (e.clientY - r.top) / r.height;

      alvo.ry = util.clamp((px - 0.5) * 2, -1, 1) * max;
      alvo.rx = util.clamp((0.5 - py) * 2, -1, 1) * max;
      alvo.bx = px * 100;
      alvo.by = py * 100;

      if (!raf) raf = requestAnimationFrame(aplicar);
    }

    function onEnter() {
      root.setAttribute('data-ativo', '');
      if (anima) corpo.style.transition = 'border-color .4s, background-color .4s';
    }

    function onLeave() {
      root.removeAttribute('data-ativo');
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      corpo.style.transition = '';        // volta a transição para o repouso
      corpo.style.transform = '';
      corpo.style.removeProperty('--sui-bx');
      corpo.style.removeProperty('--sui-by');
    }

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointercancel', onLeave);
    if (anima) root.addEventListener('pointermove', onMove, { passive: true });

    // teclado: quem chega no link interno pelo Tab também acende o cartão
    root.addEventListener('focusin', onEnter);
    root.addEventListener('focusout', onLeave);

    return {
      destroy: function () {
        if (raf) cancelAnimationFrame(raf);
        root.removeEventListener('pointerenter', onEnter);
        root.removeEventListener('pointerleave', onLeave);
        root.removeEventListener('pointercancel', onLeave);
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('focusin', onEnter);
        root.removeEventListener('focusout', onLeave);
        onLeave();
        if (brilho.parentNode) brilho.parentNode.removeChild(brilho);
        if (cantos.parentNode) cantos.parentNode.removeChild(cantos);
      }
    };
  }

  window.SUI.register('inclina', inclina);
})();
