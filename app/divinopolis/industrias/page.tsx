"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronDown, MapPin, Users, Clock, Phone, Building2, Target, Sparkles, Award, TrendingUp, Settings, HeadphonesIcon, Truck } from "lucide-react"

const WPP = "https://wa.me/5537984189874?text=Olá!%20Sou%20diretor(a)%20de%20uma%20indústria%20em%20Divinópolis%20e%20quero%20saber%20mais%20sobre%20o%20Omotenashi%20para%20minha%20equipe%20comercial%20e%20atendimento."

const plans = [
  {
    badge: "COMERCIAL",
    title: "Equipe Comercial",
    desc: "Vendedores e representantes",
    price: "997",
    items: ["Curso para 10 funcionários", "Foco em vendas consultivas", "Dashboard de progresso", "Certificação corporativa"],
  },
  {
    badge: "MAIS VENDIDO",
    title: "Comercial + SAC",
    desc: "Vendas + atendimento ao cliente",
    price: "1.997",
    items: ["Curso para 30 funcionários", "Módulos: vendas, SAC, pós-venda", "Dashboard de progresso", "Certificação corporativa", "Consultoria 2h"],
    featured: true,
  },
  {
    badge: "INDÚSTRIA ++",
    title: "Operação Completa",
    desc: "Toda a empresa",
    price: "3.997",
    items: ["Curso para 80 funcionários", "Dashboard completo", "Certificação corporativa", "Consultoria 8h presencial", "Material personalizado", "Suporte VIP", "Relatórios trimestrais"],
  },
]

const faq = [
  {
    q: "Omotenashi funciona para indústria? Não temos contato direto com o cliente final.",
    a: "Sim, e talvez seja ainda mais importante. Cada ponto de contato — do telefone ao e-mail, do representante ao caminhoneiro que entrega — é uma oportunidade de encantar. Indústrias que tratam bem seus distribuidores e parceiros são preferidas mesmo com preço maior.",
  },
  {
    q: "Foco no comercial ou no atendimento?",
    a: "Ambos. O módulo comercial ensina a antecipar necessidades do cliente antes da concorrência. O módulo de atendimento transforma o SAC em centro de fidelização. Oferecemos planos separados ou combinados.",
  },
  {
    q: "Como medimos o ROI?",
    a: "Comparando antes e depois: tempo médio de atendimento, NPS, taxa de recompra, ticket médio. O dashboard da empresa mostra esses indicadores em tempo real.",
  },
  {
    q: "Funciona para indústrias de qualquer segmento?",
    a: "Sim. Metalurgia, alimentos, bebidas, vestuário, química, construção civil — os princípios de hospitalidade e antecipação são universais. Adaptamos os exemplos para seu segmento.",
  },
]

export default function IndustriasPage() {
  return (
    <div>
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              🏭 Indústrias em Divinópolis
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Sua Indústria Já Tem o Melhor Produto. <span className="gradient-text">Agora Tenha o Melhor Atendimento.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Em um mercado onde os produtos são cada vez mais parecidos, o <strong className="text-foreground">atendimento é o novo campo de batalha</strong>.
              Distribuidores, representantes e clientes finais lembram de quem os tratou como especiais.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="xl" className="w-full text-base gap-2 bg-green-600 hover:bg-green-700">
                  <Phone className="h-5 w-5" /> Quero para Minha Indústria
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
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> Qualquer segmento</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Para Toda a Cadeia</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">3 Áreas que o Omotenashi Transforma na Sua Indústria</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-semibold mb-2">SAC e Atendimento</h3>
                <p className="text-sm text-muted-foreground text-left">Cada ligação é uma chance de fidelizar. O Omotenashi ensina sua equipe a tratar cada cliente como único — resolvendo problemas com empatia e antecipação. Redução de reclamações e aumento de NPS.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-semibold mb-2">Equipe Comercial</h3>
                <p className="text-sm text-muted-foreground text-left">Vendedores que praticam Omotenashi não empurram produtos — eles criam soluções. Antecipam necessidades, constroem confiança e fecham negócios mais rentáveis e duradouros.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center">
                <Truck className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-xl font-semibold mb-2">Logística e Pós-Venda</h3>
                <p className="text-sm text-muted-foreground text-left">O momento da entrega é o ponto mais crítico. O Omotenashi transforma motoristas e entregadores em embaixadores da marca. Um cliente bem recebido na entrega é um cliente para sempre.</p>
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
              <div className="text-6xl mb-6">🏭</div>
              <Badge variant="accent" className="mb-4">GRATUITO PARA INDÚSTRIAS</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Workshop de 1h na Sua Indústria</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Vou até sua indústria em Divinópolis. Apresento para a diretoria como o Omotenashi transforma cada ponto de contato com o cliente — do telefone à entrega.
              </p>
              <a href={WPP} target="_blank" rel="noopener noreferrer">
                <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-base px-10">
                  <Phone className="h-5 w-5" /> Agendar para Minha Indústria
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
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Planos para Indústrias</h2>
            <p className="text-muted-foreground">Da equipe comercial à operação completa</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Como Implementamos na Sua Indústria</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Diagnóstico", desc: "Mapeamos todos os pontos de contato com o cliente na sua operação." },
              { step: "02", title: "Workshop com Lideranças", desc: "1h gratuita para alinhar a diretoria sobre o potencial do Omotenashi." },
              { step: "03", title: "Curso por Áreas", desc: "Cada equipe (comercial, SAC, logística) recebe treinamento específico." },
              { step: "04", title: "Dashboard e Suporte", desc: "Acompanhamento contínuo com métricas e suporte para dúvidas." },
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
          <h2 className="text-3xl font-display font-bold text-center mb-12">Dúvidas de Diretores Industriais</h2>
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
          <div className="text-6xl mb-6">🏭</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Vamos Transformar o Atendimento da Sua Indústria?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Agende seu workshop gratuito e descubra como o Omotenashi pode ser seu maior diferencial competitivo.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-12">
              <Phone className="h-5 w-5" /> Agendar Workshop Grátis
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">📍 Divinópolis e região • Vou até sua indústria • Sem compromisso</p>
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
