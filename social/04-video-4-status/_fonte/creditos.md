# Créditos ElevenLabs: vídeo 04

Teto da narração: 2.000 créditos. O teste de cena por IA tem conta separada, aprovada pelo Rafael chamada a chamada.
Flow do teste de cena: `TVqCsTW1mA6xlccXz319` ("Vídeo 04 - teste de cena").

## Teste de cena por IA (fundo do gancho)

| # | Data | Chamada | O quê | Estimativa | Cobrado | Acumulado |
|---|---|---|---|---|---|---|
| 1 | 2026-11-12 | `creative_generate_video` com `estimate_only` (5 modelos) | orçamento de clipe de 5 s: Seedance 2.5 ~14.000, Seedance 2 mini ~4.580, Veo 3.1 Lite ~2.420, Kling 2.5 Turbo ~2.120, LTX v2 Fast ~1.450 | — | 0 | 0 |
| 2 | 2026-11-12 | `creative_generate_image` gpt-image-2.5-sunburst, 2 variações | teste 1: saiu 16:9 1280×720 (padrão do nó) e com o Pão de Açúcar | 380 | 380 | 380 |
| 3 | 2026-11-12 | `creative_run_flow_nodes`, nó em 9:16, 2K, 2 variações | teste 2: vertical, cidade genérica | 550 | 550 | 930 |

## Narração

Flow: `UDVvFKXx4mo9f23yVXGs` ("Vídeo 04 - narração"). Voz Matheus Alves (`wSbRKUhF0tUmkj9exCud`), modelo `eleven_v4`.

| # | Data | Chamada | O quê | Cobrado | Acumulado |
|---|---|---|---|---|---|
| 1 | 2026-11-12 | `creative_generate_speech`, 3 × 2 takes | gancho em [firm] (42/take), [skeptical] (47), [matter-of-fact] (52) | 282 | 282 |
| 2 | 2026-11-12 | `creative_generate_speech`, 2 takes | narração completa, 552 caracteres | 1.104 | 1.386 |
| 3 | 2026-11-12 | `creative_add_flow_asset_node` + `creative_transcribe_audio` (`eleven_scribe_v1`), takes A e B | tempo por palavra | 0 | 1.386 |

**Narração: 1.386 de 2.000.** O Rafael escolheu o tom firme no checkpoint 2. O vídeo usa a take A (`1lL71F8ZBRLL4JX8ncur`, 31,20 s); a B é `R7EML9avnQup4jsHm986` (31,28 s). Para trocar, sem gastar: `node _motor/narracao.mjs 04 b`, `node _motor/legenda.mjs 04`, `node _motor/renderizar.mjs 04 --sem-previa`.

**Total do vídeo 04: 2.316 créditos** (930 do teste de cena + 1.386 da narração).

Aprendizado: o texto "vertical 9:16" no prompt não muda o formato. É preciso pôr `aspect_ratio: 9:16` no nó (creative_update_node) antes de rodar.
