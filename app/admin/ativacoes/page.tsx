"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Key, Mail } from "lucide-react"
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
  createdAt: string
}

export default function AdminAtivacoes() {
  const [pendings, setPendings] = useState<Pending[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [generating, setGenerating] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  function load() {
    return adminFetch<Pending[]>("/api/admin/ativacoes").then(setPendings)
  }

  useEffect(() => {
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao carregar")).finally(() => setLoading(false))
  }, [])

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

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://omotenashi.infinity-agency.online"

  if (loading) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Ativações"
        description="Cadastros que pagaram via PIX e ainda não ativaram a conta. Gerar o código também registra o pagamento como confirmado."
      />
      {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

      {pendings.length === 0 ? (
        <Card className="border-border/50"><CardContent><EmptyNote>Nenhum cadastro pendente.</EmptyNote></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {pendings.map((pending) => (
            <Card key={pending.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="text-base">{pending.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pending.email}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {getPlan(pending.plan).label} · {formatBRL(pending.value)} · {formatDate(pending.createdAt)}
                    </p>
                  </div>
                  <Badge variant={pending.activationCode ? "accent" : "secondary"}>
                    {pending.activationCode ? "Código gerado" : "Aguardando"}
                  </Badge>
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
                ) : (
                  <Button size="sm" className="gap-2" disabled={generating === pending.id} onClick={() => gerarCodigo(pending.id)}>
                    <Key className="h-4 w-4" />
                    {generating === pending.id ? "Gerando..." : "Gerar código e registrar pagamento"}
                  </Button>
                )}
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
          ))}
        </div>
      )}
    </div>
  )
}
