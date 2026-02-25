/**
 * Lia Chatbot — Embed Widget
 *
 * ── 1. Adicione o script no Custom Code do site (rodapé) ─────
 *   <script src="https://lia.drandreyrocca.com.br/embed.js" defer></script>
 *
 * ── 2. No botão do Elementor, escolha UMA das opções ─────────
 *   MAIS FÁCIL  → Widget Botão > Link → #lia-chat
 *   FREE        → Widget Botão > Avançado > Classes CSS → lia-chat-trigger
 *   PRO         → Widget Botão > Avançado > Atributos   → data-lia-chat (sem valor)
 *   HTML widget → <a href="#lia-chat">Falar com a Lia</a>
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

  // ── Injeta CSS de animação ────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#lia-embed-overlay {',
    '  opacity: 0;',
    '  transition: opacity 0.25s ease;',
    '}',
    '#lia-embed-overlay.lia-visible {',
    '  opacity: 1;',
    '}',
    '#lia-embed-container {',
    '  transform: translateY(48px);',
    '  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);',
    '}',
    '#lia-embed-overlay.lia-visible #lia-embed-container {',
    '  transform: translateY(0);',
    '}',
    '@media (min-width: 640px) {',
    '  #lia-embed-container {',
    '    transform: translateY(0) scale(0.95);',
    '    transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;',
    '    opacity: 0;',
    '  }',
    '  #lia-embed-overlay.lia-visible #lia-embed-container {',
    '    transform: translateY(0) scale(1);',
    '    opacity: 1;',
    '  }',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  // ── Estilos do modal ──────────────────────────────────────
  var OVERLAY_STYLE = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'background:rgba(0,0,0,0.75)',
    'backdrop-filter:blur(4px)',
    '-webkit-backdrop-filter:blur(4px)',
    'display:none',
    'align-items:flex-end',
    'justify-content:center',
    'padding:0',
  ].join(';');

  var CONTAINER_STYLE = [
    'position:relative',
    'width:100%',
    'max-width:448px',
    'overflow:hidden',
    'border-radius:24px 24px 0 0',
    'background:#030712',
    'height:100dvh',
    'max-height:100dvh',
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
      container.style.marginBottom = '0';
    } else {
      container.style.borderRadius = '24px 24px 0 0';
      container.style.height = '100dvh';
      container.style.maxHeight = '100dvh';
    }
  }

  // ── Criação do modal ──────────────────────────────────────
  var overlay = null;
  var closeTimer = null;

  function createModal() {
    var ov = document.createElement('div');
    ov.id = 'lia-embed-overlay';
    ov.setAttribute('style', OVERLAY_STYLE);

    var container = document.createElement('div');
    container.id = 'lia-embed-container';
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
    if (smMediaQuery.addEventListener) {
      smMediaQuery.addEventListener('change', function () {
        applyResponsiveContainer(container);
      });
    } else {
      smMediaQuery.addListener(function () {
        applyResponsiveContainer(container);
      });
    }

    return ov;
  }

  function openModal() {
    if (!overlay) overlay = createModal();

    // Cancela eventual timer de fechamento em curso
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    overlay.style.display = 'flex';
    // Força reflow para a animação de entrada funcionar
    void overlay.offsetHeight;
    overlay.classList.add('lia-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('lia-visible');
    document.body.style.overflow = '';
    // Esconde após a animação terminar
    closeTimer = setTimeout(function () {
      if (overlay && !overlay.classList.contains('lia-visible')) {
        overlay.style.display = 'none';
      }
    }, 350);
  }

  // Fecha com tecla Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  // ── Delegação de evento com CAPTURA ──────────────────────
  // Captura o clique ANTES de qualquer handler da página (incluindo Elementor)
  // e percorre a árvore DOM para encontrar elementos gatilho.
  // Isso elimina o bug de às vezes navegar para /#.
  function isTrigger(el) {
    if (!el || !el.matches) return false;
    return el.matches(
      '[data-lia-chat], .lia-chat-trigger, a[href="#lia-chat"], a[href$="/#lia-chat"]'
    );
  }

  document.addEventListener(
    'click',
    function (e) {
      var el = e.target;
      // Sobe na árvore DOM para detectar clique em filhos de .lia-chat-trigger
      while (el && el !== document.documentElement) {
        if (isTrigger(el)) {
          e.preventDefault();
          e.stopPropagation();
          openModal();
          return;
        }
        el = el.parentElement;
      }
    },
    true // capture=true: intercepta ANTES da fase de borbulhamento
  );

  // Abre via hash na URL (ex: alguém navegar direto para /#lia-chat)
  function checkHash() {
    if (window.location.hash === '#lia-chat') {
      openModal();
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  // ── Inicialização ─────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkHash);
  } else {
    checkHash();
  }

  window.addEventListener('hashchange', function () {
    if (window.location.hash === '#lia-chat') {
      openModal();
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  });

  // Expõe API pública para uso avançado
  window.LiaChat = {
    open: openModal,
    close: closeModal,
  };
})();
