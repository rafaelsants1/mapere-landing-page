import { gsap, umo, varios } from './core';

// O traçado avança com a rolagem; cada pin acende quando a rota chega nele,
// e a anotação com o número entra só depois.
export function cenaProblema(largo: boolean) {
  const rota = umo<SVGPathElement>('#mapa-rota');
  const brilho = umo<SVGPathElement>('.mapa-rota-brilho');
  const luz = [umo<SVGCircleElement>('.mapa-luz'), umo<SVGCircleElement>('.mapa-luz-brilho')];
  const arterias = varios<SVGPathElement>('.mapa-arterias path');
  const aneis = varios('.mapa-ruas');
  const pins = varios('.mapa-pin');
  const extras = varios('.mapa-pin-extra');
  const paradas = varios('.parada');
  const guias = varios<SVGPathElement>('.mapa-guias path');

  // Em celular só as vias longas são desenhadas: as curtas entram junto da malha.
  const desenhadas = largo ? arterias : arterias.filter((a) => Number(a.dataset.t) > 110);
  const curtas = arterias.filter((a) => !desenhadas.includes(a));
  const maxQ = Math.max(...arterias.map((a) => Number(a.dataset.q)));

  gsap.set(luz, { attr: { cx: 0, cy: 0 } });
  gsap.set(aneis, { autoAlpha: 0 });
  if (curtas.length) gsap.set(curtas, { autoAlpha: 0 });
  gsap.set([...pins, ...extras], { autoAlpha: 0, scale: 0.6, xPercent: -50, yPercent: -100, x: 0, y: 0, transformOrigin: '50% 100%' });
  gsap.set(paradas, { autoAlpha: 0, y: 12 });

  const INICIO = 0.05;
  const PERCURSO = 0.83;

  const linha = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#problema', start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });

  desenhadas.forEach((via) => {
    const quando = 0.01 + 0.68 * (Number(via.dataset.q) / maxQ);
    linha.fromTo(via, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.22 }, quando);
  });
  if (curtas.length) linha.to(curtas, { autoAlpha: 1, duration: 0.2 }, 0.45);

  [0.06, 0.26, 0.48].forEach((quando, i) => {
    linha.to(aneis[i]!, { autoAlpha: 1, duration: 0.2 }, quando);
  });

  linha.fromTo([rota, brilho], { drawSVG: '0%' }, { drawSVG: '100%', duration: PERCURSO }, INICIO);
  linha.to(
    luz,
    { motionPath: { path: rota, align: rota, alignOrigin: [0.5, 0.5] }, duration: PERCURSO },
    INICIO,
  );

  pins.forEach((pin, i) => {
    const chegada = INICIO + PERCURSO * Number(pin.dataset.t);
    linha.to(pin, { autoAlpha: 1, scale: 1, duration: 0.03, ease: 'entrada' }, chegada);
    const nota = paradas[i]!;
    linha.to(nota, { autoAlpha: 1, y: 0, duration: 0.035, ease: 'entrada' }, chegada + 0.035);
    const guia = guias[i];
    if (guia) linha.fromTo(guia, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.03 }, chegada + 0.02);
    // Sem espaço ao lado do mapa, cada nota dá lugar à próxima.
    const seguinte = pins[i + 1];
    if (!largo && seguinte) {
      const saida = INICIO + PERCURSO * Number(seguinte.dataset.t) - 0.005;
      linha.to(nota, { autoAlpha: 0, y: -10, duration: 0.025, ease: 'power2.in' }, saida);
    }
  });

  extras.forEach((pin, i) => {
    linha.to(pin, { autoAlpha: 1, scale: 1, duration: 0.03, ease: 'entrada' }, 0.32 + i * 0.3);
  });

  linha.to({}, { duration: 0.04 }, 0.96);
}
