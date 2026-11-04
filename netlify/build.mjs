import { readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const out = resolve(here, 'dist');
const storeUrl = 'https://treau-studio.matteolopesdesouza.chatgpt.site/';
const source = await readFile(resolve(root, 'lib/launch.ts'), 'utf8');
const date = source.match(/export const DROP_DATE = '([^']+)'/u)?.[1];
if (!date || !Number.isFinite(Date.parse(date))) throw new Error('Missing valid DROP_DATE in lib/launch.ts.');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const template = await readFile(resolve(here, 'index.html'), 'utf8');
await writeFile(resolve(out, 'index.html'), template.replaceAll('{{DROP_DATE}}', date).replaceAll('{{STORE_URL}}', storeUrl));
const reset = `@font-face{font-family:'TREAU Display';src:url('/fonts/treau-display-600.woff2') format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:'TREAU Display';src:url('/fonts/treau-display-800.woff2') format('woff2');font-weight:800;font-display:swap}
:root{font-family:Arial,Helvetica,sans-serif;--display:'TREAU Display','Arial Narrow',sans-serif;--mono:'Courier New',monospace}
*{box-sizing:border-box}body,h1,p{margin:0}img{display:block;max-width:100%}a{color:inherit}
.launch-open-link{display:inline-flex;margin-top:24px;min-height:48px;align-items:center;color:#b6c6ff;font-size:14px;text-underline-offset:5px}
.launch-open-link[hidden]{display:none}
:focus-visible{outline:2px solid #7b99ff;outline-offset:5px}
`;
await writeFile(resolve(out, 'launch.css'), reset + await readFile(resolve(root, 'app/launch-countdown.css'), 'utf8'));
await copyFile(resolve(here, 'countdown.mjs'), resolve(out, 'countdown.mjs'));
const assets = [
  'brand/treau-icon.png',
  'brand/treau-mark-160-c5baefd6.webp',
  'fonts/treau-display-600.woff2',
  'fonts/treau-display-800.woff2',
  'fonts/OFL-Barlow-Condensed.txt',
  'images/optimized/campaign-night-600-414f7cf3.webp',
  'images/optimized/campaign-night-1000-414f7cf3.webp',
];
for (const asset of assets) {
  await mkdir(dirname(resolve(out, asset)), { recursive: true });
  await copyFile(resolve(root, 'public', asset), resolve(out, asset));
}
await writeFile(resolve(out, '_redirects'), '/* /index.html 200\n');
await writeFile(resolve(out, '_headers'), '/index.html\n  Cache-Control: public, max-age=0, must-revalidate\n');
console.log('TREAU: static countdown built in netlify/dist (no Next.js or Vinext runtime).');
