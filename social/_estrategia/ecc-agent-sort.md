# ECC no Mapere: DAILY e LIBRARY

Resultado do `/ecc:agent-sort` (ECC 2.2.3), feito em 17/11/2026 na raiz do G:\mapere. Segue a Etapa 1 do [plano-ecc.md](plano-ecc.md). As 6 passadas (agentes, skills, comandos, regras, hooks e extras) rodaram em sequência, sem subagentes.

## O que limita a aplicação

O ECC está instalado como plugin no escopo do usuário. O Claude Code não deixa esconder habilidades de plugin uma a uma por projeto: o `skillOverrides` "não afeta skills de plugin" ([documentação](https://code.claude.com/docs/en/skills)). O próprio ECC diz que, no plugin, "o host vê todas as skills de uma vez" (`docs/design/context-companion-skills.md`). O perfil "Lean" (`ecc profile`) ainda é experimental (`docs/design/context-profile-delivery.md`).

Consequência: a lista DAILY abaixo vale como **guia de uso**, e não como filtro. O que dá para aplicar por projeto são os hooks (`ECC_DISABLED_HOOKS`) e a lista de plugins ligados (`enabledPlugins`).

## Stack

- Landing em Astro 7 com TypeScript 6 (`package.json`, `astro.config.mjs`, 23 `.astro`, 16 `.ts`), GSAP e Lenis. O build roda `astro check`. Não há testes, lint nem CI.
- Lista de espera com Supabase (`src/lib/waitlist.ts`, `docs/supabase.sql`), ainda não ativada.
- Vídeos verticais em `social/`: o motor em Node (`social/_motor/*.mjs`), com Playwright, GSAP e ffmpeg, mais a skill local `.claude/skills/novo-video`. São 8 vídeos e o plano de testes T1 a T6.
- Um script Python solto (`scripts/build-fonts.py`). Nenhum outro código em outra linguagem.
- Nenhum arquivo do Power Platform (Dataverse, Power Apps, Power Pages).

## DAILY: 15 itens

| Componente | Tipo | Evidência no repositório | Uso |
|---|---|---|---|
| `short-video-distribution` | skill | `social/NN-*/video/*.mp4` verticais; decisão 5 do plano | Folha de upload do TikTok, dos Reels e dos Shorts. Não publica. |
| `brand-voice` | skill | `src/data/copy.ts`, `PRODUCT.md`, `legendas.md` dos vídeos | Perfil `voz-mapere.md` (Etapa 2) |
| `growth-log` | skill | `plano-alcance.md`: testes com critério fixado | Regra aprendida depois de cada leitura de 48 h |
| `marketing-agent` | agente | Roteiros em `social/NN-*/plano.md`; Etapa 3 | Crítica do roteiro antes do checkpoint 1 |
| `seo` | skill | `site: https://mapere.com.br`, `scripts/build-og.mjs` | Auditoria da landing (Etapa 4) |
| `seo-specialist` | agente | idem | idem |
| `accessibility` | skill | `PRODUCT.md`: meta WCAG 2.2 AA | idem |
| `a11y-architect` | agente | idem | idem |
| `browser-qa` | skill | Claude in Chrome e Playwright em uso | Checagem da landing no navegador |
| `typescript-reviewer` | agente | 16 `.ts`, `astro check` no build | Revisão das correções da landing |
| `performance-optimizer` | agente | Lighthouse antes e depois (Etapa 4) | Achados de desempenho |
| MCP `chrome-devtools` | MCP | Etapa 4 (`lighthouse_audit`) | Lighthouse no celular e no desktop |
| `/ecc:code-review` | comando | Etapa 4.6 | Revisão antes do PR da landing |
| `/ecc:plan` | comando | Trabalho em etapas (vídeos, landing) | Plano antes de mudança grande |
| `gateguard` | skill e hook | Decisão 3 | Barreira antes do primeiro comando e da primeira edição |

**Diferença em relação à hipótese do plano:** o `content-engine` foi para o LIBRARY. Nenhuma etapa do plano usa a skill, e o calendário e os pilares já estão em `plano-alcance.md` e no cofre do Obsidian.

## LIBRARY: o resto (320 skills, 67 agentes, 96 comandos)

Continuam acessíveis pelo nome. Não entram no fluxo do dia a dia.

| Grupo | Exemplos | Por que fica fora |
|---|---|---|
| Outras linguagens | Go, Rust, Java, Kotlin, Spring, Quarkus, Django, FastAPI, Laravel, Rails, C++, C#, F#, Swift, Flutter, Perl, Godot, `python-patterns` | Nenhum código nessas linguagens (só 1 script Python) |
| React, Next, Vue, Angular | `frontend-patterns`, `react-*`, `motion-*`, `frontend-a11y`, `remotion-video-creation` | O Mapere não usa React. A landing é Astro, e o motor é HTML com GSAP. |
| Publicação automática | `social-publisher`, `crosspost`, `x-api` | Decisão 5: o Rafael posta à mão |
| Para depois | `market-research`, `/ecc:plan-prd`, `database-reviewer`, `security-review`, `security-reviewer` | "Fica para depois" no plano. Os dois de segurança entram quando o Supabase for ativado. |
| Conteúdo amplo | `content-engine`, `article-writing`, `brand-discovery`, `tasteforge-video`, `video-editing` | O fluxo próprio (`novo-video` e motor) já cobre |
| Fora do domínio | saúde, redes, homelab, trading, x402, logística, energia, finanças | Nada no projeto |

## Hooks

| Hook | Decisão | Motivo |
|---|---|---|
| `pre:bash:dispatcher` (inclui o gateguard do Bash), `pre:powershell:gateguard-fact-force`, `pre:edit-write:gateguard-fact-force` | Fica | Decisão 3 |
| `pre:config-protection` | Fica | Decisão 3 |
| `pre:edit-write:suggest-compact`, `pre:compact` | Fica | Decisão 3 |
| `pre:mcp-health-check`, `post:mcp-health-check` | Fica | Decisão 3 |
| `pre:write:doc-file-warning` | Fica | Só avisa em `NOTES`, `TODO`, `DRAFT`, `SCRATCH`, `TEMP`, `BRAINSTORM`, `SPIKE`, `DEBUG` e `WIP` em maiúsculas. O `plano.md`, o `legendas.md` e o `creditos.md` nunca disparam. |
| `pre:observe`, `pre:observe:continuous-learning`, `post:observe:continuous-learning` | Sai | Decisão 3 |
| `stop:evaluate-session` | Sai | É a parte do continuous-learning que extrai padrões no fim da resposta. O plano pedia para incluir esse ID se ele fosse separado. |
| `pre:governance-capture`, `post:governance-capture` | Sai | Decisão 3. Já vem desligado e só liga com `ECC_GOVERNANCE_CAPTURE=1`. |
| Os demais (`session:start`, `stop:session-end`, `stop:cost-tracker`, `stop:format-typecheck` etc.) | Ficam como estão | Fora da decisão 3 |

Regras do ECC: nenhuma instalada. O plugin não distribui regras, e `~/.claude/rules` não existe.

## Plano de instalação

O Rafael escolheu a opção A em 17/11/2026. O ECC fica inteiro no escopo do usuário, e o global não muda.

Aplicado em `.claude/settings.json` do projeto:

- `env.ECC_DISABLED_HOOKS`: `pre:observe,pre:observe:continuous-learning,post:observe:continuous-learning,stop:evaluate-session,pre:governance-capture,post:governance-capture`.
- `enabledPlugins`: os 7 plugins do Power Platform desligados só no Mapere (`power-pages`, `model-apps`, `mcp-apps`, `canvas-apps`, `code-apps-preview`, `mobile-app` e `power-automate`, todos `@power-platform-skills`).
- O DAILY não vira filtro. Ele é a lista que as sessões do Mapere usam primeiro.

Ficou de fora:

- Copiar as peças do DAILY para `.claude/` (opção B). Perderia o gateguard e o chrome-devtools, ou exigiria religar tudo à mão a cada versão.
- O `install.ps1` e a pasta `rules/`.
- O roteador `skill-library`. Seria mais um item na lista de skills, e este arquivo já cumpre o papel.

## Verificação

Antes de reiniciar, em 17/11:

- O `isHookEnabled` do ECC, rodado com a variável acima, dá 5 hooks desligados (`pre:observe`, `post:observe:continuous-learning`, `stop:evaluate-session` e os dois `governance-capture`) e 8 ligados (os 3 gateguards, `config-protection`, `suggest-compact`, `pre:compact`, `mcp-health-check` e `doc-file-warning`).

Depois de reiniciar, em 17/11, às 23h04:

1. **Gateguard: ok.** A sessão foi retomada com o mesmo ID (`ac2b9d10…`), e o estado em `~/.gateguard/state-<id>.json` já tinha o primeiro comando registrado. Por isso o primeiro comando passou. O hook rodou: o `last_active` foi atualizado nesse horário. Numa sessão aberta do zero, ele volta a barrar o primeiro comando.
2. **Plugins: ok.** Ao abrir a sessão, os MCPs `power-automate:flowagent`, `power-pages:microsoft-learn` e os dois Playwright do Power Platform se desconectaram. O `/plugin` não foi aberto, porque a sessão não é interativa.
3. **Agentes: ok.** Saíram da lista os agentes `canvas-apps:*`, `code-apps-preview:*`, `mobile-app:*`, `model-apps:*` e `power-pages:*`.
4. **Variável: ok.** O `echo $ECC_DISABLED_HOOKS` mostra os 6 IDs.

ElevenLabs: as ferramentas de produção respondem (`creative_list_voices` achou a voz do Matheus), mas o `account_get_usage` continua recusado por escopo, mesmo depois de reconectar. O saldo fica para ver em elevenlabs.io.
