// Monta legenda.json e legenda.js (window.LEGENDA): o texto de tela de cada
// palavra, quando ela acende e as marcações que a cena usa.
// Cópia adaptada do vídeo 02.
//
// Uso:
//   node montar-legenda.mjs --plano   tempos estimados a partir do roteiro do plano.md
//   node montar-legenda.mjs           tempos reais de audio/alinhamento.json
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const modoPlano = process.argv.includes('--plano');

// Roteiro oficial (coluna "Narração" do plano.md), já dividido nos blocos que
// aparecem na tela. `fala` lista as palavras ditas quando a tela mostra outra
// coisa: "3" na tela, "três" na voz. `ini` é onde a fala da linha começa na
// estimativa do plano.
const ROTEIRO = [
  { linha: 1, ini: 0.45, blocos: [['Para', 'de', 'apertar'], ['“tentar', 'de', 'novo”.']] },
  {
    linha: 2,
    ini: 2.4,
    blocos: [[{ tela: '3', fala: ['três'] }, 'motivos', 'pro'], ['seu', 'carro', 'não'], ['carregar', 'no', 'posto,'], ['e', 'o', 'que', 'fazer.']],
  },
  {
    linha: 3,
    ini: 6.2,
    blocos: [
      ['Um:', 'seu', 'celular'], ['tá', 'sem', 'sinal.'], ['Em', 'garagem', 'de'], ['subsolo', 'é', 'comum.'],
      ['Dica:', 'pluga', 'o', 'carro,'], ['sobe', 'até', 'onde'], ['pega', 'sinal', 'e'], ['inicia', 'por', 'lá.'],
    ],
  },
  {
    linha: 4,
    ini: 15.4,
    blocos: [
      ['Dois:', 'o', 'pagamento'], ['travou.'], ['Às', 'vezes', 'é', 'só'], ['trocar', 'o', 'cartão'], ['pelo', 'Pix.'],
      ['Deixa', 'sempre', 'um'], ['segundo', 'jeito'], ['de', 'pagar', 'no', 'app.'],
    ],
  },
  {
    linha: 5,
    ini: 23.6,
    blocos: [
      ['Três:', 'o', 'carregador'], ['tá', 'sem', 'internet.'], ['A', 'tela', 'acende,'], ['mas', 'a', 'liberação'], ['não', 'chega.'],
      ['Aí,', 'pelo', 'app,'], ['não', 'tem', 'jeito:'], ['é', 'ir', 'pra', 'outro', 'posto.'],
    ],
  },
  { linha: 6, ini: 32.6, blocos: [['E', 'isso', 'dá', 'pra'], ['saber', 'antes', 'de', 'sair.'], ['É', 'o', 'que', 'o', 'Mapere'], ['vai', 'mostrar.']] },
  { linha: 7, ini: 37.4, blocos: [['Siga', 'pra', 'acompanhar', 'a', 'construção.']] },
];
const ULTIMA = ROTEIRO.length; // a linha da chamada, que fica sob o logo

const limpa = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9%]/g, '');

// Lista plana de palavras de tela, cada uma com as palavras faladas que cobre.
const palavras = [];
ROTEIRO.forEach((l) =>
  l.blocos.forEach((b, bi) =>
    b.forEach((p) => {
      const tela = typeof p === 'string' ? p : p.tela;
      const fala = typeof p === 'string' ? [p] : p.fala;
      palavras.push({ linha: l.linha, bloco: bi, tela, fala: fala.map(limpa) });
    }),
  ),
);

if (modoPlano) {
  // Estimativa: cada palavra falada dura 0,09 s mais 0,05 s por letra, com
  // 0,3 s de pausa depois de ponto no meio da linha.
  let t = 0;
  let linha = 0;
  for (const p of palavras) {
    if (p.linha !== linha) {
      linha = p.linha;
      t = ROTEIRO[linha - 1].ini;
    }
    p.ini = t;
    for (const f of p.fala) t += 0.09 + 0.05 * f.length;
    p.fim = t;
    if (/[.?!:]["”]?$/.test(p.tela)) t += 0.3;
  }
} else {
  const arquivo = join(aqui, 'audio', 'alinhamento.json');
  if (!existsSync(arquivo)) {
    console.error('Falta audio/alinhamento.json. Rode com --plano para usar os tempos do roteiro.');
    process.exit(1);
  }
  // alinhamento.json: { palavras: [{ texto, ini, fim }] } na ordem em que foram ditas.
  // Marcações de tom entre colchetes não são palavras: saem antes de comparar.
  const ditas = JSON.parse(readFileSync(arquivo, 'utf8'))
    .palavras.map((d) => ({ ...d, chave: limpa(d.texto.replace(/\[[^\]]*\]/g, '')) }))
    .filter((d) => d.chave);
  let i = 0;
  for (const p of palavras) {
    const esperado = p.fala.join('');
    let junto = '';
    const primeira = ditas[i];
    let ultima = primeira;
    // A transcrição pode devolver "3" em algarismo ou "três" por extenso.
    const numero = p.tela === '3' && primeira && primeira.chave === '3';
    while (!numero && i < ditas.length && junto.length < esperado.length) {
      ultima = ditas[i];
      junto += ditas[i++].chave;
    }
    if (numero) i++;
    else if (junto !== esperado) {
      console.error(`Transcrição não bate com o roteiro em "${p.tela}" (linha ${p.linha}): esperava "${esperado}", veio "${junto}".`);
      process.exit(1);
    }
    p.ini = primeira.ini;
    p.fim = ultima.fim;
  }
  if (i !== ditas.length) {
    console.error(`Sobraram ${ditas.length - i} palavras na transcrição depois do fim do roteiro: ${ditas.slice(i).map((d) => d.texto).join(' ')}`);
    process.exit(1);
  }
}

const arred = (v) => Math.round(v * 1000) / 1000;
const acha = (linha, tela, n = 1) => {
  const p = palavras.filter((q) => q.linha === linha && limpa(q.tela) === limpa(tela))[n - 1];
  if (!p) throw new Error(`Palavra "${tela}" não está na linha ${linha}.`);
  return p;
};
const primeira = (linha) => palavras.find((p) => p.linha === linha);
const ultima = (linha) => palavras.filter((p) => p.linha === linha).at(-1);

// Marcações: os instantes da narração em que a animação se apoia.
const marcas = {
  para: primeira(1).ini,
  tentar: acha(1, 'tentar').ini,
  l1Fim: ultima(1).fim,
  tres: primeira(2).ini,
  fazer: acha(2, 'fazer').ini,
  l2Fim: ultima(2).fim,
  cap1: primeira(3).ini,
  sinal: acha(3, 'sinal').ini,
  subsolo: acha(3, 'subsolo').ini,
  comum: acha(3, 'comum').fim,
  dica: acha(3, 'Dica').ini,
  pluga: acha(3, 'pluga').ini,
  sobe: acha(3, 'sobe').ini,
  pega: acha(3, 'pega').ini,
  inicia: acha(3, 'inicia').ini,
  l3Fim: ultima(3).fim,
  cap2: primeira(4).ini,
  travou: acha(4, 'travou').ini,
  cartao: acha(4, 'cartão').ini,
  pix: acha(4, 'Pix').ini,
  segundo: acha(4, 'segundo').ini,
  l4Fim: ultima(4).fim,
  cap3: primeira(5).ini,
  internet: acha(5, 'internet').ini,
  acende: acha(5, 'acende').ini,
  liberacao: acha(5, 'liberação').ini,
  chega: acha(5, 'chega').ini,
  app5: acha(5, 'app').ini,
  outro: acha(5, 'outro').ini,
  l5Fim: ultima(5).fim,
  isso: primeira(6).ini,
  antes: acha(6, 'antes').ini,
  mapere: acha(6, 'Mapere').ini,
  l6Fim: ultima(6).fim,
  siga: primeira(7).ini,
  sigaFim: ultima(7).fim,
};
// Respiro depois da última palavra: no máximo 1 s.
marcas.fim = marcas.sigaFim + 0.8;
for (const k of Object.keys(marcas)) marcas[k] = arred(marcas[k]);

const blocos = [];
for (const p of palavras) {
  let b = blocos.at(-1);
  if (!b || b.linha !== p.linha || b.n !== p.bloco) blocos.push((b = { linha: p.linha, n: p.bloco, palavras: [] }));
  b.palavras.push({ tela: p.tela, ini: arred(p.ini), fim: arred(p.fim) });
}
blocos.forEach((b) => delete b.n);

const legenda = {
  origem: modoPlano ? 'estimativa do roteiro do plano.md' : 'audio/alinhamento.json',
  duracao: marcas.fim,
  ultimaLinha: ULTIMA,
  marcas,
  blocos,
};
writeFileSync(join(aqui, 'legenda.json'), JSON.stringify(legenda, null, 2) + '\n');
writeFileSync(join(aqui, 'legenda.js'), `// Gerado por montar-legenda.mjs (${legenda.origem}). Não edite à mão.\nwindow.LEGENDA = ${JSON.stringify(legenda)};\n`);
console.log(`legenda: ${palavras.length} palavras de tela em ${blocos.length} blocos, ${legenda.duracao} s (${legenda.origem})`);
console.log(marcas);
