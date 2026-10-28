"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminLoading, EmptyNote, Field, PageHeading, fieldClass } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"
import { formatDate, toDateInput } from "@/lib/format"
import { PLAN_IDS, PLANS, getPlan } from "@/lib/plans"
import type { ClientRow, CompanyOption } from "@/types/admin"

type Draft = {
  userId: string
  name: string
  phone: string
  role: "student" | "admin"
  plan: string
  courseAccess: boolean
  companyId: string
  courseExpiresAt: string
}

function hasAccess(user: ClientRow) {
  const enrollment = user.enrollments.some((item) => item.active && (!item.expiresAt || new Date(item.expiresAt) > new Date()))
  const flagged = user.courseAccess && (!user.courseExpiresAt || new Date(user.courseExpiresAt) > new Date())
  return enrollment || flagged
}

export default function AdminClientes() {
  const [users, setUsers] = useState<ClientRow[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [draft, setDraft] = useState<Draft | null>(null)

  function load() {
    return adminFetch<{ users: ClientRow[]; total: number; companies: CompanyOption[] }>("/api/admin/clients").then((data) => {
      setUsers(data.users)
      setTotal(data.total)
      setCompanies(data.companies)
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

  const filtered = useMemo(() => users.filter((user) => {
    const haystack = `${user.name || ""} ${user.email} ${user.phone || ""}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const access = hasAccess(user)
    const matchesFilter = filter === "all"
      || (filter === "access" && access)
      || (filter === "blocked" && !access)
      || (filter === "admin" && user.role === "admin")
      || (filter === "company" && Boolean(user.companyId))
    return matchesQuery && matchesFilter
  }), [users, query, filter])

  function edit(user: ClientRow) {
    setDraft({
      userId: user.id,
      name: user.name || "",
      phone: user.phone || "",
      role: user.role === "admin" ? "admin" : "student",
      plan: user.plan in PLANS ? user.plan : "individual",
      courseAccess: hasAccess(user),
      companyId: user.companyId || "",
      courseExpiresAt: toDateInput(user.courseExpiresAt),
    })
  }

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Clientes"
        description="Contas de alunos e compradores. Liberar o acesso cria ou reativa a matrícula; revogar suspende as matrículas ativas."
      />
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      {draft ? (
        <Card className="mb-6 border-border/50">
          <CardHeader><CardTitle className="text-lg">Editar cliente</CardTitle></CardHeader>
          <CardContent>
            <form
              className="grid gap-3 md:grid-cols-3"
              onSubmit={(event) => {
                event.preventDefault()
                void run(async () => {
                  await adminFetch("/api/admin/clients", {
                    method: "PATCH",
                    body: JSON.stringify({
                      ...draft,
                      name: draft.name || null,
                      phone: draft.phone || null,
                      companyId: draft.companyId || null,
                      courseExpiresAt: draft.courseExpiresAt || null,
                    }),
                  })
                  setDraft(null)
                  await load()
                })
              }}
            >
              <Field label="Nome"><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
              <Field label="Telefone"><Input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></Field>
              <Field label="Papel">
                <select className={fieldClass} value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as Draft["role"] })}>
                  <option value="student">Aluno</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Plano">
                <select className={fieldClass} value={draft.plan} onChange={(event) => setDraft({ ...draft, plan: event.target.value })}>
                  {PLAN_IDS.map((id) => <option key={id} value={id}>{PLANS[id].label}</option>)}
                </select>
              </Field>
              <Field label="Empresa">
                <select className={fieldClass} value={draft.companyId} onChange={(event) => setDraft({ ...draft, companyId: event.target.value })}>
                  <option value="">Sem empresa</option>
                  {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </Field>
              <Field label="Acesso até">
                <Input type="date" value={draft.courseExpiresAt} onChange={(event) => setDraft({ ...draft, courseExpiresAt: event.target.value })} />
              </Field>
              <label className="flex items-center gap-2 text-sm md:col-span-3">
                <input type="checkbox" checked={draft.courseAccess} onChange={(event) => setDraft({ ...draft, courseAccess: event.target.checked })} />
                Acesso ao curso liberado
              </label>
              <div className="flex gap-2 md:col-span-3">
                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <CardTitle className="text-lg">{total} cliente{total === 1 ? "" : "s"}</CardTitle>
            <div className="flex flex-1 gap-2 md:justify-end">
              <Input placeholder="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 md:max-w-xs" />
              <select className={`${fieldClass} h-9 w-auto`} value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="all">Todos</option>
                <option value="access">Com acesso</option>
                <option value="blocked">Sem acesso</option>
                <option value="company">Com empresa</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                  <th className="px-2 py-3 font-medium">Cliente</th>
                  <th className="px-2 py-3 font-medium">Plano</th>
                  <th className="px-2 py-3 font-medium">Acesso</th>
                  <th className="px-2 py-3 font-medium">Empresa</th>
                  <th className="px-2 py-3 font-medium">Desde</th>
                  <th className="px-2 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/30">
                    <td className="px-2 py-3">
                      <p>{user.name || "Sem nome"} {user.role === "admin" ? <span className="text-xs text-amber-400">admin</span> : null}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="px-2 py-3">{getPlan(user.plan).label}</td>
                    <td className={`px-2 py-3 ${hasAccess(user) ? "text-green-400" : "text-muted-foreground"}`}>
                      {hasAccess(user) ? "Liberado" : "Bloqueado"}
                    </td>
                    <td className="px-2 py-3">{user.company?.name || "—"}</td>
                    <td className="px-2 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-2 py-3 text-right">
                      <Button type="button" variant="ghost" size="sm" onClick={() => edit(user)}>Editar</Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!confirm(`Remover ${user.email}?`)) return
                          void run(async () => {
                            await adminFetch("/api/admin/clients", { method: "DELETE", body: JSON.stringify({ userId: user.id }) })
                            await load()
                          })
                        }}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? <EmptyNote>Nenhum cliente encontrado.</EmptyNote> : null}
          </div>
          {total > users.length ? <p className="mt-3 text-xs text-muted-foreground">Exibindo os {users.length} mais recentes de {total}.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
