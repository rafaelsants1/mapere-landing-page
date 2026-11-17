# Plano: o plugin ECC no Mapere

Decidido com o Rafael em 17/11/2026, numa entrevista de 8 perguntas. Este plano roda na **próxima sessão, no PC dele** (G:\mapere), com o ECC instalado (`/plugin install ecc@ecc`, v2.2.3).

## Decisões

| # | Tema | Decisão |
|---|---|---|
| 1 | Onde roda | No PC local: G:\mapere, Obsidian e o Edge do motor |
| 2 | Escopo | Rodar o `/ecc:agent-sort` e enxugar **só no projeto Mapere**. O DAILY carrega em toda sessão e o LIBRARY fica sob demanda. O global não muda. |
| 3 | Hooks | Ficam: `gateguard`, `config-protection`, `suggest-compact`/`pre:compact` e `mcp-health-check`. Saem: `observe`, `continuous-learning` e `governance-capture`, porque o Mapere já tem memória e `plano.md` próprios. |
| 4 | Ordem | Setup → vídeo 06 → landing. A landing pode rodar enquanto um clipe de IA gera. |
| 5 | Publicação | O `short-video-distribution` prepara e o Rafael posta à mão. Sem API e sem navegador logado. |
| 6 | Landing | Primeiro um relatório único por gravidade. As correções aprovadas vão num branch com PR, e o Lighthouse roda antes e depois. |
| 7 | Voz e marketing | O `brand-voice` e o `marketing-agent` são auxiliares. Em conflito, vale o `PRODUCT.md`, a skill `novo-video` e o `social/06-por-que-existe/prompt.md`. |
| 8 | Onde fica este plano | Branch `social` (`social/_estrategia/plano-ecc.md`), com cópia no Drive |

## Etapa 0: abrir a sessão (5 min)

1. `git fetch origin social` e `git checkout social` (ou `git pull`). Confira se existem `social/_estrategia/plano-ecc.md`, `prompt-engajamento.md` e `social/06-por-que-existe/prompt.md`.
2. No Claude Code, `/plugin` → confira se o `ecc@ecc` está ativo.
3. Reconecte o conector da ElevenLabs no claude.ai (na última sessão, `account_get_usage` pediu permissão). Sem isso, o vídeo 06 não orça.
4. Ache e suba `social/_estrategia/plano-alcance.md` e `metricas.md`. Eles não estão no git nem no Drive, e o vídeo 06 precisa deles para o critério de sucesso.

## Etapa 1: enxugar o ECC (~20 min)

1. Rode `/ecc:agent-sort` na raiz do G:\mapere. Ele lê o repositório e devolve o DAILY, o LIBRARY, o plano de instalação e a verificação. Revise a tabela antes de aplicar.
2. **Hipótese do DAILY**, para conferir com a evidência que o agent-sort mostrar e não para aplicar às cegas:
   - Vídeo e redes: `short-video-distribution`, `content-engine`, `brand-voice`, `marketing-agent` e `growth-log`.
   - Landing (Astro, TypeScript): `seo`, `ecc:seo-specialist`, `accessibility`, `ecc:a11y-architect`, `browser-qa`, `ecc:typescript-reviewer`, `ecc:performance-optimizer` e o MCP `chrome-devtools`.
   - Geral: `/ecc:code-review`, `/ecc:plan` e `gateguard`.
   - Todo o resto, como Go, Rust, Java, Django, Flutter, saúde, redes, trading, x402, `taste`, `x-api` e `social-publisher`, vai para o LIBRARY.
3. Aplique no escopo do projeto, pelo caminho que o próprio agent-sort indicar. Não rode `install.ps1`, porque os hooks ficariam duplicados.
4. Desligue os hooks da decisão 3 em `.claude/settings.json` do projeto:
   ```json
   { "env": { "ECC_DISABLED_HOOKS": "pre:observe,pre:governance-capture" } }
   ```
   Antes, confira os IDs exatos em `/ecc:hookify-list` ou no `hooks/hooks.json` do plugin, e inclua o ID do continuous-learning se ele for separado. Reinicie e confira que o `gateguard` ainda bloqueia o primeiro comando.
5. Decida na hora sobre o `pre:write:doc-file-warning`: a `novo-video` cria vários `.md` (`plano`, `legendas`, `creditos`). Se o aviso disparar em todos, desligue também.
6. Salve o DAILY e o LIBRARY em `social/_estrategia/ecc-agent-sort.md`.

## Etapa 2: perfil de voz (~15 min)

1. Rode `brand-voice` com estas fontes: `src/data/copy.ts`, `PRODUCT.md`, os `legendas.md` e os roteiros (`plano.md`) dos vídeos 03, 04 e 05.
2. Salve o perfil em `social/_estrategia/voz-mapere.md`.
3. Na `.claude/skills/novo-video/SKILL.md`, acrescente uma linha em "Regras fixas": "Perfil de voz em `social/_estrategia/voz-mapere.md`; em conflito, vale o PRODUCT.md." Não mude mais nada na skill.

## Etapa 3: vídeo 06 com o ECC

Siga o `social/06-por-que-existe/prompt.md` como está. O ECC entra em 3 pontos:

| Momento do prompt | Ferramenta ECC | O que faz | Não faz |
|---|---|---|---|
| Antes do checkpoint 1 (roteiro) | `marketing-agent` | Critica o roteiro: gancho, retenção até a virada e motivo para seguir. Dá no máximo 5 sugestões, com o porquê. | Não reescreve o roteiro e não muda o tom para o de anúncio |
| Escrita das falas e das legendas | `voz-mapere.md` | Confere o vocabulário e o ritmo | Não passa por cima do PRODUCT.md |
| Fechamento (passo 9) | `short-video-distribution` | Confere o MP4 contra os limites de TikTok, Reels e Shorts, escreve a legenda de cada rede e liga o rótulo de IA. Entrega a folha de upload. | Não publica. O Rafael posta à mão e escolhe a capa no app |
| Depois da leitura de 48 h | `growth-log` | Registra a regra aprendida (por exemplo, "abertura em 0,2 s com o carro em movimento → +X% em 1 s") | Não substitui o `metricas.md` |

O roteiro do T1 (03b) e do T2 (04 sem "No Mapere") também ganha uma entrada no `growth-log` quando sair o resultado.

## Etapa 4: auditoria da landing

1. Suba a landing local (`npm run dev` ou `npm run preview`, depois de `npm run build`).
2. Rode `lighthouse_audit` do `chrome-devtools` em celular e desktop e salve os números como "antes" em `docs/auditoria-ecc/antes.md`.
3. Na mesma passada, rode o `ecc:seo-specialist` e o `ecc:a11y-architect` (WCAG 2.2 AA, a meta do `PRODUCT.md`).
4. Junte tudo num relatório só, `docs/auditoria-ecc/relatorio.md`, com uma tabela: gravidade, achado, onde (`arquivo:linha`), correção proposta e se mexe no visual (sim ou não).
5. Pergunte ao Rafael o que corrigir. Nada que mexa no visual aprovado (`DESIGN.md`) entra sem ok explícito.
6. As correções vão num branch a partir da `main`, por exemplo `landing-auditoria-ecc`. Depois, revise com `/ecc:code-review`, rode o Lighthouse de novo ("depois") e abra um PR.

## Fica para depois

- Engajamento em perfis: `social/_estrategia/prompt-engajamento.md`, com Claude no navegador e ok item a item. O `connections-optimizer` só cobre X e LinkedIn e serve de método, não de execução.
- `market-research` dos concorrentes de mapa de recarga, `/ecc:plan-prd` do app e `ecc:database-reviewer` quando o check-in for para o Supabase.

## Riscos

- O agent-sort dispara de 6 passes ou subagentes e consome bastante. Rode uma vez só.
- Os IDs de hook e o caminho de instalação por projeto mudam entre versões do ECC. Confie no que o plugin instalado mostrar, não neste arquivo.
- O `gateguard` deixa o primeiro passo de cada sessão mais lento. Se atrapalhar o fluxo dos vídeos, desligue só ele.
