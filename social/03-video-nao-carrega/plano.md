# Vídeo 03: "Seu carro não carrega no posto? 3 motivos"

Vídeo vertical para TikTok e Reels no formato do vídeo "informativo" da pasta Videos-ref do Drive (perfil @vista_explodida): um problema que o motorista reconhece, o porquê mostrado em desenhos com etiquetas, uma barra de capítulos no topo e uma saída prática no fim. O Mapere usa só o formato. O visual é o da marca, em 2D, feito por código como o vídeo 02. Quem produz é o Fable 5.2 numa sessão nova, seguindo `prompt-fable.md`.

## Por que este tema

Saiu das respostas da pesquisa (23 motoristas, out/2026). O número não entra no vídeo.

- Das 15 pessoas que contaram o que deu errado, 8 descreveram a mesma cena: o carregador estava lá, mas a recarga não começava. App sem conexão, carregador sem rede, celular sem sinal, cadastro recusado, cartão que só funcionou trocando pelo Pix.
- Usar um app e um cadastro diferentes em cada rede é o 3º incômodo mais marcado (10 de 23).
- O terceiro motivo do vídeo (carregador sem internet) leva naturalmente ao Mapere, sem cara de propaganda.

## Decisões

| Tema | Decisão |
|---|---|
| Promessa | "3 motivos pro seu carro não carregar no posto, e o que fazer." Lista com número: a pessoa entende em 2 s e sabe quanto falta. |
| Linguagem | Conversa entre motoristas: "tá", "pra", frases curtas, sem termo técnico. |
| Gancho | Na tela, desde o primeiro quadro, um dedo vai apertar "Tentar de novo" pela quarta vez, com o título fixo no topo. A voz, firme e próxima, como um amigo segurando o seu braço: "Para de apertar 'tentar de novo'." |
| Voz | Matheus Alves (a mesma do vídeo 02), com marcações de tom do modelo `eleven_v4`. O gancho é testado em 3 tons antes da narração inteira. |
| Visual | Desenho plano 2D nas cores da marca, etiquetas em fonte mono apontando para o que a voz fala, barra de 3 capítulos no topo, legenda palavra por palavra. |
| Final | O mapa do vídeo 02 com um posto "Com defeito" e um "Livre". O ponto aceso vira o ponto do logo, como no vídeo 02, para os vídeos parecerem da mesma série. |
| Duração | 35 a 45 s |
| Dado da pesquisa | Não entra no vídeo. |
| Música | Não vai no arquivo. Entra no app: no TikTok, só da Biblioteca Comercial; no Instagram, é opcional. |

## Roteiro

| Tempo | Na tela | Narração |
|---|---|---|
| 0–2 s | Celular grande com a mensagem "Não foi possível iniciar a recarga" e o botão **Tentar de novo**, com um contador de 3 toques. Um dedo vai para o quarto toque e congela quando a voz diz "Para". Título fixo no topo: **Seu carro não carrega no posto? 3 motivos** | "Para de apertar 'tentar de novo'." |
| 2–6 s | O celular vai para o lado e a barra de capítulos **1 · 2 · 3** aparece no topo, logo abaixo do título. Do capítulo 1 em diante, o título sai e fica só a barra, com o nome do capítulo atual: **Sem sinal**, **Pagamento** e **Carregador sem internet**. | "Três motivos pro seu carro não carregar no posto, e o que fazer." |
| 6–15 s | Capítulo 1. Garagem de subsolo em corte, com o carro plugado. O celular tem as barras de sinal vazias e a etiqueta **sem sinal**. Uma seta sobe até a rampa, onde o sinal volta, com a etiqueta **inicia daqui**. | "Um: seu celular tá sem sinal. Em garagem de subsolo é comum. Dica: pluga o carro, sobe até onde pega sinal e inicia por lá." |
| 15–23 s | Capítulo 2. Um cartão genérico recebe a etiqueta **Recusado**, e ao lado o Pix recebe **Aprovado**. Depois aparece a etiqueta **2 jeitos de pagar**. | "Dois: o pagamento travou. Às vezes é só trocar o cartão pelo Pix. Deixa sempre um segundo jeito de pagar no app." |
| 23–32 s | Capítulo 3. O carregador está com a tela acesa. Um ponto em Brasa sai do celular, passa pela central e para antes de chegar ao carregador, onde a antena aparece cortada e a etiqueta diz **sem conexão**. | "Três: o carregador tá sem internet. A tela acende, mas a liberação não chega. Aí, pelo app, não tem jeito: é ir pra outro posto." |
| 32–37 s | A câmera se afasta e mostra o mapa do vídeo 02: um posto **Com defeito** e outro **Livre · Confirmado há 4 min**, com o ponto aceso. | "E isso dá pra saber antes de sair. É o que o Mapere vai mostrar." |
| 37–40 s | O ponto aceso vira o ponto final do logo **Mapere.** Embaixo: **Siga pra acompanhar a construção.** | "Siga pra acompanhar a construção." |

Rodapé discreto só na cena do mapa: *Mapa com dados do OpenStreetMap. Postos ilustrativos.*

Os tempos são aproximados. A animação acompanha a narração que a ElevenLabs devolver.

## Etapas

O Fable para três vezes e espera o seu ok:

1. **Quadros-chave:** uma imagem por linha do roteiro e uma com a zona segura desenhada por cima. Aqui você aprova o visual.
2. **Tom do gancho:** a frase "Para de apertar 'tentar de novo'" em 3 tons, com a voz do Matheus Alves. Você escolhe de ouvido.
3. **Vídeo final:** o MP4, uma cópia com áudio em MP3 para ouvir no VS Code, a capa, a legenda do post e o relatório de créditos.

## O que você faz antes

1. Abra uma sessão nova do Claude Code em `G:\mapere`, escolha o Fable 5.2 com `/model` e envie: `Leia social/03-video-nao-carrega/prompt-fable.md e siga as instruções.`
2. O conector da ElevenLabs do claude.ai já funciona no Claude Code, sem chave de API.

## Orçamento

O teto é de 2.000 créditos da ElevenLabs. No vídeo 02, o modelo `eleven_v4` cobrou cerca de 1 crédito por caractere por take, e a transcrição saiu por 0. A narração tem cerca de 600 caracteres com as marcações de tom.

| Etapa | Estimativa |
|---|---|
| Gancho em 3 tons, 2 takes cada | cerca de 270 |
| Narração completa, 2 takes | cerca de 1.200 |
| Transcrição | 0 no vídeo 02 |
| **Total** | **entre 750 e 1.500** |

O Fable consulta o custo exato antes de cada geração e anota tudo em `_fonte/creditos.md`.

## Entregas

Todas ficam em `social/03-video-nao-carrega/`:

- `video/mapere-nao-carrega.mp4`: 1080x1920, 30 fps, narração sem música, áudio AAC
- `video/previa-para-ouvir-no-vscode.mp4`: a mesma imagem com áudio MP3, só para conferir (o VS Code não toca AAC). Opcional: `renderizar-video.mjs --sem-previa` não gera.
- `video/capa.png` e `video/capa-3x4.png`: com o título legível no recorte da grade do Instagram
- `legendas.md`: textos do post para o TikTok e o Instagram, revisados com o humanizer
- `_fonte/`: cena, scripts, narração e alinhamento, para renderizar de novo depois de algum ajuste

A pasta `_ref/` guarda o vídeo "informativo" e duas folhas de quadros tiradas dele. É só referência de formato: não vai para o Git e não é publicada.

## Quando você der o ok final

O Fable guarda o trabalho em dois lugares e te manda os links:

- **Drive:** pasta `Mapere/Posts/03-video-nao-carrega`, com o plano, o prompt, as legendas, a pasta `video/` e a `_fonte/` dividida em três zips (scripts e áudio, prévias, verificação). O conector do Drive só aceita arquivos de até ~7,4 MB, por isso a divisão e por isso o MP4 sai com CRF 19 (5,9 MB, sem diferença visível). A `_ref/` não sobe, porque o vídeo de referência já está em `Mapere/Videos-ref`.
- **GitHub:** branch `social`, criada a partir da `main`, com um commit só desta pasta, sem `_ref/` e sem os zips. As outras branches não são tocadas.

## Depois

- Publicar seguindo `social/01-apresentacao/guia-contas-e-postagem.md` (dia útil, perto das 19h).
- Se o formato pegar, a mesma estrutura serve para outros "3 motivos" tirados da pesquisa.
