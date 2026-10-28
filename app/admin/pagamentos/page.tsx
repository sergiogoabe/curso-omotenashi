"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminLoading, EmptyNote, Field, PageHeading, fieldClass } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"
import { formatBRL, formatDate } from "@/lib/format"
import { PLAN_IDS, PLANS, getPlan } from "@/lib/plans"
import { PAYMENT_METHODS, PAYMENT_STATUSES, isPaidStatus, paymentMethodLabel } from "@/lib/admin-labels"
import type { PaymentRow } from "@/types/admin"

const emptyForm = {
  name: "",
  email: "",
  plan: "individual",
  value: String(PLANS.individual.value),
  status: "pending",
  paymentMethod: "pix",
}

export default function AdminPagamentos() {
  const [rows, setRows] = useState<PaymentRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [form, setForm] = useState(emptyForm)

  function load() {
    return adminFetch<{ payments: PaymentRow[]; total: number }>("/api/admin/payments").then((data) => {
      setRows(data.payments)
      setTotal(data.total)
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

  const filtered = useMemo(() => rows.filter((row) => {
    const haystack = `${row.name || ""} ${row.email}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const paid = isPaidStatus(row.status)
    const matchesFilter = filter === "all"
      || (filter === "paid" && paid)
      || (filter === "pending" && ["pending", "overdue"].includes(row.status.toLowerCase()))
      || (filter === "refunded" && ["refunded", "cancelled"].includes(row.status.toLowerCase()))
    return matchesQuery && matchesFilter
  }), [rows, query, filter])

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Pagamentos"
        description="Lance cobranças e confirme o recebimento. Status recebido ou confirmado libera o curso para o cliente com o mesmo e-mail. Estorno não revoga o acesso — isso fica em Clientes."
      />
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      <Card className="mb-6 border-border/50">
        <CardHeader><CardTitle className="text-lg">Novo lançamento</CardTitle></CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault()
              void run(async () => {
                await adminFetch("/api/admin/payments", {
                  method: "POST",
                  body: JSON.stringify({
                    ...form,
                    value: Number(form.value),
                  }),
                })
                setForm(emptyForm)
                await load()
              })
            }}
          >
            <Field label="Nome">
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </Field>
            <Field label="E-mail">
              <Input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </Field>
            <Field label="Plano">
              <select
                className={fieldClass}
                value={form.plan}
                onChange={(event) => {
                  const plan = event.target.value as keyof typeof PLANS
                  setForm({ ...form, plan, value: String(PLANS[plan].value) })
                }}
              >
                {PLAN_IDS.map((id) => <option key={id} value={id}>{PLANS[id].label}</option>)}
              </select>
            </Field>
            <Field label="Valor">
              <Input type="number" min="0" step="0.01" required value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} />
            </Field>
            <Field label="Meio">
              <select className={fieldClass} value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}>
                {PAYMENT_METHODS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={fieldClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {PAYMENT_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </Field>
            <div className="md:col-span-3">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Registrar pagamento"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <CardTitle className="text-lg">{total} pagamento{total === 1 ? "" : "s"}</CardTitle>
            <div className="flex flex-1 gap-2 md:justify-end">
              <Input placeholder="Buscar cliente" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 md:max-w-xs" />
              <select className={`${fieldClass} h-9 w-auto`} value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="all">Todos</option>
                <option value="paid">Confirmados</option>
                <option value="pending">Em aberto</option>
                <option value="refunded">Estornados</option>
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
                  <th className="px-2 py-3 font-medium">Valor</th>
                  <th className="px-2 py-3 font-medium">Meio</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium">Data</th>
                  <th className="px-2 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const statuses = PAYMENT_STATUSES.some((item) => item.id === row.status)
                    ? PAYMENT_STATUSES
                    : [{ id: row.status, label: row.status }, ...PAYMENT_STATUSES]
                  return (
                    <tr key={row.id} className="border-b border-border/30">
                      <td className="px-2 py-3">
                        <p>{row.name || row.user?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                      </td>
                      <td className="px-2 py-3">{getPlan(row.plan).label}</td>
                      <td className="px-2 py-3 font-medium">{formatBRL(row.value)}</td>
                      <td className="px-2 py-3">{paymentMethodLabel(row.paymentMethod)}</td>
                      <td className="px-2 py-3">
                        <select
                          className={`${fieldClass} h-9`}
                          value={row.status}
                          onChange={(event) => void run(async () => {
                            await adminFetch("/api/admin/payments", {
                              method: "PATCH",
                              body: JSON.stringify({ id: row.id, status: event.target.value }),
                            })
                            await load()
                          })}
                        >
                          {statuses.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">{formatDate(row.createdAt)}</td>
                      <td className="px-2 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!confirm("Excluir este pagamento? O acesso do cliente não muda.")) return
                            void run(async () => {
                              await adminFetch("/api/admin/payments", { method: "DELETE", body: JSON.stringify({ id: row.id }) })
                              await load()
                            })
                          }}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 ? <EmptyNote>Nenhum pagamento encontrado.</EmptyNote> : null}
          </div>
          {total > rows.length ? <p className="mt-3 text-xs text-muted-foreground">Exibindo os {rows.length} mais recentes de {total}.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
