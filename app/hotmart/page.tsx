"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, Star, Clock, BookOpen, Users, Award, Shield, MessageCircle, Play, ChevronDown, FileText, GraduationCap, Heart, Sparkles } from "lucide-react"
import { useState } from "react"

const HOTMART_URL = "SEU_LINK_HOTMART_AQUI"

const modules = [
  {
    title: "Fundamentos do Omotenashi",
    desc: "A origem filosófica, os pilares e como aplicar no dia a dia do atendimento.",
    lessons: ["O que é Omotenashi?", "A história da hospitalidade japonesa", "Os 4 pilares do Omotenashi", "Omotenashi vs atendimento tradicional"],
  },
  {
    title: "Comunicação que Encanta",
    desc: "Técnicas de comunicação verbal e não-verbal para criar conexão genuína.",
    lessons: ["Linguagem corporal e postura", "Tom de voz e escolha de palavras", "Escuta ativa na prática", "Como lidar com objeções"],
  },
  {
    title: "Antecipação de Necessidades",
    desc: "Aprenda a ler o cliente e oferecer antes que ele peça.",
    lessons: ["Os 3 níveis de antecipação", "Observação e percepção", "Criação de padrões de excelência", "Estudos de caso reais"],
  },
  {
    title: "Gestão de Experiência",
    desc: "Mapeie a jornada do cliente e elimine pontos de dor.",
    lessons: ["Jornada do cliente do início ao fim", "Momentos da verdade", "Recuperação de serviço", "Métricas de satisfação"],
  },
  {
    title: "Cultura Omotenashi na Prática",
    desc: "Como implementar a filosofia em equipes, processos e liderança.",
    lessons: ["Liderança servidora", "Treinamento de equipes", "Rituais diários de excelência", "Avaliação e melhoria contínua"],
  },
  {
    title: "Ferramentas Japonesas de Excelência",
    desc: "Metodologias consagradas do Japão aplicadas ao atendimento.",
    lessons: ["5S: Organização e disciplina", "Kaizen: Melhoria contínua", "PDCA: Ciclo de gestão", "Nemawashi: Construção de consenso"],
  },
]

const bonuses = [
  { icon: FileText, title: "E-book 300+ Páginas", desc: "Versão completa do curso em PDF para consulta offline." },
  { icon: Award, title: "Certificado de Conclusão", desc: "Certificado reconhecido para horas complementares." },
  { icon: Users, title: "Comunidade Exclusiva", desc: "Grupo de alunos no WhatsApp para networking e suporte." },
  { icon: Play, title: "Aulas Extras", desc: "Conteúdos bônus: Ikigai, Ichigo Ichie, Omoiyari e mais." },
]

const faq = [
  { q: "Quanto tempo dura o curso?", a: "Cerca de 20 horas de conteúdo em vídeo, dividido em 6 módulos. Você assiste no seu ritmo, com acesso vitalício." },
  { q: "Preciso de conhecimento prévio?", a: "Não. O curso começa dos fundamentos e avança gradualmente. Serve tanto para iniciantes quanto para profissionais experientes." },
  { q: "Como funciona o acesso?", a: "Assim que a compra for confirmada pela Hotmart, você recebe acesso imediato à plataforma com todo o conteúdo liberado." },
  { q: "Tem garantia?", a: "Sim. Você tem 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro." },
  { q: "O certificado é válido?", a: "Sim, nosso certificado é reconhecido e pode ser usado para horas complementares em faculdades e processos seletivos." },
  { q: "Tem suporte?", a: "Sim. Você tem acesso à comunidade exclusiva de alunos e suporte por email. Dúvidas respondidas em até 24h úteis." },
]

export default function HotmartPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="accent" className="mb-6 text-sm px-4 py-1.5">
              ⛩️ Curso Online — Acesso Vitalício
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              A Arte Japonesa da
              <span className="block mt-2 bg-gradient-to-r from-red-400 via-amber-400 to-red-400 bg-clip-text text-transparent">Hospitalidade Excepcional</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Aprenda o <strong className="text-foreground">Omotenashi</strong> — a filosofia japonesa onde o funcionário 
              <em className="text-red-400"> se diminui para exaltar o cliente</em>. Transforme sua carreira e 
              crie experiências inesquecíveis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer">
                <Button size="xl" className="w-full sm:w-auto text-base gap-2 bg-green-600 hover:bg-green-700 text-lg px-10">
                  Garantir Minha Vaga — R$ 197 <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span>✅ 20+ horas de conteúdo</span>
              <span>•</span>
              <span>📚 E-book 300+ páginas</span>
              <span>•</span>
              <span>🎓 Certificado</span>
              <span>•</span>
              <span>🛡️ 7 dias de garantia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-border/50 bg-secondary/50">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "2.500+", label: "Alunos" },
              { number: "150+", label: "Empresas" },
              { number: "47%", label: "Aumento no NPS" },
              { number: "98%", label: "Satisfação" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">{s.number}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Quem é */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Para Quem é Este Curso?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Profissionais de Atendimento", desc: "Recepcionistas, garçons, vendedores e call center que querem se destacar." },
              { icon: GraduationCap, title: "Estudantes & Iniciantes", desc: "Quem busca uma vantagem competitiva no mercado de trabalho." },
              { icon: Heart, title: "Empreendedores & Gestores", desc: "Donos de negócio que querem transformar a cultura da empresa." },
            ].map((item, i) => (
              <Card key={i} className="border-border/50 bg-card/50 text-center">
                <CardContent className="pt-8">
                  <item.icon className="h-10 w-10 mx-auto mb-4 text-red-400" />
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section className="py-20 bg-secondary/30" id="curso">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Grade Curricular</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">6 módulos • 25 aulas • 20+ horas de conteúdo em vídeo</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {modules.map((mod, i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardHeader>
                  <Badge variant="accent" className="w-fit mb-2">Módulo {i + 1}</Badge>
                  <CardTitle className="text-lg">{mod.title}</CardTitle>
                  <CardDescription className="text-xs">{mod.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mod.lessons.map((l, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Play className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bônus */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-4">🎁 Bônus Exclusivos</Badge>
            <h2 className="text-4xl font-display font-bold mb-4">Você Leva Tudo Isso</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Além do curso completo, você ainda recebe:</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {bonuses.map((b, i) => (
              <Card key={i} className="border-red-500/20 bg-gradient-to-b from-red-950/10 to-card/50 text-center">
                <CardContent className="pt-8">
                  <b.icon className="h-10 w-10 mx-auto mb-4 text-amber-400" />
                  <h3 className="font-bold mb-2">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preço */}
      <section className="py-20 bg-secondary/30" id="preco">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">Invista no Seu Futuro</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Transforme sua carreira com o conhecimento que vai te diferenciar no mercado.
          </p>
          <div className="max-w-md mx-auto">
            <Card className="border-red-500/30 bg-gradient-to-b from-red-950/10 to-card/50">
              <CardContent className="p-10">
                <div className="text-5xl font-display font-bold mb-2">R$ 197</div>
                <p className="text-muted-foreground mb-6">ou 12x R$ 19,70</p>
                <ul className="space-y-3 mb-8 text-left">
                  {[
                    "Acesso completo ao curso (25 aulas)",
                    "E-book 300+ páginas",
                    "Certificado de conclusão",
                    "Acesso vitalício",
                    "Comunidade exclusiva de alunos",
                    "7 dias de garantia incondicional",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="xl" className="w-full gap-2 text-lg bg-green-600 hover:bg-green-700">
                    Quero Meu Acesso Agora <ArrowRight className="h-5 w-5" />
                  </Button>
                </a>
                <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Pagamento 100% seguro</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" /> Garantia de 7 dias</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Garantia */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="text-7xl mb-4">🛡️</div>
          <h2 className="text-3xl font-display font-bold mb-4">Satisfação Garantida ou seu Dinheiro de Volta</h2>
          <p className="text-muted-foreground mb-6">
            Você tem <strong className="text-foreground">7 dias</strong> para testar o curso. Se por qualquer motivo 
            não ficar satisfeito, devolvemos <strong className="text-foreground">100% do seu dinheiro</strong>. 
            Sem burocracia, sem perguntas.
          </p>
          <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700">
              Quero Garantir Minha Vaga <ArrowRight className="h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div key={i} className="border border-border/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full p-4 text-left"
                >
                  <span className="font-medium text-sm">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-display font-bold mb-4">Pronto para Transformar sua Carreira?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Junte-se a mais de 2.500 profissionais que já descobriram o poder do Omotenashi.
          </p>
          <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer">
            <Button size="xl" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-12">
              Comprar Agora — R$ 197 <ArrowRight className="h-5 w-5" />
            </Button>
          </a>
          <p className="mt-4 text-sm text-muted-foreground">🔒 Pagamento 100% seguro via Hotmart • Acesso imediato</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>Curso Omotenashi &copy; 2026 — Todos os direitos reservados.</p>
        <p className="mt-1">
          <Link href="/privacidade" className="hover:text-foreground">Política de Privacidade</Link>
          {" • "}
          <Link href="/termos" className="hover:text-foreground">Termos de Uso</Link>
        </p>
      </footer>
    </div>
  )
}
