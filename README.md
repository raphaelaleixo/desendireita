# Desendireita

Site estático. Cola-se o link de uma notícia de economia, escolhe-se um chat de IA e ele abre com o pedido pronto. HTML, CSS e JavaScript puros, sem build e sem nenhuma requisição a terceiros (as fontes ficam em `fonts/`).

## Rodar localmente

```sh
python3 -m http.server 8000
# ou
npx serve .
```

Abra http://localhost:8000. Abrir o `index.html` direto no navegador (`file://`) também funciona.

## Testes

```sh
node --test test/core.test.mjs
```

Cobrem a validação do link (incluindo acentos, espaços e caracteres especiais), a montagem do prompt e o endereço de cada chat.

## Abrir com o link preenchido

`?link=` preenche o campo, e a pessoa ainda clica em "Continuar":

```
https://desendireita.com.br/?link=https://exemplo.com.br/economia/materia
```

O ideal é codificar o link (`encodeURIComponent`). Solto também funciona, desde que não tenha `#`, porque o navegador separa tudo depois dele da consulta. Um valor inválido só preenche o campo: o erro aparece quando se clica em "Continuar".

## O que mexer

- **Endereço das diretrizes:** o `PROMPT_URL`, em `core.js`, aponta para `https://raw.githubusercontent.com/raphaelaleixo/desendireita/main/prompt-v6.txt`. Escolhi o `raw` porque o Perplexity não abriu o arquivo no domínio próprio, e o ChatGPT e o Perplexity abrem este. Ele depende do nome do repositório e da branch (`main`): se mudar um dos dois, atualize o `PROMPT_URL`. Se o endereço não abrir, o chat não consegue ler as diretrizes.
- **Chats:** o objeto `CHATS`, também em `core.js`. Os formatos de endereço (`?q=` etc.) não são oficiais e podem mudar; ajuste só ali.
- **Prompt (diretrizes):** `prompt-v6.txt` é servido como texto puro. `metodo.html` mostra o mesmo conteúdo formatado.
- **Páginas geradas:** `metodo.html` e `exemplos/*.html` saem de `prompt-v6.txt` e `exemplos/exemplo-*.md`. Depois de editar esses `.md`, rode:

```sh
node tools/gerar-paginas.mjs
```

## Publicar

Basta servir a pasta como arquivos estáticos (Vercel, Netlify, GitHub Pages, Cloudflare Pages, qualquer servidor). Não há etapa de build. Publique `index.html`, `style.css`, `core.js`, `app.js`, `prompt-v6.txt`, `metodo.html`, `exemplos/*.html` e `fonts/`. As pastas `design/`, `test/` e `tools/` e os arquivos `.md` de trabalho não precisam subir.

Depois de publicar, confira que o endereço do `PROMPT_URL` abre o `prompt-v6.txt` como texto puro.

## Fontes

Newsreader e Libre Franklin, ambas com licença OFL (textos em `fonts/OFL-*.txt`), em woff2 do subset latino.
