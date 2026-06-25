"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, FileText, Lock, Zap } from "lucide-react"

export default function Ebook() {
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/ebook").then(r => r.json()),
      fetch("/api/enroll").then(r => r.json()),
    ]).then(([data, enrollData]) => {
      setChapters(data)
      const active = (enrollData.enrollments || []).some((e: any) => e.active)
      setHasAccess(active)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-4xl animate-pulse">📖</div>
    </div>
  )

  if (hasAccess === false) return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-6 flex justify-center">
          <Lock className="h-16 w-16 text-red-400" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">Conteúdo Exclusivo para Alunos</h1>
        <p className="text-muted-foreground mb-8">
          O e-book completo com mais de 300 páginas sobre Omotenashi está disponível apenas para alunos matriculados.
        </p>
        <div className="grid gap-3 mb-8 text-left">
          {[
            { label: "Individual", desc: "Acesso vitalício · 1 usuário", value: 197 },
            { label: "Empresarial 30", desc: "Até 30 colaboradores · Suporte prioritário", value: 1497 },
            { label: "Empresarial 50", desc: "Até 50 colaboradores · Suporte VIP + consultoria", value: 2497 },
            { label: "Combo", desc: "Curso + Consultoria presencial · Tudo incluso", value: 3200 },
          ].map((p) => (
            <div key={p.label} className="bg-card/50 border border-border/50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
              <div className="text-lg font-bold gradient-text">R$ {p.value.toLocaleString("pt-BR")}</div>
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
    <div className="ebook-page py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="accent" className="mb-4">📖 E-book Completo</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Omotenashi: A Arte da <span className="gradient-text">Hospitalidade Japonesa</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Mais de 300 páginas sobre a filosofia, história e aplicação prática do Omotenashi no Brasil
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-border/50 bg-card/50 text-center p-8">
            <FileText className="h-10 w-10 mx-auto mb-3 text-red-400" />
            <p className="text-3xl font-bold">{chapters.length}</p>
            <p className="text-sm text-muted-foreground">Capítulos</p>
          </Card>
          <Card className="border-border/50 bg-card/50 text-center p-8">
            <BookOpen className="h-10 w-10 mx-auto mb-3 text-amber-400" />
            <p className="text-3xl font-bold">300+</p>
            <p className="text-sm text-muted-foreground">Páginas</p>
          </Card>
          <Card className="border-border/50 bg-card/50 text-center p-8">
            <span className="text-4xl block mb-3">🇯🇵</span>
            <p className="text-3xl font-bold">100%</p>
            <p className="text-sm text-muted-foreground">Conteúdo Exclusivo</p>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-3">
            {chapters.map((ch: any, i: number) => (
              <Link key={ch.id} href={`/ebook/${ch.slug}`}>
                <div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-red-500/30 hover:bg-secondary/30 transition-all group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center text-sm font-bold text-red-400 shrink-0">
                    {ch.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-red-400 transition-colors truncate">{ch.title}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-red-400 transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
