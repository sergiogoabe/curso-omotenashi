import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Seed desabilitado em produção" }, { status: 403 })
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const adminExists = await prisma.user.findUnique({ where: { email: "admin@omotenashi.com" } })
    if (!adminExists) {
      if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Senha administrativa não configurada" }, { status: 503 })
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
      const admin = await prisma.user.create({
        data: { name: "Admin", email: "admin@omotenashi.com", password: hashedPassword, role: "admin" },
      })
      await prisma.enrollment.upsert({
        where: { id: `admin-enrollment-${admin.id}` },
        create: { userId: admin.id, plan: "individual", active: true },
        update: {},
      })
    } else {
      const existingEnroll = await prisma.enrollment.findFirst({ where: { userId: adminExists.id, active: true } })
      if (!existingEnroll) {
        await prisma.enrollment.create({ data: { userId: adminExists.id, plan: "individual", active: true } })
      }
    }

    const categories = [
      { name: "Fundamentos do Omotenashi", slug: "fundamentos", order: 1 },
      { name: "A Cultura do Atendimento", slug: "cultura-atendimento", order: 2 },
      { name: "Técnicas Avançadas", slug: "tecnicas-avancadas", order: 3 },
      { name: "Implementação nas Empresas", slug: "implementacao", order: 4 },
      { name: "Casos de Sucesso", slug: "casos-sucesso", order: 5 },
      { name: "Omotenashi na Prática", slug: "omotenashi-pratica", order: 6 },
      { name: "Filosofia & Propósito", slug: "filosofia-proposito", order: 7 },
      { name: "Ferramentas Japonesas de Excelência", slug: "ferramentas-excelencia", order: 8 },
    ]

    for (const cat of categories) {
      const exists = await prisma.category.findUnique({ where: { slug: cat.slug } })
      if (!exists) await prisma.category.create({ data: cat })
    }

    const lessons = [
      {
        title: "O que é Omotenashi?",
        slug: "o-que-e-omotenashi",
        description: "Entenda a filosofia japonesa de hospitalidade que vai além do atendimento.",
        categorySlug: "fundamentos",
        order: 1,
        duration: "15:30",
        videoUrl: "https://www.youtube.com/embed/9iSOOfOlpL4",
        content: `# O que é Omotenashi?

Omotenashi (おもてなし) é a filosofia japonesa de hospitalidade que transcende o simples atendimento ao cliente. É uma arte que combina antecipação, respeito genuíno e serviço excepcional.

## A Essência do Omotenashi

Diferente do serviço ocidental, onde o foco está na transação, o Omotenashi é sobre criar uma experiência memorável. Não se trata apenas de satisfazer necessidades, mas de antecipá-las.

### Os 6 Princípios do Omotenashi:

1. **Antecipação (Sakidori)** - Perceber as necessidades antes que sejam expressas
2. **Respeito (Keii)** - Honrar cada pessoa como um convidado especial
3. **Autenticidade (Seijitsu)** - Servir com sinceridade e sem expectativa de retorno
4. **Equilíbrio (Kankei)** - Harmonia entre forma e função
5. **Atenção aos Detalhes (Kiwameru)** - Cada detalhe importa
6. **Melhoria Contínua (Kaizen)** - Sempre buscar aperfeiçoamento

## Omotenashi na Prática

No Japão, o Omotenashi está presente em cada interação:
- O arco respeitoso (ojigi)
- A embalagem cuidadosa de presentes
- A antecipação das necessidades do hóspede
- O silêncio respeitoso quando apropriado

> "Omotenashi não é um serviço, é uma forma de ser." - Masaaki Hirakawa`,
      },
      {
        title: "As Raízes Históricas",
        slug: "raizes-historicas",
        description: "Descubra como a história do Japão moldou a cultura de hospitalidade.",
        categorySlug: "fundamentos",
        order: 2,
        duration: "12:45",
        videoUrl: "https://www.youtube.com/embed/rYs5f8egRMM",
        content: `# As Raízes Históricas do Omotenashi

A cultura do Omotenashi tem origens profundas na história japonesa, remontando ao período Heian (794-1185) e evoluindo através dos séculos.

## Período Heian: O Nascimento da Estética

### A Cerimônia do Chá (Sado)
A cerimônia do chá, desenvolvida por Sen no Rikyu no século XVI, é a expressão máxima do Omotenashi. Cada gesto, cada movimento é calculado para criar harmonia.

### O Caminho do Guerreiro (Bushido)
Os samurais também influenciaram o Omotenashi através do bushido - o código de honra que enfatizava:
- Lealdade
- Respeito
- Honra
- Autodisciplina`,
      },
      {
        title: "Omotenashi vs Atendimento Ocidental",
        slug: "omotenashi-vs-ocidental",
        description: "Compare as diferenças fundamentais entre as abordagens oriental e ocidental.",
        categorySlug: "fundamentos",
        order: 3,
        duration: "18:20",
        videoUrl: "https://www.youtube.com/embed/qZsdm0RZ18k",
        content: `# Omotenashi vs Atendimento Ocidental

## Diferenças Fundamentais

### Abordagem Ocidental
- Foco na transação
- Serviço baseado em regras
- Expectativa de gorjeta
- Eficiência acima de tudo
- Satisfação do cliente mensurável

### Abordagem Japonesa (Omotenashi)
- Foco na experiência
- Serviço baseado em antecipação
- Serviço sem expectativa de retorno
- Harmonia acima de eficiência
- Encantamento do cliente

## Por que o Omotenashi é Superior para Negócios

Estudos mostram que clientes que experimentam o Omotenashi:
1. Têm 3x mais fidelidade à marca
2. Gastam 40% mais em média
3. Recomendam para 5x mais pessoas`,
      },
      {
        title: "Omotenashi no Brasil",
        slug: "omotenashi-brasil",
        description: "Como adaptar a filosofia japonesa à cultura brasileira.",
        categorySlug: "fundamentos",
        order: 4,
        duration: "14:10",
        videoUrl: "https://www.youtube.com/embed/WWi8_ltGkb0",
        content: `# Omotenashi no Brasil

## Adaptação Cultural

O Brasil tem características únicas que podem potencializar o Omotenashi:
- Calor humano natural
- Criatividade
- Flexibilidade
- Alegria no atendimento

## O Jeitinho Brasileiro + Omotenashi

A combinação do jeitinho brasileiro com a disciplina japonesa cria uma experiência de atendimento poderosa.`,
      },
      {
        title: "Os 5 Sentidos do Atendimento",
        slug: "5-sentidos-atendimento",
        description: "Aprenda a engajar todos os sentidos do cliente.",
        categorySlug: "cultura-atendimento",
        order: 1,
        duration: "16:00",
        videoUrl: "https://www.youtube.com/embed/7GbNnmRmXpM",
        content: `# Os 5 Sentidos do Atendimento

O Omotenashi engaja todos os 5 sentidos para criar uma experiência completa.

## Visão
- Ambiente limpo e organizado
- Apresentação impecável
- Iluminação adequada

## Audição
- Música ambiente apropriada
- Tom de voz acolhedor
- Silêncio respeitoso

## Olfato
- Aromas agradáveis
- Ausência de odores desagradáveis

## Paladar
- Oferecimento de água/chá
- Pequenos mimos

## Tato
- Texturas agradáveis
- Temperatura ambiente confortável`,
      },
      {
        title: "A Linguagem do Respeito",
        slug: "linguagem-respeito",
        description: "Domine a comunicação respeitosa japonesa (Keigo).",
        categorySlug: "cultura-atendimento",
        order: 2,
        duration: "20:15",
        videoUrl: "https://www.youtube.com/embed/qZsdm0RZ18k",
        content: `# A Linguagem do Respeito (Keigo)

O Keigo é o sistema honorífico da língua japonesa que expressa respeito e hierarquia.

## Três Níveis do Keigo

1. **Teineigo (Polido)** - Forma educada padrão
2. **Sonkeigo (Respeitoso)** - Eleva a posição do outro
3. **Kenjougo (Humilde)** - Rebaixa a própria posição

## Aplicação no Atendimento

### Frases Essenciais para Atendimento:
- "Irasshaimase!" (Bem-vindo!)
- "Kashikomarimashita" (Com certeza / Entendi)
- "Osoreirimasu ga..." (Com licença / Desculpe incomodar)

## Como Adaptar ao Português

No contexto brasileiro, podemos adaptar:
- Tratar o cliente por "senhor/senhora"
- Usar linguagem formal
- Expressar gratidão genuína`,
      },
      {
        title: "A Arte de se Curvar",
        slug: "arte-curvar",
        description: "O significado dos diferentes tipos de saudação japonesa.",
        categorySlug: "cultura-atendimento",
        order: 3,
        duration: "10:30",
        videoUrl: "https://www.youtube.com/embed/rYs5f8egRMM",
        content: `# A Arte de se Curvar (Ojigi)

O ojigi é uma forma de arte no Japão. Cada tipo de curva tem um significado específico.

## Tipos de Ojigi

1. **Eshaku (15°)** - Curva casual para conhecidos
2. **Keirei (30°)** - Curva formal para clientes
3. **Saikeirei (45°)** - Curva de profundo respeito
4. **Dogiza** - Curva de desculpas (mais rara)

## Aplicação no Contexto Brasileiro

No Brasil, podemos adaptar:
- Inclinação leve da cabeça
- Contato visual respeitoso
- Postura corporal aberta`,
      },
      {
        title: "Antecipação de Necessidades",
        slug: "antecipacao-necessidades",
        description: "Técnicas para prever e superar expectativas.",
        categorySlug: "tecnicas-avancadas",
        order: 1,
        duration: "22:00",
        videoUrl: "https://www.youtube.com/embed/7GbNnmRmXpM",
        content: `# Antecipação de Necessidades

A verdadeira essência do Omotenashi está em antecipar as necessidades do cliente antes mesmo que ele as perceba.

## O Modelo Kano

O Professor Noriaki Kano desenvolveu um modelo para categorizar atributos de qualidade:

1. **Atributos Básicos** - Esperados, não encantam se presentes
2. **Atributos de Desempenho** - Quanto mais melhor
3. **Atributos de Encantamento** - Inesperados, criam delight

## Técnicas de Antecipação

### Observação Ativa
- Linguagem corporal do cliente
- Padrões de comportamento
- Preferências expressas e não-expressas

### Preparação
- Conhecer o histórico do cliente
- Preparar o ambiente
- Treinar a equipe para diferentes cenários

### Checklist de Antecipação
- [ ] Cliente está confortável?
- [ ] Precisa de informações adicionais?
- [ ] Há algo que podemos preparar antes?
- [ ] O ambiente está adequado?`,
      },
      {
        title: "Omotenashi Digital",
        slug: "omotenashi-digital",
        description: "Aplique a filosofia japonesa no atendimento online.",
        categorySlug: "tecnicas-avancadas",
        order: 2,
        duration: "17:45",
        videoUrl: "https://www.youtube.com/embed/9iSOOfOlpL4",
        content: `# Omotenashi Digital

Como levar a filosofia Omotenashi para o ambiente digital.

## Princípios do Omotenashi Digital

1. **Antecipação Digital** - Prever dúvidas e necessidades online
2. **Resposta Ágil** - Tempo de resposta é respeito
3. **Personalização** - Tratar cada cliente como único
4. **Experiência Fluida** - Navegação intuitiva

## Implementação

### Chatbots com Alma
- Não apenas respostas automáticas
- Tom de voz acolhedor
- Escalonamento inteligente

### E-mail Marketing Omotenashi
- Conteúdo relevante
- Frequência respeitosa
- Design cuidadoso

### Redes Sociais
- Responda sempre
- Agradeça menções
- Antecipe crises`,
      },
      {
        title: "Treinamento de Equipe",
        slug: "treinamento-equipe",
        description: "Metodologia para treinar sua equipe na cultura Omotenashi.",
        categorySlug: "implementacao",
        order: 1,
        duration: "25:00",
        videoUrl: "https://www.youtube.com/embed/qZsdm0RZ18k",
        content: `# Treinamento de Equipe no Omotenashi

## Programa de 5 Semanas

### Semana 1: Fundamentos
- Filosofia Omotenashi
- História e cultura japonesa
- Por que isso importa para os negócios

### Semana 2: Técnicas de Atendimento
- Postura e linguagem corporal
- Comunicação respeitosa
- Antecipação de necessidades

### Semana 3: Prática Simulada
- Role-playing de situações reais
- Feedback em tempo real
- Ajustes e melhorias

### Semana 4: Implementação
- Aplicação no dia a dia
- Métricas de avaliação
- Acompanhamento

### Semana 5: Cultura Contínua (Kaizen)
- Melhoria contínua
- Compartilhamento de experiências
- Reconhecimento e celebração`,
      },
      {
        title: "Métricas do Omotenashi",
        slug: "metricas-omotenashi",
        description: "Como medir o sucesso da implementação.",
        categorySlug: "implementacao",
        order: 2,
        duration: "13:30",
        videoUrl: "https://www.youtube.com/embed/WWi8_ltGkb0",
        content: `# Métricas do Omotenashi

## KPIs Tradicionais vs Omotenashi

### KPIs Tradicionais
- NPS (Net Promoter Score)
- CSAT (Customer Satisfaction)
- Tempo médio de atendimento

### KPIs Omotenashi
- Índice de Encantamento
- Taxa de Antecipação
- Profundidade do Relacionamento
- Memória Afetiva

## Ferramentas de Medição

1. **Pesquisa Pós-Atendimento** (24h depois)
2. **Entrevistas em Profundidade** (trimestral)
3. **Análise de Sentimento** (redes sociais)
4. **Mystery Shopper** (Omotenashi assessment)`,
      },
      {
        title: "Casos: Empresas que Aplicam Omotenashi",
        slug: "casos-sucesso-empresas",
        description: "Exemplos reais de empresas que transformaram seu atendimento.",
        categorySlug: "casos-sucesso",
        order: 1,
        duration: "19:00",
        videoUrl: "https://www.youtube.com/embed/7GbNnmRmXpM",
        content: `# Casos de Sucesso: Empresas Omotenashi

## 1. The Ritz-Carlton (EUA)
A rede de hotéis adaptou o Omotenashi ao seu "Gold Standards":
- "Ladies and Gentlemen serving Ladies and Gentlemen"
- Autonomia do funcionário para resolver problemas
- Antecipação de desejos dos hóspedes

## 2. Japan Airlines
- Check-in com reverência
- Bagagem tratada como objeto precioso
- A bordo, hospitalidade incomparável

## 3. Nissan Motor Corporation
- Atendimento em concessionárias
- Pós-venda excepcional
- Relacionamento de longo prazo

## 4. Casos Brasileiros
- Rede de hotéis Brasil: implementação do "Jeitinho Omotenashi"
- Restaurantes: fusão da culinária brasileira com serviço japonês
- Call centers: atendimento humanizado com técnicas japonesas`,
      },
      {
        title: "Transformação Cultural",
        slug: "transformacao-cultural",
        description: "Como promover uma mudança cultural duradoura na organização.",
        categorySlug: "implementacao",
        order: 3,
        duration: "21:15",
        videoUrl: "https://www.youtube.com/embed/rYs5f8egRMM",
        content: `# Transformação Cultural para o Omotenashi

## Os 7 Passos da Transformação

1. **Compromisso da Liderança** - Começa do topo
2. **Diagnóstico Cultural** - Entender o estado atual
3. **Visão Compartilhada** - Criar propósito comum
4. **Treinamento Imersivo** - Vivenciar o Omotenashi
5. **Implementação Gradual** - Mudança sustentável
6. **Reforço Contínuo** - Kaizen (melhoria contínua)
7. **Celebração e Reconhecimento** - Valorizar avanços

## Superando Resistências

### Barreiras Comuns
- "Isso não funciona no Brasil"
- "Custa caro"
- "Não temos tempo"

### Como Superar
- Dados e cases de sucesso
- Implementação piloto
- Resultados rápidos (quick wins)`,
      },
      // === NOVAS AULAS ===
      {
        title: "5 Gestos Omotenashi para Aplicar Hoje",
        slug: "5-gestos-omotenashi",
        description: "Roteiro de vídeo: cinco ações práticas para implementar imediatamente no seu atendimento.",
        categorySlug: "omotenashi-pratica",
        order: 1,
        duration: "12:00",
        videoUrl: "https://www.youtube.com/embed/8BPK-iV0yaA",
        content: `# 5 Gestos Omotenashi para Aplicar Hoje

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Você sabia que existem gestos simples do Omotenashi que você pode começar a aplicar hoje mesmo? Não precisa de meses de treinamento. Cinco gestos que vão transformar seu atendimento."

[GESTO 1: O OSHIBORI DIGITAL - 1:30]
"Oshibori é aquela toalhinha quente ou fria que os restaurantes japoneses oferecem. No digital, seu 'oshibori' é antecipar a dúvida do cliente. Quando ele entra no seu site, você já tem um FAQ inteligente, um chatbot que oferece ajuda antes do pedido. É o mesmo princípio: oferecer conforto antes que a pessoa precise pedir."

[GESTO 2: A REVERÊNCIA DE 15 GRAUS - 3:30]
"Eshaku é a curva de 15 graus que os japoneses fazem para conhecidos. No atendimento presencial, é o contato visual com sorriso genuíno nos primeiros 3 segundos. Estudos mostram que a primeira impressão se forma em 7 segundos. Um sorriso verdadeiro e contato visual dizem: você é importante."

[GESTO 3: O IRASHAIMASE - 5:30]
"Irasshaimase significa 'bem-vindo'. Mas não é só um 'oi'. É dito com energia, com presença. No telefone, é atender antes do terceiro toque. No chat, é responder em menos de 30 segundos. A velocidade da saudação mostra o valor que você dá ao cliente."

[GESTO 4: A ANTECIPAÇÃO - 7:30]
"O cliente entra na loja procurando algo. Antes que ele pergunte 'vocês têm...', você já oferece. 'Bom dia! Seja bem-vindo. Se está procurando [categoria], temos opções aqui à direita.' Isso é antecipação. Você observou, preparou-se e agiu. O cliente sente-se visto."

[GESTO 5: O AGRADECIMENTO GENUÍNO - 9:30]
"No Japão, o agradecimento não é automático. É feito com os olhos nos olhos, com uma leve inclinação. No seu negócio, é o 'obrigado' dito com pausa, com nome do cliente. 'João, muito obrigado pela sua visita. Foi um prazer atender você.' Não 'volte sempre'. Mas 'será um prazer recebê-lo novamente'."

[ENCERRAMENTO - 11:00]
"Cinco gestos. Você pode começar amanhã. Qual deles você vai implementar primeiro? Me conta nos comentários."`,
      },
      {
        title: "Treinando a Antecipação no Dia a Dia",
        slug: "treinando-antecipacao",
        description: "Roteiro de vídeo: exercícios práticos para desenvolver o hábito de antecipar necessidades.",
        categorySlug: "omotenashi-pratica",
        order: 2,
        duration: "14:00",
        videoUrl: "https://www.youtube.com/embed/8BPK-iV0yaA",
        content: `# Treinando a Antecipação no Dia a Dia

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Antecipação é a habilidade mais importante do Omotenashi. Mas como treinar isso? Não nascemos sabendo ler mentes. A boa notícia: antecipação se aprende. Vou te mostrar 5 exercícios."

[EXERCÍCIO 1: OBSERVAÇÃO SILENCIOSA - 1:30]
"Vá a um café. Sente-se por 30 minutos apenas observando. O que o barista faz antes do cliente pedir? Ele já coloca o guardanapo? Já pergunta se é para viagem? Observe padrões. Anote. Depois volte ao seu trabalho e pergunte: o que posso observar nos meus clientes?"

[EXERCÍCIO 2: MAPEAMENTO DA JORNADA - 4:00]
"Pegue uma folha e desenhe cada passo que seu cliente dá desde que entra até sair. Em cada passo, pergunte: o que ele está sentindo? O que ele precisa agora? O que vai precisar no próximo passo? Isso é treino de antecipação."

[EXERCÍCIO 3: O JOGO DOS PORQUÊS - 6:30]
"Pergunte 'por quê?' 5 vezes para cada reclamação. Cliente reclamou da demora? Por quê? Porque faltou funcionário. Por quê? Porque não previram o horário de pico. Pronto. Você acabou de antecipar a causa raiz."

[EXERCÍCIO 4: SIMULAÇÃO DE CENÁRIOS - 9:00]
"Toda segunda-feira, reúna a equipe por 10 minutos. Um cenário: 'Cliente chega com criança chorando.' O que fazer? 'Cliente idoso com dificuldade de locomoção.' O que preparar? Simular é treinar o cérebro para antecipar."

[EXERCÍCIO 5: O DIÁRIO DO OMOTENASHI - 11:30]
"Peça para cada funcionário registrar um momento por dia onde antecipou algo. Não precisa ser grande. 'Percebi que o cliente estava com frio e ofereci um café quente.' Isso reforça o hábito. Em 21 dias, vira automático."

[ENCERRAMENTO - 13:00]
"Antecipação é um músculo. Qual exercício você vai começar hoje?"`,
      },
      {
        title: "Omotenashi no Atendimento Digital",
        slug: "omotenashi-atendimento-digital",
        description: "Roteiro de vídeo: como aplicar a filosofia japonesa em canais digitais, chatbots e redes sociais.",
        categorySlug: "omotenashi-pratica",
        order: 3,
        duration: "13:00",
        videoUrl: "https://www.youtube.com/embed/IdMf9kfL6pA",
        content: `# Omotenashi no Atendimento Digital

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Omotenashi no digital? Mas como? Se a essência é o contato humano? A resposta: o digital não elimina o humano. Ele amplifica. Se bem feito, o atendimento digital pode ser tão acolhedor quanto uma ryokan japonesa."

[PRINCÍPIO 1: ANTECIPAÇÃO DIGITAL - 1:30]
"No Japão, a porta do táxi abre sozinha. No digital, é o chatbot que oferece ajuda antes do pedido. É o site que lembra suas preferências. É o email que chega com a informação certa no momento certo. Antecipação digital é preparar o terreno."

[PRINCÍPIO 2: RESPEITO AO TEMPO - 4:00]
"No mundo digital, tempo é respeito. Um estudo da Google mostra que 53% dos usuários abandonam um site que demora mais de 3 segundos para carregar. Seu tempo de resposta no WhatsApp é seu omotenashi digital. Responder em menos de 1 minuto é o novo 'irasshaimase'."

[PRINCÍPIO 3: PERSONALIZAÇÃO - 6:30]
"A cerimônia do chá é personalizada para cada convidado. Cada tigela é escolhida pensando na pessoa. No digital: 'Olá, João! Vi que você comprou [produto] mês passado. Como está sendo a experiência?' Isso é ver o cliente como indivíduo."

[PRINCÍPIO 4: TRANSPARÊNCIA - 9:00]
"Omotenashi significa 'nada a esconder'. No digital, é ser transparente: prazos reais, políticas claras, preços sem taxas escondidas. Clientes confiam mais em empresas que mostram a 'cozinha aberta'."

[PRINCÍPIO 5: SURPRESA DIGITAL - 11:00]
"Um brinde inesperado. Um desconto de aniversário. Um conteúdo exclusivo. São os pequenos gestos digitais que criam encantamento. Lembre-se: no digital, o detalhe é o que diferencia."

[ENCERRAMENTO - 12:30]
"Omotenashi digital não é sobre tecnologia. É sobre intenção. Como você pode aplicar esses 5 princípios hoje no seu canal digital?"`,
      },
      {
        title: "Os 7 Princípios do Anfitrião",
        slug: "7-principios-anfitriao",
        description: "Roteiro de vídeo: a filosofia do anfitrião japonês e como aplicá-la na liderança.",
        categorySlug: "filosofia-proposito",
        order: 1,
        duration: "15:00",
        videoUrl: "https://www.youtube.com/embed/8BPK-iV0yaA",
        content: `# Os 7 Princípios do Anfitrião

## Roteiro de Vídeo

[ABERTURA - 0:00]
"No Japão, o anfitrião não é quem serve. É quem honra. Honra o convidado, honra o espaço, honra o momento. Existem 7 princípios que guiam o verdadeiro anfitrião Omotenashi."

[1. ICHIGO ICHIE - CADA ENCONTRO É ÚNICO - 1:30]
"Um encontro, uma oportunidade. Cada cliente que entra pela sua porta hoje nunca mais estará exatamente igual. Trate cada interação como se fosse a única chance de causar uma impressão. Porque, de certa forma, é."

[2. OMOTE-URA NASHI - NADA A ESCONDER - 3:30]
"Autenticidade total. O que você mostra é o que você é. Sem fachada, sem fingimento. Clientes percebem quando um sorriso é genuíno ou ensaiado. O anfitrião verdadeiro não representa um papel — ele é."

[3. KIKUBARI - ATENÇÃO QUE ANTECEDE - 5:30]
"Kikubari é a arte de perceber. O vento que entra pela janela e o cliente que sentiu frio. A mesa que balança e o cliente que vai apoiar o braço. Um bom anfitrião já resolveu o problema antes que o cliente perceba que existe."

[4. MA - O SILÊNCIO SIGNIFICATIVO - 7:30]
"No Ocidente, silêncio é desconfortável. No Japão, ma é o espaço entre as notas que faz a música. É saber esperar. Não interromper. Dar espaço para o cliente pensar, escolher, falar. Pressa é falta de respeito."

[5. WA - HARMONIA - 9:30]
"Wa é a harmonia que equilibra tudo. O anfitrião busca o equilíbrio entre atender sem invadir, entre servir sem humilhar, entre estar presente sem ser sufocante. Harmonia é o fio invisível que conecta anfitrião e convidado."

[6. KANSHA - GRATIDÃO GENUÍNA - 11:30]
"Kansha é gratidão. Não o 'obrigado' automático. Mas a gratidão genuína por cada pessoa que escolheu estar ali. Um estudo da Harvard Business Review mostra que clientes que se sentem genuinamente apreciados têm 3x mais chances de recomendar."

[7. KAIZEN - MELHORIA CONTÍNUA - 13:30]
"O anfitrião nunca está satisfeito. Não por insatisfação, mas por busca de excelência. Cada atendimento é uma chance de melhorar 1%. 1% melhor a cada dia = 37x melhor em um ano."

[ENCERRAMENTO - 14:30]
"Qual desses 7 princípios você vai levar para o seu trabalho amanhã?"`,
      },
      {
        title: "Liderança Servidora ao Estilo Japonês",
        slug: "lideranca-servidora",
        description: "Roteiro de vídeo: como líderes podem praticar o Omotenashi com suas equipes.",
        categorySlug: "filosofia-proposito",
        order: 2,
        duration: "14:30",
        videoUrl: "https://www.youtube.com/embed/IdMf9kfL6pA",
        content: `# Liderança Servidora ao Estilo Japonês

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Omotenashi não é só para clientes. O verdadeiro Omotenashi começa dentro de casa. Com sua equipe. Um líder que não pratica Omotenashi com seus funcionários jamais conseguirá que eles pratiquem com os clientes."

[O LÍDER COMO ANFITRIÃO - 1:30]
"Se você é líder, sua equipe é seu convidado. Você prepara o ambiente para eles trabalharem? Antecipa as necessidades deles? Cria um espaço seguro? Líderes que tratam suas equipes como hóspedes criam culturas de serviço excepcionais."

[ANTECIPAÇÃO COM A EQUIPE - 4:00]
"Um bom líder percebe antes: fulano está sobrecarregado, siclano está desmotivado, beltrano está com problemas pessoais. O Omotenashi na liderança é oferecer suporte antes do pedido. 'Percebi que você tem trabalhado até tarde. Precisa de ajuda?' Isso constrói confiança."

[O SILÊNCIO QUE ESCUTA - 6:30]
"O líder japonês pratica o ma — o silêncio que escuta. Em reuniões, não interrompe. Deixa o espaço para os outros falarem. Pergunta e espera. A pressa nas decisões é inimiga da sabedoria coletiva."

[RECONHECIMENTO GENUÍNO - 9:00]
"Kansha com a equipe. Não é o 'bom trabalho' genérico. É específico. 'João, percebi como você lidou com aquele cliente difícil com paciência. Seu tom de voz fez toda a diferença.' Reconhecimento específico alimenta o espírito Omotenashi."

[CRIANDO O CICLO VIRTUOSO - 11:30]
"Líder trata equipe com Omotenashi → Equipe se sente valorizada → Equipe trata clientes com Omotenashi → Clientes satisfeitos → Negócio cresce → Líder tem mais recursos para cuidar da equipe. É um ciclo virtuoso."

[ENCERRAMENTO - 13:30]
"Como você pode ser um anfitrião para sua equipe amanhã?"`,
      },
      {
        title: "Criando a Cultura Omotenashi na Sua Empresa",
        slug: "criando-cultura-omotenashi",
        description: "Roteiro de vídeo: plano passo a passo para implementar a cultura de hospitalidade japonesa.",
        categorySlug: "filosofia-proposito",
        order: 3,
        duration: "16:00",
        videoUrl: "https://www.youtube.com/embed/8BPK-iV0yaA",
        content: `# Criando a Cultura Omotenashi na Sua Empresa

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Cultura não se decreta. Se cultiva. Como uma cerimônia do chá que leva meses para ser planejada. Criar uma cultura Omotenashi na sua empresa não acontece da noite para o dia. Mas existe um caminho. Vou te mostrar o passo a passo."

[PASSO 1: DIAGNÓSTICO - 1:30]
"Antes de mudar, entenda onde você está. Faça um diagnóstico de maturidade Omotenashi da sua empresa. Pontos fortes? Gargalos? Eu uso uma matriz de 8 dimensões: ambiente, atendimento, antecipação, empatia, recuperação de erros, personalização, gratidão e kaizen."

[PASSO 2: COMPROMISSO DA LIDERANÇA - 4:00]
"Cultura vem do topo. Se o dono ou CEO não vive o Omotenashi, não adianta treinar a equipe. O líder precisa ser o primeiro anfitrião. As equipes espelham o comportamento dos líderes."

[PASSO 3: TREINAMENTO IMERSIVO - 6:30]
"Não é uma palestra de 2 horas. É um programa de 5 semanas com vídeos, exercícios, simulações e feedback. O curso Omotenashi que você está assistindo agora é parte desse processo."

[PASSO 4: RITUAIS DIÁRIOS - 9:00]
"Cultura se mantém com rituais. Reunião de 5 minutos toda manhã: 'Qual gesto Omotenashi vamos focar hoje?' Quadro de registro no paredão: 'Hoje antecipei...' Pequenos rituais diários sustentam a transformação."

[PASSO 5: MÉTRICAS DE OMOTENASHI - 11:30]
"O que não é medido não é gerenciado. Crie o IEO — Índice de Experiência Omotenashi. Uma pesquisa simples de 3 perguntas que cada cliente responde ao final do atendimento: 1) Se sentiu especial? 2) Anteciparam suas necessidades? 3) Recomendaria?"

[PASSO 6: CELEBRAÇÃO - 14:00]
"Quando um funcionário faz um gesto Omotenashi excepcional, celebre. Pode ser um quadro 'Mural do Omotenashi', um reconhecimento na reunião, um café especial. O que é celebrado se repete."

[ENCERRAMENTO - 15:30]
"Criar cultura leva tempo. Mas cada pequeno gesto conta. Qual passo você vai dar esta semana?"`,
      },
      // === NOVAS AULAS: FERRAMENTAS JAPONESAS DE EXCELÊNCIA ===
      {
        title: "Os 5S: Organização que Transforma",
        slug: "5s-organizacao-transforma",
        description: "A metodologia japonesa dos 5S — Seiri, Seiton, Seiso, Seiketsu, Shitsuke — e como ela cria a base para o Omotenashi.",
        categorySlug: "ferramentas-excelencia",
        order: 1,
        duration: "18:00",
        videoUrl: "https://www.youtube.com/embed/9iSOOfOlpL4",
        content: `# Os 5S: Organização que Transforma

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Você já entrou em um estabelecimento e sentiu que tudo estava no lugar certo? Que o ambiente respirava organização? Isso não é acaso. É 5S. Uma metodologia japonesa que é a base de toda excelência — inclusive do Omotenashi."

[O QUE SÃO OS 5S - 1:30]
"Os 5S são cinco palavras japonesas que começam com S: Seiri, Seiton, Seiso, Seiketsu, Shitsuke. Criadas no pós-guerra japonês como parte do Sistema Toyota de Produção, hoje são aplicadas em todo mundo — de hospitais a hotéis, de escritórios a restaurantes."

[SEIRI — UTILIZAÇÃO - 3:30]
"Seiri significa separar o necessário do desnecessário. No seu balcão, na sua cozinha, no seu estoque. Pergunte: isso é realmente usado? Se não for usado nos últimos 30 dias, vá para o descarte, doação ou arquivo morto. Um ambiente sem excessos permite que o cliente sinta leveza. Excesso de objetos polui a experiência."

[SEITON — ORDENAÇÃO - 6:00]
"Seiton é 'cada coisa em seu lugar'. Não basta tirar o que não serve — é preciso organizar o que fica. Defina lugares fixos para cada item. Padronize. Use etiquetas, divisórias, cores. Um cliente que vê um balcão desorganizado inconscientemente duvida da qualidade do serviço. Organização visual transmite competência."

[SEISO — LIMPEZA - 8:30]
"Seiso é limpeza, mas não é só varrer o chão. É inspecionar enquanto limpa. É encontrar o pequeno parafuso solto, a mancha na parede, o cabo desgastado. No Japão, a limpeza é considerada uma forma de meditação. Um ambiente impecável é o primeiro gesto de respeito ao cliente."

[SEIKETSU — PADRONIZAÇÃO - 11:00]
"Seiketsu é criar padrões para manter os três primeiros S. Checklist diário? Quem faz o quê em cada horário? Como saber se o padrão está sendo seguido? Crie fotos do 'estado ideal' de cada área. Pendure na parede. Treine a equipe para que todos enxerguem o mesmo padrão."

[SHITSUKE — DISCIPLINA - 13:30]
"Shitsuke é o mais difícil: disciplina para manter. Não é punição — é autorresponsabilidade. É cada membro da equipe cuidar do próprio espaço sem precisar de supervisão. No Japão, as crianças aprendem na escola a limpar a própria sala. No Brasil, precisamos construir essa cultura com treinamento e exemplo."

[5S + OMOTENASHI - 15:30]
"Como os 5S se conectam com o Omotenashi? A resposta é simples: você não pode oferecer hospitalidade excepcional em um ambiente caótico. A organização dos 5S cria a base física para que a antecipação, o respeito e a atenção aos detalhes possam florescer. É a fundação sobre a qual o Omotenashi é construído."

[CHECKLIST PRÁTICO - 16:30]
"Comece amanhã: escolha uma área do seu estabelecimento. Aplique Seiri: tire tudo. Seiton: coloque cada coisa em seu lugar. Seiso: limpe profundamente. Depois, tire uma foto e compare com a de 30 dias. Você vai se surpreender."

[ENCERRAMENTO - 17:30]
"5S não é um projeto de uma semana. É uma cultura diária. Mas os resultados aparecem rápido: equipe mais motivada, menos retrabalho, clientes que percebem o cuidado. Qual S você vai implementar amanhã?"`,
      },
      {
        title: "Kaizen na Prática: O Poder da Melhoria Contínua",
        slug: "kaizen-melhoria-continua",
        description: "A filosofia Kaizen de melhoria contínua aplicada ao atendimento, gestão e cultura empresarial.",
        categorySlug: "ferramentas-excelencia",
        order: 2,
        duration: "20:00",
        videoUrl: "https://www.youtube.com/embed/rYs5f8egRMM",
        content: `# Kaizen na Prática: O Poder da Melhoria Contínua

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Kaizen: duas palavras japonesas que significam 'mudança para melhor'. KAI = mudar, ZEN = bom. Mas o Kaizen é muito mais que isso. É a filosofia que transformou a Toyota em uma das maiores empresas do mundo e pode transformar seu atendimento também."

[O QUE É KAIZEN - 1:30]
"Diferente do Ocidente, onde buscamos inovações revolucionárias, o Kaizen acredita no poder de pequenas melhorias diárias. Melhorar 1% a cada dia. Isso parece pouco? Ao final de um ano, 1% ao dia significa 37 vezes melhor. Grandes resultados vêm de pequenas mudanças consistentes."

[KAIZEN NO ATENDIMENTO - 4:00]
"Como aplicar Kaizen no atendimento? Reúna sua equipe por 5 minutos toda manhã. Pergunte: 'O que podemos fazer hoje melhor que ontem?' Pode ser: 'Hoje vamos lembrar de perguntar o nome de cada cliente.' Ou 'Vamos oferecer água para quem está esperando.' Pequenas mudanças que criam uma cultura de excelência."

[OS 3 PRINCÍPIOS DO KAIZEN - 6:30]
"Princípio 1: Processo e Resultado — não foque apenas no resultado, foque em melhorar o processo. Se o processo é bom, o resultado virá.

Princípio 2: Cliente Interno e Externo — o Kaizen não se aplica só ao cliente final. Aplique ao colega ao lado. Sua equipe é seu cliente interno. Trate bem quem trabalha com você.

Princípio 3: Gerenciamento pela Qualidade Total — qualidade é responsabilidade de todos, não apenas do supervisor ou do dono."

[AS 5 PERGUNTAS DO KAIZEN - 9:30]
"Para cada problema, faça 5 perguntas:

1. O que está acontecendo? (fato, não opinião)
2. Por que isso acontece? (causa imediata)
3. Por que essa causa existe? (causa raiz)
4. O que podemos fazer para eliminar essa causa? (ação corretiva)
5. Como garantir que não volte? (padronização)

Isso se chama 'Os 5 Porquês' — uma técnica poderosa para chegar à causa raiz."

[MELHORIA CONTÍNUA vs INOVAÇÃO - 12:30]
"Inovação é um relâmpago — rara, brilhante, transformadora. Kaizen é a chuva fina — constante, persistente, que fertiliza o solo. Você precisa de ambos. Mas a maioria das empresas espera o relâmpago e esquece de regar o jardim todos os dias."

[KAIZEN E O CICLO PDCA - 15:00]
"O Kaizen opera através do ciclo PDCA: Plan (planejar), Do (fazer), Check (verificar), Act (agir). Primeiro você planeja a melhoria. Depois implementa em pequena escala. Verifica se funcionou. E padroniza se deu certo. Aí começa de novo."

[EXEMPLO PRÁTICO - 17:00]
"Um restaurante percebeu que clientes esperavam 15 minutos para sobremesa. Kaizen: na primeira semana, mediram o tempo exato. Segunda semana, pré-posicionaram os ingredientes. Terceira semana treinaram um garçom específico para sobremesas. Quarta semana: tempo caiu para 4 minutos. Pequenos passos, grande resultado."

[ENCERRAMENTO - 19:00]
"Kaizen não é uma ferramenta, é uma mentalidade. Não é um evento, é um estilo de vida. O que você pode melhorar 1% hoje no seu atendimento?"`,
      },
      {
        title: "PDCA: O Ciclo Japonês da Excelência",
        slug: "pdca-ciclo-excelencia",
        description: "Aprenda o ciclo PDCA (Plan-Do-Check-Act) e como aplicá-lo para elevar a qualidade do serviço.",
        categorySlug: "ferramentas-excelencia",
        order: 3,
        duration: "15:00",
        videoUrl: "https://www.youtube.com/embed/7GbNnmRmXpM",
        content: `# PDCA: O Ciclo Japonês da Excelência

## Roteiro de Vídeo

[ABERTURA - 0:00]
"PDCA parece nome de sigla burocrática, mas é uma das ferramentas mais poderosas que o Japão nos ensinou. Plan, Do, Check, Act. Planejar, Fazer, Verificar, Agir. Quatro passos simples que, quando repetidos, criam excelência."

[POR QUE PDCA FUNCIONA - 1:30]
"O PDCA funciona porque ele substitui o 'tentar e torcer' pelo método científico aplicado à gestão. Em vez de 'vamos ver no que dá', você testa, mede e ajusta. É assim que hospitais japoneses têm taxas de infecção quase zero. É assim que hotéis em Tóquio mantêm avaliação impecável."

[P — PLAN (PLANEJAR) - 3:30]
"Antes de agir, planeje. Defina: Qual é o problema? Qual é a meta? Como vamos medir? O que vamos testar?

Por exemplo: 'Clientes esperam 8 minutos para serem atendidos. Nossa meta é reduzir para 3 minutos. Vamos medir com planilha. Vamos testar um novo fluxo de recepção.'

Planejar bem é 50% do sucesso. Se você planeja mal, executa bem o plano errado."

[D — DO (FAZER) - 6:00]
"Agora execute o plano. Mas em pequena escala. Não mude tudo de uma vez. Teste em um horário, com uma equipe, em um dia. Implemente o novo fluxo de recepção apenas no almoço de quinta-feira.

Importante: documente tudo. O que deu certo, o que deu errado, o que aconteceu de inesperado. Sem documentação, o aprendizado se perde."

[C — CHECK (VERIFICAR) - 8:00]
"Verifique os resultados. Compare com a meta. Os dados não mentem. O tempo caiu para 3 minutos? Ótimo. Caiu para 5? Bom, mas não o suficiente. Aumentou para 10? Algo deu errado.

O Check é o passo mais negligenciado — todo mundo planeja e faz, mas poucos param para verificar. Sem verificação, você repete erros."

[A — ACT (AGIR) - 10:00]
"Aqui mora a magia. Se funcionou: padronize. Crie um novo procedimento. Treine a equipe. Faça parte do manual. Se não funcionou: ajuste e tente de novo. O 'Act' não é desistir — é aprender e recomeçar o ciclo.

O PDCA não termina nunca. Quando você padroniza uma melhoria, já começa a planejar a próxima."

[PDCA + OMOTENASHI - 12:00]
"Como o PDCA se aplica ao Omotenashi? A cada interação com o cliente, você pode aplicar PDCA:

Plan: Como vamos receber esse cliente hoje?
Do: Execute o atendimento com excelência.
Check: O cliente pareceu satisfeito? Houve algum momento de desconforto?
Act: Ajuste para o próximo cliente. Se algo deu errado, corrija imediatamente.

O PDCA torna o Omotenashi mensurável e sistematizado — sem perder a humanidade."

[EXEMPLO - 13:30]
"Uma pousada no interior de São Paulo aplicou PDCA no café da manhã. Planejaram: oferecer opções regionais. Fizeram: testaram com 10 hóspedes. Verificaram: 8 amaram, 2 acharam sem opção sem glúten. Agiram: adicionaram opção sem glúten e padronizaram o cardápio. Resultado: nota do café subiu de 8.2 para 9.7."

[ENCERRAMENTO - 14:30]
"PDCA é simples, mas não é fácil. Exige disciplina para planejar, coragem para verificar e humildade para ajustar. Qual ciclo você pode fechar esta semana?"`,
      },
      {
        title: "Genchi Genbutsu: Vá e Veja por Si Mesmo",
        slug: "genchi-genbutsu",
        description: "O princípio Toyota de ir à fonte para entender problemas e tomar decisões melhores no atendimento.",
        categorySlug: "ferramentas-excelencia",
        order: 4,
        duration: "14:00",
        videoUrl: "https://www.youtube.com/embed/WWi8_ltGkb0",
        content: `# Genchi Genbutsu: Vá e Veja por Si Mesmo

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Genchi Genbutsu é um dos pilares do Sistema Toyota de Produção. Significa 'vá ao local e veja por si mesmo' para entender a situação real. Não confie em relatórios. Não terceirize a observação. O dono, o gerente, o líder — todos precisam ir ao local onde o serviço acontece."

[A MÁFIA DOS RELATÓRIOS - 1:30]
"O maior erro dos gestores é tomar decisões baseados em relatórios, planilhas e reuniões. Você lê que 'a satisfação do cliente está em 92%' e acha que está tudo bem. Mas quando você vai ao salão do restaurante, vê clientes esperando, garçons estressados, mesas sujas.

Genchi Genbutsu é trocar o escritório pelo campo. É sentir o cheiro do problema."

[COMO PRATICAR GENCHI GENBUTSU - 4:00]
"Três passos simples:

1. Vá ao local (genba): Onde o serviço acontece. Não é o escritório. É o salão, a cozinha, o balcão, o telefone, o chat.

2. Veja por si mesmo: Não pergunte ao gerente 'como está o atendimento?' — sente-se em uma mesa e observe. Atenda um cliente. Escute uma ligação.

3. Entenda a situação real: Anote o que vê. Converse com os funcionários. Converse com os clientes. Não julgue — apenas observe.

Taiichi Ohno, criador do Sistema Toyota, desenhava círculos no chão da fábrica e mandava os engenheiros ficarem ali parados por horas observando. Até que enxergassem o que realmente estava acontecendo."

[GENCHI GENBUTSU NO ATENDIMENTO - 6:30]
"Aplicado ao serviço, Genchi Genbutsu significa:

— O gerente do restaurante passa 70% do tempo no salão, não na sala dos fundos fazendo planilhas.
— O dono da loja atende clientes uma vez por semana para sentir o pulso do negócio.
— O diretor de operações passa um dia por mês na linha de frente.

Resultado: decisões melhores baseadas em realidade, não em achismo."

[O CIRCLE DE OHNO - 9:00]
"Faça o exercício do círculo hoje. Desenhe um círculo no chão do seu estabelecimento. Fique em pé dentro dele por 30 minutos. Apenas observe. O fluxo de pessoas. As expressões dos clientes. Os gargalos. As esperas. O que os funcionários fazem quando não tem cliente.

Você vai enxergar problemas que nenhum relatório mostra."

[GENCHI GENBUTSU DIGITAL - 11:00]
"No ambiente digital, o Genchi Genbutsu é: navegar no seu próprio site como cliente. Fazer o cadastro. Verificar o email de boas-vindas. Tentar falar no WhatsApp. Esperar no chat. Pedir reembolso.

Quantos gestores testam o próprio produto como cliente? Muitos teriam surpresas desagradáveis. Taiichi Ohno diria: vá até a interface e veja por si mesmo."

[ENCERRAMENTO - 13:00]
"Genchi Genbutsu é sobre humildade. É aceitar que você não sabe o que está acontecendo até ir lá e ver. Qual 'genba' você precisa visitar amanhã?"`,
      },
      {
        title: "Nemawashi: A Arte de Construir Consenso",
        slug: "nemawashi-consenso",
        description: "A técnica japonesa de preparar o terreno para decisões, essencial para implementar mudanças sem resistência.",
        categorySlug: "ferramentas-excelencia",
        order: 5,
        duration: "16:00",
        videoUrl: "https://www.youtube.com/embed/qZsdm0RZ18k",
        content: `# Nemawashi: A Arte de Construir Consenso

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Você já tentou implementar uma mudança na sua empresa e encontrou resistência? Claro que sim. Todo mundo resiste a mudança imposta. Os japoneses descobriram isso há séculos e criaram o Nemawashi — a arte de preparar o terreno antes de plantar a decisão."

[O QUE É NEMAWASHI - 1:30]
"Literalmente, Nemawashi significa 'cortar as raízes ao redor' — uma técnica de jardinagem. Antes de transplantar uma árvore, você corta as raízes ao redor e espera. Isso permite que a árvore crie raízes finas que vão facilitar o transplante.

Em gestão, Nemawashi é o processo informal de construir consenso antes de tomar uma decisão formal. Você conversa Individualmente com cada pessoa envolvida. Escuta objeções. Ajusta a proposta. Quando chega na reunião formal, todo mundo já está alinhado."

[POR QUE NEMAWASHI FUNCIONA - 4:00]
"No Ocidente, temos reuniões para discutir ideias. O chefe propõe algo novo. As pessoas levantam objeções na hora. Conflitos surgem. Decisões são tomadas no grito ou por imposição.

Nemawashi é o oposto: as conversas difíceis acontecem antes. Quando a reunião começa, o consenso já existe. A reunião serve apenas para formalizar. Resultado: decisões melhores, implementação mais rápida, menos resistência."

[COMO PRATICAR NEMAWASHI - 6:30]
"Cinco passos do Nemawashi:

1. Identifique os stakeholders: Quem será afetado pela decisão? Quem tem poder de veto? Quem precisa apoiar para dar certo?

2. Converse individualmente: Cada pessoa separadamente. Não em grupo. As pessoas falam mais verdade em particular.

3. Escute ativamente: Não é vender a ideia. É ouvir. 'O que você acha de mudarmos o processo de atendimento?' e calar. Deixar a pessoa falar.

4. Incorpore feedback: Ajuste a proposta baseado no que ouviu. A pessoa que contribuiu apoia mais.

5. Confirme o alinhamento: 'Então estamos de acordo com essa direção?' Antes de levar para a reunião geral."

[NEMAWASHI NO ATENDIMENTO - 9:00]
"Como aplicar Nemawashi no seu negócio?

— Quer mudar o cardápio? Converse com o chef, com os garçons, com os clientes fiéis antes.
— Quer implementar Omotenashi na equipe? Converse com cada funcionário antes. Descubra as resistências.
— Quer mudar o layout do salão? Mostre o esboço para os garçons, não para o arquiteto primeiro.

A equipe que é ouvida antes da decisão abraça a mudança. A equipe que descobre a mudança no quadro de avisos resiste."

[NEMAWASHI + OMOTENASHI - 11:30]
"O Nemawashi é a manifestação do princípio Omotenashi do Respeito. Você respeita as pessoas envolvidas ao ouvi-las antes de decidir. Você respeita o conhecimento delas. Você respeita o impacto que a decisão terá na vida delas.

O próprio Omotenashi não pode ser imposto — precisa ser construído com a equipe. Não adianta o dono decidir 'vamos ser Omotenashi' e colocar um cartaz na parede. É preciso Nemawashi."

[ERROS COMUNS - 13:30]
"Erro 1: Fazer Nemawashi só com os chefes. Ignorar quem executa. A copeira sabe mais sobre limpeza que o gerente.

Erro 2: Usar Nemawashi para manipular. 'Já ouvi todo mundo, mas vou fazer do meu jeito anyway.' As pessoas percebem. A confiança se quebra.

Erro 3: Fazer Nemawashi mas não mudar a proposta. Se você ouve mas não incorpora, é apenas uma formalidade vazia.

O verdadeiro Nemawashi exige humildade genuína para mudar de ideia baseado no que ouviu."

[ENCERRAMENTO - 15:30]
"Qual decisão importante você precisa tomar esta semana? Antes da reunião, quantas conversas individuais você vai ter?"`,
      },
      {
        title: "Ikigai: Propósito e Realização no Trabalho",
        slug: "ikigai-proposito",
        description: "Descubra o conceito japonês de 'razão de ser' e como ele transforma a qualidade do serviço e da vida.",
        categorySlug: "ferramentas-excelencia",
        order: 6,
        duration: "17:00",
        videoUrl: "https://www.youtube.com/embed/IdMf9kfL6pA",
        content: `# Ikigai: Propósito e Realização no Trabalho

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Ikigai (生き甲斐) é uma palavra japonesa que significa 'razão de ser'. Literalmente, 'iki' é vida e 'gai' é valor. Ikigai é o que dá valor à sua vida. É o que faz você levantar da cama de manhã com energia. Estudos mostram que japoneses que têm ikigai vivem mais, são mais saudáveis e mais felizes."

[OS 4 COMPONENTES DO IKIGAI - 1:30]
"No Ocidente, o ikigai é representado por quatro círculos que se cruzam:

1. O que você AMA fazer? (paixão)
2. O que você FAZ BEM? (profissão)
3. O que o MUNDO PRECISA? (missão)
4. O que PODE TE RENDER DINHEIRO? (vocação)

O ikigai está no centro, onde esses quatro círculos se encontram. Mas no Japão, ikigai é mais simples: é encontrar alegria nas pequenas coisas do dia a dia. Não precisa ser grandioso."

[IKIGAI E O ATENDIMENTO - 4:00]
"Qual é o ikigai de quem trabalha com atendimento?

— Se você vê seu trabalho apenas como 'servir clientes', vai se frustrar.
— Se você vê como 'criar momentos de felicidade para as pessoas', encontrou seu ikigai.

A diferença entre um atendente mediano e um excepcional é o propósito. O que move o grande profissional não é o salário — é o senso de contribuição. É saber que seu sorriso melhorou o dia de alguém."

[COMO ENCONTRAR SEU IKIGAI NO TRABALHO - 6:30]
"Três perguntas para você refletir:

1. Qual é a parte do seu trabalho que faz você perder a noção do tempo? Quando você está tão imerso que o voo passa?

2. Qual é o elogio que você mais recebe? O que as pessoas dizem que você faz bem?

3. Se dinheiro não fosse problema, que parte do seu trabalho você faria de graça?

As respostas a essas perguntas apontam para seu ikigai."

[IKIGAI NAS EMPRESAS JAPONESAS - 9:00]
"Empresas japonesas tradicionais investem no ikigai dos funcionários. Como?

— Job rotation: permitem que funcionários experimentem diferentes áreas para encontrar o que amam.
— Treinamento contínuo: investem em desenvolvimento pessoal, não apenas técnico.
— Propósito claro: a empresa tem uma missão que vai além do lucro.

O resultado: funcionários com ikigai têm 3x mais engajamento, faltam menos e atendem melhor."

[O PAPEL DO LÍDER NO IKIGAI - 11:30]
"Líderes Omotenashi ajudam suas equipes a encontrar ikigai. Como?

— Conheça cada membro da equipe individualmente. O que motiva cada um?
— Conecte as tarefas ao propósito maior. O garçom não 'leva pratos' — ele 'cria momentos especiais'.
— Dê autonomia. Pessoas com ikigai precisam de espaço para criar.
— Celebre contribuições. Reconheça não só resultados, mas também esforço e melhoria.

O líder que cultiva ikigai na equipe colhe excelência no serviço."

[IKIGAI E LONGEVIDADE - 14:00]
"Okinawa, no Japão, tem uma das maiores concentrações de centenários do mundo. O segredo? Ikigai. Os idosos de Okinawa têm um propósito claro todos os dias — seja cuidar do jardim, ensinar as crianças ou fazer artesanato.

Traduzindo para o serviço: profissionais que encontram significado no que fazem não se esgotam. Não sofrem burnout. Porque o trabalho não é um fardo — é expressão do propósito."

[ENCERRAMENTO - 16:00]
"Ikigai não é algo que você 'acha' — é algo que você constrói dia após dia. Qual é a pequena coisa que dá sentido ao seu trabalho hoje?"`,
      },
      // === NOVAS AULAS: PESQUISA DE CONTEÚDO 2026 ===
      {
        title: "Ichigo Ichie: O Encontro que Acontece uma Vez na Vida",
        slug: "ichigo-ichie-encontro-unico",
        description: "A filosofia japonesa de que cada encontro é único e irrepetível — e como isso transforma o atendimento.",
        categorySlug: "filosofia-proposito",
        order: 4,
        duration: "15:00",
        videoUrl: "https://www.youtube.com/embed/_7BGNaqvCm0",
        content: `# Ichigo Ichie: O Encontro que Acontece uma Vez na Vida

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Ichigo Ichie (一期一会). Quatro caracteres kanji que carregam uma das filosofias mais bonitas do Japão: 'um encontro, uma vez na vida'. Cada encontro que você tem com um cliente é único. Nunca se repetirá. Essa consciência transforma completamente a forma como você atende."

[ORIGEM NO CHANOYU - 1:30]
"Ichigo Ichie nasceu na cerimônia do chá, com o mestre Sen no Rikyu no século XVI. Cada cerimônia era considerada única — a estação do ano, as flores no jardim, o humor dos participantes, o som da água fervendo. Nunca a mesma combinação se repetiria. Por isso, cada gesto deveria ser feito com absoluta presença e dedicação."

[A TRADUÇÃO - 3:30]
"Ichi = um. Go = tempo/ocasião. Ichi = um. E = encontro/encontro. Literalmente: 'um momento, um encontro'. Mas o significado real é mais profundo: trate cada encontro como se fosse o único — porque de certa forma, é. O cliente que entra hoje na sua loja não é o mesmo que entrou ontem. Você não é o mesmo. O momento não é o mesmo."

[APLICANDO NO ATENDIMENTO - 5:30]
"Como aplicar Ichigo Ichie no dia a dia?

1. PRESENÇA TOTAL — Quando um cliente está falando com você, nada mais existe. Não tem celular, não tem pensamento no próximo cliente, não tem problema pessoal. É só você e aquele momento.

2. PERSONALIZAÇÃO — Cada cliente é único. Não existe atendimento de 'tamanho único'. Preste atenção no que é específico daquela pessoa, daquele momento.

3. INTENCIONALIDADE — Faça cada gesto com intenção. Obrigado não é uma palavra automática — é um presente que você dá."

[ICHIGO ICHIE E O OMOTENASHI - 8:00]
"Ichigo Ichie é a base filosófica do Omotenashi. Se cada encontro é único, então cada ato de serviço é uma obra de arte que não se repetirá. O bartender que prepara seu drink com atenção total. O recepcionista que lembra seu nome. O garçom que percebe que você quer uma sobremesa diferente.

Esses profissionais entendem Ichigo Ichie — talvez sem saber o nome — mas vivem o princípio."

[EXEMPLO PRÁTICO - 10:30]
"Um hotel em Quioto treina seus funcionários com este exercício: ao receber um hóspede, imagine que ele veio de tão longe que nunca mais voltará. O que você faria de diferente? Que atenção extra daria? Que detalhe capricharia?

A resposta a essa pergunta é Ichigo Ichie em ação."

[ENCERRAMENTO - 13:30]
"Ichigo Ichie não é sobre perfeição. É sobre presença. É sobre honrar o momento presente com toda a sua atenção. Seu próximo cliente merece isso. Você merece viver isso.

Quantos encontros únicos você já deixou passar hoje?"`,
      },
      {
        title: "Omoiyari: A Empatia Japonesa que Encanta",
        slug: "omoiyari-empatia-japonesa",
        description: "Omoiyari é a arte japonesa da empatia antecipatória — sentir pelo outro antes mesmo de ele falar.",
        categorySlug: "filosofia-proposito",
        order: 5,
        duration: "14:00",
        videoUrl: "https://www.youtube.com/embed/3FmRrMhVzPQ",
        content: `# Omoiyari: A Empatia Japonesa que Encanta

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Omoiyari (思いやり) é uma palavra japonesa linda e difícil de traduzir. Significa 'ter sentimentos pelo outro' — mas não é pena nem simpatia. É a capacidade de se colocar no lugar do outro e agir baseado nessa compreensão. É a empatia em ação."

[OMOIYARI vs EMPATIA OCIDENTAL - 1:30]
"No Ocidente, empatia é frequentemente confundida com simpatia ou cordialidade. 'Oi, tudo bem? Como posso ajudar?' — muitas vezes automático, vazio.

Omoiyari é diferente. É a habilidade de perceber o que o outro está sentindo — mesmo que ele não diga — e agir para aliviar seu desconforto ou aumentar seu bem-estar. É proativa, não reativa."

[OS 3 NÍVEIS DO OMOIYARI - 3:30]
"Nível 1 — PERCEBER: Você nota que o cliente está com pressa, ou cansado, ou frustrado. Não precisa ser psicólogo — são sinais sutis. Olhar, postura, tom de voz.

Nível 2 — COMPREENDER: Você entende o que aquilo significa. Pressa = quer agilidade. Cansaço = quer conforto. Frustração = quer ser ouvido.

Nível 3 — AGIR: Você faz algo. Oferece o cardápio enquanto ele espera. Puxa a cadeira. Escuta sem interromper.

A maioria das pessoas para no nível 1. Omoiyari exige chegar ao nível 3."

[OMOIYARI NO ATENDIMENTO - 6:00]
"Casos práticos de Omoiyari:

— Cliente com criança: você oferece um desenho para colorir antes mesmo de a criança se irritar.
— Cliente idoso: você fala mais devagar, oferece o cardápio em fonte maior.
— Cliente estrangeiro: você usa palavras simples, gestos claros, tem paciência.

Omoiyari não é tratamento VIP — é tratamento humano. É enxergar o outro como pessoa, não como ticket médio."

[A DIFERENÇA ENTRE OMOIYARI E PEOPLE PLEASING - 8:30]
"Omoiyari não é agradar a qualquer custo. Não é dizer sim para tudo. É agir com consideração genuína, mantendo seus limites.

People pleasing: 'vou fazer tudo que o cliente quer para ele gostar de mim'
Omoiyari: 'vou perceber o que ele realmente precisa e agir com respeito'

Um profissional com Omoiyari sabe dizer não com gentileza, sabe direcionar o cliente para a melhor solução — mesmo que não seja a mais cara."

[OMOIYARI NAS EQUIPES - 11:00]
"Omoiyari não se aplica só a clientes — aplica-se à sua equipe. O colega que está sobrecarregado. O estagiário que está perdido. O chefe que está estressado.

Empresas japonesas cultivam Omoiyari internamente: rodízio de funções para ninguém ficar sobrecarregado, reuniões curtas por respeito ao tempo do outro, feedback dado em particular para não constranger.

Funcionários que se sentem cuidados cuidam melhor dos clientes."

[ENCERRAMENTO - 13:00]
"Omoiyari é simples: perceba, compreenda, aja. Três passos que transformam o atendimento. Qual cliente hoje precisa do seu Omoiyari?"`,
      },
      {
        title: "Omotenashi nos Jogos Olímpicos: A Conquista do Mundo",
        slug: "omotenashi-olimpiadas",
        description: "Como o conceito de Omotenashi conquistou os Jogos Olímpicos de Tóquio 2020 e virou referência global.",
        categorySlug: "ferramentas-excelencia",
        order: 7,
        duration: "16:00",
        videoUrl: "https://www.youtube.com/embed/E6vQTFfEfqU",
        content: `# Omotenashi nos Jogos Olímpicos: A Conquista do Mundo

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Em 7 de setembro de 2013, uma mulher chamada Christel Takigawa subiu ao palco do Comitê Olímpico Internacional em Buenos Aires. Ela tinha 4 minutos para ajudar Tóquio a ganhar os Jogos de 2020. O que ela disse mudou a percepção do Japão no mundo — e colocou o Omotenashi no mapa global."

[DISCURSO QUE CONQUISTOU O COI - 1:30]
"Takigawa falou com calma, precisão e emoção. Ela disse: 'Omotenashi é a palavra que resume a hospitalidade japonesa. Não é apenas serviço — é um cuidado que vem do coração, sem esperar nada em troca.'

Ela contou a história de uma voluntária que, no dia seguinte ao terremoto de 2011, estava na rua ajudando turistas perdidos a encontrar seus hotéis. Porque cuidar do visitante é instintivo no Japão.

O COI se emocionou. Tóquio venceu a candidatura. E o mundo aprendeu uma palavra nova."

[POR QUE O DISCURSO FUNCIONOU - 3:30]
"Três razões:

1. AUTENTICIDADE — Takigawa não inventou um conceito. Ela nomeou algo que o Japão já vivia há séculos. O COI sentiu que era genuíno.

2. STORYTELLING — Ela não deu definições de dicionário. Ela contou a história de uma pessoa real ajudando outra. Histórias vendem. Definições não.

3. IDENTIDADE — Omotenashi não era apenas hospitalidade — era a identidade do Japão. O que faz o Japão ser único. Toda marca precisa de um 'Omotenashi' — uma identidade inconfundível."

[LIÇÃO 1: NOMEIE SEU DIFERENCIAL - 6:00]
"O que sua empresa faz de diferente que você ainda não colocou em palavras? O Omotenashi existia no Japão há 500 anos, mas só foi nomeado para o mundo em 2013. Antes do discurso de Takigawa, era apenas 'o jeito japonês de fazer as coisas'.

Sua empresa tem um 'Omotenashi' esperando para ser nomeado? Talvez seja o cuidado no pós-venda, a rapidez na entrega, o sorriso genuíno da equipe. Dê um nome. Conte uma história."

[LIÇÃO 2: TREINE SUA EQUIPE PARA SER EMBAIXADORA - 8:30]
"O Japão treinou milhares de voluntários para as Olimpíadas. Não apenas em inglês e logística — mas em Omotenashi. Cada voluntário aprendeu a antecipar necessidades, a sorrir com os olhos (inclusive de máscara), a ajudar sem ser invasivo.

Sua equipe está preparada para ser embaixadora da sua marca? Cada funcionário que atende um cliente é, naquele momento, a cara da sua empresa."

[LIÇÃO 3: PEQUENOS GESTOS, GRANDE IMPACTO - 11:00]
"Durante as Olimpíadas, o mundo notou detalhes:

— Banheiros públicos impecáveis com nomes de atletas nas portas.
— Voluntários que aprendiam 'obrigado' em 50 idiomas.
— Sinalização clara mesmo para quem não falava japonês.
— Pacotes de emergência com máscaras e álcool em gel em cada esquina.

Nada disso era obrigatório. Era Omotenashi. Era o cuidado invisível que transforma a experiência."

[LIÇÃO 4: OMOTENASHI COMO VANTAGEM COMPETITIVA - 13:30]
"O Japão não venceu a candidatura por ter os melhores estádios ou a melhor infraestrutura. Venceu porque ofereceu algo que nenhum outro país podia oferecer: o Omotenashi.

Qual é o diferencial que só seu negócio pode oferecer? Quando você encontra essa resposta e a comunica com clareza, você não compete por preço — compete por valor."

[ENCERRAMENTO - 15:00]
"O discurso de Christel Takigawa durou 4 minutos. Mas seu impacto dura até hoje. O que sua empresa diria em 4 minutos se estivesse concorrendo para sediar as Olimpíadas? Essa resposta é sua identidade."`,
      },
      {
        title: "Cases Reais: JAL, Lexus e o Poder do Omotenashi",
        slug: "cases-reais-jal-lexus",
        description: "Análise aprofundada de como três gigantes japoneses aplicam Omotenashi e o que podemos aprender.",
        categorySlug: "casos-sucesso",
        order: 2,
        duration: "20:00",
        videoUrl: "https://www.youtube.com/embed/5nqnW7qYMPQ",
        content: `# Cases Reais: JAL, Lexus e o Poder do Omotenashi

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Teoria é importante. Mas nada substitui exemplos reais. Hoje vamos analisar três empresas que transformaram o Omotenashi em vantagem competitiva real: Japan Airlines, Lexus e um ryokan centenário que todo mundo deveria conhecer."

[CASE 1: JAPAN AIRLINES - 1:30]
"A JAL é conhecida mundialmente pela qualidade do serviço de bordo. Mas você sabe o que acontece ANTES do voo?

— Os comissários se reúnem 30 minutos antes do embarque para alinhar detalhes do voo.
— Eles verificam a lista de passageiros: tem aniversariante? Alguém com restrição alimentar? Idoso viajando sozinho?
— Na porta do avião, cada passageiro é recebido com uma reverência e um sorriso genuíno.

Não é teatro. É preparação. A JAL trata o voo como uma cerimônia — e cada passageiro como um convidado de honra."

[O SEGREDO DA JAL - 4:00]
"Em 2011, a JAL faliu. Foi reestruturada por Kazuo Inamori, um monge budista virou empresário. Inamori implementou o que chamou de 'gerenciamento baseado na alma' — cada funcionário deveria perguntar: 'O que é o certo a fazer como ser humano?'

Resultado: em 2 anos, a JAL saiu da falência para lucro recorde. O segredo não foi corte de custos — foi Omotenashi. Tratar passageiros como seres humanos, não como assentos numerados."

[CASE 2: LEXUS - 6:30]
"A Lexus é da Toyota, e o DNA do Omotenashi está no sangue. O famoso 'Takumi' — artesãos mestres que passam por testes rigorosos para poder trabalhar na Lexus.

Um Takumi precisa de 15 anos de experiência para ser certificado. Ele pode sentir vibrações de 0,1mm no volante. Pode identificar irregularidades no motor pelo som. Pode pintar à mão com precisão de micrômetros.

Por que isso importa? Porque o Omotenashi da Lexus diz: o cliente merece o melhor que podemos fazer. Não o melhor que é economicamente viável — o melhor que existe."

[O ATENDIMENTO LEXUS - 9:00]
"Na concessionária Lexus:

— Não há 'sala de espera' — há lounge com café especial, massagem, internet.
— Quando você leva o carro para revisão, ele volta mais limpo do que entrou.
— Se um modelo que você quer não está disponível, o vendedor encontra em outra concessionária e traz — sem custo adicional.

Não é sobre vender carro de luxo. É sobre fazer o cliente se sentir valorizado em cada interação. Qualquer empresa — de qualquer segmento — pode aplicar isso."

[CASE 3: RITZ-CARLTON OSAKA - 11:30]
"O Ritz-Carlton Osaka tem treinamento em Omotenashi para todos os funcionários. Uma regra de ouro: qualquer funcionário pode gastar até US$ 2.000 para resolver um problema de um hóspede — sem pedir autorização.

Exemplo real: um hóspede idoso queria um tipo específico de travesseiro ortopédico. O hotel não tinha. O concierge saiu, comprou o travesseiro, entregou no quarto — sem cobrar nada extra.

Isso é Omotenashi: antecipar, resolver, encantar. Sem burocracia, sem 'deixa eu ver com meu supervisor'."

[CASE 4: RYOKAN HOSHINOYA - 14:00]
"Hoshinoya é uma rede de ryokans (pousadas tradicionais japonesas) que levou o Omotenashi a outro nível.

— No check-in, você não vai ao balcão. Você é levado a uma sala privativa, serve-se chá, e o check-in é feito enquanto você aprecia a vista.
— Os funcionários não usam uniforme — usam roupas tradicionais que combinam com o ambiente.
— Cada detalhe do quarto é ajustado à estação do ano: flores, incensos, tipo de toalha.

Hoshinoya não compete com outros hotéis — compete com a memória afetiva do hóspede. A experiência é tão marcante que vira lembrança para a vida toda."

[O QUE APRENDER COM ELES - 17:00]
"1. TREINAMENTO É INVESTIMENTO — JAL e Lexus investem pesado em treinamento. Sabem que não se improvisa excelência.

2. AUTONOMIA PARA SERVIR — Ritz-Carlton dá poder de decisão ao funcionário. Confiança gera responsabilidade.

3. DETALHES CRIAM ENCANTAMENTO — Hoshinoya prova que o diabo (e o céu) estão nos detalhes.

4. CONSISTÊNCIA ACIMA DE TUDO — Não basta fazer bem uma vez. Omotenashi é consistência diária."

[ENCERRAMENTO - 19:00]
"Essas empresas não são japonesas por acaso. São empresas que escolheram a excelência como caminho. Qual delas mais se parece com o que você quer construir?"`,
      },
      {
        title: "Omotenashi no Mundo Digital: Atendimento que Conecta",
        slug: "omotenashi-digital-conecta",
        description: "Como levar os princípios do Omotenashi para canais digitais: WhatsApp, chat, e-mail e redes sociais.",
        categorySlug: "omotenashi-pratica",
        order: 4,
        duration: "16:00",
        videoUrl: "https://www.youtube.com/embed/ZH8X0xg4mdY",
        content: `# Omotenashi no Mundo Digital: Atendimento que Conecta

## Roteiro de Vídeo

[ABERTURA - 0:00]
"Omotenashi nasceu no mundo físico — na cerimônia do chá, nos ryokans, no contato humano. Mas será que funciona no digital? A resposta é sim — desde que você entenda as regras desse novo ambiente."

[O DESAFIO DO DIGITAL - 1:30]
"O digital tem um problema: ele tira os sinais não verbais. Você não vê a expressão do cliente, não ouve o tom de voz, não percebe a linguagem corporal. Metade da comunicação se perde.

Mas o digital também tem uma vantagem: ele dá tempo. Tempo para pensar, para escolher as palavras, para pesquisar a melhor resposta. Um atendente japonês diria: 'no digital, cada palavra é uma reverência'."

[PRINCÍPIO 1: ANTECIPAÇÃO DIGITAL - 3:30]
"Omotenashi digital começa antes do cliente falar.

— Seu site tem perguntas frequentes visíveis?
— Seu WhatsApp tem uma mensagem automática que realmente ajuda?
— Seu chat consegue identificar se o cliente está no celular ou no PC?

Antecipar não é adivinhar — é preparar. Um site com FAQ bem-feito é Omotenashi digital. Um robô que pergunta 'você gostaria de agendar?' antes de o cliente pensar nisso é Omotenashi digital."

[PRINCÍPIO 2: PRESENÇA NAS PALAVRAS - 6:00]
"No digital, suas palavras são seu corpo, seu tom de voz, sua expressão facial. Por isso:

— SEJA CALOROSO — 'Olá, como posso ajudar?' vs 'Olá! 😊 Ficamos felizes em falar com você! Como podemos tornar seu dia melhor hoje?'
— SEJA HUMANO — Evite linguagem robótica. Use o nome do cliente. Pergunte como ele está. (Mas sem ser invasivo.)
— SEJA RÁPIDO — No digital, velocidade é cortesia. Responder em 5 minutos vale mais que a resposta perfeita em 2 horas.

Lembre-se: do outro lado tem uma pessoa. Trate-a como tal."

[PRINCÍPIO 3: O TOQUE HUMANO NO AUTOMÁTICO - 8:30]
"Automação não é inimiga do Omotenashi — desde que bem usada.

Exemplos de automação com alma:

— Mensagem automática de boas-vindas que não parece robô
— Lembrete de consulta/horário com instruções úteis
— Follow-up pós-atendimento perguntando se ficou tudo bem
— Pesquisa de satisfação curta (3 perguntas, não 20)

O segredo: automatize o que é repetitivo, personalize o que é importante. O cliente percebe quando você terceirizou o cuidado."

[PRINCÍPIO 4: RECUPERAÇÃO DE ERROS DIGITAIS - 11:00]
"Erros no digital são mais perigosos porque ficam registrados. Um email ignorado. Uma mensagem no WhatsApp que o robô não entendeu. Uma reclamação pública no Instagram.

Omotenashi digital na recuperação de erros:

1. RESPONDA RÁPIDO — Silêncio é a pior resposta. Mesmo que seja 'estamos analisando seu caso, em 2 horas voltamos com resposta'.

2. PEÇA DESCULPAS GENUÍNAS — 'Pedimos desculpas pelo transtorno' é melhor que explicações técnicas.

3. RESOLVA DE VERDADE — Não adianta resposta educada se o problema não foi resolvido.

4. SURPREENDA — Se o erro foi grave, ofereça um brinde, um desconto, algo extra. A recuperação de um erro bem-feita fideliza mais que um acerto qualquer."

[DICA EXTRA: O PODER DO SOM NO DIGITAL - 13:30]
"No Japão, os sons fazem parte do Omotenashi. O 'irasshaimase' na porta da loja, o som da água na cerimônia do chá.

No digital, isso se traduz em:
— Mensagens de voz (mais pessoais que texto)
— Vídeos curtos de agradecimento
— Música ambiente no site/agendamento
— Efeitos sonoros sutis em apps

Use o som para criar ambiente. Ambiente cria emoção. Emoção fideliza."

[ENCERRAMENTO - 15:00]
"Omotenashi digital não é sobre tecnologia. É sobre humanidade usando tecnologia como ferramenta. Seu próximo atendimento digital — você vai tratar o cliente como número ou como convidado?"`,
      },
    ]

    for (const lesson of lessons) {
      const category = await prisma.category.findUnique({ where: { slug: lesson.categorySlug } })
      if (category) {
        await prisma.lesson.upsert({
          where: { slug: lesson.slug },
          create: {
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: lesson.order,
            categoryId: category.id,
          },
          update: {
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: lesson.order,
            categoryId: category.id,
          },
        })
      }
    }

    const chapters = [
      {
        title: "Prefácio: A Alma Japonesa",
        slug: "prefacio-alma-japonesa",
        order: 1,
        content: `# Prefácio: A Alma Japonesa

**Omotenashi (おもてなし)** é mais do que uma palavra — é a alma do Japão. É a arte de receber, de cuidar, de servir com o coração. Quando você entra em um ryokan (pousada tradicional japonesa), é recebido não como um hóspede, mas como um membro da família. Quando você compra algo em uma loja em Tóquio, o vendedor embrulha seu produto com tanto cuidado e precisão que você hesita em abri-lo. Quando você visita um templo antigo, o silêncio, a limpeza impecável e a atmosfera de paz mostram que cada detalhe foi pensado para sua experiência espiritual.

Este livro é uma jornada pela cultura do Omotenashi. Vamos explorar suas origens, seus princípios, suas aplicações práticas e, mais importante, como você pode trazer essa filosofia para sua vida e seu negócio — no Brasil.

## Por que Omotenashi?

Em um mundo cada vez mais digital e impessoal, a hospitalidade genuína se tornou um diferencial competitivo poderoso. Clientes não querem apenas produtos ou serviços — eles querem experiências. Eles querem se sentir valorizados, compreendidos e cuidados.

O Omotenashi oferece exatamente isso. Mas não se engane: Omotenashi não é um conjunto de técnicas de vendas ou um manual de atendimento ao cliente. É uma filosofia de vida, uma maneira de enxergar o outro como digno de respeito e cuidado genuíno.

## O Que Você Vai Aprender

- **Capítulo 1-2**: As origens históricas e filosóficas do Omotenashi
- **Capítulo 3-5**: Os princípios fundamentais que regem essa arte
- **Capítulo 6-8**: A psicologia por trás do serviço excepcional
- **Capítulo 9-12**: Técnicas práticas de implementação
- **Capítulo 13-15**: Adaptação do Omotenashi à cultura brasileira
- **Capítulo 16-18**: Omotenashi digital e tecnologia
- **Capítulo 19-21**: Métricas, avaliação e melhoria contínua
- **Capítulo 22-25**: Estudos de caso e exemplos reais

## Como Usar Este Livro

Cada capítulo inclui:
- **Conceitos fundamentais** explicados em detalhe
- **Exemplos práticos** do Japão e do Brasil
- **Exercícios** para aplicar o conhecimento
- **Reflexões** para aprofundar o entendimento

*"A terceira xícara de chá"* — um provérbio japonês diz que na primeira xícara de chá, você é um estranho. Na segunda, um amigo. Na terceira, você faz parte da família. O Omotenashi é sobre chegar à terceira xícara de chá com cada pessoa que cruza seu caminho.

Vamos começar esta jornada juntos.`,
      },
      {
        title: "Capítulo 1: As Origens do Omotenashi",
        slug: "cap1-origens-omotenashi",
        order: 2,
        content: `# Capítulo 1: As Origens do Omotenashi

## 1.1 O Nascimento de uma Filosofia

O Omotenashi não surgiu do nada. Suas raízes estão profundamente entrelaçadas com a história, religião e cultura do Japão. Para compreendê-lo verdadeiramente, precisamos viajar no tempo.

### Período Jomon (14.000 a.C. - 300 a.C.)

Mesmo antes da história escrita, os primeiros habitantes do arquipélago japonês já praticavam formas primitivas de hospitalidade. A vida em comunidades pequenas e isoladas exigia cooperação e cuidado mútuo. Receber bem um visitante não era apenas cortesia — era questão de sobrevivência.

### Período Yayoi (300 a.C. - 300 d.C.)

Com a introdução do cultivo de arroz, a sociedade japonesa se tornou mais estruturada. O arroz não era apenas alimento — era moeda, era oferenda aos deuses, era a base da civilização. A hospitalidade começou a se formalizar: oferecer arroz e saquê a um visitante era um gesto de profundo respeito.

### Período Kofun (300 - 538 d.C.)

O surgimento dos primeiros estados centralizados trouxe rituais mais elaborados de recepção. Os líderes locais (uji) competiam entre si em ostentação e hospitalidade. Receber bem um representante do imperador era uma honra e uma demonstração de poder.

## 1.2 A Influência do Budismo

O budismo chegou ao Japão no século VI, trazendo consigo conceitos que moldariam profundamente o Omotenashi:

### Compaixão (慈悲 - Jihi)

O conceito budista de compaixão universal — tratar todos os seres com bondade — tornou-se um pilar do serviço japonês. Não se trata de fazer o bem esperando recompensa, mas porque é a natureza correta das coisas.

### Impermanência (無常 - Mujou)

A consciência da impermanência de todas as coisas ensina os japoneses a valorizar cada encontro como único e irrepetível. Cada cliente, cada hóspede, cada momento de serviço é tratado como se fosse a última vez.

### Atenção Plena (念 - Nen)

O estado de presença total no momento presente é essencial para o Omotenashi. Um bom anfitrião não está distraído ou pensando em outra coisa — está completamente presente para seu convidado.

## 1.3 O Chá e a Alma do Omotenashi

A cerimônia do chá (茶道 - Chadô ou Sadô) é talvez a expressão mais pura do Omotenashi. Desenvolvida por Sen no Rikyu (千利休) no século XVI, a cerimônia do chá é uma coreografia de hospitalidade onde cada gesto tem significado.

### Os Quatro Princípios do Chá

1. **和 (Wa) - Harmonia**
   Harmonia entre as pessoas, entre os objetos, entre o homem e a natureza.

2. **敬 (Kei) - Respeito**
   Respeito mútuo entre anfitrião e convidado, independentemente de posição social.

3. **清 (Sei) - Pureza**
   Pureza de coração, de intenção, de ambiente. A limpeza meticulosa da sala de chá.

4. **寂 (Jaku) - Tranquilidade**
   A serenidade que envolve toda a experiência.

### O Conceito de Ichigo Ichie (一期一会)

Literalmente "um encontro, uma oportunidade". Cada encontro é único e nunca se repetirá. Por isso, deve ser vivido plenamente. Este conceito é fundamental para o Omotenashi: cada cliente, cada interação, cada momento merece nossa atenção total.

## 1.4 O Bushido e a Ética do Serviço

O código dos samurais (武士道 - Bushidô) também influenciou profundamente o Omotenashi:

### Lealdade (忠 - Chuu)
Assim como o samurai era leal ao seu senhor, o profissional japonês é leal à sua empresa e aos seus clientes.

### Honra (名誉 - Meiyo)
A honra pessoal está ligada à qualidade do serviço prestado. Perder a honra é pior que perder a vida.

### Autodisciplina (克己 - Kokki)
O autocontrole e a disciplina permitem manter a compostura e a excelência em qualquer situação.

### Benevolência (仁 - Jin)
A força deve ser usada para proteger e servir, não para oprimir. O samurai forte é gentil; o profissional excelente é humilde.

## 1.5 O Xintoísmo e a Pureza

O Xintoísmo (神道 - Shintô), a religião nativa do Japão, contribuiu com o conceito de pureza (清め - Kiyome):

- Purificação antes de entrar em lugares sagrados
- Limpeza como forma de respeito
- A beleza está na simplicidade e na limpeza

Estes princípios se traduzem no Omotenashi através da obsessão japonesa por limpeza e organização. Um ambiente limpo e ordenado é a base de qualquer serviço de qualidade.

## Exercícios do Capítulo 1

1. **Reflexão**: Pense em um momento em que você recebeu um serviço que parecia genuinamente atencioso. O que fez diferença?

2. **Prática**: Na próxima semana, tente tratar cada interação como um "ichigo ichie" — um encontro único que nunca se repetirá.

3. **Observação**: Visite um estabelecimento e observe os detalhes de limpeza, organização e atendimento. O que você nota que faz diferença?`,
      },
      {
        title: "Capítulo 2: A Filosofia do Servir",
        slug: "cap2-filosofia-servir",
        order: 3,
        content: `# Capítulo 2: A Filosofia do Servir

## 2.1 Servir sem Servidão

No Ocidente, "servir" muitas vezes carrega uma conotação negativa — sugere submissão, inferioridade, perda de dignidade. No Japão, servir é uma arte nobre.

### A Diferença Fundamental

No Omotenashi, quem serve não se diminui — se engrandece. Servir bem não é sinal de fraqueza, mas de força interior. A humildade necessária para servir genuinamente é uma virtude, não uma fraqueza.

### O Paradoxo do Serviço Japonês

O paradoxo central do Omotenashi é: ao se curvar diante do cliente, o servidor se eleva. Ao colocar o outro em primeiro lugar, encontra seu próprio valor. Ao servir com excelência, o servidor ganha dignidade e respeito.

### O Mestre que Serve

Nos melhores restaurantes japoneses, o chef mais experiente é quem serve pessoalmente os clientes mais importantes. No ryokan, a proprietária (okami-san) recebe pessoalmente os hóspedes. Servir não é tarefa de subordinados — é uma honra reservada aos melhores.

## 2.2 O Conceito de "Kikubari" (気配り)

Kikubari é a arte da atenção aos detalhes — literalmente "distribuir a atenção". É a capacidade de perceber o que precisa ser feito antes que alguém peça.

### Kikubari vs. Serviço Comum

| Serviço Comum | Kikubari |
|---------------|----------|
| Cliente pede, você atende | Você antecipa a necessidade |
| Você segue o protocolo | Você personaliza a experiência |
| Você faz o esperado | Você faz o extraordinário |
| Você atende porque é obrigação | Você atende porque é natural |

### Exemplos de Kikubari

1. **No Restaurante**: O garçom nota que você está com frio e oferece um xale sem você pedir.

2. **No Hotel**: Ao fazer a limpeza do quarto, arrumam os cabos dos seus dispositivos e colocam um bilhete com a previsão do tempo para o dia seguinte.

3. **Na Loja**: O vendedor percebe seu estilo e já separa peças que combinam com você.

4. **Na Empresa**: O atendente nota pela sua voz que você está estressado e ajusta o tom de atendimento.

## 2.3 O Espírito de Serviço (奉仕の精神 - Houshi no Seishin)

O espírito de serviço japonês vai além do profissional — é pessoal, é cultural, é quase espiritual.

### Motivações para Servir

**Internas:**
- Realização pessoal através do serviço
- Orgulho no trabalho bem feito
- Conexão genuína com o outro

**Externas:**
- Reconhecimento da sociedade
- Lealdade à empresa
- Tradição familiar

### O Serviço como Caminho (道 - Dou)

No Japão, muitas atividades são consideradas um "caminho" (dou) — uma jornada de aperfeiçoamento contínuo:

- Sado (茶道) - Caminho do chá
- Kado (華道) - Caminho das flores
- Budo (武道) - Caminho do guerreiro
- Shodo (書道) - Caminho da caligrafia

O serviço também pode ser um caminho — uma prática diária de aperfeiçoamento pessoal através do cuidado com o outro.

## 2.4 Omotenashi e o Conceito de "En" (縁)

En é o conceito budista de conexão entre as pessoas. Acredita-se que o encontro entre duas pessoas não é acidental — há um fio invisível que as conecta.

### Implicações para o Atendimento

- Cada cliente é alguém com quem temos uma conexão especial
- Cada interação tem significado e propósito
- Devemos honrar essa conexão através do serviço excelente

### O "Fio Vermelho do Destino"

A lenda japonesa diz que um fio vermelho invisível conecta as pessoas destinadas a se encontrar. No Omotenashi, cada cliente está conectado a nós por esse fio. Servir bem é honrar essa conexão.

## 2.5 A Humildade como Força

### Kenkyo (謙虚) - A Virtude da Humildade

No Japão, a humildade não é falsa modéstia — é o reconhecimento genuíno de que sempre há mais a aprender e que o outro merece respeito.

### Como a Humildade se Manifesta no Serviço

1. **Linguagem**: Uso de keigo (linguagem honorífica) que eleva o cliente
2. **Postura**: Inclinar-se ligeiramente ao falar com o cliente
3. **Escuta Ativa**: Realmente ouvir, não apenas esperar a vez de falar
4. **Responsabilidade**: Assumir erros e corrigi-los imediatamente

### A Humildade na Prática Brasileira

No Brasil, a humildade pode se manifestar de forma diferente:

- Admitir quando não sabe algo (em vez de inventar)
- Pedir desculpas genuínas
- Tratar o cliente como um igual, não como inferior ou superior
- Estar aberto a feedback

## 2.6 Servir com Alegria (喜びをもって - Yorokobi wo Motte)

Omotenashi não é serviço feito com ressentimento ou obrigação — é serviço feito com alegria genuína.

### A Diferença que a Alegria Faz

O cliente percebe a diferença entre:
- Um sorriso genuíno vs. um sorriso forçado
- Um "obrigado" verdadeiro vs. automático
- Um serviço feito com amor vs. cumprimento de tarefa

### Cultivando a Alegria no Serviço

1. Encontre propósito no que faz
2. Conecte-se com a missão da empresa
3. Veja cada cliente como uma oportunidade de fazer diferença
4. Celebre pequenas vitórias no atendimento

## Exercícios do Capítulo 2

1. **Autoavaliação**: Você já sentiu que servir era algo negativo? Reflita sobre por que e como mudar essa perspectiva.

2. **Prática**: Esta semana, pratique kikubari — tente antecipar uma necessidade de alguém antes que ela peça.

3. **Diário**: Registre momentos em que você recebeu um serviço com alegria genuína. O que fez diferença?`,
      },
      {
        title: "Capítulo 3: Os 6 Pilares do Omotenashi",
        slug: "cap3-6-pilares",
        order: 4,
        content: `# Capítulo 3: Os 6 Pilares do Omotenashi

## Introdução

O Omotenashi se sustenta em seis pilares fundamentais. Cada um deles é essencial para a prática genuína da hospitalidade japonesa e, juntos, formam um sistema completo de serviço excepcional.

## Pilar 1: Antecipação (先取り - Sakidori)

Antecipar não é apenas adivinhar o que o cliente quer. É preparar-se para atender necessidades que o próprio cliente ainda não identificou.

### Os Níveis de Antecipação

**Nível 1: Básico**
- Ter o ambiente preparado antes da chegada
- Estoque suficiente de materiais
- Equipe treinada e pronta

**Nível 2: Intermediário**
- Conhecer preferências de clientes recorrentes
- Prever dúvidas comuns e ter respostas prontas
- Identificar padrões de comportamento

**Nível 3: Avançado**
- Surpreender o cliente com algo que ele não esperava
- Resolver problemas antes que ele perceba que existem
- Criar experiências personalizadas

### Técnicas de Antecipação

1. **Observação Atenta**: Prestar atenção aos detalhes do comportamento do cliente
2. **Registro de Preferências**: Manter histórico detalhado de cada cliente
3. **Análise de Padrões**: Identificar tendências no comportamento dos clientes
4. **Preparação Proativa**: Ter soluções prontas antes dos problemas surgirem

### Exemplo Prático

Um cliente entra em uma loja de roupas. O vendedor nota:
- Cliente olha repetidamente para camisas sociais azuis → já separa os tamanhos disponíveis
- Cliente está com pressa → agiliza o processo
- Cliente parece indeciso → oferece opinião consultiva, não impositiva
- Cliente está acompanhado → inclui o acompanhante na experiência

## Pilar 2: Respeito (敬意 - Keii)

Respeito no Omotenashi não é apenas educação — é um reconhecimento profundo do valor intrínseco de cada pessoa.

### As Dimensões do Respeito

**Respeito pela Pessoa**
- Tratar cada cliente como único
- Não julgar pela aparência ou valor do consumo
- Manter a dignidade do cliente em qualquer situação

**Respeito pelo Espaço**
- Manter o ambiente impecável
- Respeitar o espaço pessoal do cliente
- Criar um ambiente acolhedor

**Respeito pelo Tempo**
- Não fazer o cliente esperar desnecessariamente
- Ser eficiente sem ser apressado
- Respeitar o ritmo do cliente

### O Respeito na Linguagem Corporal

No Japão, o respeito é demonstrado através de:
- Ojigi (curvar-se) na profundidade adequada
- Contato visual respeitoso (não fixo)
- Postura ereta mas não rígida
- Mãos visíveis (não escondidas atrás das costas)
- Sorriso genuíno

## Pilar 3: Autenticidade (誠実 - Seijitsu)

Autenticidade é servir com sinceridade, sem segundas intenções. O serviço não é uma técnica de vendas — é uma expressão genuína de cuidado.

### Serviço Autêntico vs. Serviço Falso

| Serviço Autêntico | Serviço Falso |
|-------------------|---------------|
| Nasce do coração | Nasce do manual |
| É consistente | É seletivo |
| Não espera retorno | É calculado |
| O cliente percebe | O cliente desconfia |

### Como Cultivar Autenticidade

1. **Conecte-se com seu propósito**: Por que você faz o que faz?
2. **Seja vulnerável**: Autenticidade inclui admitir imperfeições
3. **Pratique empatia**: Coloque-se genuinamente no lugar do cliente
4. **Aja com integridade**: Faça o certo, mesmo quando ninguém está vendo

### O Teste da Autenticidade

Pergunte-se: "Se eu não fosse pago para isso, ainda assim trataria esse cliente com a mesma atenção?" Se a resposta for não, há trabalho a fazer.

## Pilar 4: Equilíbrio (調和 - Chouwa)

Equilíbrio é a arte de encontrar a medida certa em tudo — nem excesso, nem falta.

### O Equilíbrio no Atendimento

**Entre Proximidade e Distância**
- Estar próximo o suficiente para ser acessível
- Manter distância profissional suficiente para não ser invasivo

**Entre Eficiência e Atenção**
- Ser rápido sem ser apressado
- Ser atencioso sem ser lento

**Entre Falar e Ouvir**
- Saber quando falar e quando ouvir
- Saber quando perguntar e quando agir

**Entre Seguir Regras e Personalizar**
- Conhecer as regras para saber quando quebrá-las
- Personalizar sem perder a consistência

### O Conceito de "Ma" (間)

Ma é o espaço entre as coisas — a pausa entre as notas musicais, o silêncio entre as palavras, o vazio na tela. No atendimento, ma é saber dar espaço para o cliente respirar, pensar, decidir.

## Pilar 5: Atenção aos Detalhes (極める - Kiwameru)

No Omotenashi, não existem detalhes pequenos. Cada detalhe é uma oportunidade de demonstrar cuidado.

### A Filosofia dos 100% Pequenos

Um serviço excelente não é feito de grandes gestos, mas de centenas de pequenos detalhes executados com perfeição:

- A temperatura da água servida
- A dobra da toalha no banheiro
- A forma como o produto é entregue
- A escolha das palavras
- O timing da abordagem

### Checklist de Detalhes

**Ambiente Físico**
- [ ] Temperatura agradável
- [ ] Iluminação adequada
- [ ] Música ambiente apropriada
- [ ] Aromas agradáveis
- [ ] Limpeza impecável

**Atendimento**
- [ ] Aparência profissional
- [ ] Sorriso genuíno
- [ ] Postura aberta
- [ ] Tom de voz acolhedor
- [ ] Linguagem corporal positiva

**Processo**
- [ ] Fluxo eficiente
- [ ] Mínimo de espera
- [ ] Comunicação clara
- [ ] Acompanhamento pós-serviço

### O Detalhe que Encanta

Um grande exemplo: no Japão, quando você compra um guarda-chuva em uma loja, o vendedor abre o guarda-chuva, verifica se não há defeitos, dobra cuidadosamente e entrega com as duas mãos. Pequeno gesto? Sim. Mas cria uma impressão que dura.

## Pilar 6: Melhoria Contínua (改善 - Kaizen)

Kaizen é a filosofia de melhoria contínua, aplicada ao serviço e à pessoa.

### Como o Kaizen se Aplica ao Omotenashi

1. **Avaliação Constante**: Nunca assuma que o serviço é "bom o suficiente"
2. **Feedback como Presente**: Cada reclamação é uma oportunidade de melhorar
3. **Aprendizado Diário**: Cada dia é uma chance de servir melhor
4. **Inovação Incremental**: Pequenas melhorias diárias levam a grandes resultados

### O Ciclo PDCA no Serviço

**Plan (Planejar)**
- Identificar oportunidades de melhoria
- Definir padrões de serviço
- Treinar a equipe

**Do (Fazer)**
- Executar o serviço conforme planejado
- Documentar o processo
- Coletar dados

**Check (Verificar)**
- Avaliar resultados
- Comparar com padrões
- Identificar desvios

**Act (Agir)**
- Corrigir desvios
- Padronizar melhorias
- Compartilhar aprendizados

## Integrando os 6 Pilares

Os seis pilares não funcionam isoladamente. Eles se reforçam mutuamente:

- **Antecipação** requer **atenção aos detalhes**
- **Respeito** exige **autenticidade**
- **Equilíbrio** permite **antecipação** adequada
- **Kaizen** melhora todos os outros pilares

## Exercícios do Capítulo 3

1. **Avaliação**: Qual dos 6 pilares é seu ponto forte? Qual precisa mais desenvolvimento?

2. **Prática**: Escolha um pilar por semana para focar. Observe como ele melhora suas interações.

3. **Implementação**: Identifique um detalhe no seu ambiente de trabalho que pode ser melhorado. Melhore-o hoje.`,
      },
    ]

    // Add more chapters to reach 300+ pages worth of content
    const additionalChapters = [
      {
        title: "Capítulo 4: A Psicologia do Cliente",
        slug: "cap4-psicologia-cliente",
        order: 5,
        content: `# Capítulo 4: A Psicologia do Cliente

## 4.1 Compreendendo a Mente do Cliente

Para servir excepcionalmente bem, precisamos entender como os clientes pensam, sentem e tomam decisões.

### As Necessidades Psicológicas do Cliente

1. **Segurança**: Sentir-se seguro e acolhido no ambiente
2. **Pertencimento**: Sentir-se bem-vindo e aceito
3. **Estima**: Sentir-se valorizado e respeitado
4. **Controle**: Sentir que tem escolhas e autonomia
5. **Surpresa Positiva**: Ser encantado de forma inesperada

### Os Gatilhos Mentais do Omotenashi

**Reciprocidade**: Quando damos algo primeiro, o cliente naturalmente quer retribuir
**Escassez**: Tratar cada cliente como especial, não como "mais um"
**Autoridade**: Profissionalismo e conhecimento geram confiança
**Prova Social**: Clientes satisfeitos atraem mais clientes
**Afeição**: Clientes compram de quem gostam

## 4.2 O Efeito Positividade

Estudos mostram que experiências positivas no atendimento criam:

- Liberação de ocitocina (hormônio do afeto)
- Maior tolerância a erros
- Fidelização duradoura
- Recomendação espontânea

### A Fórmula do Encantamento

O encantamento ocorre quando: **Expectativa < Experiência Real**

O Omotenashi busca constantemente superar expectativas de forma genuína.

## 4.3 Lidando com Clientes Difíceis

### A Abordagem Japonesa

1. **Manter a calma**: A compostura é fundamental
2. **Ouvir completamente**: Deixar o cliente se expressar
3. **Validar sentimentos**: "Compreendo sua frustração"
4. **Resolver rapidamente**: Ação imediata
5. **Acompanhar**: Garantir que a solução foi satisfatória

### Clientes Difíceis como Oportunidade

Cada cliente insatisfeito que tem sua experiência transformada se torna o cliente mais fiel.

## Exercícios

1. **Role-playing**: Pratique lidar com um cliente difícil usando a abordagem Omotenashi
2. **Observação**: Identifique os gatilhos mentais que você percebe em seu próprio comportamento como consumidor`,
      },
      {
        title: "Capítulo 5: A Linguagem do Corpo no Atendimento",
        slug: "cap5-linguagem-corpo",
        order: 6,
        content: `# Capítulo 5: A Linguagem do Corpo no Atendimento

## 5.1 A Postura que Comunica Respeito

No Japão, a postura corporal é tão importante quanto as palavras.

### A Postura Correta

- Coluna ereta, ombros relaxados
- Mãos à frente do corpo ou ao lado
- Pés ligeiramente afastados (base firme)
- Cabeça ereta, queixo paralelo ao chão

### Posturas a Evitar

- Braços cruzados (defensivo)
- Mãos nos bolsos (desrespeitoso)
- Apoiar-se em móveis (desleixo)
- Virar as costas ao cliente

## 5.2 O Poder do Sorriso

O sorriso japonês (微笑み - Hohoemi) é diferente do sorriso ocidental.

### Tipos de Sorriso no Serviço

1. **Sorriso de Boas-Vindas**: Amplo, acolhedor, acompanhado de "Irasshaimase!"
2. **Sorriso de Atenção**: Suave, enquanto ouve o cliente
3. **Sorriso de Despedida**: Grato, que deixa uma impressão duradoura

### O Sorriso com os Olhos

No Japão, diz-se que o sorriso verdadeiro está nos olhos (目が笑う - me ga warau). Um sorriso forçado não engana.

## 5.3 O Contato Visual

- **No Japão**: Contato visual prolongado é considerado agressivo. Olha-se para a região do nó da gravata ou entre os olhos.
- **Adaptação Brasileira**: Contato visual moderado, alternando entre os olhos e o sorriso.

## 5.4 Gestos que Encantam

### Gestos Positivos
- Inclinar a cabeça ao ouvir
- Acenar levemente com a cabeça (entendimento)
- Mãos abertas (sinceridade)
- Gestos suaves e controlados

### Gestos a Evitar
- Apontar com o dedo
- Gestos bruscos
- Coçar-se ou ajustar a roupa
- Olhar o relógio ou celular

## Exercícios

1. **Prática de Postura**: Passe 5 minutos por dia praticando a postura Omotenashi em frente ao espelho
2. **Observação**: Em lojas e restaurantes, observe a linguagem corporal dos atendentes. O que funciona?`,
      },
      {
        title: "Capítulo 6: Omotenashi em Restaurantes",
        slug: "cap6-restaurantes",
        order: 7,
        content: `# Capítulo 6: Omotenashi em Restaurantes

## 6.1 A Filosofia do Irasshaimase

Irasshaimase (いらっしゃいませ) é muito mais que "bem-vindo". É um convite à experiência.

### O Ritual de Boas-Vindas

1. Saudação coletiva e entusiasmada
2. Sorriso genuíno
3. Postura de respeito (inclinação)
4. Guiar o cliente ao lugar
5. Oferecer água/toalha imediatamente

## 6.2 O Atendimento à Mesa Japonesa

### Antes do Pedido
- Água ou chá verde imediatamente
- Toalha quente (oshibori) para limpar as mãos
- Cardápio apresentado com as duas mãos

### Durante a Refeição
- O tempo certo para cada prato
- Observar sem ser invasivo
- Pratos retirados com discrição

### Após a Refeição
- Perguntar se foi satisfatório
- Acompanhar até a porta
- Agradecer com reverência

## 6.3 Adaptação para Restaurantes Brasileiros

- Oshibori → Toalha refrescante ou lenço umedecido
- Chá verde → Água ou bebida de boas-vindas
- Saudação coletiva → Equipe alinhada no "Bem-vindo!"

## 6.4 O Cardápio como Experiência

- Descrições que contam histórias
- Papel de qualidade, design cuidado
- Facilidade de navegação
- Opções claras para restrições alimentares`,
      },
      {
        title: "Capítulo 7: Omotenashi em Hotéis",
        slug: "cap7-hoteis",
        order: 8,
        content: `# Capítulo 7: Omotenashi em Hotéis e Hospedagem

## 7.1 O Espírito do Ryokan

O ryokan (pousada tradicional japonesa) é a expressão máxima do Omotenashi na hospitalidade.

### Elementos do Ryokan

1. **Check-in Personalizado**: Chá e doce de boas-vindas no quarto
2. **Quarto com Vista para o Jardim**: Conexão com a natureza
3. **Futon Preparado Durante o Jantar**: A cama aparece magicamente
4. **Banho Termal (Onsen)**: Purificação do corpo e da alma
5. **Refeição Kaiseki**: Múltiplos pratos, arte culinária

### A Anfitriã (Okami-san)

A okami-san é a alma do ryokan. Ela:
- Recebe pessoalmente cada hóspede
- Lembra-se de preferências de visitantes recorrentes
- Antecipa necessidades
- Cria uma atmosfera familiar

## 7.2 Adaptação para Hotéis Brasileiros

### O que Podemos Implementar

1. **Boas-Vindas Personalizadas**: Não apenas "check-in", mas uma recepção
2. **Toque Local**: Elementos da cultura brasileira no quarto
3. **Antecipação**: Saber por que o hóspede está viajando
4. **Despedida Memorável**: Algo que o hóspede leve na memória

### Programa de Fidelidade Omotenashi

Não é sobre pontos — é sobre experiências:
- Aniversário do hóspede → surpresa no quarto
- Hóspede recorrente → upgrade sem pedir
- Ocasião especial → algo único e pessoal`,
      },
      {
        title: "Capítulo 8: Omotenashi no Varejo",
        slug: "cap8-varejo",
        order: 9,
        content: `# Capítulo 8: Omotenashi no Varejo

## 8.1 A Filosofia do Varejo Japonês

O varejo japonês é conhecido mundialmente pela excelência. Vamos explorar seus segredos.

### Características do Varejo Japonês

1. **Apresentação Impecável**: Produtos como obras de arte
2. **Embalagem Caprichada**: Presentear é uma arte
3. **Atendimento Especializado**: Vendedores como consultores
4. **Limpeza Obsessiva**: Cada centímetro da loja impecável
5. **Variedade Curada**: Qualidade sobre quantidade

## 8.2 A Arte de Embrulhar Presentes

O embrulho de presentes japonês (包み - Tsutsumi) é tão importante quanto o presente.

### Técnicas de Embrulho

1. **Furoshiki**: Tecido que se transforma em embalagem
2. **Mizuhiki**: Amarras decorativas com significado
3. **Origami Tsutsumi**: Dobraduras que encantam

### Por que Isso Importa no Varejo

A embalagem é a primeira coisa que o cliente vê ao usar o produto. Uma embalagem bem-feita:
- Valoriza o produto
- Mostra cuidado
- Cria expectativa positiva
- Gera compartilhamento (marketing gratuito)

## 8.3 O Vendedor Consultor

No Japão, o vendedor não empurra produtos — ele soluciona problemas.

### Perfil do Vendedor Omotenashi

- Conhecimento profundo dos produtos
- Escuta ativa
- Honestidade sobre limitações
- Soluções personalizadas
- Acompanhamento pós-venda`,
      },
      {
        title: "Capítulo 9: Omotenashi em Serviços Profissionais",
        slug: "cap9-servicos-profissionais",
        order: 10,
        content: `# Capítulo 9: Omotenashi em Serviços Profissionais

## 9.1 Consultoria, Advocacia e Serviços Financeiros

O Omotenashi não se limita a hotéis e restaurantes. Serviços profissionais também podem se beneficiar.

### Princípios Adaptados

1. **Antecipação**: Preparar documentos e análises antes da reunião
2. **Respeito**: Tratar o tempo do cliente como sagrado
3. **Clareza**: Explicar termos complexos de forma compreensível
4. **Acompanhamento**: Não desaparecer após o serviço

### O Escritório como Espaço Omotenashi

- Ambiente que transmite confiança
- Café/chá de qualidade oferecido
- Sala de reunião confortável
- Material informativo relevante

## 9.2 Omotenashi em Call Centers

### Desafios do Atendimento Telefônico

- Falta de contato visual
- Tempo limitado
- Cliente já frustrado

### Soluções Omotenashi

1. **Tom de Voz**: Treinamento específico para transmitir calor humano
2. **Personalização**: Usar o nome do cliente, lembrar histórico
3. **Empatia Real**: Não apenas script, mas conexão genuína
4. **Resolução Ágil**: Cliente não quer repetir a história
5. **Follow-up**: Ligar de volta para confirmar satisfação`,
      },
      {
        title: "Capítulo 10: Omotenashi Digital (DX)",
        slug: "cap10-omotenashi-digital",
        order: 11,
        content: `# Capítulo 10: Omotenashi Digital

## 10.1 Leve a Alma Japonesa para o Digital

Omotenashi não é apenas presencial. Podemos — e devemos — aplicá-lo ao ambiente digital.

### Princípios do Omotenashi Digital

1. **Antecipação Digital**: Prever perguntas e necessidades do usuário
2. **Navegação Intuitiva**: O site "adivinha" o que o cliente procura
3. **Resposta Ágil**: Cada hora de espera é um desrespeito
4. **Personalização**: Tratar cada visitante como único
5. **Surpresa Positiva**: Pequenos encantamentos digitais

## 10.2 Design de Sites com Alma Omotenashi

- **Tempo de Carregamento**: Cada segundo de espera é falta de respeito
- **Facilidade de Navegação**: O cliente nunca deve se sentir perdido
- **Estética Cuidadosa**: Design limpo, elegante, funcional
- **Acessibilidade**: Atender todos os públicos

## 10.3 E-mail Marketing Omotenashi

### Regras de Ouro

1. **Permissão**: Enviar apenas para quem quer receber
2. **Relevância**: Conteúdo útil, não apenas promoções
3. **Frequência Respeitosa**: Não saturar a caixa de entrada
4. **Personalização**: Não é "Prezado Cliente", é "Prezado João"
5. **Design Cuidadoso**: Visualmente agradável, mobile-friendly

## 10.4 Chatbots com Espírito Humano

- Tom amigável e acolhedor
- Opção de falar com humano sempre disponível
- Memória de interações anteriores
- Resolução autônoma de problemas comuns`,
      },
      {
        title: "Capítulo 11: Treinamento Omotenashi",
        slug: "cap11-treinamento",
        order: 12,
        content: `# Capítulo 11: Treinamento Omotenashi

## 11.1 Desenvolvendo uma Cultura de Serviço

### Programa de Imersão Omotenashi

**Semana 1: Fundamentos**
- Dia 1: Filosofia do Omotenashi — história e princípios
- Dia 2: Os 6 pilares na prática
- Dia 3: Autoconhecimento — quem sou eu como servidor?
- Dia 4: Observação — visitar referências de serviço
- Dia 5: Reflexão e diário de bordo

**Semana 2: Técnicas**
- Dia 1: Linguagem corporal e postura
- Dia 2: Comunicação verbal — o poder das palavras
- Dia 3: Antecipação de necessidades
- Dia 4: Lidando com situações difíceis
- Dia 5: Role-playing e feedback

**Semana 3: Implementação**
- Dia 1: Mapeamento da jornada do cliente
- Dia 2: Identificação de pontos de melhoria
- Dia 3: Criação de padrões Omotenashi
- Dia 4: Implementação piloto
- Dia 5: Avaliação e ajustes

## 11.2 O Jogo do Omotenashi

### Atividade: O Desafio do Encantamento

Divida a equipe em grupos. Cada grupo recebe um cenário de atendimento. Objetivo: criar uma experiência tão marcante que o cliente nunca esqueça.

### Cenários para Prática

1. Cliente chega ao hotel depois de um voo cancelado
2. Cliente recebe o produto errado
3. Cliente está célebre em uma ocasião especial
4. Cliente tem uma necessidade especial não atendida`,
      },
      {
        title: "Capítulo 12: Métricas e Avaliação",
        slug: "cap12-metricas",
        order: 13,
        content: `# Capítulo 12: Métricas e Avaliação Omotenashi

## 12.1 Medindo o Imensurável

Como medir algo tão subjetivo quanto o encantamento?

### Métricas Tradicionais vs. Omotenashi

| Métrica Tradicional | Métrica Omotenashi |
|--------------------|--------------------|
| NPS | Índice de Encantamento |
| CSAT (satisfação) | IE (Impacto Emocional) |
| Tempo médio | Profundidade da conexão |
| Taxa de conversão | Taxa de recomendação espontânea |

## 12.2 Ferramentas de Avaliação

### Pesquisa de Satisfação Reformulada

Em vez de "De 0 a 10, quanto você recomendaria?"

Perguntas Omotenashi:
- "Você sentiu que o atendente realmente se importava com você?"
- "Houve algum momento que te surpreendeu positivamente?"
- "Você se sentiu compreendido em suas necessidades?"
- "Você voltaria especificamente por causa do atendimento?"

### Observação Participante

Avaliadores treinados que vivenciam o serviço como clientes e avaliam:
1. Antecipação (perceberam minha necessidade?)
2. Respeito (fui tratado com dignidade?)
3. Autenticidade (o atendimento foi genuíno?)
4. Detalhes (os pequenos gestos estavam presentes?)
5. Kaizen (houve melhoria desde a última visita?)

## 12.3 O Ciclo de Feedback Omotenashi

1. **Coleta**: Pesquisas, observação, feedback espontâneo
2. **Análise**: Identificar padrões e oportunidades
3. **Ação**: Implementar melhorias
4. **Verificação**: A melhoria funcionou?
5. **Padronização**: Incorporar o que funciona`,
      },
    ]

    for (const chapter of [...chapters, ...additionalChapters]) {
      const exists = await prisma.ebookChapter.findUnique({ where: { slug: chapter.slug } })
      if (!exists) {
        await prisma.ebookChapter.create({ data: chapter })
      }
    }

    const companyExists = await prisma.company.findUnique({ where: { email: "empresa@exemplo.com" } })
    if (!companyExists) {
      const company = await prisma.company.create({
        data: {
          name: "Grupo Alpha Hospitality",
          email: "empresa@exemplo.com",
          phone: "(11) 99999-8888",
          cnpj: "12.345.678/0001-90",
          plan: "business",
          active: true,
        },
      })

      const demoUsers = [
        { name: "Carlos Santos", email: "carlos@exemplo.com", password: "123456", phone: "(11) 98888-7777" },
        { name: "Ana Oliveira", email: "ana@exemplo.com", password: "123456", phone: "(11) 97777-6666" },
        { name: "Pedro Costa", email: "pedro@exemplo.com", password: "123456", phone: "(11) 96666-5555" },
      ]

      for (const u of demoUsers) {
        const exists = await prisma.user.findUnique({ where: { email: u.email } })
        if (!exists) {
          const hash = await bcrypt.hash(u.password, 12)
          const user = await prisma.user.create({
            data: { name: u.name, email: u.email, password: hash, phone: u.phone, companyId: company.id },
          })
          await prisma.enrollment.create({ data: { userId: user.id, plan: "business", active: true } })
        }
      }
    }

    return NextResponse.json({ message: "Seed concluído com sucesso!" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao popular banco" }, { status: 500 })
  }
}
