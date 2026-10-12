"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      })
      if (!result?.ok || result.error) {
        setError("Usuário ou senha inválidos")
        return
      }
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl")
      let target: URL | null = null
      try { target = callbackUrl ? new URL(callbackUrl, window.location.origin) : null } catch {}
      router.push(target?.origin === window.location.origin && !target.pathname.startsWith("/auth/")
        ? target.pathname + target.search + target.hash : "/dashboard")
      router.refresh()
    } catch {
      setError("Não foi possível entrar. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">⛩️</div>
          <CardTitle className="text-2xl">Bem-vindo de Volta</CardTitle>
          <CardDescription>Entre na sua conta para continuar seus estudos</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div role="alert" className="bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Usuário ou Email</Label>
              <Input id="email" name="email" autoComplete="username" type="text" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" autoComplete="current-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"} <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Não tem conta?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
