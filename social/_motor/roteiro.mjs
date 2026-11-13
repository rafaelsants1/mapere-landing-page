// Lê o roteiro.json de um vídeo e devolve o que os outros scripts precisam:
// o texto da voz, as frases com a pausa pedida e as palavras de tela em blocos.
// Formato do roteiro: ver o campo "_como_ler" do roteiro.json e o README do motor.

export const limpa = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9%]/g, '');

const PAUSA = /\{\+?(\d+(?:\.\d+)?)\}/g;
const TOM = /\[[^\]]*\]/g;
const FIM_DE_FRASE = /[.?!]['"”’]?$/;

// Texto enviado à ElevenLabs: com as marcações de tom, sem as pausas.
export function textoDaVoz(roteiro) {
  return roteiro.linhas
    .map((l) => l.fala.replace(PAUSA, '').replace(/\s+/g, ' ').trim())
    .join('\n');
}

// Frases na ordem em que são ditas, com a última palavra e a pausa pedida depois.
// A pausa vem do {n} logo após a frase; sem {n}, null (fica a pausa da take).
// {+n} no meio de uma frase parte a frase ali (interna: true) e põe n s de silêncio
// a mais entre as duas palavras, para dar ênfase.
export function frases(roteiro) {
  const lista = [];
  for (const l of roteiro.linhas) {
    const tokens = l.fala.replace(TOM, ' ').split(/\s+/).filter(Boolean);
    let atual = [];
    for (const tk of tokens) {
      const extra = tk.match(/^\{\+(\d+(?:\.\d+)?)\}$/);
      if (extra) {
        if (!atual.length) throw new Error(`Pausa {+${extra[1]}} sem palavra antes: "${l.fala}"`);
        lista.push({ palavras: atual, ultima: atual.at(-1), pausa: Number(extra[1]), interna: true });
        atual = [];
        continue;
      }
      const p = tk.match(/^\{(\d+(?:\.\d+)?)\}$/);
      if (p) {
        if (atual.length || !lista.length) throw new Error(`Pausa {${p[1]}} fora do fim de uma frase: "${l.fala}"`);
        lista.at(-1).pausa = Number(p[1]);
        continue;
      }
      atual.push(tk);
      if (FIM_DE_FRASE.test(tk)) {
        lista.push({ palavras: atual, ultima: atual.at(-1), pausa: null });
        atual = [];
      }
    }
    if (atual.length) throw new Error(`A fala da linha termina sem ponto final: "${l.fala}"`);
  }
  return lista;
}

// Divide um texto em blocos de até `max` letras, quebrando sempre depois de fim de frase ou dois-pontos.
function blocosAutomaticos(texto, max = 20) {
  const blocos = [[]];
  let tam = 0;
  for (const w of texto.split(/\s+/).filter(Boolean)) {
    const b = blocos.at(-1);
    if (b.length && tam + 1 + w.length > max) {
      blocos.push([w]);
      tam = w.length;
    } else {
      b.push(w);
      tam += (b.length > 1 ? 1 : 0) + w.length;
    }
    if (/[.?!:]['"”’]?$/.test(w)) {
      blocos.push([]);
      tam = 0;
    }
  }
  return blocos.filter((b) => b.length).map((b) => b.join(' '));
}

// Palavras de tela: [{ linha, bloco, tela, fala: [chaves faladas] }].
// "{4|quatro}" mostra 4 e casa com "quatro" (ou "4") na transcrição.
export function palavrasDeTela(roteiro) {
  const lista = [];
  roteiro.linhas.forEach((l, i) => {
    const linha = i + 1;
    const blocos = l.tela ? l.tela.split('|').map((s) => s.trim()) : blocosAutomaticos(l.fala.replace(TOM, '').replace(PAUSA, '').trim());
    // "{4|quatro}" tem uma barra dentro: junta de novo os pedaços partidos.
    const juntos = [];
    for (const b of blocos) {
      if (juntos.length && /\{[^}]*$/.test(juntos.at(-1))) juntos[juntos.length - 1] += `|${b}`;
      else juntos.push(b);
    }
    juntos.forEach((b, bi) => {
      for (const tk of b.split(/\s+/).filter(Boolean)) {
        const m = tk.match(/^\{([^|}]+)\|([^}]+)\}(.*)$/);
        if (m) lista.push({ linha, bloco: bi, tela: m[1] + m[3], fala: m[2].split(/\s+/).map(limpa), alternativa: limpa(m[1]) });
        else lista.push({ linha, bloco: bi, tela: tk, fala: [limpa(tk)] });
      }
    });
  });
  return lista;
}

// Confere se a tela e a fala dizem as mesmas palavras, linha a linha.
export function confereTelaEFala(roteiro) {
  const tela = palavrasDeTela(roteiro);
  const erros = [];
  roteiro.linhas.forEach((l, i) => {
    const falado = l.fala.replace(TOM, ' ').replace(PAUSA, ' ').split(/\s+/).map(limpa).filter(Boolean).join(' ');
    const mostrado = tela.filter((p) => p.linha === i + 1).flatMap((p) => p.fala).join(' ');
    if (falado !== mostrado) erros.push(`linha ${i + 1}: fala "${falado}" / tela "${mostrado}"`);
  });
  return erros;
}
