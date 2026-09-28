(function () {
  'use strict';

  if (typeof gsap === 'undefined') return; // CDN indisponível — site continua funcional sem animação
  gsap.registerPlugin(ScrollTrigger);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Reveal em cascata — .section-head, .card, .stat, .timeline__item    */
  /* stagger dentro de cada grid/seção, não sitewide                     */
  /* ------------------------------------------------------------------ */
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

  document.querySelectorAll('.card-grid, .card-grid--2, .card-grid--4, .stats-row, .timeline').forEach(function (group) {
    var items = group.querySelectorAll(':scope > .card, :scope > .stat, :scope > .timeline__item');
    revealGroup(Array.prototype.slice.call(items));
  });

  revealGroup(Array.prototype.slice.call(document.querySelectorAll('.section-head')));

  /* ------------------------------------------------------------------ */
  /* Contadores — .stat__value[data-count-to] conta de 0 até o valor real */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /* Parallax sutil no hero — [data-parallax-layer] a ~15% da velocidade  */
  /* ------------------------------------------------------------------ */
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
})();
