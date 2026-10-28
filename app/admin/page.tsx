"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Building2, Calendar, GraduationCap, KeyRound, MessagesSquare, UserPlus, Users, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLoading, StatLink } from "@/components/admin/ui"
import { adminFetch } from "@/components/admin/http"
import { formatBRL, formatDate } from "@/lib/format"
import { getPlan } from "@/lib/plans"
import { eventTypeLabel, paymentStatusLabel } from "@/lib/admin-labels"
import type { OverviewStats } from "@/types/admin"

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    adminFetch<OverviewStats>("/api/admin/stats")
      .then(setStats)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha ao carregar"))
  }, [])

  if (error) return <p className="text-sm text-red-400">{error}</p>
  if (!stats) return <AdminLoading />

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold">Visão geral</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          O Omotenashi vende o curso de hospitalidade em planos pessoal e empresariais, libera o acesso depois do pagamento
          e acompanha empresas, associados e turmas in-company.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatLink href="/admin/pagamentos" label="Receita confirmada" value={formatBRL(stats.revenue)} hint={`${formatBRL(stats.revenuePending)} em aberto`} icon={Wallet} tone="text-emerald-400" />
        <StatLink href="/admin/clientes" label="Clientes" value={stats.users} hint={`${stats.courseAccess} com acesso`} icon={Users} tone="text-blue-400" />
        <StatLink href="/admin/vendas" label="Matrículas ativas" value={stats.activeEnrollments} hint={`${stats.enrollments} no total`} icon={GraduationCap} tone="text-purple-400" />
        <StatLink href="/admin/ativacoes" label="Ativações pendentes" value={stats.pending} hint="Cadastros aguardando código" icon={KeyRound} tone="text-amber-400" />
        <StatLink href="/admin/associados" label="Associados" value={stats.associates} hint="Colaboradores de empresas" icon={UserPlus} tone="text-cyan-400" />
        <StatLink href="/admin/empresas" label="Empresas" value={stats.companies} hint="Contas corporativas" icon={Building2} tone="text-orange-400" />
        <StatLink href="/admin/eventos" label="Eventos à frente" value={stats.eventsUpcoming} hint="Turmas, selo e consultoria" icon={Calendar} tone="text-red-400" />
        <StatLink href="/admin/produto" label="Conteúdo" value={stats.lessons} hint={`${stats.chapters} capítulos do e-book`} icon={BookOpen} tone="text-green-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pagamentos recentes</CardTitle>
            <Link href="/admin/pagamentos" className="text-xs text-red-400">Ver todos</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentPayments.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum pagamento lançado.</p> : null}
            {stats.recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-3 border-b border-border/40 pb-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{payment.name || payment.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{getPlan(payment.plan).label} · {paymentStatusLabel(payment.status)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatBRL(payment.value)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Clientes recentes</CardTitle>
            <Link href="/admin/clientes" className="text-xs text-red-400">Ver todos</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentUsers.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p> : null}
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 border-b border-border/40 pb-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name || "Sem nome"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs">{user.courseAccess ? "Com acesso" : "Sem acesso"}</p>
                  <p className="text-xs text-muted-foreground">{user.company?.name || getPlan(user.plan).label}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximos eventos</CardTitle>
            <Link href="/admin/eventos" className="text-xs text-red-400">Agenda</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.upcomingEvents.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma turma ou entrega agendada.</p> : null}
            {stats.upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-3 border-b border-border/40 pb-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{eventTypeLabel(event.type)} · {event.company?.name || event.location || "Sem local"}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(event.startsAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Operação</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Integrações" value="Ver painel" href="/admin/configuracoes" />
            <Row label="Fórum em aberto" value={String(stats.forumOpen)} href="/admin/forum" />
            <Row label="Aulas publicadas" value={String(stats.lessons)} href="/admin/produto" />
            <Row label="Capítulos do e-book" value={String(stats.chapters)} href="/admin/produto" />
            {stats.plans.map((plan) => (
              <Row key={plan.plan} label={getPlan(plan.plan).label} value={String(plan.count)} href="/admin/vendas" />
            ))}
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <MessagesSquare className="h-3.5 w-3.5" />
              Confirmar um pagamento libera a matrícula de quem já tem conta com o mesmo e-mail.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 py-1 hover:text-red-400">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </Link>
  )
}
