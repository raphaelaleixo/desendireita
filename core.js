/* Desendireita — lógica sem DOM (configuração, validação e montagem do prompt).
   Funciona no navegador (window.Desendireita) e no Node (require/import). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Desendireita = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Troque pelo endereço real do prompt quando o domínio existir.
  var PROMPT_URL = 'https://raw.githubusercontent.com/raphaelaleixo/desendireita/main/prompt-v6.txt';

  // Formatos de endereço não oficiais: podem mudar. Tudo fica aqui.
  // mode "open": abre o chat com o prompt preenchido.
  // mode "copy": copia o prompt e abre o site do chat.
  var CHATS = [
    { id: 'chatgpt',    name: 'ChatGPT',           mode: 'open', base: 'https://chatgpt.com/?q=' },
    { id: 'claude',     name: 'Claude',            mode: 'open', base: 'https://claude.ai/new?q=' },
    { id: 'perplexity', name: 'Perplexity',        mode: 'open', base: 'https://www.perplexity.ai/search?q=' },
    { id: 'grok',       name: 'Grok',              mode: 'open', base: 'https://grok.com/?q=' },
    { id: 'google-ia',  name: 'Modo IA do Google', mode: 'open', base: 'https://www.google.com/search?udm=50&q=' },
    { id: 'gemini',     name: 'Gemini',            mode: 'copy', base: 'https://gemini.google.com/app' },
    { id: 'copilot',    name: 'Copilot',           mode: 'copy', base: 'https://copilot.microsoft.com/' }
  ];

  var MESSAGES = {
    invalidLink: 'Esse link não parece válido. Ele precisa começar com http:// ou https://.',
    copied: 'Prompt copiado. Cole na caixa de mensagem do chat.'
  };

  // Remove espaços das pontas e confere: começa com http(s):// e tem domínio.
  // Espaços no meio (raros, no caminho) viram %20; quebras de linha e tabs invalidam.
  function validateLink(raw) {
    var value = String(raw == null ? '' : raw).trim();
    var fail = { ok: false, value: value };
    if (!/^https?:\/\//i.test(value)) return fail;
    if (/[\r\n\t]/.test(value)) return fail;
    value = value.replace(/ /g, '%20');
    var url;
    try { url = new URL(value); } catch (e) { return fail; }
    // domínio = pelo menos um ponto, sem rótulos vazios (rejeita "http://.com", "http://a..com")
    if (!/^[^.]+(\.[^.]+)+\.?$/.test(url.hostname)) return fail;
    return { ok: true, value: value };
  }

  // Lê ?link=... da barra de endereço, para abrir o site com o campo preenchido.
  // Aceita o link codificado (?link=https%3A%2F%2F...) ou solto (?link=https://...&x=1).
  // Não valida: o campo só é preenchido, e a validação continua no "Continuar".
  function linkFromQuery(search) {
    var m = /^\?link=(.*)$/.exec(String(search == null ? '' : search));
    if (!m) return '';
    var raw = m[1];
    try { raw = decodeURIComponent(raw); } catch (e) { /* mantém o texto cru */ }
    return raw.trim();
  }

  // O inverso de linkFromQuery: a consulta (?link=...) que reproduz o que está no campo.
  // Codifica o link inteiro, então &, # e acentos sobrevivem. Campo vazio = sem consulta.
  function queryFromLink(value) {
    var v = String(value == null ? '' : value).trim();
    return v ? '?link=' + encodeURIComponent(v) : '';
  }

  function buildPrompt(link, promptUrl) {
    return 'Leia a matéria em ' + link +
      ' e reescreva-a seguindo as diretrizes que eu escrevi em ' + (promptUrl || PROMPT_URL) +
      '. Se não conseguir abrir algum dos links, tente de novo antes de desistir. Se continuar sem conseguir, me avise e peça que eu cole o texto aqui. Não invente o conteúdo.';
  }

  function buildChatUrl(chat, prompt) {
    return chat.mode === 'open' ? chat.base + encodeURIComponent(prompt) : chat.base;
  }

  return {
    PROMPT_URL: PROMPT_URL,
    CHATS: CHATS,
    MESSAGES: MESSAGES,
    validateLink: validateLink,
    linkFromQuery: linkFromQuery,
    queryFromLink: queryFromLink,
    buildPrompt: buildPrompt,
    buildChatUrl: buildChatUrl
  };
});
