import { gsap, umo, varios } from './core';

// Momento de marca: a linha atravessa a tela e acende os pontos em sequência.
export function cenaMomento() {
  const trechos = varios<SVGPathElement>('.momento-trecho');
  const pontos = varios<SVGCircleElement>('.momento-ponto');

  gsap.set(pontos, { autoAlpha: 0, scale: 0.5, transformOrigin: '50% 50%' });

  const linha = gsap.timeline({
    paused: true,
    scrollTrigger: { trigger: umo('#momento'), start: 'top 40%', toggleActions: 'play none none reverse' },
  });

  trechos.forEach((trecho, i) => {
    // Até 800 ms por trecho: o limite dos momentos de marca.
    linha.fromTo(trecho, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.72, ease: 'none' }, i === 0 ? 0 : '>');
    const ponto = pontos[i];
    if (ponto) linha.to(ponto, { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'entrada' }, '>-0.1');
  });
}
