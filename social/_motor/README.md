# Motor dos vídeos do Mapere

Pipeline compartilhado dos vídeos verticais (TikTok e Reels). A cena é HTML e SVG animados com GSAP numa linha do tempo determinística. O Playwright, usando o Edge do sistema, captura quadro a quadro, e o ffmpeg monta o MP4 com a narração da ElevenLabs. Ele veio do vídeo 03 e fez o vídeo 04 inteiro. Quem conduz é a skill `/novo-video` (`.claude/skills/novo-video/SKILL.md`).

## Um vídeo = uma pasta

```
social/NN-slug/
  plano.md            decisões e roteiro legível
  legendas.md         texto do post (Instagram e TikTok)
  _fonte/
    roteiro.json      fonte única: fala, tela, pausas, capítulos, marcas, prévia, capa
    cena.html         só o desenho próprio do vídeo; o resto vem do kit
    fundo.png         (opcional) imagem 9:16 gerada por IA para o gancho
    creditos.md       cada chamada à ElevenLabs e o custo
    audio/            takes, transcrições, narracao.wav, alinhamento.json
    dados.js, legenda.js, legenda.json   gerados; não editar
  video/              MP4 final, capa.png e capa-3x4.png
```

`social/_motor/modelo/` tem o ponto de partida: o `roteiro.json` e a `cena-exemplo-04.html` (cópias do vídeo 04).

## roteiro.json

- `linhas[].fala`: o texto que vai para a voz.
  - `[firm]` e outras marcações de tom do `eleven_v4` não são faladas.
  - `{0.6}` depois de uma frase pede 0,6 s de silêncio antes da próxima. Sem ele, fica a pausa da própria take.
  - `{+0.5}` depois de uma palavra, no meio da frase, põe 0,5 s a mais ali, para dar ênfase.
- `linhas[].tela`: a legenda, em blocos de até ~20 letras separados por `|`. `{4|quatro}` mostra "4" e casa com "quatro" na voz. Sem `tela`, a legenda é dividida sozinha.
- `capitulos`: `[{ nome, linha }]`. A barra de capítulos acende no início da linha.
- `marcas`: `"nome": "linha:palavra[#n][:fim]"`. A cena usa as marcas como `k.m.nome`. Também existem as automáticas `L1..Ln`, `L1fim..`, `cap1..`, `siga`, `fimFala` e `fim`.
- `previa`: `[{ nome, t: "marca+0.3" }]`, os quadros da prévia. `capa`: `{ t, desce, titulo }`.

## Comandos (rodar em `social/`)

| Passo | Comando | O que faz |
|---|---|---|
| texto da voz | `node _motor/voz.mjs 04` | confere tela × fala, mostra o texto exato para a ElevenLabs e o custo |
| dados | `node _motor/dados.mjs 04` | mapa, logo e ícones da landing → `dados.js` |
| legenda estimada | `node _motor/legenda.mjs 04 --plano` | tempos estimados, para montar a cena antes da voz |
| narração | `node _motor/narracao.mjs 04 a` | take + transcrição → `narracao.wav` com as pausas do roteiro |
| legenda real | `node _motor/legenda.mjs 04` | tempos reais por palavra |
| prévia | `node _motor/quadros.mjs 04` | um PNG por item da prévia e a folha com a zona segura (falha se algum texto sair da zona) |
| folha | `node _motor/quadros.mjs 04 --folha 1.5` | um quadro a cada 1,5 s, para conferir o movimento |
| quadros soltos | `node _motor/quadros.mjs 04 nada+0.2 12.5 --zona` | |
| vídeo | `node _motor/renderizar.mjs 04 --sem-previa` | MP4 com CRF 19, -14 LUFS, BT.709 |
| capa | `node _motor/capa.mjs 04` | `capa.png` e o recorte 3:4, com a checagem do título |

## A cena (kit)

`cena.html` carrega `kit.css`, o GSAP, `dados.js`, `legenda.js` e `kit.js`, e chama `Kit.iniciar({ fundo?, nomesDosCapitulos?, montar(k), desenhar?(t, k) })`.

O `k` traz:
- `tl` (a linha do tempo) e `m` (as marcas);
- os helpers `svg`, `html`, `icone`, `chip(pai, st, texto, nota, grande)` e `etiqueta(texto, [x,y], de, ate).mostra(t).some(t)`, além de `entra`, `sai` e `caminho`;
- `capitulos.sai(t)`;
- o mapa: `mapa.enquadrar`, `posto`, `abre`, `troca`, `mostrar` e `avancar`;
- o fecho: `fecho.acende(posto, t)` e `fecho.logo(t)`.

Sozinho, o kit cuida do título, da barra de capítulos, da legenda palavra por palavra (a última linha vira a chamada sob o logo), do ponto aceso que voa até o logo e do contrato com o motor (`data-pronto`, `__ir` e `__marcas`).

Regras que o kit já segue: status sempre com ícone e texto, texto essencial dentro da zona segura (`ZONA` em `palco.mjs`) e nada de chama, fumaça ou fogo.

## Armadilhas conhecidas

- No GSAP, `x` num `<g>` de SVG sobrescreve o `transform` do atributo. Para posicionar, use um `<g transform>` externo e anime o grupo de dentro.
- Na ElevenLabs, escrever "vertical 9:16" no prompt de imagem não muda o formato. É preciso pôr `aspect_ratio: 9:16` no nó (`creative_update_node`) antes de rodar.
- A ElevenLabs entrega a fala corrida. As pausas sempre entram depois, no `narracao.mjs`, sem gastar crédito.
- O VS Code não toca AAC. Para ouvir no editor, gere uma cópia com áudio MP3. No celular, o MP4 final toca normal.
