"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Copy, ExternalLink, FileText, Plus, RefreshCw, Trash2 } from "lucide-react"
import { AdminLoading, EmptyNote, Field, PageHeading, areaClass, fieldClass } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"
import { formatDate } from "@/lib/format"
import { SELO_TIERS, SELO_STATUSES, SELO_STATUS_LABEL, type SeloStatus } from "@/lib/selo"

type Certification = {
  id: string
  tier: string
  status: string
  verifyCode: string
  issuedAt: string | null
  expiresAt: string | null
  notes: string | null
  createdAt: string
  company: { id: string; name: string }
}

type Pending = {
  id: string
  companyName: string
  email: string
  tier: string
  value: number
  asaasPaymentId: string | null
  createdAt: string
}

const STATUS_STYLE: Record<SeloStatus, string> = {
  treinando: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  avaliacao: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  certificado: "bg-green-500/15 text-green-400 border-green-500/30",
  vencido: "bg-red-500/15 text-red-400 border-red-500/30",
  suspenso: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
}

const TIER_STYLE: Record<string, string> = {
  prata: "bg-zinc-400/15 text-zinc-300 border-zinc-400/30",
  ouro: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  diamante: "bg-cyan-400/15 text-cyan-300 border-cyan-400/30",
}

function diasRestantes(expiresAt: string | null) {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

export default function AdminSelo() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [pendings, setPendings] = useState<Pending[]>([])
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ companyId: "", tier: "prata", notes: "" })

  function load() {
    return adminFetch<{ certifications: Certification[]; companies: { id: string; name: string }[]; pendings: Pending[] }>(
      "/api/admin/certifications"
    ).then((data) => {
      setCertifications(data.certifications)
      setCompanies(data.companies)
      setPendings(data.pendings)
    })
  }

  useEffect(() => {
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao carregar")).finally(() => setLoading(false))
  }, [])

  function fail(err: unknown, fallback: string) {
    setError(err instanceof Error ? err.message : fallback)
    setNotice("")
  }

  async function patch(id: string, body: Record<string, unknown>, message: string) {
    setBusy(id)
    setError("")
    setNotice("")
    try {
      await adminFetch("/api/admin/certifications", { method: "PATCH", body: JSON.stringify({ id, ...body }) })
      setNotice(message)
      await load()
    } catch (err) {
      fail(err, "Falha ao salvar")
    } finally {
      setBusy(null)
    }
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setNotice("")
    try {
      await adminFetch("/api/admin/certifications", {
        method: "POST",
        body: JSON.stringify({ ...form, notes: form.notes || undefined }),
      })
      setNotice("Certificação criada.")
      setShowForm(false)
      setForm({ companyId: "", tier: "prata", notes: "" })
      await load()
    } catch (err) {
      fail(err, "Falha ao criar")
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 3000)
  }

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Selo Omotenashi"
        description="Ciclo de vida das certificações: treinamento, avaliação, emissão e renovação anual. O código de verificação é público na página de cada selo."
      >
        <Button size="sm" className="gap-2" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          {showForm ? "Fechar" : "Nova certificação"}
        </Button>
      </PageHeading>
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
      {notice ? <p className="mb-4 text-sm text-green-400">{notice}</p> : null}

      {showForm ? (
        <Card className="mb-6 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nova certificação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={criar} className="grid gap-4 md:grid-cols-3">
              <Field label="Empresa">
                <select className={fieldClass} value={form.companyId} onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))} required>
                  <option value="">Selecione...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Selo">
                <select className={fieldClass} value={form.tier} onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}>
                  {Object.entries(SELO_TIERS).map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Observações (opcional)">
                <input
                  className={fieldClass}
                  maxLength={500}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Anotações internas"
                />
              </Field>
              <div className="md:col-span-3">
                <Button type="submit" size="sm">
                  Criar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {pendings.length > 0 ? (
        <Card className="mb-6 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Compras de selo aguardando pagamento ({pendings.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendings.map((p) => (
              <div key={p.id} className="flex flex-col gap-1 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium">{p.companyName}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.email} · {SELO_TIERS[p.tier as keyof typeof SELO_TIERS]?.label ?? p.tier} · R$ {p.value.toFixed(2).replace(".", ",")} · {formatDate(p.createdAt)}
                  </p>
                </div>
                <Badge variant={p.asaasPaymentId ? "accent" : "secondary"}>{p.asaasPaymentId ? "PIX dinâmico" : "PIX estático"}</Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Após o pagamento confirmado no Asaas, o webhook cria a empresa e a certificação automaticamente.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {certifications.length === 0 ? (
        <Card className="border-border/50">
          <CardContent>
            <EmptyNote>Nenhuma certificação ainda. Crie a primeira com o botão acima.</EmptyNote>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert) => {
            const status = (SELO_STATUSES as readonly string[]).includes(cert.status) ? (cert.status as SeloStatus) : "treinando"
            const dias = diasRestantes(cert.expiresAt)
            const vencendo = status === "certificado" && dias !== null && dias <= 30
            return (
              <Card key={cert.id} className={`border-border/50 ${vencendo ? "border-amber-500/40" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle className="text-base">{cert.company.name}</CardTitle>
                      <p className="mt-1 font-mono text-sm tracking-widest">{cert.verifyCode}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Emitido: {cert.issuedAt ? formatDate(cert.issuedAt) : "—"} · Validade: {cert.expiresAt ? formatDate(cert.expiresAt) : "—"}
                        {status === "certificado" && dias !== null ? ` · ${dias >= 0 ? `vence em ${dias} dia${dias === 1 ? "" : "s"}` : `vencido há ${-dias} dia${dias === -1 ? "" : "s"}`}` : ""}
                      </p>
                      {cert.notes ? <p className="mt-2 max-w-xl text-xs text-muted-foreground">{cert.notes}</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs ${TIER_STYLE[cert.tier] ?? TIER_STYLE.prata}`}>
                        {SELO_TIERS[cert.tier as keyof typeof SELO_TIERS]?.label ?? cert.tier}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs ${STATUS_STYLE[status]}`}>{SELO_STATUS_LABEL[status]}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="h-9 rounded-md border border-border bg-secondary px-2 text-sm"
                      value={status}
                      disabled={busy === cert.id}
                      onChange={(e) => patch(cert.id, { status: e.target.value }, "Status atualizado.")}
                    >
                      {SELO_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {SELO_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    {status === "certificado" ? (
                      <Button variant="outline" size="sm" disabled={busy === cert.id} onClick={() => patch(cert.id, { renew: true }, "Renovado por mais 1 ano.")}>
                        <RefreshCw className="h-4 w-4" /> Renovar +1 ano
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" onClick={() => handleCopy(cert.verifyCode)}>
                      {copied === cert.verifyCode ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Link
                      href={`/selo/verificar/${cert.verifyCode}`}
                      target="_blank"
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" /> Verificação
                    </Link>
                    <Link
                      href={`/api/certificados/${cert.verifyCode}`}
                      target="_blank"
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="h-4 w-4" /> Certificado PDF
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(editing === cert.id ? null : cert.id)
                        setNotesDraft(cert.notes ?? "")
                      }}
                    >
                      {editing === cert.id ? "Fechar notas" : "Notas"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => {
                        if (!confirm("Excluir esta certificação?")) return
                        setBusy(cert.id)
                        adminFetch("/api/admin/certifications", { method: "DELETE", body: JSON.stringify({ id: cert.id }) })
                          .then(load)
                          .catch((err: unknown) => fail(err, "Falha ao excluir"))
                          .finally(() => setBusy(null))
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {editing === cert.id ? (
                    <div className="space-y-2">
                      <textarea
                        className={areaClass}
                        maxLength={5000}
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Anotações internas sobre auditoria, documentos, contatos..."
                      />
                      <Button size="sm" disabled={busy === cert.id} onClick={() => patch(cert.id, { notes: notesDraft || null }, "Notas salvas.")}>
                        Salvar notas
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
