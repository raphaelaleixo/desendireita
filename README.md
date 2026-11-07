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

## O que mexer

- **Domínio:** troque `PROMPT_URL` em `core.js` pelo endereço público do `prompt-v6.md`. Enquanto estiver o endereço de exemplo, o chat não conseguirá ler as diretrizes.
- **Chats:** o objeto `CHATS`, também em `core.js`. Os formatos de endereço (`?q=` etc.) não são oficiais e podem mudar; ajuste só ali.
- **Prompt (diretrizes):** `prompt-v6.md` é servido como texto puro. `metodo.html` mostra o mesmo conteúdo formatado.
- **Páginas geradas:** `metodo.html` e `exemplos/*.html` saem de `prompt-v6.md` e `exemplos/exemplo-*.md`. Depois de editar esses `.md`, rode:

```sh
node tools/gerar-paginas.mjs
```

## Publicar

Basta servir a pasta como arquivos estáticos (Vercel, Netlify, GitHub Pages, Cloudflare Pages, qualquer servidor). Não há etapa de build. Publique `index.html`, `style.css`, `core.js`, `app.js`, `prompt-v6.md`, `metodo.html`, `exemplos/*.html` e `fonts/`. As pastas `design/`, `test/` e `tools/` e os arquivos `.md` de trabalho não precisam subir.

Depois de publicar, confira que `https://SEU-DOMINIO/prompt-v6.md` abre como texto puro e que o `PROMPT_URL` aponta para ele.

## Fontes

Newsreader e Libre Franklin, ambas com licença OFL (textos em `fonts/OFL-*.txt`), em woff2 do subset latino.
