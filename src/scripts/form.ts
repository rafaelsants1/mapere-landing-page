import { emailValido, salvarInscricao } from '../lib/waitlist';

type Textos = Record<'ok' | 'repetido' | 'erro' | 'email' | 'consentimento' | 'indisponivel', string>;

function ligar(form: HTMLFormElement, todos: HTMLFormElement[]) {
  const email = form.elements.namedItem('email') as HTMLInputElement;
  const consent = form.elements.namedItem('consent') as HTMLInputElement;
  const robo = form.elements.namedItem('website') as HTMLInputElement;
  const botao = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const rotulo = form.querySelector<HTMLElement>('[data-rotulo]')!;
  const status = form.querySelector<HTMLElement>('.form-status')!;
  const textos = JSON.parse(status.dataset.textos ?? '{}') as Textos;
  const rotuloOriginal = rotulo.textContent ?? '';

  const dizer = (texto: string) => {
    status.textContent = texto;
  };

  const liberar = () => {
    botao.disabled = false;
    rotulo.textContent = rotuloOriginal;
  };

  email.addEventListener('input', () => {
    email.removeAttribute('aria-invalid');
    if (form.dataset.estado === 'erro') {
      form.dataset.estado = 'inicial';
      dizer('');
    }
  });

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (form.dataset.estado === 'enviando') return;

    const valor = email.value.trim().toLowerCase();
    if (!emailValido(valor)) {
      form.dataset.estado = 'erro';
      email.setAttribute('aria-invalid', 'true');
      dizer(textos.email);
      email.focus();
      return;
    }
    if (!consent.checked) {
      form.dataset.estado = 'erro';
      dizer(textos.consentimento);
      consent.focus();
      return;
    }

    // Robô preencheu o campo escondido: finge sucesso e não grava nada.
    if (robo.value) {
      form.dataset.estado = 'ok';
      dizer(textos.ok);
      return;
    }

    form.dataset.estado = 'enviando';
    botao.disabled = true;
    rotulo.textContent = rotulo.dataset.enviando ?? rotuloOriginal;
    dizer('');

    const resultado = await salvarInscricao({ email: valor, consent: true, source: form.dataset.origem ?? 'lista' });
    liberar();

    if (resultado === 'ok') {
      for (const outro of todos) {
        outro.dataset.estado = 'ok';
        const alvo = outro.querySelector<HTMLElement>('.form-status');
        if (alvo) alvo.textContent = textos.ok;
      }
      status.focus();
      return;
    }

    form.dataset.estado = 'erro';
    dizer(textos[resultado]);
    if (resultado === 'repetido') email.focus();
  });
}

export function iniciarFormularios() {
  const todos = [...document.querySelectorAll<HTMLFormElement>('[data-form-lista]')];
  for (const form of todos) ligar(form, todos);
}
