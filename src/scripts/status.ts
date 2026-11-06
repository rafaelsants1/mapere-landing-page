// Controle "ver em escala de cinza". A troca visual vem de quem chamar.

export function iniciarCinza(aplicar: (ligado: boolean) => void) {
  const chave = document.getElementById('status-chave');
  const aviso = document.getElementById('status-aviso');
  if (!chave) return;

  chave.addEventListener('click', () => {
    const ligado = chave.getAttribute('aria-checked') !== 'true';
    chave.setAttribute('aria-checked', String(ligado));
    if (aviso) aviso.textContent = ligado ? (aviso.dataset.texto ?? '') : '';
    aplicar(ligado);
  });
}
