"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, ArrowRight, Clock, BookOpen, Lock, Zap } from "lucide-react"

const PLANS = [
  { id: "individual", label: "Individual", desc: "Acesso vitalício · 1 usuário", value: 197 },
  { id: "business30", label: "Empresarial 30", desc: "Até 30 colaboradores · Suporte prioritário", value: 1497 },
  { id: "business50", label: "Empresarial 50", desc: "Até 50 colaboradores · Suporte VIP + consultoria", value: 2497 },
  { id: "combo", label: "Combo", desc: "Curso + Consultoria presencial · Tudo incluso", value: 3200 },
]

export default function Curso() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/lessons").then(r => r.json()),
      fetch("/api/enroll").then(r => r.json()),
    ]).then(([lessons, enrollData]) => {
      const active = (enrollData.enrollments || []).some((e: any) => e.active)
      setHasAccess(active)
      const grouped: any = {}
      lessons.forEach((lesson: any) => {
        const catName = lesson.category?.name || "Geral"
        if (!grouped[catName]) {
          grouped[catName] = { name: catName, lessons: [] }
        }
        grouped[catName].lessons.push(lesson)
      })
      setCategories(Object.values(grouped))
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-4xl animate-pulse">⛩️</div>
    </div>
  )

  if (hasAccess === false) return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-6 flex justify-center">
          <Lock className="h-16 w-16 text-red-400" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">Adquira o Curso Omotenashi</h1>
        <p className="text-muted-foreground mb-8">
          Acesso completo a todas as videoaulas, e-book de 300+ páginas, exercícios práticos e certificado de conclusão.
        </p>
        <div className="grid gap-4 mb-8">
          {PLANS.map((p) => (
            <div key={p.id} className="bg-card/50 border border-border/50 rounded-xl p-4 text-left flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.label}</div>
                <div className="text-sm text-muted-foreground">{p.desc}</div>
              </div>
              <div className="text-xl font-bold gradient-text">R$ {p.value.toLocaleString("pt-BR")}</div>
            </div>
          ))}
        </div>
        <Link href="/auth/register">
          <Button size="lg" className="gap-2 text-base w-full">
            <Zap className="h-5 w-5" /> Quero Meu Acesso
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <Badge variant="accent" className="mb-4">Curso Completo</Badge>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Curso de <span className="gradient-text">Omotenashi</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Aprenda a filosofia japonesa de hospitalidade com videoaulas, exercícios práticos e material de apoio
        </p>
      </div>

      <div className="mb-8 p-6 rounded-xl border border-border/50 bg-linear-to-r from-red-950/10 to-amber-950/10">
        <div className="flex items-start gap-4">
          <BookOpen className="h-10 w-10 text-amber-400 shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-1">E-book de Acompanhamento</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Este curso inclui um e-book completo com 300+ páginas sobre Omotenashi. Use como material de consulta e aprofundamento.
            </p>
            <Link href="/ebook">
              <Button variant="outline" size="sm" className="gap-2">
                Acessar E-book <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {categories.map((cat: any) => (
          <div key={cat.name}>
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
              <span className="h-1 w-8 bg-red-500 rounded-full" />
              {cat.name}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {cat.lessons.map((lesson: any) => (
                <Link key={lesson.id} href={`/curso/${lesson.slug}`}>
                  <Card className="lesson-card border-border/50 h-full hover:border-red-500/30 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="mb-2">
                          <Clock className="h-3 w-3 mr-1" /> {lesson.duration}
                        </Badge>
                        {lesson.videoUrl && <PlayCircle className="h-5 w-5 text-red-400" />}
                      </div>
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <CardDescription>{lesson.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Aula {lesson.order}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
