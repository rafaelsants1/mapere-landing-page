// Gera _fonte/dados.js de um vídeo (window.MAPA, window.LOGO, window.ICONES) a partir
// dos arquivos do projeto. Veio do vídeo 03, sem as rotas, que eram só daquele roteiro.
// Uso: node _motor/dados.mjs 04
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { motor, pastaDoVideo } from './palco.mjs';

const video = pastaDoVideo(process.argv[2]);
const raiz = join(motor, '..', '..');
const mapa = JSON.parse(readFileSync(join(raiz, 'src/data/mapa/problema.json'), 'utf8'));
const logoSvg = readFileSync(join(raiz, 'public/brand/mapere-m3-Mapere-ponto-escuro.svg'), 'utf8');
const iconeAstro = readFileSync(join(raiz, 'src/components/Icone.astro'), 'utf8');

const MAPA = {
  viewBox: mapa.viewBox,
  largura: mapa.largura,
  altura: mapa.altura,
  arterias: mapa.arterias,
  inicio: mapa.inicio,
  // Pontos de posto disponíveis: as 3 paradas da rota da landing e os extras.
  postos: [...mapa.paradas.map((p) => [p.x, p.y]), ...mapa.extras],
};

// Logo: letras em Linho e o ponto final em Brasa, separados para a cena animar.
const viewBox = logoSvg.match(/viewBox="([^"]+)"/)[1];
const partes = [...logoSvg.matchAll(/<path fill="(#[0-9A-Fa-f]{6})" d="([^"]+)"/g)].map((m) => ({ cor: m[1].toUpperCase(), d: m[2] }));
const ponto = partes.filter((p) => p.cor === '#F0641E');
const letras = partes.filter((p) => p.cor === '#F3EDE2');
if (ponto.length !== 1 || letras.length !== 6) throw new Error(`Logo fora do esperado: ${letras.length} letras, ${ponto.length} ponto(s).`);
const LOGO = { viewBox, letras: letras.map((p) => p.d), ponto: ponto[0].d };

// Todos os ícones de Icone.astro (grade de 24 px).
const bloco = iconeAstro.match(/const caminhos = \{([\s\S]*?)\} as const/)[1];
const ICONES = Object.fromEntries([...bloco.matchAll(/^\s*(\w+): '([^']+)',?$/gm)].map((m) => [m[1], m[2]]));
for (const nome of ['livre', 'ocupado', 'defeito', 'seminfo', 'plugue', 'raio']) {
  if (!ICONES[nome]) throw new Error(`Ícone "${nome}" não está em Icone.astro.`);
}

const saida =
  '// Gerado por _motor/dados.mjs a partir de src/data/mapa/problema.json, do logo M3 e de Icone.astro. Não edite à mão.\n' +
  `window.MAPA = ${JSON.stringify(MAPA)};\n` +
  `window.LOGO = ${JSON.stringify(LOGO)};\n` +
  `window.ICONES = ${JSON.stringify(ICONES)};\n`;
writeFileSync(join(video, '_fonte', 'dados.js'), saida);
console.log(`dados.js: ${(saida.length / 1024).toFixed(1)} kB, ${MAPA.arterias.length} artérias, ${MAPA.postos.length} postos, ${Object.keys(ICONES).length} ícones`);
