# Vídeo 04b: "Vale ir nesse posto? 4 respostas", sem a marca no começo

É o teste T2 do plano de alcance (`social/_estrategia/plano-alcance.md`, seção 6). Só a linha 2 do vídeo 04 muda: sai o "No Mapere". A marca aparece só no fecho, no logo em que o ponto aceso se transforma. Do "Livre:" até o fim, é o 04 igual, 0,6 s mais cedo.

- Postagem: sexta, 20/11/2026, às 19h30, como o original.
- Critério, fixado antes de postar: no TikTok, dos que estavam no vídeo em 3 s, 60% ou mais continuam em 6 s. No 04 foram 36%.
- Leitura de 48 h: domingo, 22/11, depois das 19h30, na tabela de testes de `metricas.md`.
- Atenção na leitura: em 3 s a voz está em "Cada posto". Em 6 s, está na pausa antes de "Livre:". No 04, 6 s ainda caía em "status.".

## O que mudou em relação ao 04

| | 04 original | 04b |
|---|---|---|
| Linha 2 | "No Mapere, cada posto vai ter um … de quatro status." | "Cada posto vai ter um … de quatro status." (opção A, escolhida pelo Rafael em 17/11) |
| Na tela | `No Mapere, cada posto \| vai ter um \| de 4 status.` | `Cada posto \| vai ter um \| de 4 status.` |
| Voz da linha 2 | take A do 04 | take A nova, gravada junto com a linha 1 para sair no mesmo embalo. Só a linha 2 entra |
| Pausa entre "um" e "de" | 0,58 s | 0,58 s |
| Do começo até "Cada" (2,99 s) | | igual, amostra por amostra e pixel a pixel |
| Do "Livre:" ao fim | | igual, 0,6 s mais cedo |
| Marca | voz no segundo 3 e logo no fecho | só o logo no fecho |
| Título, capa e foto do gancho | | iguais |
| Duração | 36,2 s | 35,6 s |

Por que a opção A, e não "No mapa, cada posto…": muda só a marca, e o teste mede uma variável só. A B repetia "mapa" da linha 1 e soava como se o mapa que "não te diz nada" passasse a dizer.

## Tempos

| Marca | 04 | 04b |
|---|---|---|
| início da linha 2 | 2,990 s ("No") | 2,990 s ("Cada") |
| "quatro" (entram os chips) | 5,475 s | 4,800 s |
| emenda A (no silêncio digital depois de "nada.") | | 2,740 s |
| emenda B (no silêncio digital antes de "Livre:") | 6,625 s | 6,025 s |
| "Livre:" (capítulo 1) | 6,925 s | 6,325 s |
| capítulo 2 | 13,04 s | 12,44 s |
| capítulo 3 | 18,685 s | 18,085 s |
| capítulo 4 | 24,495 s | 23,895 s |
| "Siga pra acompanhar a construção." | 34,01 s | 33,41 s |
| fim | 36,24 s | 35,64 s |

A pausa entre "status." e "Livre:" ficou em 0,565 s; no 04 era 0,6 s.

## Narração

Voz Matheus Alves (`wSbRKUhF0tUmkj9exCud`), modelo `eleven_v4`, flow do 04 (`UDVvFKXx4mo9f23yVXGs`). Custou 198 créditos (2 takes de 99 caracteres). Cada chamada está em `_fonte/creditos.md`.

A take A ganhou pelo ritmo: "de quatro status." dura 1,08 s nela, 1,18 s na B e 1,01 s no 04. O volume da linha 1 dela também ficou mais perto do 04 (−19,78 contra −19,70 LUFS).

`_fonte/emendar-narracao.mjs` monta a faixa: a narração do 04 até o meio da pausa depois de "nada.", a linha 2 nova com a voz começando no mesmo instante em que o "No" começava, e a narração do 04 de novo, a partir do meio da pausa antes de "Livre:". As duas emendas caem no silêncio digital que o motor tinha inserido nas pausas. A linha 2 nova desceu 1,64 dB e ficou no nível da linha 2 do 04 (−24,16 contra −24,17 LUFS). Em relação às vizinhas, a diferença é a mesma do 04: −4,53 LU contra a linha 1 (no 04, −4,47) e −2,77 contra a linha 3 (no 04, −2,71).

## Checagens

`node checar.mjs` (cena e narração) e `node checar.mjs --video` (MP4), em `_fonte/`:

- início igual ao 04: 30 de 30 quadros idênticos, pixel a pixel, de 0 a 2,9 s;
- resto igual ao 04: 59 de 59 quadros idênticos, de 0,5 em 0,5 s do capítulo 1 ao fim, com o deslocamento de −0,6 s;
- narração: linha 1 e resto iguais ao 04, amostra por amostra;
- zona segura: 1.069 quadros conferidos, nada novo fora da zona. A etiqueta "fila", aos 14,8 s, passa 13 px da margem direita por 0,8 s. É herança do 04, que a prévia do motor não pegou porque confere só 8 quadros. Ficou como estava, para o resto continuar idêntico ao 04.

## Refazer

Em `_fonte/`:

```
node emendar-narracao.mjs a      # ou b
node checar.mjs
```

Em `social/`:

```
node _motor/legenda.mjs 04b
node _motor/quadros.mjs 04b
node _motor/renderizar.mjs 04b --sem-previa
node _motor/capa.mjs 04b
```

Depois, de novo em `_fonte/`, `node checar.mjs --video`.
