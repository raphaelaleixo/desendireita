// Gera metodo.html e exemplos/*.html a partir dos .md. Rode: node tools/gerar-paginas.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (p) => readFileSync(join(raiz, p), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  .replace(/`([^`]+)`/g, '<code>$1</code>');

// Markdown mínimo: #, ##, listas (- e 1.), citação (>), parágrafos.
function md(texto, { h1 = true } = {}) {
  const linhas = texto.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0;
  while (i < linhas.length) {
    const l = linhas[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,2}) (.*)$/))) {
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++;
    } else if (/^- /.test(l)) {
      const it = [];
      while (i < linhas.length && /^- /.test(linhas[i])) it.push(`<li>${inline(linhas[i++].slice(2))}</li>`);
      out.push(`<ul>${it.join('')}</ul>`);
    } else if (/^\d+\. /.test(l)) {
      const it = [];
      while (i < linhas.length && /^\d+\. /.test(linhas[i])) it.push(`<li>${inline(linhas[i++].replace(/^\d+\. /, ''))}</li>`);
      out.push(`<ol>${it.join('')}</ol>`);
    } else if (/^> ?/.test(l)) {
      const it = [];
      while (i < linhas.length && /^> ?/.test(linhas[i])) it.push(linhas[i++].replace(/^> ?/, ''));
      out.push(`<blockquote><p>${inline(it.join(' '))}</p></blockquote>`);
    } else {
      const it = [];
      while (i < linhas.length && linhas[i].trim() && !/^(#{1,2} |- |\d+\. |> ?)/.test(linhas[i])) it.push(linhas[i++]);
      out.push(`<p>${inline(it.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}

function pagina({ titulo, descricao, base, corpo }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${esc(titulo)} — Desendireita</title>
<meta name="description" content="${esc(descricao)}">
<link rel="stylesheet" href="${base}style.css">
</head>
<body>
<div class="wrap">
  <header class="masthead">
    <a class="brand" href="${base || './'}index.html">Desendireita</a>
    <div class="slogan">Jornalismo nunca é imparcial. Veja a notícia por outro lado.</div>
  </header>
  <main class="texto">
    <a class="voltar" href="${base}index.html">← Voltar ao início</a>
${corpo}
  </main>
  <footer class="rodape">
    <a href="${base}metodo.html">Método aberto: prompt.md</a>
    <p>O texto é gerado pela IA de cada pessoa e deve ser conferido.</p>
    <p class="aberto">Projeto de código aberto. O site não coleta nenhum dado: sem cookies, sem rastreamento, sem análise. <a href="https://github.com/raphaelaleixo/desendireita">Ver o código no GitHub</a>.</p>
  </footer>
</div>
</body>
</html>
`;
}

// Método
const prompt = ler('prompt-v6.txt');
writeFileSync(join(raiz, 'metodo.html'), pagina({
  titulo: 'Método aberto',
  descricao: 'O prompt que a Desendireita envia ao chat de IA, na íntegra.',
  base: '',
  corpo: `    <p class="cru">Este é o texto de <a href="prompt-v6.txt">prompt-v6.txt</a>, o arquivo que o chat lê. Aqui ele aparece formatado, sem nenhuma alteração.</p>\n${md(prompt)}`
}));

// Exemplos
const exemplos = [
  { md: 'exemplos/exemplo-1.md', out: 'exemplos/mercado-ansiedade.html' },
  { md: 'exemplos/exemplo-2.md', out: 'exemplos/lula-investidores.html' }
];
for (const ex of exemplos) {
  const linhas = ler(ex.md).replace(/\r/g, '').split('\n');
  const original = linhas[0].replace(/^Manchete original:\s*/, '');
  const resto = linhas.slice(1).join('\n');
  const titulo = (resto.match(/^# (.*)$/m) || [])[1];
  const corpo = md(resto);
  const html = `    <p class="jornal"><b>O jornal disse: </b><span class="riscada">${esc(original)}</span></p>\n${corpo}\n    <p class="cta"><a href="../index.html">Cole o link de outra notícia e veja o que a IA faz com ela.</a></p>`;
  writeFileSync(join(raiz, ex.out), pagina({
    titulo,
    descricao: `Exemplo: a matéria "${original}" reescrita pela Desendireita.`,
    base: '../',
    corpo: html
  }));
}
console.log('Páginas geradas: metodo.html, exemplos/mercado-ansiedade.html, exemplos/lula-investidores.html');
