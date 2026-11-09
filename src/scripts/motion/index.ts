import { gsap, iniciarLenis, ScrollTrigger } from './core';
import { cenaAbertura } from './abertura';
import { cenaProblema } from './problema';
import { cenaComo } from './como';
import { cenaStatus, cortinaCinza } from './status';
import { cenaRedes } from './redes';
import { cenaMomento } from './momento';
import { atualizarDepoisDasFontes, cenaPerguntas, cenaRodape, fundos, titulos } from './detalhes';

export interface Movimento {
  irPara: (alvo: HTMLElement) => void;
  cinza: (ligado: boolean) => void;
}

// Devolve a vez ao navegador entre uma cena e outra, para não criar tarefa longa.
const respirar = () =>
  new Promise<void>((pronto) => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => pronto(), { timeout: 150 });
    else setTimeout(pronto, 32);
  });

export function iniciarMovimento(): Movimento {
  const mm = gsap.matchMedia();
  let irPara: Movimento['irPara'] = (alvo) => alvo.scrollIntoView();

  // A orientação entra nas condições porque o enquadramento da abertura depende dela.
  const condicoes = {
    largo: '(min-width: 1000px)',
    estreito: '(max-width: 999px)',
    retrato: '(max-aspect-ratio: 1/1)',
    paisagem: '(min-aspect-ratio: 1/1)',
  };
  mm.add(condicoes, (contexto) => {
    const { largo } = contexto.conditions as { largo: boolean };

    const lenis = iniciarLenis();
    irPara = lenis.irPara;

    // A abertura é imediata. As outras cenas entram em sequência, de cima para baixo,
    // bem antes de a rolagem chegar nelas.
    const desfazerAbertura = cenaAbertura();
    let desfazerTitulos = () => {};
    let cancelado = false;

    const etapas = [
      () => cenaProblema(largo),
      () => cenaComo(largo),
      cenaStatus,
      cenaRedes,
      cenaMomento,
      cenaPerguntas,
      cenaRodape,
      fundos,
      () => {
        desfazerTitulos = titulos();
      },
    ];

    void (async () => {
      for (const etapa of etapas) {
        await respirar();
        if (cancelado) return;
        contexto.add(etapa);
      }
      ScrollTrigger.refresh();
      atualizarDepoisDasFontes();
    })();

    return () => {
      cancelado = true;
      desfazerTitulos();
      desfazerAbertura();
      lenis.destruir();
      irPara = (alvo) => alvo.scrollIntoView();
    };
  });

  const cinza = cortinaCinza();
  return { irPara: (alvo) => irPara(alvo), cinza };
}
