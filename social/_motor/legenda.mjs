// Monta _fonte/legenda.json e _fonte/legenda.js (window.LEGENDA): o texto de tela de
// cada palavra, quando ela acende, as marcações que a cena usa, o título e os capítulos.
// Veio do vídeo 03; agora lê tudo do roteiro.json.
//
// Uso:
//   node _motor/legenda.mjs 04 --plano   tempos estimados (antes de existir narração)
//   node _motor/legenda.mjs 04           tempos reais de _fonte/audio/alinhamento.json
//
// Marcas automáticas: L1..Ln (início de cada linha), L1fim..Lnfim, cap1..capN (início
// da linha de cada capítulo), siga (início da última linha), fimFala e fim.
// As do roteiro.json: "nome": "linha:palavra[#n][:fim]".
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lerRoteiro, pastaDoVideo } from './palco.mjs';
import { confereTelaEFala, limpa, palavrasDeTela } from './roteiro.mjs';

const video = pastaDoVideo(process.argv[2]);
const fonte = join(video, '_fonte');
const roteiro = lerRoteiro(video);
const modoPlano = process.argv.includes('--plano');

const erros = confereTelaEFala(roteiro);
if (erros.length) {
  console.error('Tela e fala não batem:\n' + erros.join('\n'));
  process.exit(1);
}
const palavras = palavrasDeTela(roteiro);
const N = roteiro.linhas.length;

if (modoPlano) {
  // Estimativa: cada palavra dura 0,09 s + 0,05 s por letra; 0,3 s depois de ponto;
  // entre linhas, a pausa pedida ou 0,4 s.
  let t = roteiro.entrada ?? 0.45;
  let linha = 1;
  for (const p of palavras) {
    if (p.linha !== linha) {
      linha = p.linha;
      const pausa = roteiro.linhas[linha - 2].fala.match(/\{(\d+(?:\.\d+)?)\}\s*$/);
      t += pausa ? Number(pausa[1]) : 0.4;
    }
    p.ini = t;
    for (const f of p.fala) t += 0.09 + 0.05 * f.length;
    p.fim = t;
    if (/[.?!:]["”]?$/.test(p.tela)) t += 0.3;
  }
} else {
  const arquivo = join(fonte, 'audio', 'alinhamento.json');
  if (!existsSync(arquivo)) {
    console.error('Falta audio/alinhamento.json. Rode antes: node _motor/narracao.mjs ' + process.argv[2]);
    process.exit(1);
  }
  const ditas = JSON.parse(readFileSync(arquivo, 'utf8'))
    .palavras.map((d) => ({ ...d, chave: limpa(d.texto.replace(/\[[^\]]*\]/g, '')) }))
    .filter((d) => d.chave);
  let i = 0;
  for (const p of palavras) {
    const esperado = p.fala.join('');
    const primeira = ditas[i];
    // Número: a transcrição pode devolver "4" em algarismo ou "quatro" por extenso.
    if (p.alternativa && primeira && primeira.chave === p.alternativa) {
      i++;
      p.ini = primeira.ini;
      p.fim = primeira.fim;
      continue;
    }
    let junto = '';
    let ultima = primeira;
    while (i < ditas.length && junto.length < esperado.length) {
      ultima = ditas[i];
      junto += ditas[i++].chave;
    }
    if (junto !== esperado) {
      console.error(`Transcrição não bate com o roteiro em "${p.tela}" (linha ${p.linha}): esperava "${esperado}", veio "${junto}".`);
      process.exit(1);
    }
    p.ini = primeira.ini;
    p.fim = ultima.fim;
  }
  if (i !== ditas.length) {
    console.error(`Sobraram palavras na transcrição: ${ditas.slice(i).map((d) => d.texto).join(' ')}`);
    process.exit(1);
  }
}

const arred = (v) => Math.round(v * 1000) / 1000;
const daLinha = (l) => palavras.filter((p) => p.linha === l);
const marcas = {};
for (let l = 1; l <= N; l++) {
  marcas[`L${l}`] = daLinha(l)[0].ini;
  marcas[`L${l}fim`] = daLinha(l).at(-1).fim;
}
(roteiro.capitulos || []).forEach((c, k) => (marcas[`cap${k + 1}`] = marcas[`L${c.linha}`]));
marcas.siga = marcas[`L${N}`];
marcas.fimFala = marcas[`L${N}fim`];
marcas.fim = marcas.fimFala + 0.8;
for (const [nome, spec] of Object.entries(roteiro.marcas || {})) {
  const m = spec.match(/^(\d+):([^#:]+)(?:#(\d+))?(?::(fim))?$/);
  if (!m) throw new Error(`Marca "${nome}" mal escrita: "${spec}"`);
  const achadas = daLinha(Number(m[1])).filter((p) => limpa(p.tela) === limpa(m[2]) || p.fala.join('') === limpa(m[2]));
  const p = achadas[(Number(m[3]) || 1) - 1];
  if (!p) throw new Error(`Marca "${nome}": a palavra "${m[2]}" não está na linha ${m[1]}.`);
  marcas[nome] = m[4] ? p.fim : p.ini;
}
for (const k of Object.keys(marcas)) marcas[k] = arred(marcas[k]);

const blocos = [];
for (const p of palavras) {
  let b = blocos.at(-1);
  if (!b || b.linha !== p.linha || b.n !== p.bloco) blocos.push((b = { linha: p.linha, n: p.bloco, palavras: [] }));
  b.palavras.push({ tela: p.tela, ini: arred(p.ini), fim: arred(p.fim) });
}
blocos.forEach((b) => delete b.n);

const legenda = {
  origem: modoPlano ? 'estimativa do roteiro.json' : 'audio/alinhamento.json',
  duracao: marcas.fim,
  ultimaLinha: N,
  titulo: roteiro.titulo,
  capitulos: (roteiro.capitulos || []).map((c, k) => ({ nome: c.nome, ini: marcas[`cap${k + 1}`] })),
  marcas,
  blocos,
};
writeFileSync(join(fonte, 'legenda.json'), JSON.stringify(legenda, null, 2) + '\n');
writeFileSync(join(fonte, 'legenda.js'), `// Gerado por _motor/legenda.mjs (${legenda.origem}). Não edite à mão.\nwindow.LEGENDA = ${JSON.stringify(legenda)};\n`);
console.log(`legenda: ${palavras.length} palavras de tela em ${blocos.length} blocos, ${legenda.duracao} s (${legenda.origem})`);
console.log(Object.entries(marcas).map(([k, v]) => `${k} ${v}`).join(' · '));
