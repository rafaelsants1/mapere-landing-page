// Captura quadros da cena de um vídeo.
// Uso:
//   node _motor/quadros.mjs 04                      prévia: um PNG por item de "previa" no roteiro.json, a folha com a
//                                                   zona segura e a varredura de todos os quadros a 30 fps (falha se
//                                                   algum texto essencial sair da zona em qualquer quadro)
//   node _motor/quadros.mjs 04 --sem-varredura      só a prévia, para iterar rápido na cena
//   node _motor/quadros.mjs 04 1.2 5.8 [--zona]     quadros nos tempos pedidos (segundos ou marcas, ex.: nada+0.2)
//   node _motor/quadros.mjs 04 --folha 2            folha com um quadro a cada 2 s
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ALTURA, LARGURA, abrirCena, foraDaZona, instante, lerRoteiro, pastaDoVideo, varrerZona, zonaSegura } from './palco.mjs';

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
  await zonaSegura(page, true);
  for (const l of linhas) await captura(l.t, join(comFaixas, `${l.nome}.png`));
  folha(linhas.map((l) => join(comFaixas, `${l.nome}.png`)), join(saida, 'zona-segura.png'));
  console.log('zona-segura.png: os quadros com a zona segura por cima');
  if (resto.includes('--sem-varredura')) {
    console.log('varredura de todos os quadros: pulada (--sem-varredura)');
  } else {
    // Todos os quadros: pega o que sai da zona entre dois quadros da prévia.
    for (const f of readdirSync(comFaixas)) if (/^fora-\d+\.png$/.test(f)) rmSync(join(comFaixas, f));
    const { total, achados } = await varrerZona(page, duracao);
    const s = (v) => v.toFixed(2);
    for (const [k, a] of achados.entries()) {
      const arquivo = join(comFaixas, `fora-${k + 1}.png`);
      await captura(a.pior, arquivo);
      const quando = a.trechos.map(([de, ate]) => (de === ate ? `${s(de)} s` : `${s(de)} a ${s(ate)} s`)).join(', ');
      console.log(`FORA DA ZONA: ${a.nome}, ${a.lado}, até ${a.excesso} px, em ${a.quadros} quadro(s): ${quando}. Pior quadro (${s(a.pior)} s): previa/_zona/fora-${k + 1}.png`);
    }
    console.log(`varredura: ${total} quadros a 30 fps, ${achados.length ? `${achados.length} texto(s) fora da zona` : 'nada fora da zona'}`);
    problemas += achados.length;
  }
  const pulou = resto.includes('--sem-varredura');
  console.log(problemas ? 'há texto essencial fora da zona segura' : pulou ? 'nos quadros da prévia, nada fora da zona segura (rode sem --sem-varredura antes do render)' : 'todo o texto essencial está dentro da zona segura, em todos os quadros');
  if (problemas) process.exitCode = 1;
}
await browser.close();
