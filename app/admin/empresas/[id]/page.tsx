"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, TrendingUp, CheckCircle, Clock, Mail, Phone, Building2 } from "lucide-react"

export default function CompanyDetail() {
  const { id } = useParams()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/companies").then(r => r.json()).then(d => {
      const c = (d.companies || []).find((c: any) => c.id === id)
      if (c) {
        fetch(`/api/company/dashboard`).then(r => r.json()).then(stats => {
          setCompany({ ...c, employeeDetails: stats.employees || [] })
          setLoading(false)
        }).catch(() => { setCompany(c); setLoading(false) })
      } else {
        setLoading(false)
      }
    })
  }, [id])

  if (loading) return <div className="text-center py-20"><span className="text-4xl animate-pulse">🏢</span></div>
  if (!company) return <div className="text-center py-20"><p className="text-muted-foreground">Empresa não encontrada</p></div>

  return (
    <div>
      <Link href="/admin/empresas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar para Empresas
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-red-950/30 border border-red-500/20 flex items-center justify-center text-2xl">
          🏢
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">{company.name}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Mail className="h-3 w-3" /> {company.email}
            {company.phone && <><Phone className="h-3 w-3 ml-2" /> {company.phone}</>}
          </p>
          <div className="flex gap-2 mt-2">
            {company.active ? <Badge variant="accent">Ativo</Badge> : <Badge variant="destructive">Inativo</Badge>}
            <Badge variant="secondary">{company.plan === "business" ? "Corporativo" : company.plan}</Badge>
            {company.cnpj && <span className="text-xs text-muted-foreground">CNPJ: {company.cnpj}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Funcionários</CardTitle>
            <p className="text-2xl font-bold flex items-center gap-2"><Users className="h-5 w-5 text-blue-400" /> {company.totalUsers}</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Progresso Médio</CardTitle>
            <p className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-amber-400" /> {company.avgProgress}%</p>
          </CardHeader>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Desde</CardTitle>
            <p className="text-2xl font-bold">{new Date(company.createdAt).toLocaleDateString("pt-BR")}</p>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Funcionários e Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          {(!company.employeeDetails || company.employeeDetails.length === 0) ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mb-3" />
              <p>Nenhum funcionário vinculado a esta empresa ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {company.employeeDetails.map((emp: any) => (
                <div key={emp.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right text-sm">
                      <p className="font-medium">{emp.completedLessons}/{emp.totalLessons} aulas</p>
                      <div className="w-24 h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-linear-to-r from-red-500 to-amber-400 rounded-full transition-all" style={{ width: `${emp.progressPercent}%` }} />
                      </div>
                    </div>
                    <Badge variant={emp.enrolled ? "accent" : "secondary"}>
                      {emp.enrolled ? "Matriculado" : "Sem matrícula"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
