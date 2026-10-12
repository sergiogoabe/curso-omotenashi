"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MessageSquare, Plus, ArrowLeft, Pin, CheckCircle, Loader2,
  User, Clock, Send, X,
} from "lucide-react"

export default function ForumPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-4xl animate-pulse">⛩️</div>
      </div>
    }>
      <ForumContent />
    </Suspense>
  )
}

function ForumContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const lessonFilter = searchParams.get("lesson")

  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTopic, setShowNewTopic] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [error, setError] = useState("")
  const [lessons, setLessons] = useState<any[]>([])
  const [selectedLesson, setSelectedLesson] = useState(lessonFilter || "")

  useEffect(() => {
    const params = new URLSearchParams()
    if (lessonFilter) params.set("lesson", lessonFilter)
    const qs = params.toString()
    fetch(`/api/forum/topics${qs ? `?${qs}` : ""}`)
      .then(r => r.json())
      .then(d => { setTopics(d); setLoading(false) })

    fetch("/api/lessons").then(r => r.json()).then(d => setLessons(d))
  }, [lessonFilter])

  function handleLessonFilter(slug: string) {
    if (slug) {
      router.push(`/forum?lesson=${slug}`)
    } else {
      router.push("/forum")
    }
  }

  async function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!newTitle || !newContent) {
      setError("Preencha título e conteúdo")
      return
    }

    let lessonId = null
    if (selectedLesson) {
      const lesson = lessons.find((l: any) => l.slug === selectedLesson)
      if (lesson) lessonId = lesson.id
    }

    const res = await fetch("/api/forum/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: newContent, lessonId }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      return
    }

    setShowNewTopic(false)
    setNewTitle("")
    setNewContent("")
    setSelectedLesson("")
    const params = lessonFilter ? `?lesson=${lessonFilter}` : ""
    const updated = await fetch(`/api/forum/topics${params}`).then(r => r.json())
    setTopics(updated)
  }

  function formatDate(date: string) {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min atrás`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h atrás`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d atrás`
    return d.toLocaleDateString("pt-BR")
  }

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-4xl animate-pulse">⛩️</div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-red-400" />
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Fórum de Discussão
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Tire dúvidas, compartilhe insights e discuta com outros alunos
          </p>
        </div>
        {session && (
          <Button onClick={() => setShowNewTopic(!showNewTopic)} className="gap-2">
            {showNewTopic ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showNewTopic ? "Cancelar" : "Novo Tópico"}
          </Button>
        )}
      </div>

      {/* Filter by lesson */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => handleLessonFilter("")}
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
            !lessonFilter ? "border-red-500/50 bg-red-950/20 text-red-400" : "border-border/50 text-muted-foreground hover:border-border"
          }`}
        >
          Todos
        </button>
        {lessons.map((l: any) => (
          <button
            key={l.slug}
            onClick={() => handleLessonFilter(l.slug)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
              lessonFilter === l.slug ? "border-red-500/50 bg-red-950/20 text-red-400" : "border-border/50 text-muted-foreground hover:border-border"
            }`}
          >
            {l.title}
          </button>
        ))}
      </div>

      {/* New topic form */}
      {showNewTopic && (
        <Card className="border-border/50 mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <Label htmlFor="topic-lesson">Aula (opcional)</Label>
                <select
                  id="topic-lesson"
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm"
                >
                  <option value="">Discussão Geral</option>
                  {lessons.map((l: any) => (
                    <option key={l.slug} value={l.slug}>{l.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="topic-title">Título</Label>
                <Input
                  id="topic-title"
                  placeholder="Ex: Dúvida sobre antecipação de necessidades"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="topic-content">Conteúdo</Label>
                <textarea
                  id="topic-content"
                  placeholder="Compartilhe sua dúvida ou insight..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full mt-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm resize-y"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" /> Publicar Tópico
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Topics list */}
      <div className="space-y-3">
        {topics.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum tópico ainda</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {lessonFilter
                  ? "Seja o primeiro a criar um tópico sobre esta aula!"
                  : "Seja o primeiro a criar um tópico no fórum!"}
              </p>
              {session && (
                <Button onClick={() => setShowNewTopic(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Criar Tópico
                </Button>
              )}
              {!session && (
                <Link href="/auth/login">
                  <Button>Faça login para participar</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          topics.map((topic) => (
            <Link key={topic.id} href={`/forum/${topic.id}`}>
              <Card className="border-border/50 hover:border-red-500/30 transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {topic.pinned && <Pin className="h-4 w-4 text-amber-400" />}
                        {topic.resolved && <CheckCircle className="h-4 w-4 text-green-400" />}
                        <h3 className="font-semibold truncate">{topic.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {topic.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {topic.user?.name || "Anônimo"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDate(topic.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {topic.postCount || 0} respostas
                        </span>
                        {topic.lesson && (
                          <Badge variant="secondary" className="text-[10px]">
                            {topic.lesson.title}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
