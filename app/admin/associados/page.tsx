"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminLoading, EmptyNote, Field, PageHeading, fieldClass } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"
import { courseAccessFrom } from "@/lib/course-access-rule"
import type { ClientRow, CompanyOption } from "@/types/admin"

export default function AdminAssociados() {
  const [users, setUsers] = useState<ClientRow[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [lessonCount, setLessonCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState("")
  const [userId, setUserId] = useState("")
  const [companyId, setCompanyId] = useState("")

  function load() {
    return adminFetch<{ users: ClientRow[]; companies: CompanyOption[]; lessonCount: number }>("/api/admin/clients").then((data) => {
      setUsers(data.users)
      setCompanies(data.companies)
      setLessonCount(data.lessonCount)
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

  const associates = useMemo(() => users.filter((user) => user.companyId), [users])
  const available = users.filter((user) => !user.companyId)
  const filtered = associates.filter((user) => {
    const haystack = `${user.name || ""} ${user.email} ${user.company?.name || ""}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  })

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Associados"
        description="Colaboradores vinculados a uma empresa cliente. O progresso usa as aulas concluídas do curso."
      />
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      <Card className="mb-6 border-border/50">
        <CardHeader><CardTitle className="text-lg">Vincular associado</CardTitle></CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">Cadastre uma empresa antes de vincular alguém. <Link href="/admin/empresas" className="text-red-400">Ir para empresas</Link></p>
          ) : (
            <form
              className="grid gap-3 md:grid-cols-3"
              onSubmit={(event) => {
                event.preventDefault()
                void run(async () => {
                  await adminFetch("/api/admin/clients", {
                    method: "PATCH",
                    body: JSON.stringify({ userId, companyId }),
                  })
                  setUserId("")
                  await load()
                })
              }}
            >
              <Field label="Cliente">
                <select className={fieldClass} required value={userId} onChange={(event) => setUserId(event.target.value)}>
                  <option value="">Selecione</option>
                  {available.map((user) => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}
                </select>
              </Field>
              <Field label="Empresa">
                <select className={fieldClass} required value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
                  <option value="">Selecione</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </Field>
              <div className="flex items-end">
                <Button type="submit" disabled={saving || !userId || !companyId}>Vincular</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <CardTitle className="text-lg">{associates.length} associado{associates.length === 1 ? "" : "s"}</CardTitle>
            <Input placeholder="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 md:ml-auto md:max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                  <th className="px-2 py-3 font-medium">Associado</th>
                  <th className="px-2 py-3 font-medium">Empresa</th>
                  <th className="px-2 py-3 font-medium">Progresso</th>
                  <th className="px-2 py-3 font-medium">Acesso</th>
                  <th className="px-2 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const done = user.progress.length
                  const pct = lessonCount > 0 ? Math.round((done / lessonCount) * 100) : 0
                  const access = courseAccessFrom(user)
                  return (
                    <tr key={user.id} className="border-b border-border/30">
                      <td className="px-2 py-3">
                        <p>{user.name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-2 py-3">{user.company?.name || "—"}</td>
                      <td className="px-2 py-3">
                        <div className="h-1.5 w-24 rounded-full bg-secondary">
                          <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{done}/{lessonCount} aulas · {pct}%</p>
                      </td>
                      <td className={`px-2 py-3 ${access ? "text-green-400" : "text-muted-foreground"}`}>{access ? "Liberado" : "Sem acesso"}</td>
                      <td className="px-2 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => void run(async () => {
                            await adminFetch("/api/admin/clients", {
                              method: "PATCH",
                              body: JSON.stringify({ userId: user.id, companyId: null }),
                            })
                            await load()
                          })}
                        >
                          Desvincular
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 ? <EmptyNote>Nenhum associado vinculado.</EmptyNote> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
