import { gsap, umo, varios } from './core';

// Sequência de quadros do vídeo, desenhada no canvas conforme a rolagem.
// `luz` é onde fica o ponto aceso no último quadro, em fração do quadro.
const CONJUNTOS = {
  desktop: { pasta: 'desktop', total: 120, largura: 1364, altura: 768, luz: [0.176, 0.794] },
  celular: { pasta: 'celular', total: 60, largura: 492, altura: 768, luz: [0.482, 0.794] },
} as const;

type Conexao = { saveData?: boolean };

export function cenaAbertura() {
  const palco = umo('#abertura-palco');
  const canvas = umo<HTMLCanvasElement>('#abertura-canvas');
  const contexto = canvas.getContext('2d', { alpha: false });
  if (!contexto) return () => {};

  const retrato = matchMedia('(max-aspect-ratio: 1/1)').matches;
  const c = retrato ? CONJUNTOS.celular : CONJUNTOS.desktop;
  canvas.width = c.largura;
  canvas.height = c.altura;

  const url = (i: number) => `/frames/${c.pasta}/f${String(i).padStart(3, '0')}.webp`;
  const quadros: (HTMLImageElement | undefined)[] = new Array(c.total);
  let desenhado = -1;
  let alvo = 0;
  let parar = false;

  const maisPerto = (i: number) => {
    for (let d = 0; d < c.total; d++) {
      if (quadros[i - d]) return i - d;
      if (quadros[i + d]) return i + d;
    }
    return -1;
  };

  const desenhar = () => {
    const i = maisPerto(alvo);
    if (i < 0 || i === desenhado) return;
    contexto.drawImage(quadros[i]!, 0, 0, c.largura, c.altura);
    if (desenhado < 0) canvas.classList.add('pronto');
    desenhado = i;
  };

  // Primeiro uma grade esparsa, depois preenche: a cena já funciona enquanto carrega.
  const ordem: number[] = [];
  const vistos = new Set<number>();
  for (const passo of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < c.total; i += passo) {
      if (!vistos.has(i)) { vistos.add(i); ordem.push(i); }
    }
    if (passo === 16 && !vistos.has(c.total - 1)) { vistos.add(c.total - 1); ordem.push(c.total - 1); }
  }
  const economia = (navigator as Navigator & { connection?: Conexao }).connection?.saveData === true;
  const fila = economia ? ordem.filter((i) => i % 8 === 0 || i === c.total - 1) : ordem;
  let proximo = 0;

  const baixar = async () => {
    while (!parar && proximo < fila.length) {
      const i = fila[proximo++]!;
      const img = new Image();
      img.src = url(i);
      try {
        await img.decode();
        quadros[i] = img;
        desenhar();
      } catch {
        // Quadro perdido: a cena usa o vizinho mais próximo.
      }
    }
  };

  const comecar = () => {
    if (parar) return;
    for (let n = 0; n < 4; n++) void baixar();
  };
  const depoisDoLCP = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(comecar, { timeout: 1500 });
    else setTimeout(comecar, 400);
  };
  if (document.readyState === 'complete') depoisDoLCP();
  else addEventListener('load', depoisDoLCP, { once: true });

  // Onde o ponto aceso cai na tela, respeitando o object-fit: cover.
  const noPalco = () => {
    const W = palco.clientWidth;
    const H = palco.clientHeight;
    const escala = Math.max(W / c.largura, H / c.altura);
    const dw = c.largura * escala;
    const dh = c.altura * escala;
    return { x: (W - dw) / 2 + c.luz[0] * dw, y: (H - dh) / 2 + c.luz[1] * dh };
  };

  const final = umo('#abertura-final');
  const pontoLogo = umo<SVGPathElement>('.logo-ponto', final);
  const ponto = umo('#abertura-ponto');
  const noLogo = () => {
    const r = pontoLogo.getBoundingClientRect();
    const p = palco.getBoundingClientRect();
    return { x: r.left - p.left + r.width / 2, y: r.top - p.top + r.height / 2, escala: r.width / 28 };
  };

  const estado = { quadro: 0 };
  const passos = varios('.abertura-passo');
  gsap.set(pontoLogo, { autoAlpha: 0 });
  gsap.set(final, { autoAlpha: 0 });
  gsap.set(passos, { autoAlpha: 0, y: 22 });
  gsap.set(ponto, { autoAlpha: 0, x: () => noPalco().x, y: () => noPalco().y, scale: 0.5, '--halo': 1 });

  const linha = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#abertura',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.7,
      invalidateOnRefresh: true,
    },
  });

  linha.to(
    estado,
    {
      quadro: c.total - 1,
      duration: 0.86,
      onUpdate: () => {
        alvo = Math.round(estado.quadro);
        desenhar();
      },
    },
    0,
  );

  // O card sai logo no começo, para a câmera ter a cena toda.
  linha.to('#abertura-rolar', { autoAlpha: 0, duration: 0.02 }, 0);
  linha.to('#abertura-card', { autoAlpha: 0, y: -36, duration: 0.05, ease: 'power2.in' }, 0.02);

  const janelas = [
    [0.1, 0.27],
    [0.31, 0.5],
    [0.54, 0.8],
  ] as const;
  passos.forEach((passo, i) => {
    const [ini, fim] = janelas[i]!;
    linha.to(passo, { autoAlpha: 1, y: 0, duration: 0.035, ease: 'entrada' }, ini);
    linha.to(passo, { autoAlpha: 0, y: -22, duration: 0.03, ease: 'power2.in' }, fim);
  });

  // A cena apaga, o ponto aceso fica e voa até virar o ponto final da assinatura.
  linha.set(ponto, { autoAlpha: 1 }, 0.83);
  linha.to(final, { autoAlpha: 1, duration: 0.05 }, 0.85);
  linha.to(ponto, { x: () => noLogo().x, duration: 0.09, ease: 'power1.inOut' }, 0.885);
  linha.to(ponto, { y: () => noLogo().y, duration: 0.09, ease: 'power3.inOut' }, 0.885);
  linha.to(ponto, { scale: () => noLogo().escala, duration: 0.09, ease: 'power2.inOut' }, 0.885);
  linha.to(ponto, { '--halo': 0, duration: 0.05 }, 0.925);
  linha.set(pontoLogo, { autoAlpha: 1 }, 0.976);
  linha.set(ponto, { autoAlpha: 0 }, 0.977);
  linha.to({}, { duration: 0.023 }, 0.977);

  return () => {
    parar = true;
    canvas.classList.remove('pronto');
  };
}
