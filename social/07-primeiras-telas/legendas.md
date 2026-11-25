# 07 · As primeiras telas: legendas e folha de postagem

Post leve, fora dos testes do plano de alcance. Cumpre a promessa do vídeo 06 ("O próximo passo é mostrar aqui as primeiras telas"). Carrossel de 6 slides em 1080×1350, em `carrossel/01.png` a `06.png`.

As telas são as capturas dos componentes da landing (`src/components/Tela*.astro`), as mesmas de `01-apresentacao/_fonte/telas/`. Nada aqui é feito por IA.

As capturas originais (`_fonte/telas/`) trazem a moldura preta do celular da landing. Ela aparece nos cantos e como uma linha de 3 px no topo e na direita. O carrossel usa `_fonte/telas-limpas/`: a área útil da tela (1170×2532, a partir de x = 0 e y = 3), com os cantos transparentes num raio de 156 px. O raio do molde no HTML é o mesmo. Para refazer:

```
ffmpeg -i telas/mapa.png -vf "crop=1170:2532:0:3,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip(156.5-hypot(max(max(156-X,X-(W-157)),0),max(max(156-Y,Y-(H-157)),0)),0,1)'" telas-limpas/mapa.png
```

## Folha de postagem

- **Quando:** quarta, 25/11/2026, às 19h, no horário fixo do plano.
- **Instagram:** post em carrossel, com as 6 imagens na ordem de 01 a 06, no formato original (4:5). Não precisa de rótulo de IA. A música é opcional.
- **TikTok:** Carregar > Fotos, com as mesmas 6 imagens na mesma ordem. A capa é a foto 1. Escolha um som instrumental calmo, com volume baixo. Deixe desligado o rótulo de conteúdo gerado por IA.
- **Depois de postar:**
  - Responder todo comentário na primeira hora.
  - Leitura em 48 h, na sexta, 27/11, depois das 19h, com uma linha nova em `_estrategia/metricas.md`. Os números que importam aqui são as visitas ao perfil e os seguidores por 1.000 visualizações. A comparação é com o 06: 5,5 seguidores por 1.000 e 0,68% dos visualizadores indo ao perfil no Instagram.

## Instagram

```
App de carregadores elétricos: as primeiras telas do Mapere

No último vídeo, a gente prometeu mostrar as primeiras telas. Estão aqui.

1. Consulte antes de sair. O mapa vai mostrar o status de cada posto, há quanto tempo e por quantas pessoas.
2. Confirme quando chegar. O check-in leva poucos toques: livre, ocupado ou com defeito.
3. O ponto acende. Quem vem depois vê o status de agora, com a hora da confirmação.
4. Seja avisado. Quando o seu posto mudar, o alerta vai chegar no celular.

Telas ilustrativas. Nome, endereço, preço e distância são fictícios.

O app vai ser gratuito e ainda não existe. Estamos construindo. Siga @mapere.app para acompanhar.

#carroeletrico #eletroposto #recargacarroeletrico #veiculoeletrico #pontoderecarga
```

Texto alternativo, um por imagem (Configurações avançadas > Acessibilidade, ou "Editar" em cada foto):

1. Capa: "Bateria no fim. Qual posto está livre? As primeiras telas do Mapere." Três celulares mostram o mapa, o detalhe de um posto e um alerta.
2. Tela do mapa com a rota até o Posto Fio de Luz, marcado como livre, e o filtro "Só livres".
3. Tela de check-in com a pergunta "Como está o posto agora?" e as opções livre, ocupado e com defeito.
4. Detalhe do Posto Fio de Luz: livre, confirmado agora por 3 pessoas, com conectores, preço e histórico.
5. Tela bloqueada do celular com o alerta "Posto Fio de Luz está livre".
6. "O app ainda não existe. Siga para acompanhar a construção. @mapere.app"

## TikTok

```
App de carregadores elétricos: as primeiras telas do Mapere. Consulta antes de sair, confirma quando chega e o ponto acende pra quem vem depois. O app ainda não existe. Siga pra acompanhar a construção.

#carroeletrico #eletroposto #recargacarroeletrico #veiculoeletrico #pontoderecarga
```

## Refazer

Em `social/01-apresentacao/_fonte/`, que tem o `playwright-core`:

```
node renderizar.mjs ../../07-primeiras-telas/_fonte/carrossel.html ../../07-primeiras-telas/carrossel
```

O renderizador avisa se algum texto passar da margem. Na última rodada, de 25/11, não houve nenhum estouro.
