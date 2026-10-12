"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, BookOpen, Lock, Zap } from "lucide-react"

export default function ChapterPage() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState<any>(null)
  const [allChapters, setAllChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/ebook?slug=${chapterId}`).then(r => r.json()),
      fetch("/api/ebook").then(r => r.json()),
      fetch("/api/enroll").then(r => r.json()),
    ]).then(([ch, chapters, enrollData]) => {
      setChapter(Array.isArray(ch) ? ch[0] : ch)
      setAllChapters(chapters)
      const active = (enrollData.enrollments || []).some((e: any) => e.active)
      setHasAccess(active)
      setLoading(false)
    })
  }, [chapterId])

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-4xl animate-pulse">📖</div>
    </div>
  )

  if (!chapter) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😞</div>
        <h1 className="text-2xl font-bold mb-2">Capítulo não encontrado</h1>
        <Link href="/ebook"><Button variant="outline">Voltar ao E-book</Button></Link>
      </div>
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
          Este capítulo faz parte do e-book exclusivo para alunos matriculados no curso Omotenashi.
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

  const currentIndex = allChapters.findIndex((c: any) => c.id === chapter.id)
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null

  return (
    <div className="ebook-page py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/ebook" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Sumário
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            Capítulo {chapter.order} de {allChapters.length}
          </div>
        </div>

        <article className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:border-red-500 prose-blockquote:text-muted-foreground prose-code:text-red-400 prose-code:bg-secondary/50 prose-code:px-1 prose-code:rounded">
          <ReactMarkdown>{chapter.content}</ReactMarkdown>
        </article>

        <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between">
          <div>
            {prevChapter && (
              <Link href={`/ebook/${prevChapter.slug}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> {prevChapter.title}
                </Button>
              </Link>
            )}
          </div>
          <div>
            {nextChapter && (
              <Link href={`/ebook/${nextChapter.slug}`}>
                <Button size="sm" className="gap-2">
                  {nextChapter.title} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
