// Gera a capa do vídeo: o quadro do gancho, sem a legenda, com o título maior e a
// cena um pouco mais baixa, para o título ficar folgado no recorte central 3:4.
//
// Veio do vídeo 03. O instante e os ajustes vêm de "capa" no roteiro.json:
//   { "t": "ponto+0.2", "desce": 120, "titulo": 88 }
// Uso: node _motor/capa.mjs 04 [--t segundos]
//   video/capa.png       1080 x 1920
//   video/capa-3x4.png   recorte central 1080 x 1440 (grade do perfil)
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ALTURA, LARGURA, abrirCena, instante, lerRoteiro, pastaDoVideo } from './palco.mjs';

const RECORTE = { largura: 1080, altura: 1440 };
const MARGEM = 64; // folga mínima entre o título e a borda do recorte

const args = process.argv.slice(2);
const video = pastaDoVideo(args[0]);
const cfg = lerRoteiro(video).capa || {};
const DESCE = cfg.desce ?? 120; // quanto a cena desce na capa, em pixels
const iT = args.indexOf('--t');
const { browser, page, marcas } = await abrirCena(video);
const t = iT >= 0 ? Number(args[iT + 1]) : instante(cfg.t ?? 0, marcas);

await page.evaluate((s) => window.__ir(s), t);
await page.addStyleTag({
  content: `
    html, body { background: #17110e; overflow: hidden; }
    #palco { translate: 0 ${DESCE}px; }
    #legenda { display: none !important; }
    #titulo { font-size: ${cfg.titulo ?? 88}px; top: 226px; }
  `,
});

const titulo = await page.evaluate(() => {
  const faixa = document.createRange();
  faixa.selectNodeContents(document.getElementById('titulo'));
  const b = faixa.getBoundingClientRect();
  return { esquerda: b.left, direita: b.right, topo: b.top, base: b.bottom, texto: document.getElementById('titulo').innerText };
});

const pasta = join(video, 'video');
mkdirSync(pasta, { recursive: true });
const capa = join(pasta, 'capa.png');
const recorte = join(pasta, 'capa-3x4.png');
await page.screenshot({ path: capa, clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
await browser.close();

const x0 = (LARGURA - RECORTE.largura) / 2;
const y0 = (ALTURA - RECORTE.altura) / 2;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', capa, '-vf', `crop=${RECORTE.largura}:${RECORTE.altura}:${x0}:${y0}`, '-frames:v', '1', recorte]);

const folga = {
  topo: titulo.topo - y0,
  base: y0 + RECORTE.altura - titulo.base,
  esquerda: titulo.esquerda - x0,
  direita: x0 + RECORTE.largura - titulo.direita,
};
const cabe = Object.values(folga).every((v) => v >= MARGEM);
console.log(`capa.png no instante ${t.toFixed(2)} s: "${titulo.texto.replace(/\n/g, ' / ')}"`);
console.log(`título: x ${Math.round(titulo.esquerda)} a ${Math.round(titulo.direita)}, y ${Math.round(titulo.topo)} a ${Math.round(titulo.base)}`);
console.log(`folga no recorte 3:4 (y ${y0} a ${y0 + RECORTE.altura}): topo ${Math.round(folga.topo)}, base ${Math.round(folga.base)}, esquerda ${Math.round(folga.esquerda)}, direita ${Math.round(folga.direita)} px`);
console.log(cabe ? 'o título cabe no recorte 3:4' : `O TÍTULO NÃO CABE no recorte 3:4 com ${MARGEM} px de folga`);
if (!cabe) process.exitCode = 1;
