# Créditos ElevenLabs: vídeo 04b

Teto da narração: 2.000 créditos por vídeo. Os créditos do vídeo 04 (2.316, com o teste de cena) estão em `../../04-video-4-status/_fonte/creditos.md`. A foto do gancho e o resto da narração vêm do 04, sem custo novo.

## Narração (só a linha 2)

Flow do 04: `UDVvFKXx4mo9f23yVXGs` ("Vídeo 04 - narração"). Voz Matheus Alves (`wSbRKUhF0tUmkj9exCud`), modelo `eleven_v4`.

Texto enviado (99 caracteres por take). A linha 1 vai junto só para a linha 2 sair no mesmo embalo da voz e não entra no vídeo:

```
[firm] Esse ponto no mapa não te diz nada.
[conversational] Cada posto vai ter um de quatro status.
```

| # | Data | Chamada | O quê | Cobrado | Acumulado |
|---|---|---|---|---|---|
| 1 | 2026-11-17 | `creative_generate_speech` com `estimate_only` | orçamento de 2 takes: 198 créditos. Criou o nó `DLHlYpQg2Apb7fZA9opU` sem rodar | 0 | 0 |
| 2 | 2026-11-17 | `creative_run_flow_nodes` no mesmo nó, 2 takes | take A `SFRkU99A5sDvZG7LYyJB` (4,88 s), take B `nKHHW9KHJf4wxbJBD8K3` (4,96 s) | 198 | 198 |
| 3 | 2026-11-17 | `creative_add_flow_asset_node` + `creative_transcribe_audio` (`eleven_scribe_v1`), takes A e B | tempo por palavra. A take A ganhou o nó `r08fnIPbCyknNuMHh8Q2`; a B ficou ativa no nó original | 0 | 198 |

**Narração do 04b: 198 de 2.000.** O vídeo usa a take A: "de quatro status." dura 1,08 s, contra 1,01 s no 04; na B, 1,18 s. Para trocar, sem gastar: `node emendar-narracao.mjs b` (em `_fonte/`), depois `node _motor/legenda.mjs 04b` e `node _motor/renderizar.mjs 04b --sem-previa` (em `social/`). Com a B, o resto adianta 0,5 s em vez de 0,6 s.
