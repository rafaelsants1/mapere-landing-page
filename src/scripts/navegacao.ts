// Barra de progresso, índice lateral, tema do cabeçalho e atalhos de teclado.
// Funciona igual com ou sem movimento.

const CHAVE_ATALHOS = 'mapere.atalhos';

export function iniciarProgresso() {
  const barra = document.getElementById('progresso');
  if (!barra) return;
  let pendente = false;
  const pintar = () => {
    pendente = false;
    const total = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${total > 0 ? Math.min(1, scrollY / total) : 0})`;
  };
  const pedir = () => {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(pintar);
  };
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir, { passive: true });
  pintar();
}

export function iniciarIndice() {
  const secoes = [...document.querySelectorAll<HTMLElement>('[data-secao]')];
  const atual = document.getElementById('indice-atual');
  const topo = document.getElementById('topo');
  const itens = new Map(
    [...document.querySelectorAll<HTMLAnchorElement>('[data-indice]')].map((a) => [a.dataset.indice ?? '', a]),
  );
  if (!secoes.length) return;

  const marcar = (secao: HTMLElement) => {
    const posicao = secoes.indexOf(secao);
    if (atual) atual.textContent = String(posicao + 1).padStart(2, '0');
    secoes.forEach((s, i) => {
      const item = itens.get(s.id);
      if (!item) return;
      item.toggleAttribute('data-visto', i < posicao);
      if (s === secao) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
  };

  const noMeio = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) if (e.isIntersecting) marcar(e.target as HTMLElement);
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  secoes.forEach((s) => noMeio.observe(s));

  // Sem movimento, o logo inverte quando uma seção clara passa sob o cabeçalho.
  // Com movimento, quem manda é a camada de fundo (motion/detalhes.ts).
  if (document.documentElement.classList.contains('fx')) return;
  const claras = secoes.filter((s) => s.dataset.fundo === 'linho');
  const sobTopo = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) e.target.toggleAttribute('data-sob-topo', e.isIntersecting);
      const algum = claras.some((s) => s.hasAttribute('data-sob-topo'));
      if (topo) topo.dataset.sobre = algum ? 'linho' : 'noite';
    },
    { rootMargin: '-36px 0px -100% 0px' },
  );
  claras.forEach((s) => sobTopo.observe(s));
}

export function iniciarAtalhos(irPara: (alvo: HTMLElement) => void) {
  const chave = document.getElementById('atalhos-chave');
  const rotulo = chave?.querySelector('span');
  let ligados = true;
  try {
    ligados = localStorage.getItem(CHAVE_ATALHOS) !== 'desligados';
  } catch {
    // Sem armazenamento, os atalhos só valem nesta visita.
  }

  const refletir = () => {
    if (!chave || !rotulo) return;
    chave.setAttribute('aria-pressed', String(ligados));
    rotulo.textContent = (ligados ? chave.dataset.ligado : chave.dataset.desligado) ?? '';
    document.querySelectorAll('[data-atalho] kbd').forEach((k) => k.toggleAttribute('hidden', !ligados));
  };
  refletir();

  chave?.addEventListener('click', () => {
    ligados = !ligados;
    try {
      localStorage.setItem(CHAVE_ATALHOS, ligados ? 'ligados' : 'desligados');
    } catch {
      // Sem armazenamento: vale até recarregar.
    }
    refletir();
  });

  addEventListener('keydown', (e) => {
    if (!ligados || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    const alvo = e.target as HTMLElement;
    if (alvo.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key.toLowerCase() !== 'l') return;
    const secao = document.getElementById('lista');
    if (!secao) return;
    e.preventDefault();
    irPara(secao);
    secao.querySelector<HTMLInputElement>('input[type="email"]')?.focus({ preventScroll: true });
  });
}
