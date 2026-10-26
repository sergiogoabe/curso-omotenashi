"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Loader2, CheckCircle, ArrowRight, AlertCircle } from "lucide-react"

function ResetSenhaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<null | boolean>(null)

  useEffect(() => {
    if (!token) {
      setError("Token inválido ou ausente")
      setTokenValid(false)
      return
    }
    // Validar token com o backend
    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true)
        } else {
          setError(data.error || "Token inválido ou expirado")
          setTokenValid(false)
        }
      })
      .catch(() => {
        setError("Não foi possível validar o token")
        setTokenValid(false)
      })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (password !== confirmPassword) {
      setError("As senhas não conferem")
      return
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Não foi possível redefinir a senha")
        return
      }
      setSuccess(true)
      setTimeout(() => router.push("/auth/login"), 3000)
    } catch {
      setError("Não foi possível conectar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="py-12 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
            <h2 className="text-2xl font-bold">Link Inválido ou Expirado</h2>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/auth/esqueci-senha">
                <Button className="w-full gap-2" size="lg">
                  Solicitar Novo Link <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">Voltar ao Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Validando link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold">Senha Redefinida!</h2>
            <p className="text-muted-foreground">Redirecionando para o login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>
            Sua nova senha deve ser diferente da anterior
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                name="password"
                autoComplete="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={72}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Redefinindo...</>
              ) : (
                <><Lock className="h-4 w-4" /> Redefinir Senha <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              <Link href="/auth/login" className="text-primary hover:underline">
                Voltar ao Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function ResetSenha() {
  return (
    <Suspense fallback={null}>
      <ResetSenhaForm />
    </Suspense>
  )
}