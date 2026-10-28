"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLoading, PageHeading } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"

type SystemInfo = {
  appUrl: string | null
  adminLogin: boolean
  email: boolean
  asaas: boolean
  redis: boolean
  database: string
  nodeEnv: string
}

type Health = {
  status: string
  database: string
  responseTime?: string
}

function StatusRow({ label, ok, hint }: { label: string; ok: boolean; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 py-3 last:border-0">
      <div>
        <p className="text-sm">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <span className={`text-sm ${ok ? "text-green-400" : "text-amber-400"}`}>{ok ? "OK" : "Pendente"}</span>
    </div>
  )
}

export default function AdminConfiguracoes() {
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      adminFetch<SystemInfo>("/api/admin/system"),
      fetch("/api/health").then((res) => res.json()).catch(() => null),
    ])
      .then(([sys, hlth]) => {
        setSystem(sys)
        setHealth(hlth)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao carregar"))
  }, [])

  if (error) return <p className="text-sm text-red-400">{error}</p>
  if (!system) return <AdminLoading />

  return (
    <div>
      <PageHeading
        title="Configurações"
        description="Integrações e saúde da plataforma. Valores sensíveis ficam nas variáveis de ambiente da Vercel ou do .env local."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Integrações</CardTitle></CardHeader>
          <CardContent>
            <StatusRow label="Login administrativo" ok={system.adminLogin} hint="ADMIN_USERNAME e ADMIN_PASSWORD" />
            <StatusRow label="E-mail transacional" ok={system.email} hint="Resend para reset de senha" />
            <StatusRow label="Asaas / PIX" ok={system.asaas} hint="Cobranças e webhooks" />
            <StatusRow label="Rate limit distribuído" ok={system.redis} hint="Upstash Redis (recomendado em produção)" />
            <StatusRow label="Banco PostgreSQL" ok={system.database === "ok"} />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Ambiente</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Ambiente Node" value={system.nodeEnv} />
            <Row label="URL pública" value={system.appUrl || "—"} />
            <Row label="Health check" value={health?.status === "ok" ? `OK${health.responseTime ? ` · ${health.responseTime}` : ""}` : "Indisponível"} />
            <div className="pt-4 text-xs text-muted-foreground">
              <Link href="/" className="text-red-400 hover:underline">Abrir site</Link>
              {" · "}
              <Link href="/admin/produto" className="text-red-400 hover:underline">Gerenciar conteúdo</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] truncate text-right font-medium">{value}</span>
    </div>
  )
}
