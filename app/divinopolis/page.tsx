"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronDown, Star, MapPin, Building2, Users, Clock, Phone, Award, Heart, Sparkles, GraduationCap, Settings, BookOpen, BookCheck } from "lucide-react"

const WPP = "https://wa.me/5537984189874?text=Olá!%20Quero%20agendar%20um%20workshop%20gratuito%20de%20Omotenashi%20para%20minha%20empresa%20em%20Divinópolis."

const testimonials = [
  { name: "Dr. Marcelo Almeida", role: "Superintendente, Hospital São João de Deus", text: "O Omotenashi transformou nossa abordagem com pacientes. A equipe aprendeu a antecipar necessidades e o resultado foi uma melhora de 40% na satisfação dos pacientes em apenas 3 meses." },
  { name: "Luciana Ferreira", role: "Proprietária, LF Moda Feminina", text: "Minhas vendedoras sempre foram acolhedoras, mas o curso deu a elas um novo olhar sobre o atendimento. As clientes notaram e as vendas aumentaram 25%." },
  { name: "Carlos Eduardo", role: "Rede de Restaurantes Sabor Mineiro", text: "O workshop foi revelador. Coisas simples como antecipar o que o cliente precisa antes de pedir fizeram toda a diferença. Os elogios no Instagram triplicaram." },
]

const faq = [
  { q: "Quanto tempo dura o workshop gratuito?", a: "1 hora. Vou até sua empresa em Divinópolis, sem compromisso. Sua equipe vai vivenciar na prática o início da transformação." },
  { q: "Funciona para qualquer tipo de negócio?", a: "Sim. O Omotenashi é adaptável: já aplicamos em hospitais, lojas, restaurantes, concessionárias e clínicas em Divinópolis." },
  { q: "Precisa de estrutura especial?", a: "Não. O workshop usa dinâmicas simples. Só preciso de um espaço com cadeiras e 1 hora da sua equipe." },
  { q: "Tem certificado?", a: "Sim. Cada funcionário que completar o curso recebe certificado de conclusão Omotenashi." },
  { q: "Como acompanho o progresso dos meus funcionários?", a: "Sua empresa ganha acesso ao dashboard exclusivo onde você vê em tempo real o progresso de cada colaborador." },
]

const beneficios = [
  { icon: Heart, text: "Atendimento humanizado que fideliza clientes" },
  { icon: Sparkles, text: "Equipe motivada e orgulhosa do próprio trabalho" },
  { icon: Award, text: "Diferencial competitivo no mercado de Divinópolis" },
  { icon: Users, text: "Cultura de serviço que atravessa gerações" },
]

export default function DivinopolisPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-red-950/40 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              🗺️ Exclusivo para Divinópolis e Região
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Omotenashi em <span className="gradient-text">Divinópolis</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Sua empresa já tem o jeito mineiro de acolher. Agora imagine elevar esse atendimento
              ao padrão <strong className="text-foreground">japonês de excelência</strong> — onde o funcionário
              se prepara para servir com <em className="text-red-400">antecipação, respeito e encantamento</em>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="xl" className="w-full text-base gap-2 bg-green-600 hover:bg-green-700">
                  <Phone className="h-5 w-5" /> Quero Workshop Grátis
                </Button>
              </a>
              <a href="#planos">
                <Button size="xl" variant="outline" className="w-full sm:w-auto text-base gap-2">
                  Ver Planos Locais <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Divinópolis / MG</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Workshop 1h grátis</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Sua equipe toda</span>
            </div>
          </div>
        </div>
      </section>

      {/* Selo Local */}
      <section className="border-y border-border/50 bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <Link href="/divinopolis/empresas" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"><Building2 className="h-4 w-4" /> Empresas →</Link>
            <Link href="/divinopolis/industrias" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"><Settings className="h-4 w-4" /> Indústrias →</Link>
            <Link href="/divinopolis/faculdades" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"><GraduationCap className="h-4 w-4" /> Faculdades →</Link>
            <Link href="/divinopolis/escolas" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"><BookOpen className="h-4 w-4" /> Escolas →</Link>
            <Link href="/divinopolis/cursinhos" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"><BookCheck className="h-4 w-4" /> Cursinhos →</Link>
            <Link href="/divinopolis/leads" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-semibold"><Award className="h-4 w-4" /> Quero Contato →</Link>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Por Que Trazer o Omotenashi para Sua Empresa?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Empresas de Divinópolis que implementaram tiveram resultados reais e imediatos</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {beneficios.map((b, i) => (
              <Card key={i} className="border-border/50 bg-card/50 text-center">
                <CardContent className="pt-8">
                  <b.icon className="h-10 w-10 mx-auto mb-4 text-red-400" />
                  <p className="text-sm font-medium">{b.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Grátis */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-red-950/20 via-amber-950/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-3xl mx-auto border-red-500/30 bg-linear-to-b from-red-950/10 to-card/50 text-center">
            <CardContent className="p-10">
              <div className="text-6xl mb-6">🎯</div>
              <Badge variant="accent" className="mb-4">GRATUITO</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Workshop Presencial de 1h na Sua Empresa
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Eu vou até você. Sem custo, sem compromisso. Sua equipe vai experimentar na prática
                o poder do Omotenashi e você vai ver como é simples começar a transformação.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-sm">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-semibold">⏱️ 1 hora</p>
                  <p className="text-muted-foreground text-xs">Dinâmico e prático</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-semibold">👥 Sua equipe</p>
                  <p className="text-muted-foreground text-xs">Todos participam</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-semibold">📍 Na sua empresa</p>
                  <p className="text-muted-foreground text-xs">Vou até você</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="font-semibold">🎁 Diagnóstico</p>
                  <p className="text-muted-foreground text-xs">3 pontos de melhoria</p>
                </div>
              </div>
              <a href={WPP} target="_blank" rel="noopener noreferrer">
                <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-base px-10">
                  <Phone className="h-5 w-5" /> Agendar Agora pelo WhatsApp
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Planos Divinópolis */}
      <section className="py-20" id="planos">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">Preços Especiais</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Planos para Divinópolis</h2>
            <p className="text-muted-foreground">Condições especiais para empresas da cidade e região</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="border-border/50">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">Individual</Badge>
                <CardTitle className="text-xl mt-2">Para Você</CardTitle>
                <CardDescription>Profissional que quer se destacar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">R$ 147</div>
                <div className="space-y-2">
                  {["Curso completo (13 aulas)", "E-book 300+ páginas", "Certificado", "Acesso vitalício"].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />{item}</div>
                  ))}
                </div>
              </CardContent>
              <CardFooter><a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full"><Button className="w-full" size="sm">Quero Este</Button></a></CardFooter>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">Empresa +</Badge>
                <CardTitle className="text-xl mt-2">Até 30 Func.</CardTitle>
                <CardDescription>Para equipes enxutas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">R$ 1.497</div>
                <div className="space-y-2">
                  {["Curso para 30 funcionários", "Dashboard de progresso", "Certificação corporativa", "Suporte 24h"].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />{item}</div>
                  ))}
                </div>
              </CardContent>
              <CardFooter><a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full"><Button className="w-full" size="sm">Quero Este</Button></a></CardFooter>
            </Card>

            <Card className="border-red-500/30 bg-linear-to-b from-red-950/10 to-transparent relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="accent">MAIS VENDIDO</Badge></div>
              <CardHeader>
                <Badge variant="accent" className="w-fit">Empresa ++</Badge>
                <CardTitle className="text-xl mt-2">Até 50 Func.</CardTitle>
                <CardDescription>Para times completos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">R$ 2.497</div>
                <div className="space-y-2">
                  {["Curso para 50 funcionários", "Dashboard de progresso", "Certificação corporativa", "Consultoria 2h inclusa", "Suporte prioritário"].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />{item}</div>
                  ))}
                </div>
              </CardContent>
              <CardFooter><a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full"><Button className="w-full" variant="accent" size="sm">Quero Este</Button></a></CardFooter>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">Combo</Badge>
                <CardTitle className="text-xl mt-2">Curso + Consult.</CardTitle>
                <CardDescription>Transformação completa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">R$ 3.200</div>
                <div className="space-y-2">
                  {["Curso Omotenashi completo", "Dashboard de progresso", "4h de consultoria in loco", "Material personalizado", "Relatórios mensais", "Acompanhamento 3 meses"].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />{item}</div>
                  ))}
                </div>
              </CardContent>
              <CardFooter><a href={WPP} target="_blank" rel="noopener noreferrer" className="w-full"><Button className="w-full" size="sm">Quero Este</Button></a></CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground">Simples, rápido e sem burocracia</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Workshop Grátis", desc: "Vou até sua empresa. 1h de imersão no Omotenashi." },
              { step: "02", title: "Diagnóstico", desc: "Identifico os 3 pontos críticos de melhoria." },
              { step: "03", title: "Curso da Equipe", desc: "Sua equipe acessa o curso completo com suporte." },
              { step: "04", title: "Dashboard", desc: "Você acompanha o progresso de cada funcionário." },
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

      {/* Depoimentos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Quem Já Transformou o Atendimento em Divinópolis</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-red-950/20 via-transparent to-amber-950/20" />
        <div className="container mx-auto px-4 relative text-center">
          <div className="text-6xl mb-6">🏯</div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Vamos Transformar o Atendimento da Sua Empresa?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Agende seu workshop gratuito agora. Em 1 hora sua equipe vai sentir na prática o poder do Omotenashi.
          </p>
          <a href={WPP} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-12">
              <Phone className="h-5 w-5" /> Agendar Workshop Grátis
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">
            📍 Divinópolis e região • Vou até sua empresa • Sem compromisso
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/divinopolis/escolas" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">
              🎌 Escolas de Idiomas →
            </Link>
            <Link href="/divinopolis/faculdades" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">
              🎓 Faculdades →
            </Link>
            <Link href="/divinopolis/cursinhos" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">
              📚 Cursinhos →
            </Link>
            <Link href="/divinopolis/industrias" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">
              🏭 Indústrias →
            </Link>
            <Link href="/divinopolis/empresas" className="text-sm text-muted-foreground hover:text-red-400 transition-colors underline underline-offset-4">
              🏢 Empresas →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
