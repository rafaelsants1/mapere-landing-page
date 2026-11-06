// Roda o Lighthouse contra o build servido por HTTPS local e resume o resultado.
// HTTPS porque antivírus que inspeciona HTTP injeta script e distorce a medição.
//   node scripts/lighthouse.mjs mobile rodada-1
//   node scripts/lighthouse.mjs desktop rodada-1
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const modo = process.argv[2] ?? 'mobile';
const nome = process.argv[3] ?? 'rodada';
const url = process.argv[4] ?? 'https://127.0.0.1:4323/';
const saida = `lighthouse/${modo}-${nome}.json`;
const args = [
  '--yes', 'lighthouse', url,
  '--output=json', `--output-path=${saida}`, '--quiet',
  '--only-categories=performance,accessibility,best-practices,seo',
  '--chrome-flags="--headless=new --no-first-run --disable-extensions --ignore-certificate-errors"',
];
if (modo === 'desktop') args.push('--preset=desktop');
execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });

const r = JSON.parse(fs.readFileSync(saida, 'utf8'));
const nota = (c) => Math.round(r.categories[c].score * 100);
const a = (id) => r.audits[id]?.displayValue ?? 'n/d';
console.log(`${modo}: performance ${nota('performance')} · acessibilidade ${nota('accessibility')} · boas práticas ${nota('best-practices')} · SEO ${nota('seo')}`);
console.log(`LCP ${a('largest-contentful-paint')} · CLS ${a('cumulative-layout-shift')} · TBT ${a('total-blocking-time')} · FCP ${a('first-contentful-paint')} · SI ${a('speed-index')}`);
const lcp = r.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet;
if (lcp) console.log('Elemento do LCP:', lcp.slice(0, 120));
for (const cat of ['performance', 'accessibility', 'best-practices', 'seo']) {
  const falhas = r.categories[cat].auditRefs
    .map((ref) => r.audits[ref.id])
    .filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable');
  for (const f of falhas) console.log(`  [${cat}] ${f.id}: ${f.displayValue ?? f.title}`);
}
