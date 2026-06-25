"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Building2, Users, TrendingUp, CheckCircle, XCircle, ArrowRight, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function AdminEmpresas() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/admin/companies").then(r => r.json()).then(d => {
      setCompanies(d.companies || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-center py-20"><span className="text-4xl animate-pulse">🏢</span></div>

  const filtered = companies.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalEmployees = companies.reduce((s, c) => s + c.totalUsers, 0)
  const avgProgress = companies.length > 0
    ? Math.round(companies.reduce((s, c) => s + c.avgProgress, 0) / companies.length)
    : 0

  return (
    <div>
      <h2 className="text-2xl font-display font-bold mb-6">🏢 Empresas</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Empresas</CardTitle>
            <p className="text-2xl font-bold">{companies.length}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Funcionários</CardTitle>
            <p className="text-2xl font-bold">{totalEmployees}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Progresso Médio</CardTitle>
            <p className="text-2xl font-bold text-amber-400">{avgProgress}%</p>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <CardTitle className="text-lg">Empresas Cadastradas</CardTitle>
            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar empresa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map(company => (
              <Link key={company.id} href={`/admin/empresas/${company.id}`}>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-secondary/30 hover:border-red-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center text-lg">
                      🏢
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-red-400 transition-colors">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{company.totalUsers} funcionários</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BarChart3 className="h-3 w-3" />
                        <span>Progresso: {company.avgProgress}%</span>
                      </div>
                    </div>
                    {company.active ? (
                      <Badge variant="accent" className="text-xs">Ativo</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Inativo</Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-red-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma empresa encontrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
