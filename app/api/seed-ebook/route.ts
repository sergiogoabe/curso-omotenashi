import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

const additionalChapters = [
  {
    title: "Capítulo 13: Omotenashi na Saúde",
    slug: "cap13-saude",
    order: 14,
    content: `# Capítulo 13: Omotenashi na Saúde

## 13.1 Humanizando o Atendimento em Saúde

O setor de saúde é onde o Omotenashi pode ter o maior impacto. Pacientes estão vulneráveis, ansiosos e precisam mais do que nunca de um atendimento humanizado.

### Princípios Omotenashi na Saúde

1. **Antecipação**: Preparar o paciente para cada etapa do tratamento
2. **Respeito**: Preservar a dignidade do paciente em momentos de vulnerabilidade
3. **Atenção aos Detalhes**: Cada aspecto da experiência do paciente importa
4. **Comunicação Clara**: Explicar termos médicos de forma compreensível

### O Toque Humano

- Um sorriso acolhedor na recepção
- Explicar cada procedimento antes de realizá-lo
- Lembrar o nome do paciente e seu histórico
- Oferecer conforto além do tratamento médico

### Exemplo: Hospital Omotenashi

Alguns hospitais no Japão implementaram o Omotenashi com resultados impressionantes:
- Recepção com chá verde e toalha quente
- Enfermeiras que se apresentam e explicam cada etapa
- Alta com acompanhamento personalizado
- Pacientes que voltam para check-ups preventivos

## 13.2 Omotenashi em Clínicas e Consultórios

### Antes da Consulta
- Lembrete de consulta personalizado (não apenas automático)
- Sala de espera confortável com água, café, revistas
- Tempo de espera comunicado com transparência

### Durante a Consulta
- Atenção total ao paciente (sem olhar o computador)
- Explicações claras e pausadas
- Validar preocupações do paciente

### Após a Consulta
- Resumo escrito das orientações
- Acompanhamento pós-consulta
- Facilidade para agendar retorno

## Exercícios do Capítulo 13

1. **Observação**: Visite um consultório ou hospital e identifique 3 pontos que poderiam ser melhorados com Omotenashi
2. **Implementação**: Se você trabalha na saúde, implemente um gesto Omotenashi esta semana`,
  },
  {
    title: "Capítulo 14: Omotenashi na Educação",
    slug: "cap14-educacao",
    order: 15,
    content: `# Capítulo 14: Omotenashi na Educação

## 14.1 Ensinando com Omotenashi

A educação é um ato de serviço. Professores que praticam Omotenashi criam ambientes de aprendizado mais acolhedores e eficazes.

### O Professor como Anfitrião

Assim como um ryokan recebe seus hóspedes, o professor pode receber seus alunos:
- Sala de aula preparada e acolhedora
- Boas-vindas genuínas a cada encontro
- Antecipação de dificuldades de aprendizado
- Atenção individualizada

### Princípios Omotenashi na Sala de Aula

1. **Respeito pela Jornada do Aluno**: Cada aluno tem seu ritmo
2. **Antecipação**: Identificar dificuldades antes que se tornem barreiras
3. **Melhoria Contínua (Kaizen)**: Ajustar métodos de ensino constantemente
4. **Atenção aos Detalhes**: Materiais didáticos cuidadosamente preparados

## 14.2 Instituições de Ensino Omotenashi

### Na Secretaria
- Atendimento ágil e acolhedor
- Documentação simplificada
- Orientação clara sobre processos

### Na Sala de Aula
- Ambiente físico preparado (temperatura, iluminação, limpeza)
- Material didático de qualidade
- Feedback constante e construtivo

### Na Comunidade Escolar
- Comunicação transparente com pais
- Eventos que criam senso de pertencimento
- Suporte além do acadêmico

## 14.3 E-learning com Omotenashi

Cursos online também precisam de hospitalidade:
- Plataforma intuitiva e bonita
- Resposta rápida a dúvidas
- Conteúdo bem organizado
- Certificação que valoriza o aluno`,
  },
  {
    title: "Capítulo 15: Omotenashi em Eventos",
    slug: "cap15-eventos",
    order: 16,
    content: `# Capítulo 15: Omotenashi em Eventos

## 15.1 A Hospitalidade em Eventos

Eventos são experiências temporárias, mas marcantes. O Omotenashi pode transformar um evento comum em uma experiência memorável.

### Planejamento Omotenashi

**Pré-Evento**
- Comunicação clara sobre o evento
- Facilidades de acesso e estacionamento
- Opções de alimentação para restrições
- Acolhimento de necessidades especiais

**Durante o Evento**
- Credenciamento ágil e acolhedor
- Staff treinado em hospitalidade
- Sinais visuais claros
- Espaços de descanso confortáveis
- Alimentação de qualidade

**Pós-Evento**
- Agradecimento personalizado
- Pesquisa de satisfação genuína
- Compartilhamento de fotos e conteúdo
- Criação de comunidade pós-evento

## 15.2 O Anfitrião de Eventos

### Características do Anfitrião Omotenashi
- Sorriso genuíno e acolhedor
- Antecipação de necessidades dos participantes
- Resolução ágil de problemas
- Atenção aos detalhes

### Treinamento de Equipe para Eventos

1. **Módulo 1**: Filosofia Omotenashi aplicada a eventos
2. **Módulo 2**: Técnicas de acolhimento e boas-vindas
3. **Módulo 3**: Gestão de imprevistos com elegância
4. **Módulo 4**: Criação de momentos memoráveis`,
  },
  {
    title: "Capítulo 16: Omotenashi no Varejo Online",
    slug: "cap16-varejo-online",
    order: 17,
    content: `# Capítulo 16: Omotenashi no Varejo Online

## 16.1 E-commerce com Alma

O e-commerce é frequentemente impessoal. O Omotenashi pode humanizar a experiência de compra online.

### Jornada do Cliente Omotenashi

**Descoberta**
- Conteúdo relevante que educa, não apenas vende
- Recomendações personalizadas
- Narrativa que conecta emocionalmente

**Compra**
- Processo simples e intuitivo
- Múltiplas formas de pagamento
- Transparência sobre prazos e custos
- Surpresa positiva (pequeno brinde, embalagem especial)

**Entrega**
- Embalagem caprichada (unboxing experience)
- Bilhete personalizado de agradecimento
- Entrega no prazo ou antes
- Instruções de uso ou cuidados

**Pós-Venda**
- Acompanhamento proativo
- Política de troca sem burocracia
- Programa de fidelidade que surpreende

## 16.2 Unboxing Experience

A experiência de abrir a embalagem é um momento crucial:
- Caixa bonita e resistente
- Papel de seda ou tecido (furoshiki digital?)
- Organização cuidadosa dos itens
- Pequeno brinde ou amostra
- Instruções claras e bonitas
- QR code para feedback ou conteúdo exclusivo

## 16.3 Atendimento Omotenashi no E-commerce

### Chat ao Vivo com Alma
- Não apenas respostas prontas
- Tom humano e acolhedor
- Resolução no primeiro contato
- Acompanhamento após resolução

### E-mails que Aquecem o Coração
- Confirmação de pedido com entusiasmo
- Notificação de envio com detalhes
- Agradecimento genuíno pós-compra`,
  },
  {
    title: "Capítulo 17: Omotenashi no Setor Financeiro",
    slug: "cap17-financeiro",
    order: 18,
    content: `# Capítulo 17: Omotenashi no Setor Financeiro

## 17.1 Humanizando as Finanças

O setor financeiro é frequentemente visto como frio e impessoal. O Omotenashi pode transformar essa percepção.

### Confiança como Fundamento

No setor financeiro, confiança é a moeda mais valiosa. O Omotenashi constrói confiança através de:
- Transparência total sobre taxas e condições
- Linguagem clara e acessível
- Interesse genuíno no bem-estar financeiro do cliente
- Disponibilidade para explicar e educar

### Antecipação Financeira

- Alertas de vencimento com empatia
- Ofertas personalizadas baseadas em necessidades reais
- Educação financeira proativa
- Identificação de oportunidades de economia

## 17.2 Agências Bancárias Omotenashi

### Ambiente Físico
- Espaço acolhedor (sofá, café, água)
- Privacidade nas conversas
- Decoração que transmite confiança
- Tecnologia a serviço da experiência

### Atendimento
- Gerentes que realmente ouvem
- Soluções personalizadas, não padronizadas
- Acompanhamento contínuo
- Disponibilidade além do horário comercial`,
  },
  {
    title: "Capítulo 18: Omotenashi em Call Centers e SAC",
    slug: "cap18-call-center",
    order: 19,
    content: `# Capítulo 18: Omotenashi em Call Centers e SAC

## 18.1 A Voz do Omotenashi

O call center é um dos pontos de contato mais importantes — e mais frustrantes — para os clientes. O Omotenashi pode transformar essa experiência.

### O Desafio do Atendimento Telefônico

Sem contato visual, sem linguagem corporal, sem ambiente físico — apenas a voz. É aqui que o Omotenashi precisa ser ainda mais intencional.

### A Voz que Acolhe

1. **Tom de Voz**: Caloroso, pausado, atento
2. **Ritmo**: Adaptado ao ritmo do cliente
3. **Palavras**: Escolhidas com cuidado e respeito
4. **Silêncio**: Saber ouvir sem interromper
5. **Empatia**: Validar sentimentos do cliente

## 18.2 Métricas Omotenashi para Call Center

### Além do TMA (Tempo Médio de Atendimento)

Métricas que importam:
- IRS (Índice de Resolução no Primeiro Contato)
- IEA (Índice de Encantamento do Atendimento)
- TCE (Tempo de Conexão Empática)
- IRC (Índice de Recomendação por Call)

### Treinamento de Voz Omotenashi

1. **Aquecimento Vocal**: Preparar a voz para o atendimento
2. **Respiração**: Controlar a ansiedade
3. **Postura**: A postura afeta a voz (sorrir enquanto fala)
4. **Escuta Ativa**: Treinar a escuta genuína
5. **Descompressão**: Técnicas para não acumular estresse`,
  },
  {
    title: "Capítulo 19: Omotenashi no Setor Público",
    slug: "cap19-setor-publico",
    order: 20,
    content: `# Capítulo 19: Omotenashi no Setor Público

## 19.1 Servir o Cidadão com Dignidade

O setor público existe para servir o cidadão. Omotenashi no serviço público não é opcional — é a essência do que deveria ser.

### O Desafio do Serviço Público

- Grande volume de atendimentos
- Recursos limitados
- Burocracia complexa
- Clientes (cidadãos) já chegam frustrados

### Princípios Omotenashi para o Serviço Público

1. **Respeito ao Cidadão**: Cada pessoa merece atendimento digno
2. **Antecipação**: Informações claras sobre documentos e processos
3. **Eficiência com Humanidade**: Rápido sem ser grosseiro
4. **Transparência**: Processos claros e acessíveis

## 19.2 Omotenashi em Repartições Públicas

### Ambiente
- Sinalização clara e intuitiva
- Área de espera confortável
- Água e banheiros limpos e acessíveis

### Atendimento
- Servidor treinado em comunicação respeitosa
- Linguagem clara, sem jargões
- Resolução ágil ou orientação precisa
- Acompanhamento do processo

## 19.3 Omotenashi Digital no Governo

- Portais intuitivos e acessíveis
- Serviços digitais simplificados
- Chatbots que realmente ajudam
- Transparência e prestação de contas`,
  },
  {
    title: "Capítulo 20: O Futuro do Omotenashi",
    slug: "cap20-futuro",
    order: 21,
    content: `# Capítulo 20: O Futuro do Omotenashi

## 20.1 Omotenashi na Era da IA

A inteligência artificial está transformando o atendimento ao cliente. Como o Omotenashi se encaixa?

### IA + Omotenashi = Atendimento do Futuro

A tecnologia pode amplificar o Omotenashi:
- Chatbots treinados em linguagem respeitosa
- Sistemas que lembram preferências dos clientes
- Antecipação baseada em dados
- Personalização em escala

Mas a IA nunca substituirá:
- A empatia genuína
- O sorriso que aquece
- O toque humano
- A conexão verdadeira

### O Equilíbrio entre Tecnologia e Humanidade

O segredo não é escolher entre tecnologia e humanidade, mas integrá-las:
- Use IA para tarefas repetitivas
- Libere humanos para o que importa: conexão
- Treine IA com valores Omotenashi
- Mantenha o toque humano nos momentos críticos

## 20.2 Omotenashi como Diferencial Competitivo

Em um mundo cada vez mais automatizado, a hospitalidade genuína será o maior diferencial.

### Por que Omotenashi Agora?

1. **Clientes estão cansados**: Atendimento robótico, respostas automáticas, falta de humanidade
2. **Tecnologia nivelou produtos**: Todos têm produtos similares, o diferencial é o serviço
3. **Redes sociais amplificam**: Uma experiência incrível (ou terrível) viraliza
4. **Consumidores conscientes**: Preferem empresas que se importam

## 20.3 Construindo um Mundo Omotenashi

### Sua Jornada Começa Agora

O Omotenashi não termina neste curso. É uma jornada contínua de aperfeiçoamento.

### Próximos Passos

1. **Pratique diariamente**: Omotenashi é hábito, não evento
2. **Compartilhe**: Ensine outros, multiplique o impacto
3. **Avalie-se**: Sempre busque melhorar
4. **Conecte-se**: Junte-se à comunidade Omotenashi
5. **Inove**: Adapte a filosofia ao seu contexto

### O Legado do Omotenashi

Quando você pratica Omotenashi, você não está apenas melhorando seu serviço — está honrando uma tradição milenar e construindo um mundo mais gentil, uma interação de cada vez.

> "A filosofia Omotenashi nos ensina que a verdadeira grandeza não está em ser servido, mas em servir. Ao nos curvarmos para exaltar o outro, não nos diminuímos — nos elevamos."`,
  },
  {
    title: "Apêndice A: Glossário de Termos Japoneses",
    slug: "apendice-a-glossario",
    order: 22,
    content: `# Apêndice A: Glossário de Termos Japoneses

## Termos Essenciais do Omotenashi

**Omotenashi (おもてなし)**
A arte japonesa da hospitalidade genuína. Mais que serviço, é uma filosofia de vida que envolve antecipar necessidades e servir com o coração.

**Irasshaimase (いらっしゃいませ)**
Saudação de boas-vindas usada em lojas e restaurantes. Literalmente "bem-vindo", mas carrega um significado mais profundo de acolhimento.

**Ojigi (お辞儀)**
A reverência ou curvatura japonesa. Diferentes ângulos indicam diferentes níveis de respeito.

**Keigo (敬語)**
Linguagem honorífica japonesa usada para demonstrar respeito. Inclui três níveis: teineigo (polido), sonkeigo (respeitoso) e kenjougo (humilde).

**Kikubari (気配り)**
A arte de prestar atenção aos detalhes e antecipar necessidades. Literalmente "distribuir a atenção".

**Kaizen (改善)**
Filosofia de melhoria contínua. Pequenas melhorias diárias que levam a grandes resultados.

**Ichigo Ichie (一期一会)**
"Um encontro, uma oportunidade". A crença de que cada encontro é único e irrepetível.

**Ma (間)**
O espaço entre as coisas. A pausa significativa, o silêncio entre as palavras.

**Wa (和)**
Harmonia. Um princípio fundamental da cultura japonesa.

**Okami-san (女将さん)**
A anfitriã de um ryokan (pousada tradicional). Símbolo da hospitalidade japonesa.

## Termos de Atendimento

**Okyakusama (お客様)**
Cliente. Literalmente "pessoa honrada". O tratamento respeitoso dado aos clientes.

**Sashisu (さしす)**
Acrônimo para as palavras mágicas do serviço: Sato (açúcar), Shi (sal), Su (vinagre) — metaforicamente, os elementos essenciais.

**Oshibori (おしぼり)**
Toalha quente ou fria oferecida em restaurantes para limpar as mãos.

**Kaiseki (懐石)**
Refeição tradicional japonesa de múltiplos pratos. Uma expressão culinária do Omotenashi.

## Termos de Melhoria

**Hansei (反省)**
Auto-reflexão. A prática de examinar criticamente o próprio desempenho.

**Muda (無駄)**
Desperdício. Qualquer coisa que não agrega valor.

**Gemba (現場)**
O local real onde o trabalho é feito. No serviço, o gemba é onde o cliente é atendido.

**Nemawashi (根回し)**
Preparação do terreno. Construir consenso antes de implementar mudanças.`,
  },
  {
    title: "Apêndice B: Checklist de Implementação",
    slug: "apendice-b-checklist",
    order: 23,
    content: `# Apêndice B: Checklist de Implementação Omotenashi

## Checklist Diário

### Antes de Iniciar o Atendimento
- [ ] Ambiente limpo e organizado
- [ ] Materiais necessários preparados
- [ ] Uniforme/apresentação pessoal impecável
- [ ] Mentalidade positiva cultivada
- [ ] Meta de encantamento do dia definida

### Durante o Atendimento
- [ ] Saudação calorosa (olho no olho, sorriso genuíno)
- [ ] Uso do nome do cliente
- [ ] Escuta ativa (sem interrupções)
- [ ] Antecipação de necessidades
- [ ] Linguagem corporal positiva
- [ ] Tom de voz acolhedor

### Após o Atendimento
- [ ] Agradecimento sincero
- [ ] Verificação de satisfação
- [ ] Registro de preferências
- [ ] Follow-up se aplicável

## Checklist Semanal

### Equipe
- [ ] Reunião rápida de alinhamento (5 min)
- [ ] Compartilhamento de histórias de sucesso
- [ ] Discussão de desafios e soluções
- [ ] Treinamento de 15 min em um tópico

### Ambiente
- [ ] Limpeza profunda do espaço
- [ ] Verificação de itens de conforto
- [ ] Atualização de materiais informativos
- [ ] Revisão de sinais e comunicação visual

### Clientes
- [ ] Pesquisa de satisfação com 5 clientes
- [ ] Análise de feedback recebido
- [ ] Identificação de cliente para surpreender

## Checklist Mensal

### Métricas
- [ ] Revisão de indicadores de satisfação
- [ ] Comparação com mês anterior
- [ ] Identificação de tendências

### Treinamento
- [ ] Sessão de role-playing em equipe
- [ ] Estudo de caso real
- [ ] Leitura de capítulo do e-book

### Inovação
- [ ] Brainstorming de melhorias
- [ ] Implementação de 1 melhoria (Kaizen)
- [ ] Avaliação de resultados

## Checklist Trimestral

### Estratégia
- [ ] Avaliação geral da jornada do cliente
- [ ] Mapeamento de novos pontos de contato
- [ ] Planejamento de treinamentos avançados
- [ ] Benchmarking com concorrentes

### Cultura
- [ ] Pesquisa de clima organizacional
- [ ] Reconhecimento dos destaques em Omotenashi
- [ ] Revisão de políticas e procedimentos
- [ ] Celebração de conquistas`,
  },
  {
    title: "Apêndice C: Exercícios Práticos",
    slug: "apendice-c-exercicios",
    order: 24,
    content: `# Apêndice C: Exercícios Práticos Omotenashi

## Exercícios Individuais

### Exercício 1: Diário do Omotenashi
Durante 21 dias, registre:
- Uma situação onde você praticou Omotenashi
- Uma situação onde você recebeu Omotenashi
- O que aprendeu com cada experiência

### Exercício 2: Observação Silenciosa
Passe 30 minutos em um estabelecimento (café, loja, restaurante) apenas observando:
- Como os funcionários interagem com clientes
- A linguagem corporal
- Os detalhes do ambiente
- O que poderia ser melhorado

### Exercício 3: Cliente Misterioso
Visite um concorrente como cliente e avalie:
- Atendimento (0-10)
- Ambiente (0-10)
- Antecipação (0-10)
- O que faria diferente usando Omotenashi

### Exercício 4: Carta de Agradecimento
Escreva uma carta de agradecimento genuína para:
- Um cliente que te marcou
- Um colega que te ajudou
- Um mentor que te inspirou

## Exercícios em Equipe

### Role-Playing: Situações Desafiadoras

**Cenário 1: Cliente Irritado**
Um cliente está frustrado com um atraso na entrega. Como você aplica Omotenashi?
1. Ouça sem interromper
2. Valide os sentimentos
3. Peça desculpas genuinamente
4. Apresente solução
5. Acompanhamento

**Cenário 2: Cliente Indeciso**
Cliente não consegue decidir entre produtos. Omotenashi:
1. Identifique a necessidade real
2. Ofereça opções limitadas
3. Dê recomendações honestas
4. Deixe o cliente confortável com a decisão

**Cenário 3: Cliente Especial**
Cliente celebrando aniversário/ocasião especial:
1. Identifique a ocasião
2. Surpreenda com algo especial
3. Envolva a equipe
4. Crie um momento memorável

## Exercícios de Liderança

### Exercício: Mapeamento da Jornada do Cliente
1. Liste todos os pontos de contato com o cliente
2. Para cada ponto, avalie a experiência atual
3. Identifique gaps (diferença entre expectativa e realidade)
4. Crie um plano para preencher cada gap
5. Implemente e meça

### Exercício: Kaizen Semanal
Toda semana, a equipe deve:
1. Identificar 1 processo que pode ser melhorado
2. Sugerir uma melhoria específica
3. Implementar a melhoria
4. Medir o resultado
5. Padronizar se funcionar

## Autoavaliação

### Rating de Práticas Omotenashi
Dê uma nota de 1 a 5 para cada item:

**Antecipação**
- [ ] Percebo necessidades não expressas
- [ ] Preparo-me antes do contato com o cliente
- [ ] Surpreendo clientes positivamente

**Respeito**
- [ ] Trato todos com igual dignidade
- [ ] Uso linguagem respeitosa
- [ ] Respeito o tempo do cliente

**Autenticidade**
- [ ] Meu sorriso é genuíno
- [ ] Eu realmente me importo
- [ ] Não finjo empatia

**Detalhes**
- [ ] Noto pequenos detalhes
- [ ] Cuido da minha apresentação
- [ ] Mantenho o ambiente impecável

**Kaizen**
- [ ] Busco melhorar diariamente
- [ ] Aceito feedback construtivo
- [ ] Aprendo com erros`,
  },
]

export async function GET() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Seed desabilitado em produção" }, { status: 403 })
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    let added = 0
    for (const chapter of additionalChapters) {
      const exists = await prisma.ebookChapter.findUnique({ where: { slug: chapter.slug } })
      if (!exists) {
        await prisma.ebookChapter.create({ data: chapter })
        added++
      }
    }
    return NextResponse.json({ message: `${added} capítulos adicionados com sucesso!` })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao adicionar capítulos" }, { status: 500 })
  }
}
