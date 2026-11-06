import { gsap, umo, varios } from './core';

// A linha desce e acende cada pin; a cortina prova que o status vive sem cor.
export function cenaStatus() {
  const fio = umo<SVGPathElement>('#status-fio');
  const itens = varios('.status-item');
  const palco = umo('#status-palco');

  const linha = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: palco, start: 'top 72%', end: 'bottom 62%', scrub: 0.7 },
  });

  linha.fromTo(fio, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1 }, 0);
  itens.forEach((item, i) => {
    const chegada = i / (itens.length - 1);
    const pin = umo('.status-pin', item);
    const texto = varios('.status-nome, .status-texto, .status-exemplo', item);
    const vazio = umo('.status-pin-vazio', pin);
    const quando = Math.max(0, chegada - 0.04);
    linha.fromTo(pin, { scale: 0.82 }, { scale: 1, duration: 0.09, ease: 'entrada' }, quando);
    linha.fromTo(vazio, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.09 }, quando);
    linha.fromTo(texto, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.14, stagger: 0.03, ease: 'entrada' }, Math.min(0.86, chegada));
  });
}

export function cortinaCinza() {
  const cortina = umo('#status-cortina');
  const palco = umo('#status-palco');
  return (ligado: boolean) => {
    palco.toggleAttribute('data-cinza', ligado);
    gsap.to(cortina, { scaleX: ligado ? 1 : 0, duration: 0.6, ease: 'power2.inOut', overwrite: true });
  };
}
