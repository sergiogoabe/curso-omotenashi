"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronDown, Users, Building2, Target, Sparkles, TrendingUp, ShieldCheck, Star, Phone, GraduationCap, BarChart3, Globe, Trophy, Medal, HeartHandshake } from "lucide-react"

const WPP = "https://wa.me/5537984189874?text=Olá!%20Sou%20de%20uma%20empresa%20e%20quero%20saber%20mais%20sobre%20o%20treinamento%20Omotenashi%20in-company."

const plans = [
  {
    badge: "ESSENCIAL",
    title: "Até 30 Funcionários",
    desc: "Para pequenas equipes",
    price: "2.997",
    items: [
      "Até 30 colaboradores",
      "Dashboard de progresso",
      "Certificação corporativa",
      "Relatórios mensais",
      "Suporte 24h",
    ],
  },
  {
    badge: "MAIS VENDIDO",
    title: "Até 100 Funcionários",
    desc: "Empresas em crescimento",
    price: "5.997",
    items: [
      "Até 100 colaboradores",
      "Dashboard completo",
      "Certificação corporativa",
      "Consultoria 2h inclusa",
      "Material personalizado",
      "Suporte prioritário",
    ],
    featured: true,
  },
  {
    badge: "EMPRESARIAL",
    title: "Até 300 Funcionários",
    desc: "Médias e grandes empresas",
    price: "12.997",
    items: [
      "Até 300 colaboradores",
      "Dashboard avançado com métricas",
      "Certificação corporativa",
      "Consultoria 4h mensal",
      "Material white-label",
      "Suporte VIP 24h",
      "Relatórios por departamento",
    ],
  },
  {
    badge: "ENTERPRISE",
    title: "Ilimitado",
    desc: "Corporações de grande porte",
    price: "Sob consulta",
    items: [
      "Colaboradores ilimitados",
      "Dashboard enterprise",
      "Certificação corporativa",
      "Consultoria 8h mensal",
      "Plataforma white-label",
      "Suporte dedicado",
      "API de integração",
      "Treinamento presencial opcional",
    ],
  },
]

const faq = [
  {
    q: "Como funciona o treinamento in-company?",
    a: "Você contrata o Omotenashi para toda sua equipe. Cada colaborador acessa as 30 aulas, e-book e fórum pelo próprio login. Você acompanha o progresso de todos em um dashboard exclusivo da sua empresa.",
  },
  {
    q: "Quanto tempo dura o treinamento?",
    a: "São 30 aulas em 8 categorias, com carga horária total de aproximadamente 40 horas. Cada colaborador pode fazer no próprio ritmo, com acesso vitalício ao conteúdo.",
  },
  {
    q: "Funciona para qualquer segmento?",
    a: "Sim. O Omotenashi é um treinamento de excelência em atendimento que se aplica a qualquer setor: varejo, saúde, hotelaria, restaurantes, indústria, serviços, educação, etc. Adaptamos exemplos para sua realidade.",
  },
  {
    q: "Como medimos os resultados?",
    a: "O dashboard mostra taxa de conclusão, notas nas avaliações, tempo de curso por colaborador e relatórios comparativos por departamento. Você vê quem concluiu, quem está progredindo e quem precisa de incentivo.",
  },
  {
    q: "Tem certificado?",
    a: "Sim! Cada colaborador que concluir o treinamento recebe um certificado corporativo do Omotenashi, reconhecido como treinamento de excelência em atendimento.",
  },
  {
    q: "Podemos personalizar com a marca da empresa?",
    a: "Nos planos Empresarial e Enterprise, o material pode ser white-label com sua marca. Também podemos incluir cases internos da sua empresa nos exemplos do curso.",
  },
]

const results = [
  { metric: "+47%", label: "NPS (Satisfação)" },
  { metric: "+40%", label: "Ticket Médio" },
  { metric: "-60%", label: "Evasão de Clientes" },
  { metric: "+35%", label: "Retenção de Talentos" },
]

const industries = [
  { icon: Building2, name: "Varejo & Lojas" },
  { icon: Building2, name: "Restaurantes & Bares" },
  { icon: Building2, name: "Hotéis & Pousadas" },
  { icon: Building2, name: "Hospitais & Clínicas" },
  { icon: Building2, name: "Indústria" },
  { icon: Building2, name: "Educação" },
  { icon: Building2, name: "Bancos & Finanças" },
  { icon: Building2, name: "Serviços" },
  { icon: Building2, name: "RH & Consultorias" },
]

export default function InCompanyPage() {
  return (
    <div>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-red-950/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              🏢 Treinamento Corporativo
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Transforme o Atendimento da <span className="gradient-text">Sua Equipe</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Treine todos os seus colaboradores com a arte japonesa da hospitalidade.
              <strong className="text-foreground"> 30 aulas, dashboard corporativo, certificação e resultados comprovados</strong>
              {" "}— tudo online, no ritmo da sua equipe.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="xl" className="w-full text-base gap-2 bg-green-600 hover:bg-green-700">
                  <Phone className="h-5 w-5" /> Solicitar Proposta
                </Button>
              </a>
              <a href="#planos">
                <Button size="xl" variant="outline" className="w-full sm:w-auto text-base gap-2">
                  Ver Planos <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> In-Company</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Equipes de 30 a ilimitado</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Trophy className="h-4 w-4" /> Certificação corporativa</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Resultados Comprovados</h2>
            <p className="text-muted-foreground">Dados reais de empresas que implementaram o Omotenashi</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {results.map((r, i) => (
              <Card key={i} className="border-border/50 bg-card/50 text-center">
                <CardContent className="pt-8">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{r.metric}</div>
                  <p className="text-sm text-muted-foreground">{r.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Para Sua Empresa</h2>
            <p className="text-muted-foreground">Ideal para qualquer segmento que lida com clientes</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {industries.map((ind, i) => (
              <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-4 border border-border/50">
                <span className="text-red-400"><Building2 className="h-5 w-5" /></span>
                <span className="text-sm font-medium">{ind.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Por que Escolher o Omotenashi</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <Medal className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                <h3 className="text-xl font-semibold mb-2">Conteúdo Exclusivo</h3>
                <p className="text-sm text-muted-foreground">30 aulas em 8 categorias, e-book com 13 capítulos e ferramentas japonesas como 5S, Kaizen, PDCA, Nemawashi — tudo aplicado ao atendimento.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-semibold mb-2">Dashboard Corporativo</h3>
                <p className="text-sm text-muted-foreground">Acompanhe o progresso individual de cada colaborador em tempo real. Veja taxas de conclusão, notas e rankings por departamento.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <HeartHandshake className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-semibold mb-2">Suporte Personalizado</h3>
                <p className="text-sm text-muted-foreground">Consultoria especializada para adaptar o treinamento à realidade da sua empresa. Inclui cases personalizados e suporte direto com Sergio Abe.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">O que Sua Equipe Vai Aprender</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Star, title: "Filosofia Omotenashi", desc: "A essência do atendimento japonês: antecipação, respeito e excelência em cada interação." },
              { icon: Target, title: "Ferramentas Japonesas", desc: "5S, Kaizen, PDCA, Genchi Genbutsu, Nemawashi e Ikigai aplicados ao atendimento." },
              { icon: Users, title: "Comunicação & Empatia", desc: "Escuta ativa, linguagem corporal, rapport e gestão de conflitos com clientes." },
              { icon: TrendingUp, title: "Excelência Operacional", desc: "Padronização, melhoria contínua e métricas de qualidade no atendimento." },
            ].map((m, i) => (
              <Card key={i} className="border-border/50 bg-card/50 text-center">
                <CardContent className="pt-8">
                  <m.icon className="h-10 w-10 mx-auto mb-4 text-red-400" />
                  <h3 className="font-semibold mb-2">{m.title}</h3>
                  <p className="text-sm text-muted-foreground">{m.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-red-950/20 via-amber-950/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-3xl mx-auto border-red-500/30 bg-linear-to-b from-red-950/10 to-card/50 text-center">
            <CardContent className="p-10">
              <div className="text-6xl mb-6">🤝</div>
              <Badge variant="accent" className="mb-4">SEM COMPROMISSO</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Agende uma Conversa</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Vamos entender a realidade da sua empresa e montar uma proposta personalizada.
                Em 30 minutos você sai com tudo claro — precificação, cronograma e próximos passos.
              </p>
              <a href={WPP} target="_blank" rel="noopener noreferrer">
                <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-base px-10">
                  <Phone className="h-5 w-5" /> Falar com Sergio Abe
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20" id="planos">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Planos Corporativos</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Escolha o Plano Ideal</h2>
            <p className="text-muted-foreground">Da pequena equipe à corporação de grande porte</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <Card key={i} className={`border-border/50 relative ${plan.featured ? "border-red-500/30 bg-linear-to-b from-red-950/10 to-transparent" : ""}`}>
                {plan.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="accent">{plan.badge}</Badge></div>}
                <CardHeader>
                  <Badge variant={plan.featured ? "accent" : "secondary"} className="w-fit">{plan.badge}</Badge>
                  <CardTitle className="text-xl mt-2">{plan.title}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">{plan.price.startsWith("Sob") ? plan.price : `R$ ${plan.price}`}</div>
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
          <h2 className="text-3xl font-display font-bold text-center mb-12">Dúvidas Frequentes</h2>
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
          <div className="text-6xl mb-6">🏯</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Transforme o Atendimento da Sua Empresa</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Treine sua equipe com a arte japonesa da hospitalidade e veja os resultados no NPS, ticket médio e retenção de clientes.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-12">
              <Phone className="h-5 w-5" /> Solicitar Proposta
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">📞 (37) 98418-9874 • Sergio Abe • Atendimento personalizado</p>
          <div className="mt-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">
              ← Voltar para página inicial
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
