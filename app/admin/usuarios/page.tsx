"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, CheckCircle, XCircle, Building2, Trash2, Shield, User, Mail, Phone } from "lucide-react"

export default function AdminUsuarios() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  function load() {
    fetch("/api/admin/users").then(r => r.json()).then(d => {
      setUsers(d.users || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "student" : "admin"
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    })
    load()
  }

  async function deleteUser(userId: string) {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    load()
  }

  if (loading) return <div className="text-center py-20"><span className="text-4xl animate-pulse">👥</span></div>

  const filtered = users.filter((u: any) => {
    const name = u.name || ""
    const email = u.email || ""
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || email.includes(search.toLowerCase())
    const matchFilter = filter === "all" || u.role === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      <h2 className="text-2xl font-display font-bold mb-6">👥 Usuários</h2>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <CardTitle className="text-lg">{users.length} usuários</CardTitle>
            <div className="flex gap-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-48" />
              </div>
              <select value={filter} onChange={e => setFilter(e.target.value)} className="h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                <option value="all">Todos</option>
                <option value="admin">Admin</option>
                <option value="student">Alunos</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Função</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Matrícula</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Progresso</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u: any) => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-2 font-medium">{u.name || "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-2">
                      {u.role === "admin" ? (
                        <Badge variant="accent" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" /> Aluno
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {u.company?.name || "—"}
                    </td>
                    <td className="py-3 px-2">
                      {u.enrollments?.length > 0 ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="h-3 w-3" /> {u.enrollments.length}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">
                      {u.progress?.length || 0} aulas
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1">
                        <button onClick={() => toggleRole(u.id, u.role)} className="p-1 rounded-sm hover:bg-secondary/50 text-xs text-muted-foreground hover:text-foreground" title="Alternar função">
                          <Shield className="h-3 w-3" />
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-1 rounded-sm hover:bg-secondary/50 text-xs text-red-400" title="Remover">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum usuário encontrado</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
