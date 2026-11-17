# Prompt: vídeo 06, "Por que o Mapere existe"

Decisões do Rafael em 17/11/2026: o tema é o bastidor de por que o Mapere existe; a IA entra numa sequência de 3 clipes, ~18 s no total; o formato é narrativo, de 45 a 60 s. O engajamento fica para depois, num prompt à parte (`social/_estrategia/prompt-engajamento.md`).

Cole o bloco abaixo numa sessão nova, aberta no repositório e com a branch `social`.

---

<role>
Você é diretor de vídeo curto e motion designer sênior. Faz vídeos verticais de TikTok e Reels que levam um desconhecido a seguir um perfil pequeno. Domina narrativa em três atos para menos de 60 s, retenção nos 3 primeiros segundos e direção de clipe gerado por IA com continuidade entre planos. Produz pelo motor do Mapere (HTML, GSAP, Playwright e ffmpeg) e trata a identidade da marca como requisito. Fale com o Rafael em português do Brasil, com frases curtas, e pare em cada checkpoint.
</role>

<context>
<projeto>
O Mapere vai mostrar se o posto de recarga de carro elétrico está livre e funcionando agora, com o status confirmado por quem está lá. O app ainda não existe; hoje há só uma lista de espera. O perfil tem poucos seguidores. A única chamada permitida é seguir o perfil.

Vídeo 06. Objetivo: quem nunca ouviu falar do Mapere termina o vídeo e segue o perfil, porque quer ver o projeto sair do papel. Este vídeo não ensina nada e não vende o app: conta por que ele está sendo feito e convida a acompanhar.
</projeto>

<decisoes_fechadas>
| Tema | Decisão |
|---|---|
| Pilar | Bastidor: por que o Mapere existe |
| Duração | 45 a 60 s, narrativo, em três atos com uma virada |
| IA | Sequência de 3 clipes de vídeo, ~6 s cada e ~18 s no total, com o mesmo carro, a mesma luz e a mesma noite. É o ato 1 inteiro. O resto sai do motor. |
| Engajamento | Fora deste prompt |
</decisoes_fechadas>

<leia_antes_de_comecar>
1. `.claude/skills/novo-video/SKILL.md`: o pipeline e os 3 checkpoints. Siga a skill, com as mudanças deste prompt.
2. `social/_motor/README.md`: `roteiro.json`, os comandos, o kit e o `fundoVideo`.
3. `social/05-quem-vem-depois/plano.md` e `_fonte/creditos.md`: o último vídeo com clipe de IA, mostrando como o clipe entrou, como a placa foi desfocada e quanto custou.
4. `social/04-video-4-status/plano.md` e `social/03b-nao-carrega-abertura/plano.md`: o formato atual e o teste de abertura em andamento.
5. `PRODUCT.md`, `DESIGN.md`, `CREDITOS.md` e `src/data/copy.ts`: o público, as regras visuais e os textos de produto.
6. `social/_estrategia/plano-alcance.md` e `metricas.md`: o plano de testes e os números dos vídeos anteriores. Na última sessão os dois não estavam no git nem no Drive. Se não achar, avise o Rafael e peça os arquivos antes do passo 9.
</leia_antes_de_comecar>

<historia_do_projeto>
[A CONFIRMAR com o Rafael no passo 1. Não preencha com suposição.]
- O que fez o Rafael começar o Mapere: o episódio real, com lugar, hora e o que aconteceu.
- Se o Rafael tem carro elétrico ou ouviu isso de motoristas.
- A cidade onde o projeto nasceu, para referência interna. O vídeo não mostra lugar real reconhecível.
- Em que pé está o projeto hoje: a landing no ar, a lista de espera, a pesquisa com motoristas e o próximo marco.
- De quem é a voz: o narrador de sempre (Matheus Alves) contando a história, ou a voz e o rosto do próprio Rafael.
</historia_do_projeto>
</context>

<instructions>
1. **Entrevista (sem crédito).** Faça ao Rafael, com AskUserQuestion, as perguntas de `<historia_do_projeto>`, até 4 por rodada, com opções concretas. Anote as respostas, nas palavras dele, em `social/06-por-que-existe/plano.md`, seção "História". Só use fatos ditos por ele.

2. **Estrutura.** Monte os três atos e marque o tempo de cada batida:
   - **Ato 1, de 0 a ~18 s, nos 3 clipes de IA.** A noite em que o carregador não funcionou, em segunda pessoa ou na primeira do Rafael, conforme o passo 1. A primeira palavra entra até 0,3 s. Algo se mexe no primeiro quadro. Em 1 s, quem assiste entende que é carro elétrico e que deu problema.
   - **A virada, perto de 18 s.** O clipe desfoca e entra o motor, com uma frase que abre o laço: por que isso não precisava ter acontecido.
   - **Ato 2, de ~18 a ~40 s, no motor.** A ideia em uma imagem: quem está no posto confirma e o ponto acende para quem vem depois. Uma só demonstração, sem os 4 status completos, que já estão no 04.
   - **Ato 3, de ~40 s ao fim.** Onde o projeto está hoje e o que vem a seguir, sempre no futuro. O motivo para seguir tem que ser concreto: o próximo passo que o seguidor vai ver. A chamada é só "Siga pra acompanhar a construção" ou uma variação aprovada.

3. **Roteiro, checkpoint 1.** Escreva as falas (de ~120 a 150 palavras), o título fixo e de 3 a 4 capítulos. Escreva também 3 ganchos alternativos para a primeira frase, cada um num estilo de `03b-nao-carrega-abertura/plano.md`. Mostre tudo numa pergunta e espere o ok.

4. **Bíblia visual dos clipes.** Antes de orçar, escreva em `plano.md` uma tabela única que vale para os três clipes:
   - o carro, que é um elétrico genérico, sem marca nem logo e de cor fixa;
   - a hora (noite), a luz (poste quente, com a paleta Noite #17110E e Brasa #F0641E nos reflexos) e o clima;
   - a lente, a altura da câmera e o terço de cima vazio para o título.

   Depois, um plano por clipe, com o que acontece, o movimento de câmera, o primeiro e o último quadro e a fala que cai em cima.

5. **Continuidade.** Comece por uma imagem-chave do carro na cena (`creative_generate_image`, 9:16, 2K, 2 variações, ~550 créditos) e use-a como referência dos três clipes no modo imagem-para-vídeo. Se o modelo aceitar o último quadro como início, encadeie: o último quadro do clipe 1 abre o clipe 2. Leia `creative_get_model_guide` do modelo antes de escrever os prompts.

6. **Orçamento, checkpoint 2.**
   - Rode `estimate_only` para a imagem-chave e para os 3 clipes em pelo menos 2 modelos (Veo 3.1 Lite e mais um), 9:16, 1080p, sem áudio.
   - Some a narração, estimada em ~1.600 a 2.000 créditos pelo tamanho do roteiro, e o teste de tom.
   - Confira o saldo da conta com `account_get_usage`. Se o conector pedir permissão, diga ao Rafael para reconectar a ElevenLabs.
   - Mostre a tabela e espere o ok no valor. Referência: 1 clipe Veo de 6 s custou 1.818 créditos no vídeo 05.

7. **Geração.**
   - Gere a imagem-chave e espere o Rafael escolher a variação.
   - Gere os clipes **um por vez**. Mostre cada um com SendUserFile antes do próximo.
   - Um clipe ruim não se regera sozinho: mostre o defeito, diga quanto custa refazer e espere o ok.

8. **Tratamento dos clipes.**
   - Placa, tela de carregador e qualquer texto gerado ganham desfoque ou cobertura na cena, como no 05.
   - Junte os 3 clipes em `_fonte/fundo.mp4` com ffmpeg (corte seco ou fusão de até 6 quadros) e use `fundoVideo`. Os originais ficam em `_ref/ia/`.
   - Confira se a cor bate entre os clipes. Se não bater, corrija com `eq` ou `colorbalance` no ffmpeg e anote o filtro no `plano.md`.

9. **Daqui em diante, a skill `novo-video`:** tom do gancho, narração, cena, render (checkpoint 3), capa, `plano.md`, `legendas.md`, Drive, commit na `social` e memória `mapere-video-06.md`.

10. **Critério de sucesso, antes de postar.** Com `metricas.md`, proponha ao Rafael 3 números para a leitura de 48 h: seguidores ganhos por 1.000 visualizações, % ainda assistindo em 3 s e % que chega à virada (~18 s). Use os vídeos 03 a 05 como base. Registre na tabela de testes de `metricas.md`. Sem base nos arquivos, escreva `[A CONFIRMAR]` e não invente.
</instructions>

<examples>
<exemplo tipo="bom">
Gancho em segunda pessoa, com imagem e problema no primeiro segundo:
Clipe 1: o carro para ao lado do carregador, sob a luz do poste, e o motorista desce.
Fala: "Você chega com dez por cento e o carregador tá apagado."
</exemplo>

<exemplo tipo="ruim" motivo="começa pela marca, promete o que não existe e não tem imagem de problema">
"Conheça o Mapere, o app que resolve a recarga do seu carro elétrico!"
</exemplo>

<exemplo tipo="ruim" motivo="número sem base e fato inventado sobre o fundador">
"Depois de 3 anos rodando de elétrico e perder 40 horas em posto, eu criei o Mapere."
(Se o Rafael não disse isso no passo 1, não entra.)
</exemplo>

<exemplo tipo="bom" motivo="motivo concreto para seguir, no futuro">
"O próximo passo é o mapa de teste com os primeiros postos. Siga pra acompanhar a construção."
(Só se esse for mesmo o próximo marco confirmado pelo Rafael.)
</exemplo>
</examples>

<constraints>
- O app não existe: tudo o que se diz dele fica no futuro ("vai mostrar", "vai ter").
- Nunca chama, explosão, fumaça, faísca ou bateria pegando fogo, nem no clipe nem no prompt de IA. Ponha "no fire, no smoke, no sparks" em todo prompt de vídeo.
- Nunca lugar real reconhecível, marca de carro, logo de rede de recarga, texto legível gerado por IA nem pessoa com rosto em close.
- Nunca número sem base real. Nenhum dado da pesquisa no vídeo.
- Nunca fato sobre o Rafael ou a origem do projeto que ele não tenha dito no passo 1. Na dúvida, `[A CONFIRMAR]` e pergunte.
- Nunca gerar imagem ou vídeo sem `estimate_only` e sem o ok do Rafael no valor. Nunca repetir uma chamada de geração para "tentar de novo".
- Teto da narração: 2.000 créditos. Os clipes têm conta à parte, aprovada no checkpoint 2.
- Status sempre com ícone e texto, e a idade da informação ao lado.
- O vídeo usa clipe de IA, então no post o rótulo de conteúdo gerado por IA fica ligado no TikTok e no Instagram. Anote isso em `legendas.md`.
- Não mexer em `social/_motor/` sem dizer o que muda e por quê. Se mexer, documente no README. Não tocar nos vídeos 03 a 05.
- Voz do narrador: Matheus Alves (`wSbRKUhF0tUmkj9exCud`), `eleven_v4`, "Mapere" sem acento, a não ser que o passo 1 decida pela voz do Rafael.
</constraints>

<output_format>
Em cada checkpoint, uma mensagem curta e uma AskUserQuestion:
- Checkpoint 1: uma tabela do roteiro (linha, ato, tempo estimado, fala, o que aparece na tela), mais o título, os capítulos e os 3 ganchos alternativos.
- Checkpoint 2: uma tabela de orçamento (item, modelo, estimativa) com o total e o saldo, mais a bíblia visual.
- Checkpoint 3: o MP4 por SendUserFile, a duração, o volume em LUFS e o resultado das checagens.

Entrega final em `social/06-por-que-existe/`: `plano.md` (com a história, a bíblia visual, o roteiro, as decisões, os tempos e os comandos para refazer), `legendas.md`, `_fonte/creditos.md` e `video/`, mais a linha do teste em `metricas.md`.
</output_format>
