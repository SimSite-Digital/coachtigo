(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==================================================================== */
  /* GSAP + ScrollTrigger — reveal em cascata, contadores, parallax        */
  /* Roda apenas se o CDN carregou; o resto do site funciona sem isso.     */
  /* ==================================================================== */
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    /* ---- Reveal em cascata — .section-head, .card, .stat, .timeline__item */
    /* stagger dentro de cada grid/seção, não sitewide                       */
    function revealGroup(items) {
      if (!items.length) return;
      if (reduceMotion) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      gsap.set(items, { opacity: 0, y: 24 });
      ScrollTrigger.batch(items, {
        start: 'top 85%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 });
        }
      });
    }

    document.querySelectorAll('.card-grid, .card-grid--2, .card-grid--4, .stats-row, .timeline, .cases-gallery, .principles, .why-split__grid, .services__featured-row, .services__grid-row2').forEach(function (group) {
      var items = group.querySelectorAll(':scope > .card, :scope > .service-card, :scope > .stat, :scope > .timeline__item, :scope > .case-tile, :scope > .principles__item, :scope > .why-split__item');
      revealGroup(Array.prototype.slice.call(items));
    });

    revealGroup(Array.prototype.slice.call(document.querySelectorAll('.section-head')));

    /* ---- Contadores — .stat__value[data-count-to] conta de 0 até o valor real */
    document.querySelectorAll('.stat__value[data-count-to]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10);
      if (isNaN(target)) return;
      if (reduceMotion) return; // mantém o valor real já escrito no HTML, sem animar

      var suffix = el.getAttribute('data-suffix') || '';
      var counter = { value: 0 };
      el.textContent = '0' + suffix;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          gsap.to(counter, {
            value: target,
            duration: 1.6,
            ease: 'power1.out',
            onUpdate: function () {
              el.textContent = Math.round(counter.value).toLocaleString('pt-BR') + suffix;
            }
          });
        }
      });
    });

    /* ---- Parallax sutil no hero — [data-parallax-layer] a ~15% da velocidade */
    if (!reduceMotion) {
      document.querySelectorAll('[data-parallax-layer]').forEach(function (layer) {
        var hero = layer.closest('[data-parallax-hero]') || layer;
        gsap.to(layer, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    }
  }

  /* ==================================================================== */
  /* Fundo em grade com movimento — aproximação própria (ver CONFIRMAR em  */
  /* components.css: o arquivo real da biblioteca nunca foi enviado).      */
  /* Gera N pontos com posição e opacidade aleatórias, cada um com sua     */
  /* própria duração/atraso de animação — evita o efeito "pisca junto".    */
  /* Opacidade sempre ≤ 12% (regra do manual para padrão sob texto).       */
  /* ==================================================================== */
  document.querySelectorAll('.fundo-grade-movimento[data-density]').forEach(function (el) {
    var density = parseInt(el.getAttribute('data-density'), 10) || 20;
    for (var i = 0; i < density; i++) {
      var dot = document.createElement('span');
      dot.className = 'fundo-grade-movimento__dot';
      dot.style.left = (Math.random() * 100).toFixed(1) + '%';
      dot.style.top = (Math.random() * 100).toFixed(1) + '%';
      dot.style.setProperty('--dot-o1', (0.04 + Math.random() * 0.03).toFixed(2));
      dot.style.setProperty('--dot-o2', (0.08 + Math.random() * 0.04).toFixed(2));
      if (!reduceMotion) {
        dot.style.animationDuration = (14 + Math.random() * 12).toFixed(1) + 's';
        dot.style.animationDelay = (Math.random() * -20).toFixed(1) + 's';
      }
      el.appendChild(dot);
    }
  });

})();
