"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminLoading, EmptyNote, PageHeading, fieldClass } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"
import { formatDate } from "@/lib/format"

type Topic = {
  id: string
  title: string
  content: string
  pinned: boolean
  resolved: boolean
  createdAt: string
  user: { id: string; name: string | null; email: string }
  lesson: { id: string; title: string } | null
  _count: { posts: number }
}

export default function AdminForum() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("open")

  function load() {
    return adminFetch<{ topics: Topic[] }>("/api/admin/forum").then((data) => setTopics(data.topics))
  }

  useEffect(() => {
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao carregar")).finally(() => setLoading(false))
  }, [])

  async function run(action: () => Promise<void>) {
    setError("")
    setSaving(true)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na operação")
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() => topics.filter((topic) => {
    const haystack = `${topic.title} ${topic.user.name || ""} ${topic.user.email}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesFilter = filter === "all" || (filter === "open" && !topic.resolved) || (filter === "resolved" && topic.resolved) || (filter === "pinned" && topic.pinned)
    return matchesQuery && matchesFilter
  }), [topics, query, filter])

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Fórum"
        description="Modere os tópicos dos alunos: fixe o que importa, marque como resolvido ou remova o que não deve ficar publicado."
      />
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <CardTitle className="text-lg">{topics.length} tópico{topics.length === 1 ? "" : "s"}</CardTitle>
            <div className="flex flex-1 gap-2 md:justify-end">
              <Input placeholder="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 md:max-w-xs" />
              <select className={`${fieldClass} h-9 w-auto`} value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="open">Em aberto</option>
                <option value="resolved">Resolvidos</option>
                <option value="pinned">Fixados</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filtered.map((topic) => (
            <article key={topic.id} className="rounded-lg border border-border/50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h3 className="font-medium">{topic.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {topic.user.name || topic.user.email} · {formatDate(topic.createdAt)} · {topic._count.posts} resposta{topic._count.posts === 1 ? "" : "s"}
                    {topic.lesson ? ` · ${topic.lesson.title}` : ""}
                    {topic.pinned ? " · fixado" : ""}
                    {topic.resolved ? " · resolvido" : ""}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{topic.content}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => void run(async () => {
                    await adminFetch("/api/admin/forum", { method: "PATCH", body: JSON.stringify({ id: topic.id, pinned: !topic.pinned }) })
                    await load()
                  })}>{topic.pinned ? "Desafixar" : "Fixar"}</Button>
                  <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => void run(async () => {
                    await adminFetch("/api/admin/forum", { method: "PATCH", body: JSON.stringify({ id: topic.id, resolved: !topic.resolved }) })
                    await load()
                  })}>{topic.resolved ? "Reabrir" : "Resolver"}</Button>
                  <Button type="button" variant="ghost" size="sm" disabled={saving} onClick={() => {
                    if (!confirm("Excluir este tópico e as respostas?")) return
                    void run(async () => {
                      await adminFetch("/api/admin/forum", { method: "DELETE", body: JSON.stringify({ id: topic.id }) })
                      await load()
                    })
                  }}>Excluir</Button>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 ? <EmptyNote>Nenhum tópico neste filtro.</EmptyNote> : null}
        </CardContent>
      </Card>
    </div>
  )
}
