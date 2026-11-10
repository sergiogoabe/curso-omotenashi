"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Key, Mail, RefreshCw } from "lucide-react"
import { AdminLoading, EmptyNote, PageHeading } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"
import { formatBRL, formatDate } from "@/lib/format"
import { getPlan } from "@/lib/plans"

type Pending = {
  id: string
  name: string
  email: string
  plan: string
  value: number
  activationCode: string | null
  asaasPaymentId: string | null
  userExists: boolean
  createdAt: string
}

type CheckResult = {
  asaasStatus: string
  activated: boolean
  userExists: boolean
}

const ASAAS_STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Recebido",
  CONFIRMED: "Recebido",
  PENDING: "Aguardando pagamento",
  OVERDUE: "Vencido",
  REFUNDED: "Estornado",
  CANCELLED: "Cancelado",
  FAILED: "Falhou",
}

function statusBadge(status: string) {
  const paid = status === "RECEIVED" || status === "CONFIRMED"
  const label = ASAAS_STATUS_LABEL[status] ?? status
  if (paid) return { label, className: "bg-green-500/15 text-green-400 border-green-500/30" }
  if (status === "OVERDUE") return { label, className: "bg-red-500/15 text-red-400 border-red-500/30" }
  return { label, className: "bg-amber-500/15 text-amber-400 border-amber-500/30" }
}

export default function AdminAtivacoes() {
  const [pendings, setPendings] = useState<Pending[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [generating, setGenerating] = useState<string | null>(null)
  const [checking, setChecking] = useState<string | null>(null)
  const [checks, setChecks] = useState<Record<string, CheckResult>>({})
  const [copied, setCopied] = useState<string | null>(null)

  function load() {
    return adminFetch<Pending[]>("/api/admin/ativacoes").then((data) => {
      setPendings(data)
      setChecks({})
    })
  }

  useEffect(() => {
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao carregar")).finally(() => setLoading(false))
  }, [])

  async function conferirAsaas(pending: Pending) {
    setChecking(pending.id)
    setError("")
    setNotice("")
    try {
      const data = await adminFetch<CheckResult>("/api/admin/ativacoes", {
        method: "POST",
        body: JSON.stringify({ action: "conferir", id: pending.id }),
      })
      if (data.activated) {
        setNotice(`Conta ativada: ${pending.email} — email de verificação enviado.`)
        setPendings((prev) => prev.filter((item) => item.id !== pending.id))
      } else {
        setChecks((prev) => ({ ...prev, [pending.id]: data }))
        if (data.userExists) setError(`${pending.email} já possui conta — remova o cadastro pendente.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao consultar o Asaas")
    } finally {
      setChecking(null)
    }
  }

  async function gerarCodigo(id: string) {
    setGenerating(id)
    setError("")
    try {
      const data = await adminFetch<{ code: string }>("/api/admin/ativacoes", {
        method: "POST",
        body: JSON.stringify({ id }),
      })
      setPendings((prev) => prev.map((item) => (item.id === id ? { ...item, activationCode: data.code } : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar código")
    } finally {
      setGenerating(null)
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 3000)
  }

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://curso-omotenashi.vercel.app"

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Conciliação de ativações"
        description="Cadastros PIX que ainda não viraram conta. A ativação é automática via webhook; se um cliente pagou e a conta não saiu, confira no Asaas para reprocessar."
      />
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
      {notice ? <p className="mb-4 text-sm text-green-400">{notice}</p> : null}

      {pendings.length === 0 ? (
        <Card className="border-border/50"><CardContent><EmptyNote>Nenhum cadastro pendente.</EmptyNote></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {pendings.map((pending) => {
            const check = checks[pending.id]
            const paid = check && (check.asaasStatus === "RECEIVED" || check.asaasStatus === "CONFIRMED")
            return (
              <Card key={pending.id} className={`border-border/50 ${paid && !check?.userExists ? "border-green-500/40" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle className="text-base">{pending.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{pending.email}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {getPlan(pending.plan).label} · {formatBRL(pending.value)} · {formatDate(pending.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {pending.userExists ? (
                        <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-xs text-red-400">E-mail já possui conta</span>
                      ) : null}
                      {check ? (
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs ${statusBadge(check.asaasStatus).className}`}>
                          Asaas: {statusBadge(check.asaasStatus).label}
                        </span>
                      ) : null}
                      <Badge variant={pending.asaasPaymentId ? "accent" : "secondary"}>
                        {pending.asaasPaymentId ? "PIX dinâmico Asaas" : "PIX estático"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
                  {pending.activationCode ? (
                    <>
                      <code className="flex-1 rounded-lg border border-border/50 bg-secondary/50 px-4 py-2 text-center font-mono text-lg tracking-widest">
                        {pending.activationCode}
                      </code>
                      <Button variant="outline" size="sm" onClick={() => handleCopy(pending.activationCode!)}>
                        {copied === pending.activationCode ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const body = `Olá ${pending.name},\n\nSeu pagamento (${getPlan(pending.plan).label}, ${formatBRL(pending.value)}) foi confirmado.\n\nCódigo de ativação:\n${pending.activationCode}\n\nAtive em ${appUrl}/auth/ativar\n\nEquipe Omotenashi`
                          window.open(`mailto:${pending.email}?subject=${encodeURIComponent("Código de ativação — Omotenashi")}&body=${encodeURIComponent(body)}`)
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </>
                  ) : pending.asaasPaymentId && !pending.userExists ? (
                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={checking === pending.id}
                      onClick={() => conferirAsaas(pending)}
                    >
                      <RefreshCw className={`h-4 w-4 ${checking === pending.id ? "animate-spin" : ""}`} />
                      {checking === pending.id ? "Consultando..." : "Conferir no Asaas"}
                    </Button>
                  ) : null}
                  {!pending.activationCode && !pending.asaasPaymentId ? (
                    <Button variant="outline" size="sm" className="gap-2" disabled={generating === pending.id} onClick={() => gerarCodigo(pending.id)}>
                      <Key className="h-4 w-4" />
                      {generating === pending.id ? "Gerando..." : "Gerar código e registrar pagamento"}
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:ml-auto"
                    onClick={() => {
                      if (!confirm("Remover este cadastro pendente?")) return
                      void adminFetch("/api/admin/ativacoes", { method: "DELETE", body: JSON.stringify({ id: pending.id }) })
                        .then(load)
                        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao remover"))
                    }}
                  >
                    Remover
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
