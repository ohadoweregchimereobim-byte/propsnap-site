// Turns PRIVACY.md into privacy.html in the site's style. Vercel runs this on
// every deploy (vercel.json), so the page never drifts from the policy the
// Chrome Web Store links to. Handles only what the policy uses: headings,
// paragraphs, lists, one table, bold, code and links.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const md = fs.readFileSync(path.join(root, 'PRIVACY.md'), 'utf8').replace(/\r\n?/g, '\n');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(https:\/\/[^\s<,)]+[^\s<,).])/g, '<a href="$1">$1</a>');

const out = [];
let title = 'Privacy policy';
const lines = md.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  if (line.startsWith('# ')) { title = line.slice(2).trim(); out.push(`<h1>${inline(title)}</h1>`); continue; }
  if (line.startsWith('## ')) { out.push(`<h2>${inline(line.slice(3))}</h2>`); continue; }
  if (line.startsWith('- ')) {
    const items = [];
    while (i < lines.length && lines[i].startsWith('- ')) items.push(`<li>${inline(lines[i++].slice(2))}</li>`);
    i--; out.push(`<ul>${items.join('')}</ul>`); continue;
  }
  if (line.startsWith('|')) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
    i--;
    const cells = (r) => r.split('|').slice(1, -1).map((c) => c.trim());
    const [head, , ...body] = rows;
    out.push('<div class="table-wrap"><table><thead><tr>' + cells(head).map((c) => `<th scope="col">${inline(c)}</th>`).join('') +
      '</tr></thead><tbody>' + body.map((r) => '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
    continue;
  }
  const para = [line];
  while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|- |\|)/.test(lines[i + 1])) para.push(lines[++i]);
  out.push(`<p>${inline(para.join(' '))}</p>`);
}

const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="What the PropSnap Chrome extension reads, what it sends to which public service, and where your data is kept.">
<link rel="canonical" href="https://propsnap-site.vercel.app/privacy">
<link rel="icon" type="image/png" sizes="32x32" href="img/icon-32.png">
<link rel="stylesheet" href="scrollcraft.css">
<link rel="stylesheet" href="site.css">
</head>
<body class="doc">
<header class="chrome">
  <a class="chrome__brand" href="/" aria-label="PropSnap home">
    <img src="img/icon-32.png" width="28" height="28" alt="">
    <span>PropSnap</span>
  </a>
  <a class="btn btn--primary chrome__cta" href="https://chromewebstore.google.com/detail/ddcjkdlbipmbgdielbhfnbcodddoemjd">Add to Chrome</a>
</header>
<main class="sc-wrap doc__body">
<!-- Generated from PRIVACY.md by tools/build-privacy.mjs. Edit PRIVACY.md, not this file. -->
${out.join('\n')}
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'privacy.html'), html);
console.log('privacy.html written');
