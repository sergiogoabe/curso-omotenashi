"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, BookOpen, CheckCircle, Clock, Mail, Building2, BarChart3 } from "lucide-react"

export default function EmpresaDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/login")
    if (status === "authenticated") {
      fetch("/api/company/dashboard").then(r => r.json()).then(d => {
        setStats(d)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    }
  }, [status])

  if (status === "loading" || loading) {
    return <div className="min-h-[80vh] flex items-center justify-center"><span className="text-4xl animate-pulse">🏢</span></div>
  }

  if (!stats || stats.error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">🏢</div>
        <h1 className="text-3xl font-display font-bold mb-4">Painel da Empresa</h1>
        <p className="text-muted-foreground mb-4">{stats?.error || "Carregando..."}</p>
        <p className="text-sm text-muted-foreground">Entre em contato com o admin para vincular sua empresa.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-red-950/30 border border-red-500/20 flex items-center justify-center text-2xl">
          🏢
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">{stats.companyName}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <Mail className="h-3 w-3 inline mr-1" /> {stats.companyEmail}
            <Badge variant="accent" className="ml-3 text-xs">{stats.companyPlan === "business" ? "Plano Corporativo" : stats.companyPlan}</Badge>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Users className="h-6 w-6 text-blue-400" />
            <div>
              <CardTitle className="text-xs text-muted-foreground">Total Funcionários</CardTitle>
              <p className="text-3xl font-bold">{stats.totalEmployees}</p>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <BookOpen className="h-6 w-6 text-green-400" />
            <div>
              <CardTitle className="text-xs text-muted-foreground">Funcionários Matriculados</CardTitle>
              <p className="text-3xl font-bold">{stats.enrolledEmployees} <span className="text-sm text-muted-foreground font-normal">/ {stats.totalEmployees}</span></p>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <BarChart3 className="h-6 w-6 text-amber-400" />
            <div>
              <CardTitle className="text-xs text-muted-foreground">Progresso Médio</CardTitle>
              <p className="text-3xl font-bold">{stats.avgProgress}%</p>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="w-full h-2 bg-secondary rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-500 to-amber-400 rounded-full transition-all" style={{ width: `${stats.avgProgress}%` }} />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Progresso Individual dos Funcionários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.employees?.map((emp: any) => (
              <div key={emp.id} className="p-4 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.email}</p>
                    </div>
                  </div>
                  <Badge variant={emp.enrolled ? "accent" : "secondary"}>
                    {emp.enrolled ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>{emp.completedLessons} concluídas</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span>{emp.inProgressLessons} em andamento</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-amber-400 rounded-full transition-all" style={{ width: `${emp.progressPercent}%` }} />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{emp.progressPercent}%</span>
                </div>

                {emp.recentActivity?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">Atividade recente:</p>
                    <div className="flex flex-wrap gap-2">
                      {emp.recentActivity.slice(0, 3).map((act: any, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {act.completed ? "✅" : "📝"} {act.lessonTitle || "Aula"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
