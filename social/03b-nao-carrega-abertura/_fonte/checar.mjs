// 03b: checagens antes e depois do render. Cada uma imprime a evidência e o resultado.
//
//   node checar.mjs           na cena e na narração (antes do render)
//     movimento   quadro de 0 s × quadro de 0,5 s, pixel a pixel: falha se forem iguais
//     voz         primeira palavra entre 0,15 e 0,25 s (no áudio e no alinhamento)
//     zona        todos os quadros a 30 fps: nenhum texto essencial fora da zona segura
//     resto       cena do 03 × cena do 03b, de 1 em 1 s do cap1 ao fim, compensando o
//                 deslocamento: pixel a pixel
//     emenda      verificacao/emenda-4s.mp3, 2 s antes e 2 s depois do ponto da emenda
//   node checar.mjs --video   nos MP4s (depois do render)
//     formato, duração, volume, voz no MP4, movimento no MP4 e o 03 × 03b quadro a quadro (SSIM)
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ALTURA, LARGURA, ZONA, aqui, foraDaZona } from './palco.mjs';

const require = createRequire(join(aqui, '..', '..', '01-apresentacao', '_fonte', 'package.json'));
const { chromium } = require('playwright-core');
const pasta03 = join(aqui, '..', '..', '03-video-nao-carrega');
const saida = join(aqui, 'verificacao');
mkdirSync(saida, { recursive: true });
const FPS = 30;
const TAXA = 48000;
const alin = JSON.parse(readFileSync(join(aqui, 'audio', 'alinhamento.json'), 'utf8'));
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

async function abrir(cena) {
  const browser = await chromium.launch({ channel: 'msedge', args: ['--allow-file-access-from-files', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA }, deviceScaleFactor: 1 });
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.goto(pathToFileURL(cena).href, { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.dataset.pronto, null, { timeout: 30000 });
  const pronto = await page.evaluate(() => document.body.dataset.pronto);
  if (pronto !== '1' || erros.length) throw new Error(`${cena}: pronto=${pronto} ${erros.join(' | ')}`);
  const info = await page.evaluate(() => ({ duracao: window.__duracao, marcas: window.__marcas }));
  return { browser, page, ...info };
}
const quadro = async (page, t, arquivo) => {
  await page.evaluate((s) => window.__ir(s), t);
  await page.screenshot({ path: arquivo, clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
  return arquivo;
};

if (!process.argv.includes('--video')) {
  const b = await abrir(join(aqui, 'cena.html'));
  console.log(`cena do 03b: ${b.duracao} s; deslocamento do cap1 em diante: ${desloca} s`);

  // Movimento.
  const q0 = pixels(await quadro(b.page, 0, join(saida, 'movimento-0s.png')));
  const q5 = pixels(await quadro(b.page, 0.5, join(saida, 'movimento-0_5s.png')));
  const nMov = diferentes(q0, q5);
  resultado('movimento entre 0 s e 0,5 s', nMov > 0, `${nMov} de ${LARGURA * ALTURA} pixels mudaram (${((100 * nMov) / (LARGURA * ALTURA)).toFixed(2)}%)`);

  // Voz: começo da voz no narracao.wav (janela de 10 ms acima de -45 dB) e primeira palavra do alinhamento.
  const bruto = execFileSync('ffmpeg', ['-v', 'error', '-i', join(aqui, 'audio', 'narracao.wav'), '-f', 's16le', '-ac', '1', '-ar', String(TAXA), '-'], { maxBuffer: 256 * 1024 * 1024 });
  const pcm = new Int16Array(bruto.buffer.slice(bruto.byteOffset, bruto.byteOffset + bruto.length));
  let inicio = -1;
  for (let i = 0; i + 480 <= pcm.length && inicio < 0; i += 48) {
    let s = 0;
    for (let j = i; j < i + 480; j++) s += pcm[j] * pcm[j];
    if (Math.sqrt(s / 480) >= 32768 * 10 ** (-45 / 20)) inicio = i / TAXA;
  }
  const primeira = alin.palavras[0];
  resultado('voz', inicio >= 0.15 && inicio <= 0.25 && primeira.ini >= 0.15 && primeira.ini <= 0.25, `no áudio, a voz começa em ${inicio.toFixed(3)} s; no alinhamento, "${primeira.texto}" em ${primeira.ini.toFixed(3)} s`);

  // Zona segura, quadro a quadro.
  const total = Math.round(b.duracao * FPS);
  const fora = new Map();
  for (let n = 0; n < total; n++) {
    await b.page.evaluate((s) => window.__ir(s), n / FPS);
    for (const f of await foraDaZona(b.page)) {
      if (!fora.has(f)) fora.set(f, []);
      fora.get(f).push((n / FPS).toFixed(2));
    }
  }
  resultado('zona segura', fora.size === 0, fora.size ? [...fora].map(([f, ts]) => `${f} em ${ts.length} quadros (${ts[0]} a ${ts.at(-1)} s)`).join(' | ') : `${total} quadros conferidos, nenhum texto essencial fora de ${JSON.stringify(ZONA)}`);

  // Resto igual: a cena do 03 (só leitura) contra a do 03b.
  const a = await abrir(join(pasta03, '_fonte', 'cena.html'));
  const tempos = [];
  for (let t = a.marcas.cap1; t <= a.duracao + 1e-9; t += 1) tempos.push(Math.round(t * 1000) / 1000);
  const linhas = [];
  let iguais = 0;
  mkdirSync(join(saida, 'resto'), { recursive: true });
  for (const t of tempos) {
    const t03b = Math.round((t + desloca) * 1000) / 1000;
    const p03 = pixels(await quadro(a.page, t, join(saida, 'resto', `03-${t.toFixed(2)}.png`)));
    const p03b = pixels(await quadro(b.page, t03b, join(saida, 'resto', `03b-${t03b.toFixed(2)}.png`)));
    const n = diferentes(p03, p03b);
    if (n === 0) iguais++;
    linhas.push(`${t.toFixed(2)}↔${t03b.toFixed(2)}: ${n}`);
  }
  resultado('resto igual ao 03 (cena)', iguais === tempos.length, `${iguais} de ${tempos.length} pares idênticos, pixel a pixel. Pixels diferentes por par: ${linhas.join(', ')}`);
  await a.browser.close();
  await b.browser.close();

  // Emenda: 4 s em volta, no volume do render (-14 LUFS, mesmo ganho para o trecho todo).
  const m = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', join(aqui, 'audio', 'narracao.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const j = JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1));
  const ganho = -14 - Number(j.input_i);
  const ponto = alin.emenda.noVideo;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', (ponto - 2).toFixed(3), '-t', '4', '-i', join(aqui, 'audio', 'narracao.wav'), '-af', `volume=${ganho.toFixed(2)}dB,aformat=channel_layouts=stereo`, '-c:a', 'libmp3lame', '-b:a', '192k', join(saida, 'emenda-4s.mp3')]);
  // Volume dos dois lados da emenda: linha 2 nova × linha 3 original.
  const lufs = (ini, fim) => {
    const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-ss', String(ini), '-t', String(fim - ini), '-i', join(aqui, 'audio', 'narracao.wav'), '-af', 'aformat=channel_layouts=stereo,loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    return Number(JSON.parse(r.slice(r.lastIndexOf('{'), r.lastIndexOf('}') + 1)).input_i);
  };
  const [f2, f3] = [alin.frases[1], alin.frases[2]];
  const l2 = lufs(f2.ini, f2.fim);
  const l3 = lufs(f3.ini, alin.frases[4].fim);
  const e = alin.emenda.loudnorm;
  resultado('volume na emenda', Math.abs(e.abertura.i - e.resto.i) <= 1 && Math.abs(l2 - l3) <= 1, `abertura ${e.abertura.i} LUFS × resto ${e.resto.i} LUFS (${Math.abs(e.abertura.i - e.resto.i).toFixed(2)} LU); linha 2 nova ${l2} × linhas 3 a 5 originais ${l3} LUFS (${Math.abs(l2 - l3).toFixed(2)} LU)`);
  console.log(`emenda em ${ponto.toFixed(3)} s; prévia de 4 s: ${join(saida, 'emenda-4s.mp3')}`);
} else {
  const v03 = join(pasta03, 'video', 'mapere-nao-carrega.mp4');
  const v03b = join(aqui, '..', 'video', 'mapere-nao-carrega-v2.mp4');
  const prev = join(aqui, '..', 'video', 'previa-para-ouvir-no-vscode.mp4');
  const info = (f) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration,size', '-of', 'json', f], { encoding: 'utf8' }));
  const i03b = info(v03b);
  const vs = i03b.streams.find((s) => s.width);
  const as = i03b.streams.find((s) => s.sample_rate);
  resultado('formato', vs.codec_name === 'h264' && vs.width === 1080 && vs.height === 1920 && vs.r_frame_rate === '30/1' && as.codec_name === 'aac', `${vs.codec_name} ${vs.width}x${vs.height} ${vs.r_frame_rate} fps, áudio ${as.codec_name} ${as.sample_rate} Hz ${as.channels} canais, ${Number(i03b.format.duration).toFixed(2)} s, ${(Number(i03b.format.size) / 1e6).toFixed(2)} MB`);
  const ip = info(prev);
  resultado('cópia para o VS Code', ip.streams.some((s) => s.codec_name === 'mp3'), `áudio ${ip.streams.filter((s) => s.sample_rate).map((s) => s.codec_name).join(', ')}, ${Number(ip.format.duration).toFixed(2)} s`);

  const m = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', v03b, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const j = JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1));
  resultado('volume do MP4', Math.abs(Number(j.input_i) + 14) <= 0.5 && Number(j.input_tp) <= -1, `${j.input_i} LUFS integrado, pico real ${j.input_tp} dBTP`);

  const s = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', v03b, '-t', '1', '-af', 'silencedetect=noise=-45dB:d=0.05', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const fimSil = (s.match(/silence_end: ([\d.]+)/) || [])[1];
  resultado('voz no MP4', fimSil && Number(fimSil) >= 0.15 && Number(fimSil) <= 0.25, `o silêncio do começo acaba em ${fimSil} s`);

  const a0 = pixels(v03b, ['-ss', '0']);
  const a5 = pixels(v03b, ['-ss', '0.5']);
  const nMov = diferentes(a0, a5);
  resultado('movimento no MP4 (0 s × 0,5 s)', nMov > 0, `${nMov} pixels diferentes (${((100 * nMov) / (LARGURA * ALTURA)).toFixed(2)}%)`);

  // 03 × 03b, quadro a quadro, de 1 em 1 s do cap1 ao fim. A 30 fps o deslocamento vira
  // um número inteiro de quadros, então os quadros comparados são exatamente os mesmos instantes.
  const leg03 = JSON.parse(readFileSync(join(pasta03, '_fonte', 'legenda.json'), 'utf8'));
  const deslocaQ = Math.round(desloca * FPS);
  const q0 = Math.ceil(leg03.marcas.cap1 * FPS - 1e-6);
  const qFim = Math.floor(leg03.duracao * FPS) - 1;
  const pares = [];
  for (let q = q0; q <= qFim; q += FPS) pares.push(q);
  const sel = (lista) => lista.map((q) => `eq(n\\,${q})`).join('+');
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', v03, '-i', v03b, '-filter_complex', `[0:v]select='${sel(pares)}',setpts=N/TB[a];[1:v]select='${sel(pares.map((q) => q + deslocaQ))}',setpts=N/TB[b];[a][b]ssim=stats_file=-`, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const ssims = [...r.stdout.matchAll(/All:([\d.]+)/g)].map((x) => Number(x[1]));
  const minimo = Math.min(...ssims);
  writeFileSync(join(saida, 'resto-ssim.txt'), pares.map((q, k) => `${(q / FPS).toFixed(3)} s no 03 × ${((q + deslocaQ) / FPS).toFixed(3)} s no 03b: SSIM ${ssims[k]}`).join('\n') + '\n');
  resultado('resto igual ao 03 (MP4)', ssims.length === pares.length && minimo >= 0.99, `${ssims.length} pares (quadro ${q0} do 03 × ${q0 + deslocaQ} do 03b, e de 30 em 30), SSIM mínimo ${minimo.toFixed(4)}, médio ${(ssims.reduce((x, y) => x + y, 0) / ssims.length).toFixed(4)}; lista em verificacao/resto-ssim.txt`);
}

console.log(falhas.length ? `\n${falhas.length} checagem(ns) falharam: ${falhas.join(', ')}` : '\ntodas as checagens passaram');
process.exit(falhas.length ? 1 : 0);
