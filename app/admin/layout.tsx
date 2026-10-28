"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import {
  BookOpen,
  Building2,
  Calendar,
  ExternalLink,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Settings,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react"

const groups = [
  {
    label: "Operação",
    items: [
      { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
      { href: "/admin/pagamentos", label: "Pagamentos", icon: Wallet },
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/vendas", label: "Matrículas", icon: GraduationCap },
      { href: "/admin/ativacoes", label: "Ativações", icon: KeyRound },
    ],
  },
  {
    label: "Rede",
    items: [
      { href: "/admin/associados", label: "Associados", icon: UserPlus },
      { href: "/admin/empresas", label: "Empresas", icon: Building2 },
      { href: "/admin/eventos", label: "Eventos", icon: Calendar },
    ],
  },
  {
    label: "Produto",
    items: [
      { href: "/admin/produto", label: "Conteúdo", icon: BookOpen },
      { href: "/admin/forum", label: "Fórum", icon: MessagesSquare },
      { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
]

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const role = (session?.user as { role?: string } | undefined)?.role

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-4xl animate-pulse">⛩️</div>
      </div>
    )
  }

  if (status === "unauthenticated") redirect("/auth/login")
  if (role !== "admin") redirect("/")

  return (
    <div className="min-h-screen bg-background">
      {open ? (
        <button
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl">⛩️</span>
            <span>
              <span className="block font-display text-base font-bold gradient-text">Omotenashi</span>
              <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">Administração</span>
            </span>
          </Link>
          <button className="md:hidden" aria-label="Fechar menu" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-2 text-[11px] uppercase tracking-wide text-muted-foreground">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "border border-red-500/20 bg-red-500/10 text-red-400"
                          : "border border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border/60 p-3">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium">{session?.user?.name || "Administrador"}</p>
            <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 py-2 text-xs text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5" /> Site
            </Link>
            <button
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 py-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 md:pl-64">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur md:hidden">
          <button aria-label="Abrir menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display font-bold">Admin Omotenashi</span>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
