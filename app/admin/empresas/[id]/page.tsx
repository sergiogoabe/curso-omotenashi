"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, Mail, Phone, Users } from "lucide-react"
import { AdminLoading, EmptyNote, Field } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"
import { formatDate } from "@/lib/format"
import { eventTypeLabel } from "@/lib/admin-labels"
import type { CompanyEmployeeRow } from "@/lib/company-report"
import type { EventRow } from "@/types/admin"

type CompanyDetail = {
  id: string
  name: string
  email: string
  phone: string | null
  cnpj: string | null
  plan: string
  active: boolean
  createdAt: string
  totalUsers: number
  avgProgress: number
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [employees, setEmployees] = useState<CompanyEmployeeRow[]>([])
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", cnpj: "", plan: "business", active: true })

  function load() {
    return Promise.all([
      adminFetch<{ company: CompanyDetail; employees: CompanyEmployeeRow[] }>(`/api/admin/companies/${id}`),
      adminFetch<{ events: EventRow[] }>("/api/admin/events").catch(() => ({ events: [] as EventRow[] })),
    ]).then(([detail, eventData]) => {
      setCompany(detail.company)
      setEmployees(detail.employees)
      setEvents(eventData.events.filter((event) => event.companyId === id))
      setForm({
        name: detail.company.name,
        email: detail.company.email,
        phone: detail.company.phone || "",
        cnpj: detail.company.cnpj || "",
        plan: detail.company.plan,
        active: detail.company.active,
      })
    })
  }

  useEffect(() => {
    if (!id) return
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao carregar")).finally(() => setLoading(false))
  }, [id])

  const upcoming = useMemo(
    () => events.filter((event) => event.status !== "cancelled" && new Date(event.startsAt) >= new Date()).slice(0, 5),
    [events],
  )

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

  if (loading) return <AdminLoading />
  if (!company) return <p className="text-sm text-muted-foreground">Empresa não encontrada.</p>

  return (
    <div>
      <Link href="/admin/empresas" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">{company.name}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{company.email}</span>
            {company.phone ? <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{company.phone}</span> : null}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={company.active ? "accent" : "destructive"}>{company.active ? "Ativa" : "Inativa"}</Badge>
            <Badge variant="secondary">{company.plan}</Badge>
            {company.cnpj ? <span className="text-xs text-muted-foreground">CNPJ {company.cnpj}</span> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/associados`}><Button variant="outline" size="sm">Associados</Button></Link>
          <Link href={`/admin/eventos`}><Button variant="outline" size="sm">Eventos</Button></Link>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="border-border/50 p-4"><p className="text-xs text-muted-foreground">Associados</p><p className="text-2xl font-bold">{company.totalUsers}</p></Card>
        <Card className="border-border/50 p-4"><p className="text-xs text-muted-foreground">Progresso médio</p><p className="text-2xl font-bold text-amber-400">{company.avgProgress}%</p></Card>
        <Card className="border-border/50 p-4"><p className="text-xs text-muted-foreground">Cliente desde</p><p className="text-lg font-bold">{formatDate(company.createdAt)}</p></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Editar empresa</CardTitle></CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                void run(async () => {
                  await adminFetch("/api/admin/companies", {
                    method: "PATCH",
                    body: JSON.stringify({
                      id: company.id,
                      name: form.name,
                      email: form.email,
                      phone: form.phone || null,
                      cnpj: form.cnpj || null,
                      plan: form.plan,
                      active: form.active,
                    }),
                  })
                  await load()
                })
              }}
            >
              <Field label="Nome"><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
              <Field label="E-mail"><Input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
              <Field label="Telefone"><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
              <Field label="CNPJ"><Input value={form.cnpj} onChange={(event) => setForm({ ...form, cnpj: event.target.value })} /></Field>
              <Field label="Plano"><Input value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })} /></Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                Empresa ativa
              </label>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={saving}
                  onClick={() => {
                    if (!confirm(`Excluir ${company.name}? Os associados ficam sem empresa.`)) return
                    void run(async () => {
                      await adminFetch("/api/admin/companies", { method: "DELETE", body: JSON.stringify({ id: company.id }) })
                      window.location.href = "/admin/empresas"
                    })
                  }}
                >
                  Excluir
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Próximos eventos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? <EmptyNote>Nenhum evento agendado para esta empresa.</EmptyNote> : null}
            {upcoming.map((event) => (
              <div key={event.id} className="border-b border-border/40 pb-3 last:border-0">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">{eventTypeLabel(event.type)} · {formatDate(event.startsAt)}</p>
              </div>
            ))}
            <Link href="/admin/eventos" className="inline-flex items-center gap-1 text-xs text-red-400"><Calendar className="h-3.5 w-3.5" />Agendar evento</Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border/50">
        <CardHeader><CardTitle className="text-lg">Equipe</CardTitle></CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <EmptyNote>Nenhum associado vinculado. Use a tela Associados para vincular alunos.</EmptyNote>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                    <th className="px-2 py-3 font-medium">Nome</th>
                    <th className="px-2 py-3 font-medium">Progresso</th>
                    <th className="px-2 py-3 font-medium">Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-border/30">
                      <td className="px-2 py-3">
                        <p>{employee.name}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </td>
                      <td className="px-2 py-3">
                        <div className="h-1.5 w-28 rounded-full bg-secondary">
                          <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${employee.progressPercent}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{employee.completedLessons}/{employee.totalLessons} · {employee.progressPercent}%</p>
                      </td>
                      <td className={`px-2 py-3 ${employee.enrolled ? "text-green-400" : "text-muted-foreground"}`}>
                        {employee.enrolled ? "Liberado" : "Sem acesso"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{employees.length} pessoa(s) nesta empresa</p>
        </CardContent>
      </Card>
    </div>
  )
}
