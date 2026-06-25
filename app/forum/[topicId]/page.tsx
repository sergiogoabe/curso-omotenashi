"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MessageSquare, User, Clock, Send, Loader2 } from "lucide-react"

export default function TopicDetail() {
  const { topicId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [topic, setTopic] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/forum/topics").then(r => r.json()),
      fetch(`/api/forum/posts?topicId=${topicId}`).then(r => r.json()),
    ]).then(([topicsData, postsData]) => {
      const t = topicsData.find((t: any) => t.id === topicId)
      setTopic(t)
      setPosts(postsData)
      setLoading(false)
    })
  }, [topicId])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyContent || !session) return
    setSending(true)

    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, content: replyContent }),
    })

    if (res.ok) {
      const newPost = await res.json()
      setPosts([...posts, newPost])
      setReplyContent("")
    }
    setSending(false)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-4xl animate-pulse">⛩️</div>
    </div>
  )

  if (!topic) return (
    <div className="container mx-auto px-4 py-12 text-center">
      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Tópico não encontrado</h1>
      <Link href="/forum"><Button variant="outline">Voltar ao Fórum</Button></Link>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar ao Fórum
      </Link>

      <Card className="border-border/50 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {topic.lesson && (
              <Link href={`/curso/${topic.lesson.slug}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {topic.lesson.title}
                </Badge>
              </Link>
            )}
            {topic.resolved && <Badge variant="accent">Resolvido</Badge>}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-4">{topic.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" /> {topic.user?.name || "Anônimo"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {formatDate(topic.createdAt)}
            </span>
          </div>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{topic.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-red-400" />
        Respostas ({posts.length})
      </h2>

      <div className="space-y-4 mb-8">
        {posts.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhuma resposta ainda. Seja o primeiro a responder!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{post.user?.name || "Anônimo"}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none text-sm">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {session ? (
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Sua Resposta</h3>
            <form onSubmit={handleReply} className="space-y-4">
              <div>
                <Label htmlFor="reply">Escreva sua resposta</Label>
                <textarea
                  id="reply"
                  placeholder="Compartilhe sua opinião, dica ou resposta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full mt-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm resize-y"
                />
              </div>
              <Button type="submit" className="gap-2" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Enviando..." : "Responder"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">Faça login para participar da discussão</p>
            <Link href="/auth/login"><Button size="sm">Entrar</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
