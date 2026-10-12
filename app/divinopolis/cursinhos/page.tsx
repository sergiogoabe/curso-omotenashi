"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronDown, MapPin, Users, Clock, Phone, BookOpen, Target, Sparkles, Award, TrendingUp, Briefcase, Star } from "lucide-react"

const WPP = "https://wa.me/5537984189874?text=Olá!%20Sou%20diretor(a)%20de%20um%20cursinho%20em%20Divinópolis%20e%20quero%20saber%20mais%20sobre%20o%20workshop%20de%20Omotenashi%20para%20meus%20alunos."

const plans = [
  {
    badge: "EXPERIMENTAL",
    title: "Para Direção",
    desc: "Diretores e coordenadores",
    price: "147",
    items: ["Curso completo (13 aulas)", "E-book 300+ páginas", "Certificado individual", "Acesso vitalício"],
  },
  {
    badge: "CURSINHO +",
    title: "Até 15 Func.",
    desc: "Equipe pedagógica pequena",
    price: "997",
    items: ["Curso para 15 funcionários", "Dashboard de progresso", "Certificação corporativa", "Suporte 24h"],
  },
  {
    badge: "MAIS VENDIDO",
    title: "Até 30 Func.",
    desc: "Cursinho de médio porte",
    price: "1.497",
    items: ["Curso para 30 funcionários", "Dashboard de progresso", "Certificação corporativa", "Consultoria 2h para direção", "Suporte prioritário"],
    featured: true,
  },
  {
    badge: "CURSINHO ++",
    title: "Até 50 Func.",
    desc: "Rede de cursinhos",
    price: "2.497",
    items: ["Curso para 50 funcionários", "Dashboard de progresso", "Certificação corporativa", "Consultoria 4h", "Material personalizado", "Suporte VIP"],
  },
]

const faq = [
  {
    q: "Como o Omotenashi ajuda meus alunos a passar no vestibular?",
    a: "Indiretamente, sim. Alunos que se sentem acolhidos e motivados têm melhor desempenho. O Omotenashi ensina sua equipe a criar um ambiente de suporte emocional que reduz a ansiedade e aumenta o foco dos alunos.",
  },
  {
    q: "O curso é só para professores ou para toda a equipe?",
    a: "Para toda a equipe: professores, recepcionistas, coordenadores e até mesmo o pessoal da limpeza. O Omotenashi é uma cultura organizacional — todos precisam estar alinhados.",
  },
  {
    q: "Quanto tempo até vermos resultados?",
    a: "Os primeiros resultados aparecem em 2 semanas: equipe mais motivada, alunos mais engajados, pais mais satisfeitos. O dashboard permite acompanhar em tempo real.",
  },
]

export default function CursinhosPage() {
  return (
    <div>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              📚 Cursinhos em Divinópolis
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Seu Aluno Aprovado Merece um <span className="gradient-text">Acolhimento</span> Nota 10
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Cursinhos que encantam seus alunos desde a recepção até a sala de aula criam o ambiente ideal
              para o aprendizado. O <strong className="text-foreground">Omotenashi transforma sua equipe</strong> em
              anfitriãs do conhecimento — reduzindo evasão e aumentando resultados.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="xl" className="w-full text-base gap-2 bg-green-600 hover:bg-green-700">
                  <Phone className="h-5 w-5" /> Workshop Grátis para Meu Cursinho
                </Button>
              </a>
              <a href="#planos">
                <Button size="xl" variant="outline" className="w-full sm:w-auto text-base gap-2">
                  Ver Planos <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Divinópolis / MG</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Workshop 1h grátis</span>
              <span>•</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> Equipe completa</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Por que Cursinhos Estão Adotando o Omotenashi</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📉</div>
                <h3 className="text-xl font-semibold mb-2">Redução de Evasão</h3>
                <p className="text-sm text-muted-foreground">Alunos que se sentem acolhidos têm 50% menos chances de desistir. O Omotenashi cria o vínculo emocional que mantém o aluno engajado até a aprovação.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🗣️</div>
                <h3 className="text-xl font-semibold mb-2">Indicação Boca a Boca</h3>
                <p className="text-sm text-muted-foreground">Pais e alunos que vivenciam um atendimento excepcional indicam para amigos e familiares. O Omotenashi transforma seus alunos em promotores da marca.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-xl font-semibold mb-2">Equipe Motivada</h3>
                <p className="text-sm text-muted-foreground">Professores que se sentem valorizados ensinam melhor. O Omotenashi começa de dentro para fora: equipe tratada com excelência reproduz excelência.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-amber-950/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-3xl mx-auto border-red-500/30 bg-gradient-to-b from-red-950/10 to-card/50 text-center">
            <CardContent className="p-10">
              <div className="text-6xl mb-6">🎯</div>
              <Badge variant="accent" className="mb-4">GRATUITO</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Workshop de 1h para Sua Equipe</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Vou até seu cursinho em Divinópolis. Em 1 hora sua equipe vai aprender os fundamentos do Omotenashi e como aplicá-los no dia adia com os alunos.
              </p>
              <a href={WPP} target="_blank" rel="noopener noreferrer">
                <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-base px-10">
                  <Phone className="h-5 w-5" /> Agendar Agora
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20" id="planos">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Preços para Cursinhos</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Planos para Cursinhos</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card key={i} className={`border-border/50 relative ${plan.featured ? "border-red-500/30 bg-gradient-to-b from-red-950/10 to-transparent" : ""}`}>
                {plan.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="accent">{plan.badge}</Badge></div>}
                <CardHeader>
                  <Badge variant={plan.featured ? "accent" : "secondary"} className="w-fit">{plan.badge}</Badge>
                  <CardTitle className="text-xl mt-2">{plan.title}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">R$ {plan.price}</div>
                  <div className="space-y-2">
                    {plan.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />{item}</div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter><a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full"><Button className="w-full" size="sm" variant={plan.featured ? "accent" : "default"}>Quero Este</Button></a></CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Dúvidas de Diretores</h2>
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

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-transparent to-amber-950/20" />
        <div className="container mx-auto px-4 relative text-center">
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Vamos Transformar Seu Cursinho?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Agende seu workshop gratuito e descubra como encantar alunos desde o primeiro contato.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-12">
              <Phone className="h-5 w-5" /> Agendar Workshop Grátis
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">📍 Divinópolis e região • Vou até seu cursinho • Sem compromisso</p>
          <div className="mt-6">
            <Link href="/divinopolis" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">
              ← Voltar para página principal
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
