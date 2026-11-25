# Plano de alcance: diagnóstico e testes

Feito em 2026-11-16, com os números de [metricas.md](metricas.md). Aprovado pelo Rafael no mesmo dia. A seção 5 entrou com a pesquisa do Gemini, no mesmo dia.

Atualizado em 2026-11-25 com os resultados da semana 1: [analise-2026-11-25.md](analise-2026-11-25.md). Mudaram o calendário e o T2 (seção 6), a seção 8 e a seção 9.

Marcação: [DADO] saiu dos painéis ou dos arquivos do projeto. [HIPÓTESE] é leitura minha e pode estar errada. Nenhum vídeo passou de 211 visualizações, então toda diferença entre vídeos é hipótese, não tendência.

## 1. Resumo

- As duas redes entregam os vídeos a quem não segue a conta, em lotes de 50 a 200 pessoas. O que trava vem depois: a maioria sai no primeiro segundo.
- No TikTok, o vídeo 03 perde 67% das pessoas em 1 s. O 02 perde 19%.
- Em cerca de 800 visualizações somadas, houve 5 curtidas, 1 salvamento, nenhum envio, nenhum comentário e 2 seguidores.
- Quem recebe os vídeos no TikTok parece ser público geral, não motorista de elétrico.
- Primeiro teste: refazer só a abertura do vídeo 03 (quinta, 19/11) e tirar a marca do começo do 04 (sexta, 20/11).

## 2. Dados disponíveis e faltantes

Tenho:
- Instagram, pelos 4 reels: data e hora, visualizações, alcance, % de não seguidores, tempo médio e total, interações, seguidores ganhos e a curva de chegada das visualizações.
- TikTok, pelos 4 vídeos: os mesmos números e a retenção segundo a segundo. Para o 02 e o 03, também a origem do tráfego, idade, gênero e país de quem assistiu.
- TikTok, pela conta: origem do tráfego, visitas ao perfil e a lista de criadores que os espectadores também assistem.
- O roteiro com o tempo de cada palavra (`_fonte/legenda.json`) e os primeiros quadros de cada vídeo.

Falta:
- Instagram: gráfico de retenção, taxa de pulo e origem das visualizações. Só aparecem no app do celular. O instagram.com está bloqueado para a extensão do navegador.
- Nas duas redes: cidade e horário dos seguidores (pedem 100 seguidores).
- TikTok: origem do tráfego e público do 04 e do 05 (pedem 100 visualizações).
- Vídeo 05: foi postado em 16/11 às 13h18 e medido 4 horas depois. Os números dele são parciais.

## 3. Diagnóstico por vídeo

| | 02 Bateria em 8% | 03 3 motivos | 04 4 respostas | 05 Quem chega depois |
|---|---|---|---|---|
| Formato do gancho | mapa animado | desenho 2D parado | foto por IA | clipe por IA |
| Duração | 20,6 s | 39,5 s | 36,2 s | 38,7 s |
| Postado | qua 11/11, 19h | qui 12/11, 19h10 | sex 13/11, 19h32 | seg 16/11, 13h18 |
| Visualizações, Instagram × TikTok | 211 × 138 | 56 × 119 | 117 × 90 | 22 × 55 |
| Não seguidores, Instagram × TikTok | 99,5% × 100% | 100% × 99% | 100% × 99% | 100% × sem dado |
| Tempo médio, Instagram × TikTok | 9 s × 7,4 s | 3 s × 2,5 s | 9 s × 2,5 s | 7 s × 8,4 s |
| Ainda assistindo em 1 s (TikTok) | 81% | 33% | 59% | 64% |
| Ainda assistindo em 3 s (TikTok) | 54% | 12% | 25% | 30% |
| Ainda assistindo em 6 s (TikTok) | 36% | 7% | 9% | 25% |
| Viu até o fim (TikTok) | 4,3% | 2,3% | 0% | 10,9% |
| Curtidas, Instagram × TikTok | 1 × 3 | 0 × 1 | 0 × 0 | 0 × 0 |
| Envios, Instagram × TikTok | 0 × 0 | 0 × 0 | 0 × 0 | 0 × 0 |
| Salvamentos, Instagram × TikTok | 0 × 1 | 0 × 0 | 0 × 0 | 0 × 0 |
| Comentários, Instagram × TikTok | 0 × 0 | 0 × 0 | 0 × 0 | 0 × 0 |
| Seguidores ganhos, Instagram × TikTok | 0 × 1 | 0 × 1 | 0 × 0 | 0 × 0 |
| Origem no TikTok | Para Você 83,5%, perfil 12,2%, busca 0,6% | Para Você 90,1%, perfil 9,9% | sem dado | sem dado |
| Primeira palavra da narração | 0,2 s | 0,45 s | 0,45 s | 0,45 s |
| Primeira vez que a voz diz "Mapere" | 12,5 s | 33 s | 3 s | 8,5 s |

**02.** [DADO] É o que mais segura nas duas redes. No TikTok, a retenção fica entre 26% e 23% dos 10 aos 15 s, cai para 19% no segundo 16, depois que a frase do Mapere termina, e despenca no segundo 19, quando entra "Siga para acompanhar a construção". [DADO] No Instagram, 199 das 211 visualizações chegaram entre 1h15 e 3h30 depois da postagem, e a entrega parou. [HIPÓTESE] Ele segura mais porque "Bateria em 8%" é uma frase que qualquer pessoa entende, o carro já se move no primeiro quadro e a voz começa mais cedo. Também é o único vídeo curto, então não dá para separar essas causas.

**03.** [DADO] É o pior nas duas redes: 3 s de tempo médio no Instagram e 2,5 s no TikTok, onde 67% saem no primeiro segundo. Nesse segundo a tela mostra um celular parado com "Não foi possível iniciar a recarga", e a voz ainda não terminou "Para de apertar". [HIPÓTESE] O quadro só faz sentido para quem já viveu isso, e lembra anúncio de aplicativo. [DADO] Só 4% ainda estavam assistindo no segundo 7, quando começam as três dicas. O conteúdo útil do vídeo praticamente não foi visto. [HIPÓTESE] Foi o que teve menos visualizações no Instagram (56) porque o tempo médio de 3 s fez a entrega parar cedo. Horário não explica: saiu na mesma hora do 02.

**04.** [DADO] As redes discordam. No Instagram, o tempo médio é de 9 s, igual ao do 02. No TikTok é de 2,5 s, e ninguém viu até o fim. [DADO] No TikTok, a retenção cai de 25% para 9% entre os segundos 3 e 6, enquanto a voz diz "No Mapere, cada posto vai ter um de quatro status". [HIPÓTESE] Dizer a marca no segundo 3, antes de entregar alguma coisa, soa como propaganda. [DADO] O TikTok mostra 90 visualizações e só 18 espectadores. Não sei a causa, e o Rafael confirmou que não ficou revendo o vídeo. [DADO] A capa errada no TikTok pesa pouco: o perfil teve 4 visitas em 7 dias. [HIPÓTESE] Sexta à noite pode ter atrapalhado: no Instagram as visualizações foram pingando por 10 horas, madrugada adentro. Não dá para separar do resto.

**05.** [DADO] Com 55 visualizações e 4 horas no ar, tem o melhor tempo médio (8,4 s) e a melhor taxa de conclusão (10,9%) no TikTok. Segura 30% dos 3 aos 5 s, enquanto o clipe do carro saindo ainda está na tela, e cai para 21% até o segundo 7, durante a segunda frase, quando o clipe desfoca e entra o desenho. [HIPÓTESE] Imagem real em movimento segura mais que foto parada ou desenho. Mas ele saiu em outro dia e horário, e a base é pequena. Vale reler em 18/11.

**Entre os vídeos.** [DADO] A ordem de retenção em 1 s no TikTok é 02 (81%), 05 (64%), 04 (59%) e 03 (33%). É também a ordem de quanto movimento há no primeiro quadro: carro andando no mapa, clipe de carro saindo, foto com um alfinete caindo, desenho parado. [HIPÓTESE] Movimento no primeiro quadro pesa. São quatro vídeos, e tema, frase e duração mudam junto.

**Entre as redes.** [DADO] As duas se comportam igual no essencial: mostram o vídeo a um lote pequeno de não seguidores e param. O Instagram variou mais no tamanho do lote (de 56 a 211) que o TikTok (de 90 a 138). [DADO] O TikTok rendeu 2 seguidores e o Instagram, nenhum.

**Quem está recebendo.** [DADO] No TikTok, os espectadores da conta também assistem Mercado Livre, Shopee Brasil, Lojas Havan, Doritos Brasil, Omo, Lu do Magalu e Bradesco. Nenhum perfil de carro elétrico aparece. 31% têm de 18 a 24 anos, 78% são homens e 99,6% estão no Brasil. [HIPÓTESE] O vídeo está indo para público geral, e a maior parte dessas pessoas não tem carro elétrico. Do Instagram não há esse dado.

## 4. Hipóteses, da mais para a menos provável

1. **O primeiro segundo não segura.** A favor: o TikTok Studio aponta o segundo 1 como ponto de saída nos quatro vídeos, e o 02 perde 19% contra 67% do 03. Contra: o 02 difere dos outros em várias coisas ao mesmo tempo. O Rafael concorda que este é o maior gargalo.
2. **O vídeo chega ao público errado.** A favor: a lista de "também assistiram", a idade e quase 100% de não seguidores. Contra: não sei se o lote inicial de toda conta nova é amplo assim. A pesquisa deve responder.
3. **O vídeo parece anúncio.** A favor: a queda do 04 na frase "No Mapere", e o fato de o 02 e o 05 citarem a marca só depois de 8 s e segurarem melhor. Contra: são três vídeos, e voz sintética e visual escuro também estão no 02.
4. **Nada no vídeo pede envio, comentário ou salvamento.** A favor: zero envios e zero comentários, e a única chamada é "siga". Contra: quase ninguém chega ao fim, então a chamada final nem foi vista. Depende da hipótese 1.
5. **A conta não deu sinal de nicho.** A favor: a busca responde por 0% a 0,6% do tráfego, as cinco hashtags são as mesmas em todo post, o TikTok segue 0 perfis e a conta não comentou em perfis de elétrico. Contra: não sei quanto isso pesa hoje.
6. **36 a 40 s é longo para a retenção atual.** A favor: o 02, com 20 s, foi o melhor. Contra: o 05 tem 38 s e a melhor taxa de conclusão.
7. **Dia e horário.** A favor: o vídeo da sexta foi pingando pela madrugada. Contra: três dos quatro saíram às 19h, então o horário quase não variou.
8. **Acaso.** Com lotes de 50 a 200 pessoas, parte das diferenças pode ser só sorteio de quem recebeu.

## 5. O que a pesquisa trouxe

Deep Research do Gemini, rodado no app. A resposta chegou em 16/11/2026 e está guardada em `handoff/gemini/2026-11-16-alcance-redes.resposta.md`. Só três fontes vieram com link, e a sessão abriu as três para conferir. As outras foram citadas só pelo nome do site e ficam como "não conferido". Nada desta seção mudou um teste. O rótulo de IA virou regra fixa (seção 6), com o ok do Rafael.

**Conferido na fonte**

| O que diz | Quem disse e quando | Fonte | Efeito no plano |
|---|---|---|---|
| Os três sinais que mais pesam são tempo assistido, curtidas e envios. Para quem não segue a conta, os envios pesam um pouco mais. | Mosseri, jan/2025 | [ZoomSphere](https://www.zoomsphere.com/blog/instagram-algorithm-2026-what-actually-gets-reach), 30/10/2026; [Buffer](https://buffer.com/resources/instagram-algorithms/), 23/10/2026 | Reforça o T4. |
| O Instagram olha "muito mais" para o que a pessoa manda a um amigo do que para comentários. | Mosseri, 23/10/2026 | ZoomSphere | Confirma o pedido de envio no T4, em vez de uma pergunta. |
| Conteúdo feito com IA não perde alcance só por ser IA, desde que esteja rotulado. | Mosseri, 16/10 e 23/10/2026 | ZoomSphere | Proposta de regra fixa: rótulo de IA nos posts com foto ou clipe realista. |
| Desde 31/08/2026, perfis que mostram uma pessoa gerada por IA sem o rótulo do Instagram têm alcance limitado e ficam fora do Explorar. | Instagram, 31/08/2026 | [CreatorFlow](https://creatorflow.so/blog/instagram-algorithm/), atualizado em 10/11/2026 | Os vídeos não mostram pessoas. Reforça o rótulo. |
| Vídeo feito pela própria conta conta como original. Vídeo com marca d'água de outro app perde distribuição. | Mosseri, 30/10/2026; regra estendida em 30/04/2026 | ZoomSphere; CreatorFlow | Os vídeos já seguem isso. |
| Apagar um post não afeta o alcance dos outros. | Mosseri, 30/10/2026 | ZoomSphere | Se o perfil ficar repetitivo com o 03 e o 04 refeitos, dá para apagar os originais sem prejudicar o resto. |
| A regra dos 3 primeiros segundos aparece como costume de criador. A página não a atribui ao Instagram. | — | CreatorFlow | O T1 continua medindo 1 s e 3 s pelo dado do TikTok, não por uma regra do Instagram. |

As três páginas não tratam de repostar o próprio vídeo reeditado. [HIPÓTESE] O risco para o T1 e o T2 é baixo, porque as regras de originalidade falam de conteúdo de outras pessoas. T1 e T2 seguem como estão.

**Veio na resposta, sem link para conferir** (não serve para decidir)

- Um "card" do Reels de 11/11/2025 que prevê quem vê menos de 3 s e se a pessoa vai usar o áudio (Mubert, 09/11/2026).
- Rótulo obrigatório de IA para cena ou áudio realista: "AI info" na Meta e "AI-generated content" no TikTok. Omitir pode levar a remoção ou restrição (ClipUGC, TikTok Seller Center, Sume, setembro de 2026).
- Trial Reels pedem 200 seguidores em conta profissional (FavStash). A conta está longe disso de qualquer jeito.
- Socialinsider, 70 milhões de posts de 2024 e 2025: no TikTok, os compartilhamentos por post cresceram 45% ao ano e os comentários caíram 24% (citado via Blckalpaca).
- Reels com áudio mutado alcançam menos (Mubert). Os vídeos têm narração, então não se aplica.

Se os links dessas fontes aparecerem, a sessão confere e move para a tabela de cima.

**Descartado**

- Declarações sem data: "hashtags não ajudam o alcance" e "metade dos vídeos é vista sem som". A Buffer cita o Mosseri sem dizer quando.
- Melhor horário segundo uma análise de 9,6 milhões de posts (Buffer, sem data da análise). Também não mudaria o horário fixo.
- Bloco 2, perfis brasileiros de carro elétrico: a pesquisa não achou nenhum perfil com números e datas. As matérias citadas (GZH e Gazeta de São Paulo) vieram sem link, e as notas apontam para outras páginas.
- Bloco 3, marcas antes do lançamento: nenhum caso. O único registro é um relato no Reddit, sem data.
- TikTok, lote inicial de conta nova e papel da busca: só opinião de blog, ou nada.

**Continua sem resposta**

- Se seguir e comentar no nicho muda para quem a conta é recomendada. O T6 é o próprio teste.
- Se é normal o lote inicial de uma conta nova ir para público geral (hipótese 2).
- Quais perfis brasileiros de elétrico existem e o que publicam. Sem essa lista, o T6 começa sem saber onde comentar.

## 6. Plano de testes

Três semanas, de 16/11 a 04/12, com 3 vídeos e 2 posts leves por semana, sempre em dia útil às 19h.

Como ler os números: a retenção do TikTok é o único gráfico segundo a segundo disponível. Com cerca de 100 visualizações por vídeo, a margem de erro de uma porcentagem fica perto de 10 pontos. Por isso só conta diferença de 15 pontos ou mais. São testes de direção, sem rigor estatístico.

| Teste | Variável (só ela muda) | Métrica que decide | Sucesso | Duração | Esforço |
|---|---|---|---|---|---|
| T1 · Abertura do 03 refeita | Os 3 primeiros segundos do vídeo 03: movimento desde o primeiro quadro, voz começando em 0,2 s e uma frase de situação no lugar da tela de erro parada. O resto fica igual. | TikTok: % em 1 s e em 3 s. Base: 33% e 12%. | 55% ou mais em 1 s e 25% ou mais em 3 s | 1 vídeo. Qui 19/11, 19h, como o original. Leitura em 48 h. | Baixo |
| T2 · Marca fora do começo do 04 | A linha 2 do vídeo 04, sem "No Mapere". A marca só aparece no fecho. | TikTok: dos que estavam em 3 s, quantos continuam em 6 s. Base: 36%. | 60% ou mais | 1 vídeo. Sex 20/11, 19h30, como o original. Leitura em 48 h. | Baixo |
| T3 · Duração | Vídeos novos de 18 a 25 s (uma ideia, sem capítulos) contra vídeos de 35 a 40 s, todos com a abertura que ganhar o T1. | TikTok: % que viu até o fim. Apoio: tempo médio dividido pela duração, nas duas redes. | Curtos com o dobro da conclusão dos longos | 2 curtos (23 e 27/11) contra 1 longo (25/11) e o 03 refeito | Médio |
| T4 · Pedido de envio no fim | A última frase: sai "Siga pra acompanhar a construção" e entra um pedido de envio, como "Manda pra quem tem elétrico". | Envios, comentários e salvamentos por 100 visualizações, somando as duas redes. Base: 1 em 800. | 1 ou mais por 100, na média de 3 vídeos | 3 vídeos (30/11, 02/12 e 04/12), contra os 3 da semana 2 | Baixo |
| T5 · Legenda para busca | A primeira linha da legenda do post passa a ser a frase que o motorista digitaria. As hashtags mudam com o tema, em vez das mesmas cinco. | TikTok: % do tráfego vindo da busca. Base: 0% a 0,6%. | Busca com 5% ou mais em 2 vídeos, ou termos de busca listados no painel | Todos os posts, de 19/11 a 04/12 | Baixo |
| T6 · Sinal de nicho | 15 minutos por dia de comentários úteis em perfis de elétrico, e seguir de 20 a 30 perfis do nicho com as contas da marca. Nunca pedir para seguir. | Visitas ao perfil e seguidores por semana. Base: 4 visitas e 2 seguidores em 7 dias no TikTok. | O triplo das visitas e 10 seguidores somados nas 3 semanas | De 17/11 a 04/12 | Médio (tempo do Rafael) |

A ordem é a do que se aprende por esforço: T1 e T2 custam um trecho refeito cada um e respondem às hipóteses 1 e 3. T3 e T4 dependem deles.

Calendário:

| Semana | Vídeos | Leitura |
|---|---|---|
| 1 · 16 a 20/11 | seg 16: vídeo 05 (já postado). qui 19: 03 refeito. sex 20: 04 refeito. | T1 no sábado 21. T2 no domingo 22. |
| 2 · 23 a 27/11 | seg 23: curto. qua 25: longo. sex 27: curto. | T3 no domingo 29. |
| 3 · 30/11 a 04/12 | seg 30, qua 02 e sex 04: três vídeos na duração que ganhar o T3, com pedido de envio. | T4 no domingo 06/12. |

Revisão final na segunda, 07/12.

Se o T1 não bater o critério, o primeiro vídeo da semana 2 testa uma segunda abertura, e o T3 anda um vídeo para a frente.

**Calendário refeito em 25/11.** O que saiu de fato:
- o 03b em 17/11 e o 04b em 18/11;
- o 05 repostado igual em 19/11;
- o 06 em 20/11;
- nada de 21 a 25/11, então a semana 2 não aconteceu.

O T1 passou, e o T3 começa com a abertura dele. Decisões do Rafael em 25/11.

| Semana | Posts | Leitura |
|---|---|---|
| 23 a 27/11 | sex 27: post leve com as primeiras telas do app (Figma), que cumpre a promessa do 06 | |
| 30/11 a 04/12 | T3, todos com a receita da [análise](analise-2026-11-25.md) (seção 6). seg 30: curto, "A recarga para sozinha no meio: por quê". qua 02: longo, "Carregador quebrado na estrada: como não ficar na mão". sex 04: curto, "Meu carro não carrega nesse carregador". | T3 na segunda 07/12, 72 h depois do último |
| 07 a 11/12 | seg 07, qua 09 e sex 11: T4, três vídeos na duração que ganhar o T3, com pedido de envio | T4 na segunda 14/12 |

- Revisão final na terça, 15/12.
- Os temas do T3 saíram dos termos de busca do TikTok (seção 7 da análise). Cada fato técnico é conferido com fonte antes do roteiro (Gemini, perfil `research`).
- T3, comparação: os 2 curtos novos contra o longo novo e o 03b. O critério não muda: os curtos com o dobro da conclusão dos longos.
- **T2, decisão de 25/11:** o 04 não é repostado de novo. Em cada vídeo novo, a explicação do app fica depois de o vídeo entregar alguma coisa, e a leitura do T2 sai deles. Mesma métrica (% em 6 s ÷ % em 3 s) e mesmo critério (60%).

Regras fixas, que não são teste:
- No TikTok, escolher a capa com o título e conferir depois de postar.
- Marcar o rótulo de IA nas duas redes em todo post com foto ou clipe realista feito por IA, incluindo o 04 refeito. Os posts 04 e 05 saíram sem o rótulo. O Rafael edita os dois e liga o rótulo.
- Responder todo comentário na primeira hora.
- Os 2 posts leves da semana (carrossel ou bastidor) ficam fora dos testes.
- Desde 25/11, não se reposta vídeo igual. O repost do 05 em 19/11 rendeu menos que o original. Refazer, só com um trecho novo, como o 03b.

Fora deste ciclo, e por quê:
- Teste de horário. Com 3 ou 4 vídeos por horário e temas diferentes, o resultado não diria nada. O horário fica fixo para não sujar os outros testes.
- Stories, enquetes e caixa de perguntas. Com 1 seguidor ninguém vê: os stories aparecem com 0 visualização no Business Suite. Voltam perto de 100 seguidores.
- Impulsionamento pago. Fora do escopo.

## 7. Rotina de medição

**Depois de cada vídeo, em 48 horas.** Uma linha na tabela abaixo, que fica em `metricas.md`. A sessão pode coletar pelo navegador, como em 16/11 e 25/11. Desde 25/11, a leitura que decide um teste no TikTok sai em 72 h, porque o 03b teve uma onda no 3º dia. No Instagram, 48 h bastam: a entrega acaba em cerca de 24 h.

| Vídeo | Teste | Dia e hora | Duração | TikTok: visualizações | % em 1 s | % em 3 s | % em 6 s | Tempo médio | % até o fim | Para Você / perfil / busca | Instagram: visualizações | Tempo médio | Curtidas, envios, salvos, comentários (as duas redes) | Seguidores ganhos |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 03 refeito | T1 | | | | | | | | | | | | | |

**Toda segunda.** Seguidores nas duas redes, visitas ao perfil no TikTok e a lista de "criadores que seus espectadores também assistiram". Se aparecer perfil de carro elétrico na lista, é sinal de que o T6 está funcionando.

**Quando der.** Um print de "Ver insights" de cada reel no app do Instagram, salvo em `dados/` como `NN-instagram-retencao.png`. É o único jeito de ter a retenção e a origem do Instagram.

**Regra de decisão.**
- Bateu o critério: vira padrão dos próximos vídeos.
- Ficou entre a base e o critério: repete uma vez, com um ajuste.
- Igual ou pior que a base: volta ao padrão anterior.
- Menos de 80 visualizações no TikTok em 72 horas: "sem leitura". O vídeo não conta nem a favor nem contra.

O critério de cada teste foi fixado antes de postar. Depois de ver o número, ele não muda.

## 8. Mudanças sugeridas na skill /novo-video

Só entram com pedido do Rafael, e de preferência depois que o teste correspondente bater o critério. Em 25/11, com o T1 aprovado, ele pediu as três primeiras: a voz mais cedo, o movimento no primeiro quadro e o gancho do T1. As outras continuam esperando.

- **Voz mais cedo (motor). Aplicada em 25/11.** A primeira palavra começa em 0,2 s, como no 02 e no 03b. O `"entrada"` do `_motor/modelo/roteiro.json` passou de 0.45 para 0.2. O padrão de `narracao.mjs` ficou em 0,45 s, para não mudar os vídeos antigos que não definem `entrada`.
- **Movimento no primeiro quadro (regra e checagem). Aplicada em 25/11.** Algo já se mexe em t = 0. Nada de tela de aplicativo parada no gancho. O `quadros.mjs` compara o quadro de 0 s com o de 0,5 s e falha se forem iguais.
- **Gancho do T1 (regra). Aplicada em 25/11.** A situação de tensão (bateria no fim e um carregador que falha) e a promessa do que vem até os 3 s, na skill `/novo-video`.
- **Marca fora do começo (regra).** "Mapere" só depois de o vídeo entregar alguma coisa. Depende do T2.
- **Lote de ganchos (passo 2).** Antes do roteiro, de 6 a 10 ganchos em pelo menos 3 estilos, cada um com o que aparece, o que se diz e o texto na tela. O Rafael escolhe.
- **Duração (passo 2).** O alvo de 35 a 45 s passa a ser o que ganhar o T3.
- **Chamada final (regras fixas).** Hoje a regra diz que a única chamada é seguir o perfil. Muda se o T4 bater o critério.
- **Legenda do post (passo 9).** Primeira linha com a frase de busca e hashtags por tema. Lembrete de escolher a capa no TikTok.
- **Rótulo de IA (passo 9).** Quando o vídeo tiver fundo por IA (foto ou clipe), o `legendas.md` lembra de marcar o rótulo de IA no Instagram e no TikTok. Já é regra do plano desde 16/11.
- **Registro (passo 9).** Último passo: abrir a linha do vídeo em `metricas.md` e marcar a coleta de 48 horas.

## 9. Decisões do Rafael

Todas em 2026-11-16.

- Concorda que o primeiro segundo do vídeo é o maior gargalo.
- Desde 08/11, só postou: não reviu os próprios vídeos várias vezes, não mandou link a conhecidos e não comentou em perfis do nicho.
- A pesquisa externa roda pelo app Google AI Plus, sem custo por uso.
- O ciclo dura 3 semanas, com 3 vídeos e 2 posts leves por semana.
- Pode repostar o 03 e o 04 com um trecho refeito (T1 e T2).
- A chamada do T4 é um pedido de envio.
- O horário fica fixo, em dia útil às 19h, sem teste de horário.
- Aprovou o diagnóstico, os testes T1 a T6, o calendário e os critérios de sucesso, e pediu para salvar com a pesquisa pendente.
- Depois da pesquisa: o rótulo de IA vira regra fixa em todo post com foto ou clipe realista por IA.
- Os posts 04 e 05 saíram sem o rótulo de IA. O Rafael edita os dois.
- A sessão monta a lista de perfis do nicho para o T6, em `social/_estrategia/perfis-nicho.md`.

Em 2026-11-25, depois da análise da semana 1:

- Os próximos vídeos usam os termos de busca do TikTok como tema e a receita do 03b. O T3 fica com 2 curtos e 1 longo, de 30/11 a 04/12, e o calendário anda uma semana.
- O que o T1 validou entra na skill `/novo-video` e no motor: gancho com a situação de tensão, voz em 0,2 s, movimento no primeiro quadro, promessa até os 3 s e a checagem do quadro 0 contra o de 0,5 s.
- O T2 não reposta o 04: o ajuste vai para os vídeos novos, e a leitura sai deles.
- Os arquivos da análise vão para a branch `social`, com commit e push.
