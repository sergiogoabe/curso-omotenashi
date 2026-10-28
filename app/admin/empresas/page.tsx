"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, ArrowRight } from "lucide-react"
import { AdminLoading, EmptyNote, Field, PageHeading, fieldClass } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"

type CompanyRow = {
  id: string
  name: string
  email: string
  phone: string | null
  cnpj: string | null
  plan: string
  active: boolean
  totalUsers: number
  avgProgress: number
  createdAt: string
}

const emptyForm = { name: "", email: "", phone: "", cnpj: "", plan: "business" }

export default function AdminEmpresas() {
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState(emptyForm)

  function load() {
    return adminFetch<{ companies: CompanyRow[] }>("/api/admin/companies").then((data) => setCompanies(data.companies))
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

  const filtered = companies.filter((company) =>
    `${company.name} ${company.email}`.toLowerCase().includes(search.toLowerCase()),
  )

  const totalEmployees = companies.reduce((sum, company) => sum + company.totalUsers, 0)
  const avgProgress = companies.length
    ? Math.round(companies.reduce((sum, company) => sum + company.avgProgress, 0) / companies.length)
    : 0

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Empresas"
        description="Contas corporativas, progresso da equipe e vínculo com associados e eventos in-company."
      />
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="border-border/50 p-4"><p className="text-xs text-muted-foreground">Empresas</p><p className="text-2xl font-bold">{companies.length}</p></Card>
        <Card className="border-border/50 p-4"><p className="text-xs text-muted-foreground">Associados</p><p className="text-2xl font-bold">{totalEmployees}</p></Card>
        <Card className="border-border/50 p-4"><p className="text-xs text-muted-foreground">Progresso médio</p><p className="text-2xl font-bold text-amber-400">{avgProgress}%</p></Card>
      </div>

      <Card className="mb-6 border-border/50">
        <CardHeader><CardTitle className="text-lg">Nova empresa</CardTitle></CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault()
              void run(async () => {
                await adminFetch("/api/admin/companies", {
                  method: "POST",
                  body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone || null,
                    cnpj: form.cnpj || null,
                    plan: form.plan,
                  }),
                })
                setForm(emptyForm)
                await load()
              })
            }}
          >
            <Field label="Razão social"><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
            <Field label="E-mail"><Input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
            <Field label="Telefone"><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
            <Field label="CNPJ"><Input value={form.cnpj} onChange={(event) => setForm({ ...form, cnpj: event.target.value })} /></Field>
            <Field label="Plano interno">
              <Input value={form.plan} onChange={(event) => setForm({ ...form, plan: event.target.value })} placeholder="business" />
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Cadastrar empresa"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <CardTitle className="text-lg">Cadastradas</CardTitle>
            <div className="relative md:ml-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar" value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-64 pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((company) => (
              <Link key={company.id} href={`/admin/empresas/${company.id}`} className="block">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-4 transition-colors hover:border-red-500/30 hover:bg-secondary/30">
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="h-3.5 w-3.5" />{company.totalUsers}</span>
                    <span className="text-sm text-muted-foreground">{company.avgProgress}%</span>
                    <Badge variant={company.active ? "accent" : "destructive"}>{company.active ? "Ativa" : "Inativa"}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
            {filtered.length === 0 ? <EmptyNote>Nenhuma empresa encontrada.</EmptyNote> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
