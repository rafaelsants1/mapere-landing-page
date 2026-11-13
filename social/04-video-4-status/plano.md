# Vídeo 04: "Vale ir nesse posto? 4 respostas"

Primeiro vídeo feito no motor compartilhado (`social/_motor/`), pelo pipeline da skill `/novo-video`. O formato é o do vídeo 03: título fixo, barra de capítulos, etiquetas em mono e legenda palavra por palavra. A novidade é o gancho com foto gerada por IA.

## Por que este tema

Os vídeos 02 e 03 eram do pilar "A dor". A semana-modelo do plano de redes pede variar, e este é do pilar "Como funciona": os 4 status da landing (`src/data/copy.ts`, seção `status`). Ele mostra o produto sem cara de anúncio, e o último status ("o mapa não adivinha") passa confiança.

## Decisões (Rafael, 2026-11-12)

| Tema | Decisão |
|---|---|
| Título | "Vale ir nesse posto? 4 respostas" |
| Gancho | Voz firme (`[firm]`, escolhida entre 3 tons): "Esse ponto no mapa não te diz nada." Na tela, um alfinete cinza cai sobre o posto da foto. |
| Fundo do gancho | Foto gerada na ElevenLabs (gpt-image-2.5-sunburst, 9:16, 2K): vista do banco do motorista, à noite, com o posto apagado. A variação A foi a aprovada. |
| Ênfase | Pausa de 0,5 s entre "um" e "de quatro status", pedida pelo Rafael (`{+0.5}` no roteiro). |
| Capítulos | Livre, Ocupado, Com defeito e Sem informação. Cada um com o chip grande, a idade da informação e o posto desenhado. Os textos vêm da landing. |
| Fecho | O mapa com os 4 status; o posto "Sem informação" vira "Livre · agora", acende e vira o ponto do logo. |
| Duração | 36,2 s |

## Roteiro

O texto oficial está em `_fonte/roteiro.json`.

| Linha | Narração |
|---|---|
| 1 | Esse ponto no mapa não te diz nada. |
| 2 | No Mapere, cada posto vai ter um … de quatro status. |
| 3 | Livre: tem carregador funcionando e sem fila. E sempre com a hora: confirmado há quatro minutos. |
| 4 | Ocupado: todos em uso ou com fila. Aí você decide: espera ou vai pra outro. |
| 5 | Com defeito: quebrado, fora do ar ou não iniciou a recarga. Esse você nem tenta. |
| 6 | Sem informação: ninguém confirmou há pouco tempo. E o mapa não adivinha. |
| 7 | Quem tá no posto confirma em poucos toques, e o mapa acende pra quem vem depois. |
| 8 | Siga pra acompanhar a construção. |

## Refazer

```
node _motor/narracao.mjs 04 a     # ou b
node _motor/legenda.mjs 04
node _motor/quadros.mjs 04        # prévia e zona segura
node _motor/renderizar.mjs 04 --sem-previa
node _motor/capa.mjs 04
```

Créditos: `_fonte/creditos.md`.
