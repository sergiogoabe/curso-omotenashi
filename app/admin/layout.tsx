"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/admin", label: "Visão Geral", icon: "📊" },
  { href: "/admin/vendas", label: "Vendas e Clientes", icon: "💰" },
  { href: "/admin/empresas", label: "Empresas", icon: "🏢" },
  { href: "/admin/usuarios", label: "Usuários", icon: "👥" },
  { href: "/admin/ativacoes", label: "Ativações", icon: "🔑" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-4xl animate-pulse">⛩️</div>
    </div>
  )

  if (status === "unauthenticated" || (session?.user as any)?.role !== "admin") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">⛩️</span>
          <h1 className="text-2xl font-display font-bold gradient-text">Admin Omotenashi</h1>
        </div>
        <nav className="flex gap-2 mb-8 pb-4 border-b border-border/50 overflow-x-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                pathname === item.href
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}
