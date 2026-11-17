// Captura quadros da cena em instantes escolhidos.
// Uso:
//   node quadros.mjs                           prévia: um PNG por linha do roteiro e a folha com a zona segura
//   node quadros.mjs 1.2 5.8 [--saida pasta] [--zona]   quadros nos tempos pedidos, em segundos
//   node quadros.mjs 0 0.5 1 2 3 --zona --folha folha.png   (03b) os quadros pedidos lado a lado, em metade do tamanho
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ALTURA, LARGURA, abrirCena, aqui, foraDaZona, zonaSegura } from './palco.mjs';

const args = process.argv.slice(2);
const opcao = (nome) => {
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : null;
};
const tempos = args.filter((a) => /^\d+(\.\d+)?$/.test(a)).map(Number);
const comZona = args.includes('--zona');

const { browser, page, duracao, marcas: m } = await abrirCena();

async function captura(t, arquivo) {
  await page.evaluate((s) => window.__ir(s), t);
  const fora = await foraDaZona(page);
  await page.screenshot({ path: arquivo, clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
  return fora;
}

if (tempos.length) {
  const saida = resolve(opcao('--saida') || join(aqui, 'quadros'));
  mkdirSync(saida, { recursive: true });
  await zonaSegura(page, comZona);
  const arquivos = [];
  for (const t of tempos) {
    const arquivo = join(saida, `t${t.toFixed(2).replace('.', '_')}.png`);
    const fora = await captura(Math.min(t, duracao), arquivo);
    arquivos.push(arquivo);
    console.log(`${t.toFixed(2)} s -> ${arquivo}${fora.length ? `  FORA DA ZONA: ${fora.join(' | ')}` : ''}`);
  }
  const folha = opcao('--folha');
  if (folha) {
    // Folha com os quadros lado a lado, em metade do tamanho, com o tempo escrito embaixo de cada um.
    const filtros = arquivos.map((_, i) => `[${i}:v]scale=iw/2:-1,pad=iw:ih+56:0:0:#17110e,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${tempos[i].toFixed(1).replace('.', ',')} s':x=(w-tw)/2:y=h-44:fontsize=32:fontcolor=white[q${i}]`);
    execFileSync('ffmpeg', [
      '-v', 'error', '-y',
      ...arquivos.flatMap((a) => ['-i', a]),
      '-filter_complex', `${filtros.join(';')};${arquivos.map((_, i) => `[q${i}]`).join('')}hstack=inputs=${arquivos.length}`,
      '-frames:v', '1', resolve(folha),
    ]);
    console.log(`folha: ${resolve(folha)}`);
  }
} else {
  // Um quadro por linha do roteiro, no momento que melhor representa cada uma.
  const linhas = [
    { nome: '1-gancho', t: m.libera + 0.3 },
    { nome: '2-tres-motivos', t: m.fazer },
    { nome: '3-sem-sinal', t: m.inicia + 1.05 },
    { nome: '4-pagamento', t: m.segundo + 0.6 },
    { nome: '5-sem-internet', t: m.chega + 0.05 },
    { nome: '6-mapa', t: m.mapere + 0.3 },
    { nome: '7-logo', t: m.sigaFim + 0.4 },
  ];
  const saida = join(aqui, 'previa');
  const comFaixas = join(saida, '_zona');
  mkdirSync(comFaixas, { recursive: true });
  let problemas = 0;
  for (const l of linhas) {
    const fora = await captura(l.t, join(saida, `${l.nome}.png`));
    problemas += fora.length;
    console.log(`${l.nome}.png  t = ${l.t.toFixed(2)} s${fora.length ? `  FORA DA ZONA: ${fora.join(' | ')}` : ''}`);
  }
  // Folha com os quadros e a zona segura por cima, em metade do tamanho.
  await zonaSegura(page, true);
  for (const l of linhas) await captura(l.t, join(comFaixas, `${l.nome}.png`));
  execFileSync('ffmpeg', [
    '-v', 'error', '-y',
    ...linhas.flatMap((l) => ['-i', join(comFaixas, `${l.nome}.png`)]),
    '-filter_complex', `hstack=inputs=${linhas.length},scale=iw/2:-1`,
    '-frames:v', '1', join(saida, '8-zona-segura.png'),
  ]);
  console.log(`8-zona-segura.png  os quadros com a zona segura por cima`);
  console.log(problemas ? `${problemas} texto(s) essencial(is) fora da zona segura` : 'todo o texto essencial está dentro da zona segura');
}
await browser.close();
