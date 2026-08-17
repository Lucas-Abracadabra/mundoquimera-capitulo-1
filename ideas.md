# Direção de design — Mundo Quimera

## Abordagens consideradas

### Theme Name: Atlas de Campo
Very Brief Intro: Interface editorial de exploração, inspirada em cadernos de expedição, mapas antigos e fichas de investigação. A aventura aparece como um instrumento de navegação legível, não como um painel futurista.
Probability: 0.07

### Theme Name: Taverna de Madeira
Very Brief Intro: Direção quente e artesanal, com madeira, pergaminho, cobre e iluminação de lamparina. O jogo teria forte sensação de objeto físico e diário de viajante.
Probability: 0.03

### Theme Name: Quimera em Blocos
Very Brief Intro: Interface modular, colorida e direta, baseada no layout de referência: cabeçalho forte, painel dinâmico, abas persistentes e cartões de locais. A fantasia entra por ilustrações, textura e linguagem visual de atlas.
Probability: 0.09

## Abordagem escolhida: Quimera em Blocos

### Design Movement
Neo-editorial de atlas de aventura, misturando interfaces de jogos educativos dos anos 1990 com cartografia fantástica e fichas de investigação.

### Core Principles
A interface deve ser legível antes de ser ornamental; cada ação deve ter uma posição previsível; o mapa, a busca e as notas devem permanecer acessíveis; e a cor deve comunicar estado, não apenas decorar.

### Color Philosophy
O verde-oliva do cabeçalho representa a passagem e a autoridade do mundo. O azul-céu do painel principal comunica descoberta e leitura. O amarelo-lima marca a ferramenta ativa e decisões importantes. O laranja dos locais indica pontos exploráveis. O bege funciona como superfície de papel e repouso visual. O preto é usado em contornos e textos para preservar o caráter gráfico do layout de referência.

### Layout Paradigm
Estrutura vertical assimétrica: faixa de título no topo, painel de narrativa com trilho de navegação, abas inferiores persistentes e uma matriz de locais que se rearranja em telas pequenas. O conteúdo principal ocupa o eixo central, mas o mapa e as notas entram como camadas laterais ou inferiores sem perder o contexto.

### Signature Elements
Molduras grossas azul-celeste no painel dinâmico; contornos pretos nos títulos e botões; cartões de locais em laranja com numeração grande; e uma pequena fita de estado mostrando região, objetivo e tempo.

### Interaction Philosophy
Toda interação deve responder como uma ficha de expedição: o jogador sabe onde está, o que pode fazer e o que mudou. Mudanças de atributos aparecem como pequenos registros de evento; escolhas narrativas são apresentadas como ações claras, não como links perdidos no texto.

### Animation
Entradas do painel usam fade curto com deslocamento vertical de poucos pixels. Cartões de locais fazem elevação sutil no hover. Mudanças de aba usam troca instantânea de conteúdo com uma linha de destaque deslizando sob a aba ativa. A animação deve ser reduzida para quem prefere menos movimento.

### Typography System
Títulos em `Bree Serif`, com peso forte e contorno preto; corpo em `Atkinson Hyperlegible`, para leitura longa e acessibilidade. Títulos de capítulo são grandes e compactos; narrativa usa largura controlada, 1.6 de entrelinha e parágrafos curtos; botões usam caixa alta apenas em ações utilitárias.

### Brand Essence
Um atlas narrativo para quem quer explorar Quimera como Ender: investigação, fantasia e escolhas com consequências em uma interface de campo. Personalidade: cartográfica, inquieta, humana.

### Brand Voice
Headlines são diretas e evocativas; CTAs dizem exatamente o que acontece; microcopy registra consequências sem dramatização artificial.
Exemplo 1: “A estrada termina aqui. A investigação, não.”
Exemplo 2: “Abrir o mapa do condado”

### Wordmark & Logo
Marca baseada em um compasso de quatro pontas atravessado por uma silhueta de orelha lupina, sem texto. O símbolo deve funcionar como ícone de aplicação e marcador de localização.

### Signature Brand Color
Amarelo-lima de mapa antigo: `#f2f52b`, usado na aba ativa e em decisões de busca.

## Style Decisions

A interface deve manter uma pista cartográfica ou de dossiê em toda tela principal: códigos de rota, fichas de campo, selos, etiquetas de folha ou divisores de registro. A imagem de personagem é tratada como evidência de expedição em moldura preta, e nenhum título de navegação deve parecer placeholder; cada rótulo deve indicar lugar, ação ou consequência concreta.


## Atualização visual — Atlas Fantástico

A implementação consolidada mantém a abordagem **Quimera em Blocos**, aprofundando-a como um atlas fantástico editorial. O sistema final usa pergaminho, azul-petróleo, verde-musgo, ouro antigo e vinho de perigo; Cormorant Garamond e EB Garamond substituem a sensação genérica da interface; Space Mono fica reservado a códigos e metadados. Molduras de tinta, sombras deslocadas, textura cartográfica e selos de registro tornam a interface tátil sem prejudicar a leitura.

Os estados de atmosfera agora identificam a cena como **PERIGO**, **ENCONTRO**, **REGISTRO** ou **EXPLORAÇÃO** a partir das tags já existentes no storyfile. Essas mudanças são apenas visuais e não alteram nenhuma variável, passagem, escolha ou texto original.
