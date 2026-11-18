# Créditos ElevenLabs: vídeo 06

Teto aprovado pelo Rafael em 18/11/2026: **6.000 créditos no total** (imagem, clipes e voz). Dentro dele, a narração tem o teto de sempre, 2.000.

## Cena por IA

Flow: `aQkNkucVTB1PPlq1I3Ew` ("Vídeo 06 - cena IA").

| # | Data | Chamada | O quê | Estimativa | Cobrado | Acumulado |
|---|---|---|---|---|---|---|
| 1 | 2026-11-18 | `creative_generate_image` e `creative_run_flow_nodes`, só `estimate_only` | imagem-chave, gpt-image-2.5-sunburst, 2 variações, 9:16, 2K (nó `Mhwmityd1x8Jfh0ljxYm`) | 550 | 0 | 0 |
| 2 | 2026-11-18 | `creative_generate_video` e `creative_run_flow_nodes`, só `estimate_only` | 3 clipes no Veo 3.1 Lite, 4 s, 9:16, 1080p, sem áudio (nós `VyTPupbgSYzEwV9evfp7`, `uST6NwjXFwR18ah9OM1P` e `2wv2tj0IJo83euByR7Mr`, 1.212 cada); para comparar, Kling 2.5 Turbo, 5 s (nó `irmvi4qLDndXL3n9eRSf`, 2.121 cada) | 3.636 | 0 | 0 |
| 3 | 2026-11-18 | `creative_run_flow_nodes` no nó `Mhwmityd1x8Jfh0ljxYm`, 2 variações | imagem-chave: A `IijP1ugRO4Ew593XMoTs` e B `K2U76fwYhzuFilHkpZeJ` (1152×2048), em `_ref/ia/chave-a.png` e `chave-b.png` | 550 | 550 | 550 |
| 4 | 2026-11-18 | `creative_run_flow_nodes` no nó `VyTPupbgSYzEwV9evfp7`, `estimate_only` e depois a rodada | clipe 1, com a imagem A (nó `nax4cGzzLSSc1ynJSOeO`) no `start_frame` e a câmera em panorâmica lenta para a direita; geração `uO3BzPrG3e5y9ZfywBxA` | 1.212 | 1.212 | 1.762 |
| 5 | 2026-11-18 | `creative_run_flow_nodes` no nó `uST6NwjXFwR18ah9OM1P`, `estimate_only` e depois a rodada | clipe 2, versão da mão (ok do Rafael), com o último quadro do clipe 1 limpo no `start_frame` (asset `I8qrqGmOmEUyo0oeyJqB`, nó `7iJI2QOR9OW1fQiwVW2f`); geração `aqMySFlky3DYosR4aiaV` | 1.212 | 1.212 | 2.974 |
| 6 | 2026-11-18 | `creative_run_flow_nodes` no nó `2wv2tj0IJo83euByR7Mr`, `estimate_only` e depois a rodada | clipe 3, com o carro saindo pela esquerda (ok do Rafael), com o mesmo último quadro do clipe 1 no `start_frame` (nó `7iJI2QOR9OW1fQiwVW2f`); geração `PAnDJBENQ3XK208l2mz0` | 1.212 | 1.212 | 4.186 |

## Narração

Flow: `hvSLjixhSbuS2ngREFs1` ("Vídeo 06 - narração"). Voz Matheus Alves (`wSbRKUhF0tUmkj9exCud`), modelo `eleven_v4`.

| # | Data | Chamada | O quê | Cobrado | Acumulado |
|---|---|---|---|---|---|
| 1 | 2026-11-18 | `creative_generate_speech`, 3 × 2 takes | gancho em [firm] (66/take, 3,36 s), [weary] (67, 4,32 e 4,24 s) e [conversational] (76, 3,52 e 3,76 s), em `audio/gancho/` | 418 | 418 |
| 2 | 2026-11-18 | `creative_generate_speech` com `estimate_only` (1.204) e depois `creative_run_flow_nodes` no nó `dEsOt8UmqSfRg6HUJFtN` | narração inteira, 602 caracteres, [firm] no ato 1 e [conversational] da virada em diante; take A `zWg3XhcDFYsESI2o4gjg`, take B `8LoHVYAOXePtORiB4O05` (ok do Rafael) | 1.204 | 1.622 |
| 3 | 2026-11-18 | `creative_transcribe_audio` sobre um WAV enviado (nó `SD1w5xfLes8GrQvjYObU`) | conferir o "Você" do começo nas 4 takes com "[firm] Você chega"; as 4 saíram "V chega". **A estimativa disse 2,8 créditos e a cobrança foi de 51**: transcrever áudio enviado tem um mínimo, e só a transcrição de geração da própria ElevenLabs sai por 0 | 51 | 1.673 |

**Total até aqui: 5.859 de 6.000** (cena 4.186, voz 1.673). Da voz, 1.673 cabem no teto de 2.000 da narração. Sobram 141.

O "Você" engolido foi consertado sem voz nova: `_fonte/emendar-voce.py` monta a take C com o "Você" da linha 2 no lugar do "V" da linha 1.
