# Créditos das imagens e dados

## Higgsfield

Conta no plano grátis. Saldo inicial de 10 créditos, 7 gastos, 3 restantes.

| Arquivo em `src/assets/higgsfield/` | Modelo | Créditos | Uso |
|---|---|---|---|
| `maquete-aracaju-16x9-v1.png` | Seedream 5.0 Flash (`seedream_5_0_flash`, 2k) | 0,5 | Imagem aprovada; início do vídeo e base do Open Graph |
| `maquete-aracaju-9x16-v1.png` | Seedream 5.0 Flash (`seedream_5_0_flash`, 2k) | 0,5 | Alternativa, não usada na página |
| `maquete-aracaju-mergulho-6s.mp4` | MiniMax Hailuo 2.3 (`minimax_hailuo`, 6 s, 768p) | 6 | Vídeo da abertura, extraído em `public/frames/` |

GPT Image 2.6, Seedance 2.0 Mini, Grok Video 1.5 Lite e Kling 3.0 Turbo exigem plano pago e recusaram o pedido sem cobrar. O Veo 3.1 Lite falhou e devolveu os créditos.

### Prompt A (imagem)

> Night-time handcrafted miniature diorama of Aracaju, a coastal Brazilian city, made of white Irish lace and warm linen paper. Planned grid of city blocks seen from a high three-quarter angle, a wide river curving through the grid and meeting the sea, a seaside avenue with a row of arches along the beach. Thin glowing ember-orange thread (#F0641E) runs along the streets like a lace cord, ending at one small charging station that glows. One tiny electric car on the avenue. Deep warm near-black background (#17110E), soft tilt-shift, macro photography, delicate shadows, calm and elegant. No text, no logos, no people, no flags, no folk costumes.

### Prompt B (vídeo, a partir da imagem 16:9)

> Slow, steady cinematic camera push-in from the high overview down toward street level, following the glowing ember thread through the lace streets until it reaches the charging station, which lights up brighter. Continuous single shot, no cuts, no shake, no new objects appearing, gentle parallax, 6 seconds.

## Mapa

Dados © OpenStreetMap contributors, licença ODbL (https://www.openstreetmap.org/copyright). Ruas, rios, costa, prédios e o limite do município de Aracaju vêm do Overpass e são processados por `scripts/build-map.mjs`. Os pins dos mapas são ilustrativos.

## Fontes

Bricolage Grotesque, Atkinson Hyperlegible Next e Atkinson Hyperlegible Mono, licença SIL OFL 1.1 (arquivos em `public/fonts/`).

## Logo

Pacote Mapere M3. O fundo dos SVGs de combinação sai para o logo pousar em qualquer seção; as formas não mudam.
