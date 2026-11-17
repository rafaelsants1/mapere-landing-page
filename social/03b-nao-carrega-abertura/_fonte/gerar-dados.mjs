// Gera dados.js (window.MAPA, window.LOGO e window.ICONES) a partir dos arquivos do projeto.
// Cópia do vídeo 02. Aqui o mapa só aparece na cena final; os ícones incluem plugue e raio.
// Nada é copiado à mão: as duas rotas do vídeo saem da rota original.
// Uso: node gerar-dados.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, '..', '..', '..');
const mapa = JSON.parse(readFileSync(join(raiz, 'src/data/mapa/problema.json'), 'utf8'));
const logoSvg = readFileSync(join(raiz, 'public/brand/mapere-m3-Mapere-ponto-escuro.svg'), 'utf8');
const iconeAstro = readFileSync(join(raiz, 'src/components/Icone.astro'), 'utf8');

const pontos = (d) => {
  const n = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const r = [];
  for (let i = 0; i < n.length; i += 2) r.push([n[i], n[i + 1]]);
  return r;
};
const caminho = (pts) => 'M' + pts.map((p) => `${p[0]} ${p[1]}`).join('L');
const comprimento = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const igual = (a, b) => a[0] === b[0] && a[1] === b[1];

// A rota original vai do início ao posto 1, entra num ramal até o posto 2,
// volta pelo mesmo ramal e segue até o posto 3. O retorno é o vértice k em
// que o ponto anterior e o seguinte coincidem.
const rota = pontos(mapa.rota);
let k = -1;
let alcance = 0;
for (let i = 1; i < rota.length - 1; i++) {
  let m = 0;
  while (i - m - 1 >= 0 && i + m + 1 < rota.length && igual(rota[i - m - 1], rota[i + m + 1])) m++;
  if (m > alcance) [k, alcance] = [i, m];
}
if (k < 0) throw new Error('Não achei o ramal de ida e volta na rota.');

// Ida: do início até o posto 2 (posto 1 no caminho).
const ida = rota.slice(0, k + 1);
// Direta: a rota sem o ramal, do início ao posto 3.
const direta = [...rota.slice(0, k - alcance), ...rota.slice(k + alcance + 1)];

// Fração do comprimento em que a rota passa mais perto de um ponto.
function fracao(pts, [x, y]) {
  const total = comprimento(pts);
  let melhor = { d: Infinity, t: 0 };
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const seg = Math.hypot(bx - ax, by - ay);
    const u = seg ? Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / (seg * seg))) : 0;
    const d = Math.hypot(ax + (bx - ax) * u - x, ay + (by - ay) * u - y);
    if (d < melhor.d) melhor = { d, t: (acc + seg * u) / total };
    acc += seg;
  }
  return melhor;
}

const [p1, p2, p3] = mapa.paradas;
const arred = (v) => Math.round(v * 1e4) / 1e4;
const confere = [
  ['posto 1 na rota original', fracao(rota.slice(0, k + 1), [p1.x, p1.y]).t * (comprimento(ida) / comprimento(rota)), p1.t],
  ['posto 2 na rota original', comprimento(ida) / comprimento(rota), p2.t],
];
for (const [nome, calculado, doJson] of confere) {
  const ok = Math.abs(calculado - doJson) < 0.01;
  console.log(`${ok ? 'ok  ' : 'ERRO'} ${nome}: calculado ${calculado.toFixed(3)}, json ${doJson}`);
  if (!ok) process.exitCode = 1;
}
const fimIda = ida[ida.length - 1];
const fimDireta = direta[direta.length - 1];
console.log(`ida termina em ${fimIda} (posto 2: ${p2.x} ${p2.y}); direta termina em ${fimDireta} (posto 3: ${p3.x} ${p3.y})`);
console.log(`comprimentos: original ${comprimento(rota).toFixed(1)}, ida ${comprimento(ida).toFixed(1)}, direta ${comprimento(direta).toFixed(1)}`);

const MAPA = {
  viewBox: mapa.viewBox,
  largura: mapa.largura,
  altura: mapa.altura,
  arterias: mapa.arterias,
  inicio: mapa.inicio,
  // No vídeo: posto 1 Ocupado, posto 2 Com defeito, posto 3 Livre.
  paradas: mapa.paradas,
  extras: mapa.extras,
  rotas: {
    ida: { d: caminho(ida), t1: arred(fracao(ida, [p1.x, p1.y]).t) },
    direta: { d: caminho(direta), t1: arred(fracao(direta, [p1.x, p1.y]).t) },
  },
};

// Logo: letras em Linho e o ponto final em Brasa, separados para a cena animar.
const viewBox = logoSvg.match(/viewBox="([^"]+)"/)[1];
const partes = [...logoSvg.matchAll(/<path fill="(#[0-9A-Fa-f]{6})" d="([^"]+)"/g)].map((m) => ({ cor: m[1].toUpperCase(), d: m[2] }));
const ponto = partes.filter((p) => p.cor === '#F0641E');
const letras = partes.filter((p) => p.cor === '#F3EDE2');
// Seis formas em Linho: o símbolo, que faz o papel do M, e as letras a, p, e, r, e.
if (ponto.length !== 1 || letras.length !== 6) throw new Error(`Logo fora do esperado: ${letras.length} letras, ${ponto.length} ponto(s).`);
const LOGO = { viewBox, letras: letras.map((p) => p.d), ponto: ponto[0].d };

// Ícones de status: os mesmos desenhos de Icone.astro (grade de 24 px).
const bloco = iconeAstro.match(/const caminhos = \{([\s\S]*?)\} as const/)[1];
const todos = Object.fromEntries([...bloco.matchAll(/^\s*(\w+): '([^']+)',?$/gm)].map((m) => [m[1], m[2]]));
const ICONES = {};
for (const nome of ['livre', 'ocupado', 'defeito', 'plugue', 'raio']) {
  if (!todos[nome]) throw new Error(`Ícone "${nome}" não está em Icone.astro.`);
  ICONES[nome] = todos[nome];
}

const saida =
  '// Gerado por gerar-dados.mjs a partir de src/data/mapa/problema.json, do logo M3 e de Icone.astro. Não edite à mão.\n' +
  `window.MAPA = ${JSON.stringify(MAPA)};\n` +
  `window.LOGO = ${JSON.stringify(LOGO)};\n` +
  `window.ICONES = ${JSON.stringify(ICONES)};\n`;
writeFileSync(join(aqui, 'dados.js'), saida);
console.log(`dados.js: ${(saida.length / 1024).toFixed(1)} kB, ${MAPA.arterias.length} artérias, t1 ida ${MAPA.rotas.ida.t1}, t1 direta ${MAPA.rotas.direta.t1}`);
