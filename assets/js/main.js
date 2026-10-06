(function () {
  'use strict';

  /* ---------------------------------------------------------------- */
  /* Menu mobile                                                       */
  /* ---------------------------------------------------------------- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.getAttribute('data-mobile-open') === 'true';
      nav.setAttribute('data-mobile-open', String(!isOpen));
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });
  }

  /* ---------------------------------------------------------------- */
  /* Dropdown "Serviços"                                               */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-dropdown]').forEach(function (dropdown) {
    var toggle = dropdown.querySelector('[data-dropdown-toggle]');
    if (!toggle) return;
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.getAttribute('data-open') === 'true';
      document.querySelectorAll('[data-dropdown]').forEach(function (d) { d.setAttribute('data-open', 'false'); });
      dropdown.setAttribute('data-open', String(!isOpen));
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('[data-dropdown]').forEach(function (d) { d.setAttribute('data-open', 'false'); });
  });

  /* ---------------------------------------------------------------- */
  /* Accordion (FAQ)                                                   */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-accordion-item]').forEach(function (item) {
    var trigger = item.querySelector('[data-accordion-trigger]');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      var isOpen = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', String(!isOpen));
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------------------------------------------------------------- */
  /* Carrossel (depoimentos / logos) — setas de rolagem + dots          */
  /* Depoimentos (homepage v2) ainda ganham: contador "01 / 05",        */
  /* avanço automático a cada 8s com barra de progresso, pausa no       */
  /* hover/foco — tudo opt-in via [data-carousel-autoplay].             */
  /* ---------------------------------------------------------------- */
  var reduceMotionMain = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-carousel-track]');
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    if (!track) return;
    var step = function () {
      var card = track.querySelector(':scope > *');
      return card ? card.getBoundingClientRect().width + 24 : 300;
    };
    var goTo = function (index) {
      var slide = slides[index];
      if (!slide) return;
      var target = slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
      track.scrollTo({ left: target, behavior: 'smooth' });
    };

    var dotsContainer = carousel.querySelector('[data-carousel-dots]');
    if (!dotsContainer) {
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      return;
    }
    var slides = Array.prototype.slice.call(track.children);
    var counter = carousel.querySelector('[data-carousel-counter]');
    var total = slides.length;
    var current = 0;
    var dots = slides.map(function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Ir para o depoimento ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); resetAutoplay(); });
      dotsContainer.appendChild(dot);
      return dot;
    });

    var pad2 = function (n) { return n < 10 ? '0' + n : String(n); };
    var syncActive = function () {
      var trackRect = track.getBoundingClientRect();
      var closest = 0;
      var closestDist = Infinity;
      slides.forEach(function (slide, i) {
        var dist = Math.abs(slide.getBoundingClientRect().left - trackRect.left);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      current = closest;
      dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === closest); });
      if (counter) counter.textContent = pad2(closest + 1) + ' / ' + pad2(total);
    };
    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(syncActive);
    }, { passive: true });
    syncActive();

    if (next) next.addEventListener('click', function () { goTo((current + 1) % total); resetAutoplay(); });
    if (prev) prev.addEventListener('click', function () { goTo((current - 1 + total) % total); resetAutoplay(); });

    /* ---- Avanço automático + barra de progresso ---- */
    if (!carousel.hasAttribute('data-carousel-autoplay') || reduceMotionMain) return;
    var progressBar = carousel.querySelector('[data-carousel-progress]');
    var delay = parseInt(carousel.getAttribute('data-carousel-autoplay'), 10) || 8000;
    var timer = null;

    var playProgress = function () {
      if (!progressBar) return;
      progressBar.style.animation = 'none';
      void progressBar.offsetWidth; // reinicia a animação (força reflow)
      progressBar.style.animation = 'carousel-progress ' + delay + 'ms linear forwards';
    };
    var startAutoplay = function () {
      playProgress();
      timer = setInterval(function () { goTo((current + 1) % total); playProgress(); }, delay);
    };
    var stopAutoplay = function () {
      if (timer) { clearInterval(timer); timer = null; }
      if (progressBar) progressBar.style.animationPlayState = 'paused';
    };
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);
    startAutoplay();
  });

  /* ---------------------------------------------------------------- */
  /* Filtro de segmento — Cases de Sucesso (Corporativo / Individual)  */
  /* ---------------------------------------------------------------- */
  var caseFilterButtons = document.querySelectorAll('[data-filter]');
  if (caseFilterButtons.length) {
    var caseTiles = document.querySelectorAll('.case-tile');
    caseFilterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        caseFilterButtons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var filter = btn.getAttribute('data-filter');
        caseTiles.forEach(function (tile) {
          var segment = tile.getAttribute('data-segment');
          tile.hidden = filter !== 'todos' && segment !== filter;
        });
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Header — vidro fosco depois de 24px de rolagem (homepage v2, §3)  */
  /* ---------------------------------------------------------------- */
  var header = document.querySelector('[data-site-header]');
  if (header) {
    var onScroll = function () {
      header.setAttribute('data-scrolled', window.scrollY > 24 ? 'true' : 'false');
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------- */
  /* Revelar ao rolar — [data-reveal], um único IntersectionObserver    */
  /* (homepage v2, §6). Animação só em transform/opacity; respeita      */
  /* prefers-reduced-motion via CSS (estado final já visível).          */
  /* ---------------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { revealIO.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------------- */
  /* Formulário de contato/orçamento — lógica Rio Bravo                */
  /* Envia para o endpoint PHP; ao sucesso, também abre o WhatsApp com  */
  /* a mensagem pré-preenchida.                                        */
  /* ---------------------------------------------------------------- */
  var WHATSAPP_NUMBER = '5565999673687';

  document.querySelectorAll('[data-lead-form]').forEach(function (form) {
    var status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var requiredFields = form.querySelectorAll('[required]');
      var valid = true;
      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('is-invalid');
        } else {
          field.classList.remove('is-invalid');
        }
      });

      if (!valid) {
        if (status) {
          status.setAttribute('data-state', 'error');
          status.textContent = 'Preencha os campos obrigatórios antes de enviar.';
        }
        return;
      }

      var formData = new FormData(form);
      var params = new URLSearchParams();
      formData.forEach(function (value, key) { params.append(key, value); });

      fetch(form.getAttribute('action') || '/assets/php/enviar.php', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
        .then(function () {
          if (status) {
            status.setAttribute('data-state', 'success');
            status.textContent = 'Mensagem enviada! Nossa equipe responde em até 24h úteis.';
          }
          form.reset();

          var nome = formData.get('nome') || '';
          var mensagem = formData.get('mensagem') || '';
          var texto = 'Olá! Meu nome é ' + nome + '. ' + mensagem;
          var waLink = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(texto);
          window.open(waLink, '_blank', 'noopener');
        })
        .catch(function () {
          if (status) {
            status.setAttribute('data-state', 'error');
            status.textContent = 'Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.';
          }
        });
    });
  });
})();
