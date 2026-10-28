"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, XCircle } from "lucide-react"
import { PLANS, PLAN_IDS, getPlan } from "@/lib/plans"
import { formatBRL } from "@/lib/format"
import { AdminLoading, Field, fieldClass } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"

type ClientOption = { id: string; name: string | null; email: string }

export default function AdminVendas() {
  const [data, setData] = useState<any>(null)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterPlan, setFilterPlan] = useState("all")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ userId: "", plan: "individual" })

  function load() {
    return Promise.all([
      adminFetch<{ enrollments: unknown[]; stats: Record<string, number> }>("/api/admin/enrollments"),
      adminFetch<{ users: ClientOption[] }>("/api/admin/clients").catch(() => ({ users: [] as ClientOption[] })),
    ]).then(([enrollments, clientData]) => {
      setData(enrollments)
      setClients(clientData.users)
    })
  }

  useEffect(() => {
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao carregar")).finally(() => setLoading(false))
  }, [])

  async function toggleActive(enrollment: { id: string; active: boolean; plan: string }) {
    setBusyId(enrollment.id)
    setError("")
    try {
      await adminFetch("/api/admin/enrollments", {
        method: "PATCH",
        body: JSON.stringify({ id: enrollment.id, active: !enrollment.active, plan: enrollment.plan }),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <AdminLoading />

  const { enrollments, stats } = data || { enrollments: [], stats: {} }

  const filtered = enrollments.filter((e: any) => {
    const name = e.user?.name || ""
    const email = e.user?.email || ""
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === "all" || e.plan === filterPlan
    return matchSearch && matchPlan
  })

  return (
    <div>
      <h2 className="text-2xl font-display font-bold mb-2">Matrículas</h2>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">O valor mostrado é o preço do plano, não um pagamento confirmado. Suspender a matrícula bloqueia o curso.</p>
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      <Card className="mb-8 border-border/50">
        <CardHeader><CardTitle className="text-lg">Nova matrícula</CardTitle></CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-[1fr_220px_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              setSaving(true)
              setError("")
              adminFetch("/api/admin/enrollments", {
                method: "POST",
                body: JSON.stringify({ userId: form.userId, plan: form.plan, active: true }),
              })
                .then(() => load())
                .then(() => setForm({ userId: "", plan: form.plan }))
                .catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao matricular"))
                .finally(() => setSaving(false))
            }}
          >
            <Field label="Cliente">
              <select className={fieldClass} required value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })}>
                <option value="">Selecione</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name || client.email} · {client.email}</option>
                ))}
              </select>
            </Field>
            <Field label="Plano">
              <select className={fieldClass} value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })}>
                {PLAN_IDS.map((id) => <option key={id} value={id}>{PLANS[id].label}</option>)}
              </select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={saving || clients.length === 0}>{saving ? "Salvando..." : "Matricular"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Valor dos planos</CardTitle>
            <p className="text-2xl font-bold text-emerald-400">{formatBRL(stats.revenue || 0)}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Matrículas Individuais</CardTitle>
            <p className="text-2xl font-bold">{stats.individual || 0}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Matrículas Corporativas</CardTitle>
            <p className="text-2xl font-bold">{stats.business || 0}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Matrículas Ativas</CardTitle>
            <p className="text-2xl font-bold text-green-400">{stats.active || 0}/{stats.total || 0}</p>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <CardTitle className="text-lg">Todas as Matrículas</CardTitle>
            <div className="flex gap-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9 w-48"
                />
              </div>
              <select
                value={filterPlan}
                onChange={e => setFilterPlan(e.target.value)}
                className="h-9 rounded-md border border-border bg-secondary px-3 text-sm"
              >
                <option value="all">Todos os planos</option>
                {PLAN_IDS.map((id) => (
                  <option key={id} value={id}>{PLANS[id].label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Plano</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Data</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Valor do plano</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e: any) => (
                  <tr key={e.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-2">{e.user?.name || "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground">{e.user?.email}</td>
                    <td className="py-3 px-2">
                      <Badge variant={e.plan === "individual" ? "secondary" : "accent"}>
                        {getPlan(e.plan).label}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      {e.active ? (
                        <span className="flex items-center gap-1 text-green-400"><CheckCircle className="h-3 w-3" /> Ativo</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400"><XCircle className="h-3 w-3" /> Inativo</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{new Date(e.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-2 font-medium">{formatBRL(getPlan(e.plan).value)}</td>
                    <td className="py-3 px-2">
                      <Button size="sm" variant="outline" disabled={busyId === e.id} onClick={() => toggleActive(e)}>
                        {e.active ? "Suspender" : "Reativar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma matrícula encontrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
