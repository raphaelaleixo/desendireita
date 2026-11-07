import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import core from '../core.js';

const { CHATS, PROMPT_URL, validateLink, buildPrompt, buildChatUrl, MESSAGES } = core;
const chat = (id) => CHATS.find((c) => c.id === id);

test('ordem e modo dos chats', () => {
  assert.deepEqual(CHATS.map((c) => c.name),
    ['ChatGPT', 'Claude', 'Perplexity', 'Grok', 'Modo IA do Google', 'Gemini', 'Copilot']);
  assert.deepEqual(CHATS.map((c) => c.mode),
    ['open', 'open', 'open', 'open', 'open', 'copy', 'copy']);
});

test('PROMPT_URL aponta para prompt-v6.txt', () => {
  assert.match(PROMPT_URL, /^https:\/\/.+\/prompt-v6\.txt$/);
});

test('validateLink aceita http e https com domínio', () => {
  for (const v of ['https://g1.globo.com/economia/x.ghtml', 'http://exemplo.com.br', 'HTTPS://Exemplo.com/a?b=1#c'])
    assert.equal(validateLink(v).ok, true, v);
});

test('validateLink remove espaços das pontas', () => {
  const r = validateLink('   https://exemplo.com/a  \n');
  assert.equal(r.ok, true);
  assert.equal(r.value, 'https://exemplo.com/a');
});

test('validateLink rejeita o que não é link', () => {
  for (const v of ['', '   ', 'exemplo.com', 'www.exemplo.com', 'ftp://exemplo.com', 'https://', 'https://semdominio',
    'http://.com', 'http://a..com', 'javascript:alert(1)', 'texto qualquer https://exemplo.com', null, undefined])
    assert.equal(validateLink(v).ok, false, String(v));
});

test('validateLink aceita acentos e caracteres especiais no caminho', () => {
  const link = 'https://exemplo.com.br/econ%C3%B4mia/a%C3%A7%C3%A3o?q=d%C3%B3lar&x=1#t';
  assert.equal(validateLink(link).ok, true);
  assert.equal(validateLink('https://exemplo.com.br/economia/ação-do-dólar?q=a b').ok, true);
  assert.equal(validateLink('https://exemplo.com.br/ação').value, 'https://exemplo.com.br/ação');
  assert.equal(validateLink('https://exemplo.com/a b').value, 'https://exemplo.com/a%20b');
});

test('validateLink aceita domínio com acento e rejeita quebra de linha no meio', () => {
  assert.equal(validateLink('https://café.com.br/x').ok, true);
  assert.equal(validateLink('https://exemplo.com/a\nb').ok, false);
});

test('linkFromQuery lê o link codificado, solto, com acentos e com & e #', () => {
  const { linkFromQuery } = core;
  const alvo = 'https://exemplo.com.br/economia/ação?q=dólar&x=1#t';
  assert.equal(linkFromQuery('?link=' + encodeURIComponent(alvo)), alvo);
  assert.equal(linkFromQuery('?link=https://exemplo.com/a?b=1&c=2'), 'https://exemplo.com/a?b=1&c=2');
  assert.equal(linkFromQuery('?link=https://exemplo.com/a%20b'), 'https://exemplo.com/a b');
  assert.equal(linkFromQuery('?link=%20https%3A%2F%2Fexemplo.com%20'), 'https://exemplo.com');
});

test('linkFromQuery devolve vazio sem ?link= e não quebra com %', () => {
  const { linkFromQuery } = core;
  for (const s of ['', '?', '?outro=1', '?linkx=1', null, undefined]) assert.equal(linkFromQuery(s), '', String(s));
  assert.equal(linkFromQuery('?link=https://exemplo.com/100%'), 'https://exemplo.com/100%');
});

test('queryFromLink: vazio some, e linkFromQuery desfaz (acentos, &, #, %)', () => {
  const { queryFromLink, linkFromQuery } = core;
  for (const v of ['', '   ', null, undefined]) assert.equal(queryFromLink(v), '', String(v));
  assert.equal(queryFromLink('  https://exemplo.com/a  '), '?link=https%3A%2F%2Fexemplo.com%2Fa');
  for (const alvo of [
    'https://exemplo.com.br/economia/ação?q=dólar&x=1#t',
    'https://exemplo.com/a%20b?c=100%',
    'https://exemplo.com/a b',
    'https://'
  ]) {
    const q = queryFromLink(alvo);
    assert.match(q, /^\?link=[^&#\s]+$/, alvo);   // nada solto que quebre a URL
    assert.equal(linkFromQuery(q), alvo, alvo);
  }
});

test('buildPrompt monta o texto exato', () => {
  assert.equal(buildPrompt('https://exemplo.com/a', 'https://site.com/prompt-v6.txt'),
    'Leia a matéria em https://exemplo.com/a e reescreva-a seguindo as diretrizes que eu escrevi em https://site.com/prompt-v6.txt. ' +
    'Se não conseguir abrir algum dos links, tente de novo antes de desistir. Se continuar sem conseguir, me avise e peça que eu cole o texto aqui. Não invente o conteúdo.');
});

test('buildPrompt usa PROMPT_URL por padrão', () => {
  assert.ok(buildPrompt('https://exemplo.com/a').includes(PROMPT_URL));
});

test('endereços dos chats que abrem, com o prompt codificado', () => {
  const link = 'https://exemplo.com.br/economia/ação-do-dólar?q=a b&x=1#t';
  const prompt = buildPrompt(validateLink(link).value, PROMPT_URL);
  const enc = encodeURIComponent(prompt);
  const esperado = {
    chatgpt: 'https://chatgpt.com/?q=',
    claude: 'https://claude.ai/new?q=',
    perplexity: 'https://www.perplexity.ai/search?q=',
    grok: 'https://grok.com/?q=',
    'google-ia': 'https://www.google.com/search?udm=50&q='
  };
  for (const [id, base] of Object.entries(esperado)) {
    const url = buildChatUrl(chat(id), prompt);
    assert.equal(url, base + enc, id);
    // volta ao original ao decodificar
    assert.equal(decodeURIComponent(url.slice(base.length)), prompt, id);
    // a parte codificada não tem espaço, & ou # soltos que quebrariam a consulta
    assert.doesNotMatch(url.slice(base.length), /[ &#?\n]/, id);
  }
});

test('Gemini e Copilot só abrem o site, sem o prompt na URL', () => {
  const prompt = buildPrompt('https://exemplo.com/a');
  assert.equal(buildChatUrl(chat('gemini'), prompt), 'https://gemini.google.com/app');
  assert.equal(buildChatUrl(chat('copilot'), prompt), 'https://copilot.microsoft.com/');
});

test('mensagens do DESIGN.md', () => {
  assert.equal(MESSAGES.invalidLink, 'Esse link não parece válido. Ele precisa começar com http:// ou https://.');
  assert.equal(MESSAGES.copied, 'Prompt copiado. Cole na caixa de mensagem do chat.');
});

test('prompt-v6.txt começa no título e não traz link de matéria fixo', () => {
  const v6 = readFileSync(new URL('../prompt-v6.txt', import.meta.url), 'utf8');
  assert.ok(v6.startsWith('# Diretrizes de tradução'));
  assert.doesNotMatch(v6, /g1\.globo\.com/);
  assert.doesNotMatch(v6, /^Leia a matéria em /m);
});
