"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [hasCompany, setHasCompany] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (session?.user) {
      fetch("/api/company/dashboard").then(r => r.json()).then(d => {
        if (!d.error) setHasCompany(true)
      }).catch(() => {})
    }
  }, [session])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    function handleScroll() {
      setOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [open])

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl inline-block group-hover:animate-bounce transition-all duration-300">⛩️</span>
          <span className="font-display text-xl font-bold gradient-text">Omotenashi</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/curso" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Curso
          </Link>
          <Link href="/selo" className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
            🏆 Selo
          </Link>
          <Link href="/rh" className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium">
            🏢 RH
          </Link>
          <Link href="/in-company" className="text-sm text-foreground hover:text-red-400 transition-colors font-medium">
            Empresas
          </Link>
          <Link href="/ebook" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            E-book
          </Link>
          <Link href="/forum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Fórum
          </Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              {hasCompany && (
                <Link href="/empresa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Empresa
                </Link>
              )}
              {session.user && (session.user as any).role === "admin" && (
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Admin
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sair
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="default" size="sm">Entrar</Button>
            </Link>
          )}
        </nav>

        <button
          className="md:hidden text-2xl"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background p-4 flex flex-col gap-3">
          <Link href="/curso" className="text-sm" onClick={() => setOpen(false)}>Curso</Link>
          <Link href="/selo" className="text-sm text-red-400" onClick={() => setOpen(false)}>🏆 Selo</Link>
          <Link href="/rh" className="text-sm text-amber-400" onClick={() => setOpen(false)}>🏢 RH</Link>
          <Link href="/in-company" className="text-sm" onClick={() => setOpen(false)}>🏢 Empresas</Link>
          <Link href="/ebook" className="text-sm" onClick={() => setOpen(false)}>E-book</Link>
          <Link href="/forum" className="text-sm" onClick={() => setOpen(false)}>Fórum</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm" onClick={() => setOpen(false)}>Dashboard</Link>
              {hasCompany && (
                <Link href="/empresa" className="text-sm" onClick={() => setOpen(false)}>Empresa</Link>
              )}
              {session.user && (session.user as any).role === "admin" && (
                <Link href="/admin" className="text-sm" onClick={() => setOpen(false)}>Admin</Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>Sair</Button>
            </>
          ) : (
            <Link href="/auth/login"><Button size="sm">Entrar</Button></Link>
          )}
        </div>
      )}
    </header>
  )
}
