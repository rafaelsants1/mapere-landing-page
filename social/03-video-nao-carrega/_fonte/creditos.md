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
