"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronDown, MapPin, Users, Clock, Phone, GraduationCap, BookOpen, Target, Sparkles, Heart, Award, TrendingUp } from "lucide-react"

const WPP = "https://wa.me/5537984189874?text=Olá!%20Sou%20coordenador(a)%20de%20uma%20faculdade%20em%20Divinópolis%20e%20quero%20saber%20mais%20sobre%20o%20workshop%20de%20Omotenashi%20para%20meus%20alunos%20e%20professores."

const plans = [
  {
    badge: "Experimental",
    title: "Disciplina Isolada",
    desc: "Para uma turma piloto",
    price: "997",
    items: ["Curso para 30 alunos", "Certificação individual", "Material didático", "Suporte 24h"],
  },
  {
    badge: "MAIS VENDIDO",
    title: "Parceria Semestral",
    desc: "Curso complementar por semestre",
    price: "2.497",
    items: ["Curso para 100 alunos/semestre", "Dashboard de progresso", "Certificação corporativa", "Relatórios de desempenho", "Suporte prioritário"],
    featured: true,
  },
  {
    badge: "FACULDADE ++",
    title: "Parceria Anual",
    desc: "Curso complementar por ano letivo",
    price: "4.997",
    items: ["Curso para 300 alunos/ano", "Dashboard institucional", "Certificação corporativa", "Consultoria 4h para coordenação", "Material personalizado", "Suporte VIP"],
  },
  {
    badge: "INSTITUCIONAL",
    title: "Curso Oficial",
    desc: "Disciplina na grade curricular",
    price: "9.997",
    items: ["Curso ilimitado de alunos", "Dashboard institucional completo", "Certificação integrada à matriz", "Treinamento de professores", "Consultoria 8h presencial", "Suporte VIP 24h", "Relatórios mensais"],
  },
]

const faq = [
  {
    q: "Como incluir o Omotenashi na grade curricular?",
    a: "Oferecemos o curso como disciplina complementar optativa ou como módulo em cursos existentes de Administração, Turismo, Hotelaria, Marketing e Recursos Humanos. A coordenadoria define a melhor abordagem e nós adaptamos.",
  },
  {
    q: "Os alunos recebem certificado?",
    a: "Sim. Cada aluno que completar o curso recebe certificado de conclusão Omotenashi. A faculdade também recebe certificação como instituição parceira.",
  },
  {
    q: "Funciona para cursos que não são de turismo?",
    a: "Sim. O Omotenashi é sobre relacionamento humano — relevante para Administração, RH, Psicologia, Enfermagem, Engenharia (atendimento ao cliente técnico) e qualquer curso que forme profissionais que lidam com pessoas.",
  },
  {
    q: "Tem material para os professores da faculdade?",
    a: "Sim. Incluímos treinamento para os professores que vão ministrar ou recomendar o curso, com material de apoio e plano de aula sugerido.",
  },
  {
    q: "Como medimos o impacto nos alunos?",
    a: "O dashboard institucional mostra o progresso individual e coletivo, taxas de conclusão e engajamento. Podemos correlacionar com o desempenho acadêmico se a faculdade desejar.",
  },
]

export default function FaculdadesPage() {
  return (
    <div>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-red-950/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              🎓 Faculdades em Divinópolis
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Forme Profissionais que <span className="gradient-text">Encantam</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              O mercado não busca mais apenas técnicos competentes. Ele busca profissionais que criam
              <strong className="text-foreground"> experiências memoráveis</strong>. O Omotenashi é o diferencial
              que seus alunos precisam para se destacar em qualquer entrevista.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="xl" className="w-full text-base gap-2 bg-green-600 hover:bg-green-700">
                  <Phone className="h-5 w-5" /> Quero para Minha Faculdade
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
              <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Alunos + Professores</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Diferencial Acadêmico</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Por que Faculdades Estão Adotando o Omotenashi?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-2">Empregabilidade dos Alunos</h3>
                <p className="text-sm text-muted-foreground">Alunos formados com treinamento em experiência do cliente têm 40% mais chances de serem contratados e 60% menor rotatividade no primeiro emprego.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold mb-2">Diferencial do Currículo</h3>
                <p className="text-sm text-muted-foreground">Faculdades que oferecem certificação complementar em Omotenashi se destacam no MEC e atraem mais alunos interessados em formação diferenciada.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-2">Parceria com o Mercado</h3>
                <p className="text-sm text-muted-foreground">Empresas parceiras valorizam faculdades que formam profissionais com visão humanizada. O Omotenashi fortalece a ponte universidade-empresa.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Resultados Mensuráveis</h3>
                <p className="text-sm text-muted-foreground">Dashboard institucional completo: acompanhe o progresso de cada aluno, turma e semestre. Dados reais para a coordenação acadêmica.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-red-950/20 via-amber-950/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-3xl mx-auto border-red-500/30 bg-linear-to-b from-red-950/10 to-card/50 text-center">
            <CardContent className="p-10">
              <div className="text-6xl mb-6">🏛️</div>
              <Badge variant="accent" className="mb-4">GRATUITO PARA COORDENADORES</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Workshop de 1h para sua Coordenação</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Vou até sua faculdade em Divinópolis. Apresento para a coordenação como o Omotenashi pode ser integrado à matriz curricular — sem custo, sem compromisso.
              </p>
              <a href={WPP} target="_blank" rel="noopener noreferrer">
                <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-base px-10">
                  <Phone className="h-5 w-5" /> Agendar para Minha Faculdade
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20" id="planos">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Planos Institucionais</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Planos para Faculdades</h2>
            <p className="text-muted-foreground">Da disciplina isolada à parceria institucional completa</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card key={i} className={`border-border/50 relative ${plan.featured ? "border-red-500/30 bg-linear-to-b from-red-950/10 to-transparent" : ""}`}>
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
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Como Funciona a Parceria</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Workshop com Coordenação", desc: "1h de apresentão sobre Omotenashi e sua aplicação acadêmica." },
              { step: "02", title: "Definição do Modelo", desc: "Escolhemos juntos: disciplina optativa, módulo ou parceria." },
              { step: "03", title: "Onboarding de Alunos", desc: "Alunos acessam o curso com acompanhamento da faculdade." },
              { step: "04", title: "Dashboard e Relatórios", desc: "Coordenação acompanha progresso e resultados em tempo real." },
            ].map((item, i) => (
              <Card key={i} className="border-border/50 bg-card/50 text-center">
                <CardContent className="pt-8">
                  <div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-red-400">{item.step}</div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Dúvidas de Coordenadores</h2>
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
        <div className="absolute inset-0 bg-linear-to-r from-red-950/20 via-transparent to-amber-950/20" />
        <div className="container mx-auto px-4 relative text-center">
          <div className="text-6xl mb-6">🎓</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Vamos Transformar Sua Faculdade?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Agende seu workshop gratuito e descubra como preparar seus alunos para o mercado de experiência.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-12">
              <Phone className="h-5 w-5" /> Agendar Workshop Grátis
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">📍 Divinópolis e região • Vou até sua faculdade • Sem compromisso</p>
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
