"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, PlayCircle, FileText, ArrowRight, CheckCircle, Clock, Award, BarChart3, TrendingUp, Flame } from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [lessons, setLessons] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login")
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/lessons").then(r => r.json()),
        fetch("/api/progress").then(r => r.json()),
      ]).then(([lessonsData, progressData]) => {
        setLessons(lessonsData)
        if (progressData.progress) setProgress(progressData.progress)
        setLoading(false)
      })
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-4xl animate-pulse">⛩️</div>
      </div>
    )
  }

  const completedCount = progress.filter((p: any) => p.completed).length
  const totalLessons = lessons.length
  const completionPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const categories = lessons.reduce((acc: any, l: any) => {
    const cat = l.category?.name || "Geral"
    if (!acc[cat]) acc[cat] = { name: cat, total: 0, completed: 0, lessons: [] }
    acc[cat].total++
    acc[cat].lessons.push(l)
    const p = progress.find((pr: any) => pr.lessonId === l.id)
    if (p?.completed) acc[cat].completed++
    return acc
  }, {})

  const lastAccessed = [...progress]
    .filter((p: any) => p.lastAccessedAt)
    .sort((a: any, b: any) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 3)

  const lastLessonData = lastAccessed.map((p: any) => {
    const lesson = lessons.find((l: any) => l.id === p.lessonId)
    return lesson ? { ...p, lesson } : null
  }).filter(Boolean)

  const inProgressCount = progress.filter((p: any) => !p.completed).length
  const notStartedCount = totalLessons - progress.length

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
          Olá, {session?.user?.name || "Aluno"}
        </h1>
        <p className="text-muted-foreground">Bem-vindo ao seu painel de estudos Omotenashi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progresso</CardTitle>
              <p className="text-2xl font-bold">{completionPct}%</p>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Concluídas</CardTitle>
              <p className="text-2xl font-bold">{completedCount}/{totalLessons}</p>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Em Andamento</CardTitle>
              <p className="text-2xl font-bold">{inProgressCount + notStartedCount}</p>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-book</CardTitle>
              <p className="text-2xl font-bold">300+ pág</p>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="w-full bg-secondary/30 rounded-full h-3 mb-12 overflow-hidden border border-border/50">
        <div
          className="h-full bg-linear-to-r from-red-600 to-amber-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${completionPct}%` }}
        />
      </div>

      {completionPct === 100 && (
        <Card className="border-green-500/30 bg-green-950/10 mb-12">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Award className="h-10 w-10 text-amber-400" />
              <div>
                <h3 className="text-lg font-bold text-green-400">Parabéns! Curso Completo!</h3>
                <p className="text-sm text-muted-foreground">Você concluiu todas as aulas. Seu certificado está disponível.</p>
              </div>
            </div>
            <Link href="/dashboard/certificado">
              <Button className="gap-2"><Award className="h-4 w-4" /> Ver Certificado</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {lastLessonData.length > 0 && (
        <Card className="border-border/50 mb-12">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" /> Continuar Estudos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastLessonData.map((item: any) => (
                <Link
                  key={item.lesson.id}
                  href={`/curso/${item.lesson.slug}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <PlayCircle className="h-5 w-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium group-hover:text-red-400 transition-colors">{item.lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{item.lesson.category?.name}</p>
                    </div>
                  </div>
                  <Badge variant={item.completed ? "accent" : "secondary"}>
                    {item.completed ? "Concluído" : "Continuar"}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 mb-12">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-400" /> Progresso por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.values(categories).map((cat: any) => {
              const catPct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.completed}/{cat.total}</span>
                  </div>
                  <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden border border-border/50">
                    <div
                      className="h-full bg-linear-to-r from-red-600 to-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-12">
        <CardHeader>
          <CardTitle className="text-xl">Suas Aulas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const p = progress.find((pr: any) => pr.lessonId === lesson.id)
              const isCompleted = p?.completed || false
              return (
                <Link
                  key={lesson.id}
                  href={`/curso/${lesson.slug}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium group-hover:text-red-400 transition-colors truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.duration} &bull; {lesson.category?.name}</p>
                    </div>
                  </div>
                  <Badge variant={isCompleted ? "accent" : "secondary"} className="shrink-0 ml-2">
                    {isCompleted ? "Concluído" : "Pendente"}
                  </Badge>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 flex-wrap">
        <Link href="/curso">
          <Button className="gap-2">Ir para o Curso <ArrowRight className="h-4 w-4" /></Button>
        </Link>
        <Link href="/ebook">
          <Button variant="outline" className="gap-2">Ler E-book <ArrowRight className="h-4 w-4" /></Button>
        </Link>
        <Link href="/forum">
          <Button variant="outline" className="gap-2">Fórum de Discussão <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
    </div>
  )
}