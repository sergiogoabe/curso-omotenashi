"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Star, Shield, Building2, Award, Users, TrendingUp, Medal, Heart, Zap, Crown } from "lucide-react"

const benefits = [
  { icon: Shield, title: "Destaque no Mercado", desc: "Seja reconhecido como empresa que investe em excelência no atendimento. O selo é um diferencial competitivo que clientes enxergam." },
  { icon: Medal, title: "Credibilidade Imediata", desc: "Empresas certificadas transmitem mais confiança. O Selo Omotenashi é um atestado público de qualidade no serviço." },
  { icon: TrendingUp, title: "Aumento no NPS", desc: "Empresas que implementaram o treinamento Omotenashi tiveram aumento médio de 47% no NPS em até 6 meses." },
  { icon: Users, title: "Equipe Engajada", desc: "Funcionários treinados em Omotenashi se sentem mais valorizados e atendem melhor. Redução de turnover." },
  { icon: Heart, title: "Fidelização de Clientes", desc: "Clientes bem atendidos voltam e indicam. O Selo Omotenashi sela o compromisso da sua marca com a experiência do cliente." },
  { icon: Crown, title: "Posicionamento Premium", desc: "Empresas com o selo podem cobrar mais por seus produtos e serviços. Qualidade percebida gera valor de marca." },
]

const steps = [
  { num: "01", title: "Escolha o Plano", desc: "Individual ou corporativo. Empresas a partir de R$ 1.497." },
  { num: "02", title: "Treine Sua Equipe", desc: "Acesso completo a 30 aulas sobre Omotenashi, 5S, Kaizen, Ikigai e mais." },
  { num: "03", title: "Seja Avaliado", desc: "Nossa equipe avalia a aplicação dos conceitos no seu negócio." },
  { num: "04", title: "Receba o Selo", desc: "Certificado digital + direito de uso do Selo Omotenashi em todos os canais." },
  { num: "05", title: "Renove Anualmente", desc: "Recertificação com novas aulas e auditoria de manutenção." },
]

const plans = [
  {
    name: "Selo Prata",
    price: "1.497",
    period: "12x R$ 149,70",
    badge: "Até 30 func.",
    color: "border-zinc-500/30",
    features: [
      "Acesso completo 30 aulas (1 ano)",
      "Certificação para até 30 colaboradores",
      "Selo Omotenashi digital (PNG/SVG)",
      "Certificado corporativo",
      "Relatório de progresso da equipe",
      "Suporte por email",
    ],
  },
  {
    name: "Selo Ouro",
    price: "2.497",
    period: "12x R$ 249,70",
    badge: "MAIS VENDIDO",
    color: "border-amber-500/30 bg-linear-to-b from-amber-950/10 to-transparent",
    accent: true,
    features: [
      "Tudo do Selo Prata",
      "Até 50 colaboradores",
      "Selo físico + digital (para fachada)",
      "Consultoria de implementação (2h)",
      "Dashboard individual por funcionário",
      "Suporte prioritário 24h",
      "Relatórios mensais de evolução",
      "Direito de uso em campanhas marketing",
    ],
  },
  {
    name: "Selo Diamante",
    price: "3.200",
    period: "12x R$ 320,00",
    badge: "EMPRESARIAL",
    color: "border-red-500/30",
    features: [
      "Tudo do Selo Ouro",
      "Consultoria presencial (8h)",
      "Selo em acrílico premium para fachada",
      "Auditoria Omotenashi completa",
      "Material personalizado para a empresa",
      "Kit de boas-vindas para equipe",
      "Destaque no site oficial",
      "Renovação com desconto vitalício",
    ],
  },
]

const testimonials = [
  { name: "Carlos Silva", role: "Diretor de RH, Rede de Hotéis", text: "Implementamos o Omotenashi em 12 unidades. O selo virou símbolo de qualidade. Clientes comentam." },
  { name: "Ana Beatriz", role: "CEO, Consultoria ABC", text: "Ter o Selo Omotenashi abriu portas. Grandes clientes nos procuraram por causa dele." },
  { name: "Ricardo Oliveira", role: "Proprietário, Restaurante", text: "Colocamos o selo na fachada e no cardápio. As vendas aumentaram 30% em 3 meses." },
]

const faq = [
  { q: "Preciso fazer o curso inteiro para ganhar o selo?", a: "Sim. O selo certifica que sua equipe completou o treinamento Omotenashi e aplica os conceitos no dia a dia." },
  { q: "O selo expira?", a: "Sim, validade de 1 ano. A renovação anual garante que a empresa continua atualizada com as melhores práticas." },
  { q: "Posso usar o selo no Instagram e site?", a: "Sim! O direito de uso do Selo Omotenashi está incluído em todos os planos corporativos." },
  { q: "Funciona para qualquer tipo de empresa?", a: "Sim. Hotéis, restaurantes, clínicas, escritórios, comércio — qualquer negócio que atenda clientes." },
  { q: "Tem selo físico para fachada?", a: "Nos planos Ouro e Diamante incluímos o selo digital para impressão. No Diamante, enviamos selo em acrílico premium." },
]

export default function SeloPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-red-950/40 via-background to-background" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 30% 40%, rgba(220, 38, 38, 0.10) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(245, 158, 11, 0.06) 0%, transparent 50%)`,
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="accent" className="mb-4 text-sm px-4 py-1.5">🏆 NOVO</Badge>
              <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6">
                O Selo da{" "}
                <span className="gradient-text">Excelência</span>{" "}
                em Atendimento
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Certifique sua empresa com o{" "}
                <strong className="text-foreground">Selo Omotenashi</strong>{" "}
                e mostre ao mercado que seu negócio pratica a mais alta
                forma de hospitalidade. <em className="text-red-400">Destaque-se da concorrência.</em>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="xl" className="gap-2 text-base">
                  <a href="#planos">
                    Quero o Selo Omotenashi <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
                <Button asChild size="xl" variant="outline" className="text-base">
                  <a href="#como-funciona">Como Funciona</a>
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                <span>✅ Renovação anual</span>
                <span>🏛️ Válido para toda empresa</span>
                <span>🇯🇵 Certificação Infinity Agency</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-r from-red-500/20 to-amber-500/20 blur-3xl rounded-full" />
                <img
                  src="/selo-omotenashi.svg"
                  alt="Selo Omotenashi"
                  className="relative w-72 md:w-96 h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-secondary/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "47%", label: "Aumento médio no NPS" },
              { number: "30", label: "Aulas de excelência" },
              { number: "150+", label: "Empresas treinadas" },
              { number: "98%", label: "Satisfação dos alunos" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-display font-bold gradient-text">{s.number}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Benefícios</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Por que ter o <span className="gradient-text">Selo Omotenashi</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mais que um certificado — um posicionamento de mercado que seus clientes reconhecem
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="lesson-card border-border/50 bg-card/50">
                <CardHeader>
                  <b.icon className="h-8 w-8 text-red-400 mb-2" />
                  <CardTitle className="text-lg">{b.title}</CardTitle>
                  <CardDescription>{b.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-secondary/30" id="como-funciona">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Passo a Passo</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Como <span className="gradient-text">Funciona</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Da inscrição ao selo na fachada — 5 passos simples
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-red-600 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="font-display font-bold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[60%] h-0.5 bg-linear-to-r from-red-500/30 to-amber-500/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24" id="planos">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Investimento</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Escolha o <span className="gradient-text">Selo</span> Ideal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Planos corporativos com certificação e direito de uso do Selo Omotenashi
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card key={i} className={`relative ${plan.color}`}>
                {plan.accent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="accent" className="text-xs px-4 py-1">{plan.badge}</Badge>
                  </div>
                )}
                {!plan.accent && plan.badge && (
                  <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-4 py-1">{plan.badge}</Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {i === 0 && <Medal className="h-5 w-5 text-zinc-400" />}
                    {i === 1 && <Award className="h-5 w-5 text-amber-400" />}
                    {i === 2 && <Crown className="h-5 w-5 text-red-400" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="text-3xl font-bold mt-2">
                      R$ {plan.price}
                      <span className="text-base font-normal text-muted-foreground"> ou {plan.period}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full gap-2" size="lg" variant={plan.accent ? "accent" : "default"}>
                    <a href={`https://wa.me/5537984189874?text=Olá!%20Quero%20solicitar%20o%20${encodeURIComponent(plan.name)}%20Omotenashi`} target="_blank" rel="noopener noreferrer">
                      Solicitar {plan.name} <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            🔒 Pagamento 100% seguro • Selo válido por 1 ano • Renovação com condições especiais
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Quem Já Tem o Selo</h2>
            <p className="text-muted-foreground">Empresas que transformaram o atendimento com Omotenashi</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details key={i} className="group border border-border/50 rounded-lg">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="font-medium text-sm">{item.q}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-red-950/20 via-transparent to-amber-950/20" />
        <div className="container mx-auto px-4 relative text-center">
          <img src="/selo-omotenashi.svg" alt="" className="w-32 h-auto mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Sua Empresa Merece Esse Selo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Junte-se às empresas que já transformaram o atendimento e destaque-se da concorrência.
          </p>
          <Button asChild size="xl" className="gap-2 text-lg px-12">
            <a href={`https://wa.me/5537984189874?text=Olá!%20Quero%20solicitar%20o%20Selo%20Omotenashi%20para%20minha%20empresa`} target="_blank" rel="noopener noreferrer">
              Quero Meu Selo <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">Consultoria gratuita • Atendimento personalizado</p>
        </div>
      </section>
    </div>
  )
}
