"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronDown, Users, Building2, Target, Sparkles, TrendingUp, ShieldCheck, Star, Phone, Briefcase, GraduationCap, BarChart3, Globe } from "lucide-react"

const WPP = "https://wa.me/5537984189874?text=Olá!%20Sou%20de%20uma%20empresa%20de%20RH%20e%20quero%20saber%20mais%20sobre%20o%20Omotenashi%20para%20oferecer%20aos%20meus%20clientes."

const plans = [
  {
    badge: "START RH",
    title: "Até 3 Clientes",
    desc: "Para consultorias iniciantes",
    price: "997",
    items: [
      "Hasta 3 empresas clientes",
      "Dashboard por cliente",
      "Certificacao corporativa",
      "Relatorios individuais",
      "Suporte 24h",
    ],
  },
  {
    badge: "MAIS VENDIDO",
    title: "Até 10 Clientes",
    desc: "Consultorias em crescimento",
    price: "2.497",
    items: [
      "Hasta 10 empresas clientes",
      "Dashboard completo por cliente",
      "Certificacao corporativa",
      "Consultoria 2h inclusa",
      "Material personalizado por cliente",
      "Suporte prioritario",
    ],
    featured: true,
  },
  {
    badge: "PRO RH",
    title: "Clientes Ilimitados",
    desc: "Agencias consolidadas",
    price: "4.997",
    items: [
      "Clientes ilimitados",
      "Dashboard avancado com metricas",
      "Certificacao corporativa",
      "Consultoria 4h mensal",
      "Material white-label",
      "Suporte VIP 24h",
      "API de integracao",
    ],
  },
  {
    badge: "WHITE LABEL",
    title: "Revenda Completa",
    desc: "Trainee com sua marca",
    price: "9.997",
    items: [
      "Plataforma com sua marca",
      "Dominio personalizado",
      "Clientes ilimitados",
      "Dashboard white-label",
      "Consultoria 8h mensal",
      "Material completo rebranded",
      "Suporte dedicado",
      "Atualizacoes vitalicias",
    ],
  },
]

const faq = [
  {
    q: "Como funciona para consultorias de RH?",
    a: "Você compra o treinamento Omotenashi e revende para seus clientes. Cada cliente tem seu próprio dashboard de progresso. Você gerencia tudo de um painel central e emite certificados personalizados.",
  },
  {
    q: "Posso revender com minha marca?",
    a: "Sim! O plano White Label permite que você coloque sua marca na plataforma, use domínio próprio e tenha material didático personalizado. Seus clientes nem saberão que é Omotenashi — acham que é seu.",
  },
  {
    q: "Preciso ter equipe técnica?",
    a: "Não. A plataforma é 100% gerenciável pelo painel web. Você cadastra clientes, acompanha progresso e gera relatórios sem escrever uma linha de código.",
  },
  {
    q: "Qual o prazo para começar a revender?",
    a: "Imediato. Após a contratação, você recebe acesso ao painel master e já pode cadastrar seus primeiros clientes em minutos.",
  },
  {
    q: "Funciona para agências de treinamento corporativo?",
    a: "Perfeitamente. O Omotenashi é um treinamento de atendimento completo (30 aulas, e-book, certificação) que você pode incluir no seu portfólio de soluções para empresas.",
  },
]

export default function RHPage() {
  return (
    <div>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              🏢 Para Empresas de RH
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Transforme o Atendimento dos <span className="gradient-text">Seus Clientes</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Ofereça o treinamento Omotenashi como um serviço diferenciado para as empresas que você atende.
              <strong className="text-foreground"> A plataforma completa com dashboard, certificação e acompanhamento</strong>
              {" "}— sem precisar criar conteúdo do zero.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="xl" className="w-full text-base gap-2 bg-green-600 hover:bg-green-700">
                  <Phone className="h-5 w-5" /> Quero para Minha Consultoria
                </Button>
              </a>
              <a href="#planos">
                <Button size="xl" variant="outline" className="w-full sm:w-auto text-base gap-2">
                  Ver Planos <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> B2B para RH</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Revenda para clientes</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> White label disponível</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Por que RHs Escolhem o Omotenashi</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                <h3 className="text-xl font-semibold mb-2">Produto Pronto pra Revenda</h3>
                <p className="text-sm text-muted-foreground">30 aulas, e-book, certificação e dashboard. Você não precisa criar nada — só cadastrar seus clientes e acompanhar.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-semibold mb-2">Dashboard por Cliente</h3>
                <p className="text-sm text-muted-foreground">Cada empresa cliente tem seu próprio painel com progresso individual dos funcionários. Você acompanha tudo de um só lugar.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-semibold mb-2">Certificação Exclusiva</h3>
                <p className="text-sm text-muted-foreground">Cada empresa cliente recebe certificação corporativa reconhecida. Diferencial competitivo que agrega valor ao seu portfólio.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">O que Você Ganha</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "Zero Criação de Conteúdo", desc: "Não precisa produzir material, gravar videoaulas ou criar apostilas. O curso completo já está pronto — é só revender." },
              { icon: Target, title: "Margem Atraente", desc: "Compre no atacado e revenda com sua margem. Planos a partir de R$ 997 para até 3 clientes. Lucro garantido." },
              { icon: GraduationCap, title: "Resultados Reais", desc: "+47% NPS, +40% ticket médio, -60% evasão. Dados que você pode usar para vender para seus clientes." },
              { icon: TrendingUp, title: "Escalabilidade", desc: "Um cliente ou 100 — a plataforma aguenta. Você escala sem precisar contratar mais equipe ou investir em infraestrutura." },
            ].map((b, i) => (
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

      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-amber-950/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-3xl mx-auto border-red-500/30 bg-gradient-to-b from-red-950/10 to-card/50 text-center">
            <CardContent className="p-10">
              <div className="text-6xl mb-6">🤝</div>
              <Badge variant="accent" className="mb-4">SEM COMPROMISSO</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Agende uma Conversa com a Gente</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Vamos entender seu momento e mostrar como o Omotenashi pode ser o próximo produto do seu portfólio. 
                Em 30 minutos você sai com tudo claro — precificação, modelo de revenda e próximos passos.
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
            <Badge variant="accent" className="mb-4">Planos para RH</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Escolha Seu Modelo</h2>
            <p className="text-muted-foreground">Da consultoria iniciante à agência white-label</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
          <h2 className="text-3xl font-display font-bold text-center mb-12">Dúvidas de Consultorias de RH</h2>
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
          <div className="text-6xl mb-6">🏯</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Vamos Crescer Juntos?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Adicione o Omotenashi ao seu portfólio de soluções e ofereça treinamento de excelência para seus clientes.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-12">
              <Phone className="h-5 w-5" /> Falar com Sergio Abe
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">📞 (37) 98418-9874 • Atendimento personalizado • Sem compromisso</p>
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
