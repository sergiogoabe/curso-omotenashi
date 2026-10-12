"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, DollarSign, Users, TrendingUp, Filter, CheckCircle, XCircle } from "lucide-react"

export default function AdminVendas() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterPlan, setFilterPlan] = useState("all")

  useEffect(() => {
    fetch("/api/admin/enrollments").then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-center py-20"><span className="text-4xl animate-pulse">💰</span></div>

  const { enrollments, stats } = data || { enrollments: [], stats: {} }

  const filtered = enrollments.filter((e: any) => {
    const name = e.user?.name || ""
    const email = e.user?.email || ""
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === "all" || e.plan === filterPlan
    return matchSearch && matchPlan
  })

  return (
    <div>
      <h2 className="text-2xl font-display font-bold mb-6">💰 Vendas e Clientes</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Receita Total</CardTitle>
            <p className="text-2xl font-bold text-emerald-400">R$ {(stats.revenue || 0).toLocaleString()}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Matrículas Individuais</CardTitle>
            <p className="text-2xl font-bold">{stats.individual || 0}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Matrículas Corporativas</CardTitle>
            <p className="text-2xl font-bold">{stats.business || 0}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Matrículas Ativas</CardTitle>
            <p className="text-2xl font-bold text-green-400">{stats.active || 0}/{stats.total || 0}</p>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/50 mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <CardTitle className="text-lg">Todas as Matrículas</CardTitle>
            <div className="flex gap-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9 w-48"
                />
              </div>
              <select
                value={filterPlan}
                onChange={e => setFilterPlan(e.target.value)}
                className="h-9 rounded-md border border-border bg-secondary px-3 text-sm"
              >
                <option value="all">Todos os planos</option>
                <option value="individual">Individual</option>
                <option value="business">Corporativo</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Plano</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Data</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e: any) => (
                  <tr key={e.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-2">{e.user?.name || "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground">{e.user?.email}</td>
                    <td className="py-3 px-2">
                      <Badge variant={e.plan === "business" ? "accent" : "secondary"}>
                        {e.plan === "business" ? "Corporativo" : "Individual"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      {e.active ? (
                        <span className="flex items-center gap-1 text-green-400"><CheckCircle className="h-3 w-3" /> Ativo</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400"><XCircle className="h-3 w-3" /> Inativo</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{new Date(e.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-2 font-medium">R$ {e.plan === "business" ? "2.497" : "197"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma matrícula encontrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
