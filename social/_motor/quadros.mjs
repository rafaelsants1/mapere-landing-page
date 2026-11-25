// Captura quadros da cena de um vídeo.
// Uso:
//   node _motor/quadros.mjs 04                      prévia: um PNG por item de "previa" no roteiro.json, a checagem de
//                                                   movimento (falha se o quadro de 0 s e o de 0,5 s forem iguais), a
//                                                   folha com a zona segura e a varredura de todos os quadros a 30 fps
//                                                   (falha se algum texto essencial sair da zona em qualquer quadro; o
//                                                   pior quadro de cada caso vai para previa/_fora/N.png)
//   node _motor/quadros.mjs 04 --sem-varredura      só a prévia, para iterar rápido na cena
//   node _motor/quadros.mjs 04 1.2 5.8 [--zona]     quadros nos tempos pedidos (segundos ou marcas, ex.: nada+0.2)
//   node _motor/quadros.mjs 04 --folha 2            folha com um quadro a cada 2 s
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ALTURA, FPS, LARGURA, abrirCena, descreverAchado, foraDaZona, instante, lerRoteiro, pastaDoVideo, varrerZona, zonaSegura } from './palco.mjs';

const [arg, ...resto] = process.argv.slice(2);
const video = pastaDoVideo(arg);
const fonte = join(video, '_fonte');
const roteiro = lerRoteiro(video);
const comZona = resto.includes('--zona');
const iFolha = resto.indexOf('--folha');
const pedidos = resto.filter((a, i) => !a.startsWith('--') && resto[i - 1] !== '--folha');

const { browser, page, duracao, marcas } = await abrirCena(video);

async function captura(t, arquivo) {
  await page.evaluate((s) => window.__ir(s), t);
  const fora = await foraDaZona(page);
  await page.screenshot({ path: arquivo, clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
  return fora;
}
// Pixels RGB de um PNG, pelo ffmpeg (a mesma leitura do checar.mjs do 03b).
const pixels = (png) => execFileSync('ffmpeg', ['-v', 'error', '-i', png, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 64 * 1024 * 1024 });
// Abaixo disso, passa com aviso: pode ser só um detalhe piscando num quadro parado.
const POUCO_MOVIMENTO = 0.01;
// Movimento no primeiro quadro, regra do T1 do plano de alcance (social/_estrategia): algo já
// se mexe em t = 0. Compara o quadro de 0 s com o de 0,5 s, pixel a pixel.
async function movimentoNoComeco(pasta) {
  mkdirSync(pasta, { recursive: true });
  const a = join(pasta, '0s.png');
  const b = join(pasta, '0_5s.png');
  await captura(0, a);
  await captura(Math.min(0.5, duracao), b);
  const p0 = pixels(a);
  const p5 = pixels(b);
  let mudaram = 0;
  for (let i = 0; i < p0.length; i += 3) {
    if (p0[i] !== p5[i] || p0[i + 1] !== p5[i + 1] || p0[i + 2] !== p5[i + 2]) mudaram++;
  }
  return { mudaram, total: p0.length / 3 };
}
const folha = (arquivos, saida, porLinha) => {
  const n = arquivos.length;
  const filtro = porLinha && n > porLinha
    ? `${arquivos.map((_, i) => `[${i}:v]scale=iw/4:-1[q${i}]`).join(';')};${arquivos.map((_, i) => `[q${i}]`).join('')}xstack=inputs=${n}:layout=${arquivos.map((_, i) => `${(i % porLinha) * 270}_${Math.floor(i / porLinha) * 480}`).join('|')}:fill=black`
    : `hstack=inputs=${n},scale=iw/2:-1`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...arquivos.flatMap((a) => ['-i', a]), '-filter_complex', filtro, '-frames:v', '1', saida]);
};

if (iFolha >= 0) {
  const passo = Number(resto[iFolha + 1]) || 2;
  const pasta = join(fonte, 'verificacao', 'folha');
  mkdirSync(pasta, { recursive: true });
  const arquivos = [];
  for (let t = 0; t <= duracao; t += passo) {
    const a = join(pasta, `t${t.toFixed(1).padStart(4, '0')}.png`);
    await captura(t, a);
    arquivos.push(a);
  }
  folha(arquivos, join(fonte, 'verificacao', `folha-${passo}s.png`), 7);
  console.log(`verificacao/folha-${passo}s.png: ${arquivos.length} quadros`);
} else if (pedidos.length) {
  const saida = join(fonte, 'quadros');
  mkdirSync(saida, { recursive: true });
  await zonaSegura(page, comZona);
  for (const p of pedidos) {
    const t = Math.min(instante(/^\d/.test(p) ? Number(p) : p, marcas), duracao);
    const arquivo = join(saida, `t${t.toFixed(2).replace('.', '_')}.png`);
    const fora = await captura(t, arquivo);
    console.log(`${t.toFixed(2)} s -> ${arquivo}${fora.length ? `  FORA DA ZONA: ${fora.join(' | ')}` : ''}`);
  }
} else {
  const linhas = roteiro.previa.map((l) => ({ nome: l.nome, t: Math.min(instante(l.t, marcas), duracao) }));
  const saida = join(fonte, 'previa');
  const comFaixas = join(saida, '_zona');
  mkdirSync(comFaixas, { recursive: true });
  let problemas = 0;
  for (const l of linhas) {
    const fora = await captura(l.t, join(saida, `${l.nome}.png`));
    problemas += fora.length;
    console.log(`${l.nome}.png  t = ${l.t.toFixed(2)} s${fora.length ? `  FORA DA ZONA: ${fora.join(' | ')}` : ''}`);
  }
  // Antes de ligar a zona segura, para a faixa desenhada por cima não entrar na comparação.
  const mov = await movimentoNoComeco(join(saida, '_movimento'));
  const fracao = mov.mudaram / mov.total;
  const pct = `${mov.mudaram} de ${mov.total} pixels mudaram (${(100 * fracao).toFixed(2)}%)`;
  if (mov.mudaram === 0) {
    console.log(`MOVIMENTO: o quadro de 0 s e o de 0,5 s são iguais. Algo tem que se mexer desde o primeiro quadro. Veja previa/_movimento/`);
  } else if (fracao < POUCO_MOVIMENTO) {
    console.log(`movimento entre 0 s e 0,5 s: ${pct}. Pouco: confira em previa/_movimento/ se o gancho não está parado`);
  } else {
    console.log(`movimento entre 0 s e 0,5 s: ${pct}`);
  }
  await zonaSegura(page, true);
  for (const l of linhas) await captura(l.t, join(comFaixas, `${l.nome}.png`));
  folha(linhas.map((l) => join(comFaixas, `${l.nome}.png`)), join(saida, 'zona-segura.png'));
  console.log('zona-segura.png: os quadros com a zona segura por cima');
  // Pior quadro de cada achado da varredura, numa pasta só dela: limpa sempre, para não
  // sobrar imagem de uma rodada anterior.
  const pastaFora = join(saida, '_fora');
  rmSync(pastaFora, { recursive: true, force: true });
  const pulou = resto.includes('--sem-varredura');
  if (pulou) {
    console.log('varredura de todos os quadros: pulada (--sem-varredura)');
  } else {
    // Todos os quadros: pega o que sai da zona entre dois quadros da prévia.
    const { total, achados } = await varrerZona(page, duracao);
    if (achados.length) mkdirSync(pastaFora, { recursive: true });
    for (const [k, a] of achados.entries()) {
      await captura(a.pior, join(pastaFora, `${k + 1}.png`));
      console.log(`FORA DA ZONA: ${descreverAchado(a)}. Pior quadro (${a.pior.toFixed(2)} s): previa/_fora/${k + 1}.png`);
    }
    console.log(`varredura: ${total} quadros a ${FPS} fps, ${achados.length ? `${achados.length} texto(s) fora da zona` : 'nada fora da zona'}`);
    problemas += achados.length;
  }
  console.log(problemas ? 'há texto essencial fora da zona segura' : pulou ? 'nos quadros da prévia, nada fora da zona segura (rode sem --sem-varredura antes do render)' : 'todo o texto essencial está dentro da zona segura, em todos os quadros');
  if (problemas || mov.mudaram === 0) process.exitCode = 1;
}
await browser.close();
