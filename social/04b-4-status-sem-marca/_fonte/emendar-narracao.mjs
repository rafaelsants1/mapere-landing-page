// 04b: monta audio/narracao.wav, audio/narracao.mp3 e audio/alinhamento.json emendando a
// linha 2 nova ("Cada posto vai ter um … de quatro status.") na narração original do vídeo 04.
//
//   a narração do 04, amostra por amostra, do começo até o meio do silêncio digital da pausa
//     depois de "nada." (a linha 1 e a pausa de 0,5 s ficam iguais)
//   + a linha 2 da take nova, com a voz começando no mesmo instante em que "No" começava no 04
//     e 0,5 s de silêncio a mais entre "um" e "de" (o {+0.5} do roteiro)
//   + silêncio até a emenda, no meio do silêncio digital da pausa de 0,6 s antes de "Livre:"
//   + a narração do 04 dali até o fim, amostra por amostra.
//
// A take nova traz a linha 1 também, só para a linha 2 sair no mesmo embalo da voz. A linha 1
// dela não entra no vídeo.
// O deslocamento do resto ("Livre:" em diante) é arredondado a um múltiplo de 0,1 s (3 quadros
// a 30 fps e um número exato de milissegundos), como no 03b: assim dá para provar quadro a
// quadro que o resto da cena é o 04. A pausa "status." → "Livre:" fica entre 0,55 e 0,65 s.
// Volume: um ganho só, na linha 2 nova, para ela ficar no nível da linha 2 do 04 (de "cada"
// a "status."). A parte original não recebe ganho nenhum.
//
// Uso (em _fonte/): node emendar-narracao.mjs [a|b]     (sem argumento usa a take "a")
// Lê:  audio/linha2-take-X.mp3, audio/linha2-take-X.palavras.json,
//      audio/04-original/narracao.wav e audio/04-original/alinhamento.json (cópias congeladas do 04)
// Escreve também verificacao/emenda-take-X.mp3 (de 1 s antes da linha 2 a 1,5 s depois de "Livre:").
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const pasta = join(aqui, 'audio');
const take = (process.argv.slice(2).find((a) => !a.startsWith('--')) || 'a').toLowerCase();
const TAXA = 48000;
const PRE = 0.03; // um pouco antes da voz, para não cortar o ataque da primeira sílaba
const EXTRA_UM_DE = 0.5; // o {+0.5} entre "um" e "de"
const PAUSA = 0.6; // pausa do 04 entre "status." e "Livre:"
const PASSO_DESLOCA = 0.1;
const amostra = (s) => Math.round(s * TAXA);
const arred = (v) => Math.round(v * 1000) / 1000;
const limpa = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

const decodifica = (arquivo) => {
  const bruto = execFileSync('ffmpeg', ['-v', 'error', '-i', arquivo, '-f', 's16le', '-ac', '1', '-ar', String(TAXA), '-'], { maxBuffer: 256 * 1024 * 1024 });
  return new Int16Array(bruto.buffer.slice(bruto.byteOffset, bruto.byteOffset + bruto.length));
};

// Silêncios com o mesmo critério do _motor/narracao.mjs: abaixo de -45 dB por 0,08 s ou mais.
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

// Maior trecho de zeros exatos entre dois instantes: o silêncio que o narracao.mjs inseriu.
function zerosEntre(pcm, t0, t1) {
  let melhor = { ini: 0, fim: 0 };
  let corrida = -1;
  const a = amostra(t0);
  const b = amostra(t1);
  for (let k = a; k <= b; k++) {
    if (pcm[k] === 0 && k < b) {
      if (corrida < 0) corrida = k;
    } else if (corrida >= 0) {
      if (k - corrida > melhor.fim - melhor.ini) melhor = { ini: corrida, fim: k };
      corrida = -1;
    }
  }
  return melhor;
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

// Volume integrado (LUFS) e pico real de um trecho, pela primeira passada do loudnorm.
function mede(pcm, nome) {
  const tmp = join(pasta, `_mede-${nome}.wav`);
  escreveWav(tmp, pcm);
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', tmp, '-af', 'aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
  rmSync(tmp);
  const j = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{'), r.stderr.lastIndexOf('}') + 1));
  return { i: Number(j.input_i), tp: Number(j.input_tp), lra: Number(j.input_lra) };
}

const falhas = [];
const confere = (ok, msg) => {
  if (!ok) falhas.push(msg);
};

// ---------- 1. A take nova ----------
const nova = decodifica(join(pasta, `linha2-take-${take}.mp3`));
const durNova = nova.length / TAXA;
const silNova = silencios(nova);
const palavrasNova = JSON.parse(readFileSync(join(pasta, `linha2-take-${take}.palavras.json`), 'utf8'))
  .words.filter((w) => w.type === 'word' && !/^\[.*\]$/.test(w.text.trim()))
  .map((w) => ({ texto: w.text, ini: w.start, fim: Math.min(w.end, durNova) }));
const ESPERADO = ['esse', 'ponto', 'no', 'mapa', 'nao', 'te', 'diz', 'nada', 'cada', 'posto', 'vai', 'ter', 'um', 'de', 'quatro', 'status'];
const veio = palavrasNova.map((p) => limpa(p.texto));
if (veio.join(' ') !== ESPERADO.join(' ')) {
  console.error(`A take ${take} devia dizer "${ESPERADO.join(' ')}". Veio: "${veio.join(' ')}"`);
  process.exit(1);
}
const l1 = palavrasNova.slice(0, 8);
const l2a = palavrasNova.slice(8, 13); // Cada posto vai ter um
const l2b = palavrasNova.slice(13); // de quatro status.

// Troca de frase: o silêncio mais perto do meio entre "nada." e "Cada".
const troca = (l1.at(-1).fim + l2a[0].ini) / 2;
const candidatos = silNova.filter((s) => s.ini > 0 && s.fim < durNova && (s.ini + s.fim) / 2 > l1.at(-1).ini && (s.ini + s.fim) / 2 < l2a[0].fim + 0.3);
if (!candidatos.length) {
  console.error('Não achei o silêncio entre "nada." e "Cada".');
  process.exit(1);
}
const s12 = candidatos.reduce((a, b) => (Math.abs((b.ini + b.fim) / 2 - troca) < Math.abs((a.ini + a.fim) / 2 - troca) ? b : a));
const vozL2 = s12.fim; // começo da voz de "Cada", na take

// Corte entre "um" e "de": o ponto mais quieto entre as duas palavras (como o narracao.mjs faz no {+n}).
const um = l2a.at(-1);
const de = l2b[0];
let corte = { em: (um.fim + de.ini) / 2, rms: Infinity };
for (let t = um.fim - 0.03; t <= de.ini + 0.03; t += 0.002) {
  const a = amostra(t);
  let soma = 0;
  for (let j = a - 120; j < a + 120; j++) soma += (nova[j] || 0) ** 2;
  if (soma < corte.rms) corte = { em: t, rms: soma };
}
const corteUmDe = corte.em;
const naturalUmDe = Math.max(0, de.ini - um.fim);

// Fim de "status.": onde começa o silêncio final da take.
const silFinal = silNova.at(-1);
const fimStatus = silFinal && silFinal.fim >= durNova - 0.001 && silFinal.ini > l2b.at(-1).ini ? silFinal.ini : durNova;

// ---------- 2. A narração original do 04 e os pontos das emendas ----------
const orig = decodifica(join(pasta, '04-original', 'narracao.wav'));
const alin04 = JSON.parse(readFileSync(join(pasta, '04-original', 'alinhamento.json'), 'utf8'));
const [f1, f2a, f2b, f3] = alin04.frases;
if (!/^No Mapere/.test(f2a.texto) || !/^de quatro status/.test(f2b.texto) || !/^Livre:/.test(f3.texto)) {
  console.error(`As frases 2 a 4 do 04 não são as esperadas: "${f2a.texto}" | "${f2b.texto}" | "${f3.texto}"`);
  process.exit(1);
}
const zA = zerosEntre(orig, f1.fim, f2a.ini);
const zB = zerosEntre(orig, f2b.fim, f3.ini);
if (zA.fim - zA.ini < amostra(0.05) || zB.fim - zB.ini < amostra(0.05)) {
  console.error('Não achei silêncio digital nas pausas depois de "nada." e antes de "Livre:" no 04.');
  process.exit(1);
}
const emendaA = Math.round((zA.ini + zA.fim) / 2); // até aqui, a faixa é o 04
const emendaB04 = Math.round((zB.ini + zB.fim) / 2); // daqui em diante, também (deslocado)
const cadaIni04 = alin04.palavras.find((p) => limpa(p.texto) === 'cada').ini;

// ---------- 3. Deslocamento e montagem ----------
const deslo1 = f2a.ini - vozL2; // tempo na take → tempo no 04b, de "Cada" até o corte
const deslo2 = deslo1 + EXTRA_UM_DE; // do corte em diante
const iniTrecho = vozL2 - PRE;
const posA = amostra(iniTrecho + deslo1);
confere(posA > emendaA, `a linha 2 nova começaria antes da emenda A (${(posA / TAXA).toFixed(3)} s)`);
const fimStatus04b = fimStatus + deslo2;
const desloca = Math.round((fimStatus04b + PAUSA - f3.ini) / PASSO_DESLOCA) * PASSO_DESLOCA;
const pausa = f3.ini + desloca - fimStatus04b;
if (pausa < 0.55 - 1e-9 || pausa > 0.65 + 1e-9) {
  console.error(`A pausa antes de "Livre:" ficaria com ${pausa.toFixed(3)} s.`);
  process.exit(1);
}
const emendaB = emendaB04 + Math.round(desloca * TAXA);
const folga = 0.01;
const fimTrechoTake = Math.min(durNova, fimStatus + 0.2, emendaB / TAXA - deslo2 - folga);
if (fimTrechoTake <= fimStatus) {
  console.error('A linha 2 nova invadiria a emenda B.');
  process.exit(1);
}
const parteA = Float64Array.from(nova.subarray(amostra(iniTrecho), amostra(corteUmDe)));
const parteB = Float64Array.from(nova.subarray(amostra(corteUmDe), amostra(fimTrechoTake)));
const rampa = Math.min(amostra(0.01), parteB.length);
for (let k = 0; k < rampa; k++) parteB[parteB.length - 1 - k] *= k / rampa;
const nExtra = amostra(EXTRA_UM_DE);
const posB = posA + parteA.length + nExtra;
confere(posB + parteB.length < emendaB, 'a linha 2 nova invade a emenda B');

// Volume: a linha 2 nova (com a pausa do meio) contra a linha 2 do 04, de "cada" a "status.".
const paraInt16 = (f) => Int16Array.from(f, (v) => Math.max(-32768, Math.min(32767, Math.round(v))));
const juntaLinha2 = (g) => {
  const a = new Int16Array(parteA.length + nExtra + parteB.length);
  a.set(paraInt16(parteA.map((v) => v * g)), 0);
  a.set(paraInt16(parteB.map((v) => v * g)), parteA.length + nExtra);
  return a;
};
const v04 = {
  linha1: mede(orig.subarray(amostra(f1.ini), amostra(f1.fim)), 'l1-04'),
  linha2: mede(orig.subarray(amostra(cadaIni04), amostra(f2b.fim)), 'l2-04'),
  linhas3a5: mede(orig.subarray(amostra(f3.ini), amostra(alin04.frases[6].fim)), 'l3a5-04'),
};
const vTake = {
  linha1: mede(nova.subarray(amostra(Math.max(0, l1[0].ini - PRE)), amostra(s12.ini)), 'l1-take'),
  linha2: mede(juntaLinha2(1), 'l2-take'),
};
const ganho = v04.linha2.i - vTake.linha2.i;
const g = 10 ** (ganho / 20);
for (const v of [...parteA, ...parteB]) {
  if (Math.abs(v * g) > 32767) {
    console.error(`O ganho de ${ganho.toFixed(2)} dB faz a linha 2 estourar. Pare e revise.`);
    process.exit(1);
  }
}

const total = emendaB + (orig.length - emendaB04);
const saida = new Int16Array(total);
saida.set(orig.subarray(0, emendaA), 0);
saida.set(paraInt16(parteA.map((v) => v * g)), posA);
saida.set(paraInt16(parteB.map((v) => v * g)), posB);
saida.set(orig.subarray(emendaB04), emendaB);
escreveWav(join(pasta, 'narracao.wav'), saida);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(pasta, 'narracao.wav'), '-c:a', 'libmp3lame', '-b:a', '192k', join(pasta, 'narracao.mp3')]);

// Conferências na faixa montada.
const vLinha2 = mede(saida.subarray(posA, posB + parteB.length), 'l2-04b');
const vTudo = mede(saida, 'tudo-04b');
const vTudo04 = mede(orig, 'tudo-04');
let inicioIgual = true;
for (let k = 0; k < emendaA; k++) if (saida[k] !== orig[k]) { inicioIgual = false; break; }
let restoIgual = true;
for (let k = 0; k < orig.length - emendaB04; k++) if (saida[emendaB + k] !== orig[emendaB04 + k]) { restoIgual = false; break; }
confere(inicioIgual, 'a linha 1 não ficou igual à do 04');
confere(restoIgual, 'o resto não ficou igual ao 04');
confere(Math.abs(vLinha2.i - v04.linha2.i) <= 1, `a linha 2 nova ficou ${(vLinha2.i - v04.linha2.i).toFixed(2)} LU longe da linha 2 do 04`);

// ---------- 4. Alinhamento ----------
const daTake = (p, d) => ({ texto: p.texto, ini: arred(p.ini + d), fim: arred(p.fim + d) });
const novas = [...l2a.map((p) => daTake(p, deslo1)), ...l2b.map((p) => daTake(p, deslo2))];
novas[0].ini = arred(f2a.ini);
novas[0].fim = Math.max(novas[0].fim, arred(f2a.ini + 0.06));
novas.at(-1).fim = arred(fimStatus04b);
const frases = [
  { ...f1, origem: 'narração do 04' },
  {
    texto: l2a.map((p) => p.texto).join(' '),
    ini: arred(f2a.ini),
    fim: arred(um.fim + deslo1),
    naTake: [arred(vozL2), arred(um.fim)],
    pausaDepois: arred(naturalUmDe + EXTRA_UM_DE),
    pausaNaTake: arred(naturalUmDe),
    origem: `linha2-take-${take}`,
  },
  {
    texto: l2b.map((p) => p.texto).join(' '),
    ini: arred(de.ini + deslo2),
    fim: arred(fimStatus04b),
    naTake: [arred(de.ini), arred(fimStatus)],
    pausaDepois: arred(pausa),
    pausaNaTake: null,
    origem: `linha2-take-${take}`,
  },
  ...alin04.frases.slice(3).map((f) => ({ ...f, ini: arred(f.ini + desloca), fim: arred(f.fim + desloca), origem: 'narração do 04' })),
];
const palavras = [
  ...alin04.palavras.filter((p) => p.ini < f2a.ini - 1e-6),
  ...novas,
  ...alin04.palavras.filter((p) => p.ini >= f3.ini - 1e-6).map((p) => ({ texto: p.texto, ini: arred(p.ini + desloca), fim: arred(p.fim + desloca) })),
];
for (let k = 1; k < palavras.length; k++) {
  if (palavras[k].ini < palavras[k - 1].ini) {
    console.error(`Palavras fora de ordem em "${palavras[k].texto}".`);
    process.exit(1);
  }
}
const alinhamento = {
  origem: `04b: linha2-take-${take}.mp3 (só a linha 2) emendada na narração do 04 (04-original/narracao.wav) por emendar-narracao.mjs`,
  take,
  duracao: arred(total / TAXA),
  fala: { ini: alin04.fala.ini, fim: arred(alin04.fala.fim + desloca) },
  emenda: {
    a: { noVideo: arred(emendaA / TAXA), no04: arred(emendaA / TAXA) },
    b: { noVideo: arred(emendaB / TAXA), no04: arred(emendaB04 / TAXA) },
    deslocamento: arred(desloca),
    pausaAntesDeLivre: arred(pausa),
    ganhoDbLinha2: Math.round(ganho * 100) / 100,
    loudnorm: { linha2: vLinha2, linha2No04: v04.linha2, linha1No04: v04.linha1, linhas3a5No04: v04.linhas3a5, tudo: vTudo, tudoNo04: vTudo04 },
  },
  frases,
  palavras,
};
writeFileSync(join(pasta, 'alinhamento.json'), JSON.stringify(alinhamento, null, 2) + '\n');

// Trecho para ouvir as duas emendas: de 1 s antes da linha 2 a 1,5 s depois de "Livre:".
mkdirSync(join(aqui, 'verificacao'), { recursive: true });
const ouvir = saida.subarray(amostra(f2a.ini - 1), amostra(f3.ini + desloca + 1.5));
const tmp = join(aqui, 'verificacao', '_ouvir.wav');
escreveWav(tmp, ouvir);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '192k', join(aqui, 'verificacao', `emenda-take-${take}.mp3`)]);
rmSync(tmp);

// ---------- 5. Relatório ----------
console.log(`take ${take}: ${durNova.toFixed(2)} s; linha 1 da take ${(s12.ini - l1[0].ini).toFixed(2)} s (no 04: ${(f1.fim - f1.ini).toFixed(2)} s; não entra)`);
console.log(`ritmo da linha 2: "Cada … um" ${(um.fim - vozL2).toFixed(2)} s (no 04, "cada … um" ${(f2a.fim - cadaIni04).toFixed(2)} s); "de quatro status." ${(fimStatus - de.ini).toFixed(2)} s (no 04 ${(f2b.fim - f2b.ini).toFixed(2)} s)`);
console.log(`pausa entre "um" e "de": ${naturalUmDe.toFixed(2)} s na take + ${EXTRA_UM_DE} s = ${(naturalUmDe + EXTRA_UM_DE).toFixed(2)} s (no 04: ${f2a.pausaDepois} s)`);
for (const f of frases.slice(0, 4)) console.log(`  ${f.ini.toFixed(3).padStart(6)} - ${f.fim.toFixed(3).padStart(6)}  ${f.texto}`);
console.log(`  ... ${frases.length} frases, ${palavras.length} palavras (o 04 tem ${alin04.frases.length} e ${alin04.palavras.length})`);
console.log(`emenda A em ${(emendaA / TAXA).toFixed(3)} s (silêncio digital do 04 de ${(zA.ini / TAXA).toFixed(3)} a ${(zA.fim / TAXA).toFixed(3)} s)`);
console.log(`emenda B em ${(emendaB / TAXA).toFixed(3)} s no 04b = ${(emendaB04 / TAXA).toFixed(3)} s no 04 (silêncio digital de ${(zB.ini / TAXA).toFixed(3)} a ${(zB.fim / TAXA).toFixed(3)} s)`);
console.log(`deslocamento de "Livre:" em diante: ${desloca.toFixed(3)} s ("Livre:" ${f3.ini.toFixed(3)} -> ${(f3.ini + desloca).toFixed(3)} s); pausa "status." -> "Livre:" de ${pausa.toFixed(3)} s`);
console.log(`volume (loudnorm, I integrado): take, linha 1 ${vTake.linha1.i} e linha 2 ${vTake.linha2.i} LUFS; no 04, linha 1 ${v04.linha1.i}, linha 2 ${v04.linha2.i}, linhas 3 a 5 ${v04.linhas3a5.i} LUFS`);
console.log(`ganho da linha 2: ${ganho.toFixed(2)} dB; na faixa: linha 2 ${vLinha2.i} LUFS (pico ${vLinha2.tp} dBTP); faixa inteira ${vTudo.i} LUFS (no 04 ${vTudo04.i})`);
console.log(`linha 1 igual ao 04, amostra por amostra: ${inicioIgual ? 'sim' : 'NÃO'}; resto igual ao 04: ${restoIgual ? 'sim' : 'NÃO'}`);
console.log(`narracao.wav e narracao.mp3: ${(total / TAXA).toFixed(3)} s (o 04 tem ${(orig.length / TAXA).toFixed(3)} s); para ouvir: verificacao/emenda-take-${take}.mp3`);
if (falhas.length) {
  console.error('FALHOU: ' + falhas.join('; '));
  process.exit(1);
}
