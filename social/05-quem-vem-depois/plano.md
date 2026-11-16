# Vídeo 05: "Quem chega depois agradece"

Segundo vídeo feito no motor `social/_motor/` com a skill `/novo-video`. O formato é o dos vídeos 03 e 04: título fixo, barra de capítulos, etiquetas em mono e legenda palavra por palavra. A novidade é o gancho com um **clipe de vídeo** gerado por IA, e não mais uma foto parada. Para isso o motor ganhou o fundo em vídeo (`fundoVideo`, ver o README).

## Por que este tema

Os vídeos 02 e 03 são do pilar "A dor" e o 04 é de "Como funciona". Este é do pilar **Comunidade**: cada confirmação ajuda quem vem depois. A frase de fecho vem da landing (`src/data/copy.ts`, `momento.frase`): "Cada confirmação acende o mapa para quem vem depois."

## Decisões (Rafael, 2026-11-16)

| Tema | Decisão |
|---|---|
| Título | "Quem chega depois agradece" |
| Gancho | Voz em tom curioso (`[curious]`, escolhido entre firme, direto e curioso): "Alguém já passou por esse posto hoje. Só não te contou." |
| Clipe do gancho | Veo 3.1 Lite na ElevenLabs, 9:16, 1080p, 6 s, sem áudio, 1.818 créditos. À noite, um carro elétrico sai do posto e o carregador fica sozinho. O Rafael pediu um vídeo de IA que "agregue e faça sentido com o vídeo" e aprovou o Veo (orçado em ~2.424). |
| Tratamento do clipe | A placa do carro, com letras sem sentido, foi desfocada com uma caixa de borda suave que acompanha o carro. A tela do carregador, também com rabiscos, fica coberta na cena por um "?" e pelo pino cinza "Sem informação". |
| Capítulos | Check-in, O ponto acende, Quem vem depois |
| Cena | Linha 2: o clipe desfoca e some, e entra o posto desenhado (o carro chega, pluga, a tela fica verde). Cap. 1: o celular com "Fazer check-in" e os 4 status, e o dedo escolhe Livre. Cap. 2: o mapa, e o posto vira "Livre · agora" com um pulso verde; outro posto vira "Com defeito · agora". Cap. 3: um carro sai de casa e vai direto ao ponto aceso; na linha 7, a rota de "você, amanhã" vai até um posto "Livre · há 4 min". Fecho: mais pontos acendem e o ponto aceso vira o ponto do logo. |
| Duração | 38,7 s |
| Dado da pesquisa | Não entra. |
| Música | Não vai no arquivo. |

## Roteiro

O texto oficial está em `_fonte/roteiro.json`.

| Linha | Narração |
|---|---|
| 1 | Alguém já passou por esse posto hoje. Só não te contou. |
| 2 | Agora imagina o contrário: você chegou, plugou e a recarga começou. |
| 3 | No Mapere, vai ser assim: você toca em check-in e escolhe o status. Livre. |
| 4 | Poucos toques, e o ponto acende no mapa. Com a hora: confirmado agora. |
| 5 | Deu defeito? Você avisa também. Aí ninguém perde a viagem. |
| 6 | Do outro lado da cidade, alguém saindo de casa vê esse ponto aceso e vai direto. Sem rodar atrás de posto. |
| 7 | Amanhã, quem tá saindo é você. E alguém já confirmou antes. |
| 8 | Cada confirmação acende o mapa pra quem vem depois. |
| 9 | Siga pra acompanhar a construção. |

## Arquivos

- `video/mapere-quem-vem-depois.mp4`: o master (16 MB, o render do motor).
- `video/mapere-quem-vem-depois-leve.mp4`: cópia em CRF 26 (6,8 MB, SSIM 0,995 em relação ao master), a que vai para o Drive e para o post.
- `_fonte/fundo.mp4`: o clipe já com a placa desfocada. O original está em `_ref/ia/gancho-veo.mp4`.

## Refazer

```
node _motor/narracao.mjs 05 a     # ou b
node _motor/legenda.mjs 05
node _motor/quadros.mjs 05        # prévia e zona segura
node _motor/renderizar.mjs 05 --sem-previa
node _motor/capa.mjs 05
```

Cópia leve para o Drive (em `05-quem-vem-depois/video/`):

```
ffmpeg -i mapere-quem-vem-depois.mp4 -c:v libx264 -preset veryslow -tune animation -crf 26 -pix_fmt yuv420p -c:a copy -movflags +faststart mapere-quem-vem-depois-leve.mp4
```

Desfoque da placa (a partir do clipe original, em `05-quem-vem-depois/`):

```
X="min(max(1040-93*(t-2),700),1080)-65"; Y="(1250-11*(t-2))-38"
ffmpeg -i _ref/ia/gancho-veo.mp4 -filter_complex "[0:v]split[a][b];[b]crop=130:60:'min($X,950)':'$Y',boxblur=10:3,format=yuva444p,geq=lum='p(X,Y)':cb='p(X,Y)':cr='p(X,Y)':a='255*min(1,min(min(X,W-1-X),min(Y,H-1-Y))/14)'[p];[a][p]overlay=x='min($X,950)':y='$Y':eval=frame,format=yuv420p" -c:v libx264 -crf 16 -an _fonte/fundo.mp4
```

Créditos: `_fonte/creditos.md`. Total do vídeo: 3.432 (1.818 do clipe e 1.614 da narração).
