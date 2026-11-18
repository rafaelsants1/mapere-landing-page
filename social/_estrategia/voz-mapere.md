# Voz do Mapere

Perfil de voz feito com a skill `brand-voice` do ECC em 17/11/2026, na Etapa 2 do [plano-ecc.md](plano-ecc.md). Vale para a narração, a tela e as legendas dos vídeos, e para textos novos da landing.

**Em conflito, nesta ordem, vale:** `PRODUCT.md`, depois a skill `novo-video` e o `social/06-por-que-existe/prompt.md`, e por último este arquivo. Os textos de produto continuam saindo de `src/data/copy.ts`.

```text
VOICE PROFILE
=============
Autor: a marca Mapere (não é a voz pessoal do Rafael)
Objetivo: um motorista de carro elétrico que nunca ouviu falar do Mapere entende em 2 s e confia no que ouve
Confiança: média. São 3 vídeos, 6 legendas e a landing. Nenhuma fonte tem a voz do Rafael em primeira pessoa.

Fontes
- src/data/copy.ts (landing)
- PRODUCT.md
- social/03-video-nao-carrega, 04-video-4-status e 05-quem-vem-depois: plano.md (roteiro) e legendas.md
- social/03b-nao-carrega-abertura: gancho novo e legenda no padrão do T5

Ritmo
- Frases de 4 a 12 palavras. Uma ideia por frase. Na narração, cada linha tem 1 ou 2 frases.
- Definição com dois-pontos: "Livre: tem carregador funcionando e sem fila."
- "Aí" liga causa e consequência: "Aí você decide: espera ou vai pra outro." / "Aí ninguém perde a viagem."
- A pausa marca a virada, e não a reticência decorativa (ex.: a pausa de 0,5 s em "um … de quatro status").

Compressão
- Densa e concreta: mecanismo, nunca adjetivo. "Quem está no posto confirma em poucos toques."
- Só explica o que o motorista faz: pluga, sobe, troca o cartão, abre o mapa.

Maiúsculas
- Convencionais. Nunca rótulo em caixa-alta acima de título (PRODUCT.md, anti-referência).
- "Mapere" sem acento, na tela e no texto da voz sintética.

Parênteses
- Ausentes na narração e nas legendas. Na tela, a informação extra vai depois de "·": "Livre · há 4 min · 2 confirmações".

Perguntas
- Só a pergunta que o motorista já faz, respondida na hora: "Vale ir nesse posto?", "Seu carro não carrega no posto?", "Deu defeito? Você avisa também."
- Nunca pergunta para a plateia no fim ("e você?", "comenta aí").

Afirmações
- Honestas sobre o limite: "O mapa não adivinha", "Sem chute", "O app ainda não existe."
- Número só com base real e nota discreta (landing). Nos vídeos e nas legendas, nenhum número da pesquisa.
- Todo exemplo fictício vem marcado: "Tela ilustrativa", "Exemplos ilustrativos", "Postos ilustrativos".
- O status sempre com ícone, texto e a idade da informação. Nunca só cor.

O que a marca faz
- Abre pela situação, em segunda pessoa e no presente, com imagem de problema: "Bateria no fim, e o carregador não libera." / "Alguém já passou por esse posto hoje. Só não te contou."
- Entrega alguma coisa útil antes de falar do Mapere: a dica, o motivo, a definição.
- Dá a dica no imperativo de conversa: "pluga o carro, sobe até onde pega sinal e inicia por lá."
- Volta às mesmas imagens: o ponto que acende, "quem vem depois", "confirmado há 4 min", "o mapa não adivinha".
- Fecha com a frase da landing: "Cada confirmação acende o mapa pra quem vem depois."

O que a marca não faz
- Começar pela marca ou por promessa: "Conheça o Mapere, o app que resolve…" (exemplo ruim do prompt do 06).
- Falar do app no presente nos vídeos. O app não existe: "vai mostrar", "vai ter", "vai poder".
- Jargão de marketing ou de técnico: "revolucionário", "solução", "experiência", "conectividade", "OCPP".
- Ponto de exclamação e emoji. Nenhuma fonte usa.
- Citar pelo nome uma rede de recarga, um app, um banco ou uma bandeira de cartão ("Pix" aparece só como texto).
- Chama, fogo, fumaça, faísca ou bateria pegando fogo, nem como metáfora.
- Fato sobre o Rafael ou a origem do projeto que ele não tenha dito.
- Gancho de curiosidade falsa ("você não vai acreditar"). O gancho é uma cena que o motorista reconhece.

Chamada
- Uma só: seguir. Na narração: "Siga pra acompanhar a construção."
- Instagram: "O app vai ser gratuito e ainda não existe. Estamos construindo. Siga @mapere.app para acompanhar."
- TikTok: "O app ainda não existe. Siga pra acompanhar a construção."
- Landing: "Entrar na lista". Nada de "Garanta já" nem urgência.
- Muda só se o T4 (pedido de envio, de 30/11 a 04/12) bater o critério.

Notas por canal
- Narração: conversa entre motoristas: "tá", "pra", "pluga", "vê". Números por extenso ("quatro minutos").
- Tela: título fixo, etiquetas curtas em mono, status com "·". Números em algarismo ("há 4 min").
- Legenda do Instagram: mais escrita ("está", "para") e mais completa, repetindo a dica do vídeo em lista numerada.
- Legenda do TikTok: 2 ou 3 frases, mais falada ("tá", "pra").
- Legendas desde 19/11 (T5): a primeira linha é a frase que o motorista digitaria na busca ("Carro elétrico não carrega no posto: 3 motivos e o que fazer"), e as hashtags mudam com o tema.
- Landing: registro de produto, "você" e "a gente", presente para descrever o que o app vai fazer. Sem gíria.
```

## Onde as fontes divergem

- **Escrito × falado.** A landing e a legenda do Instagram dizem "está" e "para", e a narração e o TikTok dizem "tá" e "pra". Não é erro: cada canal tem o seu registro. Não misture os dois na mesma frase.
- **Tempo do verbo.** A landing descreve o app no presente ("O Mapere mostra"). Nos vídeos e nas legendas, vale o futuro, pela regra da `novo-video`. Ao levar um texto do `copy.ts` para um vídeo, passe o verbo para o futuro.
- **Definição dos status.** A legenda do 04 diz "Livre: tem carregador funcionando e sem fila", e o `copy.ts` diz "Tem carregador disponível e funcionando." Vale o `copy.ts`.
- **Marca no começo.** O 04 diz "No Mapere" no segundo 3, e a retenção cai ali. O T2 testa tirar. Até a leitura (domingo, 22/11), a regra continua sendo entregar algo antes da marca, sem proibir a marca no começo.
- **Voz em primeira pessoa.** O vídeo 06 pode ser narrado pelo Rafael. Este perfil não cobre essa voz. Se o passo 1 do prompt do 06 escolher a voz dele, as falas saem das palavras dele, e daqui só valem as proibições.
