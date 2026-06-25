"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, PlayCircle, Clock, Lock, Zap } from "lucide-react"

const PLANS = [
  { id: "individual", label: "Individual", desc: "Acesso vitalício · 1 usuário", value: 197 },
  { id: "business30", label: "Empresarial 30", desc: "Até 30 colaboradores · Suporte prioritário", value: 1497 },
  { id: "business50", label: "Empresarial 50", desc: "Até 50 colaboradores · Suporte VIP + consultoria", value: 2497 },
  { id: "combo", label: "Combo", desc: "Curso + Consultoria presencial · Tudo incluso", value: 3200 },
]
import { useSession } from "next-auth/react"
import { VideoPlayer } from "@/components/VideoPlayer"

export default function LessonPage() {
  const { lessonId } = useParams()
  const { data: session } = useSession()
  const [lesson, setLesson] = useState<any>(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    fetch(`/api/lessons?slug=${lessonId}`).then(r => r.json()).then(data => {
      const l = Array.isArray(data) ? data[0] : data
      setLesson(l)
      setLoading(false)
      if (l?.id) {
        fetch(`/api/progress?lessonId=${l.id}`).then(r => r.json()).then(p => {
          setCompleted(p.completed || false)
        })
        if (session) {
          fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lessonId: l.id, trackView: true }),
          })
        }
      }
    })
  }, [lessonId, session])

  useEffect(() => {
    fetch("/api/enroll").then(r => r.json()).then(data => {
      const active = (data.enrollments || []).some((e: any) => e.active)
      setHasAccess(active)
    })
  }, [])

  async function markComplete() {
    if (!lesson?.id || !session) return
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id, completed: !completed }),
    })
    if (res.ok) setCompleted(!completed)
  }

  if (loading || hasAccess === null) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-4xl animate-pulse">⛩️</div>
    </div>
  )

  if (!lesson) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😞</div>
        <h1 className="text-2xl font-bold mb-2">Aula não encontrada</h1>
        <Link href="/curso"><Button variant="outline">Voltar ao Curso</Button></Link>
      </div>
    </div>
  )

  if (!hasAccess) return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/curso" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar ao curso
      </Link>
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-6 flex justify-center">
          <Lock className="h-16 w-16 text-red-400" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">Conteúdo Exclusivo</h1>
        <p className="text-muted-foreground mb-8">
          Esta aula faz parte do curso completo de Omotenashi. Adquira seu acesso para assistir a todas as videoaulas, acessar o e-book e muito mais.
        </p>
        <div className="grid gap-3 mb-8 text-left">
          {PLANS.map((p) => (
            <div key={p.id} className="bg-card/50 border border-border/50 rounded-xl p-3 flex items-center justify-between">
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
    <div className="container mx-auto px-4 py-12">
      <Link href="/curso" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar ao curso
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Badge variant="secondary" className="mb-4">{lesson.category?.name}</Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{lesson.title}</h1>
          <p className="text-muted-foreground mb-8">{lesson.description}</p>

          {lesson.videoUrl && (
            <VideoPlayer videoUrl={lesson.videoUrl} lessonSlug={lesson.slug} />
          )}

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Informações da Aula</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> Duração: {lesson.duration}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PlayCircle className="h-4 w-4" /> Tipo: {lesson.videoType === "youtube" ? "Vídeo YouTube" : "Vídeo Original"}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className={`h-4 w-4 ${completed ? "text-green-400" : "text-muted-foreground"}`} /> {completed ? "Concluída" : "Não concluída"}
                </div>
              </div>
            </CardContent>
          </Card>

          {session && (
            <>
              <Button
                onClick={markComplete}
                className="w-full gap-2"
                variant={completed ? "outline" : "default"}
              >
                <CheckCircle className="h-4 w-4" />
                {completed ? "Marcar como Não Concluída" : "Marcar como Concluída"}
              </Button>
              <Link href={`/forum?lesson=${lesson.slug}`}>
                <Button variant="outline" className="w-full gap-2">
                  Discussão da Aula
                </Button>
              </Link>
            </>
          )}

          {!session && (
            <div className="p-4 rounded-lg border border-border/50 bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-2">Faça login para acompanhar seu progresso.</p>
              <Link href="/auth/login">
                <Button size="sm" className="w-full">Entrar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
