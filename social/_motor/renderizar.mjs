// Renderiza o vídeo final: captura a cena quadro a quadro e junta com a narração.
// Cada quadro vem de window.__ir(t), então o quadro N só depende de N.
//
// Veio do vídeo 03. A saída padrão é video/<"saida" do roteiro.json>.
// Uso:
//   node _motor/renderizar.mjs 04 [--sem-previa] [--crf 19] [--saida x.mp4]
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { ALTURA, LARGURA, abrirCena, lerRoteiro, pastaDoVideo } from './palco.mjs';

const video = pastaDoVideo(process.argv[2]);
const roteiro = lerRoteiro(video);

const FPS = 30;
// Volume: perto de -14 LUFS, com pico real de até -1,5 dB.
const VOLUME = 'I=-14:TP=-1.5:LRA=11';

const args = process.argv.slice(2);
// CRF 19 com preset veryslow e tune animation (próprio para desenho chapado): o MP4
// fica abaixo de ~7,4 MB, o que o conector do Google Drive aceita (10 MB depois de
// convertido em base64), sem diferença visível. TikTok e Instagram recomprimem de qualquer forma.
const iCrf = args.indexOf('--crf');
const CRF = iCrf >= 0 ? args[iCrf + 1] : '19';
const semPrevia = args.includes('--sem-previa');
const iSaida = args.indexOf('--saida');
const saida = resolve(iSaida >= 0 ? args[iSaida + 1] : join(video, 'video', roteiro.saida));
const narracao = join(video, '_fonte', 'audio', 'narracao.wav');
if (!existsSync(narracao)) {
  console.error('Falta audio/narracao.wav. Rode antes: node _motor/narracao.mjs <vídeo>');
  process.exit(1);
}
mkdirSync(dirname(saida), { recursive: true });

// 1. Mede o volume da narração (primeira passada do loudnorm).
const medida = spawnSyncTexto(['-hide_banner', '-nostats', '-i', narracao, '-af', `aformat=channel_layouts=stereo,loudnorm=${VOLUME}:print_format=json`, '-f', 'null', '-']);
const m = JSON.parse(medida.slice(medida.lastIndexOf('{'), medida.lastIndexOf('}') + 1));
const filtroAudio =
  `aformat=channel_layouts=stereo,` +
  `loudnorm=${VOLUME}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,` +
  `aresample=48000`;
console.log(`narração: ${m.input_i} LUFS, pico real ${m.input_tp} dB`);

// 2. Abre a cena e manda cada quadro para o ffmpeg.
const { browser, page, duracao } = await abrirCena(video);
const total = Math.round(duracao * FPS);
const ffmpeg = spawn(
  'ffmpeg',
  [
    '-v', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-i', narracao,
    '-map', '0:v', '-map', '1:a',
    // Cores em BT.709, que é o que os players assumem para vídeo em HD.
    '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'veryslow', '-tune', 'animation', '-crf', CRF, '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-af', filtroAudio,
    '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2',
    '-t', (total / FPS).toFixed(3),
    '-movflags', '+faststart',
    saida,
  ],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);
const fimDoFfmpeg = new Promise((ok, erro) => {
  ffmpeg.on('error', erro);
  ffmpeg.on('close', (codigo) => (codigo === 0 ? ok() : erro(new Error(`ffmpeg saiu com código ${codigo}`))));
});

const comeco = Date.now();
for (let n = 0; n < total; n++) {
  await page.evaluate((s) => window.__ir(s), n / FPS);
  const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
  if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once('drain', r));
  if (n % 90 === 0 || n === total - 1) console.log(`quadro ${n + 1} de ${total}`);
}
ffmpeg.stdin.end();
await browser.close();
await fimDoFfmpeg;
console.log(`${saida}: ${total} quadros, ${(total / FPS).toFixed(2)} s, em ${((Date.now() - comeco) / 1000).toFixed(0)} s`);

// Cópia só para conferir no VS Code, que não toca áudio AAC: mesmo vídeo, áudio em MP3.
const previa = join(dirname(saida), 'previa-para-ouvir-no-vscode.mp4');
if (semPrevia) process.exit(0);
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', saida, '-map', '0:v', '-map', '0:a', '-c:v', 'copy', '-c:a', 'libmp3lame', '-b:a', '192k', '-movflags', '+faststart', previa], { encoding: 'utf8' });
if (r.status !== 0) throw new Error(`ffmpeg falhou na cópia em MP3:
${r.stderr}`);
console.log(`${previa}: cópia com áudio MP3, só para ouvir no VS Code`);

// O loudnorm escreve a medida no stderr.
function spawnSyncTexto(argumentos) {
  const r = spawnSync('ffmpeg', argumentos, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg falhou ao medir o volume:\n${r.stderr}`);
  return r.stderr;
}
