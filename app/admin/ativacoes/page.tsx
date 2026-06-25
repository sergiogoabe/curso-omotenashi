"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Key, Mail, User, Clock, DollarSign, Package } from "lucide-react"

interface Pending {
  id: string
  name: string
  email: string
  plan: string
  value: number
  activationCode: string | null
  createdAt: string
}

const PLAN_LABELS: Record<string, string> = {
  individual: "Individual",
  empresarial30: "Empresarial 30",
  empresarial50: "Empresarial 50",
  combo: "Combo",
}

export default function AdminAtivacoes() {
  const [pendings, setPendings] = useState<Pending[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/ativacoes")
      .then((r) => r.json())
      .then((d) => setPendings(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function gerarCodigo(id: string) {
    setGenerating(id)
    const res = await fetch("/api/admin/ativacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (data.code) {
      setPendings((prev) =>
        prev.map((p) => (p.id === id ? { ...p, activationCode: data.code } : p))
      )
    }
    setGenerating(null)
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ativações Pendentes</h1>
        <p className="text-sm text-muted-foreground">
          Gere códigos de ativação para alunos que pagaram o PIX
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : pendings.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum cadastro pendente
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendings.map((p) => (
            <Card key={p.id} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {p.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {p.email}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-3 w-3" />
                        {PLAN_LABELS[p.plan] || p.plan}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        R$ {p.value.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(p.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  {p.activationCode ? (
                    <Badge variant="accent" className="shrink-0">
                      <Key className="h-3 w-3 mr-1" /> Código gerado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0">
                      Aguardando
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {p.activationCode ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-4 py-2 text-lg font-mono text-center tracking-widest">
                      {p.activationCode}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(p.activationCode!)}
                    >
                      {copied === p.activationCode ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const planLabel = PLAN_LABELS[p.plan] || p.plan
                        const valueStr = p.value.toFixed(2).replace(".", ",")
                        const mailto = `mailto:${p.email}?subject=${encodeURIComponent("Código de Ativação - Curso Omotenashi")}&body=${encodeURIComponent(`Olá ${p.name},\n\nSeu pagamento do plano ${planLabel} (R$ ${valueStr}) foi confirmado!\n\nSeu código de ativação é:\n\n${p.activationCode}\n\nAcesse https://curso-omotenashi.vercel.app/auth/ativar e insira o código para ativar sua conta.\n\nAtenciosamente,\nEquipe Omotenashi`)}`
                        window.open(mailto)
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => gerarCodigo(p.id)}
                    disabled={generating === p.id}
                  >
                    <Key className="h-4 w-4" />
                    {generating === p.id ? "Gerando..." : "Gerar Código de Ativação"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
