import { gsap, umo, varios } from './core';

// Telas vivas: o estado muda com o texto que passa ao lado.
export function cenaComo(largo: boolean) {
  const antes = (k: string) => varios(`[data-tela-fase="${k}"][data-fase="antes"]`);
  const depois = (k: string) => varios(`[data-tela-fase="${k}"][data-fase="depois"]`);
  const passos = varios('.passo');
  const celMapa = umo('.celular-mapa');
  const celDetalhe = umo('.celular-detalhe');
  const dedo = umo('#dedo');
  const alerta = umo('#tela-alerta');
  const celBloqueio = umo('.celular-bloqueio');
  const dedoFiltro = umo('#dedo-filtro');
  const dedoSheet = umo('#dedo-sheet');
  const sheet = umo('#tela-sheet');
  const marcaLivre = umo('.tela-sheet-opcao[data-opcao="livre"] .tela-sheet-marca');
  const filtraveis = varios('.tela-pin[data-filtravel]');
  const rotaTela = varios<SVGPathElement>('#tela-rota, .tela-rota-contorno');
  const pontoInterno = umo('#tela-ponto i');
  const linhaNova = umo('.tela-historico li[data-novo] .tela-historico-texto');
  const rotuloCheckin = umo('.tela-checkin-rotulo');
  const feito = umo('.tela-checkin-feito');
  const botaoCheckin = umo('#tela-checkin');

  // Volta para o começo da história: o HTML traz o final.
  gsap.set('[data-tela-fase][data-fase="antes"]', { autoAlpha: 1 });
  gsap.set('[data-tela-fase][data-fase="depois"]', { autoAlpha: 0 });
  gsap.set(rotaTela, { drawSVG: '0%' });
  gsap.set(alerta, { autoAlpha: 0, yPercent: -130 });
  gsap.set(celBloqueio, { autoAlpha: 0 });
  gsap.set(filtraveis, { autoAlpha: 1 });
  gsap.set(sheet, { yPercent: 105 });
  gsap.set(marcaLivre, { autoAlpha: 0 });
  gsap.set(rotuloCheckin, { autoAlpha: 1 });
  gsap.set(feito, { autoAlpha: 0 });
  gsap.set(pontoInterno, { autoAlpha: 0, scale: 0.5 });
  gsap.set(linhaNova, { autoAlpha: 0 });
  // No desktop as duas telas aparecem: só a ativa fica acesa, e só ela mostra Brasa sólido.
  const APAGADA = 0.3;
  gsap.set(celDetalhe, { autoAlpha: largo ? APAGADA : 0 });

  // No celular o texto é um cartão que sobe por cima da tela: a história
  // acontece enquanto ele chega, com a tela ainda à vista.
  const trecho = (i: number) => {
    const passo = passos[i]!;
    const linha = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: largo
        ? { trigger: passo, start: 'top 72%', end: 'bottom 72%', scrub: 0.6 }
        : { trigger: umo('.passo-cartao', passo), start: 'top 98%', end: 'top 40%', scrub: 0.6 },
    });
    // Duração fixa em 1: as posições abaixo são frações reais do trecho rolado.
    return linha.to({}, { duration: 1 }, 0);
  };

  // 1. Consultar: o pin vira "Livre", o filtro limpa o mapa e a rota aparece.
  const um = trecho(0);
  for (const k of ['pin', 'folha', 'confirma']) {
    um.to(antes(k), { autoAlpha: 0, duration: 0.08 }, 0.12);
    um.to(depois(k), { autoAlpha: 1, duration: 0.08 }, 0.15);
  }
  const pinSel = umo('.tela-pin-sel');
  gsap.set(pinSel, { x: 0, y: 0, xPercent: -50, yPercent: -100, transformOrigin: '50% 100%' });
  um.to(pinSel, { scale: 1.16, duration: 0.07 }, 0.12);
  um.to(pinSel, { scale: 1, duration: 0.08 }, 0.19);
  um.fromTo(dedoFiltro, { autoAlpha: 0, y: 120 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: 'entrada' }, 0.28);
  um.to(dedoFiltro, { scale: 0.78, duration: 0.04 }, 0.44);
  um.to(dedoFiltro, { scale: 1, duration: 0.04 }, 0.48);
  um.to(antes('filtro'), { autoAlpha: 0, duration: 0.04 }, 0.47);
  um.to(depois('filtro'), { autoAlpha: 1, duration: 0.04 }, 0.47);
  um.to(filtraveis, { autoAlpha: 0, duration: 0.06, stagger: 0.008 }, 0.49);
  um.to(dedoFiltro, { autoAlpha: 0, y: 40, duration: 0.08 }, 0.54);
  um.to(rotaTela, { drawSVG: '100%', duration: 0.36 }, 0.6);

  // 2. Confirmar: check-in, escolha do status, o ponto acende na linha do tempo.
  const dois = trecho(1);
  dois.to(celMapa, { autoAlpha: largo ? APAGADA : 0, duration: 0.07 }, 0.02);
  dois.to(celDetalhe, { autoAlpha: 1, duration: 0.07 }, 0.04);
  dois.fromTo(dedo, { autoAlpha: 0, y: 150 }, { autoAlpha: 1, y: -44, duration: 0.12, ease: 'entrada' }, 0.1);
  dois.to(dedo, { scale: 0.78, duration: 0.03 }, 0.23);
  dois.to(botaoCheckin, { scale: 0.97, duration: 0.03 }, 0.23);
  dois.to(dedo, { scale: 1, duration: 0.03 }, 0.26);
  dois.to(botaoCheckin, { scale: 1, duration: 0.03 }, 0.26);
  dois.to(dedo, { autoAlpha: 0, y: 40, duration: 0.05 }, 0.28);
  dois.to(sheet, { yPercent: 0, duration: 0.1, ease: 'entrada' }, 0.3);
  dois.fromTo(dedoSheet, { autoAlpha: 0, y: 130 }, { autoAlpha: 1, y: 0, duration: 0.1, ease: 'entrada' }, 0.4);
  dois.to(dedoSheet, { scale: 0.78, duration: 0.03 }, 0.52);
  dois.to(marcaLivre, { autoAlpha: 1, duration: 0.03 }, 0.53);
  dois.to(dedoSheet, { scale: 1, duration: 0.03 }, 0.55);
  dois.to(dedoSheet, { autoAlpha: 0, y: 40, duration: 0.05 }, 0.58);
  dois.to(sheet, { yPercent: 105, duration: 0.08, ease: 'power2.in' }, 0.62);
  dois.to(rotuloCheckin, { autoAlpha: 0, duration: 0.04 }, 0.68);
  dois.to(feito, { autoAlpha: 1, duration: 0.04 }, 0.68);
  dois.to(pontoInterno, { autoAlpha: 1, scale: 1, duration: 0.08, ease: 'entrada' }, 0.72);
  dois.to(linhaNova, { autoAlpha: 1, duration: 0.07 }, 0.75);
  dois.to(antes('idade'), { autoAlpha: 0, duration: 0.05 }, 0.78);
  dois.to(depois('idade'), { autoAlpha: 1, duration: 0.05 }, 0.8);

  // 3. Ser avisado: o celular está bloqueado e o alerta chega.
  const tres = trecho(2);
  tres.to(celDetalhe, { autoAlpha: largo ? APAGADA : 0, duration: 0.08 }, 0.02);
  tres.to(celMapa, { autoAlpha: 0, duration: 0.08 }, 0.02);
  tres.to(celBloqueio, { autoAlpha: 1, duration: 0.08 }, 0.05);
  tres.to(alerta, { autoAlpha: 1, yPercent: 0, duration: 0.18, ease: 'entrada' }, 0.26);
}
