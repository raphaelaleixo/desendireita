(function () {
  'use strict';
  var D = window.Desendireita;

  var form = document.getElementById('form');
  var input = document.getElementById('link');
  var erro = document.getElementById('erro');
  var continuar = document.getElementById('continuar');
  var modal = document.getElementById('modal');
  var fechar = document.getElementById('fechar');
  var lista = document.getElementById('chats');
  var copiadoMsg = document.getElementById('copiado');
  var pedido = document.getElementById('pedido');

  var timers = [];

  function setErro(msg) {
    erro.textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function copiar(texto) {
    // Chamada síncrona dentro do clique, para o navegador aceitar.
    function legado() {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      modal.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      modal.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).then(function () { return true; }, function () { return legado(); });
    }
    return Promise.resolve(legado());
  }

  function montarLista(prompt) {
    lista.textContent = '';
    D.CHATS.forEach(function (chat) {
      var url = D.buildChatUrl(chat, prompt);
      var el, tag = document.createElement('span');
      tag.className = 'tag';
      var nome = document.createElement('span');
      nome.textContent = chat.name;

      if (chat.mode === 'open') {
        el = document.createElement('a');
        el.href = url;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
        tag.textContent = 'abrir →';
      } else {
        el = document.createElement('button');
        el.type = 'button';
        tag.textContent = 'copiar e colar';
        el.addEventListener('click', function () {
          var p = copiar(prompt);
          window.open(url, '_blank', 'noopener,noreferrer');
          p.then(function (ok) {
            if (!ok) return;
            tag.textContent = 'copiado';
            copiadoMsg.textContent = '';
            // texto novo a cada clique, para o leitor de tela anunciar de novo
            setTimeout(function () { copiadoMsg.textContent = D.MESSAGES.copied; }, 50);
            timers.push(setTimeout(function () { tag.textContent = 'copiar e colar'; }, 3000));
          });
        });
      }
      el.className = 'chat';
      el.appendChild(nome);
      el.appendChild(tag);
      lista.appendChild(el);
    });
  }

  function abrirModal(link) {
    var prompt = D.buildPrompt(link);
    pedido.textContent = prompt;
    copiadoMsg.textContent = '';
    montarLista(prompt);
    modal.showModal();
    modal.scrollTop = 0;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var r = D.validateLink(input.value);
    if (!r.ok) {
      setErro(D.MESSAGES.invalidLink);
      input.focus();
      return;
    }
    setErro('');
    abrirModal(r.value);
  });

  input.addEventListener('input', function () { setErro(''); });

  // ?link=... preenche o campo; a pessoa ainda clica em "Continuar".
  var doQuery = D.linkFromQuery(window.location.search);
  if (doQuery) input.value = doQuery;

  fechar.addEventListener('click', function () { modal.close(); });

  // Clique fora: o <dialog> só é alvo do clique quando ele cai no fundo escurecido.
  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.close();
  });

  modal.addEventListener('close', function () {
    timers.forEach(clearTimeout);
    timers = [];
    copiadoMsg.textContent = '';
    continuar.focus();
  });
})();
