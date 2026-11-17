// Checkpoint 2 do 03b: um MP4 curto por tom, com a abertura animada e as duas takes
// do gancho novo em sequência (take 1, depois take 2). O áudio vai em MP3, que o VS Code toca.
//
// Os tempos das palavras são estimados dentro da fala de cada take (do começo ao fim
// da voz, medidos no próprio áudio). Não há transcrição: é só para escolher o tom de ouvido.
//
// Uso: node previa-tons.mjs   → previa/tons/<tom>.mp4
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ALTURA, LARGURA, abrirCena, aqui } from './palco.mjs';

const FPS = 30;
const TAXA = 48000;
const ENTRADA = 0.2; // a voz entra em 0,2 s
const PAUSA_L2 = 0.45; // entre o fim da linha 1 e "Três motivos", só para posicionar a saída do carro
const TONS = [
  { nome: 'frustrado', marca: '[frustrated]' },
  { nome: 'urgente', marca: '[urgent]' },
  { nome: 'conversa', marca: '[conversational]' },
];
const pastaTakes = join(aqui, 'audio', 'gancho-03b');
const saida = join(aqui, 'previa', 'tons');
mkdirSync(saida, { recursive: true });

// Legenda de base: a estimativa do roteiro (node montar-legenda.mjs --plano).
const base = JSON.parse(readFileSync(join(aqui, 'legenda.json'), 'utf8'));

// Começo e fim da voz na take: janelas de 10 ms acima de -45 dB.
function fala(mp3) {
  const bruto = execFileSync('ffmpeg', ['-v', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', String(TAXA), '-'], { maxBuffer: 64 * 1024 * 1024 });
  const pcm = new Int16Array(bruto.buffer, bruto.byteOffset, Math.floor(bruto.length / 2));
  const JANELA = TAXA / 100;
  const LIMIAR = 32768 * 10 ** (-45 / 20);
  let ini = -1;
  let fim = -1;
  for (let i = 0; i + JANELA <= pcm.length; i += JANELA) {
    let soma = 0;
    for (let j = i; j < i + JANELA; j++) soma += pcm[j] * pcm[j];
    if (Math.sqrt(soma / JANELA) >= LIMIAR) {
      if (ini < 0) ini = i / TAXA;
      fim = (i + JANELA) / TAXA;
    }
  }
  return { ini, fim, duracao: pcm.length / TAXA };
}

const limpa = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%]/g, '');
const arred = (v) => Math.round(v * 1000) / 1000;

// Legenda da prévia: linha 1 espalhada pela fala da take; o resto desloca junto.
function legendaDaTake(voz) {
  const leg = structuredClone(base);
  const l1 = leg.blocos.filter((b) => b.linha === 1).flatMap((b) => b.palavras);
  // Peso de cada palavra como na estimativa do roteiro, com um respiro depois da vírgula.
  const pesos = l1.map((p) => 0.09 + 0.05 * limpa(p.tela).length);
  const respiro = l1.map((p) => (/,$/.test(p.tela) ? 0.15 : 0));
  const total = pesos.reduce((a, b) => a + b, 0) + respiro.reduce((a, b) => a + b, 0);
  const escala = (voz.fim - voz.ini) / total;
  let t = ENTRADA;
  l1.forEach((p, i) => {
    p.ini = arred(t);
    t += pesos[i] * escala;
    p.fim = arred(t);
    t += respiro[i] * escala;
  });
  const m = leg.marcas;
  const acha = (tela) => l1.find((p) => limpa(p.tela) === limpa(tela));
  const novaTres = l1.at(-1).fim + PAUSA_L2;
  const desloca = novaTres - m.tres;
  for (const b of leg.blocos) if (b.linha > 1) for (const p of b.palavras) (p.ini = arred(p.ini + desloca)), (p.fim = arred(p.fim + desloca));
  for (const k of Object.keys(m)) m[k] = arred(m[k] + desloca);
  Object.assign(m, { bateria: l1[0].ini, carregador: acha('carregador').ini, nao1: acha('não').ini, libera: acha('libera.').ini, l1Fim: l1.at(-1).fim });
  leg.duracao = m.fim;
  return leg;
}

async function trecho(tom, n, arquivo) {
  const mp3 = join(pastaTakes, `${tom.nome}-take${n}.mp3`);
  const voz = fala(mp3);
  const legenda = legendaDaTake(voz);
  const dur = legenda.marcas.tres - 0.05;
  const { browser, page } = await abrirCena({ legenda });
  const total = Math.round(dur * FPS);
  // A voz começa em 0,2 s: corta ou adia o começo da take.
  const corte = Math.max(0, voz.ini - ENTRADA);
  const atraso = Math.round(Math.max(0, ENTRADA - voz.ini) * 1000);
  const rotulo = `${tom.nome} ${tom.marca} · take ${n}`;
  const ff = spawn('ffmpeg', [
    '-v', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-i', mp3,
    '-filter_complex',
    `[0:v]drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='${rotulo}':x=40:y=60:fontsize=44:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=12,format=yuv420p[v];` +
      `[1:a]atrim=start=${corte.toFixed(3)},asetpts=PTS-STARTPTS,adelay=${atraso}|${atraso},aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=${TAXA},apad[a]`,
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-r', String(FPS),
    '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', String(TAXA), '-ac', '2',
    '-t', (total / FPS).toFixed(3),
    arquivo,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fim = new Promise((ok, erro) => ff.on('close', (c) => (c === 0 ? ok() : erro(new Error(`ffmpeg saiu com código ${c}`)))));
  for (let q = 0; q < total; q++) {
    await page.evaluate((s) => window.__ir(s), q / FPS);
    const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await browser.close();
  await fim;
  console.log(`  take ${n}: voz de ${voz.ini.toFixed(2)} a ${voz.fim.toFixed(2)} s na take (${(voz.fim - voz.ini).toFixed(2)} s de fala), "não" em ${legenda.marcas.nao1.toFixed(2)} s, trecho de ${(total / FPS).toFixed(2)} s`);
}

for (const tom of TONS) {
  console.log(`${tom.nome} ${tom.marca}`);
  const partes = [1, 2].map((n) => join(saida, `_${tom.nome}-${n}.mp4`));
  for (const [i, p] of partes.entries()) await trecho(tom, i + 1, p);
  const final = join(saida, `${tom.nome}.mp4`);
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-i', partes[0], '-i', partes[1],
    '-filter_complex', '[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]',
    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-c:a', 'libmp3lame', '-b:a', '192k', '-movflags', '+faststart', final,
  ]);
  partes.forEach((p) => rmSync(p));
  console.log(`  -> ${final}`);
}
