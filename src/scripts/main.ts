import { iniciarFormularios } from './form';
import { iniciarAtalhos, iniciarIndice, iniciarProgresso } from './navegacao';
import { iniciarCinza } from './status';

iniciarFormularios();
iniciarProgresso();
iniciarIndice();

let irPara = (alvo: HTMLElement) => alvo.scrollIntoView();
let cinza: ((ligado: boolean) => void) | undefined;

iniciarCinza((ligado) => {
  if (cinza) cinza(ligado);
  else document.getElementById('status-palco')?.toggleAttribute('data-cinza', ligado);
});
iniciarAtalhos((alvo) => irPara(alvo));

// Sem a classe .fx (menos movimento ou tela muito pequena) o GSAP nem é baixado.
async function carregarMovimento() {
  const { iniciarMovimento } = await import('./motion/index');
  const movimento = iniciarMovimento();
  irPara = movimento.irPara;
  cinza = movimento.cinza;
}

if (document.documentElement.classList.contains('fx')) void carregarMovimento();

// A preferência ou a orientação pode mudar com a página aberta: recarrega no modo certo.
const condicao = matchMedia('(prefers-reduced-motion: reduce), (max-height: 539px), (max-width: 339px)');
condicao.addEventListener('change', () => location.reload());
