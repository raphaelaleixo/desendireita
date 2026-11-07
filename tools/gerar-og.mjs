// Gera og.png (1200x630) a partir de tools/og.html, usando o Chrome em modo headless.
// Rode: node tools/gerar-og.mjs   (ou CHROME=/caminho/do/chrome node tools/gerar-og.mjs)
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const candidatos = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);
const chrome = candidatos.find((c) => existsSync(c));
if (!chrome) { console.error('Chrome não encontrado. Defina CHROME=/caminho/do/chrome.'); process.exit(1); }

execFileSync(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--window-size=1200,630', '--virtual-time-budget=4000',
  `--screenshot=${join(raiz, 'og.png')}`,
  pathToFileURL(join(raiz, 'tools', 'og.html')).href
], { stdio: 'ignore' });
console.log('og.png gerado.');
