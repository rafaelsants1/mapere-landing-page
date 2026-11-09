# Design

Identidade A1 · Brasa. Tokens em `src/styles/tokens.css`; textos em `src/data/copy.ts`.

## Direção

Uma pessoa no carro ou em casa à noite olha o celular antes de sair. A página é a noite da cidade: maquete de renda e linho, depois mapa em linha, depois a cidade em arame, sempre com uma luz Brasa correndo por um fio. A coisa que fica na memória: o ponto aceso do posto vira o ponto final de "Mapere.".

## Cor

- Base Noite; Linho nas seções de leitura (3, 4 e perguntas). A troca é guiada pela rolagem, em faixas sem texto.
- Um só elemento Brasa sólido por viewport: o botão principal. Texto do botão em Noite.
- Dentro de mapa, Brasa é só luz: traço fino, brilho, ponto aceso.
- Palavra de destaque: Brasa sobre Noite, `--brasa-texto` sobre Linho (Brasa sobre Linho dá 2,75:1, não passa).
- Verde, âmbar, vermelho e cinza só para status. Pin sobre fundo claro leva contorno de 2 px em Noite.

## Tipo

- Bricolage Grotesque 800: títulos e momentos de marca, entrelinha 0,95 a 1,05, tracking -3%.
- Atkinson Hyperlegible Next 400/700/800: interface e texto, corpo mínimo 16 px, números tabulares em dados.
- Atkinson Hyperlegible Mono 400/500: só anotações ao lado do desenho, rótulos de mapa e numeração.

## Linguagem gráfica

Linha de lacê (traço contínuo, espessura constante, terminais redondos) como rota, separador e indicador. Ponto cheio = aceso; vazado = esperando a luz. Grade de pontos a cada 20 px, Linho 12% sobre Noite, apagada onde passa o rio, só em fundos de marca. Ícones: traço 2 px, grade 24 px.

## Logo

Pacote M3, sem redesenho. Assinatura "Mapere." do pacote. O símbolo muda de desenho conforme a altura do M: 48 px ou mais usa o rio completo, 24 a 32 px usa o rio simplificado. Favicon usa o desenho de 16 px. Brasa no logo só no ponto, sem brilho, sombra ou gradiente.

## Movimento

Lenis + GSAP. Entrada `cubic-bezier(.2,.7,.2,1)`, saída `power2.in`. Interface 150 a 300 ms, marca até 800 ms, rolagem com `scrub` 0,6 a 1. Só `transform`, `opacity`, `stroke-dashoffset` e `filter` leve. Cenas longas usam `position: sticky` em vez de pin, então não há salto de layout. O HTML já traz o estado final; o JavaScript só recua para o início e anima de volta. Com `prefers-reduced-motion` nada disso roda.
