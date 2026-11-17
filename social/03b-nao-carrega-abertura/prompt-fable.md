# Prompt: vídeo 03 com a abertura refeita (teste T1)

Cole numa sessão nova do Claude Code aberta em `G:\mapere`, com o Fable 5.2 escolhido em `/model`:
`Leia social/03b-nao-carrega-abertura/prompt-fable.md e siga as instruções.`

---

<role>
Você é editor de vídeo curto e engenheiro de front-end sênior. Você trabalha no motor de vídeos por código do Mapere: HTML, SVG e GSAP capturados quadro a quadro pelo Playwright e montados no ffmpeg. Você entende retenção dos primeiros segundos no TikTok e no Reels. Aqui o trabalho é cirúrgico: trocar a abertura de um vídeo que já existe sem tocar no resto, porque o vídeo é um teste A/B contra o original.
</role>

<context>
<projeto>
O Mapere é um app de status de eletropostos confirmado por motoristas. Ele ainda não existe; os perfis @mapere.app no Instagram e no TikTok mostram a construção. Fale com o Rafael em português do Brasil, com frases curtas. Ele às vezes acessa de longe: mande arquivos com SendUserFile e nunca peça para abrir localhost.
</projeto>

<teste_t1>
Fonte: `social/_estrategia/plano-alcance.md`, seções 3, 4, 6 e 7. Leia antes de começar.

- Vídeo original: `social/03-video-nao-carrega/` ("Seu carro não carrega no posto? 3 motivos", 39,5 s). É o vídeo que menos segurou: no TikTok, 33% ainda assistiam em 1 s e 12% em 3 s.
- No primeiro segundo do original aparecem um celular parado com "Não foi possível iniciar a recarga" e a voz entrando em 0,45 s com "Para de apertar 'tentar de novo'".
- Quem recebe o vídeo é público geral do Para Você: 31% têm de 18 a 24 anos, 78% são homens e a maioria não tem carro elétrico.
- A variável do T1 são os 3 primeiros segundos. Eles precisam ter algo se mexendo em t = 0, voz em 0,2 s e uma frase de situação no lugar da tela de erro parada. Do capítulo 1 ("Um: seu celular tá sem sinal", marca `cap1`, 6,89 s no original) até o fim, nada muda.
- Critério fixado antes de postar: 55% ou mais em 1 s e 25% ou mais em 3 s no TikTok. Não é seu papel prever se vai bater.
- Postagem: quinta, 19/11/2026, às 19h. O vídeo tem que estar aprovado até as 17h desse dia.
</teste_t1>

<estado_do_03>
O 03 é anterior ao `_motor/` e tem scripts próprios em `_fonte/`: `montar-narracao.mjs`, `montar-legenda.mjs`, `palco.mjs` (zona segura 220/480/180/110), `quadros.mjs`, `renderizar-video.mjs`, `capa.mjs`, `cena.html`, `legenda.json`, `audio/`.

Narração original, take A, tom `[firm]` na linha 1 e `[conversational]` na linha 2. O texto completo está em `_fonte/creditos.md`.
- Linha 1: "Para de apertar 'tentar de novo'." (0,45 a 2,47 s)
- Linha 2: "Três motivos pro seu carro não carregar no posto, e o que fazer." (2,925 a 6,29 s), seguida de uma pausa de 0,6 s antes de `cap1`
- Voz: Matheus Alves, `wSbRKUhF0tUmkj9exCud`, modelo `eleven_v4`, pelo conector claude.ai ElevenLabs, sem chave de API. Flow do 03: `hZ2dh3eMyxBNUyANHkEz`.
- O áudio é montado por `montar-narracao.mjs`, que põe silêncio nas pausas que já existem na take, sem mexer na fala.
</estado_do_03>

<decisoes_do_rafael>
Tomadas em 17/11/2026. Não reabra nenhuma.
1. Esta sessão faz só o T1. O T2 (04 sem "No Mapere") fica para outra.
2. A abertura sai de um lote de 6 a 10 ganchos que você propõe, e o Rafael escolhe.
3. Só a abertura ganha voz nova. Todo o resto usa o áudio da take A original.
4. Os ajustes de voz em 0,2 s e de checagem de movimento ficam na `_fonte` deste vídeo. `social/_motor/` e `.claude/skills/novo-video/` não mudam.
</decisoes_do_rafael>

<regras_da_marca>
- "Mapere" sem acento, e nunca na abertura (hipótese 3 do plano: marca cedo soa como anúncio).
- O app fica no futuro: "vai mostrar", "vai ter".
- Linguagem de conversa entre motoristas ("tá", "pra"), sem termo técnico (nada de CCS2, OCPP, kW). Quem nunca carregou um carro tem que entender em 2 s.
- Nenhum número da pesquisa com motoristas no vídeo. Nada de chama, fumaça ou fogo. Nenhum lugar real reconhecível. Status sempre com ícone e texto.
- Sem música no arquivo.
- Rótulo de IA nas duas redes em todo post com foto ou clipe realista feito por IA (regra fixa do plano desde 16/11).
</regras_da_marca>
</context>

<instructions>
1. **Leitura.** Leia `social/_estrategia/plano-alcance.md`, `social/03-video-nao-carrega/plano.md`, `_fonte/cena.html`, `_fonte/montar-narracao.mjs`, `_fonte/legenda.json` e `social/_motor/README.md` (só como referência). Olhe também os 3 primeiros segundos do vídeo 02 (`social/02-video-mapa/`), o que mais segurou (81% em 1 s): o carro já anda no primeiro quadro e a voz entra em 0,2 s.

2. **Pasta.** Crie `social/03b-nao-carrega-abertura/` com `_fonte/` copiada do 03 (sem `previa/` e `verificacao/`) e uma `video/` vazia. O 03 original não muda: ele está publicado e é a base do teste.

3. **Lote de ganchos: checkpoint 1.** Carregue antes o skill `viral-hooks` e use os tipos de gancho e os erros que ele lista para variar o lote. Ele é guia de padrão: as regras da marca e de `<constraints>` valem mais. Pense no que faz alguém sem carro elétrico parar de rolar a tela. Depois proponha de 6 a 10 aberturas em pelo menos 3 estilos (por exemplo: situação em primeira pessoa, pergunta direta, cena em movimento sem fala nos primeiros 0,5 s, contraste antes e depois). Cada gancho segue o formato de `<output_format>` e precisa:
   - ter movimento visível já em t = 0;
   - durar até cerca de 2,5 s de fala e emendar sem atrito na linha 2, que continua igual ("Três motivos pro seu carro não carregar no posto, e o que fazer.");
   - dizer se o desenho é feito por código, no estilo 2D do resto do 03, ou se pede imagem ou clipe por IA. No segundo caso, informe o custo com `estimate_only` e avise que o post vai levar rótulo de IA;
   - dizer se o título fixo "Seu carro não carrega no posto? 3 motivos" fica, muda ou entra mais tarde.
   Mostre o lote com AskUserQuestion: os 3 ou 4 mais fortes como opções e o resto no texto da pergunta. Depois da escolha, monte a abertura na cena e mande com SendUserFile uma folha com os quadros de 0 s, 0,5 s, 1 s, 2 s e 3 s, com a zona segura desenhada por cima. Siga só com o ok do Rafael.

4. **Tom: checkpoint 2.** No flow do 03, gere a frase nova do gancho em 3 tons, com 2 takes cada. Antes, consulte o custo com `estimate_only`. Monte um MP4 curto por tom, com a abertura animada e o áudio em **MP3** (o VS Code não toca AAC), mande os três e pergunte qual fica.

5. **Narração da abertura.** No tom escolhido, gere 2 takes de **linha 1 nova + linha 2 original**, com `[conversational]` antes da linha 2, para a voz chegar a "Três motivos" com a mesma prosódia. Transcreva com `creative_transcribe_audio` e fixe as takes no flow com `creative_add_flow_asset_node`. Em seguida, monte a narração em `_fonte/`:
   - 0,2 s de silêncio, depois a take nova do começo até o fim de "e o que fazer.";
   - a emenda cai dentro da pausa de 0,6 s antes de "Um:", e não no meio de uma frase;
   - de "Um:" em diante, o áudio da take A original, sem mudança;
   - `alinhamento.json` e `legenda.json` recalculados, com as marcas da linha 3 em diante deslocadas pela diferença de duração. A cena depois de `cap1` não muda, só desloca no tempo.
   Escreva um script novo para isso (por exemplo `_fonte/emendar-narracao.mjs`) e não altere o funcionamento de `montar-narracao.mjs`. Iguale o volume e o timbre na emenda: as duas partes medidas com loudnorm, no máximo 1 LU de diferença.

6. **Checagens antes do render.** Carregue o skill `superpowers:verification-before-completion`. Cada item abaixo só conta como ok com a saída do comando à vista, e o relatório do checkpoint 3 traz essa saída.
   - Movimento: compare o quadro de 0 s com o de 0,5 s, pixel a pixel, e falhe se forem iguais. Faça só na `_fonte` deste vídeo.
   - Voz: a primeira palavra começa entre 0,15 e 0,25 s.
   - Zona segura: nenhum texto fora dela (`quadros.mjs` local).
   - Resto igual: tire um quadro de 1 em 1 s de `cap1` até o fim nos dois vídeos, o 03 e o 03b, compensando o deslocamento, e confira que batem.
   - Emenda: mande com SendUserFile um MP3 de 4 s em volta da emenda.

7. **Render: checkpoint 3.** Renderize `video/mapere-nao-carrega-v2.mp4` (1080x1920, 30 fps, CRF 19, -14 LUFS, AAC) e a cópia `video/previa-para-ouvir-no-vscode.mp4` com áudio MP3. Mande os dois com SendUserFile, junto com o relatório de `<output_format>`. Ajustes de pausa ou de cena não gastam crédito: refaça só a montagem e o render.

8. **Fechamento, depois do ok:**
   - Capa: refaça só se o título mudou; se não mudou, copie as do 03.
   - `plano.md`: o que mudou em relação ao 03, o gancho escolhido e os que ficaram de fora (servem para a segunda abertura, se o T1 não bater), e os tempos novos.
   - `legendas.md`, para TikTok e Instagram, revisado com o skill `humanizer` (carregue-o antes de escrever). A legenda já entra no T5: a primeira linha é a frase que um motorista digitaria na busca, e as hashtags falam do tema do vídeo, em vez das mesmas cinco de sempre. Inclua os lembretes: escolher a capa com título no TikTok e conferir depois de postar; ligar o rótulo de IA só se entrou imagem ou clipe realista por IA.
   - `social/_estrategia/metricas.md`: na linha "03 refeito | T1", preencha dia e hora (qui 19/11, 19h) e duração. Deixe o resto em branco e anote a leitura de 48 h para sábado, 21/11, depois das 19h.
   - Drive: pasta `Mapere/Posts/03b-nao-carrega-abertura`, com plano, legendas, `video/` (o MP4 em CRF 19; se passar de ~7 MB, recodifique em CRF 26 e confira o SSIM) e a `_fonte` em zips de até ~7 MB. Sem `_ref/`.
   - GitHub: um commit na branch `social`, numa worktree temporária a partir de `origin/social`, só com esta pasta. Ficam de fora `_ref/`, os zips, `_fonte/previa/`, `_fonte/verificacao/`, `_fonte/fundo-quadros/` e `node_modules`. Sem PR, e nenhuma outra branch é tocada.
   - Memória: `mapere-video-03b.md`, com as decisões, os créditos e o que falta (postar em 19/11 e ler em 21/11), mais a linha no `MEMORY.md`.
</instructions>

<examples>
Os ganchos abaixo mostram só o nível de detalhe esperado. Não copie nenhum deles.

<gancho_bom>
Estilo: situação em primeira pessoa
Na tela (t = 0): o carro já entra em cena andando e para na vaga; o cabo vai até a tomada.
Movimento em t = 0: o carro está em movimento no primeiro quadro.
Fala (0,2 s): "Cheguei no posto com 10% e ele não libera."
Texto na tela: título fixo no topo; legenda palavra por palavra.
Feito por: código, no estilo 2D do 03. Custo de imagem: 0.
Por que segura quem não tem elétrico: "não libera" se entende sem saber como funciona a recarga.
</gancho_bom>

<gancho_ruim>
Na tela: celular parado com uma mensagem de erro.
Fala: "No Mapere você vai saber se o posto funciona."
Problemas: não tem movimento em t = 0, a tela de app parada é o que derrubou o 03, a marca aparece no primeiro segundo e é uma promessa, não uma situação.
</gancho_ruim>

<gancho_ruim>
Fala: "Você sabia que o protocolo OCPP pode falhar no carregador CCS2?"
Problemas: termo técnico, e "você sabia" não diz nada sobre a cena de quem assiste.
</gancho_ruim>
</examples>

<constraints>
- Do `cap1` em diante, nada muda: nem desenho, nem texto, nem fala, nem pausa. Se algo precisar mudar ali, pare e pergunte ao Rafael, porque isso invalida o teste.
- Não altere `social/03-video-nao-carrega/`, `social/_motor/` nem `.claude/skills/novo-video/`.
- Não mude o critério de sucesso do T1, nem a data e o horário da postagem.
- Créditos da ElevenLabs: teto de 1.000 para a voz neste vídeo; a estimativa fica entre 400 e 600. Consulte `estimate_only` antes de cada geração e registre cada chamada em `_fonte/creditos.md`, abaixo das do 03, numa seção "03b". Imagem ou vídeo por IA só roda depois do ok do Rafael para o valor orçado.
- Nunca repita uma geração para "tentar de novo": cada chamada cobra. Se a take sair ruim, mostre ao Rafael e pergunte.
- Não invente número de retenção, de alcance nem de custo. O que não estiver nos arquivos ou na resposta da ferramenta vai como `[A CONFIRMAR]` ou "não sei".
- Se uma ferramenta falhar (conector da ElevenLabs, Drive, Playwright), avise em uma linha, diga o que ficou pendente e siga com o que não depende dela.
- O texto que vai na tela e no post passa pelo skill `humanizer`. Sem travessão como pausa de frase.
- Não use o skill `/novo-video`: ele cria pasta nova, propõe tema e usa o `_motor`, que o 03 não usa.
</constraints>

<output_format>
Formato de cada gancho no checkpoint 1:

```
N. [Estilo]
Na tela (t = 0): ...
Movimento em t = 0: ...
Fala (a partir de 0,2 s): "..."
Texto na tela: título [fica | muda para "..." | entra em X s]; legenda ...
Feito por: código | imagem por IA | clipe por IA (custo estimado: N créditos; leva rótulo de IA)
Por que segura quem não tem elétrico: uma frase
```

Relatório do checkpoint 3, em markdown curto:

```
## 03b: abertura refeita (T1)
- Gancho escolhido: N, "fala"
- Duração: 03 original 39,5 s → 03b X s (deslocamento de Y s a partir do cap1)
- Primeira palavra em: X s
- Movimento entre 0 s e 0,5 s: ok | falhou
- Zona segura: ok | N textos fora
- Resto igual ao 03 (cap1 até o fim): ok | diferenças em ...
- Volume na emenda: X LU de diferença
- Créditos: gasto nesta sessão N, total no flow M
- Arquivos: caminhos completos
- Pendente: ...
```
</output_format>
