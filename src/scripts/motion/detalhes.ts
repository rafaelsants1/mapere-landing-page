import { gsap, ScrollTrigger, SplitText, umo, varios } from './core';

// Títulos: linha a linha, com máscara. Nunca letra por letra.
export function titulos() {
  const instancias = varios('[data-titulo]').map((el) =>
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'linha-titulo',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 112,
          duration: 0.8,
          stagger: 0.07,
          ease: 'entrada',
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        });
      },
    }),
  );
  return () => instancias.forEach((i) => i.revert());
}

// Troca Noite/Linho guiada pela rolagem, em faixas sem texto.
export function fundos() {
  const claro = umo('#fundo-claro');
  const topo = umo('#topo');
  // O véu e o logo do cabeçalho acompanham a mesma troca de fundo.
  const refletir = () => {
    const opacidade = Number(gsap.getProperty(claro, 'opacity'));
    topo.style.setProperty('--veu', opacidade.toFixed(3));
    topo.dataset.sobre = opacidade > 0.5 ? 'linho' : 'noite';
  };
  const faixa = (inicio: Element, de: string, para: string, alvo: number, disparo = inicio) =>
    gsap.to(claro, {
      opacity: alvo,
      ease: 'none',
      immediateRender: false,
      onUpdate: refletir,
      scrollTrigger: { trigger: disparo, start: de, end: para, scrub: 0.6 },
    });

  const como = umo('#como-funciona');
  const status = umo('#status');
  const perguntas = umo('#perguntas');
  for (const secao of [como, status, perguntas]) {
    ScrollTrigger.create({
      trigger: secao,
      start: 'top bottom',
      end: 'bottom top',
      toggleClass: { targets: secao, className: 'fundo-vivo' },
    });
  }
  faixa(como, 'top 82%', 'top 40%', 1);
  faixa(status, 'bottom 86%', 'bottom 44%', 0);
  faixa(perguntas, 'top 82%', 'top 44%', 1);
  faixa(perguntas, 'bottom 76%', 'bottom 36%', 0);

  // A cena de Noite se dissolve antes do Linho tomar a tela.
  const dissolver = (cena: string, disparo: Element) =>
    gsap.to(cena, {
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: { trigger: disparo, start: 'top 98%', end: 'top 58%', scrub: 0.6 },
    });
  dissolver('#problema-palco', como);
  dissolver('#momento-palco', perguntas);
}

// Perguntas: os pontos aparecem em sequência, vazados, esperando a luz.
export function cenaPerguntas() {
  const pontos = varios('.perguntas-ponto');
  gsap.from(pontos, {
    autoAlpha: 0,
    scale: 0.6,
    duration: 0.28,
    stagger: 0.06,
    scrollTrigger: { trigger: '.perguntas-lista', start: 'top 78%', once: true },
  });
}

// Fim da página: as letras sobem e o ponto final acende por último.
export function cenaRodape() {
  const logo = umo('.rodape-marca .logo');
  const formas = varios<SVGPathElement>('path:not(.logo-ponto)', logo);
  const ponto = umo<SVGPathElement>('.logo-ponto', logo);

  gsap.set(ponto, { autoAlpha: 0, scale: 0.5, transformOrigin: '50% 50%' });
  const linha = gsap.timeline({
    scrollTrigger: { trigger: logo, start: 'top 92%', toggleActions: 'play none none reverse' },
  });
  linha.from(formas, { yPercent: 18, autoAlpha: 0, duration: 0.7, stagger: 0.05, ease: 'entrada' }, 0);
  linha.to(ponto, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'entrada' }, '>-0.15');
}

export function atualizarDepoisDasFontes() {
  void document.fonts.ready.then(() => ScrollTrigger.refresh());
}
