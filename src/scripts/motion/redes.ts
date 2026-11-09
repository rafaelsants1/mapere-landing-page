import { gsap, umo, varios } from './core';

// A luz Brasa contorna a cidade enquanto a cidade em arame se aproxima.
export function cenaRedes() {
  const linhas = varios<SVGPathElement>('.redes-limite-linha');
  const brilhos = varios<SVGPathElement>('.redes-limite-brilho');
  const luz = varios<SVGCircleElement>('.redes-luz, .redes-luz-brilho');
  const notas = umo('.redes-notas');
  const enquadre = umo('#redes-enquadre');
  const principal = linhas[0]!;

  gsap.set(notas, { autoAlpha: 0, y: 16 });
  gsap.set(luz, { autoAlpha: 0 });

  // A cidade surge junto com a volta para a noite.
  gsap.fromTo(
    enquadre,
    { autoAlpha: 0 },
    { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: '#redes', start: 'top 62%', end: 'top 12%', scrub: 0.6 } },
  );

  const linha = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#redes', start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });

  linha.fromTo(umo('img', enquadre), { scale: 1.07 }, { scale: 1, duration: 1, transformOrigin: '70% 55%' }, 0);
  linha.set(luz, { autoAlpha: 1 }, 0.03);
  linha.fromTo(principal, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.74 }, 0.03);
  linha.fromTo(brilhos[0]!, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.74 }, 0.03);
  linha.to(luz, { motionPath: { path: principal, align: principal, alignOrigin: [0.5, 0.5] }, duration: 0.74 }, 0.03);
  linhas.slice(1).forEach((l, i) => {
    linha.fromTo([l, brilhos[i + 1]!], { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.2 }, 0.56);
  });
  linha.to(luz, { autoAlpha: 0, duration: 0.04 }, 0.77);

  linha.to(notas, { autoAlpha: 1, y: 0, duration: 0.06, ease: 'entrada' }, 0.8);
  linha.to({}, { duration: 0.1 }, 0.9);
}
