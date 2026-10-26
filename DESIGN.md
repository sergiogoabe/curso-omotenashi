# Design System: Omotenashi Curso
**Project ID:** Não disponível — nenhum ID ou metadado de projeto Stitch foi encontrado.

> **Base de análise:** sistema visual implementado no repositório (`app/globals.css`, `tailwind.config.js`, `app/layout.tsx` e componentes da aplicação). Este documento registra o design do produto; não foi possível validá-lo contra um projeto ou tela do Stitch.

## 1. Visual Theme & Atmosphere

A interface combina uma base escura, cinematográfica e de alto contraste com referências visuais japonesas. O resultado é contemplativo e premium, mas mantém energia promocional: vermelho profundo conduz a ação, ouro sinaliza destaque e elementos de sakura, ondas seigaiha, torii e kanji dão identidade cultural sem competir com o conteúdo.

A composição alterna áreas amplas e calmas com detalhes ornamentais discretos. Fundos quase pretos sustentam o contraste e ajudam títulos, chamadas e conteúdo educacional a ganhar presença. Gradientes vermelho–âmbar, brilho suave e animações de entrada aparecem como acentos, especialmente em heróis, chamadas para ação e cartões interativos.

## 2. Color Palette & Roles

- **Carvão de fundo — `#080808`:** fundo principal; mantém a interface escura sem chegar ao preto absoluto.
- **Branco suave — `#F2F2F2`:** texto principal e títulos sobre fundos escuros.
- **Carvão elevado — `#0D0D0D`:** superfície de cartões e blocos de conteúdo.
- **Grafite secundário — `#171717`:** superfícies secundárias, controles e faixas alternadas.
- **Grafite de apoio — `#1F1F1F`:** áreas muted e superfícies de menor ênfase.
- **Vermelho lacre — `#B62020`:** cor primária de ações e foco; transmite calor, intenção e referência ao selo japonês.
- **Ouro âmbar — `#FFBF00`:** destaque e acento para badges, chamadas secundárias e pontos de atenção; equilibra o vermelho com uma nota acolhedora.
- **Cinza de leitura — `#999999`:** texto auxiliar, descrições, legendas e informações secundárias.
- **Cinza de contorno — `#242424`:** bordas, divisores e contorno de campos; separa superfícies sem criar linhas dominantes.
- **Vermelho de estado — `#EF4343`:** estado destrutivo e sinalização de erro, distinto do vermelho de marca.
- **Verde de confirmação — `#4ADE80`:** confirmações de sucesso e itens concluídos.

Os valores da paleta base são convertidos diretamente das variáveis HSL em `app/globals.css`. Tons transparentes usados em gradientes e elementos decorativos devem permanecer sutis e subordinados às cores sólidas funcionais.

## 3. Typography Rules

- **Títulos e chamadas:** Shippori Mincho, com aparência serifada editorial e caráter tradicional. Usar pesos 700–800 para títulos principais e 500 quando a hierarquia pedir mais leveza.
- **Texto de interface e leitura:** Zen Kaku Gothic New, uma sans-serif japonesa de desenho limpo. Usar pesos 300–400 para corpo, 500 para ênfase discreta e 700–900 para rótulos ou números fortes.
- **Hierarquia:** títulos grandes, com entrelinha confortável e alinhamento predominantemente central nas seções de apresentação; textos explicativos ficam em largura controlada para leitura.
- **Espaçamento:** manter títulos firmes e compactos; corpo de texto tem ritmo mais aberto. O sistema não define tracking global customizado, portanto evitar espaçamento artificial em parágrafos.
- **Fallbacks:** preservar a cadeia serifada para display e sans-serif para interface para suportar caracteres japoneses e ambientes sem as fontes carregadas.

## 4. Component Stylings

* **Buttons:** formato retangular com cantos moderadamente arredondados (raio padrão aproximado de 6 px; variante extra grande cerca de 8 px). A ação principal usa vermelho lacre e texto branco; a ação de acento usa ouro âmbar e texto carvão. Variantes outline e ghost são discretas, com contorno grafite ou mudança de superfície no hover. Transições são rápidas e estados de foco usam anel vermelho visível.
* **Cards/Containers:** cantos suavemente arredondados (raio padrão de 8 px), fundo carvão elevado e borda grafite fina. A elevação é contida, quase plana por padrão; cartões interativos podem subir levemente e receber sombra vermelha difusa no hover. Camadas translúcidas com desfoque são usadas pontualmente, não como superfície dominante.
* **Inputs/Forms:** fundo grafite secundário, contorno fino cinza-carvão e cantos moderadamente arredondados. Placeholder em cinza de leitura; o foco reforça o contorno com anel vermelho, mantendo a leitura clara sem preenchimento chamativo.
* **Badges e indicadores:** pequenos e compactos, com ouro para destaque editorial e grafite para informação neutra. Vermelho e verde ficam reservados a estados ou mensagens com significado funcional.
* **Detalhes decorativos:** padrões seigaiha, silhueta de torii, marca d'água em kanji e pétalas de sakura usam baixa opacidade e não devem reduzir contraste nem interceptar interação.

## 5. Layout Principles

- **Largura e alinhamento:** conteúdo centralizado em um container responsivo, com padding lateral base de 2 rem e largura máxima ampla em telas grandes. Blocos de texto usam limites menores para preservar linhas confortáveis.
- **Ritmo vertical:** seções de landing page têm respiro generoso (frequentemente cerca de 6 rem de padding vertical); cabeçalhos e conteúdo interno usam espaçamentos consistentes e agrupamentos claros.
- **Grid:** uma coluna em telas estreitas, evoluindo para duas colunas em conteúdo editorial e planos, e três ou quatro colunas em grades de cartões e indicadores conforme a largura disponível.
- **Hierarquia espacial:** títulos e CTAs centralizados em seções de conversão; conteúdo explicativo e empresarial pode usar composição em duas colunas. Estatísticas e listas mantêm alinhamento simples para leitura rápida.
- **Densidade:** preferir áreas negativas amplas e poucos elementos por grupo. Ornamentação japonesa fica em fundos, divisores ou marcas d'água; informação e ações permanecem em primeiro plano.
- **Movimento e profundidade:** animações de revelação, flutuação e brilho são suaves e usadas como acento. Hover pode elevar cartões discretamente; sombras fortes e camadas muito contrastadas não fazem parte do padrão.
