---
name: novo-video
description: Produz o próximo vídeo vertical do Mapere (TikTok/Reels) de ponta a ponta com o motor em social/_motor — tema, roteiro, fundo por IA opcional, narração ElevenLabs, cena, render, capa, legendas do post, Drive e branch social — com 3 checkpoints do Rafael. Use quando o Rafael pedir "próximo vídeo", "novo vídeo", "/novo-video" ou um vídeo para as redes do Mapere.
---

# /novo-video

Produz o próximo vídeo da série do Mapere com o motor em `social/_motor/`. Leia `social/_motor/README.md` antes de começar: lá estão o formato do `roteiro.json`, os comandos e a API do kit. O vídeo 04 (`social/04-video-4-status/`) é o exemplo completo.

Fale com o Rafael em português do Brasil, com frases curtas. Siga as regras da marca: `PRODUCT.md`, `DESIGN.md` e as memórias de pronúncia ("Mapere" sem acento), de zona segura e de limite do Drive.

## Regras fixas

- O app ainda não existe: o que se diz do app fica no futuro ("vai ter", "vai mostrar"). A única chamada é seguir o perfil.
- Linguagem de conversa entre motoristas: "tá", "pra", sem termo técnico. A pessoa tem que entender em 2 s. O gancho prende pela primeira frase, pela imagem e pelo tom.
- Nenhum número da pesquisa no vídeo. Textos de produto saem de `src/data/copy.ts`.
- Status sempre com ícone e texto. Nada de chama, fumaça ou fogo. Sem lugar real reconhecível.
- Voz: Matheus Alves (`wSbRKUhF0tUmkj9exCud`), `eleven_v4`, pelo conector claude.ai ElevenLabs, sem chave de API. Teto da narração: 2.000 créditos por vídeo. Imagem ou vídeo por IA tem conta separada e só roda com o ok do Rafael para o valor orçado (`estimate_only` antes).
- Registre cada chamada à ElevenLabs em `_fonte/creditos.md`.
- Nunca chame uma geração de novo para "tentar outra vez": cada chamada cobra.

## Passos

1. **Tema.** Leia a semana-modelo e os pilares em `C:\Users\Rafael\Documents\Obsidian Vault\Projetos\Mapere\06-plano-redes-sociais.md` e veja quais pilares os vídeos anteriores (`social/NN-*/plano.md`) já cobriram. Proponha 3 temas, cada um com gancho e título, com AskUserQuestion. Se o Rafael pedir base em dados, leia a planilha "Respostas-formulario-mapere" no Drive.
2. **Roteiro: checkpoint 1.** Escreva as falas (35 a 45 s, ~90 a 110 palavras), o título fixo e os capítulos. Mostre o roteiro inteiro numa pergunta e só siga com o ok dele.
3. **Pasta.** Crie `social/NN-slug/` com `_fonte/`, `video/` e `_ref/`. Copie `_motor/modelo/roteiro.json` e adapte; rode `node _motor/voz.mjs NN` até tela e fala baterem, depois `node _motor/dados.mjs NN`.
4. **Fundo por IA (opcional, só se o gancho pedir uma cena real).**
   - Orce primeiro. Imagem 9:16 2K com 2 variações custa ~550 créditos. Vídeo custa de 1.450 a 14.000 por clipe e só entra com pedido explícito.
   - Gere com `creative_generate_image`. Antes de rodar, ponha `aspect_ratio: 9:16` e `resolution: 2K` no nó com `creative_update_node`.
   - No prompt: noite, paleta quente escura, sem texto, sem logo, sem marco reconhecível e sem fogo, com espaço vazio no terço de cima para o título.
   - Monte um teste de 3 s com o título e a legenda por cima (veja `04-video-4-status/_ref/ia/teste-gancho.html` e `teste-render.mjs`), mande com SendUserFile e espere a escolha. A escolhida vira `_fonte/fundo.png`.
5. **Tom do gancho: checkpoint 2.**
   - Crie um flow com `creative_create_flow` ("Vídeo NN - narração").
   - Gere a 1ª frase em 3 tons (por exemplo `[firm]`, `[skeptical]`, `[matter-of-fact]`), 2 takes cada.
   - Monte um MP4 por tom (take 1 seguida da take 2) com áudio **MP3**, mande os três e pergunte qual fica.
6. **Narração.**
   - Ponha o tom escolhido no roteiro e rode `node _motor/voz.mjs NN` para pegar o texto exato.
   - Gere 2 takes com `creative_generate_speech`, baixe as duas e fixe cada uma no flow com `creative_add_flow_asset_node`.
   - Transcreva com `creative_transcribe_audio` (sai por 0 crédito) e baixe o `words.json` como `audio/narracao-take-X.palavras.json`.
   - Rode `node _motor/narracao.mjs NN a` e `node _motor/legenda.mjs NN`.
7. **Cena.**
   - Escreva `_fonte/cena.html` a partir de `_motor/modelo/cena-exemplo-04.html`, com algo mudando na tela a cada 2 ou 3 s e amarrado às marcas da fala.
   - Rode `node _motor/quadros.mjs NN` até não sobrar texto fora da zona segura, e olhe a folha.
   - Rode `node _motor/quadros.mjs NN --folha 1.5` e confira o movimento inteiro antes de renderizar.
8. **Render: checkpoint 3.** Rode `node _motor/renderizar.mjs NN --sem-previa` e mande o MP4 com SendUserFile. Ajustes de pausa ou de legenda não gastam crédito: edite o `roteiro.json` e rode de novo narração, legenda e render.
9. **Fechamento** (depois do ok do checkpoint 3):
   - `node _motor/capa.mjs NN`, que confere se o título cabe no recorte 3:4.
   - `plano.md` e `legendas.md` no padrão dos vídeos anteriores, com o mesmo bloco de hashtags.
   - **Drive:** pasta `Mapere/Posts/NN-slug`, com plano, legendas, `video/` e a `_fonte` em zips de até ~7 MB cada (ver a memória do limite do Drive). Sem `_ref/`.
   - **GitHub:** commit na branch `social` (worktree temporária a partir de `origin/social`), com a pasta do vídeo sem `_ref/` e sem `node_modules`, mais o `_motor/` se ele mudou. Sem PR.
   - Memória do projeto: um arquivo `mapere-video-NN.md` com as decisões e o que falta.

## O que melhorar no motor

Se aparecer um padrão novo, como um tipo de pausa, uma peça repetida em duas cenas ou uma checagem nova, leve-o para `_motor/` e documente no README, para o vídeo seguinte já sair com ele.
