// 04b: checagens antes e depois do render. Cada uma imprime a evidência e o resultado.
// Veio do checar.mjs do 03b, adaptado ao motor (_motor/palco.mjs).
//
//   node checar.mjs           na cena e na narração (antes do render)
//     início      cena do 04 × cena do 04b, de 0,1 em 0,1 s de 0 s até antes da linha 2: pixel a pixel
//     resto       cena do 04 × cena do 04b, de 0,5 em 0,5 s do cap1 ao fim, compensando o
//                 deslocamento: pixel a pixel
//     zona        todos os quadros a 30 fps: nenhum texto essencial fora da zona segura
//     volume      linha 2 nova × linha 2 do 04, e × as linhas dos dois lados
//     emendas     verificacao/emenda-a-4s.mp3 e emenda-b-4s.mp3, no volume do render
//   node checar.mjs --video   nos MP4s (depois do render)
//     formato, volume, cópia para o VS Code e o 04 × 04b quadro a quadro (SSIM), no começo e no resto
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALTURA, LARGURA, ZONA, abrirCena, foraDaZona } from '../../_motor/palco.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const video04b = join(aqui, '..');
const video04 = join(aqui, '..', '..', '04-video-4-status');
const saida = join(aqui, 'verificacao');
mkdirSync(saida, { recursive: true });
const FPS = 30;
const alin = JSON.parse(readFileSync(join(aqui, 'audio', 'alinhamento.json'), 'utf8'));
const leg04 = JSON.parse(readFileSync(join(video04, '_fonte', 'legenda.json'), 'utf8'));
const leg04b = JSON.parse(readFileSync(join(aqui, 'legenda.json'), 'utf8'));
const desloca = alin.emenda.deslocamento;
const falhas = [];
const resultado = (nome, ok, detalhe) => {
  console.log(`${ok ? 'OK    ' : 'FALHOU'} ${nome}: ${detalhe}`);
  if (!ok) falhas.push(nome);
};

// Pixels RGB de um PNG ou de um quadro de vídeo, pelo ffmpeg.
const pixels = (entrada, extra = []) => execFileSync('ffmpeg', ['-v', 'error', ...extra, '-i', entrada, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 64 * 1024 * 1024 });
const diferentes = (a, b) => {
  let n = 0;
  for (let i = 0; i < a.length; i += 3) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++;
  return n;
};
const quadro = async (page, t, arquivo) => {
  await page.evaluate((s) => window.__ir(s), t);
  await page.screenshot({ path: arquivo, clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
  return arquivo;
};
const r3 = (v) => Math.round(v * 1000) / 1000;

// Compara pares de instantes (t no 04, t no 04b), pixel a pixel.
async function comparaCenas(a, b, pares, sub) {
  mkdirSync(join(saida, sub), { recursive: true });
  const linhas = [];
  let iguais = 0;
  for (const [t04, t04b] of pares) {
    const p04 = pixels(await quadro(a.page, t04, join(saida, sub, `04-${t04.toFixed(2)}.png`)));
    const p04b = pixels(await quadro(b.page, t04b, join(saida, sub, `04b-${t04b.toFixed(2)}.png`)));
    const n = diferentes(p04, p04b);
    if (n === 0) iguais++;
    linhas.push(`${t04.toFixed(2)}↔${t04b.toFixed(2)}: ${n}`);
  }
  return { iguais, linhas };
}

if (!process.argv.includes('--video')) {
  const a = await abrirCena(video04);
  const b = await abrirCena(video04b);
  console.log(`cena do 04: ${a.duracao} s; cena do 04b: ${b.duracao} s; deslocamento do cap1 em diante: ${desloca} s`);

  // Início igual: até antes da linha 2, que começa no mesmo instante nos dois.
  resultado('linha 2 começa no mesmo instante', Math.abs(a.marcas.L2 - b.marcas.L2) < 1e-6, `L2 em ${a.marcas.L2} s no 04 e ${b.marcas.L2} s no 04b`);
  const inicio = [];
  for (let t = 0; t < b.marcas.L2 - 1e-6; t += 0.1) inicio.push([r3(t), r3(t)]);
  const ini = await comparaCenas(a, b, inicio, 'inicio');
  resultado('início igual ao 04 (cena)', ini.iguais === inicio.length, `${ini.iguais} de ${inicio.length} pares idênticos, de 0 a ${inicio.at(-1)[0]} s`);

  // Resto igual: do cap1 ao fim, de 0,5 em 0,5 s, compensando o deslocamento.
  const resto = [];
  for (let t = a.marcas.cap1; t <= a.duracao + 1e-9; t += 0.5) resto.push([r3(t), r3(t + desloca)]);
  const res = await comparaCenas(a, b, resto, 'resto');
  resultado('resto igual ao 04 (cena)', res.iguais === resto.length, `${res.iguais} de ${resto.length} pares idênticos, pixel a pixel. Pixels diferentes por par: ${res.linhas.join(', ')}`);

  // Zona segura, quadro a quadro. O que sai da zona no 04b e sai igual no 04, no mesmo
  // instante deslocado, veio do 04 (o resto é o 04 pixel a pixel) e só é listado.
  const total = Math.round(b.duracao * FPS);
  const novos = new Map();
  const herdados = new Map();
  const anota = (mapa, f, t) => {
    if (!mapa.has(f)) mapa.set(f, []);
    mapa.get(f).push(t.toFixed(2));
  };
  for (let n = 0; n < total; n++) {
    const t = n / FPS;
    await b.page.evaluate((s) => window.__ir(s), t);
    const fora = await foraDaZona(b.page);
    if (!fora.length) continue;
    const t04 = t >= b.marcas.cap1 - 1e-6 ? t - desloca : t < b.marcas.L2 ? t : null;
    let fora04 = [];
    if (t04 !== null) {
      await a.page.evaluate((s) => window.__ir(s), t04);
      fora04 = await foraDaZona(a.page);
    }
    for (const f of fora) anota(fora04.includes(f) ? herdados : novos, f, t);
  }
  const lista = (mapa) => [...mapa].map(([f, ts]) => `${f} em ${ts.length} quadros (${ts[0]} a ${ts.at(-1)} s)`).join(' | ');
  resultado('zona segura', novos.size === 0, novos.size ? `novo no 04b: ${lista(novos)}` : `${total} quadros conferidos, nada novo fora de ${JSON.stringify(ZONA)}`);
  if (herdados.size) console.log(`       já era assim no 04 (mesmo quadro, mesma medida): ${lista(herdados)}`);
  await a.browser.close();
  await b.browser.close();

  // Volume: a linha 2 nova contra a do 04 e contra as linhas vizinhas, já na faixa montada.
  // A diferença para as vizinhas tem que ser a mesma do 04 (lá a linha 2 já era mais baixa).
  const wav = join(aqui, 'audio', 'narracao.wav');
  const wav04 = join(aqui, 'audio', '04-original', 'narracao.wav');
  const alin04 = JSON.parse(readFileSync(join(aqui, 'audio', '04-original', 'alinhamento.json'), 'utf8'));
  const lufs = (arquivo, ini, fim) => {
    const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-ss', String(ini), '-t', String(fim - ini), '-i', arquivo, '-af', 'aformat=channel_layouts=stereo,loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    return Number(JSON.parse(r.slice(r.lastIndexOf('{'), r.lastIndexOf('}') + 1)).input_i);
  };
  const linhas = (arquivo, fr, ini2) => ({ l1: lufs(arquivo, fr[0].ini, fr[0].fim), l2: lufs(arquivo, ini2, fr[2].fim), l3: lufs(arquivo, fr[3].ini, fr[4].fim) });
  const n = linhas(wav, alin.frases, alin.frases[1].ini);
  const o = linhas(wav04, alin04.frases, alin04.palavras.find((p) => p.texto.toLowerCase().startsWith('cada')).ini);
  const e = alin.emenda.loudnorm;
  const d = (x) => (x >= 0 ? '+' : '') + x.toFixed(2);
  resultado(
    'volume da linha 2',
    Math.abs(e.linha2.i - e.linha2No04.i) <= 1 && Math.abs(n.l2 - n.l1 - (o.l2 - o.l1)) <= 1 && Math.abs(n.l2 - n.l3 - (o.l2 - o.l3)) <= 1,
    `linha 2 nova ${e.linha2.i} × linha 2 do 04 ${e.linha2No04.i} LUFS; linha 2 menos linha 1: ${d(n.l2 - n.l1)} LU no 04b, ${d(o.l2 - o.l1)} no 04; linha 2 menos linha 3: ${d(n.l2 - n.l3)} LU no 04b, ${d(o.l2 - o.l3)} no 04`,
  );

  // Emendas: 4 s em volta de cada uma, no volume do render (-14 LUFS, mesmo ganho para tudo).
  const m = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', wav, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const ganho = -14 - Number(JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1)).input_i);
  for (const [nome, ponto] of [['a', alin.emenda.a.noVideo], ['b', alin.emenda.b.noVideo]]) {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', Math.max(0, ponto - 2).toFixed(3), '-t', '4', '-i', wav, '-af', `volume=${ganho.toFixed(2)}dB,aformat=channel_layouts=stereo`, '-c:a', 'libmp3lame', '-b:a', '192k', join(saida, `emenda-${nome}-4s.mp3`)]);
    console.log(`emenda ${nome} em ${ponto.toFixed(3)} s; 4 s para ouvir: ${join(saida, `emenda-${nome}-4s.mp3`)}`);
  }
} else {
  const v04 = join(video04, 'video', 'mapere-4-status.mp4');
  const v04b = join(video04b, 'video', 'mapere-4-status-v2.mp4');
  const prev = join(video04b, 'video', 'previa-para-ouvir-no-vscode.mp4');
  const info = (f) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration,size', '-of', 'json', f], { encoding: 'utf8' }));
  const i04b = info(v04b);
  const vs = i04b.streams.find((s) => s.width);
  const as = i04b.streams.find((s) => s.sample_rate);
  resultado('formato', vs.codec_name === 'h264' && vs.width === 1080 && vs.height === 1920 && vs.r_frame_rate === '30/1' && as.codec_name === 'aac', `${vs.codec_name} ${vs.width}x${vs.height} ${vs.r_frame_rate} fps, áudio ${as.codec_name} ${as.sample_rate} Hz ${as.channels} canais, ${Number(i04b.format.duration).toFixed(2)} s, ${(Number(i04b.format.size) / 1e6).toFixed(2)} MB`);
  const ip = info(prev);
  resultado('cópia para o VS Code', ip.streams.some((s) => s.codec_name === 'mp3'), `áudio ${ip.streams.filter((s) => s.sample_rate).map((s) => s.codec_name).join(', ')}, ${Number(ip.format.duration).toFixed(2)} s`);

  const m = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', v04b, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const j = JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1));
  resultado('volume do MP4', Math.abs(Number(j.input_i) + 14) <= 0.5 && Number(j.input_tp) <= -1, `${j.input_i} LUFS integrado, pico real ${j.input_tp} dBTP`);

  // 04 × 04b, quadro a quadro. A 30 fps o deslocamento vira um número inteiro de quadros.
  const ssim = (pares04, pares04b) => {
    const sel = (lista) => lista.map((q) => `eq(n\\,${q})`).join('+');
    const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', v04, '-i', v04b, '-filter_complex', `[0:v]select='${sel(pares04)}',setpts=N/TB[a];[1:v]select='${sel(pares04b)}',setpts=N/TB[b];[a][b]ssim=stats_file=-`, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return [...r.stdout.matchAll(/All:([\d.]+)/g)].map((x) => Number(x[1]));
  };
  const deslocaQ = Math.round(desloca * FPS);
  const ini = [];
  for (let q = 0; q < Math.floor(leg04b.marcas.L2 * FPS); q += 3) ini.push(q);
  const sIni = ssim(ini, ini);
  const resto = [];
  for (let q = Math.ceil(leg04.marcas.cap1 * FPS - 1e-6); q <= Math.floor(leg04.duracao * FPS) - 1; q += 15) resto.push(q);
  const sResto = ssim(resto, resto.map((q) => q + deslocaQ));
  const resumo = (s) => `SSIM mínimo ${Math.min(...s).toFixed(4)}, médio ${(s.reduce((x, y) => x + y, 0) / s.length).toFixed(4)}`;
  writeFileSync(
    join(saida, 'ssim.txt'),
    [...ini.map((q, k) => `início: quadro ${q} × ${q}: SSIM ${sIni[k]}`), ...resto.map((q, k) => `resto: quadro ${q} do 04 × ${q + deslocaQ} do 04b: SSIM ${sResto[k]}`)].join('\n') + '\n',
  );
  resultado('início igual ao 04 (MP4)', sIni.length === ini.length && Math.min(...sIni) >= 0.99, `${sIni.length} pares de 0 a ${(ini.at(-1) / FPS).toFixed(2)} s, ${resumo(sIni)}`);
  resultado('resto igual ao 04 (MP4)', sResto.length === resto.length && Math.min(...sResto) >= 0.99, `${sResto.length} pares (quadro ${resto[0]} do 04 × ${resto[0] + deslocaQ} do 04b, e de 15 em 15), ${resumo(sResto)}; lista em verificacao/ssim.txt`);
}

console.log(falhas.length ? `\n${falhas.length} checagem(ns) falharam: ${falhas.join(', ')}` : '\ntodas as checagens passaram');
process.exit(falhas.length ? 1 : 0);
