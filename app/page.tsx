"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronDown, Users, Building2, Star, BookOpen, PlayCircle, GraduationCap, Trophy, Heart, Eye, Gem, Sparkles, Clock, ChevronRight, MessageCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { SakuraPetals } from "@/components/SakuraPetals"
import { ScrollReveal } from "@/components/ScrollReveal"

const testimonials = [
  { name: "Carlos Silva", role: "Diretor de RH, Rede de Hotéis Transamérica", text: "Implementamos o Omotenashi em 12 hotéis. O NPS subiu de 72 para 94 em 6 meses. Resultado impressionante." },
  { name: "Ana Beatriz", role: "CEO, Consultoria ABC", text: "O curso mudou completamente nossa abordagem com clientes. Hoje somos referência em atendimento humanizado." },
  { name: "Ricardo Oliveira", role: "Proprietário, Restaurante Sabor Oriental", text: "Meus funcionários aprenderam a antecipar necessidades. Os clientes percebem e voltam sempre." },
]

const faqItems = [
  { q: "Quanto tempo dura o curso?", a: "O curso tem aproximadamente 20 horas de conteúdo em vídeo, dividido em 5 módulos. Você pode assistir no seu ritmo." },
  { q: "Preciso de conhecimento prévio?", a: "Não. O curso começa dos fundamentos e avança gradualmente." },
  { q: "O certificado é válido?", a: "Sim, nosso certificado é reconhecido e pode ser usado para horas complementares." },
  { q: "Funciona para qualquer tipo de empresa?", a: "Sim. O Omotenashi é adaptável a qualquer segmento: hotelaria, varejo, serviços, saúde, educação, RH/Recursos Humanos (dinâmicas em grupo, treinamentos corporativos) e muito mais." },
  { q: "Tem suporte?", a: "Sim. Alunos têm acesso à comunidade exclusiva e suporte por email." },
]

export default function Home() {
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })

  useEffect(() => {
    fetch("/api/lessons")
      .then((r) => r.json())
      .then((data) => {
        setLessons(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("omotenashi_timer_end")
    let endTime: number
    if (stored && parseInt(stored) > Date.now()) {
      endTime = parseInt(stored)
    } else {
      endTime = Date.now() + 24 * 60 * 60 * 1000
      localStorage.setItem("omotenashi_timer_end", endTime.toString())
    }
    const interval = setInterval(() => {
      const remaining = endTime - Date.now()
      if (remaining <= 0) {
        clearInterval(interval)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }
      const hours = Math.floor(remaining / 3600000)
      const minutes = Math.floor((remaining % 3600000) / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setTimeLeft({ hours, minutes, seconds })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const categories = lessons.reduce((acc: any, lesson: any) => {
    const cat = lesson.category
    if (!acc[cat.slug]) {
      acc[cat.slug] = { name: cat.name, slug: cat.slug, lessons: [] }
    }
    acc[cat.slug].lessons.push(lesson)
    return acc
  }, {} as Record<string, { name: string; slug: string; lessons: any[] }>)

  const totalDuration = lessons.reduce((acc, l) => {
    const [m, s] = (l.duration || "0:00").split(":").map(Number)
    return acc + (m || 0)
  }, 0)

  return (
    <div>
      <SakuraPetals />
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden torii-silhouette">
        <div className="absolute inset-0 bg-linear-to-b from-red-950/30 via-background to-background" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)`,
        }} />
        <div className="absolute inset-0 animate-shimmer" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
                ⛩️ Transforme seu atendimento com a filosofia japonesa
              </Badge>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
                A Arte Japonesa da
                <span className="gradient-text block mt-2">Hospitalidade Excepcional</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Aprenda o <strong className="text-foreground">Omotenashi</strong> — a filosofia japonesa onde o funcionário 
              <em className="text-red-400"> se diminui para exaltar o cliente</em>. Transforme sua equipe e crie 
              experiências inesquecíveis que geram fidelidade e resultados.
            </p>
            </ScrollReveal>
            <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="xl" className="w-full sm:w-auto text-base gap-2">
                <a href="#planos">
                  Quero Transformar Meu Negócio <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Link href="/curso">
                <Button size="xl" variant="outline" className="w-full sm:w-auto text-base">
                  Ver Conteúdo do Curso
                </Button>
              </Link>
            </div>
            </ScrollReveal>
            <ScrollReveal delay={400}>
            <p className="mt-6 text-sm text-muted-foreground">
              🇧🇷 Curso adaptado à realidade brasileira • 100% online • Acesso vitalício
            </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-secondary/50 wave-divider-top">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "2.500+", label: "Alunos" },
              { number: "150+", label: "Empresas" },
              { number: "47%", label: "Aumento no NPS médio" },
              { number: "98%", label: "Satisfação" },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div>
                  <div className="text-3xl md:text-4xl font-display font-bold gradient-text">{s.number}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Omotenashi Philosophy */}
      <section className="py-24 seigaiha-bg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
            <div>
              <Badge variant="accent" className="mb-4">A Filosofia</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                O Que é <span className="gradient-text">Omotenashi</span>?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                Omotenashi (おもてなし) é a arte japonesa de hospitalidade que vai além do atendimento. 
                É antecipar necessidades, servir com humildade genuína e criar experiências que encantam.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Heart, text: "Servir não é se diminuir — é se engrandecer através do serviço ao outro" },
                  { icon: Eye, text: "Antecipar necessidades antes que o cliente as perceba" },
                  { icon: Gem, text: "Cada detalhe importa — a perfeição está nos pequenos gestos" },
                  { icon: Sparkles, text: "Transforme clientes em fãs que voltam e recomendam" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            </ScrollReveal>
            <ScrollReveal delay={200} type="scale">
            <div className="relative">
              <div className="aspect-[4/3] rounded-xl border border-border/50 bg-linear-to-br from-red-950/20 to-amber-950/20 p-8 flex items-center justify-center ripple-card">
                <div className="text-center">
                  <div className="text-8xl mb-6 animate-float">🏯</div>
                  <blockquote className="text-lg italic text-muted-foreground">
                    "Omotenashi não é um serviço, é uma forma de ser."
                  </blockquote>
                  <p className="text-sm text-muted-foreground mt-2">— Masaaki Hirakawa</p>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-24 bg-secondary/30 kanji-watermark" id="curso">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Conteúdo do Curso</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Grade Curricular Completa
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {loading ? "Carregando..." : `${Object.keys(categories).length} categorias • ${lessons.length} aulas • ${totalDuration}+ minutos de conteúdo`}
            </p>
          </div>
          </ScrollReveal>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">⛩️</div>
              <p className="text-muted-foreground">Carregando conteúdo...</p>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.values(categories).map((cat: any, ci: number) => (
                <ScrollReveal key={cat.slug} delay={ci * 100}>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-linear-to-b from-red-600 to-amber-400 rounded-full animate-glow" />
                    <div>
                      <h3 className="text-2xl font-display font-bold">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground">{cat.lessons.length} {cat.lessons.length === 1 ? "aula" : "aulas"}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cat.lessons.map((lesson: any, li: number) => (
                      <Link key={lesson.slug} href={`/curso/${lesson.slug}`}>
                        <Card className="lesson-card border-border/50 bg-card/50 h-full cursor-pointer group ripple-card" style={{ animationDelay: `${li * 0.05}s` }}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary" className="text-xs">{lesson.videoUrl ? "📺 Aula" : "📖 Conteúdo"}</Badge>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" /> {lesson.duration}
                              </span>
                            </div>
                            <CardTitle className="text-base leading-snug group-hover:text-red-400 transition-colors">
                              {lesson.title}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1 leading-relaxed line-clamp-2">
                              {lesson.description}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-0">
                            <span className="flex items-center gap-1 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Assistir aula <ChevronRight className="h-3 w-3" />
                            </span>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* B2B Section */}
      <section className="py-24 relative overflow-hidden seigaiha-bg" id="business">
        <div className="absolute inset-0 bg-linear-to-r from-red-950/10 via-transparent to-amber-950/10" />
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
            <div>
              <Badge variant="accent" className="mb-4">🏢 Para Empresas</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                Transforme o Atendimento da Sua Empresa
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                No Japão, o cliente não é rei — é <strong className="text-foreground">divindade</strong> (okyakusama). 
                Seus funcionários aprenderão a se curvar <em className="text-red-400">para exaltar o cliente</em>, 
                criando uma cultura de serviço que gera resultados.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Treinamento completo para equipes de até 50 colaboradores",
                  "Dinâmicas em grupo e vivências práticas de imersão",
                  "Dashboard de acompanhamento de progresso",
                  "Certificação Omotenashi para sua empresa",
                  "Consultoria personalizada de implementação",
                  "Material didático exclusivo para empresas",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Button asChild size="xl" className="gap-2">
                <a href="#planos">
                  <Building2 className="h-5 w-5" /> Ver Planos Corporativos <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            </ScrollReveal>
            <ScrollReveal delay={200} type="scale">
            <div className="relative">
              <div className="aspect-square rounded-xl border border-border/50 bg-linear-to-br from-red-950/20 to-amber-950/20 p-8 flex items-center justify-center ripple-card animate-glow">
                <div className="text-center">
                  <div className="text-7xl mb-4 animate-float-2">🏢</div>
                  <h3 className="text-xl font-bold mb-2">Sua Empresa Omotenashi</h3>
                  <p className="text-sm text-muted-foreground">Hotéis, restaurantes, RHs, clínicas, call centers — qualquer empresa pode transformar seu atendimento</p>
                </div>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 torii-silhouette" id="planos">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="text-center mb-16">
            <Badge variant="accent" className="mb-4">Investimento</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Escolha o Plano Ideal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Para profissionais individuais ou empresas que querem transformar o atendimento
            </p>
            <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full">
              <Clock className="h-4 w-4 text-red-400 animate-pulse" />
              <span className="text-sm text-red-400 font-medium">Oferta expira em:</span>
              <div className="flex gap-2">
                <span className="bg-red-500/20 px-2 py-1 rounded-sm text-sm font-mono font-bold text-red-300 min-w-[2ch] text-center">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-red-400 font-bold">:</span>
                <span className="bg-red-500/20 px-2 py-1 rounded-sm text-sm font-mono font-bold text-red-300 min-w-[2ch] text-center">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="text-red-400 font-bold">:</span>
                <span className="bg-red-500/20 px-2 py-1 rounded-sm text-sm font-mono font-bold text-red-300 min-w-[2ch] text-center">{String(timeLeft.seconds).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ScrollReveal delay={100}>
            <Card className="relative border-border/50">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">Individual</Badge>
                <CardTitle className="text-2xl mt-2">Para Você</CardTitle>
                <CardDescription>Perfeito para profissionais que querem se destacar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">
                  R$ 197
                  <span className="text-base font-normal text-muted-foreground"> ou 12x R$ 19,70</span>
                </div>
                <div className="space-y-3">
                  {[
                    "Acesso completo ao curso (25 aulas)",
                    "E-book 300+ páginas",
                    "Certificado de conclusão",
                    "Acesso vitalício",
                    "Comunidade exclusiva de alunos",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full gap-2" size="lg">
                  <Link href="/auth/register">
                    Quero Me Inscrever <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            </ScrollReveal>
            <ScrollReveal delay={200}>
            <Card className="relative border-red-500/30 bg-linear-to-b from-red-950/10 to-transparent">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="accent" className="text-xs px-4 py-1">MAIS VENDIDO</Badge>
              </div>
              <CardHeader>
                <Badge variant="accent" className="w-fit">Corporativo</Badge>
                <CardTitle className="text-2xl mt-2">Para Empresas</CardTitle>
                <CardDescription>Transforme toda sua equipe com a cultura Omotenashi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">
                  R$ 2.497
                  <span className="text-base font-normal text-muted-foreground"> ou 12x R$ 249,70</span>
                </div>
                <div className="text-sm text-muted-foreground mb-4">Até 50 colaboradores</div>
                <div className="space-y-3">
                  {[
                    "Tudo do plano Individual",
                    "Dashboard de progresso da equipe",
                    "Certificação corporativa Omotenashi",
                    "Consultoria de implementação (2h)",
                    "Material personalizado para a empresa",
                    "Suporte prioritário 24h",
                    "Relatórios mensais de evolução",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full gap-2" size="lg" variant="accent">
                  <a href="https://wa.me/5537984189874?text=Olá!%20Quero%20solicitar%20um%20orçamento%20para%20o%20plano%20corporativo%20de%20Omotenashi" target="_blank" rel="noopener noreferrer">
                    <Building2 className="h-4 w-4" /> Solicitar Orçamento <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={300}>
          <p className="text-center text-sm text-muted-foreground mt-8">
            🔒 Pagamento 100% seguro • Garantia de 7 dias • Acesso imediato
          </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-secondary/30 kanji-watermark">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">O Que Dizem Nossos Alunos</h2>
            <p className="text-muted-foreground">Empresas e profissionais que transformaram seu atendimento</p>
          </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 100}>
              <Card className="border-border/50 bg-card/50 ripple-card">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 seigaiha-bg">
        <div className="container mx-auto px-4 max-w-3xl">
          <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Dúvidas Frequentes</h2>
          </div>
          </ScrollReveal>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <ScrollReveal key={i} delay={i * 50}>
              <details className="group border border-border/50 rounded-lg">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="font-medium text-sm">{item.q}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  {item.a}
                </div>
              </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden kanji-watermark">
        <div className="absolute inset-0 bg-linear-to-r from-red-950/20 via-transparent to-amber-950/20" />
        <div className="absolute inset-0 animate-shimmer" />
        <div className="container mx-auto px-4 relative text-center">
          <ScrollReveal>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Pronto para Transformar seu Atendimento?
          </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Junte-se a mais de 2.500 profissionais e empresas que já descobriram o poder do Omotenashi.
          </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
          <Button asChild size="xl" className="gap-2 text-lg px-12 animate-glow">
            <a href="#planos">
              Comece Agora <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
          </ScrollReveal>
          <ScrollReveal delay={300}>
          <p className="mt-4 text-sm text-muted-foreground">Garantia incondicional de 7 dias • Acesso imediato</p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
