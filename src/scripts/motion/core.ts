import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(CustomEase, DrawSVGPlugin, MotionPathPlugin, ScrollTrigger, SplitText);
CustomEase.create('entrada', '.2,.7,.2,1');
gsap.defaults({ ease: 'entrada', duration: 0.28 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };

export const umo = <T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document) => {
  const el = raiz.querySelector<T>(seletor);
  if (!el) throw new Error(`Elemento não encontrado: ${seletor}`);
  return el;
};

export const varios = <T extends Element = HTMLElement>(seletor: string, raiz: ParentNode = document) =>
  [...raiz.querySelectorAll<T>(seletor)];

export function iniciarLenis() {
  const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  const tique = (tempo: number) => lenis.raf(tempo * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tique);
  gsap.ticker.lagSmoothing(0);

  const ir = (alvo: HTMLElement, imediato: boolean) => {
    const longe = Math.abs(alvo.getBoundingClientRect().top) > innerHeight * 2.5;
    if (imediato || longe) lenis.scrollTo(alvo, { immediate: true, force: true });
    else lenis.scrollTo(alvo, { duration: 0.8 });
  };

  const aoClicar = (e: MouseEvent) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const alvo = document.querySelector<HTMLElement>(link.hash);
    if (!alvo) return;
    e.preventDefault();
    // e.detail === 0 é clique vindo do teclado.
    ir(alvo, e.detail === 0);
    // Leva o foco junto, para o teclado continuar de onde a tela foi.
    alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
    history.pushState(null, '', link.hash);
  };
  document.addEventListener('click', aoClicar);

  return {
    irPara: (alvo: HTMLElement) => ir(alvo, true),
    destruir: () => {
      document.removeEventListener('click', aoClicar);
      gsap.ticker.remove(tique);
      lenis.destroy();
    },
  };
}
