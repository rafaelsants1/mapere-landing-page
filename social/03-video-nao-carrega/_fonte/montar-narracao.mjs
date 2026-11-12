// Monta audio/narracao.wav, audio/narracao.mp3 e audio/alinhamento.json a partir de
// uma take da ElevenLabs e da transcrição dela com tempo por palavra.
//
// A take sai corrida, com cerca de 0,3 s entre as frases. O vídeo precisa de mais tempo
// entre elas para o carro andar. Aqui a fala não muda: só entra silêncio no meio da
// pausa que já existe entre duas frases, e o tempo de cada palavra anda junto.
//
// Uso: node montar-narracao.mjs [a|b]     (take; sem argumento usa a "a")
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const pasta = join(aqui, 'audio');
const take = (process.argv[2] || 'a').toLowerCase();
const mp3 = join(pasta, `narracao-take-${take}.mp3`);
const transcricao = join(pasta, `narracao-take-${take}.palavras.json`);

const TAXA = 48000;
// Silêncio antes da primeira palavra e depois da última, em segundos.
// No vídeo 03 a voz entra depois de 0,45 s: é o tempo de o dedo voltar para o botão.
const ENTRADA = 0.45;
const SOBRA = 1.0;
// Silêncio pedido entre o fim de uma frase e o começo da seguinte, em segundos.
// null mantém a pausa da própria take. A pausa nunca fica menor que a da take.
const PAUSAS = [
  { depois: 'novo', pausa: 0.4 }, // o celular sai e os três quadros entram
  { depois: 'fazer', pausa: 0.6 }, // os quadros sobem e viram a barra de capítulos
  { depois: 'sinal', pausa: null },
  { depois: 'comum', pausa: 0.4 },
  { depois: 'lá', pausa: 0.9 }, // o ponto em Brasa chega ao carregador e o raio acende
  { depois: 'travou', pausa: null },
  { depois: 'Pix', pausa: 0.4 },
  { depois: 'app', pausa: 0.8 }, // troca para o capítulo 3
  { depois: 'internet', pausa: 0.4 },
  { depois: 'chega', pausa: 0.6 }, // o ponto pisca e some
  { depois: 'posto', pausa: 1.0 }, // entra o mapa
  { depois: 'sair', pausa: null },
  { depois: 'mostrar', pausa: 1.0 }, // o mapa fica um instante antes da chamada
];
const limpa = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

// 1. Áudio da take em PCM mono de 16 bits.
const bruto = execFileSync('ffmpeg', ['-v', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', String(TAXA), '-'], { maxBuffer: 256 * 1024 * 1024 });
const pcm = new Int16Array(bruto.buffer, bruto.byteOffset, Math.floor(bruto.length / 2));
const duracaoTake = pcm.length / TAXA;

// 2. Trechos de silêncio: volume abaixo de -45 dB por 0,08 s ou mais.
const JANELA = Math.round(TAXA * 0.01);
const PASSO = Math.round(TAXA * 0.005);
const LIMIAR = 32768 * 10 ** (-45 / 20);
const silencios = [];
let inicio = -1;
const quadros = Math.floor((pcm.length - JANELA) / PASSO) + 1;
for (let i = 0; i <= quadros; i++) {
  let quieto = false;
  if (i < quadros) {
    let soma = 0;
    for (let j = i * PASSO; j < i * PASSO + JANELA; j++) soma += pcm[j] * pcm[j];
    quieto = Math.sqrt(soma / JANELA) < LIMIAR;
  }
  if (quieto && inicio < 0) inicio = i;
  if (!quieto && inicio >= 0) {
    const ini = inicio === 0 ? 0 : (inicio * PASSO + JANELA / 2) / TAXA;
    const fim = i === quadros ? duracaoTake : ((i - 1) * PASSO + JANELA / 2) / TAXA;
    if (fim - ini >= 0.08 || inicio === 0 || i === quadros) silencios.push({ ini, fim });
    inicio = -1;
  }
}
const falaIni = silencios[0]?.ini === 0 ? silencios[0].fim : 0;
const falaFim = silencios.at(-1)?.fim === duracaoTake ? silencios.at(-1).ini : duracaoTake;

// 3. Palavras da transcrição, separadas em frases pela pontuação.
const palavras = JSON.parse(readFileSync(transcricao, 'utf8'))
  // Marcações de tom entre colchetes não são faladas: se vierem na transcrição, saem aqui.
  .words.filter((w) => w.type === 'word' && !/^\[.*\]$/.test(w.text.trim()))
  .map((w) => ({ texto: w.text, ini: w.start, fim: Math.min(w.end, duracaoTake) }));
const frases = [[]];
for (const p of palavras) {
  frases.at(-1).push(p);
  if (/[.?!]['"”’]?$/.test(p.texto)) frases.push([]);
}
if (!frases.at(-1).length) frases.pop();
if (frases.length !== PAUSAS.length + 1) {
  console.error(`Esperava ${PAUSAS.length + 1} frases e a transcrição tem ${frases.length}.`);
  process.exit(1);
}

// 4. Para cada troca de frase, acha o silêncio entre as duas e acerta nele o fim da
// última palavra e o começo da primeira. A transcrição às vezes põe a pausa dentro da palavra.
frases[0][0].ini = falaIni;
frases.at(-1).at(-1).fim = falaFim;
const cortes = [];
PAUSAS.forEach((regra, k) => {
  const ultima = frases[k].at(-1);
  const primeira = frases[k + 1][0];
  if (limpa(ultima.texto) !== limpa(regra.depois)) {
    console.error(`A frase ${k + 1} termina em "${ultima.texto}" e a regra de pausa espera "${regra.depois}".`);
    process.exit(1);
  }
  const candidatos = silencios.filter((s) => (s.ini + s.fim) / 2 > ultima.ini && (s.ini + s.fim) / 2 < primeira.fim + 0.3 && s.ini > 0 && s.fim < duracaoTake);
  if (!candidatos.length) {
    console.error(`Não achei silêncio entre "${ultima.texto}" e "${primeira.texto}".`);
    process.exit(1);
  }
  // Fica com o silêncio mais perto da troca de frase da transcrição, e não com o
  // mais longo: depois de "Dica:" ou "Um:" a voz também faz uma pausa, e ela não
  // é a troca de frase.
  const troca = (ultima.fim + primeira.ini) / 2;
  const meio = (q) => (q.ini + q.fim) / 2;
  const s = candidatos.reduce((a, b) => (Math.abs(meio(b) - troca) < Math.abs(meio(a) - troca) ? b : a));
  if (process.argv.includes('--detalhe')) {
    console.log(`  "${ultima.texto}" | "${primeira.texto}": troca ${troca.toFixed(2)}, silêncios ${candidatos.map((q) => `${q.ini.toFixed(2)}-${q.fim.toFixed(2)}`).join(' ')}, escolhido ${s.ini.toFixed(2)}-${s.fim.toFixed(2)}`);
  }
  ultima.fim = s.ini;
  primeira.ini = s.fim;
  primeira.fim = Math.max(primeira.fim, s.fim + 0.06);
  const natural = s.fim - s.ini;
  const pedida = regra.pausa ?? natural;
  cortes.push({ em: (s.ini + s.fim) / 2, natural, extra: Math.max(0, pedida - natural) });
});

// 5. Monta a faixa: os trechos da take na ordem, com o silêncio a mais no meio de cada pausa.
const amostra = (seg) => Math.round(seg * TAXA);
const limites = [0, ...cortes.map((c) => amostra(c.em)), pcm.length];
const pedacos = [];
const desloca = [];
let pos = amostra(Math.max(0, ENTRADA - falaIni));
pedacos.push(new Int16Array(pos));
for (let k = 0; k < frases.length; k++) {
  desloca.push((pos - limites[k]) / TAXA);
  const trecho = pcm.subarray(limites[k], limites[k + 1]);
  pedacos.push(trecho);
  pos += trecho.length;
  if (k < cortes.length) {
    const n = amostra(cortes[k].extra);
    pedacos.push(new Int16Array(n));
    pos += n;
  }
}
const cauda = amostra(Math.max(0, SOBRA - (duracaoTake - falaFim)));
pedacos.push(new Int16Array(cauda));
pos += cauda;

const dados = new Int16Array(pos);
let escrito = 0;
for (const p of pedacos) {
  dados.set(p, escrito);
  escrito += p.length;
}
const cabecalho = Buffer.alloc(44);
cabecalho.write('RIFF', 0);
cabecalho.writeUInt32LE(36 + dados.byteLength, 4);
cabecalho.write('WAVEfmt ', 8);
cabecalho.writeUInt32LE(16, 16);
cabecalho.writeUInt16LE(1, 20); // PCM
cabecalho.writeUInt16LE(1, 22); // mono
cabecalho.writeUInt32LE(TAXA, 24);
cabecalho.writeUInt32LE(TAXA * 2, 28);
cabecalho.writeUInt16LE(2, 32);
cabecalho.writeUInt16LE(16, 34);
cabecalho.write('data', 36);
cabecalho.writeUInt32LE(dados.byteLength, 40);
const wav = join(pasta, 'narracao.wav');
writeFileSync(wav, Buffer.concat([cabecalho, Buffer.from(dados.buffer, dados.byteOffset, dados.byteLength)]));
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '192k', join(pasta, 'narracao.mp3')]);

// 6. Alinhamento: o tempo de cada palavra já na faixa montada.
const arred = (v) => Math.round(v * 1000) / 1000;
const saida = {
  origem: `narracao-take-${take}.mp3 e narracao-take-${take}.palavras.json (ElevenLabs), com as pausas de montar-narracao.mjs`,
  take,
  duracao: arred(pos / TAXA),
  fala: { ini: arred(falaIni + desloca[0]), fim: arred(falaFim + desloca.at(-1)) },
  frases: frases.map((f, k) => ({
    texto: f.map((p) => p.texto).join(' '),
    ini: arred(f[0].ini + desloca[k]),
    fim: arred(f.at(-1).fim + desloca[k]),
    naTake: [arred(f[0].ini), arred(f.at(-1).fim)],
    pausaDepois: k < cortes.length ? arred(cortes[k].natural + cortes[k].extra) : null,
    pausaNaTake: k < cortes.length ? arred(cortes[k].natural) : null,
  })),
  palavras: frases.flatMap((f, k) => f.map((p) => ({ texto: p.texto, ini: arred(p.ini + desloca[k]), fim: arred(p.fim + desloca[k]) }))),
};
for (let i = 1; i < saida.palavras.length; i++) {
  if (saida.palavras[i].ini < saida.palavras[i - 1].ini) {
    console.error(`Palavras fora de ordem em "${saida.palavras[i].texto}".`);
    process.exit(1);
  }
}
writeFileSync(join(pasta, 'alinhamento.json'), JSON.stringify(saida, null, 2) + '\n');

console.log(`take ${take}: ${duracaoTake.toFixed(2)} s, fala de ${falaIni.toFixed(2)} a ${falaFim.toFixed(2)} s, ${palavras.length} palavras`);
for (const f of saida.frases) {
  console.log(`  ${f.ini.toFixed(2).padStart(5)} - ${f.fim.toFixed(2).padStart(5)}  ${f.texto}${f.pausaDepois === null ? '' : `   [pausa ${f.pausaDepois.toFixed(2)} s, era ${f.pausaNaTake.toFixed(2)} s]`}`);
}
console.log(`narracao.wav e narracao.mp3: ${saida.duracao} s, fala de ${saida.fala.ini} a ${saida.fala.fim} s`);
