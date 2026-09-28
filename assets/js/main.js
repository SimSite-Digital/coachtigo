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
  /* Carrossel (depoimentos / logos) — setas de rolagem                */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-carousel-track]');
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    if (!track) return;
    var step = function () {
      var card = track.querySelector(':scope > *');
      return card ? card.getBoundingClientRect().width + 24 : 300;
    };
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
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
  /* Header — sombra ao rolar                                          */
  /* ---------------------------------------------------------------- */
  var header = document.querySelector('[data-site-header]');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 4) header.style.boxShadow = '0 1px 3px rgba(22,32,90,.07)';
      else header.style.boxShadow = 'none';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
