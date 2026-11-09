import { gsap, ScrollTrigger, umo, varios } from './core';

// Câmera feita em código sobre três fotos da maquete. Tudo o que está dentro de
// um plano (pinos, rota, cabo) fica preso ao cenário porque recebe o mesmo transform.
type Camera = { z: number; fx: number; fy: number };

const PROPORCAO = 16 / 9;
// Onde fica a luz do totem principal na foto de perto, em fração da imagem.
const LUZ_TOTEM = [0.3225, 0.36] as const;
const LUZ_FAROL = [0.567, 0.713] as const;
// O ponto em que o cabo encontra o carro existe nas duas fotos: é por ele que elas se alinham.
const PLUGUE_MEIO = [0.525, 0.745] as const;
const PLUGUE_PERTO = [0.533, 0.756] as const;
const ESCALA_MEIO_PERTO = 2.5;

export function cenaAbertura() {
  const palco = umo('#abertura-palco');
  const retrato = matchMedia('(max-aspect-ratio: 1/1)').matches;
  // Na tela vertical não cabem o totem e o carro: a câmera mostra o totem e desliza pelo cabo até o carro.
  const PERTO_TOTEM: Camera = retrato ? { z: 1.03, fx: 0.44, fy: 0.47 } : { z: 1.25, fx: 0.56, fy: 0.48 };
  const PERTO_FINAL: Camera = retrato ? { z: 1.06, fx: 0.62, fy: 0.47 } : PERTO_TOTEM;
  const DURACAO_TOTEM = retrato ? 0.18 : 0.28;
  const LUZ_FINAL = retrato ? LUZ_FAROL : LUZ_TOTEM;
  const PERTO_INICIO: Camera = retrato ? { z: 1, fx: 0.4, fy: 0.5 } : { z: 1.04, fx: 0.5, fy: 0.5 };

  const planos = {
    geral: umo('[data-plano="geral"]'),
    meio: umo('[data-plano="meio"]'),
    perto: umo('[data-plano="perto"]'),
  };
  const lista = Object.keys(planos) as (keyof typeof planos)[];
  const cameras: Record<keyof typeof planos, Camera> = {
    geral: { z: 1, fx: 0.5, fy: 0.5 },
    meio: { z: 1, fx: 0.55, fy: 0.5 },
    perto: { ...PERTO_INICIO },
  };

  let W = 0;
  let H = 0;
  let base = 0;
  const alvoY = () => H * (retrato ? 0.42 : 0.5);

  // Translação que põe o foco no alvo sem nunca mostrar a borda da foto.
  const enquadrar = (c: Camera) => {
    const largura = base * c.z;
    const altura = (base / PROPORCAO) * c.z;
    const x = Math.min(0, Math.max(W - largura, W / 2 - c.fx * largura));
    const y = Math.min(0, Math.max(H - altura, alvoY() - c.fy * altura));
    return { x, y, largura, altura };
  };

  // Câmera da foto de meia distância que coincide com a foto de perto em `c`.
  const travada = (c: Camera): Camera => {
    const perto = enquadrar(c);
    const z = c.z * ESCALA_MEIO_PERTO;
    const largura = base * z;
    const altura = largura / PROPORCAO;
    const x = perto.x + PLUGUE_PERTO[0] * perto.largura - PLUGUE_MEIO[0] * largura;
    const y = perto.y + PLUGUE_PERTO[1] * perto.altura - PLUGUE_MEIO[1] * altura;
    return { z, fx: (W / 2 - x) / largura, fy: (alvoY() - y) / altura };
  };
  // Onde a foto de perto está quando a troca de fotos termina.
  const pertoNoFimDaTroca = (): Camera => {
    const t = 0.14 / DURACAO_TOTEM;
    return {
      z: PERTO_INICIO.z + (PERTO_TOTEM.z - PERTO_INICIO.z) * t,
      fx: PERTO_INICIO.fx + (PERTO_TOTEM.fx - PERTO_INICIO.fx) * t,
      fy: PERTO_INICIO.fy + (PERTO_TOTEM.fy - PERTO_INICIO.fy) * t,
    };
  };

  const renderizar = () => {
    for (const nome of lista) {
      const plano = planos[nome];
      const c = cameras[nome];
      const { x, y } = enquadrar(c);
      plano.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${c.z})`;
      plano.style.setProperty('--contra', String(1 / c.z));
    }
  };

  const medir = () => {
    W = palco.clientWidth;
    H = palco.clientHeight;
    base = Math.max(W, H * PROPORCAO);
    for (const nome of lista) {
      planos[nome].style.width = `${base}px`;
      planos[nome].style.height = `${base / PROPORCAO}px`;
    }
    renderizar();
  };
  medir();
  ScrollTrigger.addEventListener('refreshInit', medir);

  // As fotos de perto só baixam depois do LCP.
  const carregar = () => {
    for (const img of varios<HTMLImageElement>('img[data-srcset]', palco)) {
      img.srcset = img.dataset.srcset!;
    }
  };
  const depoisDoLCP = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(carregar, { timeout: 1500 });
    else setTimeout(carregar, 400);
  };
  if (document.readyState === 'complete') depoisDoLCP();
  else addEventListener('load', depoisDoLCP, { once: true });

  const pontoNaTela = () => {
    const { x, y, largura, altura } = enquadrar(PERTO_FINAL);
    return { x: x + LUZ_FINAL[0] * largura, y: y + LUZ_FINAL[1] * altura };
  };

  const final = umo('#abertura-final');
  const pontoLogo = umo<SVGPathElement>('.logo-ponto', final);
  const ponto = umo('#abertura-ponto');
  const noLogo = () => {
    const r = pontoLogo.getBoundingClientRect();
    const p = palco.getBoundingClientRect();
    return { x: r.left - p.left + r.width / 2, y: r.top - p.top + r.height / 2, escala: r.width / 28 };
  };

  const passos = varios('.abertura-passo');
  const pinosGeral = varios('[data-plano="geral"] .marca-pop');
  const pinosMeio = varios('[data-plano="meio"] .marca-pop');
  const rota = varios<SVGPathElement>('.cena-rota, .cena-rota-brilho');
  const cabeca = umo<SVGCircleElement>('.cena-cabeca');
  const trilho = umo<SVGPathElement>('.cena-rota');
  const cabo = umo<SVGPathElement>('.cena-cabo');
  const antes = umo('.cena-chip [data-fase="antes"]');
  const depois = umo('.cena-chip [data-fase="depois"]');
  const confirmacao = umo('.abertura-confirmacao');
  const focoMeio = umo('.plano-foco');
  const anel = umo('.cena-anel');
  const carga = umo('.cena-carga');
  const celulas = varios('.cena-carga-celula');

  gsap.set(pontoLogo, { autoAlpha: 0 });
  gsap.set(final, { autoAlpha: 0 });
  gsap.set(passos, { autoAlpha: 0, y: 22 });
  gsap.set([planos.meio, planos.perto], { autoAlpha: 0 });
  gsap.set(pinosGeral, { autoAlpha: 0, scale: 0.4 });
  gsap.set(pinosMeio, { autoAlpha: 0, scale: 0.4 });
  gsap.set(rota, { drawSVG: '0%' });
  gsap.set(cabeca, { autoAlpha: 0 });
  gsap.set(cabo, { drawSVG: '0%' });
  gsap.set(confirmacao, { autoAlpha: 0 });
  gsap.set(focoMeio, { autoAlpha: 0 });
  gsap.set(antes, { autoAlpha: 1 });
  gsap.set(depois, { autoAlpha: 0 });
  gsap.set(anel, { autoAlpha: 0, scale: 0.5 });
  gsap.set(carga, { autoAlpha: 0, y: 8 });
  gsap.set(celulas, { autoAlpha: 0.18 });
  gsap.set(ponto, { autoAlpha: 0, scale: 0.5, '--halo': 1 });
  // O voo final parte daqui: precisa acompanhar o tamanho da tela. Roda depois de `medir`.
  const posicionarPonto = () => gsap.set(ponto, pontoNaTela());
  posicionarPonto();
  ScrollTrigger.addEventListener('refreshInit', posicionarPonto);

  const linha = gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate: renderizar,
    scrollTrigger: {
      trigger: '#abertura',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.7,
      invalidateOnRefresh: true,
    },
  });

  // Câmera: vista geral, desce até o eletroposto e termina no totem.
  linha.to(cameras.geral, { z: 1.25, fx: 0.52, fy: 0.52, duration: 0.26 }, 0);
  linha.to(cameras.geral, { z: 2.84, fx: 0.587, fy: 0.57, duration: 0.24, ease: 'power1.in' }, 0.26);
  linha.to(planos.meio, { autoAlpha: 1, duration: 0.08 }, 0.42);
  // A câmera chega ao carro na foto do meio; a de perto entra já alinhada e as duas seguem juntas.
  linha.to(
    cameras.meio,
    {
      z: () => travada(PERTO_INICIO).z,
      fx: () => travada(PERTO_INICIO).fx,
      fy: () => travada(PERTO_INICIO).fy,
      duration: 0.16,
      ease: 'power1.out',
    },
    0.42,
  );
  linha.to(
    cameras.meio,
    {
      z: () => travada(pertoNoFimDaTroca()).z,
      fx: () => travada(pertoNoFimDaTroca()).fx,
      fy: () => travada(pertoNoFimDaTroca()).fy,
      duration: 0.14,
    },
    0.58,
  );
  // A foto do meio perde o foco antes da troca, como a lente ajustando: esconde a diferença de perspectiva.
  linha.to(focoMeio, { autoAlpha: 1, duration: 0.08, ease: 'sine.inOut' }, 0.54);
  linha.to(pinosMeio, { autoAlpha: 0, duration: 0.04 }, 0.54);
  linha.to(planos.perto, { autoAlpha: 1, duration: 0.14, ease: 'sine.inOut' }, 0.58);
  linha.to(cameras.perto, { ...PERTO_TOTEM, duration: DURACAO_TOTEM }, 0.58);
  if (retrato) linha.to(cameras.perto, { ...PERTO_FINAL, duration: 0.1, ease: 'power1.inOut' }, 0.76);

  // O card sai logo no começo, para a câmera ter a cena toda.
  linha.to('#abertura-rolar', { autoAlpha: 0, duration: 0.02 }, 0);
  linha.to('#abertura-card', { autoAlpha: 0, y: -36, duration: 0.05, ease: 'power2.in' }, 0.02);

  // 1. Os status aparecem sobre os postos da cidade.
  linha.to(pinosGeral, { autoAlpha: 1, scale: 1, duration: 0.03, stagger: 0.012, ease: 'entrada' }, 0.09);

  // 2. A luz corre pelo fio até o eletroposto.
  linha.set(cabeca, { autoAlpha: 1 }, 0.27);
  linha.to(rota, { drawSVG: '100%', duration: 0.15 }, 0.27);
  linha.to(cabeca, { motionPath: { path: trilho, align: trilho, alignOrigin: [0.5, 0.5] }, duration: 0.15 }, 0.27);
  linha.to(cabeca, { autoAlpha: 0, duration: 0.02 }, 0.42);
  linha.to(pinosMeio, { autoAlpha: 1, scale: 1, duration: 0.03, stagger: 0.01, ease: 'entrada' }, 0.47);

  // 3. Alguém confirma, o status muda e o carro carrega.
  linha.to(antes, { autoAlpha: 0, duration: 0.02 }, 0.725);
  linha.to(depois, { autoAlpha: 1, duration: 0.02 }, 0.735);
  linha.to(confirmacao, { autoAlpha: 1, duration: 0.02 }, 0.735);
  linha.to(anel, { autoAlpha: 0.9, scale: 1, duration: 0.02, ease: 'entrada' }, 0.735);
  linha.to(anel, { autoAlpha: 0, scale: 1.6, duration: 0.05 }, 0.755);
  linha.to(cabo, { drawSVG: '100%', duration: 0.06 }, 0.755);
  linha.to(carga, { autoAlpha: 1, y: 0, duration: 0.02, ease: 'entrada' }, 0.775);
  linha.to(celulas, { autoAlpha: 1, duration: 0.012, stagger: 0.011 }, 0.785);

  const janelas = [
    [0.1, 0.24],
    [0.27, 0.52],
    [0.58, 0.8],
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
    ScrollTrigger.removeEventListener('refreshInit', medir);
    ScrollTrigger.removeEventListener('refreshInit', posicionarPonto);
    for (const nome of lista) {
      planos[nome].style.removeProperty('transform');
      planos[nome].style.removeProperty('width');
      planos[nome].style.removeProperty('height');
    }
  };
}
