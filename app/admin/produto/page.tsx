"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminLoading, EmptyNote, Field, PageHeading, areaClass, fieldClass } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"

type Tab = "aulas" | "modulos" | "ebook"

type Category = { id: string; name: string; slug: string; order: number; _count: { lessons: number } }
type Lesson = {
  id: string
  title: string
  description: string
  content: string
  videoUrl: string | null
  videoType: string
  duration: string
  order: number
  categoryId: string
  category: { id: string; name: string }
}
type Chapter = { id: string; title: string; slug: string; content: string; order: number }

const emptyLesson = { id: "", title: "", description: "", content: "", videoUrl: "", videoType: "youtube", duration: "10:00", order: "0", categoryId: "" }
const emptyCategory = { id: "", name: "", order: "0" }
const emptyChapter = { id: "", title: "", content: "", order: "0" }

export default function AdminProduto() {
  const [tab, setTab] = useState<Tab>("aulas")
  const [categories, setCategories] = useState<Category[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState("")
  const [lesson, setLesson] = useState(emptyLesson)
  const [category, setCategory] = useState(emptyCategory)
  const [chapter, setChapter] = useState(emptyChapter)

  function load() {
    return adminFetch<{ categories: Category[]; lessons: Lesson[]; chapters: Chapter[] }>("/api/admin/content").then((data) => {
      setCategories(data.categories)
      setLessons(data.lessons)
      setChapters(data.chapters)
      setLesson((current) => ({ ...current, categoryId: current.categoryId || data.categories[0]?.id || "" }))
    })
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

  const visibleLessons = useMemo(() => lessons.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [lessons, query])
  const visibleChapters = useMemo(() => chapters.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [chapters, query])

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Conteúdo"
        description="Módulos, aulas e capítulos do e-book. O endereço de cada item permanece estável quando o título muda."
      />
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      <div className="mb-6 flex gap-2">
        {([
          ["aulas", `Aulas (${lessons.length})`],
          ["modulos", `Módulos (${categories.length})`],
          ["ebook", `E-book (${chapters.length})`],
        ] as const).map(([id, label]) => (
          <Button key={id} type="button" variant={tab === id ? "default" : "outline"} size="sm" onClick={() => { setTab(id); setQuery("") }}>
            {label}
          </Button>
        ))}
      </div>

      {tab === "aulas" ? (
        <>
          <Card className="mb-6 border-border/50">
            <CardHeader><CardTitle className="text-lg">{lesson.id ? "Editar aula" : "Nova aula"}</CardTitle></CardHeader>
            <CardContent>
              <form
                className="grid gap-3 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  void run(async () => {
                    const body = {
                      resource: "lesson",
                      title: lesson.title,
                      description: lesson.description,
                      content: lesson.content,
                      videoUrl: lesson.videoUrl || null,
                      videoType: lesson.videoType,
                      duration: lesson.duration || "10:00",
                      order: Number(lesson.order) || 0,
                      categoryId: lesson.categoryId,
                      ...(lesson.id ? { id: lesson.id } : {}),
                    }
                    await adminFetch("/api/admin/content", { method: lesson.id ? "PATCH" : "POST", body: JSON.stringify(body) })
                    setLesson({ ...emptyLesson, categoryId: categories[0]?.id || "" })
                    await load()
                  })
                }}
              >
                <Field label="Título"><Input required value={lesson.title} onChange={(event) => setLesson({ ...lesson, title: event.target.value })} /></Field>
                <Field label="Módulo">
                  <select className={fieldClass} required value={lesson.categoryId} onChange={(event) => setLesson({ ...lesson, categoryId: event.target.value })}>
                    <option value="">Selecione</option>
                    {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </Field>
                <Field label="Duração"><Input value={lesson.duration} onChange={(event) => setLesson({ ...lesson, duration: event.target.value })} placeholder="10:00" /></Field>
                <Field label="Ordem"><Input type="number" min="0" value={lesson.order} onChange={(event) => setLesson({ ...lesson, order: event.target.value })} /></Field>
                <Field label="Vídeo">
                  <Input value={lesson.videoUrl} onChange={(event) => setLesson({ ...lesson, videoUrl: event.target.value })} placeholder="URL do YouTube ou arquivo" />
                </Field>
                <Field label="Tipo de vídeo">
                  <select className={fieldClass} value={lesson.videoType} onChange={(event) => setLesson({ ...lesson, videoType: event.target.value })}>
                    <option value="youtube">YouTube</option>
                    <option value="custom">Arquivo</option>
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Descrição"><textarea className={areaClass} value={lesson.description} onChange={(event) => setLesson({ ...lesson, description: event.target.value })} /></Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Conteúdo"><textarea className={`${areaClass} min-h-40`} value={lesson.content} onChange={(event) => setLesson({ ...lesson, content: event.target.value })} /></Field>
                </div>
                <div className="flex gap-2 md:col-span-2">
                  <Button type="submit" disabled={saving || categories.length === 0}>{lesson.id ? "Salvar aula" : "Publicar aula"}</Button>
                  {lesson.id ? <Button type="button" variant="outline" onClick={() => setLesson({ ...emptyLesson, categoryId: categories[0]?.id || "" })}>Cancelar</Button> : null}
                </div>
              </form>
              {categories.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Crie um módulo antes da primeira aula.</p> : null}
            </CardContent>
          </Card>
          <ListCard title="Aulas" query={query} onQuery={setQuery}>
            {visibleLessons.map((item) => (
              <tr key={item.id} className="border-b border-border/30">
                <td className="px-2 py-3">
                  <p>{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.category.name} · {item.duration}</p>
                </td>
                <td className="px-2 py-3 text-muted-foreground">{item.order}</td>
                <td className="px-2 py-3 text-right">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setLesson({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    content: item.content,
                    videoUrl: item.videoUrl || "",
                    videoType: item.videoType,
                    duration: item.duration,
                    order: String(item.order),
                    categoryId: item.categoryId,
                  })}>Editar</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    if (!confirm(`Excluir a aula ${item.title}?`)) return
                    void run(async () => {
                      await adminFetch("/api/admin/content", { method: "DELETE", body: JSON.stringify({ resource: "lesson", id: item.id }) })
                      await load()
                    })
                  }}>Excluir</Button>
                </td>
              </tr>
            ))}
            {visibleLessons.length === 0 ? <EmptyRow /> : null}
          </ListCard>
        </>
      ) : null}

      {tab === "modulos" ? (
        <>
          <Card className="mb-6 border-border/50">
            <CardHeader><CardTitle className="text-lg">{category.id ? "Editar módulo" : "Novo módulo"}</CardTitle></CardHeader>
            <CardContent>
              <form
                className="grid gap-3 md:grid-cols-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  void run(async () => {
                    await adminFetch("/api/admin/content", {
                      method: category.id ? "PATCH" : "POST",
                      body: JSON.stringify({
                        resource: "category",
                        name: category.name,
                        order: Number(category.order) || 0,
                        ...(category.id ? { id: category.id } : {}),
                      }),
                    })
                    setCategory(emptyCategory)
                    await load()
                  })
                }}
              >
                <Field label="Nome"><Input required value={category.name} onChange={(event) => setCategory({ ...category, name: event.target.value })} /></Field>
                <Field label="Ordem"><Input type="number" min="0" value={category.order} onChange={(event) => setCategory({ ...category, order: event.target.value })} /></Field>
                <div className="flex items-end gap-2">
                  <Button type="submit" disabled={saving}>{category.id ? "Salvar" : "Criar módulo"}</Button>
                  {category.id ? <Button type="button" variant="outline" onClick={() => setCategory(emptyCategory)}>Cancelar</Button> : null}
                </div>
              </form>
            </CardContent>
          </Card>
          <ListCard title="Módulos">
            {categories.map((item) => (
              <tr key={item.id} className="border-b border-border/30">
                <td className="px-2 py-3">
                  <p>{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item._count.lessons} aulas</p>
                </td>
                <td className="px-2 py-3 text-muted-foreground">{item.order}</td>
                <td className="px-2 py-3 text-right">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCategory({ id: item.id, name: item.name, order: String(item.order) })}>Editar</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    if (!confirm(`Excluir o módulo ${item.name}?`)) return
                    void run(async () => {
                      await adminFetch("/api/admin/content", { method: "DELETE", body: JSON.stringify({ resource: "category", id: item.id }) })
                      await load()
                    })
                  }}>Excluir</Button>
                </td>
              </tr>
            ))}
            {categories.length === 0 ? <EmptyRow /> : null}
          </ListCard>
        </>
      ) : null}

      {tab === "ebook" ? (
        <>
          <Card className="mb-6 border-border/50">
            <CardHeader><CardTitle className="text-lg">{chapter.id ? "Editar capítulo" : "Novo capítulo"}</CardTitle></CardHeader>
            <CardContent>
              <form
                className="grid gap-3 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  void run(async () => {
                    await adminFetch("/api/admin/content", {
                      method: chapter.id ? "PATCH" : "POST",
                      body: JSON.stringify({
                        resource: "chapter",
                        title: chapter.title,
                        content: chapter.content,
                        order: Number(chapter.order) || 0,
                        ...(chapter.id ? { id: chapter.id } : {}),
                      }),
                    })
                    setChapter(emptyChapter)
                    await load()
                  })
                }}
              >
                <Field label="Título"><Input required value={chapter.title} onChange={(event) => setChapter({ ...chapter, title: event.target.value })} /></Field>
                <Field label="Ordem"><Input type="number" min="0" value={chapter.order} onChange={(event) => setChapter({ ...chapter, order: event.target.value })} /></Field>
                <div className="md:col-span-2">
                  <Field label="Conteúdo"><textarea className={`${areaClass} min-h-40`} value={chapter.content} onChange={(event) => setChapter({ ...chapter, content: event.target.value })} /></Field>
                </div>
                <div className="flex gap-2 md:col-span-2">
                  <Button type="submit" disabled={saving}>{chapter.id ? "Salvar capítulo" : "Publicar capítulo"}</Button>
                  {chapter.id ? <Button type="button" variant="outline" onClick={() => setChapter(emptyChapter)}>Cancelar</Button> : null}
                </div>
              </form>
            </CardContent>
          </Card>
          <ListCard title="Capítulos" query={query} onQuery={setQuery}>
            {visibleChapters.map((item) => (
              <tr key={item.id} className="border-b border-border/30">
                <td className="px-2 py-3">{item.title}</td>
                <td className="px-2 py-3 text-muted-foreground">{item.order}</td>
                <td className="px-2 py-3 text-right">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setChapter({ id: item.id, title: item.title, content: item.content, order: String(item.order) })}>Editar</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    if (!confirm(`Excluir o capítulo ${item.title}?`)) return
                    void run(async () => {
                      await adminFetch("/api/admin/content", { method: "DELETE", body: JSON.stringify({ resource: "chapter", id: item.id }) })
                      await load()
                    })
                  }}>Excluir</Button>
                </td>
              </tr>
            ))}
            {visibleChapters.length === 0 ? <EmptyRow /> : null}
          </ListCard>
        </>
      ) : null}
    </div>
  )
}

function ListCard({ title, query, onQuery, children }: {
  title: string
  query?: string
  onQuery?: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {onQuery ? <Input placeholder="Buscar" value={query} onChange={(event) => onQuery(event.target.value)} className="h-9 md:ml-auto md:max-w-xs" /> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                <th className="px-2 py-3 font-medium">Item</th>
                <th className="px-2 py-3 font-medium">Ordem</th>
                <th className="px-2 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyRow() {
  return (
    <tr>
      <td colSpan={3}><EmptyNote>Nada por aqui.</EmptyNote></td>
    </tr>
  )
}
