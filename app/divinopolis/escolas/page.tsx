"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronDown, Star, MapPin, Users, Clock, Phone, GraduationCap, Globe, BookOpen, Target, Sparkles, Heart } from "lucide-react"

const WPP_ESCOLAS = "https://wa.me/5537984189874?text=Olá!%20Sou%20diretor(a)%20de%20uma%20escola%20de%20idiomas%20em%20Divinópolis%20e%20quero%20saber%20mais%20sobre%20o%20workshop%20de%20Omotenashi%20para%20meus%20professores."

const benefits = [
  {
    icon: GraduationCap,
    title: "Professores Encantados",
    desc: "Seus professores vão entender a cultura japonesa por trás do idioma e levar esse conhecimento para a sala de aula.",
  },
  {
    icon: Globe,
    title: "Diferencial Competitivo",
    desc: "Escolas que oferecem formação cultural aos professores têm alunos mais engajados e maior taxa de retenção.",
  },
  {
    icon: Heart,
    title: "Relacionamento com Alunos",
    desc: "O conceito Ichigo Ichie (cada encontro é único) transforma a relação professor-aluno em algo memorável.",
  },
  {
    icon: Target,
    title: "Resultados Mensuráveis",
    desc: "Acompanhe o progresso da sua equipe pelo dashboard e veja a melhora no NPS da escola.",
  },
]

const plans = [
  {
    badge: "Experimental",
    title: "Para Direção",
    desc: "Diretores e coordenadores",
    price: "147",
    items: ["Curso completo (13 aulas)", "E-book 300+ páginas", "Certificado individual", "Acesso vitalício"],
  },
  {
    badge: "ESCOLA +",
    title: "Até 15 Func.",
    desc: "Para equipes de escolas pequenas",
    price: "997",
    items: ["Curso para 15 funcionários", "Dashboard de progresso", "Certificação corporativa", "Suporte 24h"],
    featured: false,
  },
  {
    badge: "MAIS VENDIDO",
    title: "Até 30 Func.",
    desc: "Para escolas de médio porte",
    price: "1.497",
    items: ["Curso para 30 funcionários", "Dashboard de progresso", "Certificação corporativa", "Suporte prioritário", "Consultoria 2h"],
    featured: true,
  },
  {
    badge: "ESCOLA ++",
    title: "Até 50 Func.",
    desc: "Para redes de escolas",
    price: "2.497",
    items: ["Curso para 50 funcionários", "Dashboard de progresso", "Certificação corporativa", "Consultoria 4h", "Material personalizado", "Suporte VIP"],
    featured: false,
  },
]

const faq = [
  {
    q: "Como o Omotenashi se aplica ao ensino de idiomas?",
    a: "O Omotenashi é uma filosofia de hospitalidade profundamente ligada à cultura japonesa. Professores de idiomas que entendem essa filosofia conseguem transmitir não apenas a língua, mas a alma cultural por trás dela — especialmente relevante para escolas que ensinam japonês ou que querem oferecer um diferencial cultural aos seus alunos.",
  },
  {
    q: "Quanto tempo dura o workshop gratuito para escolas?",
    a: "1 hora. Vou até sua escola em Divinópolis, sem compromisso. Adapto o conteúdo para a realidade do ensino de idiomas, com exemplos práticos de como aplicar Omotenashi na relação professor-aluno.",
  },
  {
    q: "Funciona para qualquer idioma?",
    a: "Sim. Embora o Omotenashi seja japonês, os princípios de hospitalidade, antecipação e respeito são universais. Professores de inglês, espanhol, francês e outros idiomas se beneficiam igualmente.",
  },
  {
    q: "Tem certificado para os professores?",
    a: "Sim. Cada professor que completar o curso recebe certificado de conclusão Omotenashi. A escola também recebe certificação corporativa.",
  },
  {
    q: "Como fidelizamos mais alunos com isso?",
    a: "Alunos percebem quando um professor realmente se importa. O Omotenashi ensina a criar conexões genuínas — isso reduz a evasão e aumenta as recomendações boca a boca, que é o principal canal de captação de escolas de idiomas.",
  },
]

export default function EscolasPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              🎌 Escolas de Idiomas em Divinópolis
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Seus Professores Merecem o <span className="gradient-text">Omotenashi</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Sua escola ensina idiomas do mundo inteiro. Agora imagine seus professores
              dominando também a <strong className="text-foreground">filosofia japonesa de hospitalidade</strong> —
              transformando cada aula em uma experiência cultural única que seus alunos nunca vão esquecer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href={WPP_ESCOLAS} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="xl" className="w-full text-base gap-2 bg-green-600 hover:bg-green-700">
                  <Phone className="h-5 w-5" /> Workshop Grátis para Escolas
                </Button>
              </a>
              <a href="#planos">
                <Button size="xl" variant="outline" className="w-full sm:w-auto text-base gap-2">
                  Ver Planos para Escolas <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Divinópolis / MG</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Workshop 1h grátis</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Equipe pedagógica</span>
              <span>•</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> Material incluso</span>
            </div>
          </div>
        </div>
      </section>

      {/* Por que Escolas de Idiomas */}
      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Sinergia Natural</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Por que Omotenashi + Escolas de Idiomas?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cultura e língua caminham juntas. O Omotenashi é a chave que conecta seus professores à alma do Japão.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🇯🇵</div>
                <h3 className="text-xl font-semibold mb-2">Cultura Japonesa na Sala de Aula</h3>
                <p className="text-sm text-muted-foreground">
                  Seus professores vão além do "konnichiwa". Eles entendem os valores por trás das palavras —
                  respeito, hierarquia, harmonia. Isso transforma aulas de japonês em imersão cultural genuína.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold mb-2">Diferencial para Todos os Idiomas</h3>
                <p className="text-sm text-muted-foreground">
                  Os princípios Omotenashi são universais. Professores de inglês, espanhol, francês e alemão
                  aplicam a filosofia para criar conexões mais profundas com os alunos.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-semibold mb-2">Retenção de Alunos</h3>
                <p className="text-sm text-muted-foreground">
                  Alunos não desistem de professores que os encantam. O Omotenashi ensina a antecipar
                  necessidades, criar momentos memoráveis e construir lealdade.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Resultados Mensuráveis</h3>
                <p className="text-sm text-muted-foreground">
                  Dashboard exclusivo para a escola acompanhar o progresso de cada professor.
                  Você vê quem concluiu, quem está engajado e o impacto no atendimento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              O que Sua Escola Ganha
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Benefícios diretos para sua escola, seus professores e seus alunos
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-border/50 bg-card/50 text-center">
                <CardContent className="pt-8">
                  <b.icon className="h-10 w-10 mx-auto mb-4 text-red-400" />
                  <h3 className="font-semibold mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Grátis */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-amber-950/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-3xl mx-auto border-red-500/30 bg-gradient-to-b from-red-950/10 to-card/50 text-center">
            <CardContent className="p-10">
              <div className="text-6xl mb-6">🏫</div>
              <Badge variant="accent" className="mb-4">EXCLUSIVO PARA ESCOLAS</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Workshop Grátis de 1h na Sua Escola
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Vou até sua escola em Divinópolis. Seus professores vão experimentar na prática
                como o Omotenashi transforma a relação com os alunos — sem custo, sem compromisso.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-sm">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-semibold">⏱️ 1 hora</p>
                  <p className="text-muted-foreground text-xs">Focado em educação</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-semibold">👩‍🏫 Professores</p>
                  <p className="text-muted-foreground text-xs">Equipe pedagógica</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-semibold">📍 Na sua escola</p>
                  <p className="text-muted-foreground text-xs">Vou até você</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-semibold">🎁 Diagnóstico</p>
                  <p className="text-muted-foreground text-xs">3 pontos de melhoria</p>
                </div>
              </div>
              <a href={WPP_ESCOLAS} target="_blank" rel="noopener noreferrer">
                <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-base px-10">
                  <Phone className="h-5 w-5" /> Agendar Workshop para Minha Escola
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20" id="planos">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Preços para Escolas</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Planos para Escolas de Idiomas</h2>
            <p className="text-muted-foreground">Condições especiais para instituições de ensino em Divinópolis</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card
                key={i}
                className={`border-border/50 relative ${
                  plan.featured
                    ? "border-red-500/30 bg-gradient-to-b from-red-950/10 to-transparent"
                    : ""
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="accent">{plan.badge}</Badge>
                  </div>
                )}
                <CardHeader>
                  <Badge variant={plan.featured ? "accent" : "secondary"} className="w-fit">
                    {plan.badge}
                  </Badge>
                  <CardTitle className="text-xl mt-2">{plan.title}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">R$ {plan.price}</div>
                  <div className="space-y-2">
                    {plan.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <a href={WPP_ESCOLAS} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full" size="sm" variant={plan.featured ? "accent" : "default"}>
                      Quero Este
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Como Levar o Omotenashi para Sua Escola</h2>
            <p className="text-muted-foreground">Simples, rápido e sem burocracia</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Workshop Grátis", desc: "Vou até sua escola. 1h de imersão no Omotenashi para seus professores." },
              { step: "02", title: "Diagnóstico", desc: "Identifico os 3 pontos críticos de melhoria no atendimento da escola." },
              { step: "03", title: "Curso da Equipe", desc: "Seus professores acessam o curso completo com suporte." },
              { step: "04", title: "Dashboard", desc: "Você acompanha o progresso de cada professor em tempo real." },
            ].map((item, i) => (
              <Card key={i} className="border-border/50 bg-card/50 text-center">
                <CardContent className="pt-8">
                  <div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-red-400">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Dúvidas de Diretores de Escolas
          </h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <details key={i} className="group border border-border/50 rounded-lg">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="font-medium text-sm">{item.q}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-transparent to-amber-950/20" />
        <div className="container mx-auto px-4 relative text-center">
          <div className="text-6xl mb-6">🎌</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Vamos Transformar Sua Escola?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Agende seu workshop gratuito agora. Em 1 hora seus professores vão sentir na prática
            como o Omotenashi pode transformar o ensino de idiomas.
          </p>
          <a href={WPP_ESCOLAS} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-12">
              <Phone className="h-5 w-5" /> Agendar Workshop Grátis para Minha Escola
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            📍 Divinópolis e região • Vou até sua escola • Sem compromisso
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/divinopolis/faculdades" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">🎓 Faculdades →</Link>
            <Link href="/divinopolis/cursinhos" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">📚 Cursinhos →</Link>
            <Link href="/divinopolis/industrias" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">🏭 Indústrias →</Link>
            <Link href="/divinopolis/empresas" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">🏢 Empresas →</Link>
            <Link href="/divinopolis" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">← Principal</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
