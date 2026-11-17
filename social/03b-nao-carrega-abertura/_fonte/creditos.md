# Créditos ElevenLabs: vídeo 03

Teto do trabalho: 2.000 créditos.
Flow: `hZ2dh3eMyxBNUyANHkEz` ("Vídeo 03 - narração"). Modelo de voz: `eleven_v4`. Voz: Matheus Alves - Versatile Neutral PT-BR (`wSbRKUhF0tUmkj9exCud`).
O valor cobrado é o que a ElevenLabs informou na resposta de cada chamada.

## Chamadas

| # | Data | Chamada | O quê | Estimativa | Cobrado | Acumulado |
|---|---|---|---|---|---|---|
| 1 | 2026-11-11 | `creative_create_flow` | cria o flow | sem custo | 0 | 0 |
| 2 | 2026-11-11 | `creative_generate_speech` com `estimate_only` | gancho, tom [firm] | 80 | 0 | 0 |
| 3 | 2026-11-11 | `creative_generate_speech` com `estimate_only` | gancho, tom [urgent] | 84 | 0 | 0 |
| 4 | 2026-11-11 | `creative_generate_speech` com `estimate_only` | gancho, tom [warm but firm] | 98 | 0 | 0 |
| 5 | 2026-11-11 | `creative_generate_speech` | gancho, tom [firm], 2 takes de 40 | 80 | 80 | 80 |
| 6 | 2026-11-11 | `creative_generate_speech` | gancho, tom [urgent], 2 takes de 42 | 84 | 84 | 164 |
| 7 | 2026-11-11 | `creative_generate_speech` | gancho, tom [warm but firm], 2 takes de 49 | 98 | 98 | 262 |

| 8 | 2026-11-11 | `creative_generate_speech` com `estimate_only` | narração completa, 2 takes | 1.186 | 0 | 262 |
| 9 | 2026-11-11 | `creative_generate_speech` | narração completa, 2 takes de 593 | 1.186 | 1.186 | 1.448 |
| 10 | 2026-11-11 | `creative_add_flow_asset_node` (2 chamadas) | fixa as takes A e B no flow | sem custo | 0 | 1.448 |
| 11 | 2026-11-11 | `creative_transcribe_audio` com `estimate_only` (2 chamadas) | transcrição das takes A e B | 0 | 0 | 1.448 |
| 12 | 2026-11-11 | `creative_transcribe_audio` (2 chamadas) | transcrição das takes A e B, modelo `eleven_scribe_v1` | 0 | 0 | 1.448 |

**Total: 1.448 de 2.000.**

## Narração completa

O Rafael escolheu o tom firme no checkpoint 2. Texto enviado (as marcações entre colchetes não são faladas):

> [firm] Para de apertar 'tentar de novo'.
> [conversational] Três motivos pro seu carro não carregar no posto, e o que fazer.
> Um: seu celular tá sem sinal. Em garagem de subsolo é comum. Dica: pluga o carro, sobe até onde pega sinal e inicia por lá.
> Dois: o pagamento travou. Às vezes é só trocar o cartão pelo Pix. Deixa sempre um segundo jeito de pagar no app.
> Três: o carregador tá sem internet. A tela acende, mas a liberação não chega. Aí, pelo app, não tem jeito: é ir pra outro posto.
> E isso dá pra saber antes de sair. É o que o Mapere vai mostrar.
> Siga pra acompanhar a construção.

| Take | generation_id | Duração | Arquivo | Transcrição |
|---|---|---|---|---|
| A (usada no vídeo) | `q9s0xLVN52aeLNAXtRjy` | 34,32 s | `audio/narracao-take-a.mp3` | `audio/narracao-take-a.palavras.json` |
| B | `zWK259QeBUZ6ttX8Ylzm` | 33,60 s | `audio/narracao-take-b.mp3` | `audio/narracao-take-b.palavras.json` |

As duas transcrições devolveram as 111 palavras do roteiro, com as marcações de tom como palavras à parte. `montar-narracao.mjs` e `montar-legenda.mjs` tiram as marcações. Fiquei com a take A, que é um pouco mais pausada. Para trocar pela B, sem gastar crédito: `node montar-narracao.mjs b`, `node montar-legenda.mjs` e `node renderizar-video.mjs`.

## Gancho em 3 tons

Texto: "Para de apertar 'tentar de novo'." A marcação entre colchetes vai antes da frase e não é falada.

| Tom | Marcação | Take | generation_id | Duração | Arquivo |
|---|---|---|---|---|---|
| firme | `[firm]` | 1 | `xyppoPwiuoqG4coG5vap` | 2,32 s | `audio/gancho/firme-take1.mp3` |
| firme | `[firm]` | 2 | `1VtSzADplT10rbFaFKx7` | 2,40 s | `audio/gancho/firme-take2.mp3` |
| urgente | `[urgent]` | 1 | `q0E6M5KsGTsEd2Q5giyQ` | 2,32 s | `audio/gancho/urgente-take1.mp3` |
| urgente | `[urgent]` | 2 | `Qr5pCwJ0cus5VPCNCOku` | 2,24 s | `audio/gancho/urgente-take2.mp3` |
| próximo | `[warm but firm]` | 1 | `VpNSPeXtwrAVJqiIBflq` | 2,56 s | `audio/gancho/proximo-take1.mp3` |
| próximo | `[warm but firm]` | 2 | `CJiHJrirKqxlhgkcXSrg` | 2,40 s | `audio/gancho/proximo-take2.mp3` |

Uma take ficou alguns segundos na fila por limite de chamadas simultâneas. O próprio serviço retomou, sem nova chamada e sem cobrança a mais.

## 03b: abertura refeita (T1)

Sessão de 2026-11-17. Mesmo flow (`hZ2dh3eMyxBNUyANHkEz`), mesma voz e mesmo modelo. Teto da voz neste vídeo: 1.000 créditos. Imagem ou clipe por IA tem conta separada e só roda com o ok do Rafael para o valor orçado.

| # | Data | Chamada | O quê | Estimativa | Cobrado | Acumulado (voz) |
|---|---|---|---|---|---|---|
| 1 | 2026-11-17 | `creative_generate_video` com `estimate_only`, Veo 3.1 Lite | orçamento do clipe do gancho 8, no padrão do nó (8 s, 16:9, 720p, com áudio). Cria o nó `KbH5wY1RxDA1abQVatjL` | 2.424 | 0 | 0 |
| 2 | 2026-11-17 | `creative_update_node` + `creative_run_flow_nodes` com `estimate_only` | o mesmo nó em 4 s, 9:16, 1080p, sem áudio | 1.212 | 0 | 0 |
| 3 | 2026-11-17 | `creative_generate_image` com `estimate_only`, gpt-image-2.5-sunburst, 2 variações | orçamento da foto do gancho 9, no padrão do nó (16:9, 1K). Cria o nó `xplzp3JuCIwMCpdUSY1p` | 381 | 0 | 0 |
| 4 | 2026-11-17 | `creative_update_node` + `creative_run_flow_nodes` com `estimate_only` | a mesma foto em 9:16, 2K, qualidade alta, 2 variações | 550 | 0 | 0 |
| 5 | 2026-11-17 | `creative_generate_speech` com `estimate_only` | gancho novo, tom [frustrated], 2 takes. Nó `XjdQpPugLxubDc2WxsiI` | 110 | 0 | 0 |
| 6 | 2026-11-17 | `creative_generate_speech` com `estimate_only` | gancho novo, tom [urgent], 2 takes. Nó `nyaT8415cSMWurCywgPy` | 102 | 0 | 0 |
| 7 | 2026-11-17 | `creative_generate_speech` com `estimate_only` | gancho novo, tom [conversational], 2 takes. Nó `QFxugt8VtJY2ie7eGSyv` | 118 | 0 | 0 |
| 8 | 2026-11-17 | `creative_run_flow_nodes` nos 3 nós acima, 2 takes cada | gancho novo em 3 tons (Rafael aprovou ~330). Duas takes pegaram fila por limite de chamadas simultâneas e o serviço retomou sozinho, sem nova cobrança | 330 | 330 | 330 |

### Gancho novo em 3 tons

Texto: "Bateria no fim, e o carregador não libera." A marcação entre colchetes vai antes da frase e não é falada. Prévias em `previa/tons/` (`node previa-tons.mjs`).

| Tom | Marcação | Take | generation_id | Duração | Fala | Arquivo |
|---|---|---|---|---|---|---|
| frustrado | `[frustrated]` | 1 | `3aSFY9GZLrFm4MZ44eZ0` | 3,36 s | 2,94 s | `audio/gancho-03b/frustrado-take1.mp3` |
| frustrado | `[frustrated]` | 2 | `8mQowVim7mfXel6U3hUr` | 2,96 s | 2,76 s | `audio/gancho-03b/frustrado-take2.mp3` |
| urgente | `[urgent]` | 1 | `mXbENeDuzd4BuxlFRbPB` | 2,80 s | 2,48 s | `audio/gancho-03b/urgente-take1.mp3` |
| urgente | `[urgent]` | 2 | `RM0WmGA3QSK7tYSVARek` | 2,72 s | 2,35 s | `audio/gancho-03b/urgente-take2.mp3` |
| conversa | `[conversational]` | 1 | `UKtYxdk2oKQ4cuWbenxI` | 2,96 s | 2,50 s | `audio/gancho-03b/conversa-take1.mp3` |
| conversa | `[conversational]` | 2 | `M8b2zLWhYfJnO8acaAgR` | 2,96 s | 2,58 s | `audio/gancho-03b/conversa-take2.mp3` |

### Narração da abertura (linha 1 nova + linha 2 original)

O Rafael escolheu o tom urgente no checkpoint 2. Texto enviado, com uma linha em branco entre as frases, como no 03:

> [urgent] Bateria no fim, e o carregador não libera.
>
> [conversational] Três motivos pro seu carro não carregar no posto, e o que fazer.

| # | Data | Chamada | O quê | Estimativa | Cobrado | Acumulado (voz) |
|---|---|---|---|---|---|---|
| 9 | 2026-11-17 | `creative_generate_speech` com `estimate_only` | abertura, 2 takes. Nó `TBwTIj8JjKoCS3kgyKMS` | 268 | 0 | 330 |
| 10 | 2026-11-17 | `creative_run_flow_nodes` no nó acima, 2 takes de 134 | abertura (Rafael aprovou ~270) | 268 | 268 | 598 |
| 11 | 2026-11-17 | `creative_add_flow_asset_node` (2 chamadas) | fixa a take A no nó `nwxzoPm4hSdHYouCpXMR`. Para a B, a ferramenta devolveu o próprio nó de geração, onde ela é a take ativa | sem custo | 0 | 598 |
| 12 | 2026-11-17 | `creative_transcribe_audio` com `estimate_only` (2 chamadas) | transcrição das takes A e B. Nós `qPOXc7jHP4A8eutkVfvu` e `35QkMWVGOuJwSwXvrYsO` | 0 | 0 | 598 |
| 13 | 2026-11-17 | `creative_run_flow_nodes` nos 2 nós de transcrição, `eleven_scribe_v1` | as duas devolveram as 21 palavras do texto, com as marcações à parte | 0 | 0 | 598 |

**Total do 03b: 598 de 1.000 créditos de voz.** Imagem e clipe por IA: 0 (só orçados).

| Take | generation_id | Duração | Fala da linha 1 | Arquivo | Transcrição |
|---|---|---|---|---|---|
| A | `XboLehwScifMvnXOgDw6` | 6,48 s | 2,44 s | `audio/abertura-take-a.mp3` | `audio/abertura-take-a.palavras.json` |
| B (usada no vídeo) | `PjVqb6rEWflndmyYt4Wg` | 6,40 s | 2,43 s | `audio/abertura-take-b.mp3` | `audio/abertura-take-b.palavras.json` |

Fiquei com a take B: a pausa antes de "Um:" sai com 0,600 s, igual à do 03, e o resto do vídeo anda só 0,1 s. Com a A, a pausa seria de 0,61 s e o deslocamento, de 0,2 s. Para trocar, sem gastar crédito: `node emendar-narracao.mjs a`, `node montar-legenda.mjs`, `node checar.mjs` e `node renderizar-video.mjs`.
