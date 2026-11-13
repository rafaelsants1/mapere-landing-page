// Monta _fonte/audio/narracao.wav, narracao.mp3 e alinhamento.json a partir de uma take
// da ElevenLabs e da transcrição dela com tempo por palavra. Veio do vídeo 03.
//
// A take sai corrida. Aqui a fala não muda: só entra silêncio no meio da pausa que já
// existe entre duas frases, como pede o {n} do roteiro.json, e o tempo de cada palavra anda junto.
//
// Uso: node _motor/narracao.mjs 04 [a|b] [--detalhe]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lerRoteiro, pastaDoVideo } from './palco.mjs';
import { frases as frasesDoRoteiro, limpa } from './roteiro.mjs';

const video = pastaDoVideo(process.argv[2]);
const roteiro = lerRoteiro(video);
const pasta = join(video, '_fonte', 'audio');
const take = (process.argv.slice(3).find((a) => !a.startsWith('--')) || 'a').toLowerCase();
const mp3 = join(pasta, `narracao-take-${take}.mp3`);
const transcricao = join(pasta, `narracao-take-${take}.palavras.json`);

const TAXA = 48000;
// Silêncio antes da primeira palavra e depois da última, em segundos.
const ENTRADA = roteiro.entrada ?? 0.45;
const SOBRA = roteiro.sobra ?? 1.0;
// Pausa pedida entre o fim de uma frase e o começo da seguinte (null = a da take).
const FRASES = frasesDoRoteiro(roteiro);
const PAUSAS = FRASES.slice(0, -1).map((f) => ({ depois: f.ultima, pausa: f.pausa, interna: !!f.interna }));

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
// As frases seguem a contagem de palavras do roteiro (a transcrição devolve o texto
// enviado), o que permite partir uma frase no meio com {+n}.
const total = FRASES.reduce((s, f) => s + f.palavras.length, 0);
if (palavras.length !== total) {
  console.error(`O roteiro tem ${total} palavras faladas e a transcrição tem ${palavras.length}.`);
  process.exit(1);
}
const frases = [];
let ip = 0;
for (const f of FRASES) {
  frases.push(palavras.slice(ip, ip + f.palavras.length));
  ip += f.palavras.length;
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
  if (regra.interna) {
    // Pausa no meio da frase: corta no ponto mais quieto entre as duas palavras.
    let melhor = { em: (ultima.fim + primeira.ini) / 2, rms: Infinity };
    for (let t = ultima.fim - 0.03; t <= primeira.ini + 0.03; t += 0.002) {
      const a = Math.round(t * TAXA);
      let soma = 0;
      for (let j = a - 120; j < a + 120; j++) soma += (pcm[j] || 0) ** 2;
      if (soma < melhor.rms) melhor = { em: t, rms: soma };
    }
    cortes.push({ em: melhor.em, natural: Math.max(0, primeira.ini - ultima.fim), extra: regra.pausa, interna: true });
    return;
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
