// Lista de espera. O provedor é escolhido por PUBLIC_WAITLIST_PROVIDER:
//   local    só para desenvolvimento: guarda em memória e loga no console.
//   supabase grava na tabela `waitlist` com a chave pública (ver docs/supabase.sql).
// Em produção com `local`, nada é salvo: a interface avisa em vez de fingir sucesso.

export type Resultado = 'ok' | 'repetido' | 'erro' | 'indisponivel';

export interface Inscricao {
  email: string;
  consent: boolean;
  source: string;
}

interface Provedor {
  salvar(inscricao: Inscricao): Promise<Resultado>;
}

const emMemoria = new Set<string>();

const local: Provedor = {
  async salvar({ email, consent, source }) {
    if (!import.meta.env.DEV) return 'indisponivel';
    await new Promise((pronto) => setTimeout(pronto, 500));
    if (emMemoria.has(email)) return 'repetido';
    emMemoria.add(email);
    console.info('[lista de espera · modo de teste]', { email, consent, source });
    return 'ok';
  },
};

const supabase: Provedor = {
  async salvar(inscricao) {
    const url = import.meta.env.PUBLIC_SUPABASE_URL;
    const chave = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !chave) return 'indisponivel';
    try {
      const resposta = await fetch(`${url}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          apikey: chave,
          Authorization: `Bearer ${chave}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(inscricao),
      });
      if (resposta.status === 201) return 'ok';
      if (resposta.status === 409) return 'repetido';
      return 'erro';
    } catch {
      return 'erro';
    }
  },
};

const provedores: Record<string, Provedor> = { local, supabase };

export function salvarInscricao(inscricao: Inscricao): Promise<Resultado> {
  const nome = import.meta.env.PUBLIC_WAITLIST_PROVIDER ?? 'local';
  return (provedores[nome] ?? local).salvar(inscricao);
}

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}
