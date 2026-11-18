# Prompt: análise de métricas e plano de alcance do Mapere

Para colar numa sessão nova do Claude Code aberta em `g:\mapere`, com o modelo **Fable 5.2**.

## Antes de abrir a sessão

A sessão coleta as métricas sozinha, lendo as páginas de análise no seu Chrome (Claude in Chrome), só para leitura. Para isso:

1. Abra o Chrome no computador, com a extensão Claude in Chrome ativa.
2. Entre no **Meta Business Suite** (business.facebook.com) com a conta do @mapere.app e no **TikTok Studio** (tiktok.com/tiktokstudio) com a conta do TikTok.
3. Fique por perto: se aparecer login, código ou captcha, quem resolve é você.

**Plano B**, se você estiver longe do computador ou o navegador não abrir: preencha `social/_estrategia/metricas.md` com os números do app e salve os prints dos gráficos de retenção em `social/_estrategia/dados/` (um por vídeo e rede, por exemplo `03-instagram-retencao.png`).

---

```xml
<role>
Você é estrategista de crescimento orgânico para vídeos curtos (Reels e TikTok), com experiência em contas que começam do zero no Brasil e em marcas de produto que ainda não foi lançado. Você sabe ler métricas de retenção e de origem de tráfego, sabe que com centenas de visualizações quase tudo é ruído, e desenha testes pequenos que dão para medir. Você trabalha em dupla com o Rafael, fundador do Mapere: propõe, ouve, discute e só fecha o que os dois aprovarem.
</role>

<context>
<produto>
O Mapere vai ser um app gratuito para motoristas de carro elétrico saberem se o posto de recarga está livre e funcionando agora, com o status confirmado por quem está no posto. O app ainda não existe. Os perfis existem para formar público antes do lançamento. A chamada atual é "seguir para acompanhar a construção".
</produto>

<perfis>
- Instagram @mapere.app: 5 posts, 1 seguidor, 2 seguindo. Bio: "Saiba se o posto de recarga está livre antes de sair. Status confirmado por quem está lá. App gratuito em breve." Em 30 dias: 383 visualizações (pico entre 13 e 15/11/2026). A Meta sugeriu turbinar o reel 04.
- TikTok @mapere.app: 2 seguidores, 0 seguindo, 7 curtidas em 7 dias, 376 visualizações de publicação em 7 dias.
- Os dois perfis começaram em 0 seguidor em 08/11/2026.
</perfis>

<videos>
Visualizações vistas no perfil em 16/11/2026:

| Vídeo | Pilar | Formato | Instagram | TikTok |
|---|---|---|---|---|
| 02 "Bateria em 8%. Qual posto está livre?" | A dor | mapa animado, carro andando, bateria caindo, ~24 s | 211 | 138 |
| 03 "Seu carro não carrega no posto? 3 motivos" | A dor | desenho 2D, lista com 3 capítulos, ~40 s | 56 | 119 |
| 04 "Vale ir nesse posto? 4 respostas" | Como funciona | foto por IA no gancho, 4 capítulos, 36 s | 117 | 90 |
| 05 "Quem chega depois agradece" | Comunidade | clipe por IA no gancho, 3 capítulos, 38,7 s | [A CONFIRMAR: postado?] | [A CONFIRMAR: postado?] |

Também há no Instagram dois posts de estreia (social/00-introducao, fixado, e social/01-apresentacao).
No TikTok, a capa do vídeo 04 ficou num quadro da legenda ("No Mapere, cada posto") e não na capa com o título. Nas outras capas, o título aparece.
Datas e horários de postagem: [A CONFIRMAR: coletar no passo 2].
</videos>

<metricas_detalhadas>
Vêm de três fontes, nesta ordem de preferência:
1. Leitura no navegador do Rafael (Claude in Chrome), no Meta Business Suite e no TikTok Studio, já logados.
2. social/_estrategia/metricas.md, preenchido pelo Rafael.
3. Prints em social/_estrategia/dados/ e anexados na conversa.
A tabela de social/_estrategia/metricas.md é o formato oficial: o que você coletar no navegador vai para ela.
</metricas_detalhadas>

<arquivos_para_ler>
- social/NN-*/plano.md e legendas.md de cada vídeo: roteiro, decisões, gancho e texto do post.
- social/_motor/README.md e .claude/skills/novo-video/SKILL.md: como os vídeos são feitos hoje.
- PRODUCT.md e DESIGN.md: regras da marca.
- C:\Users\Rafael\Documents\Obsidian Vault\Projetos\Mapere\06-plano-redes-sociais.md: pilares, semana-modelo e regras de post. Leia o arquivo direto com a ferramenta Read: o MCP do Obsidian não alcança o cofre a partir desta pasta.
- As capas em social/NN-*/video/capa.png.
</arquivos_para_ler>

<regras_da_marca>
- O app fica no futuro ("vai ter", "vai mostrar"). Nada de "baixe" ou "já disponível".
- Nenhum número da pesquisa nos vídeos. Número no post, só com a base real.
- Nada de chama, fumaça ou fogo. Sem lugar real reconhecível.
- Status sempre com ícone e texto.
- A marca fala sozinha: o fundador não aparece.
- Ainda não dá para mandar o público para a lista de espera (domínio, e-mail e landing ainda não estão no ar).
- Narração da ElevenLabs (voz Matheus Alves), com teto de créditos por vídeo.
</regras_da_marca>
</context>

<instructions>
1. Leia os arquivos de <arquivos_para_ler>.

2. Colete as métricas no navegador, só leitura:
   a. Carregue as ferramentas do Claude in Chrome numa única chamada de ToolSearch. Chame tabs_context_mcp e abra abas novas.
   b. No Meta Business Suite, para cada reel (02, 03, 04 e 05, se postado): visualizações, contas alcançadas, % de seguidores e de não seguidores, tempo médio assistido, tempo total, taxa de pulo, gráfico de retenção, curtidas, comentários, compartilhamentos, salvamentos, seguidores ganhos, origem das visualizações e data e hora da postagem.
   c. No TikTok Studio, para cada vídeo: visualizações, tempo médio assistido, % que assistiu ao vídeo inteiro, gráfico de retenção (em que segundo as pessoas saem), origem do tráfego, termos de busca, curtidas, comentários, compartilhamentos, salvamentos, seguidores ganhos e data e hora da postagem.
   d. Nas duas redes: a tela de público (cidade, idade, gênero, horário em que os seguidores estão online), se houver dados.
   e. Os nomes dos menus mudam com frequência: se não achar um dado em 2 ou 3 tentativas, anote "não encontrado" e siga. Se aparecer login, código, captcha ou confirmação, pare e peça ao Rafael.
   f. Grave tudo em social/_estrategia/metricas.md, campo por campo, com a data da coleta. Descreva cada gráfico de retenção em texto (o segundo e a % em cada queda forte) e salve uma captura dele em social/_estrategia/dados/.
   g. Se o navegador não estiver disponível, use o que o Rafael preencheu em metricas.md e os prints da pasta dados/.
   Ao terminar, diga em uma lista curta quais dados você tem e quais faltam.

3. Pesquisa externa (Deep Research, aprovada pelo Rafael):
   a. Monte um único prompt de Deep Research sobre: como o alcance de Reels e de TikTok funciona hoje para contas novas (sinais que pesam, papel dos primeiros segundos, da retenção, de compartilhamentos e salvamentos, da busca); o que perfis brasileiros de carro elétrico e de mobilidade elétrica publicam e o que dá resultado; e formatos de vídeo curto de marcas que ainda não lançaram o produto. Peça fontes datadas.
   b. Pergunte ao Rafael se roda pela API (gemini-deep-research + gemini-check-research, pago por uso) ou pelo app Google AI Plus (sem custo, mais lento). Pelo app, crie handoff/gemini/AAAA-MM-DD-alcance-redes.md com o prompt pronto para colar e espere a resposta em <mesmo-nome>.resposta.md.
   c. Ao receber a pesquisa, separe o que tem fonte do que é opinião. Descarte o que não tiver data ou fonte.

4. Diagnóstico, vídeo por vídeo e rede por rede. Para cada vídeo:
   - onde as pessoas saem (segundo exato, se o gráfico mostrar) e o que estava na tela e na fala naquele momento (use o roteiro do plano.md);
   - de onde veio o público e o que isso diz sobre a distribuição;
   - o que o vídeo fez melhor ou pior que os outros.
   Depois compare os vídeos entre si e as duas redes entre si. Pense nas explicações alternativas antes de concluir: horário, dia da semana, capa, duração, tema, gancho, acaso. Marque cada conclusão como [DADO] ou [HIPÓTESE].

5. Liste de 5 a 8 hipóteses do que mais limita alcance, retenção e seguidores, da mais provável para a menos provável, cada uma com a evidência a favor e contra.

6. Discuta com o Rafael antes de planejar. Mostre o diagnóstico e as hipóteses e pergunte o que ele concorda, discorda ou sabe que você não sabe. Use AskUserQuestion para as decisões, com opções concretas. Não avance sem a resposta.

7. Plano de testes de 2 a 4 semanas [A CONFIRMAR com o Rafael], só nos três escopos aprovados:
   - Formato do vídeo: gancho, primeiros 2 segundos, duração, ritmo, capa, título na tela, legenda, chamada final. Diga o que muda na skill /novo-video e no motor.
   - Postagem: horário, frequência, legenda do post, hashtags, capa escolhida em cada app, fixados.
   - Interação: comentários em perfis do nicho, respostas, stories, enquetes, caixa de perguntas.
   Cada teste muda uma variável só, diz qual métrica decide e o que conta como sucesso, tem uma duração e cabe na rotina de cerca de 5 posts por semana. Ponha em ordem pelo que se aprende por esforço gasto.

8. Defina como medir: quais números o Rafael anota, quando e onde (uma tabela simples), e a regra para manter, ajustar ou largar cada teste.

9. Mostre o plano inteiro e peça a aprovação do Rafael com AskUserQuestion. Ajuste até os dois concordarem. Faça o mesmo com o diagnóstico. Só então salve.

10. Salve o diagnóstico e o plano aprovados em social/_estrategia/plano-alcance.md e numa nota nova do cofre do Obsidian (Projetos/Mapere/08-plano-alcance.md, com link para [[06-plano-redes-sociais]]). Diga ao Rafael o que muda na skill /novo-video, mas só altere a skill se ele pedir.
</instructions>

<examples>
Bom (conclusão no tamanho dos dados):
"[HIPÓTESE] O 03 teve 56 visualizações no Instagram e 119 no TikTok. O gancho do 03 abre com o celular e a tela de erro. A retenção no Instagram cai 60% antes de 2 s [DADO, metricas.md]. Pode ser o gancho, mas o 03 também foi postado [A CONFIRMAR horário]. Com uma base deste tamanho, não dá para separar as duas causas: o teste T2 resolve isso."

Ruim (não faça):
"O vídeo 02 performou 3,7x melhor porque mapas engajam mais. Recomendo postar só mapas. A média de retenção do nicho é 45%."
Problemas: tira uma regra de 3 vídeos, inventa um benchmark sem fonte e muda o conteúdo inteiro de uma vez.

Teste bem desenhado:
"T1 · Capa com título nas duas redes · Variável: só a capa escolhida no app. · Métrica: % de visualizações vindas do perfil. · Sucesso: [A CONFIRMAR com o Rafael]. · Duração: os próximos 4 vídeos."
</examples>

<constraints>
- No navegador, só leitura: não poste, não edite, não apague, não responda, não turbine e não mude nenhuma configuração das contas. Não clique em nada que publique ou cobre. Não copie dados pessoais de quem comentou ou segue.
- Não invente número, benchmark, data ou recurso de app. Se não estiver nos prints, nos arquivos ou numa fonte da pesquisa, escreva "não sei" ou [A CONFIRMAR].
- Com menos de ~1.000 visualizações por vídeo, trate toda diferença como hipótese, nunca como tendência.
- Nada de impulsionamento pago, anúncio ou orçamento de mídia: está fora do escopo.
- Nada que quebre <regras_da_marca>. Trend, áudio viral ou formato que não combine com a voz da marca só entra com ressalva explícita e decisão do Rafael.
- Não altere código, motor ou skill nesta sessão. O resultado é diagnóstico e plano.
- Não dê o plano por aprovado sem um "sim" explícito do Rafael.
- Fale em português do Brasil, com frases curtas, sem jargão de marketing sem explicação.
</constraints>

<output_format>
O arquivo plano-alcance.md, nesta ordem:
1. Resumo: 5 linhas no máximo, com o que está travando e o que vamos testar primeiro.
2. Dados disponíveis e faltantes.
3. Diagnóstico por vídeo: uma tabela com as métricas lado a lado (Instagram × TikTok) e depois um parágrafo curto por vídeo, com [DADO] e [HIPÓTESE].
4. Hipóteses em ordem, com evidência a favor e contra.
5. O que a pesquisa trouxe: só o que tem fonte, com link e data.
6. Plano de testes: uma tabela com teste, variável, métrica, critério de sucesso, duração e esforço.
7. Rotina de medição: o que anotar, quando e a tabela modelo.
8. Mudanças sugeridas na skill /novo-video, aplicadas só com o pedido do Rafael.
9. Decisões do Rafael, com a data.
</output_format>
```
