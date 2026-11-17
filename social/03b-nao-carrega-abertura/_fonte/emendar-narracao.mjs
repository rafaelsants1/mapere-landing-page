// 03b: monta audio/narracao.wav, audio/narracao.mp3 e audio/alinhamento.json emendando a
// abertura nova na narração original do vídeo 03.
//
//   0,2 s de silêncio
//   + a take nova (linha 1 nova e linha 2 original), do começo da voz até o fim de "e o que fazer."
//   + silêncio até a emenda, que cai no meio do silêncio digital que montar-narracao.mjs pôs
//     na pausa de 0,6 s antes de "Um:"
//   + a narração original do 03 dali até o fim, amostra por amostra, sem mudança.
//
// O deslocamento do resto (cap1 em diante) é arredondado para um múltiplo de 0,1 s: 3 quadros
// a 30 fps e um número exato de milissegundos. Assim cada quadro do 03b depois do cap1 cai no
// mesmo instante da cena do 03, e as marcas da legenda andam sem erro de arredondamento.
// A pausa entre "fazer." e "Um:" fica entre 0,55 e 0,65 s (no 03 era 0,6 s).
//
// Volume (loudnorm, I integrado), com um ganho por frase da take nova, trocado no meio do
// silêncio entre as duas frases, onde não se ouve:
//   linha 2 nova = linhas 3 a 5 originais, que vêm logo depois da emenda;
//   linha 1 nova = linha 1 do 03, baixando de 0,1 em 0,1 dB se a abertura inteira passar de
//   0,9 LU acima do resto. A take [urgent] sai bem mais alta que a linha 2 [conversational].
// A parte original não recebe ganho nenhum.
//
// Uso: node emendar-narracao.mjs [a|b]     (take da abertura; sem argumento usa a "a")
// Lê:  audio/abertura-take-X.mp3, audio/abertura-take-X.palavras.json,
//      audio/03-original/narracao.wav e audio/03-original/alinhamento.json (cópias congeladas do 03)
// montar-narracao.mjs continua igual e, se rodar, refaz a narração do 03, não a do 03b.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const pasta = join(aqui, 'audio');
const take = (process.argv[2] || 'a').toLowerCase();
const TAXA = 48000;
const ENTRADA = 0.2; // a voz nova começa em 0,2 s
const PRE = 0.03; // um pouco antes da voz, para não cortar o ataque da primeira sílaba
const PAUSA = 0.6; // pausa do 03 entre "fazer." e "Um:"
const PASSO_DESLOCA = 0.1;
const amostra = (s) => Math.round(s * TAXA);
const arred = (v) => Math.round(v * 1000) / 1000;
const limpa = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

const decodifica = (arquivo) => {
  const bruto = execFileSync('ffmpeg', ['-v', 'error', '-i', arquivo, '-f', 's16le', '-ac', '1', '-ar', String(TAXA), '-'], { maxBuffer: 256 * 1024 * 1024 });
  return new Int16Array(bruto.buffer.slice(bruto.byteOffset, bruto.byteOffset + bruto.length));
};

// Silêncios com o mesmo critério de montar-narracao.mjs: abaixo de -45 dB por 0,08 s ou mais.
function silencios(pcm) {
  const JANELA = Math.round(TAXA * 0.01);
  const PASSO = Math.round(TAXA * 0.005);
  const LIMIAR = 32768 * 10 ** (-45 / 20);
  const dur = pcm.length / TAXA;
  const lista = [];
  let inicio = -1;
  const n = Math.floor((pcm.length - JANELA) / PASSO) + 1;
  for (let i = 0; i <= n; i++) {
    let quieto = false;
    if (i < n) {
      let soma = 0;
      for (let j = i * PASSO; j < i * PASSO + JANELA; j++) soma += pcm[j] * pcm[j];
      quieto = Math.sqrt(soma / JANELA) < LIMIAR;
    }
    if (quieto && inicio < 0) inicio = i;
    if (!quieto && inicio >= 0) {
      const ini = inicio === 0 ? 0 : (inicio * PASSO + JANELA / 2) / TAXA;
      const fim = i === n ? dur : ((i - 1) * PASSO + JANELA / 2) / TAXA;
      if (fim - ini >= 0.08 || inicio === 0 || i === n) lista.push({ ini, fim });
      inicio = -1;
    }
  }
  return lista;
}

// Começo e fim da voz: primeira e última janela de 10 ms acima de -45 dB.
function bordasDaVoz(pcm) {
  const J = TAXA / 100;
  const LIMIAR = 32768 * 10 ** (-45 / 20);
  let ini = -1;
  let fim = -1;
  for (let i = 0; i + J <= pcm.length; i += J) {
    let soma = 0;
    for (let j = i; j < i + J; j++) soma += pcm[j] * pcm[j];
    if (Math.sqrt(soma / J) >= LIMIAR) {
      if (ini < 0) ini = i / TAXA;
      fim = (i + J) / TAXA;
    }
  }
  return { ini, fim };
}

// Volume integrado (LUFS) e pico real de um trecho, pela primeira passada do loudnorm.
function mede(pcm, nome) {
  const tmp = join(pasta, `_mede-${nome}.wav`);
  escreveWav(tmp, pcm);
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', tmp, '-af', 'aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
  rmSync(tmp);
  const j = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{'), r.stderr.lastIndexOf('}') + 1));
  return { i: Number(j.input_i), tp: Number(j.input_tp), lra: Number(j.input_lra) };
}

function escreveWav(arquivo, dados) {
  const cab = Buffer.alloc(44);
  cab.write('RIFF', 0);
  cab.writeUInt32LE(36 + dados.byteLength, 4);
  cab.write('WAVEfmt ', 8);
  cab.writeUInt32LE(16, 16);
  cab.writeUInt16LE(1, 20);
  cab.writeUInt16LE(1, 22);
  cab.writeUInt32LE(TAXA, 24);
  cab.writeUInt32LE(TAXA * 2, 28);
  cab.writeUInt16LE(2, 32);
  cab.writeUInt16LE(16, 34);
  cab.write('data', 36);
  cab.writeUInt32LE(dados.byteLength, 40);
  writeFileSync(arquivo, Buffer.concat([cab, Buffer.from(dados.buffer, dados.byteOffset, dados.byteLength)]));
}

// ---------- 1. A take nova ----------
const nova = decodifica(join(pasta, `abertura-take-${take}.mp3`));
const durNova = nova.length / TAXA;
const silNova = silencios(nova);
const voz = bordasDaVoz(nova);
const palavrasNova = JSON.parse(readFileSync(join(pasta, `abertura-take-${take}.palavras.json`), 'utf8'))
  .words.filter((w) => w.type === 'word' && !/^\[.*\]$/.test(w.text.trim()))
  .map((w) => ({ texto: w.text, ini: w.start, fim: Math.min(w.end, durNova) }));
const frasesNova = [[]];
for (const p of palavrasNova) {
  frasesNova.at(-1).push(p);
  if (/[.?!]['"”’]?$/.test(p.texto)) frasesNova.push([]);
}
if (!frasesNova.at(-1).length) frasesNova.pop();
if (frasesNova.length !== 2 || limpa(frasesNova[0].at(-1).texto) !== 'libera' || limpa(frasesNova[1].at(-1).texto) !== 'fazer') {
  console.error(`A take ${take} devia ter 2 frases, terminando em "libera." e "fazer.". Veio: ${frasesNova.map((f) => f.map((p) => p.texto).join(' ')).join(' | ')}`);
  process.exit(1);
}
// Troca de frase: o silêncio mais perto do meio entre "libera." e "Três".
const [l1, l2] = frasesNova;
const troca = (l1.at(-1).fim + l2[0].ini) / 2;
const candidatos = silNova.filter((s) => s.ini > 0 && s.fim < durNova && (s.ini + s.fim) / 2 > l1.at(-1).ini && (s.ini + s.fim) / 2 < l2[0].fim + 0.3);
if (!candidatos.length) {
  console.error('Não achei o silêncio entre "libera." e "Três".');
  process.exit(1);
}
const s12 = candidatos.reduce((a, b) => (Math.abs((b.ini + b.fim) / 2 - troca) < Math.abs((a.ini + a.fim) / 2 - troca) ? b : a));
l1[0].ini = voz.ini;
l1.at(-1).fim = s12.ini;
l2[0].ini = s12.fim;
l2[0].fim = Math.max(l2[0].fim, s12.fim + 0.06);
// Fim de "fazer.": onde começa o silêncio final da take.
const silFinal = silNova.at(-1);
const fimFazer = silFinal.fim >= durNova - 0.001 && silFinal.ini > l2.at(-1).ini ? silFinal.ini : voz.fim;
l2.at(-1).fim = fimFazer;

// ---------- 2. A narração original do 03 e o ponto da emenda ----------
const orig = decodifica(join(pasta, '03-original', 'narracao.wav'));
const alin03 = JSON.parse(readFileSync(join(pasta, '03-original', 'alinhamento.json'), 'utf8'));
const l2Fim03 = alin03.frases[1].fim; // fim de "fazer." no 03 (6,29 s)
const cap103 = alin03.frases[2].ini; // "Um:" no 03 (6,89 s)
if (!/^Um:/.test(alin03.frases[2].texto)) {
  console.error(`A frase 3 do 03 devia começar em "Um:" e começa em "${alin03.frases[2].texto}".`);
  process.exit(1);
}
// Maior trecho de zeros exatos dentro da pausa: o silêncio que montar-narracao.mjs inseriu.
let melhor = { ini: 0, fim: 0 };
let corrida = -1;
for (let k = amostra(l2Fim03); k <= amostra(cap103); k++) {
  if (orig[k] === 0 && k < amostra(cap103)) {
    if (corrida < 0) corrida = k;
  } else if (corrida >= 0) {
    if (k - corrida > melhor.fim - melhor.ini) melhor = { ini: corrida, fim: k };
    corrida = -1;
  }
}
if (melhor.fim - melhor.ini < amostra(0.05)) {
  console.error('Não achei silêncio digital na pausa antes de "Um:" no 03.');
  process.exit(1);
}
const emenda03 = Math.round((melhor.ini + melhor.fim) / 2); // amostra do 03 onde a emenda cai

// ---------- 3. Deslocamento e montagem ----------
const iniTrecho = Math.max(0, voz.ini - PRE); // na take nova
const desloNova = ENTRADA - voz.ini; // tempo na take → tempo no 03b
const l2FimNovo = fimFazer + desloNova;
const desloca = Math.round((l2FimNovo + PAUSA - cap103) / PASSO_DESLOCA) * PASSO_DESLOCA;
const pausa = cap103 + desloca - l2FimNovo;
if (pausa < 0.55 - 1e-9 || pausa > 0.65 + 1e-9) {
  console.error(`A pausa antes de "Um:" ficaria com ${pausa.toFixed(3)} s.`);
  process.exit(1);
}
const deslocaAmostras = Math.round(desloca * TAXA);
const emendaNova = emenda03 + deslocaAmostras; // a mesma amostra, no 03b
// A take nova vai até o fim de "fazer." mais o começo do silêncio dela, sem passar da emenda.
const folga = 0.01;
const fimTrechoTake = Math.min(durNova, fimFazer + 0.2, (emendaNova / TAXA) - desloNova - folga);
const trechoNova = Float64Array.from(nova.subarray(amostra(iniTrecho), amostra(fimTrechoTake)));
// Rampa de 10 ms no fim do trecho da take (fica no silêncio, abaixo de -45 dB).
const rampa = Math.min(amostra(0.01), trechoNova.length);
for (let k = 0; k < rampa; k++) trechoNova[trechoNova.length - 1 - k] *= k / rampa;

// Volume: um ganho por frase da take nova (ver o cabeçalho).
const paraInt16 = (f) => Int16Array.from(f, (v) => Math.max(-32768, Math.min(32767, Math.round(v))));
const corteFrases = amostra((s12.ini + s12.fim) / 2 - iniTrecho); // no trecho, no meio do silêncio entre as frases
const parteOriginal = orig.subarray(emenda03);
const v03 = {
  linha1: mede(orig.subarray(amostra(alin03.frases[0].ini), amostra(alin03.frases[0].fim)), 'l1-03'),
  continua: mede(orig.subarray(amostra(alin03.frases[2].ini), amostra(alin03.frases[4].fim)), 'l3a5-03'),
  resto: mede(parteOriginal, 'resto-03'),
};
const vTake = {
  linha1: mede(paraInt16(trechoNova.subarray(0, corteFrases)), 'l1-take'),
  linha2: mede(paraInt16(trechoNova.subarray(corteFrases)), 'l2-take'),
};
const ganho2 = v03.continua.i - vTake.linha2.i;
let ganho1 = v03.linha1.i - vTake.linha1.i;

const inicioTrechoNoVideo = amostra(ENTRADA - (voz.ini - iniTrecho));
if (inicioTrechoNoVideo + trechoNova.length > emendaNova) {
  console.error('O trecho da take nova invade a emenda.');
  process.exit(1);
}
const total = emendaNova + parteOriginal.length;
let saida;
let vAbertura;
for (let volta = 0; ; volta++) {
  const g1 = 10 ** (ganho1 / 20);
  const g2 = 10 ** (ganho2 / 20);
  const ajustada = new Int16Array(trechoNova.length);
  for (let k = 0; k < trechoNova.length; k++) {
    const v = Math.round(trechoNova[k] * (k < corteFrases ? g1 : g2));
    if (Math.abs(v) > 32767) {
      console.error(`Os ganhos de ${ganho1.toFixed(2)} e ${ganho2.toFixed(2)} dB fazem a abertura estourar. Pare e revise.`);
      process.exit(1);
    }
    ajustada[k] = v;
  }
  saida = new Int16Array(total);
  saida.set(ajustada, inicioTrechoNoVideo);
  saida.set(parteOriginal, emendaNova);
  vAbertura = mede(saida.subarray(0, emendaNova), 'abertura');
  if (vAbertura.i - v03.resto.i <= 0.9 || volta > 60) break;
  ganho1 -= 0.1;
}
escreveWav(join(pasta, 'narracao.wav'), saida);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(pasta, 'narracao.wav'), '-c:a', 'libmp3lame', '-b:a', '192k', join(pasta, 'narracao.mp3')]);

// Conferências de volume, já na faixa montada.
const vResto = mede(saida.subarray(emendaNova), 'resto');
const noVideo = (s) => amostra(s + desloNova);
const vLinha1 = mede(saida.subarray(noVideo(l1[0].ini), noVideo(l1.at(-1).fim)), 'l1-03b');
const vLinha2 = mede(saida.subarray(noVideo(l2[0].ini), noVideo(l2.at(-1).fim)), 'l2-03b');
const iguais = saida.subarray(emendaNova).every((v, k) => v === orig[emenda03 + k]);

// ---------- 4. Alinhamento ----------
const frases = [
  ...[l1, l2].map((f, k) => ({
    texto: f.map((p) => p.texto).join(' '),
    ini: arred(f[0].ini + desloNova),
    fim: arred(f.at(-1).fim + desloNova),
    naTake: [arred(f[0].ini), arred(f.at(-1).fim)],
    pausaDepois: k === 0 ? arred(s12.fim - s12.ini) : arred(pausa),
    pausaNaTake: k === 0 ? arred(s12.fim - s12.ini) : null,
    origem: `abertura-take-${take}`,
  })),
  ...alin03.frases.slice(2).map((f) => ({ ...f, ini: arred(f.ini + desloca), fim: arred(f.fim + desloca), origem: 'narração do 03' })),
];
const palavras = [
  ...[l1, l2].flatMap((f) => f.map((p) => ({ texto: p.texto, ini: arred(p.ini + desloNova), fim: arred(p.fim + desloNova) }))),
  ...alin03.palavras.filter((p) => p.ini >= cap103 - 1e-6).map((p) => ({ texto: p.texto, ini: arred(p.ini + desloca), fim: arred(p.fim + desloca) })),
];
for (let k = 1; k < palavras.length; k++) {
  if (palavras[k].ini < palavras[k - 1].ini) {
    console.error(`Palavras fora de ordem em "${palavras[k].texto}".`);
    process.exit(1);
  }
}
const alinhamento = {
  origem: `03b: abertura-take-${take}.mp3 (linhas 1 e 2) emendada na narração do 03 (03-original/narracao.wav) por emendar-narracao.mjs`,
  take,
  duracao: arred(total / TAXA),
  fala: { ini: arred(voz.ini + desloNova), fim: arred(alin03.fala.fim + desloca) },
  emenda: {
    noVideo: arred(emendaNova / TAXA),
    no03: arred(emenda03 / TAXA),
    deslocamento: arred(desloca),
    pausaAntesDeUm: arred(pausa),
    ganhoDb: { linha1: Math.round(ganho1 * 100) / 100, linha2: Math.round(ganho2 * 100) / 100 },
    loudnorm: { abertura: vAbertura, resto: vResto, linha1: vLinha1, linha2: vLinha2, linha1No03: v03.linha1, linhas3a5No03: v03.continua },
  },
  frases,
  palavras,
};
writeFileSync(join(pasta, 'alinhamento.json'), JSON.stringify(alinhamento, null, 2) + '\n');

// ---------- 5. Relatório ----------
console.log(`take ${take}: ${durNova.toFixed(2)} s, voz de ${voz.ini.toFixed(3)} a ${voz.fim.toFixed(3)} s; troca de frase no silêncio ${s12.ini.toFixed(3)}-${s12.fim.toFixed(3)} s`);
for (const f of frases.slice(0, 3)) console.log(`  ${f.ini.toFixed(3).padStart(6)} - ${f.fim.toFixed(3).padStart(6)}  ${f.texto}`);
console.log(`  ... ${frases.length} frases, ${palavras.length} palavras`);
console.log(`primeira palavra em ${(voz.ini + desloNova).toFixed(3)} s`);
console.log(`emenda: ${(emendaNova / TAXA).toFixed(3)} s no 03b = ${(emenda03 / TAXA).toFixed(3)} s no 03 (silêncio digital de ${(melhor.ini / TAXA).toFixed(3)} a ${(melhor.fim / TAXA).toFixed(3)} s no 03)`);
console.log(`deslocamento do cap1 em diante: ${desloca.toFixed(3)} s (cap1 ${cap103.toFixed(3)} -> ${(cap103 + desloca).toFixed(3)} s); pausa "fazer." -> "Um:" de ${pausa.toFixed(3)} s`);
console.log(`volume na take (loudnorm, I integrado): linha 1 ${vTake.linha1.i}, linha 2 ${vTake.linha2.i} LUFS; no 03: linha 1 ${v03.linha1.i}, linhas 3 a 5 ${v03.continua.i}, resto ${v03.resto.i} LUFS`);
console.log(`ganhos: linha 1 ${ganho1.toFixed(2)} dB, linha 2 ${ganho2.toFixed(2)} dB`);
console.log(`na faixa montada: linha 1 ${vLinha1.i}, linha 2 ${vLinha2.i}, abertura ${vAbertura.i} (pico ${vAbertura.tp} dBTP), resto ${vResto.i} LUFS (pico ${vResto.tp} dBTP)`);
console.log(`diferenças: abertura × resto ${Math.abs(vAbertura.i - vResto.i).toFixed(2)} LU; linha 2 nova × linhas 3 a 5 originais ${Math.abs(vLinha2.i - v03.continua.i).toFixed(2)} LU`);
console.log(`resto da faixa igual ao 03, amostra por amostra: ${iguais ? 'sim' : 'NÃO'}`);
console.log(`narracao.wav e narracao.mp3: ${(total / TAXA).toFixed(3)} s`);
if (!iguais || Math.abs(vAbertura.i - vResto.i) > 1 || Math.abs(vLinha2.i - v03.continua.i) > 1) process.exit(1);
