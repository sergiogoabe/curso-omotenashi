"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, FileText, GraduationCap, TrendingUp, DollarSign, ArrowRight } from "lucide-react"

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then(r => r.json()),
      fetch("/api/admin/enrollments").then(r => r.json()),
    ]).then(([s, e]) => {
      setStats({ ...s, ...e.stats })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20"><span className="text-4xl animate-pulse">⛩️</span></div>

  const cards = [
    { title: "Alunos", value: stats?.users || 0, icon: Users, color: "text-blue-400" },
    { title: "Aulas", value: stats?.lessons || 0, icon: BookOpen, color: "text-green-400" },
    { title: "E-book Cap.", value: stats?.chapters || 0, icon: FileText, color: "text-amber-400" },
    { title: "Matrículas", value: stats?.enrollments || 0, icon: GraduationCap, color: "text-purple-400" },
    { title: "Ativos", value: stats?.active || 0, icon: TrendingUp, color: "text-cyan-400" },
    { title: "Receita", value: `R$${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {cards.map((card, i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <card.icon className={`h-5 w-5 ${card.color} shrink-0`} />
              <div className="min-w-0">
                <CardTitle className="text-xs font-medium text-muted-foreground truncate">{card.title}</CardTitle>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Ações Rápidas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/admin/vendas", label: "💰 Gerenciar Vendas e Clientes", desc: "Matrículas, pagamentos, relatórios" },
              { href: "/admin/empresas", label: "🏢 Gerenciar Empresas", desc: "Empresas cadastradas e progresso" },
              { href: "/admin/usuarios", label: "👥 Gerenciar Usuários", desc: "Alunos, permissões e vínculos" },
              { href: "/api/seed", label: "🌱 Popular Banco de Dados", desc: "Seed de categorias, aulas, capítulos", external: true },
            ].map((item, i) => (
              <Link key={i} href={item.href} target={item.external ? "_blank" : undefined}>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Sistema</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Plataforma" value="Curso Omotenashi" />
            <InfoRow label="Banco" value="Neon PostgreSQL" />
            <InfoRow label="Planos" value="R$197 / R$1.497 / R$2.497 / R$3.200" />
            <InfoRow label="Admin" value="admin@omotenashi.com" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
