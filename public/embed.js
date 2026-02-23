/**
 * Lia Chatbot — Embed Widget
 *
 * Inclua este script no site externo:
 *   <script src="https://SEU-DOMINIO/embed.js" defer></script>
 *
 * Adicione o atributo data-lia-chat em qualquer botão/link:
 *   <a href="#" data-lia-chat>Falar com a Lia</a>
 *   <button data-lia-chat>Agendar Consulta</button>
 */
(function () {
  'use strict';

  // Detecta a URL base a partir do próprio script
  var scriptSrc =
    document.currentScript
      ? document.currentScript.src
      : (function () {
          var scripts = document.getElementsByTagName('script');
          return scripts[scripts.length - 1].src;
        })();

  var baseUrl = scriptSrc.replace(/\/embed\.js.*$/, '');
  var chatUrl = baseUrl + '/?embed=true';

  // ── Estilos do modal ──────────────────────────────────────
  var OVERLAY_STYLE = [
    'display:none',
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'background:rgba(0,0,0,0.75)',
    'backdrop-filter:blur(4px)',
    '-webkit-backdrop-filter:blur(4px)',
    'align-items:flex-end',
    'justify-content:center',
    'padding:0',
  ].join(';');

  var CONTAINER_STYLE = [
    'position:relative',
    'width:100%',
    'max-width:448px',
    'height:100dvh',
    'max-height:100dvh',
    'overflow:hidden',
    'border-radius:24px 24px 0 0',
    'background:#030712',
  ].join(';');

  var IFRAME_STYLE = [
    'width:100%',
    'height:100%',
    'border:none',
    'display:block',
  ].join(';');

  var CLOSE_BTN_STYLE = [
    'position:absolute',
    'top:12px',
    'right:12px',
    'z-index:10',
    'width:32px',
    'height:32px',
    'border-radius:50%',
    'background:rgba(255,255,255,0.08)',
    'border:none',
    'cursor:pointer',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'color:#94a3b8',
    'font-size:18px',
    'line-height:1',
    'padding:0',
  ].join(';');

  // Estilos para tela grande (sm: ≥ 640px)
  var smMediaQuery = window.matchMedia('(min-width: 640px)');

  function applyResponsiveContainer(container) {
    if (smMediaQuery.matches) {
      container.style.borderRadius = '24px';
      container.style.height = '620px';
      container.style.maxHeight = '90vh';
    } else {
      container.style.borderRadius = '24px 24px 0 0';
      container.style.height = '100dvh';
      container.style.maxHeight = '100dvh';
    }
  }

  // ── Criação do modal ──────────────────────────────────────
  var overlay = null;

  function createModal() {
    var ov = document.createElement('div');
    ov.id = 'lia-embed-overlay';
    ov.setAttribute('style', OVERLAY_STYLE);
    ov.style.display = 'none';

    var container = document.createElement('div');
    container.setAttribute('style', CONTAINER_STYLE);
    applyResponsiveContainer(container);

    var iframe = document.createElement('iframe');
    iframe.src = chatUrl;
    iframe.title = 'Lia — Assistente do Dr. Andrey Rocca';
    iframe.setAttribute('style', IFRAME_STYLE);
    iframe.setAttribute('allow', 'clipboard-write');

    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('style', CLOSE_BTN_STYLE);
    closeBtn.setAttribute('aria-label', 'Fechar chat');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeModal);

    container.appendChild(iframe);
    container.appendChild(closeBtn);
    ov.appendChild(container);
    document.body.appendChild(ov);

    // Fecha ao clicar no overlay (fora do container)
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closeModal();
    });

    // Responsividade ao redimensionar
    smMediaQuery.addEventListener
      ? smMediaQuery.addEventListener('change', function () {
          applyResponsiveContainer(container);
        })
      : smMediaQuery.addListener(function () {
          applyResponsiveContainer(container);
        });

    return ov;
  }

  function openModal() {
    if (!overlay) overlay = createModal();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Fecha com tecla Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // ── Vincula botões ────────────────────────────────────────
  function handleTrigger(e) {
    e.preventDefault();
    e.stopPropagation();
    openModal();
  }

  function bindButtons() {
    var triggers = document.querySelectorAll('[data-lia-chat]');
    triggers.forEach(function (el) {
      // Remove listener anterior para evitar duplicata
      el.removeEventListener('click', handleTrigger);
      el.addEventListener('click', handleTrigger);

      // Garante que links com href="#" não naveguem no mobile
      if (el.tagName === 'A') {
        el.removeEventListener('touchend', handleTrigger);
        el.addEventListener('touchend', handleTrigger);
      }
    });
  }

  // ── Inicialização ─────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindButtons);
  } else {
    bindButtons();
  }

  // Suporte a conteúdo carregado dinamicamente (ex: page builders)
  if (window.MutationObserver) {
    var observer = new MutationObserver(function (mutations) {
      var shouldBind = false;
      mutations.forEach(function (m) {
        if (m.addedNodes.length) shouldBind = true;
      });
      if (shouldBind) bindButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Expõe API pública para uso avançado
  window.LiaChat = {
    open: openModal,
    close: closeModal,
  };
})();
