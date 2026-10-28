"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminLoading, EmptyNote, Field, PageHeading, areaClass, fieldClass } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"
import { formatDate, fromDatetimeLocal, toDatetimeLocal } from "@/lib/format"
import { EVENT_STATUSES, EVENT_TYPES, eventStatusLabel, eventTypeLabel } from "@/lib/admin-labels"
import type { CompanyOption, EventRow } from "@/types/admin"

type EventForm = {
  id?: string
  title: string
  description: string
  type: string
  location: string
  startsAt: string
  endsAt: string
  capacity: string
  status: string
  companyId: string
}

const emptyForm: EventForm = {
  title: "",
  description: "",
  type: "in-company",
  location: "",
  startsAt: "",
  endsAt: "",
  capacity: "",
  status: "scheduled",
  companyId: "",
}

export default function AdminEventos() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EventForm>(emptyForm)

  function load() {
    return adminFetch<{ events: EventRow[]; companies: CompanyOption[] }>("/api/admin/events").then((data) => {
      setEvents(data.events)
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

  function payload(current: EventForm) {
    return {
      title: current.title,
      description: current.description || null,
      type: current.type,
      location: current.location || null,
      startsAt: fromDatetimeLocal(current.startsAt),
      endsAt: current.endsAt ? fromDatetimeLocal(current.endsAt) : null,
      capacity: current.capacity ? Number(current.capacity) : null,
      status: current.status,
      companyId: current.companyId || null,
    }
  }

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Eventos"
        description="Turmas in-company, workshops, webinars, consultorias e entregas do selo."
      />
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      <Card className="mb-6 border-border/50">
        <CardHeader><CardTitle className="text-lg">{form.id ? "Editar evento" : "Novo evento"}</CardTitle></CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              void run(async () => {
                await adminFetch("/api/admin/events", {
                  method: form.id ? "PATCH" : "POST",
                  body: JSON.stringify(form.id ? { id: form.id, ...payload(form) } : payload(form)),
                })
                setForm(emptyForm)
                await load()
              })
            }}
          >
            <Field label="Título"><Input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
            <Field label="Tipo">
              <select className={fieldClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {EVENT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Início"><Input type="datetime-local" required value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></Field>
            <Field label="Término"><Input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></Field>
            <Field label="Local"><Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></Field>
            <Field label="Vagas">
              <Input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
            </Field>
            <Field label="Empresa">
              <select className={fieldClass} value={form.companyId} onChange={(event) => setForm({ ...form, companyId: event.target.value })}>
                <option value="">Sem empresa</option>
                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={fieldClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {EVENT_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Descrição">
                <textarea className={areaClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </Field>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : form.id ? "Salvar evento" : "Agendar evento"}</Button>
              {form.id ? <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>Cancelar</Button> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-lg">{events.length} evento{events.length === 1 ? "" : "s"}</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs text-muted-foreground">
                  <th className="px-2 py-3 font-medium">Evento</th>
                  <th className="px-2 py-3 font-medium">Quando</th>
                  <th className="px-2 py-3 font-medium">Empresa</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-border/30">
                    <td className="px-2 py-3">
                      <p>{event.title}</p>
                      <p className="text-xs text-muted-foreground">{eventTypeLabel(event.type)}{event.location ? ` · ${event.location}` : ""}{event.capacity ? ` · ${event.capacity} vagas` : ""}</p>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">{formatDate(event.startsAt)}</td>
                    <td className="px-2 py-3">{event.company?.name || "—"}</td>
                    <td className="px-2 py-3">{eventStatusLabel(event.status)}</td>
                    <td className="px-2 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setForm({
                          id: event.id,
                          title: event.title,
                          description: event.description || "",
                          type: event.type,
                          location: event.location || "",
                          startsAt: toDatetimeLocal(event.startsAt),
                          endsAt: toDatetimeLocal(event.endsAt),
                          capacity: event.capacity ? String(event.capacity) : "",
                          status: event.status,
                          companyId: event.companyId || "",
                        })}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!confirm(`Excluir ${event.title}?`)) return
                          void run(async () => {
                            await adminFetch("/api/admin/events", { method: "DELETE", body: JSON.stringify({ id: event.id }) })
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
            {events.length === 0 ? <EmptyNote>Nenhum evento agendado.</EmptyNote> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
