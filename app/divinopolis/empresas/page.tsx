"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronDown, MapPin, Users, Clock, Phone, Building2, Target, Sparkles, Heart, TrendingUp, Store, ShieldCheck, Star } from "lucide-react"

const WPP = "https://wa.me/5537984189874?text=Olá!%20Sou%20empresário(a)%20em%20Divinópolis%20e%20quero%20saber%20mais%20sobre%20o%20Omotenashi%20para%20minha%20empresa."

const plans = [
  {
    badge: "START",
    title: "Até 10 Func.",
    desc: "Pequenas empresas e lojas",
    price: "997",
    items: ["Curso para 10 funcionários", "Dashboard de progresso", "Certificação corporativa", "Suporte 24h"],
  },
  {
    badge: "MAIS VENDIDO",
    title: "Até 30 Func.",
    desc: "Empresas de médio porte",
    price: "1.497",
    items: ["Curso para 30 funcionários", "Dashboard de progresso", "Certificação corporativa", "Consultoria 2h inclusa", "Suporte prioritário"],
    featured: true,
  },
  {
    badge: "EMPRESA ++",
    title: "Até 50 Func.",
    desc: "Empresas consolidadas",
    price: "2.497",
    items: ["Curso para 50 funcionários", "Dashboard de progresso", "Certificação corporativa", "Consultoria 4h inclusa", "Material personalizado", "Suporte VIP"],
  },
  {
    badge: "COMBO",
    title: "Curso + Consultoria",
    desc: "Transformação completa",
    price: "3.200",
    items: ["Curso ilimitado para equipe", "4h de consultoria in loco", "Dashboard completo", "Material personalizado", "Relatórios mensais", "Acompanhamento 3 meses"],
  },
]

const faq = [
  {
    q: "Minha empresa é pequena, isso funciona para mim?",
    a: "Sim! O Omotenashi é ainda mais poderoso em empresas pequenas, onde cada funcionário tem contato direto com o cliente. Uma loja com 5 funcionários treinados pode superar qualquer concorrente em experiência do cliente.",
  },
  {
    q: "Quanto tempo para ver resultados?",
    a: "Empresas relatam melhora no feedback dos clientes já na primeira semana. Resultados mensuráveis em NPS e vendas aparecem em 30 dias.",
  },
  {
    q: "Funciona para qualquer tipo de negócio?",
    a: "Sim. Já aplicamos em lojas de roupas, restaurantes, clínicas, concessionárias, escritórios de advocacia, academias, salões de beleza e muito mais. O Omotenashi se adapta ao seu segmento.",
  },
  {
    q: "Meus funcionários vão gostar?",
    a: "Sim. O Omotenashi não é mais um 'treinamento chato'. É uma filosofia que faz as pessoas se sentirem orgulhosas do próprio trabalho. Equipes treinadas têm maior satisfação e menor rotatividade.",
  },
]

export default function EmpresasPage() {
  return (
    <div>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-red-950/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              🏢 Empresas em Divinópolis
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Sua Empresa Já Tem o Jeito Mineiro de <span className="gradient-text">Acolher</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Agora imagine elevar esse acolhimento ao <strong className="text-foreground">padrão japonês de excelência</strong>.
              Onde cada funcionário — da recepção ao gerente — antecipa necessidades, encanta clientes e cria
              experiências que geram fidelidade e indicação espontânea.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="xl" className="w-full text-base gap-2 bg-green-600 hover:bg-green-700">
                  <Phone className="h-5 w-5" /> Quero para Minha Empresa
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
              <span className="flex items-center gap-1"><Store className="h-4 w-4" /> Qualquer segmento</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Resultados que Empresas de Divinópolis Já Alcançaram</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                <h3 className="text-xl font-semibold mb-2">+40% NPS</h3>
                <p className="text-sm text-muted-foreground">Empresas que implementaram o Omotenashi viram seu Net Promoter Score saltar em média 40 pontos em 3 meses.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-xl font-semibold mb-2">+25% Ticket Médio</h3>
                <p className="text-sm text-muted-foreground">Clientes bem atendidos compram mais e com mais frequência. O ticket médio sobe naturalmente quando a experiência é excepcional.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-semibold mb-2">-60% Evasão</h3>
                <p className="text-sm text-muted-foreground">Clientes que se sentem especiais não trocam de fornecedor. A taxa de churn cai drasticamente com o Omotenashi.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">O que Sua Empresa Ganha</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: "Clientes Fiéis", desc: "Clientes que se sentem especiais voltam sempre e indicam para amigos e familiares." },
              { icon: Sparkles, title: "Equipe Motivada", desc: "Funcionários que entendem o propósito do seu trabalho atendem com orgulho e dedicação." },
              { icon: Target, title: "Diferencial Real", desc: "Em um mercado de produtos e preços iguais, o atendimento excepcional é o que separa você da concorrência." },
              { icon: ShieldCheck, title: "Resultados Garantidos", desc: "Dashboard em tempo real mostrando o progresso da sua equipe e o impacto no negócio." },
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
        <div className="absolute inset-0 bg-linear-to-r from-red-950/20 via-amber-950/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-3xl mx-auto border-red-500/30 bg-linear-to-b from-red-950/10 to-card/50 text-center">
            <CardContent className="p-10">
              <div className="text-6xl mb-6">🎯</div>
              <Badge variant="accent" className="mb-4">GRATUITO</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Workshop Presencial de 1h na Sua Empresa</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Vou até você em Divinópolis. Sua equipe vai experimentar na prática o poder do Omotenashi e você vai ver como é simples começar a transformação. Sem custo, sem compromisso.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-sm">
                <div className="p-3 rounded-lg bg-secondary/50"><p className="font-semibold">⏱️ 1 hora</p><p className="text-muted-foreground text-xs">Dinâmico e prático</p></div>
                <div className="p-3 rounded-lg bg-secondary/50"><p className="font-semibold">👥 Sua equipe</p><p className="text-muted-foreground text-xs">Todos participam</p></div>
                <div className="p-3 rounded-lg bg-secondary/50"><p className="font-semibold">📍 Na sua empresa</p><p className="text-muted-foreground text-xs">Vou até você</p></div>
                <div className="p-3 rounded-lg bg-secondary/50"><p className="font-semibold">🎁 Diagnóstico</p><p className="text-muted-foreground text-xs">3 pontos de melhoria</p></div>
              </div>
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
            <Badge variant="accent" className="mb-4">Preços Especiais</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Planos para Empresas</h2>
            <p className="text-muted-foreground">Do pequeno negócio à empresa consolidada</p>
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
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Dúvidas de Empresários</h2>
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
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Vamos Transformar Sua Empresa?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Agende seu workshop gratuito agora. Em 1 hora sua equipe vai sentir na prática o poder do Omotenashi.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-12">
              <Phone className="h-5 w-5" /> Agendar Workshop Grátis
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">📍 Divinópolis e região • Vou até sua empresa • Sem compromisso</p>
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
